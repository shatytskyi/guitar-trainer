import { createButton } from './Button';
import type { Translator } from '../services/i18n';
import type { Lang, ChordSet, SettingsStore } from '../services/settings';

export interface TopBarOptions {
  i18n: Translator;
  settings: SettingsStore;
}

export function createTopBar(opts: TopBarOptions): { root: HTMLElement; refresh(): void } {
  const root = document.createElement('header');
  root.className = 'topbar';
  const title = document.createElement('h1');
  title.className = 'topbar__title';

  const setSwitch = document.createElement('div');
  setSwitch.className = 'topbar__switch';

  const langSwitch = document.createElement('div');
  langSwitch.className = 'topbar__switch';

  root.append(title, setSwitch, langSwitch);
  build();
  return { root, refresh: build };

  function build() {
    title.innerHTML = `${escapeHtml(opts.i18n.t('app.title'))}<em>${escapeHtml(opts.i18n.t('app.title.suffix'))}</em>`;

    setSwitch.replaceChildren();
    (['basic', 'extended'] as ChordSet[]).forEach(s => {
      const b = createButton({
        label: opts.i18n.t(`set.${s}`),
        variant: 'pill',
        active: opts.settings.get().set === s,
        onClick: () => opts.settings.set({ set: s }),
      });
      setSwitch.appendChild(b);
    });

    langSwitch.replaceChildren();
    (['ru', 'en', 'uk'] as Lang[]).forEach(l => {
      const b = createButton({
        label: opts.i18n.t(`lang.${l}`),
        variant: 'pill',
        active: opts.settings.get().lang === l,
        onClick: () => opts.settings.set({ lang: l }),
      });
      langSwitch.appendChild(b);
    });
  }
}

const ESCAPE_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ESCAPE_MAP[c] ?? c);
}
