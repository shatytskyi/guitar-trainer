import { describe, it, expect } from 'vitest';
import { CHORDS_ALL } from './chords-all';
import { validateChordData } from './chord-data-test-utils';

describe('chords-all data', () => {
  it('every shape matches its validation rules and fretted notes', () => {
    expect(validateChordData(CHORDS_ALL)).toEqual([]);
  });

  it('covers all 12 roots', () => {
    expect(CHORDS_ALL.map(r => r.root)).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F',
      'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });

  it('every root has at least the 4 core chord qualities', () => {
    const required = ['', 'm', '7', 'maj7'] as const;
    const missing: string[] = [];
    for (const root of CHORDS_ALL) {
      const present = new Set(root.types.map(t => t.type));
      for (const q of required) {
        if (!present.has(q)) missing.push(`${root.root}: missing ${q || 'major'}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('contains the new advanced types on every root', () => {
    const advanced = ['dim', 'aug', '6', 'm6', 'dim7', 'm7b5', '9', 'm9', 'maj9', '13'] as const;
    const missing: string[] = [];
    for (const root of CHORDS_ALL) {
      const present = new Set(root.types.map(t => t.type));
      for (const q of advanced) {
        if (!present.has(q)) missing.push(`${root.root}${q}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
