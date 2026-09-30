// CLEAR functions, UNDO and result-backspace. Also the undo snapshot hook.
import { Calculator, cloneState } from './calculator.js';
import { ZERO } from './number.js';

const UNDOABLE = new Set(['clx', 'backspace', 'clrSigma', 'clrFin', 'clrReg']);

// Called by Calculator.exec before every op except 'undo'.
Calculator.prototype.saveUndo = function (name) {
  const s = this.state;
  s.undo = null;
  if (UNDOABLE.has(name)) s.undo = cloneState(s);   // snapshot taken with undo === null
};

function clearStack(s) { s.stack = [ZERO, ZERO, ZERO, ZERO]; s.finStored = false; }

const clx = Calculator.ops.clx;

Calculator.register({
  backspace: c => clx(c),      // not in entry: behaves like CLx (undo saved by saveUndo)
  clrSigma(c) {
    const s = c.state;
    for (let r = 1; r <= 6; r++) s.regs[r] = ZERO;
    clearStack(s);
  },
  clrFin(c) {
    const s = c.state;
    for (const k of Object.keys(s.fin)) s.fin[k] = ZERO;
    s.finStored = false;
  },
  clrReg(c) {
    const s = c.state;
    s.regs = s.regs.map(() => ZERO);
    for (const k of Object.keys(s.fin)) s.fin[k] = ZERO;
    clearStack(s);
    s.lastX = ZERO;
    s.cfExt = [];
    s.nj = s.nj.map(() => 1);
  },
  clrPrgm(c) { c.state.prog.pc = 0; },   // run-mode part; PRGM-mode clearing is added with the program editor
  undo(c) {
    const snap = c.state.undo;
    if (!snap) return;
    Object.assign(c.state, cloneState(snap), { undo: null });
  },
});
