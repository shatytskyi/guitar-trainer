import { CHORD_TYPES, type ChordShape, type ChordType, type Fret } from './chord';
import { PITCH_CLASSES, type PitchClass } from './note';

export interface FavoriteChordShapeId {
  readonly root: PitchClass;
  readonly type: ChordType;
  readonly shapeLabel: string;
  readonly frets: readonly Fret[];
}

const CHORD_TYPE_SET = new Set<string>(CHORD_TYPES);
const PITCH_CLASS_SET = new Set<string>(PITCH_CLASSES);

export function favoriteIdForShape(
  root: PitchClass,
  type: ChordType,
  shape: ChordShape,
): FavoriteChordShapeId {
  return {
    root,
    type,
    shapeLabel: shape.label,
    frets: [...shape.frets],
  };
}

export function favoriteKey(id: FavoriteChordShapeId): string {
  return `${id.root}|${id.type}|${id.shapeLabel}|${fretSignature(id.frets)}`;
}

export function fretSignature(frets: readonly Fret[]): string {
  return frets.map(fret => fret == null ? 'x' : String(fret)).join(',');
}

export function sameFavoriteChordShape(
  a: FavoriteChordShapeId,
  b: FavoriteChordShapeId,
): boolean {
  return favoriteKey(a) === favoriteKey(b);
}

export function isFavoriteChordShapeId(v: unknown): v is FavoriteChordShapeId {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r['root'] === 'string' &&
    PITCH_CLASS_SET.has(r['root']) &&
    typeof r['type'] === 'string' &&
    CHORD_TYPE_SET.has(r['type']) &&
    typeof r['shapeLabel'] === 'string' &&
    r['shapeLabel'].length > 0 &&
    Array.isArray(r['frets']) &&
    r['frets'].length === 6 &&
    r['frets'].every(isStoredFret)
  );
}

function isStoredFret(v: unknown): v is Fret {
  return v === null || (typeof v === 'number' && Number.isInteger(v) && v >= 0);
}
