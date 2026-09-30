// HP 12C LCD: pure text layout + SVG 7-segment rendering.
const NS = 'http://www.w3.org/2000/svg';
export const CELLS = 10;

// Segment masks: a=top b=top-right c=bottom-right d=bottom e=bottom-left f=top-left g=middle.
export const SEGMENTS = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg',
  '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g',
  E: 'adefg', r: 'eg', o: 'cdeg', P: 'abefg', A: 'abcefg', n: 'ceg', d: 'bcdeg',
  U: 'bcdef', F: 'aefg', S: 'acdfg', b: 'cdefg', C: 'adef', c: 'deg', h: 'cefg',
  L: 'def', u: 'cde', t: 'defg', y: 'bcdfg', i: 'c', g: 'abcdfg', O: 'abcdef', e: 'abdefg',
  ' ': '',
};

export function layoutCells(text) {
  let s = String(text ?? '');
  let sign = false;
  if (s[0] === '-') { sign = true; s = s.slice(1); }
  const cells = [];
  for (const ch of s) {
    if ((ch === '.' || ch === ',') && cells.length) {
      cells[cells.length - 1][ch === '.' ? 'point' : 'comma'] = true;
    } else if (ch === '.' || ch === ',') {
      cells.push({ ch: ' ', point: ch === '.', comma: ch === ',' });
    } else cells.push({ ch, point: false, comma: false });
  }
  const leftAligned = /^[A-Za-z]/.test(s);
  const out = cells.slice(0, CELLS);
  const pad = () => ({ ch: ' ', point: false, comma: false });
  while (out.length < CELLS) leftAligned ? out.push(pad()) : out.unshift(pad());
  return { sign, cells: out, leftAligned };
}

// ---- rendering -------------------------------------------------------------
const W = 36, H = 70, T = 7.5, GAP = 1.6;       // digit box, stroke, gap between segments
const PITCH = 63, X0 = 130, SIGN_X = 100, Y0 = 77;
const INK = '#26313a';

function hex(pts) { return 'M' + pts.map(p => p.join(',')).join('L') + 'Z'; }
function hSeg(y) {
  const x1 = T / 2 + GAP, x2 = W - T / 2 - GAP, h = T / 2;
  return hex([[x1, y], [x1 + h, y - h], [x2 - h, y - h], [x2, y], [x2 - h, y + h], [x1 + h, y + h]]);
}
function vSeg(x, ya, yb) {
  const y1 = ya + GAP, y2 = yb - GAP, h = T / 2;
  return hex([[x, y1], [x + h, y1 + h], [x + h, y2 - h], [x, y2], [x - h, y2 - h], [x - h, y1 + h]]);
}
const MID = H / 2, L = T / 2, R = W - T / 2;
const PATHS = {
  a: hSeg(T / 2), g: hSeg(MID), d: hSeg(H - T / 2),
  f: vSeg(L, T / 2, MID), b: vSeg(R, T / 2, MID), e: vSeg(L, MID, H - T / 2), c: vSeg(R, MID, H - T / 2),
};
const POINT = hex([[W + 3, H - 8], [W + 10, H - 8], [W + 10, H - 1], [W + 3, H - 1]]);
const COMMA = hex([[W + 3, H - 8], [W + 10, H - 8], [W + 10, H - 1], [W + 5, H + 9], [W + 2, H + 9], [W + 6, H - 1], [W + 3, H - 1]]);

function el(tag, attrs, parent, text) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  if (parent) parent.appendChild(n);
  return n;
}

function drawCell(parent, x, cell) {
  const g = el('g', { transform: `translate(${x + 4},${Y0}) skewX(-6)` }, parent);
  for (const s of SEGMENTS[cell.ch] ?? '') el('path', { d: PATHS[s], fill: INK }, g);
  if (cell.comma) el('path', { d: COMMA, fill: INK }, g);
  else if (cell.point) el('path', { d: POINT, fill: INK }, g);
}

const ANN = [
  ['f', 'f', 150], ['g', 'g', 195], ['begin', 'BEGIN', 260], ['dmy', 'D.MY', 350],
  ['c', 'C', 430], ['prgm', 'PRGM', 480], ['rpn', 'RPN', 560], ['alg', 'ALG', 560], ['paren', '( )', 620],
];

export function renderLcd(group, state) {
  while (group.firstChild) group.removeChild(group.firstChild);
  group.classList.toggle('lcd-blink', !!(state && state.blink));
  if (!state || state.off) return;
  const text = state.running ? 'running' : state.text;
  const { sign, cells } = layoutCells(text);
  const digits = el('g', { class: state.running ? 'lcd-running' : '' }, group);
  if (sign) drawCell(digits, SIGN_X, { ch: '-', point: false, comma: false });
  cells.forEach((c, i) => drawCell(digits, X0 + i * PITCH, c));
  const ann = state.ann || {};
  for (const [key, label, x] of ANN) {
    if (ann[key]) el('text', { x, y: 173, fill: INK, 'font-size': 13, 'font-weight': 700,
      'font-family': 'Helvetica Neue, Helvetica, Arial, sans-serif', 'letter-spacing': 0.6 }, group, label);
  }
}
