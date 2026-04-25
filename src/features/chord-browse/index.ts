import type { Feature } from '../../shared/lib/feature';
import { mountBrowseView } from './view';

let teardown: (() => void) | null = null;
let host: HTMLElement | null = null;

export const chordBrowse: Feature = {
  id: 'chord-browse',
  titleKey: 'feature.chord-browse.title',
  mount(h, ctx) {
    host = h;
    teardown = mountBrowseView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
  unmount() {
    teardown?.();
    teardown = null;
    host = null;
  },
  onContextChange(ctx) {
    if (!host) return;
    teardown?.();
    teardown = mountBrowseView(host, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
};
