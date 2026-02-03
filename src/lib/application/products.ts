// Loan Product Definitions and Calculations

export type LoanProductType = 'instant' | 'standard' | 'premium'

export interface LoanProduct {
  id: LoanProductType
  name: string
  minAmount: number
  maxAmount: number
  baseRate: number // Starting APR as decimal (0.25 = 25%)
  termOptions: number[] // Available terms in months
  requiredSteps: string[] // Which application steps are required
  features: string[]
}

export const LOAN_PRODUCTS: Record<LoanProductType, LoanProduct> = {
  instant: {
    id: 'instant',
    name: 'Instant Approval',
    minAmount: 5000,
    maxAmount: 8000,
    baseRate: 0.25, // 25% APR
    termOptions: [12, 24],
    requiredSteps: ['welcome', 'business_info', 'loan_details', 'banking_info', 'review', 'create_account'],
    features: [
      'Instant approval decision',
      'Minimal documentation',
      'Funding in 24-48 hours',
      'Starting at 25% APR'
    ]
  },
  standard: {
    id: 'standard',
    name: 'Standard Business',
    minAmount: 10000,
    maxAmount: 50000,
    baseRate: 0.25, // 25% APR
    termOptions: [12, 24, 36, 48],
    requiredSteps: ['welcome', 'business_info', 'loan_details', 'financial_info', 'banking_info', 'documents', 'review', 'create_account'],
    features: [
      'Competitive rates',
      'Flexible repayment terms',
      'Full application review',
      'Starting at 25% APR'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Business',
    minAmount: 55000,
    maxAmount: 200000,
    baseRate: 0.25, // 25% APR
    termOptions: [12, 24, 36, 48, 60],
    requiredSteps: ['welcome', 'business_info', 'loan_details', 'financial_info', 'banking_info', 'documents', 'review', 'create_account'],
    features: [
      'Largest loan amounts',
      'Extended repayment options',
      'Dedicated account manager',
      'Starting at 25% APR'
    ]
  }
}

/**
 * Calculate APR based on loan term
 * Longer terms = higher rates
 */
export function calculateAPR(productType: LoanProductType, termMonths: number): number {
  const product = LOAN_PRODUCTS[productType]
  const baseRate = product.baseRate
  
  // Rate increases with term length
  // 12 months: base rate (25%)
  // 24 months: +2% (27%)
  // 36 months: +4% (29%)
  // 48 months: +6% (31%)
  // 60 months: +8% (33%)
  
  const termMultiplier = {
    12: 0,
    24: 0.02,
    36: 0.04,
    48: 0.06,
    60: 0.08
  }
  
  const adjustment = termMultiplier[termMonths as keyof typeof termMultiplier] || 0
  return baseRate + adjustment
}

/**
 * Calculate monthly payment using standard loan formula
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 * Where:
 * M = Monthly payment
 * P = Principal (loan amount)
 * r = Monthly interest rate (APR / 12)
 * n = Number of payments (term in months)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  termMonths: number,
  annualRate: number
): number {
  const principal = loanAmount
  const monthlyRate = annualRate / 12
  const numPayments = termMonths
  
  // Handle edge case of 0% interest
  if (monthlyRate === 0) {
    return principal / numPayments
  }
  
  const monthlyPayment = 
    principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  return Math.round(monthlyPayment * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  loanAmount: number,
  monthlyPayment: number,
  termMonths: number
): number {
  const totalPaid = monthlyPayment * termMonths
  const totalInterest = totalPaid - loanAmount
  return Math.round(totalInterest * 100) / 100
}

/**
 * Get loan product by type
 */
export function getLoanProduct(productType: string | null): LoanProduct {
  if (!productType || !(productType in LOAN_PRODUCTS)) {
    return LOAN_PRODUCTS.standard // Default to standard
  }
  return LOAN_PRODUCTS[productType as LoanProductType]
}

/**
 * Validate loan amount for product
 */
export function validateLoanAmount(
  amount: number,
  productType: LoanProductType
): { isValid: boolean; error?: string } {
  const product = LOAN_PRODUCTS[productType]
  
  if (amount < product.minAmount) {
    return {
      isValid: false,
      error: `Minimum loan amount for ${product.name} is $${product.minAmount.toLocaleString()}`
    }
  }
  
  if (amount > product.maxAmount) {
    return {
      isValid: false,
      error: `Maximum loan amount for ${product.name} is $${product.maxAmount.toLocaleString()}`
    }
  }
  
  return { isValid: true }
}

/**
 * Get payment details for display
 */
export interface PaymentDetails {
  loanAmount: number
  termMonths: number
  apr: number
  aprPercentage: string
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
}

export function getPaymentDetails(
  loanAmount: number,
  termMonths: number,
  productType: LoanProductType
): PaymentDetails {
  const apr = calculateAPR(productType, termMonths)
  const monthlyPayment = calculateMonthlyPayment(loanAmount, termMonths, apr)
  const totalInterest = calculateTotalInterest(loanAmount, monthlyPayment, termMonths)
  const totalPayment = monthlyPayment * termMonths
  
  return {
    loanAmount,
    termMonths,
    apr,
    aprPercentage: `${(apr * 100).toFixed(2)}%`,
    monthlyPayment,
    totalInterest,
    totalPayment
  }
}
