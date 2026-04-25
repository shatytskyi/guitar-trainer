import { createRootTile } from '../../shared/components/RootTile';
import { createChordCard, type ChordCardHandle } from '../../shared/components/ChordCard';
import { chordDisplayName } from '../../shared/lib/chord';
import { rootsForSet } from '../../data/sets';
import { type BrowseState, selectRoot, selectShape, selectType } from './state';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { SettingsStore } from '../../shared/services/settings';

export interface BrowseViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export function mountBrowseView(host: HTMLElement, deps: BrowseViewDeps): () => void {
  const root = document.createElement('div');
  root.className = 'browse';
  host.appendChild(root);

  const grid = document.createElement('div');
  grid.className = 'browse__grid';
  root.appendChild(grid);

  const panel = document.createElement('div');
  panel.className = 'browse__panel';
  root.appendChild(panel);

  let state: BrowseState = { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };
  let card: ChordCardHandle | null = null;

  render();

  return () => host.replaceChildren();

  function render() {
    grid.replaceChildren();
    for (const r of rootsForSet(deps.settings.get().set)) {
      grid.appendChild(createRootTile({
        root: r.root,
        typeLabels: r.types.map(t => deps.i18n.t(`chord.type.${t.type}`)),
        active: r === state.selectedRoot,
        onClick: () => {
          state = selectRoot(r);
          render();
          play();
        },
      }));
    }
    panel.replaceChildren();
    if (!state.selectedRoot) {
      const empty = document.createElement('div');
      empty.className = 'browse__empty';
      empty.textContent = deps.i18n.t('browse.empty');
      panel.appendChild(empty);
      card = null;
      return;
    }
    card = createChordCard(deps.i18n);
    panel.appendChild(card.root);
    paintCard();
  }

  function paintCard() {
    if (!card || !state.selectedRoot) return;
    const r = state.selectedRoot;
    const type = r.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    card.render({
      displayName: chordDisplayName({ root: r.root, type: type.type }),
      metaText: deps.i18n.t(`chord.type.${type.type}`),
      types: r.types.map((t, i) => ({
        id: String(i),
        label: deps.i18n.t(`chord.type.${t.type}`),
        active: i === state.typeIdx,
      })),
      shapes: type.shapes.map((s, i) => ({
        id: String(i),
        label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ' ' + deps.i18n.t('shape.recommended') : ''),
        active: i === state.shapeIdx,
      })),
      shape,
      hidden: false,
    }, {
      onTypeSelect: id => { state = selectType(state, Number(id)); paintCard(); play(); },
      onShapeSelect: id => { state = selectShape(state, Number(id)); paintCard(); play(); },
      onReveal: () => { /* never hidden in browse */ },
    });
  }

  function play() {
    if (!state.selectedRoot) return;
    const type = state.selectedRoot.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }
}
