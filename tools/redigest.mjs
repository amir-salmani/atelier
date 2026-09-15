#!/usr/bin/env node
// Re-cut motion.json from a packet's stored raw sample. Use after changing the
// thresholds in analyze.mjs — no browser, no network, seconds instead of minutes.
//
//   node tools/redigest.mjs [slug ...]     (no args: every packet)
//
// Reads the same packet directory teardown.mjs writes: $ATELIER_TEARDOWNS,
// else ./teardowns/_packet.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import { digestSampler } from './analyze.mjs';

const PACKETS = path.resolve(process.env.ATELIER_TEARDOWNS || 'teardowns/_packet');
const args = process.argv.slice(2);
const slugs = args.length ? args : await readdir(PACKETS).catch(() => []);
if (!slugs.length) { console.error(`no packets in ${PACKETS}`); process.exit(1); }

for (const slug of slugs) {
  const raw = path.join(PACKETS, slug, 'sampler.json.gz');
  const sampler = await readFile(raw).then(b => JSON.parse(gunzipSync(b))).catch(() => null);
  if (!sampler) { console.log(`  · ${slug}: no sampler.json.gz — re-run the teardown`); continue; }
  const motion = digestSampler(sampler);
  await writeFile(path.join(PACKETS, slug, 'motion.json'), JSON.stringify(motion, null, 2));
  const s = motion.summary;
  console.log(`  · ${slug}: ${s.revealCount} reveals, median ${s.medianDurationMs}ms, ${motion.staggers.length} staggers (rejected ${JSON.stringify(s.rejected)})`);
}
