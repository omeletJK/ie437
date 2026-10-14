/* ============================================================
   widget: kl-tilt                                  (Chapter 6, Act 4)
   A KL-regularised view of candidate distributions, drawn:
        q*(x) ∝ p(x) · exp(beta · score(x))
   the exact maximiser of E_q[score] - (1/beta) KL(q || p).
   The same fifteen points and the same hidden f as Lecture 5. The
   "generator" p is a kernel density of the fifteen designs (bandwidth
   0.5) with half a percent of its mass spread over [0, 10] — a learned
   generator is never exactly zero away from its data.
   Walked by the deck's ->:
     0  score = Lecture 5's data-only surrogate (climbs to 4.31 at x = 10)
     1  score = mu - 2 sigma from Lecture 5's GP (lcb-flip)
   Drag beta. Verified in node (seed 17, 1001-point grid):
     surrogate  beta 0    E_q f 1.52  (the data's average)
                beta 2    E_q f 1.90  KL 0.72  mass beyond x = 6: 12%
                beta 3    E_q f 1.49  mode jumps to x = 10
                beta 5    E_q f 0.15  96% beyond x = 6
     mu - 2 sd  beta 2    E_q f 2.00;  beta 8  E_q f 2.43 (best in D 2.43),
                mass beyond x = 6 under 1% at every beta
   ============================================================ */
IE437.widget('kl-tilt', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#B45309', RED = '#D64545', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, N = 15, LAM = 0.06, BW = 0.5, EPS = 0.005;
  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  var R = IE437.rng(opts.seed || 17), D = [], i, j;
  for (i = 0; i < N; i++) {
    var xi = DL + (DR - DL) * (i + 0.5 + 0.55 * (R() - 0.5)) / N;
    D.push({ x: xi, y: ftrue(xi) + 0.045 * (R() * 2 - 1) });
  }
  /* Lecture 5's data-only surrogate: ridge on ReLU knots */
  var KN = []; for (j = 0; j < 26; j++) KN.push(0.35 + 9.3 * j / 25);
  function phi(x) { var v = [1, x / 5]; KN.forEach(function (k) { v.push(Math.max(0, x - k) / 3); v.push(Math.max(0, k - x) / 3); }); return v; }
  var P = phi(0).length, A = [], bb = new Array(P).fill(0);
  for (i = 0; i < P; i++) A.push(new Array(P).fill(0));
  D.forEach(function (d) { var p = phi(d.x); for (var a = 0; a < P; a++) { bb[a] += p[a] * d.y / N; for (var c = 0; c < P; c++) A[a][c] += p[a] * p[c] / N; } });
  for (i = 0; i < P; i++) A[i][i] += (i < 2 ? LAM * 1e-2 : LAM);
  function solve(M0, b) {
    var n = b.length, M = M0.map(function (r, k) { return r.concat([b[k]]); }), c, r, k, p, d, f, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      t = M[c]; M[c] = M[p]; M[p] = t; d = M[c][c]; for (k = c; k <= n; k++) M[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = M[r][c]; if (!f) continue; for (k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (row) { return row[n]; });
  }
  var WV = solve(A, bb);
  function fhat(x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += WV[a] * p[a]; return s; }
  /* Lecture 5's GP: linear-trend mean, RBF residual (lcb-flip) */
  var mx = 0, my = 0; D.forEach(function (d) { mx += d.x / N; my += d.y / N; });
  var sxy = 0, sxx = 0; D.forEach(function (d) { sxy += (d.x - mx) * (d.y - my); sxx += (d.x - mx) * (d.x - mx); });
  var slope = sxy / sxx, S2 = 1, SN2 = 0.05 * 0.05;
  function mf(x) { return my + slope * (x - mx); }
  function kf(a, b) { return S2 * Math.exp(-0.5 * Math.pow(a - b, 2)); }
  var K = D.map(function (a) { return D.map(function (b) { return kf(a.x, b.x); }); });
  for (i = 0; i < N; i++) K[i][i] += SN2;
  var L = []; for (i = 0; i < N; i++) L.push(new Array(N).fill(0));
  for (i = 0; i < N; i++) for (j = 0; j <= i; j++) { var s = K[i][j]; for (var qq = 0; qq < j; qq++) s -= L[i][qq] * L[j][qq]; L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j]; }
  function fwd(b) { var y = []; for (var a = 0; a < N; a++) { var s = b[a]; for (var c = 0; c < a; c++) s -= L[a][c] * y[c]; y.push(s / L[a][a]); } return y; }
  function bwd(y) { var x = new Array(N); for (var a = N - 1; a >= 0; a--) { var s = y[a]; for (var c = a + 1; c < N; c++) s -= L[c][a] * x[c]; x[a] = s / L[a][a]; } return x; }
  var al = bwd(fwd(D.map(function (d) { return d.y - mf(d.x); })));
  function lcb(x) {
    var ks = D.map(function (d) { return kf(x, d.x); }), m = mf(x), a;
    for (a = 0; a < N; a++) m += ks[a] * al[a];
    var v = fwd(ks), vv = 0; for (a = 0; a < N; a++) vv += v[a] * v[a];
    return m - 2 * Math.sqrt(Math.max(S2 - vv, 1e-12));
  }
  /* the generator, on a grid */
  var G = [], DX = (X1 - X0) / 1000;
  for (i = 0; i <= 1000; i++) G.push(X0 + i * DX);
  var PR = G.map(function (x) {
    var s = 0; D.forEach(function (d) { s += Math.exp(-0.5 * Math.pow((x - d.x) / BW, 2)) / (BW * Math.sqrt(2 * Math.PI)); });
    return (1 - EPS) * s / N + EPS / (X1 - X0);
  });
  var SC = [G.map(fhat), G.map(lcb)], TR = G.map(ftrue);

  var beta = typeof opts.beta === 'number' ? opts.beta : 2, B0 = beta, st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">Tilt the generator by a performance estimate</span><span class="wspacer"></span>' +
    '<span class="wlabel">how hard to tilt</span><span class="wnum" data-b></span><span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:300px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 13px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12.5px/1.55 var(--sans);color:var(--ink3);border-top:1px solid rgba(22,24,29,.1);padding-top:9px"></div></div></div>';
  var CW = 640, CH = 300, Lm = 34, Rm = 14;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return Lm + (v - X0) / (X1 - X0) * (CW - Lm - Rm); };
  var T1 = 16, B1 = 128, YLO = -0.9, YHI = 4.8;                 /* score panel */
  var T2 = 150, B2 = 270;                                       /* density panel */
  var PY = function (v) { return B1 - (v - YLO) / (YHI - YLO) * (B1 - T1); };

  function tilt() {
    var sc = SC[st], lw = G.map(function (x, n) { return Math.log(PR[n]) + beta * sc[n]; });
    var m = Math.max.apply(null, lw), w = lw.map(function (v) { return Math.exp(v - m); });
    var Z = w.reduce(function (a, b) { return a + b; }, 0), q = w.map(function (v) { return v / Z / DX; });
    var Ef = 0, Es = 0, KL = 0, out = 0;
    q.forEach(function (qd, n) {
      var pm = qd * DX; Ef += pm * TR[n]; Es += pm * sc[n];
      if (pm > 0) KL += pm * Math.log(qd / PR[n]); if (G[n] > 6) out += pm;
    });
    return { q: q, Ef: Ef, Es: Es, KL: KL, out: out };
  }
  function path(vals, yf, col, w, dash, op) {
    var pts = G.map(function (x, n) { return PX(x).toFixed(1) + ' ' + yf(vals[n]).toFixed(1); });
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '',
      'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, sv);
  }
  function area(vals, yf, col, op, line) {
    var pts = G.map(function (x, n) { return PX(x).toFixed(1) + ' ' + yf(vals[n]).toFixed(1); });
    E('path', { d: 'M' + PX(X0) + ' ' + B2 + 'L' + pts.join('L') + 'L' + PX(X1) + ' ' + B2 + 'Z', fill: col, 'fill-opacity': op,
      stroke: line ? col : 'none', 'stroke-width': 1.8 }, sv);
  }
  function f2(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var T = tilt(), col = st ? GREEN : BLUE;
    E('rect', { x: PX(DL), y: T1, width: PX(DR) - PX(DL), height: B2 - T1, fill: SLATE, 'fill-opacity': .08 }, sv);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T1 + 11, 'text-anchor': 'middle', 'font-size': 9, 'font-family': MONO,
      fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, sv);
    /* score panel */
    E('line', { x1: Lm, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .2 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: T1, y2: B1, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 2, 4].forEach(function (v) { E('text', { x: Lm - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK,
      'fill-opacity': .45, 'font-family': MONO, text: v }, sv); });
    path(TR, PY, INK, 2, '', .34);
    path(SC[st], PY, col, 2.2, st ? '' : '5 3');
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.6, fill: INK }, sv); });
    E('text', { x: PX(9.85), y: PY(SC[st][985]) + (st ? 16 : -8), 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700,
      fill: col, text: st ? 'estimate = μ − 2σ' : 'estimate = Lecture 5’s surrogate' }, sv);
    E('line', { x1: PX(6.2), x2: PX(6.2) + 16, y1: PY(-0.45), y2: PY(-0.45), stroke: INK, 'stroke-width': 2, 'stroke-opacity': .34 }, sv);
    E('text', { x: PX(6.2) + 21, y: PY(-0.45) + 3.5, 'font-size': 10, 'font-weight': 700, fill: INK, 'fill-opacity': .55,
      text: 'true f — never queried' }, sv);
    /* density panel */
    var mxd = Math.max(Math.max.apply(null, PR) * 1.15, Math.min(Math.max.apply(null, T.q), 4 * Math.max.apply(null, PR)));
    var DY = function (v) { return B2 - Math.min(v / mxd, 1.04) * (B2 - T2); };
    E('line', { x1: Lm, x2: CW - Rm, y1: B2, y2: B2, stroke: INK, 'stroke-opacity': .3 }, sv);
    area(PR, DY, SLATE, .22);
    area(T.q, DY, col, .22, true);
    E('text', { x: PX(1.1), y: T2 + 4, 'font-size': 10.5, 'font-weight': 700, fill: SLATE, text: 'generator p' }, sv);
    E('text', { x: PX(1.1), y: T2 + 18, 'font-size': 10.5, 'font-weight': 700, fill: col, text: 'tilted q ∝ p · e^(β · estimate)' }, sv);
    E('text', { x: CW / 2, y: CH - 4, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK,
      'fill-opacity': .45, text: 'design x' }, sv);

    host.querySelector('[data-b]').textContent = 'β = ' + beta.toFixed(1);
    var good = T.Ef >= 1.8;
    host.querySelector('[data-num]').innerHTML =
      'the model promises <b style="color:' + col + '">' + f2(T.Es) + '</b><br>' +
      'what q delivers, on average <b style="color:' + (good ? GREEN : T.Ef < 1 ? RED : AMBER) + '">' + f2(T.Ef) + '</b><br>' +
      'mass beyond the data (x &gt; 6) <b>' + Math.round(100 * T.out) + '%</b><br>' +
      'distance from the generator, KL <b>' + T.KL.toFixed(2) + '</b>' +
      '<br><span style="color:var(--ink3)">the data: average 1.52, best 2.43</span>';
    host.querySelector('[data-note]').innerHTML = st
      ? 'Tilt by <b>μ − 2σ</b> instead. In this example a large β piles q onto the best edge of the data and leaves it there: the pessimistic estimate suppresses improvements the data does not support. Its reliability still depends on the uncertainty estimate.'
      : beta === 0 ? 'β = 0: q is the generator itself — designs like the data.'
      : T.out < 0.3 ? 'A gentle tilt pulls q to the high end of the data, and the truth rises with it — q stays where the generator has mass.'
      : 'Too hard a tilt overwhelms the generator’s thin tail: q leaves for x = 10, where the surrogate promises 4.3 and the truth is about zero. ==Lecture 5’s failure, as a distribution.=='.replace(/==(.+?)==/g, '<b>$1</b>');
  }
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: 8, step: 0.5, value: beta,
    on: function (v) { beta = +v; draw(); }
  });
  var show = function (k) { st = Math.max(0, Math.min(1, k)); draw(); };
  show(0);
  return {
    steps: 1, step: show,
    reset: function () { beta = B0; dial.set(B0, false); show(0); },
    finish: function () { beta = B0; dial.set(B0, false); show(1); }
  };
});
