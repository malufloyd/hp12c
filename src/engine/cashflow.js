// Cash flows: g CFo / CFj / Nj, RCL g CFo / CFj / Nj, f NPV, f IRR.
// CF0..CF19 live in registers R0..R19 (regs[j]); CF20..CF80 in state.cfExt[j-20].
import { Calculator, CalcError } from './calculator.js';
import { D, ZERO, ONE, HUNDRED } from './number.js';
import { solveRoot } from './solve.js';

const E = code => new CalcError(code);
const MAXCF = 80;

const cfGet = (s, j) => (j < 20 ? s.regs[j] : s.cfExt[j - 20] ?? ZERO);
function cfSet(s, j, v) {
  if (j < 20) s.regs[j] = v;
  else { while (s.cfExt.length < j - 20) s.cfExt.push(ZERO); s.cfExt[j - 20] = v; }
}
// Current flow counter as an integer index 0..80 (else Error 6).
function counter(s) {
  const n = s.fin.n.trunc().toNumber();
  if (n < 0 || n > MAXCF) throw E(6);
  return n;
}

// [{cf, nj}] for CF1..CFn (CF0 excluded).
function flows(s) {
  const n = Math.max(0, Math.min(MAXCF, s.fin.n.trunc().toNumber())), out = [];
  for (let j = 1; j <= n; j++) out.push({ cf: cfGet(s, j), nj: s.nj[j] });
  return out;
}

// NPV at rate r (fraction). Each group: CFj * v^t * (v + ... + v^Nj), closed form via geometric series.
function npvAt(cf0, list, r) {
  const v = ONE.plus(r).pow(-1);
  let total = cf0, disc = ONE;                    // disc = v^t
  for (const { cf, nj } of list) {
    const vn = v.pow(nj);
    const ann = r.isZero() ? new D(nj) : v.times(ONE.minus(vn)).div(ONE.minus(v));
    total = total.plus(cf.times(disc).times(ann));
    disc = disc.times(vn);
  }
  return total;
}

Calculator.register({
  cfo(c) {
    const s = c.state;
    cfSet(s, 0, c.x); s.fin.n = ZERO; s.nj[0] = 1; s.finStored = false;
  },
  cfj(c) {
    const s = c.state, j = counter(s) + 1;
    if (j > MAXCF || (j < 20 && j >= c.availableRegs())) throw E(6);
    cfSet(s, j, c.x); s.nj[j] = 1; s.fin.n = new D(j); s.finStored = false;
  },
  nj(c) {
    const s = c.state, x = c.x, j = counter(s);
    if (!x.isInteger() || x.lt(1) || x.gt(99)) throw E(6);
    s.nj[j] = x.toNumber(); s.finStored = false;
  },
  rclCfo(c) { c.push(cfGet(c.state, 0)); },
  rclCfj(c) {
    const s = c.state, j = counter(s);
    c.push(cfGet(s, j)); s.fin.n = new D(Math.max(0, j - 1));   // stops at CF0
  },
  rclNj(c) { const s = c.state; c.push(new D(s.nj[counter(s)])); },
  npv(c) {
    const s = c.state;
    if (s.fin.i.lte(-100)) throw E(5);
    counter(s);
    const r = npvAt(cfGet(s, 0), flows(s), s.fin.i.div(HUNDRED));
    c.push(r); s.fin.pv = s.stack[0]; s.finStored = false;
  },
  irr(c) {
    const s = c.state, cf0 = cfGet(s, 0), list = flows(s);
    counter(s);
    const all = [cf0, ...list.map(f => f.cf)];
    if (!all.some(v => v.gt(0)) || !all.some(v => v.lt(0))) throw E(7);
    const r = solveRoot(x => npvAt(cf0, list, x), { lo: '-0.999999', hi: '1e6', guess: '0.1' });
    if (r === null) throw E(3);
    c.push(r.times(HUNDRED)); s.fin.i = s.stack[0]; s.finStored = false;
    s.flashRunning = true;
  },
});
