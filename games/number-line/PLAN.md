# Number Line Adventure — Planning Document

## Vision
Create a web-based, device-agnostic learning game that helps early learners internalize addition and subtraction by animating their favorite animals along a number line. The experience should feel like a storybook come to life while quietly tracking progress, adapting difficulty, and preparing the platform for future multiplication and word problem levels.

## Guiding Principles
1. **Playful accuracy** – Animations must always show the correct mathematical transition so the visual reinforces the lesson.
2. **Rapid iteration** – Keep level data and scenery generation data-driven to add new quests quickly.
3. **Cross-device continuity** – Cloud profiles and progress so a child can continue on any iPad, laptop, or desktop.
4. **Extensible platform** – Architecture must support future games sharing authentication, reward systems, and art assets.

## Implementation technologies
| Concern | Technology | Notes |
| --- | --- | --- |
| Front-end client | React + TypeScript + Vite | Fast local dev, strong typing, easy to deploy as PWA.
| 3D/animation | Three.js (WebGL) with react-three-fiber | Declarative scenes, responsive layouts, mobile friendly.
| UI layer | Tailwind CSS + Radix UI | Consistent components and accessible modals.
| State management | Zustand or Redux Toolkit | Persist user session, game progress, and per-level feedback.
| Authentication & database | Supabase (Auth + Postgres) | Handles email/pass or magic links, row-level security for child data.
| Cloud functions | Supabase edge functions / Cloudflare Workers | For generating adaptive problem sets, telemetry, and parental reports.
| Asset pipeline | Blender-exported GLTF + procedural generators | Combine authored animal models with procedural scenery (gradients, particle effects).
| Testing | Vitest + React Testing Library for UI, Playwright for e2e | Automate correctness of problem logic and UX flows.
| Deployment | Vercel/Netlify (static front-end) + Supabase backend | Simple CI/CD with preview deployments per branch.

## Repository architecture
```
games/
  number-line/
    PLAN.md                # This document (living spec)
    app/                   # React client (src/, public/, vite.config.ts)
    server/                # Edge functions, adapters, and schema migrations
    assets/                # GLTF, textures, procedural generation scripts
shared/
  auth/                    # Future shared auth helpers
  telemetry/               # Analytics + parental reports utilities
```
Additional top-level files: `.github/` workflows, `docs/` for product briefs, `package.json` for monorepo tooling (PNPM workspaces) when code begins.

## Feature roadmap

### Milestone 0 — Planning & scaffolding (current)
- Finalize tech stack and directory layout (this PLAN).
- Define shared design language (color palette, typography, animal art bible).
- Establish Supabase project & initial schema (users, profiles, progress, level_attempts).

### Milestone 1 — Core platform foundations
1. **Authentication & profiles**
   - Supabase email/magic-link auth; optional parental PIN.
   - Profile avatars with animal icons; support custom uploads.
   - Local session persistence + silent refresh to keep kids logged in.
2. **Home / profile carousel**
   - Mac-login-style carousel of circles showing active kid profiles.
   - Tap/click profile to resume last unlocked level.
3. **Progress tracking**
   - Tables: `profiles`, `levels`, `level_attempts`, `achievements`.
   - Client sync strategy: fetch profile snapshot on login, subscribe for updates.

### Milestone 2 — Number line gameplay loop
1. **Level data model**
   - JSON schema: `{ id, operationType, start, delta, levelTheme, animal, tips, difficultyTier }`.
   - Level generator that ramps ranges (0-20, 0-50, 0-100) and operations (±1, ±5, ±10, ±20).
2. **Scene rendering**
   - Procedurally generated backgrounds (sky gradient, parallax hills, optional city/camp themes).
   - Number line component: dynamic tick spacing, labels, highlight of start/answer segments.
   - Animal rigs (dinosaur, cheetah, bunny) with idle + hop animations.
3. **Question interaction**
   - Prompt narration text + optional audio (text-to-speech) for pre-readers.
   - Answer buttons (multiple choice) + option to tap number line directly.
   - Feedback UI (sparkles + encouraging voice lines) for correct/incorrect answers.
   - Automatic demonstration: animal hops along each integer step showing the result.
4. **Level progression**
   - Stars/badges for accuracy, streaks, speed.
   - Unlock gates: e.g., complete 3 levels with ≥80% accuracy to unlock next band.

### Milestone 3 — Adaptive learning & enrichment
1. **Adaptive difficulty engine**
   - Analyze `level_attempts` for error types (borrowing confusion, big jumps) and adjust generator parameters.
   - Introduce scaffolded hints (e.g., show number bonds, highlight segments) when streak of incorrect answers occurs.
2. **Content variety**
   - Word problems (“The bunny has 12 carrots…”), money scenarios (coins on number line), counting objects overlays.
   - Seasonal scenery packs (snow, jungle) to keep visuals fresh.
3. **Parent dashboard**
   - Web view summarizing time spent, accuracy per skill, recommended focus.
   - Exportable PDF progress report.

### Milestone 4 — Future extensions
- Multiplication & division levels using equal jumps on number line.
- Multi-player cooperative mode (“race the cheetah”) for siblings.
- Offline-first PWA caching and background sync.
- Localization (text + narration) starting with English/Spanish.

## Data model sketch
```
profiles (id, user_id, display_name, avatar_url, favorite_animal, created_at)
levels (id, world, difficulty_tier, operation_type, min_start, max_start, min_delta, max_delta)
level_instances (id, profile_id, level_id, start_value, delta_value, generated_at)
level_attempts (id, level_instance_id, submitted_answer, is_correct, time_spent_ms)
achievements (id, profile_id, slug, unlocked_at)
settings (profile_id FK, narration_enabled, music_volume, high_contrast)
```

## Cross-device & offline strategy
- Supabase auth token stored in secure storage (IndexedDB via `@supabase/auth-helpers-nextjs`).
- Use Service Worker + Vite PWA plugin to cache core assets and last 10 level configs.
- When offline, queue `level_attempts` in IndexedDB and sync via background sync API.

## Testing strategy
- **Unit tests**: problem generation, scoring logic, adaptive difficulty adjustments.
- **Component tests**: Number line, animal animation triggers, profile carousel.
- **E2E**: login flow, level completion, offline resume.
- **Usability playtests**: capture session recordings (parental consent) to watch how kids interact.

## Accessibility considerations
- Large tap targets (≥48px) and responsive layout for iPad + laptop.
- High-contrast option, dyslexia-friendly font for text.
- Subtitles for narration; ability to replay instructions.
- Avoid flashing animations and keep motion comfortable (reduced motion mode).

## Audio & feedback system
- Layered sound design: ambient background loop + per-animal hop sounds + success/failure chimes.
- Use Web Audio API for dynamic volume ducking when narration plays.
- TTS fallback using browser SpeechSynthesis; downloadable voice packs later.

## Security & privacy
- COPPA-friendly data handling: parental consent, minimal PII, anonymized analytics.
- Role-based Supabase policies (parents manage profiles, kids only read/write their own progress).
- Transparent privacy policy surfaced at account creation.

## Open questions & potential additions
- Should there be a practice/sandbox mode without scoring for free exploration?
- Consider integrating printable worksheets that mirror in-game progress for offline reinforcement.
- Explore haptic feedback for supported tablets to emphasize hops.
- Evaluate subscription vs one-time purchase business model for sustaining development.
- Research AI-generated scenery cautiously to maintain consistent art direction.

## Next steps
1. Validate Supabase as the backend choice (cost, parental controls). If not viable, design alternative (Firebase Auth + Firestore).
2. Create low-fidelity wireframes for profile selection and gameplay HUD.
3. Prototype animal hop animation in react-three-fiber to confirm performance on iPad.
4. Define Level 1–10 curriculum with concrete learning objectives and sample prompts.
5. Draft parental onboarding copy and consent flows.
