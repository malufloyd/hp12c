import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp } from './helpers.js';

test('CLEAR REG clears data, fin and stack', () => {
  const c = run(fresh(), '5 STO 3 7 n 9 ENTER CLREG');
  assert.equal(disp(c), '0.00');
  assert.equal(disp(run(c, 'RCL 3')), '0.00');
  assert.equal(disp(run(c, 'RCL n')), '0.00');
});
test('CLEAR FIN only clears financial registers', () => {
  const c = run(fresh(), '5 STO 3 7 n CLFIN');
  assert.equal(disp(run(c, 'RCL n')), '0.00');
  assert.equal(disp(run(c, 'RCL 3')), '5.00');
});
test('CLEAR Σ clears R1-R6 and stack', () => {
  const c = run(fresh(), '4 STO 1 4 STO 7 CLSIGMA');
  assert.equal(disp(run(c, 'RCL 1')), '0.00');
  assert.equal(disp(run(c, 'RCL 7')), '4.00');
});
test('backspace during entry', () => {
  assert.equal(disp(run(fresh(), '1234 BS')), '123');
  assert.equal(disp(run(fresh(), '1 BS')), '0.00');
  assert.equal(disp(run(fresh(), '1.5 EEX 12 BS')), '1.5 01');
  assert.equal(disp(run(fresh(), '1.5 EEX 1 BS BS')), '1.5');
});
test('backspace after a result clears X, undo restores it', () => {
  const c = run(fresh(), '3 ENTER 4 + BS');
  assert.equal(disp(c), '0.00');
  assert.equal(disp(run(c, 'UNDO')), '7.00');
});
test('undo after CLx and CLEAR REG', () => {
  assert.equal(disp(run(fresh(), '42 CLx UNDO')), '42.00');
  assert.equal(disp(run(fresh(), '8 STO 2 CLREG UNDO RCL 2')), '8.00');
});
test('undo only works right after the clear', () => {
  assert.equal(disp(run(fresh(), '42 CLx 5 UNDO')), '5');
});
