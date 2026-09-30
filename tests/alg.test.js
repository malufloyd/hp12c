import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
import { Calculator } from '../src/engine/calculator.js';
const alg = () => run(fresh(), 'ALG');

test('ALG annunciator', () => {
  const c = alg(); assert.equal(c.display.ann.alg, true); assert.equal(c.display.ann.rpn, false);
});
test('A4 add/sub', () => steps(alg(), [
  ['21.1 +', '21.10'], ['23.8', '23.8'], ['=', '44.90'], ['77.35 - 90.89 =', '-13.54'],
]));
test('A5 chain left to right', () => steps(alg(), [
  ['456 - 75 /', '381.00'], ['18.5 x', '20.59'], ['68 /', '1,400.43'], ['1.9 =', '737.07'],
]));
test('A6 parentheses', () => {
  steps(alg(), [['8 / ( 5 -', '5.00'], ['1 )', '4.00'], ['=', '2.00']]);
  assert.equal(disp(run(alg(), '8 / 5 - 1 =')), '0.60');
});
test('A7 powers ALG', () => {
  assert.equal(disp(run(alg(), '2 y^x 1.4 =')), '2.64');
  assert.equal(disp(run(alg(), '2 y^x 1.4 CHS =')), '0.38');
  assert.equal(disp(run(alg(), '2 CHS y^x 3 =')), '-8.00');
  assert.equal(disp(run(alg(), '2 y^x 3 1/x =')), '1.26');
});
test('B2/B4 percent ALG', () => {
  steps(alg(), [['300 x', '300.00'], ['14 %', '0.14'], ['=', '42.00']]);
  steps(alg(), [['1250 + 7 %', '87.50'], ['=', '1,337.50']]);
  assert.equal(disp(run(alg(), '200 - 25 % =')), '150.00');
});
test('B5/B6 ALG', () => {
  assert.equal(disp(run(alg(), '35.5 = 31.25 D%')), '-11.97');
  steps(alg(), [['3.92 + 2.36 + 1.67 =', '7.95'], ['2.36 %T', '29.69']]);
});
test('A10 ALG', () => assert.equal(disp(run(alg(), '19.8745632 - 5 =')), '14.87'));
test('too many parentheses', () => {
  assert.equal(disp(run(alg(), '( ( ( ( ( ( ( ( ( ( ( ( ( (')), 'Error 4');
});
test('paren annunciator', () => {
  const c = run(alg(), '2 x (');
  assert.equal(c.display.ann.paren, true);
});
test('back to RPN', () => {
  assert.equal(disp(run(alg(), 'RPN 3 ENTER 4 +')), '7.00');
});
test('a second operator replaces the pending one', () => {
  assert.equal(disp(run(alg(), '5 + x 3 =')), '15.00');
  assert.equal(disp(run(alg(), '2 + 3 x - 1 =')), '4.00');
});

test('I2: CLx CLx clears the pending operation (manual App. B p.242)', () => {
  assert.equal(disp(run(alg(), '100 + CLx CLx 5 x 2 =')), '10.00');
  assert.equal(disp(run(alg(), '5 + CLx CLx 3 =')), '3.00');
  assert.equal(disp(run(alg(), '2 x ( 3 + CLx CLx 4 + 1 =')), '5.00');   // parentheses cleared too
});
test('I2: a single CLx keeps the pending operation', () => {
  assert.equal(disp(run(alg(), '100 + 7 CLx 5 =')), '105.00');
  assert.equal(disp(run(alg(), '100 + CLx 5 =')), '105.00');
  assert.equal(disp(run(alg(), '100 + CLx 5 CLx 6 =')), '106.00');        // not consecutive
  assert.equal(disp(run(alg(), '100 + CLx 5 CLx CLx 6 + 1 =')), '7.00');   // pair later clears
});
test('T5: operator replacement survives serialize/deserialize and ignores object identity', () => {
  const c = run(alg(), '2 +');
  const d = Calculator.deserialize(c.serialize());
  assert.equal(disp(run(d, 'x 3 =')), '6.00');
  assert.equal(disp(run(alg(), '5 + STO 1 RCL 1 + 1 =')), '11.00');         // recalled copy is a new entry
  assert.equal(disp(run(alg(), '2 + x 3 =')), '6.00');
});
