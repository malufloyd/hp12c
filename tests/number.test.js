import { test } from 'node:test';
import assert from 'node:assert/strict';
import { D, normalize, MAX, isInt, toD } from '../src/engine/number.js';

test('rounds to 10 significant digits, half up', () => {
  assert.equal(normalize(new D('1.23456789045')).value.toString(), '1.23456789');
  assert.equal(normalize(new D('1.23456789050')).value.toString(), '1.234567891');
  assert.equal(normalize(new D(2).div(3)).value.toString(), '0.6666666667');
});
test('overflow clamps and flags', () => {
  const r = normalize(new D('1e100'));
  assert.equal(r.overflow, true);
  assert.ok(r.value.eq(MAX));
  assert.ok(normalize(new D('-5e120')).value.eq(MAX.neg()));
});
test('underflow becomes zero', () => {
  const r = normalize(new D('1e-100'));
  assert.equal(r.overflow, false);
  assert.ok(r.value.isZero());
});
test('helpers', () => {
  assert.equal(isInt(toD('3')), true);
  assert.equal(isInt(toD('3.5')), false);
});
