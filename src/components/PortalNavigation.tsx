'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function PortalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const role = user.user_metadata?.role || 'borrower'
      setUserRole(role)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Define portals based on user role
  const getPortals = () => {
    const portals = []
    
    if (userRole === 'borrower' || userRole === 'admin') {
      portals.push({ name: 'Customer Portal', href: '/customer', icon: '👤', role: 'borrower' })
    }
    
    if (userRole === 'investor' || userRole === 'admin') {
      portals.push({ name: 'Investor Portal', href: '/investor', icon: '💼', role: 'investor' })
    }
    
    if (userRole === 'admin') {
      portals.push({ name: 'Admin Portal', href: '/admin', icon: '⚙️', role: 'admin' })
    }
    
    return portals
  }

  const portals = getPortals()

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-lg sm:text-xl font-bold text-blue-600">
            LendingPlatform
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {portals.map((portal) => (
              <Link
                key={portal.href}
                href={portal.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === portal.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{portal.icon}</span>
                <span>{portal.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Apply for Loan
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]} ({userRole})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

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
            <div className="pt-4 space-y-2">
              {portals.map((portal) => (
                <Link
                  key={portal.href}
                  href={portal.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === portal.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{portal.icon}</span>
                  <span>{portal.name}</span>
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center"
                >
                  Apply for Loan
                </Link>
                {user ? (
                  <>
                    <div className="text-sm text-gray-600 px-3 py-2">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]} ({userRole})
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}