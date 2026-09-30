import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutCells } from '../src/ui/lcd.js';

const chars = r => r.cells.map(c => c.ch + (c.point ? '.' : '') + (c.comma ? ',' : '')).join('|');
test('right-aligned number with separators', () => {
  const r = layoutCells('-1,064.54');
  assert.equal(r.sign, true);
  assert.equal(r.cells.length, 10);
  assert.equal(chars(r), ' | | | |1,|0|6|4.|5|4');
  assert.deepEqual(r.cells.slice(-6).map(c => c.ch).join(''), '106454');
  assert.equal(r.cells[4].comma, true);                // the '1' carries the comma
  assert.equal(r.cells[7].point, true);                // the '4' before '.54'
});
test('scientific notation occupies all cells', () => {
  const r = layoutCells('1.487456 01');
  assert.equal(r.cells.map(c => c.ch).join(''), '1487456 01');
});
test('left-aligned text', () => {
  const r = layoutCells('Error 5');
  assert.equal(r.leftAligned, true);
  assert.equal(r.cells[0].ch, 'E');
});
test('program line', () => {
  const r = layoutCells('008,43,33,000');
  assert.equal(r.cells.map(c => c.ch).join(''), '0084333000');
  assert.equal(r.cells[2].comma, true);
});
