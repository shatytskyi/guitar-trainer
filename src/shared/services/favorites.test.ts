import { describe, it, expect, beforeEach } from 'vitest';
import { CHORDS_BASIC } from '../../data/chords-basic';
import { favoriteIdForShape } from '../lib/favorites';
import { createFavoritesStore } from './favorites';

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

describe('favorites store', () => {
  const cMajor = CHORDS_BASIC[0]!;
  const cMajorType = cMajor.types[0]!;
  const cMajorShape = cMajorType.shapes[0]!;
  const favorite = favoriteIdForShape(cMajor.root, cMajorType.type, cMajorShape);

  it('starts empty when storage is empty', () => {
    const store = createFavoritesStore(backing as unknown as Storage);
    expect(store.get()).toEqual([]);
  });

  it('adds, detects, and removes favorite chord shapes', () => {
    const store = createFavoritesStore(backing as unknown as Storage);
    store.add(favorite);

    expect(store.isFavorite(favorite)).toBe(true);
    expect(store.get()).toHaveLength(1);

    store.remove(favorite);
    expect(store.isFavorite(favorite)).toBe(false);
    expect(store.get()).toHaveLength(0);
  });

  it('hydrates valid favorites and drops malformed records', () => {
    backing.setItem(
      'guitar-trainer.favorites.v1',
      JSON.stringify([favorite, { root: 'H', type: '', shapeLabel: 'open', frets: [0, 0, 0, 0, 0, 0] }]),
    );

    const store = createFavoritesStore(backing as unknown as Storage);
    expect(store.get()).toEqual([favorite]);
  });

  it('notifies subscribers on change', () => {
    const store = createFavoritesStore(backing as unknown as Storage);
    const seen: number[] = [];
    store.subscribe(items => seen.push(items.length));

    store.toggle(favorite);
    store.toggle(favorite);

    expect(seen).toEqual([1, 0]);
  });
});
