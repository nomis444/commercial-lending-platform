// Mock data for demo purposes
export interface MockLoan {
  id: string
  applicationId: string
  businessName: string
  loanAmount: number
  loanPurpose: string
  loanTerm: number
  interestRate: number
  status: 'pending' | 'under_review' | 'approved' | 'funded' | 'active' | 'rejected'
  fundingStatus: 'unfunded' | 'partially_funded' | 'fully_funded'
  fundedAmount: number
  monthlyPayment: number
  remainingBalance: number
  nextPaymentDate: string
  appliedDate: string
  approvedDate?: string
  fundedDate?: string
  industry: string
  creditScore: number
  annualRevenue: number
  riskRating: 'low' | 'medium' | 'high'
  documents: MockDocument[]
  investors: MockInvestment[]
}

export interface MockDocument {
  id: string
  name: string
  type: string
  status: 'pending' | 'verified' | 'rejected'
  uploadedDate: string
}

export interface MockInvestment {
  id: string
  investorName: string
  amount: number
  percentage: number
  investedDate: string
  returns: number
}

export interface MockNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdDate: string
}

// Mock loan data
export const mockLoans: MockLoan[] = [
  {
    id: 'loan_001',
    applicationId: 'app_001',
    businessName: 'Acme Manufacturing Corp',
    loanAmount: 250000,
    loanPurpose: 'Equipment Purchase',
    loanTerm: 36,
    interestRate: 8.5,
    status: 'funded',
    fundingStatus: 'fully_funded',
    fundedAmount: 250000,
    monthlyPayment: 7890,
    remainingBalance: 198500,
    nextPaymentDate: '2024-02-15',
    appliedDate: '2024-01-10',
    approvedDate: '2024-01-15',
    fundedDate: '2024-01-20',
    industry: 'Manufacturing',
    creditScore: 720,
    annualRevenue: 1200000,
    riskRating: 'low',
    documents: [
      { id: 'doc_001', name: 'Bank Statements.pdf', type: 'bank_statements', status: 'verified', uploadedDate: '2024-01-10' },
      { id: 'doc_002', name: 'Tax Returns.pdf', type: 'tax_returns', status: 'verified', uploadedDate: '2024-01-10' },
      { id: 'doc_003', name: 'Financial Statements.pdf', type: 'financial_statements', status: 'verified', uploadedDate: '2024-01-11' }
    ],
    investors: [
      { id: 'inv_001', investorName: 'Capital Partners Alpha', amount: 150000, percentage: 60, investedDate: '2024-01-18', returns: 8500 },
      { id: 'inv_002', investorName: 'Investment Group Beta', amount: 100000, percentage: 40, investedDate: '2024-01-20', returns: 5600 }
    ]
  },
  {
    id: 'loan_002',
    applicationId: 'app_002',
    businessName: 'Tech Startup Solutions',
    loanAmount: 100000,
    loanPurpose: 'Working Capital',
    loanTerm: 24,
    interestRate: 9.2,
    status: 'approved',
    fundingStatus: 'partially_funded',
    fundedAmount: 65000,
    monthlyPayment: 4850,
    remainingBalance: 100000,
    nextPaymentDate: '',
    appliedDate: '2024-01-25',
    approvedDate: '2024-01-28',
    industry: 'Technology',
    creditScore: 680,
    annualRevenue: 500000,
    riskRating: 'medium',
    documents: [
      { id: 'doc_004', name: 'Bank Statements.pdf', type: 'bank_statements', status: 'verified', uploadedDate: '2024-01-25' },
      { id: 'doc_005', name: 'Tax Returns.pdf', type: 'tax_returns', status: 'pending', uploadedDate: '2024-01-25' }
    ],
    investors: [
      { id: 'inv_003', investorName: 'Growth Capital Fund', amount: 65000, percentage: 65, investedDate: '2024-01-29', returns: 0 }
    ]
  },
  {
    id: 'loan_003',
    applicationId: 'app_003',
    businessName: 'Green Energy Innovations',
    loanAmount: 500000,
    loanPurpose: 'Business Expansion',
    loanTerm: 60,
    interestRate: 7.8,
    status: 'under_review',
    fundingStatus: 'unfunded',
    fundedAmount: 0,
    monthlyPayment: 10200,
    remainingBalance: 500000,
    nextPaymentDate: '',
    appliedDate: '2024-02-01',
    industry: 'Energy',
    creditScore: 750,
    annualRevenue: 2500000,
    riskRating: 'low',
    documents: [
      { id: 'doc_006', name: 'Bank Statements.pdf', type: 'bank_statements', status: 'verified', uploadedDate: '2024-02-01' },
      { id: 'doc_007', name: 'Tax Returns.pdf', type: 'tax_returns', status: 'verified', uploadedDate: '2024-02-01' },
      { id: 'doc_008', name: 'Business Plan.pdf', type: 'business_plan', status: 'pending', uploadedDate: '2024-02-02' }
    ],
    investors: []
  }
]

// Mock notifications
export const mockNotifications: MockNotification[] = [
  {
    id: 'notif_001',
    title: 'Loan Application Approved',
    message: 'Your loan application for $100,000 has been approved and is now available for investor funding.',
    type: 'success',
    read: false,
    createdDate: '2024-01-28'
  },
  {
    id: 'notif_002',
    title: 'Payment Due Soon',
    message: 'Your next loan payment of $7,890 is due on February 15, 2024.',
    type: 'warning',
    read: false,
    createdDate: '2024-02-10'
  },
  {
    id: 'notif_003',
    title: 'Funding Progress Update',
    message: 'Your approved loan is now 65% funded. $35,000 more needed for full funding.',
    type: 'info',
    read: true,
    createdDate: '2024-01-29'
  },
  {
    id: 'notif_004',
    title: 'Document Verification Complete',
    message: 'All your uploaded documents have been verified successfully.',
    type: 'success',
    read: true,
    createdDate: '2024-01-15'
  }
]

// Mock investor data for investor portal
export const mockInvestorLoans: MockLoan[] = [
  ...mockLoans.filter(loan => loan.status === 'approved' || loan.status === 'funded'),
  {
    id: 'loan_004',
    applicationId: 'app_004',
    businessName: 'Restaurant Chain Expansion',
    loanAmount: 300000,
    loanPurpose: 'Real Estate',
    loanTerm: 48,
    interestRate: 8.8,
    status: 'approved',
    fundingStatus: 'unfunded',
    fundedAmount: 0,
    monthlyPayment: 7450,
    remainingBalance: 300000,
    nextPaymentDate: '',
    appliedDate: '2024-02-05',
    approvedDate: '2024-02-08',
    industry: 'Food & Beverage',
    creditScore: 695,
    annualRevenue: 1800000,
    riskRating: 'medium',
    documents: [
      { id: 'doc_009', name: 'Bank Statements.pdf', type: 'bank_statements', status: 'verified', uploadedDate: '2024-02-05' },
      { id: 'doc_010', name: 'Tax Returns.pdf', type: 'tax_returns', status: 'verified', uploadedDate: '2024-02-05' }
    ],
    investors: []
  }
]

// Helper functions
export function getLoansByStatus(status: string): MockLoan[] {
  return mockLoans.filter(loan => loan.status === status)
}

export function getLoanById(id: string): MockLoan | undefined {
  return mockLoans.find(loan => loan.id === id)
}

export function getUnreadNotifications(): MockNotification[] {
  return mockNotifications.filter(notif => !notif.read)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved': return 'text-green-600 bg-green-100'
    case 'funded': return 'text-blue-600 bg-blue-100'
    case 'active': return 'text-green-600 bg-green-100'
    case 'under_review': return 'text-yellow-600 bg-yellow-100'
    case 'pending': return 'text-gray-600 bg-gray-100'
    case 'rejected': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return 'text-green-600 bg-green-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'high': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}