// Algebraic (ALG) mode: left-to-right chain arithmetic, no precedence, up to 13 open parentheses.
// IMPORT-ORDER DEPENDENCY: this module wraps handlers registered by ops-basic.js and mathfn.js
// (add/sub/mul/div/yx/enter/lstx/pct), so all-ops.js must import it after those modules.
import { Calculator, CalcError } from './calculator.js';
import { HUNDRED } from './number.js';
import { freshAlg } from './state.js';

const MAX_PARENS = 13;
const FN = {
  add: (a, b) => a.plus(b),
  sub: (a, b) => a.minus(b),
  mul: (a, b) => a.times(b),
  div: (a, b) => { if (b.isZero()) throw new CalcError(0); return a.div(b); },
  yx: (y, x) => {
    if ((y.isZero() && x.lte(0)) || (y.isNeg() && !x.isInteger())) throw new CalcError(0);
    return y.pow(x);
  },
};

// Apply pending op to (acc, X); returns the inner result (X itself when nothing is pending).
function evalPending(c) {
  const a = c.state.alg;
  return a.op ? c.fit(FN[a.op](a.acc, c.state.stack[0])) : c.state.stack[0];
}

export function algBinary(c, opName) {
  const s = c.state;
  // Operator pressed right after another one (X is still the running result): just replace it.
  if (s.alg.op && s.stack[0] === s.alg.acc) { s.alg.op = opName; return; }
  const x = s.stack[0], r = evalPending(c);
  s.lastX = x;
  s.alg.acc = r; s.alg.op = opName;
  s.stack[0] = r; s.lift = false; s.finStored = false;
}

function rparen(c) {
  const s = c.state, a = s.alg;
  if (!a.parens.length) return;
  const x = s.stack[0], r = evalPending(c);
  s.lastX = x;
  const outer = a.parens.pop();
  a.acc = outer.acc; a.op = outer.op;
  s.stack[0] = r; s.lift = true; s.finStored = false;
}

function equals(c) {
  const s = c.state, a = s.alg;
  while (a.parens.length) rparen(c);
  const x = s.stack[0], r = evalPending(c);
  if (a.op) s.lastX = x;
  a.acc = null; a.op = null;
  s.stack[0] = r; s.stack[1] = r;       // copy in Y so D%, %T, x<>y see the result
  s.lift = false; s.finStored = false;
}

export function algPercent(c) {
  const a = c.state.alg, acc = a.acc, add = a.op === 'add' || a.op === 'sub';
  c.unary(x => add ? acc.times(x).div(HUNDRED) : x.div(HUNDRED));
}

const prev = { ...Calculator.ops };
const inAlg = c => c.state.mode.alg;
const routed = {};
for (const name of Object.keys(FN)) {
  routed[name] = (c, arg) => inAlg(c) ? algBinary(c, name) : prev[name](c, arg);
}

Calculator.register({
  ...routed,
  enter: (c, arg) => inAlg(c) ? equals(c) : prev.enter(c, arg),
  pct: (c, arg) => inAlg(c) ? algPercent(c) : prev.pct(c, arg),
  lstx(c, arg) {
    if (!inAlg(c)) return prev.lstx(c, arg);
    const s = c.state, x = s.stack[0];
    s.stack[0] = s.lastX; s.lastX = x; s.finStored = false;
  },
  equals,
  lparen(c) {
    const a = c.state.alg;
    if (a.parens.length >= MAX_PARENS) throw new CalcError(4);
    a.parens.push({ acc: a.acc, op: a.op });
    a.acc = null; a.op = null;
    c.state.lift = false;
  },
  rparen,
  rpn(c) { c.state.mode.alg = false; c.state.alg = freshAlg(); },
  alg(c) { c.state.mode.alg = true; c.state.alg = freshAlg(); },
});
