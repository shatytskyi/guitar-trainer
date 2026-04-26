import { describe, expect, it } from 'vitest';
import { favoriteIdForShape } from '../shared/lib/favorites';
import { CHORDS_ALL } from './chords-all';
import { resolvedFavoriteChords, rootsForFavorites } from './favorites';

describe('favorite chord data helpers', () => {
  const cRoot = CHORDS_ALL.find(root => root.root === 'C')!;
  const cm7Type = cRoot.types.find(type => type.type === 'm7')!;
  const firstBarre = cm7Type.shapes[0]!;
  const secondBarre = cm7Type.shapes[1]!;

  it('resolves a specific shape even when labels repeat', () => {
    const favorite = favoriteIdForShape(cRoot.root, cm7Type.type, secondBarre);
    const [resolved] = resolvedFavoriteChords([favorite]);

    expect(resolved?.shape).toBe(secondBarre);
    expect(resolved?.shape).not.toBe(firstBarre);
  });

  it('builds root entries containing only favorite shapes', () => {
    const favorite = favoriteIdForShape(cRoot.root, cm7Type.type, secondBarre);
    const roots = rootsForFavorites([favorite]);

    expect(roots).toHaveLength(1);
    expect(roots[0]?.root).toBe('C');
    expect(roots[0]?.types).toHaveLength(1);
    expect(roots[0]?.types[0]?.type).toBe('m7');
    expect(roots[0]?.types[0]?.shapes).toEqual([secondBarre]);
  });
});
