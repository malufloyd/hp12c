import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
const setup = () => run(fresh(), 'CLFIN 10000 PV 500 FV 5 n 200 i');

test('H1 declining balance', () => steps(setup(), [
  ['1 DB', '4,000.00'], ['x<>y', '5,500.00'], ['2 DB', '2,400.00'], ['x<>y', '3,100.00'],
  ['3 DB', '1,440.00'], ['x<>y', '1,660.00'],
]));
test('H2 straight line and SOYD', () => {
  steps(setup(), [['1 SL', '1,900.00'], ['x<>y', '7,600.00']]);
  steps(setup(), [['1 SOYD', '3,166.67'], ['x<>y', '6,333.33'], ['2 SOYD', '2,533.33']]);
});
test('depreciation errors', () => {
  assert.equal(disp(run(setup(), '1.5 SL')), 'Error 5');
  assert.equal(disp(run(fresh(), 'CLFIN 10000 PV 0 n 1 SL')), 'Error 5');
});
test('depreciation beyond life is zero; lastX = j', () => {
  const c = run(setup(), '6 SL');
  assert.equal(disp(c), '0.00');
  assert.equal(disp(run(c, 'x<>y')), '0.00');
  assert.equal(disp(run(setup(), '2 SOYD LSTx')), '2.00');
});
