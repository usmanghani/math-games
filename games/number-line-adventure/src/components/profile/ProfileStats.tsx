'use client'

import { useMemo } from 'react'
import CoinDisplay from '@/components/CoinDisplay'
import { useProgress } from '@/hooks/useProgress'

export function ProfileStats() {
  // We read from the local/global progress store so stats always render,
  // even if Supabase is unavailable or updates are delayed.
  const { levels, coins } = useProgress()

  const stats = useMemo(() => {
    const levelsUnlocked = levels.filter((l) => l.isUnlocked).length
    const levelsCompleted = levels.filter((l) => l.isCompleted).length
    const totalAttempts = levels.reduce((sum, level) => sum + level.attemptsCount, 0)
    const totalCorrect = levels.reduce((sum, level) => sum + (level.bestScore || 0), 0)
    const bestStreak = Math.max(0, ...levels.map((l) => l.bestStreak || 0))

    const mostRecentPlay = [...levels]
      .filter((l) => l.lastPlayedAt)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime()
      )[0]

    const mostRecentCompletion = [...levels]
      .filter((l) => l.isCompleted && l.lastPlayedAt)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt || 0).getTime() - new Date(a.lastPlayedAt || 0).getTime()
      )[0]

    return {
      totalCoins: coins,
      levelsUnlocked,
      levelsCompleted,
      totalAttempts,
      totalCorrect,
      bestStreak,
      lastPlayedLevel: mostRecentPlay?.levelNumber || null,
      lastPlayedAt: mostRecentPlay?.lastPlayedAt || null,
      lastCompletedLevel: mostRecentCompletion?.levelNumber || null,
    }
  }, [levels, coins])

  const accuracy =
    stats.totalAttempts > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
      : 0

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Statistics</h2>

      {/* Total Coins */}
      <div className="mb-6 flex justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Total Coins Earned</div>
          <CoinDisplay className="justify-center text-3xl" />
        </div>
      </div>

      {/* Progress Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Levels Unlocked */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.levelsUnlocked}/10
          </div>
          <div className="text-sm text-blue-700 mt-1">Levels Unlocked</div>
        </div>

        {/* Levels Completed */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.levelsCompleted}/10
          </div>
          <div className="text-sm text-green-700 mt-1">Levels Completed</div>
        </div>

        {/* Total Attempts */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.totalAttempts}
          </div>
          <div className="text-sm text-purple-700 mt-1">Total Attempts</div>
        </div>

        {/* Accuracy */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{accuracy}%</div>
          <div className="text-sm text-orange-700 mt-1">Accuracy</div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Correct */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl font-semibold text-gray-700">
            {stats.totalCorrect}
          </div>
          <div className="text-xs text-gray-600">Correct Answers</div>
        </div>

        {/* Best Streak */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xl font-semibold text-gray-700">
            {stats.bestStreak}
          </div>
          <div className="text-xs text-gray-600">Best Streak</div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.lastPlayedLevel && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
          <div className="text-sm font-medium text-indigo-900 mb-1">
            Recent Activity
          </div>
          <div className="text-xs text-indigo-700">
            Last played: Level {stats.lastPlayedLevel}
            {stats.lastPlayedAt && (
              <span className="ml-1">
                ({new Date(stats.lastPlayedAt).toLocaleDateString()})
              </span>
            )}
          </div>
          {stats.lastCompletedLevel && (
            <div className="text-xs text-indigo-700 mt-1">
              Last completed: Level {stats.lastCompletedLevel}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!stats.lastPlayedLevel && stats.levelsUnlocked === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          Start playing to see your statistics!
        </div>
      )}
    </div>
  )
}
