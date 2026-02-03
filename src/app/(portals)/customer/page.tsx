'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils/formatting'
import { LOAN_PRODUCTS, type LoanProductType } from '@/lib/application/products'
import type { User } from '@supabase/supabase-js'

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
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
    if (role !== 'borrower') {
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e)}
            disabled={uploading || applications.length === 0}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </label>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

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
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No documents uploaded yet</p>
          <p className="text-sm text-gray-400 mt-2">Upload supporting documents for your loan applications</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="divide-y divide-gray-200">
            {applications.map((app) => {
              const appDocs = documents.filter(doc => doc.application_id === app.id)
              if (appDocs.length === 0) return null
              
              return (
                <div key={app.id} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {app.business_info?.businessName || 'Business Loan Application'}
                  </h3>
                  <div className="space-y-3">
                    {appDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.file_size / 1024).toFixed(1)} KB • Uploaded {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.verification_status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : doc.verification_status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verification_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
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

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>

      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        <p className="text-gray-500">No active loans requiring payments</p>
        <p className="text-sm text-gray-400 mt-2">Payment information will appear here once your loan is funded</p>
      </div>
    </div>
  )

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
