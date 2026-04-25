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
