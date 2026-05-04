import type { Feature } from '../shared/lib/feature';
import { chordQuiz } from './chord-quiz';
import { chordLoops } from './chord-loops';
import { favorites } from './favorites';
import { chordBrowse } from './chord-browse';
import { scales } from './scales';
import { noteFinder } from './note-finder';

export const features: readonly Feature[] = [chordQuiz, chordLoops, scales, noteFinder, favorites, chordBrowse];
