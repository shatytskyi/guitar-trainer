export function focusedDataset(root: HTMLElement, key: string): string | null {
  const active = document.activeElement;
  return active instanceof HTMLButtonElement && root.contains(active)
    ? active.dataset[key] ?? null
    : null;
}

export function focusByDataset(root: HTMLElement, key: string, value: string): void {
  for (const btn of root.querySelectorAll<HTMLButtonElement>('button')) {
    if (btn.dataset[key] === value) {
      btn.focus();
      return;
    }
  }
}

export function moveTabFocus(e: KeyboardEvent, root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  if (tabs.length === 0) return;

  const currentIdx = tabs.indexOf(document.activeElement as HTMLButtonElement);
  const fallbackIdx = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  const idx = currentIdx >= 0 ? currentIdx : Math.max(fallbackIdx, 0);
  let nextIdx: number | null = null;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % tabs.length;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home') nextIdx = 0;
  if (e.key === 'End') nextIdx = tabs.length - 1;
  if (nextIdx == null) return;

  e.preventDefault();
  tabs[nextIdx]?.click();
}
