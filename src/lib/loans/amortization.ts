/**
 * Amortization calculator for loan payment schedules
 * Uses standard amortization formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */

export interface AmortizationInput {
  principalAmount: number
  annualInterestRate: number  // As decimal (0.25 = 25%)
  termMonths: number
  originationDate: Date
}

export interface AmortizationPayment {
  paymentNumber: number
  dueDate: Date
  paymentAmount: number
  principalPortion: number
  interestPortion: number
  remainingBalance: number
}

/**
 * Calculate monthly payment using standard amortization formula
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  numPayments: number
): number {
  if (monthlyRate === 0) {
    // If no interest, just divide principal by number of payments
    return principal / numPayments
  }
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numPayments)
  const denominator = Math.pow(1 + monthlyRate, numPayments) - 1
  
  return principal * (numerator / denominator)
}

/**
 * Calculate the breakdown of a single payment into principal and interest
 */
export function calculatePaymentBreakdown(
  remainingBalance: number,
  monthlyPayment: number,
  monthlyRate: number
): { principal: number; interest: number } {
  const interestPortion = remainingBalance * monthlyRate
  const principalPortion = monthlyPayment - interestPortion
  
  return {
    principal: Math.max(0, principalPortion),
    interest: Math.max(0, interestPortion)
  }
}

/**
 * Add months to a date, handling month-end edge cases
 */
export function addMonthsToDate(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Generate complete amortization schedule
 * First payment is due 30 days from origination date
 */
export function calculateAmortizationSchedule(
  input: AmortizationInput
): AmortizationPayment[] {
  const { principalAmount, annualInterestRate, termMonths, originationDate } = input
  
  // Calculate monthly rate
  const monthlyRate = annualInterestRate / 12
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    principalAmount,
    monthlyRate,
    termMonths
  )
  
  // Generate payment schedule
  const schedule: AmortizationPayment[] = []
  let remainingBalance = principalAmount
  
  // First payment is due 30 days from origination
  const firstPaymentDate = new Date(originationDate)
  firstPaymentDate.setDate(firstPaymentDate.getDate() + 30)
  
  for (let i = 1; i <= termMonths; i++) {
    // Calculate due date (first payment + (i-1) months)
    const dueDate = addMonthsToDate(firstPaymentDate, i - 1)
    
    // Calculate payment breakdown
    const breakdown = calculatePaymentBreakdown(
      remainingBalance,
      monthlyPayment,
      monthlyRate
    )
    
    // For the last payment, adjust to pay off remaining balance exactly
    let paymentAmount = monthlyPayment
    let principalPortion = breakdown.principal
    
    if (i === termMonths) {
      // Last payment: pay off remaining balance
      paymentAmount = remainingBalance + breakdown.interest
      principalPortion = remainingBalance
    }
    
    // Update remaining balance
    remainingBalance = Math.max(0, remainingBalance - principalPortion)
    
    schedule.push({
      paymentNumber: i,
      dueDate,
      paymentAmount: Math.round(paymentAmount * 100) / 100,
      principalPortion: Math.round(principalPortion * 100) / 100,
      interestPortion: Math.round(breakdown.interest * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100
    })
  }
  
  return schedule
}

/**
 * Calculate total amount to be repaid (principal + all interest)
 */
export function calculateTotalAmount(
  principal: number,
  monthlyPayment: number,
  termMonths: number
): number {
  return Math.round(monthlyPayment * termMonths * 100) / 100
}
