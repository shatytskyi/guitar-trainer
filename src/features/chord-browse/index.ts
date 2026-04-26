import type { Feature } from '../../shared/lib/feature';
import { mountBrowseView, type BrowseViewHandle } from './view';

let view: BrowseViewHandle | null = null;

export const chordBrowse: Feature = {
  id: 'chord-browse',
  titleKey: 'feature.chord-browse.title',
  mount(h, ctx) {
    view = mountBrowseView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings, favorites: ctx.favorites });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings, favorites: ctx.favorites });
  },
};
