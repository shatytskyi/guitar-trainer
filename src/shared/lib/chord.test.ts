import { describe, it, expect } from 'vitest';
import {
  CHORD_TYPES,
  chordDisplayName,
  validateChordShape,
  type Chord,
  type ChordShape,
} from './chord';

describe('CHORD_TYPES', () => {
  it('lists known chord type suffixes', () => {
    expect(CHORD_TYPES).toContain('');
    expect(CHORD_TYPES).toContain('m');
    expect(CHORD_TYPES).toContain('7');
    expect(CHORD_TYPES).toContain('maj7');
    expect(CHORD_TYPES).toContain('m7');
    expect(CHORD_TYPES).toContain('sus2');
    expect(CHORD_TYPES).toContain('sus4');
    expect(CHORD_TYPES).toContain('add9');
  });
});

describe('chordDisplayName', () => {
  it('renders major as the bare root', () => {
    const c: Chord = { root: 'A', type: '' };
    expect(chordDisplayName(c)).toBe('A');
  });

  it('appends the type suffix', () => {
    const cases: Array<[Chord, string]> = [
      [{ root: 'A', type: 'm' }, 'Am'],
      [{ root: 'F#', type: 'm' }, 'F#m'],
      [{ root: 'C', type: 'maj7' }, 'Cmaj7'],
      [{ root: 'D', type: 'sus4' }, 'Dsus4'],
    ];
    for (const [chord, expected] of cases) {
      expect(chordDisplayName(chord)).toBe(expected);
    }
  });
});

const validShape: ChordShape = {
  label: 'open',
  frets: [null, 0, 2, 2, 1, 0],
  fingers: [null, null, 2, 3, 1, null],
  notes: ['A2', 'E3', 'A3', 'C4', 'E4'],
};

describe('validateChordShape', () => {
  it('accepts a valid open shape', () => {
    expect(validateChordShape(validShape)).toEqual([]);
  });

  it('rejects frets array of wrong length', () => {
    const bad = { ...validShape, frets: [0, 2, 2, 1, 0] } as unknown as ChordShape;
    expect(validateChordShape(bad)).toContain('frets must be an array of 6');
  });

  it('rejects fingers array of wrong length', () => {
    const bad = { ...validShape, fingers: [null, 1] } as unknown as ChordShape;
    expect(validateChordShape(bad)).toContain('fingers must be an array of 6');
  });

  it('requires a finger for every fretted string', () => {
    const bad: ChordShape = {
      ...validShape,
      frets: [null, 0, 2, 2, 1, 0],
      fingers: [null, null, null, 3, 1, null],
    };
    expect(validateChordShape(bad)).toContain('string 2 fretted but no finger');
  });

  it('rejects a finger on an open or muted string', () => {
    const bad: ChordShape = {
      ...validShape,
      frets: [null, 0, 2, 2, 1, 0],
      fingers: [null, 1, 2, 3, 1, null],
    };
    expect(validateChordShape(bad)).toContain('string 1 has finger but no fret');
  });

  it('requires non-empty notes array', () => {
    const bad: ChordShape = { ...validShape, notes: [] };
    expect(validateChordShape(bad)).toContain('notes must be a non-empty array');
  });

  it('rejects notes not in Tone.js sharp form', () => {
    const bad: ChordShape = { ...validShape, notes: ['A2', 'Eb3'] };
    expect(validateChordShape(bad)).toContain('note "Eb3" is not in sharp-only form');
  });
});
