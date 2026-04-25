import { rootsForSet } from '../../data/sets';
import { flattenChords, getDefaultShapeIdx, type FlatChord } from '../../shared/lib/music';
import type { ChordSet } from '../../shared/services/settings';

export interface QuizState {
  set: ChordSet;
  current: FlatChord;
  typeIdx: number;
  shapeIdx: number;
  originalTypeIdx: number;
  revealed: boolean;
}

export function pickRandom(set: ChordSet, prev?: FlatChord): FlatChord {
  const flat = flattenChords(rootsForSet(set));
  if (flat.length === 0) throw new Error('empty chord set');
  const pool = prev ? flat.filter(c => !sameChord(c, prev)) : flat;
  // Pool is empty only when the only available chord equals prev — fall back
  // to the full list so the picker still returns something.
  const source = pool.length > 0 ? pool : flat;
  return source[Math.floor(Math.random() * source.length)]!;
}

export function newState(set: ChordSet, prev?: FlatChord): QuizState {
  const current = pickRandom(set, prev);
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
  return newState(state.set, state.current);
}

function sameChord(a: FlatChord, b: FlatChord): boolean {
  return a.root.root === b.root.root && a.type.type === b.type.type;
}
