import { createClient } from '@/lib/supabase/client'

export interface DocumentUpload {
  file: File
  fieldName: string
  applicationId: string
}

export interface DocumentRecord {
  id: string
  application_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  verification_status: string
  uploaded_at: string
}

/**
 * Upload a document to Supabase Storage and create a database record
 */
export async function uploadDocument(
  file: File,
  applicationId: string,
  fieldName: string
): Promise<DocumentRecord | null> {
  try {
    const supabase = createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      alert('You must be logged in to upload documents')
      return null
    }
    
    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${applicationId}/${fieldName}_${timestamp}_${sanitizedFileName}`
    
    console.log('Uploading document:', { storagePath, fileSize: file.size, fileType: file.type })
    
    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (storageError) {
      console.error('Storage upload error:', storageError)
      alert(`Storage upload failed: ${storageError.message}`)
      throw storageError
    }
    
    console.log('Storage upload successful:', storageData)
    
    // Create document record in database
    const { data: documentData, error: dbError } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        verification_status: 'pending'
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database insert error:', dbError)
      alert(`Database error: ${dbError.message}. Please check that you have permission to upload documents for this application.`)
      // Try to clean up the uploaded file
      await supabase.storage.from('documents').remove([storagePath])
      throw dbError
    }
    
    console.log('Document record created:', documentData)
    return documentData
  } catch (error: any) {
    console.error('Document upload failed:', error)
    return null
  }
}

/**
 * Get all documents for an application
 */
export async function getApplicationDocuments(
  applicationId: string
): Promise<DocumentRecord[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('uploaded_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

/**
 * Delete a document from storage and database
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get document record to find storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()
    
    if (fetchError || !document) {
      console.error('Error fetching document:', fetchError)
      return false
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.storage_path])
    
    if (storageError) {
      console.error('Error deleting from storage:', storageError)
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
    
    if (dbError) {
      console.error('Error deleting from database:', dbError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}

/**
 * Get a public URL for viewing/downloading a document
 */
export async function getDocumentUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = createClient()
    
    // Get the public URL for the document
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath)
    
    if (!data || !data.publicUrl) {
      console.error('Failed to get public URL')
      return null
    }
    
    console.log('Generated public URL:', data.publicUrl)
    return data.publicUrl
  } catch (error) {
    console.error('Error creating document URL:', error)
    return null
  }
}
