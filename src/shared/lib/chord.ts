import { PITCH_CLASSES, type PitchClass } from './note';

export const CHORD_TYPES = [
  '', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9',
  'dim', 'aug', '6', 'm6', 'dim7', 'm7b5',
  '9', 'm9', 'maj9', '13',
] as const;

export type ChordType = (typeof CHORD_TYPES)[number];

export interface Chord {
  root: PitchClass;
  type: ChordType;
}

export function chordDisplayName(chord: Chord): string {
  return `${chord.root}${chord.type}`;
}

/** Six entries, low-E to high-E. null = mute, 0 = open, N = fret N. */
export type Fret = number | null;

/** Six entries. 1=index, 2=middle, 3=ring, 4=pinky. null = open/muted/none. */
export type Finger = 1 | 2 | 3 | 4 | null;

/** A shape label like 'open', 'barre', 'mini'. Localized via i18n keys. */
export type ShapeLabel = string;

export interface ChordShape {
  label: ShapeLabel;
  frets: readonly Fret[];
  fingers: readonly Finger[];
  notes: readonly string[];
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
