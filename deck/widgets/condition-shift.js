/* ============================================================
   widget: condition-shift                          (Chapter 6, Act 4)
   Ask a generator for a score; see what you get.

   One picture, three moves, numbered on the figure:
     1  ask for a score gamma                      (amber, on the y-axis)
     2  the generator returns the design its learned score says reaches
        gamma — read across to the dashed curve, then down    (blue)
     3  that design's true score is what you get    (on the solid curve)
   A second chart plots got against asked for every request: on the
   diagonal inside the data, then falling away past it.

   The problem is Lecture 5's, unchanged. Two hundred designs are drawn
   from N(3.0, 1.15^2) and kept only below x = 5.5 — nobody has built a
   design past there — and a score model is fitted to them with the same
   ReLU-knot ridge basis Lecture 5 used for its surrogate. It stands for
   the x-to-y relation a conditional generator learns from D. Asked for
   gamma, an ideal conditional generator returns the designs that
   relation links to gamma; here that is the one design with
   fhat(x) = gamma (fhat rises monotonically). Past the data the
   relation is a guess: it keeps rising, the truth turns down.

   Verified in node before shipping (seed 11; the measured designs end
   at x = 5.43, where fhat = 2.39; the best measured design is worth
   2.523; the true optimum is 2.657 at x = 6.04):

     asked   design returned   got (true score)
      2.00        4.49              2.00      inside the data
      2.60        5.94              2.65      just past: beats the data
      2.80        6.44              2.59      less than asked
      3.00        6.94              2.32      below the data's best
      3.80        9.00              0.22      far past

   Walked by the deck's ->: 2.00, 2.60, 3.00, 3.80; the slider sets any
   request from 1.50 to 4.00.
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
  var BEST = -9, XLO = 99, XHI = -99;
  D.forEach(function (d) { if (ftrue(d.x) > BEST) BEST = ftrue(d.x); if (d.x < XLO) XLO = d.x; if (d.x > XHI) XHI = d.x; });

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

  /* ---------- asked -> design returned -> got ---------- */
  function design(g) {                                /* the x whose learned score is g */
    var lo = 0, hi = 10, k, m;
    for (k = 0; k < 50; k++) { m = (lo + hi) / 2; if (fhat(m) >= g) hi = m; else lo = m; }
    return hi;
  }
  var EDGE = fhat(XHI);                               /* the largest request the data can vouch for */
  var GAM = [], STOPS = [], gi;
  for (i = 0; i <= 50; i++) GAM.push(1.5 + 0.05 * i);
  [2.00, 2.60, 3.00, 3.80].forEach(function (g) { STOPS.push(Math.round((g - 1.5) / 0.05)); });
  gi = STOPS[0];

  host.innerHTML =
    '<div class="wbar"><span class="wt">ask the generator for a score &mdash; and see what you get</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">ask for</span>' +
    '<span class="wnum" data-val style="min-width:78px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:flex-start;padding:11px 16px 9px">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">' +
    '<div data-num style="font:400 13px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-m></div>' +
    '<div data-v style="font:500 13px/1.5 var(--sans)"></div>' +
    '</div></div>';

  /* ---------- the main chart: design x against score ---------- */
  var CW = 600, CH = 300, PL = 34, PR = 14, PT = 12, PB = 26;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  function cx(v) { return PL + v / 10 * (CW - PL - PR); }
  var YL = -0.4, YH = 4.4;
  function cy(v) { return CH - PB - (v - YL) / (YH - YL) * (CH - PT - PB); }

  /* ---------- the second chart: got against asked ---------- */
  var MW = 440, MH = 158, ML = 30, MR = 10, MT = 10, MB = 24, AL = 1.5, AH = 4.0, GL = -0.3, GH = 4.0;
  var ms = IE437.svg(MW, MH);
  host.querySelector('[data-m]').appendChild(ms);
  function mx(v) { return ML + (v - AL) / (AH - AL) * (MW - ML - MR); }
  function my(v) { return MH - MB - (v - GL) / (GH - GL) * (MH - MT - MB); }

  function txt(svg, a, s) { a.text = s; return E('text', a, svg); }

  function drawMain(g, xd, got, col) {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('line', { x1: PL, y1: cy(YL), x2: CW - PR, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: PL, y1: PT, x2: PL, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 1, 2, 3, 4].forEach(function (t) {
      txt(sv, { x: PL - 6, y: cy(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace' }, t);
      E('line', { x1: PL, x2: CW - PR, y1: cy(t), y2: cy(t), stroke: INK, 'stroke-opacity': .07 }, sv);
    });
    [0, 2, 4, 6, 8].forEach(function (t) {
      txt(sv, { x: cx(t), y: CH - 10, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace' }, t);
    });
    txt(sv, { x: CW - PR, y: CH - 10, 'text-anchor': 'end', 'font-size': 9.5, fill: INK, 'fill-opacity': .55, 'font-style': 'italic' }, 'design x');
    txt(sv, { x: PL + 4, y: PT + 2, 'font-size': 9.5, fill: INK, 'fill-opacity': .55, 'font-style': 'italic' }, 'score');

    /* where the data lives */
    E('rect', { x: cx(XLO), y: PT, width: cx(XHI) - cx(XLO), height: cy(YL) - PT, fill: SLATE, 'fill-opacity': .09 }, sv);
    txt(sv, { x: (cx(XLO) + cx(XHI)) / 2, y: PT + 11, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5 }, 'measured designs');
    txt(sv, { x: (cx(XHI) + cx(10)) / 2, y: PT + 11, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5 }, 'never measured');

    function line(fn, c, w, dash) {
      var p = [], t;
      for (t = 0; t <= 300; t++) { var v = 10 * t / 300; p.push(cx(v).toFixed(1) + ' ' + cy(Math.max(YL, Math.min(YH, fn(v)))).toFixed(1)); }
      E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': dash || '' }, sv);
    }
    line(fhat, BLUE, 2, '6 4');
    line(ftrue, INK, 2.2, '');
    D.forEach(function (d) { E('circle', { cx: cx(d.x), cy: cy(d.y), r: 1.8, fill: SLATE, 'fill-opacity': .55 }, sv); });
    /* the curves, named where they are */
    txt(sv, { x: cx(9.9), y: cy(3.15), 'text-anchor': 'end', 'font-size': 10, fill: BLUE, 'font-weight': 600 }, 'learned score');
    txt(sv, { x: cx(9.9), y: cy(2.92), 'text-anchor': 'end', 'font-size': 10, fill: BLUE }, 'past the data, a guess');
    txt(sv, { x: cx(8.6), y: cy(ftrue(8.6)) - 8, 'text-anchor': 'start', 'font-size': 10, fill: INK, 'font-weight': 600 }, 'true score');

    /* 1 · ask */
    E('line', { x1: PL, y1: cy(g), x2: cx(xd), y2: cy(g), stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, sv);
    txt(sv, { x: PL + 6, y: cy(g) - 6, 'font-size': 10.5, fill: AMBER, 'font-weight': 700 }, '① ask for ' + g.toFixed(2));
    /* 2 · the design returned */
    E('line', { x1: cx(xd), y1: cy(g), x2: cx(xd), y2: cy(YL), stroke: BLUE, 'stroke-width': 1.4, 'stroke-dasharray': '2 3' }, sv);
    E('circle', { cx: cx(xd), cy: cy(g), r: 4.5, fill: BLUE }, sv);
    txt(sv, { x: cx(xd) + (xd > 8.2 ? -6 : 6), y: cy(YL) - 6, 'text-anchor': xd > 8.2 ? 'end' : 'start', 'font-size': 10.5, fill: BLUE, 'font-weight': 700 },
      '② design returned, x = ' + xd.toFixed(2));
    /* 3 · what you get */
    if (Math.abs(got - g) > 0.06)
      E('line', { x1: cx(xd), y1: cy(g), x2: cx(xd), y2: cy(got), stroke: RED, 'stroke-width': 3, 'stroke-opacity': .55 }, sv);
    E('circle', { cx: cx(xd), cy: cy(got), r: 5.5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, sv);
    var right = xd < 7.6;
    txt(sv, { x: cx(xd) + (right ? 10 : -10), y: cy(got) + (got < g - 0.06 ? 16 : -10), 'text-anchor': right ? 'start' : 'end',
      'font-size': 10.5, fill: col, 'font-weight': 700 }, '③ you get ' + got.toFixed(2));
  }

  function drawMini(g, got, col) {
    while (ms.firstChild) ms.removeChild(ms.firstChild);
    E('rect', { x: mx(AL), y: MT, width: mx(EDGE) - mx(AL), height: my(GL) - MT, fill: SLATE, 'fill-opacity': .09 }, ms);
    txt(ms, { x: (mx(AL) + mx(EDGE)) / 2, y: MT + 10, 'text-anchor': 'middle', 'font-size': 9, 'font-family': 'IBM Plex Mono, monospace',
      fill: INK, 'fill-opacity': .5 }, 'the data vouches');
    E('line', { x1: ML, y1: my(GL), x2: MW - MR, y2: my(GL), stroke: INK, 'stroke-opacity': .28 }, ms);
    E('line', { x1: ML, y1: MT, x2: ML, y2: my(GL), stroke: INK, 'stroke-opacity': .28 }, ms);
    [0, 1, 2, 3, 4].forEach(function (t) {
      txt(ms, { x: ML - 5, y: my(t) + 3, 'text-anchor': 'end', 'font-size': 8.5, fill: INK, 'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace' }, t);
    });
    [2, 3, 4].forEach(function (t) {
      txt(ms, { x: mx(t), y: MH - 11, 'text-anchor': t === 4 ? 'end' : 'middle', 'font-size': 8.5, fill: INK, 'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace' }, t);
    });
    txt(ms, { x: (mx(3) + mx(4)) / 2, y: MH - 11, 'text-anchor': 'middle', 'font-size': 9.5, fill: AMBER, 'font-weight': 600 }, 'asked');
    txt(ms, { x: ML + 4, y: MT + 22, 'font-size': 9.5, fill: INK, 'font-weight': 600 }, 'got');
    /* got = asked */
    E('line', { x1: mx(AL), y1: my(AL), x2: mx(AH), y2: my(AH), stroke: INK, 'stroke-opacity': .3, 'stroke-dasharray': '3 3' }, ms);
    txt(ms, { x: mx(3.75), y: my(3.75) + 14, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .55 }, 'got = asked');
    /* the best measured design */
    E('line', { x1: ML, y1: my(BEST), x2: MW - MR, y2: my(BEST), stroke: GREEN, 'stroke-opacity': .6, 'stroke-dasharray': '2 3' }, ms);
    txt(ms, { x: MW - MR, y: my(BEST) - 4, 'text-anchor': 'end', 'font-size': 9, fill: GREEN }, 'best measured ' + BEST.toFixed(2));
    /* got, for every request */
    var p = [], t;
    for (t = 0; t <= 100; t++) { var a = AL + (AH - AL) * t / 100; p.push(mx(a).toFixed(1) + ' ' + my(ftrue(design(a))).toFixed(1)); }
    E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2 }, ms);
    E('circle', { cx: mx(g), cy: my(got), r: 5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, ms);
  }

  function draw() {
    var g = GAM[gi], xd = design(g), got = ftrue(xd), inside = xd <= XHI;
    var col = inside ? INK : got > BEST ? GREEN : RED;
    drawMain(g, xd, got, col);
    drawMini(g, got, col);
    host.querySelector('[data-val]').textContent = 'γ = ' + g.toFixed(2);
    host.querySelector('[data-num]').innerHTML =
      '<span style="color:' + AMBER + '">①</span> asked for: <b>' + g.toFixed(2) + '</b><br>' +
      '<span style="color:' + BLUE + '">②</span> design returned: <b>x = ' + xd.toFixed(2) + '</b> ' +
      '<span style="color:var(--ink3)">&mdash; ' + (inside ? 'among the measured designs' : 'past the measured designs') + '</span><br>' +
      '<span style="color:' + col + '">③</span> you get: <b style="color:' + col + '">' + got.toFixed(2) + '</b> ' +
      '<span style="color:var(--ink3)">&mdash; the best measured design is ' + BEST.toFixed(2) + '</span>';
    var v;
    if (inside) v = '<span style="color:' + SLATE + '">Inside the data: you get what you ask for.</span>';
    else if (got > BEST && got >= g - 0.06) v = '<span style="color:' + GREEN + '">Just past the data: still about what you asked &mdash; better than every measured design.</span>';
    else if (got > BEST) v = '<span style="color:' + AMBER + '">Further past: less than you asked, though still above the data&rsquo;s best.</span>';
    else v = '<span style="color:' + RED + '">Far past the data: the learned score was a guess &mdash; you get less than the data already had.</span>';
    host.querySelector('[data-v]').innerHTML = v;
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
