import { useProgressStore, LevelProgress } from '@/stores/progressStore'

/**
 * Convenience hook for accessing progress store
 * Provides computed values and easy access to level data
 */
export function useProgress() {
  const store = useProgressStore()

  // Convert Map to array for easier iteration in components
  const levelsArray = Array.from(store.levels.values()).sort(
    (a, b) => a.levelNumber - b.levelNumber
  )

  // Get specific level
  const getLevel = (levelNumber: number): LevelProgress | undefined => {
    return store.levels.get(levelNumber)
  }

  // Check if level is unlocked
  const isLevelUnlocked = (levelNumber: number): boolean => {
    return store.levels.get(levelNumber)?.isUnlocked ?? false
  }

  // Check if level is completed
  const isLevelCompleted = (levelNumber: number): boolean => {
    return store.levels.get(levelNumber)?.isCompleted ?? false
  }

  // Get total completed levels
  const completedLevelsCount = levelsArray.filter((l) => l.isCompleted).length

  // Get total unlocked levels
  const unlockedLevelsCount = levelsArray.filter((l) => l.isUnlocked).length

  // Calculate overall progress percentage
  const progressPercentage = Math.round((completedLevelsCount / levelsArray.length) * 100)

  // Get highest unlocked level
  const highestUnlockedLevel = Math.max(
    ...levelsArray.filter((l) => l.isUnlocked).map((l) => l.levelNumber),
    1
  )

  return {
    // State
    userId: store.userId,
    levels: levelsArray,
    currentLevel: store.currentLevel,
    loading: store.loading,
    error: store.error,
    lastSyncedAt: store.lastSyncedAt,

    // Computed values
    completedLevelsCount,
    unlockedLevelsCount,
    progressPercentage,
    highestUnlockedLevel,

    // Helper methods
    getLevel,
    isLevelUnlocked,
    isLevelCompleted,

    // Actions
    setUserId: store.setUserId,
    setCurrentLevel: store.setCurrentLevel,
    loadProgress: store.loadProgress,
    updateLevelProgress: store.updateLevelProgress,
    unlockLevel: store.unlockLevel,
    completeLevel: store.completeLevel,
    resetProgress: store.resetProgress,
    syncWithServer: store.syncWithServer,
  }
}

/**
 * Hook for accessing specific level progress
 */
export function useLevelProgress(levelNumber: number) {
  const store = useProgressStore()
  const levelData = store.levels.get(levelNumber)

  return {
    level: levelData,
    isUnlocked: levelData?.isUnlocked ?? false,
    isCompleted: levelData?.isCompleted ?? false,
    bestScore: levelData?.bestScore ?? null,
    bestStreak: levelData?.bestStreak ?? null,
    attemptsCount: levelData?.attemptsCount ?? 0,
    lastPlayedAt: levelData?.lastPlayedAt ?? null,
  }
}
