import { transposeNote, type PitchClass } from '../shared/lib/note';
import type { ChordShape, ChordType, Fret, Finger } from '../shared/lib/chord';
import type { RootEntry, ChordTypeEntry } from '../shared/lib/music';
import { CHORDS_EXTENDED } from './chords-extended';

const ALL_TYPES: readonly ChordType[] = [
  '', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9',
  'dim', 'aug', '6', 'm6', 'dim7', 'm7b5',
  '9', 'm9', 'maj9', '13',
];

const ALL_ROOTS: readonly PitchClass[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

const OPEN_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const;

interface MovableTemplate {
  readonly type: ChordType;
  readonly label: string;
  readonly frets: readonly (number | null)[];
  readonly fingers: readonly Finger[];
}

// E-shape barre (root on the low-E string at fret R).
// A "comfortable" barre lives roughly at frets 1..7; deeper ones we treat as
// less ergonomic but still musically valid for the "all" reference set.
const E_SHAPE: readonly MovableTemplate[] = [
  { type: '',     label: 'barre', frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1] },
  { type: 'm',    label: 'barre', frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1] },
  { type: '7',    label: 'barre', frets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1] },
  { type: 'm7',   label: 'barre', frets: [0, 2, 0, 0, 0, 0], fingers: [1, 3, 1, 1, 1, 1] },
  { type: 'maj7', label: 'barre', frets: [0, 2, 1, 1, 0, 0], fingers: [1, 4, 2, 3, 1, 1] },
  { type: 'sus4', label: 'barre', frets: [0, 2, 2, 2, 0, 0], fingers: [1, 2, 3, 4, 1, 1] },
  { type: '9',    label: 'barre', frets: [0, 2, 0, 1, 0, 2], fingers: [1, 3, 1, 2, 1, 4] },
  { type: 'm9',   label: 'barre', frets: [0, 2, 0, 0, 0, 2], fingers: [1, 3, 1, 1, 1, 4] },
  { type: '13',   label: 'barre', frets: [0, 2, 0, 1, 2, 0], fingers: [1, 3, 1, 2, 4, 1] },
];

// A-shape barre (root on the A string at fret R; low-E muted).
const A_SHAPE: readonly MovableTemplate[] = [
  { type: '',     label: 'barre', frets: [null, 0, 2, 2, 2, 0], fingers: [null, 1, 3, 3, 3, 1] },
  { type: 'm',    label: 'barre', frets: [null, 0, 2, 2, 1, 0], fingers: [null, 1, 3, 4, 2, 1] },
  { type: '7',    label: 'barre', frets: [null, 0, 2, 0, 2, 0], fingers: [null, 1, 3, 1, 4, 1] },
  { type: 'm7',   label: 'barre', frets: [null, 0, 2, 0, 1, 0], fingers: [null, 1, 3, 1, 2, 1] },
  { type: 'maj7', label: 'barre', frets: [null, 0, 2, 1, 2, 0], fingers: [null, 1, 3, 2, 4, 1] },
  { type: 'sus2', label: 'barre', frets: [null, 0, 2, 2, 0, 0], fingers: [null, 1, 2, 3, 1, 1] },
  { type: 'sus4', label: 'barre', frets: [null, 0, 2, 2, 3, 0], fingers: [null, 1, 2, 3, 4, 1] },
  { type: 'add9', label: 'barre', frets: [null, 0, 2, 4, 2, 0], fingers: [null, 1, 2, 4, 3, 1] },
  { type: '6',    label: 'barre', frets: [null, 0, 2, 2, 2, 2], fingers: [null, 1, 3, 3, 3, 3] },
  { type: 'm6',   label: 'barre', frets: [null, 0, null, 2, 1, 2], fingers: [null, 1, null, 3, 2, 4] },
  { type: 'dim',  label: 'barre', frets: [null, 0, 1, 2, 1, null], fingers: [null, 1, 2, 4, 3, null] },
  { type: 'dim7', label: 'barre', frets: [null, 0, 1, 2, 1, 2], fingers: [null, 1, 2, 4, 2, 3] },
  { type: 'm7b5', label: 'barre', frets: [null, 0, 1, 0, 1, null], fingers: [null, 1, 2, 1, 3, null] },
  { type: 'aug',  label: 'barre', frets: [null, 0, null, 2, 2, 1], fingers: [null, 1, null, 2, 3, 4] },
  { type: 'maj9', label: 'barre', frets: [null, 0, 2, 1, 0, 0], fingers: [null, 1, 4, 3, 1, 1] },
  { type: '9',    label: 'barre', frets: [null, 0, 2, 4, 2, 3], fingers: [null, 1, 1, 4, 1, 3] },
  { type: 'm9',   label: 'barre', frets: [null, 0, 2, 0, 1, 3], fingers: [null, 1, 3, 1, 2, 4] },
  { type: '13',   label: 'barre', frets: [null, 0, 2, 0, 2, 2], fingers: [null, 1, 3, 1, 4, 4] },
];

// Map root pitch class → barre fret on each string-anchored shape.
// Low-E open is E (E-shape barre fret = semitone distance from E to the root).
// A open is A (A-shape barre fret = semitone distance from A to the root).
const E_FRET: Record<PitchClass, number> = {
  E: 0, F: 1, 'F#': 2, G: 3, 'G#': 4, A: 5, 'A#': 6, B: 7,
  C: 8, 'C#': 9, D: 10, 'D#': 11,
};
const A_FRET: Record<PitchClass, number> = {
  A: 0, 'A#': 1, B: 2, C: 3, 'C#': 4, D: 5, 'D#': 6, E: 7,
  F: 8, 'F#': 9, G: 10, 'G#': 11,
};

// "Comfort window": prefer barre fret in 1..9. We pick whichever shape
// (E-shape vs A-shape) lands in that window. Both anchors are valid music,
// but a player would rather have C-major as A-shape (fret 3) than E-shape (8).
const COMFORT_MIN = 1;
const COMFORT_MAX = 9;

function comfort(fret: number): number {
  if (fret >= COMFORT_MIN && fret <= COMFORT_MAX) return 0;
  if (fret < COMFORT_MIN) return COMFORT_MIN - fret;
  return fret - COMFORT_MAX;
}

function makeShape(rootFret: number, tpl: MovableTemplate): ChordShape {
  const frets: Fret[] = tpl.frets.map(f => (f === null ? null : f + rootFret));
  // When the absolute fret resolves to an open string, drop the finger —
  // an open string is played with no finger by definition. The template's
  // finger column carries the barre intent; once the barre lands on fret 0
  // there is no barre to make.
  const fingers: Finger[] = frets.map((f, i) => (f === 0 || f === null ? null : tpl.fingers[i] ?? null));
  const notes: string[] = [];
  for (let s = 0; s < 6; s++) {
    const f = frets[s];
    if (f === null || f === undefined) continue;
    notes.push(transposeNote(OPEN_NOTES[s]!, f));
  }
  return { label: tpl.label, frets, fingers, notes };
}

function pickBarre(root: PitchClass, type: ChordType): ChordShape | null {
  const eTpl = E_SHAPE.find(t => t.type === type);
  const aTpl = A_SHAPE.find(t => t.type === type);
  const candidates: { tpl: MovableTemplate; rootFret: number }[] = [];
  if (eTpl) candidates.push({ tpl: eTpl, rootFret: E_FRET[root] });
  if (aTpl) candidates.push({ tpl: aTpl, rootFret: A_FRET[root] });
  if (candidates.length === 0) return null;
  candidates.sort((x, y) => comfort(x.rootFret) - comfort(y.rootFret));
  const best = candidates[0]!;
  return makeShape(best.rootFret, best.tpl);
}

// Index existing hand-curated shapes from the extended set so we can prepend
// them to the generated barre forms (open chords feel better than barre when
// they exist, so we surface them first).
function indexExtended(): Map<PitchClass, Map<ChordType, ChordShape[]>> {
  const m = new Map<PitchClass, Map<ChordType, ChordShape[]>>();
  for (const root of CHORDS_EXTENDED) {
    const inner = new Map<ChordType, ChordShape[]>();
    for (const t of root.types) inner.set(t.type, [...t.shapes]);
    m.set(root.root, inner);
  }
  return m;
}

function buildAll(): RootEntry[] {
  const indexed = indexExtended();
  const out: RootEntry[] = [];
  for (const root of ALL_ROOTS) {
    const types: ChordTypeEntry[] = [];
    for (const type of ALL_TYPES) {
      const curated = indexed.get(root)?.get(type) ?? [];
      // Prefer hand-curated shapes from the extended set when they exist;
      // they cover the most ergonomic open/barre voicings already. Fall back
      // to a generated movable barre only when the extended set has nothing
      // to say about this (root, type) pair — that is the case for the new
      // sharp roots and the new advanced chord qualities.
      const shapes: ChordShape[] = curated.length > 0 ? [...curated] : [];
      if (shapes.length === 0) {
        const barre = pickBarre(root, type);
        if (barre) shapes.push(barre);
      }
      if (shapes.length > 0) types.push({ type, shapes });
    }
    if (types.length > 0) out.push({ root, types });
  }
  return out;
}

export const CHORDS_ALL: readonly RootEntry[] = buildAll();
