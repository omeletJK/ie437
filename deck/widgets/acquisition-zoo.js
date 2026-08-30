/* ============================================================
   widget: acquisition-zoo
   The comparison figure of the source deck (p. 126, after Brochu):
   one GP posterior, and underneath it PI, EI and UCB drawn on the
   same axis with their argmaxes marked. The three rules disagree,
   and the dials — the margin xi for PI and EI, the price kappa for
   UCB — move them onto one another.
   ============================================================ */
IE437.widget('acquisition-zoo', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706',
      RED = '#D64545', SLATE = '#64748B';

  /* ---------- linear algebra ---------- */
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

  var S0 = 0.42, LAM = 0.16, SN = 0.02;
  function kSE(a, b) { var d = a - b; return S0 * S0 * Math.exp(-0.5 * d * d / (LAM * LAM)); }
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
    return s * y;
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var pdf = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };

  /* ---------- the fixed problem ---------- */
  var TRUE = function (x) { return 0.55 + 0.42 * Math.sin(6.1 * x - 1.1) + 0.30 * Math.sin(2.0 * x + 0.4) + 0.10 * x; };
  var XO = [0.05, 0.15, 0.20, 0.65, 0.92], YO = XO.map(TRUE);
  var FMAX = Math.max.apply(null, YO), XPLUS = XO[YO.indexOf(FMAX)];

  var G = (function () {
    var n = XO.length, K = [], i, j;
    for (i = 0; i < n; i++) K.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) K[i][j] = kSE(XO[i], XO[j]) + (i === j ? SN * SN : 0);
    var m0 = 0; for (i = 0; i < n; i++) m0 += YO[i] / n;
    var L = chol(K), a = solveLT(L, solveL(L, YO.map(function (v) { return v - m0; })));
    return { L: L, a: a, m0: m0 };
  })();
  function pred(x) {
    var n = XO.length, k = new Float64Array(n), i, mu = G.m0, vv = 0;
    for (i = 0; i < n; i++) k[i] = kSE(x, XO[i]);
    for (i = 0; i < n; i++) mu += k[i] * G.a[i];
    var v = solveL(G.L, k);
    for (i = 0; i < n; i++) vv += v[i] * v[i];
    return { mu: mu, s: Math.sqrt(Math.max(1e-12, S0 * S0 - vv)) };
  }

  var GRID = []; (function () { for (var i = 0; i <= 300; i++) GRID.push(i / 300); })();
  var POST = GRID.map(pred);

  var XI = [0, 0.01, 0.05, 0.10, 0.30], KA = [0, 0.5, 1, 2, 3, 5];
  var xi = 0, ka = 3;                            /* xi = 0, kappa = 2 */

  host.innerHTML =
    '<div class="wbar"><span class="wt">One posterior, three rules</span><span class="wspacer"></span>' +
    '<span class="wlabel">margin</span><span class="wnum" data-x></span>' +
    '<button class="wb" data-xd>&xi; &darr;</button><button class="wb" data-xu>&xi; &uarr;</button>' +
    '<span class="wlabel" style="margin-left:8px">price</span><span class="wnum" data-k></span>' +
    '<button class="wb" data-kd>&kappa; &darr;</button><button class="wb" data-ku>&kappa; &uarr;</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="width:250px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12.5px/1.8 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div>';

  var W = 620, HP = 148, HA = 52, GAP = 8, H = HP + 3 * (HA + GAP) + 20;
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  var L = 40, R = 12;
  var PX = function (v) { return L + v * (W - L - R); };
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  function acqCurves() {
    var pi = [], ei = [], ub = [], x0 = XI[xi], k0 = KA[ka];
    POST.forEach(function (p) {
      var z1 = p.s > 1e-8 ? (p.mu - FMAX - x0) / p.s : 0;
      pi.push(p.s > 1e-8 ? PHI(z1) : 0);
      ei.push(p.s > 1e-8 ? (p.mu - FMAX - x0) * PHI(z1) + p.s * pdf(z1) : 0);
      ub.push(p.mu + k0 * p.s);
    });
    return { pi: pi, ei: ei, ub: ub };
  }
  function argmax(v) { var b = -1e18, bi = 0, i; for (i = 0; i < v.length; i++) if (v[i] > b) { b = v[i]; bi = i; } return bi; }

  function panel(y0, h, vals, col, label) {
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (hi - lo < 1e-9) hi = lo + 1;
    var pad = 0.14 * (hi - lo);
    var Y = function (v) { return y0 + h - (v - lo + pad * 0.15) / (hi - lo + pad) * h; };
    E('line', { x1: L, y1: y0 + h, x2: W - R, y2: y0 + h, stroke: INK, 'stroke-opacity': .2 }, sv);
    var d = vals.map(function (v, k) { return (k ? 'L' : 'M') + PX(GRID[k]).toFixed(1) + ' ' + Y(v).toFixed(1); }).join('');
    E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 1.9 }, sv);
    var bi = argmax(vals), bx = PX(GRID[bi]), by = Y(vals[bi]);
    E('path', { d: 'M' + (bx - 5) + ' ' + (by - 10) + 'h10l-5 9Z', fill: RED }, sv);
    E('line', { x1: bx, y1: by, x2: bx, y2: y0 + h, stroke: RED, 'stroke-opacity': .45,
      'stroke-width': 1, 'stroke-dasharray': '2 3' }, sv);
    E('text', { x: L - 6, y: y0 + h / 2 + 3.5, 'text-anchor': 'end', 'font-size': 10, 'font-weight': 700,
      fill: col, text: label }, sv);
    return GRID[bi];
  }

  function draw() {
    clear(sv);
    var A = acqCurves();

    /* --- posterior --- */
    var lo = -0.15, hi = 1.55;
    var Y = function (v) { return HP - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (HP - 10) - 2; };
    var d = 'M' + PX(0) + ' ' + Y(POST[0].mu + 2 * POST[0].s), i;
    for (i = 1; i < POST.length; i++) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y(POST[i].mu + 2 * POST[i].s).toFixed(1);
    for (i = POST.length - 1; i >= 0; i--) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y(POST[i].mu - 2 * POST[i].s).toFixed(1);
    E('path', { d: d + 'Z', fill: BLUE, 'fill-opacity': .13 }, sv);
    E('path', { d: GRID.map(function (x, k) { return (k ? 'L' : 'M') + PX(x).toFixed(1) + ' ' + Y(TRUE(x)).toFixed(1); }).join(''),
      fill: 'none', stroke: INK, 'stroke-opacity': .38, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, sv);
    E('path', { d: POST.map(function (p, k) { return (k ? 'L' : 'M') + PX(GRID[k]).toFixed(1) + ' ' + Y(p.mu).toFixed(1); }).join(''),
      fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, sv);
    E('line', { x1: L, y1: Y(FMAX), x2: W - R, y2: Y(FMAX), stroke: INK, 'stroke-opacity': .45,
      'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, sv);
    E('text', { x: W - R - 3, y: Y(FMAX) - 5, 'text-anchor': 'end', 'font-size': 9.5, fill: INK,
      'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: 'f⁺ = ' + FMAX.toFixed(2) }, sv);
    XO.forEach(function (x, k) { E('circle', { cx: PX(x), cy: Y(YO[k]), r: 4, fill: INK }, sv); });
    E('line', { x1: L, y1: HP - 2, x2: W - R, y2: HP - 2, stroke: INK, 'stroke-opacity': .22 }, sv);
    E('text', { x: L + 6, y: 20, 'font-size': 10, 'font-weight': 700, fill: BLUE, text: 'μ ± 2σ' }, sv);
    E('text', { x: L + 66, y: 20, 'font-size': 10, 'font-weight': 700, fill: INK, 'fill-opacity': .5,
      text: 'true f' }, sv);

    /* --- the three scores --- */
    var y0 = HP + GAP;
    var xp = panel(y0, HA, A.pi, SLATE, 'PI'); y0 += HA + GAP;
    var xe = panel(y0, HA, A.ei, BLUE, 'EI'); y0 += HA + GAP;
    var xu = panel(y0, HA, A.ub, GREEN, 'UCB');

    [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
      E('text', { x: PX(t), y: H - 4, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t.toFixed(2) }, sv);
    });

    host.querySelector('[data-x]').textContent = XI[xi].toFixed(2);
    host.querySelector('[data-k]').textContent = KA[ka].toFixed(1);
    host.querySelector('[data-num]').innerHTML =
      'incumbent <b>x⁺ = ' + XPLUS.toFixed(2) + '</b>, f⁺ = ' + FMAX.toFixed(3) + '<br>' +
      '<span style="color:' + SLATE + '">PI</span> queries <b>' + xp.toFixed(3) + '</b> &rarr; ' + TRUE(xp).toFixed(3) + '<br>' +
      '<span style="color:' + BLUE + '">EI</span> queries <b>' + xe.toFixed(3) + '</b> &rarr; ' + TRUE(xe).toFixed(3) + '<br>' +
      '<span style="color:' + GREEN + '">UCB</span> queries <b>' + xu.toFixed(3) + '</b> &rarr; ' + TRUE(xu).toFixed(3) + '<br>' +
      '<span style="color:' + INK + ';opacity:.55">true max 1.303 at x = 0.454</span>';

    var note;
    if (XI[xi] === 0) note = 'With no margin, PI parks itself <b>beside the incumbent</b> and buys a near-certain sliver. EI walks into the uncertain valley, where the maximum actually is.';
    else if (XI[xi] >= 0.3) note = 'A large margin makes PI demand a real gain, and it lands where EI already was &mdash; <b>the same knob, tuned by hand</b>.';
    else note = 'Raising &xi; drags PI out of the incumbent’s neighbourhood, one step at a time.';
    if (KA[ka] === 0) note += ' &kappa; = 0 makes UCB purely greedy on the mean.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  host.querySelector('[data-xu]').onclick = function () { xi = Math.min(XI.length - 1, xi + 1); draw(); };
  host.querySelector('[data-xd]').onclick = function () { xi = Math.max(0, xi - 1); draw(); };
  host.querySelector('[data-ku]').onclick = function () { ka = Math.min(KA.length - 1, ka + 1); draw(); };
  host.querySelector('[data-kd]').onclick = function () { ka = Math.max(0, ka - 1); draw(); };

  draw();
  return { finish: function () { xi = 0; ka = 3; draw(); } };
});
