'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor, getRiskColor } from '@/lib/utils/formatting'
import DocumentsList from '@/components/DocumentsList'
import { fundLoan } from '@/lib/loans/funding'

interface Application {
  id: string
  status: string
  loan_amount: number
  loan_purpose: string
  business_info: any
  financial_info: any
  created_at: string
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
    if (role !== 'admin') {
      window.location.href = '/customer'
      return
    }

    await fetchApplications()
  }

  const fetchApplications = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
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
  
  // Admin stats calculations
  const totalLoans = applications.length
  const totalLoanValue = applications.reduce((sum, app) => sum + (app.loan_amount || 0), 0)
  const totalFunded = 0 // Will implement when we have loans table data
  const pendingReview = applications.filter(app => app.status === 'submitted').length
  const approvalRate = totalLoans > 0 ? Math.round((applications.filter(app => app.status !== 'rejected').length / totalLoans) * 100) : 0

  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject' | 'under_review') => {
    setActionLoading(loanId)
    
    try {
      const supabase = createClient()
      
      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        under_review: 'under_review'
      }
      
      const { error } = await supabase
        .from('applications')
        .update({ status: statusMap[action] })
        .eq('id', loanId)
      
      if (error) {
        console.error('Error updating application:', error)
        alert(`Failed to ${action} application: ${error.message}`)
      } else {
        alert(`Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'moved to review'}!`)
        // Refresh applications
        await fetchApplications()
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to ${action} application`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleFundLoan = async (applicationId: string, loanAmount: number) => {
    setActionLoading(applicationId)
    
    try {
      const supabase = createClient()
      
      // First, check if a loan record exists for this application
      const { data: existingLoan, error: loanCheckError } = await supabase
        .from('loans')
        .select('id')
        .eq('application_id', applicationId)
        .single()
      
      let loanId = existingLoan?.id
      
      // If no loan exists, create one
      if (!existingLoan) {
        const { data: newLoan, error: createError } = await supabase
          .from('loans')
          .insert({
            application_id: applicationId,
            principal_amount: loanAmount,
            interest_rate: 0.25, // 25% APR - default rate
            term_months: 12, // Default 12 month term
            status: 'pending'
          })
          .select()
          .single()
        
        if (createError) {
          throw new Error(`Failed to create loan: ${createError.message}`)
        }
        
        loanId = newLoan.id
      }
      
      // Fund the loan (sets origination date and creates payment schedule)
      const result = await fundLoan({
        loanId: loanId!,
        principalAmount: loanAmount,
        interestRate: 0.25, // 25% APR
        termMonths: 12 // 12 months
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fund loan')
      }
      
      // Update application status to funded
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'funded',
          funding_status: 'fully_funded',
          funded_amount: loanAmount
        })
        .eq('id', applicationId)
      
      if (updateError) {
        throw new Error(`Failed to update application: ${updateError.message}`)
      }
      
      alert(`Loan funded successfully! ${result.paymentsCreated} payment records created.`)
      await fetchApplications()
      
    } catch (error) {
      console.error('Error funding loan:', error)
      alert(`Failed to fund loan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setActionLoading(null)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalLoans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Loan Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLoanValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Funded</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFunded)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">{approvalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Application Status Distribution</h3>
          <div className="space-y-3">
            {['submitted', 'under_review', 'approved', 'funded', 'active', 'rejected'].map(status => {
              const count = applications.filter(app => app.status === status).length
              const percentage = totalLoans > 0 ? Math.round((count / totalLoans) * 100) : 0
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(status)}`}>
                    {status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {['low', 'medium', 'high'].map(risk => {
              // For now, show even distribution since we don't have risk ratings in real data yet
              const count = Math.floor(applications.length / 3)
              const percentage = totalLoans > 0 ? Math.round((count / totalLoans) * 100) : 0
              return (
                <div key={risk} className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-sm ${getRiskColor(risk)}`}>
                    {risk.toUpperCase()} RISK
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">2 loans approved today</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">1 loan fully funded</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">{pendingReview} loans pending review</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">3 new applications today</span>
            </div>
          </div>
        </div>
      </div>
      {/* Pending Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Loans Requiring Action</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {applications.filter(app => app.status === 'submitted').map((app) => (
            <div key={app.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{app.business_info?.businessName || 'N/A'}</h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(app.loan_amount || 0)} • {app.loan_purpose || 'N/A'} • Applied {formatDate(app.created_at)}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor('medium')}`}>
                      MEDIUM RISK
                    </span>
                    <span className="text-sm text-gray-600">Revenue: {formatCurrency(app.financial_info?.annualRevenue || 0)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoanAction(app.id, 'approve')}
                    disabled={actionLoading === app.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === app.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleLoanAction(app.id, 'under_review')}
                    disabled={actionLoading === app.id}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleLoanAction(app.id, 'reject')}
                    disabled={actionLoading === app.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  const renderLoans = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
        <div className="flex space-x-4">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Statuses</option>
            <option>Under Review</option>
            <option>Approved</option>
            <option>Funded</option>
            <option>Active</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Risk Levels</option>
            <option>Low Risk</option>
            <option>Medium Risk</option>
            <option>High Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No applications found. Submit an application to see it here!
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {app.business_info?.businessName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.business_info?.industry || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(app.loan_amount || 0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.loan_purpose || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor('medium')}`}>
                      MEDIUM
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLoan(selectedLoan === app.id ? null : app.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {(app.status === 'submitted' || app.status === 'under_review') && (
                      <>
                        <button
                          onClick={() => handleLoanAction(app.id, 'approve')}
                          disabled={actionLoading === app.id}
                          className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLoanAction(app.id, 'reject')}
                          disabled={actionLoading === app.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <button
                        onClick={() => handleFundLoan(app.id, app.loan_amount)}
                        disabled={actionLoading === app.id}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                      >
                        {actionLoading === app.id ? 'Funding...' : 'Fund Loan'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Loan Details</h3>
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
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Business Information</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div><strong className="text-gray-900">Name:</strong> {app.business_info?.businessName || 'N/A'}</div>
                        <div><strong className="text-gray-900">Industry:</strong> {app.business_info?.industry || 'N/A'}</div>
                        <div><strong className="text-gray-900">Annual Revenue:</strong> {formatCurrency(app.financial_info?.annualRevenue || 0)}</div>
                        <div><strong className="text-gray-900">Years in Business:</strong> {app.business_info?.yearsInBusiness || 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Loan Details</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div><strong className="text-gray-900">Amount:</strong> {formatCurrency(app.loan_amount || 0)}</div>
                        <div><strong className="text-gray-900">Purpose:</strong> {app.loan_purpose || 'N/A'}</div>
                        <div><strong className="text-gray-900">Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(app.status)}`}>{app.status.replace('_', ' ').toUpperCase()}</span></div>
                        <div><strong className="text-gray-900">Applied:</strong> {formatDate(app.created_at)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Documents</h4>
                    <DocumentsList 
                      applicationId={app.id} 
                      canDelete={false} 
                      canUpload={false}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setSelectedLoan(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {(app.status === 'submitted' || app.status === 'under_review') && (
                      <>
                        <button
                          onClick={() => {
                            handleLoanAction(app.id, 'approve')
                            setSelectedLoan(null)
                          }}
                          disabled={actionLoading === app.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            handleLoanAction(app.id, 'reject')
                            setSelectedLoan(null)
                          }}
                          disabled={actionLoading === app.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <button
                        onClick={() => {
                          handleFundLoan(app.id, app.loan_amount)
                          setSelectedLoan(null)
                        }}
                        disabled={actionLoading === app.id}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50"
                      >
                        {actionLoading === app.id ? 'Funding...' : 'Fund Loan'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Application Funnel</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Applications Started</span>
              <span className="text-xl font-bold text-gray-900">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Applications Completed</span>
              <span className="text-xl font-bold text-gray-900">89 (57%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Applications Approved</span>
              <span className="text-xl font-bold text-gray-900">67 (75%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Loans Funded</span>
              <span className="text-xl font-bold text-gray-900">45 (67%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Processing Time</span>
              <span className="text-xl font-bold text-gray-900">3.2 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Funding Time</span>
              <span className="text-xl font-bold text-gray-900">5.8 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Default Rate</span>
              <span className="text-xl font-bold text-green-600">2.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-xl font-bold text-gray-900">4.7/5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Trends</h3>
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Interactive charts and trend analysis coming soon</p>
          <p className="text-sm mt-2">Track loan volume, approval rates, and revenue over time</p>
        </div>
      </div>
    </div>
  )
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600 mt-1">Manage loans, monitor performance, and oversee operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{pendingReview}</span> loans pending review
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
            Loan Management
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports & Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'loans' && renderLoans()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'users' && (
        <div className="text-center py-12">
          <p className="text-gray-500">User management section coming soon...</p>
          <p className="text-sm text-gray-400 mt-2">Manage customer and investor accounts, permissions, and access</p>
        </div>
      )}
    </div>
  )
}