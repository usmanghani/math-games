import { describe, it, expect } from 'vitest'
import { getPreviousLevel, DEFAULT_LEVELS } from './levels'

describe('levels', () => {
  describe('DEFAULT_LEVELS', () => {
    it('contains 10 levels', () => {
      expect(DEFAULT_LEVELS).toHaveLength(10)
    })

    it('has sequential level numbers from 1 to 10', () => {
      DEFAULT_LEVELS.forEach((level, index) => {
        expect(level.levelNumber).toBe(index + 1)
      })
    })

    it('has increasing delta values', () => {
      for (let i = 1; i < DEFAULT_LEVELS.length; i++) {
        expect(DEFAULT_LEVELS[i].delta).toBeGreaterThan(DEFAULT_LEVELS[i - 1].delta)
      }
    })

    it('has increasing maxRange values', () => {
      for (let i = 1; i < DEFAULT_LEVELS.length; i++) {
        expect(DEFAULT_LEVELS[i].maxRange).toBeGreaterThan(DEFAULT_LEVELS[i - 1].maxRange)
      }
    })

    it('all levels have minRange of 0', () => {
      DEFAULT_LEVELS.forEach((level) => {
        expect(level.minRange).toBe(0)
      })
    })

    it('all levels support both addition and subtraction', () => {
      DEFAULT_LEVELS.forEach((level) => {
        expect(level.operations).toEqual(['addition', 'subtraction'])
      })
    })

    it('all levels have 60% required accuracy', () => {
      DEFAULT_LEVELS.forEach((level) => {
        expect(level.requiredAccuracy).toBe(0.6)
      })
    })

    it('level 1 has correct configuration', () => {
      const level1 = DEFAULT_LEVELS[0]
      expect(level1).toEqual({
        levelNumber: 1,
        delta: 2,
        minRange: 0,
        maxRange: 10,
        operations: ['addition', 'subtraction'],
        requiredAccuracy: 0.6,
      })
    })

    it('level 10 has correct configuration', () => {
      const level10 = DEFAULT_LEVELS[9]
      expect(level10).toEqual({
        levelNumber: 10,
        delta: 11,
        minRange: 0,
        maxRange: 55,
        operations: ['addition', 'subtraction'],
        requiredAccuracy: 0.6,
      })
    })
  })

  describe('getPreviousLevel', () => {
    it('returns previous level number for level > 1', () => {
      expect(getPreviousLevel(5)).toBe(4)
      expect(getPreviousLevel(10)).toBe(9)
      expect(getPreviousLevel(2)).toBe(1)
    })

    it('returns null for level 1 (no previous level)', () => {
      expect(getPreviousLevel(1)).toBeNull()
    })

    it('returns null for level 0', () => {
      expect(getPreviousLevel(0)).toBeNull()
    })

    it('handles negative level numbers', () => {
      expect(getPreviousLevel(-1)).toBeNull()
      expect(getPreviousLevel(-10)).toBeNull()
    })

    it('works correctly for very high level numbers', () => {
      expect(getPreviousLevel(100)).toBe(99)
      expect(getPreviousLevel(1000)).toBe(999)
    })
  })
})
