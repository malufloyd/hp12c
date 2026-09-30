import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
import { Calculator } from '../src/engine/calculator.js';

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
  assert.throws(() => Calculator.run('__no_such_op__', fresh()), /op not implemented: __no_such_op__/);
});

// ---- Task 3 fix round 1 ----
import { LAYOUT } from '../src/engine/keys.js';

test('g <- deletes one digit during entry', () => {
  assert.equal(disp(run(fresh(), '1 2 3 4 BS')), '123');
  assert.equal(disp(run(fresh(), '1 2 BS 5')), '15');
});
test('GTO digit buffer lives in state and needs 3 digits', () => {
  const c = fresh();
  c.press(43); c.press(33);
  assert.equal(c.state.prefix, 'GTO');
  c.press(1); c.press(2);
  assert.equal(c.state.prefix, 'GTO'); assert.equal(c.state.prefixBuf, '12');
  c.press(3);   // completes the prefix; line 123 > allotted -> Error 4
  assert.equal(c.state.prefix, null); assert.equal(c.state.prefixBuf, '');
  assert.equal(c.state.error, 4);
  const d = fresh();
  d.press(43); d.press(33); d.press(48);
  assert.equal(d.state.prefix, 'GTO.');
  d.press(0); d.press(0);
  assert.equal(d.state.prefix, 'GTO.');
  d.press(5);   // GTO . 005 completes the prefix, no error
  assert.equal(d.state.prefix, null); assert.equal(d.state.error, null);
});
test('STO EEX toggles the c annunciator', () => {
  const c = run(fresh(), 'STO EEX');
  assert.equal(c.display.ann.c, true);
  run(c, 'STO EEX');
  assert.equal(c.display.ann.c, false);
});
test('f PREFIX cancels a pending STO/RCL prefix and shows mantissa until release', () => {
  const c = fresh(); c.press(5); c.press(36); c.press(1);   // stack has 1
  c.press(44); c.press(42); c.press(36);
  assert.equal(c.state.prefix, null);
  assert.equal(disp(c), '1000000000');
  c.release();
  assert.equal(disp(c), '1.00');
  c.press(45); c.press(42); c.press(36);
  assert.equal(c.state.prefix, null);
  c.release();
});
test('showMantissa is also cleared by the next press', () => {
  const c = run(fresh(), '5');
  c.press(42); c.press(36);
  assert.equal(c.state.showMantissa, true);
  c.press(36);
  assert.equal(c.state.showMantissa, false);
});
test('STO x overflow gives Error 1 and leaves the register unchanged', () => {
  const c = run(fresh(), '9 EEX 99 STO 1 10 STO x 1');
  assert.equal(disp(c), 'Error 1');
  assert.equal(String(c.state.regs[1]), String(run(fresh(), '9 EEX 99 STO 1').state.regs[1]));
});
test('yx errors', () => {
  assert.equal(disp(run(fresh(), '0 ENTER 0 y^x')), 'Error 0');
  assert.equal(disp(run(fresh(), '2 CHS ENTER .5 y^x')), 'Error 0');
});
test('entry keeps at most 10 mantissa digits', () => {
  assert.equal(disp(run(fresh(), '1 2 3 4 5 6 7 8 9 0 1'.replace(/ /g, ''))), '1,234,567,890');
});
test('finStored transitions', () => {
  // `5 n` is a Task 7 op; STO n exercises the same flag now
  const c = run(fresh(), '5 STO n');
  assert.equal(c.state.finStored, true);
  const tolerant = seq => { try { run(c, seq); } catch (e) { if (!/op not implemented/.test(e.message)) throw e; } };
  tolerant('BEG'); assert.equal(c.state.finStored, true);   // BEG lands in Task 7; must not touch the flag
  run(c, 'f 4'); assert.equal(c.state.finStored, true);
  run(c, '7'); assert.equal(c.state.finStored, false);
});

const NAMES = new Set(('add sub mul div yx recip pctT dpct pct sqrt ex ln frac intg fact sq rnd n i pv pmt fv 12x 12div ' +
  'beg end int amort npv irr cfo cfj nj price ytm sl soyd db date ddys dmy mdy sigmaPlus sigmaMinus xbar s xhat yhat xw ' +
  'clrSigma clrFin clrReg clrPrgm undo backspace rpn alg lparen rparen equals pr rs sst bst pse gto xley xeq0 mem ' +
  // implementation-specific (task-3-report.md)
  'enter clx chs swap rdn lstx sto rcl stoArith compound fix sci prefix rclCfo rclCfj rclNj').split(' '));
test('every (prefix,key) pair resolves somewhere', () => {
  const VALID = new Set(['f', 'g', 'STO', 'RCL', 'STO.', 'RCL.', 'STO+', 'STO-', 'STO*', 'STO/', 'RCLg', 'GTO', 'GTO.']);
  const prefixes = { none: [], f: [42], g: [43], STO: [44], RCL: [45] };
  for (const { code } of LAYOUT) {
    if (code === 41) continue;
    for (const [pn, keys] of Object.entries(prefixes)) {
      const c = fresh();
      try { for (const k of keys) c.press(k); c.press(code); }
      catch (e) {
        const m = /^op not implemented: (.+)$/.exec(e.message);
        assert.ok(m, `${pn}+${code}: unexpected ${e.message}`);
        assert.ok(NAMES.has(m[1]), `${pn}+${code}: unknown op name ${m[1]}`);
        continue;
      }
      const p = c.state.prefix;
      assert.ok(p === null || VALID.has(p), `${pn}+${code}: bad prefix ${p}`);
    }
  }
});
