'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsLoading(status === 'loading')
  }, [status])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setIsLoading(false)
        return { success: false, error: 'Invalid email or password' }
      }

      if (result?.ok) {
        router.push('/admin')
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: 'Login failed' }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async (): Promise<void> => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  const user: User | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: (session.user as any).role as string,
  } : null

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!session?.user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}