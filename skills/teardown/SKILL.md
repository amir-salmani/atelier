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

## Then look at the sheets

`entrance-sheet.png`, `scroll-sheet.png`, `mobile-sheet.png` — **read the images
before opening any JSON.** They are labelled contact sheets; reading `facts.json`
first means arguing from whatever happens to be countable rather than from what
the page does. The order and the reasons are in `docs/reading-a-teardown.md`.

Then `motion.json → summary`: five numbers that carry most of the signal.

## Then write the authored half

One markdown file per site. The packet is regenerable evidence; the write-up is
the only part worth keeping. `examples/rothfinder-com.md` is the format.

1. **Every claim cites its artifact** — a frame and its timestamp, a CSS rule, a
   measured duration. A sentence with no artifact behind it is a mood board.
2. **Evidence apart from conclusions.** What the page does, then what you infer.
3. **Name a refusal.** What you would *not* copy, and why. A teardown with no
   refusal in it was not read critically.
4. **Reproducible numbers over adjectives.** `320ms, decelerating, 90ms stagger`
   beats "snappy".

## The line

**Learn the mechanism, never lift the dressing.** Timing, easing, the *idea* of
a pinned section — fair. A layout, a headline structure, an identity — not.
A teardown library makes copying easy, which is why the rule is a gate:
`method/originality.md`, four tests, each of which can fail.

## Do not

- **Do not describe motion from a static screenshot.** Run the tool, or say you
  have not.
- **Do not claim an exact easing from `motion.json`.** It names the nearest of
  ten standard curves and reports the fit error. The literal `cubic-bezier()` in
  `facts.json` is the exact value, when the site has one.
- **Do not report the packet's CWV as a performance verdict.** One lab run, one
  machine. It ranks sites against each other; it is not a field measurement.
- **Do not hand-edit anything under `_packet/`.** It is generated and will be
  overwritten.
- **Do not conclude a section is empty from one blank frame** — lazy images and
  timed-out screenshots look identical to nothing being there.
- **Do not run it against a site you are not allowed to load**, and do not point
  it at anything behind someone else's authentication.

## The family

`atelier` is the master — the method this feeds. `inspire` is the other leaf: it
turns a library into three priced directions, and is the only place a reference
is allowed to become a plan. A teardown on its own never is.
