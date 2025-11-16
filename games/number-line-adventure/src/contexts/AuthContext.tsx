'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Authentication context interface
 */
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider component
 * Wraps the app and provides authentication state and methods
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    // Only attempt to get session if Supabase is configured
    if (!isConfigured) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isConfigured])

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        error: new Error('Supabase is not configured') as AuthError,
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    return { error }
  }

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        error: new Error('Supabase is not configured') as AuthError,
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    if (!isConfigured) {
      return {
        error: new Error('Supabase is not configured') as AuthError,
      }
    }

    const { error } = await supabase.auth.signOut()

    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to require authentication
 * Throws an error if user is not authenticated
 * Useful for protected pages
 */
export function useRequireAuth() {
  const { user, loading, isConfigured } = useAuth()

  if (!isConfigured) {
    throw new Error('Authentication is not configured. Please set up Supabase.')
  }

  if (!loading && !user) {
    throw new Error('Authentication required. Please sign in.')
  }

  return { user, loading }
}
