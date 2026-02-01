import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from './types'

export class AuthServer {
  private async getSupabase() {
    return await createClient()
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = await this.getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get tenant information
    const tenantId = user.app_metadata?.tenant_id
    let tenant = null
    
    if (tenantId) {
      const { data: tenantData } = await supabase
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

  async requireAuth(): Promise<UserProfile> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  }

  async requireRole(allowedRoles: string[]): Promise<UserProfile> {
    const user = await this.requireAuth()
    if (!allowedRoles.includes(user.role)) {
      throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
    }
    return user
  }

  async requireAdmin(): Promise<UserProfile> {
    return this.requireRole(['admin'])
  }

  async createTenantUser(email: string, password: string, tenantId: string, role: string) {
    const supabase = await this.getSupabase()
    
    // This would typically be done via Supabase Admin API
    // For now, we'll create a placeholder implementation
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: {
        tenant_id: tenantId,
        role: role
      },
      email_confirm: true
    })

    if (error) {
      throw error
    }

    return data.user
  }

  async updateUserRole(userId: string, role: string, tenantId?: string) {
    const supabase = await this.getSupabase()
    
    const updateData: any = { role }
    if (tenantId) {
      updateData.tenant_id = tenantId
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: updateData
    })

    if (error) {
      throw error
    }

    return data.user
  }
}