import { describe, it, expect } from 'vitest';
import { CHORDS_EXTENDED } from './chords-extended';
import { validateChordData } from './chord-data-test-utils';

describe('chords-extended data', () => {
  it('every shape matches its validation rules and fretted notes', () => {
    expect(validateChordData(CHORDS_EXTENDED)).toEqual([]);
  });
});
