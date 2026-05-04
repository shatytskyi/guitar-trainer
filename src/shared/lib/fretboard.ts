import { parseNote, transposeNote, type PitchClass } from './note';

export const STANDARD_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] as const;

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'] as const;

export interface FretboardPosition {
  readonly id: string;
  readonly stringIndex: number;
  readonly stringLabel: string;
  readonly fret: number;
  readonly note: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
}

export function buildFretboardPositions(options?: {
  readonly tuning?: readonly string[];
  readonly minFret?: number;
  readonly maxFret?: number;
}): FretboardPosition[] {
  const tuning = options?.tuning ?? STANDARD_TUNING;
  const minFret = options?.minFret ?? 0;
  const maxFret = options?.maxFret ?? 24;
  const positions: FretboardPosition[] = [];

  tuning.forEach((openNote, stringIndex) => {
    for (let fret = minFret; fret <= maxFret; fret += 1) {
      const noteName = transposeNote(openNote, fret);
      const note = parseNote(noteName);
      positions.push({
        id: `${stringIndex}:${fret}`,
        stringIndex,
        stringLabel: STRING_LABELS[stringIndex] ?? openNote,
        fret,
        note: noteName,
        pitchClass: note.pitchClass,
        octave: note.octave,
      });
    }
  });

  return positions;
}

export function filterFretboardPositions(
  positions: readonly FretboardPosition[],
  selectedPitchClasses: ReadonlySet<PitchClass>,
): FretboardPosition[] {
  return positions.filter(position => selectedPitchClasses.has(position.pitchClass));
}
