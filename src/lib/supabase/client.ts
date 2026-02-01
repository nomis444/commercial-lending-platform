import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spznjpzxpssxvgcksgxh.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwem5qcHp4cHNzeHZnY2tzZ3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjAwMDYsImV4cCI6MjA4NTUzNjAwNn0.O07nASkFwl-xST_Ujz5MuJTuGIZzxJSH0PzHtumbxu4'

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