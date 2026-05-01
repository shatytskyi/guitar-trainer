import { describe, expect, it } from 'vitest';
import {
  buildScaleFretboardNotes,
  compactScaleFretWindow,
  orderScaleNotesForPlayback,
  pitchClassAt,
  scalePitchClasses,
} from './scale';

const minorPentatonic = [
  { degree: '1', semitones: 0 },
  { degree: 'b3', semitones: 3 },
  { degree: '4', semitones: 5 },
  { degree: '5', semitones: 7 },
  { degree: 'b7', semitones: 10 },
];

describe('scale helpers', () => {
  it('transposes pitch classes from a root', () => {
    expect(pitchClassAt('A', 3)).toBe('C');
    expect(pitchClassAt('B', 2)).toBe('C#');
  });

  it('maps scale degrees to pitch classes', () => {
    expect([...scalePitchClasses('A', minorPentatonic).keys()]).toEqual(['A', 'C', 'D', 'E', 'G']);
  });

  it('builds scale positions on standard tuning', () => {
    const notes = buildScaleFretboardNotes('A', minorPentatonic, { maxFret: 12 });

    expect(notes).toContainEqual(expect.objectContaining({
      id: '0:0',
      note: 'E2',
      degree: '5',
    }));
    expect(notes).toContainEqual(expect.objectContaining({
      id: '1:0',
      note: 'A2',
      degree: '1',
      isRoot: true,
    }));
    expect(notes.some(note => note.note === 'F2')).toBe(false);
  });

  it('finds a compact movable position from the sixth-string root', () => {
    expect(compactScaleFretWindow('A')).toEqual({ minFret: 5, maxFret: 8, rootFret: 5 });
    expect(compactScaleFretWindow('E')).toEqual({ minFret: 0, maxFret: 3, rootFret: 0 });
  });

  it('orders playback low to high or high to low', () => {
    const notes = buildScaleFretboardNotes('A', minorPentatonic, { maxFret: 3 });

    expect(orderScaleNotesForPlayback(notes, 'ascending')[0]?.note).toBe('E2');
    expect(orderScaleNotesForPlayback(notes, 'descending')[0]?.note).toBe('G4');
  });
});
