import { ApplicationSession, ApplicationStep } from './types'
import { APPLICATION_STEPS, getStepById, getNextStep } from './steps'

export class ApplicationEngine {
  private sessions: Map<string, ApplicationSession> = new Map()

  // Start a new application session
  startApplication(initialData?: Record<string, any>): ApplicationSession {
    const sessionId = this.generateSessionId()
    const session: ApplicationSession = {
      id: sessionId,
      currentStep: 'welcome',
      completedSteps: [],
      formData: initialData || {},
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

  // Move to next step
  moveToNextStep(sessionId: string): ApplicationSession | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    const nextStepId = getNextStep(session.currentStep, session.formData)
    
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
    if (currentStepIndex > 0) {
      session.currentStep = APPLICATION_STEPS[currentStepIndex - 1].id
      session.updatedAt = new Date()
      this.sessions.set(sessionId, session)
    }

    return session
  }

  // Submit application
  submitApplication(sessionId: string): ApplicationSession | null {
    const session = this.getSession(sessionId)
    if (!session) return null

    // Simple approach: just allow submission and mark as submitted
    // The UI should only show the submit button on the review step anyway
    session.status = 'submitted'
    session.updatedAt = new Date()
    this.sessions.set(sessionId, session)

    console.log('Application submitted successfully:', session)
    return session
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
  validateStepData(stepId: string, data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
    const step = getStepById(stepId)
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