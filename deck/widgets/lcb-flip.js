/* ============================================================
   widget: lcb-flip                                 (Chapter 5, Act 3)
   Lecture 4's UCB with the sign turned. The same fifteen points as the
   rest of the chapter; the model is a GP whose prior mean is the linear
   trend of the data (so, like Session 1's surrogate, it extrapolates
   optimistically) and whose residual kernel is an RBF (so its sigma is
   honest: it grows away from the data).
        UCB  mu + kappa sigma   — optimism: go where the band is wide
        LCB  mu - kappa sigma   — pessimism: stay where it is narrow
   Drag kappa. Verified in node (seed 17, ell 1, s2 1, noise 0.05):
     kappa 0 .. 1.5   both pick x = 10        (truth -0.14)
     kappa 2          LCB picks x = 5.37      (truth  2.50); UCB still x = 10
     kappa 3          LCB picks x = 5.28      (truth  2.45)
   Best design in D: x = 5.23, truth 2.43.
   ============================================================ */
IE437.widget('lcb-flip', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, N = 15, ELL = 1.0, S2 = 1.0, SN2 = 0.05 * 0.05;
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
  /* prior mean: the data's linear trend */
  var mx = 0, my = 0; D.forEach(function (d) { mx += d.x / N; my += d.y / N; });
  var sxy = 0, sxx = 0; D.forEach(function (d) { sxy += (d.x - mx) * (d.y - my); sxx += (d.x - mx) * (d.x - mx); });
  var slope = sxy / sxx;
  function mf(x) { return my + slope * (x - mx); }
  function k(a, b) { return S2 * Math.exp(-0.5 * Math.pow((a - b) / ELL, 2)); }
  /* Cholesky of K + noise */
  var K = D.map(function (a) { return D.map(function (b) { return k(a.x, b.x); }); });
  for (i = 0; i < N; i++) K[i][i] += SN2;
  var L = []; for (i = 0; i < N; i++) L.push(new Array(N).fill(0));
  for (i = 0; i < N; i++) for (j = 0; j <= i; j++) {
    var s = K[i][j]; for (var q = 0; q < j; q++) s -= L[i][q] * L[j][q];
    L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
  }
  function fwd(b) { var y = []; for (var a = 0; a < N; a++) { var s = b[a]; for (var c = 0; c < a; c++) s -= L[a][c] * y[c]; y.push(s / L[a][a]); } return y; }
  function bwd(y) { var x = new Array(N); for (var a = N - 1; a >= 0; a--) { var s = y[a]; for (var c = a + 1; c < N; c++) s -= L[c][a] * x[c]; x[a] = s / L[a][a]; } return x; }
  var alpha = bwd(fwd(D.map(function (d) { return d.y - mf(d.x); })));
  function post(x) {
    var ks = D.map(function (d) { return k(x, d.x); }), mu = mf(x), a;
    for (a = 0; a < N; a++) mu += ks[a] * alpha[a];
    var v = fwd(ks), vv = 0; for (a = 0; a < N; a++) vv += v[a] * v[a];
    return { mu: mu, sd: Math.sqrt(Math.max(S2 - vv, 1e-12)) };
  }
  var GX = [], GP = [];
  for (i = 0; i <= 400; i++) { var x = X0 + (X1 - X0) * i / 400; GX.push(x); GP.push(post(x)); }
  var x0 = D[0].x, y0 = D[0].y; D.forEach(function (d) { if (d.y > y0) { y0 = d.y; x0 = d.x; } });

  var kap = typeof opts.kappa === 'number' ? opts.kappa : 2, K0 = kap;
  host.innerHTML =
    '<div class="wbar"><span class="wt">One model, two signs</span><span class="wspacer"></span>' +
    '<span class="wlabel">risk weight</span><span class="wnum" data-k></span><span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:300px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 13px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12.5px/1.55 var(--sans);color:var(--ink3);border-top:1px solid rgba(22,24,29,.1);padding-top:9px"></div></div></div>';
  var CW = 640, CH = 300, Lm = 34, Rm = 14, T = 16, B = 30, YLO = -1.4, YHI = 6.2;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return Lm + (v - X0) / (X1 - X0) * (CW - Lm - Rm); };
  var PY = function (v) { return CH - B - (v - YLO) / (YHI - YLO) * (CH - T - B); };
  function path(fn, col, w, dash, op) {
    var pts = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(fn(n, x)).toFixed(1); });
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '',
      'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, sv);
  }
  function pick(sgn) {
    var bi = 0, bv = -1e9;
    GP.forEach(function (p, n) { var v = p.mu + sgn * kap * p.sd; if (v > bv) { bv = v; bi = n; } });
    return bi;
  }
  function f2(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('rect', { x: PX(DL), y: T, width: PX(DR) - PX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, sv);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T + 12, 'text-anchor': 'middle', 'font-size': 9, 'font-family': MONO,
      fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, sv);
    E('line', { x1: Lm, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .22 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 2, 4, 6].forEach(function (v) {
      E('text', { x: Lm - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': MONO, text: v }, sv);
    });
    /* the band between the two rules */
    var up = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(GP[n].mu + kap * GP[n].sd).toFixed(1); });
    var dn = GX.map(function (x, n) { return PX(x).toFixed(1) + ' ' + PY(GP[n].mu - kap * GP[n].sd).toFixed(1); }).reverse();
    E('path', { d: 'M' + up.join('L') + 'L' + dn.join('L') + 'Z', fill: BLUE, 'fill-opacity': .08 }, sv);
    path(function (n, x) { return ftrue(x); }, INK, 2, '', .34);
    path(function (n) { return GP[n].mu; }, BLUE, 2, '5 3');
    path(function (n) { return GP[n].mu + kap * GP[n].sd; }, AMBER, 2.2);
    path(function (n) { return GP[n].mu - kap * GP[n].sd; }, GREEN, 2.4);
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.9, fill: INK }, sv); });
    var iu = pick(1), il = pick(-1);
    [[iu, AMBER, 1], [il, GREEN, -1]].forEach(function (q) {
      var x = GX[q[0]], p = GP[q[0]];
      E('line', { x1: PX(x), x2: PX(x), y1: PY(p.mu + q[2] * kap * p.sd), y2: PY(ftrue(x)), stroke: q[1], 'stroke-opacity': .5, 'stroke-dasharray': '2 3' }, sv);
      E('circle', { cx: PX(x), cy: PY(p.mu + q[2] * kap * p.sd), r: 6, fill: q[1] }, sv);
      E('circle', { cx: PX(x), cy: PY(ftrue(x)), r: 5, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
    });
    E('text', { x: PX(7.0), y: PY(GP[280].mu + kap * GP[280].sd) - 9, 'text-anchor': 'end', 'font-size': 10.5,
      'font-weight': 700, fill: AMBER, text: 'μ + κσ  (UCB, Lecture 4)' }, sv);
    E('text', { x: PX(7.4), y: PY(GP[296].mu - kap * GP[296].sd) + 17, 'text-anchor': 'start', 'font-size': 10.5,
      'font-weight': 700, fill: GREEN, text: 'μ − κσ  (offline)' }, sv);
    E('text', { x: PX(3.0), y: PY(GP[120].mu) - 12, 'text-anchor': 'middle', 'font-size': 10, fill: BLUE, 'font-weight': 700,
      text: 'mean μ' }, sv);
    E('line', { x1: PX(0.4), x2: PX(0.4) + 16, y1: PY(-0.9), y2: PY(-0.9), stroke: INK, 'stroke-width': 2, 'stroke-opacity': .34 }, sv);
    E('text', { x: PX(0.4) + 21, y: PY(-0.9) + 3.5, 'font-size': 10, fill: INK, 'fill-opacity': .55, 'font-weight': 700,
      text: 'true f — never queried' }, sv);
    E('text', { x: CW / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'x' }, sv);

    host.querySelector('[data-k]').textContent = 'κ = ' + kap.toFixed(2);
    var row = function (lab, c, n) {
      return '<b style="color:' + c + '">' + lab + '</b><br>picks x = <b>' + GX[n].toFixed(2) + '</b>, worth <b>' + f2(ftrue(GX[n])) + '</b>';
    };
    host.querySelector('[data-num]').innerHTML = row('UCB — optimism', AMBER, iu) + '<br>' + row('LCB — pessimism', GREEN, il) +
      '<br><span style="color:var(--ink3)">best design in D: worth ' + f2(ftrue(x0)) + '</span>';
    host.querySelector('[data-note]').innerHTML = il === iu
      ? 'With κ this small the mean still wins: both rules walk to the far edge, where the band is widest and the truth is worst.'
      : 'The same model, the sign turned. Online, the UCB pick would be measured and the band there would collapse. Offline it would be <b>shipped</b>: the pessimistic rule stays where the band is narrow.';
  }
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: 3, step: 0.25, value: kap,
    on: function (v) { kap = +v; draw(); }
  });
  draw();
  return {
    reset: function () { kap = K0; dial.set(K0, false); draw(); },
    finish: function () { kap = 2; dial.set(2, false); draw(); }
  };
});
