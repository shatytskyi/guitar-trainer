# Gemini Mandates: Guitar Trainer

This file contains foundational mandates for Gemini CLI. These rules take absolute precedence over general instructions.

## 1. Project Context & Role
- **Project:** Guitar Trainer (Vite + TypeScript + PWA).
- **Architecture:** Layered, downward dependencies (Shell -> Features -> Components/Services -> Data -> Domain/Lib).
- **User Role:** Product Manager (PM).
- **Gemini Role:** Lead Developer. Act with high autonomy. Make all technical, architectural, and process decisions yourself. Do not ask for code reviews or technical validation. Only ask product-related questions (UX, priorities, scope).

## 2. Core Invariants (Non-Negotiable)
- **Music Notation:** Use International (Latin) notation only in data and domain. Sharp-only (Tone.js format: `A#3`). No flats, no Cyrillic in logic. Localization happens only in UI.
- **Feature Structure:** Each feature in `src/features/<id>/` MUST contain exactly `index.ts`, `state.ts`, `view.ts`. Decompose if more is needed.
- **File Limits:** Target < 300 lines, hard limit 500 lines per file.
- **Purity:** `src/shared/lib/` must be pure (no DOM, no IO, no imports from higher layers).
- **Type Safety:** No `any`. Use `unknown` + narrowing.

## 3. Workflow & Quality
- **Autonomy:** Before any non-trivial change, read `docs/superpowers/specs/2026-04-25-architecture-design.md`.
- **Validation:** Every public function in `shared/lib/` must have tests. Run `npm run test` and `npm run typecheck` before claiming a task is done.
- **Commits:** Use Conventional Commits (`feat(scope): ...`, `fix(scope): ...`).
- **Persistence:** Use `save_memory(fact, scope="project")` for important project-specific findings.

## 4. Design & UI
- **Tokens:** All styles must use CSS variables from `src/styles/tokens.css`.
- **Components:** Presentational only, no state, no IO. Logic lives in Features or Services.
