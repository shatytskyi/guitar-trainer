import type { Translator } from '../services/i18n';
import type { Lang, SettingsStore, ThemeId } from '../services/settings';

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

  const langSelect = document.createElement('select');
  langSelect.className = 'topbar__select';
  langSelect.addEventListener('change', () => {
    const next = langSelect.value;
    if (isLang(next)) opts.settings.set({ lang: next });
  });

  cluster.append(themeBtn, langSelect);
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

    langSelect.setAttribute('aria-label', opts.i18n.t('lang.select'));
    langSelect.setAttribute('title', opts.i18n.t('lang.select'));
    langSelect.replaceChildren(...(['ru', 'en', 'uk'] as Lang[]).map(l => {
      const option = document.createElement('option');
      option.value = l;
      option.textContent = opts.i18n.t(`lang.${l}`);
      return option;
    }));
    langSelect.value = opts.settings.get().lang;
  }
}

function isLang(v: string): v is Lang {
  return v === 'ru' || v === 'en' || v === 'uk';
}

const ESCAPE_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ESCAPE_MAP[c] ?? c);
}
