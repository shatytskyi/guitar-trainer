import { validateChordShape } from '../shared/lib/chord';
import { transposeNote } from '../shared/lib/note';
import type { RootEntry } from './types';

const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const;

export function validateChordData(roots: readonly RootEntry[]): string[] {
  const errors: string[] = [];
  for (const root of roots) {
    for (const type of root.types) {
      for (const shape of type.shapes) {
        const name = `${root.root}${type.type} [${shape.label}]`;
        const shapeErrors = validateChordShape(shape);
        if (shapeErrors.length) errors.push(`${name}: ${shapeErrors.join(', ')}`);

        const expectedNotes = notesFromFrets(shape.frets);
        if (!sameNotes(shape.notes, expectedNotes)) {
          errors.push(`${name}: notes ${shape.notes.join(', ')} do not match frets ${expectedNotes.join(', ')}`);
        }
      }
    }
  }
  return errors;
}

function notesFromFrets(frets: readonly (number | null)[]): string[] {
  return frets.flatMap((fret, stringIdx) => {
    if (fret == null) return [];
    const openNote = STANDARD_TUNING[stringIdx];
    return openNote ? [transposeNote(openNote, fret)] : [];
  });
}

function sameNotes(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((note, idx) => note === b[idx]);
}
