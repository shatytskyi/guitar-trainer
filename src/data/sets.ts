import { CHORDS_BASIC } from './chords-basic';
import { CHORDS_EXTENDED } from './chords-extended';
import { CHORDS_ALL } from './chords-all';
import { rootsForFavorites } from './favorites';
import type { RootEntry } from './types';
import type { ChordSet } from '../shared/services/settings';
import type { FavoriteChordShapeId } from '../shared/lib/favorites';

export function rootsForSet(
  set: ChordSet,
  favorites: readonly FavoriteChordShapeId[] = [],
): readonly RootEntry[] {
  if (set === 'basic') return CHORDS_BASIC;
  if (set === 'extended') return CHORDS_EXTENDED;
  if (set === 'favorites') return rootsForFavorites(favorites);
  return CHORDS_ALL;
}
