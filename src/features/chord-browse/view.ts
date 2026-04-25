import { createRootTile } from '../../shared/components/RootTile';
import { createStage } from '../../shared/components/Stage';
import { createChordCard, type ChordCardHandle } from '../../shared/components/ChordCard';
import { createButton } from '../../shared/components/Button';
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

  const stageWrap = document.createElement('div');
  stageWrap.className = 'browse__stage';
  root.appendChild(stageWrap);

  const typeRail = document.createElement('div');
  typeRail.className = 'type-rail';
  typeRail.setAttribute('role', 'tablist');
  typeRail.setAttribute('aria-label', deps.i18n.t('quiz.label.type'));
  root.appendChild(typeRail);

  const rootRail = document.createElement('div');
  rootRail.className = 'root-rail';
  rootRail.setAttribute('role', 'tablist');
  root.appendChild(rootRail);

  let state: BrowseState = { selectedRoot: null, typeIdx: 0, shapeIdx: 0 };
  let card: ChordCardHandle | null = null;

  render();

  return () => host.replaceChildren();

  function render() {
    paintRootRail();
    paintTypeRail();
    paintStage();
  }

  function paintRootRail() {
    rootRail.replaceChildren();
    for (const r of rootsForSet(deps.settings.get().set)) {
      rootRail.appendChild(createRootTile({
        root: r.root,
        typeLabels: r.types
          .filter(t => t.type !== '')
          .map(t => t.type),
        active: r === state.selectedRoot,
        onClick: () => {
          state = selectRoot(r);
          render();
          play();
          scrollActiveRootIntoView();
        },
      }));
    }
  }

  function paintTypeRail() {
    typeRail.replaceChildren();
    const r = state.selectedRoot;
    if (!r || r.types.length <= 1) {
      typeRail.style.display = 'none';
      return;
    }
    typeRail.style.display = '';
    r.types.forEach((t, i) => {
      typeRail.appendChild(createButton({
        label: t.type === '' ? '—' : t.type,
        variant: 'pill',
        active: i === state.typeIdx,
        onClick: () => { state = selectType(state, i); render(); play(); },
      }));
    });
  }

  function paintStage() {
    stageWrap.replaceChildren();
    if (!state.selectedRoot) {
      const empty = document.createElement('div');
      empty.className = 'browse__empty';
      empty.textContent = deps.i18n.t('browse.empty');
      stageWrap.appendChild(empty);
      card = null;
      return;
    }

    const stage = createStage();
    stageWrap.appendChild(stage.root);

    card = createChordCard(deps.i18n);
    stage.body.appendChild(card.root);

    const r = state.selectedRoot;
    const type = r.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    card.render(
      {
        displayName: chordDisplayName({ root: r.root, type: type.type }),
        metaText: type.type === '' ? '' : deps.i18n.t(`chord.type.${type.type}`),
        types: [], // type pills live in the external rail
        shapes: type.shapes.map((s, i) => ({
          id: String(i),
          label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ' ' + deps.i18n.t('shape.recommended') : ''),
          active: i === state.shapeIdx,
        })),
        shape,
        hidden: false,
      },
      {
        onTypeSelect: () => { /* no-op: managed by external rail */ },
        onShapeSelect: id => { state = selectShape(state, Number(id)); paintStage(); play(); },
        onReveal: () => { /* never hidden in browse */ },
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
}
