---
type: Standard
title: Type
description: "What a direction must decide about typography, judged from what eleven measured sites actually do — families, the scale, tracking by size, and the sans/mono split."
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - inspire.md
  - originality.md
  - index.md
---

# Type

Everything here is drawn from what a teardown library measured, not from taste.
A `facts.json → surface.type` census gives family, size, line-height, weight and
tracking for the most-used styles on a page, so these are countable claims.

**The house look is your design system's, not this file's.** This says what a
direction has to *decide* and how to tell whether it decided well.

## One family, or two with different jobs

Across eleven sites: **four run a single family** (Instrument Sans, Arco Century
Gothic, Suisseintl, MaisonNeue in three cuts). **Four run two** — a text face
and a mono. **One runs seven**, and it is the weakest type story in the library.

The rule that makes two cohere: **sans is what a human wrote, mono is what a
machine would emit.** Mono then carries — and only carries — labels, indices,
keys, status, source lines and button text. Prose is never mono; metadata is
never sans.

It is not decoration. On one site the single most-used style on the whole page
is 13px mono at −0.325px tracking: the labels outnumber the prose, and the type
system says so.

**A third family needs a job no existing family can do** — a pixel display face,
a script for one signature. Six families is not a system.

## The scale

Pick the number of steps deliberately; both ends work.

- **Flat.** One site carries a 16-screen page on essentially two sizes, 14px and
  18px, with hierarchy from position and space. It is the calmest page measured.
- **Wide.** Another runs 57.6 / 40 / 18.4 / 16 / 13.6 / 11.2 / 10.4px — seven
  steps, each with a job.

What fails is the middle: steps close enough to be indistinguishable to a reader
but distinguishable to whoever typed them. If two sizes are within ~15% and do
different jobs, they are one size and a mistake.

**Small type is legitimate.** Two sites run labels at 8–12px mono deliberately,
and it reads as technical register rather than as an accident — but only in mono,
only for metadata, and never for anything a reader must not miss.

## Tracking is size-specific

A single `letter-spacing` value is wrong somewhere.

| | Measured |
|---|---|
| **Display** | negative, near-universally: −0.038em, −0.48px at 48px, −1.82px at 72px, −0.8px at 33px |
| **Body** | usually `normal` |
| **Body, positive** | rare and deliberate: one site sets +0.72px at 18px on a geometric sans, which needs the air |
| **Mono labels** | positive and wide: +0.14em to +0.18em, uppercase |

The pattern: **tighten as it gets bigger, open it up as it gets smaller.** The
counter-move — positive tracking on a geometric face at body size — is a choice
someone made and can be defended.

## Line height

Display sits near 1.0 (a 57.6px headline at 57.6px leading, on one site
exactly). Body sits at 1.5–1.7. Mono labels sit at 1.0–1.15 because they are one
line by definition.

Leading below 1.0 on display is a decision to let ascenders and descenders
touch, and it fails the moment a headline wraps to three lines on a phone.

## Licensing is a check, not a preference

**Two of eleven sites ship a trial licence** — `ABC Favorit Trial` and
`Aeonik TRIAL`, both on the body face, sitewide. It is visible in
`surface.fonts` and it takes one glance.

Check your own before launch. It is the cheapest failure on this list to avoid
and the most expensive to be caught at.

## Non-Latin, and RTL

None of the eleven sites is non-Latin, so **this library has no evidence here**
and the following is a constraint list rather than a finding:

- **Persian and Arabic need more leading** than a Latin face at the same size —
  diacritics and descenders occupy space Latin does not.
- **There is no uppercase.** Every hierarchy device that leans on caps — the
  uppercase mono label, the small-caps eyebrow — has no equivalent and must be
  replaced by weight, size, rule or colour.
- **Digits are a decision**, not a default: Persian `۰۱۲۳` or Latin `0123`, and
  the answer may differ between prose and financial contexts.
- **ZWNJ** (نیم‌فاصله) is a real character with real width. A face that renders
  it badly is unusable regardless of how it looks otherwise.
- **Mirror, do not flip.** Directional motion and layout mirror; glyphs and
  logos do not.

Do not carry a Latin scale across unchanged. Verify at the real size on the real
device before committing — the same discipline every other claim here gets.

## What a direction must commit to

Per [inspire](inspire.md), and all of it checkable:

1. **The families, and each one's job.** If you cannot name a job, remove it.
2. **The scale** — every step, with what it is for.
3. **Tracking per step**, not one value.
4. **The licence** for every family.
5. **What happens at 390px**, where the display step usually breaks first.
