import { describe, it, expect } from 'vitest';
import { getDefaultShapeIdx, flattenChords, type ChordTypeEntry, type RootEntry } from './music';

const shapeOpen = {
  label: 'open',
  frets: [null, 3, 2, 0, 1, 0],
  fingers: [null, 3, 2, null, 1, null],
  notes: ['C3'],
} as const;
const shapeBarre = {
  label: 'barre',
  frets: [null, 3, 5, 5, 5, 3],
  fingers: [null, 1, 2, 3, 4, 1],
  notes: ['C3'],
  recommended: true,
} as const;

const cMajor: ChordTypeEntry = {
  type: '',
  shapes: [shapeOpen, shapeBarre],
};

const cRoot: RootEntry = {
  root: 'C',
  types: [cMajor],
};

describe('getDefaultShapeIdx', () => {
  it('returns the recommended shape index when present', () => {
    expect(getDefaultShapeIdx(cMajor)).toBe(1);
  });

  it('returns 0 when no shape is marked recommended', () => {
    const noRec: ChordTypeEntry = { type: '', shapes: [shapeOpen, { ...shapeBarre, recommended: false }] };
    expect(getDefaultShapeIdx(noRec)).toBe(0);
  });
});

describe('flattenChords', () => {
  it('produces one entry per (root, type) pair', () => {
    const flat = flattenChords([cRoot]);
    expect(flat).toHaveLength(1);
    expect(flat[0]).toEqual({ root: cRoot, type: cMajor });
  });
});
