'use client'

// Demo authentication system for investor presentation
// This provides a working demo without requiring full Supabase setup

export interface DemoUser {
  id: string
  email: string
  name: string
  role: 'borrower' | 'investor' | 'admin'
  company?: string
}

// Demo users for the presentation
const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo_borrower_1',
    email: 'borrower@demo.com',
    name: 'John Smith',
    role: 'borrower',
    company: 'Acme Manufacturing Corp'
  },
  {
    id: 'demo_investor_1',
    email: 'investor@demo.com',
    name: 'Sarah Johnson',
    role: 'investor',
    company: 'Capital Partners Alpha'
  },
  {
    id: 'demo_admin_1',
    email: 'admin@demo.com',
    name: 'Mike Wilson',
    role: 'admin',
    company: 'LendingPlatform Inc'
  }
]

class DemoAuthService {
  private currentUser: DemoUser | null = null

  constructor() {
    // Check for stored user on initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_user')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
  }

  async signIn(email: string, password: string): Promise<DemoUser> {
    // For demo, accept any password for demo users
    const user = DEMO_USERS.find(u => u.email === email)
    
    if (!user) {
      throw new Error('User not found. Try: borrower@demo.com, investor@demo.com, or admin@demo.com')
    }

    this.currentUser = user
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(user))
    }

    return user
  }

  async signUp(email: string, password: string, name: string, role: 'borrower' | 'investor', company?: string): Promise<DemoUser> {
    // For demo, create a new user
    const newUser: DemoUser = {
      id: `demo_${role}_${Date.now()}`,
      email,
      name,
      role,
      company
    }

    this.currentUser = newUser
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(newUser))
    }

    return newUser
  }

  async signOut(): Promise<void> {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user')
    }
  }

  getCurrentUser(): DemoUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  requireAuth(): DemoUser {
    if (!this.currentUser) {
      throw new Error('Authentication required')
    }
    return this.currentUser
  }
}

export const demoAuth = new DemoAuthService()