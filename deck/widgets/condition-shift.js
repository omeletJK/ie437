/* ============================================================
   widget: condition-shift                          (Chapter 6, Act 4)
   Ask a generator for a score, and count what comes back.

   The story, one request at a time: the generator proposes 10,000
   designs; the ones whose learned score reaches the request gamma are
   kept (Lecture 3's "keep what passes, count what is left"); then we
   look at what the kept designs are really worth. Asking a little past
   the data's best pays; asking far past it buys designs whose promise
   the truth does not keep; asking further still, nothing passes.

   The problem is Lecture 5's, unchanged. Two hundred designs are drawn
   from N(3.0, 1.15^2) and kept only below x = 5.5 — nobody has built a
   design past there — and a score model is fitted to them with the same
   ReLU-knot ridge basis Lecture 5 used for its surrogate. It stands for
   the x-to-y relation a conditional generator learns from D; past the
   data it is a guess. The generator's proposals are the Gaussian fitted
   to the designs, drawn as 10,000 evenly spaced quantiles, so the
   picture is the expectation rather than one lucky draw.

   Verified in node before shipping (seed 11; the best measured design
   is worth 2.523, the true optimum 2.657 at x = 6.04):

     request  kept / 10,000  promised (mean f_hat)  true (mean f)
      2.00        984              2.22                2.27
      2.40        155              2.56                2.59
      2.50         88              2.65                2.61   <- truly better
      2.60         47              2.74                2.59
      2.80         12              2.92                2.42   <- promise broken
      3.00          2              3.12                2.06
      3.20          0                -                   -     <- nothing passes

   Walked by the deck's ->: 2.00, then 2.50, then 2.80, then 3.20; the
   slider sets any request in between.
   ============================================================ */
IE437.widget('condition-shift', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  /* ---------- Lecture 5's objective, unchanged ---------- */
  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }

  /* ---------- the offline dataset ---------- */
  var SEED = opts.seed || 11, R = IE437.rng(SEED), N = 200, XCAP = 5.5, i;
  function gs(rr) { var u = 0, v = 0; while (u === 0) u = rr(); while (v === 0) v = rr();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var D = [];
  while (D.length < N) { var x = 3.0 + 1.15 * gs(R); if (x > 0.30 && x < XCAP) D.push({ x: x, y: ftrue(x) + 0.03 * gs(R) }); }
  var MU = 0, SD = 0;
  D.forEach(function (d) { MU += d.x; }); MU /= N;
  D.forEach(function (d) { SD += (d.x - MU) * (d.x - MU); }); SD = Math.sqrt(SD / N);
  var BEST = -9;
  D.forEach(function (d) { if (ftrue(d.x) > BEST) BEST = ftrue(d.x); });

  /* ---------- the learned score: the same basis Lecture 5 fitted ---------- */
  var KN = [], MK = 26, j, LAM = 0.06;
  for (j = 0; j < MK; j++) KN.push(0.35 + 9.3 * j / (MK - 1));
  function phi(x) { var v = [1, x / 5], k; for (k = 0; k < MK; k++) { v.push(Math.max(0, x - KN[k]) / 3); v.push(Math.max(0, KN[k] - x) / 3); } return v; }
  var P = phi(0).length;
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, k) { return r.concat([b[k]]); }), c, r, k, p, d, f, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      t = M[c]; M[c] = M[p]; M[p] = t;
      d = M[c][c]; for (k = c; k <= n; k++) M[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = M[r][c]; if (!f) continue;
        for (k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (row) { return row[n]; });
  }
  var A0 = [], b0 = new Array(P), q;
  for (i = 0; i < P; i++) { b0[i] = 0; A0.push(new Array(P)); for (q = 0; q < P; q++) A0[i][q] = 0; }
  D.forEach(function (d) { var p = phi(d.x);
    for (var a = 0; a < P; a++) { b0[a] += p[a] * d.y / N; for (var c = 0; c < P; c++) A0[a][c] += p[a] * p[c] / N; } });
  for (i = 0; i < P; i++) A0[i][i] += (i < 2 ? LAM * 1e-2 : LAM);
  var WV = solve(A0, b0);
  function fhat(x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += WV[a] * p[a]; return s; }

  /* ---------- the generator's proposals: 10,000 evenly spaced quantiles ---------- */
  function ninv(p) {                                  /* Acklam's inverse normal */
    var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
        b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
        c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
        d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], qq, r;
    if (p < 0.02425) { qq = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * qq + c[1]) * qq + c[2]) * qq + c[3]) * qq + c[4]) * qq + c[5]) / ((((d[0] * qq + d[1]) * qq + d[2]) * qq + d[3]) * qq + 1); }
    if (p <= 1 - 0.02425) { qq = p - 0.5; r = qq * qq;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * qq / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    qq = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * qq + c[1]) * qq + c[2]) * qq + c[3]) * qq + c[4]) * qq + c[5]) / ((((d[0] * qq + d[1]) * qq + d[2]) * qq + d[3]) * qq + 1);
  }
  var MM = 10000, PROP = [];
  for (i = 1; i <= MM; i++) PROP.push(MU + SD * ninv((i - 0.5) / MM));
  var FH = PROP.map(fhat), FT = PROP.map(ftrue);

  var GAM = [2.00, 2.20, 2.40, 2.50, 2.60, 2.80, 2.90, 3.00, 3.20], STOPS = [0, 3, 5, 8], gi = 0;
  function stats(g) {
    var n = 0, sh = 0, st = 0, lo = 99, hi = -99, k;
    for (k = 0; k < MM; k++) if (FH[k] >= g) { n++; sh += FH[k]; st += FT[k]; if (PROP[k] < lo) lo = PROP[k]; if (PROP[k] > hi) hi = PROP[k]; }
    return { n: n, promised: n ? sh / n : NaN, truth: n ? st / n : NaN, lo: lo, hi: hi };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">ask the generator for a score &mdash; how many pass, and what they are really worth</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">request</span>' +
    '<span class="wnum" data-val style="min-width:78px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:flex-start;padding:11px 16px 9px">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:9px">' +
    '<div data-key style="font:400 12px/1.65 var(--sans);color:var(--ink2)"></div>' +
    '<div data-num style="border-top:1px solid rgba(22,24,29,.14);padding-top:9px;font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '</div></div>';

  var CW = 600, CH = 296, PL = 34, PR = 12, PT = 12, PB = 24;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  function cx(v) { return PL + v / 10 * (CW - PL - PR); }
  var YL = -0.4, YH = 4.4;
  function cy(v) { return CH - PB - (v - YL) / (YH - YL) * (CH - PT - PB); }

  /* the definitions — every mark on the figure, named once */
  host.querySelector('[data-key]').innerHTML =
    '<span style="color:' + SLATE + '">&#9679;</span> 200 measured designs, the data D<br>' +
    '<span style="color:' + BLUE + '">&#9548;&#9548;</span> score learned from D &mdash; past the data, a guess<br>' +
    '<span style="color:' + INK + '">&#9473;&#9473;</span> true score &mdash; hidden from the method<br>' +
    '<span style="color:' + AMBER + '">&#9548;&#9548;</span> the request: learned score &ge; &gamma;<br>' +
    '<span style="color:' + SLATE + '">&#9601;&#9602;&#9601;</span> where the generator proposes designs<br>' +
    '<span style="color:' + BLUE + '">&#9679;</span> kept designs, placed at their true score';

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var g = GAM[gi], S = stats(g), k;

    /* axes */
    E('line', { x1: PL, y1: cy(YL), x2: CW - PR, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: PL, y1: PT, x2: PL, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 1, 2, 3, 4].forEach(function (t) {
      E('text', { x: PL - 6, y: cy(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
      E('line', { x1: PL, x2: CW - PR, y1: cy(t), y2: cy(t), stroke: INK, 'stroke-opacity': .07 }, sv);
    });
    [0, 2, 4, 6, 8].forEach(function (t) {
      E('text', { x: cx(t), y: CH - 9, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
    });
    E('text', { x: CW - PR, y: CH - 9, 'text-anchor': 'end', 'font-size': 9.5, fill: INK, 'fill-opacity': .55,
      'font-style': 'italic', text: 'design x' }, sv);
    E('text', { x: PL + 4, y: PT + 2, 'font-size': 9.5, fill: INK, 'fill-opacity': .55, 'font-style': 'italic', text: 'score' }, sv);

    /* where the data lives */
    E('rect', { x: cx(0.30), y: PT, width: cx(XCAP) - cx(0.30), height: cy(YL) - PT, fill: SLATE, 'fill-opacity': .08 }, sv);
    E('text', { x: (cx(0.30) + cx(XCAP)) / 2, y: PT + 11, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'measured designs' }, sv);
    E('text', { x: (cx(XCAP) + cx(10)) / 2, y: PT + 11, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'never measured' }, sv);

    /* the kept band: where the learned score reaches the request */
    if (S.n) E('rect', { x: cx(S.lo), y: PT, width: Math.max(2, cx(S.hi) - cx(S.lo)), height: cy(YL) - PT,
      fill: BLUE, 'fill-opacity': .10 }, sv);

    function line(fn, col, w, dash) {
      var p = [], t;
      for (t = 0; t <= 300; t++) { var v = 10 * t / 300; p.push(cx(v).toFixed(1) + ' ' + cy(Math.max(YL, Math.min(YH, fn(v)))).toFixed(1)); }
      E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }, sv);
    }
    /* where the generator proposes: its density, as a low hill on the floor */
    var hp = [], hm = 0, t3, base = cy(YL), HH = 30;
    for (t3 = 0; t3 <= 200; t3++) { var vv = 10 * t3 / 200, dd = Math.exp(-0.5 * Math.pow((vv - MU) / SD, 2)); hp.push([vv, dd]); if (dd > hm) hm = dd; }
    E('path', { d: 'M' + cx(0) + ' ' + base + 'L' + hp.map(function (p) { return cx(p[0]).toFixed(1) + ' ' + (base - p[1] / hm * HH).toFixed(1); }).join('L') +
      'L' + cx(10) + ' ' + base + 'Z', fill: SLATE, 'fill-opacity': .22, stroke: SLATE, 'stroke-width': 1 }, sv);
    E('text', { x: cx(MU), y: base - HH - 4, 'text-anchor': 'middle', 'font-size': 9.5, fill: SLATE, text: 'generator proposes' }, sv);

    line(fhat, BLUE, 2, '6 4');
    line(ftrue, INK, 2.2, '');
    D.forEach(function (d) { E('circle', { cx: cx(d.x), cy: cy(d.y), r: 1.8, fill: SLATE, 'fill-opacity': .55 }, sv); });

    /* the request */
    E('line', { x1: PL, y1: cy(g), x2: CW - PR, y2: cy(g), stroke: AMBER, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, sv);
    E('text', { x: PL + 5, y: cy(g) - 5, 'font-size': 10.5, fill: AMBER, 'font-weight': 700,
      text: 'asked: score ≥ ' + g.toFixed(2) }, sv);

    /* the kept designs, at their true score */
    for (k = 0; k < MM; k++) if (FH[k] >= g)
      E('circle', { cx: cx(PROP[k]).toFixed(1), cy: cy(FT[k]).toFixed(1), r: 3.2, fill: BLUE, 'fill-opacity': .45 }, sv);
    if (S.n) E('text', { x: cx((S.lo + S.hi) / 2), y: PT + 26, 'text-anchor': 'middle', 'font-size': 10.5, fill: BLUE,
      'font-weight': 700, text: 'kept ' + S.n.toLocaleString('en') + ' of 10,000' }, sv);
    else E('text', { x: cx(8), y: PT + 26, 'text-anchor': 'middle', 'font-size': 10.5, fill: RED,
      'font-weight': 700, text: 'kept 0 of 10,000' }, sv);

    /* the readout — each number from the quantities named above */
    host.querySelector('[data-val]').textContent = 'γ = ' + g.toFixed(2);
    var v;
    if (!S.n) v = '<span style="color:' + RED + '">Nothing passes. The exact answer is empty &mdash; a learned generator would still return designs, from its tail, on a guess.</span>';
    else if (S.truth > BEST) v = '<span style="color:' + GREEN + '">A little past the data: fewer pass, and they ==truly beat== the best measured design.</span>';
    else if (g <= BEST) v = '<span style="color:' + SLATE + '">No more than the data already has: many pass, no gain.</span>';
    else v = '<span style="color:' + AMBER + '">Far past the data: few pass, and their truth falls short of the promise.</span>';
    v = v.replace(/==([^=]+)==/, '<b>$1</b>');
    host.querySelector('[data-num]').innerHTML =
      'proposals drawn from the generator: <b>10,000</b><br>' +
      'kept (learned score &ge; ' + g.toFixed(2) + '): <b style="color:' + BLUE + '">' + S.n.toLocaleString('en') + '</b><br>' +
      'promised &mdash; their learned score, on average: <b>' + (S.n ? S.promised.toFixed(2) : '&ndash;') + '</b><br>' +
      'true &mdash; their true score, on average: <b style="color:' + (!S.n ? INK : S.truth > BEST ? GREEN : AMBER) + '">' +
      (S.n ? S.truth.toFixed(2) : '&ndash;') + '</b><br>' +
      '<span style="color:var(--ink3)">best measured design: ' + BEST.toFixed(2) + '</span>' +
      '<div style="margin-top:6px">' + v + '</div>';
  }

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: GAM.length - 1, step: 1, value: gi,
    on: function (v) { gi = v; draw(); }
  });
  function go(s) { gi = STOPS[s]; dial.set(gi); draw(); }

  go(0);
  return { steps: STOPS.length - 1, step: function (s) { go(s); }, reset: function () { go(0); },
    finish: function () { go(2); } };
});
