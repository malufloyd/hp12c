import { test } from 'node:test';
import { fresh, steps } from './helpers.js';

test('E1 amortize 12 then 12', () => steps(fresh(), [
  ['CLFIN 5.25 12/ 250000 PV 1498.12 CHS PMT END', '-1,498.12'],
  ['12 AMORT', '-13,006.53'], ['x<>y', '-4,970.91'], ['RCL PV', '245,029.09'], ['RCL n', '12.00'],
  ['12 AMORT', '-12,739.18'], ['x<>y', '-5,238.26'], ['RCL PV', '239,790.83'], ['RCL n', '24.00'],
]));
test('E2 single payments', () => steps(fresh(), [
  ['CLFIN 5.25 12/ 250000 PV 1498.12 CHS PMT END 0 n', '0.00'],
  ['1 AMORT', '-1,093.75'], ['x<>y', '-404.37'], ['1 AMORT', '-1,091.98'], ['x<>y', '-406.14'], ['RCL n', '2.00'],
]));
test('E3 30-year', () => steps(fresh(), [
  ['CLFIN 5.25 12/ 30 12x 250000 PV END PMT', '-1,380.51'],
  ['0 n 1 AMORT', '-1,093.75'], ['x<>y', '-286.76'], ['RCL PV', '249,713.24'],
]));
