# Alpha Numeric Flash Cards — Delivery Workflow

## Branching & Worktrees
- Each PR lives in its own worktree under `/Users/usmanaven.com/math-games-worktrees` to avoid stepping on other agents.
- Naming convention: `/pr-<n>-<slug>` mapped to branch `feature/pr-<n>-<slug>` forked from `main`.
- No direct commits inside `/Users/usmanaven.com/math-games`; always work within the worktree for your PR.

## PR Expectations
1. **Small Scope** — target one milestone slice (scaffold, mic hook, Whisper API, etc.).
2. **Tests** — add or update Vitest / Testing Library coverage for every change; Playwright flows join once we wire mic + Whisper.
3. **Docs** — update `PLAN.md`, `PROGRESS.md` (TBD), and README sections when behavior shifts.
4. **Linkage** — every PR references the GitHub Project `@usmanghani's Alpha Numeric Flash Cards` (Project #2) and Issue tracker entries. Tag `@codex` for code review.

## Vercel Preview Verification
1. Push branch → Vercel automatically spins up a Preview deployment.
2. Wait for the Preview URL on the PR (or run `vercel status <preview-url>` if impatient).
3. Manually test:
   - Desktop + iPhone/iPad breakpoints.
   - Any new API routes via browser/curl.
   - Mic UI flows touched in the PR.
4. Summarize the Preview URL + manual checks in the PR description.

## Release Flow
- After approval, merge to `main`; Vercel promotes Production.
- Mark the corresponding GitHub Project item as `Done` only after Production verification.

This guardrail keeps PRs isolated, auditable, and always validated against a live Vercel preview before merging.
