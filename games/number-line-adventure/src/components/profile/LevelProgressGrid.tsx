'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface LevelProgressGridProps {
  userId: string
}

export function LevelProgressGrid({ userId }: LevelProgressGridProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [levels, setLevels] = useState<UserProgress[]>([])

  useEffect(() => {
    loadLevels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadLevels = async () => {
    if (!isSupabaseConfigured()) {
      setError('Level progress requires Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('level_number', { ascending: true })

      if (fetchError) {
        console.error('Error loading level progress:', fetchError)
        setError('Failed to load level progress')
        setLoading(false)
        return
      }

      setLevels((data || []) as UserProgress[])
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
        <div className="text-center text-gray-600">
          Loading level progress...
        </div>
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

  // Ensure we have all 10 levels (fill in missing ones)
  const allLevels: (UserProgress | null)[] = Array.from(
    { length: 10 },
    (_, i) => {
      const levelNum = i + 1
      return levels.find((l) => l.level_number === levelNum) || null
    }
  )

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Level Progress</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {allLevels.map((level, index) => {
          const levelNumber = index + 1
          const isUnlocked = level?.is_unlocked || false
          const isCompleted = level?.is_completed || false
          const bestScore = level?.best_score
          const bestStreak = level?.best_streak
          const coinsEarned = level?.coins_earned || 0
          const totalAttempts = level?.total_attempts || 0

          return (
            <div
              key={levelNumber}
              className={`rounded-xl p-4 border-2 transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400'
                  : isUnlocked
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Level Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-700">
                  {levelNumber}
                </div>
                <div className="text-xl">
                  {isCompleted ? '✅' : isUnlocked ? '🔓' : '🔒'}
                </div>
              </div>

              {/* Status Label */}
              <div
                className={`text-xs font-medium mb-2 ${
                  isCompleted
                    ? 'text-green-700'
                    : isUnlocked
                      ? 'text-blue-700'
                      : 'text-gray-500'
                }`}
              >
                {isCompleted
                  ? 'Completed'
                  : isUnlocked
                    ? 'Unlocked'
                    : 'Locked'}
              </div>

              {/* Stats */}
              {isUnlocked && (
                <div className="space-y-1">
                  {/* Best Score */}
                  {bestScore !== null && bestScore !== undefined ? (
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Score:</span> {bestScore}/5
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Not played yet
                    </div>
                  )}

                  {/* Best Streak */}
                  {bestStreak !== null && bestStreak !== undefined && (
                    <div className="text-xs text-gray-700">
                      <span className="font-medium">Streak:</span> {bestStreak}
                    </div>
                  )}

                  {/* Coins Earned */}
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">Coins:</span> {coinsEarned} 🪙
                  </div>

                  {/* Total Attempts */}
                  {totalAttempts > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Attempts:</span>{' '}
                      {totalAttempts}
                    </div>
                  )}
                </div>
              )}

              {/* Locked message */}
              {!isUnlocked && (
                <div className="text-xs text-gray-400 mt-2">
                  Complete previous levels to unlock
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
