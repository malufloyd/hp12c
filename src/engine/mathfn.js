// Math and percent functions. Every one saves lastX and leaves Y (and above) untouched.
import { Calculator, CalcError } from './calculator.js';
import { D, ONE, HUNDRED } from './number.js';

const err0 = () => { throw new CalcError(0); };

Calculator.register({
  recip: c => c.unary(x => x.isZero() ? err0() : ONE.div(x)),
  sqrt: c => c.unary(x => x.isNeg() ? err0() : x.sqrt()),
  ex: c => c.unary(x => x.exp()),
  ln: c => c.unary(x => x.lte(0) ? err0() : x.ln()),
  sq: c => c.unary(x => x.times(x)),
  frac: c => c.unary(x => x.minus(x.trunc())),
  intg: c => c.unary(x => x.trunc()),
  fact: c => c.unary(x => {
    if (!x.isInteger() || x.isNeg() || x.gt(69)) err0();
    let r = ONE;
    for (let i = 2, n = x.toNumber(); i <= n; i++) r = r.times(i);
    return r;
  }),
  rnd: c => c.unary(x => {
    if (c.state.mode.sci) return x.isZero() ? x : x.toSignificantDigits(7, D.ROUND_HALF_UP);
    return x.toDecimalPlaces(c.dispDecimals(), D.ROUND_HALF_UP);
  }),
  pct: c => { const y = c.y; c.unary(x => y.times(x).div(HUNDRED)); },
  dpct: c => { const y = c.y; c.unary(x => y.isZero() ? err0() : x.minus(y).div(y).times(HUNDRED)); },
  pctT: c => { const y = c.y; c.unary(x => y.isZero() ? err0() : x.div(y).times(HUNDRED)); },
});
