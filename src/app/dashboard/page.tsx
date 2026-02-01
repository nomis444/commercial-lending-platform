'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { demoAuth } from '@/lib/demo/auth'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const user = demoAuth.getCurrentUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    // Redirect to appropriate portal based on user role
    switch (user.role) {
      case 'borrower':
        router.push('/customer')
        break
      case 'investor':
        router.push('/investor')
        break
      case 'admin':
        router.push('/admin')
        break
      default:
        router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to your portal...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}