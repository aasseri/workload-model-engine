// اختبارات المحرك: npm test
const test = require('node:test');
const assert = require('node:assert');
const E = require('../js/engine.js');

const SIZES = [3, 7, 20, 50, 150];

test('الثوابت لم تتغير', () => {
  assert.strictEqual(E.CAP, 1023);
  assert.deepStrictEqual(E.LEVELS.map(l => l.F), [240, 48, 12, 4, 2, 1]);
});

for (const n of SIZES) {
  test(`نموذج ${n} موظفين: الانحراف ≤ 1% وكل المستويات ممثلة`, () => {
    const r = E.run(n, 482913);
    const { tasks, ev } = r.best;
    assert.strictEqual(r.T, n * 1023);
    // المستوى الافتراضي ×2، مع حد أدنى 8 مهام (6 ترددات + 2)
    const lo = Math.max(8, 2 * n), hi = Math.max(lo, Math.round(2 * n * 1.15));
    assert.ok(tasks.length >= lo && tasks.length <= hi, `N=${tasks.length}`);
    assert.ok(Math.abs(ev.devPct) <= 1, `devPct=${ev.devPct}`);
    E.counts(tasks).forEach(c => assert.ok(c >= 1));
    tasks.forEach(t => {
      const L = E.LEVELS[t.li];
      assert.ok(t.d >= L.dmin && t.d <= L.dmax, `مدة خارج النطاق: ${t.d}`);
      assert.ok(t.d % 5 === 0);
      assert.ok(t.r >= 1 && Number.isInteger(t.r));
    });
    const sum = tasks.reduce((a, t) => a + t.F * t.r * t.d / 60, 0);
    assert.ok(Math.abs(sum - ev.H) < 1e-6);
  });
}

for (const M of E.MULTS) {
  test(`المضاعف ×${M}: عدد المهام بين ${M}E و ${M}E+15%`, () => {
    const n = 6, r = E.run(n, 482913, M), N = r.best.tasks.length;
    assert.strictEqual(r.M, M);
    assert.ok(N >= M * n && N <= Math.round(M * n * 1.15), `N=${N}`);
    assert.ok(Math.abs(r.best.ev.devPct) <= 1);
  });
}

test('نفس رقم السيناريو يعطي نفس النموذج', () => {
  const a = E.run(12, 777), b = E.run(12, 777);
  assert.deepStrictEqual(a.best.tasks.map(t => [t.li, t.r, t.d]), b.best.tasks.map(t => [t.li, t.r, t.d]));
});
