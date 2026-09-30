
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp } from './helpers.js';
import { Calculator } from '../src/engine/calculator.js';
import { load, save } from '../src/storage.js';
import { tick } from '../src/engine/program.js';
import { KEYBOARD_SEQUENCE } from '../src/engine/power.js';

const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('power off/on keeps memory', () => {
  const c = run(fresh(), '42 STO 1');
  c.power(); assert.equal(c.display.off, true);
  c.press(5); assert.equal(c.display.off, true);          // keys ignored while off
  c.power(); assert.equal(disp(run(c, 'RCL 1')), '42.00');
});
test('ON + . toggles separators', () => {
  const c = run(fresh(), '1064.54'); run(c, 'ENTER'); c.onCombo(48);
  assert.equal(disp(c), '1.064,54');
});
test('ON + - resets with Pr Error', () => {
  const c = run(fresh(), '42 STO 1 f 4'); c.onCombo(30);
  assert.equal(disp(c), 'Pr Error');
  run(c, 'CLx');
  assert.equal(disp(run(c, 'RCL 1')), '0.00');
});
test('serialize round trip keeps everything', () => {
  const c = run(fresh(), 'ALG D.MY BEG f 4 42 STO . 5 P/R CLPRGM 1 + P/R');
  const d = Calculator.deserialize(c.serialize());
  assert.deepEqual(JSON.parse(d.serialize()), JSON.parse(c.serialize()));
  assert.equal(disp(run(d, 'RCL . 5')), '42.0000');
});
test('storage: missing → fresh, corrupt → Pr Error', () => {
  const s = mem();
  assert.equal(disp(load(s)), '0.00');
  s.setItem('hp12c.state.v1', '{garbage');
  assert.equal(disp(load(s)), 'Pr Error');
  const c = run(fresh(), '7 STO 2'); save(s, c);
  assert.equal(disp(run(load(s), 'RCL 2')), '7.00');
});
test('keyboard self-test detects a wrong key', () => {
  const c = fresh(); c.onCombo(10);
  c.press(12);                                             // first expected key is n (11)
  assert.equal(disp(c), 'Error 9');
});

test('serialize round trip: program, open paren, undo snapshot, cfExt', () => {
  const c = run(fresh(), 'ALG 2 ENTER 3 ( 4 CLx 5 CFo 100 CFj 200 CFj 300 CFj');
  run(c, 'P/R 1 + P/R');
  assert.ok(c.state.undo === null || c.state.undo);
  run(c, '7 CLx');                                          // leaves an undo snapshot
  c.state.cfExt = [c.state.stack[0], c.state.stack[0]];
  const d = Calculator.deserialize(c.serialize());
  assert.deepEqual(JSON.parse(d.serialize()), JSON.parse(c.serialize()));
  assert.ok(d.state.undo && d.state.undo.stack[0].constructor === d.state.stack[0].constructor);
  assert.ok(d.state.alg.parens.length > 0);
  assert.equal(d.state.prog.lines.length, 2);
});
test('deserialize rejects unparsable data and wrong version/shape', () => {
  assert.throws(() => Calculator.deserialize('{garbage'));
  assert.throws(() => Calculator.deserialize('{"v":2,"state":{}}'));
  assert.throws(() => Calculator.deserialize('[1]'));
  assert.throws(() => Calculator.deserialize('{"v":1}'));
  assert.throws(() => Calculator.deserialize('{"v":1,"state":[]}'));
});
test('deserialize keeps compatible fields and defaults incompatible ones', () => {
  const c = run(fresh(), '7 STO 2');
  const o = JSON.parse(c.serialize());
  o.state.regs.pop();                                        // wrong length -> default regs
  o.state.stack[0] = 5;                                      // wrong type -> default stack
  const d = Calculator.deserialize(JSON.stringify(o));
  assert.equal(disp(run(d, 'RCL 2')), '0.00');
  assert.equal(d.state.fin.n.toString(), '0');
});
test('IRR then save/load keeps registers (C1)', () => {
  const c = run(fresh(), '100 CHS CFo 60 CFj 60 CFj IRR 42 STO 3');
  assert.equal(c.state.flashRunning, true);
  c.state.flashRunning = false;                              // the UI clears it on render
  const s = mem(); save(s, c);
  const d = load(s);
  assert.notEqual(disp(d), 'Pr Error');
  assert.equal(disp(run(d, 'RCL 3')), '42.00');
  assert.equal(d.state.fin.i.toFixed(2), '13.07');
  // even with the flash still pending it must round-trip
  const c2 = run(fresh(), '100 CHS CFo 60 CFj 60 CFj IRR');
  const d2 = Calculator.deserialize(c2.serialize());
  assert.equal(d2.state.fin.i.toFixed(2), '13.07');
});
test('every state key written by ops exists in freshState (shape is stable)', () => {
  const keys = k => Object.keys(k).sort().join();
  const base = keys(fresh().state);
  for (const seq of ['100 CHS CFo 60 CFj 60 CFj IRR', '5 ENTER 2 +', 'f 4 g 6', '1 CHS 6 n 10 i 5 PV FV',
    '12.012004 ENTER 12.012005 DDYS', 'g (', 'ALG 2 + 3 =', 'P/R 1 + P/R']) {
    assert.equal(keys(run(fresh(), seq).state), base, seq);
  }
});
test('saved state with a missing key or an extra key loads fine', () => {
  const c = run(fresh(), '9 STO 4 f 4');
  const o = JSON.parse(c.serialize());
  delete o.state.flashRunning; delete o.state.prog.sstPending; delete o.state.mode.compound;
  o.state.futureField = { a: 1 }; o.state.mode.newMode = true; o.extraTop = 1;
  const d = Calculator.deserialize(JSON.stringify(o));
  assert.equal(disp(run(d, 'RCL 4')), '9.0000');
  assert.equal(d.state.flashRunning, false);
  assert.equal(d.state.prog.sstPending, false);
  assert.equal(d.state.mode.compound, false);
  assert.equal('futureField' in d.state, false);
});
test('garbage in storage: Pr Error, raw copied to the backup key', () => {
  const s = mem();
  s.setItem('hp12c.state.v1', '{garbage');
  assert.equal(disp(load(s)), 'Pr Error');
  assert.equal(s.getItem('hp12c.state.bad'), '{garbage');
  const s2 = mem(); s2.setItem('hp12c.state.v1', '{"v":7,"state":{}}');
  assert.equal(disp(load(s2)), 'Pr Error');
  assert.equal(s2.getItem('hp12c.state.bad'), '{"v":7,"state":{}}');
  const t = { getItem: () => '{x', setItem() { throw new Error('quota'); } };
  assert.equal(disp(load(t)), 'Pr Error');                   // backup failure must not throw
});
test('storage tolerates throwing storage', () => {
  const t = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.equal(disp(load(t)), '0.00');
  save(t, fresh());
});
test('self-test timeline via tick', () => {
  const c = fresh(); c.onCombo(20, 1000);
  assert.equal(disp(c), 'running');
  tick(c, 3000); assert.equal(disp(c), 'running');
  tick(c, 3500);
  assert.equal(disp(c), '-8,8,8,8,8,8,8,8,8,8,');
  assert.ok(Object.values(c.display.ann).every(Boolean));
  c.press(5);
  assert.equal(disp(c), '0.00');
});
test('keyboard self-test success path', () => {
  assert.equal(KEYBOARD_SEQUENCE.length, 39);
  const c = fresh(); c.onCombo(10);
  for (const k of KEYBOARD_SEQUENCE) c.press(k);
  assert.equal(disp(c), '12');
  c.press(5); assert.equal(disp(c), '0.00');
});
test('power off stops program and clears error/prefix', () => {
  const c = run(fresh(), 'f'); c.state.error = 3; c.power(); c.power();
  assert.equal(c.state.error, null); assert.equal(c.state.prefix, null);
});


test('self-test finishes with one clock (I1)', () => {
  const c = fresh(), t0 = 123456.7;                          // rAF-style timestamps, not epoch ms
  c.onCombo(20, t0);
  assert.equal(disp(c), 'running');
  assert.equal(tick(c, t0 + 100), true);
  assert.equal(tick(c, t0 + 2600), false);
  assert.equal(disp(c), '-8,8,8,8,8,8,8,8,8,8,');
});
test('a persisted running self-test or PSE wait does not survive a reload', () => {
  const c = fresh(); c.onCombo(20, 5000);
  assert.equal(Calculator.deserialize(c.serialize()).state.selfTest, null);
  const d = fresh(); d.state.prog.running = true; d.state.prog.waitUntil = 9e9;
  assert.equal(Calculator.deserialize(d.serialize()).state.prog.waitUntil, 0);
});
