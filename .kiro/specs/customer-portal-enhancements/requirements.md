# Requirements Document: Customer Portal Enhancements

## Introduction

This specification defines enhancements to the customer portal for a commercial lending platform. The enhancements provide borrowers with comprehensive loan management capabilities, including profile management, payment account information, detailed loan information, payment schedules, and current loan status tracking. The system will collect payment account information during the loan application process and display comprehensive loan details once loans are funded.

## Glossary

- **Customer_Portal**: The web-based interface where borrowers manage their loans and account information
- **Borrower**: A user with the role 'borrower' who has applied for or received a loan
- **Payment_Account**: Bank account information used for loan repayment via ACH
- **Loan**: A funded application with defined principal, interest rate, and term
- **Application**: A loan request that may be in draft, submitted, under review, approved, rejected, or funded status
- **Amortization_Schedule**: A table showing the breakdown of each loan payment into principal and interest portions
- **Payment_Record**: A single entry in the amortization schedule representing one monthly payment
- **Origination_Date**: The date when a loan is funded and becomes active
- **Principal**: The original loan amount borrowed
- **APR**: Annual Percentage Rate - the yearly interest rate charged on the loan
- **Term**: The length of the loan in months
- **RLS**: Row Level Security - Supabase security policies that restrict data access
- **Plaid**: Third-party service for bank account verification (future integration)
- **Profile_Settings**: Section of the portal where borrowers update their account information

## Requirements

### Requirement 1: Profile Settings Management

**User Story:** As a borrower, I want to update my profile information, so that my account details remain current and accurate.

#### Acceptance Criteria

1. WHEN a borrower accesses the Customer_Portal, THE System SHALL display a "Profile" or "Settings" navigation option
2. WHEN a borrower views their profile, THE System SHALL display their current full name, email address, phone number, business name, and business address
3. WHEN a borrower updates their full name, THE System SHALL validate the name is not empty and save the change
4. WHEN a borrower updates their email address, THE System SHALL validate the email format and save the change
5. WHEN a borrower updates their phone number, THE System SHALL validate the phone format and save the change
6. WHEN a borrower updates their business name, THE System SHALL validate the name is not empty and save the change
7. WHEN a borrower updates their business address, THE System SHALL validate the address is not empty and save the change
8. WHEN a borrower saves profile changes, THE System SHALL log the change with timestamp and user ID for audit purposes
9. WHEN a borrower views payment account information in their profile, THE System SHALL display it as read-only with masked account numbers

### Requirement 2: Payment Account Collection

**User Story:** As a borrower, I want to provide my payment account information during the application process, so that loan payments can be automatically withdrawn.

#### Acceptance Criteria

1. WHEN a borrower applies for an Instant loan, THE System SHALL collect payment account information before application submission
2. WHEN a borrower applies for a Standard loan, THE System SHALL collect payment account information before application submission
3. WHEN a borrower applies for a Premium loan, THE System SHALL collect payment account information before application submission
4. WHEN collecting payment account information, THE System SHALL request bank name, account holder name, routing number, account number, and account type
5. WHEN a borrower enters a routing number, THE System SHALL validate it is exactly 9 digits
6. WHEN a borrower enters an account number, THE System SHALL validate it is between 4 and 17 digits
7. WHEN a borrower selects account type, THE System SHALL provide options for "checking" and "savings"
8. WHEN a borrower submits an application with payment information, THE System SHALL store the payment data encrypted in the payment_info JSONB field
9. WHEN an application is submitted, THE System SHALL mark payment account information as unmodifiable
10. IF a borrower attempts to modify payment account information after submission, THEN THE System SHALL prevent the modification and display an error message

### Requirement 3: Payment Account Display

**User Story:** As a borrower, I want to view my payment account information in the portal, so that I can verify which account will be used for payments.

#### Acceptance Criteria

1. WHEN a borrower views their profile with submitted payment information, THE System SHALL display the bank name
2. WHEN a borrower views their profile with submitted payment information, THE System SHALL display the account holder name
3. WHEN a borrower views their profile with submitted payment information, THE System SHALL display the account type
4. WHEN displaying the account number, THE System SHALL show only the last 4 digits with the format "****1234"
5. WHEN displaying the routing number, THE System SHALL show only the last 4 digits with the format "****5678"
6. WHEN a borrower views payment account information, THE System SHALL display a note indicating the information cannot be changed after submission

### Requirement 4: Loan Details Display

**User Story:** As a borrower, I want to view comprehensive information about my loan, so that I understand the terms and current status.

#### Acceptance Criteria

1. WHEN a borrower views a funded loan, THE System SHALL display the principal amount
2. WHEN a borrower views a funded loan, THE System SHALL display the interest rate as APR percentage
3. WHEN a borrower views a funded loan, THE System SHALL display the term length in months
4. WHEN a borrower views a funded loan, THE System SHALL display the monthly payment amount
5. WHEN a borrower views a funded loan, THE System SHALL display the total amount to be repaid
6. WHEN a borrower views a funded loan, THE System SHALL display the loan status
7. WHEN a borrower views a funded loan, THE System SHALL display the funding status
8. WHEN a borrower views a funded loan, THE System SHALL display the origination date
9. WHEN a borrower views a funded loan, THE System SHALL display the first payment due date as 30 days after origination
10. WHEN a borrower views a funded loan, THE System SHALL display the final payment due date
11. WHEN a borrower views a loan, THE System SHALL display valid loan statuses: approved, funded, active, paid_off, or defaulted

### Requirement 5: Payment Schedule Display

**User Story:** As a borrower, I want to view my complete payment schedule, so that I can plan my finances and track payment progress.

#### Acceptance Criteria

1. WHEN a borrower views a funded loan, THE System SHALL display a complete amortization schedule
2. FOR EACH Payment_Record in the schedule, THE System SHALL display the payment number
3. FOR EACH Payment_Record in the schedule, THE System SHALL display the payment due date
4. FOR EACH Payment_Record in the schedule, THE System SHALL display the payment amount
5. FOR EACH Payment_Record in the schedule, THE System SHALL display the principal portion
6. FOR EACH Payment_Record in the schedule, THE System SHALL display the interest portion
7. FOR EACH Payment_Record in the schedule, THE System SHALL display the remaining balance after payment
8. FOR EACH Payment_Record in the schedule, THE System SHALL display the payment status
9. WHEN displaying payment status, THE System SHALL use values: pending, paid, late, or missed
10. WHEN a loan is originated, THE System SHALL calculate the first payment due date as 30 days from the origination date
11. WHEN calculating subsequent payments, THE System SHALL set each payment due date as one month after the previous payment
12. WHEN generating the amortization schedule, THE System SHALL use the standard amortization formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]

### Requirement 6: Current Loan Status Display

**User Story:** As a borrower, I want to see my current loan status at a glance, so that I know when my next payment is due and how much I owe.

#### Acceptance Criteria

1. WHEN a borrower views an active loan, THE System SHALL prominently display the next payment due date
2. WHEN a borrower views an active loan, THE System SHALL prominently display the next payment amount
3. WHEN a borrower views an active loan, THE System SHALL calculate and display days until the next payment is due
4. WHEN a borrower views an active loan, THE System SHALL display the total amount paid to date
5. WHEN a borrower views an active loan, THE System SHALL display the remaining balance
6. WHEN a borrower views an active loan, THE System SHALL display the number of payments made
7. WHEN a borrower views an active loan, THE System SHALL display the total number of payments
8. WHEN calculating total paid to date, THE System SHALL sum all Payment_Records with status "paid"
9. WHEN calculating remaining balance, THE System SHALL use the remaining balance from the most recent Payment_Record

### Requirement 7: Data Model Enhancements

**User Story:** As a system administrator, I want the database schema to support payment tracking and loan details, so that the system can store and retrieve all necessary information.

#### Acceptance Criteria

1. THE System SHALL add a payment_info JSONB field to the applications table
2. THE System SHALL create a loan_payments table for tracking payment schedules
3. THE loan_payments table SHALL include fields: id, loan_id, payment_number, due_date, amount, principal_portion, interest_portion, remaining_balance, status, paid_date, created_at, updated_at
4. THE System SHALL add an interest_rate field to the loans table
5. THE System SHALL add a term_months field to the loans table
6. THE System SHALL add an origination_date field to the loans table
7. THE System SHALL add a monthly_payment field to the loans table
8. THE System SHALL add a total_amount field to the loans table
9. WHEN a loan status changes to "funded", THE System SHALL set the origination_date to the current timestamp
10. WHEN a loan is funded, THE System SHALL generate all Payment_Records for the complete amortization schedule

### Requirement 8: Security and Compliance

**User Story:** As a system administrator, I want payment account information to be secure and access-controlled, so that sensitive financial data is protected.

#### Acceptance Criteria

1. WHEN storing payment account information, THE System SHALL encrypt the data at rest
2. WHEN a borrower accesses payment account information, THE System SHALL verify the borrower owns the associated application via RLS policies
3. WHEN logging profile changes, THE System SHALL record the user ID, timestamp, field changed, and new value
4. THE System SHALL create an audit_logs table for tracking profile changes
5. THE audit_logs table SHALL include fields: id, user_id, action_type, table_name, record_id, old_values, new_values, created_at
6. WHEN a borrower attempts to access another borrower's data, THE System SHALL deny access via RLS policies
7. WHEN displaying sensitive account information in logs, THE System SHALL mask account numbers showing only last 4 digits

### Requirement 9: User Experience and Navigation

**User Story:** As a borrower, I want clear navigation and mobile-responsive design, so that I can easily access loan information on any device.

#### Acceptance Criteria

1. THE Customer_Portal SHALL include navigation options for: Dashboard, Loan Details, Payment Schedule, Documents, and Profile
2. WHEN a borrower accesses the portal on a mobile device, THE System SHALL display a responsive layout optimized for small screens
3. WHEN a borrower views the payment schedule, THE System SHALL provide sorting options for payment number and due date
4. WHEN a borrower views the payment schedule, THE System SHALL provide filtering options for payment status
5. WHEN displaying financial amounts, THE System SHALL format currency with dollar sign and two decimal places
6. WHEN displaying dates, THE System SHALL format dates in a human-readable format (e.g., "January 15, 2024")
7. WHEN displaying loan terms, THE System SHALL use clear, non-technical language suitable for non-financial users

### Requirement 10: Future Integration Preparation

**User Story:** As a system architect, I want the payment account data structured for future Plaid integration, so that we can add automated verification without major refactoring.

#### Acceptance Criteria

1. THE payment_info JSONB field SHALL include a structure compatible with Plaid's account object format
2. THE payment_info structure SHALL include fields: bank_name, account_holder_name, routing_number, account_number, account_type, plaid_account_id, plaid_access_token, verification_status
3. WHEN storing payment information without Plaid, THE System SHALL set plaid_account_id and plaid_access_token to null
4. WHEN storing payment information without Plaid, THE System SHALL set verification_status to "pending_manual"
5. THE System SHALL include a verification_status field with possible values: pending_manual, verified, failed, manual_review
