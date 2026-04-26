import { describe, it, expect } from 'vitest';
import { CHORDS_BASIC } from './chords-basic';
import { validateChordData } from './chord-data-test-utils';

describe('chords-basic data', () => {
  it('every shape matches its validation rules and fretted notes', () => {
    expect(validateChordData(CHORDS_BASIC)).toEqual([]);
  });
});
