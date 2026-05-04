import { PITCH_CLASSES, type PitchClass } from '../../shared/lib/note';

export const NOTE_FINDER_MAX_FRET = 24;
export const NOTE_COLOR_VARS = [
  '--note-color-1',
  '--note-color-2',
  '--note-color-3',
  '--note-color-4',
  '--note-color-5',
  '--note-color-6',
  '--note-color-7',
  '--note-color-8',
  '--note-color-9',
  '--note-color-10',
  '--note-color-11',
  '--note-color-12',
] as const;

export interface NoteFinderState {
  readonly selected: readonly PitchClass[];
}

export function createNoteFinderState(): NoteFinderState {
  return { selected: [] };
}

export function togglePitchClass(state: NoteFinderState, pitchClass: PitchClass): NoteFinderState {
  if (state.selected.includes(pitchClass)) {
    return { selected: state.selected.filter(note => note !== pitchClass) };
  }

  return { selected: [...state.selected, pitchClass] };
}

export function isPitchClassSelected(state: NoteFinderState, pitchClass: PitchClass): boolean {
  return state.selected.includes(pitchClass);
}

export function selectedPitchClassSet(state: NoteFinderState): ReadonlySet<PitchClass> {
  return new Set(state.selected);
}

export function pitchClassColorVar(pitchClass: PitchClass): string {
  const idx = PITCH_CLASSES.indexOf(pitchClass);
  return NOTE_COLOR_VARS[idx] ?? NOTE_COLOR_VARS[0];
}
