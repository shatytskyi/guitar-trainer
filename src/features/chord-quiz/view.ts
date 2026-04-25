import { createStage } from '../../shared/components/Stage';
import { createChordCard } from '../../shared/components/ChordCard';
import { createButton } from '../../shared/components/Button';
import { createToggleSwitch } from '../../shared/components/ToggleSwitch';
import { chordDisplayName } from '../../shared/lib/chord';
import { getDefaultShapeIdx } from '../../shared/lib/music';
import type { Translator } from '../../shared/services/i18n';
import type { AudioOutput } from '../../shared/services/audio';
import type { SettingsStore } from '../../shared/services/settings';
import { newState, nextChord, type QuizState } from './state';

export interface QuizViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  settings: SettingsStore;
}

export function mountQuizView(host: HTMLElement, deps: QuizViewDeps): () => void {
  const toolbar = document.createElement('div');
  toolbar.className = 'quiz-toolbar';
  const toolbarLabel = document.createElement('span');
  toolbarLabel.className = 'quiz-toolbar__label';
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
  toolbar.append(toolbarLabel, toggle.el);
  host.appendChild(toolbar);

  const stage = createStage();
  host.appendChild(stage.root);

  const card = createChordCard(deps.i18n);
  stage.body.appendChild(card.root);

  const controls = document.createElement('div');
  controls.className = 'quiz-controls';
  const playBtn = createButton({
    label: deps.i18n.t('quiz.btn.play'),
    variant: 'primary',
    onClick: () => playCurrent(),
  });
  const nextBtn = createButton({
    label: deps.i18n.t('quiz.btn.next'),
    variant: 'ghost',
    onClick: () => { state = nextChord(state); render(); },
  });
  controls.append(playBtn, nextBtn);
  stage.body.appendChild(controls);

  let state: QuizState = newState(deps.settings.get().set);
  render();

  return () => {
    host.replaceChildren();
  };

  function playCurrent() {
    const shape = state.current.type.shapes[state.shapeIdx];
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
          label: t.type === '' ? '—' : deps.i18n.t(`chord.type.${t.type}`),
          active: i === state.typeIdx,
          highlight: i === state.originalTypeIdx && i !== state.typeIdx,
        })),
        shapes: type.shapes.map((s, i) => ({
          id: String(i),
          label: deps.i18n.t(`shape.${s.label}`) + (s.recommended ? ' ' + deps.i18n.t('shape.recommended') : ''),
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
      },
    );
  }
}
