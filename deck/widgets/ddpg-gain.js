/* ============================================================
   widget: ddpg-gain                             (Chapter 10, Act 3)

   DDPG on the heater, the one system of Lectures 9 and 10:

     x_{t+1} = x_t + u_t,   reward r = −(x^2 + u^2),   discount γ = 0.9
     actor   u = μ_k(x) = −k x            (one parameter, the gain)
     critic  Q_w(x,u) = w_1 x^2 + w_2 x u + w_3 u^2

   The critic is fitted by TD from a replay buffer with soft target
   copies (w⁻, k⁻); the actor climbs the critic's action-gradient:
     ∂Q_w/∂u = w_2 x + 2 w_3 u,   ∂u/∂k = −x,
     k ← k + α_k · mean( (w_2 x + 2 w_3 μ_k(x)) · (−x) ).
   The behaviour policy adds Gaussian exploration noise to μ_k(x).

   Why a discount: with exploration noise the undiscounted infinite-
   horizon value is infinite, so a stationary critic needs γ < 1. The
   Act 1 and Act 2 widgets run the undiscounted twelve-step problem;
   this one is discounted, and its target is the discounted Riccati gain.

   VERIFIED IN NODE:
   * the true critic of the gain k is exactly in the feature span:
       Q^μ(x,u) = −(x² + u²) + γ V^μ(x+u),  V^μ(x) = −P_k x²,
       P_k = (1 + k²)/(1 − γ(1 − k)²),  so  w = (−1−γP_k, −2γP_k, −1−γP_k).
   * the discounted Riccati equation P = 1 + γP − (γP)²/(1 + γP) gives
       γ = 0.9:  P = 1.5884,  K* = γP/(1 + γP) = 0.5884
       (γ = 1 would give 0.618, the gain of Acts 1 and 2).
   * with α_w = 0.25 (two critic minibatches per update), α_k = 0.03,
     N = 32, seeds 1 and 2: k runs 1.15 → 0.2 (the critic is still wrong
     and the actor follows it) → 0.59 by update 300, and the critic's
     weights reach (−2.43, −2.86, −2.43) against the exact (−2.43, −2.86,
     −2.43) at k*.
   * turning the target copies off changes nothing visible on this
     linear problem (same trajectories to two decimals), so the widget
     has no such switch; the claim "target networks matter" stays a
     quotation from the paper, not a demonstration.
   ============================================================ */
IE437.widget('ddpg-gain', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706', RED = '#D64545', GREEN = '#16A34A';

  var G = 0.9, T = 12, SIG = 0.3, N = 32, AW = 0.25, CU = 2, AK = 0.03, TAU = 0.05, CAP = 4000, ACT = 4;
  var K0 = 1.15, KSTAR = 0.58840, STEPS = 300;
  var SEED = opts.seed === undefined ? 2 : opts.seed;

  var rand, k, w, wT, kT, buf, hist, n, x, tInEp;

  function gauss() { var a = rand(); if (a < 1e-12) a = 1e-12; var b = rand(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }
  function Pk(kk) { return (1 + kk * kk) / (1 - G * (1 - kk) * (1 - kk)); }
  function trueW(kk) { var P = Pk(kk); return [-1 - G * P, -2 * G * P, -1 - G * P]; }
  function Q(ww, xx, uu) { return ww[0] * xx * xx + ww[1] * xx * uu + ww[2] * uu * uu; }

  function update() {
    var s, i, c, j;
    /* act: a few steps with exploration noise into the buffer */
    for (s = 0; s < ACT; s++) {
      if (tInEp === 0) x = (rand() * 2 - 1) * 1.5;
      var u = -k * x + SIG * gauss(), r = -(x * x + u * u), x2 = x + u;
      buf.push([x, u, r, x2]); if (buf.length > CAP) buf.shift();
      x = x2; tInEp = (tInEp + 1) % T;
    }
    /* learn: the critic by TD on replayed minibatches, with target copies */
    for (c = 0; c < CU; c++) {
      var dw = [0, 0, 0];
      for (i = 0; i < N; i++) {
        var e = buf[Math.floor(rand() * buf.length)], xx = e[0], uu = e[1], rr = e[2], xn = e[3];
        var un = -kT * xn, y = rr + G * Q(wT, xn, un), d = y - Q(w, xx, uu);
        dw[0] += d * xx * xx; dw[1] += d * xx * uu; dw[2] += d * uu * uu;
      }
      for (j = 0; j < 3; j++) w[j] += AW * dw[j] / N;
      for (j = 0; j < 3; j++) wT[j] = TAU * w[j] + (1 - TAU) * wT[j];
    }
    /* move: the actor climbs ∂Q/∂u through ∂u/∂k = −x */
    var dk = 0;
    for (i = 0; i < N; i++) { var xs = buf[Math.floor(rand() * buf.length)][0], ua = -k * xs; dk += (w[1] * xs + 2 * w[2] * ua) * (-xs); }
    k += AK * dk / N; if (k < -0.5) k = -0.5; if (k > 2.5) k = 2.5;
    kT = TAU * k + (1 - TAU) * kT;
    n++; hist.push(k);
    draw();
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">DDPG on the heater &mdash; the actor climbs the critic</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">update</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-one>one update</button>' +
    '<button class="wb" data-ten>ten</button>' +
    '<button class="wb" data-auto data-run>run 300</button>' +
    '</div>' +
    '<div class="wbody">' +
    '<div style="display:flex;gap:18px;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the critic at x = 1: Q<sub>w</sub>(1, u) across the action</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the gain k over the updates</div><div data-c2></div></div></div>' +
    '<div data-num style="display:flex;gap:22px;justify-content:center;align-items:baseline;min-height:36px;' +
    'font:400 12px/1.5 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div>';

  var W = 412, H = 196;
  var s1 = IE437.svg(W, H), s2 = IE437.svg(W, H);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function draw() {
    var i, u, X1 = 1;
    /* ---- left: the critic's slice at x = 1 against the true critic of the current gain ---- */
    var ULO = -1.6, UHI = 0.4, wt = trueW(k), cur = [], tru = [];
    for (u = ULO; u <= UHI + 1e-9; u += 0.02) { cur.push([u, Q(w, X1, u)]); tru.push([u, Q(wt, X1, u)]); }
    var m1 = IE437.plot(s1, {
      w: W, h: H, pad: { l: 44, r: 12, t: 12, b: 30 },
      xdom: [ULO, UHI], ydom: [-7.5, 0.5],
      yticks: [-6, -4, -2, 0], xticks: [-1.5, -1, -0.5, 0],
      xfmt: function (t) { return t.toFixed(1); }, xlabel: 'action u at x = 1',
      series: [{ pts: tru, color: SLATE, w: 1.4, dash: '5 4' }, { pts: cur, color: BLUE, w: 2 }]
    });
    /* the actor's action and the slope it climbs */
    var ua = -k * X1, qa = Q(w, X1, ua), slope = w[1] * X1 + 2 * w[2] * ua;
    var uc = Math.max(ULO, Math.min(UHI, ua));
    E('line', { x1: m1.X(uc), x2: m1.X(uc), y1: m1.Y(-7.5), y2: m1.Y(Math.max(-7.5, Math.min(0.5, qa))), stroke: INK, 'stroke-opacity': .3 }, s1);
    E('circle', { cx: m1.X(uc), cy: m1.Y(Math.max(-7.5, Math.min(0.5, qa))), r: 5.5, fill: INK }, s1);
    var dir = slope > 0 ? 1 : -1, ax = m1.X(uc), ay = m1.Y(Math.max(-7.5, Math.min(0.5, qa))) - 14;
    E('path', { d: 'M' + ax + ' ' + ay + 'L' + (ax + dir * 34) + ' ' + ay + 'M' + (ax + dir * 34) + ' ' + ay + 'L' + (ax + dir * 26) + ' ' + (ay - 4) + 'M' + (ax + dir * 34) + ' ' + ay + 'L' + (ax + dir * 26) + ' ' + (ay + 4), fill: 'none', stroke: AMBER, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, s1);
    E('text', { x: ax + dir * 38, y: ay + 3.5, 'font-size': 9.5, fill: AMBER, 'text-anchor': dir > 0 ? 'start' : 'end',
      'font-family': 'IBM Plex Mono, monospace', text: '∂Q/∂u' }, s1);
    E('text', { x: m1.X(uc), y: m1.Y(-7.5) - 4, 'font-size': 9.5, fill: INK, 'text-anchor': 'middle',
      'font-family': 'IBM Plex Mono, monospace', text: 'u = −k·1' }, s1);
    [[BLUE, 'critic Q_w, learned', 0], [SLATE, 'true Q of this gain', 1]].forEach(function (L, j) {
      var y = 20 + j * 14;
      E('line', { x1: 240, x2: 260, y1: y, y2: y, stroke: L[0], 'stroke-width': 2.2, 'stroke-dasharray': j ? '5 4' : '' }, s1);
      E('text', { x: 265, y: y + 3.5, 'font-size': 9.5, fill: L[0], 'font-family': 'IBM Plex Mono, monospace', text: L[1] }, s1);
    });

    /* ---- right: the gain ---- */
    var m2 = IE437.plot(s2, {
      w: W, h: H, pad: { l: 42, r: 12, t: 12, b: 30 },
      xdom: [0, STEPS], ydom: [0, 1.3],
      yticks: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], xticks: [0, 100, 200, 300],
      yfmt: function (t) { return t.toFixed(1); }, xlabel: 'update',
      series: [{ pts: hist.map(function (h, j) { return [j, h]; }), color: BLUE, w: 1.8 }]
    });
    E('line', { x1: m2.X(0), x2: m2.X(STEPS), y1: m2.Y(KSTAR), y2: m2.Y(KSTAR), stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '5 4', 'stroke-opacity': .55 }, s2);
    E('text', { x: m2.X(STEPS) - 4, y: m2.Y(KSTAR) - 6, 'font-size': 9.5, fill: INK, 'fill-opacity': .65, 'text-anchor': 'end',
      'font-family': 'IBM Plex Mono, monospace', text: 'k* = 0.588  (Riccati, γ = 0.9)' }, s2);

    host.querySelector('[data-n]').textContent = n;
    var cell = function (lbl, val, col) {
      return '<div style="text-align:center"><div class="wlabel">' + lbl + '</div>' +
        '<div class="wnum" style="margin-top:4px;color:' + col + '">' + val + '</div></div>';
    };
    var trueSlope = wt[1] * X1 + 2 * wt[2] * ua;
    host.querySelector('[data-num]').innerHTML = n === 0
      ? '<div style="color:var(--ink3)">press &ldquo;run 300&rdquo;: the critic is fitted from replayed transitions, the actor follows its slope</div>'
      : cell('gain k', k.toFixed(3), Math.abs(k - KSTAR) < 0.03 ? BLUE : INK) +
        cell('|k &minus; k*|', Math.abs(k - KSTAR).toFixed(3), INK) +
        cell('critic slope at the actor&rsquo;s action', slope.toFixed(2), AMBER) +
        cell('true slope there', trueSlope.toFixed(2), SLATE) +
        cell('transitions stored', String(buf.length), INK);
  }

  function reset() {
    rand = IE437.rng(SEED); k = K0; kT = K0; w = [0, 0, 0]; wT = [0, 0, 0];
    buf = []; hist = [K0]; n = 0; x = 1; tInEp = 0;
    draw();
  }
  host.querySelector('[data-one]').onclick = function () { update(); };
  host.querySelector('[data-ten]').onclick = function () { for (var i = 0; i < 10; i++) update(); };
  host.querySelector('[data-run]').onclick = function () { for (var i = 0; i < STEPS; i++) update(); };
  var __reset = reset;
  reset();
  return { reset: __reset, finish: function () { if (n === 0) for (var i = 0; i < STEPS; i++) update(); } };
});
