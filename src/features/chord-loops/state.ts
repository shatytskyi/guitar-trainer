import { CHORD_LOOPS, type ChordLoop } from '../../data/progressions';
import type { Chord } from '../../shared/lib/chord';

export const BEATS_PER_CHORD_OPTIONS = [4, 2, 1] as const;
export type BeatsPerChord = (typeof BEATS_PER_CHORD_OPTIONS)[number];

export const MIN_BPM = 40;
export const MAX_BPM = 180;
export const BPM_STEP = 4;
export const DEFAULT_BPM = 72;
export const DEFAULT_BEATS_PER_CHORD: BeatsPerChord = 4;

export interface LoopTrainerState {
  readonly loopId: string;
  readonly chordIdx: number;
  readonly beatIdx: number;
  readonly round: number;
  readonly bpm: number;
  readonly beatsPerChord: BeatsPerChord;
  readonly running: boolean;
}

export function createLoopState(loopId = CHORD_LOOPS[0]?.id ?? ''): LoopTrainerState {
  return {
    loopId,
    chordIdx: 0,
    beatIdx: 0,
    round: 1,
    bpm: DEFAULT_BPM,
    beatsPerChord: DEFAULT_BEATS_PER_CHORD,
    running: false,
  };
}

export function activeLoop(state: LoopTrainerState): ChordLoop {
  return findLoop(state.loopId) ?? CHORD_LOOPS[0]!;
}

export function selectLoop(state: LoopTrainerState, loopId: string): LoopTrainerState {
  const loop = findLoop(loopId);
  if (!loop) return state;
  return {
    ...state,
    loopId: loop.id,
    chordIdx: 0,
    beatIdx: 0,
    round: 1,
  };
}

export function setRunning(state: LoopTrainerState, running: boolean): LoopTrainerState {
  return { ...state, running };
}

export function setBpm(state: LoopTrainerState, bpm: number): LoopTrainerState {
  return { ...state, bpm: clampBpm(bpm) };
}

export function adjustBpm(state: LoopTrainerState, delta: number): LoopTrainerState {
  return setBpm(state, state.bpm + delta);
}

export function setBeatsPerChord(state: LoopTrainerState, beats: number): LoopTrainerState {
  if (!isBeatsPerChord(beats)) return state;
  return {
    ...state,
    beatsPerChord: beats,
    beatIdx: Math.min(state.beatIdx, beats - 1),
  };
}

export function advanceBeat(state: LoopTrainerState): LoopTrainerState {
  const loop = activeLoop(state);
  if (state.beatIdx < state.beatsPerChord - 1) {
    return { ...state, beatIdx: state.beatIdx + 1 };
  }

  const nextChordIdx = (state.chordIdx + 1) % loop.chords.length;
  return {
    ...state,
    chordIdx: nextChordIdx,
    beatIdx: 0,
    round: nextChordIdx === 0 ? state.round + 1 : state.round,
  };
}

export function currentChord(state: LoopTrainerState): Chord {
  const loop = activeLoop(state);
  return loop.chords[state.chordIdx] ?? loop.chords[0]!;
}

export function nextChord(state: LoopTrainerState): Chord {
  const loop = activeLoop(state);
  const nextIdx = (state.chordIdx + 1) % loop.chords.length;
  return loop.chords[nextIdx] ?? loop.chords[0]!;
}

function findLoop(id: string): ChordLoop | undefined {
  return CHORD_LOOPS.find(loop => loop.id === id);
}

function clampBpm(bpm: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

function isBeatsPerChord(value: number): value is BeatsPerChord {
  return (BEATS_PER_CHORD_OPTIONS as readonly number[]).includes(value);
}
