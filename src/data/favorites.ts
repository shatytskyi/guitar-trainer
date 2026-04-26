import { CHORDS_BASIC } from './chords-basic';
import { CHORDS_EXTENDED } from './chords-extended';
import { CHORDS_ALL } from './chords-all';
import type { ChordShape } from '../shared/lib/chord';
import {
  favoriteIdForShape,
  favoriteKey,
  type FavoriteChordShapeId,
} from '../shared/lib/favorites';
import type { ChordTypeEntry, RootEntry } from './types';

const FAVORITE_SOURCE_ROOTS = mergeFavoriteSources([CHORDS_ALL, CHORDS_EXTENDED, CHORDS_BASIC]);

export interface ResolvedFavoriteChord {
  readonly id: FavoriteChordShapeId;
  readonly root: RootEntry;
  readonly type: ChordTypeEntry;
  readonly shape: ChordShape;
  readonly typeIdx: number;
  readonly shapeIdx: number;
}

export function resolveFavoriteChord(
  id: FavoriteChordShapeId,
  roots: readonly RootEntry[] = FAVORITE_SOURCE_ROOTS,
): ResolvedFavoriteChord | null {
  const key = favoriteKey(id);
  for (const root of roots) {
    for (const [typeIdx, type] of root.types.entries()) {
      for (const [shapeIdx, shape] of type.shapes.entries()) {
        const candidate = favoriteIdForShape(root.root, type.type, shape);
        if (favoriteKey(candidate) === key) {
          return { id: candidate, root, type, shape, typeIdx, shapeIdx };
        }
      }
    }
  }
  return null;
}

export function resolvedFavoriteChords(
  favorites: readonly FavoriteChordShapeId[],
  roots: readonly RootEntry[] = FAVORITE_SOURCE_ROOTS,
): ResolvedFavoriteChord[] {
  const favoriteKeys = new Set(favorites.map(favoriteKey));
  const out: ResolvedFavoriteChord[] = [];
  for (const root of roots) {
    for (const [typeIdx, type] of root.types.entries()) {
      for (const [shapeIdx, shape] of type.shapes.entries()) {
        const id = favoriteIdForShape(root.root, type.type, shape);
        if (favoriteKeys.has(favoriteKey(id))) {
          out.push({ id, root, type, shape, typeIdx, shapeIdx });
        }
      }
    }
  }
  return out;
}

export function rootsForFavorites(
  favorites: readonly FavoriteChordShapeId[],
  roots: readonly RootEntry[] = FAVORITE_SOURCE_ROOTS,
): RootEntry[] {
  const favoriteKeys = new Set(favorites.map(favoriteKey));
  const out: RootEntry[] = [];

  for (const root of roots) {
    const types: ChordTypeEntry[] = [];
    for (const type of root.types) {
      const shapes = type.shapes.filter(shape => {
        const id = favoriteIdForShape(root.root, type.type, shape);
        return favoriteKeys.has(favoriteKey(id));
      });
      if (shapes.length > 0) types.push({ type: type.type, shapes });
    }
    if (types.length > 0) out.push({ root: root.root, types });
  }

  return out;
}

function mergeFavoriteSources(sources: readonly (readonly RootEntry[])[]): RootEntry[] {
  const roots: RootEntry[] = [];
  const rootIndex = new Map<string, ChordTypeEntry[]>();
  const seen = new Set<string>();

  for (const source of sources) {
    for (const sourceRoot of source) {
      let types = rootIndex.get(sourceRoot.root);
      if (!types) {
        types = [];
        rootIndex.set(sourceRoot.root, types);
        roots.push({ root: sourceRoot.root, types });
      }

      for (const sourceType of sourceRoot.types) {
        let type = types.find(candidate => candidate.type === sourceType.type);
        if (!type) {
          type = { type: sourceType.type, shapes: [] };
          types.push(type);
        }

        const shapes = type.shapes as ChordShape[];
        for (const shape of sourceType.shapes) {
          const key = favoriteKey(favoriteIdForShape(sourceRoot.root, sourceType.type, shape));
          if (seen.has(key)) continue;
          seen.add(key);
          shapes.push(shape);
        }
      }
    }
  }

  return roots;
}
