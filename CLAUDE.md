# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Single-file HTML application: a Russian-language guitar chord trainer (Тренажёр аккордов).
Everything lives in `chord_trainer.html` — markup, styles, data, and logic in one file.

- **No build step.** No `package.json`, no bundler, no transpilation.
- **No local dependencies.** Tone.js loads from cdnjs; Google Fonts loads from fonts.googleapis.
- **Target deployment:** GitHub Pages (static hosting). The file is designed to be drop-in deployable — open it from disk or serve it as `index.html`.

When the user is ready to publish, the standard path is to rename `chord_trainer.html` → `index.html` (or add a redirect) and push to a `gh-pages` branch / `main` with Pages enabled. Don't introduce a build pipeline unless the user explicitly asks — the "no build" property is a load-bearing design choice.

## Running and developing

There is no test command, no lint command, and no build command.

- **Just open it:** `open chord_trainer.html` works for most development. The `file://` origin is fine; Tone.js and Google Fonts are loaded over HTTPS from CDNs and there are no fetch/CORS calls.
- **For audio debugging on stricter browsers**, serve via a local HTTP server: `python3 -m http.server 8000` or `npx serve .` from the project root, then visit `http://localhost:8000/chord_trainer.html`.
- **Validation runs at startup.** `validateChordData()` logs any malformed chord entries to the console — always check the browser console after editing the chord data tables.

## Architecture

The `<script>` block is divided into 8 banner-commented sections. The header comment in `chord_trainer.html` (lines 1–62) is authoritative; read it before making structural changes.

**Section layout inside the `<script>`:**

1. `CONSTANTS` — `DIAGRAM` geometry, `AUDIO_CONFIG`, `SHAPE_NAMES` display labels.
2. `CHORD DATA` — `ROOTS_BASIC` (15 essentials) and `ROOTS_EXTENDED` (~40) parallel datasets.
3. `DATA HELPERS` — `chordName`, `chordNameRu`, `getDefaultShapeIdx`, `flattenChords`, `validateChordData`.
4. `SVG DIAGRAM RENDERER` — `renderDiagram(shape)` is a pure string-building function (no DOM, no side effects).
5. `AUDIO` — Tone.js wrapper, lazy-initialized on first `playShape` call.
6. `QUIZ MODE` — random chord prompt with reveal-on-tap. State: `quizRoot`, `quizTypeIdx`, `quizShapeIdx`, `originalTypeIdx`, `diagramRevealed`, `hideDiagram`.
7. `BROWSE MODE` — grid of root tiles + detail panel. State: `selectedRoot`, `selectedTypeIdx`, `selectedShapeIdx`. Auto-plays audio on every selection change.
8. `WIRING` — set/mode switchers and initial render.

### Data model

The shape of every chord entry:

```
Root  ─┬─ Type "major"  ─┬─ Shape "open"  (frets[6], fingers[6], notes[], label, recommended?)
       │                 └─ Shape "barre" ...
       └─ Type "minor"   ─── Shape ...
```

**Inviolable invariants** — `validateChordData()` checks these and the diagram renderer assumes them:

- `frets` is **always** an array of exactly 6 integers, low-E to high-E. `null` = mute (×), `0` = open (○), `N` = press fret N.
- `fingers` is **always** an array of exactly 6 entries (1=index, 2=middle, 3=ring, 4=pinky, `null`=open/muted/no finger).
- A fretted string (`fret > 0`) must have a finger; a muted/open string must have `null` finger.
- `notes` is the playback array (e.g. `"E2"`, `"A#3"`) — sharps only, no flats — and is ordered low-to-high for the strum effect (each note is offset by `AUDIO_CONFIG.strumDelay` seconds).
- `label` is one of the keys in `SHAPE_NAMES` (currently `open`, `barre`, `mini`); add a new key there before introducing a new shape style.
- `recommended: true` on a shape makes it the default selection (e.g. F major defaults to barre, not the awkward mini version).

### Two parallel datasets

`ROOTS_BASIC` and `ROOTS_EXTENDED` are independent — the same chord (e.g. `C major open`) is duplicated in both. When fixing a chord, update both arrays unless the change is intentionally only for one set. The set switcher (`basic` / `+ расшир.`) swaps `activeRoots`/`activeAllChords` and forces a re-render of both modes.

### Diagram auto-features

`renderDiagram()` automatically:

- **Detects barres** by grouping fingerings on the same `(finger, fret)` — 2+ strings sharing a finger at the same fret render as a horizontal bar instead of separate dots.
- **Shifts up the neck** when any played fret > `DIAGRAM.maxFretInOpenPosition` (default 4). It then shows a `Nfr` label instead of the nut bar.

If you change `DIAGRAM.maxFretInOpenPosition`, retest barre chords near the threshold.

### Audio lazy-init

`Tone.start()` requires a user gesture (browser autoplay policy). `initAudio()` is awaited inside `playShape()`, so the first ▶ Play tap is the gesture. Don't call `initAudio()` at module load — it will fail silently in some browsers.

### Quiz vs Browse state

The two modes maintain independent state. There's no shared "current chord" object. Switching modes via the mode buttons doesn't carry selection across — that's intentional (quiz is a prompt, browse is exploration).

`originalTypeIdx` in quiz mode tracks the type that was randomly drawn so the gold-ring hint stays on the original pill while the user explores siblings.

## Adding a new chord

1. Find the right root in `ROOTS_BASIC` and/or `ROOTS_EXTENDED` (or add a new root entry — keep `root` Latin and `rootRu` Russian).
2. Add a type entry. The display name is `root.root + type.type` (so `root="A"` + `type="m7"` → `Am7`); leave `type=""` for the major chord.
3. Add at least one shape obeying the invariants above. Reference a real chord chart for accurate frets/fingers/notes.
4. Reload the page and check the browser console — `validateChordData()` will list any structural problems.

## Localization

User-facing strings are Russian and live inline in HTML and in the `typeName`/`rootRu`/`SHAPE_NAMES` data fields. There is no i18n layer. Code, comments, and identifiers are English (per global instructions).

## Theming

Palette is driven by CSS variables on `:root` (`--paper`, `--ink`, `--accent`, etc.). The "warm-paper / vintage-notebook" aesthetic uses a noise-texture SVG data-URI as the body background — preserve this when restyling unless the user wants a different look.
