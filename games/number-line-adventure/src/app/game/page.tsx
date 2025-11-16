'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GameClient from '@/components/GameClient'
import { getLevelConfigWithFallback, type LevelConfig } from '@/lib/levels'
import { useRequireAuth } from '@/contexts/AuthContext'

function GamePageContent() {
  const { user, loading: authLoading } = useRequireAuth()
  const searchParams = useSearchParams()
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const levelParam = searchParams.get('level')
  const levelNumber = levelParam ? parseInt(levelParam, 10) : 1

  useEffect(() => {
    async function loadLevel() {
      try {
        setLoading(true)
        setError(null)

        // Validate level number
        if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 10) {
          setError('Invalid level number. Please select a level from 1-10.')
          setLoading(false)
          return
        }

        // Load level configuration
        const config = await getLevelConfigWithFallback(levelNumber)
        setLevelConfig(config)
      } catch (err) {
        console.error('Error loading level:', err)
        setError('Failed to load level configuration.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadLevel()
    }
  }, [levelNumber, authLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // useRequireAuth guarantees user is not null after loading
  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/levels"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Back to Level Selection
          </Link>
        </div>
      </div>
    )
  }

  if (!levelConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="text-xl">Loading level...</div>
      </div>
    )
  }

  return <GameClient levelNumber={levelNumber} levelConfig={levelConfig} />
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  )
}
