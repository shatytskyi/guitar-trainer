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
  const typeLabel = el('span', 'chord-card__row-label');
  typeLabel.textContent = i18n.t('quiz.label.type');
  const typeBtns = el('div', 'chord-card__row-btns');
  typeRow.append(typeLabel, typeBtns);

  const shapeRow = el('div', 'chord-card__row');
  const shapeLabel = el('span', 'chord-card__row-label');
  shapeLabel.textContent = i18n.t('quiz.label.shape');
  const shapeBtns = el('div', 'chord-card__row-btns');
  shapeRow.append(shapeLabel, shapeBtns);

  const diagramWrap = el('div', 'chord-card__diagram');

  root.append(header, typeRow, shapeRow, diagramWrap);

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

      diagramWrap.replaceChildren();
      if (data.hidden) {
        const overlay = createRevealOverlay({ i18n, onReveal: cb.onReveal });
        diagramWrap.appendChild(overlay);
        setDiagramActivation(diagramWrap, undefined, i18n);
      } else {
        diagramWrap.innerHTML = renderFretboardDiagram(data.shape);
        setDiagramActivation(diagramWrap, cb.onDiagramActivate, i18n);
      }
    },
  };
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
