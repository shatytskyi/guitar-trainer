import { CHORDS_BASIC } from './chords-basic';
import { CHORDS_EXTENDED } from './chords-extended';
import { CHORDS_ALL } from './chords-all';
import type { RootEntry } from './types';
import type { ChordSet } from '../shared/services/settings';

export function rootsForSet(set: ChordSet): readonly RootEntry[] {
  if (set === 'basic') return CHORDS_BASIC;
  if (set === 'extended') return CHORDS_EXTENDED;
  return CHORDS_ALL;
}
