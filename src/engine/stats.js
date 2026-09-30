// Statistics: Σ+, Σ−, x̄, s, x̂,r, ŷ,r, x̄w. Registers R1 n, R2 Σx, R3 Σx², R4 Σy, R5 Σy², R6 Σxy.
import { Calculator, CalcError } from './calculator.js';
import { ONE } from './number.js';

const E2 = () => new CalcError(2);

function acc(c, sign) {
  const s = c.state, x = s.stack[0], y = s.stack[1], r = s.regs;
  const add = (k, v) => { r[k] = c.fit(r[k].plus(sign > 0 ? v : v.neg())); };
  add(1, ONE); add(2, x); add(3, x.times(x));
  add(4, y); add(5, y.times(y)); add(6, x.times(y));
  s.lastX = x;
  s.stack[0] = r[1];
  s.lift = false; s.finStored = false;
}

// Sums as Decimals: { n, sx, sxx, sy, syy, sxy }
const sums = c => { const r = c.state.regs; return { n: r[1], sx: r[2], sxx: r[3], sy: r[4], syy: r[5], sxy: r[6] }; };

// Push two values (lower one first) so that X = second, Y = first, regardless of lift state.
function pushPair(c, first, second) { c.state.lift = true; c.push(first); c.push(second); }

function sd(n, s, ss) {           // sample std dev from n, Σ, Σ²
  if (n.lte(1)) throw E2();
  const rad = n.times(ss).minus(s.times(s));
  if (rad.isNeg()) throw E2();
  return rad.div(n.times(n.minus(1))).sqrt();
}

function regression(c) {
  const { n, sx, sxx, sy, syy, sxy } = sums(c);
  if (n.isZero()) throw E2();
  const dx = n.times(sxx).minus(sx.times(sx)), dy = n.times(syy).minus(sy.times(sy));
  if (dx.isZero()) throw E2();
  const num = n.times(sxy).minus(sx.times(sy)), B = num.div(dx), A = sy.minus(B.times(sx)).div(n);
  const prod = dx.times(dy);
  if (prod.isNeg() || prod.isZero()) throw E2();
  return { A, B, r: num.div(prod.sqrt()) };
}

function estimate(c, fn) {
  const s = c.state, x = s.stack[0], { A, B, r } = regression(c);
  if (fn === 'x' && B.isZero()) throw E2();
  const est = fn === 'y' ? A.plus(B.times(x)) : x.minus(A).div(B);
  const [, y, z] = s.stack;
  s.lastX = x;
  s.stack = [c.fit(est), c.fit(r), y, z];
  s.lift = true; s.finStored = false;
}

Calculator.register({
  sigmaPlus: c => acc(c, 1),
  sigmaMinus: c => acc(c, -1),
  xbar(c) {
    const { n, sx, sy } = sums(c);
    if (n.isZero()) throw E2();
    pushPair(c, sy.div(n), sx.div(n));
  },
  s(c) {
    const { n, sx, sxx, sy, syy } = sums(c);
    const vx = sd(n, sx, sxx), vy = sd(n, sy, syy);
    pushPair(c, vy, vx);
  },
  xhat: c => estimate(c, 'x'),
  yhat: c => estimate(c, 'y'),
  xw(c) {
    const { sx, sxy } = sums(c);
    if (sx.isZero()) throw E2();
    c.unary(() => sxy.div(sx));
  },
});
