'use client'

import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type GameSession = Database['public']['Tables']['game_sessions']['Row']

interface PerformanceChartProps {
  userId: string
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartData, setChartData] = useState<
    Array<{
      level: number
      avgScore: number
      avgStreak: number
      totalGames: number
    }>
  >([])

  useEffect(() => {
    loadChartData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadChartData = async () => {
    if (!isSupabaseConfigured()) {
      setError('Charts require Supabase configuration')
      setLoading(false)
      return
    }

    try {
      // Fetch all game sessions for the user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true })

      if (fetchError) {
        console.error('Error loading chart data:', fetchError)
        setError('Failed to load performance data')
        setLoading(false)
        return
      }

      const sessions = (data || []) as GameSession[]

      // Group by level and calculate averages
      const levelStats = new Map<
        number,
        { totalScore: number; totalStreak: number; count: number }
      >()

      sessions.forEach((session) => {
        const level = session.level_number
        const existing = levelStats.get(level) || {
          totalScore: 0,
          totalStreak: 0,
          count: 0,
        }
        levelStats.set(level, {
          totalScore: existing.totalScore + session.score,
          totalStreak: existing.totalStreak + session.best_streak,
          count: existing.count + 1,
        })
      })

      // Convert to chart data format
      const chartDataArray: Array<{
        level: number
        avgScore: number
        avgStreak: number
        totalGames: number
      }> = []
      levelStats.forEach((stats, level) => {
        chartDataArray.push({
          level,
          avgScore: Math.round((stats.totalScore / stats.count) * 10) / 10,
          avgStreak: Math.round((stats.totalStreak / stats.count) * 10) / 10,
          totalGames: stats.count,
        })
      })

      // Sort by level number
      chartDataArray.sort((a: { level: number }, b: { level: number }) => a.level - b.level)

      setChartData(chartDataArray)
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
        <div className="text-center text-gray-600">Loading charts...</div>
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

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Performance Trends
        </h2>
        <div className="text-center text-gray-500 text-sm py-8">
          Play some games to see your performance trends!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Performance Trends
      </h2>

      {/* Average Score Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Average Score by Level
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="level"
              label={{ value: 'Level', position: 'insideBottom', offset: -5 }}
              stroke="#666"
            />
            <YAxis
              label={{
                value: 'Avg Score',
                angle: -90,
                position: 'insideLeft',
              }}
              domain={[0, 5]}
              stroke="#666"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgScore"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              name="Avg Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Average Streak Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Average Streak by Level
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="level"
              label={{ value: 'Level', position: 'insideBottom', offset: -5 }}
              stroke="#666"
            />
            <YAxis
              label={{
                value: 'Avg Streak',
                angle: -90,
                position: 'insideLeft',
              }}
              stroke="#666"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgStreak"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              name="Avg Streak"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Games Played by Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Games Played by Level
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="level"
              label={{ value: 'Level', position: 'insideBottom', offset: -5 }}
              stroke="#666"
            />
            <YAxis
              label={{
                value: 'Games',
                angle: -90,
                position: 'insideLeft',
              }}
              stroke="#666"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="totalGames"
              fill="#8b5cf6"
              name="Total Games"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
