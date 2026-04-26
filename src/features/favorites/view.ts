import { resolvedFavoriteChords, type ResolvedFavoriteChord } from '../../data/favorites';
import { renderFretboardDiagram } from '../../shared/components/FretboardDiagram';
import { chordDisplayName } from '../../shared/lib/chord';
import type { PitchClass } from '../../shared/lib/note';
import type { AudioOutput } from '../../shared/services/audio';
import type { FavoritesStore } from '../../shared/services/favorites';
import type { Translator } from '../../shared/services/i18n';
import { groupFavoriteChords } from './state';

const RECOMMENDED_MARK = '★';

export interface FavoritesViewDeps {
  i18n: Translator;
  audio: AudioOutput;
  favorites: FavoritesStore;
}

export interface FavoritesViewHandle {
  destroy(): void;
  refresh(deps: FavoritesViewDeps): void;
}

export function mountFavoritesView(host: HTMLElement, initialDeps: FavoritesViewDeps): FavoritesViewHandle {
  let deps = initialDeps;

  const root = document.createElement('div');
  root.className = 'favorites';
  host.appendChild(root);

  render();

  return {
    destroy() {
      host.replaceChildren();
    },
    refresh(nextDeps) {
      deps = nextDeps;
      render();
    },
  };

  function render() {
    const items = resolvedFavoriteChords(deps.favorites.get());
    if (items.length === 0) {
      root.replaceChildren(createEmptyState());
      return;
    }

    const groups = groupFavoriteChords(items);
    root.replaceChildren(...groups.map(group => {
      const section = document.createElement('section');
      section.className = 'favorites__group';

      const title = document.createElement('h2');
      title.className = 'favorites__group-title';
      paintRootName(title, group.root);

      const grid = document.createElement('div');
      grid.className = 'favorites__grid';
      grid.replaceChildren(...group.items.map(createFavoriteCard));

      section.append(title, grid);
      return section;
    }));
  }

  function createEmptyState(): HTMLElement {
    const empty = document.createElement('div');
    empty.className = 'favorites__empty';

    const title = document.createElement('div');
    title.className = 'favorites__empty-title';
    title.textContent = deps.i18n.t('favorites.empty.title');

    const body = document.createElement('div');
    body.className = 'favorites__empty-body';
    body.textContent = deps.i18n.t('favorites.empty.body');

    empty.append(title, body);
    return empty;
  }

  function createFavoriteCard(item: ResolvedFavoriteChord): HTMLElement {
    const displayName = chordDisplayName({ root: item.root.root, type: item.type.type });
    const card = document.createElement('article');
    card.className = 'favorite-card';

    const header = document.createElement('div');
    header.className = 'favorite-card__header';

    const name = document.createElement('div');
    name.className = 'favorite-card__name';
    name.textContent = displayName;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--icon favorite-card__star favorite-card__star--active';
    removeBtn.textContent = '★';
    removeBtn.setAttribute('aria-label', deps.i18n.t('favorite.remove'));
    removeBtn.setAttribute('aria-pressed', 'true');
    removeBtn.addEventListener('click', () => {
      deps.favorites.remove(item.id);
      render();
    });

    header.append(name, removeBtn);

    const diagramBtn = document.createElement('button');
    diagramBtn.type = 'button';
    diagramBtn.className = 'favorite-card__diagram';
    diagramBtn.innerHTML = renderFretboardDiagram(item.shape);
    diagramBtn.setAttribute('aria-label', deps.i18n.t('favorites.play', { chord: displayName }));
    diagramBtn.addEventListener('click', () => {
      void deps.audio.playNotes(item.shape.notes);
    });

    const meta = document.createElement('div');
    meta.className = 'favorite-card__meta';
    const shapeLabel = deps.i18n.t(`shape.${item.shape.label}`);
    const typeLabel = item.type.type === '' ? '—' : item.type.type;
    meta.textContent = `${typeLabel} · ${shapeLabel}${item.shape.recommended ? ` ${RECOMMENDED_MARK}` : ''}`;

    card.append(header, diagramBtn, meta);
    return card;
  }
}

function paintRootName(host: HTMLElement, root: PitchClass): void {
  host.replaceChildren();
  host.append(document.createTextNode(root[0] ?? ''));
  if (root.includes('#')) {
    const em = document.createElement('em');
    em.textContent = '♯';
    host.appendChild(em);
  }
}
