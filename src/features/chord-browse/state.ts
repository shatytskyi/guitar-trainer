import { getDefaultShapeIdx, type RootEntry } from '../../shared/lib/music';

export interface BrowseState {
  selectedRoot: RootEntry | null;
  typeIdx: number;
  shapeIdx: number;
}

export function selectRoot(root: RootEntry): BrowseState {
  return {
    selectedRoot: root,
    typeIdx: 0,
    shapeIdx: getDefaultShapeIdx(root.types[0]!),
  };
}

export function selectType(state: BrowseState, idx: number): BrowseState {
  if (!state.selectedRoot) return state;
  const type = state.selectedRoot.types[idx]!;
  return { ...state, typeIdx: idx, shapeIdx: getDefaultShapeIdx(type) };
}

export function selectShape(state: BrowseState, idx: number): BrowseState {
  return { ...state, shapeIdx: idx };
}
