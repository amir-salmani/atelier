---
type: Guide
title: Watching — where references come from, and which ones earn a capture
description: "Where good work surfaces, how to pick the few worth six minutes of machine time, and the queue discipline that stops the library becoming a shelf nobody reads."
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - inspire.md
  - originality.md
  - ../docs/running-a-teardown.md
  - index.md
---

# Watching

A teardown costs four to eight minutes of machine time and about half an hour of
writing. **That price is the whole reason this document exists** — it is low
enough to be worth paying often and high enough that picking badly wastes an
afternoon.

## Where work surfaces

No single source is good. Each has a bias, and knowing the bias is most of the
skill.

| | Biased toward | Use it for |
|---|---|---|
| **Awwwards · FWA** | Spectacle. WebGL, long scroll, heavy motion | Finding the outer edge of what is being attempted |
| **Godly · SiteInspire** | Editorial restraint, agency work | The quiet end. Where the argument for *less* comes from |
| **Land-book · Lapa · SaaS Landing Page** | Conversion-shaped B2B pages | Structural patterns for a page that has to sell something |
| **Httpster · One Page Love** | Small, odd, independent | Ideas that have not been sanded down yet |
| **Mobbin · Page Flows** | Product interiors, real flows | The part marketing galleries never show — the app after signup |
| **Your competitors' actual sites** | Nothing. That is the point | What your buyer has already seen and now expects |
| **The footer of a site you liked** | The agency that made it | Their other work, which is usually better than the award entry |

That last row is the most productive and the least used. A site you admire was
built by someone with a portfolio.

**Award galleries systematically over-represent spectacle**, because spectacle
is what wins awards. If the shelf is built only from them it will have no
argument for restraint — which happened here, and cost a re-shoot to fix.

## Which ones earn a capture

Four reasons. A candidate needs at least one.

1. **You cannot explain how it does something.** The strongest reason. If you
   can already describe the mechanism, a capture only confirms it.
2. **It is in the genre you are about to build.** A devtool page teaches more
   about a devtool page than a beautiful restaurant site does.
3. **It disagrees with your shelf.** If every site you have measured answers
   *"what moves?"* with *"a lot"*, the next one should answer *"almost
   nothing"* — otherwise [inspire](inspire.md) cannot source the quiet direction
   it requires, and every brief is rigged.
4. **It fails interestingly.** A site that is slow, or inaccessible, or gates
   its first two seconds, is evidence too — and it is the evidence people skip
   because it is not aspirational.

## Which ones do not

- **"It looks nice."** Not a reason. It is the reason that fills a shelf.
- **A site whose whole surface is a canvas**, unless you can run a real display
  session. It will capture blank —
  [running-a-teardown](../docs/running-a-teardown.md) has the measurements.
- **Anything behind a login.**
- **A fifth site in a genre you already have four of.** Diminishing returns are
  steep; the fourth site in a category rarely changes a finding.

## Queue discipline

- **Keep the queue under about ten.** A longer one is a wish list.
- **Date every entry with why it is there.** *"cofounder.co — illustrated game
  world on a B2B tool, 2026-09"*. An undated entry with no reason is the first
  thing to delete.
- **Delete anything that has sat for a month.** If it was not worth six minutes
  in a month, it will not be.
- **One site at a time, and never the same site twice in quick succession.** A
  tight retry loop rate-limited one site out of this library for an entire
  session.
- **Re-capture deliberately, not casually.** A re-run replaces the evidence a
  published claim rests on. Run `reconcile.mjs` afterwards, always.

## The failure this is guarding against

**A reference library nobody reads.** It is the likeliest outcome, it looks
exactly like a working library from the outside, and the symptom is specific:
[inspire](inspire.md) starts producing directions sourced from the same two or
three sites every time.

If that happens the answer is not more captures. It is captures chosen against
reason 3 — something that disagrees with what is already on the shelf.
