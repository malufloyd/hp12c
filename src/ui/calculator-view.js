// Builds the whole HP 12C Gold SVG once; update() only redraws the LCD.
import { LAYOUT, BRACKETS } from '../engine/keys.js';
import { renderLcd } from './lcd.js';
import { VIEWBOX, KPITCH_Y, KH, keyY, makeGeometry, clientToViewBox } from './geometry.js';

const NS = 'http://www.w3.org/2000/svg';
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const GOLD_LEG = '#e0a13c', BLUE_LEG = '#5fb0dc', CREAM = '#f2efe6';
const BAND = 26;

function el(tag, attrs = {}, parent, text) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text != null) n.textContent = text;
  if (parent) parent.appendChild(n);
  return n;
}

function defs(svg) {
  const d = el('defs', {}, svg);
  const lg = (id, stops, x2 = 0, y2 = 1) => {
    const g = el('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, d);
    stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g));
  };
  lg('gold', [[0, '#c9b07a'], [0.35, '#eadcb0'], [0.7, '#d9c58f'], [1, '#bfa46b']], 1, 0);
  lg('goldSheen', [[0, '#fff', ], [1, '#000']]);
  lg('bodyEdge', [[0, '#3a3835'], [1, '#0d0d0c']]);
  lg('lcdGlass', [[0, '#b4bdbd'], [0.5, '#a9b4b6'], [1, '#9fabae']]);
  lg('bezelGold', [[0, '#c7b27c'], [1, '#7f6a3a']]);
  lg('keyFace', [[0, '#34322f'], [0.08, '#242321'], [1, '#191817']]);
  lg('keyBand', [[0, '#141413'], [1, '#232220']]);
  lg('fFace', [[0, '#f0b34a'], [1, '#c9852a']]);
  lg('gFace', [[0, '#5fc0d6'], [1, '#2f95b3']]);
  lg('enterFace', [[0, '#34322f'], [0.04, '#242321'], [1, '#161615']]);
  lg('plateShade', [[0, 'rgba(255,255,255,.35)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.18)']]);
  const p = el('pattern', { id: 'brush', width: 9, height: 4, patternUnits: 'userSpaceOnUse' }, d);
  [[0.5, 0.10, '#000'], [2.5, 0.07, '#fff'], [4.5, 0.06, '#000'], [6.5, 0.09, '#fff'], [8, 0.05, '#000']]
    .forEach(([x, o, c]) => el('rect', { x, y: 0, width: 1, height: 4, fill: c, opacity: o }, p));
  return d;
}

function buildBody(svg, G) {
  const W = G.w;
  el('rect', { x: 0, y: 0, width: W, height: 790, rx: 30, fill: '#141312' }, svg);
  el('rect', { x: 1, y: 1, width: W - 2, height: 788, rx: 29, fill: 'none', stroke: '#3b3936', 'stroke-width': 2 }, svg);
  // gold top plate
  el('rect', { x: 20, y: 20, width: W - 40, height: 205, rx: 6, fill: 'url(#gold)' }, svg);
  el('rect', { x: 20, y: 20, width: W - 40, height: 205, rx: 6, fill: 'url(#brush)' }, svg);
  el('rect', { x: 20, y: 20, width: W - 40, height: 205, rx: 6, fill: 'url(#plateShade)', opacity: 0.55 }, svg);
  el('rect', { x: 20.5, y: 20.5, width: W - 41, height: 204, rx: 6, fill: 'none', stroke: '#fff4d0', 'stroke-opacity': 0.5 }, svg);
  el('rect', { x: 20, y: 222, width: W - 40, height: 5, fill: '#0b0b0a' }, svg); // groove under the plate
  // LCD
  el('rect', { x: 56, y: 46, width: 748, height: 153, rx: 5, fill: 'url(#bezelGold)' }, svg);
  el('rect', { x: 60, y: 50, width: 740, height: 145, rx: 4, fill: '#7d6a3e' }, svg);
  el('rect', { x: 80, y: 65, width: 700, height: 115, rx: 2, fill: 'url(#lcdGlass)' }, svg);
  el('rect', { x: 80, y: 65, width: 700, height: 4, fill: '#000', opacity: 0.22 }, svg);   // inner shadow
  el('rect', { x: 80, y: 65, width: 4, height: 115, fill: '#000', opacity: 0.12 }, svg);
  // logo tile
  const lg = el('g', { transform: `translate(${G.logo.x0},${G.logo.y0})` }, svg);
  el('rect', { x: 0, y: 0, width: 140, height: 155, rx: 5, fill: '#b09a63' }, lg);
  el('rect', { x: 5, y: 5, width: 130, height: 145, rx: 3, fill: '#2a2620' }, lg);
  el('rect', { x: 9, y: 9, width: 122, height: 137, rx: 2, fill: '#0e0d0c' }, lg);
  el('circle', { cx: 70, cy: 66, r: 46, fill: '#0b0b0a', stroke: '#c7ad6a', 'stroke-width': 3 }, lg);
  el('text', { x: 70, y: 84, 'text-anchor': 'middle', 'font-size': 58, 'font-style': 'italic', 'font-weight': 700,
    'font-family': FONT, fill: '#d9bd78' }, lg, 'hp');
  el('rect', { x: 14, y: 116, width: 112, height: 26, fill: '#0b0b0a', stroke: '#c7ad6a', 'stroke-width': 2 }, lg);
  el('text', { x: 70, y: 137, 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 700, 'font-family': FONT,
    fill: '#d9bd78', 'letter-spacing': 1 }, lg, '12C');
  // keyboard area
  el('rect', { x: 20, y: 235, width: W - 40, height: 535, fill: '#0d0d0c' }, svg);
  el('rect', { x: 34, y: 246, width: W - 66, height: 526, rx: 2, fill: 'none', stroke: '#3b3120', 'stroke-width': 1.5 }, svg);
  el('rect', { x: W - 33, y: 246, width: 3, height: 526, fill: '#9c7a3c' }, svg);
  el('rect', { x: 34, y: 769, width: W - 64, height: 3, fill: '#9c7a3c' }, svg);
  el('text', { x: 60, y: 763, 'font-size': 17, 'font-weight': 600, 'font-family': FONT, fill: '#a98a4a',
    'letter-spacing': 11 }, svg, 'HEWLETT·PACKARD');
  const barX = G.keyX(6) + 40;
  el('rect', { x: barX, y: 754, width: W - 40 - barX, height: 10, fill: '#8f7538' }, svg);
}

function tw(text, size) { return text.length * size * 0.62; }

function buildBrackets(svg, G) {
  for (const b of BRACKETS) {
    const x1 = G.keyX(b.from) + 2, x2 = G.keyX(b.to) + G.kw - 2, y = keyY(b.row) - 33;
    const mid = (x1 + x2) / 2, half = tw(b.text, 13) / 2 + 8;
    const g = el('g', { stroke: GOLD_LEG, 'stroke-width': 2, fill: 'none' }, svg);
    el('path', { d: `M${x1},${y + 9}V${y}H${mid - half}M${mid + half},${y}H${x2}V${y + 9}` }, g);
    el('text', { x: mid, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, 'font-family': FONT,
      fill: GOLD_LEG, stroke: 'none', 'letter-spacing': 0.8 }, svg, b.text);
  }
}

function primaryText(g, k, w, bodyH) {
  const isF = k.code === 42, isG = k.code === 43;
  const fill = isF || isG ? '#111' : CREAM;
  const cx = w / 2;
  const base = { fill, 'font-family': FONT, 'font-weight': 700, 'text-anchor': 'middle' };
  if (k.code === 36) {
    [...'ENTER'].forEach((c, i) => el('text', { ...base, x: cx, y: 36 + i * 29, 'font-size': 25 }, g, c));
    return;
  }
  const cy = (bodyH - BAND) / 2 + 9;
  if (k.label === 'yˣ') {
    const t = el('text', { ...base, x: cx - 4, y: cy, 'font-size': 28, 'font-style': 'italic' }, g, 'y');
    el('tspan', { dy: -11, 'font-size': 19 }, t, 'x');
    return;
  }
  const len = [...k.label].length;
  let size = len >= 3 ? 23 : 28;
  if (/^[÷×−+]$/.test(k.label)) size = 34;
  if (k.label === '.') size = 34;
  if (k.label === 'Σ+') size = 27;
  const y = size >= 34 ? cy + 3 : cy;
  el('text', { ...base, x: cx, y, 'font-size': size }, g, k.label);
}

function buildKey(keysLayer, k, G) {
  const KW = G.kw;
  const x = G.keyX(k.col), y0 = keyY(k.row) + (k.code === 41 ? 6 : 0);
  const h = KH + (k.rows - 1) * KPITCH_Y;
  const isF = k.code === 42, isG = k.code === 43;
  const outer = el('g', { transform: `translate(${x},${y0})`, 'data-key': k.code }, keysLayer);
  // f-legend printed on the panel (does not move)
  if (k.f && !isF && !isG) el('text', { x: KW / 2, y: -13, 'text-anchor': 'middle', 'font-size': Math.min(18, (KW + 20) / (k.f.length * 0.62)), 'font-weight': 700,
    'font-family': FONT, fill: GOLD_LEG }, outer, k.f);
  // well
  el('rect', { x: -5, y: -5, width: KW + 10, height: h + 10, rx: 11, fill: '#070706', stroke: '#2b2823', 'stroke-width': 1.5 }, outer);
  const g = el('g', { class: 'key' }, outer);
  const face = isF ? 'url(#fFace)' : isG ? 'url(#gFace)' : k.code === 36 ? 'url(#enterFace)' : 'url(#keyFace)';
  el('rect', { x: 0, y: 3, width: KW, height: h, rx: 8, fill: '#000', opacity: 0.6 }, g);      // side depth
  el('rect', { x: 0, y: 0, width: KW, height: h, rx: 8, fill: face }, g);
  if (!isF && !isG) {
    el('path', { d: `M0,${h - BAND}H${KW}V${h - 8}Q${KW},${h} ${KW - 8},${h}H8Q0,${h} 0,${h - 8}Z`, fill: 'url(#keyBand)' }, g);
    el('rect', { x: 0, y: h - BAND, width: KW, height: 1.5, fill: '#000', opacity: 0.7 }, g);
    el('path', { d: `M8,1.2H${KW - 8}`, stroke: '#8a857b', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.75 }, g); // top highlight
  } else {
    el('path', { d: `M8,1.2H${KW - 8}`, stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.5 }, g);
    el('rect', { x: 0, y: h - 7, width: KW, height: 7, rx: 4, fill: '#000', opacity: 0.18 }, g);
  }
  el('rect', { x: 0.5, y: 0.5, width: KW - 1, height: h - 1, rx: 7.5, fill: 'none', stroke: '#000', 'stroke-opacity': 0.5 }, g);
  primaryText(g, k, KW, h);
  if (k.g && !isG) el('text', { x: KW / 2, y: h - 7, 'text-anchor': 'middle', 'font-size': 21, 'font-weight': 700,
    'font-style': 'italic', 'font-family': FONT, fill: BLUE_LEG }, g, k.g);
  el('rect', { class: 'shade', x: 0, y: 0, width: KW, height: h + 3, rx: 8, fill: '#000', opacity: 0, 'pointer-events': 'none' }, g);
  return { g, h, x, y: y0 };
}

// The SVG is rebuilt from scratch when the width changes (normal 1280, wider when stretched).
export function createCalculatorView(container) {
  const svg = el('svg', { preserveAspectRatio: 'xMidYMid meet', class: 'calculator', role: 'img', 'aria-label': 'HP 12C' });
  let G, lcd, keys, last = null;
  function build(w) {
    G = makeGeometry(w);
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${G.w} ${G.h}`);
    defs(svg);
    buildBody(svg, G);
    lcd = el('g', { class: 'lcd' }, svg);
    buildBrackets(svg, G);
    const keysLayer = el('g', {}, svg);
    keys = new Map();
    for (const k of LAYOUT) keys.set(k.code, { ...buildKey(keysLayer, k, G), k });
    if (last) renderLcd(lcd, last);
  }
  build(VIEWBOX.w);
  container.appendChild(svg);

  function toViewBox(clientX, clientY) {
    const portrait = !!(window.matchMedia && matchMedia('(orientation: portrait)').matches);
    return clientToViewBox(svg.getBoundingClientRect(), portrait, clientX, clientY, G);
  }
  return {
    svg,
    get width() { return G.w; },
    setWidth(w) { if (w !== G.w) build(w); },
    keyAt(clientX, clientY) { const p = toViewBox(clientX, clientY); return G.cellAt(p.x, p.y); },
    logoAt(clientX, clientY) { const p = toViewBox(clientX, clientY); return G.onLogo(p.x, p.y); },
    setPressed(code, pressed) {
      const e = keys.get(code);
      if (!e) return;
      e.g.setAttribute('transform', pressed ? 'translate(0,3)' : '');
      e.g.querySelector('.shade').setAttribute('opacity', pressed ? 0.25 : 0);
    },
    update(state) { last = state; renderLcd(lcd, state); },
  };
}
