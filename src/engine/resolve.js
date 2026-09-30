// Key-code + prefix state machine -> action. Pure mapping; no arithmetic.
// resolve(calc, code) updates calc.state.prefix and returns
//   null                                    (prefix incomplete / key ignored)
//   { entry: 'digit'|'dot'|'eex'|'chs'|'backspace', value? }   (digit-entry editing)
//   { op: name, arg? }                      (run a registered op)
import { K } from './keys.js';

const FIN = { [K.N]: 'n', [K.I]: 'i', [K.PV]: 'pv', [K.PMT]: 'pmt', [K.FV]: 'fv' };
const isDigit = c => c >= 0 && c <= 9;

const PLAIN = {
  [K.N]: 'n', [K.I]: 'i', [K.PV]: 'pv', [K.PMT]: 'pmt', [K.FV]: 'fv',
  [K.DIV]: 'div', [K.YX]: 'yx', [K.RECIP]: 'recip', [K.PCTT]: 'pctT', [K.DPCT]: 'dpct', [K.PCT]: 'pct',
  [K.MUL]: 'mul', [K.RS]: 'rs', [K.SST]: 'sst', [K.RDN]: 'rdn', [K.SWAP]: 'swap', [K.CLX]: 'clx',
  [K.ENTER]: 'enter', [K.SUB]: 'sub', [K.SIGMA]: 'sigmaPlus', [K.ADD]: 'add',
};
const F = {
  [K.N]: 'amort', [K.I]: 'int', [K.PV]: 'npv', [K.PMT]: 'rnd', [K.FV]: 'irr', [K.CHS]: 'rpn',
  [K.YX]: 'price', [K.RECIP]: 'ytm', [K.PCTT]: 'sl', [K.DPCT]: 'soyd', [K.PCT]: 'db', [K.EEX]: 'alg',
  [K.RS]: 'pr', [K.SST]: 'clrSigma', [K.RDN]: 'clrPrgm', [K.SWAP]: 'clrFin', [K.CLX]: 'clrReg',
  [K.ENTER]: 'prefix',
};
const G = {
  [K.N]: '12x', [K.I]: '12div', [K.PV]: 'cfo', [K.PMT]: 'cfj', [K.FV]: 'nj', [K.CHS]: 'date',
  7: 'beg', 8: 'end', 9: 'mem', [K.DIV]: 'undo',
  [K.YX]: 'sqrt', [K.RECIP]: 'ex', [K.PCTT]: 'ln', [K.DPCT]: 'frac', [K.PCT]: 'intg', [K.EEX]: 'ddys',
  4: 'dmy', 5: 'mdy', 6: 'xw', [K.MUL]: 'sq',
  [K.RS]: 'pse', [K.SST]: 'bst', [K.SWAP]: 'xley', [K.CLX]: 'xeq0', [K.ENTER]: 'equals',
  1: 'xhat', 2: 'yhat', 3: 'fact', [K.SUB]: 'backspace',
  [K.STO]: 'lparen', [K.RCL]: 'rparen', 0: 'xbar', [K.DOT]: 's', [K.SIGMA]: 'sigmaMinus', [K.ADD]: 'lstx',
  // g GTO (33) is a prefix, handled in resolve()
};
const RCLG = { [K.PV]: 'rclCfo', [K.PMT]: 'rclCfj', [K.FV]: 'rclNj' };
const STO_ARITH = { [K.ADD]: ['+', 'add'], [K.SUB]: ['-', 'sub'], [K.MUL]: ['*', 'mul'], [K.DIV]: ['/', 'div'] };
const ARITH_SUFFIX = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div' };

export function resolve(calc, code) {
  const s = calc.state;
  const p = s.prefix;
  s.prefix = null;                                  // default: prefix is consumed

  if (p === 'RCL' && code === K.G) { s.prefix = 'RCLg'; return null; }
  if (code === K.F || code === K.G) {
    const want = code === K.F ? 'f' : 'g';
    s.prefix = p === want ? null : want;            // same again cancels, other switches
    return null;
  }
  if (code === K.ON) return null;                   // handled elsewhere (Task 15)

  switch (p) {
    case null:
      if (isDigit(code)) return { entry: 'digit', value: code };
      if (code === K.DOT) return { entry: 'dot' };
      if (code === K.EEX) return { entry: 'eex' };
      if (code === K.CHS) return { entry: 'chs' };
      if (code === K.STO) { s.prefix = 'STO'; return null; }
      if (code === K.RCL) { s.prefix = 'RCL'; return null; }
      return PLAIN[code] ? { op: PLAIN[code] } : null;
    case 'f':
      if (isDigit(code)) return { op: 'fix', arg: code };
      if (code === K.DOT) return { op: 'sci' };
      return F[code] ? { op: F[code] } : null;
    case 'g':
      if (code === K.RDN) { s.prefix = 'GTO'; calc.gtoBuf = ''; return null; }
      return G[code] ? { op: G[code] } : null;
    case 'STO': case 'RCL': {
      const op = p === 'STO' ? 'sto' : 'rcl';
      if (isDigit(code)) return { op, arg: code };
      if (code === K.DOT) { s.prefix = p + '.'; return null; }
      if (FIN[code]) return { op, arg: FIN[code] };
      if (p === 'STO' && STO_ARITH[code]) { s.prefix = 'STO' + STO_ARITH[code][0]; return null; }
      if (p === 'STO' && code === K.EEX) return { op: 'compound' };
      return null;
    }
    case 'STO.': case 'RCL.':
      return isDigit(code) ? { op: p === 'STO.' ? 'sto' : 'rcl', arg: 10 + code } : null;
    case 'RCLg':
      return RCLG[code] ? { op: RCLG[code] } : null;
    case 'GTO': case 'GTO.': {
      if (p === 'GTO' && code === K.DOT) { s.prefix = 'GTO.'; calc.gtoBuf = ''; return null; }
      if (!isDigit(code)) return null;
      calc.gtoBuf += code;
      const need = p === 'GTO' ? 2 : 3;
      if (calc.gtoBuf.length < need) { s.prefix = p; return null; }
      const n = parseInt(calc.gtoBuf, 10); calc.gtoBuf = '';
      return { op: 'gto', arg: { n, dot: p === 'GTO.' } };
    }
    default: {                                       // 'STO+' 'STO-' 'STO*' 'STO/' and '.' variants
      const arith = ARITH_SUFFIX[p[3]];
      if (p.length === 5) return isDigit(code) ? { op: 'stoArith', arg: { op: arith, r: 10 + code } } : null;
      if (isDigit(code)) return { op: 'stoArith', arg: { op: arith, r: code } };
      if (code === K.DOT) { s.prefix = p + '.'; return null; }
      if (FIN[code]) return { op: 'stoArith', arg: { op: arith, r: FIN[code] } };   // -> Error 4
      return null;
    }
  }
}
