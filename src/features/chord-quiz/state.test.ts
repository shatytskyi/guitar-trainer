import { describe, expect, it } from 'vitest';
import { newState, syncQuizSet } from './state';

describe('quiz state', () => {
  it('keeps the same state object when the chord set is unchanged', () => {
    const state = newState('basic');
    expect(syncQuizSet(state, 'basic')).toBe(state);
  });

  it('moves to the requested chord set when settings change sets', () => {
    const state = newState('basic');
    expect(syncQuizSet(state, 'extended').set).toBe('extended');
  });
});
