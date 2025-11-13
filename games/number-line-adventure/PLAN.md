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
1. Confirm tech stack & hosting (Supabase + Vercel) and provision accounts.
2. Initialize Next.js monorepo with pnpm workspaces; create packages for math engine & UI.
3. Design database schema + Prisma migrations.
4. Build mock animal assets (basic shapes) + number line component.
5. Implement authentication/profile selection with placeholder avatars.
6. Build gameplay HUD + 3D scene + animation controllers.
7. Integrate question generator + feedback logic.
8. Add progress tracking APIs and offline queue.
9. Polish UI, add scenic backgrounds, word problem templates.
10. Add monitoring, analytics, parental dashboard, and finalize MVP launch.
