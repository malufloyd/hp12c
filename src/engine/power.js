// Power, ON+key combinations, self-tests and JSON (de)serialization of the whole calculator.
import { Calculator } from './calculator.js';
import { D } from './number.js';
import { freshState } from './state.js';
import { LAYOUT, K } from './keys.js';

const SELF_TEST_MS = 2500;

// Row-major LAYOUT codes without ON; ENTER is a double-height key, expected at row 3 and row 4.
export const KEYBOARD_SEQUENCE = (() => {
  const seq = [];
  for (const k of LAYOUT) if (k.code !== K.ON) seq.push(k);
  seq.sort((a, b) => a.row - b.row || a.col - b.col);
  const out = seq.map(k => k.code);
  const enter = seq.find(k => k.code === K.ENTER);
  const at = seq.findIndex(k => k.row === 4 && k.col > enter.col);     // row 4, col 6 slot (before 0)
  out.splice(at, 0, K.ENTER);
  return out;
})();

Object.assign(Calculator.prototype, {
  power() {
    const s = this.state;
    s.off = !s.off;
    if (s.off) {
      s.error = null; s.prefix = null; s.prefixBuf = ''; s.blink = false;
      s.prog.running = false; s.prog.waitUntil = 0; s.selfTest = null; s.kbTest = null;
      this.endEntry();
    }
  },

  onCombo(code, now = Date.now()) {
    const s = this.state;
    s.off = false; s.selfTest = null; s.kbTest = null;
    if (code === 48) s.mode.commaDecimal = !s.mode.commaDecimal;
    else if (code === 30) { this.state = freshState(); this.state.error = 'Pr'; }
    else if (code === 20) s.selfTest = { phase: 'running', until: now + SELF_TEST_MS };
    else if (code === 10) s.kbTest = { idx: 0, done: false };
  },

  // Called first by press(); true = key consumed by a self-test.
  selfTestKey(code) {
    const s = this.state;
    if (s.selfTest) {
      if (s.selfTest.phase === 'done') s.selfTest = null;      // any key returns to normal
      return true;                                             // keys are ignored while it runs
    }
    if (s.kbTest) {
      const t = s.kbTest;
      if (t.done) { s.kbTest = null; return true; }
      if (code !== KEYBOARD_SEQUENCE[t.idx]) { s.kbTest = null; s.error = 9; return true; }
      if (++t.idx === KEYBOARD_SEQUENCE.length) t.done = true;
      return true;
    }
    return false;
  },

  serialize() { return JSON.stringify({ v: 1, state: encode(this.state) }); },
});

Calculator.deserialize = function (str) {
  let obj;
  try { obj = JSON.parse(str); } catch { throw new Error('unparsable state'); }
  if (!obj || typeof obj !== 'object' || obj.v !== 1 || Object.keys(obj).length !== 2) throw new Error('bad version');
  const state = decode(obj.state);
  validate(state, freshState(), 'state');
  return new Calculator(state);
};

function encode(v) {
  if (v instanceof D) return { $d: v.toString() };
  if (Array.isArray(v)) return v.map(encode);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = encode(v[k]); return o; }
  return v;
}
function decode(v) {
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length === 1 && keys[0] === '$d') {
      if (typeof v.$d !== 'string') throw new Error('bad number');
      const d = new D(v.$d);                                   // throws on garbage
      if (d.isNaN()) throw new Error('bad number');
      return d;
    }
    const o = {};
    for (const k of keys) o[k] = decode(v[k]);
    return o;
  }
  return v;
}

const isPlain = v => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof D);

// Structural check against a template (freshState shape). A null template accepts null or any value
// (entry, prefix, error, undo, ...), refined below.
function validate(v, t, path) {
  const bad = () => { throw new Error('invalid state at ' + path); };
  if (t instanceof D) { if (!(v instanceof D)) bad(); return; }
  if (Array.isArray(t)) {
    if (!Array.isArray(v)) bad();
    if (t.length) {
      if (v.length !== t.length) bad();
      v.forEach((x, i) => validate(x, t[0], path + '[' + i + ']'));
    }
    return;
  }
  if (isPlain(t)) {
    if (!isPlain(v)) bad();
    const tk = Object.keys(t), vk = Object.keys(v);
    if (tk.length !== vk.length || !tk.every(k => k in v)) bad();
    for (const k of tk) validate(v[k], t[k], path + '.' + k);
    return;
  }
  if (t === null) { validateNullable(v, path, bad); return; }
  if (typeof v !== typeof t) bad();
}

function validateNullable(v, path, bad) {
  if (v === null) return;
  switch (path.replace(/^state\.undo\./, 'state.')) {
    case 'state.undo': validate(v, freshState(), 'state.undo'); if (v.undo !== null) bad(); return;
    case 'state.prefix': if (typeof v !== 'string') bad(); return;
    case 'state.error': if (!(Number.isInteger(v) && v >= 0 && v <= 9) && v !== 'Pr') bad(); return;
    case 'state.dateDisplay': if (typeof v !== 'string') bad(); return;
    case 'state.entry':
      validate(v, { mant: '', exp: null, expNeg: false, neg: false }, path); return;
    case 'state.entry.exp': if (typeof v !== 'string') bad(); return;
    case 'state.alg.acc': if (!(v instanceof D)) bad(); return;
    case 'state.alg.op': if (typeof v !== 'string') bad(); return;
    case 'state.selfTest':
      if (!isPlain(v) || (v.phase !== 'running' && v.phase !== 'done')) bad();
      if (v.phase === 'running' && typeof v.until !== 'number') bad();
      return;
    case 'state.kbTest':
      validate(v, { idx: 0, done: false }, path); return;
    default: bad();
  }
}
