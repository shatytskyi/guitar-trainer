import { describe, expect, it } from 'vitest';
import { buildFretboardPositions, filterFretboardPositions, STANDARD_TUNING } from './fretboard';
import type { PitchClass } from './note';

describe('fretboard helpers', () => {
  it('uses standard guitar tuning', () => {
    expect(STANDARD_TUNING).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  });

  it('builds open string positions through the 24th fret', () => {
    const positions = buildFretboardPositions();

    expect(positions).toHaveLength(6 * 25);
    expect(positions[0]).toEqual({
      id: '0:0',
      stringIndex: 0,
      stringLabel: 'E',
      fret: 0,
      note: 'E2',
      pitchClass: 'E',
      octave: 2,
    });
    expect(positions).toContainEqual(expect.objectContaining({
      id: '0:24',
      note: 'E4',
      pitchClass: 'E',
      octave: 4,
    }));
    expect(positions).toContainEqual(expect.objectContaining({
      id: '5:24',
      note: 'E6',
      pitchClass: 'E',
      octave: 6,
    }));
  });

  it('filters by pitch class while preserving octave note labels', () => {
    const selected = new Set<PitchClass>(['G']);
    const matches = filterFretboardPositions(
      buildFretboardPositions({ minFret: 0, maxFret: 3 }),
      selected,
    );

    expect(matches.map(position => position.note)).toEqual(['G2', 'G3', 'G4']);
    expect(matches.every(position => position.pitchClass === 'G')).toBe(true);
  });
});
