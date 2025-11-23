'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type GameSession = Database['public']['Tables']['game_sessions']['Row']

interface GameHistoryProps {
  userId: string
}

export function GameHistory({ userId }: GameHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadHistory = async () => {
    if (!isSupabaseConfigured()) {
      setError('Game history requires Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(20)

      if (fetchError) {
        console.error('Error loading game history:', fetchError)
        setError('Failed to load game history')
        setLoading(false)
        return
      }

      setSessions((data || []) as GameSession[])
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const toggleExpand = (sessionId: string) => {
    setExpandedId(expandedId === sessionId ? null : sessionId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600">Loading game history...</div>
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

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Game History</h2>
        <div className="text-center text-gray-500 text-sm py-8">
          No games played yet. Start playing to build your history!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Game History
        <span className="text-sm text-gray-500 ml-2 font-normal">
          (Last 20 games)
        </span>
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => {
          const isExpanded = expandedId === session.id
          const answers = session.answers as Array<{
            question: string
            userAnswer: number | null
            correctAnswer: number
            isCorrect: boolean
          }>

          return (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md"
            >
              {/* Session Summary */}
              <button
                onClick={() => toggleExpand(session.id)}
                className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Level Badge */}
                  <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                    L{session.level_number}
                  </div>

                  {/* Stats */}
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800">
                      Level {session.level_number}
                    </div>
                    <div className="text-xs text-gray-600">
                      Score: {session.score}/5 • Streak: {session.best_streak}{' '}
                      • {formatDate(session.completed_at)}
                    </div>
                  </div>
                </div>

                {/* Expand Arrow */}
                <div
                  className={`text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Question Details:
                  </div>
                  <div className="space-y-2">
                    {answers && answers.length > 0 ? (
                      answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            answer.isCorrect
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium text-gray-700">
                              Question {index + 1}
                            </div>
                            <div className="text-lg">
                              {answer.isCorrect ? '✓' : '✗'}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {answer.question}
                          </div>
                          <div className="text-xs text-gray-600">
                            Your answer:{' '}
                            <span
                              className={
                                answer.isCorrect
                                  ? 'text-green-700 font-medium'
                                  : 'text-red-700 font-medium'
                              }
                            >
                              {answer.userAnswer ?? 'No answer'}
                            </span>
                            {!answer.isCorrect && (
                              <span className="ml-2 text-gray-700">
                                • Correct: {answer.correctAnswer}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No answer details available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
