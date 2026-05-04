# Note Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-fretboard note finder with multi-select pitch classes, distinct colors per selected note, and a compact no-vertical-scroll fretboard layout.

**Architecture:** Add pure shared fretboard position generation, then build a focused `note-finder` feature around local state and a dedicated DOM component. Reuse existing note parsing/transposition utilities and CSS design tokens. Fix the scales fretboard with CSS sizing constraints so its scroll container only scrolls horizontally.

**Tech Stack:** Vite, TypeScript, DOM components, CSS variables, Vitest.

---

## File Structure

- Create `src/shared/lib/fretboard.ts`: standard tuning, fretboard position generation, pitch-class filtering.
- Create `src/shared/lib/fretboard.test.ts`: pure tests for generated positions and pitch-class matching.
- Create `src/shared/components/NoteFinderFretboard.ts`: render the full 0-24 fretboard with colored note markers.
- Create `src/features/note-finder/index.ts`: feature entry point.
- Create `src/features/note-finder/state.ts`: selected pitch-class state and color mapping.
- Create `src/features/note-finder/state.test.ts`: pure tests for toggling notes and stable colors.
- Create `src/features/note-finder/view.ts`: mount selector and fretboard.
- Modify `src/features/registry.ts`: add the new feature tab.
- Modify `src/shared/services/i18n/en.ts`, `ru.ts`, `uk.ts`: add localized labels.
- Modify `src/styles/global.css`: style note finder and compact fretboards; fix scales vertical overflow.
- Modify `.gitignore`: ignore `.superpowers/` brainstorming artifacts.

## Task 1: Shared Fretboard Domain Logic

**Files:**
- Create: `src/shared/lib/fretboard.ts`
- Test: `src/shared/lib/fretboard.test.ts`

- [ ] **Step 1: Add pure fretboard tests**

Create `src/shared/lib/fretboard.test.ts` with assertions for standard tuning, open strings, 24th fret octave labels, and pitch-class filtering.

- [ ] **Step 2: Add fretboard position generation**

Create `src/shared/lib/fretboard.ts` with:

```ts
import { parseNote, transposeNote, type PitchClass } from './note';

export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const;

export interface FretboardPosition {
  readonly id: string;
  readonly stringIndex: number;
  readonly stringLabel: string;
  readonly fret: number;
  readonly note: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
}
```

Then implement `buildFretboardPositions()` and `filterFretboardPositions()`.

## Task 2: Note Finder State

**Files:**
- Create: `src/features/note-finder/state.ts`
- Test: `src/features/note-finder/state.test.ts`

- [ ] **Step 1: Add state tests**

Cover:

- initial state has no selected notes;
- toggling a pitch class adds/removes it;
- color variables are stable per pitch class;
- selected set can be used for matching without octave labels.

- [ ] **Step 2: Add state implementation**

Create `NoteFinderState`, `createNoteFinderState()`, `togglePitchClass()`, `isPitchClassSelected()`, and `pitchClassColorVar()`.

## Task 3: Note Finder Fretboard Component

**Files:**
- Create: `src/shared/components/NoteFinderFretboard.ts`

- [ ] **Step 1: Render a fixed-grid fretboard**

The component accepts positions, selected pitch classes, color resolver, and translator. It renders:

- a fret header from `0` to `24`;
- six string rows from high `E` to low `E`;
- empty cells for unmatched notes;
- colored buttons for matched notes with full note labels like `G3`.

- [ ] **Step 2: Keep marker layout stable**

Set each selected marker style with CSS custom property `--note-color`. Do not change grid dimensions when notes are selected or cleared.

## Task 4: Feature View and Registration

**Files:**
- Create: `src/features/note-finder/index.ts`
- Create: `src/features/note-finder/view.ts`
- Modify: `src/features/registry.ts`

- [ ] **Step 1: Mount selector and fretboard**

The view creates a compact note selector with checkbox semantics and re-renders the fretboard on state changes.

- [ ] **Step 2: Register the feature**

Import `noteFinder` in `src/features/registry.ts` and add it to the tab list.

## Task 5: Localization

**Files:**
- Modify: `src/shared/services/i18n/en.ts`
- Modify: `src/shared/services/i18n/ru.ts`
- Modify: `src/shared/services/i18n/uk.ts`

- [ ] **Step 1: Add feature labels**

Add keys:

- `feature.note-finder.title`
- `note-finder.select-notes`
- `note-finder.note-toggle`
- `note-finder.position-label`

## Task 6: Styling and Scales Overflow Fix

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Style note finder**

Add compact layout rules for `.note-finder`, `.note-finder__selector`, `.note-finder-fretboard`, and marker colors.

- [ ] **Step 2: Fix scales vertical scroll**

Update `.scales__fretboard-scroll` and `.scale-fretboard` sizing so the scroll container only overflows horizontally. Use responsive row heights and marker sizes instead of vertical scrolling.

## Task 7: Manual Verification Notes

**Files:**
- No code files.

- [ ] **Step 1: Do not run build/test commands automatically**

Per project instruction, stop after code changes unless the user explicitly asks for `npm run typecheck`, `npm run test`, or `npm run build`.

- [ ] **Step 2: Report verification status**

Final response must say that tests/builds were not run because the project instruction requires explicit user request.
