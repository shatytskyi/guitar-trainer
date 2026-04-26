import { createButton } from './Button';
import type { Translator } from '../services/i18n';
import type { ChordSet } from '../services/settings';

const CHORD_SET_OPTIONS: readonly ChordSet[] = ['basic', 'extended', 'all', 'favorites'];

export interface ChordSetSelectorOptions {
  i18n: Translator;
  value: ChordSet;
  ariaLabel: string;
  onSelect(set: ChordSet): void;
}

export interface ChordSetSelectorHandle {
  root: HTMLElement;
  render(opts: ChordSetSelectorOptions): void;
}

export function createChordSetSelector(opts: ChordSetSelectorOptions): ChordSetSelectorHandle {
  const root = document.createElement('div');
  root.className = 'set-switch';
  root.setAttribute('role', 'radiogroup');

  const handle = { root, render };
  render(opts);
  return handle;

  function render(next: ChordSetSelectorOptions): void {
    root.setAttribute('aria-label', next.ariaLabel);
    root.replaceChildren(...CHORD_SET_OPTIONS.map(set => {
      const active = next.value === set;
      const btn = createButton({
        label: next.i18n.t(`set.${set}`),
        variant: 'pill',
        active,
        onClick: () => { next.onSelect(set); },
      });
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(active));
      return btn;
    }));
  }
}
