import { createRootTile } from '../../shared/components/RootTile';
import { createStage } from '../../shared/components/Stage';
import { createChordCard, type ChordCardHandle } from '../../shared/components/ChordCard';
import { chordDisplayName } from '../../shared/lib/chord';
import { rootsForSet } from '../../data/sets';
import { type BrowseState, selectRoot, selectShape, selectType, syncBrowseSet } from './state';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { ChordSet, SettingsStore } from '../../shared/services/settings';

const RECOMMENDED_MARK = '★';

export interface BrowseViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export interface BrowseViewHandle {
  destroy(): void;
  refresh(deps: BrowseViewDeps): void;
}

export function mountBrowseView(host: HTMLElement, initialDeps: BrowseViewDeps): BrowseViewHandle {
  let deps = initialDeps;
  let activeSet: ChordSet = deps.settings.get().set;

  const root = document.createElement('div');
  root.className = 'browse';
  host.appendChild(root);

  const stageWrap = document.createElement('div');
  stageWrap.className = 'browse__stage';
  stageWrap.id = 'browse-stage-panel';
  stageWrap.setAttribute('role', 'tabpanel');
  root.appendChild(stageWrap);

  const rootRail = document.createElement('div');
  rootRail.className = 'root-rail';
  rootRail.setAttribute('role', 'tablist');
  rootRail.setAttribute('aria-label', deps.i18n.t('feature.chord-browse.title'));
  rootRail.addEventListener('keydown', onRootRailKeydown);
  root.appendChild(rootRail);

  let state: BrowseState = { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };

  // Build stage + card once and reuse them. Recreating the card on every
  // selection threw away its CSS transition state, so the meta-line
  // animation never had a chance to play.
  const stage = createStage();
  const card: ChordCardHandle = createChordCard(deps.i18n);
  stage.body.appendChild(card.root);

  const empty = document.createElement('div');
  empty.className = 'browse__empty';
  empty.textContent = deps.i18n.t('browse.empty');

  render();

  return {
    destroy() {
      host.replaceChildren();
    },
    refresh(nextDeps) {
      deps = nextDeps;
      syncSet();
      empty.textContent = deps.i18n.t('browse.empty');
      rootRail.setAttribute('aria-label', deps.i18n.t('feature.chord-browse.title'));
      render();
    },
  };

  function render() {
    paintRootRail();
    paintStage();
  }

  function syncSet() {
    const nextSet = deps.settings.get().set;
    if (activeSet === nextSet) return;
    activeSet = nextSet;
    state = syncBrowseSet(state, rootsForSet(nextSet));
  }

  function paintRootRail() {
    rootRail.replaceChildren();
    const roots = rootsForSet(deps.settings.get().set);
    roots.forEach((r, idx) => {
      const active = r === state.selectedRoot;
      rootRail.appendChild(createRootTile({
        root: r.root,
        active,
        tabIndex: active || (!state.selectedRoot && idx === 0) ? 0 : -1,
        onClick: () => {
          state = selectRoot(r);
          render();
          focusRoot(r.root);
          scrollActiveRootIntoView();
        },
      }));
    });
  }

  function paintStage() {
    if (!state.selectedRoot) {
      stageWrap.replaceChildren(empty);
      return;
    }

    if (stageWrap.firstChild !== stage.root) {
      stageWrap.replaceChildren(stage.root);
    }

    const r = state.selectedRoot;
    const type = r.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    card.render(
      {
        displayName: chordDisplayName({ root: r.root, type: type.type }),
        metaText: type.type === '' ? '' : deps.i18n.t(`chord.type.${type.type}`),
        types: r.types.map((t, i) => ({
          id: String(i),
          label: t.type === '' ? '—' : t.type,
          active: i === state.typeIdx,
        })),
        shapes: type.shapes.map((s, i) => ({
          id: String(i),
          label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ` ${RECOMMENDED_MARK}` : ''),
          active: i === state.shapeIdx,
        })),
        shape,
        hidden: false,
      },
      {
        onTypeSelect: id => { state = selectType(state, Number(id)); render(); },
        onShapeSelect: id => { state = selectShape(state, Number(id)); paintStage(); },
        onReveal: () => { /* never hidden in browse */ },
        onDiagramActivate: () => play(),
      },
    );
  }

  function play() {
    if (!state.selectedRoot) return;
    const type = state.selectedRoot.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }

  function scrollActiveRootIntoView() {
    const active = rootRail.querySelector<HTMLElement>('.root-tile--active');
    if (!active) return;
    const targetLeft = active.offsetLeft - (rootRail.clientWidth - active.offsetWidth) / 2;
    rootRail.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  function focusRoot(rootName: string) {
    for (const tile of rootRail.querySelectorAll<HTMLButtonElement>('.root-tile')) {
      if (tile.dataset['root'] === rootName) {
        tile.focus();
        return;
      }
    }
  }

  function onRootRailKeydown(e: KeyboardEvent) {
    const tiles = Array.from(rootRail.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    if (tiles.length === 0) return;

    const currentIdx = tiles.indexOf(document.activeElement as HTMLButtonElement);
    const fallbackIdx = tiles.findIndex(tile => tile.getAttribute('aria-selected') === 'true');
    const idx = currentIdx >= 0 ? currentIdx : Math.max(fallbackIdx, 0);
    let nextIdx: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % tiles.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + tiles.length) % tiles.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = tiles.length - 1;
    if (nextIdx == null) return;

    e.preventDefault();
    tiles[nextIdx]?.click();
  }
}
