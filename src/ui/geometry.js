// Pure geometry for hit-testing: no DOM access, so it runs under Node.
import { LAYOUT } from '../engine/keys.js';

export const VIEWBOX = { w: 1280, h: 790 };
export const KX0 = 45, KPITCH_X = 121, KY0 = 285, KPITCH_Y = 128, KW = 92, KH = 62;
const KGAP = KPITCH_X - KW, KX_RIGHT = VIEWBOX.w - (KX0 + 9 * KPITCH_X + KW);
export const keyY = row => KY0 + (row - 1) * KPITCH_Y;

// Layout for a viewBox `w` wide (the stretched mode uses w > 1280 to fill a wide screen): the extra width
// goes into the keys, the gaps between them stay the same. Heights never change.
export function makeGeometry(w = VIEWBOX.w) {
  const kw = (w - KX0 - KX_RIGHT - 9 * KGAP) / 10, pitch = kw + KGAP;
  const keyX = col => KX0 + (col - 1) * pitch;
  // Hit cells tile the keyboard: key plus margin (room above for its legend).
  const cells = LAYOUT.map(k => {
    const x = keyX(k.col), y = keyY(k.row);
    return { code: k.code, x0: x - KGAP / 2, x1: x + kw + KGAP / 2, y0: y - 44, y1: y + KH + (k.rows - 1) * KPITCH_Y + 22 };
  });
  const logo = { x0: w - 190, y0: 45, x1: w - 50, y1: 200 };   // the "hp 12C" tile on the gold plate
  return { w, h: VIEWBOX.h, kw, keyX, cells, logo,
    cellAt: (x, y) => cellAt(x, y, cells),
    onLogo: (x, y) => x >= logo.x0 && x < logo.x1 && y >= logo.y0 && y < logo.y1 };
}

const BASE = makeGeometry();
export const keyX = BASE.keyX;
export const CELLS = BASE.cells;

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

export function cellAt(x, y, cells = CELLS) {
  for (const c of cells) if (x >= c.x0 && x < c.x1 && y >= c.y0 && y < c.y1) return c.code;
  return null;
}

// viewBox width for the stretched mode: as wide as the stage's proportions allow, never narrower than normal.
export function stretchedWidth(stageW, stageH) {
  if (!(stageW > 0 && stageH > 0)) return VIEWBOX.w;
  return Math.max(VIEWBOX.w, Math.round(VIEWBOX.h * stageW / stageH));
}
