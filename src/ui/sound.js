// Optional key-click sound (Web Audio). Off by default, persisted in localStorage.
const KEY = 'hp12c.sound';
let ctx = null, buf = null;

export function soundEnabled() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function setSoundEnabled(on) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* ignore */ }
}
// Call from a user gesture (first pointerdown) so iOS lets audio start.
export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume?.(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const n = Math.floor(ctx.sampleRate * 0.012);
    buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  } catch { ctx = null; }
}
export function click() {
  if (!ctx || !buf || !soundEnabled()) return;
  try {
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.12;
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start();
  } catch { /* ignore */ }
}
