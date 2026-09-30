// Keystroke programming: program memory, recording, line display and the step-driven runner.
// prog.pc is the number of the CURRENT line (0 = "000"); the next line to execute is pc + 1.
import { Calculator, CalcError } from './calculator.js';
import { resolve } from './resolve.js';
import { K } from './keys.js';
import { ZERO } from './number.js';

const MAX_LINES = 400;
const IMMEDIATE = new Set(['pr', 'sst', 'bst', 'mem', 'clrPrgm', 'prefix']);
const NOT_PROGRAMMABLE = new Set(['clrReg', 'dmy', 'mdy', 'compound']);
const isGto = codes => !!codes && codes[0] === K.G && codes[1] === K.RDN;

// ---- memory model ----
export const allottedFor = n => Math.min(MAX_LINES, Math.max(8, 8 + 7 * Math.ceil((n - 8) / 7)));
export const regsFor = allotted => 20 - Math.max(0, Math.ceil((allotted - 260) / 7));

export function formatLine(pc, codes) {
  const num = String(pc).padStart(3, '0') + ',';
  if (pc === 0) return num;
  if (!codes) codes = [K.G, K.RDN, 0];                       // implicit GTO 000
  if (isGto(codes)) return num + '43,33,' + String(codes[2]).padStart(3, '0');
  return num + codes.map(c => String(c).padStart(2, ' ')).join(' ').padStart(7, ' ');
}

Object.assign(Calculator.prototype, {
  availableRegs() { return regsFor(this.state.prog.allotted); },
  programText() { const p = this.state.prog; return formatLine(p.pc, p.lines[p.pc - 1]); },

  // Program-mode key: collect the raw codes of the instruction being formed; true = consumed.
  recordKey(code) {
    if (code === K.ON) return false;
    const s = this.state, p = s.prog, buf = (this.recBuf ||= []);
    if ((code === K.F || code === K.G) && (s.prefix === 'f' || s.prefix === 'g')) buf.length = 0;
    buf.push(code);
    const action = resolve(this, code);
    if (!action) { if (s.prefix === null) buf.length = 0; return true; }
    const codes = buf.splice(0);
    const name = action.op ?? action.entry;
    if (IMMEDIATE.has(name) || (name === 'gto' && action.arg.dot)) { this.perform(action); return true; }
    if (NOT_PROGRAMMABLE.has(name)) return true;
    if (p.lines.length >= MAX_LINES) { s.error = 4; return true; }
    const at = Math.min(p.pc, p.lines.length);
    p.lines.splice(at, 0, name === 'gto' ? [K.G, K.RDN, action.arg.n] : codes);
    p.pc = at + 1;
    p.allotted = allottedFor(p.lines.length);
    for (let r = this.availableRegs(); r < 20; r++) s.regs[r] = ZERO;   // converted registers are lost
    return true;
  },

  onRelease() {
    const s = this.state, p = s.prog;
    if (!p.sstPending) return;
    p.sstPending = false; s.dateDisplay = null;
    step(this, null);                                       // SST released: execute the shown line
  },
});

// ---- runner ----
// Execute the line after pc. Returns true to keep running. now = null ignores PSE waits.
export function step(calc, now = null) {
  let p = calc.state.prog;
  const next = p.pc + 1;
  if (next > p.lines.length) { p.pc = 0; return false; }    // implicit GTO 000
  const codes = p.lines[next - 1];
  p.pc = next;
  if (isGto(codes)) {
    if (codes[2] === 0) { p.pc = 0; return false; }
    p.pc = codes[2] - 1;                                    // line n executes next
    return true;
  }
  if (codes.length === 1 && codes[0] === K.RS) return false;
  p.skip = false; p.pause = false;
  for (const c of codes) calc.dispatch(c);
  if (calc.state.error !== null) return false;              // errors halt the program
  p = calc.state.prog;                                      // exec may have replaced prog on rollback
  if (p.skip) p.pc++;
  if (p.pause && now !== null) p.waitUntil = now + 1000;
  return true;
}

export function tick(calc, nowMs, budgetSteps = 500) {
  const p = calc.state.prog;
  if (!p.running) return false;
  if (p.waitUntil) { if (nowMs < p.waitUntil) return true; p.waitUntil = 0; }
  for (let i = 0; i < budgetSteps; i++) {
    if (!step(calc, nowMs)) { calc.state.prog.running = false; return false; }
    if (calc.state.prog.waitUntil) return true;
  }
  return true;
}

export function runUntilHalt(calc, maxSteps = 100000) {
  for (let i = 0; i < maxSteps; i++) {
    if (!calc.state.prog.running) return true;
    if (!step(calc, null)) { calc.state.prog.running = false; return true; }
  }
  calc.state.prog.running = false;
  return false;
}

// ---- ops ----
const cond = (name, test) => (c) => { c.state.prog.skip = !test(c); };
const gotoLine = (c, n) => { if (n > c.state.prog.allotted) throw new CalcError(4); c.state.prog.pc = n; };

Calculator.register({
  pr(c) { const p = c.state.prog; p.prgmMode = !p.prgmMode; p.pc = 0; },
  rs(c) { const p = c.state.prog; p.running = true; p.waitUntil = 0; },
  pse(c) { c.state.prog.pause = true; },
  xley: cond('xley', c => c.x.lte(c.y)),
  xeq0: cond('xeq0', c => c.x.isZero()),
  gto(c, { n }) { gotoLine(c, n); },
  sst(c) {
    const s = c.state, p = s.prog;
    if (p.prgmMode) { p.pc = p.pc >= p.allotted ? 0 : p.pc + 1; return; }
    const n = p.pc + 1;
    if (n > p.allotted) { p.pc = 0; return; }
    p.sstPending = true;                                    // press shows the line, release runs it
    s.dateDisplay = formatLine(n, p.lines[n - 1]);
  },
  bst(c) {
    const s = c.state, p = s.prog;
    p.pc = p.pc > 0 ? p.pc - 1 : p.lines.length;
    if (!p.prgmMode) s.dateDisplay = formatLine(p.pc, p.lines[p.pc - 1]);
  },
  mem(c) {
    const p = c.state.prog, pad = (n, w) => String(n).padStart(w, '0');
    c.state.dateDisplay = `P-${pad(p.allotted, 2)} r-${pad(c.availableRegs(), 2)}`;
  },
  clrPrgm(c) {
    const p = c.state.prog;
    p.pc = 0;
    if (p.prgmMode) { p.lines = []; p.allotted = 8; }
  },
});
