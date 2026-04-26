const STORAGE_KEY = 'guitar-trainer.settings.v1';

export type Lang = 'ru' | 'en' | 'uk';
export type ChordSet = 'basic' | 'extended' | 'all' | 'favorites';
export type ThemeId = 'paper' | 'stage';

export interface Settings {
  lang: Lang;
  quizChordSet: ChordSet;
  browseChordSet: ChordSet;
  hideDiagram: boolean;
  theme: ThemeId;
  lastFeatureId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'ru',
  quizChordSet: 'basic',
  browseChordSet: 'all',
  hideDiagram: true,
  theme: 'paper',
  lastFeatureId: 'chord-quiz',
};

export interface SettingsStore {
  get(): Settings;
  set(partial: Partial<Settings>): void;
  subscribe(cb: (s: Settings) => void): () => void;
}

export function createSettingsStore(storage: Storage): SettingsStore {
  let current = load(storage);
  const subs = new Set<(s: Settings) => void>();

  return {
    get: () => current,
    set(partial) {
      current = { ...current, ...partial };
      try { storage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* quota / private mode */ }
      subs.forEach(cb => cb(current));
    },
    subscribe(cb) {
      subs.add(cb);
      return () => { subs.delete(cb); };
    },
  };
}

function load(storage: Storage): Settings {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed: unknown = JSON.parse(raw);
    return normalizeSettings(parsed) ?? { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function normalizeSettings(v: unknown): Settings | null {
  if (typeof v !== 'object' || v === null) return null;
  const r = v as Record<string, unknown>;
  const lang = readLang(r['lang']);
  const legacySet = readChordSet(r['set']);
  const quizChordSet = readChordSet(r['quizChordSet']) ?? legacySet;
  const browseChordSet = readChordSet(r['browseChordSet']) ?? legacySet;
  const theme = readTheme(r['theme']);
  if (
    !lang ||
    !quizChordSet ||
    !browseChordSet ||
    typeof r['hideDiagram'] !== 'boolean' ||
    !theme ||
    typeof r['lastFeatureId'] !== 'string'
  ) {
    return null;
  }

  return {
    lang,
    quizChordSet,
    browseChordSet,
    hideDiagram: r['hideDiagram'],
    theme,
    lastFeatureId: r['lastFeatureId'],
  };
}

function readLang(v: unknown): Lang | null {
  return v === 'ru' || v === 'en' || v === 'uk' ? v : null;
}

function readChordSet(v: unknown): ChordSet | null {
  return v === 'basic' || v === 'extended' || v === 'all' || v === 'favorites' ? v : null;
}

function readTheme(v: unknown): ThemeId | null {
  return v === 'paper' || v === 'stage' ? v : null;
}
