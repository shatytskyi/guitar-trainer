import { renderFretboardDiagram } from './FretboardDiagram';
import { createButton } from './Button';
import { createRevealOverlay } from './RevealOverlay';
import type { ChordShape } from '../lib/chord';
import type { Translator } from '../services/i18n';

export interface ChordCardData {
  displayName: string;
  metaText: string;
  types: ReadonlyArray<{ id: string; label: string; active: boolean; highlight?: boolean }>;
  shapes: ReadonlyArray<{ id: string; label: string; active: boolean }>;
  shape: ChordShape;
  hidden: boolean;
}

export interface ChordCardCallbacks {
  onTypeSelect: (id: string) => void;
  onShapeSelect: (id: string) => void;
  onReveal: () => void;
  onDiagramActivate?: () => void;
}

export interface ChordCardHandle {
  root: HTMLElement;
  render(data: ChordCardData, cb: ChordCardCallbacks): void;
}

export function createChordCard(i18n: Translator): ChordCardHandle {
  const root = document.createElement('div');
  root.className = 'chord-card';

  const header = el('div', 'chord-card__header');
  const name = el('div', 'chord-card__name');
  const meta = el('div', 'chord-card__meta');
  header.append(name, meta);

  const typeRow = el('div', 'chord-card__row');
  const typeBtns = el('div', 'chord-card__row-btns');
  typeRow.append(typeBtns);

  const shapeRow = el('div', 'chord-card__row');
  const shapeBtns = el('div', 'chord-card__row-btns');
  shapeRow.append(shapeBtns);

  const diagramWrap = el('div', 'chord-card__diagram');

  root.append(header, typeRow, shapeRow, diagramWrap);

  let displayedHidden: boolean | undefined;
  let cancelExit: (() => void) | null = null;

  return {
    root,
    render(data: ChordCardData, cb: ChordCardCallbacks) {
      paintChordName(name, data.displayName);
      // The meta sub-line animates in via CSS (max-height + opacity).
      // The header keeps a fixed min-height so the diagram below never
      // moves; when meta is empty, the name centers alone in that space.
      meta.textContent = data.metaText;
      meta.classList.toggle('chord-card__meta--shown', data.metaText !== '');

      // Hide the row entirely when no options. In quiz the row is always
      // populated; in browse data.types is always [] so the internal type
      // row is permanently absent — both states are stable, no jumps.
      typeRow.style.display = data.types.length > 0 ? '' : 'none';
      typeBtns.replaceChildren(...data.types.map(t =>
        createButton({
          label: t.label,
          variant: 'pill',
          active: t.active,
          highlight: t.highlight === true,
          onClick: () => cb.onTypeSelect(t.id),
        }),
      ));

      shapeRow.style.display = data.shapes.length > 0 ? '' : 'none';
      shapeBtns.replaceChildren(...data.shapes.map(s =>
        createButton({
          label: s.label,
          variant: 'pill',
          active: s.active,
          onClick: () => cb.onShapeSelect(s.id),
        }),
      ));

      const transitioning =
        displayedHidden !== undefined &&
        displayedHidden !== data.hidden &&
        !prefersReducedMotion();
      displayedHidden = data.hidden;
      setDiagramActivation(diagramWrap, data.hidden ? undefined : cb.onDiagramActivate, i18n);

      if (cancelExit) {
        cancelExit();
        cancelExit = null;
      }

      const swapIn = () => {
        const next = buildDiagramContent(data, cb, i18n);
        next.classList.add('chord-card__diagram-content--enter');
        next.addEventListener('animationend', () => {
          next.classList.remove('chord-card__diagram-content--enter');
        }, { once: true });
        diagramWrap.replaceChildren(next);
      };

      if (!transitioning) {
        diagramWrap.replaceChildren(buildDiagramContent(data, cb, i18n));
        return;
      }

      const exiting = diagramWrap.firstElementChild as HTMLElement | null;
      if (!exiting) {
        swapIn();
        return;
      }

      exiting.classList.remove('chord-card__diagram-content--enter');
      exiting.classList.add('chord-card__diagram-content--exit');
      const onEnd = () => {
        exiting.removeEventListener('animationend', onEnd);
        cancelExit = null;
        swapIn();
      };
      exiting.addEventListener('animationend', onEnd);
      cancelExit = () => {
        exiting.removeEventListener('animationend', onEnd);
        exiting.classList.remove('chord-card__diagram-content--exit');
      };
    },
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildDiagramContent(
  data: ChordCardData,
  cb: ChordCardCallbacks,
  i18n: Translator,
): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'chord-card__diagram-content';
  if (data.hidden) {
    wrap.appendChild(createRevealOverlay({ i18n, onReveal: cb.onReveal }));
  } else {
    wrap.innerHTML = renderFretboardDiagram(data.shape);
  }
  return wrap;
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

function setDiagramActivation(
  host: HTMLElement,
  handler: (() => void) | undefined,
  i18n: Translator,
): void {
  const existing = (host as HTMLElement & { __activate?: (e: Event) => void }).__activate;
  if (existing) {
    host.removeEventListener('click', existing);
    host.removeEventListener('keydown', existing);
    delete (host as HTMLElement & { __activate?: (e: Event) => void }).__activate;
  }
  if (!handler) {
    host.classList.remove('chord-card__diagram--interactive');
    host.removeAttribute('role');
    host.removeAttribute('tabindex');
    host.removeAttribute('aria-label');
    return;
  }
  const onActivate = (e: Event) => {
    if (e.type === 'keydown') {
      const k = (e as KeyboardEvent).key;
      if (k !== 'Enter' && k !== ' ') return;
      e.preventDefault();
    }
    handler();
  };
  host.addEventListener('click', onActivate);
  host.addEventListener('keydown', onActivate);
  (host as HTMLElement & { __activate?: (e: Event) => void }).__activate = onActivate;
  host.classList.add('chord-card__diagram--interactive');
  host.setAttribute('role', 'button');
  host.setAttribute('tabindex', '0');
  host.setAttribute('aria-label', i18n.t('quiz.btn.play'));
}

const CHORD_NAME_RE = /^([A-G])(#)?(.*)$/;

/** Render chord name with the design-system markup so the sharp and quality
 *  pick up italic + accent styling. Falls back to plain text on bad input. */
function paintChordName(host: HTMLElement, displayName: string): void {
  host.replaceChildren();
  const match = CHORD_NAME_RE.exec(displayName);
  if (!match) {
    host.textContent = displayName;
    return;
  }
  const [, letter = '', sharp = '', quality = ''] = match;
  host.append(document.createTextNode(letter));
  if (sharp) {
    const span = document.createElement('span');
    span.className = 'chord-card__sharp';
    span.textContent = '♯';
    host.appendChild(span);
  }
  if (quality) {
    const em = document.createElement('em');
    em.textContent = quality;
    host.appendChild(em);
  }
}
