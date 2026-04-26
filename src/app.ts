import { createAppShell } from './shared/components/AppShell';
import { createTopBar } from './shared/components/TopBar';
import { createTabBar } from './shared/components/TabBar';
import { createSettingsStore, type Settings } from './shared/services/settings';
import { createFavoritesStore } from './shared/services/favorites';
import { createTranslator, type Dictionaries } from './shared/services/i18n';
import ru from './shared/services/i18n/ru';
import en from './shared/services/i18n/en';
import uk from './shared/services/i18n/uk';
import { audio } from './shared/services/audio';
import { registerPWA } from './shared/services/pwa';
import { initInstallPrompt } from './shared/services/install';
import { features } from './features/registry';
import type { Feature, FeatureContext } from './shared/lib/feature';
import type { ThemeId } from './shared/services/settings';

const THEME_COLORS: Record<ThemeId, string> = {
  paper: '#e9e4d2',
  stage: '#161914',
};

function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset['theme'] = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
}

function applyDocumentLang(lang: Settings['lang']): void {
  document.documentElement.lang = lang;
}

export function startApp(host: HTMLElement): void {
  const dictionaries: Dictionaries = { ru, en, uk };
  const settings = createSettingsStore(window.localStorage);
  const favorites = createFavoritesStore(window.localStorage);
  const i18n = createTranslator(dictionaries, settings.get().lang);

  applyTheme(settings.get().theme);
  applyDocumentLang(settings.get().lang);

  const shell = createAppShell();
  host.appendChild(shell.root);

  const topBar = createTopBar({ i18n, settings });
  shell.topBarSlot.appendChild(topBar.root);

  const tabBar = createTabBar({
    tabs: features.map(f => ({ id: f.id, titleKey: f.titleKey })),
    i18n,
    getActive: () => currentId(),
    onSelect: id => { window.location.hash = id; },
  });
  shell.navSlot.appendChild(tabBar.root);

  let active: Feature | null = null;

  function ctx(): FeatureContext {
    const s = settings.get();
    return { lang: s.lang, audio, i18n, settings, favorites };
  }

  function currentId(): string {
    const fromHash = window.location.hash.slice(1);
    const validIds = features.map(f => f.id);
    if (validIds.includes(fromHash)) return fromHash;
    const last = settings.get().lastFeatureId;
    if (validIds.includes(last)) return last;
    return features[0]?.id ?? '';
  }

  function activate(id: string) {
    if (active && active.id === id) return;
    const focusedContent = document.activeElement instanceof HTMLElement
      && shell.contentSlot.contains(document.activeElement);
    active?.unmount();
    shell.contentSlot.replaceChildren();
    const next = features.find(f => f.id === id) ?? features[0];
    if (!next) return;
    active = next;
    next.mount(shell.contentSlot, ctx());
    if (focusedContent) shell.contentSlot.focus({ preventScroll: true });
    if (settings.get().lastFeatureId !== next.id) {
      settings.set({ lastFeatureId: next.id });
    } else {
      tabBar.refresh();
    }
  }

  window.addEventListener('hashchange', () => activate(currentId()));

  settings.subscribe((s: Settings) => {
    applyTheme(s.theme);
    if (s.lang !== i18n.lang) i18n.setLang(s.lang);
    applyDocumentLang(s.lang);
    topBar.refresh();
    tabBar.refresh();
    active?.onContextChange?.(ctx());
  });

  favorites.subscribe(() => {
    active?.onContextChange?.(ctx());
  });

  if (!window.location.hash) window.location.hash = currentId();
  activate(currentId());

  registerPWA();

  initInstallPrompt(i18n, settings);
}
