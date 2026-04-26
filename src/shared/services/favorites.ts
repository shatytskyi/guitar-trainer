import {
  favoriteKey,
  isFavoriteChordShapeId,
  type FavoriteChordShapeId,
} from '../lib/favorites';

const STORAGE_KEY = 'guitar-trainer.favorites.v1';

export interface FavoritesStore {
  get(): readonly FavoriteChordShapeId[];
  isFavorite(id: FavoriteChordShapeId): boolean;
  add(id: FavoriteChordShapeId): void;
  remove(id: FavoriteChordShapeId): void;
  toggle(id: FavoriteChordShapeId): void;
  subscribe(cb: (items: readonly FavoriteChordShapeId[]) => void): () => void;
}

export function createFavoritesStore(storage: Storage): FavoritesStore {
  let current = load(storage);
  const subs = new Set<(items: readonly FavoriteChordShapeId[]) => void>();

  function commit(next: readonly FavoriteChordShapeId[]): void {
    current = [...next];
    try { storage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* quota / private mode */ }
    subs.forEach(cb => cb(current));
  }

  function isFavorite(id: FavoriteChordShapeId): boolean {
    const key = favoriteKey(id);
    return current.some(item => favoriteKey(item) === key);
  }

  function add(id: FavoriteChordShapeId): void {
    const key = favoriteKey(id);
    if (current.some(item => favoriteKey(item) === key)) return;
    commit([...current, copyFavorite(id)]);
  }

  function remove(id: FavoriteChordShapeId): void {
    const key = favoriteKey(id);
    const next = current.filter(item => favoriteKey(item) !== key);
    if (next.length === current.length) return;
    commit(next);
  }

  return {
    get: () => current,
    isFavorite,
    add,
    remove,
    toggle(id) {
      if (isFavorite(id)) remove(id);
      else add(id);
    },
    subscribe(cb) {
      subs.add(cb);
      return () => { subs.delete(cb); };
    },
  };
}

function load(storage: Storage): FavoriteChordShapeId[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: FavoriteChordShapeId[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (!isFavoriteChordShapeId(item)) continue;
      const copied = copyFavorite(item);
      const key = favoriteKey(copied);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(copied);
    }
    return out;
  } catch {
    return [];
  }
}

function copyFavorite(id: FavoriteChordShapeId): FavoriteChordShapeId {
  return {
    root: id.root,
    type: id.type,
    shapeLabel: id.shapeLabel,
    frets: [...id.frets],
  };
}
