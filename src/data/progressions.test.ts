import { describe, expect, it } from 'vitest';
import { CHORDS_ALL } from './chords-all';
import { CHORD_LOOPS } from './progressions';
import { getDefaultShapeIdx } from '../shared/lib/music';

describe('chord progression data', () => {
  it('uses unique ids', () => {
    const ids = CHORD_LOOPS.map(loop => loop.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps loops short enough for muscle-memory practice', () => {
    for (const loop of CHORD_LOOPS) {
      expect(loop.chords.length).toBeGreaterThanOrEqual(2);
      expect(loop.chords.length).toBeLessThanOrEqual(4);
    }
  });

  it('references chords that have playable shapes', () => {
    for (const loop of CHORD_LOOPS) {
      for (const chord of loop.chords) {
        const root = CHORDS_ALL.find(entry => entry.root === chord.root);
        const type = root?.types.find(entry => entry.type === chord.type);
        if (!type) throw new Error(`${loop.id}: ${chord.root}${chord.type} is missing`);
        const shape = type.shapes[getDefaultShapeIdx(type)];
        if (!shape) throw new Error(`${loop.id}: ${chord.root}${chord.type} has no default shape`);
        expect(shape.notes.length).toBeGreaterThan(0);
      }
    }
  });
});
