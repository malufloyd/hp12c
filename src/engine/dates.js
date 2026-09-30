// Calendar functions: date parsing/encoding, day counts, DATE / ΔDYS ops.
import { Calculator, CalcError } from './calculator.js';
import { D } from './number.js';

const MIN_DN = () => dayNumber({ y: 1582, m: 10, d: 15 });
const MAX_DN = () => dayNumber({ y: 4046, m: 11, d: 25 });

export const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

// Days since 0000-03-01, proleptic Gregorian.
export function dayNumber({ y, m, d }) {
  const yy = m <= 2 ? y - 1 : y, mm = m <= 2 ? m + 9 : m - 3;
  const era = Math.floor(yy / 400), yoe = yy - era * 400;
  const doy = Math.floor((153 * mm + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe;
}
export function fromDayNumber(n) {
  const era = Math.floor(n / 146097), doe = n - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}
export const inRange = dt => { const n = dayNumber(dt); return n >= MIN_DN() && n <= MAX_DN(); };

// 1 = Monday ... 7 = Sunday.
export function weekday(dt) { return (((dayNumber(dt) + 2) % 7) + 7) % 7 + 1; }

export function days30360(a, b) {
  let d1 = a.d, d2 = b.d;
  if (d1 === 31) d1 = 30;
  if (d2 === 31 && d1 >= 30) d2 = 30;
  return 360 * (b.y - a.y) + 30 * (b.m - a.m) + (d2 - d1);
}

// x is a D (or number) encoded MM.DDYYYY (M.DY) or DD.MMYYYY (D.MY). Throws Error 8 if invalid.
export function parseDate(x, dmy) {
  const v = x instanceof D ? x : new D(x);
  if (v.isNeg()) throw new CalcError(8);
  const s = v.toFixed(6), [ip, fp] = s.split('.');
  const a = Number(ip), b = Number(fp.slice(0, 2)), y = Number(fp.slice(2, 6));
  const m = dmy ? b : a, d = dmy ? a : b;
  if (m < 1 || m > 12 || d < 1 || y < 1 || d > daysInMonth(y, m)) throw new CalcError(8);
  const dt = { y, m, d };
  if (!inRange(dt)) throw new CalcError(8);
  return dt;
}
export function encodeDate({ y, m, d }, dmy) {
  const p2 = n => String(n).padStart(2, '0');
  const [a, b] = dmy ? [d, m] : [m, d];
  return new D(a + '.' + p2(b) + String(y).padStart(4, '0'));
}

// Add k months keeping the day; null if that day doesn't exist in the target month.
export function addMonths({ y, m, d }, k) {
  const t = y * 12 + (m - 1) + k, ny = Math.floor(t / 12), nm = t - ny * 12 + 1;
  return d > daysInMonth(ny, nm) ? null : { y: ny, m: nm, d };
}

Calculator.register({
  dmy: c => { c.state.mode.dmy = true; },
  mdy: c => { c.state.mode.dmy = false; },
  ddys(c) {
    const s = c.state, dmy = s.mode.dmy;
    const d1 = parseDate(s.stack[1], dmy), d2 = parseDate(s.stack[0], dmy);
    const actual = dayNumber(d2) - dayNumber(d1), thirty = days30360(d1, d2);
    s.lastX = s.stack[0];
    s.stack = [c.fit(new D(actual)), c.fit(new D(thirty)), s.stack[2], s.stack[3]];
    s.lift = true; s.finStored = false;
  },
  date(c) {
    const s = c.state, dmy = s.mode.dmy;
    const dt = parseDate(s.stack[1], dmy);
    const days = s.stack[0];
    const n = dayNumber(dt) + days.trunc().toNumber();
    if (!(n >= MIN_DN() && n <= MAX_DN())) throw new CalcError(8);
    const r = fromDayNumber(n);
    s.lastX = days;
    s.stack = [c.fit(encodeDate(r, dmy)), s.stack[2], s.stack[3], s.stack[3]];
    s.lift = true; s.finStored = false;
    const p2 = v => String(v).padStart(2, '0'), sep = s.mode.commaDecimal ? '.' : ',';
    const [a, b] = dmy ? [r.d, r.m] : [r.m, r.d];
    s.dateDisplay = [p2(a), p2(b), String(r.y).padStart(4, '0')].join(sep) + ' ' + weekday(r);
  },
});
