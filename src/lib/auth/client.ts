'use client'

import { createClient } from '@/lib/supabase/client'
import type { SignUpData, SignInData, UserProfile } from './types'

export class AuthClient {
  private supabase = createClient()

  async signUp(data: SignUpData) {
    try {
      // First create the tenant
      const { data: tenant, error: tenantError } = await this.supabase
        .from('tenants')
        .insert({
          name: data.company_name || `${data.full_name}'s Organization`,
          type: data.tenant_type
        })
        .select()
        .single()

      if (tenantError) {
        throw new Error(`Demo mode: ${tenantError.message}`)
      }

      // Then create the user with tenant_id in app_metadata
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            company_name: data.company_name
          }
        }
      })

      if (authError) {
        // Clean up tenant if user creation fails
        await this.supabase.from('tenants').delete().eq('id', tenant.id)
        throw new Error(`Demo mode: ${authError.message}`)
      }

      // Update user metadata with tenant_id and role using admin API
      if (authData.user) {
        const { error: updateError } = await this.supabase.auth.updateUser({
          data: {
            tenant_id: tenant.id,
            role: data.role
          }
        })

        if (updateError) {
          console.error('Failed to update user metadata:', updateError)
        }
      }

      return { user: authData.user, tenant }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  async signIn(data: SignInData) {
    const { data: authData, error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      throw new Error(`Demo mode: ${error.message}`)
    }

    return authData
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get tenant information
    const tenantId = user.app_metadata?.tenant_id
    let tenant = null
    
    if (tenantId) {
      const { data: tenantData } = await this.supabase
        .from('tenants')
        .select('name, type')
        .eq('id', tenantId)
        .single()
      
      tenant = tenantData
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.app_metadata?.role || 'borrower',
      tenant_id: tenantId,
      tenant_name: tenant?.name,
      tenant_type: tenant?.type,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }
  }

  async updateProfile(updates: Partial<UserProfile>) {
    const { error } = await this.supabase.auth.updateUser({
      data: updates
    })

    if (error) {
      throw error
    }

    return this.getCurrentUser()
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const profile = await this.getCurrentUser()
        callback(profile)
      } else {
        callback(null)
      }
    })
  }
}