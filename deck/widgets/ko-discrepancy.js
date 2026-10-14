/* ============================================================
   widget: ko-discrepancy                           (Chapter 5, Act 4)
   A simulator inside the surrogate — Kennedy & O'Hagan (JRSS-B 2001):
        f(x) = eta(x) + delta(x),   delta ~ GP(0, k)
   The same fifteen points and the same hidden f as the rest of the
   chapter. The "simulator" eta has the right shape but the wrong level
   and a shifted peak:  eta(x) = 0.8 f(x + 0.5) + 0.35.  A zero-mean GP
   learns the discrepancy where there is data; away from it the
   discrepancy relaxes to zero and the prediction relaxes to the
   simulator — not to a straight line.
   Walked by the deck's ->:
     0  the data-only surrogate of Session 1 (climbs to 4.31 at x = 10)
     1  the simulator alone
     2  simulator + GP discrepancy, its band, and its choice
   Verified in node (seed 17; ell 1, s2 0.25, noise 0.05):
     hybrid argmax x = 5.82, predicted 2.61, truth 2.64 (optimum 2.657);
     prediction at x = 10 is 0.27 (the simulator's), against 4.31.
   ============================================================ */
IE437.widget('ko-discrepancy', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', PURPLE = '#6D4AFF', SLATE = '#64748B', RED = '#D64545';
  var MONO = 'IBM Plex Mono, monospace';
  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, N = 15, LAM = 0.06;
  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  var eta = function (x) { return 0.8 * ftrue(x + 0.5) + 0.35; };
  var R = IE437.rng(opts.seed || 17), D = [], i, j;
  for (i = 0; i < N; i++) {
    var xi = DL + (DR - DL) * (i + 0.5 + 0.55 * (R() - 0.5)) / N;
    D.push({ x: xi, y: ftrue(xi) + 0.045 * (R() * 2 - 1) });
  }
  /* Session 1's data-only surrogate: ridge on ReLU knots */
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
  var W = solve(A, bb);
  var fdata = function (x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += W[a] * p[a]; return s; };
  /* the discrepancy GP */
  var ELL = 1.0, S2 = 0.25, SN2 = 0.05 * 0.05;
  var kf = function (a, b) { return S2 * Math.exp(-0.5 * Math.pow((a - b) / ELL, 2)); };
  var K = D.map(function (a) { return D.map(function (b) { return kf(a.x, b.x); }); });
  for (i = 0; i < N; i++) K[i][i] += SN2;
  var L = []; for (i = 0; i < N; i++) L.push(new Array(N).fill(0));
  for (i = 0; i < N; i++) for (j = 0; j <= i; j++) { var s = K[i][j]; for (var q = 0; q < j; q++) s -= L[i][q] * L[j][q]; L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j]; }
  function fwd(b) { var y = []; for (var a = 0; a < N; a++) { var s = b[a]; for (var c = 0; c < a; c++) s -= L[a][c] * y[c]; y.push(s / L[a][a]); } return y; }
  function bwd(y) { var x = new Array(N); for (var a = N - 1; a >= 0; a--) { var s = y[a]; for (var c = a + 1; c < N; c++) s -= L[c][a] * x[c]; x[a] = s / L[a][a]; } return x; }
  var al = bwd(fwd(D.map(function (d) { return d.y - eta(d.x); })));
  function hyb(x) {
    var ks = D.map(function (d) { return kf(x, d.x); }), m = eta(x), a;
    for (a = 0; a < N; a++) m += ks[a] * al[a];
    var v = fwd(ks), vv = 0; for (a = 0; a < N; a++) vv += v[a] * v[a];
    return { m: m, sd: Math.sqrt(Math.max(S2 - vv, 1e-12)) };
  }
  var GX = []; for (i = 0; i <= 300; i++) GX.push(X0 + (X1 - X0) * i / 300);
  var HB = GX.map(hyb), hi = 0; HB.forEach(function (h, n) { if (h.m > HB[hi].m) hi = n; });

  var st = 0, NS = 2;
  host.innerHTML =
    '<div class="wbar"><span class="wt">A simulator inside the surrogate</span><span class="wspacer"></span>' +
    '<span class="wlabel">model</span><span class="wnum">f = η(x) + δ(x), δ ~ GP</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div><div data-note style="width:300px;font:400 13.5px/1.6 var(--sans);color:var(--ink2)"></div></div>';
  var CW = 640, CH = 300, Lm = 34, Rm = 14, T = 16, B = 30, YLO = -0.9, YHI = 4.8;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return Lm + (v - X0) / (X1 - X0) * (CW - Lm - Rm); };
  var PY = function (v) { return CH - B - (v - YLO) / (YHI - YLO) * (CH - T - B); };
  function line(fn, c, w, dash, op) {
    var pts = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(fn(x, n)).toFixed(1); });
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': dash || '', 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, sv);
  }
  function lab(x, y, s, c, anchor) { E('text', { x: x, y: y, 'text-anchor': anchor || 'start', 'font-size': 10.5, 'font-weight': 700, fill: c, text: s }, sv); }
  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('rect', { x: PX(DL), y: T, width: PX(DR) - PX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, sv);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T + 12, 'text-anchor': 'middle', 'font-size': 9, 'font-family': MONO, fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, sv);
    E('line', { x1: Lm, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .22 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 2, 4].forEach(function (v) { E('text', { x: Lm - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45, 'font-family': MONO, text: v }, sv); });
    line(function (x) { return ftrue(x); }, INK, 2, '', .34);
    E('line', { x1: PX(5.9), x2: PX(5.9) + 16, y1: PY(-0.55), y2: PY(-0.55), stroke: INK, 'stroke-width': 2, 'stroke-opacity': .34 }, sv);
    lab(PX(5.9) + 21, PY(-0.55) + 3.5, 'true f — never queried', 'rgba(22,24,29,.55)');
    line(function (x) { return fdata(x); }, BLUE, 1.8, '5 3', st >= 2 ? .3 : 1);
    lab(PX(8.6), PY(fdata(8.6)) - 9, 'data only (Session 1)', st >= 2 ? 'rgba(37,99,235,.4)' : BLUE, 'end');
    if (st >= 1) {
      line(function (x) { return eta(x); }, PURPLE, 2, '2 3');
      lab(PX(0.25), PY(eta(0.25)) - 10, 'simulator η', PURPLE);
    }
    if (st >= 2) {
      var up = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(HB[n].m + 2 * HB[n].sd).toFixed(1); });
      var dn = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(HB[n].m - 2 * HB[n].sd).toFixed(1); }).reverse();
      E('path', { d: 'M' + up.join('L') + 'L' + dn.join('L') + 'Z', fill: GREEN, 'fill-opacity': .1 }, sv);
      line(function (x, n) { return HB[n].m; }, GREEN, 2.5);
      lab(PX(7.0), PY(HB[210].m) - 26, 'simulator + GP discrepancy', GREEN);
      var x = GX[hi];
      E('circle', { cx: PX(x), cy: PY(HB[hi].m), r: 6, fill: GREEN }, sv);
      E('circle', { cx: PX(x), cy: PY(ftrue(x)), r: 5, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
    }
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.9, fill: INK }, sv); });
    E('text', { x: CW / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'x' }, sv);
    host.querySelector('[data-note]').innerHTML = [
      'From data alone, nothing says what happens beyond x = 5.4, and Session 1\'s surrogate keeps climbing.',
      'A simulator knows the <b>shape</b> — a peak, then a fall — but it is biased: the level is off and the peak is shifted.',
      'Let a GP learn the simulator\'s error where there is data. Away from the data the learned error fades, and the prediction falls back on the <b>simulator</b>, not on a straight line. Its best design sits next to the true optimum.'
    ][st];
  }
  var show = function (k) { st = Math.max(0, Math.min(NS, k)); draw(); };
  show(0);
  return { steps: NS, step: show, reset: function () { show(0); }, finish: function () { show(NS); } };
});
