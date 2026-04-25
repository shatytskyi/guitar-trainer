const STORAGE_KEY = 'guitar-trainer.settings.v1';

export type Lang = 'ru' | 'en' | 'uk';
export type ChordSet = 'basic' | 'extended' | 'all';
export type ThemeId = 'paper' | 'stage';

export interface Settings {
  lang: Lang;
  set: ChordSet;
  hideDiagram: boolean;
  theme: ThemeId;
  lastFeatureId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'ru',
  set: 'basic',
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
    if (!isSettings(parsed)) return { ...DEFAULT_SETTINGS };
    return parsed;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function isSettings(v: unknown): v is Settings {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    (r['lang'] === 'ru' || r['lang'] === 'en' || r['lang'] === 'uk') &&
    (r['set'] === 'basic' || r['set'] === 'extended' || r['set'] === 'all') &&
    typeof r['hideDiagram'] === 'boolean' &&
    (r['theme'] === 'paper' || r['theme'] === 'stage') &&
    typeof r['lastFeatureId'] === 'string'
  );
}
