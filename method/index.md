---
type: Index
title: Method — how a product is designed here
description: Seven gated disciplines, two cross-cutting lanes, and the gate that separates deciding from building.
status: active
created: 2026-09-15
timestamp: 2026-09-15
---

# Method

Stack-neutral and brand-neutral. Tokens, components and house look stay in your
own design system; this owns only the order the work happens in.

| | |
|---|---|
| [disciplines](disciplines.md) | **The seven stages, 0–6.** What closes each, and what is not allowed yet |
| [the-gate](the-gate.md) | **Design spec → approved → plan → approved → code.** The rule broken first and costing most |
| [lanes](lanes.md) | CX/marketing and surface craft — columns on existing artifacts, not stages you reach |
| [intake](intake.md) | **Getting the knowledge.** What to ask, what never to ask, and when to stop |
| [evidence](evidence.md) | **The pool.** What counts as pain, how it is marked, and the gate that keeps journeys tied to it |
| [journeys](journeys.md) | The discipline-1 artifact, its voice rules, and how to review one |
| [watching](watching.md) | **Where references come from**, which earn a capture, and the queue discipline |
| [type](type.md) | What a direction must decide about typography, judged from measured sites |
| [inspire](inspire.md) | Turning the teardown library into three priced, traced directions |
| [originality](originality.md) | **The gate on the library.** Mechanism may be taken; dressing never |

## The shape in one paragraph

Seven disciplines, each gated. **0** asks whether the thing should exist and
writes a thesis that can be proven wrong. **1–4** figure out what it does, what
the things are, how it is built and in what order — stack decided fourth, never
first. **5** builds, one unit at a time, spec before plan before code. **6** puts
it in front of people and reports whether 0 was right. Across all of them,
**two lanes**: the experience surface, which owns the touchpoints nobody owns,
and surface craft, which decides the look early so it is not invented under
deadline.

## Where this came from

Disciplines 1–5 and the gate come from building a real product with a real
domain, and are unchanged by being published.

**0, 6, the lanes, `inspire` and `originality` are newer.** They close three
gaps the original five had: nothing asked whether the product deserved to
exist, nothing survived launch day, and nothing said where taste comes from or
how it avoids being someone else's.

## Two halves, one failure mode

**Product knowledge** — [intake](intake.md) → [evidence](evidence.md) →
[journeys](journeys.md). **Design reference** — [watching](watching.md) → a
teardown library → [inspire](inspire.md) → a direction brief, with
[type](type.md) as the part most often left to taste.

Both exist to stop the same thing: *a claim drifting away from what it was based
on.* So both are gated the same way. A journey may only cite pain retained in
the pool (`evidence-lint.mjs`); a direction may only cite numbers retained in a
teardown's evidence (`reconcile.mjs`). Neither gate is about tidiness — each one
caught a real published claim that had stopped being true.

## The order these are read in

Not all of them. For a new product: [disciplines](disciplines.md), then the
stage you are actually at. Before any journey exists:
[intake](intake.md). For a screen or a component: [the-gate](the-gate.md). For a
visual direction: [inspire](inspire.md), then [originality](originality.md)
before proposing anything.
