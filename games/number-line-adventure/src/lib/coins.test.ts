import { describe, it, expect } from 'vitest'
import {
  calculateLevelCost,
  canAffordLevel,
  calculateTotalCostUpToLevel,
} from './coins'
import { DEFAULT_LEVELS } from './levels'

describe('coins', () => {
  describe('calculateLevelCost', () => {
    it('returns 0 for level 1 (always free)', () => {
      expect(calculateLevelCost(1)).toBe(0)
    })

    it('returns 0 for level 0 or negative', () => {
      expect(calculateLevelCost(0)).toBe(0)
      expect(calculateLevelCost(-1)).toBe(0)
    })

    it('calculates correct cost for level 2 (5 * 2 = 10)', () => {
      expect(calculateLevelCost(2)).toBe(10)
    })

    it('calculates correct cost for level 3 (5 * 3 = 15)', () => {
      expect(calculateLevelCost(3)).toBe(15)
    })

    it('calculates cost using formula 5 * levelNumber', () => {
      // Level 2: 5 * 2 = 10
      expect(calculateLevelCost(2)).toBe(10)
      // Level 3: 5 * 3 = 15
      expect(calculateLevelCost(3)).toBe(15)
      // Level 10: 5 * 10 = 50
      expect(calculateLevelCost(10)).toBe(50)
    })

    it('calculates cost for all default levels', () => {
      DEFAULT_LEVELS.forEach((level) => {
        if (level.levelNumber === 1) {
          expect(calculateLevelCost(level.levelNumber)).toBe(0)
        } else {
          expect(calculateLevelCost(level.levelNumber)).toBe(5 * level.levelNumber)
        }
      })
    })

    it('calculates cost using only level number', () => {
      // Level 5 always costs 5 * 5 = 25
      expect(calculateLevelCost(5)).toBe(25)
      expect(calculateLevelCost(7)).toBe(35)
      expect(calculateLevelCost(100)).toBe(500)
    })

    it('calculates cost for any level number (no config needed)', () => {
      expect(calculateLevelCost(999)).toBe(4995) // 5 * 999
    })
  })

  describe('canAffordLevel', () => {
    it('returns true when player has exact coins needed', () => {
      expect(canAffordLevel(10, 2)).toBe(true) // Level 2 costs 10
    })

    it('returns true when player has more coins than needed', () => {
      expect(canAffordLevel(20, 2)).toBe(true) // Level 2 costs 10
    })

    it('returns false when player has fewer coins than needed', () => {
      expect(canAffordLevel(5, 2)).toBe(false) // Level 2 costs 10
    })

    it('returns true for level 1 (always free)', () => {
      expect(canAffordLevel(0, 1)).toBe(true)
    })

    it('works with any level number', () => {
      // Level 5 costs 25 (5*5)
      expect(canAffordLevel(24, 5)).toBe(false)
      expect(canAffordLevel(25, 5)).toBe(true)
      expect(canAffordLevel(26, 5)).toBe(true)
    })
  })

  describe('calculateTotalCostUpToLevel', () => {
    it('returns 0 for level 1 (level 1 is free)', () => {
      expect(calculateTotalCostUpToLevel(1)).toBe(0)
    })

    it('returns cost of level 2 only when unlocking up to level 2', () => {
      expect(calculateTotalCostUpToLevel(2)).toBe(10) // Only level 2
    })

    it('returns sum of costs for levels 2 and 3', () => {
      // Level 2: 5 * 2 = 10
      // Level 3: 5 * 3 = 15
      expect(calculateTotalCostUpToLevel(3)).toBe(25) // 10 + 15
    })

    it('calculates total cost for all 10 levels', () => {
      // Level 2: 5*2=10, Level 3: 5*3=15, ..., Level 10: 5*10=50
      // Sum = 10+15+20+25+30+35+40+45+50 = 270
      const totalCost = calculateTotalCostUpToLevel(10)

      // Verify by manual calculation
      let expectedCost = 0
      for (let i = 2; i <= 10; i++) {
        expectedCost += calculateLevelCost(i)
      }

      expect(totalCost).toBe(expectedCost)
      expect(totalCost).toBe(270) // Sum of 10+15+20+25+30+35+40+45+50
    })

    it('calculates total cost for specific ranges', () => {
      // Level 2: 5*2=10, Level 3: 5*3=15, Total=25
      expect(calculateTotalCostUpToLevel(3)).toBe(25)

      // Level 2-5: 10+15+20+25 = 70
      expect(calculateTotalCostUpToLevel(5)).toBe(70)
    })
  })

  describe('integration: coin economy balance', () => {
    it('requires more coins as levels increase (linear cost growth)', () => {
      const costs = Array.from({ length: 9 }, (_, i) => calculateLevelCost(i + 2))
      const isStrictlyIncreasing = costs.every((cost, index) => index === 0 || cost > costs[index - 1])
      expect(isStrictlyIncreasing).toBe(true)
    })

    it('total cost grows with the requested level count', () => {
      const costToLevel5 = calculateTotalCostUpToLevel(5)
      const costToLevel10 = calculateTotalCostUpToLevel(10)

      expect(costToLevel10).toBeGreaterThan(costToLevel5)
      expect(costToLevel10).toBe(270)
      expect(costToLevel5).toBe(70)
    })

    it('cost increases with each level', () => {
      for (let i = 2; i < 10; i++) {
        const currentCost = calculateLevelCost(i)
        const nextCost = calculateLevelCost(i + 1)
        expect(nextCost).toBeGreaterThan(currentCost)
      }
    })
  })
})
