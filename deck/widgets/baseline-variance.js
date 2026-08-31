/* ============================================================
   widget: baseline-variance                      (Chapter 10, Act 2)

   The same estimator, the same task, the same seed and the same
   starting gain — the only difference is whether an action-independent
   baseline b(s_t) is subtracted from the reward-to-go.

   Task (identical to the Act 1 widget, so the two can be read together):
     x_{t+1} = x_t + u_t,  x_0 = 1,  T = 12,  cost sum(x^2 + u^2)
     policy  u = -k x + 0.25 eps        d/dk log pi = -eps x / 0.25
     alpha = 0.012,  k0 = 1.15,  N = 10 episodes per update
     Riccati gain k* = 0.6180339887

   The baseline is a per-timestep exponential moving average of the
   reward-to-go, eta = 0.5, computed from PREVIOUS batches only — so it
   is independent of the actions in the current batch and therefore
   exactly unbiased. (A baseline fitted on the same batch is slightly
   biased; that is worth avoiding in a widget that claims unbiasedness.)

   VERIFIED IN NODE:
   * unbiasedness, 200k episodes, sigma = 0.35:
       k = 0.66   exact dJ/dk = -0.1173
                  no baseline  -0.1579 (var 4282)
                  reward-to-go -0.1186 (var 1965)
                  + baseline   -0.1158 (var  224)
     — the three means agree; only the variance moves.
   * this widget's exact configuration, seeds 3 / 5 / 11 / 13, using
     the last 50 of 100 updates:
       seed  var(no b)  var(b)   ratio   rms|k-k*| no b   rms|k-k*| b
        3       340      28.8    11.8x       0.259          0.038
        5       319      19.1    16.7x       0.119          0.039
       11       503      25.8    19.5x       0.174          0.038
       13       309      22.9    13.5x       0.165          0.044
     The shipped seed is 11.
   ============================================================ */
IE437.widget('baseline-variance', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B';

  var A = 1, B = 1, QC = 1, RC = 1, X0 = 1, T = 12, SIG = 0.25;
  var ALPHA = 0.012, K0 = 1.15, N = 10, ETA = 0.5, STEPS = 100;
  var KSTAR = 0.6180339887;
  var SEED = opts.seed === undefined ? 11 : opts.seed;

  var runs, n;

  function J(kk) {
    var c = A - B * kk, Ex2 = X0 * X0, tot = 0, t;
    for (t = 0; t < T; t++) {
      tot += QC * Ex2 + RC * (kk * kk * Ex2 + SIG * SIG);
      Ex2 = c * c * Ex2 + B * B * SIG * SIG;
    }
    return -(tot + QC * Ex2);
  }

  function mkRun(useBL) {
    return { bl: useBL, rand: IE437.rng(SEED), k: K0, b: new Array(T), init: false,
      hist: [{ k: K0, v: null }] };
  }
  function gauss(r) { var a = r(); if (a < 1e-12) a = 1e-12; var b = r();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }

  function episode(R, kk) {
    var x = X0, sc = [], cs = [], t, e, u;
    for (t = 0; t < T; t++) {
      e = gauss(R.rand); u = -kk * x + SIG * e;
      cs.push(QC * x * x + RC * u * u);
      sc.push(-e * x / SIG);
      x = A * x + B * u;
    }
    cs.push(QC * x * x);
    var rtg = new Array(T), run = -cs[T];
    for (t = T - 1; t >= 0; t--) { run += -cs[t]; rtg[t] = run; }
    return { sc: sc, rtg: rtg };
  }

  function stepRun(R) {
    var eps = [], gs = [], i, t, g;
    for (i = 0; i < N; i++) eps.push(episode(R, R.k));
    for (i = 0; i < N; i++) {
      g = 0;
      for (t = 0; t < T; t++) g += eps[i].sc[t] * (eps[i].rtg[t] - (R.bl && R.init ? R.b[t] : 0));
      gs.push(g);
    }
    var m = 0; for (i = 0; i < N; i++) m += gs[i] / N;
    var v = 0; for (i = 0; i < N; i++) v += (gs[i] - m) * (gs[i] - m) / (N - 1);
    if (R.bl) {                                   /* refit the baseline AFTER using it */
      var mt = new Array(T);
      for (t = 0; t < T; t++) { mt[t] = 0; for (i = 0; i < N; i++) mt[t] += eps[i].rtg[t] / N; }
      for (t = 0; t < T; t++) R.b[t] = R.init ? (1 - ETA) * R.b[t] + ETA * mt[t] : mt[t];
      R.init = true;
    }
    R.k += ALPHA * m;
    if (R.k < 0.02) R.k = 0.02; if (R.k > 1.8) R.k = 1.8;
    R.hist.push({ k: R.k, v: v, g: m });
  }
  function step() { stepRun(runs[0]); stepRun(runs[1]); n++; draw(); }

  host.innerHTML =
    '<div class="wbar"><span class="wt">One line of algebra, an order of magnitude of noise</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">update</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-one>one update</button>' +
    '<button class="wb" data-auto data-run>run 100</button>' +
    '</div>' +
    '<div class="wbody">' +
    '<div style="display:flex;gap:18px;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the gain k over 100 updates</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">variance of the per-episode gradient</div><div data-c2></div></div></div>' +
    '<div data-num style="display:flex;gap:22px;justify-content:center;align-items:baseline;' +
    'font:400 12px/1.5 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.075);' +
    'padding-top:9px"></div></div>';

  var W = 412, H = 226;
  var s1 = IE437.svg(W, H), s2 = IE437.svg(W, H);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function draw() {
    var i, R;
    /* ---- left: the gain ---- */
    var m1 = IE437.plot(s1, {
      w: W, h: H, pad: { l: 42, r: 12, t: 12, b: 30 },
      xdom: [0, STEPS], ydom: [0.2, 1.25],
      yticks: [0.4, 0.6, 0.8, 1.0, 1.2], xticks: [0, 25, 50, 75, 100],
      yfmt: function (t) { return t.toFixed(1); }, xlabel: 'policy update',
      series: [
        { pts: runs[0].hist.map(function (h, j) { return [j, h.k]; }), color: AMBER, w: 1.7 },
        { pts: runs[1].hist.map(function (h, j) { return [j, h.k]; }), color: BLUE, w: 1.7 }
      ]
    });
    E('line', { x1: m1.X(0), x2: m1.X(STEPS), y1: m1.Y(KSTAR), y2: m1.Y(KSTAR),
      stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '5 4', 'stroke-opacity': .55 }, s1);
    E('text', { x: m1.X(0) + 5, y: m1.Y(KSTAR) - 6, 'font-size': 9.5,
      fill: INK, 'fill-opacity': .6, 'font-family': 'IBM Plex Mono, monospace',
      text: 'k* = 0.618' }, s1);

    /* ---- right: the variance, log10 ---- */
    var lg = function (R2) {
      return R2.hist.map(function (h, j) { return h.v == null ? null : [j, Math.log10(Math.max(1e-3, h.v))]; })
        .filter(function (p) { return p; });
    };
    var m2 = IE437.plot(s2, {
      w: W, h: H, pad: { l: 46, r: 12, t: 12, b: 30 },
      xdom: [0, STEPS], ydom: [0.6, 4.2],
      yticks: [1, 2, 3, 4], xticks: [0, 25, 50, 75, 100],
      yfmt: function (t) { return '10^' + t; }, xlabel: 'policy update',
      series: [
        { pts: lg(runs[0]), color: AMBER, w: 1.6 },
        { pts: lg(runs[1]), color: BLUE, w: 1.6 }
      ]
    });

    /* legend, drawn once per redraw on the left panel */
    [[AMBER, 'no baseline', 0], [BLUE, 'with baseline', 1]].forEach(function (L, j) {
      var y = 20 + j * 15;
      E('line', { x1: 232, x2: 252, y1: y, y2: y, stroke: L[0], 'stroke-width': 2.4 }, s1);
      E('text', { x: 257, y: y + 3.5, 'font-size': 10, fill: L[0],
        'font-family': 'IBM Plex Mono, monospace', text: L[1] }, s1);
    });

    host.querySelector('[data-n]').textContent = n;

    /* late statistics — the last half of whatever has run */
    function late(R2, f) {
      var h = R2.hist.filter(function (x) { return x.v != null; });
      h = h.slice(Math.floor(h.length / 2));
      if (!h.length) return null;
      var s = 0; h.forEach(function (x) { s += f(x); });
      return s / h.length;
    }
    var va = late(runs[0], function (x) { return x.v; });
    var vb = late(runs[1], function (x) { return x.v; });
    var ra = late(runs[0], function (x) { return (x.k - KSTAR) * (x.k - KSTAR); });
    var rb = late(runs[1], function (x) { return (x.k - KSTAR) * (x.k - KSTAR); });
    var cell = function (lbl, val, col) {
      return '<div style="text-align:center"><div class="wlabel">' + lbl + '</div>' +
        '<div class="wnum" style="margin-top:4px;color:' + col + '">' + val + '</div></div>';
    };
    host.querySelector('[data-num]').innerHTML = va == null
      ? '<div style="color:var(--ink3)">press &ldquo;run 100&rdquo; &mdash; both curves start from the same gain, ' +
        'the same seed and the same estimator</div>'
      : cell('variance &mdash; no baseline', va.toFixed(0), AMBER) +
        cell('variance &mdash; with', vb.toFixed(1), BLUE) +
        cell('reduction', (va / vb).toFixed(1) + '&times;', INK) +
        cell('rms |k &minus; k*|', ra == null ? '&mdash;' :
          Math.sqrt(ra).toFixed(3) + ' &rarr; ' + Math.sqrt(rb).toFixed(3), INK);
  }

  function reset() { runs = [mkRun(false), mkRun(true)]; n = 0; draw(); }
  host.querySelector('[data-one]').onclick = function () { step(); };
  host.querySelector('[data-run]').onclick = function () { for (var i = 0; i < STEPS; i++) step(); };
  var __reset = reset;

  reset();
  return { reset: __reset, finish: function () { if (n === 0) for (var i = 0; i < STEPS; i++) step(); } };
});
