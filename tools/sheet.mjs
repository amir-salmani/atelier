// Contact sheets, rendered in Chromium rather than ffmpeg. Playwright ships a
// stripped ffmpeg with no tile filter and no mjpeg encoder, and an HTML grid
// labels each frame anyway — which is the whole point of a contact sheet.

import { readdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function buildSheet(browser, dir, outPath, { cols = 4, width = 380, title = '', label = f => f } = {}) {
  const files = (await readdir(dir).catch(() => [])).filter(f => f.endsWith('.png')).sort();
  if (!files.length) return false;

  const cells = files.map(f => `
    <figure><img src="./${encodeURIComponent(f)}">
    <figcaption>${label(f)}</figcaption></figure>`).join('');

  // Written into the frames directory and opened over file:// — a setContent
  // page has an opaque origin and silently refuses to load local images.
  const html = path.join(dir, '_sheet.html');
  await writeFile(html, `<!doctype html><meta charset=utf-8><style>
    body{margin:14px;background:#111;color:#bbb;font:12px/1.4 ui-monospace,monospace}
    h1{font-size:13px;color:#fff;font-weight:600;margin:0 0 12px}
    .grid{display:grid;grid-template-columns:repeat(${cols},${width}px);gap:14px}
    figure{margin:0}
    img{width:${width}px;display:block;border:1px solid #2a2a2a;background:#000}
    figcaption{padding:4px 2px;color:#7a7a7a;font-size:11px}
  </style><h1>${title}</h1><div class=grid>${cells}</div>`);

  const page = await browser.newPage({ viewport: { width: cols * (width + 14) + 28, height: 800 } });
  await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  await page.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
  await rm(html, { force: true });
  return true;
}

// Rapid viewport screenshots — the only way to read an entrance animation's
// shape, since it is over before any settle() would return.
//
// Sequential, not concurrent: a WebGL page under software rasterisation takes
// seconds per frame, and queued shots there thrash rather than sample. The
// filename carries the real elapsed time, so an uneven cadence still reads.
export async function burst(page, dir, { frames = 20, everyMs = 90, budgetMs = 9000 } = {}) {
  const t0 = Date.now();
  let taken = 0;
  for (let i = 0; i < frames; i++) {
    const t = Date.now() - t0;
    if (t > budgetMs) break;
    const ok = await page.screenshot({
      path: path.join(dir, `b-${String(i).padStart(2, '0')}-t${String(t).padStart(5, '0')}ms.png`),
      timeout: 6000, animations: 'allow', caret: 'initial',
    }).then(() => true, () => false);
    if (ok) taken++;
    const spent = Date.now() - t0 - t;
    if (spent < everyMs) await new Promise(r => setTimeout(r, everyMs - spent));
  }
  return taken;
}
