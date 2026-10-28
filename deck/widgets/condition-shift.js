/* ============================================================
   widget: condition-shift                          (Chapter 6, Act 4)
   Ask a generator for a score; see what you get — then MINs' check.

   opts.mode  'ask' (default) — the problem, with the truth in view:
                ① ask for a score y                    (amber)
                ② the generator g returns the design its learned link
                  ties to y — read across, then down     (blue)
                ③ that design's true score is what you get (black)
              'trip' — MINs' answer, on the same picture:
                ④ a forward model f̂, trained separately, scores the
                  design. ① → ② → ④ is a round trip the method can
                  run; ③ is hidden from it. Ask as high as the round
                  trip still closes, |y − f̂(g(y))| ≤ 0.1 (ε₁ = 0.01).
   A second chart plots, for every request, what comes back: the true
   score ('ask'), or the round trip next to the faded truth ('trip').

   The problem is Lecture 5's, unchanged. Two hundred designs are drawn
   from N(3.0, 1.15^2) and kept only below x = 5.5 — nobody has built a
   design past there. The generator's learned link is a ridge fit with
   the ReLU-knot basis Lecture 5 used for its surrogate; asked for y, an
   ideal conditional generator returns the design that link ties to y
   (the link rises monotonically). The forward model is Lecture 4's GP
   posterior mean (RBF, length scale 1.5, noise 0.1, prior mean the data
   mean): a different model of the same data, so the two agree where the
   data are and guess differently past them.

   Verified in node before shipping (seed 11; the measured designs end at
   x = 5.43; best measured design 2.523; true optimum 2.657 at x = 6.04):

     asked  design g(y)  true score  round trip f̂(g(y))
      2.00     4.49         2.00          2.01     closes, inside the data
      2.60     5.94         2.65          2.62     closes
      2.65     6.07         2.66          2.62     closes — MINs' pick
      2.80     6.44         2.59          2.56     open (gap 0.24)
      3.00     6.94         2.32          2.37     open (gap 0.63)
      3.80     9.00         0.22          1.59     open (gap 2.21)

   Walked by the deck's ->: 'ask' 2.00, 2.60, 3.00, 3.80; 'trip' 2.00,
   2.65, 3.00, 3.80. The slider sets any request from 1.50 to 4.00.
   ============================================================ */
IE437.widget('condition-shift', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B', TEAL = '#0F9D8A';
  var TRIP = opts.mode === 'trip', TOL = 0.1;

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
  var BEST = -9, XLO = 99, XHI = -99, YM = 0;
  D.forEach(function (d) { if (ftrue(d.x) > BEST) BEST = ftrue(d.x); if (d.x < XLO) XLO = d.x; if (d.x > XHI) XHI = d.x; YM += d.y / N; });

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

  /* ---------- the generator's learned link: the basis Lecture 5 fitted ---------- */
  var KN = [], MK = 26, j, LAM = 0.06;
  for (j = 0; j < MK; j++) KN.push(0.35 + 9.3 * j / (MK - 1));
  function phi(x) { var v = [1, x / 5], k; for (k = 0; k < MK; k++) { v.push(Math.max(0, x - KN[k]) / 3); v.push(Math.max(0, KN[k] - x) / 3); } return v; }
  var P = phi(0).length;
  var A0 = [], b0 = new Array(P), q;
  for (i = 0; i < P; i++) { b0[i] = 0; A0.push(new Array(P)); for (q = 0; q < P; q++) A0[i][q] = 0; }
  D.forEach(function (d) { var p = phi(d.x);
    for (var a = 0; a < P; a++) { b0[a] += p[a] * d.y / N; for (var c = 0; c < P; c++) A0[a][c] += p[a] * p[c] / N; } });
  for (i = 0; i < P; i++) A0[i][i] += (i < 2 ? LAM * 1e-2 : LAM);
  var WV = solve(A0, b0);
  function link(x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += WV[a] * p[a]; return s; }
  function design(g) {                                /* g(y): the x the learned link ties to y */
    var lo = 0, hi = 10, k, m;
    for (k = 0; k < 50; k++) { m = (lo + hi) / 2; if (link(m) >= g) hi = m; else lo = m; }
    return hi;
  }

  /* ---------- the forward model f̂: Lecture 4's GP, fitted separately ---------- */
  var fwd = null;
  if (TRIP) {
    var ELL = 1.5, SN = 0.1;
    var KK = D.map(function (a) { return D.map(function (b) {
      return Math.exp(-0.5 * Math.pow((a.x - b.x) / ELL, 2)) + (a === b ? SN * SN : 0); }); });
    var AL0 = solve(KK, D.map(function (d) { return d.y - YM; }));
    fwd = function (x) { var s = YM; for (var k = 0; k < N; k++) s += AL0[k] * Math.exp(-0.5 * Math.pow((x - D[k].x) / ELL, 2)); return s; };
  }

  /* ---------- requests ---------- */
  var GAM = [], gi, PICK = null;
  for (i = 0; i <= 50; i++) GAM.push(1.5 + 0.05 * i);
  if (TRIP) GAM.forEach(function (g, k) {             /* MINs: the highest round-trip score that still closes */
    var r = fwd(design(g));
    if (Math.abs(g - r) <= TOL && (PICK === null || r > fwd(design(GAM[PICK])))) PICK = k;
  });
  var STOPS = [2.00, TRIP ? GAM[PICK] : 2.60, 3.00, 3.80].map(function (g) { return Math.round((g - 1.5) / 0.05); });
  gi = STOPS[0];

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + (TRIP
      ? 'MINs&rsquo; round trip &mdash; ask g for a score, let a second model check the design'
      : 'ask the generator for a score &mdash; and see what you get') + '</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">ask for</span>' +
    '<span class="wnum" data-val style="min-width:78px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:flex-start;padding:11px 16px 9px">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">' +
    '<div data-num style="font:400 13px/' + (TRIP ? '1.5' : '1.65') + ' var(--sans);color:var(--ink2)"></div>' +
    '<div data-m></div>' +
    '<div data-v style="font:500 ' + (TRIP ? '12.5px/1.4' : '13px/1.5') + ' var(--sans)"></div>' +
    '</div></div>';

  /* ---------- the main chart: design x against score ---------- */
  var CW = 600, CH = TRIP ? 232 : 300, PL = 34, PR = 14, PT = 12, PB = 26;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  function cx(v) { return PL + v / 10 * (CW - PL - PR); }
  var YL = -0.4, YH = 4.4;
  function cy(v) { return CH - PB - (v - YL) / (YH - YL) * (CH - PT - PB); }

  /* ---------- the second chart: what comes back, against the request ---------- */
  var MW = 440, MH = TRIP ? 118 : 158, ML = 30, MR = 10, MT = 10, MB = 24, AL = 1.5, AH = 4.0, GL = -0.3, GH = 4.0;
  var ms = IE437.svg(MW, MH);
  host.querySelector('[data-m]').appendChild(ms);
  function mx(v) { return ML + (v - AL) / (AH - AL) * (MW - ML - MR); }
  function my(v) { return MH - MB - (v - GL) / (GH - GL) * (MH - MT - MB); }

  function txt(svg, a, s) { a.text = s; return E('text', a, svg); }
  function curve(svg, fn, X, Y, x0, x1, c, w, dash, op) {
    var p = [], t;
    for (t = 0; t <= 200; t++) { var v = x0 + (x1 - x0) * t / 200; p.push(X(v).toFixed(1) + ' ' + Y(fn(v)).toFixed(1)); }
    E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': dash || '',
      'stroke-opacity': op === undefined ? 1 : op }, svg);
  }
  function clampY(fn) { return function (v) { return Math.max(YL, Math.min(YH, fn(v))); }; }

  function drawMain(g, xd, got, r, col) {
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

    /* the curves, each named where it is */
    curve(sv, clampY(link), cx, cy, 0, 10, BLUE, 2, '6 4');
    curve(sv, clampY(ftrue), cx, cy, 0, 10, INK, 2.2, '', TRIP ? .3 : 1);
    if (TRIP) curve(sv, clampY(fwd), cx, cy, 0, 10, TEAL, 2.2, '1.5 3.5');
    D.forEach(function (d) { E('circle', { cx: cx(d.x), cy: cy(d.y), r: 1.8, fill: SLATE, 'fill-opacity': .55 }, sv); });
    /* g's label rides on its own line, above it, where nothing else is drawn */
    var la = Math.atan2(cy(link(9.6)) - cy(link(7.2)), cx(9.6) - cx(7.2)) * 180 / Math.PI;
    txt(sv, { x: cx(8.4), y: cy(link(8.4)) - 7, 'text-anchor': 'middle', 'font-size': 10, fill: BLUE, 'font-weight': 600,
      transform: 'rotate(' + la.toFixed(1) + ' ' + cx(8.4).toFixed(1) + ' ' + (cy(link(8.4)) - 7).toFixed(1) + ')' }, 'what g learned — past the data, a guess');
    txt(sv, { x: cx(8.6), y: cy(ftrue(8.6)) - 8, 'text-anchor': 'start', 'font-size': 10, fill: INK, 'font-weight': 600,
      'fill-opacity': TRIP ? .45 : 1 }, TRIP ? 'true score (hidden)' : 'true score');
    if (TRIP) txt(sv, { x: cx(9.9), y: cy(fwd(9.9)) + 16, 'text-anchor': 'end', 'font-size': 10, fill: TEAL, 'font-weight': 600 },
      'forward model f̂ — a GP, fitted separately');

    /* ① ask */
    E('line', { x1: PL, y1: cy(g), x2: cx(xd), y2: cy(g), stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, sv);
    txt(sv, { x: PL + 6, y: cy(g) - 6, 'font-size': 10.5, fill: AMBER, 'font-weight': 700 }, '① ask for ' + g.toFixed(2));
    /* ② the design returned */
    E('line', { x1: cx(xd), y1: cy(g), x2: cx(xd), y2: cy(YL), stroke: BLUE, 'stroke-width': 1.4, 'stroke-dasharray': '2 3' }, sv);
    E('circle', { cx: cx(xd), cy: cy(g), r: 4.5, fill: BLUE }, sv);
    txt(sv, { x: cx(xd) + (xd > 8.2 ? -6 : 6), y: cy(YL) - 6, 'text-anchor': xd > 8.2 ? 'end' : 'start', 'font-size': 10.5, fill: BLUE, 'font-weight': 700 },
      '② design returned, x = ' + xd.toFixed(2));
    var right = xd < 7.6;
    if (!TRIP) {
      /* ③ what you get */
      if (Math.abs(got - g) > 0.06)
        E('line', { x1: cx(xd), y1: cy(g), x2: cx(xd), y2: cy(got), stroke: RED, 'stroke-width': 3, 'stroke-opacity': .55 }, sv);
      E('circle', { cx: cx(xd), cy: cy(got), r: 5.5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, sv);
      txt(sv, { x: cx(xd) + (right ? 10 : -10), y: cy(got) + (got < g - 0.06 ? 16 : -10), 'text-anchor': right ? 'start' : 'end',
        'font-size': 10.5, fill: col, 'font-weight': 700 }, '③ you get ' + got.toFixed(2));
    } else {
      /* ③ the truth, faded: hidden from the method */
      E('circle', { cx: cx(xd), cy: cy(got), r: 4, fill: INK, 'fill-opacity': .3 }, sv);
      /* ④ the forward model's check, and the gap the method can see */
      var shut = Math.abs(g - r) <= TOL;
      if (!shut) E('line', { x1: cx(xd), y1: cy(g), x2: cx(xd), y2: cy(r), stroke: RED, 'stroke-width': 3, 'stroke-opacity': .6 }, sv);
      E('circle', { cx: cx(xd), cy: cy(r), r: 5.5, fill: shut ? TEAL : RED, stroke: '#fff', 'stroke-width': 1.2 }, sv);
      txt(sv, { x: cx(xd) + (right ? 10 : -10), y: cy(r) + (r < g - 0.06 ? 16 : -10), 'text-anchor': right ? 'start' : 'end',
        'font-size': 10.5, fill: shut ? TEAL : RED, 'font-weight': 700 }, '④ f̂ says ' + r.toFixed(2) + (shut ? '' : ' — gap ' + (g - r).toFixed(2)));
    }
  }

  function drawMini(g, got, r, col) {
    while (ms.firstChild) ms.removeChild(ms.firstChild);
    var EDGE = link(XHI);
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
    txt(ms, { x: (mx(3) + mx(4)) / 2, y: MH - 11, 'text-anchor': 'middle', 'font-size': 9.5, fill: AMBER, 'font-weight': 600 }, '① asked');
    /* returned = asked, and, for the round trip, the band where it counts as closed */
    if (TRIP) E('path', { d: 'M' + mx(AL) + ' ' + my(AL + TOL) + 'L' + mx(AH) + ' ' + my(AH + TOL) + 'L' + mx(AH) + ' ' + my(AH - TOL) +
      'L' + mx(AL) + ' ' + my(AL - TOL) + 'Z', fill: TEAL, 'fill-opacity': .12 }, ms);
    E('line', { x1: mx(AL), y1: my(AL), x2: mx(AH), y2: my(AH), stroke: INK, 'stroke-opacity': .3, 'stroke-dasharray': '3 3' }, ms);
    if (!TRIP) txt(ms, { x: mx(3.75), y: my(3.75) + 14, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .55 }, 'got = asked');
    E('line', { x1: ML, y1: my(BEST), x2: MW - MR, y2: my(BEST), stroke: GREEN, 'stroke-opacity': .6, 'stroke-dasharray': '2 3' }, ms);
    txt(ms, { x: MW - MR, y: my(BEST) - 4, 'text-anchor': 'end', 'font-size': 9, fill: GREEN }, 'best measured ' + BEST.toFixed(2));
    curve(ms, function (a) { return ftrue(design(a)); }, mx, my, AL, AH, INK, 2, '', TRIP ? .3 : 1);
    if (TRIP) {
      curve(ms, function (a) { return fwd(design(a)); }, mx, my, AL, AH, TEAL, 2.2, '');
      var gp = GAM[PICK];
      E('line', { x1: mx(gp), y1: MT, x2: mx(gp), y2: my(GL), stroke: TEAL, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, ms);
      txt(ms, { x: mx(gp) + 4, y: MT + 22, 'font-size': 9.5, fill: TEAL, 'font-weight': 700 }, 'MINs stops: ' + gp.toFixed(2));
      txt(ms, { x: ML + 4, y: MT + 22, 'font-size': 9.5, fill: TEAL, 'font-weight': 600 }, '④ round trip');
      E('circle', { cx: mx(g), cy: my(r), r: 5, fill: Math.abs(g - r) <= TOL ? TEAL : RED, stroke: '#fff', 'stroke-width': 1.2 }, ms);
    } else {
      txt(ms, { x: ML + 4, y: MT + 22, 'font-size': 9.5, fill: INK, 'font-weight': 600 }, '③ got');
      E('circle', { cx: mx(g), cy: my(got), r: 5, fill: col, stroke: '#fff', 'stroke-width': 1.2 }, ms);
    }
  }

  function draw() {
    var g = GAM[gi], xd = design(g), got = ftrue(xd), inside = xd <= XHI, r = TRIP ? fwd(xd) : null;
    var col = inside ? INK : got > BEST ? GREEN : RED, v;
    drawMain(g, xd, got, r, col);
    drawMini(g, got, r, col);
    host.querySelector('[data-val]').textContent = 'y = ' + g.toFixed(2);
    var head =
      '<span style="color:' + AMBER + '">①</span> asked for: <b>' + g.toFixed(2) + '</b><br>' +
      '<span style="color:' + BLUE + '">②</span> design returned: <b>x = ' + xd.toFixed(2) + '</b> ' +
      '<span style="color:var(--ink3)">&mdash; ' + (inside ? 'among the measured designs' : 'past the measured designs') + '</span><br>';
    if (!TRIP) {
      host.querySelector('[data-num]').innerHTML = head +
        '<span style="color:' + col + '">③</span> you get: <b style="color:' + col + '">' + got.toFixed(2) + '</b> ' +
        '<span style="color:var(--ink3)">&mdash; the best measured design is ' + BEST.toFixed(2) + '</span>';
      if (inside) v = '<span style="color:' + SLATE + '">Inside the data: you get what you ask for.</span>';
      else if (got > BEST && got >= g - 0.06) v = '<span style="color:' + GREEN + '">Just past the data: still about what you asked &mdash; better than every measured design.</span>';
      else if (got > BEST) v = '<span style="color:' + AMBER + '">Further past: less than you asked, though still above the data&rsquo;s best.</span>';
      else v = '<span style="color:' + RED + '">Far past the data: the learned link was a guess &mdash; you get less than the data already had.</span>';
    } else {
      var shut = Math.abs(g - r) <= TOL;
      host.querySelector('[data-num]').innerHTML = head +
        '<span style="color:' + (shut ? TEAL : RED) + '">④</span> forward model f̂ says: <b style="color:' + (shut ? TEAL : RED) + '">' + r.toFixed(2) +
        '</b> <span style="color:var(--ink3)">&mdash; gap to the request ' + Math.abs(g - r).toFixed(2) + (shut ? ', closes' : ', open') + '</span><br>' +
        '<span style="color:var(--ink3)">③ true score, hidden from the method: ' + got.toFixed(2) + '</span>';
      if (gi === PICK) v = '<span style="color:' + TEAL + '">MINs&rsquo; pick: the highest request whose round trip still closes.</span>';
      else if (shut) v = '<span style="color:' + TEAL + '">The round trip closes: the two models agree.</span>';
      else v = '<span style="color:' + RED + '">Open: the models disagree &mdash; the design has left the data.</span>';
    }
    host.querySelector('[data-v]').innerHTML = v;
  }

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: GAM.length - 1, step: 1, value: gi,
    on: function (val) { gi = val; draw(); }
  });
  function go(s) { gi = STOPS[s]; dial.set(gi); draw(); }

  go(0);
  return { steps: STOPS.length - 1, step: function (s) { go(s); }, reset: function () { go(0); },
    finish: function () { go(TRIP ? 1 : 2); } };
});
