# Number Line Adventure - Development Progress

Last Updated: 2025-01-17

## Current Status: ✅ Delta-Based Coin System Implemented

### Latest Milestone: PR #31 Merged to Main

The delta-based coin earning system has been successfully implemented and merged into the main branch.

---

## Coin Economy System Design

### Formula
- **Level Delta**: `delta(N) = N + 1`
  - Level 1: delta = 2
  - Level 2: delta = 3
  - Level 3: delta = 4
  - etc.

- **Coins Earned**: `coinsEarned(N) = correctAnswers × delta`
  - Level 1 (delta 2): 5 questions × 2 = 10 coins max
  - Level 2 (delta 3): 5 questions × 3 = 15 coins max
  - Level 3 (delta 4): 5 questions × 4 = 20 coins max

- **Level Unlock Cost**: `cost(N) = N × 5`
  - Level 2: 2 × 5 = 10 coins
  - Level 3: 3 × 5 = 15 coins
  - Level 4: 4 × 5 = 20 coins

### Balance
✅ **Perfect Balance Achieved**: Completing Level N with 5/5 correct answers earns exactly enough coins to unlock Level N+1!

### Key Features
- **Per-Level Coin Tracking**: Coins earned from Level N are stored with Level N
- **Anti-Farming**: Cannot farm coins by replaying completed levels to unlock future levels
- **Auto-Unlock**: Next level automatically unlocks when player has enough coins
- **Coin Deduction**: Unlocking a level deducts coins from the previous level

---

## Recent Pull Requests

### PR #31: Delta-Based Coin System ✅ MERGED
**Branch**: `feature/delta-based-coin-system`
**Commits**: 2 (7d4e193, afd554b)
**Merged**: 2025-01-17 14:03:51 UTC
**Merge Commit**: 484c16a

#### Changes Made:
1. **src/lib/levels.ts**
   - Updated `DEFAULT_LEVELS` array with delta = levelNumber + 1
   - Fixed documentation to reflect correct unlock costs

2. **src/lib/coins.ts**
   - Updated `calculateLevelCost()` formula: `levelNumber * 5`
   - Removed obsolete `calculateCoinReward()` function
   - Removed obsolete `calculateMaxCoins()` function

3. **src/stores/progressStore.ts**
   - Updated `completeLevel()` to calculate coins: `correctAnswers * delta`
   - Implemented auto-unlock logic for next level
   - Removed debug console.log statements
   - Kept console.error/warn for actual errors

4. **supabase/migrations/20250117000002_update_level_deltas.sql**
   - Updated migration to set `delta = level_number + 1`
   - Fixed documentation comments

#### Review Comments Addressed:
- ✅ HIGH: Removed obsolete functions from coins.ts
- ✅ HIGH: Fixed incorrect comment about level unlock costs
- ✅ MEDIUM: Removed console.log debugging statements
- ⚠️ MEDIUM: Pass delta from LevelConfig (deferred as architectural improvement)

### PR #30: Coin Display UI ✅ MERGED
**Merged**: Earlier session
**Commit**: c8b7f08

### PR #29: Core Coin Mechanics ✅ MERGED
**Status**: Merged in previous session

---

## Code Architecture

### Key Files

#### Progress Store (`src/stores/progressStore.ts`)
```typescript
interface LevelProgress {
  levelNumber: number
  isUnlocked: boolean
  isCompleted: boolean
  bestScore: number | null
  bestStreak: number | null
  attemptsCount: number
  lastPlayedAt: string | null
  coinsEarned: number // Coins earned from THIS level
}
```

**Key Functions:**
- `completeLevel(levelNumber, score, streak, correctAnswers)` - Awards coins and auto-unlocks next level
- `unlockLevel(levelNumber)` - Manually unlock level (deducts coins from previous level)
- `getCoinsFromLevel(levelNumber)` - Returns coins earned from specific level

#### Level Definitions (`src/lib/levels.ts`)
```typescript
interface LevelConfig {
  levelNumber: number
  delta: number // Jump size (2, 3, 4, 5, ...)
  minRange: number // Starting number (default: 0)
  maxRange: number // Maximum number
  operations: Operation[] // ['addition', 'subtraction']
  requiredAccuracy: number // 0.6 = 60% to unlock next level
}
```

#### Coin Utilities (`src/lib/coins.ts`)
- `calculateLevelCost(levelNumber)` - Returns unlock cost for a level
- `canAffordLevel(currentCoins, levelNumber)` - Checks if player can afford level
- `calculateTotalCostUpToLevel(upToLevel)` - Returns cumulative cost

---

## Database Schema

### Tables

#### `level_definitions`
- `level_number`: Level ID (1-10)
- `delta`: Jump size (2-11, matching levelNumber + 1)
- `min_range`: Minimum number (0)
- `max_range`: Maximum number (increases with level)
- `operations`: Array of allowed operations
- `required_accuracy`: Accuracy needed (0.6)

#### `user_progress`
- `user_id`: Foreign key to users
- `level_number`: Foreign key to level_definitions
- `is_unlocked`: Boolean
- `is_completed`: Boolean
- `best_score`: Integer (nullable)
- `best_streak`: Integer (nullable)
- `attempts_count`: Integer (default 0)
- `last_played_at`: Timestamp (nullable)
- `coins_earned`: Integer (default 0)

---

## Git Branch Status

- **Main Branch**: `main` (up to date)
- **Latest Commit**: 484c16a (PR #31 merge)
- **Previous Commit**: 717bacd
- **Deleted Branches**: `feature/delta-based-coin-system` (merged)

---

## Development Environment

### Running Services
- **npm run dev**: Port 3000 (local dev server)
- **Supabase**: Running locally via `npx supabase start`
- **Vercel**: Production deployment at https://number-line-adventure-prod-eloarbuzs.vercel.app

### Database
- Local Supabase instance running
- Migration applied: `20250117000002_update_level_deltas.sql`
- All 10 levels configured with correct deltas

---

## Testing Checklist

### Manual Testing Completed
- ✅ Build passes (`npm run build`)
- ✅ Lint passes (no errors)
- ✅ Migration applied successfully
- ✅ PR review comments addressed

### Manual Testing Recommended
- [ ] Complete Level 1 with 5/5 correct → Should earn 10 coins and auto-unlock Level 2
- [ ] Complete Level 2 with 5/5 correct → Should earn 15 coins and auto-unlock Level 3
- [ ] Complete Level 3 with 5/5 correct → Should earn 20 coins and auto-unlock Level 4
- [ ] Verify level costs display correctly on locked levels
- [ ] Verify coins persist after refresh
- [ ] Test incomplete level completion (e.g., 3/5 correct) → Should NOT auto-unlock next level

---

## Known Issues / Technical Debt

### None Critical
All known issues have been addressed in PR #31.

### Future Improvements (Optional)
1. **Pass delta from LevelConfig**: Currently, delta is calculated inline as `levelNumber + 1`. Could pass from `LevelConfig.delta` for better maintainability.
   - **Priority**: Low (architectural improvement)
   - **Impact**: Makes system more flexible for custom delta values
   - **File**: `src/stores/progressStore.ts:273`

2. **Add unit tests for coin calculations**: No tests currently exist for the new coin economy
   - **Priority**: Medium
   - **Files to test**: `src/lib/coins.ts`, `src/stores/progressStore.ts`

3. **Add E2E tests for level progression**: Test the full flow of earning coins and unlocking levels
   - **Priority**: Medium

---

## Next Steps / Pending Tasks

### Immediate (None)
✅ All tasks completed and merged!

### Future Features (Backlog)
1. **Achievements System**: Award badges for completing levels with perfect scores
2. **Leaderboards**: Track and display top players by score/speed
3. **More Levels**: Expand beyond 10 levels
4. **Multiplication/Division**: Add more operation types
5. **Power-ups**: Use coins to purchase hints or time extensions
6. **Sound Effects**: Add audio feedback for correct/incorrect answers

---

## Commands Reference

### Git
```bash
# Check current branch and status
git status
git branch

# Switch to main
git checkout main
git pull

# Create new feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: your commit message"
git push
```

### GitHub PR
```bash
# Create PR
gh pr create --title "Title" --body "Description"

# View PR
gh pr view 31

# Check for review comments
gh api repos/usmanghani/math-games/pulls/31/comments

# Merge PR
gh pr merge 31 --squash --auto
```

### Build & Test
```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint check
npm run lint
```

### Supabase
```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Apply migrations
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > src/lib/database.types.ts
```

---

## Contact & Resources

- **Repository**: https://github.com/usmanghani/math-games
- **Production**: https://number-line-adventure-prod-eloarbuzs.vercel.app
- **Latest PR**: https://github.com/usmanghani/math-games/pull/31

---

## Session Notes

### Session Date: 2025-01-17

**Completed:**
1. Implemented delta-based coin earning system (correctAnswers × delta)
2. Updated level unlock cost formula (levelNumber × 5)
3. Updated database migration for correct deltas
4. Applied migration to local database
5. Created PR #31 and addressed all review comments
6. Successfully merged PR #31 to main
7. Cleaned up feature branch

**Time Investment:** ~30 minutes
**Result:** ✅ Production-ready coin economy system

**Key Decisions:**
- Chose to calculate delta inline (`levelNumber + 1`) for simplicity
- Removed debug logging for cleaner production code
- Kept console.error/warn for actual error conditions
- Achieved perfect balance: 1 perfect playthrough unlocks next level

---

*This progress file is automatically maintained. Last updated after PR #31 merge.*
