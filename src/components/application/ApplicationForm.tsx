'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicationEngine, applicationEngine } from '@/lib/application/engine'
import { ApplicationSession, ApplicationStep, FormField } from '@/lib/application/types'
import FormFieldComponent from './FormField'
import ProgressBar from './ProgressBar'

interface ApplicationFormProps {
  sessionId?: string
  onComplete?: (session: ApplicationSession) => void
}

export default function ApplicationForm({ sessionId, onComplete }: ApplicationFormProps) {
  const [session, setSession] = useState<ApplicationSession | null>(null)
  const [currentStep, setCurrentStep] = useState<ApplicationStep | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Initialize or load session
    if (sessionId) {
      const existingSession = applicationEngine.getSession(sessionId)
      if (existingSession) {
        setSession(existingSession)
        setFormData(existingSession.formData)
        const step = applicationEngine.getCurrentStep(sessionId)
        setCurrentStep(step)
      }
    } else {
      // Start new session
      const newSession = applicationEngine.startApplication()
      setSession(newSession)
      const step = applicationEngine.getCurrentStep(newSession.id)
      setCurrentStep(step)
    }
  }, [sessionId])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSaveAndExit = () => {
    if (!session) {
      router.push('/')
      return
    }

    // Save current form data
    if (Object.keys(formData).length > 0) {
      applicationEngine.saveStepData(session.id, formData)
    }

    // Show confirmation and redirect
    alert('Your progress has been saved. You can return to complete your application later.')
    router.push('/')
  }

  const handleNext = async () => {
    if (!session || !currentStep) return

    setIsLoading(true)

    // Validate current step
    const validation = applicationEngine.validateStepData(currentStep.id, formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsLoading(false)
      return
    }

    // Save step data
    const updatedSession = applicationEngine.saveStepData(session.id, formData)
    if (!updatedSession) {
      setIsLoading(false)
      return
    }

    // Move to next step
    const nextSession = applicationEngine.moveToNextStep(session.id)
    if (!nextSession) {
      setIsLoading(false)
      return
    }

    setSession(nextSession)

    if (nextSession.status === 'completed') {
      // Application completed
      if (onComplete) {
        onComplete(nextSession)
      }
    } else {
      // Load next step
      const nextStep = applicationEngine.getCurrentStep(nextSession.id)
      setCurrentStep(nextStep)
    }

    setIsLoading(false)
  }

  const handlePrevious = () => {
    if (!session) return

    const updatedSession = applicationEngine.moveToPreviousStep(session.id)
    if (updatedSession) {
      setSession(updatedSession)
      const step = applicationEngine.getCurrentStep(updatedSession.id)
      setCurrentStep(step)
    }
  }

  const handleSubmit = async () => {
    if (!session || !currentStep) return

    setIsLoading(true)
    
    try {
      // First validate and save the current step data (review step)
      const validation = applicationEngine.validateStepData(currentStep.id, formData)
      
      if (!validation.isValid) {
        setErrors(validation.errors)
        setIsLoading(false)
        return
      }

      // Save the review step data
      applicationEngine.saveStepData(session.id, formData)

      // Now submit the application (this is now async)
      const submittedSession = await applicationEngine.submitApplication(session.id)
      if (submittedSession && onComplete) {
        onComplete(submittedSession)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Error submitting application. Please try again. (Updated)')
    }
    
    setIsLoading(false)
  }

  if (!session || !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const progress = applicationEngine.getProgress(session.id)
  const isLastStep = currentStep.id === 'review'
  const canGoBack = session.completedSteps.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Application Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                Commercial Lending Platform
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Need help? Call (555) 123-4567
              </span>
              <button
                onClick={handleSaveAndExit}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Loan Application</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{currentStep.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Progress Bar */}
        <ProgressBar 
          current={progress.current} 
          total={progress.total} 
          percentage={progress.percentage} 
        />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep.title}
            </h2>
            <p className="text-gray-600">
              {currentStep.description}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {currentStep.fields.map((field) => (
              <FormFieldComponent
                key={field.id}
                field={field}
                value={formData[field.name] || ''}
                onChange={(value) => handleFieldChange(field.name, value)}
                error={errors[field.name]}
              />
            ))}
          </div>

          {/* Review Section for Last Step */}
          {isLastStep && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Application Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Business:</strong> {formData.businessName}
                </div>
                <div>
                  <strong>Industry:</strong> {formData.industry}
                </div>
                <div>
                  <strong>Loan Amount:</strong> ${Number(formData.loanAmount || 0).toLocaleString()}
                </div>
                <div>
                  <strong>Purpose:</strong> {formData.loanPurpose?.replace('_', ' ')}
                </div>
                <div>
                  <strong>Term:</strong> {formData.loanTerm} months
                </div>
                <div>
                  <strong>Annual Revenue:</strong> ${Number(formData.annualRevenue || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={!canGoBack || isLoading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}