import { createStage } from '../../shared/components/Stage';
import { createChordCard } from '../../shared/components/ChordCard';
import { createButton } from '../../shared/components/Button';
import { createToggleSwitch } from '../../shared/components/ToggleSwitch';
import { chordDisplayName } from '../../shared/lib/chord';
import { getDefaultShapeIdx } from '../../shared/lib/music';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { SettingsStore } from '../../shared/services/settings';
import { newState, nextChord, syncQuizSet, type QuizState } from './state';

const RECOMMENDED_MARK = '★';

export interface QuizViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export interface QuizViewHandle {
  destroy(): void;
  refresh(deps: QuizViewDeps): void;
}

export function mountQuizView(host: HTMLElement, initialDeps: QuizViewDeps): QuizViewHandle {
  let deps = initialDeps;
  let state: QuizState = newState(deps.settings.get().set);

  const toolbar = document.createElement('div');
  toolbar.className = 'quiz-toolbar';
  const toolbarLabel = document.createElement('label');
  toolbarLabel.className = 'quiz-toolbar__label';
  toolbarLabel.htmlFor = 'quiz-hide-diagram-toggle';
  toolbarLabel.textContent = deps.i18n.t('quiz.hide-diagram');
  const toggle = createToggleSwitch({
    initial: deps.settings.get().hideDiagram,
    ariaLabel: deps.i18n.t('quiz.hide-diagram'),
    onChange: v => {
      deps.settings.set({ hideDiagram: v });
      state.revealed = false;
      render();
    },
  });
  toggle.el.id = toolbarLabel.htmlFor;
  toolbar.append(toolbarLabel, toggle.el);
  host.appendChild(toolbar);

  const stage = createStage();
  host.appendChild(stage.root);

  const card = createChordCard(deps.i18n);
  stage.body.appendChild(card.root);

  const controls = document.createElement('div');
  controls.className = 'quiz-controls';
  const nextBtn = createButton({
    label: deps.i18n.t('quiz.btn.next'),
    variant: 'primary',
    onClick: () => { state = nextChord(state); render(); },
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
      state = syncQuizSet(state, deps.settings.get().set);
      const hideDiagramLabel = deps.i18n.t('quiz.hide-diagram');
      toolbarLabel.textContent = hideDiagramLabel;
      toggle.el.setAttribute('aria-label', hideDiagramLabel);
      toggle.set(deps.settings.get().hideDiagram);
      nextBtn.textContent = deps.i18n.t('quiz.btn.next');
      render();
    },
  };

  function playCurrent() {
    const type = state.current.root.types[state.typeIdx];
    const shape = type?.shapes[state.shapeIdx];
    if (shape) void deps.audio.playNotes(shape.notes);
  }

  function render() {
    const root = state.current.root;
    const type = root.types[state.typeIdx]!;
    const shape = type.shapes[state.shapeIdx]!;
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
      },
    );
  }
}
