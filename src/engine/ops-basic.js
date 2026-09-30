// Core ops: arithmetic, stack manipulation, STO/RCL, display-mode ops.
// Each op is (calc, arg) => void and may throw CalcError. Later modules can wrap these by name.
import { Calculator, CalcError } from './calculator.js';
import { ZERO } from './number.js';

const FIN_KEYS = ['n', 'i', 'pv', 'pmt', 'fv'];
const ARITH = {
  add: (a, b) => a.plus(b),
  sub: (a, b) => a.minus(b),
  mul: (a, b) => a.times(b),
  div: (a, b) => { if (b.isZero()) throw new CalcError(0); return a.div(b); },
};

function checkReg(calc, r) {
  if (typeof r === 'number' && r >= calc.availableRegs()) throw new CalcError(6);
}

Calculator.register({
  add: c => c.binary(ARITH.add),
  sub: c => c.binary(ARITH.sub),
  mul: c => c.binary(ARITH.mul),
  div: c => c.binary(ARITH.div),
  yx: c => c.binary((y, x) => {
    if ((y.isZero() && x.lte(0)) || (y.isNeg() && !x.isInteger())) throw new CalcError(0);
    return y.pow(x);
  }),

  enter(c) {
    const s = c.state;
    s.stack = [s.stack[0], s.stack[0], s.stack[1], s.stack[2]];
    s.lift = false; s.finStored = false;
  },
  clx(c) { const s = c.state; s.stack[0] = ZERO; s.lift = false; s.finStored = false; },
  chs(c) { c.state.stack[0] = c.x.neg(); c.state.finStored = false; },   // no lift change, no LSTx
  backspace(c) { c.state.stack[0] = ZERO; c.state.lift = false; c.state.finStored = false; },
  swap(c) {
    const s = c.state; [s.stack[0], s.stack[1]] = [s.stack[1], s.stack[0]];
    s.lift = true; s.finStored = false;
  },
  rdn(c) {
    const s = c.state, [x, y, z, t] = s.stack;
    s.stack = [y, z, t, x]; s.lift = true; s.finStored = false;
  },
  lstx(c) { c.push(c.state.lastX); },     // RPN; ALG mode wraps this (Task 5)

  sto(c, r) {
    const s = c.state;
    if (FIN_KEYS.includes(r)) { s.fin[r] = c.x; s.finStored = true; }
    else { checkReg(c, r); s.regs[r] = c.x; }
    s.lift = true;
  },
  rcl(c, r) {
    const s = c.state;
    c.push(FIN_KEYS.includes(r) ? s.fin[r] : s.regs[r]);
  },
  stoArith(c, { op, r }) {
    if (typeof r !== 'number' || r > 4) throw new CalcError(4);
    checkReg(c, r);
    const s = c.state, res = ARITH[op](s.regs[r], c.x);
    const ov = c.fit(res);
    if (s.blink) { s.blink = false; throw new CalcError(1); }
    s.regs[r] = ov; s.lift = true;
  },
  compound(c) { c.state.mode.compound = !c.state.mode.compound; },

  fix(c, n) { c.state.mode.fix = n; c.state.mode.sci = false; },
  sci(c) { c.state.mode.sci = true; },
  prefix(c) { c.state.showMantissa = true; },     // cleared by release()
});
