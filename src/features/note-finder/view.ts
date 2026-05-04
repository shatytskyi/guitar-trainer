import { createStage } from '../../shared/components/Stage';
import { renderNoteFinderFretboard } from '../../shared/components/NoteFinderFretboard';
import { buildFretboardPositions } from '../../shared/lib/fretboard';
import { PITCH_CLASSES } from '../../shared/lib/note';
import type { Translator } from '../../shared/services/i18n';
import {
  NOTE_FINDER_MAX_FRET,
  createNoteFinderState,
  isPitchClassSelected,
  pitchClassColorVar,
  selectedPitchClassSet,
  togglePitchClass,
  type NoteFinderState,
} from './state';

export interface NoteFinderViewDeps {
  i18n: Translator;
}

export interface NoteFinderViewHandle {
  destroy(): void;
  refresh(deps: NoteFinderViewDeps): void;
}

const POSITIONS = buildFretboardPositions({ minFret: 0, maxFret: NOTE_FINDER_MAX_FRET });

export function mountNoteFinderView(host: HTMLElement, initialDeps: NoteFinderViewDeps): NoteFinderViewHandle {
  let deps = initialDeps;
  let state: NoteFinderState = createNoteFinderState();

  const root = document.createElement('div');
  root.className = 'note-finder';

  const selector = document.createElement('div');
  selector.className = 'note-finder__selector';
  selector.setAttribute('role', 'group');
  root.appendChild(selector);

  const stageWrap = document.createElement('div');
  stageWrap.className = 'note-finder__stage';
  const stage = createStage();
  stageWrap.appendChild(stage.root);
  root.appendChild(stageWrap);

  const header = document.createElement('div');
  header.className = 'note-finder__header';
  const title = document.createElement('h2');
  title.className = 'note-finder__title';
  header.appendChild(title);

  const fretboardScroll = document.createElement('div');
  fretboardScroll.className = 'note-finder__fretboard-scroll';
  stage.body.append(header, fretboardScroll);

  host.appendChild(root);
  render();

  return {
    destroy() {
      host.replaceChildren();
    },
    refresh(nextDeps) {
      deps = nextDeps;
      render();
    },
  };

  function render(): void {
    paintSelector();
    paintFretboard();
  }

  function paintSelector(): void {
    const focusedNote = selector.querySelector<HTMLElement>('[data-focused="true"]')?.dataset['pitchClass'] ?? null;
    selector.replaceChildren();
    selector.setAttribute('aria-label', deps.i18n.t('note-finder.select-notes'));

    for (const pitchClass of PITCH_CLASSES) {
      const active = isPitchClassSelected(state, pitchClass);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'note-finder__note-toggle';
      btn.classList.toggle('note-finder__note-toggle--active', active);
      btn.style.setProperty('--note-color', `var(${pitchClassColorVar(pitchClass)})`);
      btn.dataset['pitchClass'] = pitchClass;
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', deps.i18n.t('note-finder.note-toggle', { note: pitchClass }));
      btn.textContent = pitchClass;
      btn.addEventListener('focus', () => {
        selector.querySelector<HTMLElement>('[data-focused="true"]')?.removeAttribute('data-focused');
        btn.dataset['focused'] = 'true';
      });
      btn.addEventListener('blur', () => {
        btn.removeAttribute('data-focused');
      });
      btn.addEventListener('click', () => {
        state = togglePitchClass(state, pitchClass);
        render();
        focusPitchClass(pitchClass);
      });
      selector.appendChild(btn);
    }

    if (focusedNote) focusPitchClass(focusedNote);
  }

  function paintFretboard(): void {
    title.textContent = deps.i18n.t('feature.note-finder.title');
    fretboardScroll.replaceChildren(renderNoteFinderFretboard({
      i18n: deps.i18n,
      positions: POSITIONS,
      selectedPitchClasses: selectedPitchClassSet(state),
      minFret: 0,
      maxFret: NOTE_FINDER_MAX_FRET,
      colorVarForPitchClass: pitchClassColorVar,
    }));
  }

  function focusPitchClass(pitchClass: string): void {
    const btn = selector.querySelector<HTMLButtonElement>(`[data-pitch-class="${cssEscape(pitchClass)}"]`);
    btn?.focus({ preventScroll: true });
  }
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(value)
    : value.replace(/"/g, '\\"');
}
