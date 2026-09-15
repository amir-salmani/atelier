---
name: teardown
description: "Study a live website the way it actually behaves — entrance motion, scroll choreography, easing curves and durations, hover micro-interaction, the mobile composition, reduced-motion honesty, Core Web Vitals and metadata — by driving a real browser and reading the result. Use whenever asked to learn from, study, analyse, reverse-engineer or get inspired by a site or a competitor's page, when asked how a site does a particular animation or transition, when a design reference is a URL rather than a screenshot, and on any mention of teardown, motion study, or a design reference library."
---

# teardown — learning from a live site

A screenshot cannot show motion, and motion is most of what makes a good site
good. This skill exists because the alternative — describing a page from a
static image — produces confident nonsense about timing.

## Run it

```bash
node tools/teardown.mjs https://example.com
```

From the repository root — `../../tools/` relative to this file. First run needs
`npm install && npx playwright install chromium` there.

Four to eight minutes. Writes `./teardowns/_packet/<slug>/` and nothing outside
it. `--out DIR` or `$ATELIER_TEARDOWNS` moves that; `--webgl` enables canvas
rendering (slow — see `docs/running-a-teardown.md`); `--cores N` widens the CPU
pin.

**Run one at a time.** It pins itself to a quarter of the cores under `nice`
because Chromium sizes its rasteriser pool to the core count and will otherwise
take the machine down.

**Then read `../../docs/reading-a-teardown.md`** — the order to read a packet
in, the five numbers, and the ways a packet lies. It is the authority and this
file does not restate it.

Look at the contact sheets **before** opening any JSON. Reading `facts.json`
first means arguing from whatever happens to be countable rather than from what
the page does.

## Writing it up

One markdown file per site; `../../examples/rothfinder-com.md` is the format.
The packet is regenerable, the write-up is not.

1. **Every claim cites its artifact** — a frame and its timestamp, a CSS rule, a
   measured duration.
2. **Declare what you cite** in a `capture:` block and run
   `node tools/reconcile.mjs <dir>`. A re-run replaces the evidence a published
   claim rests on; this is the only thing that catches it.
3. **Name a refusal.** A teardown with no refusal in it was not read critically.

## The line

**Learn the mechanism, never lift the dressing.** A teardown library makes
copying easy, which is why the rule is a gate — `../../method/originality.md`,
four tests, each of which can fail.

## Do not

- **Do not describe motion from a static screenshot.** Run the tool, or say you
  have not.
- **Do not trust a packet full of zeros.** A bot wall, a crashed render, a
  WebGL-off canvas and a 429 all produce one. The runner names each; read what
  it printed.
- **Do not compare a sampled duration with a declared one.** Sampled medians
  measure an opacity band and run ~20% short.
- **Do not report the packet's CWV as a performance verdict.** One lab run, one
  machine.
- **Do not hand-edit anything under `_packet/`** except nothing — it is
  generated, and `evidence.json` is written by the tool.
- **Do not run it against a site you are not allowed to load**, and never at
  anything behind someone else's authentication. Run one site at a time; a tight
  retry loop rate-limited one site out of this library for a whole session.

## The family

`atelier` is the master — the method this feeds. `inspire` is the other leaf: it
turns a library into three priced directions, and is the only place a reference
is allowed to become a plan. A teardown on its own never is.
