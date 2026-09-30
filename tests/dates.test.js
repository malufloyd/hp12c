import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, run, disp } from './helpers.js';
import { dayNumber, fromDayNumber, days30360, addMonths, weekday, parseDate } from '../src/engine/dates.js';

test('I1 DATE (D.MY)', () => {
  const c = run(fresh(), 'D.MY 14.052004 ENTER 120 DATE');
  assert.equal(disp(c), '11,09,2004 6');
  assert.equal(c.display.ann.dmy, true);
  run(c, 'f 6');
  assert.equal(disp(c), '11.092004');
});
test('DATE in M.DY with negative days', () => {
  assert.equal(disp(run(fresh(), '6.032004 ENTER 1 CHS DATE')), '06,02,2004 3');
});
test('I2 delta days', () => {
  const c = run(fresh(), 'M.DY 6.032004 ENTER 10.142005 DDYS');
  assert.equal(disp(c), '498.00');
  assert.equal(disp(run(c, 'x<>y')), '491.00');
});
test('D1 delta days (odd period)', () => {
  const c = run(fresh(), '2.152004 ENTER 3.012004 DDYS');
  assert.equal(disp(c), '15.00');
  assert.equal(disp(run(c, 'x<>y')), '16.00');
});
test('invalid date → Error 8', () => {
  assert.equal(disp(run(fresh(), '2.302004 ENTER 1 DATE')), 'Error 8');
  assert.equal(disp(run(fresh(), '13.012004 ENTER 1 DATE')), 'Error 8');
});
test('range: out-of-range input and result → Error 8', () => {
  assert.equal(disp(run(fresh(), '10.141582 ENTER 1 DATE')), 'Error 8');
  assert.equal(disp(run(fresh(), '10.151582 ENTER 1 CHS DATE')), 'Error 8');
  assert.equal(disp(run(fresh(), '11.254046 ENTER 1 DATE')), 'Error 8');
  assert.equal(disp(run(fresh(), '11.254046 ENTER 0 DATE')), '11,25,4046 7');
});
test('dmy/mdy do not disturb stack or finStored', () => {
  const c = run(fresh(), '5 ENTER 7 n D.MY');
  assert.equal(c.state.finStored, true);
  assert.equal(disp(c), '7.00');
  run(c, 'M.DY');
  assert.equal(c.state.mode.dmy, false);
});
test('date display cleared on next key; DATE stack effect', () => {
  const c = run(fresh(), '9 ENTER 8 ENTER 6.032004 ENTER 1 DATE');
  assert.equal(disp(c), '06,04,2004 5');
  assert.equal(c.state.stack[1].toString(), '8');
  assert.equal(c.state.lastX.toString(), '1');
  run(c, '1');
  assert.equal(disp(c), '1');
});
test('date display honours comma-decimal separator', () => {
  const c = fresh(); c.state.mode.commaDecimal = true;
  assert.equal(disp(run(c, '6.032004 ENTER 1 DATE')), '06.04.2004 5');
});
test('DDYS stack effect', () => {
  const c = run(fresh(), '9 ENTER 8 ENTER 1.012004 ENTER 2.012004 DDYS');
  assert.deepEqual(c.state.stack.map(String), ['31', '30', '8', '9']);
});
test('dayNumber / fromDayNumber round-trip', () => {
  for (const dt of [{ y: 1582, m: 10, d: 15 }, { y: 2000, m: 2, d: 29 }, { y: 2004, m: 12, d: 31 }, { y: 4046, m: 11, d: 25 }]) {
    assert.deepEqual(fromDayNumber(dayNumber(dt)), dt);
  }
  assert.equal(dayNumber({ y: 2004, m: 3, d: 1 }) - dayNumber({ y: 2004, m: 2, d: 29 }), 1);
});
test('weekday (1 = Monday)', () => {
  assert.equal(weekday({ y: 2004, m: 9, d: 11 }), 6);
  assert.equal(weekday({ y: 2004, m: 6, d: 2 }), 3);
  assert.equal(weekday({ y: 2004, m: 6, d: 6 }), 7);
});
test('days30360 edge cases with day 31', () => {
  assert.equal(days30360({ y: 2004, m: 1, d: 31 }, { y: 2004, m: 3, d: 31 }), 60);
  assert.equal(days30360({ y: 2004, m: 1, d: 30 }, { y: 2004, m: 3, d: 31 }), 60);
  assert.equal(days30360({ y: 2004, m: 1, d: 29 }, { y: 2004, m: 3, d: 31 }), 62);
  assert.equal(days30360({ y: 2004, m: 1, d: 31 }, { y: 2004, m: 2, d: 29 }), 29);
});
test('addMonths', () => {
  assert.deepEqual(addMonths({ y: 2004, m: 11, d: 15 }, 3), { y: 2005, m: 2, d: 15 });
  assert.deepEqual(addMonths({ y: 2004, m: 3, d: 15 }, -3), { y: 2003, m: 12, d: 15 });
  assert.equal(addMonths({ y: 2004, m: 1, d: 31 }, 1), null);
  assert.deepEqual(addMonths({ y: 2004, m: 1, d: 29 }, 1), { y: 2004, m: 2, d: 29 });
});
test('parseDate', () => {
  assert.deepEqual(parseDate(6.032004, false), { y: 2004, m: 6, d: 3 });
  assert.deepEqual(parseDate(3.062004, true), { y: 2004, m: 6, d: 3 });
  assert.throws(() => parseDate(2.29, false));
});
