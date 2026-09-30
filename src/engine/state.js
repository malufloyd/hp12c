import { ZERO } from './number.js';

export const freshAlg = () => ({ acc: null, op: null, parens: [], opJust: false, clxJust: false });

export function freshState() {
  return {
    stack: [ZERO, ZERO, ZERO, ZERO], lastX: ZERO,
    regs: Array(20).fill(ZERO),                 // R0..R9 = 0..9, R.0..R.9 = 10..19
    fin: { n: ZERO, i: ZERO, pv: ZERO, pmt: ZERO, fv: ZERO },
    mode: { alg: false, begin: false, dmy: false, compound: false,
            fix: 2, sci: false, commaDecimal: false },
    entry: null,                                // null | { mant:'', exp:null, expNeg:false, neg:false }
    lift: true, finStored: false,
    prefix: null,   // null|'f'|'g'|'STO'|'RCL'|'STO.'|'RCL.'|'STO+'|'STO-'|'STO*'|'STO/' (+'.' variants)|'RCLg'|'GTO'|'GTO.'
    prefixBuf: '',                              // digits collected after g GTO / g GTO .
    error: null,                                // number 0-9 or 'Pr'
    blink: false, off: false, showMantissa: false, dateDisplay: null,
    flashRunning: false,                        // brief 'running' flash after IRR/YTM (cleared by the UI)
    cfExt: [], nj: Array(81).fill(1),
    alg: freshAlg(),
    undo: null,
    selfTest: null,                             // null | { phase: 'running', until } | { phase: 'done' }
    kbTest: null,                               // null | { idx, done }
    prog: { lines: [], allotted: 8, pc: 0, prgmMode: false, running: false, waitUntil: 0,
            rec: [], skip: false, pause: false, sstPending: false },
  };
}
