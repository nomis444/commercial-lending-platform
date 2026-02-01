'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { demoAuth } from '@/lib/demo/auth'
import { createClient } from '@supabase/supabase-js'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/mock/data'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spznjpzxpssxvgcksgxh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwem5qcHp4cHNzeHZnY2tzZ3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjAwMDYsImV4cCI6MjA4NTUzNjAwNn0.O07nASkFwl-xST_Ujz5MuJTuGIZzxJSH0PzHtumbxu4'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Application {
  id: string
  status: string
  loan_amount: number
  loan_purpose: string
  business_info: any
  financial_info: any
  contact_info: any
  created_at: string
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = demoAuth.getCurrentUser()
    if (!user || user.role !== 'borrower') {
      router.push('/login')
      return
    }

    fetchUserApplications()
  }, [router])

  const fetchUserApplications = async () => {
    try {
      // In a real app, we'd filter by user ID
      // For demo, we'll show all applications but limit to recent ones
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading your applications...
              </div>
            ) : applications.length === 0 ? (
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
                      <h4 className="text-xl font-bold text-gray-900">
                        {app.business_info?.businessName || 'Business Loan Application'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(app.loan_amount || 0)} • {app.loan_purpose || 'General Business'} • Applied {formatDate(app.created_at)}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600">
                          Industry: {app.business_info?.industry || 'N/A'}
                        </span>
                        <span className="text-sm text-gray-600">
                          Revenue: {formatCurrency(app.financial_info?.annualRevenue || 0)}
                        </span>
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
              <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
                <div className="text-xl font-bold">Upload Documents</div>
                <div className="text-sm">Add supporting documents</div>
              </button>
              <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
                <div className="text-xl font-bold">Contact Support</div>
                <div className="text-sm">Get help with your application</div>
              </button>
            </div>
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
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
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
          applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {app.business_info?.businessName || 'Business Loan Application'}
                    </h3>
                    <p className="text-sm text-gray-600">Applied {formatDate(app.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="text-sm text-gray-600">Annual Revenue</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(app.financial_info?.annualRevenue || 0)}
                    </p>
                  </div>
                </div>

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
          ))
        )}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Upload Document
        </button>
      </div>

      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">Document management system coming soon</p>
        <p className="text-sm text-gray-400 mt-2">Upload and manage your loan documents securely</p>
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