import * as Tone from 'tone';

const AUDIO_CONFIG = {
  oscillatorType: 'triangle' as const,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.8 },
  volume: -8,
  noteDuration: '2n' as const,
  defaultStrumDelay: 0.04,
};

export interface AudioOutput {
  playNotes(notes: readonly string[], options?: { strumDelay?: number }): Promise<void>;
}

let synth: Tone.PolySynth | null = null;
let started = false;

async function ensureStarted(): Promise<Tone.PolySynth> {
  if (!started) {
    await Tone.start();
    started = true;
  }
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

export const audio: AudioOutput = {
  async playNotes(notes, options) {
    const s = await ensureStarted();
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
};
