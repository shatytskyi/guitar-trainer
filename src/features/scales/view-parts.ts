import { SCALE_DEFINITIONS, type ScaleId } from '../../data/scales';
import type { PitchClass } from '../../shared/lib/note';
import type { FretboardScaleNote, ScaleFretWindow } from '../../shared/lib/scale';
import type { Translator } from '../../shared/services/i18n';
import { SCALE_ROOTS } from './state';

export function paintScalePicker(
  target: HTMLElement,
  options: {
    readonly i18n: Translator;
    readonly activeScaleId: ScaleId;
    readonly onSelect: (scaleId: ScaleId) => void;
  },
): void {
  target.setAttribute('aria-label', options.i18n.t('scales.select-scale'));
  target.replaceChildren();

  for (const scale of SCALE_DEFINITIONS) {
    const active = scale.id === options.activeScaleId;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = active ? 'btn btn--pill btn--active' : 'btn btn--pill';
    btn.textContent = options.i18n.t(scale.shortTitleKey);
    btn.dataset['scaleId'] = scale.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(active));
    btn.setAttribute('aria-controls', 'scales-stage-panel');
    btn.tabIndex = active ? 0 : -1;
    btn.addEventListener('click', () => options.onSelect(scale.id));
    target.appendChild(btn);
  }
}

export function paintScaleRootRail(
  target: HTMLElement,
  options: {
    readonly i18n: Translator;
    readonly activeRoot: PitchClass;
    readonly onSelect: (root: PitchClass) => void;
  },
): void {
  target.setAttribute('aria-label', options.i18n.t('scales.select-root'));
  target.replaceChildren();

  SCALE_ROOTS.forEach(rootName => {
    const active = rootName === options.activeRoot;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = active ? 'root-tile root-tile--active' : 'root-tile';
    btn.dataset['root'] = rootName;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(active));
    btn.setAttribute('aria-controls', 'scales-stage-panel');
    btn.tabIndex = active ? 0 : -1;
    btn.addEventListener('click', () => options.onSelect(rootName));

    const name = document.createElement('div');
    name.className = 'root-tile__name';
    name.textContent = rootName.replace('#', '♯');
    btn.appendChild(name);
    target.appendChild(btn);
  });
}

export function paintScaleSequence(
  target: HTMLElement,
  options: {
    readonly i18n: Translator;
    readonly sequence: readonly FretboardScaleNote[];
    readonly activeNoteId: string | null;
    readonly onNoteSelect: (note: FretboardScaleNote, idx: number) => void;
  },
): void {
  target.replaceChildren();
  options.sequence.forEach((note, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'scales__sequence-step';
    chip.classList.toggle('scales__sequence-step--root', note.isRoot);
    chip.classList.toggle('scales__sequence-step--active', note.id === options.activeNoteId);
    chip.dataset['noteId'] = note.id;
    chip.setAttribute('aria-label', options.i18n.t('scales.step-label', {
      step: idx + 1,
      note: note.note,
      degree: note.degree,
    }));
    chip.addEventListener('click', () => options.onNoteSelect(note, idx));

    const number = document.createElement('span');
    number.className = 'scales__sequence-index';
    number.textContent = String(idx + 1);
    const label = document.createElement('span');
    label.className = 'scales__sequence-note';
    label.textContent = note.pitchClass;
    const degree = document.createElement('span');
    degree.className = 'scales__sequence-degree';
    degree.textContent = note.degree;
    chip.append(number, label, degree);
    target.appendChild(chip);
  });
}

export function paintScaleReadout(
  target: HTMLElement,
  options: {
    readonly i18n: Translator;
    readonly active: FretboardScaleNote | null;
    readonly noteCount: number;
    readonly fretWindow: ScaleFretWindow;
  },
): void {
  target.replaceChildren();

  if (!options.active) {
    const summary = document.createElement('span');
    summary.className = 'scales__readout-summary';
    summary.textContent = options.i18n.t('scales.pattern-summary', {
      count: options.noteCount,
      start: options.fretWindow.minFret,
      end: options.fretWindow.maxFret,
    });
    target.appendChild(summary);
    return;
  }

  const note = document.createElement('strong');
  note.className = 'scales__readout-note';
  note.textContent = options.active.note;
  const degree = document.createElement('span');
  degree.className = 'scales__readout-degree';
  degree.textContent = options.active.degree;
  const position = document.createElement('span');
  position.className = 'scales__readout-position';
  position.textContent = options.i18n.t('scales.position-label', {
    string: stringLabel(options.active.stringIndex),
    fret: options.active.fret,
  });
  target.append(note, degree, position);
}

function stringLabel(index: number): string {
  return ['E', 'A', 'D', 'G', 'B', 'e'][index] ?? '';
}
