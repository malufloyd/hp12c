import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';
import { layoutCells } from '../src/ui/lcd.js';
import { runUntilHalt, tick, formatLine } from '../src/engine/program.js';
const runHalt = c => { runUntilHalt(c); return c; };

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
  steps(c, [['DB', '001,  42 25'], ['STO + 1', '002,44,40, 1'], ['GTO 000', '003,43,33,000']]);
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
test('g GTO . nnn moves pc in program mode and the next key replaces line nnn+1', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 3 GTO . 001');
  assert.equal(disp(c), '001,      1');
  run(c, '9');
  assert.equal(disp(c), '002,      9');
  assert.deepEqual(c.state.prog.lines, [[1], [9], [3]]);
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
  assert.equal(disp(c), '10.00');
  run(c, 'ENTER 2 ENTER 7 R/S'); runUntilHalt(c);            // X=7 <= Y=2 false: skips "1", runs "0" -> 0
  assert.equal(disp(c), '0.00');
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
  assert.equal(disp(c), '2.00');
  const d = run(fresh(), 'P/R CLPRGM 1 PSE 2 P/R R/S');
  runUntilHalt(d);
  assert.equal(disp(d), '2.00');
});
test('R/S inside a program stops it; pc left after it', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 R/S 2 P/R R/S');
  runUntilHalt(c);
  assert.equal(c.state.prog.running, false);
  assert.equal(disp(c), '1.00');         // halt terminated the digit entry
  assert.equal(c.state.prog.pc, 2);
});
test('a digit typed after a halted program starts a new number', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 0 R/S P/R R/S');
  runUntilHalt(c);
  assert.equal(disp(c), '10.00');
  assert.equal(c.state.entry, null);
  run(c, '2');
  assert.equal(disp(c), '2');
  assert.equal(c.y.toString(), '10');
  const d = run(fresh(), 'P/R CLPRGM 1 0 P/R R/S');    // end of memory halt
  runUntilHalt(d);
  run(d, '2');
  assert.equal(disp(d), '2');
  const e = run(fresh(), 'P/R CLPRGM 1 0 GTO 000 P/R R/S');
  runUntilHalt(e);
  assert.equal(disp(e), '10.00');
});
test('run-mode GTO nnn then R/S starts at line nnn; GTO 000 starts at 001', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 0 P/R GTO 001 R/S');
  runUntilHalt(c);
  assert.equal(disp(c), '10.00');
  const d = run(fresh(), 'P/R CLPRGM 7 ENTER 8 P/R GTO 002 R/S');
  runUntilHalt(d);
  assert.equal(d.x.toString(), '8'); assert.equal(d.y.toString(), '0');   // ENTER at 002 ran
  assert.equal(disp(runHalt(run(fresh(), 'P/R CLPRGM 1 P/R GTO 000 R/S'))), '1.00');
});
test('run-mode GTO nnn then SST executes line nnn', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 P/R GTO 002');
  c.press(32);
  assert.equal(disp(c), '002,      2');
  c.release();
  assert.equal(disp(c), '2');
});
test('GTO beyond program memory gives Error 4 (recorded and executed)', () => {
  const c = run(fresh(), 'P/R CLPRGM GTO 050');
  assert.equal(disp(c), 'Error 4');
  assert.equal(c.state.prog.lines.length, 0);
  const d = run(fresh(), 'P/R CLPRGM 1 GTO 001 P/R');
  d.state.prog.lines[1] = [43, 33, 200];               // corrupt target beyond memory
  run(d, 'R/S'); runUntilHalt(d);
  assert.equal(disp(d), 'Error 4');
  assert.equal(d.state.prog.running, false);
});
test('tick respects its budget', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 GTO 001 P/R R/S');
  assert.equal(tick(c, 0, 11), true);
  assert.equal(c.state.prog.running, true);
  assert.equal(c.state.prog.pc > 0, true);
});
test('program state survives a JSON round trip', () => {
  const c = run(fresh(), 'P/R CLPRGM STO');
  const p = JSON.parse(JSON.stringify(c.state.prog));
  assert.deepEqual(Object.keys(p).sort(), Object.keys(c.state.prog).sort());
  assert.deepEqual(p.rec, [44]);
});
test('an error halts the program and shows the error', () => {
  const c = run(fresh(), 'P/R CLPRGM 0 / P/R 5 R/S');
  runUntilHalt(c);
  assert.equal(disp(c), 'Error 0');
  assert.equal(c.state.prog.running, false);
});
test('run-mode GTO and SST', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 P/R GTO 001');
  assert.equal(c.state.prog.pc, 0);      // next line executed is 001
  c.press(32);
  assert.equal(disp(c), '001,      1');
  c.release();
  assert.equal(disp(c), '1');
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
  assert.equal(formatLine(1, [36]), '001,     36');             // 1 code
  assert.equal(formatLine(4, [42, 25]), '004,  42 25');          // 2 codes
  assert.equal(formatLine(1, [7]), '001,      7');
});
test('I4: 3-code lines fit the 10 cells with comma decorations', () => {
  assert.equal(formatLine(1, [44, 40, 1]), '001,44,40, 1');
  assert.equal(formatLine(12, [45, 48, 7]), '012,45,48, 7');
  assert.equal(formatLine(3, [44, 48, 0]), '003,44,48, 0');
  const c = run(fresh(), 'P/R CLPRGM STO + 1');
  assert.equal(disp(c), '001,44,40, 1');
  const cells = layoutCells(disp(c));
  assert.equal(cells.cells.length, 10);
  assert.equal(cells.cells.map(x => x.ch).join('').trim(), '0014440 1');   // 001 44 40 ' ' 1 on the cells
  assert.equal(cells.cells[9].ch, '1');                          // register digit is visible
});
test('I3: keying replaces the next line, lines above/below unchanged, count stays', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 3 4 5 GTO . 002 9');
  assert.deepEqual(c.state.prog.lines, [[1], [2], [9], [4], [5]]);
  assert.equal(c.state.prog.pc, 3);
  assert.equal(disp(c), '003,      9');
  assert.equal(c.state.prog.lines.length, 5);
  assert.equal(c.state.prog.allotted, 8);
  run(c, 'SST'); assert.equal(disp(c), '004,      4');           // following line untouched
});
test('I3: replacing works for multi-code instructions and GTO lines', () => {
  const c = run(fresh(), 'P/R CLPRGM RCL 2 x - GTO . 000 RCL 6');   // manual sec. 10 example
  assert.deepEqual(c.state.prog.lines, [[45, 6], [20], [30]]);
  run(c, 'GTO . 001 GTO 001');
  assert.deepEqual(c.state.prog.lines, [[45, 6], [43, 33, 1], [30]]);
});
test('I3: keying past the last line appends and grows memory', () => {
  const c = run(fresh(), 'P/R CLPRGM 1 2 3 GTO . 003 4');
  assert.deepEqual(c.state.prog.lines, [[1], [2], [3], [4]]);
  for (let i = 0; i < 6; i++) c.press(5);
  assert.equal(c.state.prog.lines.length, 10);
  assert.equal(c.state.prog.allotted, 15);
  run(c, 'GTO . 002 7');                                            // replacing at full size keeps the length
  assert.equal(c.state.prog.lines.length, 10);
});
test('I3: replacing a line at the 400-line cap is allowed, appending is Error 4', () => {
  const c = run(fresh(), 'P/R CLPRGM');
  for (let i = 0; i < 400; i++) c.press(1);
  run(c, 'GTO . 010 2');
  assert.equal(disp(c), '011,      2');
  assert.equal(c.state.prog.lines.length, 400);
});
