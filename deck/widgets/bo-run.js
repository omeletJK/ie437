/* ============================================================
   widget: bo-run
   The worked example of the source deck (pp. 129–138), run live:
       maximise  f(x) = -1.3x^4 + x^3 + 1.5x^2 + 1 + eps,
       -1 <= x <= 1.5,  eps ~ N(0, 0.01^2)
   Each press fits the GP, maximises EI over a grid, pays for one
   evaluation and appends it. The second query goes to the far
   boundary; by the eighth the queries have collapsed on the true
   optimum x* = 1.1010, f* = 2.2427, and max EI has fallen to 0.003.
   ============================================================ */
IE437.widget('bo-run', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', RED = '#D64545';

  function chol(A) {
    var n = A.length, L = [], i, j, k, s;
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      s = A[i][j];
      for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (s <= 0) s = 1e-10; L[i][j] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function solveL(L, b) { var n = L.length, y = new Float64Array(n), i, k, s;
    for (i = 0; i < n; i++) { s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; }
  function solveLT(L, b) { var n = L.length, x = new Float64Array(n), i, k, s;
    for (i = n - 1; i >= 0; i--) { s = b[i]; for (k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; } return x; }
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x));
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var pdf = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };

  var S0 = 1.2, LAM = 0.35, SN = 0.01;
  function kSE(a, b) { var d = a - b; return S0 * S0 * Math.exp(-0.5 * d * d / (LAM * LAM)); }
  var f = function (x) { return -1.3 * Math.pow(x, 4) + Math.pow(x, 3) + 1.5 * x * x + 1; };
  var XD = [-1, 1.5], XSTAR = 1.1010, FSTAR = 2.2427, MAXN = 10;

  var GRID = []; (function () { for (var i = 0; i <= 500; i++) GRID.push(XD[0] + (XD[1] - XD[0]) * i / 500); })();

  var rand, X, Y;
  function reset() { rand = IE437.rng(opts.seed || 3); X = [0.30]; Y = [f(0.30) + SN * gauss()]; }
  function gauss() {
    var u = Math.max(1e-9, rand()), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function fit() {
    var n = X.length, K = [], i, j;
    for (i = 0; i < n; i++) K.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) K[i][j] = kSE(X[i], X[j]) + (i === j ? SN * SN + 1e-8 : 0);
    var m0 = 0; for (i = 0; i < n; i++) m0 += Y[i] / n;
    var L = chol(K), a = solveLT(L, solveL(L, Y.map(function (v) { return v - m0; })));
    return { L: L, a: a, m0: m0 };
  }
  function pred(g, x) {
    var n = X.length, k = new Float64Array(n), i, mu = g.m0, vv = 0;
    for (i = 0; i < n; i++) k[i] = kSE(x, X[i]);
    for (i = 0; i < n; i++) mu += k[i] * g.a[i];
    var v = solveL(g.L, k);
    for (i = 0; i < n; i++) vv += v[i] * v[i];
    return { mu: mu, s: Math.sqrt(Math.max(1e-12, S0 * S0 - vv)) };
  }
  function eiCurve(g) {
    var fmax = Math.max.apply(null, Y);
    return GRID.map(function (x) {
      var p = pred(g, x);
      if (p.s < 1e-9) return 0;
      var z = (p.mu - fmax) / p.s;
      return (p.mu - fmax) * PHI(z) + p.s * pdf(z);
    });
  }
  function step() {
    if (X.length >= MAXN) return;
    var g = fit(), ei = eiCurve(g), b = -1, bi = 0, i;
    for (i = 0; i < ei.length; i++) if (ei[i] > b) { b = ei[i]; bi = i; }
    X.push(GRID[bi]); Y.push(f(GRID[bi]) + SN * gauss());
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Bayesian optimisation, ten queries</span><span class="wspacer"></span>' +
    '<span class="wlabel">queries</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-s1>next query</button><button class="wb" data-auto data-s5>&times;5</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;gap:4px"><div data-c1></div><div data-c2></div></div>' +
    '<div style="width:236px;display:flex;flex-direction:column;gap:9px">' +
    '<div class="wlabel">query log</div>' +
    '<div data-log style="font:400 12px/1.55 var(--mono);color:var(--ink2);' +
    'font-variant-numeric:tabular-nums"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div>';

  var W = 600, H1 = 190, H2 = 96;
  var sv1 = IE437.svg(W, H1), sv2 = IE437.svg(W, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  var L = 34, R = 12;
  var PX = function (v) { return L + (v - XD[0]) / (XD[1] - XD[0]) * (W - L - R); };
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  function draw() {
    var g = fit(), ei = eiCurve(g), i;
    var lo = -0.6, hi = 3.4;
    var Y1 = function (v) { return H1 - 20 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (H1 - 32); };

    clear(sv1);
    var P = GRID.map(function (x) { return pred(g, x); });
    var d = 'M' + PX(GRID[0]) + ' ' + Y1(P[0].mu + 2 * P[0].s);
    for (i = 1; i < P.length; i++) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y1(P[i].mu + 2 * P[i].s).toFixed(1);
    for (i = P.length - 1; i >= 0; i--) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y1(P[i].mu - 2 * P[i].s).toFixed(1);
    E('path', { d: d + 'Z', fill: BLUE, 'fill-opacity': .13 }, sv1);
    E('path', { d: GRID.map(function (x, k) { return (k ? 'L' : 'M') + PX(x).toFixed(1) + ' ' + Y1(f(x)).toFixed(1); }).join(''),
      fill: 'none', stroke: INK, 'stroke-opacity': .5, 'stroke-width': 1.6 }, sv1);
    E('path', { d: P.map(function (p, k) { return (k ? 'L' : 'M') + PX(GRID[k]).toFixed(1) + ' ' + Y1(p.mu).toFixed(1); }).join(''),
      fill: 'none', stroke: BLUE, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }, sv1);

    var fmax = Math.max.apply(null, Y);
    E('line', { x1: L, y1: Y1(fmax), x2: W - R, y2: Y1(fmax), stroke: GREEN, 'stroke-width': 1.4,
      'stroke-dasharray': '5 4' }, sv1);
    E('text', { x: L + 4, y: Y1(fmax) - 5, 'font-size': 9.5, fill: GREEN,
      'font-family': 'IBM Plex Mono, monospace', text: 'f max = ' + fmax.toFixed(3) }, sv1);
    E('path', { d: 'M' + (PX(XSTAR) - 5) + ' ' + (Y1(FSTAR) - 5) + 'l10 10M' + (PX(XSTAR) + 5) + ' ' + (Y1(FSTAR) - 5) + 'l-10 10',
      stroke: INK, 'stroke-width': 1.8 }, sv1);
    X.forEach(function (x, k) {
      E('circle', { cx: PX(x), cy: Y1(Y[k]), r: 4.2, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, sv1);
      if (k === X.length - 1) E('circle', { cx: PX(x), cy: Y1(Y[k]), r: 2, fill: RED }, sv1);
    });
    E('line', { x1: L, y1: H1 - 20, x2: W - R, y2: H1 - 20, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: L, y1: 8, x2: L, y2: H1 - 20, stroke: INK, 'stroke-opacity': .28 }, sv1);
    [0, 1, 2, 3].forEach(function (t) {
      E('text', { x: L - 5, y: Y1(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv1);
    });
    E('text', { x: L + 6, y: 18, 'font-size': 10, 'font-weight': 700, fill: BLUE, text: 'μ ± 2σ' }, sv1);
    E('text', { x: L + 68, y: 18, 'font-size': 10, 'font-weight': 700, fill: INK, 'fill-opacity': .55, text: 'true f' }, sv1);

    /* --- EI panel --- */
    clear(sv2);
    var eh = Math.max(1e-6, Math.max.apply(null, ei));
    var Y2 = function (v) { return H2 - 22 - v / eh * (H2 - 34); };
    E('path', { d: 'M' + PX(GRID[0]) + ' ' + Y2(0) +
      ei.map(function (v, k) { return 'L' + PX(GRID[k]).toFixed(1) + ' ' + Y2(v).toFixed(1); }).join('') +
      'L' + PX(GRID[GRID.length - 1]) + ' ' + Y2(0) + 'Z', fill: AMBER, 'fill-opacity': .16,
      stroke: AMBER, 'stroke-width': 2 }, sv2);
    var b = -1, bi = 0;
    for (i = 0; i < ei.length; i++) if (ei[i] > b) { b = ei[i]; bi = i; }
    if (X.length < MAXN) {
      E('line', { x1: PX(GRID[bi]), y1: Y2(b), x2: PX(GRID[bi]), y2: Y2(0), stroke: GREEN, 'stroke-width': 1.4,
        'stroke-dasharray': '3 3' }, sv2);
      E('path', { d: 'M' + (PX(GRID[bi]) - 5) + ' ' + (Y2(b) - 11) + 'h10l-5 9Z', fill: GREEN }, sv2);
      E('text', { x: PX(GRID[bi]) + 8, y: Y2(b) - 4, 'font-size': 10, 'font-weight': 700, fill: GREEN,
        text: 'next' }, sv2);
    }
    E('line', { x1: L, y1: Y2(0), x2: W - R, y2: Y2(0), stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('line', { x1: L, y1: 8, x2: L, y2: Y2(0), stroke: INK, 'stroke-opacity': .28 }, sv2);
    [-1, -0.5, 0, 0.5, 1, 1.5].forEach(function (t) {
      E('text', { x: PX(t), y: H2 - 8, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv2);
    });
    E('text', { x: W - R - 3, y: 18, 'text-anchor': 'end', 'font-size': 10, 'font-weight': 700, fill: AMBER,
      text: 'EI(x)   max ' + b.toFixed(3) }, sv2);

    /* --- readout --- */
    host.querySelector('[data-n]').textContent = X.length + ' / ' + MAXN;
    var rows = X.map(function (x, k) {
      var run = Math.max.apply(null, Y.slice(0, k + 1));
      return '<div style="display:flex;justify-content:space-between' +
        (k === X.length - 1 ? ';color:' + RED + ';font-weight:600' : '') + '">' +
        '<span>' + (k + 1) + '</span><span>x = ' + x.toFixed(3) + '</span><span>' + run.toFixed(3) + '</span></div>';
    }).join('');
    host.querySelector('[data-log]').innerHTML =
      '<div style="display:flex;justify-content:space-between;color:var(--ink4);font-size:9.5px;' +
      'letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px"><span>n</span><span>query</span><span>best</span></div>' + rows;

    var gap = FSTAR - fmax, note;
    if (X.length === 1) note = 'One seed point. The posterior is nearly the prior and EI is largest where the model knows least.';
    else if (X.length === 2) note = 'The second query went to <b>the far boundary</b>. The mean there is unremarkable; the uncertainty is enormous. That is exploration, priced.';
    else if (gap > 0.05) note = 'Still climbing. EI is being spent partly on learning, partly on winning.';
    else if (b > 0.02) note = 'On the peak, and still checking &mdash; EI has not yet gone quiet.';
    else note = '<b>Converged.</b> Max EI is ' + b.toFixed(3) + ': the model no longer expects to learn anything by asking again.';
    host.querySelector('[data-note]').innerHTML =
      note + '<br><span style="color:var(--ink4)">true optimum f* = 2.2427 at x* = 1.1010</span>';
  }

  host.querySelector('[data-s1]').onclick = function () { step(); draw(); };
  host.querySelector('[data-s5]').onclick = function () { for (var i = 0; i < 5; i++) step(); draw(); };
  host.querySelector('[data-rs]').onclick = function () { reset(); draw(); };

  reset(); draw();
  return { finish: function () { reset(); while (X.length < MAXN) step(); draw(); } };
});
