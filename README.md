# Guitar Trainer

A guitar practice PWA that drills chords (and later: progressions, scales, ear training, microphone-based chord recognition). Statically hosted on GitHub Pages, installable on iOS/Android.

UI in Russian, English, and Ukrainian. Chord notation is international (`A`, `Am`, `F#m7`, `Cmaj7`).

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/guitar-trainer/
```

## Scripts

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Vite dev server with hot reload           |
| `npm run build`      | Type-check then build production assets   |
| `npm run preview`    | Serve the production build locally        |
| `npm run test`       | Run unit tests once                       |
| `npm run test:watch` | Run unit tests in watch mode              |
| `npm run typecheck`  | Run TypeScript without emitting           |

## Tech stack

- **Vite** + **TypeScript (strict)** — no UI framework
- **Tone.js** for audio playback
- **vite-plugin-pwa** (Workbox) for service worker + manifest
- **Vitest** for unit tests
- **GitHub Pages** via `actions/deploy-pages`

## Project layout

See `CLAUDE.md` for the architectural map and `docs/superpowers/specs/` for the full design.

## Deployment

Push to `main`. The `Deploy to GitHub Pages` workflow runs typecheck + tests + build, then publishes `dist/` to Pages. The `base` in `vite.config.ts` is `/guitar-trainer/` — change it if you fork to a different repo name.

## Design system

Design tokens (colors, typography, spacing, etc.) and component styles are generated externally by [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) from this codebase plus `docs/design-brief.md`, then dropped back into `src/styles/tokens.css`. The placeholder values in v1 are derived from the original prototype's warm-paper palette and are intended to be replaced wholesale.
