import type { Feature } from '../../shared/lib/feature';
import { mountScalesView, type ScalesViewHandle } from './view';

let view: ScalesViewHandle | null = null;

export const scales: Feature = {
  id: 'scales',
  titleKey: 'feature.scales.title',
  mount(h, ctx) {
    view = mountScalesView(h, { i18n: ctx.i18n, audio: ctx.audio });
  },
  unmount() {
    view?.destroy();
    view = null;
  },
  onContextChange(ctx) {
    view?.refresh({ i18n: ctx.i18n, audio: ctx.audio });
  },
};
