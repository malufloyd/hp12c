import Decimal from '../../vendor/decimal.mjs';

export const D = Decimal.clone({
  precision: 34, rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -200, toExpPos: 200, minE: -9e15, maxE: 9e15,
});
export const ZERO = new D(0);
export const ONE = new D(1);
export const HUNDRED = new D(100);
export const MAX = new D('9.999999999e99');
const MIN = new D('1e-99');

export function toD(v) { return v instanceof D ? v : new D(v); }
export function isInt(x) { return x.isInteger(); }

export function normalize(x) {
  if (!x.isFinite()) return { value: x.isNeg() ? MAX.neg() : MAX, overflow: true };
  if (x.isZero()) return { value: ZERO, overflow: false };
  const r = x.toSignificantDigits(10, D.ROUND_HALF_UP);
  if (r.abs().gt(MAX)) return { value: r.isNeg() ? MAX.neg() : MAX, overflow: true };
  if (r.abs().lt(MIN)) return { value: ZERO, overflow: false };
  return { value: r, overflow: false };
}
