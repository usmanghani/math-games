'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Number Line Adventure
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Strengthen gentle addition and subtraction by tracing our bunny&apos;s hops on a colorful number line.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {user ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                Welcome back, {user.email}!
              </h2>
              <Link
                href="/levels"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-4 px-6 rounded-lg transition-all text-center"
              >
                Start Playing →
              </Link>
              <Link
                href="/profile"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                My Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                Get Started
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Sign in to track your progress and unlock new levels!
              </p>
              <Link
                href="/auth?mode=signup"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-4 px-6 rounded-lg transition-all text-center"
              >
                Sign Up
              </Link>
              <Link
                href="/auth?mode=login"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
