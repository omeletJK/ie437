/* ============================================================
   widget: conservative-coms                        (Chapter 5, Act 3)
   The same fifteen points, the same optimiser, the same ascent — only
   the training loss changes. Conservative Objective Models are trained
   here for real: at each round the adversarial set mu(x) is regenerated
   by running gradient ascent on the *current* surrogate from every data
   point, and the surrogate is refitted with the penalty
        alpha ( E_mu[f] - E_D[f] )
   so the picture is the algorithm, not a sketch of it.

   Verified in node (seed 17, lambda 0.06, 40 rounds):
     alpha 0     x* = 10.00  f_theta = 4.31  truth = -0.14   (2.57 below
                 the best design already in D)
     alpha 0.15  x* =  6.73  f_theta = 2.20  truth =  2.46   surrogate now
                 UNDER-predicts by 0.25 — a lower bound, per Proposition 1
     alpha 0.30  x* =  6.20  f_theta = 1.99  truth =  2.65   the true global
                 optimum is 2.657 at x = 6.04
     alpha 1.30  x* =  4.44  f_theta = 1.67  truth =  1.97   too conservative
                 to leave the data; worse than the dataset's best design
   ============================================================ */
IE437.widget('conservative-coms', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      RED = '#D64545', SLATE = '#64748B';

  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, LAM = 0.06, ETA = 0.35, TMAX = 40, N = 15;
  var ROUNDS = 40, MSTEP = 25, DAMP = 0.25;
  var ALPHA = [0, 0.15, 0.3, 0.45, 0.6, 0.9, 1.3], ai = 0;

  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  var KN = [], MK = 26, j;
  for (j = 0; j < MK; j++) KN.push(0.35 + 9.3 * j / (MK - 1));
  function phi(x) {
    var v = [1, x / 5], k;
    for (k = 0; k < MK; k++) { v.push(Math.max(0, x - KN[k]) / 3); v.push(Math.max(0, KN[k] - x) / 3); }
    return v;
  }
  var P = phi(0).length;
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), c, r, k, p, d, f, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      t = M[c]; M[c] = M[p]; M[p] = t;
      d = M[c][c]; for (k = c; k <= n; k++) M[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = M[r][c]; if (!f) continue;
        for (k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (row) { return row[n]; });
  }

  var R = IE437.rng(opts.seed || 17), D = [], i, q;
  for (i = 0; i < N; i++) {
    var xi = DL + (DR - DL) * (i + 0.5 + 0.55 * (R() - 0.5)) / N;
    D.push({ x: xi, y: ftrue(xi) + 0.045 * (R() * 2 - 1) });
  }
  var GA = [], gb = new Array(P), dbar = new Array(P);
  for (i = 0; i < P; i++) { gb[i] = 0; dbar[i] = 0; GA.push(new Array(P)); for (q = 0; q < P; q++) GA[i][q] = 0; }
  D.forEach(function (d) {
    var p = phi(d.x);
    for (var a = 0; a < P; a++) { gb[a] += p[a] * d.y / N; dbar[a] += p[a] / N;
      for (var c = 0; c < P; c++) GA[a][c] += p[a] * p[c] / N; }
  });
  for (i = 0; i < P; i++) GA[i][i] += (i < 2 ? LAM * 1e-2 : LAM);

  function ev(w, x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += w[a] * p[a]; return s; }
  function grad(w, x) { return (ev(w, x + 1e-4) - ev(w, x - 1e-4)) / 2e-4; }
  function ascend(w, xs, steps) {
    var path = [xs], x = xs;
    for (var t = 0; t < steps; t++) { x = Math.max(X0, Math.min(X1, x + ETA * grad(w, x))); path.push(x); }
    return path;
  }

  var CACHE = {};
  function model(a) {
    if (CACHE[a]) return CACHE[a];
    var w = solve(GA, gb), r, k, m, mb, wn, rhs;
    if (a > 0) {
      for (r = 0; r < ROUNDS; r++) {
        m = [];
        D.forEach(function (d) { var pp = ascend(w, d.x, MSTEP); for (var t = 1; t < pp.length; t++) m.push(pp[t]); });
        mb = new Array(P); for (k = 0; k < P; k++) mb[k] = 0;
        m.forEach(function (x) { var pp = phi(x); for (var c = 0; c < P; c++) mb[c] += pp[c] / m.length; });
        rhs = gb.map(function (v, c) { return v - a * (mb[c] - dbar[c]); });
        wn = solve(GA, rhs);
        for (k = 0; k < P; k++) w[k] = (1 - DAMP) * w[k] + DAMP * wn[k];
      }
    }
    return (CACHE[a] = w);
  }

  var W0 = model(0);
  var x0 = D[0].x, y0 = D[0].y;
  D.forEach(function (d) { if (d.y > y0) { y0 = d.y; x0 = d.x; } });
  var PATH0 = ascend(W0, x0, TMAX);
  var YLO = -0.7, YHI = 4.8;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Conservatism, dialled</span><span class="wspacer"></span>' +
    '<span class="wlabel">conservatism</span><span class="wnum" data-a></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:15px;align-items:flex-start;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the surrogate, retrained</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">true value along the ascent</div><div data-c2></div></div>' +
    '<div style="width:196px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var CW = 470, CH = 288, TW = 342;
  var s1 = IE437.svg(CW, CH), s2 = IE437.svg(TW, CH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function draw() {
    var a = ALPHA[ai], W = model(a), path = ascend(W, x0, TMAX), xs = path[TMAX], k;

    /* ---------- left ---------- */
    while (s1.firstChild) s1.removeChild(s1.firstChild);
    var L = 34, Rr = 14, T = 16, B = 30;
    var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rr); };
    var PY = function (v) { return CH - B - (v - YLO) / (YHI - YLO) * (CH - T - B); };
    E('rect', { x: PX(DL), y: T, width: PX(DR) - PX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, s1);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T + 12, 'text-anchor': 'middle', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, s1);
    E('line', { x1: L, x2: CW - Rr, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .22 }, s1);
    E('line', { x1: L, x2: L, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s1);
    [0, 2, 4].forEach(function (v) {
      E('text', { x: L - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s1);
    });
    function curve(fn, col, dash, w, op, target) {
      var pts = [];
      for (k = 0; k <= 300; k++) { var x = X0 + (X1 - X0) * k / 300; pts.push(PX(x).toFixed(1) + ' ' + PY(fn(x)).toFixed(1)); }
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash, 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, target || s1);
    }
    curve(ftrue, INK, '', 2.3, .78);
    curve(function (x) { return ev(W0, x); }, BLUE, '4 4', 1.6, .35);
    curve(function (x) { return ev(W, x); }, a > 0 ? GREEN : BLUE, '5 3', 2.2);
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.9, fill: INK }, s1); });
    /* where each optimiser stops */
    E('line', { x1: PX(PATH0[TMAX]), y1: T, x2: PX(PATH0[TMAX]), y2: CH - B, stroke: RED,
      'stroke-opacity': .3, 'stroke-dasharray': '2 3' }, s1);
    E('circle', { cx: PX(PATH0[TMAX]), cy: PY(ftrue(PATH0[TMAX])), r: 4, fill: RED, 'fill-opacity': .35 }, s1);
    E('circle', { cx: PX(xs), cy: PY(ev(W, xs)), r: 5, fill: a > 0 ? GREEN : RED }, s1);
    E('circle', { cx: PX(xs), cy: PY(ftrue(xs)), r: 5, fill: 'none', stroke: INK, 'stroke-width': 2 }, s1);
    E('line', { x1: PX(xs), y1: PY(ev(W, xs)), x2: PX(xs), y2: PY(ftrue(xs)),
      stroke: a > 0 ? GREEN : RED, 'stroke-width': 2 }, s1);
    E('text', { x: PX(8.6), y: PY(ev(W0, 8.6)) - 8, 'text-anchor': 'middle', 'font-size': 10, fill: BLUE,
      'fill-opacity': .6, 'font-weight': 700, text: 'α = 0' }, s1);
    if (a > 0) E('text', { x: PX(8.6), y: PY(ev(W, 8.6)) - 9, 'text-anchor': 'middle', 'font-size': 10,
      fill: GREEN, 'font-weight': 700, text: 'conservative fθ' }, s1);
    E('text', { x: CW / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .45, text: 'x' }, s1);

    /* ---------- right: the source deck's ablation, simulated ---------- */
    while (s2.firstChild) s2.removeChild(s2.firstChild);
    var l2 = 34, r2 = 14, Y2 = [-0.4, 3.05];
    var QX = function (t) { return l2 + t / TMAX * (TW - l2 - r2); };
    var QY = function (v) { return CH - B - (v - Y2[0]) / (Y2[1] - Y2[0]) * (CH - T - B); };
    E('line', { x1: l2, x2: TW - r2, y1: QY(0), y2: QY(0), stroke: INK, 'stroke-opacity': .22 }, s2);
    E('line', { x1: l2, x2: l2, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s2);
    [0, 1, 2].forEach(function (v) {
      E('text', { x: l2 - 5, y: QY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s2);
    });
    E('line', { x1: l2, x2: TW - r2, y1: QY(ftrue(x0)), y2: QY(ftrue(x0)), stroke: INK,
      'stroke-opacity': .3, 'stroke-dasharray': '3 4' }, s2);
    E('text', { x: l2 + 5, y: QY(ftrue(x0)) + 14, 'font-size': 9, fill: INK,
      'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: 'best design in D' }, s2);
    function trace(pp, col, w, dash, op) {
      var pts = [];
      for (k = 0; k <= TMAX; k++) pts.push(QX(k).toFixed(1) + ' ' + QY(Math.max(Y2[0], ftrue(pp[k]))).toFixed(1));
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash || '', 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, s2);
    }
    trace(PATH0, RED, 2.2);
    if (a > 0) trace(path, GREEN, 2.4);
    E('text', { x: QX(TMAX) - 3, y: QY(Math.max(Y2[0], ftrue(PATH0[TMAX]))) - 9, 'text-anchor': 'end',
      'font-size': 10, fill: RED, 'font-weight': 700, text: 'naive ascent' }, s2);
    if (a > 0) E('text', { x: QX(TMAX) - 3, y: QY(ftrue(path[TMAX])) - 10, 'text-anchor': 'end',
      'font-size': 10, fill: GREEN, 'font-weight': 700, text: 'conservative' }, s2);
    E('text', { x: (l2 + TW - r2) / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'ascent step' }, s2);

    /* ---------- readout ---------- */
    var gap = ev(W, xs) - ftrue(xs), vs = ftrue(xs) - ftrue(x0);
    host.querySelector('[data-a]').textContent = 'α = ' + a.toFixed(2);
    host.querySelector('[data-num]').innerHTML =
      'x* = <b>' + xs.toFixed(2) + '</b><br>' +
      'surrogate says <b>' + ev(W, xs).toFixed(2) + '</b><br>' +
      'truth is <b>' + ftrue(xs).toFixed(2) + '</b><br>' +
      '<b style="color:' + (gap > 0 ? RED : GREEN) + '">' +
      (gap > 0 ? 'over by ' + gap.toFixed(2) : 'under by ' + (-gap).toFixed(2)) + '</b><br>' +
      'vs. the data: <b style="color:' + (vs < 0 ? RED : GREEN) + '">' +
      (vs >= 0 ? '+' : '') + vs.toFixed(2) + '</b>';
    host.querySelector('[data-note]').innerHTML =
      a === 0 ? 'No penalty. The search runs to the edge of the design space and reports a value that is not there.'
      : gap > 0 ? 'Still optimistic where the optimiser lands.'
      : (vs < 0 ? 'Now <b>too</b> conservative: the surface is so flat that ascent never leaves the data, and we do worse than the design we started from.'
                : 'The surrogate now <b>under</b>-promises at x* &mdash; a lower bound, so what it reports can be trusted.');
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: ALPHA.length - 1, step: 1, value: ai,
    on: function (v) { ai = v; draw(); }
  });

  draw();
  return { finish: function () { ai = 2; draw(); } };
});
