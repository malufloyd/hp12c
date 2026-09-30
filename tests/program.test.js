import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
import { runUntilHalt, tick, formatLine } from '../src/engine/program.js';

test('K3 memory at reset', () => assert.equal(disp(run(fresh(), 'P/R MEM')), 'P-08 r-20'));
test('K1 RPN program listing and run', () => {
  const c = run(fresh(), 'P/R CLPRGM');
  assert.equal(c.display.ann.prgm, true);
  assert.equal(disp(c), '000,');
  steps(c, [['ENTER', '001,     36'], ['2', '002,      2'], ['5', '003,      5'], ['%', '004,     25'],
            ['-', '005,     30'], ['5', '006,      5'], ['+', '007,     40'], ['SST', '008,43,33,000']]);
  run(c, 'P/R');
  run(c, '625 R/S'); runUntilHalt(c);
  assert.equal(disp(c), '473.75');
  run(c, '159 R/S'); runUntilHalt(c);
  assert.equal(disp(c), '124.25');
});
test('K2 ALG program', () => {
  const c = run(fresh(), 'ALG P/R CLPRGM - 2 5 % + 5 = P/R');
  run(c, '625 R/S'); runUntilHalt(c);
  assert.equal(disp(c), '473.75');
});
test('recording shifted and multi-key instructions', () => {
  const c = run(fresh(), 'P/R CLPRGM');
  steps(c, [['DB', '001,  42 25'], ['STO + 1', '002,44 40  1'], ['GTO 000', '003,43,33,000']]);
});
test('conditional branch and loop', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 - x=0 GTO 000 GTO 001 P/R');
  run(c, '5 R/S'); runUntilHalt(c);
  assert.equal(disp(c), '0.00');
});
test('memory grows 7 lines at a time', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 1 1 1 1 1 1 1 1 MEM');
  assert.equal(disp(c), 'P-15 r-20');
});
test('running shows running and a key stops it', () => {
  const c = run(fresh(), 'P/R CLPRGM GTO 001 P/R R/S');
  assert.equal(c.display.running, true);
  assert.equal(disp(c), 'running');
  run(c, '5');
  assert.equal(c.display.running, false);
});

test('BST/SST navigation in program mode', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 3');
  steps(c, [['BST', '002,      2'], ['BST', '001,      1'], ['BST', '000,'], ['SST', '001,      1'], ['SST', '002,      2']]);
});
test('g GTO . nnn moves pc in program mode and inserts after it', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 3 GTO . 001');
  assert.equal(disp(c), '001,      1');
  run(c, '9');
  assert.equal(disp(c), '002,      9');
  assert.deepEqual(c.state.prog.lines, [[1], [9], [2], [3]]);
});
test('non-programmable keys are ignored, CLEAR PRGM clears', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 CLREG D.MY');
  assert.equal(c.state.prog.lines.length, 1);
  run(c, 'CLPRGM');
  assert.equal(c.state.prog.lines.length, 0);
  assert.equal(disp(c), '000,');
});
test('x<=y skips next line when false', () => {
  const c = run(fresh(), 'P/R CLPRGM x<=y 1 0 P/R');   // 001 x<=y, 002 1, 003 0
  run(c, '5 ENTER 3 R/S'); runUntilHalt(c);            // X=3 <= Y=5 true: executes "1 0" -> 10
  assert.equal(disp(c), '10');
  run(c, 'ENTER 2 ENTER 7 R/S'); runUntilHalt(c);            // X=7 <= Y=2 false: skips "1", runs "0" -> 0
  assert.equal(disp(c), '0');
});
test('PSE is honoured by tick and ignored by runUntilHalt', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 PSE 2 P/R');
  run(c, 'R/S');
  assert.equal(tick(c, 1000), true);                   // ran "1", PSE -> waiting until 2000
  assert.equal(c.state.prog.waitUntil, 2000);
  assert.equal(disp(c), '1.00');
  assert.equal(tick(c, 1500), true);
  assert.equal(c.state.prog.pc, 2);
  assert.equal(tick(c, 2000), false);                  // resumes, runs "2", ends
  assert.equal(disp(c), '2');
  const d = run(fresh(), 'P/R CLPRGM 1 PSE 2 P/R R/S');
  runUntilHalt(d);
  assert.equal(disp(d), '2');
});
test('R/S inside a program stops it; pc left after it', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 R/S 2 P/R R/S');
  runUntilHalt(c);
  assert.equal(c.state.prog.running, false);
  assert.equal(disp(c), '1');            // digit entry still open
  assert.equal(c.state.prog.pc, 2);
});
test('an error halts the program and shows the error', () => {
  const c = run(fresh(), 'P/R CLPRGM 0 / P/R 5 R/S');
  runUntilHalt(c);
  assert.equal(disp(c), 'Error 0');
  assert.equal(c.state.prog.running, false);
});
test('run-mode GTO and SST', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 P/R GTO 001');
  assert.equal(c.state.prog.pc, 1);
  c.press(32);
  assert.equal(disp(c), '002,      2');
  c.release();
  assert.equal(disp(c), '2');
});
test('memory beyond 260 lines converts registers (Error 6)', () => {
  const c = run(fresh(), 'P/R CLPRGM');
  for (let i = 0; i < 270; i++) c.press(1);
  run(c, 'MEM');
  assert.equal(disp(c), 'P-274 r-18');
  run(c, 'P/R 5 STO . 7');
  assert.equal(c.state.regs[17].toString(), '5');
  run(c, 'STO . 9');
  assert.equal(disp(c), 'Error 6');
});
test('401st line gives Error 4; 400 lines leave no registers', () => {
  const c = run(fresh(), 'P/R CLPRGM');
  for (let i = 0; i < 400; i++) c.press(1);
  assert.equal(c.availableRegs(), 0);
  c.press(1);
  assert.equal(disp(c), 'Error 4');
});
test('formatLine', () => {
  assert.equal(formatLine(0), '000,');
  assert.equal(formatLine(12, [43, 33, 5]), '012,43,33,005');
});
