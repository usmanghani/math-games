'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  unlocked: boolean
  progress?: string
}

interface AchievementBadgesProps {
  userId: string
}

export function AchievementBadges({ userId }: AchievementBadgesProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    loadBadges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadBadges = async () => {
    if (!isSupabaseConfigured()) {
      setError('Badges require Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // Fetch user progress data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      if (fetchError) {
        console.error('Error loading badges:', fetchError)
        setError('Failed to load achievements')
        setLoading(false)
        return
      }

      const progressData = (data || []) as UserProgress[]

      // Calculate achievement criteria
      const levelsCompleted = progressData.filter((l) => l.is_completed).length
      const totalCoins = progressData.reduce(
        (sum, level) => sum + (level.coins_earned || 0),
        0
      )
      const bestStreak = Math.max(
        0,
        ...progressData.map((l) => l.best_streak || 0)
      )
      const hasPerfectScore = progressData.some((l) => l.best_score === 5)
      const totalAttempts = progressData.reduce(
        (sum, level) => sum + (level.total_attempts || 0),
        0
      )
      const totalCorrect = progressData.reduce(
        (sum, level) => sum + (level.total_correct || 0),
        0
      )
      const accuracy =
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0

      // Define badges
      const achievementBadges: Badge[] = [
        {
          id: 'first_win',
          name: 'First Win',
          description: 'Complete your first level',
          emoji: '🎯',
          unlocked: levelsCompleted >= 1,
          progress: levelsCompleted >= 1 ? undefined : '0/1 levels',
        },
        {
          id: 'five_levels',
          name: 'Level Master',
          description: 'Complete 5 levels',
          emoji: '⭐',
          unlocked: levelsCompleted >= 5,
          progress: levelsCompleted < 5 ? `${levelsCompleted}/5 levels` : undefined,
        },
        {
          id: 'all_levels',
          name: 'Champion',
          description: 'Complete all 10 levels',
          emoji: '👑',
          unlocked: levelsCompleted >= 10,
          progress: levelsCompleted < 10 ? `${levelsCompleted}/10 levels` : undefined,
        },
        {
          id: 'perfect_score',
          name: 'Perfect Score',
          description: 'Get 5/5 on any level',
          emoji: '💯',
          unlocked: hasPerfectScore,
        },
        {
          id: 'coin_collector',
          name: 'Coin Collector',
          description: 'Earn 100+ total coins',
          emoji: '🪙',
          unlocked: totalCoins >= 100,
          progress: totalCoins < 100 ? `${totalCoins}/100 coins` : undefined,
        },
        {
          id: 'accuracy_master',
          name: 'Accuracy Master',
          description: 'Achieve 80%+ overall accuracy',
          emoji: '🎓',
          unlocked: accuracy >= 80 && totalAttempts > 0,
          progress: totalAttempts === 0 ? 'Play some games' : accuracy < 80 ? `${accuracy}%/80%` : undefined,
        },
        {
          id: 'streak_king',
          name: 'Streak King',
          description: 'Achieve a streak of 10+',
          emoji: '🔥',
          unlocked: bestStreak >= 10,
          progress: bestStreak < 10 ? `${bestStreak}/10 streak` : undefined,
        },
        {
          id: 'dedicated',
          name: 'Dedicated Player',
          description: 'Complete 50+ total attempts',
          emoji: '💪',
          unlocked: totalAttempts >= 50,
          progress: totalAttempts < 50 ? `${totalAttempts}/50 attempts` : undefined,
        },
      ]

      setBadges(achievementBadges)
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
        <div className="text-center text-gray-600">Loading achievements...</div>
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

  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
        <div className="text-sm text-gray-600">
          {unlockedCount}/{badges.length} unlocked
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-xl p-4 text-center transition-all ${
              badge.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-md'
                : 'bg-gray-50 border-2 border-gray-200 opacity-60'
            }`}
          >
            <div
              className={`text-4xl mb-2 ${
                badge.unlocked ? 'scale-110' : 'grayscale'
              }`}
            >
              {badge.emoji}
            </div>
            <div
              className={`text-sm font-semibold mb-1 ${
                badge.unlocked ? 'text-gray-800' : 'text-gray-500'
              }`}
            >
              {badge.name}
            </div>
            <div
              className={`text-xs ${
                badge.unlocked ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              {badge.description}
            </div>
            {!badge.unlocked && badge.progress && (
              <div className="text-xs text-gray-500 mt-2 font-medium">
                {badge.progress}
              </div>
            )}
            {badge.unlocked && (
              <div className="text-xs text-yellow-600 mt-2 font-semibold">
                ✓ Unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      {unlockedCount === 0 && (
        <div className="text-center text-gray-500 text-sm mt-6">
          Start playing to unlock achievements!
        </div>
      )}
    </div>
  )
}
