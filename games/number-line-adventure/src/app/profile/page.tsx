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
import { useProgress } from '@/hooks/useProgress'
import CoinDisplay from '@/components/CoinDisplay'

function GuestProfileSummary() {
  const { coins, levels, completedLevelsCount, unlockedLevelsCount } = useProgress()

  const totalAttempts = levels.reduce((sum, level) => sum + level.attemptsCount, 0)
  const bestStreak = Math.max(0, ...levels.map((level) => level.bestStreak || 0))
  const lastPlayed = levels.reduce((latest, level) => {
    if (!level.lastPlayedAt) return latest
    if (!latest) return level

    return new Date(level.lastPlayedAt) > new Date(latest.lastPlayedAt || '')
      ? level
      : latest
  }, levels[0] ?? null)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Guest progress</h2>
            <p className="text-sm text-gray-600">
              You&apos;re playing as a guest. Progress stays on this device until you sign in.
            </p>
          </div>
          <CoinDisplay className="shrink-0" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500">Coins</div>
            <div className="text-2xl font-bold text-gray-800">{coins}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500">Levels unlocked</div>
            <div className="text-2xl font-bold text-gray-800">{unlockedLevelsCount}/10</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500">Levels completed</div>
            <div className="text-2xl font-bold text-gray-800">{completedLevelsCount}/10</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
            <div className="text-xs uppercase tracking-wide text-gray-500">Best streak</div>
            <div className="text-2xl font-bold text-gray-800">{bestStreak}</div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          {lastPlayed?.lastPlayedAt ? (
            <span>
              Last played Level {lastPlayed.levelNumber} on {new Date(lastPlayed.lastPlayedAt).toLocaleDateString()} • Attempts: {totalAttempts}
            </span>
          ) : (
            <span>Play any level to start tracking your stats.</span>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfilePageContent() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
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

        {user ? (
          <>
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
          </>
        ) : (
          <>
            <div className="mb-8">
              <GuestProfileSummary />
            </div>
            <div className="text-center text-sm text-gray-600 mb-8">
              <p className="mb-3">
                Sign in to sync your progress across devices and unlock profile customization.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/auth?mode=signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700">
                  Create account
                </Link>
                <Link href="/auth?mode=login" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
                  Sign in
                </Link>
              </div>
            </div>
          </>
        )}

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
