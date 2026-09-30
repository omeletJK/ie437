/* ============================================================
   widget: constrained-ei
   The source deck's constrained-BO loop (pp. 177-183, after
   Gardner et al. 2014), run live on a 1-D problem built so that the
   unconstrained optimum sits inside the infeasible region:

       maximise f(x)  subject to  c(x) <= lambda,   x in [0, 1]

   One experiment returns both f(x) and c(x). Two independent GPs
   are fitted, one to each, and the next query maximises

       EI_C(x) = PF(x) * EI(x),   PF(x) = Phi((lambda - mu_c)/sigma_c)

   with f+ the best *feasible* observation. Both seeds are
   infeasible, so the first query has no incumbent and maximises PF
   alone - the feasibility search of the chapter's last slide.
   The rule toggle replays the same budget with plain EI, which
   ignores c: it keeps returning to the infeasible peak, which is
   the BO column of the source's p. 185.

   Each press of the deck's -> spends one query; switching the rule
   replays the same number of queries under the other rule.
   ============================================================ */
IE437.widget('constrained-ei', function (host, opts) {
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

  /* ---------- the problem: the best f lies where c > lambda ---------- */
  function bump(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)); }
  var f = function (x) { return 0.25 + 0.75 * bump(x, 0.24, 0.09) + 1.15 * bump(x, 0.72, 0.08) + 0.15 * Math.sin(9 * x); };
  var c = function (x) { return -0.45 + 1.2 * bump(x, 0.70, 0.12) + 0.12 * Math.sin(7 * x + 1); };
  var LAMBDA = 0, SEEDS = [0.62, 0.80], MAXN = 12, SN = 0.01;
  var KF = { s0: 0.5, l: 0.10 }, KC = { s0: 0.6, l: 0.13 };

  var GRID = []; (function () { for (var i = 0; i <= 400; i++) GRID.push(i / 400); })();
  var TF = GRID.map(f), TC = GRID.map(c);
  /* the feasible optimum, and the stretches of x where c > lambda */
  var XSTAR = 0, FSTAR = -1e9, BAD = [], i0 = -1;
  GRID.forEach(function (x, i) {
    if (TC[i] <= LAMBDA && TF[i] > FSTAR) { FSTAR = TF[i]; XSTAR = x; }
    if (TC[i] > LAMBDA && i0 < 0) i0 = i;
    if ((TC[i] <= LAMBDA || i === GRID.length - 1) && i0 >= 0) { BAD.push([GRID[i0], x]); i0 = -1; }
  });

  function fit(X, Y, K, m0) {
    var n = X.length, A = [], i, j;
    var k = function (a, b) { var d = a - b; return K.s0 * K.s0 * Math.exp(-0.5 * d * d / (K.l * K.l)); };
    for (i = 0; i < n; i++) A.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) A[i][j] = k(X[i], X[j]) + (i === j ? SN * SN + 1e-8 : 0);
    var L = chol(A), a = solveLT(L, solveL(L, Y.map(function (v) { return v - m0; })));
    return function (x) {
      var kv = new Float64Array(n), mu = m0, vv = 0, i;
      for (i = 0; i < n; i++) kv[i] = k(x, X[i]);
      for (i = 0; i < n; i++) mu += kv[i] * a[i];
      var v = solveL(L, kv);
      for (i = 0; i < n; i++) vv += v[i] * v[i];
      return { mu: mu, s: Math.sqrt(Math.max(1e-12, K.s0 * K.s0 - vv)) };
    };
  }
  function argmax(a) { var b = -Infinity, bi = 0; for (var i = 0; i < a.length; i++) if (a[i] > b) { b = a[i]; bi = i; } return bi; }

  /* everything the current data implies: both posteriors, EI, PF and the active score */
  function analyse(X, YF, YC, rule) {
    var mf = 0; YF.forEach(function (v) { mf += v / YF.length; });
    var gf = fit(X, YF, KF, mf), gc = fit(X, YC, KC, 0);
    var feas = YC.map(function (v) { return v <= LAMBDA; });
    var any = feas.some(Boolean);
    var fpF = any ? Math.max.apply(null, YF.filter(function (v, k) { return feas[k]; })) : null;
    var fpA = Math.max.apply(null, YF);
    var fplus = rule === 'ei' ? fpA : fpF;      /* plain EI does not know c exists */
    var PF = [], PC = [], EI = [], PFv = [];
    GRID.forEach(function (x) {
      var p = gf(x), q = gc(x);
      PF.push(p); PC.push(q);
      PFv.push(PHI((LAMBDA - q.mu) / q.s));
      if (fplus == null || p.s < 1e-9) EI.push(0);
      else { var z = (p.mu - fplus) / p.s; EI.push((p.mu - fplus) * PHI(z) + p.s * pdf(z)); }
    });
    var mode = rule === 'ei' ? 'EI' : (any ? 'EI·PF' : 'PF');
    var A = mode === 'EI' ? EI : mode === 'PF' ? PFv : EI.map(function (v, k) { return v * PFv[k]; });
    return { PF: PF, PC: PC, EI: EI, PFv: PFv, A: A, mode: mode, fplus: fplus, fpF: fpF, bi: argmax(A) };
  }

  var rule = (opts && opts.rule) === 'ei' ? 'ei' : 'cei';
  var X, YF, YC, M, shown = 0;
  function replay(n) {
    X = SEEDS.slice(); YF = X.map(f); YC = X.map(c); M = X.map(function () { return 'seed'; });
    while (X.length < SEEDS.length + n) {
      var S = analyse(X, YF, YC, rule), x = GRID[S.bi];
      X.push(x); YF.push(f(x)); YC.push(c(x)); M.push(S.mode);
    }
    shown = n;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Two GPs, one acquisition</span><span class="wspacer"></span>' +
    '<span class="wlabel">rule</span>' +
    '<button class="wb" data-r="cei">EI &times; PF</button><button class="wb" data-r="ei">EI alone</button>' +
    '<span class="wlabel" style="margin-left:8px">queries</span><span class="wnum" data-n></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;gap:2px"><div data-c1></div><div data-c2></div><div data-c3></div></div>' +
    '<div style="width:250px;display:flex;flex-direction:column;gap:8px">' +
    '<div data-log style="font:400 11.5px/1.5 var(--mono);color:var(--ink2);font-variant-numeric:tabular-nums"></div>' +
    '<div data-note style="font:400 12px/1.5 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:8px"></div></div></div>';

  var W = 580, H1 = 138, H2 = 104, H3 = 96, L = 34, R = 10;
  var sv1 = IE437.svg(W, H1), sv2 = IE437.svg(W, H2), sv3 = IE437.svg(W, H3);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  host.querySelector('[data-c3]').appendChild(sv3);
  var PX = function (v) { return L + v * (W - L - R); };
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  function mono(sv, x, y, t, a) {
    var o = { x: x, y: y, 'font-size': 9.5, fill: INK, 'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: t };
    for (var k in a) o[k] = a[k];
    return E('text', o, sv);
  }
  function line(arr, Yf) { return arr.map(function (v, k) { return (k ? 'L' : 'M') + PX(GRID[k]).toFixed(1) + ' ' + Yf(v).toFixed(1); }).join(''); }
  function band(P, Yf, fill, sv) {
    var d = 'M' + PX(GRID[0]) + ' ' + Yf(P[0].mu + 2 * P[0].s), i;
    for (i = 1; i < P.length; i++) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Yf(P[i].mu + 2 * P[i].s).toFixed(1);
    for (i = P.length - 1; i >= 0; i--) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Yf(P[i].mu - 2 * P[i].s).toFixed(1);
    E('path', { d: d + 'Z', fill: fill, 'fill-opacity': .13 }, sv);
  }
  function shade(sv, top, bot) {                 /* the true infeasible stretch, grey-red behind every panel */
    BAD.forEach(function (b) {
      E('rect', { x: PX(b[0]), y: top, width: PX(b[1]) - PX(b[0]), height: bot - top, fill: RED, 'fill-opacity': .07 }, sv);
    });
  }
  function axes(sv, bot) {
    E('line', { x1: L, y1: bot, x2: W - R, y2: bot, stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: L, y1: 6, x2: L, y2: bot, stroke: INK, 'stroke-opacity': .28 }, sv);
  }
  function dots(sv, Yf, Yv) {
    X.forEach(function (x, k) {
      var ok = YC[k] <= LAMBDA, cx = PX(x), cy = Yf(Yv[k]);
      if (ok) E('circle', { cx: cx, cy: cy, r: 4, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, sv);
      else E('path', { d: 'M' + (cx - 4) + ' ' + (cy - 4) + 'l8 8M' + (cx + 4) + ' ' + (cy - 4) + 'l-8 8',
        stroke: RED, 'stroke-width': 2 }, sv);
      if (k === X.length - 1 && k >= SEEDS.length) E('circle', { cx: cx, cy: cy, r: 7.5, fill: 'none', stroke: AMBER, 'stroke-width': 1.6 }, sv);
    });
  }

  function draw() {
    var S = analyse(X, YF, YC, rule), full = X.length >= MAXN, i;
    var nx = PX(GRID[S.bi]);

    /* --- objective --- */
    clear(sv1);
    var B1 = H1 - 8, lo = -0.3, hi = 1.9;
    var Y1 = function (v) { return B1 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (B1 - 10); };
    shade(sv1, 6, B1);
    band(S.PF, Y1, BLUE, sv1);
    E('path', { d: line(TF, Y1), fill: 'none', stroke: INK, 'stroke-opacity': .45, 'stroke-width': 1.5 }, sv1);
    E('path', { d: line(S.PF.map(function (p) { return p.mu; }), Y1), fill: 'none', stroke: BLUE, 'stroke-width': 2,
      'stroke-dasharray': '6 4' }, sv1);
    if (S.fpF != null) {
      E('line', { x1: L, y1: Y1(S.fpF), x2: W - R, y2: Y1(S.fpF), stroke: GREEN, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, sv1);
      mono(sv1, PX(0.47), Y1(S.fpF) - 4, 'best feasible f+ = ' + S.fpF.toFixed(2), { 'text-anchor': 'middle', fill: GREEN, 'fill-opacity': 1 });
    }
    E('path', { d: 'M' + (PX(XSTAR) - 5) + ' ' + (Y1(FSTAR) - 5) + 'l10 10M' + (PX(XSTAR) + 5) + ' ' + (Y1(FSTAR) - 5) + 'l-10 10',
      stroke: GREEN, 'stroke-width': 1.6 }, sv1);
    dots(sv1, Y1, YF);
    axes(sv1, B1);
    E('text', { x: L + 6, y: 16, 'font-size': 10, 'font-weight': 700, fill: BLUE, text: 'objective f(x): μ ± 2σ' }, sv1);
    E('text', { x: L + 150, y: 16, 'font-size': 10, fill: INK, 'fill-opacity': .5, text: 'true f' }, sv1);
    BAD.forEach(function (b) {
      mono(sv1, (PX(b[0]) + PX(b[1])) / 2, B1 - 5, 'truly infeasible', { 'text-anchor': 'middle', fill: RED, 'fill-opacity': .7 });
    });

    /* --- constraint --- */
    clear(sv2);
    var B2 = H2 - 8, lo2 = -1.1, hi2 = 1.3;
    var Y2 = function (v) { return B2 - (Math.max(lo2, Math.min(hi2, v)) - lo2) / (hi2 - lo2) * (B2 - 10); };
    shade(sv2, 6, B2);
    band(S.PC, Y2, RED, sv2);
    E('path', { d: line(TC, Y2), fill: 'none', stroke: INK, 'stroke-opacity': .45, 'stroke-width': 1.5 }, sv2);
    E('path', { d: line(S.PC.map(function (p) { return p.mu; }), Y2), fill: 'none', stroke: RED, 'stroke-width': 2,
      'stroke-dasharray': '6 4' }, sv2);
    E('line', { x1: L, y1: Y2(LAMBDA), x2: W - R, y2: Y2(LAMBDA), stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }, sv2);
    mono(sv2, L - 4, Y2(LAMBDA) + 3.5, 'λ', { 'text-anchor': 'end', 'fill-opacity': .8, 'font-size': 11 });
    mono(sv2, L + 6, Y2(LAMBDA) - 5, 'feasible below λ');
    dots(sv2, Y2, YC);
    axes(sv2, B2);
    E('text', { x: L + 6, y: 16, 'font-size': 10, 'font-weight': 700, fill: RED, text: 'constraint c(x): μ_c ± 2σ_c' }, sv2);

    /* --- acquisition --- */
    clear(sv3);
    var B3 = H3 - 20;
    var Y3 = function (v) { return B3 - v * (B3 - 14); };
    shade(sv3, 6, B3);
    var em = Math.max(1e-9, Math.max.apply(null, S.EI)), am = Math.max(1e-9, Math.max.apply(null, S.A));
    E('path', { d: line(S.PFv, Y3), fill: 'none', stroke: GREEN, 'stroke-width': 1.6 }, sv3);
    if (S.mode !== 'EI') E('path', { d: line(S.EI.map(function (v) { return v / em; }), Y3), fill: 'none', stroke: INK,
      'stroke-opacity': .4, 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, sv3);
    E('path', { d: 'M' + PX(0) + ' ' + Y3(0) + line(S.A.map(function (v) { return v / am; }), Y3).replace(/^M/, 'L') +
      'L' + PX(1) + ' ' + Y3(0) + 'Z', fill: AMBER, 'fill-opacity': .18, stroke: AMBER, 'stroke-width': 2 }, sv3);
    if (!full) {
      E('line', { x1: nx, y1: Y3(1), x2: nx, y2: B3, stroke: AMBER, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' }, sv3);
      E('path', { d: 'M' + (nx - 5) + ' ' + (Y3(1) - 9) + 'h10l-5 8Z', fill: AMBER }, sv3);
    }
    axes(sv3, B3);
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (t) { mono(sv3, PX(t), H3 - 6, t, { 'text-anchor': 'middle', 'font-size': 9 }); });
    var lg = [[full ? 'score ' + S.mode : 'next query maximises ' + S.mode, AMBER, 700]];
    if (S.mode !== 'PF') lg.push(['PF(x)', GREEN, 700]);
    if (S.mode === 'EI·PF') lg.push(['EI(x), scaled', INK, 400]);
    var tx = nx > W / 2 ? L + 8 : W - R - 3, anc = nx > W / 2 ? 'start' : 'end';
    var tt = E('text', { x: tx, y: 12, 'text-anchor': anc, 'font-size': 10 }, sv3);
    lg.forEach(function (g, k) {
      E('tspan', { fill: g[1], 'fill-opacity': g[1] === INK ? .55 : 1, 'font-weight': g[2], dx: k ? 12 : 0, text: g[0] }, tt);
    });

    /* --- log and note --- */
    host.querySelector('[data-n]').textContent = (X.length - SEEDS.length) + ' / ' + (MAXN - SEEDS.length);
    [].forEach.call(host.querySelectorAll('[data-r]'), function (b) { b.classList.toggle('on', b.getAttribute('data-r') === rule); });
    var bad = 0, best = null;
    var rows = X.map(function (x, k) {
      var ok = YC[k] <= LAMBDA;
      if (ok) best = best == null ? YF[k] : Math.max(best, YF[k]);
      if (!ok && k >= SEEDS.length) bad++;
      return '<div style="display:flex;justify-content:space-between' +
        (k === X.length - 1 && k >= SEEDS.length ? ';color:' + AMBER + ';font-weight:600' : '') + '">' +
        '<span style="width:40px;font-size:10px">' + M[k] + '</span>' +
        '<span>x=' + x.toFixed(3) + '</span>' +
        '<span style="width:16px;text-align:center;color:' + (ok ? GREEN : RED) + '">' + (ok ? '✓' : '✗') + '</span>' +
        '<span style="width:40px;text-align:right">' + (best == null ? '—' : best.toFixed(2)) + '</span></div>';
    }).join('');
    host.querySelector('[data-log]').innerHTML =
      '<div style="display:flex;justify-content:space-between;color:var(--ink4);font-size:9px;letter-spacing:.1em;' +
      'text-transform:uppercase;margin-bottom:2px"><span style="width:40px">by</span><span>query</span>' +
      '<span style="width:16px">c≤λ</span><span style="width:40px;text-align:right;white-space:nowrap">best f+</span></div>' + rows;

    var note;
    if (shown === 0) note = rule === 'ei'
      ? 'Plain EI ignores c. Its incumbent is the best f seen, feasible or not.'
      : 'Both seeds are <b>infeasible</b>, so there is no feasible incumbent and EI is undefined. The first query maximises <b>PF</b> alone.';
    else if (M[M.length - 1] === 'PF') note = 'A feasibility search: the query goes where the constraint GP is most confident that c ≤ λ.';
    else note = rule === 'ei'
      ? 'Plain EI has spent <b>' + bad + '</b> of ' + shown + ' queries on infeasible designs &mdash; the tall peak it chases lies where c &gt; λ.'
      : 'EI·PF has spent <b>' + bad + '</b> of ' + shown + ' queries on infeasible designs. PF vetoes the infeasible peak once the constraint GP has seen it.';
    if (full) note += ' Best feasible: <b>' + (best == null ? '—' : best.toFixed(3)) + '</b>.';
    host.querySelector('[data-note]').innerHTML = note +
      '<br><span style="color:var(--ink4)">feasible optimum f* = ' + FSTAR.toFixed(3) + ' at x* = ' + XSTAR.toFixed(3) + ' (green ×)</span>';
  }

  [].forEach.call(host.querySelectorAll('[data-r]'), function (b) {
    b.onclick = function () { rule = b.getAttribute('data-r'); replay(shown); draw(); };
  });

  replay(0); draw();
  return {
    steps: MAXN - SEEDS.length,
    step: function (s) { replay(s); draw(); },
    reset: function () { replay(0); draw(); },
    finish: function () { replay(MAXN - SEEDS.length); draw(); }
  };
});
