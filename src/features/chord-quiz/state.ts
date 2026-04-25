import { rootsForSet } from '../../data/sets';
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
