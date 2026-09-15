---
type: Guide
title: inspire — producing a direction brief
description: The procedure that turns the teardown library into three priced, traced, falsifiable directions instead of a mood board.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - originality.md
  - lanes.md
  - ../examples/index.md
  - disciplines.md
---

# inspire — producing a direction brief

Input: the journeys, your design system, and your teardown library.
Output: **one document, three directions.** Produced at disciplines 1–2,
approved as a decision record, honoured at discipline 5.

`teardown` writes facts. `inspire` makes choices. Keeping them apart is what
stops the library becoming a shelf nobody reads.

## Before starting

1. **Read the journeys, not the library.** A direction is a claim about *this*
   product. Opening the teardowns first produces a direction about the
   teardowns.
2. **Read your design system** for the rules a direction has to survive — token
   discipline, contrast floors, accent policy. A direction that violates them is
   not a bold choice, it is unbuildable.
3. **Then** query the library. `grep` the teardowns for the mechanism you need;
   do not re-read them all.

## The three directions

**Exactly three, and one of them is the quiet one.**

The quiet direction introduces **no new mechanism**: existing components,
existing tempo, the argument won on restraint and hierarchy alone. It is
mandatory because three novel directions is not a choice, it is a rigged
ballot — and because it wins more often than it is expected to.

Tear down one site whose answer to *"what moves?"* is *"almost nothing"* and
keep it in the library for exactly this purpose.

## What each direction must contain

| | |
|---|---|
| **Thesis** | One line. What this direction claims about the product. *"The maths is the product, so the numbers move and nothing else does."* |
| **Tempo · easing · stagger** | Three numbers, per [lanes](lanes.md) §B. Not adjectives |
| **Type** | Families, the scale, and what each step is for |
| **Colour** | The palette and **the accent policy** — where it is allowed, and where it is therefore banned |
| **One structural idea** | The thing that makes this direction itself. Exactly one |
| **Reduced motion** | What happens under `prefers-reduced-motion: reduce`. Not "TBD" |
| **Cost** | Dependencies and kb, accessibility work created, build days, and what it makes harder later |
| **Provenance** | The table below |
| **Inversion** | The opposite of the structural idea, and why it was rejected |
| **Kill condition** | What would make this direction wrong. If nothing could, it is not a direction, it is a preference |

### The provenance table

Every element, one row. This is where [originality](originality.md) §2 becomes
checkable rather than arguable.

| Element | Mechanism taken | Sources | Reason it transfers |
|---|---|---|---|
| 150ms stagger | staged group reveal at a fixed cadence | `rothfinder-com` (142/150ms), `cerebrium-ai` (183ms) | list-heavy content; groups of 3–5 throughout |
| word-first headline | accent word arrives before its sentence | `cerebrium-ai` | **fails — our headline has no load-bearing word.** Dropped |

**Two or more sources, or one product constraint.** A row with a single source
and no constraint is a lift and must be dropped or re-argued. Rows that failed
stay in the table — a provenance table with no rejections was not audited.

## Then run the gate

All four tests in [originality](originality.md), written down, per direction.
The subtraction pass last, and run it twice — the second pass is where
decoration is actually found.

## Choosing

Present all three. Recommend one, with the reason, and say what the
recommendation costs relative to the others. Then it becomes a decision record
with a date, and reopening it is a dated line in that record — not a new
conversation six weeks later.

## Do not

- **Do not produce a mood board.** Images without numbers cannot be built,
  reviewed, or falsified.
- **Do not propose a direction sourced from one site.** That is the failure the
  provenance table catches.
- **Do not skip the quiet direction** because the other two are more exciting.
  That is the reason it is mandatory.
- **Do not invent tokens here.** Directions name what your design system will
  need to add; it stays the owner.
- **Do not let a direction reach discipline 5 unapproved.** An unapproved brief
  is a suggestion, and suggestions lose to deadlines.
