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
}

export interface ChordCardHandle {
  root: HTMLElement;
  render(data: ChordCardData, cb: ChordCardCallbacks): void;
}

export function createChordCard(i18n: Translator): ChordCardHandle {
  const root = document.createElement('div');
  root.className = 'chord-card';

  const name = el('div', 'chord-card__name');
  const meta = el('div', 'chord-card__meta');

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

  root.append(name, meta, typeRow, shapeRow, diagramWrap);

  return {
    root,
    render(data: ChordCardData, cb: ChordCardCallbacks) {
      name.textContent = data.displayName;
      meta.textContent = data.metaText;

      typeRow.style.display = data.types.length > 1 ? '' : 'none';
      typeBtns.replaceChildren(...data.types.map(t =>
        createButton({
          label: t.label,
          variant: 'pill',
          active: t.active,
          highlight: t.highlight === true,
          onClick: () => cb.onTypeSelect(t.id),
        }),
      ));

      shapeRow.style.display = data.shapes.length > 1 ? '' : 'none';
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
      } else {
        diagramWrap.innerHTML = renderFretboardDiagram(data.shape);
      }
    },
  };
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
