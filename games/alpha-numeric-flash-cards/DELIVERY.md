# Alpha Numeric Flash Cards — Delivery Workflow

## Branching & Worktrees
- Each PR lives in its own worktree rooted under `/Users/usmanaven.com/math-games-worktrees`.
- Naming pattern: `/pr-<n>-<slug>` mapped to branch `feature/pr-<n>-<slug>` based on `main`.
- No direct edits on `/Users/usmanaven.com/math-games`; work happens inside the worktree to avoid clobbering other agents.

## PR Structure
1. **Small Scope**: Target 1 milestone slice per PR (e.g., scaffold, mic hook, API route).
2. **Tests**: Include Vitest/unit or integration tests covering the change. For UI-only adjustments, add Playwright smoke cases.
3. **Docs**: Update `PLAN.md`, `PROGRESS.md` (once created), or READMEs when behavior shifts.
4. **Linkage**: Reference tracking Issue/Project card (GitHub Project: `@usmanghani's Alpha Numeric Flash Cards`, #2). Ping reviewers via `@codex` when ready.

## Vercel Preview Verification
1. Push branch → Vercel auto-creates Preview deployment.
2. Wait for `deployment-ready` status in PR or run `vercel status <url>` if needed.
3. Manually test:
   - Load `/` on desktop + iPhone/iPad viewports.
   - Exercise any new API route via browser or `curl` (expect 2xx, correct payload).
   - Verify mic prompts/UI flows impacted by changes.
4. Attach a short checklist to the PR description summarizing the preview URL + manual results.

## Release Flow
- After approval, merge to `main`; GitHub Actions + Vercel promote to Production.
- Tag board items/Issues as `Done` once production confirm.

This workflow keeps deployments testable per-PR and ensures we always validate the Vercel preview before merging.
