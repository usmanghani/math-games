'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/contexts/AuthContext'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { AchievementBadges } from '@/components/profile/AchievementBadges'
import { PerformanceChart } from '@/components/profile/PerformanceChart'
import { LevelProgressGrid } from '@/components/profile/LevelProgressGrid'
import { GameHistory } from '@/components/profile/GameHistory'

function ProfilePageContent() {
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
      <div className="max-w-6xl mx-auto pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Customize your Number Line Adventure experience and track your progress
          </p>
        </div>

        {/* Profile Form */}
        <div className="mb-8">
          <ProfileForm userId={user.id} userEmail={user.email || ''} />
        </div>

        {/* Statistics Overview */}
        <div className="mb-8">
          <ProfileStats userId={user.id} />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <AchievementBadges userId={user.id} />
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <PerformanceChart userId={user.id} />
        </div>

        {/* Level Progress Grid */}
        <div className="mb-8">
          <LevelProgressGrid userId={user.id} />
        </div>

        {/* Game History */}
        <div className="mb-8">
          <GameHistory userId={user.id} />
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium text-lg"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  )
}
