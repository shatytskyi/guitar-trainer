import type { Translator } from './i18n';
import type { SettingsStore } from './settings';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'guitar-trainer.install.dismissed-at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type Mode = 'prompt' | 'ios';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let currentMode: Mode | null = null;
let translator: Translator | null = null;

export function initInstallPrompt(i18n: Translator, _settings: SettingsStore): void {
  translator = i18n;

  if (isStandalone()) return;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    if (wasRecentlyDismissed()) return;
    showBanner('prompt');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    markDismissed();
    hideBanner();
  });

  if (isIosSafari() && !wasRecentlyDismissed()) {
    setTimeout(() => {
      if (!isStandalone()) showBanner('ios');
    }, 800);
  }

  i18n.onLangChange(() => {
    if (currentMode) renderBannerContent(currentMode);
  });
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const isAppleDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isAppleDevice && isSafari;
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
}

function ensureBanner(): HTMLElement {
  let el = document.getElementById('install-banner');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'install-banner';
  el.className = 'install-banner';
  el.setAttribute('role', 'region');
  document.body.appendChild(el);
  return el;
}

function showBanner(mode: Mode): void {
  currentMode = mode;
  const el = ensureBanner();
  renderBannerContent(mode);
  el.setAttribute('aria-label', t('install.title'));
  requestAnimationFrame(() => el.classList.add('is-visible'));
}

function renderBannerContent(mode: Mode): void {
  const el = document.getElementById('install-banner');
  if (!el) return;

  const title = t('install.title');
  const body = mode === 'ios' ? t('install.ios-hint') : t('install.body');
  const accept = mode === 'ios' ? '' : t('install.accept');
  const dismiss = t('install.dismiss');

  el.replaceChildren();

  const content = document.createElement('div');
  content.className = 'install-banner__content';

  const text = document.createElement('div');
  text.className = 'install-banner__text';
  const titleEl = document.createElement('div');
  titleEl.className = 'install-banner__title';
  titleEl.textContent = title;
  const bodyEl = document.createElement('div');
  bodyEl.className = 'install-banner__body';
  bodyEl.textContent = body;
  text.append(titleEl, bodyEl);

  const actions = document.createElement('div');
  actions.className = 'install-banner__actions';

  if (accept) {
    const acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'btn btn--primary install-banner__accept';
    acceptBtn.textContent = accept;
    acceptBtn.addEventListener('click', onAccept);
    actions.appendChild(acceptBtn);
  }

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'btn btn--icon install-banner__dismiss';
  dismissBtn.setAttribute('aria-label', dismiss);
  dismissBtn.title = dismiss;
  dismissBtn.textContent = '×';
  dismissBtn.addEventListener('click', onDismiss);
  actions.appendChild(dismissBtn);

  content.append(text, actions);
  el.appendChild(content);
}

async function onAccept(): Promise<void> {
  const prompt = deferredPrompt;
  if (!prompt) { hideBanner(); return; }
  deferredPrompt = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome !== 'accepted') markDismissed();
  } catch {
    /* user dismissed native dialog — ignore */
  }
  hideBanner();
}

function onDismiss(): void {
  markDismissed();
  hideBanner();
}

function hideBanner(): void {
  currentMode = null;
  const el = document.getElementById('install-banner');
  if (!el) return;
  el.classList.remove('is-visible');
  setTimeout(() => el.remove(), 240);
}

function t(key: string): string {
  return translator ? translator.t(key) : key;
}
