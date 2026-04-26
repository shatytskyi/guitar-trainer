import type { Chord } from '../shared/lib/chord';

export type ChordLoopCategory = 'open' | 'pop' | 'minor' | 'rock' | 'barre' | 'seventh';
export type ChordLoopDifficulty = 'easy' | 'mixed' | 'barre';

export interface ChordLoop {
  readonly id: string;
  readonly titleKey: string;
  readonly category: ChordLoopCategory;
  readonly difficulty: ChordLoopDifficulty;
  readonly chords: readonly Chord[];
}

export const CHORD_LOOPS: readonly ChordLoop[] = [
  {
    id: 'open-anchor',
    titleKey: 'loops.loop.open-anchor',
    category: 'open',
    difficulty: 'easy',
    chords: [
      { root: 'G', type: '' },
      { root: 'D', type: '' },
      { root: 'E', type: 'm' },
      { root: 'C', type: '' },
    ],
  },
  {
    id: 'pop-axis',
    titleKey: 'loops.loop.pop-axis',
    category: 'pop',
    difficulty: 'easy',
    chords: [
      { root: 'C', type: '' },
      { root: 'G', type: '' },
      { root: 'A', type: 'm' },
      { root: 'F', type: '' },
    ],
  },
  {
    id: 'minor-lift',
    titleKey: 'loops.loop.minor-lift',
    category: 'minor',
    difficulty: 'easy',
    chords: [
      { root: 'A', type: 'm' },
      { root: 'F', type: '' },
      { root: 'C', type: '' },
      { root: 'G', type: '' },
    ],
  },
  {
    id: 'folk-turn',
    titleKey: 'loops.loop.folk-turn',
    category: 'open',
    difficulty: 'easy',
    chords: [
      { root: 'G', type: '' },
      { root: 'C', type: '' },
      { root: 'D', type: '' },
      { root: 'G', type: '' },
    ],
  },
  {
    id: 'minor-walk',
    titleKey: 'loops.loop.minor-walk',
    category: 'minor',
    difficulty: 'easy',
    chords: [
      { root: 'E', type: 'm' },
      { root: 'D', type: '' },
      { root: 'C', type: '' },
      { root: 'G', type: '' },
    ],
  },
  {
    id: 'problem-f',
    titleKey: 'loops.loop.problem-f',
    category: 'barre',
    difficulty: 'mixed',
    chords: [
      { root: 'C', type: '' },
      { root: 'F', type: '' },
      { root: 'G', type: '' },
      { root: 'C', type: '' },
    ],
  },
  {
    id: 'campfire-bm',
    titleKey: 'loops.loop.campfire-bm',
    category: 'barre',
    difficulty: 'barre',
    chords: [
      { root: 'D', type: '' },
      { root: 'A', type: '' },
      { root: 'B', type: 'm' },
      { root: 'G', type: '' },
    ],
  },
  {
    id: 'rock-drive',
    titleKey: 'loops.loop.rock-drive',
    category: 'rock',
    difficulty: 'easy',
    chords: [
      { root: 'E', type: '' },
      { root: 'G', type: '' },
      { root: 'D', type: '' },
      { root: 'A', type: '' },
    ],
  },
  {
    id: 'sad-classic',
    titleKey: 'loops.loop.sad-classic',
    category: 'minor',
    difficulty: 'mixed',
    chords: [
      { root: 'A', type: 'm' },
      { root: 'G', type: '' },
      { root: 'F', type: '' },
      { root: 'E', type: '' },
    ],
  },
  {
    id: 'bright-bm',
    titleKey: 'loops.loop.bright-bm',
    category: 'pop',
    difficulty: 'barre',
    chords: [
      { root: 'D', type: '' },
      { root: 'G', type: '' },
      { root: 'B', type: 'm' },
      { root: 'A', type: '' },
    ],
  },
  {
    id: 'blues-turn',
    titleKey: 'loops.loop.blues-turn',
    category: 'seventh',
    difficulty: 'mixed',
    chords: [
      { root: 'E', type: '7' },
      { root: 'A', type: '7' },
      { root: 'B', type: '7' },
      { root: 'A', type: '7' },
    ],
  },
  {
    id: 'soul-cycle',
    titleKey: 'loops.loop.soul-cycle',
    category: 'seventh',
    difficulty: 'mixed',
    chords: [
      { root: 'A', type: 'm7' },
      { root: 'D', type: 'm7' },
      { root: 'G', type: '7' },
      { root: 'C', type: 'maj7' },
    ],
  },
];
