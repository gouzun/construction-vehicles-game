// Procedural Web Audio Engine for rich, low-latency, zero-asset sound effects

let audioCtx = null;
let soundEnabled = true;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
  localStorage.setItem('truck_game_sound', soundEnabled ? '1' : '0');
  return soundEnabled;
}

export function initSoundSettings() {
  const saved = localStorage.getItem('truck_game_sound');
  if (saved !== null) {
    soundEnabled = saved === '1';
  }
  return soundEnabled;
}

// 1. Snapping Part in Assembly
export function playSnap() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
  
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.16);
}

// 2. High ding chime
export function playDing() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  [1046.5, 1318.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.setValueAtTime(0.25, now + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.36);
  });
}

// 3. Engine Rev / Rumble
export function playEngine(duration = 0.8) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(65, now);
  osc.frequency.linearRampToValueAtTime(140, now + duration * 0.4);
  osc.frequency.linearRampToValueAtTime(75, now + duration);
  
  // Low-pass filter for truck engine body
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, now);
  filter.frequency.linearRampToValueAtTime(550, now + duration * 0.4);
  
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

// 4. Fuel Pump Pulse & Glug
export function playPumpPulse() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.19);
}

// 5. Soap Bubble Pop
export function playBubble() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  const baseFreq = 400 + Math.random() * 400;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.08);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.11);
}

// 6. Water Splash / Spray
export function playWaterSpray(duration = 0.3) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  // Noise buffer for water rush
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1400;
  filter.Q.value = 1.2;
  
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.linearRampToValueAtTime(0.01, now + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + duration);
}

// 7. Air Dryer Blower
export function playDryer(duration = 0.4) {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.linearRampToValueAtTime(0.01, now + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + duration);
}

// 8. Excavator Dig Soil Scoop
export function playDig() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.25);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.5);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.56);
}

// 9. Dump Truck Gravel Pour
export function playDump() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const duration = 0.8;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + duration);
}

// 10. Sparkle Twinkle
export function playSparkle() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const freqs = [1568, 1760, 2093, 2349, 2637];
  const now = ctx.currentTime;
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const time = now + idx * 0.05;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.22);
  });
}

// 11. Celebratory Fanfare Tada
export function playFanfare() {
  if (!soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  
  const notes = [
    { freq: 523.25, time: 0, dur: 0.12 },     // C5
    { freq: 659.25, time: 0.12, dur: 0.12 },  // E5
    { freq: 783.99, time: 0.24, dur: 0.15 },  // G5
    { freq: 1046.5, time: 0.39, dur: 0.45 }   // C6
  ];
  const now = ctx.currentTime;
  notes.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, now + n.time);
    gain.gain.setValueAtTime(0.35, now + n.time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur + 0.05);
  });
}
