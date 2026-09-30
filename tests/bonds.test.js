import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';

test('G1 price and accrued', () => steps(fresh(), [
  ['M.DY 4.75 i 6.75 PMT 4.282004 ENTER 6.042018 PRICE', '120.38'], ['+', '123.07'],
]));
test('G1 ALG', () => assert.equal(disp(run(fresh(), 'ALG M.DY 4.75 i 6.75 PMT 4.282004 ENTER 6.042018 PRICE + x<>y =')), '123.07'));
test('G2 yield', () => {
  const c = run(fresh(), 'M.DY 122.125 PV 6.75 PMT 4.282004 ENTER 6.042018 YTM');
  assert.equal(disp(c), '4.60');
  assert.equal(disp(run(c, 'RCL i')), '4.60');
});
test('bond date errors', () => {
  assert.equal(disp(run(fresh(), 'M.DY 5 i 6 PMT 6.042018 ENTER 4.282004 PRICE')), 'Error 8');
});
test('short maturity (N=1) mid-period', () => steps(fresh(), [
  ['M.DY 5 i 6 PMT 12.012019 ENTER 3.012020 PRICE', '100.23'], ['x<>y', '1.50'],
]));
test('leap-day coupon dates: par at yield = coupon', () => steps(fresh(), [
  ['M.DY 6 i 6 PMT 2.292020 ENTER 8.292020 PRICE', '100.00'],
]));
test('coupon date that does not exist is Error 8', () => {
  assert.equal(disp(run(fresh(), 'M.DY 5 i 6 PMT 2.292020 ENTER 8.292022 PRICE')), 'Error 8');
});
test('YTM stack effect and RCL PV kept', () => {
  const c = run(fresh(), 'M.DY 122.125 PV 6.75 PMT 7 ENTER 8 ENTER 4.282004 ENTER 6.042018 YTM');
  assert.equal(disp(c), '4.60');
  assert.equal(disp(run(c, 'x<>y')), '8.00');
});
