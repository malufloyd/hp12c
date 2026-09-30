import { Calculator } from '../src/engine/calculator.js';
import '../src/engine/all-ops.js';   // registers every op module (file created in this task, extended later)

const F = 42, G = 43;
export const TOKENS = {
  ENTER: [36], '=': [36], CHS: [16], EEX: [26], CLx: [35], 'R/S': [31], SST: [32], Rdn: [33],
  'x<>y': [34], '+': [40], '-': [30], x: [20], '/': [10], n: [11], i: [12], PV: [13], PMT: [14],
  FV: [15], 'y^x': [21], '1/x': [22], '%T': [23], 'D%': [24], '%': [25], STO: [44], RCL: [45],
  f: [F], g: [G], 'Σ+': [49], 'S+': [49],
  AMORT: [F, 11], INT: [F, 12], NPV: [F, 13], RND: [F, 14], IRR: [F, 15], RPN: [F, 16],
  ALG: [F, 26], PRICE: [F, 21], YTM: [F, 22], SL: [F, 23], SOYD: [F, 24], DB: [F, 25],
  'P/R': [F, 31], CLSIGMA: [F, 32], CLPRGM: [F, 33], CLFIN: [F, 34], CLREG: [F, 35],
  PREFIX: [F, 36], SCI: [F, 48],
  '12x': [G, 11], '12/': [G, 12], CFo: [G, 13], CFj: [G, 14], Nj: [G, 15], DATE: [G, 16],
  BEG: [G, 7], END: [G, 8], MEM: [G, 9], UNDO: [G, 10], sqrt: [G, 21], 'e^x': [G, 22],
  LN: [G, 23], FRAC: [G, 24], INTG: [G, 25], DDYS: [G, 26], 'D.MY': [G, 4], 'M.DY': [G, 5],
  xw: [G, 6], x2: [G, 20], PSE: [G, 31], BST: [G, 32], GTO: [G, 33], 'x<=y': [G, 34],
  'x=0': [G, 35], 'g=': [G, 36], xhat: [G, 1], yhat: [G, 2], 'n!': [G, 3], BS: [G, 30],
  '(': [G, 44], ')': [G, 45], xbar: [G, 0], s: [G, 48], 'Σ-': [G, 49], 'S-': [G, 49],
  LSTx: [G, 40],
};
export function fresh() { return new Calculator(); }
export function run(calc, seq) {
  for (const tok of seq.trim().split(/\s+/).filter(Boolean)) {
    if (/^[0-9.]+$/.test(tok)) { for (const ch of tok) calc.press(ch === '.' ? 48 : Number(ch)); }
    else if (TOKENS[tok]) { for (const c of TOKENS[tok]) calc.press(c); }
    else throw new Error('unknown token ' + tok);
    calc.release();
  }
  return calc;
}
export const disp = calc => calc.display.text;
export function steps(calc, pairs) {           // [[keys, expectedDisplay], ...]
  for (const [keys, want] of pairs) {
    run(calc, keys);
    if (disp(calc) !== want) throw new Error(`after "${keys}": got ${disp(calc)} want ${want}`);
  }
}
