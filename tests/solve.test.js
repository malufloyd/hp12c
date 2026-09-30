import { test } from 'node:test';
import assert from 'node:assert/strict';
import { D } from '../src/engine/number.js';
import { solveRoot } from '../src/engine/solve.js';

test('solveRoot finds a root', () => {
  const r = solveRoot(x => x.times(x).minus(2), { lo: 0, hi: 10, guess: 1 });
  assert.ok(r.minus(new D(2).sqrt()).abs().lt('1e-15'));
});
test('solveRoot finds negative root', () => {
  const r = solveRoot(x => x.plus('0.5'), { lo: -0.999999, hi: 1e6, guess: 0.01 });
  assert.ok(r.plus('0.5').abs().lt('1e-15'));
});
test('solveRoot returns null without sign change', () => {
  assert.equal(solveRoot(x => x.times(x).plus(1), { lo: -10, hi: 10, guess: 0 }), null);
});
