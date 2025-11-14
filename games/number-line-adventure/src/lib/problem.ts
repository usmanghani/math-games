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

/**
 * Generate a math problem for the number line game
 * @param range The min/max range for numbers (default: 0-20)
 * @param allowed Operations to use (default: addition and subtraction)
 * @param fixedDelta Optional fixed jump size. If not provided, generates random delta (1-5)
 * @returns NumberLineProblem with start, delta, operation, answer, and options
 */
export const generateProblem = (
  range: ProblemRange = DEFAULT_RANGE,
  allowed: Operation[] = OPERATIONS,
  fixedDelta?: number,
): NumberLineProblem => {
  const normalizedRange: ProblemRange = {
    min: Math.min(range.min, range.max),
    max: Math.max(range.min, range.max),
  }

  // Use fixed delta if provided, otherwise generate random delta (1-5 or max possible)
  const maxJump = Math.max(1, Math.min(5, normalizedRange.max - normalizedRange.min))
  const delta = fixedDelta !== undefined ? fixedDelta : randInt(1, maxJump)

  // Validate delta is within range
  if (delta <= 0 || delta > normalizedRange.max - normalizedRange.min) {
    throw new Error(
      `Invalid delta ${delta} for range [${normalizedRange.min}, ${normalizedRange.max}]`
    )
  }

  const operation = pickOperation(allowed, delta, normalizedRange)

  // Calculate valid starting positions to ensure positive results only
  // For addition: start + delta must be <= max, so start <= max - delta
  // For subtraction: start - delta must be >= min, so start >= min + delta
  const startMin = operation === 'addition' ? normalizedRange.min : normalizedRange.min + delta
  const startMax = operation === 'addition' ? normalizedRange.max - delta : normalizedRange.max
  const start = randInt(startMin, startMax)
  const answer = operation === 'addition' ? start + delta : start - delta

  // Ensure answer is always positive (>= 0)
  if (answer < normalizedRange.min || answer > normalizedRange.max) {
    throw new Error(
      `Generated answer ${answer} is outside range [${normalizedRange.min}, ${normalizedRange.max}]`
    )
  }

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

/**
 * Generate a problem from a LevelConfig
 * Convenience function that extracts the necessary parameters from LevelConfig
 * @param levelConfig The level configuration (from database or defaults)
 * @returns NumberLineProblem configured for the specified level
 */
export const generateProblemFromLevel = (
  levelConfig: {
    delta: number
    minRange: number
    maxRange: number
    operations: Operation[]
  }
): NumberLineProblem => {
  return generateProblem(
    { min: levelConfig.minRange, max: levelConfig.maxRange },
    levelConfig.operations,
    levelConfig.delta
  )
}
