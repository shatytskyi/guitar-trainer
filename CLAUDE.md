# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Guitar Trainer is a TypeScript PWA that drills chords (and later: progressions, scales, ear training, microphone-based chord recognition). It is **statically hosted on GitHub Pages**, has **no backend**, and is **installable as a mobile PWA**.

The defining architectural decisions live in `docs/superpowers/specs/2026-04-25-architecture-design.md`. Read that file before any non-trivial change.

## User role (load-bearing)

The user in this project relates to the work as a **product manager**, not a developer. Make all technical / architectural / process decisions autonomously. Do not ask the user to review code, validate technical approaches, or choose between technical alternatives. Ask product questions only (scope, priorities, UX preferences).

## Commands

```bash
npm install        # once
npm run dev        # Vite dev server on http://localhost:5173/guitar-trainer/
npm run build      # type-check then build into dist/
npm run preview    # serve dist/ locally
npm run test       # Vitest single run
npm run test:watch # Vitest in watch mode
npm run typecheck  # TypeScript only
```

GitHub Actions runs `typecheck → test → build → deploy` on every push to `main`. Broken main never reaches Pages.

## Architecture (high level)

Layered, dependencies point downward only:

1. **Shell** (`src/app.ts`, `src/shared/components/AppShell.ts`): bootstrap, hash router, top bar.
2. **Features** (`src/features/<id>/`): training modes. Each implements `Feature` (`src/shared/lib/feature.ts`) and contains exactly `index.ts`, `state.ts`, `view.ts`.
3. **Components** (`src/shared/components/`): presentational. Take data, return DOM, emit events. No state, no IO.
4. **Domain** (`src/shared/lib/`): pure music-theory functions and types. No DOM, no IO. Unit-tested.
5. **Services** (`src/shared/services/`): adapters around browser APIs (audio, i18n, settings, PWA).
6. **Data** (`src/data/`): static typed datasets (chord tables, set helpers).

A higher layer may import from a lower layer; never the reverse. A feature may NOT import from another feature — shared logic lives in `data/` or `shared/lib/`.

## Music notation invariant

**International (Latin) notation only** in data and domain. `root` is `'A' | 'A#' | ...`, `type` is `'' | 'm' | '7' | 'maj7' | 'm7' | 'sus2' | 'sus4' | 'add9'`. No `rootRu`, no `typeName`. Localization is UI-only via `t('chord.type.m')`.

Tone.js note format (`"E2"`, `"A#3"`) is used everywhere — sharps only, no flats.

## Chord shape data invariants

`src/shared/lib/chord.ts: validateChordShape(shape)` enforces:

- `frets` and `fingers` are arrays of length 6 (low-E to high-E).
- `frets[i] === null` means muted, `0` means open, `> 0` means fretted.
- `frets[i] > 0` requires a `fingers[i]`; `frets[i] === null || 0` requires `fingers[i] === null`.
- `notes` is a non-empty array of Tone.js note strings (sharps only).

Validation tests in `src/data/chords-basic.test.ts` and `src/data/chords-extended.test.ts` run on every commit and protect against bad chord edits.

## Adding a new training mode (Feature)

1. Create `src/features/<id>/index.ts`, `state.ts`, `view.ts`.
2. Export a `Feature` object with `id`, `titleKey`, `mount`, `unmount`, optional `onContextChange`.
3. Append it to `src/features/registry.ts`.
4. Add `feature.<id>.title` and any other strings to `ru.ts`, `en.ts`, `uk.ts` dictionaries.

The router auto-renders the new tab. No other wiring required.

## Author rules (LLM-developer-specific)

These are obligations, not suggestions:

1. **File size:** target ≤ 300 lines, hard ceiling 500. Split before adding when nearing the ceiling.
2. **Feature internal layout:** every `features/<id>/` contains exactly `index.ts`, `state.ts`, `view.ts`. Need more files? That's a sign to decompose.
3. **`shared/lib/` purity:** no imports from `components`, `services`, or `features`.
4. **No `any`.** Use `unknown` and narrow.
5. **Comments only when WHY is non-obvious.** Never paraphrase code, never reference tickets/sessions.
6. **Tests:** every public function in `shared/lib/` has a test in a sibling `*.test.ts`. Run `npm run test` before claiming work is done.
7. **Read this file at the start of every session.** Update it when architectural invariants change.

## Design system integration

Tokens and components are sourced from Claude Design output (see `docs/design-brief.md`). All visual properties consume CSS variables from `src/styles/tokens.css`. Replacing the design system is editing `tokens.css` and (potentially) restructuring `src/shared/components/`. Features adapt to the new component API — that is part of integration, not regression.

## Deployment

Vite `base` is `/guitar-trainer/` so URLs resolve under the GitHub Pages path. `.github/workflows/deploy.yml` uses `actions/deploy-pages` and gates on typecheck + tests + build.

## What lives where (quick map)

- `src/main.ts` — entry, mounts `startApp()` into `#app`.
- `src/app.ts` — wires shell, services, router, active feature.
- `src/shared/lib/feature.ts` — `Feature` and `FeatureContext` interfaces.
- `src/shared/lib/{chord,note,music}.ts` — music theory types and pure functions.
- `src/shared/services/settings.ts` — typed localStorage store with subscribe.
- `src/shared/services/i18n/` — translator + RU/EN/UK dictionaries.
- `src/shared/services/audio.ts` — Tone.js wrapper.
- `src/shared/services/pwa.ts` — service-worker registration.
- `src/data/chords-{basic,extended}.ts` — chord tables.
- `src/data/sets.ts` — `rootsForSet()` lookup.
- `src/styles/tokens.css` — design tokens (replaced by Claude Design).
- `src/styles/global.css` — all component styles.

## Reference docs

- `docs/superpowers/specs/2026-04-25-architecture-design.md` — full architecture spec.
- `docs/superpowers/plans/2026-04-25-architecture-v1.md` — v1 implementation plan.
- `docs/design-brief.md` — input handed to Claude Design.

## Memory

Persistent feedback / project facts live under
`/Users/serhiihatytskyi/.claude/projects/-Users-serhiihatytskyi-WebProjects-GuitarTrainer/memory/`.
Read `MEMORY.md` at session start.
