import { describe, expect, it } from 'vitest';
import { favoriteIdForShape } from '../../shared/lib/favorites';
import { CHORDS_BASIC } from '../../data/chords-basic';
import { resolvedFavoriteChords } from '../../data/favorites';
import { groupFavoriteChords } from './state';

describe('favorite chord state', () => {
  it('groups resolved favorites by root in data order', () => {
    const cRoot = CHORDS_BASIC.find(root => root.root === 'C')!;
    const dRoot = CHORDS_BASIC.find(root => root.root === 'D')!;
    const favorites = [
      favoriteIdForShape(cRoot.root, cRoot.types[0]!.type, cRoot.types[0]!.shapes[0]!),
      favoriteIdForShape(cRoot.root, cRoot.types[1]!.type, cRoot.types[1]!.shapes[0]!),
      favoriteIdForShape(dRoot.root, dRoot.types[0]!.type, dRoot.types[0]!.shapes[0]!),
    ];

    const groups = groupFavoriteChords(resolvedFavoriteChords(favorites, CHORDS_BASIC));

    expect(groups.map(group => group.root)).toEqual(['C', 'D']);
    expect(groups[0]?.items).toHaveLength(2);
    expect(groups[1]?.items).toHaveLength(1);
  });
});
