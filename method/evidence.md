---
type: Standard
title: The evidence pool
description: The artifact that stops a journey set being a wish list — what counts as evidence, how it is marked, and the gate that keeps journeys tied to it.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - journeys.md
  - intake.md
  - disciplines.md
  - index.md
---

# The evidence pool

**Written before any journey. Refilled for as long as the product runs.**

[journeys](journeys.md) says *never invent pain*. This is the file that makes
that checkable rather than aspirational: a journey may only draw from here, and
a pool item may only exist if something actually happened.

Symmetry worth naming: a teardown may only cite numbers retained in its
`evidence.json`, checked by `reconcile.mjs`. A journey may only cite pain
retained here, checked by `evidence-lint.mjs`. **Both halves of this method have
the same failure mode — a claim drifting away from the thing it was based on.**

## What an item is

One thing that happened, to someone, that you can point at.

```markdown
## E-07 · The draft existed but there was no "continue or start new?"
- source: operating the previous build
- date: 2026-03-14
- confidence: confirmed
- seen: 3 times, two of them by the owner
- journeys: J-svc-01, J-svc-04
```

| Field | |
|---|---|
| `E-nn` | Stable id. Journeys cite it. **Never renumber** — it is the identity |
| `source` | Where it came from. Named, not a category |
| `date` | When it was observed. An undated observation rots silently |
| `confidence` | `confirmed` · `reported` · `unverified` — the same vocabulary the rest of this machine's knowledge uses |
| `seen` | How often, and by whom. Once is a data point; five times is a pattern |
| `journeys` | Which journeys draw on it. Filled in as they are written |

## What counts, ranked by what it costs to get

1. **Operating the thing yourself.** The cheapest and the most trusted. Almost
   every item in a first pool comes from here.
2. **The support inbox and the bug list.** Free, already written, and almost
   always unharvested. [Discipline 6](disciplines.md) exists partly to make this
   a standing input rather than an archaeology project.
3. **Watching one person use it**, without helping. Expensive in nerve, not in
   time.
4. **Asking about a specific past event** — *"tell me about the last time you
   had to cancel one"*. See [intake](intake.md) for why the question has to be
   about the past.
5. **Analytics.** Tells you *where*, never *why*. An item sourced only from a
   funnel is `unverified` until something else corroborates it.

## What does not count

- **A feature request.** *"I want bulk export"* is a proposed solution, not a
  pain. The item is whatever made them want it, and you usually have to ask.
- **A competitor having something.** That is a fact about a competitor.
- **What someone says they would do.** Only what they did.
- **Your own annoyance, undated and unshared.** Write it down with a date and a
  source like everything else, or leave it out.
- **Anything a teardown produced.** The design library measures *how a page
  behaves*. It is evidence about technique, never about a user's pain — keeping
  those apart is the whole reason they are separate bundles.

## The gate

```bash
node tools/evidence-lint.mjs <pool.md> [journeys-dir]
```

Checks that every item has an id, a source, a date and a confidence from the
vocabulary; that ids are unique and not renumbered; that every journey's pain
cites a real id; and it reports **unused items** — pain nobody designed for,
which is usually the most interesting output of the whole exercise.

Exits non-zero on a structural failure. Unused items are a warning, not an
error: some pain is genuinely out of scope, and the point is that the decision
is visible.

## The honest part

A first pool of 20 items is good. A first pool of 60 is either a long-running
product or a wish list wearing a schema.

If a product genuinely has no known pain — a new wedge, nothing shipped — **say
so in the pool file rather than inventing items**. An empty pool with a dated
note explaining why is a true artifact. A full one built from imagination is
not, and every journey downstream inherits the lie.
