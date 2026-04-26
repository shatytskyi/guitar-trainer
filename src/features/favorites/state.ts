import type { ResolvedFavoriteChord } from '../../data/favorites';
import type { PitchClass } from '../../shared/lib/note';

export interface FavoriteChordGroup {
  readonly root: PitchClass;
  readonly items: readonly ResolvedFavoriteChord[];
}

export function groupFavoriteChords(items: readonly ResolvedFavoriteChord[]): FavoriteChordGroup[] {
  const groups: FavoriteChordGroup[] = [];

  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last?.root === item.root.root) {
      (last.items as ResolvedFavoriteChord[]).push(item);
      continue;
    }
    groups.push({ root: item.root.root, items: [item] });
  }

  return groups;
}
