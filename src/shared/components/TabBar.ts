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
      root.appendChild(btn);
    });
  }
}
