import type { Feature } from '../shared/lib/feature';
import { chordQuiz } from './chord-quiz';
import { favorites } from './favorites';
import { chordBrowse } from './chord-browse';

export const features: readonly Feature[] = [chordQuiz, favorites, chordBrowse];
