import { describe, it, expect, beforeEach } from 'vitest';
import { createSettingsStore, DEFAULT_SETTINGS, type Settings } from './settings';

class MemoryStorage {
  private map = new Map<string, string>();
  get length() { return this.map.size; }
  clear() { this.map.clear(); }
  key(_i: number): string | null { return null; }
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

let backing: MemoryStorage;
beforeEach(() => { backing = new MemoryStorage(); });

describe('settings store', () => {
  it('returns defaults when storage is empty', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('persists partial updates and merges with previous', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    store.set({ lang: 'uk' });
    expect(store.get().lang).toBe('uk');
    expect(store.get().set).toBe(DEFAULT_SETTINGS.set);
  });

  it('hydrates from existing storage', () => {
    backing.setItem(
      'guitar-trainer.settings.v1',
      JSON.stringify({ lang: 'en', set: 'favorites', hideDiagram: false, theme: 'paper', lastFeatureId: 'favorites' }),
    );
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get().lang).toBe('en');
    expect(store.get().set).toBe('favorites');
    expect(store.get().hideDiagram).toBe(false);
  });

  it('falls back to defaults when storage is malformed', () => {
    backing.setItem('guitar-trainer.settings.v1', '{not json');
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to defaults when stored fields are wrong types', () => {
    backing.setItem('guitar-trainer.settings.v1', JSON.stringify({ lang: 42 }));
    const store = createSettingsStore(backing as unknown as Storage);
    expect(store.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('notifies subscribers on change', () => {
    const store = createSettingsStore(backing as unknown as Storage);
    const seen: Settings[] = [];
    store.subscribe(s => seen.push(s));
    store.set({ hideDiagram: false });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.hideDiagram).toBe(false);
  });
});
