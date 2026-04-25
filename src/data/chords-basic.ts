import type { RootEntry } from './types';

export const CHORDS_BASIC: readonly RootEntry[] = [
  { root: 'C', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], notes: ['C3','E3','G3','C4','E4'] },
      { label: 'barre', frets: [null, 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1],         notes: ['C3','G3','C4','E4','C5'] },
    ] },
    { type: 'add9', shapes: [
      { label: 'open', frets: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], notes: ['C3','E3','G3','D4','E4'] },
    ] },
  ] },
  { root: 'D', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], notes: ['D3','A3','D4','F#4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 7, 5],     fingers: [null, 1, 2, 3, 4, 1],       notes: ['D3','A3','D4','F#4','A4'] },
    ] },
    { type: 'm', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], notes: ['D3','A3','D4','F4'] },
      { label: 'barre', frets: [null, 5, 7, 7, 6, 5],     fingers: [null, 1, 3, 4, 2, 1],       notes: ['D3','A3','D4','F4','A4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], notes: ['D3','A3','C4','F#4'] },
      { label: 'barre', frets: [null, 5, 7, 5, 7, 5],     fingers: [null, 1, 3, 1, 4, 1],       notes: ['D3','A3','C4','F#4','A4'] },
    ] },
    { type: 'sus4', shapes: [
      { label: 'open', frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], notes: ['D3','A3','D4','G4'] },
    ] },
  ] },
  { root: 'E', types: [
    { type: '',  shapes: [{ label: 'open', frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], notes: ['E2','B2','E3','G#3','B3','E4'] }] },
    { type: 'm', shapes: [{ label: 'open', frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], notes: ['E2','B2','E3','G3','B3','E4'] }] },
    { type: '7', shapes: [{ label: 'open', frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], notes: ['E2','B2','D3','G#3','B3','E4'] }] },
  ] },
  { root: 'F', types: [
    { type: '', shapes: [
      { label: 'barre', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], notes: ['F2','C3','F3','A3','C4','F4'], recommended: true },
      { label: 'mini',  frets: [null, null, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], notes: ['F3','A3','C4','F4'] },
    ] },
  ] },
  { root: 'G', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], notes: ['G2','B2','D3','G3','B3','G4'] },
      { label: 'barre', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1],            notes: ['G2','D3','G3','B3','D4','G4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], notes: ['G2','B2','D3','G3','B3','F4'] },
      { label: 'barre', frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1],            notes: ['G2','D3','F3','B3','D4','G4'] },
    ] },
  ] },
  { root: 'A', types: [
    { type: '', shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], notes: ['A2','E3','A3','C#4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 6, 5, 5],     fingers: [1, 3, 4, 2, 1, 1],          notes: ['A2','E3','A3','C#4','E4','A4'] },
    ] },
    { type: 'm', shapes: [
      { label: 'open',  frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], notes: ['A2','E3','A3','C4','E4'] },
      { label: 'barre', frets: [5, 7, 7, 5, 5, 5],     fingers: [1, 3, 4, 1, 1, 1],          notes: ['A2','E3','A3','C4','E4','A4'] },
    ] },
    { type: '7', shapes: [
      { label: 'open',  frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], notes: ['A2','E3','G3','C#4','E4'] },
      { label: 'barre', frets: [5, 7, 5, 6, 5, 5],     fingers: [1, 3, 1, 2, 1, 1],            notes: ['A2','E3','G3','C#4','E4','A4'] },
    ] },
  ] },
];
