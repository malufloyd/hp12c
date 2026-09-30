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

test('I5: SOYD/DB with huge life and year return promptly (Error 5, no hang)', () => {
  for (const fn of ['SOYD', 'DB']) {
    const c = run(fresh(), `CLFIN 10000 PV 500 FV 603609912 n 200 i 603609912 ${fn}`);
    assert.equal(disp(c), 'Error 5', fn);
  }
  const t0 = Date.now();
  assert.equal(disp(run(fresh(), 'CLFIN 10000 PV 500 FV 100000 n 10 i 100000 SOYD')), 'Error 5');
  assert.ok(Date.now() - t0 < 1000);
});
test('I5: year just under the cap still computes; DB stops once salvage is reached', () => {
  const t0 = Date.now();
  const c = run(fresh(), 'CLFIN 10000 PV 500 FV 99999 n 1000000 i 99999 DB');
  assert.notEqual(disp(c), 'Error 5');
  assert.equal(disp(c), '0.00');                              // long since depreciated down to salvage
  assert.equal(disp(run(c, 'x<>y')), '0.00');                 // remaining depreciable value = 0
  assert.ok(Date.now() - t0 < 1000);
  assert.notEqual(disp(run(fresh(), 'CLFIN 10000 PV 500 FV 99999 n 10 i 99999 SOYD')), 'Error 5');
});
