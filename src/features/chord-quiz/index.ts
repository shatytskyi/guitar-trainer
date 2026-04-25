import type { Feature } from '../../shared/lib/feature';
import { mountQuizView } from './view';

let teardown: (() => void) | null = null;
let host: HTMLElement | null = null;

export const chordQuiz: Feature = {
  id: 'chord-quiz',
  titleKey: 'feature.chord-quiz.title',
  mount(h, ctx) {
    host = h;
    teardown = mountQuizView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
  unmount() {
    teardown?.();
    teardown = null;
    host = null;
  },
  onContextChange(ctx) {
    if (!host) return;
    teardown?.();
    teardown = mountQuizView(host, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings });
  },
};
