import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Supabase client configuration
// These environment variables should be set in .env.local (development)
// and in Vercel environment variables (production)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a single supabase client for interacting with your database
// Note: If environment variables are missing, this will create a non-functional client
// This allows the app to build successfully, but database operations will fail at runtime
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Helper function to throw a helpful error if Supabase is not configured
export function requireSupabase(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. See .env.example for details.'
    )
  }
}
