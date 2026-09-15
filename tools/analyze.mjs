// Turns the raw rAF sampler dump into the two numbers a designer actually
// wants: how each element reveals, and how much delay sits between siblings.

// Cubic bezier as CSS defines it: solve x(t)=p for t, return y(t).
const bezier = (x1, y1, x2, y2) => {
  const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = a => 3 * a;
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return p => {
    if (x1 === y1 && x2 === y2) return p;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      t -= (calc(t, x1, x2) - p) / s;
    }
    return calc(t, y1, y2);
  };
};

const CURVES = {
  'linear': [0, 0, 1, 1],
  'ease': [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  'power2.out / quart-ish out': [0.165, 0.84, 0.44, 1],
  'expo.out (very front-loaded)': [0.19, 1, 0.22, 1],
  'back.out (overshoots)': [0.175, 0.885, 0.32, 1.275],
  'material standard': [0.4, 0, 0.2, 1],
  'material decelerate': [0, 0, 0.2, 1],
};

// Compare an observed progress curve against the standard library at four
// probe points. Close enough to name the family; not a claim of exactness.
export function classifyEasing(samples) {
  if (samples.length < 5) return { name: 'too-few-samples', error: null };
  const probes = [0.2, 0.4, 0.6, 0.8];
  const at = p => {
    const i = Math.min(Math.round(p * (samples.length - 1)), samples.length - 1);
    return samples[i];
  };
  const observed = probes.map(at);
  let best = null;
  for (const [name, c] of Object.entries(CURVES)) {
    const f = bezier(...c);
    const err = Math.sqrt(probes.reduce((s, p, i) => s + (f(p) - observed[i]) ** 2, 0) / probes.length);
    if (!best || err < best.error) best = { name, error: +err.toFixed(3), control: c };
  }
  // A curve that starts fast and ends slow is a decelerate regardless of fit.
  best.shape = observed[0] > 0.3 ? 'decelerate (front-loaded)'
    : observed[3] < 0.7 ? 'accelerate (back-loaded)' : 'symmetric';
  return best;
}

// A reveal is an animation. An element that sat at opacity 0 for a minute and
// then appeared was scrolled to, not animated — counting it drags every summary
// number toward nonsense.
const MAX_REVEAL_MS = 2500;

export function digestSampler({ series }) {
  const entries = Object.entries(series || {});
  if (!entries.length) return { reveals: [], staggers: [], summary: {}, note: 'sampler captured nothing' };
  const reveals = [];
  const rejected = { tooSlow: 0, tooFast: 0 };
  const keep = r => {
    if (r.durationMs > MAX_REVEAL_MS) { rejected.tooSlow++; return; }
    if (r.durationMs < 24) { rejected.tooFast++; return; }
    reveals.push(r);
  };

  for (const [el, rows] of entries) {
    const S = rows.map(r => ({ t: r[0], y: r[1], op: r[2], tx: r[3], ty: r[4], sx: r[5] }));

    // Opacity reveal: last frame still hidden → first frame fully shown.
    let lo = -1, hi = -1;
    for (let k = 0; k < S.length; k++) {
      if (S[k].op <= 0.12) lo = k;
      else if (lo !== -1 && S[k].op >= 0.92) { hi = k; break; }
    }
    if (hi !== -1) {
      const seg = S.slice(lo, hi + 1);
      const span = (seg.at(-1).op - seg[0].op) || 1;
      keep({
        el, kind: seg[0].ty === seg.at(-1).ty ? 'fade' : 'fade + move',
        startMs: seg[0].t, durationMs: seg.at(-1).t - seg[0].t, atScrollY: seg[0].y,
        travelPx: Math.round(seg[0].ty - seg.at(-1).ty),
        scaleFrom: seg[0].sx !== 1 ? seg[0].sx : undefined,
        easing: classifyEasing(seg.map(s => (s.op - seg[0].op) / span)),
      });
      continue;
    }

    // No fade. A pure transform move still counts as a reveal.
    const tys = S.map(s => s.ty);
    const moved = Math.max(...tys) - Math.min(...tys);
    if (moved <= 12) continue;
    const start = S.findIndex(s => Math.abs(s.ty - tys[0]) > 2);
    if (start < 0) continue;
    const end = S.findIndex((s, k) => k > start && Math.abs(s.ty - tys.at(-1)) < 2);
    if (end <= start) continue;
    const seg = S.slice(start, end + 1);
    const span = (seg.at(-1).ty - seg[0].ty) || 1;
    keep({
      el, kind: 'transform-only',
      startMs: seg[0].t, durationMs: seg.at(-1).t - seg[0].t, atScrollY: seg[0].y,
      travelPx: Math.round(-span),
      easing: classifyEasing(seg.map(s => (s.ty - seg[0].ty) / span)),
    });
  }

  // Elements revealing within 700ms of each other are one staged group; the
  // median gap between them is the stagger the designer actually dialled in.
  const sorted = [...reveals].sort((a, b) => a.startMs - b.startMs);
  const staggers = [];
  let group = [];
  let simultaneous = 0;
  const flush = () => {
    if (group.length >= 3) {
      const gaps = group.slice(1).map((r, k) => r.startMs - group[k].startMs).sort((a, b) => a - b);
      const median = gaps[Math.floor(gaps.length / 2)];
      // Same-frame starts are one animation on several boxes, not a stagger.
      if (median >= 16) {
        staggers.push({
          members: group.length, atScrollY: group[0].atScrollY,
          medianGapMs: median, spanMs: group.at(-1).startMs - group[0].startMs,
          els: group.map(r => r.el).slice(0, 8),
        });
      } else simultaneous++;
    }
    group = [];
  };
  for (const r of sorted) {
    if (group.length && r.startMs - group.at(-1).startMs > 700) flush();
    group.push(r);
  }
  flush();

  const durs = reveals.map(r => r.durationMs).sort((a, b) => a - b);
  const tally = f => Object.entries(reveals.reduce((a, r) => (a[f(r)] = (a[f(r)] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]);
  return {
    tracked: entries.length,
    reveals: sorted, staggers,
    summary: {
      revealCount: reveals.length,
      rejected, simultaneousGroups: simultaneous,
      medianDurationMs: durs[Math.floor(durs.length / 2)] ?? null,
      durationRangeMs: durs.length ? [durs[0], durs.at(-1)] : null,
      medianTravelPx: reveals.length ? [...reveals].map(r => r.travelPx).sort((a, b) => a - b)[Math.floor(reveals.length / 2)] : null,
      easingFamilies: tally(r => r.easing.name),
      shapes: tally(r => r.easing.shape),
      kinds: tally(r => r.kind),
    },
  };
}
