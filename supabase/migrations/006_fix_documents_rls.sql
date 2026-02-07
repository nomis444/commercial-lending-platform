-- Fix documents table RLS policies to work with user_id instead of tenant_id

-- Drop old tenant-based policies
DROP POLICY IF EXISTS "Users can view their tenant's documents" ON documents;
DROP POLICY IF EXISTS "Users can insert documents for their tenant" ON documents;
DROP POLICY IF EXISTS "Users can update their tenant's documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;

-- Create new user-based policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their own applications"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = documents.application_id 
      AND applications.user_id = auth.uid()
    )
  );

-- Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
