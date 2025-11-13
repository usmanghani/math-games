# Math Games

A collection of math-based learning games designed to help kids build strong number sense through playful, story-driven experiences. Each game lives in its own folder inside the `games/` directory and shares common platform utilities such as authentication, progress tracking, and art assets.

## Repository structure

```
math-games/
├── games/
│   └── number-line/        # Game 1: Number line visualization (PLAN.md lives here)
├── shared/                 # Reusable modules (to be added as games grow)
├── .gitignore
└── README.md
```

## Getting started

1. Read the planning document for each game under `games/<game-name>/PLAN.md` to understand the current roadmap.
2. Implement shared services (auth, persistence, art pipeline) inside the `shared/` directory when they become common needs.
3. Each game should have:
   - a standalone client app (web-first) under `games/<game-name>/app/`
   - backend or cloud functions under `games/<game-name>/server/`
   - assets or generators under `games/<game-name>/assets/`

## Contributing

1. Start with a detailed plan in `PLAN.md` before writing any production code.
2. Keep commits focused and reference the relevant plan sections.
3. Update the plan whenever requirements change.
