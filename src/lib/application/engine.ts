import { ApplicationSession, ApplicationStep } from './types'
import { APPLICATION_STEPS, getStepById, getNextStep } from './steps'
import { createClient } from '@supabase/supabase-js'
import { getLoanProduct, LoanProductType } from './products'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spznjpzxpssxvgcksgxh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwem5qcHp4cHNzeHZnY2tzZ3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjAwMDYsImV4cCI6MjA4NTUzNjAwNn0.O07nASkFwl-xST_Ujz5MuJTuGIZzxJSH0PzHtumbxu4'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class ApplicationEngine {
  private sessions: Map<string, ApplicationSession> = new Map()

  // Start a new application session
  startApplication(initialData?: Record<string, any>, productType?: string): ApplicationSession {
    const sessionId = this.generateSessionId()
    const product = getLoanProduct(productType || null)
    
    const session: ApplicationSession = {
      id: sessionId,
      currentStep: 'welcome',
      completedSteps: [],
      formData: {
        ...initialData,
        productType: product.id
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    }

    this.sessions.set(sessionId, session)
    return session
  }

  // Get current session
  getSession(sessionId: string): ApplicationSession | null {
    return this.sessions.get(sessionId) || null
  }

  // Get current step for a session
  getCurrentStep(sessionId: string): ApplicationStep | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    const stepId = session.currentStep
    
    // Handle dynamic loan_details step
    if (stepId === 'loan_details') {
      const { getLoanDetailsStep } = require('./steps')
      const productType = session.formData.productType as LoanProductType
      return getLoanDetailsStep(productType)
    }

    return getStepById(session.currentStep) || null
  }

  // Save step data and move to next step
  saveStepData(sessionId: string, stepData: Record<string, any>): ApplicationSession | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    // Update form data
    session.formData = { ...session.formData, ...stepData }
    session.updatedAt = new Date()

    // Mark current step as completed
    if (!session.completedSteps.includes(session.currentStep)) {
      session.completedSteps.push(session.currentStep)
    }

    // Update session status
    if (session.status === 'draft') {
      session.status = 'in_progress'
    }

    this.sessions.set(sessionId, session)
    return session
  }

  // Check if step is required for current product
  isStepRequired(sessionId: string, stepId: string): boolean {
    const session = this.getSession(sessionId)
    if (!session) return true // Default to required if no session
    
    const productType = session.formData.productType as LoanProductType
    if (!productType) return true // Default to required if no product type
    
    const product = getLoanProduct(productType)
    return product.requiredSteps.includes(stepId)
  }

  // Move to next step
  moveToNextStep(sessionId: string): ApplicationSession | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    let nextStepId = getNextStep(session.currentStep, session.formData)
    
    // Skip steps not required for this product
    while (nextStepId && !this.isStepRequired(sessionId, nextStepId)) {
      const tempNextStepId = getNextStep(nextStepId, session.formData)
      if (tempNextStepId === nextStepId) break // Prevent infinite loop
      nextStepId = tempNextStepId
    }
    
    if (nextStepId) {
      session.currentStep = nextStepId
      session.updatedAt = new Date()
      this.sessions.set(sessionId, session)
    } else {
      // No next step, mark as completed
      session.status = 'completed'
      session.updatedAt = new Date()
      this.sessions.set(sessionId, session)
    }

    return session
  }

  // Move to previous step
  moveToPreviousStep(sessionId: string): ApplicationSession | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    const currentStepIndex = APPLICATION_STEPS.findIndex(step => step.id === session.currentStep)
    
    // Find previous required step
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      const stepId = APPLICATION_STEPS[i].id
      if (this.isStepRequired(sessionId, stepId)) {
        session.currentStep = stepId
        session.updatedAt = new Date()
        this.sessions.set(sessionId, session)
        break
      }
    }

    return session
  }

  // Submit application
  async submitApplication(sessionId: string, userId?: string): Promise<ApplicationSession | null> {
    const session = this.getSession(sessionId)
    if (!session) return null

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      const actualUserId = userId || user?.id

      if (!actualUserId) {
        throw new Error('User must be logged in to submit application')
      }

      // Save application to Supabase with user_id
      const { data: application, error: appError } = await supabase
        .from('applications')
        .insert({
          user_id: actualUserId,
          status: 'submitted',
          loan_amount: session.formData.loanAmount,
          loan_purpose: session.formData.loanPurpose,
          business_info: {
            businessName: session.formData.businessName,
            taxId: session.formData.taxId,
            businessType: session.formData.businessType,
            yearsInBusiness: session.formData.yearsInBusiness,
            industry: session.formData.industry,
            streetAddress: session.formData.streetAddress,
            city: session.formData.city,
            state: session.formData.state,
            zipCode: session.formData.zipCode
          },
          financial_info: {
            annualRevenue: session.formData.annualRevenue,
            monthlyRevenue: session.formData.monthlyRevenue,
            monthlyExpenses: session.formData.monthlyExpenses,
            existingDebt: session.formData.existingDebt,
            bankName: session.formData.bankName,
            accountType: session.formData.accountType,
            averageBalance: session.formData.averageBalance
          },
          contact_info: {
            firstName: session.formData.firstName || '',
            lastName: session.formData.lastName || '',
            email: session.formData.email || session.formData.accountEmail || '',
            phone: session.formData.phone || '',
            title: session.formData.title || ''
          },
          step_data: session.formData,
          current_step: 'review'
        })
        .select()
        .single()

      if (appError) {
        console.error('Error saving application:', appError)
        throw new Error('Failed to save application')
      }

      // Update session status
      session.status = 'submitted'
      session.updatedAt = new Date()
      this.sessions.set(sessionId, session)

      console.log('Application submitted successfully to Supabase:', application)
      return session

    } catch (error) {
      console.error('Submission error:', error)
      throw error
    }
  }

  // Get application progress
  getProgress(sessionId: string): { current: number; total: number; percentage: number } {
    const session = this.getSession(sessionId)
    if (!session) return { current: 0, total: APPLICATION_STEPS.length, percentage: 0 }

    const current = session.completedSteps.length
    const total = APPLICATION_STEPS.length
    const percentage = Math.round((current / total) * 100)

    return { current, total, percentage }
  }

  // Validate step data
  validateStepData(stepId: string, data: Record<string, any>, sessionId?: string): { isValid: boolean; errors: Record<string, string> } {
    let step: ApplicationStep | undefined
    
    // Handle dynamic loan_details step
    if (stepId === 'loan_details' && sessionId) {
      const session = this.getSession(sessionId)
      if (session) {
        const { getLoanDetailsStep } = require('./steps')
        const productType = session.formData.productType as LoanProductType
        step = getLoanDetailsStep(productType)
      } else {
        step = getStepById(stepId)
      }
    } else {
      step = getStepById(stepId)
    }
    
    if (!step) return { isValid: false, errors: { general: 'Invalid step' } }

    const errors: Record<string, string> = {}

    for (const field of step.fields) {
      const value = data[field.name]

      // Check required fields
      if (field.required && (!value || value === '')) {
        errors[field.name] = `${field.label} is required`
        continue
      }

      // Skip validation if field is empty and not required
      if (!value && !field.required) continue

      // Run field validations
      if (field.validation) {
        for (const rule of field.validation) {
          const error = this.validateField(value, rule)
          if (error) {
            errors[field.name] = error
            break
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  private validateField(value: any, rule: any): string | null {
    switch (rule.type) {
      case 'required':
        return (!value || value === '') ? rule.message : null
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? rule.message : null
      
      case 'min':
        return Number(value) < rule.value ? rule.message : null
      
      case 'max':
        return Number(value) > rule.value ? rule.message : null
      
      case 'pattern':
        const regex = new RegExp(rule.value)
        return !regex.test(value) ? rule.message : null
      
      default:
        return null
    }
  }

  private generateSessionId(): string {
    return 'app_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now()
  }

  // Get all sessions (for demo purposes)
  getAllSessions(): ApplicationSession[] {
    return Array.from(this.sessions.values())
  }

  // Clear all sessions (for demo purposes)
  clearAllSessions(): void {
    this.sessions.clear()
  }
}

// Singleton instance for demo - Updated at 2024-12-28 to fix submission issue
export const applicationEngine = new ApplicationEngine()