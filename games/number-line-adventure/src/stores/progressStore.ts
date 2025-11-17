import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface LevelProgress {
  levelNumber: number
  isUnlocked: boolean
  isCompleted: boolean
  bestScore: number | null
  bestStreak: number | null
  attemptsCount: number
  lastPlayedAt: string | null
}

interface ProgressState {
  // State
  userId: string | null
  levels: Map<number, LevelProgress>
  currentLevel: number
  loading: boolean
  error: string | null
  lastSyncedAt: string | null

  // Actions
  setUserId: (userId: string | null) => void
  setCurrentLevel: (level: number) => void
  loadProgress: (userId: string) => Promise<void>
  updateLevelProgress: (levelNumber: number, data: Partial<LevelProgress>) => Promise<void>
  unlockLevel: (levelNumber: number) => Promise<void>
  completeLevel: (levelNumber: number, score: number, streak: number) => Promise<void>
  resetProgress: () => void
  syncWithServer: () => Promise<void>
}

const initialLevels = (): Map<number, LevelProgress> => {
  const levels = new Map<number, LevelProgress>()
  // Initialize 10 levels (from PR #1/2)
  for (let i = 1; i <= 10; i++) {
    levels.set(i, {
      levelNumber: i,
      isUnlocked: i === 1, // Only level 1 unlocked by default
      isCompleted: false,
      bestScore: null,
      bestStreak: null,
      attemptsCount: 0,
      lastPlayedAt: null,
    })
  }
  return levels
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      levels: initialLevels(),
      currentLevel: 1,
      loading: false,
      error: null,
      lastSyncedAt: null,

      // Set user ID and load their progress
      setUserId: async (userId: string | null) => {
        set({ userId, loading: true, error: null })
        if (userId) {
          await get().loadProgress(userId)
        } else {
          // User logged out, reset to initial state
          set({
            levels: initialLevels(),
            currentLevel: 1,
            loading: false,
            lastSyncedAt: null,
          })
        }
      },

      // Set current level (for navigation)
      setCurrentLevel: (level: number) => {
        set({ currentLevel: level })
      },

      // Load progress from Supabase
      loadProgress: async (userId: string) => {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not configured, using local state only')
          set({ loading: false })
          return
        }

        try {
          set({ loading: true, error: null })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)

          if (error) {
            console.error('Error loading progress:', error)
            set({ error: 'Failed to load progress', loading: false })
            return
          }

          // Check if userId still matches before updating state
          // This prevents race conditions when user logs out/in quickly
          const currentUserId = get().userId
          if (currentUserId !== userId) {
            console.warn(
              `Ignoring stale loadProgress response for userId ${userId}, current userId is ${currentUserId}`
            )
            return
          }

          // Convert array to Map
          const levelsMap = new Map<number, LevelProgress>()

          if (data && data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.forEach((row: any) => {
              levelsMap.set(row.level_number, {
                levelNumber: row.level_number,
                isUnlocked: row.is_unlocked,
                isCompleted: row.is_completed,
                bestScore: row.best_score,
                bestStreak: row.best_streak,
                attemptsCount: row.attempts_count || 0,
                lastPlayedAt: row.last_played_at,
              })
            })
          } else {
            // No progress yet, initialize with defaults
            initialLevels().forEach((level, levelNumber) => {
              levelsMap.set(levelNumber, level)
            })
          }

          set({
            levels: levelsMap,
            loading: false,
            lastSyncedAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error('Error loading progress:', err)
          set({ error: 'An unexpected error occurred', loading: false })
        }
      },

      // Update specific level progress
      updateLevelProgress: async (levelNumber: number, data: Partial<LevelProgress>) => {
        const { userId, levels } = get()
        const currentLevelData = levels.get(levelNumber)

        if (!currentLevelData) {
          console.error(`Level ${levelNumber} not found`)
          return
        }

        const updatedLevel = { ...currentLevelData, ...data }
        const newLevels = new Map(levels)
        newLevels.set(levelNumber, updatedLevel)
        set({ levels: newLevels })

        // Sync to server if user is authenticated
        if (userId && isSupabaseConfigured()) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
              .from('user_progress')
              .update({
                is_unlocked: updatedLevel.isUnlocked,
                is_completed: updatedLevel.isCompleted,
                best_score: updatedLevel.bestScore,
                best_streak: updatedLevel.bestStreak,
                attempts_count: updatedLevel.attemptsCount,
                last_played_at: updatedLevel.lastPlayedAt,
              })
              .eq('user_id', userId)
              .eq('level_number', levelNumber)

            if (error) {
              console.error('Error updating progress:', error)
            } else {
              set({ lastSyncedAt: new Date().toISOString() })
            }
          } catch (err) {
            console.error('Error syncing progress:', err)
          }
        }
      },

      // Unlock a level
      unlockLevel: async (levelNumber: number) => {
        await get().updateLevelProgress(levelNumber, { isUnlocked: true })
      },

      // Complete a level and update scores
      completeLevel: async (levelNumber: number, score: number, streak: number) => {
        const { levels } = get()
        const levelData = levels.get(levelNumber)

        if (!levelData) return

        const updates: Partial<LevelProgress> = {
          isCompleted: true,
          attemptsCount: levelData.attemptsCount + 1,
          lastPlayedAt: new Date().toISOString(),
        }

        // Update best score if better
        if (levelData.bestScore === null || score > levelData.bestScore) {
          updates.bestScore = score
        }

        // Update best streak if better
        if (levelData.bestStreak === null || streak > levelData.bestStreak) {
          updates.bestStreak = streak
        }

        await get().updateLevelProgress(levelNumber, updates)

        // Check if should unlock next level (60% accuracy = 3/5 correct)
        const accuracy = score / 5
        if (accuracy >= 0.6 && levelNumber < 10) {
          await get().unlockLevel(levelNumber + 1)
        }
      },

      // Reset all progress (for testing or user request)
      resetProgress: () => {
        set({
          levels: initialLevels(),
          currentLevel: 1,
          error: null,
          lastSyncedAt: null,
        })
      },

      // Manual sync with server
      syncWithServer: async () => {
        const { userId } = get()
        if (userId) {
          await get().loadProgress(userId)
        }
      },
    }),
    {
      name: 'progress-storage',
      partialize: (state) => ({
        // Only persist these fields
        levels: Array.from(state.levels.entries()),
        currentLevel: state.currentLevel,
        userId: state.userId,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert levels array back to Map after rehydration
        if (state && Array.isArray(state.levels)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          state.levels = new Map(state.levels as any)
        }
      },
    }
  )
)
