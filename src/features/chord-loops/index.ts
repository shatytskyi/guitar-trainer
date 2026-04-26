import type { Feature } from '../../shared/lib/feature';
import { mountChordLoopsView, type ChordLoopsViewHandle } from './view';

let view: ChordLoopsViewHandle | null = null;

export const chordLoops: Feature = {
  id: 'chord-loops',
  titleKey: 'feature.chord-loops.title',
  mount(h, ctx) {
    view = mountChordLoopsView(h, { i18n: ctx.i18n, audio: ctx.audio });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio });
  },
};
