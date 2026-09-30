// Pure geometry for hit-testing: no DOM access, so it runs under Node.
import { LAYOUT } from '../engine/keys.js';

export const VIEWBOX = { w: 1280, h: 790 };
export const KX0 = 45, KPITCH_X = 121, KY0 = 285, KPITCH_Y = 128, KW = 92, KH = 62;
export const keyX = col => KX0 + (col - 1) * KPITCH_X;
export const keyY = row => KY0 + (row - 1) * KPITCH_Y;

// Hit cells tile the keyboard: key plus margin (room above for its legend).
export const CELLS = LAYOUT.map(k => {
  const x = keyX(k.col), y = keyY(k.row);
  return { code: k.code, x0: x - 14.5, x1: x + KW + 14.5, y0: y - 44, y1: y + KH + (k.rows - 1) * KPITCH_Y + 22 };
});

// Maps client (viewport) coordinates to viewBox coordinates without SVG CTM/ancestor-transform support.
// rect = svg.getBoundingClientRect() (axis-aligned box of the possibly rotated element).
// portrait = the stage is rotated 90deg clockwise (CSS rotate(90deg)), so the rect's width/height are the
// element's layout height/width. The viewBox is drawn with preserveAspectRatio xMidYMid meet.
export function clientToViewBox(rect, portrait, clientX, clientY, vb = VIEWBOX) {
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  let dx = clientX - cx, dy = clientY - cy, lw = rect.width, lh = rect.height;
  if (portrait) {                          // undo rotate(90deg): screen (dx,dy) = (-ly, lx)
    [dx, dy] = [dy, -dx];
    [lw, lh] = [lh, lw];
  }
  const scale = Math.min(lw / vb.w, lh / vb.h);
  return { x: dx / scale + vb.w / 2, y: dy / scale + vb.h / 2 };
}

export function cellAt(x, y) {
  for (const c of CELLS) if (x >= c.x0 && x < c.x1 && y >= c.y0 && y < c.y1) return c.code;
  return null;
}
