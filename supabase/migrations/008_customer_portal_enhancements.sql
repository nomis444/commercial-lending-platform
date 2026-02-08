-- Migration 008: Customer Portal Enhancements
-- Adds payment account info, loan details, payment schedule, and audit logging

-- ============================================================================
-- 1. Add payment_info field to applications table
-- ============================================================================

-- Add payment_info JSONB column to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS payment_info JSONB DEFAULT NULL;

-- Add index for querying payment info
CREATE INDEX IF NOT EXISTS idx_applications_payment_info ON applications USING GIN (payment_info);

-- Add comment
COMMENT ON COLUMN applications.payment_info IS 'Encrypted payment account information for loan repayment. Structure: {bankName, accountHolderName, routingNumber, accountNumber, accountType, plaidAccountId, plaidAccessToken, verificationStatus, submittedAt}';

-- ============================================================================
-- 2. Add missing fields to loans table
-- ============================================================================

-- Add interest_rate field (stored as decimal, e.g., 0.25 for 25%)
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.25;

-- Add term_months field
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS term_months INTEGER NOT NULL DEFAULT 12;

-- Add origination_date field
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS origination_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add monthly_payment field
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Add total_amount field (total to be repaid)
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Add comments
COMMENT ON COLUMN loans.interest_rate IS 'Annual interest rate as decimal (0.25 = 25% APR)';
COMMENT ON COLUMN loans.term_months IS 'Loan term length in months';
COMMENT ON COLUMN loans.origination_date IS 'Date when loan was funded and became active';
COMMENT ON COLUMN loans.monthly_payment IS 'Calculated monthly payment amount';
COMMENT ON COLUMN loans.total_amount IS 'Total amount to be repaid (principal + interest)';

-- ============================================================================
-- 3. Create loan_payments table for amortization schedule
-- ============================================================================

CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  payment_number INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  principal_portion DECIMAL(12,2) NOT NULL,
  interest_portion DECIMAL(12,2) NOT NULL,
  remaining_balance DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT loan_payments_status_check CHECK (status IN ('pending', 'paid', 'late', 'missed')),
  CONSTRAINT loan_payments_unique_payment UNIQUE (loan_id, payment_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_due_date ON loan_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_loan_payments_status ON loan_payments(status);

-- Add updated_at trigger
CREATE TRIGGER update_loan_payments_updated_at 
BEFORE UPDATE ON loan_payments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE loan_payments IS 'Amortization schedule for loans showing payment breakdown';
COMMENT ON COLUMN loan_payments.payment_number IS 'Sequential payment number (1, 2, 3, ...)';
COMMENT ON COLUMN loan_payments.principal_portion IS 'Amount of payment applied to principal';
COMMENT ON COLUMN loan_payments.interest_portion IS 'Amount of payment applied to interest';
COMMENT ON COLUMN loan_payments.remaining_balance IS 'Loan balance remaining after this payment';

-- ============================================================================
-- 4. Create audit_logs table for tracking profile changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for tracking changes to user data';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action (e.g., profile_update, payment_update)';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change';

-- ============================================================================
-- 5. Row Level Security Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Borrowers can view payments for their own loans
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

-- Policy: Only admins can modify payment records
CREATE POLICY "Only admins can modify payments"
ON loan_payments
FOR ALL
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
