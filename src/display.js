import { D } from './engine/number.js';

function group(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
export function swapSeparators(t, commaDecimal) {
  return commaDecimal ? t.replace(/[.,]/g, c => (c === '.' ? ',' : '.')) : t;
}
function sci(x) {
  const neg = x.isNeg();
  let m = x.abs().toSignificantDigits(7, D.ROUND_HALF_UP);
  if (m.e > 99) m = x.abs().toSignificantDigits(7, D.ROUND_DOWN);   // overflow shows 9.999999 99
  const e = m.e;                                   // decimal.js exponent of first digit
  const mant = m.div(new D(10).pow(e)).toFixed(6);
  const exp = String(Math.abs(e)).padStart(2, '0');
  return (neg ? '-' : '') + mant + (e < 0 ? '-' : ' ') + exp;
}
export function formatNumber(x, { fix, sci: sciMode, commaDecimal }) {
  let t;
  if (sciMode && !x.isZero()) t = sci(x);
  else if (x.isZero()) t = fix === 0 ? '0.' : '0.' + '0'.repeat(fix);
  else {
    const a = x.abs();
    const intDigits = a.e >= 0 ? a.e + 1 : 1;
    if (intDigits > 10) t = sci(x);
    else {
      let d = Math.min(fix, 10 - intDigits);
      let r = a.toDecimalPlaces(d, D.ROUND_HALF_UP);
      const rInt = r.e >= 0 ? r.e + 1 : 1;
      if (rInt > 10) t = sci(x);
      else {
        if (rInt + d > 10) { d = 10 - rInt; r = a.toDecimalPlaces(d, D.ROUND_HALF_UP); }
        if (r.isZero()) t = sci(x);
        else {
          const [ip, fp] = r.toFixed(d).split('.');
          t = (x.isNeg() ? '-' : '') + group(ip) + '.' + (fp ?? '');
        }
      }
    }
  }
  return swapSeparators(t, commaDecimal);
}
export function formatMantissa(x) {
  if (x.isZero()) return '0000000000';
  return x.abs().toSignificantDigits(10, D.ROUND_HALF_UP).toFixed()
    .replace('.', '').replace(/^0+/, '').padEnd(10, '0').slice(0, 10);
}
export function formatEntry({ mant, exp, expNeg, neg }, commaDecimal) {
  let [ip, fp] = mant.split('.');
  if (ip === '') ip = '0';
  let t = (exp === null ? group(ip) : ip) + (fp !== undefined ? '.' + fp : '');
  if (exp !== null) t += (expNeg ? '-' : ' ') + exp.padStart(2, '0');
  return swapSeparators((neg ? '-' : '') + t, commaDecimal);
}
