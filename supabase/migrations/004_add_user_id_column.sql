-- Add user_id column to applications table for direct user reference
-- This simplifies the auth flow by removing the tenant requirement
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Add contact_info column to store contact information
ALTER TABLE applications ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- Make tenant_id nullable since we're moving to user-based auth
ALTER TABLE applications ALTER COLUMN tenant_id DROP NOT NULL;

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;

-- Create new RLS policies for user_id
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = applicant_id);

CREATE POLICY "Users can create their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = applicant_id);

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = applicant_id);
