'use client'

import { useProgressStore } from '@/stores/progressStore'

interface CoinDisplayProps {
  className?: string
  levelNumber?: number // Optional: show coins from specific level. If not provided, shows total across all levels
  label?: string // Optional: custom label (e.g., "Level 1 coins:")
}

export default function CoinDisplay({ className = '', levelNumber, label }: CoinDisplayProps) {
  const getCoinsFromLevel = useProgressStore((state) => state.getCoinsFromLevel)
  const levels = useProgressStore((state) => state.levels)

  // If levelNumber is provided, show coins from that level only
  // Otherwise, show total coins across all levels
  const coins = levelNumber !== undefined
    ? getCoinsFromLevel(levelNumber)
    : Array.from(levels.values()).reduce((sum, level) => sum + level.coinsEarned, 0)

  const ariaLabel = levelNumber !== undefined
    ? `Level ${levelNumber} has ${coins} coins`
    : `You have ${coins} total coins`

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full shadow-md font-bold ${className}`}
      aria-label={ariaLabel}
    >
      {label && <span className="text-sm">{label}</span>}
      <span className="text-2xl" aria-hidden="true">
        🪙
      </span>
      <span className="text-lg">{coins}</span>
    </div>
  )
}
