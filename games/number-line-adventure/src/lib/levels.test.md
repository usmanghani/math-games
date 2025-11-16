# Level Configuration API - Usage Examples

This document provides usage examples for the level configuration utilities in `levels.ts`.

## Basic Usage

### Fetch a Single Level

```typescript
import { getLevelConfig } from './levels'

// Fetch Level 3 configuration
const level3 = await getLevelConfig(3)
console.log(level3)
// {
//   levelNumber: 3,
//   delta: 4,
//   minRange: 0,
//   maxRange: 20,
//   operations: ['addition', 'subtraction'],
//   requiredAccuracy: 0.6
// }
```

### Fetch All Levels

```typescript
import { getAllLevels } from './levels'

const allLevels = await getAllLevels()
console.log(`Total levels: ${allLevels.length}`) // 10
console.log(allLevels[0]) // Level 1 config
```

### Use Fallback Levels (when database unavailable)

```typescript
import { getLevelConfigWithFallback, DEFAULT_LEVELS } from './levels'

// Always returns a level config (uses fallback if DB unavailable)
const level1 = await getLevelConfigWithFallback(1)

// Or use default levels directly
console.log(DEFAULT_LEVELS[0]) // Level 1 default config
```

## Advanced Usage

### Check if Level Exists

```typescript
import { levelExists } from './levels'

const exists = await levelExists(15)
console.log(exists) // false (only 10 levels seeded)
```

### Get Level Range

```typescript
import { getLevelRange } from './levels'

// Get levels 5-8
const middleLevels = await getLevelRange(5, 8)
console.log(middleLevels.length) // 4
```

### Navigation Helpers

```typescript
import { getNextLevel, getPreviousLevel } from './levels'

const nextLevel = await getNextLevel(5)
console.log(nextLevel) // 6

const previousLevel = getPreviousLevel(5)
console.log(previousLevel) // 4

const lastNext = await getNextLevel(10)
console.log(lastNext) // null (no level after 10)

const firstPrevious = getPreviousLevel(1)
console.log(firstPrevious) // null (no level before 1)
```

## Integration with Game Client

### Example: Load level config for gameplay

```typescript
import { getLevelConfigWithFallback } from './levels'
import { generateProblem } from './problem'

async function startLevel(levelNumber: number) {
  // Fetch level configuration
  const levelConfig = await getLevelConfigWithFallback(levelNumber)

  // Generate problems based on level config
  const problem = generateProblem(
    { min: levelConfig.minRange, max: levelConfig.maxRange },
    levelConfig.operations
  )

  // Note: Problem generator needs to be updated to support custom delta
  // See PR #3 for problem generator updates
}
```

## Test Scenarios

### Scenario 1: Fresh User Starting Level 1
```typescript
const level1 = await getLevelConfigWithFallback(1)
// Expected: { levelNumber: 1, delta: 2, minRange: 0, maxRange: 10, ... }
// Problems: 2+2=4, 6-2=4, 8+2=10
```

### Scenario 2: User Progressing to Level 5
```typescript
const level5 = await getLevelConfigWithFallback(5)
// Expected: { levelNumber: 5, delta: 6, minRange: 0, maxRange: 30, ... }
// Problems: 6+6=12, 18-6=12, 24+6=30
```

### Scenario 3: Level Selection Screen
```typescript
const allLevels = await getAllLevelsWithFallback()
// Display all 10 levels in a grid
// Show locked/unlocked state (requires user progress data)
```

## Error Handling

### Graceful Degradation

```typescript
import { isSupabaseConfigured } from './supabase'
import { getAllLevelsWithFallback } from './levels'

if (!isSupabaseConfigured()) {
  console.warn('Using default levels (Supabase not configured)')
}

// Still works! Falls back to DEFAULT_LEVELS
const levels = await getAllLevelsWithFallback()
```

### Null Checks

```typescript
import { getLevelConfig } from './levels'

const level = await getLevelConfig(999) // Level doesn't exist
if (!level) {
  console.error('Level not found')
  // Handle error case
}
```

## Performance Considerations

### Caching Levels

```typescript
// Cache levels in component state or global store
let cachedLevels: LevelConfig[] | null = null

async function getLevelsCached(): Promise<LevelConfig[]> {
  if (!cachedLevels) {
    cachedLevels = await getAllLevels()
  }
  return cachedLevels
}
```

### Prefetching

```typescript
// Prefetch next level when user completes current level
async function onLevelComplete(currentLevel: number) {
  // Save progress...

  // Prefetch next level config
  const nextLevelNum = await getNextLevel(currentLevel)
  if (nextLevelNum) {
    getLevelConfig(nextLevelNum) // Prefetch for faster loading
  }
}
```

## Future Enhancements

- [ ] Add level caching with TTL
- [ ] Add level config validation
- [ ] Add level difficulty scoring/rating
- [ ] Add level unlock prerequisites beyond linear progression
- [ ] Add level categories/themes
