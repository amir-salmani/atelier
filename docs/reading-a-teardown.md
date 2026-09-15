---
type: Guide
title: Reading a teardown
description: The order to read a packet in, the five numbers that carry most of the signal, and the ways a packet lies.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - running-a-teardown.md
  - ../examples/index.md
---

# Reading a teardown

Read the pictures first. `facts.json` is 30KB of true statements, and reading it
first means arguing from whatever happens to be countable rather than from what
the page does.

1. **`entrance-sheet.png`** — what happens in the first two seconds, which is
   the entire first impression.
2. **`scroll-sheet.png`** — the composition and its rhythm. Where the page
   changes key.
3. **`mobile-sheet.png`** — what survived, and what was quietly dropped.
4. **`motion.json` → `summary`** — five numbers, below.
5. **`facts.json`** — only now, to check a specific claim.

## The five numbers

| | Reads as |
|---|---|
| `summary.medianDurationMs` | The house tempo. 200–400ms is confident; under 150ms reads as instant; over 600ms starts costing the reader time |
| `summary.easingFamilies[0]` | Whether motion decelerates into place (confident) or accelerates out of it (nervous) |
| `staggers[].medianGapMs` | The cadence of a group reveal. 60–120ms reads as one gesture; over 200ms reads as a queue |
| `summary.medianTravelPx` | How far things move. Under 24px is a settle; over 80px is a journey and needs a reason |
| `reducedMotion.reducedMotionMediaBlocks` | Whether any of it was designed rather than decorated |

## How a packet lies

- **A blank frame is usually the tool, not the site.** Lazy images, a long
  preloader, or a screenshot that timed out. Check the neighbouring frames
  before concluding a section is empty.
- **`animatedTotal` counts rules, not motion.** A Tailwind site declares
  transitions on hundreds of utilities that never fire. The honest count of what
  *moved* is `motion.json → summary.revealCount`.
- **Easing names are shapes, not values.** See `running-a-teardown.md`.
- **A dismissed cookie gate is itself a finding.** `facts.json → gates` records
  what had to be clicked away. A newsletter modal over the hero is a design
  decision someone made, and it belongs in the teardown.
- **Cross-origin stylesheets are re-fetched and re-injected** to be readable. If
  `rehydrated.attempted > rehydrated.rehydrated`, some CSS was genuinely never
  seen and the rule counts are floors, not totals.
- **A site changes, and so does your own capture.** Every number is true of one
  capture on one date — including re-runs of the same page on the same machine.
  Rothfinder's entrance stagger measured 142, 150 and 155ms across three
  captures. Cite the retained one; mention the others as corroboration, never as
  the headline.
- **A site's stagger is not one number.** Podium has four groups at 151, 88, 177
  and 451ms. Read `motion.json → staggers` in full before quoting one.
- **The entrance clock runs slow.** The CPU pin throttles page load, so absolute
  timestamps on `entrance-sheet.png` are inflated against what a user sees — the
  same site measured 1.7s unpinned and 3.3s pinned to four cores. **Read order
  and proportion there, not wall-clock.** Durations in `motion.json` and
  `facts.json` are unaffected: CSS animation time is wall-clock, and declared
  durations come straight off the stylesheet. Use `--cores` to widen the pin if
  you need the entrance timeline itself to be realistic.

## Cite only what is retained

A packet is regenerable, which means **a re-run silently replaces the evidence a
published claim rests on.** This happened: a teardown here claimed a 142/150ms
stagger across two groups, and a later capture of the same page found one group
at 155ms. Nothing complained, and the figure had already propagated into a
synthesis, a README and a design brief.

So `teardown.mjs` writes **`evidence.json`** — the numbers a write-up is allowed
to cite, small enough to commit. Keep it in version control and let the frames,
sheets, video and raw samples stay disposable.

Declare what you cite, in the teardown's own frontmatter:

```yaml
capture:
  url: https://example.com/
  date: 2026-09-15
  medianDurationMs: 330
  staggerGapsMs: [155]
  reducedMotionBlocks: 0
```

Then the gate is mechanical:

```bash
node tools/reconcile.mjs <teardowns-dir>    # exits 1 on drift
```

Prose may say what it likes; the frontmatter is the contract. Break a number and
watch it fail before you believe a pass.

## Writing the authored half

One markdown file per site, kept wherever your library lives — **not** inside
the packet directory, which is generated and gets overwritten.
[`examples/rothfinder-com.md`](../examples/rothfinder-com.md) is the format.

The rule that makes the library worth having: **every claim cites its
artifact.** *"The hero holds for 900ms before anything readable appears
(`entrance-sheet.png`, frames 0000–0814ms)"* is a fact someone else can check.
*"The hero feels premium"* is not, and a library of those is a mood board.

Then say what you would **steal** and what you would **refuse**. A teardown with
no refusal in it was not read critically.
