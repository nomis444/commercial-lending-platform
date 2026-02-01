export interface ApplicationStep {
  id: string
  title: string
  description: string
  fields: FormField[]
  isRequired: boolean
  nextStepId?: string
  conditionalLogic?: ConditionalLogic[]
}

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio'
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: ValidationRule[]
  helpText?: string
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern'
  value?: any
  message: string
}

export interface ConditionalLogic {
  condition: {
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
    value: any
  }
  action: 'show_step' | 'hide_step' | 'require_field' | 'skip_step'
  target: string
}

export interface ApplicationSession {
  id: string
  currentStep: string
  completedSteps: string[]
  formData: Record<string, any>
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'in_progress' | 'completed' | 'submitted'
}

export interface ApplicationData {
  // Basic Info
  businessName: string
  businessType: string
  yearsInBusiness: number
  industry: string
  
  // Contact Info
  contactName: string
  contactEmail: string
  contactPhone: string
  businessAddress: string
  
  // Loan Details
  loanAmount: number
  loanPurpose: string
  loanTerm: number
  
  // Financial Info
  annualRevenue: number
  monthlyRevenue: number
  monthlyExpenses: number
  existingDebt: number
  
  // Banking Info
  bankName: string
  accountType: string
  averageBalance: number
  
  // Documents
  documents: UploadedDocument[]
}

export interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'pending' | 'verified' | 'rejected'
}