'use client'

import { useState } from 'react'
import { mockLoans, mockNotifications, formatCurrency, formatDate, getStatusColor, getUnreadNotifications } from '@/lib/mock/data'

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock current user's loans (in real app, this would come from auth context)
  const userLoans = mockLoans.slice(0, 2) // First 2 loans belong to current user
  const unreadNotifications = getUnreadNotifications()
  
  const activeLoan = userLoans.find(loan => loan.status === 'funded')
  const pendingLoan = userLoans.find(loan => loan.status === 'approved')

  const renderOverview = () => (
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
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(userLoans.reduce((sum, loan) => sum + loan.loanAmount, 0))}
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
              <p className="text-2xl font-bold text-gray-900">
                {userLoans.filter(loan => loan.status === 'funded' || loan.status === 'active').length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {userLoans.filter(loan => loan.status === 'approved' || loan.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loan Card - Debug: Always show */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Active Loan</h3>
              <p className="text-sm text-gray-600">{activeLoan ? activeLoan.businessName : 'No active loan found'}</p>
            </div>
            {activeLoan && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeLoan.status)}`}>
                {activeLoan.status.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {activeLoan ? (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan ? formatCurrency(activeLoan.loanAmount) : 'No data'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan ? formatCurrency(activeLoan.remainingBalance) : 'No data'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan ? formatCurrency(activeLoan.monthlyPayment) : 'No data'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Payment</p>
                <p className="text-xl font-bold text-gray-900">{activeLoan ? formatDate(activeLoan.nextPaymentDate) : 'No data'}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Loan Progress</span>
                <span>{activeLoan ? Math.round(((activeLoan.loanAmount - activeLoan.remainingBalance) / activeLoan.loanAmount) * 100) : 0}% Paid</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${activeLoan ? ((activeLoan.loanAmount - activeLoan.remainingBalance) / activeLoan.loanAmount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-500">No active loan data available</p>
          </div>
        )}
        </div>

      {/* Pending Loan Card */}
      {pendingLoan && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Pending Loan</h3>
                <p className="text-sm text-gray-600">{pendingLoan.businessName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pendingLoan.status)}`}>
                {pendingLoan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingLoan.loanAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Funded Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingLoan.fundedAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest Rate</p>
                <p className="text-xl font-bold text-gray-900">{pendingLoan.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Term</p>
                <p className="text-xl font-bold text-gray-900">{pendingLoan.loanTerm} months</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Funding Progress</span>
                <span>{Math.round((pendingLoan.fundedAmount / pendingLoan.loanAmount) * 100)}% Funded</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(pendingLoan.fundedAmount / pendingLoan.loanAmount) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(pendingLoan.loanAmount - pendingLoan.fundedAmount)} more needed for full funding
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockNotifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="p-6">
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdDate)}</p>
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
        <h2 className="text-2xl font-bold text-gray-900">My Loans</h2>
        <a 
          href="/apply"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Apply for New Loan
        </a>
      </div>

      <div className="space-y-4">
        {userLoans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{loan.businessName}</h3>
                  <p className="text-sm text-gray-600">Applied {formatDate(loan.appliedDate)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                  {loan.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purpose</p>
                  <p className="text-xl font-bold text-gray-900">{loan.loanPurpose}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Term</p>
                  <p className="text-xl font-bold text-gray-900">{loan.loanTerm} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900">{loan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {loan.status === 'funded' ? 'Remaining' : 'Monthly Payment'}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {loan.status === 'funded' 
                      ? formatCurrency(loan.remainingBalance)
                      : formatCurrency(loan.monthlyPayment)
                    }
                  </p>
                </div>
              </div>

              {loan.status === 'approved' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between text-sm text-blue-800 mb-2">
                    <span>Funding Progress</span>
                    <span>{Math.round((loan.fundedAmount / loan.loanAmount) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(loan.fundedAmount / loan.loanAmount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
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

      {userLoans.map((loan) => (
        <div key={loan.id} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{loan.businessName}</h3>
                <p className="text-sm text-gray-600">Loan Application #{loan.applicationId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                {loan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {loan.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      doc.status === 'verified' ? 'bg-green-500' : 
                      doc.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">
                        {doc.type.replace('_', ' ').toUpperCase()} • Uploaded {formatDate(doc.uploadedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                      doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>

      {/* Active Loans Payment Info */}
      {userLoans.filter(loan => loan.status === 'funded' || loan.status === 'active').map((loan) => (
        <div key={loan.id} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{loan.businessName}</h3>
                <p className="text-sm text-gray-600">Loan #{loan.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next Payment Due</p>
                <p className="text-xl font-bold text-red-600">{formatDate(loan.nextPaymentDate)}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(loan.remainingBalance)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Interest Rate</p>
                <p className="text-2xl font-bold text-gray-900">{loan.interestRate}%</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Payments Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.ceil(loan.remainingBalance / loan.monthlyPayment)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center">
                <div className="text-xl font-bold text-blue-600">Make Payment</div>
                <div className="text-sm">{formatCurrency(loan.monthlyPayment)}</div>
              </button>
              <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
                <div className="text-xl font-bold text-gray-700">Pay Extra</div>
                <div className="text-sm">Reduce principal</div>
              </button>
              <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center">
                <div className="text-xl font-bold text-gray-700">Pay Off Loan</div>
                <div className="text-sm">{formatCurrency(loan.remainingBalance)}</div>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* No Active Loans */}
      {userLoans.filter(loan => loan.status === 'funded' || loan.status === 'active').length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p className="text-gray-500">No active loans requiring payments</p>
          <p className="text-sm text-gray-400 mt-2">Payment information will appear here once your loan is funded</p>
        </div>
      )}
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
          {unreadNotifications.length > 0 && (
            <div className="flex items-center text-sm text-blue-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {unreadNotifications.length} new notification{unreadNotifications.length > 1 ? 's' : ''}
            </div>
          )}
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