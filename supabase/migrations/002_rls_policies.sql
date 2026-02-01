-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id() 
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT 
    NULLIF(
      ((current_setting('request.jwt.claims')::jsonb ->> 'app_metadata')::jsonb ->> 'tenant_id'),
      ''
    )::text
$$;

-- Helper function to get user role from JWT
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT 
    NULLIF(
      ((current_setting('request.jwt.claims')::jsonb ->> 'app_metadata')::jsonb ->> 'role'),
      ''
    )::text
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT auth.user_role() = 'admin'
$$;

-- Tenants policies
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (auth.tenant_id() = id::text);

CREATE POLICY "Admins can view all tenants" ON tenants
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "Admins can insert tenants" ON tenants
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "Admins can update tenants" ON tenants
  FOR UPDATE USING (auth.is_admin());

-- Applications policies
CREATE POLICY "Users can view their tenant's applications" ON applications
  FOR SELECT USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Users can insert applications for their tenant" ON applications
  FOR INSERT WITH CHECK (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Users can update their tenant's applications" ON applications
  FOR UPDATE USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Admins can view all applications" ON applications
  FOR ALL USING (auth.is_admin());

-- Loans policies
CREATE POLICY "Users can view their tenant's loans" ON loans
  FOR SELECT USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Investors can view all loans for funding" ON loans
  FOR SELECT USING (auth.user_role() = 'investor');

CREATE POLICY "Admins can manage all loans" ON loans
  FOR ALL USING (auth.is_admin());

CREATE POLICY "System can insert loans" ON loans
  FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

-- Investments policies
CREATE POLICY "Users can view their tenant's investments" ON investments
  FOR SELECT USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Investors can insert investments" ON investments
  FOR INSERT WITH CHECK (auth.user_role() = 'investor' AND auth.tenant_id() = tenant_id::text);

CREATE POLICY "Investors can update their investments" ON investments
  FOR UPDATE USING (auth.user_role() = 'investor' AND auth.tenant_id() = tenant_id::text);

CREATE POLICY "Admins can manage all investments" ON investments
  FOR ALL USING (auth.is_admin());

-- Documents policies
CREATE POLICY "Users can view their tenant's documents" ON documents
  FOR SELECT USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Users can insert documents for their tenant" ON documents
  FOR INSERT WITH CHECK (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Users can update their tenant's documents" ON documents
  FOR UPDATE USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "Admins can manage all documents" ON documents
  FOR ALL USING (auth.is_admin());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id AND auth.tenant_id() = tenant_id::text);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id AND auth.tenant_id() = tenant_id::text);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (auth.is_admin());

-- Verification logs policies
CREATE POLICY "Users can view their tenant's verification logs" ON verification_logs
  FOR SELECT USING (auth.tenant_id() = tenant_id::text);

CREATE POLICY "System can insert verification logs" ON verification_logs
  FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

CREATE POLICY "Admins can view all verification logs" ON verification_logs
  FOR ALL USING (auth.is_admin());