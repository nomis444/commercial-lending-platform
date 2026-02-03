'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, getRiskColor } from '@/lib/utils/formatting'

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

export default function InvestorPortal() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

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
    if (role !== 'investor' && role !== 'admin') {
      window.location.href = '/customer'
      return
    }

    await fetchInvestmentOpportunities()
  }

  const fetchInvestmentOpportunities = async () => {
    const supabase = createClient()
    
    try {
      // Fetch approved applications that are available for investment
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .in('status', ['submitted', 'approved']) // Show submitted and approved loans
        .order('created_at', { ascending: false })

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

  const handleInvest = (loanId: string, amount: number) => {
    alert(`Investment of ${formatCurrency(amount)} in loan ${loanId} submitted! (Demo mode)`)
  }

  const renderOpportunities = () => {
    const totalAvailableAmount = applications.reduce((sum, app) => sum + (app.loan_amount || 0), 0)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Available</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAvailableAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Investments</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Investment Opportunities */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Investment Opportunities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading investment opportunities...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No investment opportunities available at this time.</p>
                <p className="text-sm text-gray-400 mt-2">Check back later for new loan applications</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {app.business_info?.businessName || 'Business Loan Opportunity'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {app.business_info?.industry || 'Business'} • {app.loan_purpose || 'General Business'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getRiskColor('medium')}`}>
                            MEDIUM RISK
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Loan Amount</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(app.loan_amount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Available</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(app.loan_amount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Interest Rate</p>
                          <p className="text-xl font-bold text-gray-900">8.5%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Term</p>
                          <p className="text-xl font-bold text-gray-900">36 months</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Funding Progress</span>
                          <span>0% Funded</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span>Annual Revenue: {formatCurrency(app.financial_info?.annualRevenue || 0)}</span>
                          <span className="ml-4">Applied: {formatDate(app.created_at)}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedLoan(selectedLoan === app.id ? null : app.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleInvest(app.id, 10000)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                          >
                            Invest
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
  const renderPortfolio = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Investment Portfolio</h2>
      
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500">No investments yet</p>
        <p className="text-sm text-gray-400 mt-2">Your investment portfolio will appear here once you start investing</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investor Portal</h1>
            <p className="text-gray-600 mt-1">Discover investment opportunities and manage your portfolio</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{applications.length}</span> opportunities available
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'opportunities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Investment Opportunities
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'portfolio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Portfolio
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'opportunities' && renderOpportunities()}
      {activeTab === 'portfolio' && renderPortfolio()}

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Investment Opportunity Details</h3>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {(() => {
              const app = applications.find(a => a.id === selectedLoan)
              if (!app) return null
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Business Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {app.business_info?.businessName || 'N/A'}</div>
                        <div><strong>Industry:</strong> {app.business_info?.industry || 'N/A'}</div>
                        <div><strong>Annual Revenue:</strong> {formatCurrency(app.financial_info?.annualRevenue || 0)}</div>
                        <div><strong>Years in Business:</strong> {app.business_info?.yearsInBusiness || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Investment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Total Amount:</strong> {formatCurrency(app.loan_amount || 0)}</div>
                        <div><strong>Available:</strong> {formatCurrency(app.loan_amount || 0)}</div>
                        <div><strong>Purpose:</strong> {app.loan_purpose || 'General Business'}</div>
                        <div><strong>Applied:</strong> {formatDate(app.created_at)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedLoan(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleInvest(app.id, 25000)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
