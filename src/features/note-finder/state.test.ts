import { describe, expect, it } from 'vitest';
import {
  createNoteFinderState,
  isPitchClassSelected,
  pitchClassColorVar,
  selectedPitchClassSet,
  togglePitchClass,
} from './state';

describe('note finder state', () => {
  it('starts with no selected pitch classes', () => {
    expect(createNoteFinderState().selected).toEqual([]);
  });

  it('toggles pitch classes on and off', () => {
    const state = togglePitchClass(createNoteFinderState(), 'G');
    expect(state.selected).toEqual(['G']);
    expect(isPitchClassSelected(state, 'G')).toBe(true);

    const next = togglePitchClass(state, 'G');
    expect(next.selected).toEqual([]);
    expect(isPitchClassSelected(next, 'G')).toBe(false);
  });

  it('keeps selection order while creating a matching set', () => {
    const state = togglePitchClass(togglePitchClass(createNoteFinderState(), 'C'), 'G#');

    expect(state.selected).toEqual(['C', 'G#']);
    expect(selectedPitchClassSet(state).has('C')).toBe(true);
    expect(selectedPitchClassSet(state).has('G#')).toBe(true);
  });

  it('assigns stable color variables by pitch class', () => {
    expect(pitchClassColorVar('C')).toBe('--note-color-1');
    expect(pitchClassColorVar('G')).toBe('--note-color-8');
    expect(pitchClassColorVar('B')).toBe('--note-color-12');
  });
});
