import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';

test('F1 NPV ungrouped', () => steps(fresh(), [
  ['CLREG 80000 CHS CFo', '-80,000.00'], ['500 CHS CFj', '-500.00'],
  ['4500 CFj 5500 CFj 4500 CFj 130000 CFj RCL n', '5.00'], ['13 i NPV', '212.18'],
]));
test('F2 grouped NPV and IRR', () => {
  const c = fresh();
  steps(c, [['CLREG 79000 CHS CFo 14000 CFj 11000 CFj 10000 CFj 3 Nj 9100 CFj 9000 CFj 2 Nj 4500 CFj 100000 CFj RCL n', '7.00'],
            ['13.5 i NPV', '907.77'], ['IRR', '13.72']]);
  assert.equal(disp(run(c, 'RCL PV')), '907.77');
});
test('F3 review and change flows', () => {
  const c = run(fresh(), 'CLREG 79000 CHS CFo 14000 CFj 11000 CFj 10000 CFj 3 Nj 9100 CFj 9000 CFj 2 Nj 4500 CFj 100000 CFj');
  steps(c, [['RCL 5', '9,000.00'], ['5 n RCL Nj', '2.00'], ['7 n 9000 STO 2 13.5 i NPV', '-644.75'],
            ['5 n 4 Nj 7 n NPV', '-1,857.21']]);
});
test('IRR errors', () => {
  assert.equal(disp(run(fresh(), 'CLREG 100 CFo 50 CFj IRR')), 'Error 7');
  assert.equal(disp(run(fresh(), 'CLREG 100 CFo 1.5 Nj')), 'Error 6');
});
test('RCL g CFj decrements n', () => {
  const c = run(fresh(), 'CLREG 1 CFo 2 CFj 3 CFj');
  steps(c, [['RCL CFj', '3.00'], ['RCL n', '1.00']]);
});
test('RCL g CFo, CFj beyond 80 and Nj range', () => {
  const c = run(fresh(), 'CLREG 7 CFo');
  steps(c, [['RCL CFo', '7.00']]);
  assert.equal(disp(run(fresh(), 'CLREG 1 CFo 100 Nj')), 'Error 6');
  assert.equal(disp(run(fresh(), 'CLREG 1 CFo 0 Nj')), 'Error 6');
});
test('80 flows with Nj=99: extended storage, IRR fast', () => {
  const c = run(fresh(), 'CLREG 1000 CHS CFo');
  const t0 = Date.now();
  for (let j = 1; j <= 80; j++) run(c, `${j} CFj 99 Nj`);
  assert.equal(disp(run(c, 'RCL n')), '80.00');
  assert.equal(disp(run(c, 'RCL Nj')), '99.00');
  run(c, '80 n');
  assert.notEqual(disp(run(c, 'IRR')).slice(0, 5), 'Error');
  assert.ok(Date.now() - t0 < 1000, 'IRR too slow: ' + (Date.now() - t0));
  assert.equal(disp(run(c, '81 CFj')).slice(0, 5), 'Error');
});
test('RCL CFj stops at CF0', () => {
  const c = run(fresh(), 'CLREG 5 CFo 6 CFj RCL CFj RCL CFj RCL CFj');
  assert.equal(disp(c), '5.00');
  assert.equal(disp(run(c, 'RCL n')), '0.00');
});
