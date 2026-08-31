/* ============================================================
   widget: gp-posterior
   The length-scale sweep of the source deck (pp. 30–36), made live.
   Left: the GP posterior over a handful of observations. Right: the
   marginal log-likelihood split into its two terms — data fit and
   complexity — plotted against the length scale, with the current
   value marked. The total peaks where neither term is happy: the
   Occam balance that picks the kernel's one free number.
   Click the left panel to place another observation.
   ============================================================ */
IE437.widget('gp-posterior', function (host, opts) {
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
      if (i === j) { if (s <= 0) s = 1e-10; L[i][j] = Math.sqrt(s); }
      else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function solveL(L, b) {
    var n = L.length, y = new Float64Array(n), i, k, s;
    for (i = 0; i < n; i++) { s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; }
    return y;
  }
  function solveLT(L, b) {
    var n = L.length, x = new Float64Array(n), i, k, s;
    for (i = n - 1; i >= 0; i--) { s = b[i]; for (k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; }
    return x;
  }
  var S0 = 1.0, SN = 0.1;                       /* amplitude and noise, held fixed */
  function kSE(a, b, lam) { var d = a - b; return S0 * S0 * Math.exp(-0.5 * d * d / (lam * lam)); }

  function fit(X, Y, lam) {
    var n = X.length, K = [], i, j;
    for (i = 0; i < n; i++) K.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) K[i][j] = kSE(X[i], X[j], lam) + (i === j ? SN * SN : 0);
    var L = chol(K), a = solveLT(L, solveL(L, Y));
    var logdet = 0; for (i = 0; i < n; i++) logdet += Math.log(L[i][i]); logdet *= 2;
    var q = 0; for (i = 0; i < n; i++) q += Y[i] * a[i];
    return { X: X, Y: Y, lam: lam, L: L, a: a,
             dataFit: -0.5 * q, cplx: -0.5 * logdet,
             lml: -0.5 * q - 0.5 * logdet - 0.5 * n * Math.log(2 * Math.PI) };
  }
  function pred(g, x) {
    var n = g.X.length, k = new Float64Array(n), i, mu = 0, vv = 0;
    for (i = 0; i < n; i++) k[i] = kSE(x, g.X[i], g.lam);
    for (i = 0; i < n; i++) mu += k[i] * g.a[i];
    var v = solveL(g.L, k);
    for (i = 0; i < n; i++) vv += v[i] * v[i];
    return { mu: mu, s: Math.sqrt(Math.max(1e-12, S0 * S0 - vv)) };
  }

  /* ---------- the seven observations of the source figure ---------- */
  var X0 = [-0.95, -0.60, -0.35, -0.15, 0.20, 0.60, 1.00];
  var TRUE = function (x) { return 0.85 * Math.sin(2.2 * x + 0.6); };
  var X = X0.slice(), Y = X0.map(TRUE);

  var LAMS = [0.05, 0.08, 0.12, 0.2, 0.3, 0.45, 0.65, 0.85, 1.2, 1.8, 3, 5, 8];
  var li = 7;                                   /* 0.85 — the marginal-likelihood optimum */

  host.innerHTML =
    '<div class="wbar"><span class="wt">One kernel, one knob</span><span class="wspacer"></span>' +
    '<span class="wlabel">length scale</span><span class="wnum" data-l></span>' +
    '<span data-sl></span>' +
    '<button class="wb" data-best>best &lambda;</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the posterior &mdash; click to add an observation</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">marginal log-likelihood, split in two</div><div data-c2></div></div>' +
    '<div style="width:196px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div>';

  var W1 = 442, H1 = 252, W2 = 300, H2 = 252;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  var XD = [-2, 2], YD = [-2.4, 2.4];
  var PX = function (v) { return 30 + (v - XD[0]) / (XD[1] - XD[0]) * (W1 - 42); };
  var PY = function (v) { return H1 - 26 - (v - YD[0]) / (YD[1] - YD[0]) * (H1 - 42); };

  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  function drawPosterior(g) {
    clear(sv1);
    var N = 180, i, xs = [], up = [], lo = [], mid = [], x, p;
    for (i = 0; i <= N; i++) {
      x = XD[0] + (XD[1] - XD[0]) * i / N; p = pred(g, x);
      xs.push(x); mid.push(p.mu); up.push(p.mu + 2 * p.s); lo.push(p.mu - 2 * p.s);
    }
    var cl = function (v) { return Math.max(YD[0], Math.min(YD[1], v)); };
    var d = 'M' + PX(xs[0]).toFixed(1) + ' ' + PY(cl(up[0])).toFixed(1);
    for (i = 1; i <= N; i++) d += 'L' + PX(xs[i]).toFixed(1) + ' ' + PY(cl(up[i])).toFixed(1);
    for (i = N; i >= 0; i--) d += 'L' + PX(xs[i]).toFixed(1) + ' ' + PY(cl(lo[i])).toFixed(1);
    E('path', { d: d + 'Z', fill: BLUE, 'fill-opacity': .13 }, sv1);

    /* axes */
    E('line', { x1: 22, y1: PY(0), x2: W1 - 10, y2: PY(0), stroke: INK, 'stroke-opacity': .22 }, sv1);
    E('line', { x1: 30, y1: 12, x2: 30, y2: H1 - 26, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: 30, y1: H1 - 26, x2: W1 - 10, y2: H1 - 26, stroke: INK, 'stroke-opacity': .28 }, sv1);
    [-2, -1, 0, 1, 2].forEach(function (t) {
      E('text', { x: PX(t), y: H1 - 12, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: t }, sv1);
    });
    [-2, 0, 2].forEach(function (t) {
      E('text', { x: 24, y: PY(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: t }, sv1);
    });

    var dm = mid.map(function (v, k) { return (k ? 'L' : 'M') + PX(xs[k]).toFixed(1) + ' ' + PY(cl(v)).toFixed(1); }).join('');
    E('path', { d: dm, fill: 'none', stroke: BLUE, 'stroke-width': 2.2 }, sv1);

    X.forEach(function (xi, k) {
      E('path', { d: 'M' + (PX(xi) - 4) + ' ' + (PY(Y[k]) - 4) + 'l8 8M' + (PX(xi) + 4) + ' ' + (PY(Y[k]) - 4) + 'l-8 8',
        stroke: INK, 'stroke-width': 1.9, 'stroke-linecap': 'round' }, sv1);
    });
    E('text', { x: (W1 + 30) / 2, y: H1 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: 'x' }, sv1);
  }

  /* ---------- right panel: the two terms against lambda ---------- */
  function sweep() {
    var out = [], i, lam, g;
    for (i = 0; i <= 60; i++) {
      lam = 0.04 * Math.pow(250, i / 60);
      g = fit(X, Y, lam);
      out.push({ lam: lam, fit: g.dataFit, cplx: g.cplx, lml: g.lml });
    }
    return out;
  }
  function drawSweep(g) {
    clear(sv2);
    var S = sweep(), i, all = [];
    S.forEach(function (p) { all.push(p.fit, p.cplx, p.lml); });
    var hi = Math.max.apply(null, all), lo = Math.min.apply(null, all);
    lo = Math.max(lo, -26); hi = Math.max(hi, 2);
    var pad = 0.08 * (hi - lo); hi += pad; lo -= pad;
    var LX = function (v) { return 34 + (Math.log(v) - Math.log(0.04)) / (Math.log(10) - Math.log(0.04)) * (W2 - 46); };
    var LY = function (v) { return H2 - 26 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (H2 - 42); };

    [-20, -10, 0, 10].forEach(function (t) {
      if (t < lo || t > hi) return;
      E('line', { x1: 34, y1: LY(t), x2: W2 - 12, y2: LY(t), stroke: INK, 'stroke-opacity': .1 }, sv2);
      E('text', { x: 29, y: LY(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv2);
    });
    [0.1, 1, 10].forEach(function (t) {
      E('text', { x: LX(t), y: H2 - 12, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv2);
    });
    E('line', { x1: 34, y1: 12, x2: 34, y2: H2 - 26, stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('line', { x1: 34, y1: H2 - 26, x2: W2 - 12, y2: H2 - 26, stroke: INK, 'stroke-opacity': .28 }, sv2);

    function line(key, col, w) {
      var d = S.map(function (p, k) { return (k ? 'L' : 'M') + LX(p.lam).toFixed(1) + ' ' + LY(p[key]).toFixed(1); }).join('');
      E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w }, sv2);
    }
    line('cplx', GREEN, 1.8);
    line('fit', BLUE, 1.8);
    line('lml', AMBER, 2.4);

    /* the argmax, and the current setting */
    var best = S[0], k;
    for (k = 1; k < S.length; k++) if (S[k].lml > best.lml) best = S[k];
    E('line', { x1: LX(best.lam), y1: 12, x2: LX(best.lam), y2: H2 - 26, stroke: AMBER,
      'stroke-opacity': .5, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, sv2);
    E('line', { x1: LX(g.lam), y1: 12, x2: LX(g.lam), y2: H2 - 26, stroke: RED, 'stroke-width': 1.6 }, sv2);
    E('circle', { cx: LX(g.lam), cy: LY(g.lml), r: 4, fill: RED }, sv2);

    E('text', { x: 40, y: 22, 'font-size': 10, 'font-weight': 700, fill: GREEN, text: 'complexity' }, sv2);
    E('text', { x: 40, y: 35, 'font-size': 10, 'font-weight': 700, fill: BLUE, text: 'data fit' }, sv2);
    E('text', { x: 40, y: 48, 'font-size': 10, 'font-weight': 700, fill: AMBER, text: 'total' }, sv2);
    E('text', { x: W2 / 2 + 8, y: H2 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
      'font-family': 'IBM Plex Mono, monospace', text: 'length scale  λ  (log)' }, sv2);
    return best.lam;
  }

  function draw() {
    var lam = LAMS[li], g = fit(X, Y, lam);
    drawPosterior(g);
    var bestLam = drawSweep(g);

    host.querySelector('[data-l]').textContent = lam.toFixed(2);
    host.querySelector('[data-num]').innerHTML =
      '<b>' + X.length + '</b> observations<br>' +
      '<span style="color:' + BLUE + '">data fit</span> &nbsp;<b>' + g.dataFit.toFixed(2) + '</b><br>' +
      '<span style="color:' + GREEN + '">complexity</span> &nbsp;<b>' + g.cplx.toFixed(2) + '</b><br>' +
      '<span style="color:' + AMBER + '">total log <i>p</i>(y|&theta;)</span> &nbsp;<b>' + g.lml.toFixed(2) + '</b><br>' +
      '<span style="color:' + SLATE + '">best &lambda; &asymp; ' + bestLam.toFixed(2) + '</span>';

    var note;
    if (lam <= 0.12) note = 'The model believes <b>nothing carries</b>. The mean spikes at each cross and falls back to the prior between them; the band never closes.';
    else if (lam >= 3) note = 'The model believes <b>everything carries</b>. One rigid curve, a thin band, and observations it cannot bend to reach.';
    else if (Math.abs(lam - bestLam) / bestLam < 0.45) note = 'Near the marginal-likelihood optimum. Neither term is maximised &mdash; <b>that is the point</b>.';
    else note = 'Moving away from the optimum: one term is being bought at the other’s expense.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  /* ---------- interaction ---------- */
  sv1.style.cursor = 'crosshair';
  sv1.addEventListener('click', function (ev) {
    var r = sv1.getBoundingClientRect();
    var px = (ev.clientX - r.left) / r.width * W1, py = (ev.clientY - r.top) / r.height * H1;
    var x = XD[0] + (px - 30) / (W1 - 42) * (XD[1] - XD[0]);
    var y = YD[0] + (H1 - 26 - py) / (H1 - 42) * (YD[1] - YD[0]);
    if (x < XD[0] || x > XD[1] || y < YD[0] || y > YD[1]) return;
    if (X.length >= 24) return;
    X.push(x); Y.push(y); draw();
  });
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: LAMS.length - 1, step: 1, value: li,
    on: function (v) { li = v; draw(); }
  });
  var __reset = function () {
    X = X0.slice(); Y = X0.map(TRUE); li = 7; dial.set(7, false); draw();
  };
  host.querySelector('[data-best]').onclick = function () {
    var b = -1e18, bi = 0;
    LAMS.forEach(function (l, k) { var v = fit(X, Y, l).lml; if (v > b) { b = v; bi = k; } });
    li = bi; draw();
  };

  draw();
  return { reset: __reset, finish: function () { X = X0.slice(); Y = X0.map(TRUE); li = 7; draw(); } };
});
