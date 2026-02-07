import { createClient } from '@/lib/supabase/client'

export interface Investment {
  id: string
  application_id: string
  investor_id: string
  amount: number
  percentage: number
  status: string
  created_at: string
  updated_at: string
}

export interface InvestmentWithDetails extends Investment {
  applications: {
    id: string
    loan_amount: number
    loan_purpose: string
    business_info: any
    status: string
    funded_amount: number
    funding_status: string
  }
}

export interface CreateInvestmentParams {
  applicationId: string
  investorId: string
  amount: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate an investment before creation
 */
export async function validateInvestment(
  amount: number,
  loanAmount: number,
  fundedAmount: number,
  applicationStatus: string
): Promise<ValidationResult> {
  const errors: string[] = []
  
  // Check minimum investment
  if (amount < 1000) {
    errors.push('Investment amount must be at least $1,000')
  }
  
  // Check maximum investment
  const remainingAmount = loanAmount - fundedAmount
  if (amount > remainingAmount) {
    errors.push(`Investment amount cannot exceed remaining loan amount of $${remainingAmount.toLocaleString()}`)
  }
  
  // Check application status
  if (applicationStatus !== 'approved') {
    errors.push('Can only invest in approved loans')
  }
  
  // Check if already fully funded
  if (fundedAmount >= loanAmount) {
    errors.push('This loan is already fully funded')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Create an investment and update funding status
 */
export async function createInvestment(params: CreateInvestmentParams): Promise<Investment | null> {
  try {
    const supabase = createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('You must be logged in to invest')
    }
    
    // Verify investor_id matches authenticated user
    if (user.id !== params.investorId) {
      throw new Error('Cannot create investment for another user')
    }
    
    // Get application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('loan_amount, status, funded_amount, funding_status')
      .eq('id', params.applicationId)
      .single()
    
    if (appError || !application) {
      console.error('Error fetching application:', appError)
      throw new Error('Loan not found')
    }
    
    // Validate investment
    const validation = await validateInvestment(
      params.amount,
      application.loan_amount,
      application.funded_amount || 0,
      application.status
    )
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }
    
    // Calculate percentage
    const percentage = (params.amount / application.loan_amount) * 100
    
    // Create investment record
    const { data: investment, error: investError } = await supabase
      .from('application_investments')
      .insert({
        application_id: params.applicationId,
        investor_id: params.investorId,
        amount: params.amount,
        percentage: percentage,
        status: 'active'
      })
      .select()
      .single()
    
    if (investError) {
      console.error('Error creating investment:', investError)
      throw new Error('Failed to create investment')
    }
    
    // Update application funding
    const newFundedAmount = (application.funded_amount || 0) + params.amount
    const newFundingPercentage = (newFundedAmount / application.loan_amount) * 100
    const newFundingStatus = newFundingPercentage >= 100 ? 'fully_funded' : 
                            newFundingPercentage > 0 ? 'partially_funded' : 'unfunded'
    const newApplicationStatus = newFundingPercentage >= 100 ? 'funded' : application.status
    
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        funded_amount: newFundedAmount,
        funding_status: newFundingStatus,
        status: newApplicationStatus
      })
      .eq('id', params.applicationId)
    
    if (updateError) {
      console.error('Error updating application funding:', updateError)
      // Try to rollback investment
      await supabase
        .from('application_investments')
        .delete()
        .eq('id', investment.id)
      throw new Error('Failed to update loan funding')
    }
    
    return investment
  } catch (error: any) {
    console.error('Investment creation failed:', error)
    throw error
  }
}

/**
 * Get all investments for an investor
 */
export async function getInvestorPortfolio(investorId: string): Promise<InvestmentWithDetails[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('application_investments')
      .select(`
        *,
        applications (
          id,
          loan_amount,
          loan_purpose,
          business_info,
          status,
          funded_amount,
          funding_status
        )
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching portfolio:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return []
  }
}

/**
 * Get all investments for an application
 */
export async function getApplicationInvestments(applicationId: string): Promise<Investment[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('application_investments')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching investments:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching investments:', error)
    return []
  }
}

/**
 * Calculate total invested amount for an investor
 */
export function calculateTotalInvested(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.amount, 0)
}
