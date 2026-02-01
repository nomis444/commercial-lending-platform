'use client'

import { useState } from 'react'
import { mockLoans, mockNotifications, formatCurrency, formatDate, getStatusColor, getRiskColor } from '@/lib/mock/data'

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  
  // Admin stats calculations
  const totalLoans = mockLoans.length
  const totalLoanValue = mockLoans.reduce((sum, loan) => sum + loan.loanAmount, 0)
  const totalFunded = mockLoans.reduce((sum, loan) => sum + loan.fundedAmount, 0)
  const activeLoans = mockLoans.filter(loan => loan.status === 'funded' || loan.status === 'active').length
  const pendingReview = mockLoans.filter(loan => loan.status === 'under_review').length
  const approvalRate = Math.round((mockLoans.filter(loan => loan.status !== 'rejected').length / totalLoans) * 100)

  const handleLoanAction = (loanId: string, action: string) => {
    alert(`${action} action for loan ${loanId} executed! (Demo mode)`)
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">Loan Status Distribution</h3>
          <div className="space-y-3">
            {['pending', 'under_review', 'approved', 'funded', 'active', 'rejected'].map(status => {
              const count = mockLoans.filter(loan => loan.status === status).length
              const percentage = Math.round((count / totalLoans) * 100)
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
              const count = mockLoans.filter(loan => loan.riskRating === risk).length
              const percentage = Math.round((count / totalLoans) * 100)
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
          {mockLoans.filter(loan => loan.status === 'under_review').map((loan) => (
            <div key={loan.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{loan.businessName}</h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(loan.loanAmount)} • {loan.loanPurpose} • Applied {formatDate(loan.appliedDate)}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(loan.riskRating)}`}>
                      {loan.riskRating.toUpperCase()} RISK
                    </span>
                    <span className="text-sm text-gray-600">Credit Score: {loan.creditScore}</span>
                    <span className="text-sm text-gray-600">Revenue: {formatCurrency(loan.annualRevenue)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoanAction(loan.id, 'Approve')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleLoanAction(loan.id, 'Request More Info')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                  >
                    More Info
                  </button>
                  <button
                    onClick={() => handleLoanAction(loan.id, 'Reject')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
            {mockLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{loan.businessName}</div>
                    <div className="text-sm text-gray-500">{loan.industry}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(loan.loanAmount)}</div>
                  <div className="text-sm text-gray-500">{loan.loanPurpose}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.riskRating)}`}>
                    {loan.riskRating.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(loan.appliedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  {loan.status === 'under_review' && (
                    <button
                      onClick={() => handleLoanAction(loan.id, 'Review')}
                      className="text-green-600 hover:text-green-900"
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
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
              const loan = mockLoans.find(l => l.id === selectedLoan)
              if (!loan) return null
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Business Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {loan.businessName}</div>
                        <div><strong>Industry:</strong> {loan.industry}</div>
                        <div><strong>Annual Revenue:</strong> {formatCurrency(loan.annualRevenue)}</div>
                        <div><strong>Credit Score:</strong> {loan.creditScore}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Loan Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Amount:</strong> {formatCurrency(loan.loanAmount)}</div>
                        <div><strong>Purpose:</strong> {loan.loanPurpose}</div>
                        <div><strong>Term:</strong> {loan.loanTerm} months</div>
                        <div><strong>Interest Rate:</strong> {loan.interestRate}%</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Documents</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {loan.documents.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${doc.status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          <span>{doc.name}</span>
                        </div>
                      ))}
                    </div>
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