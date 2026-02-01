'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { demoAuth } from '@/lib/demo/auth'

export default function PublicHeader() {
  const [user, setUser] = useState(demoAuth.getCurrentUser())
  const router = useRouter()

  useEffect(() => {
    setUser(demoAuth.getCurrentUser())
  }, [])

  const handleSignOut = async () => {
    try {
      await demoAuth.signOut()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

  return (
    <>
      {isDemoMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Demo Mode:</span> Ready for investor presentation! 
              All features are functional with demo data.
            </p>
          </div>
        </div>
      )}
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gray-900">
                Commercial Lending Platform
              </a>
            </div>
            <nav className="flex space-x-8 items-center">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                Loan Products
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                FAQ
              </a>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name} ({user.role})
                  </span>
                  <a 
                    href={user.role === 'borrower' ? '/customer' : user.role === 'investor' ? '/investor' : '/admin'} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a href="/login" className="text-gray-500 hover:text-gray-900">
                    Login
                  </a>
                  <a href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    Sign Up
                  </a>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}