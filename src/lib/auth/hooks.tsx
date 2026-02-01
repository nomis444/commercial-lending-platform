'use client'

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { AuthClient } from './client'
import type { UserProfile } from './types'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)

  useEffect(() => {
    // Initialize auth client only on the client side
    const client = new AuthClient()
    setAuthClient(client)

    // Get initial user
    client.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = client.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!authClient) throw new Error('Auth client not initialized')
    setLoading(true)
    try {
      await authClient.signIn({ email, password })
      // User state will be updated by the auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (data: any) => {
    if (!authClient) throw new Error('Auth client not initialized')
    setLoading(true)
    try {
      await authClient.signUp(data)
      // User state will be updated by the auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    if (!authClient) return
    setLoading(true)
    try {
      await authClient.signOut()
      setUser(null)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authClient) throw new Error('Auth client not initialized')
    const updatedUser = await authClient.updateProfile(updates)
    setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return { user: null, loading: true }
  }
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return { user, loading: false }
}

export function useRequireRole(allowedRoles: string[]) {
  const { user, loading } = useRequireAuth()
  
  if (loading) {
    return { user: null, loading: true }
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
  }
  
  return { user, loading: false }
}