/* ============================================================
   widget: forward-inverse                          (Chapter 6, Act 1)
   The same dataset read in both directions.

   A two-dimensional design space and a score landscape with two
   separated peaks — the smallest honest picture of "the valid
   designs come in clusters". Read left to right the map is a
   function: one design, one score. Read right to left it is not a
   function at all: a target score names a whole level set, here in
   two disconnected pieces, and the *average* of that answer set is
   a design that sits in the valley between them.

   Verified in node before shipping (96-ray polar trace, arc-length
   centroid of the level curve — the natural average of the answer set,
   and independent of how the curve is sampled):
     peak A f = 2.752 at (2.3, 6.9)      peak B f = 2.500 at (7.4, 3.0)
     y* = 1.20  centroid (4.93, 4.89)  f = 0.819
     y* = 1.60  centroid (4.89, 4.92)  f = 0.812
     y* = 2.00  centroid (4.78, 5.00)  f = 0.806      <- the shipped default
     y* = 2.30  centroid (4.53, 5.20)  f = 0.848
   so at a target of 2.00 every point of the answer set is worth exactly
   2.00 and the set's own midpoint is worth 0.81 — which is what a
   deterministic inverse map trained by least squares returns. Nothing
   is hard-coded; the widget retraces the level set on every click.
   ============================================================ */
IE437.widget('forward-inverse', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';

  /* ---------- the landscape ---------- */
  var BM = [{ x: 2.3, y: 6.9, a: 2.60, s: 1.50 }, { x: 7.4, y: 3.0, a: 2.35, s: 1.70 }];
  function F(x, y) {
    var s = 0.15, i;
    for (i = 0; i < 2; i++) {
      var b = BM[i];
      s += b.a * Math.exp(-((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y)) / (2 * b.s * b.s));
    }
    return s;
  }

  /* ---------- the dataset ---------- */
  var R = IE437.rng(opts.seed || 7), DAT = [];
  function gs() { var u = 0, v = 0; while (u === 0) u = R(); while (v === 0) v = R();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  while (DAT.length < 220) {
    var b = BM[R() < 0.5 ? 0 : 1];
    var X = b.x + 1.85 * gs(), Y = b.y + 1.85 * gs();
    if (X > 0.2 && X < 9.8 && Y > 0.2 && Y < 9.8) DAT.push([X, Y, F(X, Y)]);
  }
  var DMAX = DAT.reduce(function (m, d) { return Math.max(m, d[2]); }, -9);

  /* ---------- polar tracing of a level component ----------
     Walk outward from the bump centre to the FIRST crossing of the level,
     then bisect. Taking the first crossing is what keeps the component
     that contains this bump separate from the other one — a plain
     bisection on [0, r_max] would jump the valley and latch onto the
     far side of the neighbouring peak. */
  var NA = 96;
  function loop(ci, y) {
    var c = BM[ci], pts = [], k;
    if (F(c.x, c.y) <= y) return null;
    for (k = 0; k < NA; k++) {
      var th = 2 * Math.PI * k / NA, ct = Math.cos(th), st = Math.sin(th);
      var lo = 0, hi = -1, r, m, it;
      for (r = 0.02; r <= 8; r += 0.02) {
        if (F(c.x + r * ct, c.y + r * st) <= y) { hi = r; lo = r - 0.02; break; }
      }
      if (hi < 0) { hi = 8; lo = 8; }
      for (it = 0; it < 30; it++) {
        m = (lo + hi) / 2;
        if (F(c.x + m * ct, c.y + m * st) > y) lo = m; else hi = m;
      }
      m = (lo + hi) / 2;
      pts.push([c.x + m * ct, c.y + m * st]);
    }
    return pts;
  }
  /* the average point of the answer set, weighted by arc length —
     the natural centroid of a curve, and independent of how it is sampled */
  var CACHE = {};
  function centroid(y) {
    if (CACHE[y]) return CACHE[y];
    var a = loop(0, y), b2 = loop(1, y), sx = 0, sy = 0, L = 0;
    [a, b2].forEach(function (p) {
      if (!p) return;
      for (var k = 0; k < p.length; k++) {
        var q1 = p[k], q2 = p[(k + 1) % p.length];
        var d = Math.sqrt(Math.pow(q2[0] - q1[0], 2) + Math.pow(q2[1] - q1[1], 2));
        sx += d * (q1[0] + q2[0]) / 2; sy += d * (q1[1] + q2[1]) / 2; L += d;
      }
    });
    CACHE[y] = { x: sx / L, y: sy / L, len: L, A: a, B: b2 };
    return CACHE[y];
  }

  var TARGETS = [1.20, 1.60, 2.00, 2.30], ti = 2;

  host.innerHTML =
    '<div class="wbar"><span class="wt">220 designs, one landscape, two directions</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">target</span>' +
    '<span class="wnum" data-val style="min-width:104px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:column;gap:9px;padding:12px 16px 10px">' +
    '<div style="display:flex;gap:22px;justify-content:center;align-items:flex-start">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div data-a></div>' +
    '<div style="font:600 10.5px/1.3 var(--mono);letter-spacing:.06em;color:' + SLATE + '">' +
    'FORWARD &nbsp;x &rarr; y&nbsp; &mdash; ONE DESIGN, ONE SCORE</div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div data-b></div>' +
    '<div style="font:600 10.5px/1.3 var(--mono);letter-spacing:.06em;color:' + BLUE + '">' +
    'INVERSE &nbsp;y &rarr; {x}&nbsp; &mdash; ONE SCORE, MANY DESIGNS</div></div></div>' +
    '<div data-num style="font:400 12.5px/1.65 var(--sans);color:var(--ink2);text-align:center"></div>' +
    '</div>';

  var W = 322, H = 246, PAD = 13;
  var A = IE437.svg(W, H), B = IE437.svg(W, H);
  host.querySelector('[data-a]').appendChild(A);
  host.querySelector('[data-b]').appendChild(B);
  function px(v) { return PAD + v / 10 * (W - 2 * PAD); }
  function py(v) { return H - PAD - v / 10 * (H - 2 * PAD); }

  function frame(sv) {
    E('rect', { x: PAD, y: PAD, width: W - 2 * PAD, height: H - 2 * PAD, fill: 'none',
      stroke: INK, 'stroke-opacity': .22 }, sv);
  }
  function contours(sv, levels, op) {
    levels.forEach(function (y) {
      [0, 1].forEach(function (ci) {
        var p = loop(ci, y); if (!p) return;
        E('path', { d: 'M' + p.map(function (q) { return px(q[0]).toFixed(1) + ' ' + py(q[1]).toFixed(1); }).join('L') + 'Z',
          fill: 'none', stroke: INK, 'stroke-opacity': op, 'stroke-width': 1 }, sv);
      });
    });
  }

  /* ---------- panel A: forward ---------- */
  (function () {
    frame(A);
    contours(A, [0.6, 1.0, 1.4, 1.8, 2.2], .16);
    DAT.forEach(function (d) {
      var t = Math.max(0, Math.min(1, (d[2] - 0.2) / 2.5));
      E('circle', { cx: px(d[0]), cy: py(d[1]), r: 2.3, fill: BLUE, 'fill-opacity': (0.14 + 0.78 * t).toFixed(2) }, A);
    });
    /* one design, read forwards */
    var q = DAT[41];
    E('circle', { cx: px(q[0]), cy: py(q[1]), r: 6.5, fill: 'none', stroke: INK, 'stroke-width': 2.2 }, A);
    E('line', { x1: px(q[0]) + 7, y1: py(q[1]), x2: W - PAD - 84, y2: py(q[1]), stroke: INK,
      'stroke-opacity': .55, 'stroke-width': 1.3 }, A);
    E('text', { x: W - PAD - 80, y: py(q[1]) - 5, 'font-size': 11, fill: INK, 'font-weight': 700,
      text: 'f(x) = ' + q[2].toFixed(2) }, A);
    E('text', { x: W - PAD - 80, y: py(q[1]) + 9, 'font-size': 10, fill: INK, 'fill-opacity': .55,
      'font-style': 'italic', text: 'one number' }, A);
    ['design axis 1', 'design axis 2'].forEach(function (s, i) {
      if (i === 0) E('text', { x: W / 2, y: H - 3, 'text-anchor': 'middle', 'font-size': 9,
        'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: s }, A);
      else E('text', { x: 9, y: H / 2, 'text-anchor': 'middle', 'font-size': 9,
        'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45,
        transform: 'rotate(-90 9 ' + (H / 2) + ')', text: s }, A);
    });
  })();

  /* ---------- panel B: inverse ---------- */
  function drawB() {
    while (B.firstChild) B.removeChild(B.firstChild);
    var y = TARGETS[ti], C = centroid(y);
    frame(B);
    contours(B, [0.6, 1.0, 1.4, 1.8, 2.2], .09);
    DAT.forEach(function (d) {
      var inb = Math.abs(d[2] - y) < 0.12;
      E('circle', { cx: px(d[0]), cy: py(d[1]), r: inb ? 3 : 2,
        fill: inb ? BLUE : SLATE, 'fill-opacity': inb ? .95 : .22 }, B);
    });
    var nA = 0, nB = 0;
    DAT.forEach(function (d) {
      if (Math.abs(d[2] - y) >= 0.12) return;
      var da = (d[0] - BM[0].x) * (d[0] - BM[0].x) + (d[1] - BM[0].y) * (d[1] - BM[0].y);
      var db = (d[0] - BM[1].x) * (d[0] - BM[1].x) + (d[1] - BM[1].y) * (d[1] - BM[1].y);
      if (da < db) nA++; else nB++;
    });
    [C.A, C.B].forEach(function (p) {
      if (!p) return;
      E('path', { d: 'M' + p.map(function (q) { return px(q[0]).toFixed(1) + ' ' + py(q[1]).toFixed(1); }).join('L') + 'Z',
        fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, B);
    });
    E('text', { x: px(BM[0].x), y: py(BM[0].y) + 4, 'text-anchor': 'middle', 'font-size': 10.5,
      'font-family': 'IBM Plex Mono, monospace', fill: BLUE, 'font-weight': 700, text: 'A' }, B);
    E('text', { x: px(BM[1].x), y: py(BM[1].y) + 4, 'text-anchor': 'middle', 'font-size': 10.5,
      'font-family': 'IBM Plex Mono, monospace', fill: BLUE, 'font-weight': 700, text: 'B' }, B);
    /* the mean of the answer set */
    E('line', { x1: px(C.x) - 8, y1: py(C.y), x2: px(C.x) + 8, y2: py(C.y), stroke: RED, 'stroke-width': 2.4 }, B);
    E('line', { x1: px(C.x), y1: py(C.y) - 8, x2: px(C.x), y2: py(C.y) + 8, stroke: RED, 'stroke-width': 2.4 }, B);
    E('circle', { cx: px(C.x), cy: py(C.y), r: 7.5, fill: 'none', stroke: RED, 'stroke-width': 1.6,
      'stroke-dasharray': '3 2.5' }, B);
    E('text', { x: px(C.x) + 12, y: py(C.y) - 3, 'font-size': 10.5, fill: RED, 'font-weight': 700,
      text: 'midpoint of the answer set' }, B);
    E('text', { x: px(C.x) + 12, y: py(C.y) + 10, 'font-size': 10.5, fill: RED,
      text: 'f = ' + F(C.x, C.y).toFixed(2) }, B);

    host.querySelector('[data-val]').textContent = 'y* = ' + y.toFixed(2);
    host.querySelector('[data-num]').innerHTML =
      'Every point of that curve is worth exactly ' + y.toFixed(2) + ', and ' +
      '<span style="color:' + BLUE + '">' + (nA + nB) + ' designs in D sit on it</span> (' +
      nA + ' near A, ' + nB + ' near B). &nbsp;' +
      '<span style="color:' + RED + '">Its midpoint is a design worth <b>' + F(C.x, C.y).toFixed(2) +
      '</b></span> &mdash; what a deterministic inverse map returns. ' +
      '<span style="color:var(--ink4)">Best in D: ' + DMAX.toFixed(2) + '.</span>';
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: TARGETS.length - 1, step: 1, value: ti,
    on: function (v) { ti = v; drawB(); }
  });

  drawB();
  return { finish: function () { ti = 2; drawB(); } };
});
