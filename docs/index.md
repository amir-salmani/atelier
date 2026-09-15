---
type: Index
title: atelier
description: A product design method, and a tool that reads motion off live sites. Three Claude Code skills — atelier, teardown, inspire.
status: active
created: 2026-09-15
timestamp: 2026-09-15
tags: [design, ux, motion, product, playwright, skills]
related:
  - ../README.md
  - ../method/index.md
  - running-a-teardown.md
  - reading-a-teardown.md
project:
  id: atelier
  owner: amir
  kind: tool
  lifecycle: active
  visibility: public
  hosting: github
  toolchain: node
---

# atelier — docs

[`../README.md`](../README.md) is the front door. These are the two documents
that matter once you are actually running it.

| | |
|---|---|
| [running-a-teardown](running-a-teardown.md) | The tool, its flags, every artifact, and the four things it cannot see |
| [reading-a-teardown](reading-a-teardown.md) | The order to read a packet in, the five numbers, and the ways a packet lies |

## The gates

```bash
node tools/selftest.mjs                              # 18 assertions, no browser
node tools/reconcile.mjs <teardowns-dir>             # cited numbers vs retained evidence
node tools/evidence-lint.mjs <pool.md> [journeys]    # the pool, and journeys drawing from it
```

Each exists because something was already wrong: a published stagger figure a
re-run had quietly invalidated, and a sampled duration compared against a
declared one as though they were the same measurement. `selftest` found the
second by measuring a synthetic 300ms fade and getting 256.

The method is in [`../method/`](../method/index.md); a worked teardown is in
[`../examples/`](../examples/index.md).

## The private half

This repository is the public half of a pair. The teardown *library* — the
authored write-ups this method argues from — is deliberately not here:
`examples/` holds exactly one, to show the format. Build your own.
