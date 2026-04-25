export interface AppShellSlots {
  root: HTMLElement;
  topBarSlot: HTMLElement;
  navSlot: HTMLElement;
  toolbarSlot: HTMLElement;
  contentSlot: HTMLElement;
}

export function createAppShell(): AppShellSlots {
  const root = document.createElement('div');
  root.className = 'app-shell';
  const topBarSlot = el('div', 'app-shell__topbar');
  const navSlot = el('div', 'app-shell__nav');
  const toolbarSlot = el('div', 'app-shell__toolbar');
  const contentSlot = el('div', 'app-shell__content');
  const version = el('div', 'app-version');
  version.textContent = `v${__APP_VERSION__}`;
  root.append(topBarSlot, navSlot, toolbarSlot, contentSlot, version);
  return { root, topBarSlot, navSlot, toolbarSlot, contentSlot };
}

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
