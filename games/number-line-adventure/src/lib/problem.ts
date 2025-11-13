export type Operation = 'addition' | 'subtraction'

export interface NumberLineProblem {
  min: number
  max: number
  start: number
  delta: number
  operation: Operation
  answer: number
  options: number[]
  prompt: string
}

export interface ProblemRange {
  min: number
  max: number
}

const DEFAULT_RANGE: ProblemRange = { min: 0, max: 20 }

const OPERATIONS: Operation[] = ['addition', 'subtraction']

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const pickOperation = (available: Operation[], delta: number, range: ProblemRange): Operation => {
  const valid = available.filter((op) => {
    if (op === 'addition') {
      return range.min <= range.max - delta
    }
    return range.min + delta <= range.max
  })
  const pool: Operation[] = valid.length ? valid : ['addition']
  return pool[randInt(0, pool.length - 1)]
}

const buildPrompt = (problem: NumberLineProblem) => {
  const direction = problem.operation === 'addition' ? 'forward' : 'backward'
  return `Our bunny starts at ${problem.start} and hops ${direction} ${problem.delta} step${
    problem.delta === 1 ? '' : 's'
  }. Where will it land?`
}

export const generateProblem = (
  range: ProblemRange = DEFAULT_RANGE,
  allowed: Operation[] = OPERATIONS,
): NumberLineProblem => {
  const normalizedRange: ProblemRange = {
    min: Math.min(range.min, range.max),
    max: Math.max(range.min, range.max),
  }

  const maxJump = Math.max(1, Math.min(5, normalizedRange.max - normalizedRange.min))
  const delta = randInt(1, maxJump)
  const operation = pickOperation(allowed, delta, normalizedRange)
  const startMin = operation === 'addition' ? normalizedRange.min : normalizedRange.min + delta
  const startMax = operation === 'addition' ? normalizedRange.max - delta : normalizedRange.max
  const start = randInt(startMin, startMax)
  const answer = operation === 'addition' ? start + delta : start - delta

  const options = new Set<number>([answer])
  while (options.size < 3) {
    const offset = randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)
    const candidate = clamp(answer + offset, normalizedRange.min, normalizedRange.max)
    options.add(candidate)
  }

  const shuffled = Array.from(options).sort(() => Math.random() - 0.5)

  const problem: NumberLineProblem = {
    ...normalizedRange,
    start,
    delta,
    operation,
    answer,
    options: shuffled,
    prompt: '',
  }

  return { ...problem, prompt: buildPrompt(problem) }
}
