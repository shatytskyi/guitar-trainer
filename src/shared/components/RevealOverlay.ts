import type { Translator } from '../services/i18n';

export interface RevealOverlayOptions {
  i18n: Translator;
  onReveal: () => void;
}

export function createRevealOverlay(opts: RevealOverlayOptions): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'reveal-overlay';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'reveal-overlay__icon';
  iconSpan.textContent = '◆';
  const textSpan = document.createElement('span');
  textSpan.className = 'reveal-overlay__text';
  textSpan.textContent = opts.i18n.t('quiz.reveal');
  el.append(iconSpan, textSpan);
  el.addEventListener('click', opts.onReveal);
  return el;
}
