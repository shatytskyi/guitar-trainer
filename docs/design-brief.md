# Guitar Trainer — Design Brief

This document is intended as input for [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs).
It describes the product, audience, and visual direction so that the
generated design system aligns with the project's identity.

## Product

A web-based guitar practice app — a personal trainer that drills chords,
chord progressions, scales, and ear-training. Long-term plan includes
real-time chord recognition through the device microphone.

The app is **installable as a PWA** and runs primarily on **mobile**
(Android and iOS). Desktop should also look good but the design
priority is touch-first and one-handed use on a phone propped on a
guitar stand.

There is no account, no server, no social features. The user is alone
with their guitar.

## Audience

- One primary user (the developer himself) and people in similar shoes:
  hobbyist guitarists at beginner-to-intermediate level.
- Multilingual: Russian, English, Ukrainian.
- Comfortable with international chord notation (`A`, `Am`, `F#m7`,
  `Cmaj7`). Notes are never spelled out as "до", "ре", "mi" — only Latin.

## Voice and feeling

The current prototype (`chord_trainer.html`) sets a strong direction
that should be preserved as the *default* aesthetic — Claude Design can
refine it, but the brand should not lose this character:

- **Warm paper, vintage notebook.** Cream/beige background with subtle
  noise texture. Dark ink-brown foreground. Restrained accent in
  rust-red. Ornamental gold for highlights.
- **Two type voices.** A serif display face (currently *Fraunces*) for
  chord names and titles, with the option of an *italic accent* used
  for punctuation/branding. A monospace face (currently *JetBrains Mono*)
  for chips, labels, meta, fret numbers — anything tabular or technical.
- **Hand-crafted, not flat-design.** Soft shadows, dashed inner borders,
  subtle paper grain. Not skeuomorphic, but tactile.
- **Calm, focused.** No animations beyond purposeful transitions.
  No bright candy colors, no gradients-everywhere. The app is a music
  practice space.

## Layout characteristics

- **Mobile-first:** primary viewport ~375–430 px wide.
- **Single column** of content with a top bar and a bottom set of
  controls. No side panels.
- **Generous central focus area** ("Stage") — chord name + diagram is
  the hero.
- **Compact controls.** Pills, toggles, small icon buttons. Labels in
  uppercase monospace with wide letter-spacing.

## Functional needs (not a directive component list)

The product needs UI for the responsibilities below. **You have full
creative latitude** in how to organize these into components — names,
groupings, prop APIs are yours to define. The list below is "what jobs
need to be done", not "what components must exist".

- A page frame that works as an installed PWA on iOS (safe-area aware).
- A header area showing the app title, the chosen language, and the
  active chord set ("basic" / "extended").
- A tab strip for switching between training modes.
- A central "stage" that visually anchors the chord being worked on —
  this is the most important surface in the app.
- A way to display a chord's name (large), its metadata (small/secondary),
  switchers between chord types and shape variants, the fretboard
  diagram, and primary controls (Play, Next).
- A grid of root notes that the user picks from in browse mode, each
  showing the note and its available chord types at a glance.
- An SVG fretboard diagram with strings, frets, finger dots, barres,
  mute/open markers above the nut, and an optional "5fr" label when
  the chord is shifted up the neck.
- A tap-to-reveal placeholder for the quiz mode (the diagram is hidden
  by default; user taps to reveal).
- Compact toggle controls (currently realized as monospace pills and
  an iOS-style switch — feel free to reinterpret).
- Primary, secondary, and icon-only actions.
- A non-blocking notification surface (used at minimum for the PWA
  "update available" prompt).

## What we ask from Claude Design

1. **A token system** delivered as CSS variables (or a format trivially
   convertible to CSS variables). Use **semantic names** (e.g. `surface`,
   `accent`) rather than raw color scales.
2. **A component taxonomy** that covers the functional needs above —
   the granularity, naming, and composition are your call. If a single
   polymorphic `Button` with variants serves better than multiple
   button components, propose that.
3. **Visual states** for every interactive component: default, hover,
   active/pressed, disabled, focus-visible.
4. **Iconography direction** — line weight, corner style, sizing rules.
   A full icon set is not required in the first pass.
5. **Optional second theme** (e.g. dark "stage" mode) if it falls out
   naturally. Not required.

## Hard constraints

- Use **CSS variables** (no CSS-in-JS, no runtime style engine).
- **Mobile-first**, viewport min ~360 px.
- Preserve the warm-paper / vintage-notebook *character* — it's the
  product's identity. You may evolve it, but the app should not end up
  looking like a generic SaaS.
- International note naming only (`A`, `Am`, `Cmaj7`).

## What we explicitly do not want

- A flashy, generic SaaS look (drop shadows everywhere, gradients,
  blue-and-purple).
- Material You / iOS Human Interface clones — the app should feel
  like *itself*, not like a system app.
- Branded-illustration-heavy treatments. Diagrams and notation are
  the imagery.
- Non-international note naming. Stick to Latin chord notation only.

## Reference

The starting point is `chord_trainer.html` at the repo root and the
architecture spec at `docs/superpowers/specs/2026-04-25-architecture-design.md`.
The design system replaces `src/styles/tokens.css` and may augment
`src/shared/components/` with refined component implementations.
