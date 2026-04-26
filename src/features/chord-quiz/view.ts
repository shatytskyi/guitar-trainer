import { createStage } from '../../shared/components/Stage';
import { createChordCard } from '../../shared/components/ChordCard';
import { createChordSetSelector } from '../../shared/components/ChordSetSelector';
import { createButton } from '../../shared/components/Button';
import { chordDisplayName } from '../../shared/lib/chord';
import { favoriteIdForShape } from '../../shared/lib/favorites';
import { getDefaultShapeIdx } from '../../shared/lib/music';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { FavoritesStore } from '../../shared/services/favorites';
import type { SettingsStore } from '../../shared/services/settings';
import { newState, nextChord, syncQuizSet, type QuizState } from './state';

const RECOMMENDED_MARK = '★';

export interface QuizViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
  favorites: FavoritesStore;
}

export interface QuizViewHandle {
  destroy(): void;
  refresh(deps: QuizViewDeps): void;
}

export function mountQuizView(host: HTMLElement, initialDeps: QuizViewDeps): QuizViewHandle {
  let deps = initialDeps;
  let state: QuizState = newState(deps.settings.get().quizChordSet, deps.favorites.get());

  const toolbar = document.createElement('div');
  toolbar.className = 'quiz-toolbar';

  const setGroup = document.createElement('div');
  setGroup.className = 'quiz-toolbar__group';
  const setLabel = document.createElement('span');
  setLabel.className = 'quiz-toolbar__caption';
  setLabel.textContent = deps.i18n.t('quiz.set-label');
  const setSelector = createChordSetSelector({
    i18n: deps.i18n,
    value: deps.settings.get().quizChordSet,
    ariaLabel: deps.i18n.t('quiz.set-label'),
    onSelect: set => {
      deps.settings.set({ quizChordSet: set });
    },
  });
  setGroup.append(setLabel, setSelector.root);

  toolbar.append(setGroup);
  host.appendChild(toolbar);

  const stage = createStage();
  host.appendChild(stage.root);

  const card = createChordCard(deps.i18n);
  stage.body.appendChild(card.root);

  const empty = document.createElement('div');
  empty.className = 'quiz-empty';

  const controls = document.createElement('div');
  controls.className = 'quiz-controls';
  const nextBtn = createButton({
    label: deps.i18n.t('quiz.btn.next'),
    variant: 'primary',
    onClick: () => { state = nextChord(state, deps.favorites.get()); render(); },
  });
  nextBtn.classList.add('btn--lg');
  controls.append(nextBtn);
  host.appendChild(controls);

  render();

  return {
    destroy() {
      host.replaceChildren();
    },
    refresh(nextDeps) {
      deps = nextDeps;
      state = syncQuizSet(state, deps.settings.get().quizChordSet, deps.favorites.get());
      const setLabelText = deps.i18n.t('quiz.set-label');
      setLabel.textContent = setLabelText;
      setSelector.render({
        i18n: deps.i18n,
        value: deps.settings.get().quizChordSet,
        ariaLabel: setLabelText,
        onSelect: set => {
          deps.settings.set({ quizChordSet: set });
        },
      });
      nextBtn.textContent = deps.i18n.t('quiz.btn.next');
      render();
    },
  };

  function playCurrent() {
    if (!state.current) return;
    const type = state.current.root.types[state.typeIdx];
    const shape = type?.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }

  function render() {
    if (!state.current) {
      empty.textContent = deps.i18n.t('quiz.empty-favorites');
      if (stage.body.firstChild !== empty) stage.body.replaceChildren(empty);
      nextBtn.disabled = true;
      return;
    }

    if (stage.body.firstChild !== card.root) stage.body.replaceChildren(card.root);
    nextBtn.disabled = false;

    const root = state.current.root;
    const type = root.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
    const favoriteId = favoriteIdForShape(root.root, type.type, shape);
    const favoriteActive = deps.favorites.isFavorite(favoriteId);
    card.render(
      {
        displayName: chordDisplayName({ root: root.root, type: type.type }),
        metaText: type.type === '' ? '' : deps.i18n.t(`chord.type.${type.type}`),
        types: root.types.map((t, i) => ({
          id: String(i),
          label: t.type === '' ? '—' : t.type,
          active: i === state.typeIdx,
          highlight: i === state.originalTypeIdx && i !== state.typeIdx,
        })),
        shapes: type.shapes.map((s, i) => ({
          id: String(i),
          label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ` ${RECOMMENDED_MARK}` : ''),
          active: i === state.shapeIdx,
        })),
        shape,
        hidden: deps.settings.get().hideDiagram && !state.revealed,
        diagramToggle: {
          checked: deps.settings.get().hideDiagram,
          label: deps.i18n.t('quiz.hide-diagram'),
        },
        favorite: {
          active: favoriteActive,
          label: deps.i18n.t(favoriteActive ? 'favorite.remove' : 'favorite.add'),
        },
      },
      {
        onTypeSelect: id => {
          state.typeIdx = Number(id);
          state.shapeIdx = getDefaultShapeIdx(root.types[state.typeIdx]!);
          render();
        },
        onShapeSelect: id => { state.shapeIdx = Number(id); render(); },
        onReveal: () => { state.revealed = true; render(); },
        onDiagramActivate: () => playCurrent(),
        onDiagramToggle: checked => {
          deps.settings.set({ hideDiagram: checked });
          state.revealed = false;
          render();
        },
        onFavoriteToggle: () => {
          deps.favorites.toggle(favoriteId);
          render();
        },
      },
    );
  }
}
