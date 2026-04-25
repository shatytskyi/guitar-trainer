export type ButtonVariant = 'primary' | 'ghost' | 'pill' | 'icon';

export interface ButtonOptions {
  label: string;
  variant: ButtonVariant;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export function createButton(opts: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = opts.label;
  btn.classList.add('btn', `btn--${opts.variant}`);
  if (opts.active) btn.classList.add('btn--active');
  if (opts.highlight) btn.classList.add('btn--highlight');
  if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
  btn.addEventListener('click', opts.onClick);
  return btn;
}
