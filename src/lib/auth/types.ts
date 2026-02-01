export type UserRole = 'borrower' | 'investor' | 'admin'
export type TenantType = 'borrower' | 'investor' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  tenant_id: string
  tenant_name?: string
  tenant_type?: TenantType
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  app_metadata: {
    tenant_id: string
    role: UserRole
  }
  user_metadata: {
    full_name?: string
    company_name?: string
  }
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  company_name?: string
  role: UserRole
  tenant_type: TenantType
}

export interface SignInData {
  email: string
  password: string
}