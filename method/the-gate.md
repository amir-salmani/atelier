---
type: Standard
title: The gate
description: Design spec approved before the plan; plan approved before code. And what a spec has to contain to be one.
status: active
created: 2026-09-08
timestamp: 2026-09-15
related:
  - disciplines.md
  - index.md
---

# The gate

> **Design spec → approved → implementation plan → approved → code.
> Never the other order.**

**A spec approved after the code is written is a document, not a decision.**

## 1 · The one permitted flex

Where a slice spans several units, **one spec covering all of them is fine** —
six spec-plan-code cycles for a single vertical slice is ceremony, not a gate.
Say so in the spec when you do it.

## 2 · What a design spec contains

Short. It is a decision, not a design document. The reference-quality ones run
to two pages and have four parts:

1. **What the journey demands, and how each demand becomes a thing** — a
   two-column table, the journey's own words on the left, the built object on
   the right. This is the part that stops a spec from being a feature list.
2. **The decisions that bind it**, cited. Where a design file contradicts a
   decision record, **the decision wins and the deviation is listed**, never
   applied silently.
3. **What is deliberately not in it**, and why.
4. **The acceptance test — written to be run failing first.** Numbered,
   concrete, at the level a person can observe: *"`K1P 2X4`, `k1p2x4` and `K1P`
   all find Centretown, Ottawa — never a suburb away."* Not *"search works."*

The template belongs to your own design system, not here — this document says
what a spec must contain, not what file it lives in.

## 3 · What an implementation plan adds

The order, the files, the migrations, and **what proves each step**. If a step
has no proof, it is not a step — it is a hope.

## 4 · The deliverable is a working app

**Every unit ships with its screens.** An endpoint proven by an acceptance
script is half a unit.

Two questions before anything is marked done:

1. **Who taps this, on which screen?**
2. **Who signs in as the other side, and with what code?**

## 5 · And do not restyle

New screens follow the existing kit, the written journeys and **the approved
direction brief** ([inspire](inspire.md)) — not a new look, and not whatever
reference was open this week. The design language is the token file; a redesign
is its own spec.

## 6 · When the gate is genuinely wrong

It happens: a defect found mid-build changes what the right thing is. **Amend
the spec, date the amendment, and carry on.** Do not build past a spec you know
is wrong and reconcile afterwards — that is the failure mode the gate exists to
prevent, wearing a hat.
