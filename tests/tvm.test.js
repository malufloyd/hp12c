import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp, steps } from './helpers.js';

test('C1 simple interest', () => {
  const c = run(fresh(), 'CLFIN 60 n 7 i 450 CHS PV INT');
  assert.equal(disp(c), '5.25');
  assert.equal(disp(run(c, '+')), '455.25');
  const d = run(fresh(), 'CLFIN 60 n 7 i 450 CHS PV INT Rdn x<>y');
  assert.equal(disp(d), '5.18');
  assert.equal(disp(run(d, '+')), '455.18');
});
test('C1 ALG', () => assert.equal(disp(run(fresh(), 'ALG CLFIN 60 n 7 i 450 CHS PV INT + x<>y =')), '455.25'));
test('C2 solve n, final payments', () => {
  const c = fresh();
  steps(c, [['CLFIN 10.5 12/', '0.88'], ['35000 PV', '35,000.00'], ['325 CHS PMT', '-325.00'],
            ['END n', '328.00'], ['12 /', '27.33'], ['328 n FV', '181.89'], ['RCL PMT +', '-143.11'],
            ['327 n FV', '-141.87'], ['RCL PMT +', '-466.87']]);
});
test('C3 FV FV (store then compute)', () => {
  const c = fresh();
  steps(c, [['CLFIN 6.25 ENTER 24 / i', '0.26'], ['775 CHS PV 50 CHS PMT 4000 FV END n', '58.00'],
            ['2 /', '29.00'], ['FV FV', '4,027.27'], ['RCL PMT +', '3,977.27'], ['4000 -', '-22.73']]);
});
test('C4 annual rate', () => steps(fresh(), [
  ['CLFIN 8 ENTER 4 x n', '32.00'], ['6000 CHS PV 10000 FV i', '1.61'], ['4 x', '6.44'],
]));
test('C5 PV', () => steps(fresh(), [
  ['CLFIN 4 12x', '48.00'], ['5.9 12/', '0.49'], ['450 CHS PMT END PV', '19,198.60'], ['1500 +', '20,698.60'],
]));
test('C6 PV with g END between', () =>
  assert.equal(disp(run(fresh(), 'CLFIN 5 n 12 i 17500 PMT 540000 FV END PV')), '-369,494.09'));
test('C7 PMT', () => assert.equal(disp(run(fresh(), 'CLFIN 29 12x 5.25 12/ 243400 PV END PMT')), '-1,363.29'));
test('C8 PMT', () => assert.equal(disp(run(fresh(), 'CLFIN 15 ENTER 2 x n 9.75 ENTER 2 / i 3200 CHS PV 60000 FV END PMT')), '-717.44'));
test('C9 balloon FV', () => assert.equal(disp(run(fresh(), 'CLFIN 5 12x 5.25 12/ 243400 PV 1363.29 CHS PMT END FV')), '-222,975.98'));
test('C10 begin mode', () => {
  const c = run(fresh(), 'CLFIN 2 12x 6.25 12/ 50 CHS PMT BEG FV');
  assert.equal(disp(c), '1,281.34');
  assert.equal(c.display.ann.begin, true);
});
test('C11 negative rate', () => assert.equal(disp(run(fresh(), 'CLFIN 6 n 2 CHS i 32000 CHS PV FV')), '28,346.96'));
test('C12 loan payment', () => assert.equal(disp(run(fresh(), 'CLFIN END 6.9 12/ 30 12x 125000 PV 0 FV PMT')), '-823.25'));
test('D1 odd period compound', () => {
  const c = run(fresh(), 'CLFIN M.DY END STO EEX');
  assert.equal(c.display.ann.c, true);
  steps(c, [['2.152004 ENTER 3.012004 DDYS x<>y 30 /', '0.53'], ['36 + n', '36.53'],
            ['5 12/', '0.42'], ['4500 PV PMT', '-135.17']]);
});
test('D2 odd period simple, solve i', () => steps(fresh(), [
  ['CLFIN 7.192004 ENTER 8.012004 DDYS', '13.00'], ['30 /', '0.43'], ['42 + n', '42.43'],
  ['3950 PV 120 CHS PMT i', '1.16'], ['12 x', '13.95'],
]));
test('TVM errors', () => {
  assert.equal(disp(run(fresh(), 'CLFIN 100 PV 1 PMT 5 i n')), 'Error 5');   // no solution (PMT too small)
  assert.equal(disp(run(fresh(), 'CLFIN 0 n 100 PV i')), 'Error 5');
  assert.equal(disp(run(fresh(), 'CLFIN 10 n 100 PV 10 FV i')), 'Error 5');  // same sign flows
});
test('zero interest solves to exactly 0', () => {
  assert.equal(disp(run(fresh(), 'CLFIN 5 n 1000 CHS PV 1000 FV i')), '0.00');
});
test('begin mode solves n and i', () => {
  const c = run(fresh(), 'CLFIN BEG 1 i 1000 PV 100 CHS PMT n');
  assert.equal(disp(c), '11.00');
  assert.equal(disp(run(fresh(), 'CLFIN BEG 10 n 1000 PV 100 CHS PMT 0 FV i')), '0.00');
});
