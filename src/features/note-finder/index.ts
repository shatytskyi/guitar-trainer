import type { Feature } from '../../shared/lib/feature';
import { mountNoteFinderView, type NoteFinderViewHandle } from './view';

let view: NoteFinderViewHandle | null = null;

export const noteFinder: Feature = {
  id: 'note-finder',
  titleKey: 'feature.note-finder.title',
  mount(h, ctx) {
    view = mountNoteFinderView(h, { i18n: ctx.i18n, audio: ctx.audio });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio });
  },
};
