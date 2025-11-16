'use client'

import Link from 'next/link'
import { LevelProgress } from '@/stores/progressStore'

interface LevelCardProps {
  level: LevelProgress
}

export function LevelCard({ level }: LevelCardProps) {
  const {
    levelNumber,
    isUnlocked,
    isCompleted,
    bestScore,
    bestStreak,
  } = level

  // Locked card - not clickable
  if (!isUnlocked) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-gray-200 cursor-not-allowed opacity-60">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-xl font-bold text-gray-500">
          Level {levelNumber}
        </div>
        <div className="text-xs text-gray-400 mt-1">Locked</div>
      </div>
    )
  }

  // Unlocked card - clickable
  return (
    <Link
      href={`/game?level=${levelNumber}`}
      className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-xl">✅</div>
      )}

      {/* Level Number */}
      <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
        {levelNumber}
      </div>

      {/* Stats */}
      <div className="mt-2 text-center w-full">
        {bestScore !== null && (
          <div className="text-xs text-gray-600">
            Best: {bestScore}/5
          </div>
        )}
        {bestStreak !== null && (
          <div className="text-xs text-gray-600">
            Streak: {bestStreak}
          </div>
        )}
        {bestScore === null && (
          <div className="text-xs text-gray-500 italic">
            Not played
          </div>
        )}
      </div>

      {/* Play Indicator */}
      <div className="mt-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Play →
      </div>
    </Link>
  )
}
