export interface ToggleSwitchOptions {
  initial: boolean;
  ariaLabel: string;
  onChange: (value: boolean) => void;
}

export function createToggleSwitch(opts: ToggleSwitchOptions): {
  el: HTMLButtonElement;
  set(value: boolean): void;
} {
  let value = opts.initial;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toggle-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-label', opts.ariaLabel);
  paint();
  btn.addEventListener('click', () => {
    value = !value;
    paint();
    opts.onChange(value);
  });
  return {
    el: btn,
    set(v) { value = v; paint(); },
  };
  function paint() {
    btn.classList.toggle('toggle-switch--on', value);
    btn.setAttribute('aria-checked', String(value));
  }
}
