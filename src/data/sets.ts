import { CHORDS_BASIC } from './chords-basic';
import { CHORDS_EXTENDED } from './chords-extended';
import type { RootEntry } from './types';
import type { ChordSet } from '../shared/services/settings';

export function rootsForSet(set: ChordSet): readonly RootEntry[] {
  return set === 'basic' ? CHORDS_BASIC : CHORDS_EXTENDED;
}
