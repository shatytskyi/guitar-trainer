import { describe, it, expect } from 'vitest';
import {
  PITCH_CLASSES,
  parseNote,
  formatNote,
  transposeNote,
  type Note,
} from './note';

describe('PITCH_CLASSES', () => {
  it('lists 12 pitch classes starting at C with sharps only', () => {
    expect(PITCH_CLASSES).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F',
      'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });
});

describe('parseNote', () => {
  it('parses natural note', () => {
    expect(parseNote('E2')).toEqual({ pitchClass: 'E', octave: 2 });
  });

  it('parses sharp note', () => {
    expect(parseNote('A#3')).toEqual({ pitchClass: 'A#', octave: 3 });
  });

  it('throws on invalid input', () => {
    expect(() => parseNote('H4')).toThrow();
    expect(() => parseNote('Eb2')).toThrow();
    expect(() => parseNote('E')).toThrow();
  });
});

describe('formatNote', () => {
  it('round-trips parseNote', () => {
    const n: Note = { pitchClass: 'F#', octave: 4 };
    expect(formatNote(n)).toBe('F#4');
    expect(parseNote(formatNote(n))).toEqual(n);
  });
});

describe('transposeNote', () => {
  it('transposes up within an octave', () => {
    expect(transposeNote('C4', 4)).toBe('E4');
  });

  it('crosses octave boundary going up', () => {
    expect(transposeNote('A4', 3)).toBe('C5');
  });

  it('crosses octave boundary going down', () => {
    expect(transposeNote('C4', -1)).toBe('B3');
  });

  it('handles 12 semitones as exact octave shift', () => {
    expect(transposeNote('E2', 12)).toBe('E3');
    expect(transposeNote('E2', -12)).toBe('E1');
  });

  it('handles sharps consistently', () => {
    expect(transposeNote('A#3', 1)).toBe('B3');
    expect(transposeNote('B3', 1)).toBe('C4');
  });
});
