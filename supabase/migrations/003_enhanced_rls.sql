-- Enhanced RLS helper functions

-- Function to check if user can access a specific application
CREATE OR REPLACE FUNCTION auth.can_access_application(app_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT 
    auth.is_admin() OR 
    auth.tenant_id() = app_tenant_id::text OR
    (auth.user_role() = 'investor' AND EXISTS (
      SELECT 1 FROM loans WHERE application_id IN (
        SELECT id FROM applications WHERE tenant_id = app_tenant_id
      )
    ))
$$;

-- Function to check if user can access a specific loan
CREATE OR REPLACE FUNCTION auth.can_access_loan(loan_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT 
    auth.is_admin() OR 
    auth.tenant_id() = loan_tenant_id::text OR
    auth.user_role() = 'investor'
$$;

-- Function to validate investment permissions
CREATE OR REPLACE FUNCTION auth.can_invest_in_loan(loan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT 
    auth.user_role() = 'investor' AND
    EXISTS (
      SELECT 1 FROM loans 
      WHERE id = loan_id 
      AND status = 'pending' 
      AND funding_status IN ('unfunded', 'partially_funded')
    )
$$;

-- Enhanced policies for cross-tenant access patterns

-- Allow investors to see loan details for investment decisions
CREATE POLICY "Investors can view loan details for investment" ON applications
  FOR SELECT USING (
    auth.user_role() = 'investor' AND 
    EXISTS (
      SELECT 1 FROM loans 
      WHERE application_id = applications.id 
      AND status = 'pending'
    )
  );

-- Allow borrowers to see their investment status
CREATE POLICY "Borrowers can view investments in their loans" ON investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loans l
      JOIN applications a ON l.application_id = a.id
      WHERE l.id = investments.loan_id 
      AND a.tenant_id::text = auth.tenant_id()
    )
  );

-- Notification policies for cross-tenant notifications
CREATE POLICY "Users receive notifications about their investments" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id AND (
      auth.tenant_id() = tenant_id::text OR
      -- Allow notifications about loans they've invested in
      EXISTS (
        SELECT 1 FROM investments i
        WHERE i.investor_id = auth.uid()
        AND notifications.type LIKE '%loan%'
      )
    )
  );

-- Audit and compliance policies
CREATE POLICY "Compliance officers can view verification logs" ON verification_logs
  FOR SELECT USING (
    auth.is_admin() OR
    (auth.user_role() = 'compliance' AND auth.tenant_id() = tenant_id::text)
  );

-- Create function to automatically update loan funding status
CREATE OR REPLACE FUNCTION update_loan_funding_status()
RETURNS TRIGGER AS $$
DECLARE
  total_funded DECIMAL(12,2);
  loan_principal DECIMAL(12,2);
BEGIN
  -- Get total funded amount and loan principal
  SELECT 
    COALESCE(SUM(i.amount), 0),
    l.principal_amount
  INTO total_funded, loan_principal
  FROM loans l
  LEFT JOIN investments i ON l.id = i.loan_id AND i.status = 'active'
  WHERE l.id = COALESCE(NEW.loan_id, OLD.loan_id)
  GROUP BY l.principal_amount;

  -- Update funding status based on funded percentage
  UPDATE loans 
  SET 
    funded_amount = total_funded,
    funding_status = CASE 
      WHEN total_funded = 0 THEN 'unfunded'
      WHEN total_funded >= loan_principal THEN 'fully_funded'
      ELSE 'partially_funded'
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.loan_id, OLD.loan_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update funding status
CREATE TRIGGER update_loan_funding_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_funding_status();

-- Create function to generate notifications on status changes
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify on application status changes
  IF TG_TABLE_NAME = 'applications' AND OLD.status != NEW.status THEN
    INSERT INTO notifications (user_id, tenant_id, title, message, type)
    SELECT 
      NEW.applicant_id,
      NEW.tenant_id,
      'Application Status Update',
      'Your loan application status has changed to: ' || NEW.status,
      'application_status'
    WHERE NEW.applicant_id IS NOT NULL;
  END IF;

  -- Notify on loan status changes
  IF TG_TABLE_NAME = 'loans' AND OLD.status != NEW.status THEN
    -- Notify borrower
    INSERT INTO notifications (user_id, tenant_id, title, message, type)
    SELECT 
      a.applicant_id,
      a.tenant_id,
      'Loan Status Update',
      'Your loan status has changed to: ' || NEW.status,
      'loan_status'
    FROM applications a
    WHERE a.id = NEW.application_id AND a.applicant_id IS NOT NULL;

    -- Notify investors
    INSERT INTO notifications (user_id, tenant_id, title, message, type)
    SELECT 
      i.investor_id,
      i.tenant_id,
      'Investment Update',
      'A loan you invested in has changed status to: ' || NEW.status,
      'investment_update'
    FROM investments i
    WHERE i.loan_id = NEW.id;
  END IF;

  -- Notify on funding status changes
  IF TG_TABLE_NAME = 'loans' AND OLD.funding_status != NEW.funding_status THEN
    INSERT INTO notifications (user_id, tenant_id, title, message, type)
    SELECT 
      a.applicant_id,
      a.tenant_id,
      'Funding Update',
      'Your loan funding status: ' || NEW.funding_status || ' (' || NEW.funded_amount || ' of ' || NEW.principal_amount || ')',
      'funding_update'
    FROM applications a
    WHERE a.id = NEW.application_id AND a.applicant_id IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for status change notifications
CREATE TRIGGER notify_application_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_status_change();

CREATE TRIGGER notify_loan_status_change
  AFTER UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION notify_status_change();