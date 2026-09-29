import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju } from '../src/engine.js';
import { branchRelation, calculateAnnual, compareSaju } from '../src/extended.js';

const first = calculateSaju({ year: 1994, month: 7, day: 21, hour: 9 });
const second = calculateSaju({ year: 1996, month: 2, day: 12, hour: null });

test('annual pillar follows the selected year', () => {
  const annual2026 = calculateAnnual(first, 2026);
  const annual2027 = calculateAnnual(first, 2027);
  assert.equal(annual2026.hanja, '丙午');
  assert.equal(annual2027.hanja, '丁未');
  assert.equal(annual2026.cards.length, 3);
  assert.match(annual2026.headline, /2026년/);
  assert.throws(() => calculateAnnual(first, 2051), /1900~2050/);
});

test('day-branch harmony and clash are symmetric', () => {
  assert.equal(branchRelation('子', '丑').kind, 'harmony');
  assert.equal(branchRelation('丑', '子').kind, 'harmony');
  assert.equal(branchRelation('子', '午').kind, 'clash');
  assert.equal(branchRelation('午', '子').kind, 'clash');
  assert.equal(branchRelation('子', '子').kind, 'same');
  assert.throws(() => branchRelation('?', '子'), /올바른 지지/);
});

test('compatibility works when one birth time is unknown', () => {
  const comparison = compareSaju(first, second);
  assert.equal(comparison.hasBothTimes, false);
  assert.equal(comparison.cards.length, 3);
  assert.equal(comparison.first.hanja, first.pillars.day.hanja);
  assert.equal(comparison.second.hanja, second.pillars.day.hanja);
});
