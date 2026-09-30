/* ============================================================
   widget: acq-optimisers
   The inner problem of Bayesian optimisation, x_{t+1} = argmax a_t(x),
   drawn on one real Expected-Improvement surface: a GP on twenty
   observations in [0,1]^2, EI against the best of them. The surface is
   what the source deck (pp. 209-212) warns about — flat almost
   everywhere, with narrow peaks — and the three optimisers of pp. 139-149
   are run on it, one per mode, each walked by the deck's arrow key:

     surface  the landscape, and a slice through it on a slider
     grad     multi-start gradient ascent, with the analytic gradient
              grad EI = Phi(z) grad mu + phi(z) grad sigma
     direct   DIRECT (Jones, Perttunen & Stuckman 1993): trisect every
              box on the upper-right hull of (size, value)
     cma      CMA-ES (Hansen & Ostermeier 2001), rank-mu estimation as on
              the source's p. 148: sample, select, re-fit the Gaussian

   Every mode counts its evaluations of a_t, because that is the
   resource being spent — cheap, but not free.
   ============================================================ */
IE437.widget('acq-optimisers', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', RED = '#D64545',
      SLATE = '#64748B', YELLOW = '#FACC15', GREEN = '#16A34A';
  var MODE = (opts && opts.mode) || 'surface';
  var MONO = 'IBM Plex Mono, monospace';

  /* ---------- the GP and its Expected Improvement ---------- */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var phi = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };
  function chol(A) {
    var n = A.length, L = [], i, j, k, s;
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      s = A[i][j];
      for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) L[i][j] = Math.sqrt(Math.max(s, 1e-12)); else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function solveL(L, b) { var n = L.length, y = new Float64Array(n), i, k, s;
    for (i = 0; i < n; i++) { s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; }
  function solveLT(L, b) { var n = L.length, x = new Float64Array(n), i, k, s;
    for (i = n - 1; i >= 0; i--) { s = b[i]; for (k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; } return x; }

  var S0 = 0.35, LAM = 0.15, SN = 0.01;
  function F(x, y) {                      /* the unknown objective, used only to make the data */
    var g = function (a, b, s, h) { return h * Math.exp(-((x - a) * (x - a) + (y - b) * (y - b)) / (2 * s * s)); };
    return g(0.72, 0.30, 0.09, 1) + g(0.24, 0.70, 0.11, 0.8) + g(0.80, 0.80, 0.08, 0.7) - 0.3;
  }
  function halton(i, b) { var f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; }
  var X = [], Y = [], q;
  for (q = 1; q <= 20; q++) X.push([0.04 + 0.92 * halton(q, 2), 0.04 + 0.92 * halton(q, 3)]);
  Y = X.map(function (p) { return F(p[0], p[1]); });
  var n = X.length;
  function kern(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1];
    return S0 * S0 * Math.exp(-0.5 * (dx * dx + dy * dy) / (LAM * LAM)); }
  var K = X.map(function (a) { return X.map(function (b) { return kern(a, b); }); });
  for (q = 0; q < n; q++) K[q][q] += SN * SN;
  var LC = chol(K), ALPHA = solveLT(LC, solveL(LC, Y)), FPLUS = Math.max.apply(null, Y);

  var NEVAL = 0;                           /* every call is one evaluation of a_t */
  function acq(x, wantGrad) {
    NEVAL++;
    var kx = new Float64Array(n), i, mu = 0;
    for (i = 0; i < n; i++) { kx[i] = kern(x, X[i]); mu += kx[i] * ALPHA[i]; }
    var v = solveL(LC, kx), vv = 0;
    for (i = 0; i < n; i++) vv += v[i] * v[i];
    var s = Math.sqrt(Math.max(1e-12, S0 * S0 - vv)), z = (mu - FPLUS) / s;
    var a = Math.max(0, (mu - FPLUS) * PHI(z) + s * phi(z));
    if (!wantGrad) return a;
    /* grad EI = Phi(z) grad mu + phi(z) grad sigma  (dEI/dmu = Phi, dEI/dsigma = phi) */
    var w = solveLT(LC, v), gm = [0, 0], gv = [0, 0], d;
    for (i = 0; i < n; i++) for (d = 0; d < 2; d++) {
      var dk = -kx[i] * (x[d] - X[i][d]) / (LAM * LAM);
      gm[d] += dk * ALPHA[i]; gv[d] += dk * w[i];
    }
    var gs = [-gv[0] / s, -gv[1] / s];
    return { a: a, g: [PHI(z) * gm[0] + phi(z) * gs[0], PHI(z) * gm[1] + phi(z) * gs[1]] };
  }

  /* the dense grid: the heat map, and the true maximum for scoring */
  var NG = 100, GRID = [], gmax = 0, gi = [0, 0], i, j;
  for (j = 0; j < NG; j++) for (i = 0; i < NG; i++) {
    var v0 = acq([(i + 0.5) / NG, (j + 0.5) / NG]);
    GRID.push(v0); if (v0 > gmax) { gmax = v0; gi = [(i + 0.5) / NG, (j + 0.5) / NG]; }
  }
  var TRUE = climb(gi, 80).path.slice(-1)[0], AMAX = acq(TRUE);
  NEVAL = 0;

  function clip(u) { return Math.max(0, Math.min(1, u)); }
  /* gradient ascent with a backtracking step; stops like L-BFGS does, on a small gradient */
  function climb(x0, iters) {
    var x = x0.slice(), r = acq(x, true), path = [x.slice()], vals = [r.a], st = 0.04, it, gn, xn, rn;
    for (it = 0; it < iters; it++) {
      gn = Math.sqrt(r.g[0] * r.g[0] + r.g[1] * r.g[1]);
      if (gn < 1e-4) break;                                  /* gradient tolerance */
      xn = [clip(x[0] + st * r.g[0] / gn), clip(x[1] + st * r.g[1] / gn)];
      rn = acq(xn, true);
      if (rn.a > r.a) { x = xn; r = rn; st = Math.min(0.08, st * 1.3); path.push(x.slice()); vals.push(r.a); }
      else { st *= 0.5; if (st < 2e-4) break; }
    }
    return { path: path, vals: vals, a: r.a };
  }

  /* ---------- layout ---------- */
  var TITLES = {
    surface: 'The inner problem — a_t(x) on [0,1]²',
    grad: 'Gradient ascent, from many starts',
    direct: 'DIRECT — divide the rectangles',
    cma: 'CMA-ES — move a Gaussian'
  };
  var SIDE = {
    surface: 'a_t along the slice',
    grad: 'a_t at each start, per ascent step',
    direct: 'every box: size vs value at its centre',
    cma: 'best a_t found vs evaluations'
  };
  host.innerHTML =
    '<div class="wbar"><span class="wt">' + TITLES[MODE] + '</span><span class="wspacer"></span>' +
    (MODE === 'surface' ? '<span class="wlabel">slice x₂</span><span class="wnum" data-l></span><span data-sl></span>' : '') +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">EI surface a_t(x) · crosses = experiments so far</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">' + SIDE[MODE] + '</div><div data-c2></div></div>' +
    '<div style="width:300px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px;min-height:96px"></div></div></div>';

  var W1 = 232, H1 = 232, W2 = 272, H2 = 200;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  var M = 22, SZ = W1 - M - 8;             /* map square */
  var PX = function (u) { return M + u * SZ; };
  var PY = function (v) { return 6 + (1 - v) * SZ; };

  /* the heat map, painted once into an image (colour ~ sqrt(a) so the plains read as plains) */
  var HEAT = (function () {
    var c = document.createElement('canvas'); c.width = NG; c.height = NG;
    var ctx = c.getContext('2d'), im = ctx.createImageData(NG, NG), lo = [247, 246, 241], hi = [30, 64, 175];
    for (var jj = 0; jj < NG; jj++) for (var ii = 0; ii < NG; ii++) {
      var t = Math.sqrt(Math.max(0, GRID[jj * NG + ii]) / gmax), p = ((NG - 1 - jj) * NG + ii) * 4;
      im.data[p] = lo[0] + (hi[0] - lo[0]) * t; im.data[p + 1] = lo[1] + (hi[1] - lo[1]) * t;
      im.data[p + 2] = lo[2] + (hi[2] - lo[2]) * t; im.data[p + 3] = 255;
    }
    ctx.putImageData(im, 0, 0);
    return c.toDataURL();
  })();

  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  function txt(s, x, y, t, o) {
    o = o || {};
    return E('text', { x: x, y: y, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 9,
      fill: o.fill || INK, 'fill-opacity': o.op == null ? .5 : o.op, 'font-weight': o.weight || 400,
      'font-family': o.font || MONO, text: t }, s);
  }
  function map() {
    clear(sv1);
    var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');   /* IE437.el has no <image> */
    [['href', HEAT], ['x', PX(0)], ['y', PY(1)], ['width', SZ], ['height', SZ], ['preserveAspectRatio', 'none']]
      .forEach(function (kv) { img.setAttribute(kv[0], kv[1]); });
    sv1.appendChild(img);
    E('rect', { x: PX(0), y: PY(1), width: SZ, height: SZ, fill: 'none', stroke: INK, 'stroke-opacity': .35 }, sv1);
    [0, 0.5, 1].forEach(function (t) {
      txt(sv1, PX(t), PY(0) + 12, t);
      txt(sv1, PX(0) - 5, PY(t) + 3, t, { anchor: 'end' });
    });
    X.forEach(function (p) {
      var x = PX(p[0]), y = PY(p[1]);
      E('path', { d: 'M' + (x - 3) + ' ' + (y - 3) + 'l6 6M' + (x + 3) + ' ' + (y - 3) + 'l-6 6',
        stroke: INK, 'stroke-width': 1.4, 'stroke-opacity': .75, 'stroke-linecap': 'round' }, sv1);
    });
  }
  function dot(p, r, fill, o) {
    o = o || {};
    return E('circle', { cx: PX(p[0]), cy: PY(p[1]), r: r, fill: fill, 'fill-opacity': o.op == null ? 1 : o.op,
      stroke: o.stroke || 'none', 'stroke-width': o.sw || 1.2 }, sv1);
  }
  function star(p, col) {
    var x = PX(p[0]), y = PY(p[1]), d = '', k, r;
    for (k = 0; k < 10; k++) { r = k % 2 ? 3.2 : 8; var an = -Math.PI / 2 + k * Math.PI / 5;
      d += (k ? 'L' : 'M') + (x + r * Math.cos(an)).toFixed(1) + ' ' + (y + r * Math.sin(an)).toFixed(1); }
    E('path', { d: d + 'Z', fill: col, stroke: '#fff', 'stroke-width': 1.2 }, sv1);
  }
  function trueMark() {
    E('circle', { cx: PX(TRUE[0]), cy: PY(TRUE[1]), r: 9, fill: 'none', stroke: RED, 'stroke-width': 1.4,
      'stroke-dasharray': '3 2' }, sv1);
  }
  /* a small x-y panel on the right */
  function panel(xd, yd, xl, yl, xfmt, logx) {
    clear(sv2);
    var L0 = 40, R0 = W2 - 10, T0 = 10, B0 = H2 - 30;
    var tx = logx ? function (v) { return Math.log(v); } : function (v) { return v; };
    var P = {
      x: function (v) { return L0 + (tx(v) - tx(xd[0])) / (tx(xd[1]) - tx(xd[0])) * (R0 - L0); },
      y: function (v) { return B0 - (Math.max(yd[0], Math.min(yd[1], v)) - yd[0]) / (yd[1] - yd[0]) * (B0 - T0); },
      L0: L0, R0: R0, T0: T0, B0: B0
    };
    E('line', { x1: L0, y1: T0, x2: L0, y2: B0, stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('line', { x1: L0, y1: B0, x2: R0, y2: B0, stroke: INK, 'stroke-opacity': .3 }, sv2);
    txt(sv2, (L0 + R0) / 2, H2 - 4, xl);
    E('text', { x: 11, y: (T0 + B0) / 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5,
      'font-family': MONO, transform: 'rotate(-90 11 ' + (T0 + B0) / 2 + ')', text: yl }, sv2);
    [yd[0], (yd[0] + yd[1]) / 2, yd[1]].forEach(function (t) {
      txt(sv2, L0 - 4, P.y(t) + 3, t.toFixed(3), { anchor: 'end', size: 8 });
    });
    (xfmt.ticks || []).forEach(function (t) { txt(sv2, P.x(t), B0 + 11, xfmt.f(t), { size: 8 }); });
    return P;
  }
  function poly(P, xs, ys, col, w, o) {
    o = o || {};
    var d = xs.map(function (x, k) { return (k ? 'L' : 'M') + P.x(x).toFixed(1) + ' ' + P.y(ys[k]).toFixed(1); }).join('');
    return E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-opacity': o.op == null ? 1 : o.op,
      'stroke-dasharray': o.dash || 'none' }, sv2);
  }
  function readout(rows, note) {
    host.querySelector('[data-num]').innerHTML = rows.join('<br>');
    host.querySelector('[data-note]').innerHTML = note;
  }
  var f3 = function (v) { return v.toFixed(4); };
  var pct = function (v) { return Math.round(100 * v / AMAX) + '%'; };

  /* ================= mode: surface ================= */
  if (MODE === 'surface') {
    var SL = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90], si = 6;
    var drawS = function () {
      var y = SL[si];
      map();
      E('line', { x1: PX(0), y1: PY(y), x2: PX(1), y2: PY(y), stroke: AMBER, 'stroke-width': 1.8 }, sv1);
      trueMark();
      var xs = [], ys = [], k;
      for (k = 0; k <= 200; k++) { xs.push(k / 200); ys.push(acq([k / 200, y])); }
      NEVAL = 0;
      var P = panel([0, 1], [0, Math.ceil(AMAX * 100) / 100], 'x₁  (at the slice x₂)', 'a_t', { ticks: [0, 0.5, 1], f: String });
      poly(P, xs, ys, AMBER, 2);
      var flat = ys.filter(function (v) { return v < 0.02 * AMAX; }).length / ys.length;
      host.querySelector('[data-l]').textContent = y.toFixed(2);
      readout([
        '<b>' + n + '</b> experiments so far, best f⁺ = <b>' + FPLUS.toFixed(3) + '</b>',
        'max a_t on the map <b>' + f3(AMAX) + '</b>',
        '<span style="color:' + AMBER + '">on this slice</span>, a_t &lt; 2% of the max on <b>' + Math.round(100 * flat) + '%</b>'
      ], 'Cheap to evaluate — one GP prediction, O(<i>n</i>²) — but <b>flat almost everywhere</b>: wherever the GP is sure a point cannot beat f⁺, both a_t and its gradient are ≈ 0. The peaks are narrow and several. The dashed ring is the true maximiser.');
    };
    var dialS = IE437.slider(host.querySelector('[data-sl]'), {
      bare: true, min: 0, max: SL.length - 1, step: 1, value: si, on: function (v) { si = v; drawS(); }
    });
    drawS();
    return {
      reset: function () { si = 6; dialS.set(6, false); drawS(); },
      finish: function () { si = 6; dialS.set(6, false); drawS(); }
    };
  }

  /* ================= mode: grad ================= */
  /* Six fixed starts climb together; each press of -> is PER ascent steps for all of
     them, and the last press picks the best end point. One start sits on the plain,
     where the gradient is ~0, so it never moves: the reason for many starts. */
  if (MODE === 'grad') {
    var STARTS = [[0.25, 0.58], [0.92, 0.75], [0.58, 0.25], [0.92, 0.08], [0.42, 0.92], [0.42, 0.42]];
    var COLS = [BLUE, AMBER, GREEN, '#7C3AED', '#DB2777', SLATE];
    var runs = STARTS.map(function (p) { return climb(p, 80); });
    var PER = 2, LONG = Math.max.apply(null, runs.map(function (r) { return r.path.length - 1; }));
    var NCLIMB = Math.ceil(LONG / PER), NSG = NCLIMB + 1;
    var bestK = 0; runs.forEach(function (r, k) { if (r.a > runs[bestK].a) bestK = k; });
    var gs = 0;
    var drawG = function () {
      map();
      var it = Math.min(gs * PER, LONG), picked = gs === NSG;
      var P = panel([0, LONG], [0, Math.ceil(AMAX * 100) / 100], 'ascent step', 'a_t',
        { ticks: [0, Math.round(LONG / 2), LONG], f: String });
      E('line', { x1: P.x(it), y1: P.T0, x2: P.x(it), y2: P.B0, stroke: INK, 'stroke-opacity': .25,
        'stroke-dasharray': '2 3' }, sv2);
      var rows = [];
      runs.forEach(function (r, k) {
        var m = Math.min(it, r.path.length - 1), col = COLS[k];
        var pts = r.path.slice(0, m + 1);
        if (m > 0) E('path', { d: pts.map(function (p, q) { return (q ? 'L' : 'M') + PX(p[0]).toFixed(1) + ' ' + PY(p[1]).toFixed(1); }).join(''),
          fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, sv1);
        pts.forEach(function (p, q) { if (q) dot(p, 1.6, col); });
        dot(r.path[0], 3, col);
        var e = r.path[m];
        E('circle', { cx: PX(e[0]), cy: PY(e[1]), r: 4.2, fill: '#fff', stroke: col, 'stroke-width': 2.2 }, sv1);
        var xs = [], ys = [];
        for (var q = 0; q <= it; q++) { xs.push(q); ys.push(r.vals[Math.min(q, r.vals.length - 1)]); }
        if (xs.length > 1) poly(P, xs, ys, col, 1.8, r.path.length === 1 ? { dash: '3 3' } : {});
        E('circle', { cx: P.x(it), cy: P.y(ys[ys.length - 1]), r: 2.6, fill: col }, sv2);
        var state = r.path.length === 1 ? 'stuck: ∇a ≈ 0' : (m < r.path.length - 1 ? 'climbing' : 'stopped: local max');
        rows.push('<span style="display:flex;align-items:center;gap:7px;line-height:1.5' + (picked && k === bestK ? ';font-weight:700' : '') + '">' +
          '<span style="width:9px;height:9px;border-radius:50%;background:' + col + ';flex:none"></span>' +
          '<span style="width:52px;font-family:var(--mono);font-variant-numeric:tabular-nums">' + f3(r.vals[m]) + '</span>' +
          '<span style="color:var(--ink3)">' + (picked && k === bestK ? '★ best' : state) + '</span></span>');
      });
      if (picked) { star(runs[bestK].path[runs[bestK].path.length - 1], RED); trueMark(); }
      var note;
      if (gs === 0) note = 'Six starting points (filled dots). From each, repeat <b>x ← x + η∇a<sub>t</sub>(x)</b>: step uphill along the gradient. Press → to take the first steps.';
      else if (!picked && it < LONG) note = '<b>Ascent step ' + it + '</b>: every start moves uphill at once. A run stops where ∇a<sub>t</sub> ≈ 0 — a <b>local</b> maximum. The grey start is on the flat plain, so it never moves.';
      else if (!picked) note = 'All runs have stopped, on <b>different local maxima</b> — the right panel shows each levelling off at its own height. Press → to choose.';
      else note = 'Keep the <b>best end point</b> as x<sub>t+1</sub> (★); the dashed ring is the true maximiser. Only one start of six reached it, which is why we use many starts. (BoTorch picks the starts as the best of many cheap random samples, so fewer land on the plain.)';
      readout([rows.join('')], note);
    };
    drawG();
    return {
      steps: NSG,
      step: function (s) { gs = s; drawG(); },
      reset: function () { gs = 0; drawG(); },
      finish: function () { gs = NSG; drawG(); }
    };
  }

  /* ================= mode: direct ================= */
  if (MODE === 'direct') {
    /* a box: centre c, side lengths s = [3^-kx, 3^-ky], value a(c) */
    var HIST = [];
    var sizeOf = function (b) { return 0.5 * Math.sqrt(b.s[0] * b.s[0] + b.s[1] * b.s[1]); };
    var select = function (boxes) {                 /* potentially optimal: the upper-right hull */
      var best = {}, k, b, key;
      boxes.forEach(function (b, idx) {
        key = sizeOf(b).toFixed(6);
        if (!best[key] || b.v > boxes[best[key]].v) best[key] = idx;
      });
      var cand = Object.keys(best).map(function (kk) { return best[kk]; })
        .sort(function (p, q2) { return sizeOf(boxes[p]) - sizeOf(boxes[q2]); });
      var vmax = Math.max.apply(null, boxes.map(function (b) { return b.v; }));
      var start = 0;
      for (k = 0; k < cand.length; k++) if (boxes[cand[k]].v >= boxes[cand[start]].v) start = k;
      var hull = [];
      for (k = start; k < cand.length; k++) {
        var pnt = cand[k];
        while (hull.length >= 2) {
          var o = boxes[hull[hull.length - 2]], a1 = boxes[hull[hull.length - 1]], b1 = boxes[pnt];
          var cr = (sizeOf(a1) - sizeOf(o)) * (b1.v - o.v) - (a1.v - o.v) * (sizeOf(b1) - sizeOf(o));
          if (cr >= 0) hull.pop(); else break;
        }
        hull.push(pnt);
      }
      /* Jones's epsilon test: the box must promise a real improvement for some K on its range */
      var eps = 1e-4;
      return hull.filter(function (idx, h) {
        if (h === hull.length - 1) return true;
        var bj = boxes[idx], bn = boxes[hull[h + 1]];
        var Kmax = (bj.v - bn.v) / (sizeOf(bj) - sizeOf(bn));
        return bj.v + Math.abs(Kmax) * sizeOf(bj) >= vmax + eps * Math.abs(vmax);
      });
    };
    var divide = function (boxes, idx) {
      var b = boxes[idx], m = Math.max(b.s[0], b.s[1]);
      var dims = [0, 1].filter(function (d) { return Math.abs(b.s[d] - m) < 1e-12; });
      var dl = m / 3, probe = dims.map(function (d) {
        var cp = b.c.slice(), cm = b.c.slice(); cp[d] += dl; cm[d] -= dl;
        var vp = acq(cp), vm = acq(cm);
        return { d: d, cp: cp, cm: cm, vp: vp, vm: vm, w: Math.max(vp, vm) };
      }).sort(function (p, q2) { return q2.w - p.w; });
      probe.forEach(function (pr) {                 /* best direction first: it keeps the biggest boxes */
        b.s[pr.d] /= 3;
        boxes.push({ c: pr.cp, s: b.s.slice(), v: pr.vp });
        boxes.push({ c: pr.cm, s: b.s.slice(), v: pr.vm });
      });
    };
    NEVAL = 0;
    var boxes = [{ c: [0.5, 0.5], s: [1, 1], v: acq([0.5, 0.5]) }], it2;
    for (it2 = 0; it2 <= 12; it2++) {
      var sel = select(boxes);
      HIST.push({ boxes: boxes.map(function (b) { return { c: b.c.slice(), s: b.s.slice(), v: b.v }; }),
        sel: sel.slice(), ne: NEVAL });
      sel.forEach(function (idx) { divide(boxes, idx); });
    }
    var ds = 0, NSTEP = 10;
    var drawD = function () {
      var h = HIST[ds], bs = h.boxes, selSet = {};
      h.sel.forEach(function (k) { selSet[k] = 1; });
      map();
      bs.forEach(function (b, k) {
        E('rect', { x: PX(b.c[0] - b.s[0] / 2), y: PY(b.c[1] + b.s[1] / 2), width: b.s[0] * SZ, height: b.s[1] * SZ,
          fill: selSet[k] ? YELLOW : 'none', 'fill-opacity': selSet[k] ? .55 : 0,
          stroke: INK, 'stroke-opacity': .55, 'stroke-width': .7 }, sv1);
      });
      bs.forEach(function (b) { dot(b.c, 1.6, INK, { op: .8 }); });
      var bestB = bs.reduce(function (p, b) { return b.v > p.v ? b : p; }, bs[0]);
      if (ds === NSTEP) { star(bestB.c, RED); trueMark(); }

      /* right: size vs value, the hull, and the selected boxes */
      var sizes = bs.map(sizeOf), smax = 0.75;
      var P = panel([0.004, smax], [0, Math.ceil(AMAX * 100) / 100], 'box size d  (log)', 'a_t at the centre',
        { ticks: [0.01, 0.1, 0.7], f: String }, true);
      bs.forEach(function (b, k) {
        E('circle', { cx: P.x(sizes[k]), cy: P.y(b.v), r: selSet[k] ? 4 : 2.4,
          fill: selSet[k] ? YELLOW : INK, 'fill-opacity': selSet[k] ? 1 : .45,
          stroke: selSet[k] ? INK : 'none', 'stroke-width': 1 }, sv2);
      });
      var hs = h.sel.slice().sort(function (p, q2) { return sizes[p] - sizes[q2]; });
      if (hs.length > 1) poly(P, hs.map(function (k) { return sizes[k]; }), hs.map(function (k) { return bs[k].v; }), AMBER, 1.4, { dash: '4 3' });

      readout([
        'iteration <b>' + ds + '</b> · <b>' + bs.length + '</b> boxes',
        '<b>' + h.ne + '</b> evaluations of a_t (one per centre)',
        '<span style="background:' + YELLOW + ';padding:0 3px">next to divide</span> <b>' + h.sel.length + '</b>',
        'best centre <b>' + f3(bestB.v) + '</b> = ' + pct(bestB.v) + ' of max'
      ], ds === 0
        ? 'One box, one evaluation at its centre. Each → divides every <b>potentially optimal</b> box into thirds, along its longest side.'
        : ds < 4
        ? 'A box is potentially optimal if, for <i>some</i> slope K, its optimistic bound a(c)+K·d beats every other box. Those are the boxes on the <b>upper-right hull</b> of the right panel: the best at each size.'
        : ds < NSTEP
        ? 'Small K favours the <b>best centre</b> (local refinement); large K favours the <b>biggest box</b> (global search). DIRECT takes every K at once, so it never commits to one. Watch the boxes shrink over the peaks while the plains stay coarse.'
        : 'Boxes are finest where a_t is high, and every region was still sampled at least coarsely. No gradient was used — only values — but the count grows fast with dimension.');
    };
    drawD();
    return {
      steps: NSTEP,
      step: function (s) { ds = s; drawD(); },
      reset: function () { ds = 0; drawD(); },
      finish: function () { ds = NSTEP; drawD(); }
    };
  }

  /* ================= mode: cma ================= */
  if (MODE === 'cma') {
    var LAMB = 12, MU = 6, CMU = 0.5, WT = [], ws = 0, kk;
    for (kk = 0; kk < MU; kk++) { WT.push(Math.log(MU + 0.5) - Math.log(kk + 1)); ws += WT[kk]; }
    WT = WT.map(function (w) { return w / ws; });
    var R = IE437.rng(8);
    var gauss = function () { var u = 1 - R(), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    var GENS = [], m = [0.5, 0.5], C = [[0.04, 0], [0, 0.04]], best = { v: -1 }, curve = [];
    NEVAL = 0;
    for (var g = 0; g < 9; g++) {
      var l11 = Math.sqrt(C[0][0]), l21 = C[1][0] / l11, l22 = Math.sqrt(Math.max(1e-12, C[1][1] - l21 * l21));
      var pop = [];
      for (kk = 0; kk < LAMB; kk++) {
        var x, tries = 0;                         /* a sample outside the box is redrawn */
        do { var z1 = gauss(), z2 = gauss(); x = [m[0] + l11 * z1, m[1] + l21 * z1 + l22 * z2]; tries++; }
        while ((x[0] < 0 || x[0] > 1 || x[1] < 0 || x[1] > 1) && tries < 50);
        x = [clip(x[0]), clip(x[1])];
        var va = acq(x); pop.push({ x: x, v: va });
        if (va > best.v) best = { v: va, x: x };
        curve.push([NEVAL, best.v]);
      }
      var ranked = pop.slice().sort(function (p, q2) { return q2.v - p.v; }).slice(0, MU);
      var mn = [0, 0], Cn = [[0, 0], [0, 0]];
      ranked.forEach(function (p, r) {
        var d0 = p.x[0] - m[0], d1 = p.x[1] - m[1];
        mn[0] += WT[r] * d0; mn[1] += WT[r] * d1;
        Cn[0][0] += WT[r] * d0 * d0; Cn[0][1] += WT[r] * d0 * d1; Cn[1][1] += WT[r] * d1 * d1;
      });
      Cn[1][0] = Cn[0][1];
      var Cnew = [[(1 - CMU) * C[0][0] + CMU * Cn[0][0] + 1e-6, (1 - CMU) * C[0][1] + CMU * Cn[0][1]],
                  [(1 - CMU) * C[1][0] + CMU * Cn[1][0], (1 - CMU) * C[1][1] + CMU * Cn[1][1] + 1e-6]];
      var mnew = [m[0] + mn[0], m[1] + mn[1]];
      GENS.push({ m: m.slice(), C: C, pop: pop, sel: ranked, mnew: mnew, Cnew: Cnew, ne: NEVAL, best: best });
      m = mnew; C = Cnew;
    }
    var ellipse = function (mm, CC, col, o) {
      var a = CC[0][0], b = CC[0][1], c = CC[1][1], tr = (a + c) / 2, det = Math.sqrt(Math.max(0, (a - c) * (a - c) / 4 + b * b));
      var e1 = tr + det, e2 = Math.max(1e-9, tr - det), ang = 0.5 * Math.atan2(2 * b, a - c), d = '', t;
      for (t = 0; t <= 64; t++) {
        var th = 2 * Math.PI * t / 64, u = 2 * Math.sqrt(e1) * Math.cos(th), v = 2 * Math.sqrt(e2) * Math.sin(th);
        var px = mm[0] + u * Math.cos(ang) - v * Math.sin(ang), py = mm[1] + u * Math.sin(ang) + v * Math.cos(ang);
        d += (t ? 'L' : 'M') + PX(px).toFixed(1) + ' ' + PY(py).toFixed(1);
      }
      E('path', { d: d + 'Z', fill: 'none', stroke: col, 'stroke-width': o.w || 1.8, 'stroke-dasharray': o.dash || 'none',
        'stroke-opacity': o.op == null ? 1 : o.op }, sv1);
    };
    var cs = 0, NG2 = 8;
    var drawC = function () {
      map();
      var G = GENS[cs];
      for (var h = 0; h < cs; h++) E('circle', { cx: PX(GENS[h].m[0]), cy: PY(GENS[h].m[1]), r: 2, fill: AMBER, 'fill-opacity': .6 }, sv1);
      ellipse(G.m, G.C, SLATE, { dash: '4 3', w: 1.4 });
      G.pop.forEach(function (p) { dot(p.x, 2.6, INK, { op: .5 }); });
      G.sel.forEach(function (p) { dot(p.x, 3.6, BLUE, { stroke: '#fff', sw: 1 }); });
      E('line', { x1: PX(G.m[0]), y1: PY(G.m[1]), x2: PX(G.mnew[0]), y2: PY(G.mnew[1]), stroke: AMBER, 'stroke-width': 2 }, sv1);
      ellipse(G.mnew, G.Cnew, AMBER, { w: 2 });
      E('circle', { cx: PX(G.mnew[0]), cy: PY(G.mnew[1]), r: 3.5, fill: AMBER }, sv1);
      if (cs === NG2) { star(G.best.x, RED); trueMark(); }

      var P = panel([0, GENS[NG2].ne], [0, Math.ceil(AMAX * 100) / 100], 'evaluations of a_t', 'best a_t so far',
        { ticks: [0, 36, 72, 108], f: String });
      var cu = curve.filter(function (p) { return p[0] <= G.ne; });
      poly(P, cu.map(function (p) { return p[0]; }), cu.map(function (p) { return p[1]; }), AMBER, 2);
      E('line', { x1: P.L0, y1: P.y(AMAX), x2: P.R0, y2: P.y(AMAX), stroke: RED, 'stroke-dasharray': '3 3', 'stroke-opacity': .7 }, sv2);
      txt(sv2, P.R0, P.y(AMAX) - 4, 'true max', { anchor: 'end', fill: RED, op: .8, size: 8 });

      readout([
        'generation <b>' + (cs + 1) + '</b> · λ = ' + LAMB + ' samples, μ = ' + MU + ' kept',
        '<b>' + G.ne + '</b> evaluations of a_t',
        'best so far <b>' + f3(G.best.v) + '</b> = ' + pct(G.best.v) + ' of max'
      ], cs === 0
        ? '<b>Sample</b> λ points from the grey Gaussian N(m, C); <b>select</b> the μ best (blue); <b>re-fit</b> the Gaussian to them (amber): the mean moves toward them and C takes their shape. On the plain the ranking is nearly a coin toss, so the first moves are slow.'
        : cs < 4
        ? 'The ellipse <b>stretches along</b> the direction the good samples lie and <b>shrinks across</b> it — the covariance learns the local shape of a_t without any gradient.'
        : cs < NG2
        ? 'As the good samples cluster, the Gaussian contracts onto one peak. A sample that falls outside the box is simply redrawn.'
        : 'Converged: a small Gaussian on one peak; the best sample is x<sub>t+1</sub> (★). One Gaussian can also settle on a <i>lesser</i> peak — other seeds do here — so practical use adds <b>restarts</b>. It searched with a <b>distribution over inputs</b>, the idea Lecture 6 turns into a generative model over designs.');
    };
    drawC();
    return {
      steps: NG2,
      step: function (s) { cs = s; drawC(); },
      reset: function () { cs = 0; drawC(); },
      finish: function () { cs = NG2; drawC(); }
    };
  }
});
