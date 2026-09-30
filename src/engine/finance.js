// Time value of money: n i PV PMT FV, 12x, 12div, BEG/END, INT.
import { Calculator, CalcError } from './calculator.js';
import { D, ZERO, ONE, HUNDRED } from './number.js';
import { solveRoot } from './solve.js';

const E5 = () => new CalcError(5);

// Residual of PV*A + (1+rS)*PMT*a + FV*v for fractional rate r (a D).
export function tvmResidual(st, r) {
  const { n, pv, pmt, fv } = st.fin, S = st.mode.begin ? 1 : 0;
  const N = n.trunc(), F = n.minus(N);
  const A = F.isZero() ? ONE : st.mode.compound ? ONE.plus(r).pow(F) : ONE.plus(r.times(F));
  const v = ONE.plus(r).pow(N.neg());
  const a = r.isZero() ? N : ONE.minus(v).div(r);
  return pv.times(A).plus(ONE.plus(r.times(S)).times(pmt).times(a)).plus(fv.times(v));
}

function parts(st) {
  const { n, i } = st.fin, r = i.div(HUNDRED), S = st.mode.begin ? 1 : 0;
  if (i.lte(-100)) throw E5();
  const N = n.trunc(), F = n.minus(N);
  const A = F.isZero() ? ONE : st.mode.compound ? ONE.plus(r).pow(F) : ONE.plus(r.times(F));
  const v = ONE.plus(r).pow(N.neg());
  const a = r.isZero() ? N : ONE.minus(v).div(r);
  return { r, A, v, a, f: ONE.plus(r.times(S)) };
}

const COMPUTE = {
  pv(st) { const { A, v, a, f } = parts(st), { pmt, fv } = st.fin; return f.times(pmt).times(a).plus(fv.times(v)).neg().div(A); },
  pmt(st) { const { A, v, a, f } = parts(st), { pv, fv } = st.fin; const d = f.times(a); if (d.isZero()) throw E5(); return pv.times(A).plus(fv.times(v)).neg().div(d); },
  fv(st) { const { A, v, a, f } = parts(st), { pv, pmt } = st.fin; return pv.times(A).plus(f.times(pmt).times(a)).neg().div(v); },
  n(st) {
    const { i, pv, pmt, fv } = st.fin, r = i.div(HUNDRED), S = st.mode.begin ? 1 : 0;
    if (i.lte(-100)) throw E5();
    let n;
    if (r.isZero()) {
      if (pmt.isZero()) throw E5();
      n = pv.plus(fv).neg().div(pmt);
    } else {
      const k = ONE.plus(r.times(S)).times(pmt).div(r), den = k.minus(fv);
      if (den.isZero()) throw E5();
      const v = pv.plus(k).div(den);
      if (v.lte(0)) throw E5();
      n = v.ln().neg().div(ONE.plus(r).ln());
    }
    if (!n.isFinite() || n.lte(0)) throw E5();   // manual App. D: PMT between FV*d and -PV*d -> no solution
    const fl = n.floor();
    return n.minus(fl).lt('0.005') ? fl : fl.plus(1);
  },
  i(st) {
    const { n } = st.fin;
    if (n.isZero() || n.isNeg() || n.gte('1e10')) throw E5();
    const r = solveRoot(x => tvmResidual(st, x), { lo: '-0.999999', hi: '1e6', guess: '0.01' });
    if (r === null) throw E5();
    return r.times(HUNDRED);
  },
};

export function finKey(c, name) {
  const s = c.state;
  if (s.finStored) {
    c.push(COMPUTE[name](s));
    s.fin[name] = s.stack[0];
  } else {
    s.fin[name] = c.x; s.lift = true;
  }
  s.finStored = true;
}

function finUnary(c, name, fn) {
  c.unary(fn);
  c.state.fin[name] = c.state.stack[0];
  c.state.finStored = true;
}

Calculator.register({
  n: c => finKey(c, 'n'), i: c => finKey(c, 'i'), pv: c => finKey(c, 'pv'),
  pmt: c => finKey(c, 'pmt'), fv: c => finKey(c, 'fv'),
  '12x': c => finUnary(c, 'n', x => x.times(12)),
  '12div': c => finUnary(c, 'i', x => x.div(12)),
  beg: c => { c.state.mode.begin = true; },
  end: c => { c.state.mode.begin = false; },
  int(c) {
    const { n, i, pv } = c.state.fin, base = pv.neg().times(i.div(HUNDRED)).times(n);
    c.push(base.div(365)); c.push(pv.neg()); c.push(base.div(360));
  },
});
