---
type: Standard
title: Journeys
description: The discipline-1 artifact — what one is, how to write one, and the rules most often broken.
status: active
created: 2026-09-08
timestamp: 2026-09-15
related:
  - disciplines.md
  - lanes.md
  - index.md
---

# Journeys

**Every feature the product ever builds traces back to a written journey.**
Journeys drive screens, not the other way around.

Getting the **shape** right matters as much as the content — drift between
journeys is what makes them stop being a spec.

---

## 1 · What a journey is

A story about one named person doing one thing, in seven sections, in order:

**header** (actor · goal · what it covers · priority · why it matters) →
**the setup** → **the journey**, numbered beats with an emotional arc →
**where today breaks** → **what it should feel like** →
**touchpoints → seams** → **questions this raised**.

The touchpoints section carries the four columns in [lanes](lanes.md) §A,
including **the touchpoints this product does not own**. That column is where
CX stops being a phase nobody reaches.

The template belongs to your own design system, not here.

File name: `J-<group>-<nn>-<kebab-title>.md`.

## 2 · The voice rules, and they are non-negotiable

1. **Storytelling, always.** Named persona, present tense, real scene. Not a
   flowchart and not a feature list.
2. **Design the fix, not the past.** "The journey" describes the **redesigned**
   experience. What exists today belongs only in "Where today breaks".
3. **No implementation.** No code, component names, API shapes, field names,
   table names or stack choices. Experience terms only.
4. **A design file is reference, not truth.** Never justify a flow with
   *"the Figma shows it"*. Log every deliberate deviation.
5. **Never invent pain.** Draw from a written evidence pool of real known
   failures. **If a journey has no known existing pain, say so honestly.**
6. **Use the fixed personas.** Do not invent new ones.
7. **Neutral pronouns** for anyone whose pronouns are not established.
8. **Name the shared machinery honestly** — do not invent an abstraction to
   make it sound reusable.

## 3 · The evidence pool

Before writing any journeys, write down **the real, specific pain** — from
operating the previous build, from the reported bug list, from support. Then
every journey draws from that list.

This is the single mechanism that stops a journey set from being a wish list.
It is seeded at [discipline 0](disciplines.md) and refilled by
[discipline 6](disciplines.md) from the support loop. The pool behind this
method is twenty-one bullets, each one a thing that actually happened on a
product the author shipped: *cancel returns to Home instead of the previous page*; *a "shared
room" option leaked into a service it cannot apply to*; *the draft existed but
there was no "continue or start new?"*.

## 4 · The cross-cutting threads

These apply to **every** journey and no journey restates them:

draft and resume · typed errors with one surface · visible **and** enforced
min/max · navigation honesty · prices read, never authored · designed
empty/loading/offline states · guest→auth walls placed at the action and never
dead-ending.

## 5 · Reviewing one

Findings list, most severe first, in this order:

0. **Frontmatter.** `type: Journey`, plus id, title, group, actor, priority,
   covers, status, updated.
1. **Structure** — all seven sections, in order, with the header block.
2. **Voice** — storytelling, named persona, present tense, real scene.
3. **Contamination** — implementation detail, stack choice, a design file used
   as justification, an invented persona, invented pain.
4. **Standards** — walk every binding standard and name each one the journey
   silently violates.
5. **Decisions** — a journey that contradicts a decision record is wrong.
6. **Glossary** — flag every term used that is not the committed word.
7. **Coverage** — does the catalogue row exist and match?

**Report violations as findings; do not silently rewrite unless asked to fix.**

## 6 · Journeys are stable artifacts

Once written and reconciled, **reconcile with minimal changes; never churn or
re-scope them.** The same goes for the domain model. Both are things later work
is measured against, and a spec that moves is not a measurement.
