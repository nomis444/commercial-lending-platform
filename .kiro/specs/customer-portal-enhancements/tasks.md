# Implementation Plan: Customer Portal Enhancements

## Overview

This implementation plan breaks down the customer portal enhancements into discrete, incremental tasks. The approach follows a layered implementation strategy: database schema first, then backend services, then UI components, with testing integrated throughout.

The implementation will add profile management, payment account collection, loan details display, payment schedules, and current loan status tracking to the customer portal.

## Tasks

- [x] 1. Database schema migrations
  - [x] 1.1 Create migration for applications table payment_info field
    - Add payment_info JSONB column to applications table
    - Add GIN index for payment_info queries
    - Add comment documentation
    - _Requirements: 2.8, 7.1_
  
  - [x] 1.2 Create migration for loans table enhancements
    - Add interest_rate, term_months, origination_date, monthly_payment, total_amount columns
    - Add appropriate constraints and defaults
    - Add comment documentation
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [x] 1.3 Create migration for loan_payments table
    - Create loan_payments table with all required fields
    - Add foreign key constraint to loans table
    - Add unique constraint on (loan_id, payment_number)
    - Add indexes for loan_id, due_date, status
    - Add updated_at trigger
    - Add status check constraint
    - _Requirements: 7.2, 7.3_
  
  - [x] 1.4 Create migration for audit_logs table
    - Create audit_logs table with all required fields
    - Add foreign key constraint to auth.users
    - Add indexes for user_id, action_type, created_at, record_id
    - Add comment documentation
    - _Requirements: 8.4, 8.5_
  
  - [x] 1.5 Create migration for RLS policies
    - Add RLS policy for applications payment_info access
    - Add RLS policy for payment_info immutability after submission
    - Add RLS policy for loan_payments read access
    - Add RLS policy for loan_payments admin-only modification
    - Add RLS policy for audit_logs read access
    - Add RLS policy for audit_logs insert access
    - _Requirements: 8.2, 8.6_

- [-] 2. Core utility functions and services
  - [x] 2.1 Create validation utility functions
    - Implement validateRoutingNumber (exactly 9 digits)
    - Implement validateAccountNumber (4-17 digits)
    - Implement validateEmail (email format)
    - Implement validatePhone (phone format)
    - Implement validateZipCode (5 or 9 digit format)
    - _Requirements: 1.4, 1.5, 2.5, 2.6_
  
  - [ ] 2.2 Write property tests for validation functions
    - **Property 4: Routing Number Validation**
    - **Validates: Requirements 2.5**
  
  - [ ] 2.3 Write property tests for account number validation
    - **Property 5: Account Number Validation**
    - **Validates: Requirements 2.6**
  
  - [ ] 2.4 Write property tests for profile field validation
    - **Property 1: Profile Field Validation**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7**
  
  - [x] 2.5 Create formatting utility functions
    - Implement formatCurrency (dollar sign, commas, 2 decimals)
    - Implement formatDate (human-readable format)
    - Implement formatShortDate (abbreviated format)
    - Implement formatPercentage (APR display)
    - Implement maskAccountNumber (show last 4 digits)
    - Implement maskRoutingNumber (show last 4 digits)
    - _Requirements: 3.4, 3.5, 4.2, 8.7, 9.5, 9.6_
  
  - [ ] 2.6 Write property tests for formatting functions
    - **Property 3: Payment Account Masking**
    - **Property 8: APR Formatting**
    - **Property 20: Currency Formatting**
    - **Property 21: Date Formatting**
    - **Validates: Requirements 3.4, 3.5, 4.2, 8.7, 9.5, 9.6**

- [-] 3. Amortization calculator service
  - [x] 3.1 Implement amortization calculator core functions
    - Create src/lib/loans/amortization.ts
    - Implement calculateMonthlyPayment using standard formula
    - Implement calculatePaymentBreakdown (principal/interest split)
    - Implement addMonthsToDate helper function
    - Implement calculateAmortizationSchedule (generates complete schedule)
    - _Requirements: 5.10, 5.11, 5.12_
  
  - [ ] 3.2 Write property test for amortization formula correctness
    - **Property 11: Amortization Formula Correctness**
    - **Validates: Requirements 5.12**
  
  - [ ] 3.3 Write property test for first payment due date
    - **Property 9: First Payment Due Date Calculation**
    - **Validates: Requirements 4.9, 5.10**
  
  - [ ] 3.4 Write property test for subsequent payment dates
    - **Property 10: Subsequent Payment Due Dates**
    - **Validates: Requirements 5.11**
  
  - [ ] 3.5 Write property test for payment record completeness
    - **Property 12: Payment Record Completeness**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8**
  
  - [ ] 3.6 Write unit tests for amortization calculator
    - Test with known values ($10,000 at 25% for 12 months)
    - Test edge case: 0% interest rate
    - Test edge case: very large principal
    - Test final balance is $0 (within rounding tolerance)
    - _Requirements: 5.12_

- [ ] 4. Profile management service
  - [ ] 4.1 Create profile update service
    - Create src/lib/profile/updates.ts
    - Implement updateProfileField function with validation
    - Implement createAuditLog function
    - Implement getProfileData function
    - Handle errors with descriptive messages
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ] 4.2 Write property test for audit logging
    - **Property 2: Profile Update Audit Logging**
    - **Validates: Requirements 1.8, 8.3**
  
  - [ ] 4.3 Write unit tests for profile service
    - Test successful profile update
    - Test validation failure with invalid email
    - Test validation failure with empty required field
    - Test audit log creation after update
    - Test error handling for database failures
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [-] 5. Payment account collection in application flow
  - [x] 5.1 Add payment account step to application steps
    - Update src/lib/application/steps.ts
    - Create PAYMENT_ACCOUNT_STEP definition with all fields
    - Insert step before 'documents' for Standard/Premium
    - Insert step before 'review' for Instant
    - Add validation rules for routing and account numbers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 5.2 Create PaymentAccountForm component
    - Create src/components/application/PaymentAccountForm.tsx
    - Implement form fields for bank name, account holder, routing, account, type
    - Add inline validation with error messages
    - Add help text explaining why information is needed
    - Add warning about immutability after submission
    - Style consistently with existing application form
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  
  - [x] 5.3 Update application engine to handle payment account data
    - Update src/lib/application/engine.ts
    - Add payment account validation to validateStepData
    - Store payment_info in JSONB field on submission
    - Set verification_status to "pending_manual"
    - Set plaid fields to null
    - _Requirements: 2.8, 10.3, 10.4_
  
  - [ ] 5.4 Write property test for payment account storage
    - **Property 7: Payment Account Storage**
    - **Validates: Requirements 2.8**
  
  - [ ] 5.5 Write property test for Plaid field initialization
    - **Property 22: Plaid Field Initialization**
    - **Validates: Requirements 10.3, 10.4**
  
  - [ ] 5.6 Write unit tests for payment account collection
    - Test payment account step appears in Instant flow
    - Test payment account step appears in Standard flow
    - Test payment account step appears in Premium flow
    - Test validation with valid routing number
    - Test validation with invalid routing number
    - Test validation with valid account number
    - Test validation with invalid account number
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Payment account immutability enforcement
  - [ ] 7.1 Add immutability check to application update logic
    - Update application update functions to check status
    - Prevent payment_info updates if status is not 'draft'
    - Return descriptive error message on violation
    - _Requirements: 2.9, 2.10_
  
  - [ ] 7.2 Write property test for payment account immutability
    - **Property 6: Payment Account Immutability**
    - **Validates: Requirements 2.9, 2.10**
  
  - [ ] 7.3 Write unit tests for immutability enforcement
    - Test payment info can be updated in draft status
    - Test payment info cannot be updated after submission
    - Test error message is returned on violation attempt
    - _Requirements: 2.9, 2.10_

- [ ] 8. Loan funding trigger and payment schedule generation
  - [-] 8.1 Create loan funding service
    - Create src/lib/loans/funding.ts
    - Implement fundLoan function that sets origination_date
    - Call amortization calculator to generate schedule
    - Insert all payment records into loan_payments table
    - Update loan status to 'funded'
    - _Requirements: 7.9, 7.10_
  
  - [ ] 8.2 Write property test for origination date setting
    - **Property 14: Origination Date Setting**
    - **Validates: Requirements 7.9**
  
  - [ ] 8.3 Write property test for schedule generation completeness
    - **Property 13: Amortization Schedule Completeness**
    - **Validates: Requirements 5.1, 7.10**
  
  - [ ] 8.4 Write unit tests for loan funding
    - Test origination_date is set when loan is funded
    - Test payment records are created for 12-month term
    - Test payment records are created for 24-month term
    - Test payment records are created for 60-month term
    - Test loan status changes to 'funded'
    - _Requirements: 7.9, 7.10_

- [ ] 9. Profile settings page UI
  - [ ] 9.1 Create profile settings page component
    - Create src/app/(portals)/customer/profile/page.tsx
    - Implement form for editing name, email, phone, business name, address
    - Load current profile data on mount
    - Implement save functionality with validation
    - Display success/error messages
    - Add loading states
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ] 9.2 Add payment account display to profile page
    - Fetch payment account info from application
    - Display bank name, account holder, account type
    - Display masked account number and routing number
    - Show read-only indicator
    - Display note about immutability
    - Handle case where no payment info exists
    - _Requirements: 1.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 9.3 Write property test for profile display completeness
    - **Property 24: Profile Display Completeness**
    - **Validates: Requirements 1.2**
  
  - [ ] 9.4 Write property test for payment info display immutability
    - **Property 25: Payment Info Display Immutability**
    - **Validates: Requirements 1.9**
  
  - [ ] 9.5 Write unit tests for profile page
    - Test profile form renders with current data
    - Test successful profile update
    - Test validation error display
    - Test payment account info displays correctly
    - Test payment account masking
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 3.4, 3.5_

- [ ] 10. Loan details display component
  - [ ] 10.1 Create LoanDetails component
    - Create src/components/customer/LoanDetails.tsx
    - Fetch loan data including all required fields
    - Display principal, APR, term, monthly payment, total amount
    - Display loan status and funding status with color-coded badges
    - Display origination date, first payment due, final payment due
    - Format all currency and percentage values
    - Handle loading and error states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_
  
  - [ ] 10.2 Write unit tests for loan details component
    - Test component renders all loan fields
    - Test APR formatting (0.25 → "25.00%")
    - Test currency formatting
    - Test date formatting
    - Test status badge colors
    - Test loading state
    - Test error state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 11. Current loan status component
  - [ ] 11.1 Create CurrentLoanStatus component
    - Create src/components/customer/CurrentLoanStatus.tsx
    - Fetch loan and payment data
    - Calculate and display next payment due date and amount
    - Calculate and display days until due
    - Calculate and display total paid to date
    - Display remaining balance from most recent payment
    - Display payments made / total payments
    - Add progress bar visualization
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [ ] 11.2 Write property test for days until due calculation
    - **Property 15: Days Until Due Calculation**
    - **Validates: Requirements 6.3**
  
  - [ ] 11.3 Write property test for total paid calculation
    - **Property 16: Total Paid Calculation**
    - **Validates: Requirements 6.8**
  
  - [ ] 11.4 Write property test for remaining balance retrieval
    - **Property 17: Remaining Balance Retrieval**
    - **Validates: Requirements 6.9**
  
  - [ ] 11.5 Write unit tests for current loan status
    - Test next payment displays correctly
    - Test days until due calculation
    - Test total paid calculation with mixed payment statuses
    - Test remaining balance from most recent payment
    - Test progress bar percentage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ] 12. Payment schedule component
  - [ ] 12.1 Create PaymentSchedule component
    - Create src/components/customer/PaymentSchedule.tsx
    - Fetch payment records for loan
    - Display table with all payment fields
    - Implement sorting by payment number and due date
    - Implement filtering by payment status
    - Add color-coded status indicators
    - Make responsive (table on desktop, cards on mobile)
    - Add pagination for long schedules
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 9.3, 9.4_
  
  - [ ] 12.2 Write property test for payment schedule sorting
    - **Property 18: Payment Schedule Sorting**
    - **Validates: Requirements 9.3**
  
  - [ ] 12.3 Write property test for payment schedule filtering
    - **Property 19: Payment Schedule Filtering**
    - **Validates: Requirements 9.4**
  
  - [ ] 12.4 Write unit tests for payment schedule
    - Test table renders all payment records
    - Test sorting by payment number
    - Test sorting by due date
    - Test filtering by 'paid' status
    - Test filtering by 'pending' status
    - Test pagination controls
    - Test mobile responsive layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 9.3, 9.4_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Customer portal navigation updates
  - [ ] 14.1 Update customer portal navigation
    - Update src/app/(portals)/customer/page.tsx
    - Add "Profile" tab to navigation
    - Add "Loan Details" tab to navigation
    - Add "Payment Schedule" tab to navigation
    - Ensure "Documents" tab exists
    - Ensure "Dashboard" tab exists
    - Update active tab highlighting
    - _Requirements: 1.1, 9.1_
  
  - [ ] 14.2 Create loan details page
    - Create src/app/(portals)/customer/loans/[id]/page.tsx
    - Integrate LoanDetails component
    - Integrate CurrentLoanStatus component
    - Add link to payment schedule
    - Add breadcrumb navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ] 14.3 Create payment schedule page
    - Create src/app/(portals)/customer/loans/[id]/schedule/page.tsx
    - Integrate PaymentSchedule component
    - Add breadcrumb navigation
    - Add link back to loan details
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  
  - [ ] 14.4 Write unit tests for navigation
    - Test all navigation tabs are present
    - Test navigation tab highlighting
    - Test navigation links work correctly
    - _Requirements: 1.1, 9.1_

- [ ] 15. Mobile responsiveness and styling
  - [ ] 15.1 Ensure mobile responsiveness for all components
    - Test profile page on mobile viewport
    - Test loan details on mobile viewport
    - Test payment schedule on mobile viewport (convert to cards or horizontal scroll)
    - Test current loan status on mobile viewport
    - Adjust font sizes and spacing for mobile
    - Test navigation menu on mobile (hamburger if needed)
    - _Requirements: 9.2_
  
  - [ ] 15.2 Apply consistent styling
    - Ensure all components use consistent color scheme
    - Ensure all components use consistent typography
    - Ensure all components use consistent spacing
    - Ensure all buttons and inputs match existing design
    - Add hover states and transitions
    - _Requirements: 9.1, 9.2_

- [ ] 16. Integration testing and end-to-end flows
  - [ ] 16.1 Write integration test for application with payment account
    - Test complete application flow including payment account step
    - Test payment info is stored correctly
    - Test payment info cannot be edited after submission
    - _Requirements: 2.1, 2.2, 2.3, 2.8, 2.9, 2.10_
  
  - [ ] 16.2 Write integration test for loan funding flow
    - Test admin approves loan
    - Test origination date is set
    - Test payment schedule is generated
    - Test borrower can view loan details
    - Test borrower can view payment schedule
    - _Requirements: 7.9, 7.10, 4.1, 5.1_
  
  - [ ] 16.3 Write integration test for profile update flow
    - Test borrower updates profile
    - Test changes are persisted
    - Test audit log is created
    - Test updated data displays correctly
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 17. Security and encryption verification
  - [ ] 17.1 Write property test for payment account encryption
    - **Property 23: Payment Account Encryption**
    - **Validates: Requirements 8.1**
  
  - [ ] 17.2 Write security tests for RLS policies
    - Test borrower can only access own applications
    - Test borrower can only access own loan payments
    - Test borrower can only access own audit logs
    - Test admin can access all data
    - Test cross-borrower access is denied
    - _Requirements: 8.2, 8.6_
  
  - [ ] 17.3 Write security tests for data masking
    - Test account numbers are never logged in plaintext
    - Test account numbers are masked in UI
    - Test routing numbers are masked in UI
    - Test audit logs mask sensitive data
    - _Requirements: 3.4, 3.5, 8.7_

- [ ] 18. Final checkpoint and documentation
  - [ ] 18.1 Run full test suite
    - Run all unit tests
    - Run all property-based tests
    - Run all integration tests
    - Verify all tests pass
    - Fix any failing tests
  
  - [ ] 18.2 Manual testing checklist
    - Test complete application flow with payment account
    - Test profile updates and audit logging
    - Test loan details display after funding
    - Test payment schedule display and interactions
    - Test mobile responsiveness on actual devices
    - Test error handling and edge cases
  
  - [ ] 18.3 Update documentation
    - Document new API endpoints (if any)
    - Document new database tables and fields
    - Document RLS policies
    - Document encryption approach
    - Update README with new features

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Security tests validate data protection and access control
- All tests are required for comprehensive coverage
