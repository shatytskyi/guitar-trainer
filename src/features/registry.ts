import type { Feature } from '../shared/lib/feature';
import { chordQuiz } from './chord-quiz';
import { chordLoops } from './chord-loops';
import { favorites } from './favorites';
import { chordBrowse } from './chord-browse';

export const features: readonly Feature[] = [chordQuiz, chordLoops, favorites, chordBrowse];
