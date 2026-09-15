---
type: Standard
title: The two lanes
description: CX/marketing and surface craft are views over every discipline, not stages you reach. What each one adds to an artifact that already exists.
status: active
created: 2026-09-15
timestamp: 2026-09-15
related:
  - disciplines.md
  - journeys.md
  - inspire.md
---

# The two lanes

A discipline is a stage with an exit. A lane is a **column added to artifacts
that already exist**. Making CX or marketing into stage 8 and stage 9 is how
they end up being done last, badly, by whoever is free.

---

## Lane A · The experience surface — CX and marketing

**Runs through disciplines 0, 1, 5 and 6.** It is a lane and not a stage
because there is no point at which "the customer experience" gets designed: it
is the sum of every touchpoint, and most touchpoints already have an owner.

### What it adds to a journey

A journey already ends in **touchpoints → seams**. The lane widens that section
to four columns:

| Touchpoint | Owned? | The words there | If it fails |
|---|---|---|---|
| The pricing page | yes | *written here, in discipline 1* | — |
| The receipt email | **no** — provider template | usually nobody's | customer emails support |
| Password reset | **no** | provider default | silent churn |
| The cancellation flow | yes | usually written in a hurry | the only honest NPS you will get |
| A status page in an incident | **no** | nobody's | the trust event that outlives the outage |

**The unowned column is the lane's entire reason to exist.** Owned touchpoints
get designed because they are on a screen someone is building. The provider
default receipt, the reset mail, the app-store description, the invoice PDF and
the support macro are the ones that quietly define the product for a customer
having a bad day.

### Marketing voice is a discipline-1 artifact

The sentence that sells the product and the sentence on the empty state are the
same voice or the product has two personalities. Writing marketing at launch
means writing it against a product that already exists — which is why launch
copy so often describes features rather than the change the journeys promised.

**The glossary binds marketing too.** If the journeys committed to a word, the
landing page uses that word.

### What discipline 6 owes this lane

Walk every unowned touchpoint, in production, as a customer. Not a review of
the copy — an actual purchase, an actual reset, an actual cancellation. It takes
an afternoon and it is the highest-yield afternoon in the calendar.

---

## Lane B · Surface craft — UI and motion

**Runs through disciplines 1–2 and 5.** Produced early, honoured late.

The failure this lane exists to prevent: **visual direction invented at
discipline 5, under deadline, from whatever reference was open that week.** That
is how a product ends up looking like the last site its builder admired.

- **Produced at disciplines 1–2**, as a direction brief from
  [inspire](inspire.md) — three named directions, each priced, each traced.
  Early enough to be argued about, late enough that the journeys can constrain
  it.
- **Approved once, as a decision record.** Reopening it is a dated line in that
  record.
- **Honoured at discipline 5.** The brief is a constraint on the build, on the
  same footing as the domain model.
- **Tokens and components live in your own design system**, never here. This
  carries the method and the library; the house look is yours.

### The three numbers a brief must commit to

Because *"the motion should feel confident"* cannot be built or reviewed:

1. **Tempo** — a median transition duration, in ms.
2. **Easing** — one named curve, and where the exceptions are allowed.
3. **Stagger** — one constant, in ms, applied to every staged group.

Measured sites support this being decidable rather than felt. In the worked
example shipped with this repo, one site's stagger comes out at 142ms and 150ms
in two independent groups; another declares `0.15s` twelve times and `0.25s`
nine times. Neither is a mood. Both are a token.

### The reduced-motion rule

A direction that has not said what it does under `prefers-reduced-motion` is not
finished. Very few of the sites worth learning from handle it at all — which
makes it the cheapest thing on this list to be better at.
