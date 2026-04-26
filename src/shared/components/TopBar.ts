import { createButton } from './Button';
import type { Translator } from '../services/i18n';
import type { Lang, ChordSet, SettingsStore, ThemeId } from '../services/settings';

const APP_TITLE_SUFFIX = '.';

export interface TopBarOptions {
  i18n: Translator;
  settings: SettingsStore;
}

export function createTopBar(opts: TopBarOptions): { root: HTMLElement; refresh(): void } {
  const root = document.createElement('header');
  root.className = 'topbar';
  const title = document.createElement('h1');
  title.className = 'topbar__title';

  const cluster = document.createElement('div');
  cluster.className = 'topbar__cluster';

  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'btn btn--icon topbar__theme';
  themeBtn.addEventListener('click', () => {
    const next: ThemeId = opts.settings.get().theme === 'stage' ? 'paper' : 'stage';
    opts.settings.set({ theme: next });
  });

  const setSwitch = document.createElement('div');
  setSwitch.className = 'topbar__switch';

  const langSwitch = document.createElement('div');
  langSwitch.className = 'topbar__switch';

  cluster.append(themeBtn, setSwitch, langSwitch);
  root.append(title, cluster);
  build();
  return { root, refresh: build };

  function build() {
    title.innerHTML = `${escapeHtml(opts.i18n.t('app.title'))}<em>${APP_TITLE_SUFFIX}</em>`;

    const theme = opts.settings.get().theme;
    themeBtn.textContent = theme === 'stage' ? '☼' : '☽';
    themeBtn.setAttribute('aria-label', opts.i18n.t('theme.toggle'));
    themeBtn.setAttribute('title', opts.i18n.t(`theme.${theme}`));
    themeBtn.setAttribute('aria-pressed', String(theme === 'stage'));

    setSwitch.replaceChildren();
    (['basic', 'extended', 'all'] as ChordSet[]).forEach(s => {
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
