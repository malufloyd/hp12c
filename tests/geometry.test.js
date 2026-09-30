import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUT } from '../src/engine/keys.js';
import { VIEWBOX, KW, KH, KPITCH_Y, keyX, keyY, clientToViewBox, cellAt } from '../src/ui/geometry.js';

// Independent forward model: viewBox -> client for a stage of layout size (lw x lh) centred at (cx, cy).
function forward(vx, vy, { lw, lh, cx, cy, portrait }) {
  const scale = Math.min(lw / VIEWBOX.w, lh / VIEWBOX.h);
  const lx = (vx - VIEWBOX.w / 2) * scale, ly = (vy - VIEWBOX.h / 2) * scale;
  return portrait ? [cx - ly, cy + lx] : [cx + lx, cy + ly];         // rotate(90deg): (x,y) -> (-y, x)
}
const keyCentre = k => [keyX(k.col) + KW / 2, keyY(k.row) + (KH + (k.rows - 1) * KPITCH_Y) / 2];

const setups = {
  landscape: { rect: { left: 0, top: 0, width: 852, height: 393 }, geom: { lw: 852, lh: 393, cx: 426, cy: 196.5, portrait: false } },
  'landscape with safe-area inset': { rect: { left: 59, top: 0, width: 734, height: 393 }, geom: { lw: 734, lh: 393, cx: 426, cy: 196.5, portrait: false } },
  portrait: { rect: { left: 0, top: 0, width: 393, height: 852 }, geom: { lw: 852, lh: 393, cx: 196.5, cy: 426, portrait: true } },
  'portrait with insets': { rect: { left: 0, top: 59, width: 393, height: 734 }, geom: { lw: 734, lh: 393, cx: 196.5, cy: 426, portrait: true } },
};

for (const [name, { rect, geom }] of Object.entries(setups)) {
  test(`keys hit at their visual centre: ${name}`, () => {
    for (const k of LAYOUT) {
      const [vx, vy] = keyCentre(k);
      const [px, py] = forward(vx, vy, geom);
      const p = clientToViewBox(rect, geom.portrait, px, py);
      assert.ok(Math.abs(p.x - vx) < 1e-6 && Math.abs(p.y - vy) < 1e-6, `${k.code} maps back to ${vx},${vy}, got ${p.x},${p.y}`);
      assert.equal(cellAt(p.x, p.y), k.code, `key ${k.code}`);
    }
  });
  test(`outside the keyboard hits nothing: ${name}`, () => {
    const [px, py] = forward(640, 100, geom);                          // LCD area
    const p = clientToViewBox(rect, geom.portrait, px, py);
    assert.equal(cellAt(p.x, p.y), null);
  });
}
test('portrait (rotate 90deg clockwise): calculator top is at the phone right, calculator left at the phone top', () => {
  const rect = { left: 0, top: 0, width: 393, height: 852 };
  const p = clientToViewBox(rect, true, 383, 426);                     // right edge, middle
  assert.ok(p.y < 50 && Math.abs(p.x - 640) < 1, `got ${p.x},${p.y}`);
  const q = clientToViewBox(rect, true, 196.5, 10);                    // top edge, middle
  assert.ok(q.x < 50 && Math.abs(q.y - 395) < 1, `got ${q.x},${q.y}`);
});
