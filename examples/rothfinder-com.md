---
type: Teardown
title: rothfinder.com
description: A 1.7s branded preloader, a ~145ms stagger cadence, and hand-drawn connector lines used as the page's spine — over an accessibility and weight story that undoes much of it.
status: active
created: 2026-09-15
timestamp: 2026-09-15
tags: [b2b-saas, scroll-choreography, preloader, illustration]
related:
  - index.md
  - ../docs/reading-a-teardown.md
---

# rothfinder.com

> **This is a worked example of the teardown format, not a review.** Every
> number is one lab capture from one machine on one date; a site changes. The
> point is what a teardown looks like when every claim cites an artifact.
>
> The entrance timings below are from an unpinned capture. Re-running with the
> default CPU pin stretches them to ~3.3s — load-gated time inflates, the
> sequence does not. See [reading a teardown](../docs/reading-a-teardown.md).

Financial-advisor SaaS. Captured 2026-09-15, desktop 1440×900. Framer-adjacent build on Tailwind utilities, DatoCMS
images, no detectable animation library — the motion is hand-written CSS.

## Evidence

### The entrance — 1.7s, and it earns it

`entrance-sheet.png`, twenty frames at 90ms:

| | |
|---|---|
| 0–361ms | Flat lavender. Nothing readable |
| 452–814ms | A small mark scales up at dead centre |
| 905–1085ms | It resolves into the `ROTHFINDER` wordmark, still centred |
| 1175ms | The wordmark travels to its nav position; the page fades up beneath it |
| 1265ms | The headline arrives **word by word**, visibly out of sequence |
| 1355ms+ | Scribble shapes settle; the money figure counts $1,041,000 → $2,082,000 |

The per-word arrival is confirmed in the sample, not just the frames: the
tracked element is literally `div.word` (`motion.json`, reveal 6) with a 1049ms
span over the whole line.

### The numbers

From `motion.json → summary` (12 reveals, 2 rejected as too slow to be
animation):

- **Median duration 337ms**, range 45–1067ms.
- **Easing: `ease-out`**, 6 of 12, and the fit is tight — error 0.025–0.036.
  Eight of twelve reveals are front-loaded. Nothing accelerates out.
- **Travel 42px** on the hero group; later sections fade with no movement at
  all (`medianTravelPx: 0`).
- **Stagger ~145ms**, and this is the find: two groups, at scrollY 787 and
  scrollY 3815, independently measure 142ms and 150ms. That is a dialled-in
  house cadence, not a default.

Declared in CSS (`facts.json → css`): 764 rules, 14 carrying transitions,
4 keyframes, durations clustering at `0.3s` (5×) and `0.75s` (3×).

Two keyframes worth naming:

- `radiate` — `scale(1) opacity:1` → `scale(2) opacity:0`, 3000ms linear,
  running six times on `div.angie-shape`. The halo pulsing behind the AI
  persona's portrait.
- `underlineOff` — `scaleX(1) → 0 → 0 → 1` with the two zero stops 0.1% apart.
  A link underline that wipes out and back in from the other side on hover.
  Three keyframe stops to buy a direction change; cheap and good.

### Surface

- **One typeface, four cuts.** HelveticaNeueLTPro Roman/Medium/Bold/BoldExtended.
  Scale: 57.6px display, 40px section, 18.4px, 16px body, 13.6px, 11.2px, 10.4px.
- **Six colours carry the page.** Black, white, green `#3AB91A` (every CTA),
  cream `#FBF7EF`, periwinkle `#899BFF` and `#E8EBFF`. One accent, used once per
  screen — the discipline the designbook asks for, met.
- **19.2 screens of scroll.** The section at scrollY 4096–6144 pins while
  coloured cards move horizontally past it (`scroll-sheet.png`, frames 4–6).
- **Mobile drops the pinned scroller** for a vertical stack of numbered colour
  blocks (`mobile-sheet.png`). The connector line survives; the choreography
  does not.

### Where it fails

- **Reduced motion: zero.** No `prefers-reduced-motion` block anywhere, and six
  animations still running under `reduce`. The 1.7s preloader plays in full for
  a user who asked for none.
- **21 of 45 images have no `alt`. None are lazy-loaded.**
- **22 tap targets under 44px** at 390×844.
- **LCP 4380ms desktop / 2476ms mobile, 5.2MB over 48 requests** — 4.3MB of it
  `fetch`, not images. Whatever is behind that number is the actual problem.
- **No JSON-LD**, despite being a page whose entire job is being found.
- **Hover is `0.3s linear`** on colour, background, opacity and border. After
  building a whole page on tight `ease-out`, every button is linear. This reads
  as the one thing nobody went back to.

## What I would take

1. **The ~145ms stagger, verified across two independent groups.** A cadence
   that measures the same in two places is a decision. Adopt a single stagger
   constant rather than per-section taste.
2. **A preloader that does work.** The mark→wordmark→nav-position move means the
   1.7s is spent establishing the identity and parking it where it will live,
   not spinning. If a loading screen must exist, this is the argument for it —
   and `governorsmansion.org` is the other one in the queue.
3. **`underlineOff`.** Three keyframe stops to make an underline wipe out and
   return from the opposite side. One rule, no JavaScript.
4. **Per-word headline reveal at 1049ms total.** Slow enough to read as
   deliberate, and the words land out of sequence rather than left to right.
5. **One accent colour spent only on CTAs.** The green appears nowhere else.

## What I would refuse

- **The 1.7s gate itself, unconditionally.** With no reduced-motion escape and
  no repeat-visit skip, it is a toll on every visit. Take the *idea*; put it
  behind `prefers-reduced-motion` and a session flag.
- **Linear hover transitions.** The page's own `ease-out` is right there.
- **The scroll length.** 19.2 screens for one product argument. The mobile
  version proves the pinned section was not load-bearing — if choreography can
  be dropped entirely at 390px, it was decoration at 1440px too.
- **Shipping 4.3MB of `fetch`** to render a marketing page.
