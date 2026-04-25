import { describe, it, expect } from 'vitest';
import { renderFretboardDiagram } from './FretboardDiagram';
import type { ChordShape } from '../lib/chord';

const cMajorOpen: ChordShape = {
  label: 'open',
  frets: [null, 3, 2, 0, 1, 0],
  fingers: [null, 3, 2, null, 1, null],
  notes: ['C3', 'E3', 'G3', 'C4', 'E4'],
};

const cMajorBarre: ChordShape = {
  label: 'barre',
  frets: [null, 3, 5, 5, 5, 3],
  fingers: [null, 1, 2, 3, 4, 1],
  notes: ['C3'],
};

describe('renderFretboardDiagram', () => {
  it('returns an <svg> string', () => {
    const out = renderFretboardDiagram(cMajorOpen);
    expect(out.startsWith('<svg')).toBe(true);
    expect(out.endsWith('</svg>')).toBe(true);
  });

  it('shows the nut bar in open position', () => {
    expect(renderFretboardDiagram(cMajorOpen)).toContain('<rect');
  });

  it('shifts up the neck and emits a fret-number label when frets exceed the threshold', () => {
    expect(renderFretboardDiagram(cMajorBarre)).toContain('3fr');
  });

  it('renders × markers for muted strings', () => {
    expect(renderFretboardDiagram(cMajorOpen)).toContain('×');
  });
});
