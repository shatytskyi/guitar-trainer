import type { FretboardScaleNote } from '../lib/scale';
import type { Translator } from '../services/i18n';

const DISPLAY_STRINGS = [
  { index: 5, label: 'e' },
  { index: 4, label: 'B' },
  { index: 3, label: 'G' },
  { index: 2, label: 'D' },
  { index: 1, label: 'A' },
  { index: 0, label: 'E' },
] as const;

export interface ScaleFretboardOptions {
  readonly i18n: Translator;
  readonly notes: readonly FretboardScaleNote[];
  readonly minFret: number;
  readonly maxFret: number;
  readonly activeNoteId: string | null;
  readonly onNoteActivate: (note: FretboardScaleNote) => void;
}

export function renderScaleFretboard(opts: ScaleFretboardOptions): HTMLElement {
  const byPosition = new Map<string, FretboardScaleNote>();
  for (const note of opts.notes) byPosition.set(positionKey(note.stringIndex, note.fret), note);
  const fretCount = opts.maxFret - opts.minFret + 1;

  const root = document.createElement('div');
  root.className = 'scale-fretboard';
  root.style.setProperty('--scale-fret-count', String(fretCount));
  root.style.setProperty('--scale-fret-min-width', `${34 + fretCount * 46}px`);

  appendHeader(root, opts.minFret, opts.maxFret);

  for (const string of DISPLAY_STRINGS) {
    const label = document.createElement('div');
    label.className = 'scale-fretboard__string';
    label.textContent = string.label;
    root.appendChild(label);

    for (let fret = opts.minFret; fret <= opts.maxFret; fret += 1) {
      const note = byPosition.get(positionKey(string.index, fret));
      root.appendChild(note ? createNoteCell(note, opts) : createEmptyCell(fret));
    }
  }

  return root;
}

function appendHeader(root: HTMLElement, minFret: number, maxFret: number): void {
  const corner = document.createElement('div');
  corner.className = 'scale-fretboard__corner';
  root.appendChild(corner);

  for (let fret = minFret; fret <= maxFret; fret += 1) {
    const label = document.createElement('div');
    label.className = isMarkerFret(fret)
      ? 'scale-fretboard__fret scale-fretboard__fret--marker'
      : 'scale-fretboard__fret';
    label.textContent = String(fret);
    root.appendChild(label);
  }
}

function createEmptyCell(fret: number): HTMLElement {
  const cell = document.createElement('div');
  cell.className = cellClass(fret);
  return cell;
}

function createNoteCell(note: FretboardScaleNote, opts: ScaleFretboardOptions): HTMLElement {
  const cell = document.createElement('div');
  cell.className = cellClass(note.fret);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scale-fretboard__note';
  btn.dataset['noteId'] = note.id;
  btn.classList.toggle('scale-fretboard__note--root', note.isRoot);
  btn.classList.toggle('scale-fretboard__note--active', note.id === opts.activeNoteId);
  btn.setAttribute('aria-label', opts.i18n.t('scales.note-label', {
    note: note.note,
    degree: note.degree,
    fret: note.fret,
  }));
  btn.addEventListener('click', () => opts.onNoteActivate(note));

  const noteName = document.createElement('span');
  noteName.className = 'scale-fretboard__note-name';
  noteName.textContent = note.pitchClass;
  const degree = document.createElement('span');
  degree.className = 'scale-fretboard__degree';
  degree.textContent = note.degree;
  btn.append(noteName, degree);
  cell.appendChild(btn);
  return cell;
}

function cellClass(fret: number): string {
  const classes = ['scale-fretboard__cell'];
  if (fret === 0) classes.push('scale-fretboard__cell--nut');
  if (isMarkerFret(fret)) classes.push('scale-fretboard__cell--marker');
  return classes.join(' ');
}

function positionKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}

function isMarkerFret(fret: number): boolean {
  return fret === 3 || fret === 5 || fret === 7 || fret === 9 || fret === 12;
}
