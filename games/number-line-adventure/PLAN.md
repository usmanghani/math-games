# Number Line Adventure — Implementation Plan

## Vision
Create a kid-friendly, visually rich web game that helps early learners internalize number-line based reasoning for addition and subtraction, eventually expanding to more complex operations. The experience should feel like an adventure starring a dinosaur, cheetah, and bunny hopping across a number line in scenic environments while tracking progress across devices.

## Target Platforms & Technology Stack
| Concern | Choice | Rationale |
| --- | --- | --- |
| Client framework | **Next.js (React) + TypeScript** | Supports responsive web apps, SSR for fast loads on tablets/laptops, component-driven UI. |
| 3D/visual layer | **Three.js + react-three-fiber** | WebGL rendering for animated animals, scenic backgrounds, and interactive number lines. |
| State management | **Redux Toolkit or Zustand** | Predictable global state for auth, progress, session data. |
| Styling | **Tailwind CSS + custom components** | Rapid UI prototyping with child-friendly theming. |
| Backend/API | **Next.js API routes (initially)**, migrate to dedicated **Node.js/Express** or **NestJS** service once complexity grows. |
| Authentication | **Clerk/Supabase Auth** or custom email+PIN auth | Simple multi-user profile login for kids; supports avatars. |
| Data storage | **PostgreSQL** via Supabase or hosted DB | Stores users, progress, level configs, generated question history. |
| Asset generation | **Procedural scene builder** (JSON configs + shader/texture palette) | Ensures variety without manual art for every level. |
| Deployment | **Vercel** (frontend) + managed DB/Supabase | Easy CI/CD, HTTPS, device sync. |
| Testing | **Playwright** for e2e flows, **Jest** for logic, **Storybook** for UI previews. |

## High-Level Architecture
1. **Frontend**
   - Next.js app with routes for login, profile selection, level map, gameplay, results.
   - `react-three-fiber` scene graph describing background, number line, and animal avatars.
   - UI overlay components (question card, answer keypad, feedback modals).
2. **Backend/API**
   - Auth endpoints (login, child profile switching, PIN validation).
   - Progress API (CRUD for user levels, XP, accuracy metrics).
   - Question generator API returning a seed + display data (start number, operation, number line extents, narrative text).
3. **Shared Packages**
   - `/packages/math-engine`: deterministic generators for problems, validation rules, difficulty scaling.
   - `/packages/ui`: shared React components (buttons, avatar selectors, progress meters).
4. **Data Layer**
   - Tables: Users, Profiles (child avatars), Sessions, ProgressSnapshots, LevelDefinitions, QuestionAttempts.
   - Support offline caching using IndexedDB/localStorage to buffer progress until online.
5. **DevOps**
   - CI runs lint/test/build.
   - Infrastructure-as-code (Terraform or Supabase config) once needed.

## Gameplay Flow
1. **Launch Screen**: Displays saved user sessions as circular avatar buttons (Mac login style).
2. **Profile Selection**: Choose avatar -> enter simple PIN (optional) -> loads profile.
3. **Level Map**: Shows scenic path with levels. Levels unlocked sequentially, difficulty defined by template (range, step size, operation mix).
4. **Gameplay Scene**:
   - Scenic background + number line.
   - Animal stands on starting number.
   - Prompt (e.g., "Dino needs to subtract 3 carrots from 12").
   - Player selects answer (taps number bubble or uses keypad).
   - Feedback animation. Animal hops along number line showing solution.
   - XP/coins/stickers awarded.
5. **Progress Tracking**: Accuracy, time-to-answer, hints used, level completions synced to backend.

## Difficulty & Content Strategy
- **Level Bands**: `Starter (0-10)`, `Explorer (0-20)`, `Ranger (0-50)`, `Hero (0-100)`.
- **Operation Mix**: begin with addition/subtraction within 10; gradually include larger jumps (±5, ±10, ±20) without negative results.
- **Problem Types**: pure numeric, word problems ("cheetah lost 3 spots"), money problems (coins), counting sequences.
- **Future Expansion**: introduce multiplication, division, time/clock math, fractions.

## Feature Roadmap (Phased)
1. **Foundation (Milestone 0)**
   - Scaffold repo (Next.js app, shared packages, API routes).
   - Configure linting, formatting, CI.
   - Implement authentication stubs (local mock data).
2. **Profiles & Progress (Milestone 1)**
   - UI for avatar circles, PIN entry, persistent sessions.
   - Backend schema for users/profiles/progress.
   - Device sync using Supabase/Prisma + hosted DB.
3. **Core Gameplay Loop (Milestone 2)**
   - Scene rendering with number line + animal models.
   - Question generator (addition/subtraction, difficulty tiers).
   - Answer input + validation + animations (correct/incorrect flows with hopping demo).
4. **Content & Feedback (Milestone 3)**
   - Word/money problem templates with text-to-speech.
   - Rewards (stickers, coins) and progress dashboard for parents.
   - Accessibility: color-blind friendly palette, audio cues, subtitles.
5. **Advanced Mechanics (Milestone 4)**
   - Multiplication/skip counting, custom practice modes.
   - Dynamic level builder for parents/teachers.
   - Online/offline sync, analytics, parental controls.

## Missing Considerations & Suggestions
- **Safety & Privacy**: Add parental gate for settings, COPPA-friendly data handling, anonymized analytics.
- **Localization**: Support multiple languages and voice packs to aid comprehension.
- **Dynamic Difficulty Adjustment**: Adapt operations based on accuracy/response time to keep engagement high.
- **Narrative Progression**: Story chapters (jungle, desert, arctic) to maintain motivation.
- **Reward Economy**: Sticker books, animal accessories, printable certificates.
- **Audio & Accessibility**: Narrated instructions, haptic feedback cues, keyboard navigation.
- **Parent Dashboard**: Web view summarizing strengths/weaknesses, recommended practice areas.
- **Content Authoring Tools**: Simple CMS or JSON templates for adding new scenes/questions without redeploys.
- **Instrumentation**: Event logging for level attempts, to refine difficulty and detect frustration.

## Implementation Order Checklist
1. ✅ Confirm tech stack & hosting (Supabase + Vercel) and provision accounts.
2. ✅ Initialize Next.js monorepo with pnpm workspaces; create packages for math engine & UI.
3. ⏳ Design database schema + Prisma migrations.
4. ✅ Build mock animal assets (basic shapes) + number line component.
5. ⏳ Implement authentication/profile selection with placeholder avatars.
6. 🔄 Build gameplay HUD + 3D scene + animation controllers.
7. ✅ Integrate question generator + feedback logic.
8. ⏳ Add progress tracking APIs and offline queue.
9. ⏳ Polish UI, add scenic backgrounds, word problem templates.
10. ⏳ Add monitoring, analytics, parental dashboard, and finalize MVP launch.

---

## Development Progress & Completed Work

### Milestone 0: Foundation (COMPLETED ✅)

**Repository Setup** (commits: ea3daf6, 7edad7d)
- ✅ Monorepo initialized with pnpm workspaces
- ✅ Next.js 15.0.0 + React 19 RC + TypeScript configured
- ✅ Tailwind CSS setup with custom configuration
- ✅ ESLint + formatting configured
- ✅ Vercel deployment configuration (subdirectory setup for monorepo)

**Build & Development Infrastructure** (commits: 9b93164, 87734f3, fac2531, 28f176b)
- ✅ Optimized Tailwind content paths for faster builds
- ✅ Vercel deployment configuration for monorepo structure
- ✅ Fixed deployment configuration (multiple iterations to get right)
- ✅ CI/CD pipeline via GitHub + Vercel

### Milestone 1: Core Gameplay Prototype (COMPLETED ✅)

**Game Components & Logic** (commits: 4c6a299, eecc2fe, 42f2f5d)
- ✅ `problem.ts`: Math problem generation system (addition/subtraction, 0-20 range)
- ✅ `GameClient.tsx`: Full game state management (5-round sessions)
- ✅ `NumberLine.tsx`: 2D animated number line with bunny visualization
- ✅ `EquationCard.tsx`: Math equation display component
- ✅ `ErrorBoundary.tsx`: Error handling wrapper

**Gameplay Features Implemented**
- ✅ 5-round gameplay sessions
- ✅ Addition and subtraction (0-20 range, jump size 1-5)
- ✅ Multiple choice answer selection (3 options)
- ✅ Real-time feedback (positive for correct, growth-oriented for incorrect)
- ✅ Score tracking: correct count, current streak, best streak
- ✅ Visual timeline showing round results
- ✅ Session summary/report screen
- ✅ Answer reveal with animated hop trail (bunny footprints)

**UI/UX Polish** (commits: 4c6a299, eecc2fe, 7d12aab, d0ab2fa, efa7def)
- ✅ Number line UI improvements (full number display, animated bunny)
- ✅ Removed blue track from number line for cleaner look
- ✅ Fixed bunny paw direction to match hop direction (bug fix)
- ✅ Responsive design for tablets and desktops
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ SVG favicon (replaced binary)

**Security & Performance** (commit: 33a726e)
- ✅ Content Security Policy (CSP) headers
- ✅ X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers
- ✅ Permissions-Policy to restrict unnecessary browser features
- ✅ Optimized font loading (display=swap, preconnect hints)
- ✅ TypeScript target updated to ES2020 for smaller bundles

**Code Quality**
- ✅ Error boundaries for graceful error handling
- ✅ TypeScript strict mode enabled
- ✅ CSS Modules for component-scoped styling
- ✅ Separation of concerns (lib/, components/, app/)

### Technical Debt & Architecture Notes

**Deviations from Original Plan:**
1. **2D instead of 3D**: Used CSS animations instead of Three.js/react-three-fiber for MVP speed
2. **Local state instead of Redux/Zustand**: Used React useState for simplicity
3. **No persistence**: All game state is in-memory, resets on refresh
4. **Monolithic game component**: GameClient manages all state (will need refactoring for multiplayer)

**Known Limitations:**
- No user authentication or profiles
- No database or progress persistence
- Fixed difficulty (no level progression)
- Limited to one game type (number line adventure)
- No analytics or instrumentation

---

## Next Phase: User Profiles, Progress Saving & Level Progression

### Overview
This phase focuses on implementing user authentication, persistent profiles, progress tracking, and a progressive difficulty system with unlockable levels.

### Architecture Decisions

**Authentication Strategy: Supabase Auth**
- **Rationale**:
  - Built-in email/password, magic links, OAuth
  - PostgreSQL database included
  - Real-time subscriptions for future multiplayer
  - Generous free tier
  - Row-level security (RLS) for data protection
  - Easy device sync via session management

**State Management: Zustand**
- **Rationale**:
  - Lightweight (1kb) vs Redux (10kb+)
  - No boilerplate (no reducers, actions, dispatch)
  - DevTools support
  - TypeScript-first
  - Persist middleware for localStorage sync
  - Easy to test and refactor

**Database Schema Design**

```sql
-- Users (managed by Supabase Auth)
-- auth.users table provided by Supabase

-- User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🐰',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level Definitions
CREATE TABLE level_definitions (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL,
  delta INTEGER NOT NULL,  -- Jump size (2, 3, 4, 5...)
  min_range INTEGER DEFAULT 0,
  max_range INTEGER DEFAULT 20,
  operations TEXT[] DEFAULT ARRAY['addition', 'subtraction'],
  required_accuracy DECIMAL DEFAULT 0.6,  -- 60% to unlock next level
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL REFERENCES level_definitions(level_number),
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,  -- Out of 5
  best_streak INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_number)
);

-- Session History (for detailed analytics)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL REFERENCES level_definitions(level_number),
  score INTEGER NOT NULL,  -- Correct answers (0-5)
  best_streak INTEGER NOT NULL,
  answers JSONB NOT NULL,  -- [{problem, selected, correct, timeMs}]
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR ALL USING (auth.uid() = user_id);
```

### Progressive Difficulty System Design

**Level Structure:**
```typescript
interface LevelConfig {
  levelNumber: number
  delta: number          // Jump size (2, 3, 4, 5, ...)
  minRange: number       // Starting number (default: 0)
  maxRange: number       // Maximum number (adjusts with difficulty)
  operations: Operation[] // ['addition', 'subtraction']
  requiredAccuracy: number // e.g., 0.6 = 60% to unlock next level
}
```

**Level Progression:**
```
Level 1: delta=2, range=[0, 10]   →  problems like: 2+2, 6-2, 8+2
Level 2: delta=3, range=[0, 15]   →  problems like: 3+3, 9-3, 12+3
Level 3: delta=4, range=[0, 20]   →  problems like: 4+4, 12-4, 16+4
Level 4: delta=5, range=[0, 25]   →  problems like: 5+5, 15-5, 20+5
Level 5: delta=6, range=[0, 30]   →  problems like: 6+6, 18-6, 24+6
...and so on
```

**Unlock Logic:**
- Level 1 is unlocked by default for all users
- To unlock Level N+1: Complete Level N with ≥60% accuracy (3/5 correct)
- Users can replay completed levels for better scores

**UI/UX Flow:**
1. **Login/Signup Screen** → Enter email + password
2. **Profile Setup** (first time) → Choose display name + emoji avatar
3. **Level Selection Screen** → Visual level map showing locked/unlocked/completed levels
4. **Gameplay** → Same 5-round experience, but with level-specific difficulty
5. **Session Complete** → Show score, unlock next level if qualified, save progress

---

## Implementation Plan: Phased Rollout with Small Diffs

### Phase 1: Database & Level System Foundation

**PR #1: Database Schema & Seed Data**
- Add Supabase client configuration
- Create migration files for schema
- Seed initial level definitions (levels 1-10)
- Add RLS policies
- **Testing**: Verify migrations run, seed data populates
- **Files changed**: `1-2 files` (new)
- **Estimated lines**: ~200 lines

**PR #2: Level Configuration System**
- Create `src/lib/levels.ts` with level config types
- Create `src/lib/supabase.ts` for database client
- Add utility functions: `getLevelConfig()`, `getAllLevels()`
- **Testing**: Unit tests for level config retrieval
- **Files changed**: `2-3 files` (new)
- **Estimated lines**: ~150 lines

**PR #3: Update Problem Generator for Dynamic Difficulty**
- Modify `generateProblem()` to accept `LevelConfig`
- Ensure only positive results (no negative answers)
- Update validation logic for custom delta values
- **Testing**: Unit tests for each level configuration
- **Files changed**: `src/lib/problem.ts` (1 file)
- **Estimated lines**: ~50 lines modified

### Phase 2: Authentication & User Profiles

**PR #4: Supabase Auth Setup**
- Install `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
- Configure Supabase client with environment variables
- Create auth context provider
- Add auth middleware for protected routes
- **Testing**: Manual testing of auth setup
- **Files changed**: `3-4 files` (new + config)
- **Estimated lines**: ~200 lines

**PR #5: Login/Signup UI**
- Create `src/app/auth/page.tsx` with login/signup form
- Add email/password validation
- Implement auth error handling
- Style with Tailwind (kid-friendly design)
- **Testing**: Manual UI testing, form validation tests
- **Files changed**: `2-3 files` (new)
- **Estimated lines**: ~250 lines

**PR #6: Profile Setup & Management**
- Create `src/app/profile/page.tsx` for profile setup
- Allow choosing display name + emoji avatar
- Create profile on first login
- Add profile editing functionality
- **Testing**: Profile CRUD operations
- **Files changed**: `2-3 files` (new)
- **Estimated lines**: ~200 lines

### Phase 3: Progress Tracking & Persistence

**PR #7: User Progress Store (Zustand)**
- Install `zustand`
- Create `src/stores/progressStore.ts`
- Implement actions: `unlockLevel()`, `saveSession()`, `updateProgress()`
- Add persist middleware for localStorage backup
- **Testing**: Unit tests for store actions
- **Files changed**: `1-2 files` (new)
- **Estimated lines**: ~150 lines

**PR #8: Progress API Routes**
- Create `/api/progress/[userId]` route for fetching progress
- Create `/api/sessions` route for saving game sessions
- Implement server-side validation
- Add error handling and logging
- **Testing**: API integration tests
- **Files changed**: `2-3 files` (new)
- **Estimated lines**: ~200 lines

**PR #9: Integrate Progress Persistence into GameClient**
- Update `GameClient.tsx` to save sessions on completion
- Fetch user progress on mount
- Update level unlock logic
- Show "Level unlocked!" animation on achievement
- **Testing**: E2E test for complete gameplay → save → retrieve
- **Files changed**: `src/components/GameClient.tsx` (1 file)
- **Estimated lines**: ~100 lines modified

### Phase 4: Level Selection & Navigation

**PR #10: Level Selection Screen**
- Create `src/app/levels/page.tsx` with level grid
- Show level cards: locked 🔒, unlocked ✅, completed 🏆
- Display best scores and streaks per level
- Add level preview (shows delta, range)
- **Testing**: UI tests for different progress states
- **Files changed**: `2-3 files` (new)
- **Estimated lines**: ~300 lines

**PR #11: Navigation & Routing Updates**
- Update `src/app/page.tsx` to redirect based on auth state
- Add protected route wrapper
- Create breadcrumb navigation
- Add "Back to Levels" button in GameClient
- **Testing**: Navigation flow tests
- **Files changed**: `3-4 files` (modified)
- **Estimated lines**: ~150 lines modified

**PR #12: Level-Specific Game Sessions**
- Update GameClient to accept `levelNumber` prop from URL params
- Fetch level config and pass to problem generator
- Show level info in UI (e.g., "Level 3: Jump by 4")
- Update session save to include level number
- **Testing**: E2E test for multi-level progression
- **Files changed**: `2-3 files` (modified)
- **Estimated lines**: ~100 lines modified

### Phase 5: Polish & Testing

**PR #13: Loading States & Error Handling**
- Add loading spinners for async operations
- Implement error boundaries for auth errors
- Add retry logic for failed saves
- Show user-friendly error messages
- **Testing**: Error scenario tests
- **Files changed**: `4-5 files` (modified)
- **Estimated lines**: ~150 lines modified

**PR #14: E2E Test Suite**
- Set up Playwright for E2E testing
- Write tests for: signup → play → progress save → level unlock
- Write tests for: login → resume progress → play next level
- Add CI integration for E2E tests
- **Testing**: Full E2E coverage
- **Files changed**: `3-5 files` (new test files)
- **Estimated lines**: ~400 lines

**PR #15: Deployment & Monitoring**
- Add environment variables to Vercel
- Configure Supabase production instance
- Add health check endpoint (`/api/health`)
- Set up Vercel deployment status checks
- Add logging for critical errors
- **Testing**: Manual production testing
- **Files changed**: `2-3 files` (config)
- **Estimated lines**: ~100 lines

---

## Development Workflow for Each PR

### 1. Create Feature Branch
```bash
git checkout -b feature/pr-{number}-{description}
```

### 2. Implement Changes
- Write code following TypeScript best practices
- Keep changes focused and small (<300 lines if possible)
- Add inline comments for complex logic

### 3. Write Tests
```bash
# Unit tests (Jest)
npm run test -- src/lib/problem.test.ts

# E2E tests (Playwright)
npm run test:e2e -- tests/gameplay.spec.ts
```

### 4. Local Validation
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Run dev server
npm run dev
```

### 5. Create Pull Request
```bash
git add .
git commit -m "feat(PR#): Brief description

Detailed explanation of changes.

Testing:
- Unit tests: X passing
- Manual testing: Y scenarios verified

🤖 Generated with Claude Code"

git push origin feature/pr-{number}-{description}
gh pr create --title "PR #{number}: Title" --body "Description"
```

### 6. Code Review (with AI Assistance)
- Use `@codex` mentions in PR for automated review
- Address comments and feedback
- Push fixes to the same branch

### 7. Merge & Deploy
```bash
# After approval
gh pr merge --squash

# Monitor Vercel deployment
vercel --prod --token $VERCEL_TOKEN

# Check deployment status
vercel ls --token $VERCEL_TOKEN
```

### 8. Verify Deployment
```bash
# Check production health
curl https://your-app.vercel.app/api/health

# Monitor logs
vercel logs your-app.vercel.app
```

### 9. Retry on Failure
```bash
# If deployment fails, redeploy
vercel --prod --force --token $VERCEL_TOKEN

# Check build logs
vercel logs --follow
```

---

## Summary of Changes

### What's Been Built (Completed)
- ✅ Monorepo infrastructure (Next.js + pnpm workspaces)
- ✅ Core gameplay mechanics (5-round sessions, problem generation)
- ✅ 2D number line visualization with animations
- ✅ Score tracking (correct count, streaks, history)
- ✅ Feedback system (positive/growth-oriented messages)
- ✅ Security headers and performance optimizations
- ✅ Vercel deployment configuration
- ✅ Error handling and boundaries

### What's Missing (To Be Built)
- ❌ User authentication (login/signup)
- ❌ User profiles with avatars
- ❌ Database integration (PostgreSQL via Supabase)
- ❌ Progress persistence across sessions
- ❌ Progressive difficulty levels (delta=2,3,4,5...)
- ❌ Level unlock system
- ❌ Level selection screen
- ❌ State management library (Zustand)
- ❌ E2E test suite (Playwright)

### Estimated Timeline
- **Phase 1** (Database & Levels): 3 PRs, ~2-3 days
- **Phase 2** (Auth & Profiles): 3 PRs, ~2-3 days
- **Phase 3** (Progress Tracking): 3 PRs, ~2-3 days
- **Phase 4** (Level Selection): 3 PRs, ~2-3 days
- **Phase 5** (Polish & Testing): 3 PRs, ~2-3 days

**Total: 15 PRs, ~10-15 days of development**

---

## Risk Assessment & Mitigation

### Technical Risks
1. **Supabase Setup Complexity**
   - *Mitigation*: Use Supabase CLI for local development, follow official docs
2. **RLS Policy Bugs**
   - *Mitigation*: Write integration tests for all auth scenarios
3. **State Synchronization Issues**
   - *Mitigation*: Use Zustand persist middleware + optimistic updates
4. **Vercel Deployment Failures**
   - *Mitigation*: Implement retry logic, monitor deployment status, keep builds small

### User Experience Risks
1. **Difficulty Progression Too Steep**
   - *Mitigation*: Make Level 1 very easy (delta=2, range=[0,10]), gather feedback
2. **Login Friction for Kids**
   - *Mitigation*: Implement magic links or simple PIN codes (future enhancement)
3. **Progress Loss on Browser Clear**
   - *Mitigation*: Persist to database immediately, show "Saved!" confirmation

---

## Next Steps

1. **Review this plan** with the team
2. **Provision Supabase project** (free tier)
3. **Create GitHub project board** to track PRs
4. **Start with PR #1** (Database Schema)
5. **Iterate quickly** with daily reviews
