'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PortalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Get user role from metadata
      const role = user.user_metadata?.role || 'borrower'
      setUserRole(role)
    }
  }, [user])

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
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              LendingPlatform
            </Link>
            <nav className="flex space-x-6">
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
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Apply for Loan
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.full_name || user.email} ({userRole})
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
        </div>
      </div>
    </div>
  )
}