'use client'

import { useEffect } from 'react'
import { useProgress } from '@/hooks/useProgress'
import { useAuth } from '@/contexts/AuthContext'
import { LevelCard } from './LevelCard'

export function LevelGrid() {
  const { user } = useAuth()
  const { levels, setUserId, loading, error } = useProgress()

  // Load progress when user changes
  useEffect(() => {
    if (user) {
      setUserId(user.id)
    } else {
      setUserId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">Loading levels...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {levels.map((level) => (
          <LevelCard key={level.levelNumber} level={level} />
        ))}
      </div>
    </div>
  )
}
