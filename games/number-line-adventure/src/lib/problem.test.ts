import { describe, it, expect } from 'vitest'
import { generateProblem, generateProblemFromLevel, type Operation } from './problem'

describe('generateProblem', () => {
  describe('basic generation', () => {
    it('generates a valid problem within default range (0-20)', () => {
      const problem = generateProblem()

      expect(problem.min).toBe(0)
      expect(problem.max).toBe(20)
      expect(problem.start).toBeGreaterThanOrEqual(0)
      expect(problem.start).toBeLessThanOrEqual(20)
      expect(problem.delta).toBeGreaterThanOrEqual(1)
      expect(problem.delta).toBeLessThanOrEqual(5)
      expect(['addition', 'subtraction']).toContain(problem.operation)
      expect(problem.answer).toBeGreaterThanOrEqual(0)
      expect(problem.answer).toBeLessThanOrEqual(20)
      expect(problem.options).toHaveLength(3)
      expect(problem.options).toContain(problem.answer)
      expect(problem.prompt).toBeTruthy()
    })

    it('generates a problem within custom range', () => {
      const problem = generateProblem({ min: 10, max: 30 })

      expect(problem.min).toBe(10)
      expect(problem.max).toBe(30)
      expect(problem.start).toBeGreaterThanOrEqual(10)
      expect(problem.start).toBeLessThanOrEqual(30)
      expect(problem.answer).toBeGreaterThanOrEqual(10)
      expect(problem.answer).toBeLessThanOrEqual(30)
    })

    it('normalizes inverted range (max < min)', () => {
      const problem = generateProblem({ min: 20, max: 0 })

      expect(problem.min).toBe(0)
      expect(problem.max).toBe(20)
    })

    it('generates a problem with fixed delta', () => {
      const problem = generateProblem(undefined, undefined, 3)

      expect(problem.delta).toBe(3)
    })
  })

  describe('operation types', () => {
    it('generates addition problems when only addition is allowed', () => {
      const problem = generateProblem(undefined, ['addition'])

      expect(problem.operation).toBe('addition')
      expect(problem.answer).toBe(problem.start + problem.delta)
    })

    it('generates subtraction problems when only subtraction is allowed', () => {
      const problem = generateProblem(undefined, ['subtraction'])

      expect(problem.operation).toBe('subtraction')
      expect(problem.answer).toBe(problem.start - problem.delta)
    })

    it('calculates correct answer for addition', () => {
      const problem = generateProblem({ min: 0, max: 10 }, ['addition'], 2)

      expect(problem.answer).toBe(problem.start + 2)
    })

    it('calculates correct answer for subtraction', () => {
      const problem = generateProblem({ min: 0, max: 10 }, ['subtraction'], 2)

      expect(problem.answer).toBe(problem.start - 2)
    })
  })

  describe('constraints and validation', () => {
    it('ensures answer is within range for addition', () => {
      // Run multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        const problem = generateProblem({ min: 0, max: 10 }, ['addition'])

        expect(problem.start + problem.delta).toBeLessThanOrEqual(10)
        expect(problem.answer).toBeGreaterThanOrEqual(0)
        expect(problem.answer).toBeLessThanOrEqual(10)
      }
    })

    it('ensures answer is within range for subtraction', () => {
      // Run multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        const problem = generateProblem({ min: 0, max: 10 }, ['subtraction'])

        expect(problem.start - problem.delta).toBeGreaterThanOrEqual(0)
        expect(problem.answer).toBeGreaterThanOrEqual(0)
        expect(problem.answer).toBeLessThanOrEqual(10)
      }
    })

    it('throws error for invalid delta (zero)', () => {
      expect(() => generateProblem({ min: 0, max: 10 }, undefined, 0)).toThrow(
        'Invalid delta'
      )
    })

    it('throws error for invalid delta (negative)', () => {
      expect(() => generateProblem({ min: 0, max: 10 }, undefined, -1)).toThrow(
        'Invalid delta'
      )
    })

    it('throws error for delta larger than range', () => {
      expect(() => generateProblem({ min: 0, max: 5 }, undefined, 10)).toThrow(
        'Invalid delta'
      )
    })
  })

  describe('options generation', () => {
    it('generates exactly 3 unique options', () => {
      const problem = generateProblem()

      expect(problem.options).toHaveLength(3)
      expect(new Set(problem.options).size).toBe(3) // All unique
    })

    it('includes the correct answer in options', () => {
      const problem = generateProblem()

      expect(problem.options).toContain(problem.answer)
    })

    it('all options are within the valid range', () => {
      const problem = generateProblem({ min: 5, max: 15 })

      problem.options.forEach((option) => {
        expect(option).toBeGreaterThanOrEqual(5)
        expect(option).toBeLessThanOrEqual(15)
      })
    })
  })

  describe('prompt generation', () => {
    it('generates correct prompt for addition with single step', () => {
      const problem = generateProblem({ min: 0, max: 10 }, ['addition'], 1)

      expect(problem.prompt).toContain(`starts at ${problem.start}`)
      expect(problem.prompt).toContain('forward')
      expect(problem.prompt).toContain('1 step')
      expect(problem.prompt).not.toContain('steps')
    })

    it('generates correct prompt for addition with multiple steps', () => {
      const problem = generateProblem({ min: 0, max: 10 }, ['addition'], 3)

      expect(problem.prompt).toContain(`starts at ${problem.start}`)
      expect(problem.prompt).toContain('forward')
      expect(problem.prompt).toContain('3 steps')
    })

    it('generates correct prompt for subtraction', () => {
      const problem = generateProblem({ min: 0, max: 10 }, ['subtraction'], 2)

      expect(problem.prompt).toContain(`starts at ${problem.start}`)
      expect(problem.prompt).toContain('backward')
      expect(problem.prompt).toContain('2 steps')
    })
  })
})

describe('generateProblemFromLevel', () => {
  it('generates problem using level config', () => {
    const levelConfig = {
      delta: 2,
      minRange: 0,
      maxRange: 10,
      operations: ['addition'] as Operation[],
    }

    const problem = generateProblemFromLevel(levelConfig)

    expect(problem.delta).toBe(2)
    expect(problem.min).toBe(0)
    expect(problem.max).toBe(10)
    expect(problem.operation).toBe('addition')
  })

  it('respects level operations', () => {
    const levelConfig = {
      delta: 3,
      minRange: 5,
      maxRange: 15,
      operations: ['subtraction'] as Operation[],
    }

    const problem = generateProblemFromLevel(levelConfig)

    expect(problem.operation).toBe('subtraction')
    expect(problem.answer).toBe(problem.start - 3)
  })

  it('works with mixed operations', () => {
    const levelConfig = {
      delta: 2,
      minRange: 0,
      maxRange: 20,
      operations: ['addition', 'subtraction'] as Operation[],
    }

    const problem = generateProblemFromLevel(levelConfig)

    expect(['addition', 'subtraction']).toContain(problem.operation)
  })
})
