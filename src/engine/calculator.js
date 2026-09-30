import { D, ZERO, normalize } from './number.js';
import { freshState } from './state.js';
import { resolve } from './resolve.js';
import { formatNumber, formatMantissa, formatEntry } from '../display.js';

export class CalcError extends Error {
  constructor(code) { super(code === 'Pr' ? 'Pr Error' : 'Error ' + code); this.code = code; }
}

// Deep copy of plain objects/arrays; D instances are immutable so shared by reference.
export function cloneState(v) {
  if (v instanceof D || v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(cloneState);
  const o = {};
  for (const k of Object.keys(v)) o[k] = cloneState(v[k]);
  return o;
}

export class Calculator {
  static ops = {};
  // op modules add handlers: { opName: (calc, arg) => void }. Re-registering a name replaces it
  // (a later module may wrap the previous handler via Calculator.ops[name]).
  static register(table) { Object.assign(Calculator.ops, table); }
  static run(name, calc, arg) {
    const fn = Calculator.ops[name];
    if (!fn) throw new Error('op not implemented: ' + name);
    return fn(calc, arg);
  }

  constructor(state = freshState()) { this.state = state; }

  // ---- hooks for later tasks (override / replace on the instance or prototype) ----
  recordKey(code) { return false; }        // Task 14: program-mode key recording; true = consumed
  availableRegs() { return 20; }           // Task 14: registers not converted to program lines
  saveUndo(name) { }                       // Task 6: called after entry ends, before op runs
  programText() { return null; }           // Task 14: PRGM-mode LCD text
  onRelease() { }                          // Task 14: SST/BST release handling

  // ---- stack accessors / helpers ----
  get x() { return this.state.stack[0]; }
  set x(v) { this.state.stack[0] = this.fit(v); this.state.finStored = false; }
  get y() { return this.state.stack[1]; }
  get z() { return this.state.stack[2]; }
  get t() { return this.state.stack[3]; }

  fit(v) {
    const { value, overflow } = normalize(v);
    if (overflow) this.state.blink = true;
    return value;
  }
  push(v) {
    const s = this.state, val = this.fit(v);
    if (s.lift) s.stack = [val, s.stack[0], s.stack[1], s.stack[2]];
    else s.stack[0] = val;
    s.lift = true; s.finStored = false;
  }
  unary(fn) {
    const s = this.state, x = s.stack[0], r = this.fit(fn(x));
    s.lastX = x; s.stack[0] = r; s.lift = true; s.finStored = false;
  }
  binary(fn) {
    const s = this.state, [x, y, , t] = s.stack, r = this.fit(fn(y, x));
    s.lastX = x; s.stack = [r, s.stack[2], t, t]; s.lift = true; s.finStored = false;
  }
  dispDecimals() { return this.state.mode.sci ? 6 : this.state.mode.fix; }

  // ---- digit entry ----
  endEntry() {
    const s = this.state, e = s.entry;
    if (!e) return;
    s.entry = null;
    s.stack[0] = this.entryValue(e);
    s.lift = true;
  }
  entryValue(e) {
    let m = e.mant;
    if (m === '' || m === '.') m = '0';
    if (m.startsWith('.')) m = '0' + m;
    if (m.endsWith('.')) m += '0';
    const ex = e.exp === null ? '' : 'e' + (e.expNeg ? '-' : '') + (e.exp || '0');
    return this.fit(new D((e.neg ? '-' : '') + m + ex));
  }
  editEntry({ entry, value }) {
    const s = this.state;
    s.undo = null;                               // any entry key invalidates UNDO
    if (!s.entry) {
      if (entry === 'chs') return;
      if (s.lift) s.stack = [s.stack[0], s.stack[0], s.stack[1], s.stack[2]];
      s.entry = { mant: '', exp: null, expNeg: false, neg: false };
      s.finStored = false;
    }
    const e = s.entry;
    switch (entry) {
      case 'digit':
        if (e.exp !== null) e.exp = (e.exp + value).slice(-2);
        else if (e.mant.replace('.', '').length < 10) e.mant = e.mant === '0' ? String(value) : e.mant + value;
        break;
      case 'dot':
        if (e.exp === null && !e.mant.includes('.')) e.mant += '.';
        break;
      case 'eex':
        if (e.exp === null) { if (e.mant === '') e.mant = '1'; e.exp = ''; }
        break;
      case 'chs':
        if (e.exp === null) e.neg = !e.neg; else e.expNeg = !e.expNeg;
        break;
      case 'backspace':
        if (e.exp !== null) { e.exp = e.exp === '' ? null : e.exp.slice(0, -1); if (e.exp === null) e.expNeg = false; }
        else {
          e.mant = e.mant.slice(0, -1);
          if (e.mant === '') { s.entry = null; s.stack[0] = ZERO; s.lift = false; return; }
        }
        break;
    }
    s.stack[0] = this.entryValue(e);             // X tracks the entry live
  }

  // ---- key handling ----
  press(code) {
    const s = this.state;
    if (s.off) return;
    if (this.selfTestKey(code)) return;
    if (s.prog.running) { s.prog.running = false; s.prog.waitUntil = 0; this.endEntry(); return; }   // any key stops a program (swallowed)
    if (s.error !== null) { s.error = null; s.blink = false; return; }
    if (s.prog.prgmMode) { s.blink = false; s.showMantissa = false; s.dateDisplay = null; if (this.recordKey(code)) return; }
    this.dispatch(code);
  }
  // The normal (non-recording) key path; running programs replay their key codes through it.
  dispatch(code) {
    const s = this.state;
    if (s.error !== null) { s.error = null; s.blink = false; return; }
    s.blink = false; s.showMantissa = false; s.dateDisplay = null;
    const action = resolve(this, code);
    if (action) this.perform(action);
  }
  perform(action) {
    const s = this.state;
    if (action.entry) {
      if (action.entry !== 'chs' || s.entry) return this.editEntry(action);   // chs with no entry runs as an op
    }
    const name = action.op ?? action.entry;
    this.exec(name, action.arg);
  }
  // End entry, snapshot, run one op; on CalcError roll back and set state.error.
  exec(name, arg) {
    const s = this.state;
    if (name !== 'undo') this.endEntry();
    const snapshot = cloneState(s);
    try {
      if (name !== 'undo') this.saveUndo(name);
      Calculator.run(name, this, arg);
    } catch (e) {
      if (!(e instanceof CalcError)) throw e;
      Object.assign(s, snapshot);
      s.error = e.code;
    }
  }
  selfTestKey() { return false; }         // power.js: self-test key interception
  release() {
    this.state.showMantissa = false;
    this.onRelease();
  }

  // ---- display ----
  get display() {
    const s = this.state, m = s.mode;
    let text;
    let ann = null, running = s.prog.running;
    if (s.off) text = '';
    else if (s.selfTest) {
      if (s.selfTest.phase === 'running') { text = 'running'; running = true; }
      else { text = '-8,8,8,8,8,8,8,8,8,8,'; ann = { f: true, g: true, begin: true, dmy: true, c: true, prgm: true, rpn: true, alg: true, paren: true }; }
    }
    else if (s.kbTest && s.kbTest.done) text = '12';
    else if (s.error !== null) text = s.error === 'Pr' ? 'Pr Error' : 'Error ' + s.error;
    else if (s.prog.running && !s.prog.waitUntil) text = 'running';
    else if (s.showMantissa) text = formatMantissa(s.stack[0]);
    else if (s.dateDisplay) text = s.dateDisplay;
    else if (s.prog.prgmMode && this.programText() !== null) text = this.programText();
    else if (s.entry) text = formatEntry(s.entry, m.commaDecimal);
    else text = formatNumber(s.stack[0], { fix: m.fix, sci: m.sci, commaDecimal: m.commaDecimal });
    return {
      text,
      ann: ann ?? {
        f: s.prefix === 'f', g: s.prefix === 'g' || s.prefix === 'RCLg',
        begin: m.begin, dmy: m.dmy, c: m.compound, prgm: s.prog.prgmMode,
        rpn: !m.alg, alg: m.alg, paren: s.alg.parens.length > 0,
      },
      running, blink: s.blink, off: s.off,
    };
  }
}
