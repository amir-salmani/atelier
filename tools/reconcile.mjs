#!/usr/bin/env node
// Check every authored teardown's cited numbers against the evidence retained
// beside its packet. Exits non-zero on drift.
//
//   node tools/reconcile.mjs <teardowns-dir> [--packets DIR]
//
// A teardown declares what it cites in frontmatter:
//
//   capture:
//     date: 2026-09-15
//     medianDurationMs: 330
//     staggerGapsMs: [155]
//     reducedMotionBlocks: 0
//
// Prose may say what it likes; the frontmatter is the contract, and this is what
// catches a re-run silently invalidating a published claim.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve(process.argv[2] || 'teardowns');
const pi = process.argv.indexOf('--packets');
const packets = path.resolve(pi > -1 ? process.argv[pi + 1] : path.join(dir, '_packet'));

const CHECKED = ['medianDurationMs', 'staggerGapsMs', 'reducedMotionBlocks', 'revealCount',
                 'screensOfScroll', 'cssRules', 'animatedRules', 'keyframes', 'imgNoAlt', 'imgTotal'];

// Enough YAML for a flat capture: block, scalars and inline arrays.
function capture(md) {
  const m = md.match(/^capture:\n((?:[ \t]+.*\n)+)/m);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^\s+([A-Za-z0-9_]+):\s*(.+?)\s*$/);
    if (!kv) continue;
    const [, k, raw] = kv;
    out[k] = raw.startsWith('[')
      ? raw.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean).map(Number)
      : /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw.replace(/^["']|["']$/g, '');
  }
  return out;
}

const eq = (a, b) => Array.isArray(a) || Array.isArray(b)
  ? JSON.stringify([a].flat()) === JSON.stringify([b].flat())
  : a === b;

const files = (await readdir(dir)).filter(f => f.endsWith('.md') && f !== 'index.md').sort();
let drift = 0, missing = 0, checked = 0;

for (const f of files) {
  const slug = f.replace('.md', '');
  const md = await readFile(path.join(dir, f), 'utf8');
  const cap = capture(md);
  if (!cap) { console.log(`  --   ${slug.padEnd(24)} no capture: block — nothing to check`); missing++; continue; }

  const ev = await readFile(path.join(packets, slug, 'evidence.json'), 'utf8')
    .then(JSON.parse).catch(() => null);
  if (!ev) { console.log(`  MISS ${slug.padEnd(24)} cites numbers but no evidence.json — re-run it`); missing++; continue; }

  const bad = CHECKED.filter(k => k in cap && !eq(cap[k], ev[k]))
    .map(k => `${k}: says ${JSON.stringify(cap[k])}, evidence ${JSON.stringify(ev[k])}`);
  checked++;
  if (bad.length) { drift++; console.log(`  DRIFT ${slug}`); for (const b of bad) console.log(`          ${b}`); }
  else console.log(`  ok   ${slug.padEnd(24)} ${Object.keys(cap).filter(k => CHECKED.includes(k)).length} cited values match`);
}

console.log(`\n${files.length} teardowns · ${checked} checked · ${drift} drifted · ${missing} unverifiable`);
process.exit(drift ? 1 : 0);
