#!/usr/bin/env node
// Assertions on the pure half of the runner. No browser, no network.
//
//   node tools/selftest.mjs
//
// These exist because every one of the four failures diagnose() catches was
// first shipped as a packet full of zeros that looked exactly like a quiet site.
// A detector nobody tests is a detector you find out about from a wrong teardown.

import { diagnose, classifyEasing, digestSampler } from './analyze.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n         ${e.message}`); fail++; }
};
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m ?? ''} got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); };
const ok = (c, m) => { if (!c) throw new Error(m || 'expected truthy'); };

const facts = ({ title = 'A Site', headings = [], errs = [], kb = 900, rules = 1200,
                 focus = 40, screens = 10, imgs = 12, jsonld = ['Organization'] } = {}) => ({
  surface: { title, headings: headings.map(text => ({ text })), imgTotal: imgs, jsonld, focusableCount: focus },
  perf: { transferKB: kb }, consoleErrors: errs, page: { screensOfScroll: screens }, css: { rulesSeen: rules },
});

// ── diagnose ──────────────────────────────────────────────────────────────
t('healthy page is clean', () => {
  const d = diagnose(facts());
  eq([d.blocked.length, d.crashed.length, d.throttled.length], [0, 0, 0]);
});

t('a lone third-party 403 does not condemn a page that rendered', () => {
  // The real case: hydradb renders fine and has one dead analytics beacon.
  const d = diagnose(facts({ errs: ['Failed to load resource: 403 ()'] }));
  eq(d.blocked, [], 'single weak signal');
});

t('Cloudflare wall is blocked', () => {
  const d = diagnose(facts({ title: 'Attention Required! | Cloudflare', kb: 9, rules: 80,
                             errs: ['403 ()', '403 ()'], imgs: 0, jsonld: [] }));
  ok(d.blocked.length >= 2, 'expected a block verdict');
  eq(d.throttled.length, 0);
});

t('block-page text alone is decisive', () => {
  ok(diagnose(facts({ title: 'Sorry, you have been blocked' })).blocked.length > 0);
});

t('crashed render is crashed, not blocked', () => {
  const d = diagnose(facts({ title: "This page couldn't load", rules: 2133, focus: 2, screens: 1, imgs: 0 }));
  ok(d.crashed.length > 0, 'expected crash');
  eq(d.blocked, [], 'a crash is not a wall');
});

t('a rich stylesheet behind an empty document reads as a crash', () => {
  ok(diagnose(facts({ rules: 2000, focus: 2, screens: 1 })).crashed.length > 0);
});

t('WebGL-off page says re-run with --webgl', () => {
  const d = diagnose(facts({ title: 'Error creating WebGL context.' }));
  ok(d.crashed.some(h => h.includes('--webgl')), JSON.stringify(d.crashed));
});

t('429 is throttled, and suppresses the crash verdict', () => {
  const d = diagnose(facts({ title: 'HTTP 429', headings: ['HTTP 429 Slow down'],
                             errs: ['429 ()', '429 ()'], kb: 96, rules: 1588, focus: 3, screens: 0.8 }));
  ok(d.throttled.length > 0, 'expected throttled');
  eq(d.crashed, [], 'rate limiting is not a crash — the advice differs');
});

// ── classifyEasing ────────────────────────────────────────────────────────
t('linear progress classifies as linear', () => {
  const s = Array.from({ length: 20 }, (_, i) => i / 19);
  eq(classifyEasing(s).name, 'linear');
});

t('a front-loaded curve reads as decelerate', () => {
  const s = Array.from({ length: 20 }, (_, i) => Math.sqrt(i / 19));
  eq(classifyEasing(s).shape, 'decelerate (front-loaded)');
});

t('a back-loaded curve reads as accelerate', () => {
  const s = Array.from({ length: 20 }, (_, i) => (i / 19) ** 3);
  eq(classifyEasing(s).shape, 'accelerate (back-loaded)');
});

t('too few samples is reported, not guessed', () => {
  eq(classifyEasing([0, 1]).name, 'too-few-samples');
});

// ── digestSampler ─────────────────────────────────────────────────────────
const fade = (startMs, durMs, step = 16) => {
  const rows = [];
  for (let t = 0; t <= startMs + durMs + step * 2; t += step) {
    const p = t < startMs ? 0 : Math.min((t - startMs) / durMs, 1);
    rows.push([t, 0, +p.toFixed(2), 0, 0, 1]);
  }
  return rows;
};

t('a fade is measured over the opacity band, with the documented bias', () => {
  // Not 300ms. The band is 0.12–0.92, so a linear fade reads 0.8x — this
  // asserts the real contract rather than a comfortable approximation.
  const d = digestSampler({ series: { 'div.a': fade(100, 300) } });
  eq(d.summary.revealCount, 1);
  const expected = 300 * (d.band.hi - d.band.lo);
  ok(Math.abs(d.summary.medianDurationMs - expected) <= 20,
     `got ${d.summary.medianDurationMs}, band-adjusted expectation ${expected}`);
});

t('the band and its bias are reported, not left implicit', () => {
  const d = digestSampler({ series: { 'div.a': fade(100, 300) } });
  eq(d.band, { lo: 0.12, hi: 0.92 });
  ok(/declared duration/.test(d.bandNote), 'expected the caveat in the output');
});

t('an element that sat hidden for a minute is not a reveal', () => {
  const d = digestSampler({ series: { 'div.a': fade(100, 60000, 200) } });
  eq(d.summary.revealCount, 0);
  ok(d.summary.rejected.tooSlow > 0, 'should be rejected as too slow');
});

t('same-frame starts are not a stagger', () => {
  const s = {}; for (let i = 0; i < 4; i++) s[`div.${i}`] = fade(100, 300);
  const d = digestSampler({ series: s });
  eq(d.staggers, [], 'simultaneous is not staggered');
  ok(d.summary.simultaneousGroups > 0);
});

t('an offset group is a stagger, and the gap is measured', () => {
  const s = {}; for (let i = 0; i < 4; i++) s[`div.${i}`] = fade(100 + i * 150, 300);
  const d = digestSampler({ series: s });
  eq(d.staggers.length, 1);
  ok(Math.abs(d.staggers[0].medianGapMs - 150) <= 32, `gap ${d.staggers[0].medianGapMs}`);
});

t('an empty sample says so rather than reporting zeros', () => {
  ok(digestSampler({ series: {} }).note, 'expected a note');
});

console.log(`\n${pass + fail} assertions · ${fail} failed`);
process.exit(fail ? 1 : 0);
