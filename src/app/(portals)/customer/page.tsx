'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, formatPercentage, formatShortDate } from '@/lib/utils/formatting'
import { LOAN_PRODUCTS, type LoanProductType } from '@/lib/application/products'
import type { User } from '@supabase/supabase-js'
import DocumentsList from '@/components/DocumentsList'

interface Application {
  id: string
  user_id: string
  status: string
  loan_amount: number
  loan_purpose: string
  business_info: any
  financial_info: any
  contact_info: any
  step_data: any
  created_at: string
}

interface Loan {
  id: string
  application_id: string
  principal_amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number
  total_amount: number
  status: string
  origination_date: string | null
  created_at: string
}

interface PaymentRecord {
  id: string
  loan_id: string
  payment_number: number
  due_date: string
  amount: number
  principal_portion: number
  interest_portion: number
  remaining_balance: number
  status: string
  paid_date: string | null
}

interface Document {
  id: string
  application_id: string
  file_name: string
  file_type: string
  file_size: number
  verification_status: string
  uploaded_at: string
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndFetchData()
  }, [])

  async function checkUserAndFetchData() {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/login'
      return
    }

    const role = user.user_metadata?.role || 'borrower'
    // Allow borrowers and admins to access customer portal
    if (role !== 'borrower' && role !== 'admin') {
      window.location.href = '/login'
      return
    }

    setUser(user)
    await fetchApplications(user.id)
  }

  async function fetchApplications(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setApplications(data)
      
      // Fetch loans for funded applications
      const fundedAppIds = data.filter(app => app.status === 'funded' || app.status === 'active').map(app => app.id)
      if (fundedAppIds.length > 0) {
        const { data: loansData } = await supabase
          .from('loans')
          .select('*')
          .in('application_id', fundedAppIds)
        
        if (loansData) {
          setLoans(loansData)
          
          // Fetch payment schedules for all loans
          const loanIds = loansData.map(loan => loan.id)
          if (loanIds.length > 0) {
            const { data: paymentsData } = await supabase
              .from('loan_payments')
              .select('*')
              .in('loan_id', loanIds)
              .order('payment_number', { ascending: true })
            
            if (paymentsData) {
              setPayments(paymentsData)
            }
          }
        }
      }
    }
    
    // Fetch documents for all applications
    if (data && data.length > 0) {
      const appIds = data.map(app => app.id)
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .in('application_id', appIds)
        .order('uploaded_at', { ascending: false })
      
      if (docs) {
        setDocuments(docs)
      }
    }
    
    setLoading(false)
  }

  function getProductName(app: Application): string {
    const productType = app.step_data?.productType as LoanProductType | undefined
    if (productType && LOAN_PRODUCTS[productType]) {
      return LOAN_PRODUCTS[productType].name
    }
    return 'Business Loan'
  }

  function getLoanForApplication(applicationId: string): Loan | undefined {
    return loans.find(loan => loan.application_id === applicationId)
  }

  function getPaymentsForLoan(loanId: string): PaymentRecord[] {
    return payments.filter(payment => payment.loan_id === loanId)
  }

  function calculateNextPayment(loanId: string): PaymentRecord | null {
    const loanPayments = getPaymentsForLoan(loanId)
    return loanPayments.find(p => p.status === 'pending') || null
  }

  function calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>, applicationId?: string) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const supabase = createClient()
      
      // If no application ID provided, use the most recent one
      const targetAppId = applicationId || applications[0]?.id
      
      if (!targetAppId) {
        setUploadError('No application found. Please create an application first.')
        setUploading(false)
        return
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${targetAppId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          application_id: targetAppId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          verification_status: 'pending'
        })

      if (dbError) throw dbError

      // Refresh documents
      if (user) {
        await fetchApplications(user.id)
      }

      alert('Document uploaded successfully!')
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  const renderOverview = () => {
    const totalBorrowed = applications.reduce((sum, app) => sum + (app.loan_amount || 0), 0)
    const activeLoans = applications.filter(app => app.status === 'funded' || app.status === 'active').length
    const pendingApplications = applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
    
    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBorrowed)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{activeLoans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Recent Applications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No applications found.</p>
                <a 
                  href="/apply"
                  className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Apply for Your First Loan
                </a>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-gray-900">
                          {app.business_info?.businessName || 'Business Loan Application'}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {getProductName(app)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(app.loan_amount || 0)} • {app.loan_purpose || 'General Business'} • Applied {formatDate(app.created_at)}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600">
                          Industry: {app.business_info?.industry || 'N/A'}
                        </span>
                        {app.financial_info?.annualRevenue && (
                          <span className="text-sm text-gray-600">
                            Revenue: {formatCurrency(app.financial_info.annualRevenue)}
                          </span>
                        )}
                        {app.step_data?.loanTerm && (
                          <span className="text-sm text-gray-600">
                            Term: {app.step_data.loanTerm} months
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="/apply"
                className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center block"
              >
                <div className="text-xl font-bold">Apply for New Loan</div>
                <div className="text-sm">Start a new application</div>
              </a>
              <label className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e)}
                  disabled={uploading || applications.length === 0}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="text-xl font-bold">
                  {uploading ? 'Uploading...' : 'Upload Documents'}
                </div>
                <div className="text-sm">Add supporting documents</div>
              </label>
              <button 
                onClick={() => setActiveTab('documents')}
                className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
              >
                <div className="text-xl font-bold">View Documents</div>
                <div className="text-sm">Manage your uploaded files</div>
              </button>
            </div>
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderLoans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <a 
          href="/apply"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Apply for New Loan
        </a>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
            <p>No applications found.</p>
            <a 
              href="/apply"
              className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Apply for Your First Loan
            </a>
          </div>
        ) : (
          applications.map((app) => {
            const appDocs = documents.filter(doc => doc.application_id === app.id)
            const loan = getLoanForApplication(app.id)
            const isFunded = loan && loan.origination_date !== null
            
            return (
              <div key={app.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {app.business_info?.businessName || 'Business Loan Application'}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {getProductName(app)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Applied {formatDate(app.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(app.loan_amount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purpose</p>
                      <p className="text-xl font-bold text-gray-900">{app.loan_purpose || 'General Business'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Industry</p>
                      <p className="text-xl font-bold text-gray-900">{app.business_info?.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {app.step_data?.loanTerm ? 'Term' : 'Annual Revenue'}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {app.step_data?.loanTerm 
                          ? `${app.step_data.loanTerm} months`
                          : formatCurrency(app.financial_info?.annualRevenue || 0)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Loan Details for Funded Loans */}
                  {isFunded && loan && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-bold text-blue-900 mb-3">Loan Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-blue-700">Interest Rate</p>
                          <p className="text-lg font-bold text-blue-900">{formatPercentage(loan.interest_rate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Monthly Payment</p>
                          <p className="text-lg font-bold text-blue-900">{formatCurrency(loan.monthly_payment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Total Amount</p>
                          <p className="text-lg font-bold text-blue-900">{formatCurrency(loan.total_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700">Origination Date</p>
                          <p className="text-lg font-bold text-blue-900">
                            {loan.origination_date ? formatShortDate(new Date(loan.origination_date)) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLoanId(loan.id)
                          setActiveTab('payments')
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Payment Schedule →
                      </button>
                    </div>
                  )}

                  {/* Documents section */}
                  {appDocs.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Documents ({appDocs.length})
                      </p>
                      <div className="space-y-1">
                        {appDocs.map(doc => (
                          <div key={doc.id} className="text-sm text-gray-600 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {doc.file_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.status === 'submitted' && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Your application is under review. We'll notify you of any updates.
                      </p>
                    </div>
                  )}

                  {app.status === 'approved' && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Congratulations! Your loan has been approved and is now available for investor funding.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No applications found</p>
          <p className="text-sm text-gray-400 mt-2">Create an application first to upload documents</p>
          <a 
            href="/apply"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Apply for a Loan
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {app.business_info?.businessName || 'Business Loan Application'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Application ID: {app.id.slice(0, 8)}... • Status: {app.status.replace('_', ' ').toUpperCase()}
              </p>
              <DocumentsList 
                applicationId={app.id} 
                canDelete={true} 
                canUpload={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Accepted File Types</h4>
        <p className="text-sm text-blue-800">
          PDF, Word documents (.doc, .docx), and images (.jpg, .jpeg, .png) up to 10MB
        </p>
      </div>
    </div>
  )

  const renderPayments = () => {
    const fundedLoans = loans.filter(loan => loan.origination_date !== null)
    
    if (fundedLoans.length === 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Loan Details & Payments</h2>

          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="text-gray-500">No active loans requiring payments</p>
            <p className="text-sm text-gray-400 mt-2">Payment information will appear here once your loan is funded</p>
          </div>
        </div>
      )
    }

    const selectedLoan = selectedLoanId ? fundedLoans.find(l => l.id === selectedLoanId) : fundedLoans[0]
    const loanPayments = selectedLoan ? getPaymentsForLoan(selectedLoan.id) : []
    const nextPayment = selectedLoan ? calculateNextPayment(selectedLoan.id) : null
    const paidPayments = loanPayments.filter(p => p.status === 'paid')
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Loan Details & Payments</h2>
          {fundedLoans.length > 1 && (
            <select
              value={selectedLoan?.id || ''}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {fundedLoans.map((loan) => {
                const app = applications.find(a => a.id === loan.application_id)
                return (
                  <option key={loan.id} value={loan.id}>
                    {app?.business_info?.businessName || 'Loan'} - {formatCurrency(loan.principal_amount)}
                  </option>
                )
              })}
            </select>
          )}
        </div>

        {selectedLoan && (
          <>
            {/* Loan Details Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Loan Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Principal Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedLoan.principal_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate (APR)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(selectedLoan.interest_rate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loan Term</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedLoan.term_months} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Payment</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedLoan.monthly_payment)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedLoan.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Origination Date</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedLoan.origination_date ? formatShortDate(new Date(selectedLoan.origination_date)) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Payment Due</p>
                  <p className="text-lg font-bold text-gray-900">
                    {loanPayments[0] ? formatShortDate(new Date(loanPayments[0].due_date)) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Final Payment Due</p>
                  <p className="text-lg font-bold text-gray-900">
                    {loanPayments[loanPayments.length - 1] ? formatShortDate(new Date(loanPayments[loanPayments.length - 1].due_date)) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status Card */}
            {nextPayment && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Next Payment Due</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-700">Due Date</p>
                    <p className="text-2xl font-bold text-blue-900">{formatShortDate(new Date(nextPayment.due_date))}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {calculateDaysUntilDue(nextPayment.due_date)} days remaining
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Payment Amount</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(nextPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Total Paid to Date</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">Remaining Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(paidPayments.length > 0 ? paidPayments[paidPayments.length - 1].remaining_balance : selectedLoan.principal_amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Payment Progress</span>
                    <span>{paidPayments.length} of {loanPayments.length} payments made</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(paidPayments.length / loanPayments.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Schedule Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Payment Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loanPayments.map((payment) => (
                      <tr key={payment.id} className={payment.status === 'paid' ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.payment_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatShortDate(new Date(payment.due_date))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(payment.principal_portion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(payment.interest_portion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.remaining_balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'late' ? 'bg-red-100 text-red-800' :
                            payment.status === 'missed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
            <p className="text-gray-600 mt-1">Manage your loans and track your applications</p>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'loans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Loans
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payments
          </button>
          <a
            href="/customer/profile"
            className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
          >
            Profile
          </a>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'loans' && renderLoans()}
      {activeTab === 'documents' && renderDocuments()}
      {activeTab === 'payments' && renderPayments()}
    </div>
  )
}
