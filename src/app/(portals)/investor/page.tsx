'use client'

import { useState } from 'react'
import { mockInvestorLoans, formatCurrency, formatDate, getStatusColor, getRiskColor } from '@/lib/mock/data'

export default function InvestorPortal() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  
  // Mock investor data
  const investorStats = {
    totalInvested: 315000,
    activeInvestments: 3,
    totalReturns: 14100,
    averageReturn: 8.2
  }

  const availableLoans = mockInvestorLoans.filter(loan => 
    loan.status === 'approved' && loan.fundingStatus !== 'fully_funded'
  )

  const handleInvest = (loanId: string, amount: number) => {
    alert(`Investment of ${formatCurrency(amount)} in loan ${loanId} submitted! (Demo mode)`)
  }

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Investment Opportunities</h2>
        <div className="flex space-x-4">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Industries</option>
            <option>Technology</option>
            <option>Manufacturing</option>
            <option>Food & Beverage</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Risk Levels</option>
            <option>Low Risk</option>
            <option>Medium Risk</option>
            <option>High Risk</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {availableLoans.map((loan) => (
          <div key={loan.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{loan.businessName}</h3>
                  <p className="text-sm text-gray-600">{loan.industry} • Applied {formatDate(loan.appliedDate)}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(loan.riskRating)}`}>
                    {loan.riskRating.toUpperCase()} RISK
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900 text-green-600">{loan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Term</p>
                  <p className="text-xl font-bold text-gray-900">{loan.loanTerm} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credit Score</p>
                  <p className="text-xl font-bold text-gray-900">{loan.creditScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.annualRevenue)}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Funding Progress</span>
                  <span>{Math.round((loan.fundedAmount / loan.loanAmount) * 100)}% Funded</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${(loan.fundedAmount / loan.loanAmount) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Funded: {formatCurrency(loan.fundedAmount)}</span>
                  <span>Remaining: {formatCurrency(loan.loanAmount - loan.fundedAmount)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Purpose:</strong> {loan.loanPurpose} • 
                  <strong className="ml-2">Expected Monthly Return:</strong> {formatCurrency(Math.round(loan.loanAmount * (loan.interestRate / 100) / 12))}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedLoan === loan.id ? 'Hide Details' : 'View Details'}
                </button>
                <div className="space-x-3">
                  <button
                    onClick={() => handleInvest(loan.id, Math.min(50000, loan.loanAmount - loan.fundedAmount))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Invest {formatCurrency(Math.min(50000, loan.loanAmount - loan.fundedAmount))}
                  </button>
                  <button
                    onClick={() => {
                      const amount = prompt('Enter investment amount:')
                      if (amount) handleInvest(loan.id, parseInt(amount))
                    }}
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Custom Amount
                  </button>
                </div>
              </div>

              {selectedLoan === loan.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Business Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <span>{loan.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Revenue:</span>
                          <span>{formatCurrency(loan.annualRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credit Score:</span>
                          <span>{loan.creditScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Rating:</span>
                          <span className={`px-2 py-1 rounded text-xs ${getRiskColor(loan.riskRating)}`}>
                            {loan.riskRating.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Loan Terms</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Purpose:</span>
                          <span>{loan.loanPurpose}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Term:</span>
                          <span>{loan.loanTerm} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interest Rate:</span>
                          <span className="text-green-600 font-semibold">{loan.interestRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Payment:</span>
                          <span>{formatCurrency(loan.monthlyPayment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {loan.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">Verified Documents</h4>
                      <div className="flex flex-wrap gap-2">
                        {loan.documents.map((doc) => (
                          <span key={doc.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✓ {doc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPortfolio = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(investorStats.totalInvested)}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(investorStats.totalReturns)}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">{investorStats.activeInvestments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Return</p>
              <p className="text-2xl font-bold text-gray-900">{investorStats.averageReturn}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <p className="text-gray-500">Portfolio details coming soon...</p>
        <p className="text-sm text-gray-400 mt-2">Track your investments, returns, and performance metrics</p>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Investment Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 text-gray-900 mb-4">Portfolio Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total ROI</span>
              <span className="text-xl font-bold text-green-600">+12.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Annualized Return</span>
              <span className="text-xl font-bold text-green-600">8.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Best Performing Loan</span>
              <span className="font-semibold">+15.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Default Rate</span>
              <span className="text-xl font-bold text-green-600">0.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 text-gray-900 mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-xl font-bold text-gray-900">60%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-xl font-bold text-gray-900">35%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-xl font-bold text-gray-900">5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 text-gray-900 mb-4">Industry Allocation</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Manufacturing</span>
              <span className="font-semibold">40%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Technology</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Food & Beverage</span>
              <span className="font-semibold">20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Energy</span>
              <span className="font-semibold">15%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold text-gray-900 text-gray-900 mb-4">Monthly Returns Trend</h3>
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Interactive performance charts coming soon</p>
          <p className="text-sm mt-2">Track your investment returns and portfolio growth over time</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Investor Portal</h1>
        <p className="text-gray-600 mt-1">Discover investment opportunities and manage your portfolio</p>
      </div>

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
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {activeTab === 'opportunities' && renderOpportunities()}
      {activeTab === 'portfolio' && renderPortfolio()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  )
}
