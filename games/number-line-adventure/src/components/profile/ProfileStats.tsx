'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import CoinDisplay from '@/components/CoinDisplay'

type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface ProfileStatsProps {
  userId: string
}

export function ProfileStats({ userId }: ProfileStatsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalCoins: 0,
    levelsUnlocked: 0,
    levelsCompleted: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    bestStreak: 0,
    lastPlayedLevel: null as number | null,
    lastPlayedAt: null as string | null,
    lastCompletedLevel: null as number | null,
  })

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadStats = async () => {
    if (!isSupabaseConfigured()) {
      setError('Stats require Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      if (fetchError) {
        console.error('Error loading stats:', fetchError)
        setError('Failed to load statistics')
        setLoading(false)
        return
      }

      const progressData = (data || []) as UserProgress[]

      // Calculate stats
      const totalCoins = progressData.reduce(
        (sum, level) => sum + (level.coins_earned || 0),
        0
      )
      const levelsUnlocked = progressData.filter((l) => l.is_unlocked).length
      const levelsCompleted = progressData.filter((l) => l.is_completed).length
      const totalAttempts = progressData.reduce(
        (sum, level) => sum + (level.total_attempts || 0),
        0
      )
      const totalCorrect = progressData.reduce(
        (sum, level) => sum + (level.total_correct || 0),
        0
      )
      const bestStreak = Math.max(
        0,
        ...progressData.map((l) => l.best_streak || 0)
      )

      // Find most recent played level
      const levelsWithPlay = progressData.filter((l) => l.last_played_at)
      const mostRecentPlay = levelsWithPlay.sort(
        (a, b) =>
          new Date(b.last_played_at!).getTime() -
          new Date(a.last_played_at!).getTime()
      )[0]

      // Find most recent completed level
      const levelsWithCompletion = progressData.filter((l) => l.completed_at)
      const mostRecentCompletion = levelsWithCompletion.sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )[0]

      setStats({
        totalCoins,
        levelsUnlocked,
        levelsCompleted,
        totalAttempts,
        totalCorrect,
        bestStreak,
        lastPlayedLevel: mostRecentPlay?.level_number || null,
        lastPlayedAt: mostRecentPlay?.last_played_at || null,
        lastCompletedLevel: mostRecentCompletion?.level_number || null,
      })
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    )
  }

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
