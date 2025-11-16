'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/contexts/AuthContext'
import { LevelGrid } from '@/components/levels/LevelGrid'

function LevelsPageContent() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // useRequireAuth guarantees user is not null after loading
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Select a Level
          </h1>
          <p className="text-gray-600">
            Complete levels to unlock new challenges
          </p>
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
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            My Profile →
          </Link>
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
