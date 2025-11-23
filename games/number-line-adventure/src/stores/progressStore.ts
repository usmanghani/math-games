import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { calculateLevelCost } from '@/lib/coins'

export interface LevelProgress {
  levelNumber: number
  isUnlocked: boolean
  isCompleted: boolean
  bestScore: number | null
  bestStreak: number | null
  attemptsCount: number
  lastPlayedAt: string | null
  coinsEarned: number // Coins earned from completing this level
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
  getCoinsFromLevel: (levelNumber: number) => number
  unlockLevel: (levelNumber: number) => Promise<boolean>
  completeLevel: (levelNumber: number, score: number, streak: number, correctAnswers: number) => Promise<void>
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
      coinsEarned: 0, // Start with 0 coins earned
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

          // Load user progress
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
                attemptsCount: row.total_attempts || 0,
                lastPlayedAt: row.last_played_at,
                coinsEarned: row.coins_earned || 0,
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
              .upsert({
                user_id: userId,
                level_number: levelNumber,
                is_unlocked: updatedLevel.isUnlocked,
                is_completed: updatedLevel.isCompleted,
                best_score: updatedLevel.bestScore,
                best_streak: updatedLevel.bestStreak,
                total_attempts: updatedLevel.attemptsCount,
                last_played_at: updatedLevel.lastPlayedAt,
                coins_earned: updatedLevel.coinsEarned,
              }, {
                onConflict: 'user_id,level_number'
              })

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

      // Get coins earned from a specific level
      getCoinsFromLevel: (levelNumber: number): number => {
        const { levels } = get()
        const levelData = levels.get(levelNumber)
        return levelData?.coinsEarned ?? 0
      },

      // Unlock a level (requires coins from previous level, returns true if successful)
      unlockLevel: async (levelNumber: number): Promise<boolean> => {
        const { levels } = get()
        const levelData = levels.get(levelNumber)

        // Check if level exists and isn't already unlocked
        if (!levelData) {
          console.error(`Level ${levelNumber} not found`)
          return false
        }

        if (levelData.isUnlocked) {
          return true // Already unlocked
        }

        // Level 1 is always unlocked by default, can't unlock it manually
        if (levelNumber === 1) {
          return false
        }

        // Get coins from previous level (level N requires coins from level N-1)
        const previousLevelNumber = levelNumber - 1
        const coinsFromPreviousLevel = get().getCoinsFromLevel(previousLevelNumber)

        // Check if player has enough coins from previous level
        const cost = calculateLevelCost(levelNumber)

        if (coinsFromPreviousLevel < cost) {
          console.warn(
            `Not enough coins to unlock level ${levelNumber}. Need ${cost}, have ${coinsFromPreviousLevel} from level ${previousLevelNumber}`
          )
          return false
        }

        // Deduct coins from previous level and unlock current level
        const previousLevelData = levels.get(previousLevelNumber)
        if (!previousLevelData) {
          console.error(`Previous level ${previousLevelNumber} not found`)
          return false
        }

        // Update previous level to deduct coins
        await get().updateLevelProgress(previousLevelNumber, {
          coinsEarned: previousLevelData.coinsEarned - cost,
        })

        // Unlock the current level
        await get().updateLevelProgress(levelNumber, { isUnlocked: true })
        return true
      },

      // Complete a level and update scores
      completeLevel: async (levelNumber: number, score: number, streak: number, correctAnswers: number) => {
        const { levels } = get()
        const levelData = levels.get(levelNumber)

        if (!levelData) return

        // Award coins based on delta (Level N has delta=N+1)
        // Each correct answer earns delta coins (e.g., Level 1 with delta=2 earns 2 coins per correct answer)
        const delta = levelNumber + 1
        const newCoinsEarned = correctAnswers * delta
        const totalCoinsForLevel = levelData.coinsEarned + newCoinsEarned

        const updates: Partial<LevelProgress> = {
          isCompleted: true,
          attemptsCount: levelData.attemptsCount + 1,
          lastPlayedAt: new Date().toISOString(),
          coinsEarned: totalCoinsForLevel, // Add coins to this level's total
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

        // Auto-unlock next level if player has enough coins
        const nextLevelNumber = levelNumber + 1
        const nextLevelData = levels.get(nextLevelNumber)

        if (nextLevelData && !nextLevelData.isUnlocked) {
          const cost = calculateLevelCost(nextLevelNumber)

          // Check if this level has enough coins to unlock the next level
          if (totalCoinsForLevel >= cost) {
            // Automatically unlock the next level and deduct coins
            await get().unlockLevel(nextLevelNumber)
          }
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
