---
type: Evidence
title: Evidence pool — worked example
description: Five items in the format the linter checks, showing what an item is and what it is not.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - ../method/evidence.md
  - ../method/intake.md
---

# Evidence pool — worked example

Five items, in the shape [`method/evidence.md`](../method/evidence.md) specifies.
Run the gate over it:

```bash
node tools/evidence-lint.mjs examples/evidence-pool.md examples/journeys
```

Every item names a source, a date and a confidence, and every one is something
that **happened** — note that none of them is phrased as a feature request. The
linter warns on that specifically, because *"owner wants bulk export"* is a
proposed solution and `E-03` is the pain underneath it.

## E-01 · Cancel returns to Home instead of the previous page
- source: operating the previous build
- date: 2026-03-14
- confidence: confirmed
- seen: 4 times

## E-02 · The draft existed but there was no "continue or start new?"
- source: support inbox
- date: 2026-04
- confidence: reported

## E-03 · Re-keyed last month's orders into a spreadsheet by hand
- source: interview, shop owner, Tehran
- date: 2026-04-22
- confidence: confirmed
- seen: every month end

## E-04 · Two staff issued the same invoice number in one afternoon
- source: the bug list
- date: 2026-02-09
- confidence: confirmed

## E-05 · Nobody designs for this one
- source: watching one person
- date: 2026-05-02
- confidence: confirmed
