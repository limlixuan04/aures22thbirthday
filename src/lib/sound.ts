/**
 * Tiny synthesised sound effects (no audio files). Only ever plays in
 * response to something Aure does, and always gently. Mute state is saved.
 */
import { useSyncExternalStore } from 'react';
import { load, save } from './storage';

let muted: boolean = load('muted', false);
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur = 0.12, type: OscillatorType = 'sine', vol = 0.06, delay = 0, slideTo?: number) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  click: () => tone(660, 0.06, 'triangle', 0.04),
  pop: () => tone(520, 0.12, 'sine', 0.07, 0, 900),
  flip: () => tone(380, 0.08, 'triangle', 0.04, 0, 560),
  error: () => {
    tone(260, 0.14, 'square', 0.025);
    tone(200, 0.18, 'square', 0.025, 0.1);
  },
  good: () => {
    tone(660, 0.1, 'triangle', 0.05);
    tone(880, 0.14, 'triangle', 0.05, 0.08);
  },
  success: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.05, i * 0.09));
  },
  fanfare: () => {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.26, 'triangle', 0.05, i * 0.12));
  },
  whoosh: () => tone(900, 0.35, 'sine', 0.03, 0, 200),
  slide: () => tone(300, 0.07, 'sine', 0.04, 0, 420),
  bonk: () => tone(180, 0.15, 'sawtooth', 0.025, 0, 120),
};

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  save('muted', m);
  listeners.forEach((l) => l());
  if (!m) sfx.good();
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => muted,
  );
}
