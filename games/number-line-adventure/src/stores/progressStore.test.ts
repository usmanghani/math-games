import { beforeEach, describe, expect, it } from 'vitest'
import { useProgressStore } from './progressStore'

const resetStore = () => {
  localStorage.clear()
  // Reset to a clean baseline
  useProgressStore.getState().resetProgress()
  useProgressStore.setState({
    userId: null,
    loading: false,
    error: null,
  })
}

describe('progressStore coin tracking (global balance)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('adds coins globally and auto-unlocks the next level when enough coins are earned', async () => {
    await useProgressStore.getState().completeLevel(1, 5, 3, 5)
    const state = useProgressStore.getState()

    expect(state.coins).toBe(10)
    expect(state.levels.get(2)?.isUnlocked).toBe(true)
  })

  it('prevents unlocking a level when global coins are insufficient', async () => {
    const unlocked = await useProgressStore.getState().unlockLevel(2)

    expect(unlocked).toBe(false)
    expect(useProgressStore.getState().levels.get(2)?.isUnlocked).toBe(false)
  })

  it('uses the global coin balance (not per-level coins) to unlock higher levels without deduction', async () => {
    await useProgressStore.getState().updateLevelProgress(1, { coinsEarned: 25 })

    const unlocked = await useProgressStore.getState().unlockLevel(3)
    const state = useProgressStore.getState()

    expect(unlocked).toBe(true)
    expect(state.levels.get(3)?.isUnlocked).toBe(true)
    expect(state.coins).toBe(25)
  })

  it('recalculates the global coin balance when loading locally (no Supabase)', async () => {
    await useProgressStore.getState().updateLevelProgress(1, { coinsEarned: 7 })
    useProgressStore.setState({ userId: 'test-user' })

    await useProgressStore.getState().loadProgress('test-user')

    expect(useProgressStore.getState().coins).toBe(7)
  })
})
