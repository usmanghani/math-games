# Number Line Adventure App

This directory houses the **Number Line Adventure** web application described in [`PLAN.md`](./PLAN.md). It is built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/) with future integrations planned for `react-three-fiber`/Three.js to power the animated gameplay scenes.

## Available scripts

All commands can be executed from the repository root (`pnpm <cmd>`) or inside this folder via your preferred package manager.

```bash
# Start the dev server with hot reload
pnpm dev

# Create an optimized production build
pnpm build

# Run the production server locally (after build)
pnpm start

# Lint the project using Next.js + ESLint
pnpm lint
```

Once the dev server is running, open [http://localhost:3000](http://localhost:3000) to view the placeholder UI. Begin iterating in `src/app/page.tsx` and add new routes or components per the implementation milestones in `PLAN.md`.

## Project structure

- `src/app/` – Route handlers and top-level layouts.
- `src/components/` – (to be created) shared UI widgets and scene helpers.
- `public/` – Static assets such as icons and environment textures.
- `tailwind.config.ts` & `postcss.config.mjs` – Styling pipeline configuration.
- `tsconfig.json` – TypeScript settings shared across the app.

Refer to [`PLAN.md`](./PLAN.md) for the gameplay roadmap, data considerations, and milestone breakdown guiding future commits.
