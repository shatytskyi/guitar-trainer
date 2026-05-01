import { describe, expect, it } from 'vitest';
import {
  createScalesState,
  currentSequence,
  scaleDegreeText,
  selectRoot,
  selectScale,
  setPlayback,
} from './state';

describe('scales trainer state', () => {
  it('starts on A minor pentatonic', () => {
    const state = createScalesState();

    expect(state).toMatchObject({ root: 'A', scaleId: 'minor-pentatonic' });
    expect(scaleDegreeText(state.scaleId)).toBe('1 b3 4 5 b7');
  });

  it('resets playback when changing root or scale', () => {
    const running = setPlayback(createScalesState(), 'ascending', true);

    expect(selectRoot(running, 'C')).toMatchObject({ root: 'C', running: false, activeNoteId: null });
    expect(selectScale(running, 'blues')).toMatchObject({ scaleId: 'blues', running: false, activeNoteId: null });
  });

  it('returns a sequence in the selected direction', () => {
    const ascending = setPlayback(createScalesState(), 'ascending', false);
    const descending = setPlayback(createScalesState(), 'descending', false);

    expect(currentSequence(ascending)[0]?.note).toBe('A2');
    expect(currentSequence(descending)[0]?.note).toBe('C5');
  });
});
