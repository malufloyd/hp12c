// Bonds: f PRICE and f YTM (semiannual coupons, actual/actual, SIA / HP manual formulas).
import { Calculator, CalcError } from './calculator.js';
import { D, HUNDRED } from './number.js';
import { parseDate, dayNumber, addMonths } from './dates.js';
import { solveRoot } from './solve.js';

const E8 = () => new CalcError(8);
const days = dt => dayNumber(dt);

// Returns a function yld(D) -> price(D) plus accrued interest (D).
function bondModel(st) {
  const dmy = st.mode.dmy;
  const settle = parseDate(st.stack[1], dmy), mat = parseDate(st.stack[0], dmy);
  if (days(mat) <= days(settle) || mat.y - settle.y > 500) throw E8();
  let k = 1, prev, next = mat;
  for (;; k++) {
    prev = addMonths(mat, -6 * k);
    if (prev === null) throw E8();
    if (days(prev) <= days(settle)) break;
    next = prev;
  }
  const N = k, E = days(next) - days(prev), A = days(settle) - days(prev);
  const DSC = E - A, DSM = days(mat) - days(settle);
  const cpn = st.fin.pmt.div(2), a = new D(A).div(E), accrued = cpn.times(a);
  const dscE = new D(DSC).div(E);
  const price = yld => {
    const r = yld.div(200);
    if (N === 1) {
      return cpn.times(2).div(2).plus(100).div(new D(1).plus(new D(DSM).div(E).times(r))).minus(accrued);
    }
    const g = new D(1).plus(r);
    let p = new D(100).div(g.pow(dscE.plus(N - 1)));
    for (let j = 1; j <= N; j++) p = p.plus(cpn.div(g.pow(dscE.plus(j - 1))));
    return p.minus(accrued);
  };
  return { price, accrued };
}

Calculator.register({
  price(c) {
    const s = c.state, { price, accrued } = bondModel(s);
    const p = c.fit(price(s.fin.i));
    s.lastX = s.stack[0];
    s.stack = [p, c.fit(accrued), s.stack[2], s.stack[3]];
    s.fin.pv = p; s.lift = true; s.finStored = false;
  },
  ytm(c) {
    const s = c.state, { price } = bondModel(s), target = s.fin.pv;
    const y = solveRoot(v => price(v).minus(target), { lo: '-199.99', hi: '1e5', guess: 5 });
    if (y === null) throw new CalcError(5);
    const r = c.fit(y);
    s.lastX = s.stack[0];
    s.stack = [r, s.stack[2], s.stack[3], s.stack[3]];
    s.fin.i = r; s.lift = true; s.finStored = false; s.flashRunning = true;
  },
});
