# Number Line Adventure

A friendly Vite + React playground for practicing one-digit addition and subtraction with a bunny guide and a visual number line.

## Features

- 🎯 Five-round sessions with a live progress dashboard, streak tracking, and a celebratory summary card.
- 🐰 Animated number line with bunny/carrot markers, hop trails, and floating scenery to keep learners engaged.
- ✅ Deterministic problem generator that keeps hops inside the requested range and is backed by Vitest coverage.

## Local development

```bash
npm install
npm run dev
```

Then open the printed URL (typically http://localhost:5173) in your browser.

## Testing

```bash
npm run test
```

Vitest watches the generator logic and enforces that every hop stays on the line.

## Production build

```bash
npm run build
```

Vite outputs an optimized build in `dist/` which can be previewed via `npm run preview` if desired.
