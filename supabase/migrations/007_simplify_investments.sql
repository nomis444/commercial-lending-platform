-- Add funding tracking fields to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS funded_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS funding_status VARCHAR(50) DEFAULT 'unfunded';

-- Create a simpler investments table that links directly to applications
CREATE TABLE IF NOT EXISTS application_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_investments_application ON application_investments(application_id);
CREATE INDEX IF NOT EXISTS idx_app_investments_investor ON application_investments(investor_id);

-- Add RLS policies
ALTER TABLE application_investments ENABLE ROW LEVEL SECURITY;

-- Investors can view their own investments
CREATE POLICY "Investors can view their own investments"
  ON application_investments FOR SELECT
  USING (auth.uid() = investor_id);

-- Investors can create investments
CREATE POLICY "Investors can create investments"
  ON application_investments FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- Admins can view all investments
CREATE POLICY "Admins can view all investments"
  ON application_investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Borrowers can view investments in their applications
CREATE POLICY "Borrowers can view investments in their applications"
  ON application_investments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_investments.application_id
      AND applications.user_id = auth.uid()
    )
  );
