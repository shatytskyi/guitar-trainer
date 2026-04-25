import { describe, it, expect } from 'vitest';
import { CHORDS_BASIC } from './chords-basic';
import { validateChordShape } from '../shared/lib/chord';

describe('chords-basic data', () => {
  it('every shape passes validation', () => {
    const errors: string[] = [];
    for (const root of CHORDS_BASIC) {
      for (const type of root.types) {
        for (const shape of type.shapes) {
          const e = validateChordShape(shape);
          if (e.length) errors.push(`${root.root}${type.type} [${shape.label}]: ${e.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
