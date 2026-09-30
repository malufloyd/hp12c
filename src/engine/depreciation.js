// Depreciation: f SL, f SOYD, f DB. PV = cost, FV = salvage, n = life, i = DB factor %, X = year.
import { Calculator, CalcError } from './calculator.js';
import { D, ZERO } from './number.js';

function setup(c) {
  const s = c.state, { n, i, pv, fv } = s.fin, j = s.stack[0];
  if (!n.isInteger() || n.lte(0) || !j.isInteger() || j.lte(0)) throw new CalcError(5);
  return { s, L: n.toNumber(), j: j.toNumber(), i, sbv: pv, sal: fv, d: c.dispDecimals(), jx: j };
}
const MAX_YEARS = 99999;                  // same policy as AMORT's cap: more iterations -> Error 5
const rnd = (v, d) => v.toDecimalPlaces(d, D.ROUND_HALF_UP);

function finish({ s, jx }, dpn, rdv, c) {
  const z = s.stack[2], t = s.stack[3];
  s.lastX = jx;
  s.stack = [c.fit(dpn), c.fit(rdv), z, t];
  s.lift = true; s.finStored = false;
}

Calculator.register({
  sl(c) {
    const p = setup(c), { L, j, sbv, sal, d } = p;
    if (j > L) return finish(p, ZERO, ZERO, c);
    const dep = sbv.minus(sal), dpn = rnd(dep.div(L), d);
    finish(p, dpn, dep.minus(dpn.times(j)), c);
  },
  soyd(c) {
    const p = setup(c), { L, j, sbv, sal, d } = p;
    if (j > L) return finish(p, ZERO, ZERO, c);
    if (j > MAX_YEARS) throw new CalcError(5);
    const dep = sbv.minus(sal), sum = L * (L + 1) / 2;
    let rdv = dep, dpn = ZERO;
    for (let k = 1; k <= j; k++) {
      dpn = rnd(dep.times(L - k + 1).div(sum), d);
      rdv = rdv.minus(dpn);
    }
    finish(p, dpn, rdv, c);
  },
  db(c) {
    const p = setup(c), { L, j, i, sbv, sal, d } = p;
    if (j > L) return finish(p, ZERO, ZERO, c);
    if (j > MAX_YEARS) throw new CalcError(5);
    let rbv = sbv, dpn = ZERO;
    for (let k = 1; k <= j; k++) {
      if (rbv.lte(sal)) { dpn = ZERO; break; }          // book value reached salvage: nothing left to depreciate
      dpn = rnd(rbv.times(i).div(100 * L), d);
      const cap = rbv.minus(sal);
      if (dpn.gt(cap)) dpn = cap;
      if (dpn.isNeg()) dpn = ZERO;
      if (dpn.isZero()) break;                          // rbv no longer changes, so later years are 0 too
      rbv = rbv.minus(dpn);
    }
    finish(p, dpn, rbv.minus(sal), c);
  },
});
