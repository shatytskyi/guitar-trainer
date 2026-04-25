import { createButton } from './Button';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastHandle {
  dismiss(): void;
}

export function showToast(opts: ToastOptions): ToastHandle {
  const root = document.createElement('div');
  root.className = 'toast';
  root.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.className = 'toast__text';
  text.textContent = opts.message;
  root.appendChild(text);

  if (opts.actionLabel !== undefined && opts.onAction) {
    const onAction = opts.onAction;
    const btn = createButton({
      label: opts.actionLabel,
      variant: 'pill',
      onClick: () => { onAction(); dismiss(); },
    });
    btn.classList.add('toast__action');
    root.appendChild(btn);
  }

  document.body.appendChild(root);
  requestAnimationFrame(() => root.classList.add('toast--visible'));

  function dismiss() {
    root.classList.remove('toast--visible');
    setTimeout(() => root.remove(), 200);
  }

  return { dismiss };
}
