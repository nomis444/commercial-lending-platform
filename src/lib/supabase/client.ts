import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
    console.warn('Supabase environment variables not configured - running in demo mode')
    // Return a mock client for development
    return createMockSupabaseClient()
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Mock Supabase client for development when env vars aren't set
function createMockSupabaseClient() {
  return {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Demo mode - Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Demo mode - Supabase not configured') }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: null, error: new Error('Demo mode - Supabase not configured') }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      })
    },
    from: () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Demo mode - Supabase not configured') }) }) }),
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      delete: () => ({ eq: async () => ({ error: null }) })
    })
  }
}