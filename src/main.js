import { createCalculatorView } from './ui/calculator-view.js';
import { VIEWBOX, stretchedWidth } from './ui/geometry.js';
import { attachInput } from './ui/input.js';
import { initAudio, click, soundEnabled, setSoundEnabled } from './ui/sound.js';
import { load, save } from './storage.js';
import { tick } from './engine/program.js';
import './engine/all-ops.js';

const ON = 41, HOLD_MS = 2000;
const calc = load(localStorage);
const view = createCalculatorView(document.getElementById('stage'));

let overlay = null, overlayTimer = 0, flashUntil = 0, raf = 0;

let flashTimer = 0;
function render() {
  const d = calc.display;
  const s = calc.state;
  if (s.flashRunning) {                       // show "running" ~400 ms after IRR/YTM, then clear the flag
    if (!flashUntil) flashUntil = performance.now() + 400;
    if (performance.now() < flashUntil) {
      d.text = 'running'; d.running = true;
      if (!flashTimer) flashTimer = setTimeout(() => { flashTimer = 0; render(); }, 420);
    } else { s.flashRunning = false; flashUntil = 0; persist(); }
  }
  view.update(overlay ? { ...d, text: overlay, running: false } : d);
}
function persist() { save(localStorage, calc); }
function busy() { const s = calc.state; return s.prog.running || (s.selfTest && s.selfTest.phase === 'running'); }
function loop(now) {
  raf = 0;
  const was = busy();
  tick(calc, now);
  render();
  if (busy()) raf = requestAnimationFrame(loop);
  else if (was) persist();                    // program halted
}
function ensureLoop() { if (!raf && busy()) raf = requestAnimationFrame(loop); }
function afterKey() { render(); persist(); ensureLoop(); }

function showOverlay(text) {
  overlay = text; render();
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(() => { overlay = null; render(); }, 1000);
}

// ON key: tap = power, hold >= 2 s = toggle click sound, ON held + other key = combo.
let onDown = null;   // { id, timer, combo, long }
function keyDown(code, e) {
  initAudio(); click();
  if (code === ON) {
    if (onDown) return;
    onDown = { id: e.pointerId, combo: false, long: false,
      timer: setTimeout(() => {
        if (!onDown || onDown.combo) return;
        onDown.long = true;
        const on = !soundEnabled(); setSoundEnabled(on);
        showOverlay(on ? 'SOUnd On' : 'SOUnd OFF');
      }, HOLD_MS) };
    return;
  }
  if (onDown) { onDown.combo = true; clearTimeout(onDown.timer); calc.onCombo(code, performance.now()); afterKey(); return; }
  calc.press(code); afterKey();
}
function keyUp(code, e) {
  if (code === ON && onDown && onDown.id === e.pointerId) {
    const o = onDown; onDown = null; clearTimeout(o.timer);
    if (!o.combo && !o.long) { calc.power(); afterKey(); }
    return;
  }
  if (!onDown) { calc.release(); afterKey(); }
}

// Layout: normal (the real 12C's proportions) or stretched to fill a wide screen. Tap the hp logo to switch.
const LAYOUT_KEY = 'hp12c.layout';
const stage = document.getElementById('stage');
function stretched() { try { return localStorage.getItem(LAYOUT_KEY) === 'stretch'; } catch { return false; } }
function fit() { view.setWidth(stretched() ? stretchedWidth(stage.clientWidth, stage.clientHeight) : VIEWBOX.w); }
function toggleLayout() {
  initAudio(); click();
  try { localStorage.setItem(LAYOUT_KEY, stretched() ? 'normal' : 'stretch'); } catch { /* ignore */ }
  fit();
}
// iOS fires resize mid-rotation, before the layout and safe-area insets settle, and may not fire again. So watch
// the stage itself (its layout size, before the portrait rotation) and re-check once the rotation is over.
if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 500));
fit();

attachInput(view, { onDown: keyDown, onUp: keyUp, onLogo: toggleLayout });
addEventListener('touchend', initAudio, { passive: true });   // the gesture iOS accepts to unlock audio
addEventListener('pointerup', initAudio);
render();
ensureLoop();
window.__hp12c = { calc, view, press(code) { calc.press(code); calc.release(); afterKey(); } };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
