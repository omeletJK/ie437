/* ============================================================
   widget: mins-explain                             (Chapter 6, G3)
   MINs (Kumar & Levine, 2020), told in three pictures.

   mode "pipe"      the idea: Lecture 5 learns the score from the design and
                    searches designs; MINs learns the design from the score
                    with a conditional generator x = g(y, z) and asks for a
                    high score. Two questions follow, Q1 and Q2.
   mode "reweight"  Q1, which scores to train on. 100 data points in ten
                    score bins, y = 0.15 ... 2.85, counts
                    N_y = (4, 9, 15, 20, 18, 13, 9, 6, 4, 2); y* = 2.85; K = 5.
                    Shares of training weight per bin:
                      0  as is, p_D(y) = N_y / 100           mean score 1.30
                      1  best bin only: 100% on 2 points
                      2  p(y) ∝ e^(y − y*): top bin 27%, on 2 points
                      3  p(y) ∝ N_y/(N_y+K) e^(y − y*) (MINs): top bin 15%,
                         mean score 1.95; each point counts w = p / p_D,
                         0.35 for a middling point, 7.6 for one of the best two
   mode "term"      Q1's formula, one panel per part, {"k": 1 | 2 | 3}:
                      1  e^(y − y*) against y: 1 at y* = 2.85, 1/e one unit lower
                      2  N/(N + K) against N, K = 5: 1/2 at N = K; the toy's
                         bins N = 2 -> 0.29, N = 20 -> 0.80
                      3  w = p / p_D for two bins of the toy: a middling bin
                         (p_D 0.20, p 0.07, w 0.35) and the top bin
                         (p_D 0.02, p 0.15, w 7.6)
   mode "query"     Q2, which score to ask for. An illustrative curve: the
                    forward model's prediction for the design generated at
                    request y is y inside the data (y ≤ 2.85), and
                    2.85 + 0.6 (1 − e^(−(y − 2.85)/0.6)) beyond it. With
                    (y − prediction)² ≤ 0.01, the largest consistent request
                    is y ≈ 3.24.
                      0  axes and the line "delivers what is asked"
                      1  the curve   2  the check, and the request it allows
   ============================================================ */
IE437.widget('mins-explain', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', AMBER = '#B45309', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace', MODE = opts.mode || 'pipe';
  function hl(t) { return t.replace(/==(.+?)==/g, '<span class="hl">$1</span>'); }

  /* ---------------- the idea ---------------- */
  if (MODE === 'pipe') {
    host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:8px 10px 4px"><div data-c></div></div>';
    var sv = IE437.svg(1040, 238); host.querySelector('[data-c]').appendChild(sv);
    var uid = 'mx' + Math.floor(Math.random() * 1e9), d = E('defs', {}, sv);
    [['k', INK], ['g', GREEN], ['r', RED]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    function t(x, y, s, a) { var o = { x: x, y: y, 'font-size': 12, fill: INK, text: s }; for (var k in a || {}) o[k] = a[k]; return E('text', o, sv); }
    function bx(x, y, w, l1, l2, col, fill) {
      E('rect', { x: x, y: y - 26, width: w, height: 52, rx: 7, fill: fill || '#fff', stroke: col, 'stroke-width': 1.4 }, sv);
      t(x + w / 2, y - 4, l1, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 12.5, fill: col === SLATE ? INK : col });
      t(x + w / 2, y + 13, l2, { 'text-anchor': 'middle', 'font-size': 11, 'fill-opacity': .7 });
    }
    function ar(x1, x2, y, c) { E('line', { x1: x1, x2: x2, y1: y, y2: y, stroke: c || INK, 'stroke-width': 1.5, 'marker-end': 'url(#' + uid + 'k)' }, sv); }
    t(0, 16, 'x: a design  ·  y: its score  ·  z: random noise that picks one of the many designs with score y (Act 1)  ·  g: the inverse map, a conditional generator such as the CVAE',
      { 'font-size': 11.5, 'fill-opacity': .7 });
    var R1 = 68, R2 = 162, XS = [150, 372, 594, 816], W = [192, 192, 192, 210];
    t(0, R1 + 4, 'Lecture 5', { 'font-weight': 700, fill: SLATE, 'font-size': 13 });
    t(0, R1 + 20, 'forward', { fill: SLATE, 'font-size': 11 });
    t(0, R2 + 4, 'MINs', { 'font-weight': 700, fill: BLUE, 'font-size': 13 });
    t(0, R2 + 20, 'inverse', { fill: BLUE, 'font-size': 11 });
    bx(XS[0], R1, W[0], 'the data', 'pairs (xᵢ, yᵢ)', SLATE);
    bx(XS[1], R1, W[1], 'learn ŷ = f̂(x)', 'score from design', SLATE);
    bx(XS[2], R1, W[2], 'climb f̂ over x', 'search the designs', SLATE);
    bx(XS[3], R1, W[3], 'x̂ — often not a design', 'the climb left the data', RED, '#FCEEEE');
    bx(XS[0], R2, W[0], 'the data', 'pairs (xᵢ, yᵢ)', SLATE);
    bx(XS[1], R2, W[1], 'learn x = g(y, z)', 'design from score', BLUE, '#EEF3FE');
    bx(XS[2], R2, W[2], 'ask for a high y', 'and draw a z', BLUE, '#EEF3FE');
    bx(XS[3], R2, W[3], 'x* — made by g', 'g only makes data-like designs', GREEN, '#ECF7EF');
    for (var k = 0; k < 3; k++) { ar(XS[k] + W[k] + 4, XS[k + 1] - 4, R1); ar(XS[k] + W[k] + 4, XS[k + 1] - 4, R2); }
    t(XS[1] + W[1] / 2, R2 + 50, 'Q1 · train g on which scores?', { 'text-anchor': 'middle', 'font-weight': 700, fill: AMBER, 'font-size': 12 });
    t(XS[2] + W[2] / 2, R2 + 50, 'Q2 · which score to ask for?', { 'text-anchor': 'middle', 'font-weight': 700, fill: AMBER, 'font-size': 12 });
    t(XS[1] + W[1] / 2, R2 + 66, 'next slide', { 'text-anchor': 'middle', fill: AMBER, 'font-size': 10.5 });
    t(XS[2] + W[2] / 2, R2 + 66, 'the slide after', { 'text-anchor': 'middle', fill: AMBER, 'font-size': 10.5 });
    return { finish: function () {} };
  }

  /* ---------------- Q1: which scores to train on ---------------- */
  if (MODE === 'reweight') {
    var NY = [4, 9, 15, 20, 18, 13, 9, 6, 4, 2], YS = NY.map(function (_, k) { return 0.15 + 0.3 * k; }), YB = 2.85, K = 5;
    var TOT = 100, PD = NY.map(function (n) { return n / TOT; });
    function norm(a) { var z = a.reduce(function (x, y) { return x + y; }, 0); return a.map(function (v) { return v / z; }); }
    var GREEDY = NY.map(function (_, k) { return k === 9 ? 1 : 0; });
    var EXP = norm(YS.map(function (y) { return Math.exp(y - YB); }));
    var TRUST = NY.map(function (n) { return n / (n + K); });
    var MINS = norm(NY.map(function (n, k) { return TRUST[k] * Math.exp(YS[k] - YB); }));
    var SETS = [PD, GREEDY, EXP, MINS], COLS = [SLATE, RED, AMBER, BLUE];
    var HEADS = ['as is: p_D(y) = N_y / 100', 'best bin only', 'lean to high scores: p(y) ∝ e^(y − y*)', 'MINs: p(y) ∝ N_y / (N_y + K) · e^(y − y*)'];
    var st = 0;
    host.innerHTML =
      '<div class="wbar"><span class="wt">Q1 · train the generator on which scores?</span><span class="wspacer"></span>' +
      '<span class="wlabel">bars</span><span class="wnum">share of training weight per score</span></div>' +
      '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center;padding:8px 12px 6px">' +
      '<div data-c></div><div data-note style="width:290px;font:400 13px/1.6 var(--sans);color:var(--ink2)"></div></div>';
    var sv2 = IE437.svg(660, 282); host.querySelector('[data-c]').appendChild(sv2);
    function t2(x, y, s, a) { var o = { x: x, y: y, 'font-size': 11.5, fill: INK, text: s }; for (var k in a || {}) o[k] = a[k]; return E('text', o, sv2); }
    var X0 = 64, BWID = 40, GAP = 18, PT = 70, PB = 222, MAX = 0.30;
    function bxp(k) { return X0 + k * (BWID + GAP); }
    function h(v) { return Math.min(v, MAX) / MAX * (PB - PT); }
    function draw() {
      while (sv2.firstChild) sv2.removeChild(sv2.firstChild);
      t2(0, 14, 'y: a design’s score, in ten bins  ·  N_y: data points in y’s bin (100 in all)', { 'font-size': 11, 'fill-opacity': .7 });
      t2(0, 30, 'p_D(y) = N_y / 100: the data’s share  ·  y* = 2.85: the best score in the data  ·  K = 5: a constant', { 'font-size': 11, 'fill-opacity': .7 });
      t2(0, 54, HEADS[st], { 'font-size': 13, 'font-weight': 700, fill: COLS[st] });
      E('line', { x1: X0 - 8, x2: bxp(9) + BWID + 8, y1: PB, y2: PB, stroke: INK, 'stroke-opacity': .3 }, sv2);
      var V = SETS[st];
      NY.forEach(function (n, k) {
        var x = bxp(k);
        if (st >= 1) E('rect', { x: x - 3, y: PB - h(PD[k]) - 3, width: BWID + 6, height: h(PD[k]) + 3, fill: 'none', stroke: INK, 'stroke-opacity': .4, 'stroke-dasharray': '3 3' }, sv2);
        E('rect', { x: x, y: PB - h(V[k]), width: BWID, height: h(V[k]), fill: COLS[st], 'fill-opacity': .8 }, sv2);
        if (V[k] > 0.004) t2(x + BWID / 2, PB - h(V[k]) - 6, V[k] > MAX ? '100%' : Math.round(100 * V[k]) + '%', { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: COLS[st], 'font-family': MONO });
        t2(x + BWID / 2, PB + 15, YS[k].toFixed(2), { 'text-anchor': 'middle', 'font-size': 10, 'font-family': MONO, 'fill-opacity': .6 });
        t2(x + BWID / 2, PB + 31, String(n), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, 'font-family': MONO });
        if (st === 3) t2(x + BWID / 2, PB + 47, TRUST[k].toFixed(2), { 'text-anchor': 'middle', 'font-size': 10.5, fill: BLUE, 'font-family': MONO });
      });
      t2(X0 - 12, PB + 15, 'y', { 'text-anchor': 'end', 'font-size': 10.5, 'fill-opacity': .6, 'font-style': 'italic' });
      t2(X0 - 12, PB + 31, 'N_y', { 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700 });
      if (st === 3) t2(X0 - 12, PB + 47, 'N/(N+K)', { 'text-anchor': 'end', 'font-size': 9.5, fill: BLUE });
      if (st >= 1) {
        E('rect', { x: 520, y: 46, width: 14, height: 9, fill: 'none', stroke: INK, 'stroke-opacity': .45, 'stroke-dasharray': '3 3' }, sv2);
        t2(540, 54, 'the data, p_D(y)', { 'font-size': 10.5, 'fill-opacity': .6 });
      }
      host.querySelector('[data-note]').innerHTML = hl([
        'Train g on the data as it is, and it learns ==mostly middling scores==: the average is 1.30, while the best is 2.85.',
        'Train on the best scores only, and two data points carry all the training. ==Too few to learn from==: the generator memorises noise.',
        'Lean toward high scores, e^(y − y*): better. But the top bin still gets <b>27%</b> of the training — on the same two points.',
        'MINs multiplies by a ==trust factor== N_y/(N_y + K): near 1 where many points share a score, small where few do. The top bin drops to <b>15%</b>; the average trained score rises to 1.95.<br>' +
        'Each data point counts w = p(y)/p_D(y): 0.35 for a middling point, 7.6 for one of the best two.'
      ][st]);
    }
    var show = function (k) { st = Math.max(0, Math.min(3, k)); draw(); };
    show(0);
    return { steps: 3, step: show, reset: function () { show(0); }, finish: function () { show(3); } };
  }

  /* ---------------- Q1's formula, term by term ---------------- */
  if (MODE === 'term') {
    var KK = opts.k || 1;
    host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:6px 6px 2px"><div data-c></div></div>';
    var s4 = IE437.svg(320, 150); host.querySelector('[data-c]').appendChild(s4);
    var l4 = 36, r4 = 306, t4 = 12, b4 = 118;
    function u(x, y, str, a) { var o = { x: x, y: y, 'font-size': 10.5, fill: INK, text: str }; for (var k in a || {}) o[k] = a[k]; return E('text', o, s4); }
    E('line', { x1: l4, x2: r4, y1: b4, y2: b4, stroke: INK, 'stroke-opacity': .35 }, s4);
    E('line', { x1: l4, x2: l4, y1: t4, y2: b4, stroke: INK, 'stroke-opacity': .35 }, s4);
    if (KK === 1) {
      var xa = function (v) { return l4 + v / 2.85 * (r4 - l4); }, ya = function (v) { return b4 - v * (b4 - t4); };
      var pts = []; for (var i = 0; i <= 100; i++) { var yv = 2.85 * i / 100; pts.push(xa(yv).toFixed(1) + ' ' + ya(Math.exp(yv - 2.85)).toFixed(1)); }
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: AMBER, 'stroke-width': 2.4 }, s4);
      [[2.85, '1'], [1.85, '1/e ≈ 0.37'], [0.85, '1/e² ≈ 0.14']].forEach(function (q) {
        E('circle', { cx: xa(q[0]), cy: ya(Math.exp(q[0] - 2.85)), r: 4, fill: AMBER }, s4);
        u(xa(q[0]) - 6, ya(Math.exp(q[0] - 2.85)) - 8, q[1], { 'text-anchor': 'end', 'font-weight': 700, fill: AMBER, 'font-family': MONO });
      });
      [0, 1, 2].forEach(function (v) { u(xa(v), b4 + 13, String(v), { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .55, 'font-family': MONO }); });
      u(xa(2.85), b4 + 13, 'y*', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700 });
      u((l4 + r4) / 2, b4 + 28, 'score y', { 'text-anchor': 'middle', 'font-style': 'italic', 'fill-opacity': .6 });
    } else if (KK === 2) {
      var xb = function (v) { return l4 + v / 30 * (r4 - l4); }, yb = function (v) { return b4 - v * (b4 - t4); };
      var pb = []; for (var j = 0; j <= 120; j++) { var n = 30 * j / 120; pb.push(xb(n).toFixed(1) + ' ' + yb(n / (n + 5)).toFixed(1)); }
      E('path', { d: 'M' + pb.join('L'), fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, s4);
      E('line', { x1: l4, x2: r4, y1: yb(1), y2: yb(1), stroke: INK, 'stroke-opacity': .25, 'stroke-dasharray': '3 3' }, s4);
      u(r4, yb(1) - 4, 'full trust', { 'text-anchor': 'end', 'font-size': 9.5, 'fill-opacity': .55 });
      [[2, '2 points: 0.29'], [5, 'N = K: 1/2'], [20, '20 points: 0.80']].forEach(function (q) {
        E('circle', { cx: xb(q[0]), cy: yb(q[0] / (q[0] + 5)), r: 4, fill: BLUE }, s4);
        u(xb(q[0]) + 7, yb(q[0] / (q[0] + 5)) + 14, q[1], { 'font-weight': 700, fill: BLUE, 'font-family': MONO });
      });
      [0, 10, 20, 30].forEach(function (v) { u(xb(v), b4 + 13, String(v), { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .55, 'font-family': MONO }); });
      u((l4 + r4) / 2, b4 + 28, 'N_y — data points sharing the score (K = 5)', { 'text-anchor': 'middle', 'font-style': 'italic', 'fill-opacity': .6 });
    } else {
      var BINS = [['a middling bin, y = 1.05', 0.20, 0.07], ['the top bin, y = 2.85', 0.02, 0.152]], yc = function (v) { return b4 - v / 0.22 * (b4 - t4); };
      BINS.forEach(function (bn, k) {
        var x0 = l4 + 22 + k * 140;
        E('rect', { x: x0, y: yc(bn[1]), width: 30, height: b4 - yc(bn[1]), fill: SLATE, 'fill-opacity': .55 }, s4);
        E('rect', { x: x0 + 36, y: yc(bn[2]), width: 30, height: b4 - yc(bn[2]), fill: BLUE, 'fill-opacity': .8 }, s4);
        u(x0 + 15, yc(bn[1]) - 5, bn[1].toFixed(2), { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 700, fill: SLATE });
        u(x0 + 51, yc(bn[2]) - 5, bn[2].toFixed(2), { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 700, fill: BLUE });
        u(x0 + 33, b4 + 13, bn[0], { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .7 });
        u(x0 + 100, (yc(bn[1]) + b4) / 2, 'w = ' + (bn[2] / bn[1]).toFixed(2), { 'text-anchor': 'middle', 'font-family': MONO, 'font-weight': 700, fill: GREEN, 'font-size': 11.5 });
      });
      E('rect', { x: l4 + 4, y: b4 + 20, width: 10, height: 8, fill: SLATE, 'fill-opacity': .55 }, s4);
      u(l4 + 18, b4 + 28, 'p_D: the data’s share', { 'font-size': 10 });
      E('rect', { x: l4 + 140, y: b4 + 20, width: 10, height: 8, fill: BLUE, 'fill-opacity': .8 }, s4);
      u(l4 + 154, b4 + 28, 'p: the share we want', { 'font-size': 10 });
    }
    return { finish: function () {} };
  }

  /* ---------------- Q2: which score to ask for ---------------- */
  var qs = 0, YB2 = 2.85, EPS = 0.1;
  function pred(y) { return y <= YB2 ? y : YB2 + 0.6 * (1 - Math.exp(-(y - YB2) / 0.6)); }
  var YT = YB2; for (var yy = YB2; yy <= 4.5; yy += 0.001) { if (yy - pred(yy) <= EPS) YT = yy; }
  host.innerHTML =
    '<div class="wbar"><span class="wt">Q2 · which score to ask for?</span><span class="wspacer"></span>' +
    '<span class="wlabel">check</span><span class="wnum">does the design made deliver the score asked?</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center;padding:8px 12px 6px">' +
    '<div data-c></div><div data-note style="width:300px;font:400 13px/1.6 var(--sans);color:var(--ink2)"></div></div>';
  var sv3 = IE437.svg(470, 232); host.querySelector('[data-c]').appendChild(sv3);
  var L = 52, R = 452, T = 10, B = 196, MX = 4.5;
  var PX = function (v) { return L + v / MX * (R - L); }, PY = function (v) { return B - v / MX * (B - T); };
  function t3(x, y, s, a) { var o = { x: x, y: y, 'font-size': 11.5, fill: INK, text: s }; for (var k in a || {}) o[k] = a[k]; return E('text', o, sv3); }
  function draw3() {
    while (sv3.firstChild) sv3.removeChild(sv3.firstChild);
    E('rect', { x: PX(0), y: T, width: PX(YB2) - PX(0), height: B - T, fill: SLATE, 'fill-opacity': .08 }, sv3);
    t3(PX(YB2 / 2), T + 14, 'scores seen in the data', { 'text-anchor': 'middle', 'font-size': 10.5, 'fill-opacity': .55 });
    E('line', { x1: L, x2: R, y1: B, y2: B, stroke: INK, 'stroke-opacity': .35 }, sv3);
    E('line', { x1: L, x2: L, y1: T, y2: B, stroke: INK, 'stroke-opacity': .35 }, sv3);
    [0, 1, 2, 3, 4].forEach(function (v) {
      t3(PX(v), B + 15, String(v), { 'text-anchor': 'middle', 'font-size': 10, 'font-family': MONO, 'fill-opacity': .55 });
      t3(L - 6, PY(v) + 4, String(v), { 'text-anchor': 'end', 'font-size': 10, 'font-family': MONO, 'fill-opacity': .55 });
    });
    t3((L + R) / 2, B + 32, 'y — the score we ask for', { 'text-anchor': 'middle', 'font-size': 11, 'font-style': 'italic', 'fill-opacity': .7 });
    t3(14, (T + B) / 2, 'predicted score of the design made', { 'text-anchor': 'middle', 'font-size': 11, 'font-style': 'italic', 'fill-opacity': .7, transform: 'rotate(-90 14 ' + (T + B) / 2 + ')' });
    E('line', { x1: PX(0), y1: PY(0), x2: PX(MX), y2: PY(MX), stroke: INK, 'stroke-opacity': .45, 'stroke-dasharray': '5 4' }, sv3);
    t3(PX(4.45), PY(4.45) + 2, 'asked = delivered', { 'text-anchor': 'end', 'font-size': 10.5, 'fill-opacity': .6 });
    if (qs >= 2) {
      var band = 'M' + PX(0) + ' ' + PY(0) + 'L' + PX(MX) + ' ' + PY(MX) + 'L' + PX(MX) + ' ' + PY(MX - EPS) + 'L' + PX(EPS) + ' ' + PY(0) + 'Z';
      E('path', { d: band, fill: GREEN, 'fill-opacity': .14 }, sv3);
    }
    if (qs >= 1) {
      var pts = []; for (var i = 0; i <= 200; i++) { var y = MX * i / 200; pts.push(PX(y).toFixed(1) + ' ' + PY(pred(y)).toFixed(1)); }
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, sv3);
      t3(PX(3.75), PY(pred(3.75)) + 20, 'what g delivers', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: BLUE });
    }
    if (qs >= 2) {
      E('line', { x1: PX(YT), x2: PX(YT), y1: B, y2: PY(pred(YT)), stroke: GREEN, 'stroke-width': 1.6 }, sv3);
      E('circle', { cx: PX(YT), cy: PY(pred(YT)), r: 5.5, fill: GREEN }, sv3);
      t3(PX(YT) - 6, PY(pred(YT)) - 10, 'ask for ỹ ≈ ' + YT.toFixed(1), { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: GREEN });
      E('circle', { cx: PX(4.3), cy: PY(pred(4.3)), r: 4.5, fill: 'none', stroke: RED, 'stroke-width': 1.8 }, sv3);
      t3(PX(4.3) - 8, PY(pred(4.3)) - 10, 'ask 4.3, get ' + pred(4.3).toFixed(1), { 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: RED });
    }
    host.querySelector('[data-note]').innerHTML = hl([
      'Ask g for a score y, and check the design it makes with a ==forward model f̂== trained separately — Lecture 5’s surrogate. On the dashed line, the design delivers exactly what was asked.',
      'Inside the data, it does. Beyond the data’s best score (2.85), ==it delivers less and less==: the generator has never seen such designs.',
      'MINs asks for the ==largest score that still passes the check==, (y − f̂)² ≤ ε₁ — here about ' + YT.toFixed(1) + ', a little past the data’s best. Asking 4.3 would get a design worth ' + pred(4.3).toFixed(1) + '.'
    ][qs]);
  }
  var show3 = function (k) { qs = Math.max(0, Math.min(2, k)); draw3(); };
  show3(0);
  return { steps: 2, step: show3, reset: function () { show3(0); }, finish: function () { show3(2); } };
});
