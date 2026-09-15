---
name: atelier
description: "The method for designing a product or a service — seven gated disciplines from the wedge to aftercare, with journeys, user stories, UX, CX, marketing voice, visual direction and feasibility carried as lanes across them rather than as stages nobody reaches. Use when starting a new product or service, when asked what to do next or where a project stands, when judging whether a piece of work is allowed yet, when writing or reviewing a journey, a design spec or an implementation plan, and on any mention of the atelier, the disciplines, the gate, the wedge, the direction brief, or designing a product end to end."
---

# atelier — the method

**Read `method/index.md`** — the map, and the one-paragraph shape. Then read
only the document for the stage actually in play. Never read the whole method.

**`method/` sits two directories above this file** — `../../method/` — which
holds whether this is a plugin install, a clone, or a symlink into
`~/.claude/skills/`. If it does not resolve, ask where the atelier method lives
rather than guessing at the content.

Stack-neutral and brand-neutral. Tokens, components and house look belong to the
project's own design system; this owns only the order the work happens in.

## The family

| | |
|---|---|
| **atelier** | this — the method, the gate, routing |
| `teardown` | learn: measure what a live site actually does, file it in a library |
| `inspire` | choose: turn that library into three priced, traced directions |

## Route before answering

| They are asking | Read |
|---|---|
| Should this exist? Is it worth building? | `method/disciplines.md` §0 |
| How do I find out? What do I ask? | `method/intake.md` |
| What do we actually know, and how do we know it? | `method/evidence.md` |
| What should it do? Who for? | `method/journeys.md` |
| What are the real things and states? | `method/disciplines.md` §2 |
| What stack? Where are the seams? | `method/disciplines.md` §3 — and check it is allowed yet |
| What do I build first? | `method/disciplines.md` §4 |
| Can I start coding this? | `method/the-gate.md` |
| Which sites should I even look at? | `method/watching.md` |
| What typeface? What scale? | `method/type.md` |
| What should it look like? How should it move? | `inspire` skill, then `method/originality.md` |
| Emails, support, pricing page, cancellation, launch copy | `method/lanes.md` §A |
| Did it work? | `method/disciplines.md` §6 |

## Two halves, one failure mode

**Product knowledge** — intake → evidence pool → journeys.
**Design reference** — watching → a teardown library → inspire → a direction
brief.

Both exist to stop a claim drifting from what it was based on, so both are
gated. A journey may only cite pain retained in the pool
(`tools/evidence-lint.mjs`); a direction may only cite numbers retained in a
teardown's evidence (`tools/reconcile.mjs`). Each gate caught a real published
claim that had stopped being true.

## The four things this skill exists to stop

1. **Building before deciding.** Design spec → approved → plan → approved →
   code. A spec approved after the code is a document, not a decision.
2. **Executing well on the wrong thing.** Discipline 0 wants a falsifiable
   thesis *with a kill condition* before anything downstream starts.
3. **CX and marketing arriving last.** They are lanes, not stages — columns on
   journeys that already exist. The unowned touchpoints (receipt, reset mail,
   invoice, cancellation, status page) are the whole point.
4. **Visual direction invented at build time from whatever reference was open.**
   The direction brief is produced at disciplines 1–2 and honoured at 5.

## Say where things stand, honestly

Three things: **the position, the evidence for it, and the exit criteria still
outstanding.** Then **one** next step, and who owns it. Not a backlog. If the
next step is the user's, say so rather than filling the gap with speculative
work.

When work is out of order, name it: *"that's discipline 3 work and we're in
discipline 1 — here's the journey artifact that has to exist first."* More
useful than hedging.

## Do not

- **Do not skip discipline 0** because the product is obviously good. That is
  what everyone thinks at discipline 0.
- **Do not invent pain.** Journeys draw from a written evidence pool of things
  that actually happened, and the gate checks it. If there is no known pain, say
  so in the pool with a date — an honest empty pool beats an imagined full one.
- **Do not take a feature request as evidence.** The item is whatever made them
  ask for it, and you usually have to go back and find out.
- **Do not put implementation in a journey** — no component names, API shapes,
  field names or stack choices. Experience terms only.
- **Do not let a reference become a plan.** A site the user admired enters at
  `inspire`, as one of three directions, and passes `method/originality.md`
  first.
- **Do not apply seven disciplines to a five-page marketing site.** The method
  is for a product with a domain. Say when it is overkill.
- **Do not reopen a settled decision in conversation.** It is a dated line in
  the decision record or it did not happen.
