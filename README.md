# Math Games

A collection of math-based learning games designed for young kids. Each game lives in its own folder under `games/` with its own plan and implementation timeline.

## Repository Structure
- `games/number-line-adventure/` – First project focused on teaching number-line based addition/subtraction. Contains `PLAN.md` describing the full implementation approach.
- `packages/` (future) – Shared libraries such as math engines, UI components, and animation helpers.
- `infrastructure/` (future) – Database schemas, IaC, deployment config.

## Getting Started
1. Install [Node.js 20](https://nodejs.org/) (Corepack is bundled) and enable pnpm via `corepack enable pnpm`.
2. Install dependencies for the entire workspace:
   ```bash
   pnpm install
   ```
3. Start the Number Line Adventure Next.js app:
   ```bash
   pnpm dev
   ```
4. Read `games/number-line-adventure/PLAN.md` for the current roadmap, tech stack, and feature milestones.
5. Follow the plan to implement authentication, gameplay, and progress tracking in iterative milestones.

## Contributing
- Keep each game isolated so assets and gameplay logic stay maintainable.
- Update the relevant `PLAN.md` before beginning major development to ensure alignment on features and tech choices.
- Use conventional commits and include screenshots for UI-heavy changes when possible.
