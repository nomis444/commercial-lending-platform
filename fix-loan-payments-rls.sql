-- Fix RLS policy for loan_payments to support both user_id and applicant_id

-- Drop the existing policy
DROP POLICY IF EXISTS "Borrowers can view own loan payments" ON loan_payments;

-- Recreate with support for both user_id and applicant_id
CREATE POLICY "Borrowers can view own loan payments"
ON loan_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loans l
    JOIN applications a ON l.application_id = a.id
    WHERE l.id = loan_payments.loan_id
    AND (a.user_id = auth.uid() OR a.applicant_id = auth.uid())
  ) OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
