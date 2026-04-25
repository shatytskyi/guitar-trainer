export const PITCH_CLASSES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type PitchClass = (typeof PITCH_CLASSES)[number];

export interface Note {
  pitchClass: PitchClass;
  octave: number;
}

const NOTE_PATTERN = /^([A-G]#?)(-?\d+)$/;

export function parseNote(input: string): Note {
  const match = NOTE_PATTERN.exec(input);
  if (!match) throw new Error(`Invalid note: ${input}`);
  const [, pcRaw, octRaw] = match;
  if (!pcRaw || !octRaw) throw new Error(`Invalid note: ${input}`);
  if (!isPitchClass(pcRaw)) throw new Error(`Unknown pitch class: ${pcRaw}`);
  return { pitchClass: pcRaw, octave: Number(octRaw) };
}

export function formatNote(note: Note): string {
  return `${note.pitchClass}${note.octave}`;
}

export function transposeNote(input: string, semitones: number): string {
  const { pitchClass, octave } = parseNote(input);
  const idx = PITCH_CLASSES.indexOf(pitchClass);
  const total = idx + semitones;
  const wrapped = ((total % 12) + 12) % 12;
  const octaveShift = Math.floor(total / 12);
  const next = PITCH_CLASSES[wrapped];
  if (!next) throw new Error('unreachable');
  return formatNote({ pitchClass: next, octave: octave + octaveShift });
}

function isPitchClass(s: string): s is PitchClass {
  return (PITCH_CLASSES as readonly string[]).includes(s);
}
