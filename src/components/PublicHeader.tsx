'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function PublicHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl sm:text-2xl font-bold text-gray-900">
              Commercial Lending Platform
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Loan Products
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              About
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              FAQ
            </a>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {getUserName()}
                    </span>
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
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-3">
              <a href="#" className="block text-gray-500 hover:text-gray-900 py-2">
                Loan Products
              </a>
              <a href="#" className="block text-gray-500 hover:text-gray-900 py-2">
                About
              </a>
              <a href="#" className="block text-gray-500 hover:text-gray-900 py-2">
                FAQ
              </a>
              {!loading && (
                <>
                  {user ? (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <div className="text-sm text-gray-600 py-2">
                        {getUserName()}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left text-gray-500 hover:text-gray-900 py-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-200 space-y-3">
                      <a href="/login" className="block text-gray-500 hover:text-gray-900 py-2">
                        Login
                      </a>
                      <a href="/signup" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center">
                        Sign Up
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
