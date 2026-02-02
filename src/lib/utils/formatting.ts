// Utility functions for formatting data

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
    case 'submitted': return 'text-blue-600 bg-blue-100'
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
