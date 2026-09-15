# Contributing

## What this repo wants

**Extraction that is true, and honest about what it cannot see.** The teardown
runner is only worth anything if a number in `facts.json` can be trusted. Three
bugs during its first week each returned silent zeros — a sampler that installed
before `body` existed, cross-origin stylesheets that were opaque, and CSS
nesting giving `CSSStyleRule` a `.cssRules` so every style rule recursed instead
of collecting. **A silent zero is worse than a crash**, so:

- If a probe can fail partially, it reports what it dropped. `motion.json`
  carries `rejected` and `simultaneousGroups`; `facts.json` carries
  `rehydrated.attempted` vs `rehydrated.rehydrated` and `webglRendered`.
- New extraction lands with a check that it returns non-zero on a site that
  definitely has the thing, **and zero on one that definitely does not.**
- Prove it in its failing direction first. "It passed" is never on its own good
  news.

## Good contributions

- **Probes.** Scroll-scrubbed (as opposed to triggered) animation; view
  transitions; `@starting-style`; scroll-driven animations timelines; focus-visible
  states; dark-mode delta.
- **Easing classification.** The current classifier fits four probe points
  against ten standard curves. Spring fitting, and `linear()` support, are
  both genuinely missing.
- **Reduced-motion depth.** Right now it counts media blocks and running
  animations. What it should do is diff the two renderings.
- **Method documents**, if you have run the thing and it taught you something.

## Not wanted

- **A "make it look like X" command.** The whole point of
  [`method/originality.md`](method/originality.md) is that this is the failure
  mode, not the feature.
- **Bundled site teardowns.** The library you build is yours. `examples/` holds
  exactly one, to show the format.
- **Anything that loads a page you are not allowed to load**, or that touches
  authentication.

## Running it

```bash
npm install
npx playwright install chromium
node tools/teardown.mjs https://example.com
node tools/redigest.mjs            # re-cut motion.json without a re-run
```

`tools/redigest.mjs` is the fast loop: change a threshold in `analyze.mjs` and
re-cut every stored packet in seconds, no browser.

**Never remove the CPU pin without measuring.** Chromium sizes its rasteriser
pool to the core count; unpinned with software GL this put an 18-core laptop at
load 12 with sixteen GPU processes. If you change the launch flags, report
`uptime` and summed Chromium `%CPU` before and after.

## Style

Comments record the constraint, not the story of the bug that revealed it. One
line beats five. Say the thing and stop.

## Licence

MIT. By contributing you agree your work ships under it.
