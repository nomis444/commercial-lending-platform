'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ApplicationForm from '@/components/application/ApplicationForm'
import { ApplicationSession } from '@/lib/application/types'
import { createClient } from '@/lib/supabase/client'
import { getLoanProduct } from '@/lib/application/products'
import type { User } from '@supabase/supabase-js'

function ApplyPageContent() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedSession, setCompletedSession] = useState<ApplicationSession | null>(null)
  const [productType, setProductType] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get product type from URL parameter
    const product = searchParams.get('product')
    setProductType(product)
    
    // Check user
    checkUser()
  }, [searchParams])

  async function checkUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleApplicationComplete = (session: ApplicationSession) => {
    setCompletedSession(session)
    setIsCompleted(true)
  }

  const handleViewDashboard = () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with a message
      router.push('/login?message=Please log in to view your dashboard')
    } else {
      // Redirect based on user role
      const userRole = user.user_metadata?.role || 'borrower'
      switch (userRole) {
        case 'investor':
          router.push('/investor')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          router.push('/customer')
      }
    }
  }

  if (isCompleted && completedSession) {
    const product = getLoanProduct(completedSession.formData.productType)
    
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Please verify your email address
                  </p>
                  <p className="text-sm text-yellow-700">
                    We've sent a verification email to <strong>{completedSession.formData.accountEmail}</strong>. 
                    Please check your inbox and click the verification link before accessing your dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Thank you for your {product.name} loan application. We've received your information and will begin processing it immediately.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <p><strong>Application ID:</strong> {completedSession.id}</p>
                <p><strong>Product:</strong> {product.name}</p>
                <p><strong>Submitted:</strong> {completedSession.updatedAt.toLocaleString()}</p>
                <p><strong>Loan Amount:</strong> ${Number(completedSession.formData.loanAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <div className="text-left space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
                  <span>We'll review your application and documents within 24 hours</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
                  <span>Our underwriting team will verify your information</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
                  <span>You'll receive a loan decision within 2-3 business days</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
                  <span>If approved, your loan will be available for investor funding</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-x-4">
              <button
                onClick={handleViewDashboard}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const product = productType ? getLoanProduct(productType) : null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product ? `${product.name} Loan Application` : 'Commercial Loan Application'}
          </h1>
          <p className="text-lg text-gray-600">
            Complete your application in just a few simple steps. We'll guide you through the process.
          </p>
          {product && (
            <div className="mt-4 inline-block bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Loan Range:</strong> ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <ApplicationForm onComplete={handleApplicationComplete} productType={productType} />
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  )
}