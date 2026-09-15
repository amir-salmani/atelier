#!/usr/bin/env node
// Teardown runner. Produces the generated half of a teardown: frames, a motion
// contact sheet, and the extracted facts. The authored half — what any of it
// means — is written by hand into teardowns/<slug>.md.
//
//   node tools/teardown.mjs https://example.com [--slug name] [--steps 16]
//                           [--out DIR] [--webgl] [--cores N] [--no-video]
//                           [--burst-frames 26] [--burst-every 110]
//
// Artifacts land in <out>/<slug>/ and nothing is written outside it, where
// <out> is --out, else $ATELIER_TEARDOWNS, else ./teardowns/_packet in the
// directory you ran from.

import { chromium, devices } from 'playwright';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as probe from './probe.mjs';
import { digestSampler } from './analyze.mjs';
import { buildSheet, burst } from './sheet.mjs';


const args = process.argv.slice(2);
const url = args.find(a => a.startsWith('http'));
if (!url) { console.error('usage: node tools/teardown.mjs <url> [--slug s] [--steps n] [--no-video]'); process.exit(1); }
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const slug = flag('slug', new URL(url).hostname.replace(/^www\./, '').replace(/\./g, '-'));
const STEPS = +flag('steps', 16);
const VIDEO = !args.includes('--no-video');
const WEBGL = args.includes('--webgl');
// Both sites this was first built against had ~2s entrances, so the original
// 1.8s window clipped the payoff. Widen the default; --burst-* narrows it.
const BURST = { frames: +flag('burst-frames', 26), everyMs: +flag('burst-every', 110) };
const CORES = +flag('cores', Math.max(2, Math.floor(os.cpus().length / 4)));
const PACKETS = path.resolve(flag('out', process.env.ATELIER_TEARDOWNS || 'teardowns/_packet'));
const OUT = path.join(PACKETS, slug);

// Chromium sizes its rasteriser pool to the core count and, under software GL,
// pegs every one of them. On a laptop that is a thermal event, not a teardown.
// Re-exec pinned and niced; child browser processes inherit both.
if (!process.env.TD_PINNED) {
  const mask = `0-${CORES - 1}`;
  const r = spawnSync('taskset', ['-c', mask, 'nice', '-n', '15', process.execPath, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, TD_PINNED: mask },
  });
  process.exit(r.status ?? 1);
}

const log = (...m) => console.log('  ·', ...m);

// A single slow frame must not kill a four-minute run. Software-rasterised
// WebGL routinely blows the default 30s screenshot timeout.
const shot = (page, file, opts = {}) =>
  page.screenshot({ path: file, timeout: 12000, animations: 'allow', caret: 'initial', ...opts })
    .then(() => true, e => (log(`shot failed (${path.basename(file)}): ${e.message.split('\n')[0]}`), false));
const save = (name, data) => writeFile(path.join(OUT, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2));

// WebGL is off by default. Software rasterising a shader hero costs ~15x the
// CPU of the whole rest of the run, and most sites have no canvas at all.
// Pass --webgl when the hero is one; expect a slow run and a blank canvas
// reported honestly if it still fails.
const LAUNCH = {
  args: [
    '--hide-scrollbars',
    '--disable-dev-shm-usage',
    `--renderer-process-limit=${Math.max(2, CORES - 1)}`,
    ...(WEBGL
      ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : ['--disable-gpu', '--disable-software-rasterizer']),
  ],
};

const NAV = 90000;

// One transient failure must not discard a five-minute run.
async function open(page, target = url) {
  for (let i = 1; ; i++) {
    try { return await page.goto(target, { waitUntil: 'commit', timeout: NAV }); }
    catch (e) {
      if (i >= 3) throw e;
      log(`goto attempt ${i} failed, retrying: ${e.message.split('\n')[0]}`);
      await page.waitForTimeout(3000);
    }
  }
}

async function settle(page) {
  // A heavy SPA on four pinned cores can miss domcontentloaded's budget while
  // still being perfectly readable. Waiting is best-effort.
  await page.waitForLoadState('domcontentloaded', { timeout: 45000 }).catch(() => log('domcontentloaded slow, continuing'));
  await page.waitForTimeout(1200);
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch { /* long-poll sites never idle */ }
}

// Scroll the way a person does — in overlapping steps with a pause — so
// IntersectionObserver reveals actually fire instead of being skipped past.
async function scrollThrough(page, steps, onStep) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  const span = Math.max(height - vh, 1);
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((span * i) / steps);
    await page.evaluate(v => window.scrollTo({ top: v, behavior: 'smooth' }), y);
    await page.waitForTimeout(650);
    if (onStep) await onStep(i, y);
  }
  return { height, vh };
}

async function perfMetrics(page) {
  return page.evaluate(() => new Promise(res => {
    const out = { lcp: null, cls: 0, longTasks: 0 };
    try {
      new PerformanceObserver(l => { for (const e of l.getEntries()) out.lcp = Math.round(e.startTime); })
        .observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; })
        .observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(l => { out.longTasks += l.getEntries().length; })
        .observe({ type: 'longtask', buffered: true });
    } catch { /* older surface */ }
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const byType = {};
      let bytes = 0;
      for (const r of performance.getEntriesByType('resource')) {
        const size = r.transferSize || 0;
        bytes += size;
        byType[r.initiatorType] = (byType[r.initiatorType] || 0) + size;
      }
      res({
        ...out,
        cls: +out.cls.toFixed(4),
        ttfb: Math.round(nav.responseStart || 0),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
        fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
        transferKB: Math.round(bytes / 1024),
        transferByTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
        resourceCount: performance.getEntriesByType('resource').length,
      });
    }, 900);
  }));
}

// ── desktop: the main pass ────────────────────────────────────────────────────
async function desktopPass(browser) {
  log('desktop 1440×900');
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ...(VIDEO ? { recordVideo: { dir: path.join(OUT, 'video'), size: { width: 1280, height: 800 } } } : {}),
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(NAV);
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });

  await open(page);
  await settle(page);

  const rehydrated = await page.evaluate(probe.rehydrateSheets);
  if (rehydrated.attempted) log(`rehydrated ${rehydrated.rehydrated}/${rehydrated.attempted} cross-origin sheets`);
  const gates = await page.evaluate(probe.dismissOverlays);
  if (gates.clicked.length || gates.forciblyHidden.length) log('gates:', JSON.stringify(gates));
  await page.waitForTimeout(800);

  await shot(page, path.join(OUT, 'hero.png'));
  const perf = await perfMetrics(page);


  // Reload with the sampler armed before first paint and burst-capture, so the
  // entrance animation is recorded rather than reconstructed after it settled.
  await mkdir(path.join(OUT, 'frames-entrance'), { recursive: true });
  let entranceCaptured = 0;
  try {
    await page.addInitScript(probe.installSampler);
    await page.reload({ waitUntil: 'commit', timeout: NAV });
    entranceCaptured = await burst(page, path.join(OUT, 'frames-entrance'), { ...BURST, budgetMs: 14000 });
    await settle(page);
    await page.evaluate(probe.dismissOverlays);
  } catch (e) {
    log(`entrance capture skipped: ${e.message.split('\n')[0]}`);
    await page.evaluate(probe.installSampler).catch(() => {});
  }

  await mkdir(path.join(OUT, 'frames'), { recursive: true });
  const { height, vh } = await scrollThrough(page, STEPS, async (i, y) => {
    await shot(page, path.join(OUT, 'frames', `scroll-${String(i).padStart(2, '0')}-y${String(y).padStart(6, '0')}.png`));
  });

  // Hover the primary calls to action — micro-interaction is invisible to a
  // plain scroll capture.
  const hovers = [];
  const targets = await page.$$('a[class], button');
  for (const el of targets.slice(0, 22)) {
    try {
      const box = await el.boundingBox();
      if (!box || box.width < 60 || box.height < 24) continue;
      const read = n => [n, ...n.querySelectorAll('*')].slice(0, 6).map(x => {
        const c = getComputedStyle(x);
        return [c.backgroundColor, c.color, c.transform, c.boxShadow, c.borderColor, c.opacity, c.letterSpacing, c.filter, c.clipPath].join('|');
      });
      const before = await el.evaluate(read);
      await el.hover({ timeout: 1500 });
      await page.waitForTimeout(380);
      const after = await el.evaluate(read);
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        const label = await el.evaluate(n => (n.textContent || '').trim().slice(0, 40));
        const timing = await el.evaluate(n => {
          const pick = [n, ...n.querySelectorAll('*')].slice(0, 6)
            .map(x => { const c = getComputedStyle(x); return c.transitionDuration !== '0s' ? `${c.transitionProperty} ${c.transitionDuration} ${c.transitionTimingFunction}` : null; })
            .filter(Boolean);
          return [...new Set(pick)];
        });
        const changed = before.map((b, k) => b !== after[k] ? k : -1).filter(k => k >= 0);
        hovers.push({ label, timing, changedNodes: changed, before, after });
      }
      if (hovers.length >= 8) break;
    } catch { /* detached or covered */ }
  }
  log(`${hovers.length} hover states with a real delta`);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1200);

  const sampler = await page.evaluate(probe.readSampler);
  const facts = {
    url, capturedAt: new Date().toISOString(), viewport: '1440x900',
    gates, rehydrated, perf, consoleErrors: consoleErrors.slice(0, 10),
    webglRendered: WEBGL, entranceFrames: entranceCaptured,
    page: { docHeight: height, viewportHeight: vh, screensOfScroll: +(height / vh).toFixed(1) },
    css: await page.evaluate(probe.collectCss),
    live: await page.evaluate(probe.collectLive),
    stack: await page.evaluate(probe.fingerprint),
    surface: await page.evaluate(probe.collectSurface),
    hovers,
  };

  await ctx.close();
  return { facts, sampler };
}

// ── mobile: not a narrower desktop, a different composition ───────────────────
async function mobilePass(browser) {
  log('mobile 390×844 (iPhone 14 profile)');
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(NAV);
  await open(page);
  await settle(page);
  await page.evaluate(probe.dismissOverlays);
  await page.waitForTimeout(600);
  await shot(page, path.join(OUT, 'mobile-hero.png'));

  await mkdir(path.join(OUT, 'frames-mobile'), { recursive: true });
  await scrollThrough(page, Math.min(STEPS, 10), async (i, y) => {
    await shot(page, path.join(OUT, 'frames-mobile', `m-${String(i).padStart(2, '0')}-y${String(y).padStart(6, '0')}.png`));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  // Does the nav become a drawer, and does it work by touch?
  let navChange = null;
  for (const sel of ['[aria-label*="menu" i]', '[class*="burger" i]', '[class*="hamburger" i]', 'button[class*="menu" i]', '[class*="nav-toggle" i]']) {
    const el = await page.$(sel);
    if (!el) continue;
    try {
      const before = await page.evaluate(() => document.body.innerText.length);
      await el.tap({ timeout: 2000 });
      await page.waitForTimeout(900);
      await shot(page, path.join(OUT, 'mobile-nav-open.png'));
      const after = await page.evaluate(() => document.body.innerText.length);
      navChange = { selector: sel, textDelta: after - before, opened: after !== before };
      break;
    } catch { /* not tappable */ }
  }

  const facts = {
    viewport: '390x844', navChange,
    surface: await page.evaluate(probe.collectSurface),
    perf: await perfMetrics(page),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2),
    tapTargetsUndersized: await page.evaluate(() =>
      [...document.querySelectorAll('a,button,[role="button"],input')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44); }).length),
  };
  await ctx.close();
  return facts;
}

// ── reduced motion: the pass most sites fail ──────────────────────────────────
async function reducedMotionPass(browser) {
  log('prefers-reduced-motion: reduce');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(NAV);
  await open(page);
  await settle(page);
  await page.evaluate(probe.dismissOverlays);
  await page.waitForTimeout(700);
  await shot(page, path.join(OUT, 'reduced-motion-hero.png'));

  const css = await page.evaluate(probe.collectCss);
  const live = await page.evaluate(probe.collectLive);
  const honoured = await page.evaluate(() => {
    let found = 0;
    for (const sheet of document.styleSheets) {
      try {
        const walk = rules => { for (const r of rules) {
          if (r.media && /prefers-reduced-motion/.test(r.conditionText || r.media.mediaText)) found++;
          if (r.cssRules) walk(r.cssRules);
        } };
        walk(sheet.cssRules);
      } catch { /* cross-origin */ }
    }
    return found;
  });
  await ctx.close();
  return { reducedMotionMediaBlocks: honoured, runningAnimations: live.filter(a => a.playState === 'running').length, animatedRules: css.animated.length };
}

// ── main ──────────────────────────────────────────────────────────────────────
(async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  console.log(`\nteardown: ${url}\n  → ${path.relative(process.cwd(), OUT) || OUT}/`);
  console.log(`  cores 0-${CORES - 1}, nice 15, webgl ${WEBGL ? 'on (slow)' : 'off'}\n`);

  const browser = await chromium.launch(LAUNCH);
  try {
    const attempt = async (name, fn) => {
      try { return await fn(); }
      catch (e) { log(`${name} pass failed: ${e.message.split('\n')[0]}`); return { failed: e.message.split('\n')[0] }; }
    };
    const desktop = await attempt('desktop', () => desktopPass(browser));
    if (desktop.failed) throw new Error(`desktop pass failed: ${desktop.failed}`);
    const mobile = await attempt('mobile', () => mobilePass(browser));
    const reduced = await attempt('reduced-motion', () => reducedMotionPass(browser));

    const motion = digestSampler(desktop.sampler);
    await save('facts.json', { ...desktop.facts, mobile, reducedMotion: reduced });
    await save('motion.json', motion);
    // Raw frames kept compressed so the digest can be re-cut without a re-run.
    await writeFile(path.join(OUT, 'sampler.json.gz'), gzipSync(JSON.stringify(desktop.sampler)));

    const sheets = [
      ['frames-entrance', 'entrance-sheet.png', 6, `entrance motion — ${BURST.frames} frames @ ${BURST.everyMs}ms`, f => (f.match(/t(\d+)ms/)?.[1] ?? '?').replace(/^0+(?=\d)/, '') + 'ms'],
      ['frames', 'scroll-sheet.png', 4, 'scroll choreography', f => 'scrollY ' + (f.match(/y(\d+)/)?.[1] ?? '?')],
      ['frames-mobile', 'mobile-sheet.png', 6, 'mobile 390×844', f => 'y ' + (f.match(/y(\d+)/)?.[1] ?? '?')],
    ];
    for (const [dir, out, cols, title, label] of sheets) {
      const ok = await buildSheet(browser, path.join(OUT, dir), path.join(OUT, out), { cols, title: `${slug} — ${title}`, label });
      if (ok) log(out);
    }

    const f = desktop.facts;
    console.log(`\n  ${f.surface.title}`);
    console.log(`  ${f.page.screensOfScroll} screens · ${f.css.keyframes.length} keyframes · ${f.css.animated.length} animated rules · ${f.live.length} live animations`);
    console.log(`  LCP ${f.perf.lcp}ms · CLS ${f.perf.cls} · ${f.perf.transferKB}KB over ${f.perf.resourceCount} requests`);
    console.log(`  ${motion.summary.revealCount} reveals, median ${motion.summary.medianDurationMs}ms, easing ${motion.summary.easingFamilies[0]?.[0] ?? 'n/a'} · ${motion.staggers.length} staggered groups`);
    console.log(`  reduced-motion blocks: ${reduced.reducedMotionMediaBlocks ?? 'n/a'}`);
    console.log(`\n  now write the teardown for ${slug} — the packet is evidence, not the finding.\n`);
  } finally {
    await browser.close();
  }
})();
