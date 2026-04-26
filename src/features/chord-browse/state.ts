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

export function syncBrowseSet(state: BrowseState, roots: readonly RootEntry[]): BrowseState {
  if (!state.selectedRoot) return state;

  const selectedRoot = roots.find(root => root.root === state.selectedRoot?.root);
  if (!selectedRoot) return { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };

  const currentType = state.selectedRoot.types[state.typeIdx];
  const matchingTypeIdx = currentType
    ? selectedRoot.types.findIndex(type => type.type === currentType.type)
    : -1;
  const typeIdx = matchingTypeIdx >= 0 ? matchingTypeIdx : 0;
  const type = selectedRoot.types[typeIdx] ?? selectedRoot.types[0];
  if (!type) return { selectedRoot, typeIdx: 0, shapeIdx: 0 };

  const currentShape = currentType?.shapes[state.shapeIdx];
  const matchingShapeIdx = currentShape
    ? type.shapes.findIndex(shape => shape.label === currentShape.label)
    : -1;

  return {
    selectedRoot,
    typeIdx,
    shapeIdx: matchingShapeIdx >= 0 ? matchingShapeIdx : getDefaultShapeIdx(type),
  };
}
