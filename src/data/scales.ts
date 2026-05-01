import type { ScaleDegree } from '../shared/lib/scale';

export interface ScaleDefinition {
  readonly id: ScaleId;
  readonly titleKey: string;
  readonly shortTitleKey: string;
  readonly degrees: readonly ScaleDegree[];
  readonly position: {
    readonly lowerOffset: number;
    readonly upperOffset: number;
  };
}

export const SCALE_DEFINITIONS = [
  {
    id: 'minor-pentatonic',
    titleKey: 'scale.minor-pentatonic',
    shortTitleKey: 'scale.short.minor-pentatonic',
    degrees: [
      { degree: '1', semitones: 0 },
      { degree: 'b3', semitones: 3 },
      { degree: '4', semitones: 5 },
      { degree: '5', semitones: 7 },
      { degree: 'b7', semitones: 10 },
    ],
    position: { lowerOffset: 0, upperOffset: 3 },
  },
  {
    id: 'major-pentatonic',
    titleKey: 'scale.major-pentatonic',
    shortTitleKey: 'scale.short.major-pentatonic',
    degrees: [
      { degree: '1', semitones: 0 },
      { degree: '2', semitones: 2 },
      { degree: '3', semitones: 4 },
      { degree: '5', semitones: 7 },
      { degree: '6', semitones: 9 },
    ],
    position: { lowerOffset: -1, upperOffset: 3 },
  },
  {
    id: 'blues',
    titleKey: 'scale.blues',
    shortTitleKey: 'scale.short.blues',
    degrees: [
      { degree: '1', semitones: 0 },
      { degree: 'b3', semitones: 3 },
      { degree: '4', semitones: 5 },
      { degree: 'b5', semitones: 6 },
      { degree: '5', semitones: 7 },
      { degree: 'b7', semitones: 10 },
    ],
    position: { lowerOffset: 0, upperOffset: 3 },
  },
  {
    id: 'major',
    titleKey: 'scale.major',
    shortTitleKey: 'scale.short.major',
    degrees: [
      { degree: '1', semitones: 0 },
      { degree: '2', semitones: 2 },
      { degree: '3', semitones: 4 },
      { degree: '4', semitones: 5 },
      { degree: '5', semitones: 7 },
      { degree: '6', semitones: 9 },
      { degree: '7', semitones: 11 },
    ],
    position: { lowerOffset: -1, upperOffset: 3 },
  },
  {
    id: 'natural-minor',
    titleKey: 'scale.natural-minor',
    shortTitleKey: 'scale.short.natural-minor',
    degrees: [
      { degree: '1', semitones: 0 },
      { degree: '2', semitones: 2 },
      { degree: 'b3', semitones: 3 },
      { degree: '4', semitones: 5 },
      { degree: '5', semitones: 7 },
      { degree: 'b6', semitones: 8 },
      { degree: 'b7', semitones: 10 },
    ],
    position: { lowerOffset: -1, upperOffset: 3 },
  },
] as const;

export type ScaleId =
  | 'minor-pentatonic'
  | 'major-pentatonic'
  | 'blues'
  | 'major'
  | 'natural-minor';

export function getScaleDefinition(id: ScaleId): ScaleDefinition {
  return SCALE_DEFINITIONS.find(scale => scale.id === id) ?? SCALE_DEFINITIONS[0]!;
}
