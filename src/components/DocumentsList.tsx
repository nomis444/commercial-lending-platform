'use client'

import { useState, useEffect } from 'react'
import { getApplicationDocuments, deleteDocument, getDocumentUrl, uploadDocument, DocumentRecord } from '@/lib/documents'

interface DocumentsListProps {
  applicationId: string
  canDelete?: boolean
  canUpload?: boolean
}

export default function DocumentsList({ applicationId, canDelete = false, canUpload = false }: DocumentsListProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [applicationId])

  async function loadDocuments() {
    setIsLoading(true)
    const docs = await getApplicationDocuments(applicationId)
    setDocuments(docs)
    setIsLoading(false)
  }

  async function handleDelete(documentId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    const success = await deleteDocument(documentId)
    if (success) {
      await loadDocuments()
    } else {
      alert('Failed to delete document')
    }
  }

  async function handleDownload(storagePath: string, fileName: string) {
    console.log('Attempting to download:', storagePath)
    const url = await getDocumentUrl(storagePath)
    console.log('Generated URL:', url)
    if (url) {
      window.open(url, '_blank')
    } else {
      alert('Failed to generate download link. Check browser console for details.')
    }
  }

  async function handleUpload(fieldName: string, file: File) {
    setUploadingField(fieldName)
    const result = await uploadDocument(file, applicationId, fieldName)
    setUploadingField(null)
    
    if (result) {
      await loadDocuments()
    } else {
      alert('Failed to upload document')
    }
  }

  function getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      bankStatements: 'Bank Statements',
      taxReturns: 'Tax Returns',
      financialStatements: 'Financial Statements'
    }
    return labels[fieldName] || fieldName
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      manual_review: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <svg className="h-8 w-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-4 flex-1 min-w-0">
                      <button
                        onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate text-left"
                      >
                        {doc.file_name}
                      </button>
                      <p className="text-sm text-gray-500">
                        {getFieldLabel(doc.storage_path.split('/')[1]?.split('_')[0] || '')} • {Math.round(doc.file_size / 1024)} KB
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    {getStatusBadge(doc.verification_status)}
                    <button
                      onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canUpload && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Upload Additional Documents</h4>
          <div className="space-y-3">
            {['bankStatements', 'taxReturns', 'financialStatements'].map((fieldName) => (
              <div key={fieldName} className="flex items-center space-x-3">
                <label className="flex-1 text-sm text-gray-700">
                  {getFieldLabel(fieldName)}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleUpload(fieldName, file)
                      e.target.value = '' // Reset input
                    }
                  }}
                  disabled={uploadingField === fieldName}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {uploadingField === fieldName && (
                  <span className="text-sm text-gray-500">Uploading...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
