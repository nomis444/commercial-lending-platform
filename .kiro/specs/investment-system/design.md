# Design Document: Investment System

## Overview

The Investment System enables investors to fund approved loans through an intuitive slider-based interface. The system manages the complete investment lifecycle: from displaying available investment opportunities, capturing investment commitments, tracking funding progress, to providing portfolio views for all stakeholders (investors, customers, and admins).

The design leverages the existing Next.js 15 + React 19 + TypeScript stack with Supabase for backend services. The system integrates seamlessly with the existing portal architecture and database schema, adding investment functionality to the investor portal while enhancing visibility in customer and admin portals.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  InvestmentSlider  │  InvestmentCard  │  PortfolioView     │
│  Component         │  Component       │  Component          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (TypeScript)                 │
├─────────────────────────────────────────────────────────────┤
│  InvestmentService │  ValidationService │  CalculationService│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  investments table │  loans table  │  applications table    │
│  RLS Policies      │  Triggers     │  Indexes               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Investment Creation Flow:**
   - User adjusts slider → Component validates range → Service validates business rules → Database transaction creates investment + updates loan funding → UI updates with confirmation

2. **Portfolio Display Flow:**
   - User navigates to portfolio → Service fetches investments with loan details → Component renders investment list with statistics

3. **Funding Progress Flow:**
   - Investment created → Trigger calculates new funding totals → Application status updated if 100% → All portals reflect updated status

## Components and Interfaces

### 1. InvestmentSlider Component

**Purpose:** Provides an interactive slider control for selecting investment amounts.

**Props:**
```typescript
interface InvestmentSliderProps {
  loanId: string
  loanAmount: number
  fundedAmount: number
  minInvestment: number
  onInvest: (amount: number) => Promise<void>
}
```

**State:**
```typescript
interface InvestmentSliderState {
  selectedAmount: number
  percentage: number
  isInvesting: boolean
  error: string | null
}
```

**Behavior:**
- Renders a range input slider with min=$1,000 and max=(loanAmount - fundedAmount)
- Displays selected amount in currency format
- Displays percentage of loan being funded
- Validates amount is within acceptable range
- Calls onInvest callback when "Invest" button clicked
- Shows loading state during investment processing
- Displays error messages for validation failures

### 2. InvestmentCard Component

**Purpose:** Displays loan details with embedded investment controls.

**Props:**
```typescript
interface InvestmentCardProps {
  application: Application
  loan: Loan
  onInvestmentComplete: () => void
}
```

**Renders:**
- Business name and loan details
- Current funding progress bar
- Funded amount and percentage
- InvestmentSlider component
- Investment status indicators

### 3. PortfolioView Component

**Purpose:** Displays investor's complete investment portfolio.

**State:**
```typescript
interface PortfolioViewState {
  investments: Investment[]
  totalInvested: number
  loading: boolean
}
```

**Displays:**
- List of all investments with loan details
- Investment amount, date, and status for each
- Total invested amount summary
- Filtering and sorting options

### 4. InvestmentService

**Purpose:** Handles all investment-related business logic and API calls.

**Interface:**
```typescript
interface InvestmentService {
  createInvestment(params: CreateInvestmentParams): Promise<Investment>
  getInvestorPortfolio(investorId: string): Promise<Investment[]>
  getInvestmentsForLoan(loanId: string): Promise<Investment[]>
  validateInvestment(params: ValidateInvestmentParams): Promise<ValidationResult>
  calculateFundingProgress(loanId: string): Promise<FundingProgress>
}

interface CreateInvestmentParams {
  investorId: string
  loanId: string
  applicationId: string
  amount: number
}

interface ValidateInvestmentParams {
  amount: number
  loanAmount: number
  fundedAmount: number
  applicationStatus: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface FundingProgress {
  fundedAmount: number
  fundingPercentage: number
  remainingAmount: number
}
```

**Methods:**

**createInvestment:**
```typescript
async function createInvestment(params: CreateInvestmentParams): Promise<Investment> {
  // 1. Validate investment parameters
  const validation = await validateInvestment({
    amount: params.amount,
    loanAmount: loan.principal_amount,
    fundedAmount: loan.funded_amount,
    applicationStatus: application.status
  })
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }
  
  // 2. Create investment record
  const investment = await supabase
    .from('investments')
    .insert({
      loan_id: params.loanId,
      investor_id: params.investorId,
      amount: params.amount,
      percentage: (params.amount / loan.principal_amount) * 100,
      status: 'pending'
    })
    .select()
    .single()
  
  // 3. Update loan funding
  const newFundedAmount = loan.funded_amount + params.amount
  const newFundingPercentage = (newFundedAmount / loan.principal_amount) * 100
  
  await supabase
    .from('loans')
    .update({
      funded_amount: newFundedAmount,
      funding_status: newFundingPercentage >= 100 ? 'fully_funded' : 
                      newFundingPercentage > 0 ? 'partially_funded' : 'unfunded'
    })
    .eq('id', params.loanId)
  
  // 4. Update application status if fully funded
  if (newFundingPercentage >= 100) {
    await supabase
      .from('applications')
      .update({ status: 'funded' })
      .eq('id', params.applicationId)
  }
  
  return investment
}
```

**validateInvestment:**
```typescript
async function validateInvestment(params: ValidateInvestmentParams): Promise<ValidationResult> {
  const errors: string[] = []
  
  // Check minimum investment
  if (params.amount < 1000) {
    errors.push('Investment amount must be at least $1,000')
  }
  
  // Check maximum investment
  const remainingAmount = params.loanAmount - params.fundedAmount
  if (params.amount > remainingAmount) {
    errors.push(`Investment amount cannot exceed remaining loan amount of ${formatCurrency(remainingAmount)}`)
  }
  
  // Check application status
  if (params.applicationStatus !== 'approved') {
    errors.push('Can only invest in approved loans')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

**getInvestorPortfolio:**
```typescript
async function getInvestorPortfolio(investorId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      loans (
        *,
        applications (
          business_info,
          loan_amount,
          loan_purpose
        )
      )
    `)
    .eq('investor_id', investorId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### 5. Database Schema Updates

The existing schema already includes the necessary tables. We'll utilize:

**investments table** (already exists):
- id: UUID (primary key)
- loan_id: UUID (foreign key to loans)
- investor_id: UUID (foreign key to auth.users)
- tenant_id: UUID (foreign key to tenants)
- amount: DECIMAL(12,2)
- percentage: DECIMAL(5,4)
- status: investment_status enum
- returns: DECIMAL(12,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**loans table** (already exists, will use existing columns):
- funded_amount: DECIMAL(12,2)
- funding_status: funding_status enum

**applications table** (already exists):
- status: application_status enum (will update to 'funded' when 100%)

### 6. Row Level Security Policies

**investments table policies:**

```sql
-- Investors can create investments for themselves
CREATE POLICY "Investors can create own investments"
ON investments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = investor_id AND
  EXISTS (
    SELECT 1 FROM applications a
    JOIN loans l ON l.application_id = a.id
    WHERE l.id = loan_id AND a.status = 'approved'
  )
);

-- Investors can view their own investments
CREATE POLICY "Investors can view own investments"
ON investments FOR SELECT
TO authenticated
USING (
  auth.uid() = investor_id OR
  auth.jwt() ->> 'role' = 'admin'
);

-- Customers can view investments on their loans
CREATE POLICY "Customers can view investments on their loans"
ON investments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN loans l ON l.application_id = a.id
    WHERE l.id = loan_id AND a.applicant_id = auth.uid()
  )
);

-- Admins can view all investments
CREATE POLICY "Admins can view all investments"
ON investments FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
```

## Data Models

### Investment Model

```typescript
interface Investment {
  id: string
  loan_id: string
  investor_id: string
  tenant_id: string
  amount: number
  percentage: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  returns: number
  created_at: string
  updated_at: string
}
```

### Loan Model (existing, relevant fields)

```typescript
interface Loan {
  id: string
  application_id: string
  tenant_id: string
  principal_amount: number
  interest_rate: number
  term_months: number
  status: 'pending' | 'active' | 'paid_off' | 'defaulted'
  funding_status: 'unfunded' | 'partially_funded' | 'fully_funded'
  funded_amount: number
  created_at: string
  updated_at: string
}
```

### Application Model (existing, relevant fields)

```typescript
interface Application {
  id: string
  tenant_id: string
  applicant_id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded'
  loan_amount: number
  loan_purpose: string
  business_info: BusinessInfo
  financial_info: FinancialInfo
  created_at: string
  updated_at: string
}
```

### Extended Models for UI

```typescript
interface InvestmentWithLoanDetails extends Investment {
  loan: Loan & {
    application: Application
  }
}

interface LoanWithInvestments extends Loan {
  investments: Investment[]
  application: Application
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Slider Range Bounds

*For any* approved loan with a given loan amount and funded amount, the investment slider minimum value should be $1,000 and the maximum value should be (loan amount - funded amount).

**Validates: Requirements 1.2, 1.3**

### Property 2: Investment Amount Display Accuracy

*For any* slider value selected by an investor, the displayed investment amount should match the slider value in currency format, and the displayed percentage should equal (slider value / loan amount) × 100.

**Validates: Requirements 1.4, 1.5**

### Property 3: Investment Record Completeness

*For any* investment created, the stored record should contain the correct investor_id (matching authenticated user), application_id (matching the loan's application), investment amount (matching selected amount), status 'pending', and a timestamp within 1 second of creation time.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 4: Investment Creation Success Response

*For any* valid investment creation, the system should return a success confirmation to the investor.

**Validates: Requirements 2.1, 2.7**

### Property 5: Funding Amount Accumulation

*For any* sequence of investments on a loan, the loan's funded_amount should equal the sum of all investment amounts, and the funding_percentage should equal (funded_amount / loan_amount) × 100.

**Validates: Requirements 3.1, 3.2**

### Property 6: Funding Progress Display Consistency

*For any* loan displayed in any portal (investor, customer, admin), the shown funded_amount and funding_percentage should match the calculated values from the database, and the progress bar width should correspond to the funding_percentage.

**Validates: Requirements 3.3, 3.4, 3.5, 7.1, 7.2, 7.3**

### Property 7: Automatic Status Transition at Full Funding

*For any* loan where an investment causes the funding_percentage to reach or exceed 100%, the application status should automatically change to 'funded', and subsequent investment attempts on that loan should be rejected.

**Validates: Requirements 4.1, 4.2**

### Property 8: Portfolio Completeness and Accuracy

*For any* investor, the portfolio view should display all investments belonging to that investor, each investment should show the correct business name, amount, date, and status, and the total invested amount should equal the sum of all investment amounts.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7**

### Property 9: Admin Investment Visibility

*For any* loan viewed by an admin, all investments for that loan should be displayed with investor identifiers, amounts, and dates, and each investor's contribution percentage should equal (their investment amount / total funded amount) × 100.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 10: Customer Funding Status Visibility

*For any* customer viewing their loan application, if the loan is fully funded (100%), a notification should be displayed indicating full funding, and the status should show as 'funded'.

**Validates: Requirements 7.4, 7.5**

### Property 11: Investment Validation Rules

*For any* investment attempt, the system should reject investments where: amount < $1,000, amount > (loan_amount - funded_amount), application status ≠ 'approved', or funding_percentage ≥ 100%, and should display an appropriate error message for each rejection reason.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 12: Authentication Requirement

*For any* investment operation (create or view), the system should reject requests from unauthenticated users.

**Validates: Requirements 8.5**

### Property 13: Referential Integrity Enforcement

*For any* investment creation attempt with an invalid loan_id or investor_id (non-existent in their respective tables), the database should reject the operation.

**Validates: Requirements 9.3, 9.4**

### Property 14: Investor Authorization Isolation

*For any* investor user, they should be able to create investments for their own user_id and view only their own investment records, while being unable to view or modify other investors' records.

**Validates: Requirements 10.1, 10.2**

### Property 15: Admin Authorization Scope

*For any* admin user, they should be able to view all investment records regardless of investor.

**Validates: Requirements 10.3**

### Property 16: Customer Loan Investment Visibility

*For any* customer user, they should be able to view all investments related to their own loan applications, but not investments on other customers' loans.

**Validates: Requirements 10.4**

### Property 17: Unauthorized Access Prevention

*For any* user without proper authorization (not the investor, not the loan owner, not an admin), attempts to view or modify investment records should be rejected.

**Validates: Requirements 10.5**

## Error Handling

### Validation Errors

**Investment Amount Errors:**
- **Below Minimum**: Return error "Investment amount must be at least $1,000"
- **Exceeds Available**: Return error "Investment amount cannot exceed remaining loan amount of $X"
- **Invalid Number**: Return error "Investment amount must be a valid number"

**Loan Status Errors:**
- **Not Approved**: Return error "Can only invest in approved loans"
- **Already Funded**: Return error "This loan is already fully funded"
- **Loan Not Found**: Return error "Loan not found"

**Authentication Errors:**
- **Not Authenticated**: Return 401 with error "Authentication required"
- **Invalid Token**: Return 401 with error "Invalid authentication token"

**Authorization Errors:**
- **Insufficient Permissions**: Return 403 with error "Insufficient permissions to perform this action"
- **Wrong User**: Return 403 with error "Cannot create investment for another user"

### Database Errors

**Transaction Failures:**
- If investment creation succeeds but funding update fails, rollback the investment
- If funding update succeeds but status update fails, rollback both operations
- Return error "Investment failed due to system error. Please try again."

**Constraint Violations:**
- **Foreign Key Violation**: Return error "Invalid loan or investor reference"
- **Unique Constraint**: Return error "Duplicate investment detected"

**Connection Errors:**
- **Database Unavailable**: Return error "Service temporarily unavailable. Please try again later."
- **Timeout**: Return error "Request timed out. Please try again."

### UI Error Handling

**Component Error States:**
- Display error messages inline below the investment slider
- Use red text and error icon for visibility
- Clear errors when user adjusts slider or retries
- Disable "Invest" button while processing to prevent double-submission

**Network Error Recovery:**
- Show retry button for network failures
- Implement exponential backoff for retries
- Display loading states during async operations
- Provide clear feedback when operations complete

## Testing Strategy

### Dual Testing Approach

The investment system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of investment scenarios (e.g., investing exactly $1,000, investing to reach exactly 100%)
- Edge cases (e.g., investing in a loan with $1 remaining, concurrent investments)
- Integration points between components (e.g., slider component calling investment service)
- Error conditions (e.g., network failures, database errors)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs (e.g., funding amount always equals sum of investments)
- Comprehensive input coverage through randomization (e.g., random loan amounts, random investment amounts)
- Invariants that must be maintained (e.g., funded_amount never exceeds loan_amount)
- Calculation correctness across all possible values (e.g., percentage calculations)

### Property-Based Testing Configuration

**Testing Library**: Use **fast-check** for TypeScript/JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: investment-system, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check'

// Feature: investment-system, Property 5: Funding Amount Accumulation
test('funding amount equals sum of all investments', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer({ min: 1000, max: 100000 })), // Random investment amounts
      fc.integer({ min: 10000, max: 1000000 }), // Random loan amount
      async (investmentAmounts, loanAmount) => {
        // Setup: Create loan
        const loan = await createTestLoan({ amount: loanAmount })
        
        // Execute: Create investments
        for (const amount of investmentAmounts) {
          if (loan.funded_amount + amount <= loanAmount) {
            await createInvestment({ loanId: loan.id, amount })
          }
        }
        
        // Verify: Funded amount equals sum
        const updatedLoan = await getLoan(loan.id)
        const expectedSum = investmentAmounts
          .filter((amt, idx) => {
            const runningSum = investmentAmounts.slice(0, idx).reduce((a, b) => a + b, 0)
            return runningSum + amt <= loanAmount
          })
          .reduce((a, b) => a + b, 0)
        
        expect(updatedLoan.funded_amount).toBe(expectedSum)
        expect(updatedLoan.funding_percentage).toBe((expectedSum / loanAmount) * 100)
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test Coverage Requirements

**Component Tests**:
- InvestmentSlider: slider rendering, value updates, validation, button states
- InvestmentCard: loan display, funding progress, investment controls
- PortfolioView: investment list, totals calculation, filtering

**Service Tests**:
- InvestmentService: all methods with valid and invalid inputs
- ValidationService: all validation rules
- CalculationService: all calculation formulas

**Integration Tests**:
- End-to-end investment flow: select amount → invest → verify database → verify UI update
- Multi-investor scenarios: multiple investors funding same loan
- Status transition: loan reaching 100% funding and status change
- Authorization: RLS policies enforcing access control

**Property Tests** (one per correctness property):
- Property 1: Slider Range Bounds
- Property 2: Investment Amount Display Accuracy
- Property 3: Investment Record Completeness
- Property 4: Investment Creation Success Response
- Property 5: Funding Amount Accumulation
- Property 6: Funding Progress Display Consistency
- Property 7: Automatic Status Transition at Full Funding
- Property 8: Portfolio Completeness and Accuracy
- Property 9: Admin Investment Visibility
- Property 10: Customer Funding Status Visibility
- Property 11: Investment Validation Rules
- Property 12: Authentication Requirement
- Property 13: Referential Integrity Enforcement
- Property 14: Investor Authorization Isolation
- Property 15: Admin Authorization Scope
- Property 16: Customer Loan Investment Visibility
- Property 17: Unauthorized Access Prevention

### Testing Best Practices

**Avoid Over-Testing with Unit Tests**:
- Don't write unit tests for every possible input combination
- Property-based tests handle comprehensive input coverage
- Focus unit tests on specific examples that demonstrate correct behavior
- Use unit tests for edge cases that are hard to generate randomly

**Property Test Generators**:
- Create custom generators for domain objects (loans, investments, users)
- Ensure generated data respects business constraints
- Use shrinking to find minimal failing examples

**Test Data Management**:
- Use database transactions for test isolation
- Clean up test data after each test
- Use factories for creating test objects with sensible defaults
