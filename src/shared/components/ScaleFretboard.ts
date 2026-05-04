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
  const firstFret = Math.max(1, opts.minFret);
  const fretCount = opts.maxFret - firstFret + 1;

  const root = document.createElement('div');
  root.className = 'scale-fretboard';
  root.style.setProperty('--scale-fret-count', String(fretCount));
  root.style.setProperty('--scale-fret-min-width', `${40 + fretCount * 46}px`);

  appendHeader(root, firstFret, opts.maxFret);

  for (const string of DISPLAY_STRINGS) {
    const openNote = byPosition.get(positionKey(string.index, 0));
    root.appendChild(createStringCell(string.label, openNote, opts));

    for (let fret = firstFret; fret <= opts.maxFret; fret += 1) {
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
    const classes = ['scale-fretboard__fret'];
    if (isMarkerFret(fret)) classes.push('scale-fretboard__fret--marker');
    label.className = classes.join(' ');
    label.textContent = String(fret);
    root.appendChild(label);
  }
}

function createEmptyCell(fret: number): HTMLElement {
  const cell = document.createElement('div');
  cell.className = cellClass(fret);
  return cell;
}

function createStringCell(
  label: string,
  openNote: FretboardScaleNote | undefined,
  opts: ScaleFretboardOptions,
): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'scale-fretboard__string';
  if (openNote) {
    cell.appendChild(createNoteButton(openNote, opts));
    return cell;
  }

  cell.textContent = label;
  return cell;
}

function createNoteCell(note: FretboardScaleNote, opts: ScaleFretboardOptions): HTMLElement {
  const cell = document.createElement('div');
  cell.className = cellClass(note.fret);
  cell.appendChild(createNoteButton(note, opts));
  return cell;
}

function createNoteButton(note: FretboardScaleNote, opts: ScaleFretboardOptions): HTMLButtonElement {
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
  return btn;
}

function cellClass(fret: number): string {
  const classes = ['scale-fretboard__cell'];
  if (fret === 1) classes.push('scale-fretboard__cell--nut');
  if (isMarkerFret(fret)) classes.push('scale-fretboard__cell--marker');
  return classes.join(' ');
}

function positionKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}

function isMarkerFret(fret: number): boolean {
  return fret === 3 || fret === 5 || fret === 7 || fret === 9 || fret === 12;
}
