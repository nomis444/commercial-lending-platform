# Requirements Document: Investment System

## Introduction

This document specifies the requirements for implementing an investment system that enables investors to fund approved loans through a user-friendly interface. The system allows investors to select investment amounts using a slider control, tracks investment records, updates loan funding progress, and provides portfolio management capabilities for investors, customers, and administrators.

## Glossary

- **Investment_System**: The software system that manages loan investments, funding progress, and portfolio tracking
- **Investor**: A user with the role 'investor' who can invest in approved loans
- **Customer**: A user with the role 'borrower' who has applied for a loan
- **Admin**: A user with the role 'admin' who can view all investments and funding details
- **Approved_Loan**: A loan application with status 'approved' that is available for investment
- **Investment_Record**: A database record tracking an investor's investment in a specific loan
- **Funding_Progress**: The cumulative amount and percentage of a loan that has been funded
- **Investment_Amount**: The dollar amount an investor commits to a specific loan
- **Minimum_Investment**: The smallest investment amount allowed, set at $1,000
- **Full_Funding**: When a loan reaches 100% of its requested amount through investments

## Requirements

### Requirement 1: Investment UI Controls

**User Story:** As an investor, I want to use a slider control to select my investment amount, so that I can easily choose how much to invest in each loan.

#### Acceptance Criteria

1. WHEN an investor views an approved loan card, THE Investment_System SHALL display a slider control for selecting investment amounts
2. THE Investment_System SHALL set the slider minimum value to $1,000
3. THE Investment_System SHALL set the slider maximum value to the full loan amount
4. WHEN an investor adjusts the slider, THE Investment_System SHALL display the selected investment amount in dollars
5. WHEN an investor adjusts the slider, THE Investment_System SHALL display the percentage of the loan being funded by this investment
6. THE Investment_System SHALL display an "Invest" button that commits the selected investment amount

### Requirement 2: Investment Record Creation

**User Story:** As an investor, I want my investment to be recorded when I click the Invest button, so that my commitment is tracked in the system.

#### Acceptance Criteria

1. WHEN an investor clicks the "Invest" button, THE Investment_System SHALL create an investment record in the investments table
2. THE Investment_System SHALL store the investor_id from the authenticated user
3. THE Investment_System SHALL store the application_id of the loan being invested in
4. THE Investment_System SHALL store the investment_amount selected by the investor
5. THE Investment_System SHALL store the investment_date as the current timestamp
6. THE Investment_System SHALL set the investment status to 'pending'
7. WHEN the investment record is created, THE Investment_System SHALL return a success confirmation to the investor

### Requirement 3: Funding Progress Tracking

**User Story:** As an investor, I want to see how much of a loan has been funded, so that I can make informed investment decisions.

#### Acceptance Criteria

1. WHEN an investment is created, THE Investment_System SHALL update the loan's funded_amount by adding the investment amount
2. WHEN an investment is created, THE Investment_System SHALL calculate the funding_percentage as (funded_amount / loan_amount) * 100
3. WHEN displaying a loan card, THE Investment_System SHALL show the current funded_amount
4. WHEN displaying a loan card, THE Investment_System SHALL show the current funding_percentage
5. WHEN displaying a loan card, THE Investment_System SHALL show a visual progress bar representing the funding_percentage

### Requirement 4: Automatic Status Updates

**User Story:** As a customer, I want my loan status to automatically change to "funded" when it reaches 100% funding, so that I know my loan is ready to be disbursed.

#### Acceptance Criteria

1. WHEN a loan's funding_percentage reaches or exceeds 100%, THE Investment_System SHALL change the application status to 'funded'
2. WHEN the application status changes to 'funded', THE Investment_System SHALL prevent additional investments in that loan
3. THE Investment_System SHALL update the application status atomically with the investment creation

### Requirement 5: Investor Portfolio Display

**User Story:** As an investor, I want to view all my investments in a portfolio tab, so that I can track my investment activity.

#### Acceptance Criteria

1. WHEN an investor navigates to the "My Portfolio" tab, THE Investment_System SHALL display all investments for that investor
2. FOR EACH investment, THE Investment_System SHALL display the loan business name
3. FOR EACH investment, THE Investment_System SHALL display the investment amount
4. FOR EACH investment, THE Investment_System SHALL display the investment date
5. FOR EACH investment, THE Investment_System SHALL display the current investment status
6. THE Investment_System SHALL calculate and display the total invested amount across all investments
7. THE Investment_System SHALL display the total invested amount in the dashboard statistics

### Requirement 6: Admin Investment Visibility

**User Story:** As an admin, I want to see all investments for each loan, so that I can monitor funding activity and investor participation.

#### Acceptance Criteria

1. WHEN an admin views a loan's details, THE Investment_System SHALL display all investments for that loan
2. FOR EACH investment, THE Investment_System SHALL display the investor identifier
3. FOR EACH investment, THE Investment_System SHALL display the investment amount
4. FOR EACH investment, THE Investment_System SHALL display the investment date
5. THE Investment_System SHALL display the total funding progress for the loan
6. THE Investment_System SHALL display a breakdown showing each investor's contribution percentage

### Requirement 7: Customer Funding Visibility

**User Story:** As a customer, I want to see my loan's funding progress, so that I know how close my loan is to being fully funded.

#### Acceptance Criteria

1. WHEN a customer views their loan application, THE Investment_System SHALL display the current funded amount
2. WHEN a customer views their loan application, THE Investment_System SHALL display the funding percentage
3. WHEN a customer views their loan application, THE Investment_System SHALL display a visual progress bar
4. WHEN a loan reaches full funding, THE Investment_System SHALL display a notification that the loan is fully funded
5. WHEN a loan status changes to 'funded', THE Investment_System SHALL display the updated status to the customer

### Requirement 8: Investment Validation

**User Story:** As an investor, I want the system to validate my investment, so that I cannot make invalid investments.

#### Acceptance Criteria

1. WHEN an investor attempts to invest less than $1,000, THE Investment_System SHALL reject the investment and display an error message
2. WHEN an investor attempts to invest more than the remaining unfunded amount, THE Investment_System SHALL reject the investment and display an error message
3. WHEN an investor attempts to invest in a loan that is not in 'approved' status, THE Investment_System SHALL reject the investment and display an error message
4. WHEN an investor attempts to invest in a fully funded loan, THE Investment_System SHALL reject the investment and display an error message
5. THE Investment_System SHALL validate that the investor is authenticated before allowing any investment

### Requirement 9: Database Schema Requirements

**User Story:** As a developer, I want the database schema to support investment tracking, so that all investment data is properly stored and queryable.

#### Acceptance Criteria

1. THE Investment_System SHALL use the existing investments table with columns: id, loan_id, investor_id, tenant_id, amount, percentage, status, returns, created_at, updated_at
2. THE Investment_System SHALL use the existing loans table with columns: funded_amount and funding_status
3. THE Investment_System SHALL maintain referential integrity between investments and loans tables
4. THE Investment_System SHALL maintain referential integrity between investments and auth.users tables
5. THE Investment_System SHALL create indexes on investor_id and loan_id for query performance

### Requirement 10: Row Level Security

**User Story:** As a security administrator, I want Row Level Security policies to protect investment data, so that users can only access their authorized data.

#### Acceptance Criteria

1. THE Investment_System SHALL allow investors to create investment records for their own user_id
2. THE Investment_System SHALL allow investors to view only their own investment records
3. THE Investment_System SHALL allow admins to view all investment records
4. THE Investment_System SHALL allow customers to view investments related to their own loan applications
5. THE Investment_System SHALL prevent unauthorized users from viewing or modifying investment records
