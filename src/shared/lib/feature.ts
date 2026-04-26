import type { Translator } from '../services/i18n';
import type { SettingsStore, Lang } from '../services/settings';
import type { AudioOutput } from '../services/audio';
import type { FavoritesStore } from '../services/favorites';

export interface FeatureContext {
  lang: Lang;
  audio: AudioOutput;
  i18n: Translator;
  settings: SettingsStore;
  favorites: FavoritesStore;
}

export interface Feature {
  readonly id: string;
  readonly titleKey: string;
  mount(host: HTMLElement, ctx: FeatureContext): void;
  unmount(): void;
  onContextChange?(ctx: FeatureContext): void;
}
