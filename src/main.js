import { createCalculatorView } from './ui/calculator-view.js';
import { attachInput } from './ui/input.js';
import { initAudio, click, soundEnabled, setSoundEnabled } from './ui/sound.js';
import { load, save } from './storage.js';
import { tick } from './engine/program.js';
import './engine/all-ops.js';

const ON = 41, HOLD_MS = 2000;
const calc = load(localStorage);
const view = createCalculatorView(document.getElementById('stage'));

let overlay = null, overlayTimer = 0, flashUntil = 0, raf = 0;

function render() {
  const d = calc.display;
  const s = calc.state;
  if (s.flashRunning) {                       // show "running" ~400 ms after IRR/YTM, then clear the flag
    if (!flashUntil) flashUntil = performance.now() + 400;
    if (performance.now() < flashUntil) { d.text = 'running'; d.running = true; setTimeout(render, 420 - 0); }
    else { s.flashRunning = false; flashUntil = 0; }
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
  if (onDown) { onDown.combo = true; clearTimeout(onDown.timer); calc.onCombo(code); afterKey(); return; }
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

attachInput(view, { onDown: keyDown, onUp: keyUp });
render();
ensureLoop();
window.__hp12c = { calc, view, press(code) { calc.press(code); calc.release(); afterKey(); } };
