'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function PublicHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
        </div>
      </div>
    </header>
  )
}
