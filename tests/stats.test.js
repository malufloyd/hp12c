import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
const data = [[32, 17000], [40, 25000], [45, 26000], [40, 20000], [38, 21000], [50, 28000], [35, 15000]];
function loaded() {
  const c = run(fresh(), 'CLSIGMA');
  data.forEach(([h, s], k) => { run(c, `${h} ENTER ${s} Σ+`); assert.equal(disp(c), `${k + 1}.00`); });
  return c;
}
test('J1 mean, std dev, regression', () => {
  steps(loaded(), [['xbar', '21,714.29'], ['x<>y', '40.00'], ['s', '4,820.59'], ['x<>y', '6.03']]);
  steps(loaded(), [['48 xhat', '28,818.93'], ['x<>y', '0.90'], ['0 yhat', '15.55']]);
});
test('J1 population std dev trick', () => steps(loaded(), [
  ['xbar Σ+', '8.00'], ['s', '4,463.00'], ['x<>y', '5.58'],
]));
test('J2 weighted mean', () => {
  const c = run(fresh(), 'CLSIGMA 1.16 ENTER 15 Σ+ 1.24 ENTER 7 Σ+ 1.2 ENTER 10 Σ+ 1.18 ENTER 17 Σ+');
  assert.equal(disp(c), '4.00');
  assert.equal(disp(run(c, 'xw')), '1.19');
});
test('stat errors', () => {
  assert.equal(disp(run(fresh(), 'CLSIGMA xbar')), 'Error 2');
  assert.equal(disp(run(fresh(), 'CLSIGMA 1 ENTER 2 Σ+ s')), 'Error 2');
});
test('Σ- removes a point', () => {
  assert.equal(disp(run(fresh(), 'CLSIGMA 1 ENTER 2 Σ+ 3 ENTER 4 Σ+ 3 ENTER 4 Σ- xbar')), '2.00');
});
