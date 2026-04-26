import { describe, expect, it } from 'vitest';
import { CHORDS_BASIC } from '../../data/chords-basic';
import { CHORDS_EXTENDED } from '../../data/chords-extended';
import { selectRoot, selectType, syncBrowseSet } from './state';

describe('browse state', () => {
  it('keeps an empty selection when the chord set changes', () => {
    const state = { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };
    expect(syncBrowseSet(state, CHORDS_EXTENDED)).toBe(state);
  });

  it('relinks the selected root and type into the new chord set', () => {
    const root = CHORDS_BASIC.find(entry => entry.root === 'A')!;
    const a7State = selectType(selectRoot(root), 2);
    const synced = syncBrowseSet(a7State, CHORDS_EXTENDED);

    expect(synced.selectedRoot).not.toBe(root);
    expect(synced.selectedRoot?.root).toBe('A');
    expect(synced.selectedRoot?.types[synced.typeIdx]?.type).toBe('7');
  });

  it('clears a selected root that does not exist in the new chord set', () => {
    const root = CHORDS_EXTENDED.find(entry => entry.root === 'B')!;
    const synced = syncBrowseSet(selectRoot(root), CHORDS_BASIC);

    expect(synced).toEqual({ selectedRoot: null, typeIdx: 0, shapeIdx: 0 });
  });
});
