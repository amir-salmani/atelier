---
type: Index
title: Examples
description: One worked teardown, showing the format and the standard of evidence.
status: active
created: 2026-09-15
timestamp: 2026-09-15
---

# Examples

| | |
|---|---|
| [rothfinder-com](rothfinder-com.md) | The format: every claim citing a frame, a rule, or a measured duration |

Reproduce it:

```bash
node tools/teardown.mjs https://rothfinder.com/
```

You will not get identical numbers. Sites change, and a lab capture varies with
machine and network — which is the reason a teardown records *when* it was taken
and treats its own performance figures as a ranking rather than a verdict.

## These are studies, not reviews

A teardown names what a site does well and what it does badly, because a study
with no refusal in it was not read critically
([originality](../method/originality.md) §4). That is a note to the person
learning, not a judgement published at the site's expense.

The rule that matters when you build your own library:
[**mechanism may be taken, dressing never**](../method/originality.md).
