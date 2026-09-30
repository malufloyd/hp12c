import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';

test('B1 percent', () => steps(fresh(), [['300 ENTER', '300.00'], ['14 %', '42.00']]));
test('B3 net amount', () => steps(fresh(), [
  ['23250 ENTER 8 %', '1,860.00'], ['-', '21,390.00'], ['6 %', '1,283.40'], ['+', '22,673.40'],
]));
test('B5 delta percent', () => assert.equal(disp(run(fresh(), '58.5 ENTER 53.25 D%')), '-8.97'));
test('B6 percent of total', () => steps(fresh(), [
  ['3.92 ENTER 2.36 + 1.67 +', '7.95'], ['2.36 %T', '29.69'], ['CLx 3.92 %T', '49.31'], ['CLx 1.67 %T', '21.01'],
]));
test('A8 powers RPN', () => {
  assert.equal(disp(run(fresh(), '2 ENTER 1.4 y^x')), '2.64');
  assert.equal(disp(run(fresh(), '2 ENTER 1.4 CHS y^x')), '0.38');
  assert.equal(disp(run(fresh(), '2 CHS ENTER 3 y^x')), '-8.00');
  assert.equal(disp(run(fresh(), '2 ENTER 3 1/x y^x')), '1.26');
});
test('A11 RND INTG FRAC LSTx', () => steps(fresh(), [
  ['.258 1/x', '3.88'], ['RND', '3.88'], ['INTG', '3.00'], ['LSTx', '3.88'], ['FRAC', '0.88'],
]));
test('RND really rounds the internal value', () => {
  const c = run(fresh(), '.258 1/x RND');
  assert.equal(c.state.stack[0].toString(), '3.88');
});
test('math functions', () => {
  assert.equal(disp(run(fresh(), '2 sqrt')), '1.41');
  assert.equal(disp(run(fresh(), '1 e^x')), '2.72');
  assert.equal(disp(run(fresh(), '10 LN')), '2.30');
  assert.equal(disp(run(fresh(), '5 n!')), '120.00');
  assert.equal(disp(run(fresh(), '12 x2')), '144.00');
  assert.equal(disp(run(fresh(), '7.5 CHS INTG')), '-7.00');
});
test('math errors', () => {
  for (const k of ['0 1/x', '1 CHS sqrt', '0 LN', '2.5 n!', '70 n!', '0 ENTER 5 D%', '0 ENTER 5 %T'])
    assert.equal(disp(run(fresh(), k)), 'Error 0', k);
});
