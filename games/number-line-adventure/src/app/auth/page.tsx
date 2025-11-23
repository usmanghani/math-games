'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'

function AuthPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const modeParam = searchParams.get('mode')

  const initialMode = useMemo(() => {
    return modeParam === 'signup' ? 'signup' : 'login'
  }, [modeParam])

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // Keep the tab in sync with the URL query
  useEffect(() => {
    if (modeParam === 'signup' || modeParam === 'login') {
      setMode(modeParam)
    }
  }, [modeParam])

  // Redirect if already authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (user) {
    router.push(redirectTo)
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Number Line Adventure
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Welcome back!' : 'Join the adventure!'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mode Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {mode === 'login' ? (
            <LoginForm redirectTo={redirectTo} />
          ) : (
            <SignUpForm redirectTo={redirectTo} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  )
}
