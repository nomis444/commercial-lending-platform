'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    // Set redirect URL on client side only
    setRedirectUrl(`${window.location.origin}/auth/callback`)

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user.user_metadata?.role || 'borrower'
        const redirectMap: Record<string, string> = {
          borrower: '/customer',
          investor: '/investor',
          admin: '/admin',
        }
        router.push(redirectMap[role] || '/customer')
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const role = session.user.user_metadata?.role || 'borrower'
        const redirectMap: Record<string, string> = {
          borrower: '/customer',
          investor: '/investor',
          admin: '/admin',
        }
        window.location.href = redirectMap[role] || '/customer'
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (!redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Commercial Lending Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo={redirectUrl}
          />
        </div>

        <div className="text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
