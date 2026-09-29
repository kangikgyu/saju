import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, tenGod } from '../src/engine.js';

test('2017 Korean leap fifth month maps to the correct solar date', () => {
  const chart = calculateSaju({ calendarType: 'lunar', year: 2017, month: 5, day: 1, leapMonth: true, hour: 9 });
  assert.deepEqual(chart.solarDate, { year: 2017, month: 6, day: 24 });
  assert.equal(chart.lunarDate.intercalation, true);
  assert.equal(chart.pillars.time.hanja, '乙巳');
});

test('year and month pillars change at the 2024 Ipchun minute in KST', () => {
  const before = calculateSaju({ year: 2024, month: 2, day: 4, hour: 17, minute: 27 });
  const after = calculateSaju({ year: 2024, month: 2, day: 4, hour: 17, minute: 28 });
  assert.equal(before.pillars.year.hanja, '癸卯');
  assert.equal(before.pillars.month.hanja, '乙丑');
  assert.equal(after.pillars.year.hanja, '甲辰');
  assert.equal(after.pillars.month.hanja, '丙寅');
  assert.equal(before.pillars.day.hanja, after.pillars.day.hanja);
});

test('unknown birth time omits the hour pillar and its elemental weight', () => {
  const known = calculateSaju({ year: 1994, month: 7, day: 21, hour: 9 });
  const unknown = calculateSaju({ year: 1994, month: 7, day: 21 });
  assert.equal(unknown.pillars.time, null);
  assert.equal(unknown.hasTime, false);
  assert.equal(known.distribution.reduce((sum, item) => sum + item.weight, 0), 8);
  assert.equal(unknown.distribution.reduce((sum, item) => sum + item.weight, 0), 6);
});

test('ten gods are relative to the day stem', () => {
  assert.equal(tenGod('甲', '甲'), '비견');
  assert.equal(tenGod('甲', '乙'), '겁재');
  assert.equal(tenGod('甲', '丙'), '식신');
  assert.equal(tenGod('甲', '己'), '정재');
  assert.equal(tenGod('甲', '癸'), '정인');
});

test('invalid calendar dates and leap months are rejected', () => {
  assert.throws(() => calculateSaju({ year: 2024, month: 2, day: 30 }), /올바른 양력/);
  assert.throws(() => calculateSaju({ calendarType: 'lunar', year: 2017, month: 4, day: 1, leapMonth: true }), /음력 날짜/);
});
