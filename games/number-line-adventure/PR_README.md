# PR #1: Database Schema & Supabase Configuration

**Branch**: `feature/pr-1-database-schema-and-seed-data`
**Pull Request**: [#10](https://github.com/usmanghani/math-games/pull/10)
**Status**: Ready for Review

## Overview

This PR establishes the foundational database infrastructure for the Number Line Adventure game, implementing user profiles, level definitions, progress tracking, and game session history using Supabase (PostgreSQL).

## What This PR Adds

### 1. Database Schema (4 Tables)

**`profiles`** - User profile information
- Links to Supabase auth users via `auth.users`
- Stores display name and avatar emoji
- One profile per authenticated user

**`level_definitions`** - Static level configurations
- 10 progressive difficulty levels (delta: 2→11)
- Defines jump sizes, number ranges, operations, and accuracy requirements
- Publicly readable, no authentication required

**`user_progress`** - Per-user level progression
- Tracks unlock status, completion, scores, and streaks for each level
- Users start with Level 1 unlocked, others locked
- Auto-unlocks next level when user achieves 60% accuracy (3/5 correct)

**`game_sessions`** - Detailed play history
- Records every game session with score, streak, time, and answers
- Enables analytics, progress graphs, and historical review
- JSON storage for flexible answer data structure

### 2. Security - Row Level Security (RLS)

All user data tables implement RLS policies ensuring:
- Users can only read/write their own data
- `auth.uid()` matches `user_id` in all queries
- Level definitions are publicly readable (no auth required)
- Database-level security (not just application-level)

### 3. Helper Functions

**`initialize_user_progress(user_id UUID)`**
- Called when new user signs up
- Creates progress records for all 10 levels
- Sets Level 1 as unlocked, others locked
- Idempotent (safe to call multiple times)

**`unlock_next_level_if_qualified(user_id UUID, level_number INTEGER, score INTEGER)`**
- Called after each game session
- Calculates accuracy (score / 5 problems)
- Unlocks next level if accuracy >= 60%
- Returns boolean indicating if level was unlocked

### 4. Progressive Difficulty System

Levels follow the requested pattern of increasing jump sizes (+2, +3, +4...):

| Level | Delta | Range   | Operations          | Required Accuracy |
|-------|-------|---------|---------------------|-------------------|
| 1     | 2     | [0, 10] | Addition/Subtraction| 60%              |
| 2     | 3     | [0, 15] | Addition/Subtraction| 60%              |
| 3     | 4     | [0, 20] | Addition/Subtraction| 60%              |
| 4     | 5     | [0, 25] | Addition/Subtraction| 60%              |
| 5     | 6     | [0, 30] | Addition/Subtraction| 60%              |
| 6     | 7     | [0, 35] | Addition/Subtraction| 60%              |
| 7     | 8     | [0, 40] | Addition/Subtraction| 60%              |
| 8     | 9     | [0, 45] | Addition/Subtraction| 60%              |
| 9     | 10    | [0, 50] | Addition/Subtraction| 60%              |
| 10    | 11    | [0, 55] | Addition/Subtraction| 60%              |

### 5. Type Safety

**`src/lib/database.types.ts`** (165 lines)
- TypeScript types for all tables
- Generated from Supabase schema
- Ensures type safety across the application

**`src/lib/supabase.ts`** (34 lines)
- Typed Supabase client with graceful degradation
- Configuration check: `isSupabaseConfigured()`
- Auto-refresh tokens and session persistence

### 6. Environment Configuration

**`.env.example`** - Template for environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Design Decisions & Rationale

### Why Supabase?
- **PostgreSQL**: Robust, ACID-compliant relational database
- **Built-in Auth**: Authentication with email/password, OAuth, magic links
- **Real-time**: WebSocket support for live updates (future feature)
- **Edge Functions**: Serverless functions for complex logic
- **RLS**: Database-level security policies
- **Free Tier**: Generous limits for development and small-scale production

### Why Separate `level_definitions` from `user_progress`?
- **Single source of truth**: Level configs defined once, shared by all users
- **Easy updates**: Change level difficulty without touching user data
- **Flexibility**: Add new levels without migrating user progress
- **Performance**: No duplication of level data per user

### Why Store Answers in `game_sessions`?
- **Debugging**: Understand why users struggle with specific problems
- **Analytics**: Identify patterns (e.g., subtraction errors more common)
- **Replay**: Show users their past games
- **ML/AI**: Train models to generate personalized problems (future)

### Why 60% Accuracy Threshold?
- **Balance**: 3/5 correct is achievable but requires mastery
- **Progression**: Prevents users from getting stuck
- **Motivation**: Clear goal to unlock next level
- **Configurable**: Can be adjusted per level in `level_definitions.required_accuracy`

### Why Graceful Degradation?
The app builds and runs without Supabase configured because:
- **Local development**: Developers can work without database
- **CI/CD**: Builds succeed even if Supabase env vars not set
- **Progressive enhancement**: Core game works offline, features layer on

## Files Changed

### New Files
```
games/number-line-adventure/
├── supabase/
│   ├── migrations/
│   │   ├── 20250114000001_initial_schema.sql    (232 lines) - Schema
│   │   └── 20250114000002_seed_levels.sql       (65 lines)  - Seed data
│   └── README.md                                 (124 lines) - Setup guide
├── src/lib/
│   ├── database.types.ts                         (165 lines) - TypeScript types
│   └── supabase.ts                               (34 lines)  - Client config
└── .env.example                                  (5 lines)   - Env template
```

### Total Lines Added
- **625 lines** of SQL, TypeScript, and documentation

## Testing & Verification

### 1. Run Migrations

Using Supabase Dashboard:
```sql
-- Run in SQL Editor
-- 1. Copy/paste initial_schema.sql → Run
-- 2. Copy/paste seed_levels.sql → Run
```

### 2. Verify Schema

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Expected: profiles, level_definitions, user_progress, game_sessions
```

### 3. Verify Level Data

```sql
SELECT level_number, delta, min_range, max_range, required_accuracy
FROM level_definitions
ORDER BY level_number;

-- Expected: 10 rows with delta=2,3,4,5,6,7,8,9,10,11
```

### 4. Test Helper Functions

```sql
-- Create test user progress (replace with real user ID after auth setup)
SELECT initialize_user_progress('00000000-0000-0000-0000-000000000000'::uuid);

-- Check Level 1 is unlocked
SELECT level_number, is_unlocked
FROM user_progress
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY level_number;

-- Test level unlocking (score 4/5 = 80% > 60% threshold)
SELECT unlock_next_level_if_qualified(
  '00000000-0000-0000-0000-000000000000'::uuid,
  1,
  4
);

-- Verify Level 2 is now unlocked
SELECT level_number, is_unlocked
FROM user_progress
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND level_number = 2;
```

### 5. Test RLS Policies

```sql
-- Try to access another user's data (should return empty)
-- This requires setting up auth first (PR #4)
```

### 6. Verify TypeScript Types

```bash
cd games/number-line-adventure

# Types should compile without errors
npm run build
# or
pnpm build
```

### 7. Test Graceful Degradation

```bash
# Remove env vars temporarily
mv .env.local .env.local.backup

# App should still build
pnpm build

# Restore env vars
mv .env.local.backup .env.local
```

## Integration Points

### Depends On
- **Nothing** - This is the foundational PR

### Enables
- **PR #2**: Level Configuration System - Reads from `level_definitions`
- **PR #4**: Supabase Auth - Uses `profiles`, creates user progress
- **PR #7-9**: Progress Tracking - Writes to `user_progress` and `game_sessions`

### Future PRs Will Use
- `profiles` - Display user info (PR #6)
- `level_definitions` - Load level configs (PR #2, #8)
- `user_progress` - Track/display progress (PR #7-9)
- `game_sessions` - Analytics and history (PR #11-12)

## Security Considerations

### ✅ Implemented
- Row Level Security on all user tables
- Auth.uid() validation in RLS policies
- Prepared statements (Supabase client prevents SQL injection)
- Anon key for client-side (restricted permissions)
- HTTPS-only connections (Supabase default)

### ⚠️ Future Work
- Service role key (for admin operations) - store in Vercel secrets, never commit
- Rate limiting on auth endpoints (Supabase provides this)
- Input validation on game_sessions.answers JSONB (application-level)
- Audit logging for sensitive operations (future PR)

## Performance Considerations

### ✅ Optimized
- Indexes on foreign keys: `user_progress(user_id)`, `game_sessions(user_id)`
- Index on `user_progress(user_id, level_number)` for fast lookups
- Primary keys on all tables (automatic indexes)
- BTREE indexes for range queries on `level_definitions`

### 📊 Expected Performance
- Level lookup: O(1) - indexed PK
- User progress fetch: O(log n) - indexed user_id
- Session history: O(log n) - indexed user_id
- Most queries: <10ms on Supabase infrastructure

### 🔮 Future Optimizations (if needed)
- Materialized views for analytics queries
- Connection pooling (Supabase handles this)
- Read replicas for game_sessions queries (Supabase Pro)

## Database Migrations

### Migration Strategy
- **Sequential numbering**: `YYYYMMDDHHMMSS_description.sql`
- **Idempotent where possible**: Use `IF NOT EXISTS`, `IF EXISTS`
- **Separate schema and seed**: Two files for safety
- **Rollback plan**: Drop tables in reverse order if needed

### Rollback Procedure (Emergency Only)
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS level_definitions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS unlock_next_level_if_qualified;
DROP FUNCTION IF EXISTS initialize_user_progress;
```

## Known Limitations

1. **No offline support**: Requires internet connection for database access
   - **Future**: Service workers + IndexedDB for offline play

2. **Single game type**: Schema assumes number line game only
   - **Future**: Add `game_type` column for multiple game types

3. **Fixed 5-problem sessions**: Helper function assumes 5 problems per game
   - **Future**: Add `total_problems` parameter to unlock function

4. **English-only**: No i18n in level descriptions yet
   - **Future**: Add `level_definitions_i18n` table

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional (Future)
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For server-side admin operations
```

## Documentation

- **Setup Guide**: `supabase/README.md` - Complete setup instructions
- **Schema Details**: `supabase/migrations/20250114000001_initial_schema.sql` - Inline comments
- **This Document**: High-level overview and rationale

## Next Steps (After Merge)

1. **PR #2**: Level Configuration System - Use `level_definitions` table
2. **PR #3**: Update Problem Generator - Support fixed delta from levels
3. **PR #4**: Supabase Auth - Use `profiles` and `initialize_user_progress()`
4. **PR #5**: Login/Signup UI - Complete auth flow
5. **PR #6**: Profile Management - Edit `profiles` table

## Questions for Reviewers (@codex)

1. **Schema Design**: Is the separation of `level_definitions` and `user_progress` clear and logical?

2. **Security**: Are the RLS policies sufficient? Any additional security measures needed?

3. **Performance**: Should we add more indexes? Are there query patterns we should optimize?

4. **Helper Functions**: Is the auto-unlock logic in `unlock_next_level_if_qualified()` appropriate? Should it be in the application layer instead?

5. **Flexibility**: Will this schema support future features (multiplayer, custom levels, multiple game types)?

6. **TypeScript Types**: Are the generated types in `database.types.ts` idiomatic and type-safe?

7. **Error Handling**: Should we add more constraints (CHECK constraints, triggers) or rely on application-level validation?

8. **Documentation**: Is anything unclear or missing?

## Deployment Checklist

- [x] Migrations written and tested locally
- [x] TypeScript types generated
- [x] Environment variables documented
- [x] Setup guide created
- [ ] Migrations run in production Supabase
- [ ] Environment variables set in Vercel (production, preview, development)
- [ ] Deployment verified (build succeeds)
- [ ] Data verified (10 levels exist in production)

## Related PRs

- **Blocks**: PR #2 (Level Configuration), PR #4 (Auth Setup)
- **Blocked By**: None
- **Related**: All future PRs depend on this foundation

---

**Last Updated**: 2025-01-15
**Author**: Claude (via Claude Code)
**Reviewer**: @codex (requested)
