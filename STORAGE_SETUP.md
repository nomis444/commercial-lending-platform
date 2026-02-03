# Storage Bucket Setup for Document Uploads

## Run Migration in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (spznjpzxpssxvgcksgxh)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/005_create_storage_bucket.sql`
6. Click **Run** to execute the migration

## What This Does

- Creates a private storage bucket called "documents"
- Sets up RLS policies so users can only:
  - Upload documents to their own applications
  - View their own documents
  - Delete their own documents
- Allows admins to view all documents

## Testing Document Upload

After running the migration:

1. Log in to the customer portal
2. Go to the "Documents" tab
3. Click "Upload Document"
4. Select a file (PDF, Word doc, or image up to 10MB)
5. The document will be uploaded and appear in the list

## Troubleshooting

If uploads fail with "bucket not found" error:
- Make sure the migration ran successfully
- Check the Storage section in Supabase dashboard to verify the "documents" bucket exists
- Verify RLS policies are enabled on the bucket
