import type { Lang } from '../settings';

export type Dictionary = Record<string, string>;

export interface Translator {
  readonly lang: Lang;
  t(key: string, params?: Record<string, string | number>): string;
  setLang(lang: Lang): void;
  onLangChange(cb: (lang: Lang) => void): () => void;
}

export type Dictionaries = Record<Lang, Dictionary>;

export function createTranslator(dicts: Dictionaries, initial: Lang): Translator {
  let current: Lang = initial;
  const subs = new Set<(l: Lang) => void>();

  return {
    get lang() { return current; },
    t(key, params) {
      const dict = dicts[current];
      const template = dict[key] ?? key;
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (_, name: string) => {
        const v = params[name];
        return v === undefined ? `{${name}}` : String(v);
      });
    },
    setLang(lang) {
      if (lang === current) return;
      current = lang;
      subs.forEach(cb => cb(current));
    },
    onLangChange(cb) {
      subs.add(cb);
      return () => { subs.delete(cb); };
    },
  };
}
