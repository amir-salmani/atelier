#!/usr/bin/env node
// Check an evidence pool, and check that journeys only draw from it.
//
//   node tools/evidence-lint.mjs <pool.md> [journeys-dir]
//
// The counterpart to reconcile.mjs. That one stops a design claim drifting from
// the numbers it cited; this one stops a journey drifting from the pain it was
// based on. Same failure, opposite half of the method.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const poolPath = process.argv[2];
const journeyDir = process.argv[3];
if (!poolPath) { console.error('usage: evidence-lint.mjs <pool.md> [journeys-dir]'); process.exit(2); }

const CONFIDENCE = ['confirmed', 'reported', 'unverified'];
const pool = await readFile(poolPath, 'utf8');

// One item per "## E-nn · title", fields as "- key: value" beneath it.
const items = [];
const re = /^##\s+(E-\d+)\s*[·:-]\s*(.+?)\s*$/gm;
let m, marks = [];
while ((m = re.exec(pool))) marks.push({ id: m[1], title: m[2], at: m.index });
marks.forEach((mk, i) => {
  const body = pool.slice(mk.at, i + 1 < marks.length ? marks[i + 1].at : pool.length);
  const f = {};
  for (const line of body.split('\n')) {
    const kv = line.match(/^\s*[-*]\s*([A-Za-z]+):\s*(.+?)\s*$/);
    if (kv) f[kv[1].toLowerCase()] = kv[2];
  }
  items.push({ ...mk, fields: f });
});

const errs = [], warns = [];
if (!items.length) {
  const empty = /no known pain|pool is empty|nothing shipped/i.test(pool);
  if (empty) console.log('  pool is empty and says why — a true artifact for a product with nothing shipped');
  else errs.push('no items found, and no dated note explaining why the pool is empty');
}

const seen = new Map();
for (const it of items) {
  const where = `${it.id}`;
  if (seen.has(it.id)) errs.push(`${where} duplicate id (also "${seen.get(it.id)}")`);
  seen.set(it.id, it.title);
  if (!it.fields.source) errs.push(`${where} no source`);
  if (!it.fields.date) errs.push(`${where} no date — an undated observation rots silently`);
  else if (!/^\d{4}-\d{2}(-\d{2})?$/.test(it.fields.date)) errs.push(`${where} date "${it.fields.date}" is not YYYY-MM[-DD]`);
  const c = (it.fields.confidence || '').toLowerCase();
  if (!c) errs.push(`${where} no confidence`);
  else if (!CONFIDENCE.includes(c)) errs.push(`${where} confidence "${c}" not in ${CONFIDENCE.join(' · ')}`);
  if (/\bwants?\b|\brequests?\b|\bwould like\b|\bfeature\b/i.test(it.title))
    warns.push(`${where} reads like a feature request — an item is what happened, not what was asked for`);
}

// Journeys may only cite ids that exist; ids nobody cites are a visible decision.
let cited = new Set();
if (journeyDir) {
  const files = (await readdir(journeyDir)).filter(f => f.endsWith('.md') && f !== 'index.md');
  for (const f of files) {
    const t = await readFile(path.join(journeyDir, f), 'utf8');
    const ids = [...t.matchAll(/\bE-\d+\b/g)].map(x => x[0]);
    if (!ids.length) errs.push(`${f} cites no evidence — "where today breaks" must name at least one E-nn, or say plainly that there is none`);
    for (const id of ids) {
      cited.add(id);
      if (!seen.has(id)) errs.push(`${f} cites ${id}, which is not in the pool`);
    }
  }
  for (const it of items) if (!cited.has(it.id)) warns.push(`${it.id} unused — no journey designs for it`);
}

for (const e of errs) console.log(`  FAIL ${e}`);
for (const w of warns) console.log(`  warn ${w}`);
console.log(`\n${items.length} items · ${cited.size} cited · ${errs.length} errors · ${warns.length} warnings`);
process.exit(errs.length ? 1 : 0);
