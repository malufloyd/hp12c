// Power, ON+key combinations, self-tests and JSON (de)serialization of the whole calculator.
import { Calculator, cloneState } from './calculator.js';
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

  onCombo(code, now = 0) {
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

// Tolerant, forward-compatible loader: start from freshState(), keep every known key whose saved value
// has a compatible type/shape, ignore unknown keys, default missing/incompatible ones. Only unparsable
// JSON or a wrong version/top-level shape is fatal.
Calculator.deserialize = function (str) {
  let obj;
  try { obj = JSON.parse(str); } catch { throw new Error('unparsable state'); }
  if (!isPlainObj(obj) || obj.v !== 1 || !isPlainObj(obj.state)) throw new Error('bad version');
  const state = coerce(decode(obj.state), freshState(), 'state');
  // selfTest deadlines and PSE waits belong to the previous page's clock (performance.now): drop them.
  if (state.selfTest && state.selfTest.phase === 'running') state.selfTest = null;
  state.prog.waitUntil = 0;
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
const isPlainObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// Returns a value shaped like template t built from saved value v; throws when v is incompatible with t.
// Plain objects merge per key: missing or incompatible known keys fall back to the default, unknown keys drop.
function coerce(v, t, path) {
  const bad = () => { throw new Error('invalid state at ' + path); };
  if (t instanceof D) { if (!(v instanceof D)) bad(); return v; }
  if (Array.isArray(t)) {
    if (!Array.isArray(v)) bad();
    if (t.length) {
      if (v.length !== t.length) bad();
      return v.map((x, i) => coerce(x, t[0], path + '[' + i + ']'));
    }
    return v;
  }
  if (isPlain(t)) {
    if (!isPlain(v)) bad();
    const out = {};
    for (const k of Object.keys(t)) {
      if (k in v) { try { out[k] = coerce(v[k], t[k], path + '.' + k); continue; } catch { /* use default */ } }
      out[k] = cloneState(t[k]);
    }
    return out;
  }
  if (t === null) return coerceNullable(v, path, bad);
  if (typeof v !== typeof t) bad();
  return v;
}

function coerceNullable(v, path, bad) {
  if (v === null) return null;
  switch (path.replace(/^state\.undo\./, 'state.')) {
    case 'state.undo': { const u = coerce(v, freshState(), 'state.undo'); u.undo = null; return u; }
    case 'state.prefix': if (typeof v !== 'string') bad(); return v;
    case 'state.error': if (!(Number.isInteger(v) && v >= 0 && v <= 9) && v !== 'Pr') bad(); return v;
    case 'state.dateDisplay': if (typeof v !== 'string') bad(); return v;
    case 'state.entry': return coerce(v, { mant: '', exp: null, expNeg: false, neg: false }, path);
    case 'state.entry.exp': if (typeof v !== 'string') bad(); return v;
    case 'state.alg.acc': if (!(v instanceof D)) bad(); return v;
    case 'state.alg.op': if (typeof v !== 'string') bad(); return v;
    case 'state.selfTest':
      if (!isPlain(v) || (v.phase !== 'running' && v.phase !== 'done')) bad();
      if (v.phase === 'running' && typeof v.until !== 'number') bad();
      return v;
    case 'state.kbTest': return coerce(v, { idx: 0, done: false }, path);
    default: bad();
  }
}
