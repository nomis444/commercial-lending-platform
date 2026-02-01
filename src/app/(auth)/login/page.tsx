'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { demoAuth } from '@/lib/demo/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await demoAuth.signIn(email, password)
      
      // Redirect based on user role
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
          router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role: 'borrower' | 'investor' | 'admin') => {
    const demoEmails = {
      borrower: 'borrower@demo.com',
      investor: 'investor@demo.com',
      admin: 'admin@demo.com'
    }
    
    setEmail(demoEmails[role])
    setPassword('demo123')
    
    try {
      const user = await demoAuth.signIn(demoEmails[role], 'demo123')
      
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo Login Buttons */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Demo Accounts (For Presentation)</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('borrower')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50"
            >
              <strong>Borrower:</strong> borrower@demo.com
            </button>
            <button
              onClick={() => handleDemoLogin('investor')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50"
            >
              <strong>Investor:</strong> investor@demo.com
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50"
            >
              <strong>Admin:</strong> admin@demo.com
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}