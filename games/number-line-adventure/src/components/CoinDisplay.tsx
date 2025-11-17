'use client'

import { useProgressStore } from '@/stores/progressStore'

interface CoinDisplayProps {
  className?: string
}

export default function CoinDisplay({ className = '' }: CoinDisplayProps) {
  const coins = useProgressStore((state) => state.coins)

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full shadow-md font-bold ${className}`}
      aria-label={`You have ${coins} coins`}
    >
      <span className="text-2xl" aria-hidden="true">
        🪙
      </span>
      <span className="text-lg">{coins}</span>
    </div>
  )
}
