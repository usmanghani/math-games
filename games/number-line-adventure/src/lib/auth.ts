import { supabase, isSupabaseConfigured, requireSupabase } from './supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Get the currently authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot get current user.')
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Check if a user is authenticated
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Get the current session
 * @returns Session object or null if no active session
 */
export async function getSession() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot get session.')
    return null
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

/**
 * Require authentication - throws if not authenticated
 * Useful for server-side checks
 */
export async function requireAuth(): Promise<User> {
  requireSupabase()

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Sign up a new user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns User object and error if any
 */
export async function signUpWithEmail(email: string, password: string) {
  requireSupabase()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign in a user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns User object and error if any
 */
export async function signInWithEmail(email: string, password: string) {
  requireSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  requireSupabase()

  const { error } = await supabase.auth.signOut()

  return { error }
}

/**
 * Send a password reset email
 * @param email User's email address
 */
export async function resetPassword(email: string) {
  requireSupabase()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  return { error }
}

/**
 * Update user password
 * @param newPassword New password
 */
export async function updatePassword(newPassword: string) {
  requireSupabase()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { error }
}

/**
 * Update user email
 * @param newEmail New email address
 */
export async function updateEmail(newEmail: string) {
  requireSupabase()

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  return { error }
}

/**
 * Check if email is available (not already registered)
 * Note: This is a client-side check and should not be solely relied upon for security
 * @param email Email to check
 * @returns true if email appears available, false otherwise
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  // Try to sign in with a dummy password
  // If user doesn't exist, we'll get a specific error
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: '__dummy_password_for_check__',
  })

  // If error message indicates user not found, email is available
  if (error?.message.includes('Invalid login credentials')) {
    return true
  }

  return false
}
