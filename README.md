# Math Games

A collection of math-based learning games designed for young kids. Each game lives in its own folder under `games/` with its own plan and implementation timeline.

## Repository Structure
- `games/number-line-adventure/` – Number line based addition/subtraction game (Next.js 15 + React 19). Fully functional with 5-round gameplay, progress tracking, and animated visualizations. Contains `PLAN.md` for future roadmap.
- `shared/` – Shared libraries and utilities across games.

## Current Features

### Number Line Adventure
✅ **Gameplay**
- 5-round sessions with addition/subtraction (0-20 range)
- Interactive number line with animated bunny
- Multiple choice answer selection
- Progress tracking (correct count, best streak)
- Session summary and reports

✅ **User Experience**
- Positive and growth-oriented feedback
- Keyboard and mouse support
- Responsive design
- Accessibility features (ARIA labels)
- Error boundaries for graceful error handling

✅ **Technical**
- Next.js 15 with App Router
- React 19 RC
- TypeScript
- Tailwind CSS + CSS Modules
- Static Site Generation (SSG)
- Security headers configured

## Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/) (includes Corepack)
- Enable pnpm: `corepack enable pnpm`

### Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start development server**
   ```bash
   pnpm dev
   ```
   The app will be available at http://localhost:3000

3. **Build for production**
   ```bash
   pnpm build
   ```

4. **Run production build**
   ```bash
   pnpm start
   ```

### Available Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests (when configured)

## Future Plans

See `games/number-line-adventure/PLAN.md` for detailed roadmap including:
- User authentication (Supabase/Clerk)
- Profile/avatar selection
- Database integration for progress tracking
- 3D scene rendering with Three.js
- Adaptive difficulty
- Parental dashboard
- Offline PWA support
- Localization (English/Spanish)

## Contributing

- Keep each game isolated so assets and gameplay logic stay maintainable
- Update the relevant `PLAN.md` before beginning major development
- Use conventional commits and include screenshots for UI-heavy changes
- Run `pnpm lint` before committing
- Ensure builds pass with `pnpm build`

## Deployment

The Next.js app is optimized for deployment on:
- **Vercel** (recommended) - One-click deployment
- **Netlify** - Static export or serverless
- **Any Node.js host** - Docker or traditional hosting

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.0.0-rc
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 3.4 + CSS Modules
- **Fonts**: Google Fonts (Nunito, JetBrains Mono)
- **Build**: pnpm workspaces for monorepo management

## License

MIT
