---
type: Standard
title: The seven disciplines
description: The order a product is figured out in, what closes each stage, and why the stack is decided fourth rather than first.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - the-gate.md
  - journeys.md
  - lanes.md
  - index.md
---

# The seven disciplines

Each is **gated**: nothing downstream starts until the artifact is reviewed and
approved. No code is written until discipline 5 produces an approved plan.

Offered as the default for a new product, not as a law — a five-page marketing
site does not need seven disciplines. **A product with a domain does.**

Disciplines 1–5 are the shape a real product was built in and are unchanged.
**0 and 6 were added because the original five assumed the product deserved to
exist and stopped caring the day it shipped.** Both assumptions cost money.

---

## 0 · The wedge
**Should this exist, and for whom, and why now?**

The stage the original five skipped. Everything downstream is execution; this is
the only discipline that can save you from executing well on the wrong thing.

Five questions, answered in writing with sources:

1. **Who, specifically.** Not a segment — a person with a job and a budget.
2. **What breaks for them today**, with evidence that it breaks. This seeds the
   journeys' evidence pool ([journeys](journeys.md) §3) and is the same
   discipline: never invent pain.
3. **What they do instead right now.** Every product competes with a
   spreadsheet, a WhatsApp group, or nothing. Name the incumbent honestly.
4. **Where the money is** — who pays, how much, how often, and what it costs to
   serve them. A rough number beats no number; an absent number is the tell.
5. **Why now.** What changed. If nothing changed, the window is a guess.

**Exit:** a one-page thesis with **a falsifiable claim and a kill condition**.
*"Advisors will pay $499/mo to close Roth cases faster; if fewer than 1 in 20
trials convert by month three, this is wrong"* is a thesis. *"There is a large
market for advisor tools"* is a hope.

The kill condition is not pessimism. It is the only thing that makes
discipline 6 able to report an answer.

## 1 · Journeys and product spec
**What should this product do, and why?**

Storytelling-first. Every feature traces to a written journey with a real
persona, an emotional arc, and evidence of where today breaks.
[journeys](journeys.md) is the full artifact contract.

Artifacts: the journeys, the decision records, the standards, the glossary, the
open-questions register — and, from [lanes](lanes.md), **the touchpoint map and
the words that go on each touchpoint**. Marketing voice is written here, not at
launch.

**Exit:** the journey catalogue is complete, the open questions are answered,
and the stories are agreed to be right.

## 2 · Domain model
**What are the real things, rules and lifecycles?**

Derived from the journeys, **using the glossary's words exactly**. Every state a
journey mentions exists here; every state here appears in some journey.

Special attention to the parts that bite: **the full auth state machine**, the
pricing contract, and unit discipline at every boundary.

**Exit:** no journey step is unrepresentable, and there are no orphan states.
Publish an honest coverage scorecard naming the gaps.

## 3 · Architecture, seams and stack
**How is it built, and where do the seams go?**

**The stack is decided here, deliberately, after the requirements are known —
never before.** Record what was rejected and why; that record is what stops the
question being reopened every quarter.

**Every seam is justified by a specific failure**, never by speculative reuse.
YAGNI is the guardrail.

**Exit:** every journey's needs map onto a named module with a stated purpose,
interface and dependencies — and no module exists that no journey reaches.

## 4 · Decomposition and sequencing
**In what order does one person build it?**

**Depth-first on one flow, breadth afterwards.** Taken literally,
"foundations-first" means building all of identity, then all of pricing, then
discovering at the end that they do not fit. "Thin-slice-first" means a demo
that hides what is not there. So each foundation is built only as deep as the
first complete flow needs, that flow is proven end to end against real provider
sandboxes, and only then does it widen.

Two sequencing choices worth copying:

- **Build account deletion early.** Deleting an account with four entity types
  is a morning; with thirty it is a project nobody schedules. Building it early
  forces every later unit to declare its own disposal.
- **Build the hard business line first**, even if the easy one would ship
  sooner, when the hard one exercises more of the system.

**Exit:** an ordered backlog where each item is independently valuable and
testable.

## 5 · Per-unit spec → plan → build
**What exactly am I building right now?**

[the-gate](the-gate.md). The direction brief from [inspire](inspire.md) is
honoured here — it is a constraint on the build, not a suggestion, and it was
agreed two disciplines ago precisely so it is not being invented under deadline.

## 6 · Contact and aftercare
**What actually happened, and was the thesis right?**

The stage where the product meets people who did not build it. It is a
discipline and not a phase because it produces an artifact someone has to
approve.

- **Onboarding in the wild**, watched rather than imagined. Where the first
  session stalls is rarely where the journey predicted.
- **The support loop closes into the evidence pool.** Every reported failure is
  a line item for the next round of journeys. A support inbox nobody harvests is
  a research budget being thrown away.
- **Pricing meets reality.** The number from discipline 0 versus what people do.
- **The unowned touchpoints get walked** — receipt, password reset, the
  cancellation mail, the status page during an incident. [lanes](lanes.md) §A.

**Exit:** the discipline-0 thesis is **confirmed or falsified in writing, with
numbers**, and the kill condition is evaluated out loud. Then one of: continue,
change the wedge, or stop.

---

## Reporting where you are

Keep a **current position table** with a date, and corroborate it against
reality rather than trusting it. When asked "where are we", the useful answer is
three things: **the position, the evidence for it, and the exit criteria still
outstanding** — then **one** next step, and who owns it.

Not a backlog. One next step. If it is the owner's, say so plainly rather than
filling the gap with speculative work.

## Judging whether a piece of work is allowed yet

- **Below the gate** — code, schema, API shape, stack choice while still in
  disciplines 0–3. Say so, and name the artifact that should be written instead.
- **At the gate** — proceed.
- **Above the gate** — redoing settled upstream work. Check it is not
  relitigating a standing decision.

*"That's discipline 3 work and we're in discipline 1 — here's the journey
artifact that has to exist first"* is more useful than hedging.

The failure mode this map is newest at catching: **jumping from a reference
straight to discipline 5.** A site you liked is not a reason to build. It enters
at [inspire](inspire.md), as one of three priced directions, and it passes
[originality](originality.md) before it is allowed to be a constraint.
