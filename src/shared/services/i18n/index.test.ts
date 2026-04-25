import { describe, it, expect } from 'vitest';
import { createTranslator, type Dictionary } from './index';

const ru: Dictionary = { 'app.title': 'Аккорды', 'hello': 'Привет, {name}' };
const en: Dictionary = { 'app.title': 'Chords', 'hello': 'Hello, {name}' };
const uk: Dictionary = { 'app.title': 'Акорди', 'hello': 'Привіт, {name}' };

describe('translator', () => {
  it('looks up by key', () => {
    const t = createTranslator({ ru, en, uk }, 'ru');
    expect(t.t('app.title')).toBe('Аккорды');
  });

  it('switches language', () => {
    const t = createTranslator({ ru, en, uk }, 'ru');
    t.setLang('en');
    expect(t.t('app.title')).toBe('Chords');
  });

  it('interpolates {name} placeholders', () => {
    const t = createTranslator({ ru, en, uk }, 'en');
    expect(t.t('hello', { name: 'Sergii' })).toBe('Hello, Sergii');
  });

  it('returns the key when missing', () => {
    const t = createTranslator({ ru, en, uk }, 'ru');
    expect(t.t('missing.key')).toBe('missing.key');
  });

  it('notifies subscribers on language change', () => {
    const t = createTranslator({ ru, en, uk }, 'ru');
    const seen: string[] = [];
    t.onLangChange(l => seen.push(l));
    t.setLang('en');
    expect(seen).toEqual(['en']);
  });
});
