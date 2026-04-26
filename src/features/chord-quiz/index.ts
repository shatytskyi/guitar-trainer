import type { Feature } from '../../shared/lib/feature';
import { mountQuizView, type QuizViewHandle } from './view';

let view: QuizViewHandle | null = null;

export const chordQuiz: Feature = {
  id: 'chord-quiz',
  titleKey: 'feature.chord-quiz.title',
  mount(h, ctx) {
    view = mountQuizView(h, { i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings, favorites: ctx.favorites });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio, settings: ctx.settings, favorites: ctx.favorites });
  },
};
