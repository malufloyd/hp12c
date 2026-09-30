// Robust bracketed root finder (Brent) shared by TVM (i), IRR and YTM.
import { D } from './number.js';

const TOL = new D('1e-18');

function safe(f, x) {
  try { const v = f(x); return v.isFinite() ? v : null; } catch { return null; }
}

// Scan outward from guess for a sign change, then refine with Brent's method.
// f: (r: D) => D. Returns D, or null when no bracket / no convergence.
export function solveRoot(f, { lo, hi, guess }) {
  lo = new D(lo); hi = new D(hi); guess = new D(guess);
  const g = guess.lt(lo) || guess.gt(hi) ? lo.plus(hi).div(2) : guess;
  const fg = safe(f, g);
  if (fg === null) return null;
  if (fg.isZero()) return g;
  let bracket = null;
  let up = { x: g, f: fg, done: false }, dn = { x: g, f: fg, done: false };
  let step = new D('0.001');
  for (let k = 0; k < 60 && !bracket; k++) {
    for (const [side, dir] of [[up, 1], [dn, -1]]) {
      if (side.done || bracket) continue;
      let x = side.x.plus(step.times(dir));
      if (x.gte(hi)) { x = hi; side.done = true; }
      if (x.lte(lo)) { x = lo; side.done = true; }
      const fx = safe(f, x);
      if (fx === null) { side.done = true; continue; }
      if (fx.isZero()) return x;
      if (fx.isNeg() !== side.f.isNeg()) bracket = { a: side.x, fa: side.f, b: x, fb: fx };
      side.x = x; side.f = fx;
    }
    step = step.times(2);
  }
  if (!bracket) return null;
  return brent(f, bracket);
}

function brent(f, { a, fa, b, fb }) {
  if (fa.abs().lt(fb.abs())) [a, b, fa, fb] = [b, a, fb, fa];
  let c = a, fc = fa, d = a, mflag = true;
  for (let it = 0; it < 200; it++) {
    if (fb.isZero() || b.minus(a).abs().lt(TOL)) return b;
    let s;
    if (!fa.eq(fc) && !fb.eq(fc)) {
      s = a.times(fb).times(fc).div(fa.minus(fb).times(fa.minus(fc)))
        .plus(b.times(fa).times(fc).div(fb.minus(fa).times(fb.minus(fc))))
        .plus(c.times(fa).times(fb).div(fc.minus(fa).times(fc.minus(fb))));
    } else s = b.minus(fb.times(b.minus(a)).div(fb.minus(fa)));
    const q = a.times(3).plus(b).div(4);
    const lowQ = q.lt(b) ? q : b, highQ = q.lt(b) ? b : q;
    const cond = s.lt(lowQ) || s.gt(highQ)
      || (mflag && s.minus(b).abs().gte(b.minus(c).abs().div(2)))
      || (!mflag && s.minus(b).abs().gte(c.minus(d).abs().div(2)))
      || (mflag && b.minus(c).abs().lt(TOL)) || (!mflag && c.minus(d).abs().lt(TOL));
    if (cond) { s = a.plus(b).div(2); mflag = true; } else mflag = false;
    const fs = safe(f, s);
    if (fs === null) return null;
    d = c; c = b; fc = fb;
    if (fa.isNeg() !== fs.isNeg()) { b = s; fb = fs; } else { a = s; fa = fs; }
    if (fa.abs().lt(fb.abs())) [a, b, fa, fb] = [b, a, fb, fa];
  }
  return b.minus(a).abs().lt(new D('1e-12')) ? b : null;
}
