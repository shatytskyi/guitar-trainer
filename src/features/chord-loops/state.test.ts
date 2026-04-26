import { describe, expect, it } from 'vitest';
import { CHORD_LOOPS } from '../../data/progressions';
import {
  MAX_BPM,
  MIN_BPM,
  adjustBpm,
  advanceBeat,
  createLoopState,
  currentChord,
  nextChord,
  selectLoop,
  setBeatsPerChord,
  setBpm,
} from './state';

describe('chord loop trainer state', () => {
  it('starts on the first chord of the first loop', () => {
    const state = createLoopState();

    expect(currentChord(state)).toEqual(CHORD_LOOPS[0]?.chords[0]);
    expect(nextChord(state)).toEqual(CHORD_LOOPS[0]?.chords[1]);
  });

  it('advances beats before switching chords', () => {
    const state = setBeatsPerChord(createLoopState(), 2);

    const beatTwo = advanceBeat(state);
    const next = advanceBeat(beatTwo);

    expect(beatTwo).toMatchObject({ chordIdx: 0, beatIdx: 1, round: 1 });
    expect(next).toMatchObject({ chordIdx: 1, beatIdx: 0, round: 1 });
  });

  it('increments the round when the loop wraps', () => {
    let state = setBeatsPerChord(createLoopState(), 1);
    const chordCount = CHORD_LOOPS[0]?.chords.length ?? 0;

    for (let i = 0; i < chordCount; i += 1) state = advanceBeat(state);

    expect(state).toMatchObject({ chordIdx: 0, beatIdx: 0, round: 2 });
  });

  it('resets position when selecting another loop', () => {
    const nextLoop = CHORD_LOOPS[1]!;
    const moved = advanceBeat(setBeatsPerChord(createLoopState(), 1));
    const selected = selectLoop(moved, nextLoop.id);

    expect(selected).toMatchObject({ loopId: nextLoop.id, chordIdx: 0, beatIdx: 0, round: 1 });
  });

  it('clamps tempo changes', () => {
    expect(setBpm(createLoopState(), 12).bpm).toBe(MIN_BPM);
    expect(adjustBpm(createLoopState(), 1000).bpm).toBe(MAX_BPM);
  });
});
