import { describe, expect, it } from 'vitest'

import { Operation, generateProblem } from './problem'

describe('generateProblem', () => {
  it('keeps answers inside the provided range', () => {
    const range = { min: 0, max: 10 }
    for (let i = 0; i < 25; i += 1) {
      const problem = generateProblem(range)
      expect(problem.answer).toBeGreaterThanOrEqual(range.min)
      expect(problem.answer).toBeLessThanOrEqual(range.max)
    }
  })

  it('always includes the correct answer in the options', () => {
    const problem = generateProblem()
    expect(problem.options).toHaveLength(3)
    expect(new Set(problem.options).size).toBe(problem.options.length)
    expect(problem.options).toContain(problem.answer)
  })

  it('supports skewed ranges without throwing', () => {
    const range = { min: 12, max: 15 }
    for (let i = 0; i < 10; i += 1) {
      const problem = generateProblem(range)
      expect(problem.start).toBeGreaterThanOrEqual(range.min)
      expect(problem.start).toBeLessThanOrEqual(range.max)
    }
  })

  const expectOperationRespectsBounds = (operation: Operation) => {
    const range = { min: 0, max: 20 }
    for (let i = 0; i < 20; i += 1) {
      const problem = generateProblem(range, [operation])
      if (operation === 'addition') {
        expect(problem.start + problem.delta).toBeLessThanOrEqual(range.max)
      } else {
        expect(problem.start - problem.delta).toBeGreaterThanOrEqual(range.min)
      }
      expect(problem.operation).toBe(operation)
    }
  }

  it('never creates addition problems that hop past the range', () => {
    expectOperationRespectsBounds('addition')
  })

  it('never creates subtraction problems that hop below the range', () => {
    expectOperationRespectsBounds('subtraction')
  })

  it('limits hop sizes for readability and encourages counting', () => {
    const range = { min: 0, max: 50 }
    for (let i = 0; i < 20; i += 1) {
      const problem = generateProblem(range)
      expect(problem.delta).toBeGreaterThanOrEqual(1)
      expect(problem.delta).toBeLessThanOrEqual(5)
    }
  })

  it('writes prompts that mention the start and hop size for narration', () => {
    const problem = generateProblem()
    expect(problem.prompt).toContain(problem.start.toString())
    expect(problem.prompt).toContain(problem.delta.toString())
  })
})
