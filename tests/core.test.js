import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';

test('A1 checkbook (manual p.23)', () => steps(fresh(), [
  ['58.33 ENTER 22.95 -', '35.38'], ['13.7 -', '21.68'], ['10.14 -', '11.54'], ['1053 +', '1,064.54'],
]));
test('A2/A3 chain', () => {
  assert.equal(disp(run(fresh(), '3 ENTER 4 + 5 ENTER 6 + x')), '77.00');
  steps(fresh(), [['3 ENTER 4 x', '12.00'], ['5 ENTER 6 x', '30.00'], ['+', '42.00']]);
});
test('A9 EEX entry', () => {
  assert.equal(disp(run(fresh(), '1.7814 EEX 12')), '1.7814 12');
  assert.equal(disp(run(fresh(), '1.7814 EEX 12 CHS')), '1.7814-12');
});
test('A10 display formats and PREFIX', () => {
  const c = run(fresh(), '19.8745632 ENTER 5 -');
  steps(c, [['', '14.87'], ['f 4', '14.8746'], ['f 1', '14.9'], ['f 0', '15.'],
            ['f 9', '14.87456320'], ['SCI', '1.487456 01']]);
  c.press(42); c.press(36);                       // f PREFIX held
  assert.equal(disp(c), '1487456320');
  c.release();
  assert.equal(disp(c), '1.487456 01');
  steps(c, [['f 2', '14.87']]);
});
test('stack lift rules', () => {
  const c = run(fresh(), '1 ENTER 2 ENTER 3 ENTER 4');
  assert.deepEqual(c.state.stack.map(String), ['4', '3', '2', '1']);
  run(c, 'CLx 9');                                 // CLx disables lift → 9 replaces X
  assert.deepEqual(c.state.stack.map(String), ['9', '3', '2', '1']);
  run(c, '+');                                     // drop, T duplicated
  assert.deepEqual(c.state.stack.map(String), ['12', '2', '1', '1']);
  run(c, 'Rdn');
  assert.deepEqual(c.state.stack.map(String), ['2', '1', '1', '12']);
  run(c, 'x<>y');
  assert.deepEqual(c.state.stack.map(String), ['1', '2', '1', '12']);
});
test('LSTx', () => {
  assert.equal(disp(run(fresh(), '3 ENTER 4 + LSTx')), '4.00');
});
test('STO/RCL and register arithmetic', () => {
  assert.equal(disp(run(fresh(), '1.19 STO 1 CLx RCL 1')), '1.19');
  assert.equal(disp(run(fresh(), '5 STO . 3 CLx RCL . 3')), '5.00');
  assert.equal(disp(run(fresh(), '10 STO 2 3 STO + 2 RCL 2')), '13.00');
  assert.equal(disp(run(fresh(), '10 STO 2 4 STO x 2 RCL 2')), '40.00');
  assert.equal(disp(run(fresh(), '1 STO + 5')), 'Error 4');
  assert.equal(disp(run(fresh(), '0 STO / 1')), 'Error 0');
});
test('errors: divide by zero, cleared by next key without executing', () => {
  const c = run(fresh(), '5 ENTER 0 /');
  assert.equal(disp(c), 'Error 0');
  run(c, '7');                                     // only clears
  assert.equal(disp(c), '0.00');                   // X was restored to 0 (snapshot before op)
  run(c, '7');
  assert.equal(disp(c), '7');
});
test('overflow blinks and clamps', () => {
  const c = run(fresh(), '9 EEX 99 ENTER 10 x');
  assert.equal(disp(c), '9.999999 99');
  assert.equal(c.display.blink, true);
});
test('prefix annunciators and cancel', () => {
  const c = fresh(); c.press(42);
  assert.equal(c.display.ann.f, true);
  c.press(43);
  assert.equal(c.display.ann.f, false); assert.equal(c.display.ann.g, true);
  c.press(43);
  assert.equal(c.display.ann.g, false);
  assert.equal(c.display.ann.rpn, true);
});
test('CHS on result and during entry', () => {
  assert.equal(disp(run(fresh(), '5 CHS')), '-5');
  assert.equal(disp(run(fresh(), '5 ENTER CHS')), '-5.00');
});
test('unimplemented ops throw, never silently ignored', () => {
  assert.throws(() => run(fresh(), '5 sqrt'), /op not implemented: sqrt/);
});
