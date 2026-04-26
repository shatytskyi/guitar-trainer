# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + TypeScript mobile-first PWA for guitar chord training. Source code lives in `src/`.

- `src/app.ts` and `src/main.ts` bootstrap the shell, routing, services, and active feature.
- `src/features/<id>/` contains training modes; keep `index.ts`, `state.ts`, `view.ts`.
- `src/shared/components/` contains presentational DOM components.
- `src/shared/lib/` contains pure music/domain logic with no DOM or browser IO.
- `src/shared/services/` wraps browser APIs: settings, i18n, audio, and PWA.
- `src/data/` contains typed chord datasets and chord-set helpers.
- `src/styles/` contains global CSS and design tokens.
- `public/` holds static assets and manifests; `dist/` is generated build output.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server at `/guitar-trainer/`.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run build` type-checks and builds into `dist/`.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions

Use strict TypeScript and ES modules. Prefer explicit public types. Avoid `any`; use `unknown` with narrowing. Target files under 300 lines and split before 500.

Feature directories use kebab-case, for example `src/features/chord-quiz/`. Components and types use PascalCase; functions and variables use camelCase. Translation keys use dotted namespaces like `feature.chord-quiz.title`.

Use CSS variables from `src/styles/tokens.css`. Keep comments brief and only for non-obvious behavior.

## Testing Guidelines

Tests use Vitest and are colocated as `*.test.ts`. Public functions in `src/shared/lib/` should have sibling tests. Chord data changes must preserve `src/data/chords-*.test.ts` validation.

Run `npm run typecheck` and `npm run test` before submitting changes. Broaden tests when touching shared domain logic, settings, i18n, or chord data.

## Commit & Pull Request Guidelines

Commit history follows Conventional Commits with scopes, for example:

- `feat(quiz): tap-to-play chord diagram`
- `fix(audio): release sounding voices before each chord`
- `refactor(browse): simplify root tile metadata`

Pull requests should include a short description, user-visible impact, test results, and screenshots for UI changes. Link issues when available. Do not commit `dist/` unless required.

## Architecture Notes

Dependencies point downward: shell -> features -> components/services/data -> shared domain logic. Features must not import from other features; move shared behavior into `src/shared/` or `src/data/`.

Use international chord notation only in data and domain logic: `A`, `A#`, `F#m7`, `Cmaj7`. Localization belongs in UI dictionaries under `src/shared/services/i18n/`.
