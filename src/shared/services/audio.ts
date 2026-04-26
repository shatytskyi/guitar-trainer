import * as Tone from 'tone';

const AUDIO_CONFIG = {
  oscillatorType: 'triangle' as const,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.8 },
  volume: -8,
  noteDuration: '2n' as const,
  defaultStrumDelay: 0.04,
};

const METRONOME_CONFIG = {
  oscillatorType: 'square' as const,
  envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.02 },
  volume: -18,
  accentVolume: -13,
  normalNote: 'G5',
  accentNote: 'C6',
  duration: '32n' as const,
};

export interface AudioOutput {
  playNotes(notes: readonly string[], options?: { strumDelay?: number }): Promise<void>;
  playMetronomeClick(options?: { accent?: boolean }): Promise<void>;
}

let synth: Tone.PolySynth | null = null;
let metronomeSynth: Tone.Synth | null = null;
let started = false;

async function ensureToneStarted(): Promise<void> {
  if (!started) {
    await Tone.start();
    started = true;
  }
}

async function ensureChordSynth(): Promise<Tone.PolySynth> {
  await ensureToneStarted();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: AUDIO_CONFIG.oscillatorType },
      envelope: AUDIO_CONFIG.envelope,
    }).toDestination();
    synth.maxPolyphony = 64;
    synth.volume.value = AUDIO_CONFIG.volume;
  }
  return synth;
}

async function ensureMetronomeSynth(): Promise<Tone.Synth> {
  await ensureToneStarted();
  if (!metronomeSynth) {
    metronomeSynth = new Tone.Synth({
      oscillator: { type: METRONOME_CONFIG.oscillatorType },
      envelope: METRONOME_CONFIG.envelope,
    }).toDestination();
  }
  return metronomeSynth;
}

export const audio: AudioOutput = {
  async playNotes(notes, options) {
    const s = await ensureChordSynth();
    const strumDelay = options?.strumDelay ?? AUDIO_CONFIG.defaultStrumDelay;
    // Release any still-sounding voices so rapid taps don't pile up past
    // maxPolyphony — without this, after ~5 chords the synth runs out of
    // voices and stops triggering new notes.
    s.releaseAll();
    const now = Tone.now();
    notes.forEach((note, i) => {
      s.triggerAttackRelease(note, AUDIO_CONFIG.noteDuration, now + i * strumDelay);
    });
  },
  async playMetronomeClick(options) {
    const s = await ensureMetronomeSynth();
    const accent = options?.accent ?? false;
    s.volume.value = accent ? METRONOME_CONFIG.accentVolume : METRONOME_CONFIG.volume;
    s.triggerAttackRelease(
      accent ? METRONOME_CONFIG.accentNote : METRONOME_CONFIG.normalNote,
      METRONOME_CONFIG.duration,
    );
  },
};
