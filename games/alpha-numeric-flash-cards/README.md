# Alpha Numeric Flash Cards

Kid-friendly flash cards that help toddlers call out digits and the English alphabet. The UI is optimized for iPad/iPhone browsers, features quick mode switching, and now records spoken attempts locally so we can feed them to OpenAI Whisper in the next milestone.

## Tech Highlights

- **Next.js 14 (App Router)** with TypeScript and Tailwind CSS 4 for fast hydration on mobile browsers.
- **Framer Motion** animations for delightful card swaps.
- **Recorder-aware hooks** (`useMicRecorder`) wrap the Web Audio API + MediaRecorder, exposing blobs that will be streamed to Whisper.
- **Vitest + Testing Library** for deterministic Fisher–Yates shuffle coverage and time-format helpers.
- Deployment target: **Vercel project `alpha-numeric-flash-cards`** (Preview for every branch, Production on `main`).

## Getting Started

Install dependencies from the monorepo root once:

```bash
pnpm install
```

Then, from this package:

```bash
pnpm dev        # start http://localhost:3000
pnpm lint       # next lint
pnpm test       # vitest run
pnpm build      # next build
```

## Project Structure

```
src/
  app/          → App Router entry + global styles
  components/   → UI primitives (mode selector, card, mic button, attempt history)
  data/         → Static decks for numbers and letters
  hooks/        → Deck + mic recorder hooks
  lib/          → Deterministic shuffle + utilities
  utils/        → Duration/format helpers
```

### Mic Workflow (Milestone 1)

- `useMicRecorder` lazily requests `navigator.mediaDevices.getUserMedia`, manages `MediaRecorder`, clamps duration to 4 seconds, and emits `RecordingResult` objects containing the blob + object URL.
- `MicButton` now toggles between start/stop states, surfaces permission/unsupported hints, and feeds the recorder hook.
- `AttemptHistory` lists the freshest five attempts with inline audio playback so parents can review pronunciations before Whisper integration.
- Helper utilities (`utils/duration.ts`) format timestamps and durations for friendly display.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Required once `/api/transcribe` is implemented. Store in the Vercel project and `.env.local` for local testing. |
| `NEXT_PUBLIC_APP_BASE_URL` | Used for callback URLs and telemetry when we enable secure API access. |

## Deployment

1. Connect the repo’s `games/alpha-numeric-flash-cards` directory to a dedicated Vercel project.
2. Set build command `pnpm install && pnpm --filter alpha-numeric-flash-cards build`.
3. Vercel Preview URLs are required QA checkpoints for each PR; list tested flows in the PR description.
4. After merge to `main`, Vercel promotes the Production deployment automatically.

## References

- [PLAN.md](./PLAN.md) — implementation roadmap.
- [DELIVERY.md](./DELIVERY.md) — worktree + PR workflow.
- [design/ux-concept.png](./design/ux-concept.png) — hero mock used for Milestone 0.
