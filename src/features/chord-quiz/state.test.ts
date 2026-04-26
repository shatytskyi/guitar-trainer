import { describe, expect, it } from 'vitest';
import { CHORDS_BASIC } from '../../data/chords-basic';
import { favoriteIdForShape } from '../../shared/lib/favorites';
import { newState, syncQuizSet } from './state';

describe('quiz state', () => {
  it('keeps the same state object when the chord set is unchanged', () => {
    const state = newState('basic');
    expect(syncQuizSet(state, 'basic', [])).toBe(state);
  });

  it('moves to the requested chord set when settings change sets', () => {
    const state = newState('basic');
    expect(syncQuizSet(state, 'extended', []).set).toBe('extended');
  });

  it('allows an empty favorites set without throwing', () => {
    const state = newState('favorites', []);
    expect(state.current).toBeNull();
  });

  it('picks from favorite chord shapes when the favorite set is active', () => {
    const root = CHORDS_BASIC.find(entry => entry.root === 'F')!;
    const type = root.types[0]!;
    const shape = type.shapes[1]!;
    const favorite = favoriteIdForShape(root.root, type.type, shape);

    const state = newState('favorites', [favorite]);

    expect(state.current?.root.root).toBe('F');
    expect(state.current?.type.type).toBe('');
    expect(state.current?.type.shapes[state.shapeIdx]).toEqual(shape);
  });
});
