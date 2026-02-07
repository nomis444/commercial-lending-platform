/**
 * Loan funding service
 * Handles loan funding operations including setting origination date and generating payment schedules
 */

import { createClient } from '@/lib/supabase/client'
import { calculateAmortizationSchedule } from './amortization'

export interface FundLoanInput {
  loanId: string
  principalAmount: number
  interestRate: number  // As decimal (0.25 = 25%)
  termMonths: number
}

export interface FundLoanResult {
  success: boolean
  loanId: string
  originationDate: Date
  paymentsCreated: number
  error?: string
}

/**
 * Fund a loan by setting origination date and generating payment schedule
 */
export async function fundLoan(input: FundLoanInput): Promise<FundLoanResult> {
  const supabase = createClient()
  
  try {
    const originationDate = new Date()
    
    // Calculate amortization schedule
    const schedule = calculateAmortizationSchedule({
      principalAmount: input.principalAmount,
      annualInterestRate: input.interestRate,
      termMonths: input.termMonths,
      originationDate
    })
    
    // Calculate monthly payment and total amount
    const monthlyPayment = schedule[0]?.paymentAmount || 0
    const totalAmount = monthlyPayment * input.termMonths
    
    // Update loan with origination date, monthly payment, and total amount
    const { error: loanUpdateError } = await supabase
      .from('loans')
      .update({
        origination_date: originationDate.toISOString(),
        monthly_payment: monthlyPayment,
        total_amount: totalAmount,
        status: 'active'
      })
      .eq('id', input.loanId)
    
    if (loanUpdateError) {
      console.error('Error updating loan:', loanUpdateError)
      throw new Error(`Failed to update loan: ${loanUpdateError.message}`)
    }
    
    // Insert payment records into loan_payments table
    const paymentRecords = schedule.map(payment => ({
      loan_id: input.loanId,
      payment_number: payment.paymentNumber,
      due_date: payment.dueDate.toISOString(),
      amount: payment.paymentAmount,
      principal_portion: payment.principalPortion,
      interest_portion: payment.interestPortion,
      remaining_balance: payment.remainingBalance,
      status: 'pending'
    }))
    
    const { error: paymentsError } = await supabase
      .from('loan_payments')
      .insert(paymentRecords)
    
    if (paymentsError) {
      console.error('Error inserting payment records:', paymentsError)
      throw new Error(`Failed to create payment schedule: ${paymentsError.message}`)
    }
    
    return {
      success: true,
      loanId: input.loanId,
      originationDate,
      paymentsCreated: schedule.length
    }
    
  } catch (error) {
    console.error('Error funding loan:', error)
    return {
      success: false,
      loanId: input.loanId,
      originationDate: new Date(),
      paymentsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get loan details including payment schedule
 */
export async function getLoanWithPayments(loanId: string) {
  const supabase = createClient()
  
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single()
  
  if (loanError) {
    throw new Error(`Failed to fetch loan: ${loanError.message}`)
  }
  
  const { data: payments, error: paymentsError } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('payment_number', { ascending: true })
  
  if (paymentsError) {
    throw new Error(`Failed to fetch payments: ${paymentsError.message}`)
  }
  
  return {
    loan,
    payments: payments || []
  }
}

/**
 * Check if a loan has been funded (has origination date and payment schedule)
 */
export async function isLoanFunded(loanId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: loan, error } = await supabase
    .from('loans')
    .select('origination_date')
    .eq('id', loanId)
    .single()
  
  if (error) {
    console.error('Error checking loan funding status:', error)
    return false
  }
  
  return loan?.origination_date !== null
}
