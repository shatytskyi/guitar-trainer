# Guitar Trainer Architecture v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single-file `chord_trainer.html` into a Vite + TypeScript PWA with a layered, feature-pluggable architecture, and port the existing chord-quiz and chord-browse modes onto it. Deployable to GitHub Pages.

**Architecture:** Layered (Shell → Features → Components → Domain → Services → Data) with strict downward-only dependencies. Each training mode lives in its own folder under `src/features/` and conforms to the `Feature` interface. Tokenized-first styling (CSS variables) so the design system from Claude Design slots in by replacing one file.

**Tech Stack:** Vite 5, TypeScript 5 (strict, `noUncheckedIndexedAccess`), `vite-plugin-pwa` (Workbox), Tone.js 14, Vitest 1, GitHub Pages via `actions/deploy-pages`. No UI framework.

**Reference spec:** `docs/superpowers/specs/2026-04-25-architecture-design.md`. Read it before starting any task.

---

## File Structure

The complete v1 file tree. Each entry shows which task creates or modifies it.

```
guitar-trainer/
├─ .github/workflows/deploy.yml          # Task 3
├─ .gitignore                             # Task 1
├─ CLAUDE.md                              # Task 35 (rewrite)
├─ README.md                              # Task 36
├─ chord_trainer.html                     # Task 37 (delete)
├─ index.html                             # Task 31
├─ package.json                           # Task 1
├─ tsconfig.json                          # Task 1
├─ tsconfig.node.json                     # Task 1
├─ vite.config.ts                         # Task 1, expanded in Task 34
├─ vitest.config.ts                       # Task 2
├─ public/
│  ├─ favicon.svg                         # Task 34
│  ├─ icons/
│  │  ├─ icon-192.png                     # Task 34 (placeholder)
│  │  ├─ icon-512.png                     # Task 34 (placeholder)
│  │  └─ icon-maskable-512.png            # Task 34 (placeholder)
│  └─ manifest.webmanifest                # Task 34
├─ src/
│  ├─ main.ts                             # Task 31
│  ├─ app.ts                              # Task 30
│  ├─ styles/
│  │  ├─ tokens.css                       # Task 13
│  │  └─ global.css                       # Task 14
│  ├─ shared/
│  │  ├─ lib/
│  │  │  ├─ note.ts                       # Task 4
│  │  │  ├─ note.test.ts                  # Task 4
│  │  │  ├─ chord.ts                      # Tasks 5, 6
│  │  │  ├─ chord.test.ts                 # Tasks 5, 6
│  │  │  ├─ music.ts                      # Task 7
│  │  │  ├─ music.test.ts                 # Task 7
│  │  │  └─ feature.ts                    # Task 28
│  │  ├─ services/
│  │  │  ├─ settings.ts                   # Task 8
│  │  │  ├─ settings.test.ts              # Task 8
│  │  │  ├─ i18n/
│  │  │  │  ├─ index.ts                   # Task 9
│  │  │  │  ├─ index.test.ts              # Task 9
│  │  │  │  ├─ ru.ts                      # Task 10
│  │  │  │  ├─ en.ts                      # Task 10
│  │  │  │  └─ uk.ts                      # Task 10
│  │  │  ├─ audio.ts                      # Task 11
│  │  │  └─ pwa.ts                        # Task 12
│  │  └─ components/
│  │     ├─ FretboardDiagram.ts           # Task 15
│  │     ├─ FretboardDiagram.test.ts      # Task 15
│  │     ├─ Button.ts                     # Task 16
│  │     ├─ ToggleSwitch.ts               # Task 17
│  │     ├─ AppShell.ts                   # Task 18
│  │     ├─ Stage.ts                      # Task 18
│  │     ├─ TopBar.ts                     # Task 19
│  │     ├─ TabBar.ts                     # Task 20
│  │     ├─ ChordCard.ts                  # Task 21
│  │     ├─ RootTile.ts                   # Task 22
│  │     ├─ Toast.ts                      # Task 23
│  │     └─ RevealOverlay.ts              # Task 24
│  ├─ data/
│  │  ├─ types.ts                         # Task 25
│  │  ├─ chords-basic.ts                  # Task 26
│  │  └─ chords-extended.ts               # Task 27
│  └─ features/
│     ├─ registry.ts                      # Task 28
│     ├─ chord-quiz/
│     │  ├─ index.ts                      # Task 32
│     │  ├─ state.ts                      # Task 32
│     │  └─ view.ts                       # Task 32
│     └─ chord-browse/
│        ├─ index.ts                      # Task 33
│        ├─ state.ts                      # Task 33
│        └─ view.ts                       # Task 33
└─ docs/                                  # already exists
```

**Test strategy:**
- **`shared/lib/`** — strict TDD. Pure functions, write the failing test first.
- **`shared/services/`** — TDD where mockable (`settings`, `i18n`). For `audio` and `pwa`, write thin wrappers and skip unit tests; they will be exercised manually in Task 37.
- **`shared/components/`** — write a small render-test for the SVG renderer (`FretboardDiagram.test.ts`) since it's a pure shape-to-string function. Other DOM components are validated in the manual pass at Task 37.
- **`features/`** — no automated tests in v1; manual smoke pass at Task 37.

---

## Task 1: Vite + TypeScript skeleton

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "guitar-trainer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "tone": "^14.8.49"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `tsconfig.node.json`**

```jsonc
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Create minimal `vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/GuitarTrainer/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
```

PWA config is added in Task 34. The `base` matches the GitHub repo name so deployed asset URLs resolve correctly.

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
.DS_Store
*.local
.vscode/*
!.vscode/extensions.json
.idea
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, `package-lock.json` created.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts .gitignore
git commit -m "feat: bootstrap Vite + TypeScript skeleton"
```

---

## Task 2: Vitest setup with smoke test

**Files:**
- Create: `vitest.config.ts`
- Create: `src/shared/lib/smoke.test.ts` (deleted at end of task)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

`environment: 'node'` is the default; switch to `'jsdom'` only for tests that need DOM (we don't here — `FretboardDiagram` returns a string).

- [ ] **Step 2: Write a smoke test**

Create `src/shared/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm run test`
Expected: 1 passing test.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Delete the smoke test**

```bash
rm src/shared/lib/smoke.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts
git commit -m "feat: configure Vitest with Node environment"
```

---

## Task 3: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

The workflow runs typecheck and tests before building, so a regression cannot deploy.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

The workflow will not run yet because there's nothing to build until later tasks. That's expected.

---

## Task 4: Note module (TDD)

**Files:**
- Create: `src/shared/lib/note.ts`
- Create: `src/shared/lib/note.test.ts`

The Note module defines pitch classes and helpers. Tone.js note format (`"E2"`, `"A#3"`) is the canonical string form throughout the app.

- [ ] **Step 1: Write the failing test**

Create `src/shared/lib/note.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  PITCH_CLASSES,
  parseNote,
  formatNote,
  transposeNote,
  type Note,
} from './note';

describe('PITCH_CLASSES', () => {
  it('lists 12 pitch classes starting at C with sharps only', () => {
    expect(PITCH_CLASSES).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F',
      'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });
});

describe('parseNote', () => {
  it('parses natural note', () => {
    expect(parseNote('E2')).toEqual({ pitchClass: 'E', octave: 2 });
  });

  it('parses sharp note', () => {
    expect(parseNote('A#3')).toEqual({ pitchClass: 'A#', octave: 3 });
  });

  it('throws on invalid input', () => {
    expect(() => parseNote('H4')).toThrow();
    expect(() => parseNote('Eb2')).toThrow();
    expect(() => parseNote('E')).toThrow();
  });
});

describe('formatNote', () => {
  it('round-trips parseNote', () => {
    const n: Note = { pitchClass: 'F#', octave: 4 };
    expect(formatNote(n)).toBe('F#4');
    expect(parseNote(formatNote(n))).toEqual(n);
  });
});

describe('transposeNote', () => {
  it('transposes up within an octave', () => {
    expect(transposeNote('C4', 4)).toBe('E4');
  });

  it('crosses octave boundary going up', () => {
    expect(transposeNote('A4', 3)).toBe('C5');
  });

  it('crosses octave boundary going down', () => {
    expect(transposeNote('C4', -1)).toBe('B3');
  });

  it('handles 12 semitones as exact octave shift', () => {
    expect(transposeNote('E2', 12)).toBe('E3');
    expect(transposeNote('E2', -12)).toBe('E1');
  });

  it('handles sharps consistently', () => {
    expect(transposeNote('A#3', 1)).toBe('B3');
    expect(transposeNote('B3', 1)).toBe('C4');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module `./note` does not exist.

- [ ] **Step 3: Implement `note.ts`**

Create `src/shared/lib/note.ts`:

```ts
export const PITCH_CLASSES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type PitchClass = (typeof PITCH_CLASSES)[number];

export interface Note {
  pitchClass: PitchClass;
  octave: number;
}

const NOTE_PATTERN = /^([A-G]#?)(-?\d+)$/;

export function parseNote(input: string): Note {
  const match = NOTE_PATTERN.exec(input);
  if (!match) throw new Error(`Invalid note: ${input}`);
  const [, pcRaw, octRaw] = match;
  if (!pcRaw || !octRaw) throw new Error(`Invalid note: ${input}`);
  if (!isPitchClass(pcRaw)) throw new Error(`Unknown pitch class: ${pcRaw}`);
  return { pitchClass: pcRaw, octave: Number(octRaw) };
}

export function formatNote(note: Note): string {
  return `${note.pitchClass}${note.octave}`;
}

export function transposeNote(input: string, semitones: number): string {
  const { pitchClass, octave } = parseNote(input);
  const idx = PITCH_CLASSES.indexOf(pitchClass);
  const total = idx + semitones;
  const wrapped = ((total % 12) + 12) % 12;
  const octaveShift = Math.floor(total / 12);
  const next = PITCH_CLASSES[wrapped];
  if (!next) throw new Error('unreachable');
  return formatNote({ pitchClass: next, octave: octave + octaveShift });
}

function isPitchClass(s: string): s is PitchClass {
  return (PITCH_CLASSES as readonly string[]).includes(s);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/note.ts src/shared/lib/note.test.ts
git commit -m "feat(domain): add Note types and pitch helpers"
```

---

## Task 5: Chord types and displayName (TDD)

**Files:**
- Create: `src/shared/lib/chord.ts`
- Create: `src/shared/lib/chord.test.ts`

The Chord module defines the canonical types for chords, types of chords, and shapes (fingerings). It also provides display formatters.

- [ ] **Step 1: Write the failing test**

Create `src/shared/lib/chord.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  CHORD_TYPES,
  chordDisplayName,
  type Chord,
  type ChordType,
} from './chord';

describe('CHORD_TYPES', () => {
  it('lists known chord type suffixes', () => {
    expect(CHORD_TYPES).toContain('');
    expect(CHORD_TYPES).toContain('m');
    expect(CHORD_TYPES).toContain('7');
    expect(CHORD_TYPES).toContain('maj7');
    expect(CHORD_TYPES).toContain('m7');
    expect(CHORD_TYPES).toContain('sus2');
    expect(CHORD_TYPES).toContain('sus4');
    expect(CHORD_TYPES).toContain('add9');
  });
});

describe('chordDisplayName', () => {
  it('renders major as the bare root', () => {
    const c: Chord = { root: 'A', type: '' };
    expect(chordDisplayName(c)).toBe('A');
  });

  it('appends the type suffix', () => {
    const cases: Array<[Chord, string]> = [
      [{ root: 'A', type: 'm' }, 'Am'],
      [{ root: 'F#', type: 'm' }, 'F#m'],
      [{ root: 'C', type: 'maj7' }, 'Cmaj7'],
      [{ root: 'D', type: 'sus4' }, 'Dsus4'],
    ];
    for (const [chord, expected] of cases) {
      expect(chordDisplayName(chord)).toBe(expected);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module `./chord` not found.

- [ ] **Step 3: Implement `chord.ts`**

Create `src/shared/lib/chord.ts`:

```ts
import type { PitchClass } from './note';

export const CHORD_TYPES = [
  '', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9',
] as const;

export type ChordType = (typeof CHORD_TYPES)[number];

export interface Chord {
  root: PitchClass;
  type: ChordType;
}

export function chordDisplayName(chord: Chord): string {
  return `${chord.root}${chord.type}`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/chord.ts src/shared/lib/chord.test.ts
git commit -m "feat(domain): add Chord types and display name"
```

---

## Task 6: ChordShape and validation (TDD)

**Files:**
- Modify: `src/shared/lib/chord.ts`
- Modify: `src/shared/lib/chord.test.ts`

A `ChordShape` is a concrete fingering for a chord. The data invariants from the original `chord_trainer.html` are encoded as types and a `validateChordShape` function.

- [ ] **Step 1: Add failing tests**

Append to `src/shared/lib/chord.test.ts`:

```ts
import { validateChordShape, type ChordShape } from './chord';

const validShape: ChordShape = {
  label: 'open',
  frets: [null, 0, 2, 2, 1, 0],
  fingers: [null, null, 2, 3, 1, null],
  notes: ['A2', 'E3', 'A3', 'C4', 'E4'],
};

describe('validateChordShape', () => {
  it('accepts a valid open shape', () => {
    expect(validateChordShape(validShape)).toEqual([]);
  });

  it('rejects frets array of wrong length', () => {
    const bad: ChordShape = { ...validShape, frets: [0, 2, 2, 1, 0] as any };
    expect(validateChordShape(bad)).toContain('frets must be an array of 6');
  });

  it('rejects fingers array of wrong length', () => {
    const bad: ChordShape = { ...validShape, fingers: [null, 1] as any };
    expect(validateChordShape(bad)).toContain('fingers must be an array of 6');
  });

  it('requires a finger for every fretted string', () => {
    const bad: ChordShape = {
      ...validShape,
      frets: [null, 0, 2, 2, 1, 0],
      fingers: [null, null, null, 3, 1, null],
    };
    expect(validateChordShape(bad)).toContain('string 2 fretted but no finger');
  });

  it('rejects a finger on an open or muted string', () => {
    const bad: ChordShape = {
      ...validShape,
      frets: [null, 0, 2, 2, 1, 0],
      fingers: [null, 1, 2, 3, 1, null],
    };
    expect(validateChordShape(bad)).toContain('string 1 has finger but no fret');
  });

  it('requires non-empty notes array', () => {
    const bad: ChordShape = { ...validShape, notes: [] };
    expect(validateChordShape(bad)).toContain('notes must be a non-empty array');
  });

  it('rejects notes not in Tone.js sharp form', () => {
    const bad: ChordShape = { ...validShape, notes: ['A2', 'Eb3'] };
    expect(validateChordShape(bad)).toContain('note "Eb3" is not in sharp-only form');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — `validateChordShape` and `ChordShape` are not exported.

- [ ] **Step 3: Extend `chord.ts`**

Append to `src/shared/lib/chord.ts`:

```ts
import { PITCH_CLASSES } from './note';

/** Six entries, low-E to high-E. null = mute, 0 = open, N = fret N. */
export type Fret = number | null;

/** Six entries. 1=index, 2=middle, 3=ring, 4=pinky. null = open/muted/none. */
export type Finger = 1 | 2 | 3 | 4 | null;

/** A shape label like 'open', 'barre', 'mini'. Localized via i18n keys. */
export type ShapeLabel = string;

export interface ChordShape {
  label: ShapeLabel;
  frets: readonly Fret[];      // length 6, validated at runtime
  fingers: readonly Finger[];  // length 6, validated at runtime
  notes: readonly string[];    // Tone.js note strings, e.g. "A2", "C#3"
  recommended?: boolean;
}

const NOTE_RE = /^[A-G]#?-?\d+$/;
const PITCH_PREFIXES = new Set<string>(PITCH_CLASSES);

export function validateChordShape(shape: ChordShape): string[] {
  const errors: string[] = [];
  if (!Array.isArray(shape.frets) || shape.frets.length !== 6) {
    errors.push('frets must be an array of 6');
  }
  if (!Array.isArray(shape.fingers) || shape.fingers.length !== 6) {
    errors.push('fingers must be an array of 6');
  }
  if (!Array.isArray(shape.notes) || shape.notes.length === 0) {
    errors.push('notes must be a non-empty array');
  }
  if (
    Array.isArray(shape.frets) &&
    Array.isArray(shape.fingers) &&
    shape.frets.length === 6 &&
    shape.fingers.length === 6
  ) {
    for (let s = 0; s < 6; s++) {
      const f = shape.frets[s];
      const fg = shape.fingers[s];
      if (f != null && f > 0 && fg == null) {
        errors.push(`string ${s} fretted but no finger`);
      }
      if ((f == null || f === 0) && fg != null) {
        errors.push(`string ${s} has finger but no fret`);
      }
    }
  }
  for (const note of shape.notes ?? []) {
    if (!NOTE_RE.test(note)) {
      errors.push(`note "${note}" is not in sharp-only form`);
      continue;
    }
    const pc = note.replace(/-?\d+$/, '');
    if (!PITCH_PREFIXES.has(pc)) {
      errors.push(`note "${note}" is not in sharp-only form`);
    }
  }
  return errors;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS — all chord tests green.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/chord.ts src/shared/lib/chord.test.ts
git commit -m "feat(domain): add ChordShape with validation"
```

---

## Task 7: Music helpers (TDD)

**Files:**
- Create: `src/shared/lib/music.ts`
- Create: `src/shared/lib/music.test.ts`

Helpers shared by features: pick a default shape, flatten roots into chord pairs, get a chord's recommended shape index.

- [ ] **Step 1: Write the failing test**

Create `src/shared/lib/music.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getDefaultShapeIdx, flattenChords, type ChordTypeEntry, type RootEntry } from './music';

const shapeOpen = {
  label: 'open',
  frets: [null, 3, 2, 0, 1, 0],
  fingers: [null, 3, 2, null, 1, null],
  notes: ['C3'],
} as const;
const shapeBarre = {
  label: 'barre',
  frets: [null, 3, 5, 5, 5, 3],
  fingers: [null, 1, 2, 3, 4, 1],
  notes: ['C3'],
  recommended: true,
} as const;

const cMajor: ChordTypeEntry = {
  type: '',
  shapes: [shapeOpen, shapeBarre],
};

const cRoot: RootEntry = {
  root: 'C',
  types: [cMajor],
};

describe('getDefaultShapeIdx', () => {
  it('returns the recommended shape index when present', () => {
    expect(getDefaultShapeIdx(cMajor)).toBe(1);
  });

  it('returns 0 when no shape is marked recommended', () => {
    const noRec: ChordTypeEntry = { type: '', shapes: [shapeOpen, { ...shapeBarre, recommended: false }] };
    expect(getDefaultShapeIdx(noRec)).toBe(0);
  });
});

describe('flattenChords', () => {
  it('produces one entry per (root, type) pair', () => {
    const flat = flattenChords([cRoot]);
    expect(flat).toHaveLength(1);
    expect(flat[0]).toEqual({ root: cRoot, type: cMajor });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module `./music` not found.

- [ ] **Step 3: Implement `music.ts`**

Create `src/shared/lib/music.ts`:

```ts
import type { ChordShape, ChordType } from './chord';
import type { PitchClass } from './note';

export interface ChordTypeEntry {
  readonly type: ChordType;
  readonly shapes: readonly ChordShape[];
}

export interface RootEntry {
  readonly root: PitchClass;
  readonly types: readonly ChordTypeEntry[];
}

export interface FlatChord {
  readonly root: RootEntry;
  readonly type: ChordTypeEntry;
}

export function getDefaultShapeIdx(type: ChordTypeEntry): number {
  const idx = type.shapes.findIndex(s => s.recommended);
  return idx === -1 ? 0 : idx;
}

export function flattenChords(roots: readonly RootEntry[]): FlatChord[] {
  const out: FlatChord[] = [];
  for (const root of roots) {
    for (const type of root.types) {
      out.push({ root, type });
    }
  }
  return out;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/music.ts src/shared/lib/music.test.ts
git commit -m "feat(domain): add chord-collection helpers"
```

---

## Task 8: Settings store (TDD)

**Files:**
- Create: `src/shared/services/settings.ts`
- Create: `src/shared/services/settings.test.ts`

Typed wrapper over `localStorage` with schema validation, defaults fallback, and pub/sub.

- [ ] **Step 1: Write the failing test**

Create `src/shared/services/settings.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createSettingsStore, DEFAULT_SETTINGS, type Settings } from './settings';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

let backing: MemoryStorage;
beforeEach(() => { backing = new MemoryStorage(); });

describe('settings store', () => {
  it('returns defaults when storage is empty', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists partial updates and merges with previous', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    store.set({ lang: 'uk' });
    expect(store.get().lang).toBe('uk');
    expect(store.get().set).toBe(DEFAULT_SETTINGS.set);
  });

  it('hydrates from existing storage', () => {
    backing.setItem(
      'guitar-trainer.settings.v1',
      JSON.stringify({ lang: 'en', set: 'extended', hideDiagram: false, theme: 'paper', lastFeatureId: 'chord-browse' }),
    );
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get().lang).toBe('en');
    expect(store.get().set).toBe('extended');
    expect(store.get().hideDiagram).toBe(false);
  });

  it('falls back to defaults when storage is malformed', () => {
    backing.setItem('guitar-trainer.settings.v1', '{not json');
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults when stored fields are wrong types', () => {
    backing.setItem('guitar-trainer.settings.v1', JSON.stringify({ lang: 42 }));
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('notifies subscribers on change', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    const seen: Settings[] = [];
    store.subscribe(s => seen.push(s));
    store.set({ hideDiagram: false });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.hideDiagram).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `settings.ts`**

Create `src/shared/services/settings.ts`:

```ts
const STORAGE_KEY = 'guitar-trainer.settings.v1';

export type Lang = 'ru' | 'en' | 'uk';
export type ChordSet = 'basic' | 'extended';
export type ThemeId = 'paper';

export interface Settings {
  lang: Lang;
  set: ChordSet;
  hideDiagram: boolean;
  theme: ThemeId;
  lastFeatureId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'ru',
  set: 'basic',
  hideDiagram: true,
  theme: 'paper',
  lastFeatureId: 'chord-quiz',
};

export interface SettingsStore {
  get(): Settings;
  set(partial: Partial<Settings>): void;
  subscribe(cb: (s: Settings) => void): () => void;
}

export function createSettingsStore(storage: Storage): SettingsStore {
  let current = load(storage);
  const subs = new Set<(s: Settings) => void>();

  return {
    get: () => current,
    set(partial) {
      current = { ...current, ...partial };
      try { storage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* quota / private mode */ }
      subs.forEach(cb => cb(current));
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
}

function load(storage: Storage): Settings {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw);
    if (!isSettings(parsed)) return { ...DEFAULT_SETTINGS };
    return parsed;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function isSettings(v: unknown): v is Settings {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    (r.lang === 'ru' || r.lang === 'en' || r.lang === 'uk') &&
    (r.set === 'basic' || r.set === 'extended') &&
    typeof r.hideDiagram === 'boolean' &&
    r.theme === 'paper' &&
    typeof r.lastFeatureId === 'string'
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/settings.ts src/shared/services/settings.test.ts
git commit -m "feat(services): add typed settings store"
```

---

## Task 9: i18n translator (TDD)

**Files:**
- Create: `src/shared/services/i18n/index.ts`
- Create: `src/shared/services/i18n/index.test.ts`

A minimal translator: dictionary lookup with `{name}` interpolation, language switch, subscribe-on-change. Dictionaries are added separately in Task 10 — this task uses a stub dictionary.

- [ ] **Step 1: Write the failing test**

Create `src/shared/services/i18n/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createTranslator, type Dictionary } from './index';

const ru: Dictionary = { 'app.title': 'Аккорды', 'hello': 'Привет, {name}' };
const en: Dictionary = { 'app.title': 'Chords', 'hello': 'Hello, {name}' };

describe('translator', () => {
  it('looks up by key', () => {
    const t = createTranslator({ ru, en }, 'ru');
    expect(t.t('app.title')).toBe('Аккорды');
  });

  it('switches language', () => {
    const t = createTranslator({ ru, en }, 'ru');
    t.setLang('en');
    expect(t.t('app.title')).toBe('Chords');
  });

  it('interpolates {name} placeholders', () => {
    const t = createTranslator({ ru, en }, 'en');
    expect(t.t('hello', { name: 'Sergii' })).toBe('Hello, Sergii');
  });

  it('returns the key when missing', () => {
    const t = createTranslator({ ru, en }, 'ru');
    expect(t.t('missing.key')).toBe('missing.key');
  });

  it('notifies subscribers on language change', () => {
    const t = createTranslator({ ru, en }, 'ru');
    const seen: string[] = [];
    t.onLangChange(l => seen.push(l));
    t.setLang('en');
    expect(seen).toEqual(['en']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `i18n/index.ts`**

Create `src/shared/services/i18n/index.ts`:

```ts
import type { Lang } from '../settings';

export type Dictionary = Record<string, string>;

export interface Translator {
  readonly lang: Lang;
  t(key: string, params?: Record<string, string | number>): string;
  setLang(lang: Lang): void;
  onLangChange(cb: (lang: Lang) => void): () => void;
}

export type Dictionaries = Record<Lang, Dictionary>;

export function createTranslator(dicts: Dictionaries, initial: Lang): Translator {
  let current: Lang = initial;
  const subs = new Set<(l: Lang) => void>();

  return {
    get lang() { return current; },
    t(key, params) {
      const dict = dicts[current];
      const template = dict[key] ?? key;
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (_, name: string) => {
        const v = params[name];
        return v === undefined ? `{${name}}` : String(v);
      });
    },
    setLang(lang) {
      if (lang === current) return;
      current = lang;
      subs.forEach(cb => cb(current));
    },
    onLangChange(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/i18n/index.ts src/shared/services/i18n/index.test.ts
git commit -m "feat(services): add i18n translator"
```

---

## Task 10: i18n dictionaries (RU/EN/UK)

**Files:**
- Create: `src/shared/services/i18n/ru.ts`
- Create: `src/shared/services/i18n/en.ts`
- Create: `src/shared/services/i18n/uk.ts`

Concrete dictionaries with all UI strings the v1 features need. Note names are NOT localized.

- [ ] **Step 1: Create Russian dictionary**

Create `src/shared/services/i18n/ru.ts`:

```ts
import type { Dictionary } from './index';

const ru: Dictionary = {
  'app.title': 'Аккорды',
  'app.title.suffix': '.',

  'set.basic': 'базовый',
  'set.extended': '+ расшир.',

  'feature.chord-quiz.title': 'Квиз',
  'feature.chord-browse.title': 'Все аккорды',

  'quiz.label.type': 'тип:',
  'quiz.label.shape': 'форма:',
  'quiz.reveal': 'нажми чтобы увидеть схему',
  'quiz.hide-diagram': 'скрывать схему',
  'quiz.btn.play': '▶ Play',
  'quiz.btn.next': 'Следующий →',

  'browse.empty': 'Выбери ноту из списка выше',

  'shape.open': 'откр.',
  'shape.barre': 'баррэ',
  'shape.mini': 'мини',
  'shape.recommended': '★',

  'chord.type.': 'мажор',
  'chord.type.m': 'минор',
  'chord.type.7': 'септ',
  'chord.type.maj7': 'maj7',
  'chord.type.m7': 'm7',
  'chord.type.sus2': 'sus2',
  'chord.type.sus4': 'sus4',
  'chord.type.add9': 'add9',

  'pwa.update.message': 'Доступно обновление',
  'pwa.update.action': 'Обновить',

  'lang.ru': 'RU',
  'lang.en': 'EN',
  'lang.uk': 'UK',
};

export default ru;
```

- [ ] **Step 2: Create English dictionary**

Create `src/shared/services/i18n/en.ts`:

```ts
import type { Dictionary } from './index';

const en: Dictionary = {
  'app.title': 'Chords',
  'app.title.suffix': '.',

  'set.basic': 'basic',
  'set.extended': '+ extended',

  'feature.chord-quiz.title': 'Quiz',
  'feature.chord-browse.title': 'Browse',

  'quiz.label.type': 'type:',
  'quiz.label.shape': 'shape:',
  'quiz.reveal': 'tap to reveal the diagram',
  'quiz.hide-diagram': 'hide diagram',
  'quiz.btn.play': '▶ Play',
  'quiz.btn.next': 'Next →',

  'browse.empty': 'Pick a note from the grid above',

  'shape.open': 'open',
  'shape.barre': 'barre',
  'shape.mini': 'mini',
  'shape.recommended': '★',

  'chord.type.': 'major',
  'chord.type.m': 'minor',
  'chord.type.7': 'dominant 7',
  'chord.type.maj7': 'maj 7',
  'chord.type.m7': 'minor 7',
  'chord.type.sus2': 'sus 2',
  'chord.type.sus4': 'sus 4',
  'chord.type.add9': 'add 9',

  'pwa.update.message': 'Update available',
  'pwa.update.action': 'Refresh',

  'lang.ru': 'RU',
  'lang.en': 'EN',
  'lang.uk': 'UK',
};

export default en;
```

- [ ] **Step 3: Create Ukrainian dictionary**

Create `src/shared/services/i18n/uk.ts`:

```ts
import type { Dictionary } from './index';

const uk: Dictionary = {
  'app.title': 'Акорди',
  'app.title.suffix': '.',

  'set.basic': 'базовий',
  'set.extended': '+ розшир.',

  'feature.chord-quiz.title': 'Квіз',
  'feature.chord-browse.title': 'Усі акорди',

  'quiz.label.type': 'тип:',
  'quiz.label.shape': 'форма:',
  'quiz.reveal': 'торкнись щоб побачити схему',
  'quiz.hide-diagram': 'ховати схему',
  'quiz.btn.play': '▶ Play',
  'quiz.btn.next': 'Далі →',

  'browse.empty': 'Обери ноту зі списку вище',

  'shape.open': 'відкр.',
  'shape.barre': 'баре',
  'shape.mini': 'міні',
  'shape.recommended': '★',

  'chord.type.': 'мажор',
  'chord.type.m': 'мінор',
  'chord.type.7': 'септ',
  'chord.type.maj7': 'maj7',
  'chord.type.m7': 'm7',
  'chord.type.sus2': 'sus2',
  'chord.type.sus4': 'sus4',
  'chord.type.add9': 'add9',

  'pwa.update.message': 'Доступне оновлення',
  'pwa.update.action': 'Оновити',

  'lang.ru': 'RU',
  'lang.en': 'EN',
  'lang.uk': 'UK',
};

export default uk;
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/i18n/ru.ts src/shared/services/i18n/en.ts src/shared/services/i18n/uk.ts
git commit -m "feat(i18n): add RU/EN/UK dictionaries"
```

---

## Task 11: Audio output service

**Files:**
- Create: `src/shared/services/audio.ts`

Thin wrapper around Tone.js. No tests in v1 — Tone.js requires a real `AudioContext`, and mocking it is more work than the wrapper is worth. Manual smoke check at Task 37.

- [ ] **Step 1: Implement `audio.ts`**

Create `src/shared/services/audio.ts`:

```ts
import * as Tone from 'tone';

const AUDIO_CONFIG = {
  oscillatorType: 'triangle' as const,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.8 },
  volume: -8,
  noteDuration: '2n' as const,
  defaultStrumDelay: 0.04,
};

export interface AudioOutput {
  playNotes(notes: readonly string[], options?: { strumDelay?: number }): Promise<void>;
}

let synth: Tone.PolySynth | null = null;
let started = false;

async function ensureStarted(): Promise<Tone.PolySynth> {
  if (!started) {
    await Tone.start();
    started = true;
  }
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: AUDIO_CONFIG.oscillatorType },
      envelope: AUDIO_CONFIG.envelope,
    }).toDestination();
    synth.volume.value = AUDIO_CONFIG.volume;
  }
  return synth;
}

export const audio: AudioOutput = {
  async playNotes(notes, options) {
    const s = await ensureStarted();
    const strumDelay = options?.strumDelay ?? AUDIO_CONFIG.defaultStrumDelay;
    const now = Tone.now();
    notes.forEach((note, i) => {
      s.triggerAttackRelease(note, AUDIO_CONFIG.noteDuration, now + i * strumDelay);
    });
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/services/audio.ts
git commit -m "feat(services): add Tone.js audio output wrapper"
```

---

## Task 12: PWA registration helper

**Files:**
- Create: `src/shared/services/pwa.ts`

Wrapper around the `vite-plugin-pwa` runtime. Exposes `registerPWA(onUpdateAvailable)` so the app can show a toast when a new version is ready.

- [ ] **Step 1: Implement `pwa.ts`**

Create `src/shared/services/pwa.ts`:

```ts
import { registerSW } from 'virtual:pwa-register';

export interface PWAHandle {
  applyUpdate(): Promise<void>;
}

export function registerPWA(onUpdateAvailable: () => void): PWAHandle {
  const updateSW = registerSW({
    onNeedRefresh() { onUpdateAvailable(); },
    onOfflineReady() { /* could log; nothing visible */ },
    immediate: true,
  });
  return {
    applyUpdate: () => updateSW(true),
  };
}
```

`virtual:pwa-register` is provided by `vite-plugin-pwa` at build time. Add a type declaration so TypeScript knows about it.

- [ ] **Step 2: Add the virtual module type**

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (If `vite-plugin-pwa/client` is missing because we haven't installed yet, it should already be installed via Task 1's package.json — confirm with `ls node_modules/vite-plugin-pwa`.)

- [ ] **Step 4: Commit**

```bash
git add src/shared/services/pwa.ts src/vite-env.d.ts
git commit -m "feat(services): add PWA registration helper"
```

---

## Task 13: Design tokens (placeholder)

**Files:**
- Create: `src/styles/tokens.css`

Placeholder palette derived from the current `chord_trainer.html`. Replaced with Claude Design output later (entire file overwrites).

- [ ] **Step 1: Implement `tokens.css`**

Create `src/styles/tokens.css`:

```css
/*
 * Design tokens — PLACEHOLDER for v1.
 * This file is overwritten when Claude Design returns the design system.
 * All visual properties consumed by components MUST resolve here.
 */
:root {
  /* Color (semantic) */
  --surface-page: #f0e6d2;
  --surface-raised: #e3d5b8;
  --surface-overlay: rgba(92, 77, 58, 0.08);

  --ink: #2a2520;
  --ink-soft: #5c4d3a;
  --on-accent: #f0e6d2;

  --accent: #b8442a;
  --accent-soft: #d97757;
  --gold: #a87f3c;

  --border-soft: rgba(92, 77, 58, 0.3);
  --shadow-1: 0 4px 20px rgba(42, 37, 32, 0.15);
  --shadow-inset: inset 0 0 60px rgba(168, 127, 60, 0.05);

  /* Typography */
  --font-display: 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;

  --text-xs: 9px;
  --text-sm: 10px;
  --text-md: 12px;
  --text-lg: 15px;
  --text-xl: 22px;
  --text-2xl: clamp(20px, 5vw, 28px);
  --text-3xl: clamp(40px, 11vw, 68px);

  --tracking-wide: 0.15em;
  --tracking-wider: 0.18em;

  /* Spacing (4-base) */
  --space-1: 4px;
  --space-2: 6px;
  --space-3: 9px;
  --space-4: 12px;
  --space-5: 14px;
  --space-6: 18px;
  --space-7: 24px;

  /* Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-pill: 9px;

  /* Motion */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --ease-default: cubic-bezier(0.2, 0, 0, 1);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(styles): add placeholder design tokens"
```

---

## Task 14: Global styles

**Files:**
- Create: `src/styles/global.css`

Reset, base typography, body background. Imports tokens.

- [ ] **Step 1: Implement `global.css`**

Create `src/styles/global.css`:

```css
@import './tokens.css';

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  background: var(--surface-page);
  color: var(--ink);
  font-family: var(--font-display);
  min-height: 100vh;
}

body {
  background-image:
    radial-gradient(circle at 20% 30%, rgba(168, 127, 60, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(184, 68, 42, 0.05) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0 0.12 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)'/%3E%3C/svg%3E");
}

button { font: inherit; color: inherit; cursor: pointer; }
button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@supports (padding: max(0px)) {
  body {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): add global reset and base"
```

---

## Task 15: FretboardDiagram component (TDD)

**Files:**
- Create: `src/shared/components/FretboardDiagram.ts`
- Create: `src/shared/components/FretboardDiagram.test.ts`

Pure shape-to-SVG-string function ported from `renderDiagram` in `chord_trainer.html`. Already a pure function; trivial to test.

- [ ] **Step 1: Write the failing test**

Create `src/shared/components/FretboardDiagram.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderFretboardDiagram } from './FretboardDiagram';
import type { ChordShape } from '../lib/chord';

const cMajorOpen: ChordShape = {
  label: 'open',
  frets: [null, 3, 2, 0, 1, 0],
  fingers: [null, 3, 2, null, 1, null],
  notes: ['C3', 'E3', 'G3', 'C4', 'E4'],
};

const cMajorBarre: ChordShape = {
  label: 'barre',
  frets: [null, 3, 5, 5, 5, 3],
  fingers: [null, 1, 2, 3, 4, 1],
  notes: ['C3'],
};

describe('renderFretboardDiagram', () => {
  it('returns an <svg> string', () => {
    const out = renderFretboardDiagram(cMajorOpen);
    expect(out.startsWith('<svg')).toBe(true);
    expect(out.endsWith('</svg>')).toBe(true);
  });

  it('shows the nut bar in open position', () => {
    expect(renderFretboardDiagram(cMajorOpen)).toContain('<rect');
  });

  it('shifts up the neck and emits a fret-number label when frets exceed the threshold', () => {
    expect(renderFretboardDiagram(cMajorBarre)).toContain('3fr');
  });

  it('renders × markers for muted strings', () => {
    expect(renderFretboardDiagram(cMajorOpen)).toContain('×');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `FretboardDiagram.ts`**

Create `src/shared/components/FretboardDiagram.ts`:

```ts
import type { ChordShape } from '../lib/chord';

const DIAGRAM = {
  width: 200,
  height: 240,
  paddingX: 30,
  paddingTop: 40,
  paddingBottom: 20,
  fingerDotRadius: 9,
  barreHeight: 18,
  maxFretInOpenPosition: 4,
};

export function renderFretboardDiagram(shape: ChordShape): string {
  const { width: W, height: H, paddingX: padX, paddingTop: padTop, paddingBottom: padBot,
          fingerDotRadius: dotR, barreHeight: barreH, maxFretInOpenPosition: maxOpen } = DIAGRAM;
  const fretboardW = W - padX * 2;
  const fretboardH = H - padTop - padBot;
  const stringSpacing = fretboardW / 5;
  const fretSpacing = fretboardH / 5;

  const playedFrets: number[] = [];
  for (const f of shape.frets) if (f != null && f > 0) playedFrets.push(f);
  const minFret = playedFrets.length ? Math.min(...playedFrets) : 1;
  const maxFret = playedFrets.length ? Math.max(...playedFrets) : 1;
  const fretOffset = maxFret > maxOpen ? minFret - 1 : 0;

  const parts: string[] = [];
  parts.push(`<svg class="fretboard-diagram" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`);

  for (let s = 0; s < 6; s++) {
    const x = padX + s * stringSpacing;
    const f = shape.frets[s];
    const y = padTop - 12;
    if (f === null) {
      parts.push(`<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-mono)" font-size="14" fill="var(--ink-soft)" font-weight="600">×</text>`);
    } else if (f === 0) {
      parts.push(`<circle cx="${x}" cy="${y - 4}" r="5" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`);
    }
  }

  if (fretOffset === 0) {
    parts.push(`<rect x="${padX - 1}" y="${padTop}" width="${fretboardW + 2}" height="4" fill="var(--ink)"/>`);
  } else {
    parts.push(`<text x="${padX - 10}" y="${padTop + fretSpacing / 2 + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-soft)" font-weight="600">${fretOffset + 1}fr</text>`);
  }

  for (let f = 0; f <= 5; f++) {
    const y = padTop + f * fretSpacing;
    parts.push(`<line x1="${padX}" y1="${y}" x2="${padX + fretboardW}" y2="${y}" stroke="var(--ink-soft)" stroke-width="1"/>`);
  }
  for (let s = 0; s < 6; s++) {
    const x = padX + s * stringSpacing;
    parts.push(`<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + fretboardH}" stroke="var(--ink)" stroke-width="1.2"/>`);
  }

  const barres: Record<string, { finger: number | null; fret: number; strings: number[] }> = {};
  for (let s = 0; s < 6; s++) {
    const finger = shape.fingers[s];
    const fret = shape.frets[s];
    if (finger != null && fret != null && fret > 0) {
      const key = `${finger}-${fret}`;
      const entry = barres[key] ?? { finger, fret, strings: [] };
      entry.strings.push(s);
      barres[key] = entry;
    }
  }

  Object.values(barres).forEach(b => {
    if (b.strings.length > 1) {
      const x1 = padX + Math.min(...b.strings) * stringSpacing;
      const x2 = padX + Math.max(...b.strings) * stringSpacing;
      const fretPos = b.fret - fretOffset;
      const y = padTop + (fretPos - 0.5) * fretSpacing;
      parts.push(`<rect x="${x1 - dotR}" y="${y - dotR}" width="${x2 - x1 + dotR * 2}" height="${barreH}" rx="${dotR}" fill="var(--ink)"/>`);
      if (b.finger != null) {
        const midX = (x1 + x2) / 2;
        parts.push(`<text x="${midX}" y="${y + 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--on-accent)" font-weight="600">${b.finger}</text>`);
      }
    }
  });

  for (let s = 0; s < 6; s++) {
    const fret = shape.frets[s];
    const finger = shape.fingers[s];
    if (fret != null && fret > 0) {
      const fretPos = fret - fretOffset;
      const x = padX + s * stringSpacing;
      const y = padTop + (fretPos - 0.5) * fretSpacing;
      const key = `${finger}-${fret}`;
      const entry = barres[key];
      const isBarred = entry !== undefined && entry.strings.length > 1;
      if (!isBarred) {
        parts.push(`<circle cx="${x}" cy="${y}" r="${dotR}" fill="var(--ink)"/>`);
        if (finger != null) {
          parts.push(`<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--on-accent)" font-weight="600">${finger}</text>`);
        }
      }
    }
  }

  parts.push(`</svg>`);
  return parts.join('');
}
```

The renderer is identical in behavior to the original; only color literals were replaced with `var(--token)` references.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/FretboardDiagram.ts src/shared/components/FretboardDiagram.test.ts
git commit -m "feat(components): port FretboardDiagram renderer"
```

---

## Task 16: Button component

**Files:**
- Create: `src/shared/components/Button.ts`

A single polymorphic button with variants (`primary`, `ghost`, `pill`, `icon`) and a `highlight` flag (replaces the original "gold-ring" indicator on quiz pills). DOM-builder style — returns `HTMLButtonElement`.

- [ ] **Step 1: Implement `Button.ts`**

Create `src/shared/components/Button.ts`:

```ts
export type ButtonVariant = 'primary' | 'ghost' | 'pill' | 'icon';

export interface ButtonOptions {
  label: string;
  variant: ButtonVariant;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export function createButton(opts: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = opts.label;
  btn.classList.add('btn', `btn--${opts.variant}`);
  if (opts.active) btn.classList.add('btn--active');
  if (opts.highlight) btn.classList.add('btn--highlight');
  if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
  btn.addEventListener('click', opts.onClick);
  return btn;
}
```

- [ ] **Step 2: Add Button styles to `global.css`**

Append to `src/styles/global.css`:

```css
.btn {
  border: 1px solid var(--ink);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default),
              color var(--duration-fast) var(--ease-default),
              transform var(--duration-fast) var(--ease-default);
}
.btn:hover { transform: translateY(-1px); }

.btn--primary {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent);
  font: 600 var(--text-lg) / 1 var(--font-display);
  padding: var(--space-3) var(--space-6);
}
.btn--primary:hover { background: var(--accent-soft); border-color: var(--accent-soft); }

.btn--ghost {
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
  font: 600 var(--text-lg) / 1 var(--font-display);
  padding: var(--space-3) var(--space-6);
}
.btn--ghost:hover { background: var(--ink); color: var(--on-accent); }

.btn--pill {
  background: transparent;
  color: var(--ink-soft);
  border-color: var(--ink-soft);
  font: 600 var(--text-xs) / 1 var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
}
.btn--pill:hover { background: var(--ink-soft); color: var(--on-accent); }
.btn--pill.btn--active { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
.btn--pill.btn--highlight { box-shadow: 0 0 0 2px rgba(168, 127, 60, 0.3); }

.btn--icon {
  background: transparent;
  border-color: transparent;
  color: var(--ink-soft);
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  font: 600 var(--text-md) / 1 var(--font-mono);
}
.btn--icon:hover { background: var(--surface-overlay); color: var(--ink); }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/Button.ts src/styles/global.css
git commit -m "feat(components): add polymorphic Button"
```

---

## Task 17: ToggleSwitch component

**Files:**
- Create: `src/shared/components/ToggleSwitch.ts`

iOS-style on/off toggle. Used in quiz mode for "hide diagram".

- [ ] **Step 1: Implement `ToggleSwitch.ts`**

Create `src/shared/components/ToggleSwitch.ts`:

```ts
export interface ToggleSwitchOptions {
  initial: boolean;
  ariaLabel: string;
  onChange: (value: boolean) => void;
}

export function createToggleSwitch(opts: ToggleSwitchOptions): {
  el: HTMLButtonElement;
  set(value: boolean): void;
} {
  let value = opts.initial;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toggle-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-label', opts.ariaLabel);
  paint();
  btn.addEventListener('click', () => {
    value = !value;
    paint();
    opts.onChange(value);
  });
  return {
    el: btn,
    set(v) { value = v; paint(); },
  };
  function paint() {
    btn.classList.toggle('toggle-switch--on', value);
    btn.setAttribute('aria-checked', String(value));
  }
}
```

- [ ] **Step 2: Add styles to `global.css`**

Append:

```css
.toggle-switch {
  position: relative;
  width: 32px;
  height: 17px;
  background: var(--surface-page);
  border: 1px solid var(--ink-soft);
  border-radius: 9px;
  cursor: pointer;
  transition: background var(--duration-base), border-color var(--duration-base);
  flex-shrink: 0;
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 1px; left: 1px;
  width: 13px; height: 13px;
  background: var(--ink-soft);
  border-radius: 50%;
  transition: left var(--duration-base), background var(--duration-base);
}
.toggle-switch--on { background: var(--accent); border-color: var(--accent); }
.toggle-switch--on::after { left: 17px; background: var(--surface-page); }
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/ToggleSwitch.ts src/styles/global.css
git commit -m "feat(components): add ToggleSwitch"
```

---

## Task 18: AppShell + Stage components

**Files:**
- Create: `src/shared/components/AppShell.ts`
- Create: `src/shared/components/Stage.ts`

AppShell is the outermost frame. Stage is the decorated panel that hosts feature content.

- [ ] **Step 1: Implement `AppShell.ts`**

Create `src/shared/components/AppShell.ts`:

```ts
export function createAppShell(): {
  root: HTMLElement;
  topBarSlot: HTMLElement;
  navSlot: HTMLElement;
  toolbarSlot: HTMLElement;
  contentSlot: HTMLElement;
} {
  const root = document.createElement('div');
  root.className = 'app-shell';
  const topBarSlot = el('div', 'app-shell__topbar');
  const navSlot = el('div', 'app-shell__nav');
  const toolbarSlot = el('div', 'app-shell__toolbar');
  const contentSlot = el('div', 'app-shell__content');
  root.append(topBarSlot, navSlot, toolbarSlot, contentSlot);
  return { root, topBarSlot, navSlot, toolbarSlot, contentSlot };
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
```

- [ ] **Step 2: Implement `Stage.ts`**

Create `src/shared/components/Stage.ts`:

```ts
export function createStage(): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement('div');
  root.className = 'stage';
  const body = document.createElement('div');
  body.className = 'stage__body';
  root.appendChild(body);
  return { root, body };
}
```

- [ ] **Step 3: Add styles to `global.css`**

Append:

```css
.app-shell {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-5);
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.app-shell__topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.app-shell__nav {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-4);
}
.app-shell__toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.app-shell__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.stage {
  background: var(--surface-raised);
  border: 1px solid var(--ink-soft);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-1), var(--shadow-inset);
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.stage::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed var(--border-soft);
  border-radius: var(--radius-sm);
  pointer-events: none;
}
.stage__body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/AppShell.ts src/shared/components/Stage.ts src/styles/global.css
git commit -m "feat(components): add AppShell and Stage"
```

---

## Task 19: TopBar component

**Files:**
- Create: `src/shared/components/TopBar.ts`

Title + chord-set switch + language switch. Reactive to settings changes.

- [ ] **Step 1: Implement `TopBar.ts`**

Create `src/shared/components/TopBar.ts`:

```ts
import { createButton } from './Button';
import type { Translator } from '../services/i18n';
import type { Lang, ChordSet, SettingsStore } from '../services/settings';

export interface TopBarOptions {
  i18n: Translator;
  settings: SettingsStore;
}

export function createTopBar(opts: TopBarOptions): { root: HTMLElement; refresh(): void } {
  const root = document.createElement('header');
  root.className = 'topbar';
  const title = document.createElement('h1');
  title.className = 'topbar__title';

  const setSwitch = document.createElement('div');
  setSwitch.className = 'topbar__switch';

  const langSwitch = document.createElement('div');
  langSwitch.className = 'topbar__switch';

  root.append(title, setSwitch, langSwitch);
  build();
  return { root, refresh: build };

  function build() {
    title.innerHTML = `${escape(opts.i18n.t('app.title'))}<em>${escape(opts.i18n.t('app.title.suffix'))}</em>`;

    setSwitch.replaceChildren();
    (['basic', 'extended'] as ChordSet[]).forEach(s => {
      const b = createButton({
        label: opts.i18n.t(`set.${s}`),
        variant: 'pill',
        active: opts.settings.get().set === s,
        onClick: () => opts.settings.set({ set: s }),
      });
      setSwitch.appendChild(b);
    });

    langSwitch.replaceChildren();
    (['ru', 'en', 'uk'] as Lang[]).forEach(l => {
      const b = createButton({
        label: opts.i18n.t(`lang.${l}`),
        variant: 'pill',
        active: opts.settings.get().lang === l,
        onClick: () => opts.settings.set({ lang: l }),
      });
      langSwitch.appendChild(b);
    });
  }
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
```

- [ ] **Step 2: Add styles**

Append to `src/styles/global.css`:

```css
.topbar { display: contents; }
.topbar__title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-2xl);
  line-height: 1;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.topbar__title em {
  font-style: italic;
  color: var(--accent);
  font-weight: 600;
}
.topbar__switch {
  display: flex;
  gap: var(--space-1);
  padding: 3px;
  background: var(--surface-overlay);
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/TopBar.ts src/styles/global.css
git commit -m "feat(components): add TopBar with set+lang switches"
```

---

## Task 20: TabBar component

**Files:**
- Create: `src/shared/components/TabBar.ts`

Feature tabs. Active tab is the current feature; clicking emits a navigation request.

- [ ] **Step 1: Implement `TabBar.ts`**

Create `src/shared/components/TabBar.ts`:

```ts
import { createButton } from './Button';
import type { Translator } from '../services/i18n';

export interface TabBarTab {
  id: string;
  titleKey: string;
}

export interface TabBarOptions {
  tabs: readonly TabBarTab[];
  i18n: Translator;
  getActive: () => string;
  onSelect: (id: string) => void;
}

export function createTabBar(opts: TabBarOptions): { root: HTMLElement; refresh(): void } {
  const root = document.createElement('nav');
  root.className = 'tabbar';
  build();
  return { root, refresh: build };

  function build() {
    root.replaceChildren();
    const active = opts.getActive();
    opts.tabs.forEach(tab => {
      const btn = createButton({
        label: opts.i18n.t(tab.titleKey),
        variant: 'ghost',
        active: tab.id === active,
        onClick: () => opts.onSelect(tab.id),
      });
      btn.classList.add('tabbar__tab');
      root.appendChild(btn);
    });
  }
}
```

- [ ] **Step 2: Add styles**

Append:

```css
.tabbar { display: flex; gap: var(--space-2); width: 100%; }
.tabbar__tab { flex: 1; }
.tabbar .btn--ghost.btn--active { background: var(--ink); color: var(--on-accent); border-color: var(--ink); }
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/TabBar.ts src/styles/global.css
git commit -m "feat(components): add TabBar"
```

---

## Task 21: ChordCard component

**Files:**
- Create: `src/shared/components/ChordCard.ts`

Composite: chord name (large), meta (secondary), type/shape switchers, diagram, controls. The `setHidden(true)` call swaps the diagram for a tap-to-reveal placeholder (used by quiz mode).

- [ ] **Step 1: Implement `ChordCard.ts`**

Create `src/shared/components/ChordCard.ts`:

```ts
import { renderFretboardDiagram } from './FretboardDiagram';
import { createButton } from './Button';
import { createRevealOverlay } from './RevealOverlay';
import type { ChordShape } from '../lib/chord';
import type { Translator } from '../services/i18n';

export interface ChordCardData {
  displayName: string;
  metaText: string;
  types: ReadonlyArray<{ id: string; label: string; active: boolean; highlight?: boolean }>;
  shapes: ReadonlyArray<{ id: string; label: string; active: boolean }>;
  shape: ChordShape;
  hidden: boolean;
}

export interface ChordCardCallbacks {
  onTypeSelect: (id: string) => void;
  onShapeSelect: (id: string) => void;
  onReveal: () => void;
}

export function createChordCard(i18n: Translator) {
  const root = document.createElement('div');
  root.className = 'chord-card';

  const name = el('div', 'chord-card__name');
  const meta = el('div', 'chord-card__meta');

  const typeRow = el('div', 'chord-card__row');
  const typeLabel = el('span', 'chord-card__row-label');
  typeLabel.textContent = i18n.t('quiz.label.type');
  const typeBtns = el('div', 'chord-card__row-btns');
  typeRow.append(typeLabel, typeBtns);

  const shapeRow = el('div', 'chord-card__row');
  const shapeLabel = el('span', 'chord-card__row-label');
  shapeLabel.textContent = i18n.t('quiz.label.shape');
  const shapeBtns = el('div', 'chord-card__row-btns');
  shapeRow.append(shapeLabel, shapeBtns);

  const diagramWrap = el('div', 'chord-card__diagram');

  root.append(name, meta, typeRow, shapeRow, diagramWrap);

  return {
    root,
    render(data: ChordCardData, cb: ChordCardCallbacks) {
      name.textContent = data.displayName;
      meta.textContent = data.metaText;

      typeRow.style.display = data.types.length > 1 ? '' : 'none';
      typeBtns.replaceChildren(...data.types.map(t =>
        createButton({
          label: t.label,
          variant: 'pill',
          active: t.active,
          highlight: !!t.highlight,
          onClick: () => cb.onTypeSelect(t.id),
        }),
      ));

      shapeRow.style.display = data.shapes.length > 1 ? '' : 'none';
      shapeBtns.replaceChildren(...data.shapes.map(s =>
        createButton({
          label: s.label,
          variant: 'pill',
          active: s.active,
          onClick: () => cb.onShapeSelect(s.id),
        }),
      ));

      diagramWrap.replaceChildren();
      if (data.hidden) {
        const overlay = createRevealOverlay({ i18n, onReveal: cb.onReveal });
        diagramWrap.appendChild(overlay);
      } else {
        diagramWrap.innerHTML = renderFretboardDiagram(data.shape);
      }
    },
  };
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
```

- [ ] **Step 2: Add styles**

Append:

```css
.chord-card { display: flex; flex-direction: column; flex: 1; min-height: 0; gap: var(--space-2); }
.chord-card__name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-3xl);
  line-height: 1;
  text-align: center;
  letter-spacing: -0.03em;
}
.chord-card__meta {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wider);
  color: var(--ink-soft);
  text-align: center;
  text-transform: uppercase;
}
.chord-card__row { display: flex; gap: var(--space-1); justify-content: center; flex-wrap: wrap; align-items: center; }
.chord-card__row-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wider);
  color: var(--ink-soft);
  text-transform: uppercase;
  margin-right: var(--space-1);
}
.chord-card__row-btns { display: flex; gap: var(--space-1); flex-wrap: wrap; }
.chord-card__diagram { flex: 1; display: flex; justify-content: center; align-items: center; margin: var(--space-2) 0; min-height: 0; position: relative; }
.chord-card__diagram .fretboard-diagram { width: 100%; max-width: 220px; max-height: 100%; height: auto; }
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/ChordCard.ts src/styles/global.css
git commit -m "feat(components): add ChordCard"
```

---

## Task 22: RootTile component

**Files:**
- Create: `src/shared/components/RootTile.ts`

Grid card: shows a root note and the available chord types under it.

- [ ] **Step 1: Implement `RootTile.ts`**

Create `src/shared/components/RootTile.ts`:

```ts
export interface RootTileOptions {
  root: string;
  typeLabels: readonly string[];
  active: boolean;
  onClick: () => void;
}

export function createRootTile(opts: RootTileOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'root-tile' + (opts.active ? ' root-tile--active' : '');
  btn.innerHTML = `
    <div class="root-tile__name">${escape(opts.root)}</div>
    <div class="root-tile__types">${opts.typeLabels.map(escape).join(' · ')}</div>
  `;
  btn.addEventListener('click', opts.onClick);
  return btn;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
```

- [ ] **Step 2: Add styles**

Append:

```css
.root-tile {
  background: var(--surface-raised);
  border: 1px solid var(--ink-soft);
  border-radius: var(--radius-sm);
  padding: var(--space-4) var(--space-2);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--duration-base), background var(--duration-base);
}
.root-tile:hover { border-color: var(--accent); }
.root-tile--active { border-color: var(--accent); background: rgba(184, 68, 42, 0.08); }
.root-tile__name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  line-height: 1;
}
.root-tile__types {
  font-family: var(--font-mono);
  font-size: 7px;
  color: var(--ink-soft);
  letter-spacing: 0.08em;
  margin-top: var(--space-1);
  text-transform: uppercase;
  line-height: 1.3;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/RootTile.ts src/styles/global.css
git commit -m "feat(components): add RootTile"
```

---

## Task 23: Toast component

**Files:**
- Create: `src/shared/components/Toast.ts`

Non-blocking notification at the bottom of the viewport. Used for the PWA "update available" prompt.

- [ ] **Step 1: Implement `Toast.ts`**

Create `src/shared/components/Toast.ts`:

```ts
import { createButton } from './Button';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function showToast(opts: ToastOptions): { dismiss(): void } {
  const root = document.createElement('div');
  root.className = 'toast';
  root.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.className = 'toast__text';
  text.textContent = opts.message;
  root.appendChild(text);

  if (opts.actionLabel && opts.onAction) {
    const btn = createButton({
      label: opts.actionLabel,
      variant: 'pill',
      onClick: () => { opts.onAction!(); dismiss(); },
    });
    btn.classList.add('toast__action');
    root.appendChild(btn);
  }

  document.body.appendChild(root);
  requestAnimationFrame(() => root.classList.add('toast--visible'));

  function dismiss() {
    root.classList.remove('toast--visible');
    setTimeout(() => root.remove(), 200);
  }

  return { dismiss };
}
```

- [ ] **Step 2: Add styles**

Append:

```css
.toast {
  position: fixed;
  left: 50%;
  bottom: max(var(--space-5), env(safe-area-inset-bottom));
  transform: translate(-50%, 24px);
  background: var(--ink);
  color: var(--on-accent);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex; align-items: center; gap: var(--space-3);
  box-shadow: var(--shadow-1);
  opacity: 0;
  transition: opacity var(--duration-base), transform var(--duration-base);
  z-index: 100;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
}
.toast--visible { opacity: 1; transform: translate(-50%, 0); }
.toast__action { background: transparent; border-color: var(--on-accent); color: var(--on-accent); }
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/Toast.ts src/styles/global.css
git commit -m "feat(components): add Toast"
```

---

## Task 24: RevealOverlay component

**Files:**
- Create: `src/shared/components/RevealOverlay.ts`

Tap-to-reveal placeholder used by quiz mode when `hideDiagram` is on.

- [ ] **Step 1: Implement `RevealOverlay.ts`**

Create `src/shared/components/RevealOverlay.ts`:

```ts
import type { Translator } from '../services/i18n';

export interface RevealOverlayOptions {
  i18n: Translator;
  onReveal: () => void;
}

export function createRevealOverlay(opts: RevealOverlayOptions): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'reveal-overlay';
  el.innerHTML = `
    <span class="reveal-overlay__icon">◆</span>
    <span class="reveal-overlay__text"></span>
  `;
  const text = el.querySelector('.reveal-overlay__text') as HTMLElement;
  text.textContent = opts.i18n.t('quiz.reveal');
  el.addEventListener('click', opts.onReveal);
  return el;
}
```

- [ ] **Step 2: Add styles**

Append:

```css
.reveal-overlay {
  cursor: pointer;
  width: 100%;
  max-width: 220px;
  aspect-ratio: 5 / 6;
  max-height: 100%;
  border: 2px dashed var(--ink-soft);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: var(--space-2);
  background: rgba(92, 77, 58, 0.04);
  transition: border-color var(--duration-base), background var(--duration-base);
}
.reveal-overlay:hover { border-color: var(--accent); background: rgba(184, 68, 42, 0.06); }
.reveal-overlay__icon { font-size: 22px; color: var(--ink-soft); }
.reveal-overlay__text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wider);
  color: var(--ink-soft);
  text-transform: uppercase;
  text-align: center;
  padding: 0 var(--space-3);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/RevealOverlay.ts src/styles/global.css
git commit -m "feat(components): add RevealOverlay"
```

---

## Task 25: Data types

**Files:**
- Create: `src/data/types.ts`

Re-export the domain types under a `data/` namespace for clarity at import sites.

- [ ] **Step 1: Implement `types.ts`**

Create `src/data/types.ts`:

```ts
export type { ChordTypeEntry, RootEntry, FlatChord } from '../shared/lib/music';
export type { ChordShape, ChordType, Fret, Finger } from '../shared/lib/chord';
```

- [ ] **Step 2: Commit**

```bash
git add src/data/types.ts
git commit -m "feat(data): add re-exports for data layer types"
```

---

## Task 26: Port chords-basic.ts

**Files:**
- Create: `src/data/chords-basic.ts`

Copy chord data from `chord_trainer.html` `ROOTS_BASIC`. Drop `rootRu` and `typeName` — international notation only.

- [ ] **Step 1: Implement `chords-basic.ts`**

Create `src/data/chords-basic.ts`:

```ts
import type { RootEntry } from './types';

export const CHORDS_BASIC: readonly RootEntry[] = [
  { root: 'C', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], notes: ['C3','E3','G3','C4','E4'] },
      { label: 'barre', frets: [null, 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1],         notes: ['C3','G3','C4','E4','C5'] },
    ] },
    { type: 'add9', shapes: [
      { label: 'open', frets: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], notes: ['C3','E3','G3','D4','E4'] },
    ] },
  ] },
  { root: 'D', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], notes: ['D3','A3','D4','F#4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 7, 5],     fingers: [null, 1, 2, 3, 4, 1],       notes: ['D3','A3','D4','F#4','A4'] },
    ] },
    { type: 'm', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], notes: ['D3','A3','D4','F4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 6, 5],     fingers: [null, 1, 3, 4, 2, 1],       notes: ['D3','A3','D4','F4','A4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], notes: ['D3','A3','C4','F#4'] },
      { label: 'barre', frets: [null, 5, 7, 5, 7, 5],     fingers: [null, 1, 3, 1, 4, 1],       notes: ['D3','A3','C4','F#4','A4'] },
    ] },
    { type: 'sus4', shapes: [
      { label: 'open', frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], notes: ['D3','A3','D4','G4'] },
    ] },
  ] },
  { root: 'E', types: [
    { type: '',  shapes: [{ label: 'open', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], notes: ['E2','B2','E3','G#3','B3','E4'] }] },
    { type: 'm', shapes: [{ label: 'open', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], notes: ['E2','B2','E3','G3','B3','E4'] }] },
    { type: '7', shapes: [{ label: 'open', frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], notes: ['E2','B2','D3','G#3','B3','E4'] }] },
  ] },
  { root: 'F', types: [
    { type: '', shapes: [
      { label: 'barre', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], notes: ['F2','C3','F3','A3','C4','F4'], recommended: true },
      { label: 'mini',  frets: [null, null, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], notes: ['F3','A3','C4','F4'] },
    ] },
  ] },
  { root: 'G', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], notes: ['G2','B2','D3','G3','B3','G4'] },
      { label: 'barre', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1],            notes: ['G2','D3','G3','B3','D4','G4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], notes: ['G2','B2','D3','G3','B3','F4'] },
      { label: 'barre', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1],            notes: ['G2','D3','F3','B3','D4','G4'] },
    ] },
  ] },
  { root: 'A', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], notes: ['A2','E3','A3','C#4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 6, 5, 5],     fingers: [1, 3, 4, 2, 1, 1],          notes: ['A2','E3','A3','C#4','E4','A4'] },
    ] },
    { type: 'm', shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], notes: ['A2','E3','A3','C4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 5, 5, 5],     fingers: [1, 3, 4, 1, 1, 1],          notes: ['A2','E3','A3','C4','E4','A4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], notes: ['A2','E3','G3','C#4','E4'] },
      { label: 'barre', frets: [5, 7, 5, 6, 5, 5],     fingers: [1, 3, 1, 2, 1, 1],            notes: ['A2','E3','G3','C#4','E4','A4'] },
    ] },
  ] },
];
```

- [ ] **Step 2: Validate the data with a one-off test**

Run a one-off check: open a Vitest test file `src/data/chords-basic.test.ts` (delete after):

```ts
import { describe, it, expect } from 'vitest';
import { CHORDS_BASIC } from './chords-basic';
import { validateChordShape } from '../shared/lib/chord';

describe('chords-basic data', () => {
  it('every shape passes validation', () => {
    const errors: string[] = [];
    for (const root of CHORDS_BASIC) {
      for (const type of root.types) {
        for (const shape of type.shapes) {
          const e = validateChordShape(shape);
          if (e.length) errors.push(`${root.root}${type.type} [${shape.label}]: ${e.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
```

Run: `npm run test`
Expected: PASS.

- [ ] **Step 3: Keep the validation test (do not delete)**

The test acts as a regression guard for any future edits to chord data. Leave it in place.

- [ ] **Step 4: Commit**

```bash
git add src/data/chords-basic.ts src/data/chords-basic.test.ts
git commit -m "feat(data): port chords-basic with international notation"
```

---

## Task 27: Port chords-extended.ts

**Files:**
- Create: `src/data/chords-extended.ts`
- Create: `src/data/chords-extended.test.ts`

- [ ] **Step 1: Implement `chords-extended.ts`**

Create `src/data/chords-extended.ts`:

```ts
import type { RootEntry } from './types';

export const CHORDS_EXTENDED: readonly RootEntry[] = [
  { root: 'C', types: [
    { type: '',     shapes: [
      { label: 'open',  frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], notes: ['C3','E3','G3','C4','E4'] },
      { label: 'barre', frets: [null, 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1],         notes: ['C3','G3','C4','E4','C5'] },
    ] },
    { type: 'm',    shapes: [{ label: 'barre', frets: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], notes: ['C3','G3','C4','D#4','G4'] }] },
    { type: '7',    shapes: [{ label: 'open',  frets: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], notes: ['C3','E3','A#3','C4','E4'] }] },
    { type: 'maj7', shapes: [{ label: 'open',  frets: [null, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], notes: ['C3','E3','G3','B3','E4'] }] },
    { type: 'sus2', shapes: [{ label: 'open',  frets: [null, 3, 0, 0, 1, 3], fingers: [null, 3, null, null, 1, 4], notes: ['C3','D3','G3','C4','D4'] }] },
    { type: 'add9', shapes: [{ label: 'open',  frets: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], notes: ['C3','E3','G3','D4','E4'] }] },
  ] },
  { root: 'D', types: [
    { type: '',     shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], notes: ['D3','A3','D4','F#4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 7, 5],     fingers: [null, 1, 2, 3, 4, 1],       notes: ['D3','A3','D4','F#4','A4'] },
    ] },
    { type: 'm',    shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], notes: ['D3','A3','D4','F4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 6, 5],     fingers: [null, 1, 3, 4, 2, 1],       notes: ['D3','A3','D4','F4','A4'] },
    ] },
    { type: '7',    shapes: [{ label: 'open', frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], notes: ['D3','A3','C4','F#4'] }] },
    { type: 'maj7', shapes: [{ label: 'open', frets: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], notes: ['D3','A3','C#4','F#4'] }] },
    { type: 'm7',   shapes: [{ label: 'open', frets: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], notes: ['D3','A3','C4','F4'] }] },
    { type: 'sus2', shapes: [{ label: 'open', frets: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], notes: ['D3','A3','D4','E4'] }] },
    { type: 'sus4', shapes: [{ label: 'open', frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], notes: ['D3','A3','D4','G4'] }] },
  ] },
  { root: 'E', types: [
    { type: '',     shapes: [{ label: 'open', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], notes: ['E2','B2','E3','G#3','B3','E4'] }] },
    { type: 'm',    shapes: [{ label: 'open', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], notes: ['E2','B2','E3','G3','B3','E4'] }] },
    { type: '7',    shapes: [{ label: 'open', frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], notes: ['E2','B2','D3','G#3','B3','E4'] }] },
    { type: 'maj7', shapes: [{ label: 'open', frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], notes: ['E2','B2','D#3','G#3','B3','E4'] }] },
    { type: 'm7',   shapes: [{ label: 'open', frets: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], notes: ['E2','B2','E3','G3','B3','E4'] }] },
    { type: 'sus4', shapes: [{ label: 'open', frets: [0, 2, 2, 2, 0, 0], fingers: [null, 1, 2, 3, null, null], notes: ['E2','B2','E3','A3','B3','E4'] }] },
  ] },
  { root: 'F', types: [
    { type: '',     shapes: [
      { label: 'barre', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], notes: ['F2','C3','F3','A3','C4','F4'], recommended: true },
      { label: 'mini',  frets: [null, null, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], notes: ['F3','A3','C4','F4'] },
    ] },
    { type: 'm',    shapes: [{ label: 'barre', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], notes: ['F2','C3','F3','G#3','C4','F4'] }] },
    { type: '7',    shapes: [{ label: 'barre', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], notes: ['F2','C3','D#3','A3','C4','F4'] }] },
    { type: 'maj7', shapes: [{ label: 'open',  frets: [null, null, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], notes: ['F3','A3','C4','E4'] }] },
  ] },
  { root: 'F#', types: [
    { type: 'm', shapes: [{ label: 'barre', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], notes: ['F#2','C#3','F#3','A3','C#4','F#4'] }] },
  ] },
  { root: 'G', types: [
    { type: '',     shapes: [
      { label: 'open',  frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], notes: ['G2','B2','D3','G3','B3','G4'] },
      { label: 'barre', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1],            notes: ['G2','D3','G3','B3','D4','G4'] },
    ] },
    { type: 'm',    shapes: [{ label: 'barre', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], notes: ['G2','D3','G3','A#3','D4','G4'] }] },
    { type: '7',    shapes: [{ label: 'open',  frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], notes: ['G2','B2','D3','G3','B3','F4'] }] },
    { type: 'maj7', shapes: [{ label: 'open',  frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], notes: ['G2','B2','D3','G3','B3','F#4'] }] },
    { type: 'sus4', shapes: [{ label: 'open',  frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, null, null, 1, 4], notes: ['G2','C3','D3','G3','C4','G4'] }] },
  ] },
  { root: 'A', types: [
    { type: '',     shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], notes: ['A2','E3','A3','C#4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 6, 5, 5],     fingers: [1, 3, 4, 2, 1, 1],          notes: ['A2','E3','A3','C#4','E4','A4'] },
    ] },
    { type: 'm',    shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], notes: ['A2','E3','A3','C4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 5, 5, 5],     fingers: [1, 3, 4, 1, 1, 1],          notes: ['A2','E3','A3','C4','E4','A4'] },
    ] },
    { type: '7',    shapes: [{ label: 'open', frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], notes: ['A2','E3','G3','C#4','E4'] }] },
    { type: 'maj7', shapes: [{ label: 'open', frets: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], notes: ['A2','E3','G#3','C#4','E4'] }] },
    { type: 'm7',   shapes: [{ label: 'open', frets: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], notes: ['A2','E3','G3','C4','E4'] }] },
    { type: 'sus2', shapes: [{ label: 'open', frets: [null, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], notes: ['A2','E3','A3','B3','E4'] }] },
    { type: 'sus4', shapes: [{ label: 'open', frets: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], notes: ['A2','E3','A3','D4','E4'] }] },
  ] },
  { root: 'B', types: [
    { type: '',  shapes: [{ label: 'barre', frets: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], notes: ['B2','F#3','B3','D#4','F#4'] }] },
    { type: 'm', shapes: [{ label: 'barre', frets: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], notes: ['B2','F#3','B3','D4','F#4'] }] },
    { type: '7', shapes: [{ label: 'open',  frets: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], notes: ['B2','D#3','A3','B3','F#4'] }] },
    { type: 'm7', shapes: [{ label: 'barre', frets: [null, 2, 4, 2, 3, 2], fingers: [null, 1, 3, 1, 2, 1], notes: ['B2','F#3','A3','D4','F#4'] }] },
  ] },
];
```

- [ ] **Step 2: Add validation test**

Create `src/data/chords-extended.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CHORDS_EXTENDED } from './chords-extended';
import { validateChordShape } from '../shared/lib/chord';

describe('chords-extended data', () => {
  it('every shape passes validation', () => {
    const errors: string[] = [];
    for (const root of CHORDS_EXTENDED) {
      for (const type of root.types) {
        for (const shape of type.shapes) {
          const e = validateChordShape(shape);
          if (e.length) errors.push(`${root.root}${type.type} [${shape.label}]: ${e.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data/chords-extended.ts src/data/chords-extended.test.ts
git commit -m "feat(data): port chords-extended with international notation"
```

---

## Task 28: Feature contract + registry

**Files:**
- Create: `src/shared/lib/feature.ts`
- Create: `src/features/registry.ts`

The registry will reference `chord-quiz` and `chord-browse` modules that don't exist yet. We import them by path with placeholder defaults so this task compiles; Tasks 32 and 33 fill them in.

- [ ] **Step 1: Implement `feature.ts`**

Create `src/shared/lib/feature.ts`:

```ts
import type { Translator } from '../services/i18n';
import type { SettingsStore, ChordSet, Lang } from '../services/settings';
import type { AudioOutput } from '../services/audio';

export interface FeatureContext {
  set: ChordSet;
  lang: Lang;
  audio: AudioOutput;
  i18n: Translator;
  settings: SettingsStore;
}

export interface Feature {
  readonly id: string;
  readonly titleKey: string;
  mount(host: HTMLElement, ctx: FeatureContext): void;
  unmount(): void;
  onContextChange?(ctx: FeatureContext): void;
}
```

- [ ] **Step 2: Implement `registry.ts`**

Create `src/features/registry.ts`:

```ts
import type { Feature } from '../shared/lib/feature';
import { chordQuiz } from './chord-quiz';
import { chordBrowse } from './chord-browse';

export const features: readonly Feature[] = [chordQuiz, chordBrowse];
```

This will produce TypeScript errors until Tasks 32 and 33 add the modules. We accept that — the registry is a compile-time list, and the features it references are introduced in subsequent tasks. To keep `npm run test` green for now, create stubs:

- [ ] **Step 3: Create stub `features/chord-quiz/index.ts`**

```ts
import type { Feature } from '../../shared/lib/feature';
export const chordQuiz: Feature = {
  id: 'chord-quiz',
  titleKey: 'feature.chord-quiz.title',
  mount() {},
  unmount() {},
};
```

- [ ] **Step 4: Create stub `features/chord-browse/index.ts`**

```ts
import type { Feature } from '../../shared/lib/feature';
export const chordBrowse: Feature = {
  id: 'chord-browse',
  titleKey: 'feature.chord-browse.title',
  mount() {},
  unmount() {},
};
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/shared/lib/feature.ts src/features/registry.ts src/features/chord-quiz/index.ts src/features/chord-browse/index.ts
git commit -m "feat(features): add Feature contract and registry with stubs"
```

---

## Task 29: Hash router

**Files:**
- Modify: `src/app.ts` (created in Task 30; do this AFTER Task 30 is started)

The router is small enough to live inside `app.ts`. Implemented in Task 30.

This task is a placeholder — no separate file. Skip to Task 30.

- [ ] **Step 1: Mark this task as a no-op note in the project log**

No files created. Move to Task 30.

---

## Task 30: app.ts bootstrap

**Files:**
- Create: `src/app.ts`

Wires together: settings → i18n → audio → topbar → tabbar → router → active feature. Renders into a host element.

- [ ] **Step 1: Implement `app.ts`**

Create `src/app.ts`:

```ts
import { createAppShell } from './shared/components/AppShell';
import { createTopBar } from './shared/components/TopBar';
import { createTabBar } from './shared/components/TabBar';
import { showToast } from './shared/components/Toast';
import { createSettingsStore, type Settings } from './shared/services/settings';
import { createTranslator, type Dictionaries } from './shared/services/i18n';
import ru from './shared/services/i18n/ru';
import en from './shared/services/i18n/en';
import uk from './shared/services/i18n/uk';
import { audio } from './shared/services/audio';
import { registerPWA } from './shared/services/pwa';
import { features } from './features/registry';
import type { Feature, FeatureContext } from './shared/lib/feature';

export function startApp(host: HTMLElement): void {
  const dictionaries: Dictionaries = { ru, en, uk };
  const settings = createSettingsStore(window.localStorage);
  const i18n = createTranslator(dictionaries, settings.get().lang);

  const shell = createAppShell();
  host.appendChild(shell.root);

  const topBar = createTopBar({ i18n, settings });
  shell.topBarSlot.appendChild(topBar.root);

  const tabBar = createTabBar({
    tabs: features.map(f => ({ id: f.id, titleKey: f.titleKey })),
    i18n,
    getActive: () => currentId(),
    onSelect: id => { window.location.hash = id; },
  });
  shell.navSlot.appendChild(tabBar.root);

  let active: Feature | null = null;

  function ctx(): FeatureContext {
    const s = settings.get();
    return { set: s.set, lang: s.lang, audio, i18n, settings };
  }

  function currentId(): string {
    const fromHash = window.location.hash.slice(1);
    const validIds = features.map(f => f.id);
    if (validIds.includes(fromHash)) return fromHash;
    const last = settings.get().lastFeatureId;
    if (validIds.includes(last)) return last;
    return features[0]?.id ?? '';
  }

  function activate(id: string) {
    if (active && active.id === id) return;
    active?.unmount();
    shell.contentSlot.replaceChildren();
    const next = features.find(f => f.id === id) ?? features[0];
    if (!next) return;
    active = next;
    next.mount(shell.contentSlot, ctx());
    settings.set({ lastFeatureId: next.id });
    tabBar.refresh();
  }

  window.addEventListener('hashchange', () => activate(currentId()));

  settings.subscribe((s: Settings) => {
    if (s.lang !== i18n.lang) i18n.setLang(s.lang);
  });
  i18n.onLangChange(() => {
    topBar.refresh();
    tabBar.refresh();
    active?.onContextChange?.(ctx());
  });
  settings.subscribe(() => {
    topBar.refresh();
    active?.onContextChange?.(ctx());
  });

  if (!window.location.hash) window.location.hash = currentId();
  activate(currentId());

  registerPWA(() => {
    const t = showToast({
      message: i18n.t('pwa.update.message'),
      actionLabel: i18n.t('pwa.update.action'),
      onAction() { window.location.reload(); },
    });
    void t;
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app.ts
git commit -m "feat(app): wire shell, router, and services"
```

---

## Task 31: main.ts entry + index.html

**Files:**
- Create: `src/main.ts`
- Create: `index.html`

- [ ] **Step 1: Implement `main.ts`**

Create `src/main.ts`:

```ts
import './styles/global.css';
import { startApp } from './app';

const host = document.getElementById('app');
if (!host) throw new Error('#app element not found');
startApp(host);
```

- [ ] **Step 2: Implement `index.html`**

Create `index.html` at the repo root:

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Chords</title>
    <link rel="icon" type="image/svg+xml" href="/GuitarTrainer/favicon.svg" />
    <link rel="manifest" href="/GuitarTrainer/manifest.webmanifest" />
    <meta name="theme-color" content="#f0e6d2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Run dev server to confirm it boots**

Run: `npm run dev`
Visit: `http://localhost:5173/GuitarTrainer/`
Expected: renders TopBar, TabBar, empty content (because feature stubs do nothing yet). No console errors.

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/main.ts index.html
git commit -m "feat(app): add main entry and index.html"
```

---

## Task 32: chord-quiz feature

**Files:**
- Modify: `src/features/chord-quiz/index.ts`
- Create: `src/features/chord-quiz/state.ts`
- Create: `src/features/chord-quiz/view.ts`

Port the quiz logic from `chord_trainer.html`: random chord prompt, type/shape switchers, hide-diagram toggle, play, next.

- [ ] **Step 1: Implement state**

Create `src/features/chord-quiz/state.ts`:

```ts
import { CHORDS_BASIC } from '../../data/chords-basic';
import { CHORDS_EXTENDED } from '../../data/chords-extended';
import { flattenChords, getDefaultShapeIdx, type FlatChord, type RootEntry } from '../../shared/lib/music';
import type { ChordSet } from '../../shared/services/settings';

export interface QuizState {
  set: ChordSet;
  current: FlatChord;
  typeIdx: number;
  shapeIdx: number;
  originalTypeIdx: number;
  revealed: boolean;
}

export function rootsForSet(set: ChordSet): readonly RootEntry[] {
  return set === 'basic' ? CHORDS_BASIC : CHORDS_EXTENDED;
}

export function pickRandom(set: ChordSet, prevRoot?: RootEntry): FlatChord {
  const flat = flattenChords(rootsForSet(set));
  if (flat.length === 0) throw new Error('empty chord set');
  let pick = flat[Math.floor(Math.random() * flat.length)]!;
  for (let i = 0; i < 5 && flat.length > 1 && pick.root === prevRoot; i++) {
    pick = flat[Math.floor(Math.random() * flat.length)]!;
  }
  return pick;
}

export function newState(set: ChordSet): QuizState {
  const current = pickRandom(set);
  const typeIdx = current.root.types.indexOf(current.type);
  return {
    set,
    current,
    typeIdx,
    shapeIdx: getDefaultShapeIdx(current.type),
    originalTypeIdx: typeIdx,
    revealed: false,
  };
}

export function nextChord(state: QuizState): QuizState {
  return newState(state.set);
}
```

- [ ] **Step 2: Implement view**

Create `src/features/chord-quiz/view.ts`:

```ts
import { createStage } from '../../shared/components/Stage';
import { createChordCard } from '../../shared/components/ChordCard';
import { createButton } from '../../shared/components/Button';
import { createToggleSwitch } from '../../shared/components/ToggleSwitch';
import { chordDisplayName } from '../../shared/lib/chord';
import { getDefaultShapeIdx } from '../../shared/lib/music';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { SettingsStore } from '../../shared/services/settings';
import { newState, nextChord, type QuizState } from './state';

export interface QuizViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export function mountQuizView(host: HTMLElement, deps: QuizViewDeps): () => void {
  const stage = createStage();
  host.appendChild(stage.root);

  const card = createChordCard(deps.i18n);
  stage.body.appendChild(card.root);

  const controls = document.createElement('div');
  controls.className = 'quiz-controls';
  const playBtn = createButton({
    label: deps.i18n.t('quiz.btn.play'),
    variant: 'primary',
    onClick: () => playCurrent(),
  });
  const nextBtn = createButton({
    label: deps.i18n.t('quiz.btn.next'),
    variant: 'ghost',
    onClick: () => { state = nextChord(state); render(); },
  });
  controls.append(playBtn, nextBtn);
  stage.body.appendChild(controls);

  // Toolbar lives outside the stage; we put the hide toggle into the stage's parent slot.
  const toolbar = document.createElement('div');
  toolbar.className = 'quiz-toolbar';
  const toolbarLabel = document.createElement('span');
  toolbarLabel.className = 'quiz-toolbar__label';
  toolbarLabel.textContent = deps.i18n.t('quiz.hide-diagram');
  const toggle = createToggleSwitch({
    initial: deps.settings.get().hideDiagram,
    ariaLabel: deps.i18n.t('quiz.hide-diagram'),
    onChange: v => {
      deps.settings.set({ hideDiagram: v });
      state.revealed = false;
      render();
    },
  });
  toolbar.append(toolbarLabel, toggle.el);
  host.insertBefore(toolbar, stage.root);

  let state: QuizState = newState(deps.settings.get().set);
  render();

  return () => {
    host.replaceChildren();
  };

  function playCurrent() {
    const shape = state.current.type.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }

  function render() {
    const root = state.current.root;
    const type = root.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    card.render(
      {
        displayName: chordDisplayName({ root: root.root, type: type.type }),
        metaText: deps.i18n.t(`chord.type.${type.type}`),
        types: root.types.map((t, i) => ({
          id: String(i),
          label: deps.i18n.t(`chord.type.${t.type}`),
          active: i === state.typeIdx,
          highlight: i === state.originalTypeIdx && i !== state.typeIdx,
        })),
        shapes: type.shapes.map((s, i) => ({
          id: String(i),
          label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ' ' + deps.i18n.t('shape.recommended') : ''),
          active: i === state.shapeIdx,
        })),
        shape,
        hidden: deps.settings.get().hideDiagram && !state.revealed,
      },
      {
        onTypeSelect: id => {
          state.typeIdx = Number(id);
          state.shapeIdx = getDefaultShapeIdx(root.types[state.typeIdx]!);
          render();
        },
        onShapeSelect: id => { state.shapeIdx = Number(id); render(); },
        onReveal: () => { state.revealed = true; render(); },
      },
    );
  }
}
```

- [ ] **Step 3: Implement feature index**

Replace `src/features/chord-quiz/index.ts` with:

```ts
import type { Feature, FeatureContext } from '../../shared/lib/feature';
import { mountQuizView } from './view';

let teardown: (() => void) | null = null;
let lastCtx: FeatureContext | null = null;

export const chordQuiz: Feature = {
  id: 'chord-quiz',
  titleKey: 'feature.chord-quiz.title',
  mount(host, ctx) {
    lastCtx = ctx;
    teardown = mountQuizView(host, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
  unmount() {
    teardown?.();
    teardown = null;
    lastCtx = null;
  },
  onContextChange(ctx) {
    if (!teardown || !lastCtx) return;
    teardown();
    lastCtx = ctx;
    teardown = mountQuizView(lastCtxHost()!, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
};

function lastCtxHost(): HTMLElement | null {
  // The host is owned by the router; retain it via a closure on mount instead.
  return null;
}
```

The `onContextChange` body above leaks: the host reference is lost on `unmount`. Fix by retaining it:

```ts
import type { Feature, FeatureContext } from '../../shared/lib/feature';
import { mountQuizView } from './view';

let teardown: (() => void) | null = null;
let host: HTMLElement | null = null;

export const chordQuiz: Feature = {
  id: 'chord-quiz',
  titleKey: 'feature.chord-quiz.title',
  mount(h, ctx) {
    host = h;
    teardown = mountQuizView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
  unmount() {
    teardown?.();
    teardown = null;
    host = null;
  },
  onContextChange(ctx) {
    if (!host) return;
    teardown?.();
    teardown = mountQuizView(host, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
};
```

Use the second version. The first version is shown only to illustrate why retention is needed — discard it.

- [ ] **Step 4: Add quiz styles**

Append to `src/styles/global.css`:

```css
.quiz-controls { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; flex-shrink: 0; margin-top: var(--space-3); }
.quiz-toolbar {
  display: flex; align-items: center; justify-content: center; gap: var(--space-3);
  margin-bottom: var(--space-4);
  font-family: var(--font-mono); font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide); color: var(--ink-soft); text-transform: uppercase;
}
```

- [ ] **Step 5: Run dev server, smoke-test the quiz**

Run: `npm run dev`
Visit: `http://localhost:5173/GuitarTrainer/#chord-quiz`
Expected: chord card appears with name, meta, type/shape pills, hidden diagram (until tapped). "Next" picks a new chord. Hide-diagram toggle works.

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/features/chord-quiz/state.ts src/features/chord-quiz/view.ts src/features/chord-quiz/index.ts src/styles/global.css
git commit -m "feat(features): port chord-quiz onto new architecture"
```

---

## Task 33: chord-browse feature

**Files:**
- Modify: `src/features/chord-browse/index.ts`
- Create: `src/features/chord-browse/state.ts`
- Create: `src/features/chord-browse/view.ts`

Port the browse mode: grid of root tiles + detail panel. Auto-plays on selection change.

- [ ] **Step 1: Implement state**

Create `src/features/chord-browse/state.ts`:

```ts
import { getDefaultShapeIdx, type RootEntry } from '../../shared/lib/music';

export interface BrowseState {
  selectedRoot: RootEntry | null;
  typeIdx: number;
  shapeIdx: number;
}

export function selectRoot(root: RootEntry): BrowseState {
  return {
    selectedRoot: root,
    typeIdx: 0,
    shapeIdx: getDefaultShapeIdx(root.types[0]!),
  };
}

export function selectType(state: BrowseState, idx: number): BrowseState {
  if (!state.selectedRoot) return state;
  const type = state.selectedRoot.types[idx]!;
  return { ...state, typeIdx: idx, shapeIdx: getDefaultShapeIdx(type) };
}

export function selectShape(state: BrowseState, idx: number): BrowseState {
  return { ...state, shapeIdx: idx };
}
```

- [ ] **Step 2: Implement view**

Create `src/features/chord-browse/view.ts`:

```ts
import { createRootTile } from '../../shared/components/RootTile';
import { createChordCard } from '../../shared/components/ChordCard';
import { chordDisplayName } from '../../shared/lib/chord';
import { rootsForSet } from '../chord-quiz/state';
import { type BrowseState, selectRoot, selectShape, selectType } from './state';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { SettingsStore } from '../../shared/services/settings';

export interface BrowseViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export function mountBrowseView(host: HTMLElement, deps: BrowseViewDeps): () => void {
  const root = document.createElement('div');
  root.className = 'browse';
  host.appendChild(root);

  const grid = document.createElement('div');
  grid.className = 'browse__grid';
  root.appendChild(grid);

  const panel = document.createElement('div');
  panel.className = 'browse__panel';
  root.appendChild(panel);

  let state: BrowseState = { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };
  let card = createChordCard(deps.i18n);

  render();

  return () => host.replaceChildren();

  function render() {
    grid.replaceChildren();
    for (const r of rootsForSet(deps.settings.get().set)) {
      grid.appendChild(createRootTile({
        root: r.root,
        typeLabels: r.types.map(t => deps.i18n.t(`chord.type.${t.type}`)),
        active: r === state.selectedRoot,
        onClick: () => {
          state = selectRoot(r);
          render();
          play();
        },
      }));
    }
    panel.replaceChildren();
    if (!state.selectedRoot) {
      const empty = document.createElement('div');
      empty.className = 'browse__empty';
      empty.textContent = deps.i18n.t('browse.empty');
      panel.appendChild(empty);
      return;
    }
    card = createChordCard(deps.i18n);
    panel.appendChild(card.root);
    paintCard();
  }

  function paintCard() {
    const r = state.selectedRoot!;
    const type = r.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    card.render({
      displayName: chordDisplayName({ root: r.root, type: type.type }),
      metaText: deps.i18n.t(`chord.type.${type.type}`),
      types: r.types.map((t, i) => ({
        id: String(i),
        label: deps.i18n.t(`chord.type.${t.type}`),
        active: i === state.typeIdx,
      })),
      shapes: type.shapes.map((s, i) => ({
        id: String(i),
        label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ' ' + deps.i18n.t('shape.recommended') : ''),
        active: i === state.shapeIdx,
      })),
      shape,
      hidden: false,
    }, {
      onTypeSelect: id => { state = selectType(state, Number(id)); paintCard(); play(); },
      onShapeSelect: id => { state = selectShape(state, Number(id)); paintCard(); play(); },
      onReveal: () => {},
    });
  }

  function play() {
    if (!state.selectedRoot) return;
    const type = state.selectedRoot.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }
}
```

- [ ] **Step 3: Implement feature index**

Replace `src/features/chord-browse/index.ts`:

```ts
import type { Feature } from '../../shared/lib/feature';
import { mountBrowseView } from './view';

let teardown: (() => void) | null = null;
let host: HTMLElement | null = null;

export const chordBrowse: Feature = {
  id: 'chord-browse',
  titleKey: 'feature.chord-browse.title',
  mount(h, ctx) {
    host = h;
    teardown = mountBrowseView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
  unmount() {
    teardown?.();
    teardown = null;
    host = null;
  },
  onContextChange(ctx) {
    if (!host) return;
    teardown?.();
    teardown = mountBrowseView(host, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
};
```

- [ ] **Step 4: Add browse styles**

Append to `src/styles/global.css`:

```css
.browse { display: flex; flex-direction: column; gap: var(--space-4); flex: 1; min-height: 0; overflow-y: auto; }
.browse__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: var(--space-2); }
.browse__panel {
  background: var(--surface-raised);
  border: 1px solid var(--ink-soft);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  box-shadow: var(--shadow-1);
}
.browse__empty {
  text-align: center;
  padding: var(--space-7) var(--space-5);
  color: var(--ink-soft);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```

- [ ] **Step 5: Run dev server, smoke-test browse**

Run: `npm run dev`
Visit: `http://localhost:5173/GuitarTrainer/#chord-browse`
Expected: grid of root tiles, click triggers playback + detail panel. Type/shape switchers work.

Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/features/chord-browse/state.ts src/features/chord-browse/view.ts src/features/chord-browse/index.ts src/styles/global.css
git commit -m "feat(features): port chord-browse onto new architecture"
```

---

## Task 34: PWA manifest, icons, and Vite PWA config

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/favicon.svg`
- Create: `public/icons/icon-192.png` (placeholder)
- Create: `public/icons/icon-512.png` (placeholder)
- Create: `public/icons/icon-maskable-512.png` (placeholder)
- Modify: `vite.config.ts`

- [ ] **Step 1: Create the manifest**

Create `public/manifest.webmanifest`:

```json
{
  "name": "Guitar Trainer",
  "short_name": "Chords",
  "start_url": "/GuitarTrainer/",
  "scope": "/GuitarTrainer/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#f0e6d2",
  "background_color": "#f0e6d2",
  "icons": [
    { "src": "/GuitarTrainer/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/GuitarTrainer/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/GuitarTrainer/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Create a placeholder favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#f0e6d2"/>
  <text x="50%" y="55%" text-anchor="middle" font-family="Georgia, serif" font-size="44" font-weight="800" fill="#2a2520">A</text>
</svg>
```

- [ ] **Step 3: Generate PNG icon placeholders**

Run from the repo root:

```bash
mkdir -p public/icons
for size in 192 512; do
  printf '%s\n' \
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '"$size"' '"$size"'">' \
    '<rect width="'"$size"'" height="'"$size"'" fill="#f0e6d2"/>' \
    '<text x="50%" y="60%" text-anchor="middle" font-family="Georgia, serif" font-size="'"$((size * 70 / 100))"'" font-weight="800" fill="#2a2520">A</text>' \
    '</svg>' > public/icons/icon-${size}.svg
done
```

Convert to PNG using any tool the user has at hand (e.g. `npx sharp-cli` or open in a browser and screenshot). For v1 a 1x1 PNG fallback is acceptable; replace with a real icon when Claude Design returns assets. Minimal commands using `node`:

```bash
npx --yes -p sharp-cli sharp -i public/icons/icon-192.svg -o public/icons/icon-192.png resize 192 192
npx --yes -p sharp-cli sharp -i public/icons/icon-512.svg -o public/icons/icon-512.png resize 512 512
cp public/icons/icon-512.png public/icons/icon-maskable-512.png
rm public/icons/icon-192.svg public/icons/icon-512.svg
```

If `sharp-cli` is not desired, commit a single-color 1×1 PNG resized via any image editor. The placeholder will be replaced before public release.

- [ ] **Step 4: Wire `vite-plugin-pwa`**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/GuitarTrainer/',
  build: { target: 'es2022', sourcemap: true },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'manifest.webmanifest', 'icons/*.png'],
      manifest: false, // we ship our own manifest.webmanifest in /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdnjs',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 5: Build and preview**

Run: `npm run build && npm run preview`
Visit: `http://localhost:4173/GuitarTrainer/`
Open DevTools → Application → Manifest. Expected: manifest detected, icons listed.
Open Application → Service Workers. Expected: SW registered.

Stop the preview server.

- [ ] **Step 6: Commit**

```bash
git add public/manifest.webmanifest public/favicon.svg public/icons/*.png vite.config.ts
git commit -m "feat(pwa): add manifest, icons, and PWA plugin config"
```

---

## Task 35: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (full rewrite)

Replace the existing CLAUDE.md (which describes the legacy single-file app) with the new architecture-focused version.

- [ ] **Step 1: Rewrite `CLAUDE.md`**

Replace the file contents with:

````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Guitar Trainer is a TypeScript PWA that drills chords (and later: progressions, scales, ear training, microphone-based recognition). It is **statically hosted on GitHub Pages**, has **no backend**, and is **installable as a mobile PWA**.

The project's defining architectural decisions live in `docs/superpowers/specs/2026-04-25-architecture-design.md`. Read that file before any non-trivial change.

## Commands

```bash
npm install        # install once
npm run dev        # Vite dev server on http://localhost:5173/GuitarTrainer/
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ for local sanity check
npm run test       # Vitest, single run
npm run test:watch # Vitest in watch mode
npm run typecheck  # TypeScript only
```

GitHub Actions runs `typecheck → test → build → deploy` on every push to `main`.

## Architecture (high level)

Layered, dependencies point downward only:

1. **Shell** (`src/app.ts`, `src/shared/components/AppShell.ts`): bootstrap, hash router, top bar.
2. **Features** (`src/features/<id>/`): training modes. Each implements the `Feature` contract (`src/shared/lib/feature.ts`) and lives in its own folder with exactly `index.ts`, `state.ts`, `view.ts`.
3. **Components** (`src/shared/components/`): presentational. Take data, return DOM, emit events. No state, no IO.
4. **Domain** (`src/shared/lib/`): pure music-theory functions and types. No DOM, no IO. Unit-tested.
5. **Services** (`src/shared/services/`): adapters around browser APIs (audio, i18n, settings, PWA, microphone-later).
6. **Data** (`src/data/`): static typed datasets (chord tables, etc.).

A higher layer may import from a lower layer; never the reverse.

## Music notation invariant

**International (Latin) notation only** in data and domain. `root` is `'A' | 'A#' | ...`, `type` is `'' | 'm' | '7' | 'maj7' | 'm7' | 'sus2' | 'sus4' | 'add9'`. No `rootRu`, no `typeName`. Localization is UI-only via `t('chord.type.m')`.

Tone.js note format (`"E2"`, `"A#3"`) is used everywhere — sharps only, no flats.

## Chord shape data invariants

`src/shared/lib/chord.ts: validateChordShape(shape)` enforces:

- `frets` and `fingers` are arrays of length 6 (low-E to high-E).
- `frets[i] === null` means muted, `0` means open, `> 0` means fretted.
- `frets[i] > 0` requires a `fingers[i]`; `frets[i] === null || 0` requires `fingers[i] === null`.
- `notes` is a non-empty array of Tone.js note strings (sharps only).

The validation tests in `src/data/chords-basic.test.ts` and `src/data/chords-extended.test.ts` run on every commit and protect against bad chord edits.

## Adding a new training mode (Feature)

1. Create `src/features/<id>/index.ts`, `state.ts`, `view.ts`.
2. Export a `Feature` object with `id`, `titleKey`, `mount`, `unmount`, optional `onContextChange`.
3. Append it to `src/features/registry.ts`.
4. Add `feature.<id>.title` and any other strings to `ru.ts`, `en.ts`, `uk.ts` dictionaries.

The router auto-renders the new tab. No other wiring required.

## Author rules (LLM-developer-specific)

These are obligations, not suggestions. Following them protects the architecture:

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

Vite `base` is `/GuitarTrainer/` so URLs resolve under the GitHub Pages path. The deploy workflow (`.github/workflows/deploy.yml`) uses `actions/deploy-pages` and runs typecheck + tests before publishing — broken main never reaches Pages.

## What lives where (quick map)

- `src/main.ts` — entry, mounts `startApp()` into `#app`.
- `src/app.ts` — wires shell, services, router, active feature.
- `src/shared/lib/feature.ts` — `Feature` and `FeatureContext` interfaces.
- `src/shared/services/settings.ts` — typed localStorage store with subscribe.
- `src/shared/services/i18n/` — translator + RU/EN/UK dictionaries.
- `src/shared/services/audio.ts` — Tone.js wrapper.
- `src/shared/services/pwa.ts` — service-worker registration.
- `src/data/chords-basic.ts`, `chords-extended.ts` — chord tables.

## Reference docs

- `docs/superpowers/specs/2026-04-25-architecture-design.md` — full architecture spec.
- `docs/superpowers/plans/2026-04-25-architecture-v1.md` — v1 implementation plan (this iteration).
- `docs/design-brief.md` — input handed to Claude Design.
````

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md for new architecture"
```

---

## Task 36: README

**Files:**
- Create: `README.md`

User-facing readme for the GitHub repo.

- [ ] **Step 1: Create `README.md`**

```markdown
# Guitar Trainer

A guitar practice PWA that drills chords (and later: progressions, scales, ear training, microphone-based chord recognition). Statically hosted on GitHub Pages, installable on iOS/Android.

UI in Russian, English, and Ukrainian. Chord notation is international (`A`, `Am`, `F#m7`, `Cmaj7`).

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/GuitarTrainer/
```

## Scripts

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Vite dev server with hot reload                |
| `npm run build`    | Type-check then build production assets        |
| `npm run preview`  | Serve the production build locally             |
| `npm run test`     | Run unit tests once                            |
| `npm run test:watch` | Run unit tests in watch mode                 |
| `npm run typecheck`  | Run TypeScript without emitting               |

## Tech stack

- **Vite** + **TypeScript (strict)** — no UI framework
- **Tone.js** for audio playback
- **vite-plugin-pwa** (Workbox) for service worker + manifest
- **Vitest** for unit tests
- **GitHub Pages** via `actions/deploy-pages`

## Project layout

See `CLAUDE.md` for the architectural map and `docs/superpowers/specs/` for the full design.

## Deployment

Push to `main`. The `Deploy to GitHub Pages` workflow runs typecheck + tests + build, then publishes `dist/` to Pages. The `base` in `vite.config.ts` is `/GuitarTrainer/` — change it if you fork to a different repo name.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Task 37: Cleanup and final smoke test

**Files:**
- Delete: `chord_trainer.html`

- [ ] **Step 1: Run full test suite**

Run: `npm run test`
Expected: all green.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: builds into `dist/`. No warnings other than expected ones (e.g. dynamic import notices).

- [ ] **Step 4: Manual smoke pass**

Run: `npm run preview`

Open `http://localhost:4173/GuitarTrainer/` and verify:

- [ ] App loads, no console errors.
- [ ] Top bar shows title and language/set switches.
- [ ] Tab bar shows "Quiz" and "Browse".
- [ ] Quiz tab: random chord shows; Next picks a different chord; type/shape pills switch correctly; "★" appears on recommended shape (e.g. F major barre).
- [ ] Hide-diagram toggle works; tapping the placeholder reveals the diagram.
- [ ] Play button plays audio after a tap (autoplay-policy gesture).
- [ ] Browse tab: grid renders; clicking a tile shows the detail panel and plays audio; type/shape switchers work.
- [ ] Set switcher: switching basic ↔ extended changes the available chords; quiz prompts and browse grid update.
- [ ] Language switcher: switching RU/EN/UK changes UI text; chord names stay in international notation.
- [ ] Refresh the page: language, set, and last feature persist.
- [ ] DevTools → Application → Manifest: detected; icons listed.
- [ ] DevTools → Application → Service Workers: registered.
- [ ] DevTools → Network → toggle Offline: app still loads.

If any check fails, fix in place before continuing.

- [ ] **Step 5: Delete legacy file**

```bash
rm chord_trainer.html
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: remove legacy chord_trainer.html

The single-file prototype is preserved in git history. The new
Vite + TypeScript app supersedes it."
```

---

## Plan Self-Review

Done after writing the plan, against the spec.

**Spec coverage:**

| Spec section                         | Implementing task(s)        |
| ------------------------------------ | --------------------------- |
| Tech foundation (Vite, TS, etc.)     | Task 1                      |
| Layered architecture (downward deps) | Tasks 4–7 (domain), 8–12 (services), 15–24 (components), 25–27 (data), 28 (feature contract), 30 (shell), 32–33 (features) |
| Music notation principle             | Tasks 5, 26, 27             |
| Folder layout                        | All file-creating tasks     |
| Feature contract                     | Task 28, used in 32–33      |
| PWA foundation                       | Tasks 12, 34                |
| i18n foundation                      | Tasks 9, 10                 |
| Settings store                       | Task 8                      |
| Audio output                         | Task 11                     |
| Design system (placeholder tokens)   | Tasks 13, 14                |
| Routing (hash router)                | Task 30                     |
| TypeScript config                    | Task 1                      |
| Build & deploy                       | Tasks 1, 3                  |
| v1 in-scope items 1–17               | Covered                     |
| Author rules                         | Task 35 (CLAUDE.md)         |

**Placeholder scan:** No "TODO/TBD/implement later" left in steps. Two notes: Task 29 is intentionally a no-op (router lives in Task 30); Task 32 step 3 shows a "broken first version" only as illustration with a clear instruction to use the second version.

**Type consistency:**
- `Feature` interface defined in Task 28; consumed identically in Tasks 32, 33.
- `SettingsStore`, `Translator`, `AudioOutput` types defined in Tasks 8/9/11; consumed identically in Tasks 28, 32, 33.
- `RootEntry`/`ChordTypeEntry`/`FlatChord` defined in Task 7; re-exported in Task 25; consumed in 26/27/32/33.
- `ChordShape`/`Fret`/`Finger`/`ChordType` defined in Tasks 5–6; re-exported in Task 25; consumed in 15/26/27/32.

**Open notes** (non-blocking):
- Real PNG icon assets are placeholders. Replace when Claude Design returns icons.
- The post-design-system integration (Phase 2 in the spec) is not part of this plan; it will get its own plan when Claude Design output arrives.
