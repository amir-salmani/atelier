// In-page probes. Exported as strings so they can be passed to page.evaluate
// without a bundler. Each returns plain JSON.

export const collectCss = () => {
  const out = {
    keyframes: [], animated: [], easings: {}, durations: {},
    crossOriginSheets: 0, rulesSeen: 0, customProps: {},
  };
  const bump = (bag, k) => { if (k) bag[k] = (bag[k] || 0) + 1; };

  // CSS nesting gave CSSStyleRule a .cssRules of its own, so a rule must be
  // collected *and* recursed into — an else-if here silently collects nothing.
  const walk = (rules, href) => {
    for (const r of rules) {
      try {
        if (r.constructor.name === 'CSSKeyframesRule') {
          const steps = [...r.cssRules].map(k => ({
            offset: k.keyText,
            transform: k.style.transform || undefined,
            opacity: k.style.opacity || undefined,
            filter: k.style.filter || undefined,
          }));
          out.keyframes.push({ name: r.name, steps, sheet: href });
          continue;
        }
        if (r.style) {
          out.rulesSeen++;
          const s = r.style;
          const tr = s.transition || s.transitionProperty;
          const an = s.animation || s.animationName;
          if (tr || an) {
            out.animated.push({
              selector: (r.selectorText || '').slice(0, 160),
              transition: s.transition || undefined,
              animation: s.animation || undefined,
              willChange: s.willChange || undefined,
              sheet: href,
            });
          }
          const timing = `${s.transitionTimingFunction || ''} ${s.animationTimingFunction || ''}`;
          for (const m of timing.matchAll(/cubic-bezier\([^)]+\)|linear\([^)]+\)|steps\([^)]+\)|ease-in-out|ease-out|ease-in|ease|linear/g)) bump(out.easings, m[0]);
          for (const m of `${s.transitionDuration || ''} ${s.animationDuration || ''}`.matchAll(/[\d.]+m?s/g)) bump(out.durations, m[0]);
        }
        if (r.cssRules) walk(r.cssRules, href);
      } catch { /* one bad rule must not kill the pass */ }
    }
  };

  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules, sheet.href ? new URL(sheet.href).pathname : 'inline'); }
    catch { out.crossOriginSheets++; }
  }

  // Custom properties actually resolved on :root — the site's own token layer.
  const rootStyle = getComputedStyle(document.documentElement);
  for (const name of rootStyle) {
    if (name.startsWith('--')) {
      const v = rootStyle.getPropertyValue(name).trim();
      if (v && v.length < 120) out.customProps[name] = v;
    }
  }
  out.animatedTotal = out.animated.length;
  out.animated = out.animated.slice(0, 120);
  return out;
};

export const collectLive = () => {
  // WAAPI + running CSS animations: the timings the browser is really using,
  // after the cascade has resolved. This is the number to trust over the stylesheet.
  const anims = document.getAnimations().map(a => {
    const t = a.effect?.getTiming?.() || {};
    const target = a.effect?.target;
    return {
      id: a.animationName || a.id || '(waapi)',
      duration: t.duration, delay: t.delay, easing: t.easing,
      iterations: t.iterations, fill: t.fill, direction: t.direction,
      playState: a.playState,
      target: target ? `${target.tagName?.toLowerCase()}${target.className && typeof target.className === 'string' ? '.' + target.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`.slice(0, 80) : null,
    };
  });
  return anims.slice(0, 200);
};

export const fingerprint = () => {
  const has = k => { try { return typeof window[k] !== 'undefined'; } catch { return false; } };
  const scripts = [...document.scripts].map(s => s.src).filter(Boolean);
  const blob = scripts.join(' ');
  const hit = re => re.test(blob);
  return {
    globals: {
      gsap: has('gsap'), ScrollTrigger: has('ScrollTrigger'), Lenis: has('Lenis'),
      THREE: has('THREE'), Rive: has('rive'), lottie: has('lottie'),
      barba: has('barba'), Swup: has('swup'), Alpine: has('Alpine'),
      React: has('React'), __NEXT_DATA__: has('__NEXT_DATA__'), __NUXT__: has('__NUXT__'),
      Webflow: has('Webflow'), Shopify: has('Shopify'), wp: has('wp'),
    },
    fromBundle: {
      framerMotion: hit(/framer-motion|motion\.dev|\bmotion@/i),
      gsap: hit(/gsap|greensock/i),
      lenis: hit(/lenis|studio-freight/i),
      three: hit(/three(\.min)?\.js|three@|@react-three/i),
      lottie: hit(/lottie/i),
      splitting: hit(/split-?(type|text)|splitting/i),
      swiper: hit(/swiper/i),
      locomotive: hit(/locomotive/i),
      tailwind: !!document.querySelector('[class*="text-"][class*="bg-"]') || hit(/tailwind/i),
    },
    canvases: [...document.querySelectorAll('canvas')].map(c => ({
      w: c.width, h: c.height,
      webgl: (() => { try { return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return 'in-use'; } })(),
      cls: (c.className || '').toString().slice(0, 60),
    })),
    videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc || v.src, autoplay: v.autoplay, loop: v.loop, muted: v.muted })),
    scriptCount: scripts.length,
  };
};

export const collectSurface = () => {
  const type = {}, colours = {}, radii = {}, shadows = {};
  const bump = (bag, k) => { if (k && k !== 'none' && k !== 'rgba(0, 0, 0, 0)') bag[k] = (bag[k] || 0) + 1; };
  const els = [...document.querySelectorAll('body *')].slice(0, 4000);
  for (const el of els) {
    const cs = getComputedStyle(el);
    const txt = el.textContent?.trim();
    if (txt && el.children.length === 0 && txt.length > 1) {
      bump(type, `${cs.fontSize} / ${cs.lineHeight} / ${cs.fontWeight} / ${cs.letterSpacing} / ${cs.fontFamily.split(',')[0].replace(/["']/g, '')}`);
      bump(colours, cs.color);
    }
    bump(colours, cs.backgroundColor);
    bump(radii, cs.borderRadius);
    bump(shadows, cs.boxShadow.slice(0, 90));
  }
  const top = (bag, n) => Object.entries(bag).sort((a, b) => b[1] - a[1]).slice(0, n);

  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
    .filter(Boolean).map(o => Array.isArray(o) ? o.map(x => x['@type']) : o['@type']);

  const meta = {};
  for (const m of document.querySelectorAll('meta[name], meta[property]')) {
    const k = m.getAttribute('name') || m.getAttribute('property');
    if (/description|og:|twitter:|viewport|theme-color|robots/i.test(k)) meta[k] = (m.content || '').slice(0, 200);
  }

  const headings = [...document.querySelectorAll('h1,h2,h3')].slice(0, 40)
    .map(h => ({ level: h.tagName, text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 110) }));

  const sections = [...(document.querySelector('main') || document.body).children]
    .map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 50), height: Math.round(r.height) };
    })
    .filter(s => s.height > 40);

  return {
    title: document.title,
    lang: document.documentElement.lang,
    type: top(type, 14), colours: top(colours, 16), radii: top(radii, 6), shadows: top(shadows, 5),
    fonts: [...new Set([...document.fonts].map(f => `${f.family} ${f.weight} ${f.style}`))].slice(0, 20),
    meta, jsonld, headings, sections,
    imgTotal: document.images.length,
    imgNoAlt: [...document.images].filter(i => !i.alt).length,
    imgLazy: [...document.images].filter(i => i.loading === 'lazy').length,
    buttonsNoName: [...document.querySelectorAll('button,a')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.title).length,
    focusableCount: document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])').length,
    docHeight: document.documentElement.scrollHeight,
  };
};

// Installs a rAF sampler that records the reveal curve of every element that
// looks like it animates. This is the part a screenshot cannot give you.
// Safe to run as an init script: it waits for a body, and keeps rescanning for
// six seconds so client-rendered nodes are not missed.
export const installSampler = () => {
  if (window.__td) return -1;
  const S = window.__td = { t0: performance.now(), series: new Map(), stop: false, scans: 0 };

  const key = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`.slice(0, 70);

  const scan = () => {
    S.scans++;
    if (!document.body) return;
    for (const el of [...document.querySelectorAll('body *')].slice(0, 3000)) {
      if (S.series.has(el)) continue;
      if (S.series.size >= 90) break;
      const cs = getComputedStyle(el);
      const moves = (cs.transitionDuration && cs.transitionDuration !== '0s')
        || (cs.animationName && cs.animationName !== 'none')
        || parseFloat(cs.opacity) < 1
        || (cs.transform && cs.transform !== 'none')
        || el.getAnimations?.().length > 0;
      if (!moves) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 12) continue;
      S.series.set(el, { key: key(el), rows: [] });
    }
  };

  const tick = () => {
    if (S.stop) return;
    const t = Math.round(performance.now() - S.t0);
    const y = Math.round(window.scrollY);
    for (const [el, rec] of S.series) {
      if (rec.rows.length > 2400) continue;
      const cs = getComputedStyle(el);
      const m = new DOMMatrixReadOnly(cs.transform === 'none' ? '' : cs.transform);
      rec.rows.push([t, y, +(+cs.opacity).toFixed(2), Math.round(m.m41), Math.round(m.m42), +m.m11.toFixed(2)]);
    }
    requestAnimationFrame(tick);
  };

  const boot = () => { scan(); requestAnimationFrame(tick); };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
  // Client-rendered pages mount their animated nodes after first paint.
  const iv = setInterval(() => { scan(); if (S.scans > 14 || S.stop) clearInterval(iv); }, 450);
  return 1;
};

export const readSampler = () => {
  if (!window.__td) return { series: {}, note: 'sampler never installed' };
  window.__td.stop = true;
  const out = {};
  for (const [, rec] of window.__td.series) if (rec.rows.length > 4) out[rec.key] = rec.rows;
  return { schema: ['t_ms', 'scrollY', 'opacity', 'translateX', 'translateY', 'scaleX'], series: out };
};

// Cross-origin stylesheets are opaque to cssRules. Re-inject their text as an
// inline <style> and the same rules become readable. Without this, every site
// on a CDN (Framer, Webflow, Next on Vercel) reports zero animated rules.
export const rehydrateSheets = async () => {
  const hrefs = [...document.styleSheets].filter(s => { try { s.cssRules; return false; } catch { return !!s.href; } }).map(s => s.href);
  let ok = 0;
  for (const href of hrefs.slice(0, 12)) {
    try {
      const text = await (await fetch(href)).text();
      const el = document.createElement('style');
      el.dataset.tdRehydrated = href;
      el.textContent = text;
      document.head.appendChild(el);
      ok++;
    } catch { /* genuinely blocked */ }
  }
  return { attempted: hrefs.length, rehydrated: ok };
};

export const dismissOverlays = () => {
  const killed = [];
  const words = /^(accept|accept all|allow all|agree|i agree|got it|ok|ok pour moi|d'accord|j'accepte|tout accepter|continue|close|no thanks|non merci|dismiss|reject all|decline|×|✕)$/i;
  for (const el of document.querySelectorAll('button, a, [role="button"], input[type="submit"]')) {
    const label = (el.textContent || el.value || el.getAttribute('aria-label') || '').trim();
    if (words.test(label)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) { killed.push(label); el.click(); }
    }
    if (killed.length > 4) break;
  }
  // Anything still covering the page after the clicks is a hard gate worth recording.
  const blockers = [];
  for (const el of document.querySelectorAll('div, section, aside, dialog')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    const r = el.getBoundingClientRect();
    const covers = r.width * r.height > innerWidth * innerHeight * 0.55;
    if (covers && +cs.zIndex > 10 && cs.display !== 'none' && +cs.opacity > 0.5) {
      blockers.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 40)} z=${cs.zIndex}`);
      el.style.setProperty('display', 'none', 'important');
    }
  }
  return { clicked: killed, forciblyHidden: blockers };
};
