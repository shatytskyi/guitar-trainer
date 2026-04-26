import type { Feature } from '../../shared/lib/feature';
import { mountFavoritesView, type FavoritesViewHandle } from './view';

let view: FavoritesViewHandle | null = null;

export const favorites: Feature = {
  id: 'favorites',
  titleKey: 'feature.favorites.title',
  mount(h, ctx) {
    view = mountFavoritesView(h, { i18n: ctx.i18n, audio: ctx.audio, favorites: ctx.favorites });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio, favorites: ctx.favorites });
  },
};
