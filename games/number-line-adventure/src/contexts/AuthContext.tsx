'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useProgressStore } from '@/stores/progressStore'

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
  const setUserId = useProgressStore((state) => state.setUserId)

  useEffect(() => {
    // Only attempt to get session if Supabase is configured
    if (!isConfigured) {
      setLoading(false)
      return
    }

    // Get initial session from storage (localStorage)
    // This will restore the session if user was previously logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      if (session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Session restored from storage:', session.user.email)
        }
        setSession(session)
        setUser(session.user)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('No existing session found')
        }
      }
      setLoading(false)
    })

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event, session?.user?.email)
      }

      // Update state based on auth event
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [isConfigured])

  // Sync user ID with progress store whenever user changes
  // This ensures progress is loaded/saved for authenticated users
  useEffect(() => {
    // Only sync when an authenticated user is present; avoid wiping guest/local progress
    if (user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Syncing user ID with progress store:', user.id)
      }
      setUserId(user.id)
    }
  }, [user?.id, setUserId])

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        error: {
          message: 'Authentication service is currently unavailable. Please try again later or contact support.',
          name: 'AuthConfigError',
          status: 500,
        } as AuthError,
      }
    }

    try {
      // Use environment-specific redirect for confirmation emails (falls back to current origin)
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const emailRedirectTo = `${siteUrl}/auth?mode=login`

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      })

      return { error }
    } catch (err) {
      // Handle network errors gracefully
      console.error('Sign up error:', err)
      return {
        error: {
          message: 'Unable to connect to authentication service. Please check your internet connection and try again.',
          name: 'NetworkError',
          status: 0,
        } as AuthError,
      }
    }
  }

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      return {
        error: {
          message: 'Authentication service is currently unavailable. Please try again later or contact support.',
          name: 'AuthConfigError',
          status: 500,
        } as AuthError,
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (err) {
      // Handle network errors gracefully
      console.error('Sign in error:', err)
      return {
        error: {
          message: 'Unable to connect to authentication service. Please check your internet connection and try again.',
          name: 'NetworkError',
          status: 0,
        } as AuthError,
      }
    }
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    if (!isConfigured) {
      return {
        error: {
          message: 'Authentication service is currently unavailable. Please try again later or contact support.',
          name: 'AuthConfigError',
          status: 500,
        } as AuthError,
      }
    }

    try {
      const { error } = await supabase.auth.signOut()

      // Clear user-bound state after sign-out to avoid mixing accounts
      setUserId(null)
      return { error }
    } catch (err) {
      // Handle network errors gracefully
      console.error('Sign out error:', err)
      return {
        error: {
          message: 'Unable to connect to authentication service. Please check your internet connection and try again.',
          name: 'NetworkError',
          status: 0,
        } as AuthError,
      }
    }
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
 * Hook that was previously used to require authentication
 * Now just returns auth state without throwing errors
 * Kept for backward compatibility with existing code
 *
 * Note: Authentication is now optional in this app
 */
export function useRequireAuth() {
  const { user, loading, isConfigured } = useAuth()

  // No longer throws errors - auth is optional
  return { user, loading, isConfigured }
}
