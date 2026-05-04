import type { FretboardPosition } from '../lib/fretboard';
import type { PitchClass } from '../lib/note';
import type { Translator } from '../services/i18n';

const DISPLAY_STRINGS = [
  { index: 5, label: 'e' },
  { index: 4, label: 'B' },
  { index: 3, label: 'G' },
  { index: 2, label: 'D' },
  { index: 1, label: 'A' },
  { index: 0, label: 'E' },
] as const;

export interface NoteFinderFretboardOptions {
  readonly i18n: Translator;
  readonly positions: readonly FretboardPosition[];
  readonly selectedPitchClasses: ReadonlySet<PitchClass>;
  readonly minFret: number;
  readonly maxFret: number;
  readonly colorVarForPitchClass: (pitchClass: PitchClass) => string;
}

export function renderNoteFinderFretboard(opts: NoteFinderFretboardOptions): HTMLElement {
  const byPosition = new Map<string, FretboardPosition>();
  for (const position of opts.positions) {
    byPosition.set(positionKey(position.stringIndex, position.fret), position);
  }

  const fretCount = opts.maxFret - opts.minFret + 1;
  const root = document.createElement('div');
  root.className = 'note-finder-fretboard';
  root.style.setProperty('--note-finder-fret-count', String(fretCount));
  root.style.setProperty('--note-finder-fret-min-width', `${30 + fretCount * 42}px`);

  appendHeader(root, opts.minFret, opts.maxFret);

  for (const string of DISPLAY_STRINGS) {
    const label = document.createElement('div');
    label.className = 'note-finder-fretboard__string';
    label.textContent = string.label;
    root.appendChild(label);

    for (let fret = opts.minFret; fret <= opts.maxFret; fret += 1) {
      const position = byPosition.get(positionKey(string.index, fret));
      root.appendChild(position ? createCell(position, opts) : createCellShell(fret));
    }
  }

  return root;
}

function appendHeader(root: HTMLElement, minFret: number, maxFret: number): void {
  const corner = document.createElement('div');
  corner.className = 'note-finder-fretboard__corner';
  root.appendChild(corner);

  for (let fret = minFret; fret <= maxFret; fret += 1) {
    const label = document.createElement('div');
    const classes = ['note-finder-fretboard__fret'];
    if (fret === 0) classes.push('note-finder-fretboard__fret--open');
    if (isMarkerFret(fret)) classes.push('note-finder-fretboard__fret--marker');
    label.className = classes.join(' ');
    label.textContent = String(fret);
    root.appendChild(label);
  }
}

function createCell(position: FretboardPosition, opts: NoteFinderFretboardOptions): HTMLElement {
  const cell = createCellShell(position.fret);
  if (!opts.selectedPitchClasses.has(position.pitchClass)) return cell;

  const marker = document.createElement('span');
  marker.className = 'note-finder-fretboard__note';
  marker.style.setProperty('--note-color', `var(${opts.colorVarForPitchClass(position.pitchClass)})`);
  marker.textContent = position.note;
  marker.setAttribute('aria-label', opts.i18n.t('note-finder.position-label', {
    note: position.note,
    string: position.stringLabel,
    fret: position.fret,
  }));
  cell.appendChild(marker);
  return cell;
}

function createCellShell(fret: number): HTMLElement {
  const cell = document.createElement('div');
  cell.className = cellClass(fret);
  return cell;
}

function cellClass(fret: number): string {
  const classes = ['note-finder-fretboard__cell'];
  if (fret === 0) classes.push('note-finder-fretboard__cell--nut');
  if (isMarkerFret(fret)) classes.push('note-finder-fretboard__cell--marker');
  return classes.join(' ');
}

function positionKey(stringIndex: number, fret: number): string {
  return `${stringIndex}:${fret}`;
}

function isMarkerFret(fret: number): boolean {
  return fret === 3 || fret === 5 || fret === 7 || fret === 9
    || fret === 12 || fret === 15 || fret === 17 || fret === 19
    || fret === 21 || fret === 24;
}
