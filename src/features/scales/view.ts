import { getScaleDefinition } from '../../data/scales';
import { createButton } from '../../shared/components/Button';
import { renderScaleFretboard } from '../../shared/components/ScaleFretboard';
import { createStage } from '../../shared/components/Stage';
import type { FretboardScaleNote, ScalePlayDirection } from '../../shared/lib/scale';
import type { AudioOutput } from '../../shared/services/audio';
import type { Translator } from '../../shared/services/i18n';
import {
  SCALE_STEP_MS,
  createScalesState,
  currentScaleNotes,
  currentFretWindow,
  currentSequence,
  scaleDegreeText,
  selectRoot,
  selectScale,
  setActiveNote,
  setPlayback,
  type ScalesState,
} from './state';
import { focusByDataset, focusedDataset, moveTabFocus } from './rail';
import { paintScalePicker, paintScaleReadout, paintScaleRootRail, paintScaleSequence } from './view-parts';

export interface ScalesViewDeps {
  i18n: Translator;
  audio: AudioOutput;
}

export interface ScalesViewHandle {
  destroy(): void;
  refresh(deps: ScalesViewDeps): void;
}

export function mountScalesView(host: HTMLElement, initialDeps: ScalesViewDeps): ScalesViewHandle {
  let deps = initialDeps;
  let state: ScalesState = createScalesState();
  let timer: number | null = null;
  let playIdx = 0;

  const root = document.createElement('div');
  root.className = 'scales';

  const scaleRail = document.createElement('div');
  scaleRail.className = 'scales__scale-rail';
  scaleRail.setAttribute('role', 'tablist');
  scaleRail.addEventListener('keydown', e => moveTabFocus(e, scaleRail));
  root.appendChild(scaleRail);

  const stageWrap = document.createElement('div');
  stageWrap.className = 'scales__stage';
  stageWrap.id = 'scales-stage-panel';
  stageWrap.setAttribute('role', 'tabpanel');
  const stage = createStage();
  stageWrap.appendChild(stage.root);
  root.appendChild(stageWrap);

  const header = document.createElement('div');
  header.className = 'scales__header';
  const title = document.createElement('h2');
  title.className = 'scales__title';
  const meta = document.createElement('div');
  meta.className = 'scales__meta';
  header.append(title, meta);

  const fretboardScroll = document.createElement('div');
  fretboardScroll.className = 'scales__fretboard-scroll';

  const sequenceRail = document.createElement('div');
  sequenceRail.className = 'scales__sequence';

  const readout = document.createElement('div');
  readout.className = 'scales__readout';
  readout.setAttribute('aria-live', 'polite');

  stage.body.append(header, fretboardScroll, sequenceRail, readout);

  const controls = document.createElement('div');
  controls.className = 'scales__controls';
  const playUp = createButton({
    label: '',
    variant: 'primary',
    onClick: () => togglePlayback('ascending'),
  });
  const playDown = createButton({
    label: '',
    variant: 'ghost',
    onClick: () => togglePlayback('descending'),
  });
  const stop = createButton({
    label: '',
    variant: 'ghost',
    onClick: stopPlayback,
  });
  controls.append(playUp, playDown, stop);
  root.appendChild(controls);

  const rootRail = document.createElement('div');
  rootRail.className = 'root-rail scales__root-rail';
  rootRail.setAttribute('role', 'tablist');
  rootRail.addEventListener('keydown', e => moveTabFocus(e, rootRail));
  root.appendChild(rootRail);
  host.appendChild(root);

  render();

  return {
    destroy() {
      clearTimer();
      host.replaceChildren();
    },
    refresh(nextDeps) {
      deps = nextDeps;
      render();
    },
  };

  function render(): void {
    paintScaleRail();
    paintStage();
    paintControls();
    paintRootRail();
  }

  function paintScaleRail(): void {
    const focusedId = focusedDataset(scaleRail, 'scaleId');
    paintScalePicker(scaleRail, {
      i18n: deps.i18n,
      activeScaleId: state.scaleId,
      onSelect: scaleId => {
        clearTimer();
        state = selectScale(state, scaleId);
        render();
      },
    });
    if (focusedId) focusByDataset(scaleRail, 'scaleId', focusedId);
  }

  function paintStage(): void {
    const scale = getScaleDefinition(state.scaleId);
    const notes = currentScaleNotes(state);
    const sequence = currentSequence(state);
    const fretWindow = currentFretWindow(state);
    const active = state.activeNoteId
      ? notes.find(note => note.id === state.activeNoteId) ?? null
      : null;

    title.textContent = `${state.root} ${deps.i18n.t(scale.titleKey)}`;
    meta.textContent = scaleDegreeText(scale.id);
    fretboardScroll.replaceChildren(renderScaleFretboard({
      i18n: deps.i18n,
      notes,
      minFret: fretWindow.minFret,
      maxFret: fretWindow.maxFret,
      activeNoteId: state.activeNoteId,
      onNoteActivate: playSingleNote,
    }));

    paintScaleSequence(sequenceRail, {
      i18n: deps.i18n,
      sequence,
      activeNoteId: state.activeNoteId,
      onNoteSelect: playSequenceNote,
    });
    paintScaleReadout(readout, {
      i18n: deps.i18n,
      active,
      noteCount: notes.length,
      fretWindow,
    });

    if (state.activeNoteId) {
      window.requestAnimationFrame(() => {
        scrollActiveNoteIntoView();
        scrollActiveSequenceIntoView();
      });
    }
  }

  function paintControls(): void {
    const upActive = state.running && state.direction === 'ascending';
    const downActive = state.running && state.direction === 'descending';
    playUp.textContent = state.running && state.direction === 'ascending'
      ? deps.i18n.t('scales.pause')
      : deps.i18n.t('scales.play-up');
    playDown.textContent = state.running && state.direction === 'descending'
      ? deps.i18n.t('scales.pause')
      : deps.i18n.t('scales.play-down');
    playUp.classList.toggle('scales__control--active', upActive);
    playDown.classList.toggle('scales__control--active', downActive);
    playUp.setAttribute('aria-pressed', String(upActive));
    playDown.setAttribute('aria-pressed', String(downActive));
    stop.textContent = deps.i18n.t('scales.stop');
    stop.disabled = !state.running && state.activeNoteId === null;
  }

  function paintRootRail(): void {
    const focusedRoot = focusedDataset(rootRail, 'root');
    paintScaleRootRail(rootRail, {
      i18n: deps.i18n,
      activeRoot: state.root,
      onSelect: rootName => {
        clearTimer();
        state = selectRoot(state, rootName);
        render();
        focusByDataset(rootRail, 'root', rootName);
        scrollActiveRootIntoView();
      },
    });
    if (focusedRoot) focusByDataset(rootRail, 'root', focusedRoot);
  }

  function togglePlayback(direction: ScalePlayDirection): void {
    if (state.running && state.direction === direction) {
      pausePlayback();
      return;
    }

    const sequenceLength = currentSequence(state).length;
    if (state.direction !== direction || state.activeNoteId === null || playIdx >= sequenceLength) {
      playIdx = 0;
    }
    state = setPlayback(state, direction, true);
    playNextNote();
  }

  function playNextNote(): void {
    if (!state.running) return;
    const sequence = currentSequence(state);
    const note = sequence[playIdx];
    if (!note) {
      stopPlayback();
      return;
    }

    state = setActiveNote(state, note.id);
    render();
    void deps.audio.playNotes([note.note], { strumDelay: 0 });
    playIdx += 1;
    timer = window.setTimeout(
      playIdx >= sequence.length ? stopPlayback : playNextNote,
      SCALE_STEP_MS,
    );
  }

  function playSingleNote(note: FretboardScaleNote): void {
    clearTimer();
    playIdx = currentSequence(state).findIndex(item => item.id === note.id) + 1;
    state = setActiveNote(setPlayback(state, state.direction, false), note.id);
    render();
    void deps.audio.playNotes([note.note], { strumDelay: 0 });
  }

  function pausePlayback(): void {
    clearTimer();
    state = setPlayback(state, state.direction, false);
    render();
  }

  function stopPlayback(): void {
    clearTimer();
    playIdx = 0;
    state = setActiveNote(setPlayback(state, state.direction, false), null);
    render();
  }

  function clearTimer(): void {
    if (timer == null) return;
    window.clearTimeout(timer);
    timer = null;
  }

  function scrollActiveNoteIntoView(): void {
    const active = fretboardScroll.querySelector<HTMLElement>(`[data-note-id="${state.activeNoteId}"]`);
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function scrollActiveSequenceIntoView(): void {
    const active = sequenceRail.querySelector<HTMLElement>(`[data-note-id="${state.activeNoteId}"]`);
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function scrollActiveRootIntoView(): void {
    const active = rootRail.querySelector<HTMLElement>('.root-tile--active');
    if (!active) return;
    const targetLeft = active.offsetLeft - (rootRail.clientWidth - active.offsetWidth) / 2;
    rootRail.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  function playSequenceNote(note: FretboardScaleNote, idx: number): void {
    clearTimer();
    playIdx = idx + 1;
    state = setActiveNote(setPlayback(state, state.direction, false), note.id);
    render();
    void deps.audio.playNotes([note.note], { strumDelay: 0 });
  }

}
