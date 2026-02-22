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

  const getDashboardUrl = () => {
    const role = user?.user_metadata?.role || 'borrower'
    if (role === 'admin') return '/admin'
    if (role === 'investor') return '/investor'
    return '/customer'
  }

  return (
    <header className="bg-charcoal-900 shadow-sm border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl sm:text-2xl font-bold text-white">
              MidPoint Access
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Products
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              FAQ
            </a>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <a 
                      href={getDashboardUrl()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </a>
                    <span className="text-sm text-gray-400">
                      {getUserName()}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <a href="/login" className="text-gray-400 hover:text-white transition-colors">
                      Login
                    </a>
                    <a href="/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors">
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
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-charcoal-800 transition-colors"
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
          <div className="md:hidden pb-4 border-t border-charcoal-800">
            <div className="pt-4 space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white py-2 transition-colors">
                Products
              </a>
              <a href="#" className="block text-gray-400 hover:text-white py-2 transition-colors">
                About
              </a>
              <a href="#" className="block text-gray-400 hover:text-white py-2 transition-colors">
                FAQ
              </a>
              {!loading && (
                <>
                  {user ? (
                    <div className="pt-3 border-t border-charcoal-800 space-y-3">
                      <a 
                        href={getDashboardUrl()}
                        className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-center font-medium transition-colors"
                      >
                        Dashboard
                      </a>
                      <div className="text-sm text-gray-400 py-2">
                        {getUserName()}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left text-gray-400 hover:text-white py-2 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-charcoal-800 space-y-3">
                      <a href="/login" className="block text-gray-400 hover:text-white py-2 transition-colors">
                        Login
                      </a>
                      <a href="/signup" className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-center transition-colors">
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
