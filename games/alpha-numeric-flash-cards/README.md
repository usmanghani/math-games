# Alpha Numeric Flash Cards

Kid-friendly flash cards that help toddlers call out digits and the English alphabet. The UI is optimized for iPad/iPhone browsers, features quick mode switching, and will soon stream mic audio to OpenAI Whisper for speech-to-text validation.

## Tech Highlights

- **Next.js 16 (App Router)** with TypeScript and Tailwind CSS 4 for fast hydration on mobile browsers.
- **Framer Motion** animations for delightful card swaps.
- **Zustand-ready hooks** (`useFlashDeck`) to manage shuffled decks per mode.
- **Vitest + Testing Library** for deterministic Fisher–Yates shuffle coverage.
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
  components/   → UI primitives (mode selector, card, mic button)
  data/         → Static decks for numbers and letters
  hooks/        → Deck + mic simulator hooks
  lib/          → Deterministic shuffle + utilities
```

### Placeholder Mic Workflow

`useMicSimulator` animates the mic states (idle → listening → processing) so we can design the user experience before wiring up MediaRecorder + Whisper (Milestone 2).

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
