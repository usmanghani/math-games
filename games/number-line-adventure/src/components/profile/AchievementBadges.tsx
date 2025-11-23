'use client'

import { useMemo } from 'react'
import { useProgress } from '@/hooks/useProgress'

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
  const { levels, coins } = useProgress()

  const badges = useMemo(() => {
    const levelsCompleted = levels.filter((l) => l.isCompleted).length
    const bestStreak = Math.max(0, ...levels.map((l) => l.bestStreak || 0))
    const hasPerfectScore = levels.some((l) => l.bestScore === 5)
    const totalAttempts = levels.reduce((sum, level) => sum + level.attemptsCount, 0)
    const totalCorrect = levels.reduce((sum, level) => sum + (level.bestScore || 0), 0)
    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / (totalAttempts * 5)) * 100) : 0

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
        unlocked: coins >= 100,
        progress: coins < 100 ? `${coins}/100 coins` : undefined,
      },
      {
        id: 'accuracy_master',
        name: 'Accuracy Master',
        description: 'Achieve 80%+ overall accuracy',
        emoji: '🎓',
        unlocked: accuracy >= 80 && totalAttempts > 0,
        progress:
          totalAttempts === 0
            ? 'Play some games'
            : accuracy < 80
              ? `${accuracy}%/80%`
              : undefined,
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

    return achievementBadges
  }, [levels, coins])

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
