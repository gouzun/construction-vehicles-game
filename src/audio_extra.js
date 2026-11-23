// Continuous engine loop, background music and extra one-shot effects (all synthesized).
import { isSoundEnabled, getCtx } from './audio.js';

let engine = null;
export function engineStart() {
  if (!isSoundEnabled() || engine) return;
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 55;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 16;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 9;
  lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  osc.connect(f); f.connect(g); g.connect(ctx.destination);
  osc.start(); lfo.start();
  engine = { osc, lfo, g, f, ctx };
  engineLevel(0.2);
}
export function engineLevel(v) {
  if (!engine) return;
  const { osc, g, f, ctx, lfo } = engine; const t = ctx.currentTime;
  osc.frequency.setTargetAtTime(48 + v * 75, t, 0.08);
  lfo.frequency.setTargetAtTime(12 + v * 22, t, 0.08);
  g.gain.setTargetAtTime(0.05 + v * 0.07, t, 0.08);
  f.frequency.setTargetAtTime(280 + v * 520, t, 0.08);
}
export function engineStop() {
  if (!engine) return;
  const { osc, lfo, g, ctx } = engine;
  g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
  osc.stop(ctx.currentTime + 0.3); lfo.stop(ctx.currentTime + 0.3);
  engine = null;
}

// Background music: a cheerful 2-bar loop. Stops when sound is disabled or stopMusic() is called.
let musicTimer = null, step = 0;
const MEL = [72, 76, 79, 76, 77, 81, 79, 77, 76, 79, 84, 79, 77, 74, 72, 74];
const BASS = [48, 48, 53, 53, 55, 55, 48, 48];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function note(ctx, freq, t, dur, type, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
export function startMusic() {
  if (!isSoundEnabled() || musicTimer) return;
  const ctx = getCtx(); if (!ctx) return;
  step = 0;
  musicTimer = setInterval(() => {
    if (!isSoundEnabled()) { stopMusic(); return; }
    const t = ctx.currentTime + 0.05, s = step % 32;
    if (s % 2 === 0) note(ctx, mtof(MEL[(s / 2) % 16]), t, 0.22, 'triangle', 0.035);
    if (s % 4 === 0) note(ctx, mtof(BASS[(s / 4) % 8]), t, 0.32, 'sine', 0.06);
    if (s % 4 === 2) note(ctx, 2200, t, 0.03, 'square', 0.006);
    step++;
  }, 160);
}
export function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

function tone(type, f0, f1, dur, vol, delay = 0) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
export function playClick() { tone('square', 900, 600, 0.05, 0.05); }
export function playHonk() { tone('square', 330, 320, 0.32, 0.07); tone('square', 415, 405, 0.32, 0.05); tone('square', 330, 320, 0.25, 0.07, 0.4); tone('square', 415, 405, 0.25, 0.05, 0.4); }
export function playRatchet() { for (let i = 0; i < 4; i++) tone('square', 1200, 500, 0.03, 0.05, i * 0.045); }
export function playBoing() { tone('sine', 200, 520, 0.25, 0.15); }
export function playPop() { tone('sine', 500, 1400, 0.09, 0.15); }
export function playWhoosh() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx(); if (!ctx) return;
  const dur = 0.45, buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
  const t = ctx.currentTime; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2500, t + dur);
  const g = ctx.createGain(); g.gain.value = 0.18;
  src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t);
}
