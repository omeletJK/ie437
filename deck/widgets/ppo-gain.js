/* ============================================================
   widget: ppo-gain                              (Chapter 10, Act 4)

   The clipped surrogate at work on the heater of Acts 1 and 2:

     x_{t+1} = x_t + u_t,  x_0 = 1,  T = 12,  cost Σ (x² + u²), undiscounted
     policy  u ∼ N(−k x, σ²),  σ = 0.25        (the Gaussian gain policy)
     Riccati gain k* = 0.618

   Each iteration collects N = 16 episodes under k_old, forms the
   advantages Â_t = (reward to go) − b_t with b_t the batch mean at t
   (Act 2's baseline), and then MAXIMISES a surrogate over k on that one
   batch, to the end, by a grid search over k ∈ [−0.5, 2.6]:

     plain    L(k)      = mean_i Σ_t r_t(k) Â_t
     clipped  L_clip(k) = mean_i Σ_t min( r_t(k) Â_t, clip(r_t(k), 1−ε, 1+ε) Â_t )
     r_t(k)   = π_k(u_t|x_t) / π_{k_old}(u_t|x_t)
              = exp( −[(u_t + k x_t)² − (u_t + k_old x_t)²] / 2σ² )

   Two runs with the same seed, one per surrogate. The point is what a
   full maximisation does: the plain surrogate keeps promising as k
   leaves k_old (the ratios grow without bound), the clipped one goes
   flat once the ratios leave [1−ε, 1+ε].

   VERIFIED IN NODE (seeds 1–4, 30 iterations, ε = 0.2):
   * full maximisation of the plain surrogate per batch jumps all over
     the gain axis, 1.15 → 0.82 → 0.66 → 0.44 → 1.60 → ... → 3.00 →
     ... → −1.00 (seed 2): unstable gains, both ways.
   * full maximisation of the clipped surrogate per batch moves k by
     about 0.05–0.1 each time: 1.15 → 1.06 → 1.01 → 0.93 → 0.88 → 0.80
     → 0.71 → ... and settles around 0.6 ± 0.07.
   * one batch at k_old = 1.15 (seed 7): L(k) = 0.6, 1.9, 3.7, 4.2 at
     k = 1.0, 0.8, 0.6, 0.4 and still 1.5 at k = 0; L_clip peaks at
     k ≈ 1.0 with 0.20 and falls below zero before k = 0.6.
   * ratios outside [0.8, 1.2] on that batch: 5 of 192 at a step of 0.05
     in k, 20 at 0.1, 55 at 0.2, 91 at 0.4.
   ============================================================ */
IE437.widget('ppo-gain', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706', RED = '#D64545';

  var T = 12, SIG = 0.25, X0 = 1, N = 16, K0 = 1.15, KSTAR = 0.6180339887, ITERS = 30;
  var KLO = -0.5, KHI = 2.6, EPS = [0.1, 0.2, 0.3], ei = opts.eps === 0.1 ? 0 : opts.eps === 0.3 ? 2 : 1;
  var SEED = opts.seed === undefined ? 1 : opts.seed;

  var runs, n;

  function gauss(r) { var a = r(); if (a < 1e-12) a = 1e-12; var b = r(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }
  function J(kk) {
    var c = 1 - kk, Ex2 = X0 * X0, tot = 0, t;
    for (t = 0; t < T; t++) { tot += Ex2 + (kk * kk * Ex2 + SIG * SIG); Ex2 = c * c * Ex2 + SIG * SIG; }
    return -(tot + Ex2);
  }
  function batch(R, kk) {
    var eps = [], i, t, b = new Array(T);
    for (i = 0; i < N; i++) {
      var x = X0, xs = [], us = [], cs = [];
      for (t = 0; t < T; t++) { var u = -kk * x + SIG * gauss(R); xs.push(x); us.push(u); cs.push(x * x + u * u); x = x + u; }
      cs.push(x * x);
      var rtg = new Array(T), run = -cs[T];
      for (t = T - 1; t >= 0; t--) { run += -cs[t]; rtg[t] = run; }
      eps.push({ xs: xs, us: us, rtg: rtg });
    }
    for (t = 0; t < T; t++) { b[t] = 0; for (i = 0; i < N; i++) b[t] += eps[i].rtg[t] / N; }
    var adv = eps.map(function (e) { return e.rtg.map(function (g, t2) { return g - b[t2]; }); });
    return { eps: eps, adv: adv };
  }
  /* the two surrogates at k, for a batch collected under k0 */
  function surr(B, k0, kk, ep) {
    var L = 0, Lc = 0, i, t;
    for (i = 0; i < N; i++) for (t = 0; t < T; t++) {
      var x = B.eps[i].xs[t], u = B.eps[i].us[t], A = B.adv[i][t];
      var r = Math.exp(-((u + kk * x) * (u + kk * x) - (u + k0 * x) * (u + k0 * x)) / (2 * SIG * SIG));
      L += r * A;
      var rc = Math.min(Math.max(r, 1 - ep), 1 + ep);
      Lc += Math.min(r * A, rc * A);
    }
    return [L / N, Lc / N];
  }
  function argmax(B, k0, ep, which) {
    var best = -1e9, kb = k0, kk;
    for (kk = KLO; kk <= KHI + 1e-9; kk += 0.005) { var v = surr(B, k0, kk, ep)[which]; if (v > best) { best = v; kb = kk; } }
    return Math.round(kb * 1000) / 1000;
  }
  function mkRun(clip) { return { clip: clip, rand: IE437.rng(SEED), k: K0, hist: [K0], B: null, kold: K0 }; }
  function stepRun(R) {
    var B = batch(R.rand, R.k);
    R.B = B; R.kold = R.k;
    R.k = argmax(B, R.k, EPS[ei], R.clip ? 1 : 0);
    R.hist.push(R.k);
  }
  function step() { stepRun(runs[0]); stepRun(runs[1]); n++; draw(); }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Maximise the surrogate to the end &mdash; with and without the clip</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">iteration</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-eps>&epsilon; = <span data-epsv></span></button>' +
    '<button class="wb" data-one>one iteration</button>' +
    '<button class="wb" data-auto data-run>run 30</button>' +
    '</div>' +
    '<div class="wbody">' +
    '<div style="display:flex;gap:18px;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the two surrogates on the clipped run&rsquo;s latest batch</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the gain k after each full maximisation</div><div data-c2></div></div></div>' +
    '<div data-num style="display:flex;gap:22px;justify-content:center;align-items:baseline;min-height:36px;' +
    'font:400 12px/1.5 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div>';

  var W = 412, H = 196;
  var s1 = IE437.svg(W, H), s2 = IE437.svg(W, H);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function draw() {
    var R = runs[1], kk;
    /* ---- left: L(k) and L_clip(k) on the clipped run's latest batch, both argmaxes marked ---- */
    var PLO = 0, PHI = 2.2, YL = -2.5, YH = 5;
    var pl = [], cl = [];
    if (R.B) for (kk = PLO; kk <= PHI + 1e-9; kk += 0.02) { var v = surr(R.B, R.kold, kk, EPS[ei]); pl.push([kk, Math.max(YL, Math.min(YH, v[0]))]); cl.push([kk, Math.max(YL, Math.min(YH, v[1]))]); }
    var m1 = IE437.plot(s1, {
      w: W, h: H, pad: { l: 42, r: 12, t: 12, b: 30 },
      xdom: [PLO, PHI], ydom: [YL, YH],
      yticks: [-2, 0, 2, 4], xticks: [0, 0.5, 1, 1.5, 2],
      xfmt: function (t) { return t.toFixed(1); }, xlabel: 'gain k (the batch was collected under k_old)',
      series: R.B ? [{ pts: pl, color: AMBER, w: 1.6 }, { pts: cl, color: BLUE, w: 2 }] : []
    });
    E('line', { x1: m1.X(PLO), x2: m1.X(PHI), y1: m1.Y(0), y2: m1.Y(0), stroke: INK, 'stroke-opacity': .25 }, s1);
    if (R.B) {
      var ko = Math.max(PLO, Math.min(PHI, R.kold));
      E('line', { x1: m1.X(ko), x2: m1.X(ko), y1: m1.Y(YL), y2: m1.Y(YH), stroke: INK, 'stroke-opacity': .3, 'stroke-dasharray': '3 3' }, s1);
      E('text', { x: m1.X(ko), y: m1.Y(YH) + 10, 'font-size': 9.5, fill: INK, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace', text: 'k_old' }, s1);
      var kp = argmax(R.B, R.kold, EPS[ei], 0), kc = R.k;
      [[kp, AMBER, 'plain max'], [kc, BLUE, 'clipped max']].forEach(function (p, j) {
        var kx = Math.max(PLO, Math.min(PHI, p[0])), vy = surr(R.B, R.kold, p[0], EPS[ei])[j];
        E('circle', { cx: m1.X(kx), cy: m1.Y(Math.max(YL, Math.min(YH, vy))), r: 5, fill: p[1] }, s1);
        E('text', { x: m1.X(kx) + (j ? 8 : -8), y: m1.Y(Math.max(YL, Math.min(YH, vy))) + 3.5, 'font-size': 9.5, fill: p[1], 'text-anchor': j ? 'start' : 'end',
          'font-family': 'IBM Plex Mono, monospace', text: p[2] + (p[0] < PLO || p[0] > PHI ? ' (off the axis)' : '') }, s1);
      });
    }
    [[AMBER, 'plain  L(k) = mean Σ r Â', 0], [BLUE, 'clipped L_clip(k)', 1]].forEach(function (L, j) {
      var y = 20 + j * 14;
      E('line', { x1: 232, x2: 252, y1: y, y2: y, stroke: L[0], 'stroke-width': 2.2 }, s1);
      E('text', { x: 257, y: y + 3.5, 'font-size': 9.5, fill: L[0], 'font-family': 'IBM Plex Mono, monospace', text: L[1] }, s1);
    });

    /* ---- right: the gain over the iterations ---- */
    var m2 = IE437.plot(s2, {
      w: W, h: H, pad: { l: 42, r: 12, t: 12, b: 30 },
      xdom: [0, ITERS], ydom: [-0.6, 2.7],
      yticks: [0, 0.5, 1, 1.5, 2, 2.5], xticks: [0, 10, 20, 30],
      yfmt: function (t) { return t.toFixed(1); }, xlabel: 'iteration (one batch, one full maximisation)',
      series: [
        { pts: runs[0].hist.map(function (h, j) { return [j, h]; }), color: AMBER, w: 1.6 },
        { pts: runs[1].hist.map(function (h, j) { return [j, h]; }), color: BLUE, w: 2 }
      ]
    });
    /* the gains that destabilise the closed loop: k < 0 or k > 2 */
    E('rect', { x: m2.X(0), y: m2.Y(2.7), width: m2.X(ITERS) - m2.X(0), height: m2.Y(2) - m2.Y(2.7), fill: RED, 'fill-opacity': .07 }, s2);
    E('rect', { x: m2.X(0), y: m2.Y(0), width: m2.X(ITERS) - m2.X(0), height: m2.Y(-0.6) - m2.Y(0), fill: RED, 'fill-opacity': .07 }, s2);
    E('text', { x: m2.X(ITERS) - 4, y: m2.Y(2.35) + 3, 'font-size': 9, fill: RED, 'fill-opacity': .7, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono, monospace', text: 'unstable: |1 − k| > 1' }, s2);
    E('line', { x1: m2.X(0), x2: m2.X(ITERS), y1: m2.Y(KSTAR), y2: m2.Y(KSTAR), stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '5 4', 'stroke-opacity': .55 }, s2);
    E('text', { x: m2.X(0) + 5, y: m2.Y(KSTAR) - 6, 'font-size': 9.5, fill: INK, 'fill-opacity': .65, 'font-family': 'IBM Plex Mono, monospace', text: 'k* = 0.618' }, s2);

    host.querySelector('[data-n]').textContent = n;
    host.querySelector('[data-epsv]').textContent = EPS[ei].toFixed(1);
    var cell = function (lbl, val, col) {
      return '<div style="text-align:center"><div class="wlabel">' + lbl + '</div>' +
        '<div class="wnum" style="margin-top:4px;color:' + col + '">' + val + '</div></div>';
    };
    var late = function (hh) { var h = hh.slice(Math.max(1, Math.floor(hh.length / 2))); if (!h.length) return null; var s = 0; h.forEach(function (v) { s += (v - KSTAR) * (v - KSTAR); }); return Math.sqrt(s / h.length); };
    var ra = late(runs[0].hist), rb = late(runs[1].hist);
    host.querySelector('[data-num]').innerHTML = n === 0
      ? '<div style="color:var(--ink3)">press &ldquo;run 30&rdquo;: each iteration collects 16 episodes, then maximises its surrogate over the gain to the end</div>'
      : cell('plain max &mdash; k now', runs[0].k.toFixed(2), AMBER) +
        cell('clipped max &mdash; k now', runs[1].k.toFixed(2), BLUE) +
        cell('late rms |k &minus; k*|', (ra == null ? '&mdash;' : ra.toFixed(2)) + ' &rarr; ' + (rb == null ? '&mdash;' : rb.toFixed(2)), INK) +
        cell('J(k) true, plain / clipped', J(runs[0].k).toFixed(1) + ' / ' + J(runs[1].k).toFixed(1), INK);
  }

  function reset() { runs = [mkRun(false), mkRun(true)]; n = 0; draw(); }
  host.querySelector('[data-one]').onclick = function () { step(); };
  host.querySelector('[data-run]').onclick = function () { for (var i = 0; i < ITERS; i++) step(); };
  host.querySelector('[data-eps]').onclick = function () { ei = (ei + 1) % EPS.length; reset(); };
  var __reset = reset;
  reset();
  return { reset: __reset, finish: function () { if (n === 0) for (var i = 0; i < ITERS; i++) step(); } };
});
