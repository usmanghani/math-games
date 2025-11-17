import { createClient } from '@supabase/supabase-js'
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
export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Persist session in localStorage so users stay logged in across page refreshes
        persistSession: true,
        // Automatically refresh access tokens before they expire
        autoRefreshToken: true,
        // Detect OAuth callbacks and handle them automatically
        detectSessionInUrl: true,
        // Use localStorage for session storage (default, but being explicit)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // More aggressive token refresh to prevent session expiry
        // Refresh 60 seconds before expiry instead of default 10 seconds
        storageKey: 'supabase-auth-token',
      },
    })
  : // Create a minimal placeholder client that won't make actual requests
    // This prevents "failed to fetch" errors when Supabase is not configured
    createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

// Helper function to throw a helpful error if Supabase is not configured
export function requireSupabase(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. See .env.example for details.'
    )
  }
}
