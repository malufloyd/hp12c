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

test('CLEAR Σ zeroes the stack and keeps lastX', () => {
  const c = run(fresh(), '3 ENTER 4 + 1 ENTER 2 ENTER 5 CLSIGMA');
  assert.deepEqual(c.state.stack.map(String), ['0', '0', '0', '0']);
  assert.equal(c.state.lastX.toString(), '4');
});
test('CLEAR REG also clears lastX, extended cash flows and Nj', () => {
  const c = run(fresh(), '3 ENTER 4 +');
  c.state.cfExt = [c.state.stack[0]]; c.state.nj[3] = 5;
  run(c, 'CLREG');
  assert.ok(c.state.lastX.isZero());
  assert.equal(c.state.cfExt.length, 0);
  assert.equal(c.state.nj[3], 1);
});
test('undo after CLEAR Σ and CLEAR FIN', () => {
  assert.equal(disp(run(fresh(), '6 STO 2 CLSIGMA UNDO RCL 2')), '6.00');
  assert.equal(disp(run(fresh(), '9 STO n CLFIN UNDO RCL n')), '9.00');
});
test('any other op invalidates undo', () => {
  assert.equal(disp(run(fresh(), '42 CLx ENTER UNDO')), '0.00');
});
