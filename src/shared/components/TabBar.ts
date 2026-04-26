import { createButton } from './Button';
import type { Translator } from '../services/i18n';

export interface TabBarTab {
  id: string;
  titleKey: string;
}

export interface TabBarOptions {
  tabs: readonly TabBarTab[];
  i18n: Translator;
  getActive: () => string;
  onSelect: (id: string) => void;
}

export function createTabBar(opts: TabBarOptions): { root: HTMLElement; refresh(): void } {
  const root = document.createElement('nav');
  root.className = 'tabbar';
  build();
  return { root, refresh: build };

  function build() {
    const focusedTab = getFocusedTabId();
    root.replaceChildren();
    const active = opts.getActive();
    opts.tabs.forEach(tab => {
      const btn = createButton({
        label: opts.i18n.t(tab.titleKey),
        variant: 'ghost',
        active: tab.id === active,
        onClick: () => opts.onSelect(tab.id),
      });
      btn.classList.add('tabbar__tab');
      btn.dataset['tabId'] = tab.id;
      if (tab.id === active) btn.setAttribute('aria-current', 'page');
      root.appendChild(btn);
    });
    if (focusedTab) focusTab(focusedTab);
  }

  function getFocusedTabId(): string | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement) || !root.contains(active)) return null;
    return active.dataset['tabId'] ?? null;
  }

  function focusTab(id: string): void {
    for (const btn of root.querySelectorAll<HTMLButtonElement>('.tabbar__tab')) {
      if (btn.dataset['tabId'] === id) {
        btn.focus();
        return;
      }
    }
  }
}
