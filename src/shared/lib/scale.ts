import { PITCH_CLASSES, parseNote, transposeNote, type PitchClass } from './note';
import { STANDARD_TUNING } from './fretboard';

export { STANDARD_TUNING } from './fretboard';

export type ScalePlayDirection = 'ascending' | 'descending';

export interface ScaleDegree {
  readonly degree: string;
  readonly semitones: number;
}

export interface FretboardScaleNote {
  readonly id: string;
  readonly stringIndex: number;
  readonly fret: number;
  readonly note: string;
  readonly pitchClass: PitchClass;
  readonly octave: number;
  readonly degree: string;
  readonly isRoot: boolean;
  readonly midi: number;
}

export interface ScaleFretWindow {
  readonly minFret: number;
  readonly maxFret: number;
  readonly rootFret: number;
}

export function pitchClassAt(root: PitchClass, semitones: number): PitchClass {
  const rootIdx = PITCH_CLASSES.indexOf(root);
  const idx = (rootIdx + semitones) % PITCH_CLASSES.length;
  return PITCH_CLASSES[idx]!;
}

export function scalePitchClasses(
  root: PitchClass,
  degrees: readonly ScaleDegree[],
): Map<PitchClass, ScaleDegree> {
  const out = new Map<PitchClass, ScaleDegree>();
  for (const degree of degrees) {
    out.set(pitchClassAt(root, degree.semitones), degree);
  }
  return out;
}

export function buildScaleFretboardNotes(
  root: PitchClass,
  degrees: readonly ScaleDegree[],
  options?: {
    readonly tuning?: readonly string[];
    readonly minFret?: number;
    readonly maxFret?: number;
  },
): FretboardScaleNote[] {
  const tuning = options?.tuning ?? STANDARD_TUNING;
  const minFret = options?.minFret ?? 0;
  const maxFret = options?.maxFret ?? 12;
  const pitchMap = scalePitchClasses(root, degrees);
  const notes: FretboardScaleNote[] = [];

  tuning.forEach((openNote, stringIndex) => {
    for (let fret = minFret; fret <= maxFret; fret += 1) {
      const noteName = transposeNote(openNote, fret);
      const note = parseNote(noteName);
      const degree = pitchMap.get(note.pitchClass);
      if (!degree) continue;

      notes.push({
        id: `${stringIndex}:${fret}`,
        stringIndex,
        fret,
        note: noteName,
        pitchClass: note.pitchClass,
        octave: note.octave,
        degree: degree.degree,
        isRoot: degree.semitones === 0,
        midi: midiNumber(note.pitchClass, note.octave),
      });
    }
  });

  return notes;
}

export function compactScaleFretWindow(
  root: PitchClass,
  options?: {
    readonly tuning?: readonly string[];
    readonly maxFret?: number;
    readonly lowerOffset?: number;
    readonly upperOffset?: number;
  },
): ScaleFretWindow {
  const tuning = options?.tuning ?? STANDARD_TUNING;
  const maxFret = options?.maxFret ?? 12;
  const lowerOffset = options?.lowerOffset ?? 0;
  const upperOffset = options?.upperOffset ?? 3;
  const rootFret = findPitchClassFret(tuning[0]!, root, maxFret) ?? 0;
  let minFret = rootFret + lowerOffset;
  let maxWindowFret = rootFret + upperOffset;

  if (minFret < 0) {
    maxWindowFret = Math.min(maxFret, maxWindowFret - minFret);
    minFret = 0;
  }
  if (maxWindowFret > maxFret) {
    const overflow = maxWindowFret - maxFret;
    minFret = Math.max(0, minFret - overflow);
    maxWindowFret = maxFret;
  }

  return { minFret, maxFret: maxWindowFret, rootFret };
}

export function noteMidiNumber(noteName: string): number {
  const note = parseNote(noteName);
  return midiNumber(note.pitchClass, note.octave);
}

export function orderScaleNotesForPlayback(
  notes: readonly FretboardScaleNote[],
  direction: ScalePlayDirection,
): FretboardScaleNote[] {
  const ordered = [...notes].sort((a, b) =>
    a.midi - b.midi ||
    a.stringIndex - b.stringIndex ||
    a.fret - b.fret);

  return direction === 'ascending' ? ordered : ordered.reverse();
}

function midiNumber(pitchClass: PitchClass, octave: number): number {
  return octave * PITCH_CLASSES.length + PITCH_CLASSES.indexOf(pitchClass);
}

function findPitchClassFret(openNote: string, pitchClass: PitchClass, maxFret: number): number | null {
  for (let fret = 0; fret <= maxFret; fret += 1) {
    if (parseNote(transposeNote(openNote, fret)).pitchClass === pitchClass) return fret;
  }
  return null;
}
