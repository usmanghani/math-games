'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LevelGrid } from '@/components/levels/LevelGrid'
import CoinDisplay from '@/components/CoinDisplay'

function LevelsPageContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      {/* Show sign-in banner if not authenticated */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center">
          <p className="text-sm">
            Playing as guest. Progress is saved locally only.{' '}
            <Link
              href="/auth?mode=signup"
              className="underline font-semibold hover:text-blue-100"
            >
              Sign up
            </Link>{' '}
            or{' '}
            <Link
              href="/auth?mode=login"
              className="underline font-semibold hover:text-blue-100"
            >
              sign in
            </Link>{' '}
            to save your progress to the cloud!
          </p>
        </div>
      )}
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Select a Level
          </h1>
          <p className="text-gray-600 mb-4">
            Complete levels to unlock new challenges
          </p>
          <div className="flex justify-center">
            <CoinDisplay />
          </div>
        </div>

        {/* Level Grid */}
        <LevelGrid />

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              My Profile →
            </Link>
          ) : (
            <Link
              href="/auth"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In to Save Progress →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LevelsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <LevelsPageContent />
    </Suspense>
  )
}
