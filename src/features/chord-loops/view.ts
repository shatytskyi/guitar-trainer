import { CHORDS_ALL } from '../../data/chords-all';
import { CHORD_LOOPS, type ChordLoop } from '../../data/progressions';
import { createButton } from '../../shared/components/Button';
import { renderFretboardDiagram } from '../../shared/components/FretboardDiagram';
import { createStage } from '../../shared/components/Stage';
import { chordDisplayName, type Chord, type ChordShape } from '../../shared/lib/chord';
import { getDefaultShapeIdx } from '../../shared/lib/music';
import type { AudioOutput } from '../../shared/services/audio';
import type { Translator } from '../../shared/services/i18n';
import {
  BEATS_PER_CHORD_OPTIONS,
  BPM_STEP,
  activeLoop,
  adjustBpm,
  advanceBeat,
  createLoopState,
  currentChord,
  nextChord,
  selectLoop,
  setBeatsPerChord,
  setRunning,
  type LoopTrainerState,
} from './state';

export interface ChordLoopsViewDeps {
  i18n: Translator;
  audio: AudioOutput;
}

export interface ChordLoopsViewHandle {
  destroy(): void;
  refresh(deps: ChordLoopsViewDeps): void;
}

export function mountChordLoopsView(
  host: HTMLElement,
  initialDeps: ChordLoopsViewDeps,
): ChordLoopsViewHandle {
  let deps = initialDeps;
  let state: LoopTrainerState = createLoopState();
  let timer: number | null = null;
  let renderedChordKey = '';

  const root = document.createElement('div');
  root.className = 'loops';

  const rail = document.createElement('div');
  rail.className = 'loops__rail';
  rail.setAttribute('role', 'tablist');
  rail.addEventListener('keydown', onRailKeydown);
  root.appendChild(rail);

  const stageWrap = document.createElement('div');
  stageWrap.className = 'loops__stage';
  const stage = createStage();
  stageWrap.appendChild(stage.root);
  root.appendChild(stageWrap);

  const header = document.createElement('div');
  header.className = 'loops__header';
  const category = document.createElement('span');
  category.className = 'loops__tag';
  const difficulty = document.createElement('span');
  difficulty.className = 'loops__tag loops__tag--soft';
  const round = document.createElement('span');
  round.className = 'loops__round';
  header.append(category, difficulty, round);

  const currentButton = document.createElement('button');
  currentButton.type = 'button';
  currentButton.className = 'loops__current';
  currentButton.addEventListener('click', () => { void playCurrent(); });
  const currentInfo = document.createElement('span');
  currentInfo.className = 'loops__current-info';
  const currentName = document.createElement('span');
  currentName.className = 'loops__current-name';
  const currentSub = document.createElement('span');
  currentSub.className = 'loops__current-sub';
  currentInfo.append(currentName, currentSub);
  const currentDiagram = document.createElement('span');
  currentDiagram.className = 'loops__diagram loops__diagram--current';
  currentButton.append(currentInfo, currentDiagram);

  const beatPips = document.createElement('div');
  beatPips.className = 'loops__beats';

  const nextLine = document.createElement('div');
  nextLine.className = 'loops__next';
  const nextInfo = document.createElement('div');
  nextInfo.className = 'loops__next-info';
  const nextLabel = document.createElement('span');
  nextLabel.className = 'loops__next-label';
  const nextName = document.createElement('span');
  nextName.className = 'loops__next-name';
  nextInfo.append(nextLabel, nextName);
  const nextDiagram = document.createElement('div');
  nextDiagram.className = 'loops__diagram loops__diagram--next';
  nextLine.append(nextInfo, nextDiagram);

  const changeBoard = document.createElement('div');
  changeBoard.className = 'loops__change-board';
  changeBoard.append(currentButton, nextLine);

  const sequence = document.createElement('div');
  sequence.className = 'loops__sequence';

  stage.body.append(header, changeBoard, beatPips, sequence);

  const controls = document.createElement('div');
  controls.className = 'loops__controls';
  const playBtn = createButton({
    label: '',
    variant: 'primary',
    onClick: () => {
      state = setRunning(state, !state.running);
      render();
      if (state.running) {
        void playCurrent();
        void playMetronome(true);
        scheduleNextTick();
      } else {
        clearTimer();
      }
    },
  });
  playBtn.classList.add('loops__play');

  const tempo = document.createElement('div');
  tempo.className = 'loops__tempo';
  const tempoDown = createButton({
    label: '−',
    variant: 'ghost',
    ariaLabel: deps.i18n.t('loops.tempo.down'),
    onClick: () => {
      state = adjustBpm(state, -BPM_STEP);
      render();
      restartTimer();
    },
  });
  tempoDown.classList.add('loops__stepper');
  const tempoReadout = document.createElement('div');
  tempoReadout.className = 'loops__tempo-readout';
  const tempoValue = document.createElement('strong');
  const tempoUnit = document.createElement('span');
  tempoReadout.append(tempoValue, tempoUnit);
  const tempoUp = createButton({
    label: '+',
    variant: 'ghost',
    ariaLabel: deps.i18n.t('loops.tempo.up'),
    onClick: () => {
      state = adjustBpm(state, BPM_STEP);
      render();
      restartTimer();
    },
  });
  tempoUp.classList.add('loops__stepper');
  tempo.append(tempoDown, tempoReadout, tempoUp);

  const beatOptions = document.createElement('div');
  beatOptions.className = 'loops__beat-options';

  controls.append(playBtn, tempo, beatOptions);
  root.appendChild(controls);
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

  function render() {
    rail.setAttribute('aria-label', deps.i18n.t('loops.select'));
    paintRail();
    paintStage();
    paintControls();
  }

  function paintRail() {
    const focusedId = focusedLoopId();
    rail.replaceChildren();
    const selected = activeLoop(state);
    for (const loop of CHORD_LOOPS) {
      const active = loop.id === selected.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'loops__loop-tab';
      btn.dataset['loopId'] = loop.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
      btn.addEventListener('click', () => {
        const switchingLoop = loop.id !== activeLoop(state).id;
        state = selectLoop(state, loop.id);
        if (switchingLoop) {
          state = setRunning(state, false);
          clearTimer();
        }
        render();
        focusLoop(loop.id);
        scrollActiveLoopIntoView();
      });

      const name = document.createElement('span');
      name.className = 'loops__loop-title';
      name.textContent = deps.i18n.t(loop.titleKey);
      const chords = document.createElement('span');
      chords.className = 'loops__loop-chords';
      chords.textContent = formatLoop(loop);
      btn.append(name, chords);
      rail.appendChild(btn);
    }
    if (focusedId) focusLoop(focusedId);
  }

  function paintStage() {
    const loop = activeLoop(state);
    const chord = currentChord(state);
    const upcoming = nextChord(state);
    const chordKey = `${loop.id}:${state.chordIdx}`;
    const chordChanged = renderedChordKey !== '' && renderedChordKey !== chordKey;
    renderedChordKey = chordKey;

    category.textContent = deps.i18n.t(`loops.category.${loop.category}`);
    difficulty.textContent = deps.i18n.t(`loops.difficulty.${loop.difficulty}`);
    round.textContent = deps.i18n.t('loops.round', { count: state.round });
    currentName.textContent = chordDisplayName(chord);
    currentSub.textContent = deps.i18n.t('loops.beat-count', {
      current: state.beatIdx + 1,
      total: state.beatsPerChord,
    });
    currentButton.setAttribute('aria-label', deps.i18n.t('loops.play-current', {
      chord: chordDisplayName(chord),
    }));
    nextLabel.textContent = deps.i18n.t('loops.next');
    nextName.textContent = chordDisplayName(upcoming);
    paintDiagram(currentDiagram, chord);
    paintDiagram(nextDiagram, upcoming);
    if (chordChanged) animateChordPanels();

    beatPips.replaceChildren();
    for (let i = 0; i < state.beatsPerChord; i += 1) {
      const pip = document.createElement('span');
      pip.className = i === state.beatIdx ? 'loops__beat loops__beat--active' : 'loops__beat';
      beatPips.appendChild(pip);
    }

    sequence.replaceChildren();
    loop.chords.forEach((item, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = idx === state.chordIdx
        ? 'loops__sequence-chord loops__sequence-chord--active'
        : 'loops__sequence-chord';
      chip.textContent = chordDisplayName(item);
      chip.addEventListener('click', () => {
        state = { ...state, chordIdx: idx, beatIdx: 0 };
        render();
        if (state.running) {
          void playCurrent();
          restartTimer();
        }
      });
      sequence.appendChild(chip);
    });
  }

  function paintControls() {
    playBtn.textContent = state.running ? deps.i18n.t('loops.pause') : deps.i18n.t('loops.start');
    tempoDown.setAttribute('aria-label', deps.i18n.t('loops.tempo.down'));
    tempoUp.setAttribute('aria-label', deps.i18n.t('loops.tempo.up'));
    tempoValue.textContent = String(state.bpm);
    tempoUnit.textContent = deps.i18n.t('loops.bpm');

    beatOptions.replaceChildren();
    for (const beats of BEATS_PER_CHORD_OPTIONS) {
      const btn = createButton({
        label: deps.i18n.t('loops.beats-option', { count: beats }),
        variant: 'pill',
        active: state.beatsPerChord === beats,
        onClick: () => {
          state = setBeatsPerChord(state, beats);
          render();
          restartTimer();
        },
      });
      beatOptions.appendChild(btn);
    }
  }

  function tick() {
    const before = state.chordIdx;
    state = advanceBeat(state);
    render();
    void playMetronome(state.beatIdx === 0);
    if (state.chordIdx !== before) void playCurrent();
    scheduleNextTick();
  }

  function scheduleNextTick() {
    clearTimer();
    if (!state.running) return;
    timer = window.setTimeout(tick, 60_000 / state.bpm);
  }

  function restartTimer() {
    if (!state.running) return;
    scheduleNextTick();
  }

  function clearTimer() {
    if (timer == null) return;
    window.clearTimeout(timer);
    timer = null;
  }

  async function playCurrent(): Promise<void> {
    const shape = findShape(currentChord(state));
    if (!shape) return;
    await deps.audio.playNotes(shape.notes);
  }

  async function playMetronome(accent: boolean): Promise<void> {
    await deps.audio.playMetronomeClick({ accent });
  }

  function paintDiagram(target: HTMLElement, chord: Chord) {
    const shape = findShape(chord);
    target.replaceChildren();
    if (!shape) return;
    target.innerHTML = renderFretboardDiagram(shape);
  }

  function animateChordPanels() {
    currentButton.classList.remove('loops__current--swap');
    nextLine.classList.remove('loops__next--swap');
    void currentButton.offsetWidth;
    currentButton.classList.add('loops__current--swap');
    nextLine.classList.add('loops__next--swap');
  }

  function focusedLoopId(): string | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement) || !rail.contains(active)) return null;
    return active.dataset['loopId'] ?? null;
  }

  function focusLoop(loopId: string) {
    for (const btn of rail.querySelectorAll<HTMLButtonElement>('.loops__loop-tab')) {
      if (btn.dataset['loopId'] === loopId) {
        btn.focus();
        return;
      }
    }
  }

  function scrollActiveLoopIntoView() {
    const active = rail.querySelector<HTMLElement>('.loops__loop-tab[aria-selected="true"]');
    if (!active) return;
    const targetLeft = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
    rail.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  function onRailKeydown(e: KeyboardEvent) {
    const tabs = Array.from(rail.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    if (tabs.length === 0) return;
    const currentIdx = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const fallbackIdx = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    const idx = currentIdx >= 0 ? currentIdx : Math.max(fallbackIdx, 0);
    let nextIdx: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = tabs.length - 1;
    if (nextIdx == null) return;

    e.preventDefault();
    tabs[nextIdx]?.click();
  }
}

function formatLoop(loop: ChordLoop): string {
  return loop.chords.map(chordDisplayName).join(' · ');
}

function findShape(chord: Chord): ChordShape | null {
  const root = CHORDS_ALL.find(entry => entry.root === chord.root);
  const type = root?.types.find(entry => entry.type === chord.type);
  if (!type) return null;
  return type.shapes[getDefaultShapeIdx(type)] ?? null;
}
