import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Supabase client configuration
// These environment variables should be set in .env.local (development)
// and in Vercel environment variables (production)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}

// Create a single supabase client for interacting with your database
// Note: Only create the client if properly configured to avoid "failed to fetch" errors
// If not configured, create a placeholder client that won't make network requests
export const supabase = (isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Persist session in localStorage so users stay logged in across page refreshes
        // SECURITY NOTE: localStorage is accessible to JavaScript, creating XSS vulnerability risk.
        // For production apps with sensitive data, consider implementing httpOnly cookies instead.
        persistSession: true,
        // Automatically refresh access tokens before they expire
        autoRefreshToken: true,
        // Detect OAuth callbacks and handle them automatically
        detectSessionInUrl: true,
        // Use localStorage for session storage (default, but being explicit)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Custom storage key for auth tokens
        storageKey: 'supabase-auth-token',
      },
    })
  : // Create a minimal placeholder client that won't make actual requests
    // This prevents "failed to fetch" errors when Supabase is not configured
    // SECURITY: Using clearly invalid placeholder values that will fail immediately if accidentally used.
    // This is safer than using real demo tokens that could be misused if guards are bypassed.
    createClient<Database>(
      'https://invalid-placeholder-do-not-use.supabase.co',
      'INVALID_PLACEHOLDER_KEY_DO_NOT_USE_THIS_WILL_FAIL_IMMEDIATELY',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )) as SupabaseClient<Database>

// Helper function to throw a helpful error if Supabase is not configured
export function requireSupabase(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. See .env.example for details.'
    )
  }
}
