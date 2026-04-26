import { rootsForSet } from '../../data/sets';
import {
  flattenChords,
  getDefaultShapeIdx,
  type FlatChord,
  type RootEntry,
} from '../../shared/lib/music';
import type { FavoriteChordShapeId } from '../../shared/lib/favorites';
import type { ChordSet } from '../../shared/services/settings';

export interface QuizPick extends FlatChord {
  readonly shapeIdx: number;
}

export interface QuizState {
  set: ChordSet;
  current: QuizPick | null;
  typeIdx: number;
  shapeIdx: number;
  originalTypeIdx: number;
  revealed: boolean;
}

export function pickRandom(
  set: ChordSet,
  favorites: readonly FavoriteChordShapeId[] = [],
  prev?: QuizPick | null,
): QuizPick | null {
  const roots = rootsForSet(set, favorites);
  const flat = set === 'favorites' ? flattenFavoritePicks(roots) : flattenDefaultPicks(roots);
  if (flat.length === 0) return null;
  const pool = prev ? flat.filter(c => !samePick(c, prev)) : flat;
  // Pool is empty only when the only available chord equals prev — fall back
  // to the full list so the picker still returns something.
  const source = pool.length > 0 ? pool : flat;
  return source[Math.floor(Math.random() * source.length)]!;
}

export function newState(
  set: ChordSet,
  favorites: readonly FavoriteChordShapeId[] = [],
  prev?: QuizPick | null,
): QuizState {
  const current = pickRandom(set, favorites, prev);
  if (!current) {
    return {
      set,
      current: null,
      typeIdx: 0,
      shapeIdx: 0,
      originalTypeIdx: 0,
      revealed: false,
    };
  }
  const typeIdx = current.root.types.indexOf(current.type);
  return {
    set,
    current,
    typeIdx,
    shapeIdx: current.shapeIdx,
    originalTypeIdx: typeIdx,
    revealed: false,
  };
}

export function nextChord(
  state: QuizState,
  favorites: readonly FavoriteChordShapeId[] = [],
): QuizState {
  return newState(state.set, favorites, state.current);
}

export function syncQuizSet(
  state: QuizState,
  set: ChordSet,
  favorites: readonly FavoriteChordShapeId[] = [],
): QuizState {
  if (state.set !== set) return newState(set, favorites, state.current);
  if (set === 'favorites') return syncFavoriteState(state, favorites);
  return state;
}

function flattenDefaultPicks(roots: readonly RootEntry[]): QuizPick[] {
  return flattenChords(roots).map(chord => ({
    ...chord,
    shapeIdx: getDefaultShapeIdx(chord.type),
  }));
}

function flattenFavoritePicks(roots: readonly RootEntry[]): QuizPick[] {
  const out: QuizPick[] = [];
  for (const chord of flattenChords(roots)) {
    chord.type.shapes.forEach((_shape, shapeIdx) => {
      out.push({ ...chord, shapeIdx });
    });
  }
  return out;
}

function syncFavoriteState(
  state: QuizState,
  favorites: readonly FavoriteChordShapeId[],
): QuizState {
  const candidates = flattenFavoritePicks(rootsForSet('favorites', favorites));
  if (!state.current) {
    return candidates.length > 0 ? newState(state.set, favorites, state.current) : state;
  }
  const previous = state.current;
  const current = candidates.find(candidate => samePick(candidate, previous));
  if (!current) return newState(state.set, favorites, state.current);
  const typeIdx = current.root.types.indexOf(current.type);
  return {
    ...state,
    current,
    typeIdx,
    shapeIdx: current.shapeIdx,
  };
}

function samePick(a: QuizPick, b: QuizPick): boolean {
  const aShape = a.type.shapes[a.shapeIdx];
  const bShape = b.type.shapes[b.shapeIdx];
  return (
    a.root.root === b.root.root &&
    a.type.type === b.type.type &&
    aShape?.label === bShape?.label &&
    aShape?.frets.join(',') === bShape?.frets.join(',')
  );
}
