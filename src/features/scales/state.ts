import { SCALE_DEFINITIONS, getScaleDefinition, type ScaleId } from '../../data/scales';
import {
  STANDARD_TUNING,
  buildScaleFretboardNotes,
  compactScaleFretWindow,
  noteMidiNumber,
  orderScaleNotesForPlayback,
  type FretboardScaleNote,
  type ScaleFretWindow,
  type ScalePlayDirection,
} from '../../shared/lib/scale';
import { transposeNote, type PitchClass } from '../../shared/lib/note';

export const SCALE_ROOTS = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const satisfies readonly PitchClass[];

export const DEFAULT_SCALE_ID: ScaleId = 'minor-pentatonic';
export const DEFAULT_SCALE_ROOT: PitchClass = 'A';
export const SCALE_MAX_FRET = 12;
export const SCALE_STEP_MS = 260;

export interface ScalesState {
  readonly root: PitchClass;
  readonly scaleId: ScaleId;
  readonly direction: ScalePlayDirection;
  readonly running: boolean;
  readonly activeNoteId: string | null;
}

export function createScalesState(): ScalesState {
  return {
    root: DEFAULT_SCALE_ROOT,
    scaleId: DEFAULT_SCALE_ID,
    direction: 'ascending',
    running: false,
    activeNoteId: null,
  };
}

export function selectRoot(state: ScalesState, root: PitchClass): ScalesState {
  return { ...state, root, running: false, activeNoteId: null };
}

export function selectScale(state: ScalesState, scaleId: ScaleId): ScalesState {
  return { ...state, scaleId, running: false, activeNoteId: null };
}

export function setPlayback(
  state: ScalesState,
  direction: ScalePlayDirection,
  running: boolean,
): ScalesState {
  return { ...state, direction, running };
}

export function setActiveNote(state: ScalesState, noteId: string | null): ScalesState {
  return { ...state, activeNoteId: noteId };
}

export function currentScaleNotes(state: ScalesState): FretboardScaleNote[] {
  const scale = getScaleDefinition(state.scaleId);
  const window = currentFretWindow(state);
  const rootMidi = noteMidiNumber(transposeNote(STANDARD_TUNING[0], window.rootFret));

  return buildScaleFretboardNotes(
    state.root,
    scale.degrees,
    { minFret: window.minFret, maxFret: window.maxFret },
  ).filter(note => note.midi >= rootMidi);
}

export function currentSequence(state: ScalesState): FretboardScaleNote[] {
  return orderScaleNotesForPlayback(currentScaleNotes(state), state.direction);
}

export function scaleDegreeText(scaleId: ScaleId): string {
  return getScaleDefinition(scaleId).degrees.map(degree => degree.degree).join(' ');
}

export function currentFretWindow(state: ScalesState): ScaleFretWindow {
  const scale = getScaleDefinition(state.scaleId);
  return compactScaleFretWindow(state.root, {
    maxFret: SCALE_MAX_FRET,
    lowerOffset: scale.position.lowerOffset,
    upperOffset: scale.position.upperOffset,
  });
}

export function scaleIds(): ScaleId[] {
  return SCALE_DEFINITIONS.map(scale => scale.id);
}
