---
type: Guide
title: Running a teardown
description: The tool, its flags, what each artifact is, and the four things it cannot see.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - reading-a-teardown.md
  - ../examples/index.md
---

# Running a teardown

```bash
node tools/teardown.mjs https://example.com [--slug name] [--steps 16]
                        [--out DIR] [--webgl] [--cores N] [--no-video]
```

Four to eight minutes per site. Everything lands in `<out>/<slug>/` and nothing
is written outside it — `<out>` is `--out`, else `$ATELIER_TEARDOWNS`, else
`./teardowns/_packet` relative to where you ran it.

**It pins itself.** The runner re-execs under `taskset -c 0-N nice -n 15` and
Chromium's child processes inherit both. This is not politeness — Chromium sizes
its rasteriser pool to the core count, and the first version of this tool put an
18-core laptop at load 12 with sixteen GPU processes at 60–80% each. Pinned to
four cores it runs at load ~4, with total Chromium CPU measured between 0.4
and 1.0 cores.
`--cores N` widens it if you are on a machine that can take it.

**WebGL is off by default** (`--webgl` turns it on). Software-rasterising a
shader hero is what cost the 15x. Without it a canvas hero captures as blank and
`facts.json → webglRendered: false` records that it was not attempted — an
honest gap rather than a silent one.

Run one at a time.

First run:

```bash
npm install
npx playwright install chromium     # ~170MB, once
```

If you already have Playwright browsers cached, check which Chromium revision
your version wants (`node -p "require('playwright-core/browsers.json').browsers.find(b=>b.name==='chromium').revision"`)
against `~/.cache/ms-playwright` — matching them avoids the download entirely.

## The three passes

**Desktop, 1440×900.** Loads, dismisses cookie and newsletter gates, records
what it had to dismiss, then reloads with a rAF sampler armed before first paint
and burst-captures the entrance. Then scrolls in overlapping steps so
IntersectionObserver reveals actually fire, hovers the first real calls to
action, and reads the stylesheets.

**Mobile, 390×844, iPhone 14 profile with touch.** Not a narrower desktop — the
question is what the composition *became*. Taps the burger, measures tap targets
under 44px, checks horizontal overflow.

**`prefers-reduced-motion: reduce`.** Counts the media blocks that actually
exist and the animations still running under them. Most sites score zero. That
number is the single fastest read on whether motion was designed or decorated.

## What lands in the packet

| Artifact | What it answers |
|---|---|
| `entrance-sheet.png` | Up to 20 labelled frames over the first ~1.8s. The preloader, the stagger order, the count-ups |
| `scroll-sheet.png` | The whole page as labelled frames with scroll positions. Composition, pinned sections, rhythm |
| `mobile-sheet.png` | What changed at 390px |
| `hero.png` · `mobile-hero.png` · `reduced-motion-hero.png` | Full-resolution single frames for reading type and colour |
| `video/*.webm` | The actual recording. **For Amir to watch** — an agent reads the sheets |
| `motion.json` | Per-element reveal: start, duration, travel, inferred easing family, and the stagger gaps between siblings |
| `facts.json` | Keyframes, transitions, the easing and duration histograms, the site's own custom properties, stack fingerprint, type and colour census, CWV, meta and JSON-LD, hover deltas |
| `sampler.json.gz` | The raw per-frame sample. `node tools/redigest.mjs [slug]` re-cuts `motion.json` from it after a threshold change — no browser, no re-run |

## When a packet is not a measurement

Three failures return HTTP 200 and a complete-looking packet full of zeros,
which reads exactly like *"this site has no motion"*. The runner names all three
rather than letting them pass:

| Printed | What happened | What to do |
|---|---|---|
| `!! LOOKS BLOCKED` | A bot wall. Cloudflare's *"Attention Required!"*, a Webflow CDN 403, a captcha | `--proxy socks5://host:port`, or run from another network |
| `!! RENDER FAILED` · *error text* | The stylesheet loaded, the page crashed. CSS histograms are real; every frame, reveal and hover is not | Retry; if it persists the site needs a browser feature you disabled |
| `!! RENDER FAILED` · *WebGL* | The whole page is a canvas and rendering was off | Re-run with `--webgl` |

`facts.json` carries `blocked` and `renderFailed` so a packet can be re-checked
later without re-reading the console. A block verdict needs either block-page
text in the title or two corroborating signals — a lone third-party 403 is a
dead analytics beacon, not a wall.

And one that is not a failure but reads like one:

- **`page.scrollHost`** is `document`, `element`, `wheel` or `none`. An app shell
  scrolls an inner element; a scroll-hijacking library translates a wrapper and
  leaves the document exactly one viewport tall. Both would otherwise report
  *"1 screen, 0 reveals"* on a page full of them. The runner finds the real
  scroller and falls back to dispatching wheel events, which drive all three.

## What it cannot see

1. **Canvas and WebGL.** A shader hero yields frames and a fingerprint, never a
   rule.

   `--webgl` renders the canvas through SwiftShader, which is enough for a
   mostly-DOM page with a canvas in it. **It is not enough for a site that *is*
   a canvas.** A 39-screen WebGL experience produced one frame in eight minutes
   at four pinned cores, because every screenshot exceeded its timeout.

   There is no headless fix. Measured on a Wayland session: the bundled headless
   shell, full Chromium with `--use-gl=egl --enable-gpu`, the system Chrome, and
   headed Chromium under `xvfb-run` **all four** report
   `ANGLE (… SwiftShader driver)`. Hardware GL needs a real display session and
   `headless: false` on it. Treat a canvas-only site as out of scope unless you
   are willing to run a visible browser.

2. **JavaScript-driven motion.** GSAP writes inline styles; it never appears in
   `@keyframes` or a `transition` declaration. On a GSAP page `facts.json → css`
   describes only the CSS layer, and the sampler catches JS motion only if it
   fires inside the capture window. Check `stack.globals` for `gsap`, `Lenis`,
   `barba` or `Swup` before reading a low `animatedTotal` as restraint.
2. **Exact easing.** `motion.json` names the nearest of ten standard curves and
   reports its fit error. A named `expo.out` means *shaped like* expo.out. The
   stylesheet's literal `cubic-bezier()` in `facts.json` is the exact number,
   when one exists.
4. **Anything behind auth**, and plenty that block headless Chromium — see
   above.
5. **Real performance.** CWV here is one lab run on one machine over one
   network. It ranks sites against each other; it is not a field number. For a
   real audit use the `web-perf` skill.

Sites under heavy software-rasterised WebGL starve the sampler, so its frame
rate drops and easing classification degrades to `too-few-samples`. That is
reported rather than guessed at.

Two filters keep the summary honest, and both report what they dropped in
`motion.json → summary`: a reveal longer than 2500ms was scrolled to, not
animated (`rejected.tooSlow`), and a group whose members all start on the same
frame is one animation on several boxes, not a stagger (`simultaneousGroups`).

Each pass is independent — a failed mobile pass still leaves a desktop packet —
and navigation retries three times before giving up.
