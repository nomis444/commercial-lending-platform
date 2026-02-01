-- Insert sample tenants
INSERT INTO tenants (id, name, type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Acme Corp', 'borrower'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tech Startup LLC', 'borrower'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Investment Group Alpha', 'investor'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Capital Partners Beta', 'investor'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Platform Admin', 'admin');

-- Insert sample applications (these would normally be created by users)
INSERT INTO applications (id, tenant_id, loan_amount, loan_purpose, status, business_info, financial_info) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    250000.00,
    'Equipment purchase and working capital',
    'submitted',
    '{"company_name": "Acme Corp", "industry": "Manufacturing", "years_in_business": 5, "employees": 25}',
    '{"annual_revenue": 1200000, "monthly_expenses": 85000, "existing_debt": 150000}'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    100000.00,
    'Technology infrastructure upgrade',
    'under_review',
    '{"company_name": "Tech Startup LLC", "industry": "Technology", "years_in_business": 2, "employees": 8}',
    '{"annual_revenue": 500000, "monthly_expenses": 35000, "existing_debt": 25000}'
  );

-- Insert sample loans (approved applications become loans)
INSERT INTO loans (id, application_id, tenant_id, principal_amount, interest_rate, term_months, status, funding_status) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    250000.00,
    0.0850,
    36,
    'pending',
    'unfunded'
  );

-- Insert sample investments
INSERT INTO investments (id, loan_id, tenant_id, amount, percentage, status) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    125000.00,
    0.5000,
    'pending'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440004',
    75000.00,
    0.3000,
    'pending'
  );

-- Insert sample documents
INSERT INTO documents (id, application_id, tenant_id, file_name, file_type, file_size, storage_path, verification_status) VALUES
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'financial_statements_2023.pdf',
    'application/pdf',
    2048576,
    'documents/acme-corp/financial_statements_2023.pdf',
    'verified'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'business_license.pdf',
    'application/pdf',
    1024768,
    'documents/acme-corp/business_license.pdf',
    'verified'
  );

-- Insert sample verification logs
INSERT INTO verification_logs (id, application_id, tenant_id, verification_type, provider, status, request_data, response_data) VALUES
  (
    'aa0e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'credit_check',
    'experian',
    'verified',
    '{"business_name": "Acme Corp", "tax_id": "12-3456789"}',
    '{"credit_score": 720, "risk_rating": "low", "verified": true}'
  );