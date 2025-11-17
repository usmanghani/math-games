'use client'

import Link from 'next/link'
import { LevelProgress, useProgressStore } from '@/stores/progressStore'
import { calculateLevelCost, canAffordLevel } from '@/lib/coins'
import { useState } from 'react'

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

  const coins = useProgressStore((state) => state.coins)
  const unlockLevel = useProgressStore((state) => state.unlockLevel)
  const [isUnlocking, setIsUnlocking] = useState(false)

  const cost = calculateLevelCost(levelNumber)
  const canAfford = canAffordLevel(coins, levelNumber)

  // Handler for unlock button
  const handleUnlock = async () => {
    if (!canAfford || isUnlocking) return

    setIsUnlocking(true)
    const success = await unlockLevel(levelNumber)
    if (!success) {
      setIsUnlocking(false)
    }
    // If successful, the component will re-render with isUnlocked=true
  }

  // Locked card - show unlock button
  if (!isUnlocked) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-gray-200 relative">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-xl font-bold text-gray-500">
          Level {levelNumber}
        </div>

        {/* Cost Display */}
        <div className="mt-2 flex items-center gap-1 text-sm">
          <span className="text-base">🪙</span>
          <span className={canAfford ? 'text-green-600 font-semibold' : 'text-gray-500'}>
            {cost}
          </span>
        </div>

        {/* Unlock Button */}
        {canAfford ? (
          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        ) : (
          <div className="mt-3 text-xs text-gray-400 text-center">
            Need {cost - coins} more coins
          </div>
        )}
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
