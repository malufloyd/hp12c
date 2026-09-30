
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
  assert.equal(d.state.prog.lines.length, 1);
});
test('deserialize rejects garbage and other versions', () => {
  const good = JSON.parse(fresh().serialize());
  assert.throws(() => Calculator.deserialize('{"v":2,"state":{}}'));
  assert.throws(() => Calculator.deserialize('[1]'));
  const bad = JSON.parse(fresh().serialize()); bad.state.regs.pop();
  assert.throws(() => Calculator.deserialize(JSON.stringify(bad)));
  const bad2 = JSON.parse(fresh().serialize()); bad2.state.fix = 1; delete bad2.state.mode;
  assert.throws(() => Calculator.deserialize(JSON.stringify(bad2)));
  const bad3 = JSON.parse(fresh().serialize()); bad3.state.stack[0] = 5;
  assert.throws(() => Calculator.deserialize(JSON.stringify(bad3)));
  assert.ok(good.v === 1);
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

