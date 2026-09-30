import { test } from 'node:test';
import assert from 'node:assert/strict';
import { D } from '../src/engine/number.js';
import { formatNumber, formatMantissa, formatEntry } from '../src/display.js';
import { LAYOUT } from '../src/engine/keys.js';

const f = (s, fix = 2, sci = false, commaDecimal = false) =>
  formatNumber(new D(s), { fix, sci, commaDecimal });

test('FIX formats (manual p.87-88)', () => {
  const x = '14.8745632';
  assert.equal(f(x, 2), '14.87');
  assert.equal(f(x, 4), '14.8746');
  assert.equal(f(x, 1), '14.9');
  assert.equal(f(x, 0), '15.');
  assert.equal(f(x, 9), '14.87456320');
  assert.equal(f('1064.54'), '1,064.54');
  assert.equal(f('-13.54'), '-13.54');
  assert.equal(f('0'), '0.00');
  assert.equal(f('0', 0), '0.');
  assert.equal(f('-369494.0932'), '-369,494.09');
  assert.equal(f('1234567890'), '1,234,567,890.');
});
test('auto scientific when too large or too small', () => {
  assert.equal(f('12345678901'), '1.234568 10');
  assert.equal(f('0.001'), '1.000000-03');
  assert.equal(f('0.005'), '0.01');
  assert.equal(f('9.999999999e99'), '9.999999 99');
});
test('SCI mode', () => {
  assert.equal(f('14.8745632', 2, true), '1.487456 01');
  assert.equal(f('-0.00012345', 2, true), '-1.234500-04');
});
test('comma decimal swap', () => {
  assert.equal(f('1064.54', 2, false, true), '1.064,54');
});
test('mantissa', () => {
  assert.equal(formatMantissa(new D('14.8745632')), '1487456320');
  assert.equal(formatMantissa(new D('0')), '0000000000');
});
test('entry display', () => {
  assert.equal(formatEntry({ mant: '23.8', exp: null, expNeg: false, neg: false }, false), '23.8');
  assert.equal(formatEntry({ mant: '1053', exp: null, expNeg: false, neg: false }, false), '1,053');
  assert.equal(formatEntry({ mant: '5.', exp: null, expNeg: false, neg: true }, false), '-5.');
  assert.equal(formatEntry({ mant: '.5', exp: null, expNeg: false, neg: false }, false), '0.5');
  assert.equal(formatEntry({ mant: '1.7814', exp: '12', expNeg: false, neg: false }, false), '1.7814 12');
  assert.equal(formatEntry({ mant: '1.7814', exp: '1', expNeg: true, neg: false }, false), '1.7814-01');
});
test('layout has 39 keys and ENTER spans two rows', () => {
  assert.equal(LAYOUT.length, 39);
  const enter = LAYOUT.find(k => k.code === 36);
  assert.equal(enter.rows, 2);
  assert.equal(LAYOUT.find(k => k.code === 26).f, 'ALG');
  assert.equal(LAYOUT.find(k => k.code === 44).g, '(');
});
