# Speech Flash Cards — Implementation Plan

## Vision & Audience
- Build a browser-based flash card experience that helps a three-year-old confidently recognize numbers and the English alphabet.
- Cards are bold, high-contrast, and animated with gentle feedback so the app feels like play instead of testing.
- The game listens to the child’s spoken answer, sends it to OpenAI Whisper for speech-to-text, compares the transcript to the card, and celebrates wins (or encourages retries) with visual cues.
- Runs well on touch-first browsers (iPhone, iPad, Android tablets) and desktop so parents can mirror it on larger screens.

## Experience Pillars
1. **Simple Modes**: Three taps away from playing; each mode (Numbers Only, Letters Only, Mixed) clearly described with an icon + color.
2. **Captivating Cards**: Large glyph, animated border, subtle background stickers (stars, rockets) rotating per card to keep attention.
3. **Hands-free Answering**: Tap-to-speak workflow with big microphone button, pulse animation while recording, progressive states (listening, transcribing, success/fail).
4. **Positive Feedback**: Sticker animation, confetti bursts, and “Let’s try again!” cues rather than red Xs.
5. **Privacy & Safety**: Explicit mic permission prompt, quick delete of recordings after transcription, no external data stored by default.

## Technology Stack
| Concern | Choice | Rationale |
| --- | --- | --- |
| Framework | **Next.js 14 (App Router) + React + TypeScript** | Matches existing repo conventions, SSR/ISR ready, great DX, responsive hydration for mobile Safari/Chrome. |
| UI layer | **Tailwind CSS + CSS variables + Framer Motion** | Fast iteration on kid-friendly visuals, easier to maintain consistent spacing/color tokens, simple animations. |
| State management | **Zustand + Immer** | Lightweight global store for mode selection, streaks, and microphone state without Redux overhead. |
| Audio capture | **Web Audio API + MediaRecorder + WavEncoder worker** | Reliable mic capture on Safari/iOS, ability to encode short WAV/PCM blobs before upload. |
| Speech-to-text | **OpenAI Whisper (gpt-4o-mini-transcribe or Whisper-1)** via Next.js API route | Accurate toddler speech transcription; server route hides API key and can run streaming decode with chunked uploads. |
| Card content | Static config JSON + helper utilities | Deterministic sequences for letters/numbers, easy to expand to words later. |
| Deployment | **Vercel** (edge/static hosting) | Same as existing games, handles env secrets for OpenAI key, global edge network for low-latency STT.
| Testing | **Playwright (touch simulation), Vitest + React Testing Library** | Validates responsive flows and transcription state machine.

## Core Mechanics
### Game Modes & Limits (initial release)
| Mode | Pool | Notes |
| --- | --- | --- |
| Numbers Only | Digits **0–20** displayed numerically | Accepts spoken digits ("two") mapped to numeric string; includes optional dots representing quantity for scaffolding. |
| Letters Only | Uppercase A–Z | Accepts single-letter responses (“bee”), tolerant of “letter B”. |
| Mixed Mode | Auto alternates number/letter per card | Keeps novelty high; difficulty toggle to bias to numbers or letters. |

### Card Loop Flow
1. Player picks a mode (or uses quick start default: Numbers Only).
2. Game pulls the next card from the shuffled pool (Fisher-Yates shuffle seeded for fairness).
3. Show card with subtle intro animation + optional “Play Sound” button that speaks the prompt for non-readers.
4. Player taps the mic button → `navigator.mediaDevices.getUserMedia` opens; UI shows pulsing state.
5. After 2–3 seconds (or manual stop), audio blob is uploaded to `/api/transcribe`.
6. Backend streams to Whisper, returns transcript + confidence.
7. Client normalizes (strip punctuation, unify case, map words to digits) and compares to the correct answer.
8. UI feedback: green confetti + sticker if correct; encouraging animation + “Let’s try saying ___ together” if incorrect. Optionally auto-advance or let parent repeat.

### Speech Comparison Rules
- Numbers: Accept either digit (“2”) or word (“two”), tolerant of homophones by using an allowlist map (`{ "to": "two", "too": "two" }`).
- Letters: Accept spelled-out letter (“bee”) or spelled letter preceded by “letter”. Use Nato-like fallback list for ambiguous ones (“cee”, “sea”).
- Mixed mode: detect type by current card metadata.
- Confidence threshold: if Whisper returns <0.5 confidence, prompt user to retry rather than marking incorrect.

## System Architecture
### Frontend (Next.js App Router)
- `/app/page.tsx`: mode selector + CTA.
- `/app/play/[mode]/page.tsx`: main gameplay route, loads initial card list via server component for quick first paint.
- Components: `CardDisplay`, `MicButton`, `FeedbackOverlay`, `ModeChips`, `ConfettiCanvas` (canvas-based for perf), `ProgressDots`.
- Hooks: `useFlashDeck` (shuffling & progression), `useMicRecorder` (MediaRecorder lifecycle + permission prompts), `useSpeechResult`.
- Global store: `session` (mode, index, streak, lastResult) + `audio` state (isRecording, permission, lastTranscript).

### Backend / API Routes
- `/app/api/transcribe/route.ts` (Edge runtime):
  - Validates `Content-Type: audio/wav` and 5s max length.
  - Streams file to OpenAI Whisper (`client.audio.transcriptions.create`).
  - Normalizes transcript server-side (trim, lower, map spelled numbers) to reduce client logic duplication.
  - Returns JSON `{ transcript, normalized, confidence, durationMs }`.
- `/app/api/cards/route.ts` (optional) serves curated decks for future personalization.
- Logging: use Vercel Edge Config / Sentry for error capture; ensure transcripts deleted post-response (no persistence without consent).

### OpenAI / Whisper Integration Flow
1. Client records PCM → WAV via `AudioWorklet` (to avoid Safari’s AAC-only MediaRecorder bug).
2. POST to API route with FormData + metadata (card id, type, pronunciation hints).
3. Server proxies to OpenAI using streamed upload (Node Readable) to minimize memory.
4. Server receives transcript and confidence; optionally re-run simple regex for unpredictable spaces.
5. Response merges with card metadata so client can immediately show result + store attempt history.

## Data & Configuration
- `src/data/cards.ts`: exports arrays for numbers, letters with display text, speech hints (“bee”), and fallback synonyms.
- `src/utils/speechNormalization.ts`: contains mapping tables, `normalizeNumber`, `normalizeLetter`, `scorePronunciation`.
- Session persistence: store last mode + stats in `localStorage` (via Zustand persist) so kids can resume.
- Analytics (optional later): simple event queue (card shown, attempt result) buffered locally.

## UI/UX Notes
- Color palette: 4 primary colors (sunny yellow, ocean blue, clover green, coral) with gradient backgrounds rotating per card.
- Typography: Rounded, large (min 120px glyph) using custom font (e.g., Baloo, fallback system).
- Provide sound cues: simple earcon when mic active, gentle chime for success.
- Accessibility: ensure 4.5:1 contrast, add text alternatives, respect prefers-reduced-motion (disable confetti).
- Responsive layout: use CSS clamp for card size; ensure hit targets ≥ 56px on mobile.

## Implementation Roadmap
1. **Milestone 0 — Scaffold (0.5 day)**
   - Initialize Next.js app in `games/speech-flash-cards` with Tailwind, linting, shared tsconfig.
   - Add base routes, layout, fonts, color tokens.
   - Implement card data + shuffle utilities with placeholder UI.
2. **Milestone 1 — Core Gameplay Loop (1 day)**
   - Build mode selector + deck progression, progress dots, confetti overlay.
   - Implement `useMicRecorder` hook with MediaRecorder + UI states (✅ delivers short audio blobs + permission handling).
   - Add Playwright smoke test (mode selection, card advance) and Vitest for shuffle utils.
3. **Milestone 2 — Whisper Integration (1–1.5 days)**
   - Build `/api/transcribe` route, integrate OpenAI SDK, handle streaming uploads + error states.
   - Implement normalization + comparison logic, fallback for offline (Web Speech API) when OpenAI unreachable.
   - Add telemetry/logging + environment variable documentation.
4. **Milestone 3 — Polish & Accessibility (1 day)**
   - Visual polish (animations, stickers, sound cues), responsive QA on iPhone/iPad/Android.
   - Add parent helper overlays (tips, “say the letter name”).
   - Harden tests: Playwright scenario verifying mic permission flow (mocked), contract tests for API route.

## Risks & Mitigations
- **Toddler speech variance** → maintain growing synonyms list + fallback manual override button for parents.
- **Mic permission friction** → early modal explaining why mic needed + detect/guide when denied.
- **Latency to Whisper** → send short clips (<3s), show engaging loading animation, consider caching transcripts for repeated cards.
- **Browser incompatibilities** → fallback to Web Speech API when MediaRecorder unavailable (desktop Safari <14).
- **Privacy** → emphasize ephemeral audio handling, optionally add toggle to disable remote transcription (manual reveal button).

## Testing Strategy
- **Unit tests** for deck generation, normalization maps, classification logic.
- **Integration tests** mocking `/api/transcribe` to ensure UI state machine transitions (recording → waiting → success/fail).
- **Playwright** coverage for iPhone 12 viewport + iPad; ensures tap targets accessible and mic CTA visible.
- **Manual QA checklist** for actual devices verifying audio permission prompts, Safari quirks, low-bandwidth mode.

## Deployment & Ops
- Use `.env.local` for `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_BASE_URL`.
- Provision a dedicated Vercel project targeting `games/alpha-numeric-flash-cards` with `pnpm install && pnpm build` and `next build` outputs; wire production + preview domains before feature work begins (✅ linked as `alpha-numeric-flash-cards`).
- Store environment variables (`OPENAI_API_KEY`, `NEXT_PUBLIC_APP_BASE_URL`) in Vercel project settings so the `/api/transcribe` route never exposes keys client-side.
- Monitor API route latency via Vercel logs; add simple health endpoint returning build info.
- Provide README instructions for parents to run locally + configure keys, plus deployment notes for Vercel (expected Node version, env var names).
