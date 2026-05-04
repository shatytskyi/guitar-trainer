# Note Finder Design

## Goal

Add a note finder feature for mapping pitch classes across the full guitar fretboard. A learner can select one or more notes without octave labels, then see every matching position from open strings through the 24th fret.

## Scope

- Add a new `note-finder` feature and expose it in the main tab bar.
- Use standard guitar tuning: `E2 A2 D3 G3 B3 E4`.
- Display frets `0` through `24`.
- Let users select any combination of the 12 pitch classes: `C C# D D# E F F# G G# A A# B`.
- Match selected notes by pitch class only.
- Render matched positions with full note names including octave, for example `G3`.
- Use distinct highlight colors when more than one pitch class is selected.
- Keep the fretboard horizontally scrollable and avoid vertical scrolling inside the fretboard area.
- Fix the existing scales fretboard so it does not create vertical scroll inside its fretboard window. If space is tight, the fretboard should become more compact instead of requiring vertical scrolling.

## User Experience

The screen is a compact practice tool, not a lesson page. It should open directly into the useful state:

- a short note selector at the top;
- a full-width fretboard area below it;
- no explanatory copy beyond labels needed for accessibility and localization.

The selector uses checkbox-style controls so multiple notes can stay active. Each selected pitch class receives a stable visual color, and all matching fretboard markers use that color. When no notes are selected, the fretboard still shows strings and fret numbers, but no note markers.

The fretboard scrolls horizontally from fret `0` to fret `24`. Vertically, all six strings and the fret header must fit inside the available viewport. On smaller screens, the cell height, note marker size, and text size can scale down within defined limits.

## Architecture

Create `src/features/note-finder/` with the standard feature structure:

- `index.ts` wires the feature into the app shell.
- `state.ts` owns selected pitch classes and pure state transitions.
- `view.ts` mounts the selector and fretboard.

Add shared domain logic for fretboard positions rather than embedding calculations in the view. The existing note utilities already provide pitch classes, parsing, and transposition. New logic should reuse those utilities and standard tuning.

Add a dedicated fretboard component for note finding. The existing `ScaleFretboard` is specific to scale degrees and playback state, so sharing its DOM component directly would add unnecessary branching. Shared constants or helpers are fine.

## Localization

Add dictionary keys for the new tab title, selector label, selected-note accessibility text, and fretboard note labels in Russian, English, and Ukrainian.

## Styling

Reuse existing design tokens from `src/styles/tokens.css`. The new layout should match the current compact mobile-first style:

- no nested cards;
- fixed, responsive fretboard dimensions;
- horizontal overflow only for the fretboard rail;
- stable marker sizes so selecting notes does not shift the grid.

For the scales fix, update the existing scale fretboard CSS so the grid fits vertically in its stage. Prefer CSS variables and responsive constraints over DOM changes unless the component needs a small sizing hook.

## Testing

Add focused Vitest coverage for pure state and fretboard-note generation:

- toggling selected pitch classes;
- preserving selected-note order or stable color assignment;
- generating standard-tuning positions from fret `0` through `24`;
- matching by pitch class while preserving octave labels.

Do not run tests or builds unless explicitly requested.
