/* ============================================================
   widget: bayes-regression
   The three-panel figure of the source deck, made live: sample
   lines from the posterior over w, with the ML and MAP fits drawn
   through them, and the posterior over (w0, w1) beside it. With
   two points the fan is wide; with a hundred it has collapsed and
   ML and MAP agree — which is precisely what a point estimate
   cannot tell you and full Bayes can.
   ============================================================ */
IE437.widget('bayes-regression', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545';
  var W0 = 8, W1 = 11, SIG = 2.4, ALPHA = 6;      // truth, noise sd, prior sd on w
  var SIZES = [2, 10, 100], si = 0, seed = opts.seed || 9;

  host.innerHTML =
    '<div class="wbar"><span class="wt">The posterior over a line, as the data arrives</span>' +
    '<span class="wspacer"></span><span class="wlabel">training cases</span>' +
    '<span class="wnum" data-n></span>' +
    '<button class="wb" data-cyc>2 / 10 / 100</button>' +
    '<button class="wb" data-re>new data</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0">' +
    '<div class="wlabel">sampled lines from the posterior</div><div data-c1></div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0">' +
    '<div class="wlabel">posterior over (w₀, w₁)</div><div data-c2></div></div>' +
    '<div style="width:210px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12.5px/1.85 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 12px/1.6 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:10px">' +
    'Noise SD σ = 2.4; prior SD τ = 6 on both weights. For this Gaussian posterior, mean and MAP coincide. ' +
    'Σ<sub>w</sub> describes their uncertainty. The ridge connection comes next.</div></div></div>';

  var CW = 320, CH = 250;
  var sv1 = IE437.svg(CW, CH), sv2 = IE437.svg(CW, CH);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  var rand, X = [], Y = [];
  function gauss() { var u = Math.max(1e-9, rand()), v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function makeData() {
    rand = IE437.rng(seed); X = []; Y = [];
    for (var i = 0; i < SIZES[si]; i++) {
      var x = -1 + 2 * rand();
      X.push(x); Y.push(W0 + W1 * x + SIG * gauss());
    }
  }
  /* 2x2 helpers */
  function inv2(m) { var d = m[0] * m[3] - m[1] * m[2]; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d]; }
  function mul2v(m, v) { return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]; }

  function posterior() {
    var s2 = SIG * SIG, a2 = ALPHA * ALPHA;
    var xtx = [0, 0, 0, 0], xty = [0, 0];
    X.forEach(function (x, i) {                       // design row (1, x)
      xtx[0] += 1; xtx[1] += x; xtx[2] += x; xtx[3] += x * x;
      xty[0] += Y[i]; xty[1] += x * Y[i];
    });
    var prec = [xtx[0] / s2 + 1 / a2, xtx[1] / s2, xtx[2] / s2, xtx[3] / s2 + 1 / a2];
    var Sig = inv2(prec);
    var mu = mul2v(Sig, [xty[0] / s2, xty[1] / s2]);
    /* OLS, when it exists */
    var ols = null;
    if (X.length >= 2) {
      var d = xtx[0] * xtx[3] - xtx[1] * xtx[2];
      if (Math.abs(d) > 1e-9) ols = mul2v(inv2(xtx), xty);
    }
    return { mu: mu, Sig: Sig, ols: ols };
  }
  function chol2(S) {                                 // lower Cholesky of a 2x2 SPD matrix
    var l11 = Math.sqrt(Math.max(S[0], 1e-12));
    var l21 = S[2] / l11;
    var l22 = Math.sqrt(Math.max(S[3] - l21 * l21, 1e-12));
    return [l11, 0, l21, l22];
  }

  function draw() {
    var P = posterior(), L = chol2(P.Sig);
    var srand = IE437.rng(seed + 777);
    function sg() { var u = Math.max(1e-9, srand()), v = srand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

    /* ---------- left: data, sampled lines, ML and MAP ---------- */
    var samples = [];
    for (var s = 0; s < 60; s++) {
      var z = [sg(), sg()];
      samples.push([P.mu[0] + L[0] * z[0], P.mu[1] + L[2] * z[0] + L[3] * z[1]]);
    }
    var ends = Y.slice();
    samples.concat([P.mu], P.ols ? [P.ols] : []).forEach(function (w) { ends.push(w[0] - w[1], w[0] + w[1]); });
    var YD = [Math.min(-8, Math.min.apply(null, ends) - 1), Math.max(24, Math.max.apply(null, ends) + 1)];
    var m = IE437.plot(sv1, {
      w: CW, h: CH, pad: { l: 34, r: 12, t: 12, b: 28 },
      xdom: [-1, 1], ydom: YD, yticks: [-5, 0, 10, 20], xticks: [-1, 0, 1], xlabel: 'x',
      xfmt: function (v) { return v.toFixed(0); }, yfmt: function (v) { return String(v); },
      series: []
    });
    samples.forEach(function (w) {                    // w ~ N(mu, Sigma) via Cholesky
      E('line', { x1: m.X(-1), y1: m.Y(w[0] - w[1]), x2: m.X(1), y2: m.Y(w[0] + w[1]),
        stroke: INK, 'stroke-opacity': .085, 'stroke-width': 1, 'data-role': 'sample-line' }, sv1);
    });
    if (P.ols) E('line', { x1: m.X(-1), y1: m.Y(P.ols[0] - P.ols[1]), x2: m.X(1), y2: m.Y(P.ols[0] + P.ols[1]),
      stroke: BLUE, 'stroke-width': 2.2 }, sv1);
    E('line', { x1: m.X(-1), y1: m.Y(P.mu[0] - P.mu[1]), x2: m.X(1), y2: m.Y(P.mu[0] + P.mu[1]),
      stroke: GREEN, 'stroke-width': 2.2 }, sv1);
    X.forEach(function (x, i) {
      E('circle', { cx: m.X(x), cy: m.Y(Y[i]), r: 2.8, fill: RED, 'fill-opacity': .8 }, sv1);
    });

    /* ---------- right: the posterior over (w0, w1) ---------- */
    while (sv2.firstChild) sv2.removeChild(sv2.firstChild);
    var D0 = [Math.min(-6, P.mu[0] - 3 * Math.sqrt(P.Sig[0]) - 1, P.ols ? P.ols[0] - 1 : 0),
      Math.max(18, P.mu[0] + 3 * Math.sqrt(P.Sig[0]) + 1, P.ols ? P.ols[0] + 1 : 0)];
    var D1 = [Math.min(-8, P.mu[1] - 3 * Math.sqrt(P.Sig[3]) - 1, P.ols ? P.ols[1] - 1 : 0),
      Math.max(24, P.mu[1] + 3 * Math.sqrt(P.Sig[3]) + 1, P.ols ? P.ols[1] + 1 : 0)];
    var axes = IE437.plot(sv2, { w: CW, h: CH, pad: { l: 38, r: 12, t: 14, b: 30 },
      xdom: D0, ydom: D1, xticks: [0, 8, 16], yticks: [0, 10, 20], xlabel: 'w₀',
      xfmt: function (v) { return String(v); }, yfmt: function (v) { return String(v); }, series: [] });
    var PX = axes.X, PY = axes.Y;
    E('text', { x: 8, y: 12, text: 'w₁', 'font-size': 10, fill: INK }, sv2);
    [1, 2, 3].forEach(function (k) {                  // covariance ellipses at 1σ, 2σ, 3σ
      var pts = [];
      for (var t = 0; t <= 72; t++) {
        var a = t / 72 * Math.PI * 2, c = Math.cos(a) * k, s2 = Math.sin(a) * k;
        pts.push([PX(P.mu[0] + L[0] * c), PY(P.mu[1] + L[2] * c + L[3] * s2)]);
      }
      E('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z',
        fill: GREEN, 'fill-opacity': k === 1 ? .18 : .07, stroke: GREEN, 'stroke-opacity': .5,
        'stroke-width': 1.2 }, sv2);
    });
    E('circle', { cx: PX(W0), cy: PY(W1), r: 4.5, fill: 'none', stroke: INK, 'stroke-width': 2 }, sv2);
    E('text', { x: PX(W0) + 8, y: PY(W1) - 6, 'font-size': 9.5, fill: INK, 'fill-opacity': .55,
      'font-family': 'IBM Plex Mono, monospace', 'letter-spacing': .8, text: 'TRUE w' }, sv2);
    E('circle', { cx: PX(P.mu[0]), cy: PY(P.mu[1]), r: 4, fill: GREEN }, sv2);
    if (P.ols) E('circle', { cx: PX(P.ols[0]), cy: PY(P.ols[1]), r: 4, fill: BLUE }, sv2);
    host.querySelector('[data-n]').textContent = SIZES[si];
    host.querySelector('[data-num]').innerHTML =
      '<span style="color:' + BLUE + '">&#9473;&#9473; ML</span> ' +
      (P.ols ? '(' + P.ols[0].toFixed(1) + ', ' + P.ols[1].toFixed(1) + ')' : 'undetermined') + '<br>' +
      '<span style="color:' + GREEN + '">&#9473;&#9473; MAP</span> (' +
      P.mu[0].toFixed(1) + ', ' + P.mu[1].toFixed(1) + ')<br>' +
      'true w = (' + W0 + ', ' + W1 + ')<br>' +
      'posterior sd: ' + Math.sqrt(P.Sig[0]).toFixed(2) + ', ' + Math.sqrt(P.Sig[3]).toFixed(2);
    host.dataset.posterior = JSON.stringify({ mean: P.mu, covariance: P.Sig, ols: P.ols, x: X, y: Y });
  }

  host.querySelector('[data-cyc]').onclick = function () { si = (si + 1) % SIZES.length; makeData(); draw(); };
  host.querySelector('[data-re]').onclick = function () { seed += 101; makeData(); draw(); };

  makeData(); draw();
  return { reset: function () { si = 0; seed = opts.seed || 9; makeData(); draw(); },
    finish: function () { si = 1; seed = opts.seed || 9; makeData(); draw(); } };
});
