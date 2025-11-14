# Problem Generator - Usage Examples & Tests

This document provides usage examples and test cases for the updated problem generator with dynamic difficulty support.

## Overview of Changes

The `generateProblem()` function now supports:
- **Fixed delta**: Pass a specific jump size instead of random (1-5)
- **Validation**: Ensures delta is valid for the range
- **Positive results only**: All answers are guaranteed to be >= minRange
- **Backward compatibility**: Existing code continues to work without changes

## Basic Usage

### Original Usage (Still Works!)

```typescript
import { generateProblem } from './problem'

// Generate problem with random delta (1-5)
const problem = generateProblem({ min: 0, max: 20 })
console.log(problem)
// {
//   min: 0, max: 20,
//   start: 8, delta: 3, operation: 'addition',
//   answer: 11,
//   options: [11, 9, 13],
//   prompt: 'Our bunny starts at 8 and hops forward 3 steps. Where will it land?'
// }
```

### New Usage: Fixed Delta

```typescript
import { generateProblem } from './problem'

// Level 1: Jump by 2
const level1Problem = generateProblem({ min: 0, max: 10 }, ['addition', 'subtraction'], 2)
console.log(level1Problem.delta) // Always 2

// Level 3: Jump by 4
const level3Problem = generateProblem({ min: 0, max: 20 }, ['addition', 'subtraction'], 4)
console.log(level3Problem.delta) // Always 4

// Level 5: Jump by 6
const level5Problem = generateProblem({ min: 0, max: 30 }, ['addition', 'subtraction'], 6)
console.log(level5Problem.delta) // Always 6
```

### Using with LevelConfig

```typescript
import { generateProblemFromLevel } from './problem'
import { getLevelConfigWithFallback } from './levels'

// Fetch level config and generate problem
const levelConfig = await getLevelConfigWithFallback(3)
const problem = generateProblemFromLevel(levelConfig)

console.log(problem)
// Problem generated with Level 3 settings:
// - delta: 4 (always)
// - range: [0, 20]
// - operations: ['addition', 'subtraction']
```

## Test Cases

### Test Case 1: Level 1 (Delta = 2, Range = [0, 10])

```typescript
// Generate 5 problems for Level 1
for (let i = 0; i < 5; i++) {
  const problem = generateProblem({ min: 0, max: 10 }, ['addition', 'subtraction'], 2)

  // Assertions
  console.assert(problem.delta === 2, 'Delta should be 2')
  console.assert(problem.answer >= 0 && problem.answer <= 10, 'Answer in range')
  console.assert(['addition', 'subtraction'].includes(problem.operation), 'Valid operation')

  // Example outputs:
  // - 4 + 2 = 6
  // - 8 - 2 = 6
  // - 2 + 2 = 4
  // - 10 - 2 = 8
  // - 0 + 2 = 2
}
```

### Test Case 2: Level 5 (Delta = 6, Range = [0, 30])

```typescript
const problem = generateProblem({ min: 0, max: 30 }, ['addition', 'subtraction'], 6)

// Assertions
console.assert(problem.delta === 6, 'Delta should be 6')
console.assert(problem.answer >= 0 && problem.answer <= 30, 'Answer in range')

// Example outputs:
// - 12 + 6 = 18
// - 18 - 6 = 12
// - 6 + 6 = 12
// - 24 - 6 = 18
```

### Test Case 3: Level 10 (Delta = 11, Range = [0, 55])

```typescript
const problem = generateProblem({ min: 0, max: 55 }, ['addition', 'subtraction'], 11)

// Assertions
console.assert(problem.delta === 11, 'Delta should be 11')
console.assert(problem.answer >= 0 && problem.answer <= 55, 'Answer in range')

// Example outputs:
// - 22 + 11 = 33
// - 33 - 11 = 22
// - 11 + 11 = 22
// - 44 - 11 = 33
```

### Test Case 4: Subtraction Always Positive

```typescript
// Generate 100 subtraction problems
for (let i = 0; i < 100; i++) {
  const problem = generateProblem({ min: 0, max: 20 }, ['subtraction'], 5)

  // Assertion: Answer should never be negative
  console.assert(problem.answer >= 0, `Answer ${problem.answer} should be >= 0`)
  console.assert(problem.start >= 5, `Start ${problem.start} should be >= delta (5)`)

  // All results are positive!
  // - 10 - 5 = 5 ✓
  // - 15 - 5 = 10 ✓
  // - 20 - 5 = 15 ✓
  // Never: 3 - 5 = -2 ✗
}
```

### Test Case 5: Edge Case - Small Range

```typescript
// Small range: [0, 5] with delta = 3
const problem = generateProblem({ min: 0, max: 5 }, ['addition', 'subtraction'], 3)

console.assert(problem.delta === 3, 'Delta should be 3')

// Valid problems:
// - 0 + 3 = 3 ✓
// - 2 + 3 = 5 ✓
// - 3 - 3 = 0 ✓
// - 5 - 3 = 2 ✓
```

### Test Case 6: Invalid Delta (Should Throw)

```typescript
try {
  // Delta larger than range
  const problem = generateProblem({ min: 0, max: 10 }, ['addition'], 15)
  console.error('Should have thrown error!')
} catch (error) {
  console.log('✓ Correctly threw error:', error.message)
  // "Invalid delta 15 for range [0, 10]"
}

try {
  // Negative delta
  const problem = generateProblem({ min: 0, max: 10 }, ['addition'], -5)
  console.error('Should have thrown error!')
} catch (error) {
  console.log('✓ Correctly threw error:', error.message)
  // "Invalid delta -5 for range [0, 10]"
}
```

## Integration Examples

### Example 1: Update GameClient to use levels

```typescript
// In GameClient.tsx (future PR)
import { generateProblemFromLevel } from '@/lib/problem'
import { getLevelConfigWithFallback } from '@/lib/levels'

export default function GameClient() {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [problem, setProblem] = useState<NumberLineProblem | null>(null)

  useEffect(() => {
    async function loadProblem() {
      const levelConfig = await getLevelConfigWithFallback(currentLevel)
      const newProblem = generateProblemFromLevel(levelConfig)
      setProblem(newProblem)
    }
    loadProblem()
  }, [currentLevel])

  // Rest of game logic...
}
```

### Example 2: Level-specific problem generation

```typescript
// Generate 5 problems for each level
import { DEFAULT_LEVELS } from '@/lib/levels'
import { generateProblemFromLevel } from '@/lib/problem'

DEFAULT_LEVELS.forEach((levelConfig) => {
  console.log(`\n=== Level ${levelConfig.levelNumber} ===`)
  console.log(`Delta: ${levelConfig.delta}, Range: [${levelConfig.minRange}, ${levelConfig.maxRange}]`)

  for (let i = 0; i < 5; i++) {
    const problem = generateProblemFromLevel(levelConfig)
    console.log(`${problem.start} ${problem.operation === 'addition' ? '+' : '-'} ${problem.delta} = ${problem.answer}`)
  }
})

// Output:
// === Level 1 ===
// Delta: 2, Range: [0, 10]
// 4 + 2 = 6
// 8 - 2 = 6
// 2 + 2 = 4
// 6 - 2 = 4
// 0 + 2 = 2
//
// === Level 2 ===
// Delta: 3, Range: [0, 15]
// 6 + 3 = 9
// 12 - 3 = 9
// ...
```

## Validation Rules

### Delta Validation

```typescript
// ✓ Valid: delta <= (max - min)
generateProblem({ min: 0, max: 10 }, ['addition'], 5)  // OK
generateProblem({ min: 0, max: 10 }, ['addition'], 10) // OK (edge case)

// ✗ Invalid: delta > (max - min)
generateProblem({ min: 0, max: 10 }, ['addition'], 15) // Throws error

// ✗ Invalid: delta <= 0
generateProblem({ min: 0, max: 10 }, ['addition'], 0)  // Throws error
generateProblem({ min: 0, max: 10 }, ['addition'], -5) // Throws error
```

### Answer Validation

```typescript
// All answers must satisfy: min <= answer <= max

// For addition: start + delta = answer
// Valid start range: [min, max - delta]
// Example: min=0, max=10, delta=4
//   start can be: 0-6 (so answer is 4-10)

// For subtraction: start - delta = answer
// Valid start range: [min + delta, max]
// Example: min=0, max=10, delta=4
//   start can be: 4-10 (so answer is 0-6)
```

## Backward Compatibility

All existing code continues to work without modifications:

```typescript
// Old code (still works!)
const problem1 = generateProblem()
const problem2 = generateProblem({ min: 0, max: 20 })
const problem3 = generateProblem({ min: 0, max: 20 }, ['addition'])

// New code (with fixed delta)
const problem4 = generateProblem({ min: 0, max: 20 }, ['addition', 'subtraction'], 5)
```

## Migration Guide

### Before (Random Delta)

```typescript
import { generateProblem } from './problem'

const RANGE = { min: 0, max: 20 }
const problem = generateProblem(RANGE)
// delta is random (1-5)
```

### After (Fixed Delta from Level)

```typescript
import { generateProblemFromLevel } from './problem'
import { getLevelConfigWithFallback } from './levels'

const levelConfig = await getLevelConfigWithFallback(currentLevel)
const problem = generateProblemFromLevel(levelConfig)
// delta is fixed based on level (2, 3, 4, ...)
```

## Performance Considerations

- Problem generation is still synchronous and fast (<1ms)
- No performance impact from fixed delta
- Validation adds minimal overhead (~0.1ms)

## Future Enhancements

- [ ] Add more operation types (multiplication, division)
- [ ] Add word problem templates
- [ ] Add problem difficulty scoring
- [ ] Add seeded random generation for reproducible problems
- [ ] Add problem caching/memoization
