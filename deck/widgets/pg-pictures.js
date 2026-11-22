/* ============================================================
   widget: pg-pictures                            (Chapter 10, Acts 1–4)
   Four small drawn pictures, in the manner of Ch 9's heater-pictures:
   each replaces a slide that used to argue in prose or in a table of
   numbers. Plain figure panels, stepped; every step redraws.

   mode "families"  source p. 27 — the three-families Venn: a value disc
                    (Lecture 8), a policy disc (Act 1) and the lens where
                    they overlap, actor–critic. Step 1 names the lens, step
                    2 says what each learns. Stepped (2).  560 × 290.
   mode "scores"    the one-parameter example drawn: π_θ(A) = σ(θ) at
                    θ = 0, the two scores 1 − p and −p as arrows of
                    opposite sign; step 1 multiplies them by the
                    advantages +1 and −1 and both arrows point the same
                    way. Stepped (1).  720 × 290.  Numbers in the note.
   mode "noise"     source pp. 63–65 — white noise against an
                    Ornstein–Uhlenbeck path over one episode, their
                    running sums beneath; step 1 names what a swing-up
                    needs: a sum that grows in one direction. Stepped (1).
                    740 × 300.  OU: x_{t+1} = x_t − κ x_t + σ ε_t,
                    κ = 0.15, σ = 0.3, seeded.
   mode "loop"      Act 4 — the policy makes its own next batch: the
                    loop policy → batch → gradient → step, and beside it
                    behaviour space with the region the batch describes.
                    Step 1 takes one large step out of it; step 2 draws
                    the KL ball around π_old, Lecture 1's trust region in
                    behaviour space. Stepped (2).  760 × 300.
   ============================================================ */
IE437.widget('pg-pictures', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'families';
  var uid = 'pp' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  function svg(w, h) { var s = IE437.svg(w, h); mount.appendChild(s); var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['g', GREEN], ['r', RED], ['s', SLATE], ['a', AMBER]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m); });
    return s; }
  function arrow(s, x1, y1, x2, y2, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#16A34A': 'g', '#D64545': 'r', '#64748B': 's', '#D97706': 'a' }[c] || 'k';
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.6, 'marker-end': 'url(#' + uid + key + ')' };
    for (var q in extra || {}) a[q] = extra[q];
    return E('line', a, s);
  }
  function tx(s, x, y, str, a) {
    var m = { 'font-size': 12 }; for (var q in a || {}) m[q] = a[q];
    if (/[_^()=|∼\\′+−]/.test(str) || /^[A-Za-z]$/.test(str)) {
      m['font-size'] = Math.round(parseFloat(m['font-size']) * 1.25 * 10) / 10;
      return IE437.math(s, x, y, str, m);
    }
    var at = { x: x, y: y, 'font-size': 12, fill: INK, text: str }; for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  function layer(s, op) { return E('g', op != null ? { opacity: op } : {}, s); }
  function box(s, x, y, w, h, title, sub, c) {
    E('rect', { x: x, y: y, width: w, height: h, rx: 6, fill: PANEL, stroke: c || PANEL2, 'stroke-width': c ? 1.6 : 1 }, s);
    tx(s, x + w / 2, y + (sub ? h / 2 - 3 : h / 2 + 4), title, { 'text-anchor': 'middle', 'font-size': 12, fill: INK, 'font-weight': 600 });
    if (sub) tx(s, x + w / 2, y + h / 2 + 13, sub, { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
  }

  /* ============================================================ families ============================================================ */
  function drawFamilies(k) {
    var W = 560, H = 290, s = svg(W, H);
    var L = [215, 148], R = [345, 148], r = 98;
    var g = layer(s);
    E('circle', { cx: L[0], cy: L[1], r: r, fill: GREEN, 'fill-opacity': .09, stroke: GREEN, 'stroke-width': 1.8 }, g);
    E('circle', { cx: R[0], cy: R[1], r: r, fill: BLUE, 'fill-opacity': .09, stroke: BLUE, 'stroke-width': 1.8 }, g);
    tx(g, L[0] - 40, L[1] - 4, 'Value function', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600 });
    tx(g, L[0] - 40, L[1] + 14, 'V or Q', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 11 });
    tx(g, R[0] + 40, R[1] - 4, 'Policy', { fill: BLUE, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600 });
    tx(g, R[0] + 40, R[1] + 14, 'π_θ', { fill: BLUE, 'text-anchor': 'middle', 'font-size': 11 });
    tx(g, L[0] - 30, L[1] - r - 14, 'Value-based · Lecture 8', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 11 });
    tx(g, R[0] + 30, R[1] - r - 14, 'Policy-based · Act 1', { fill: BLUE, 'text-anchor': 'middle', 'font-size': 11 });
    if (k >= 1) {
      var g1 = layer(s), m = (L[0] + R[0]) / 2;
      /* the lens: the intersection of the two discs */
      var d = R[0] - L[0], hh = Math.sqrt(r * r - d * d / 4);
      E('path', { d: 'M' + m + ' ' + (L[1] - hh) + 'A' + r + ' ' + r + ' 0 0 1 ' + m + ' ' + (L[1] + hh) + 'A' + r + ' ' + r + ' 0 0 1 ' + m + ' ' + (L[1] - hh) + 'Z', fill: AMBER, 'fill-opacity': .28, stroke: AMBER, 'stroke-width': 1.5 }, g1);
      tx(g1, m, L[1] - 2, 'Actor', { fill: AMBER, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700 });
      tx(g1, m, L[1] + 14, 'Critic', { fill: AMBER, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700 });
      tx(g1, m, L[1] + 32, 'Act 2', { fill: AMBER, 'text-anchor': 'middle', 'font-size': 10.5 });
    }
    if (k >= 2) {
      var g2 = layer(s);
      tx(g2, 20, H - 22, 'the critic learns a value and weights the score;', { fill: SLATE, 'font-size': 11 });
      tx(g2, 20, H - 7, 'the actor learns the policy and takes the step.', { fill: SLATE, 'font-size': 11 });
      tx(g2, W - 10, H - 7, 'not a compromise: the intersection', { fill: AMBER, 'font-size': 11, 'text-anchor': 'end' });
    }
  }

  /* ============================================================ scores ============================================================ */
  function drawScores(k) {
    var W = 720, H = 290, s = svg(W, H);
    /* left: the sigmoid and the two scores at θ = 0 */
    var px = 50, pw = 300, py = 30, ph = 200;
    function X(th) { return px + (th + 4) / 8 * pw; }
    function Y(p) { return py + ph - p * ph; }
    var g = layer(s);
    E('line', { x1: px, x2: px + pw, y1: Y(0), y2: Y(0), stroke: INK, 'stroke-opacity': .35 }, g);
    E('line', { x1: X(0), x2: X(0), y1: Y(0), y2: py, stroke: INK, 'stroke-opacity': .2, 'stroke-dasharray': '3 3' }, g);
    tx(g, px + pw + 4, Y(0) + 4, 'θ', { 'font-size': 12 });
    tx(g, X(0), Y(0) + 16, '0', { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
    var d = '', th; for (th = -4; th <= 4.001; th += 0.1) { var p = 1 / (1 + Math.exp(-th)); d += (th === -4 ? 'M' : 'L') + X(th).toFixed(1) + ' ' + Y(p).toFixed(1); }
    E('path', { d: d, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, g);
    tx(g, px + 10, py + 8, 'π_θ(A) = σ(θ)', { 'font-size': 11.5 });
    tx(g, px + 10, py + 26, 'π_θ(B) = 1 − σ(θ)', { 'font-size': 11.5, fill: SLATE });
    E('circle', { cx: X(0), cy: Y(.5), r: 5, fill: INK }, g);
    tx(g, X(0) + 10, Y(.5) + 16, 'p = 0.5', { 'font-size': 10.5, fill: SLATE });
    /* the two scores as arrows along θ at the point: positive for A, negative for B */
    var y0 = Y(.5), sc = 60;
    arrow(g, X(0), y0 - 22, X(0) + 0.5 * sc * 2, y0 - 22, BLUE, { 'stroke-width': 2.2 });
    tx(g, X(0) + 0.5 * sc * 2 + 8, y0 - 18, '∇_θ\\log π_θ(A) = 1 − p', { fill: BLUE, 'font-size': 10.5 });
    arrow(g, X(0), y0 + 30, X(0) - 0.5 * sc * 2, y0 + 30, RED, { 'stroke-width': 2.2 });
    tx(g, X(0) - 0.5 * sc * 2 - 8, y0 + 34, '∇_θ\\log π_θ(B) = −p', { fill: RED, 'font-size': 10.5, 'text-anchor': 'end' });
    tx(g, px + pw / 2, H - 10, 'the two scores point opposite ways: a step for A is a step against B', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle' });
    /* right: the contributions score × advantage on a θ axis */
    var rx = 420, rw = 270, ry = 150;
    var g2 = layer(s);
    E('line', { x1: rx, x2: rx + rw, y1: ry, y2: ry, stroke: INK, 'stroke-opacity': .35 }, g2);
    E('line', { x1: rx + rw / 2, x2: rx + rw / 2, y1: ry - 8, y2: ry + 8, stroke: INK, 'stroke-opacity': .5 }, g2);
    tx(g2, rx + rw + 4, ry + 4, 'θ', { 'font-size': 12 });
    tx(g2, rx + rw / 2, ry + 20, 'θ = 0', { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
    tx(g2, rx + rw / 2, 40, k === 0 ? 'the scores alone' : 'score × advantage', { 'text-anchor': 'middle', 'font-size': 12, fill: INK, 'font-weight': 600 });
    var m = rx + rw / 2, u = 80;
    if (k === 0) {
      arrow(g2, m, ry - 34, m + 0.5 * u * 2, ry - 34, BLUE, { 'stroke-width': 2.2 });
      tx(g2, m + 0.5 * u, ry - 44, 'A\\text{: score } +0.5', { fill: BLUE, 'font-size': 10.5, 'text-anchor': 'middle' });
      arrow(g2, m, ry + 44, m - 0.5 * u * 2, ry + 44, RED, { 'stroke-width': 2.2 });
      tx(g2, m - 0.5 * u, ry + 62, 'B\\text{: score } −0.5', { fill: RED, 'font-size': 10.5, 'text-anchor': 'middle' });
      tx(g2, rx + rw / 2, H - 10, 'which way should θ move?', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle' });
    } else {
      arrow(g2, m, ry - 34, m + 0.5 * u * 2, ry - 34, BLUE, { 'stroke-width': 2.2 });
      tx(g2, m + 0.5 * u, ry - 44, 'A\\text{: } (+0.5)(\\red{+1}) = +0.5', { fill: BLUE, 'font-size': 10.5, 'text-anchor': 'middle' });
      arrow(g2, m, ry + 44, m + 0.5 * u * 2, ry + 44, RED, { 'stroke-width': 2.2 });
      tx(g2, m + 0.5 * u, ry + 62, 'B\\text{: } (−0.5)(\\red{−1}) = +0.5', { fill: RED, 'font-size': 10.5, 'text-anchor': 'middle' });
      tx(g2, rx + rw / 2, 60, 'A did better than the baseline, B worse', { 'text-anchor': 'middle', 'font-size': 10.5, fill: SLATE });
      tx(g2, rx + rw / 2, H - 10, 'both observations push θ the same way: A becomes likelier', { fill: INK, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
  }

  /* ============================================================ noise ============================================================ */
  function drawNoise(k) {
    var W = 740, H = 300, s = svg(W, H);
    var N = 60, KAPPA = 0.15, SIGMA = 0.3, rand = IE437.rng(opts.seed == null ? 3 : +opts.seed);
    function gauss() { var a = rand(); if (a < 1e-12) a = 1e-12; var b = rand(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }
    var white = [], ou = [], x = 0, i;
    for (i = 0; i < N; i++) { var e = gauss(); white.push(SIGMA * e); x = x - KAPPA * x + SIGMA * e; ou.push(x); }
    var sw = [], so = [], a = 0, b = 0;
    for (i = 0; i < N; i++) { a += white[i]; b += ou[i]; sw.push(a); so.push(b); }
    function panel(x0, y0, w, h, data, cols, title, ylab, ydom) {
      var g = layer(s);
      tx(g, x0 + w / 2, y0 - 8, title, { 'text-anchor': 'middle', 'font-size': 11.5, fill: INK, 'font-weight': 600 });
      E('rect', { x: x0, y: y0, width: w, height: h, fill: PANEL, stroke: PANEL2 }, g);
      function X(t) { return x0 + 6 + t / (N - 1) * (w - 12); }
      function Y(v) { return y0 + h / 2 - v / ydom * (h / 2 - 6); }
      E('line', { x1: x0, x2: x0 + w, y1: Y(0), y2: Y(0), stroke: INK, 'stroke-opacity': .2 }, g);
      data.forEach(function (d, j) {
        var p = d.map(function (v, t) { return (t ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(Math.max(-ydom, Math.min(ydom, v))).toFixed(1); }).join(' ');
        E('path', { d: p, fill: 'none', stroke: cols[j], 'stroke-width': j ? 2 : 1.3, opacity: j ? 1 : .75 }, g);
      });
      tx(g, x0 + 4, y0 + h + 13, ylab, { fill: SLATE, 'font-size': 10 });
      return { X: X, Y: Y };
    }
    panel(40, 40, 310, 100, [white, ou], [SLATE, BLUE], 'the noise added to the action, step by step', 'white noise, grey, against an Ornstein–Uhlenbeck path, blue', 1.2);
    var m2 = panel(40, 180, 310, 100, [sw, so], [SLATE, BLUE], 'the same noise, summed over the episode', k >= 1 ? '' : 'the push the pole actually receives', 6);
    /* right: the pole, and what a swing-up needs */
    var g = layer(s), cx = 560, cy = 150;
    E('line', { x1: 430, x2: 700, y1: cy + 60, y2: cy + 60, stroke: INK, 'stroke-opacity': .3 }, g);
    E('circle', { cx: cx, cy: cy + 60, r: 5, fill: INK }, g);
    [[-55, .25], [-30, .5], [-5, .8], [20, 1]].forEach(function (p) {
      var ang = p[0] * Math.PI / 180, L = 95;
      E('line', { x1: cx, y1: cy + 60, x2: cx + L * Math.sin(ang), y2: cy + 60 - L * Math.cos(ang), stroke: BLUE, 'stroke-width': 3, opacity: p[1] * .9, 'stroke-linecap': 'round' }, g);
    });
    arrow(g, cx - 70, cy + 80, cx + 70, cy + 80, AMBER, { 'stroke-width': 2.4 });
    tx(g, cx, cy + 98, 'push the same way until the pole is nearly up', { fill: AMBER, 'font-size': 10.5, 'text-anchor': 'middle' });
    tx(g, cx, 32, 'the swing-up', { 'text-anchor': 'middle', 'font-size': 11.5, fill: INK, 'font-weight': 600 });
    tx(g, cx, 48, 'a sustained push, then alternation near the top', { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
    if (k >= 1) {
      var g1 = layer(s);
      E('rect', { x: 36, y: 176, width: 318, height: 108, fill: 'none', stroke: RED, 'stroke-width': 1.8, rx: 4 }, g1);
      tx(g1, 44, 293, 'white noise sums to nothing; a correlated path keeps pushing one way', { fill: RED, 'font-size': 10.5 });
      tx(g1, cx, cy + 118, 'a random jitter averages out and never swings it up', { fill: RED, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
  }

  /* ============================================================ loop ============================================================ */
  function drawLoop(k) {
    var W = 760, H = 300, s = svg(W, H);
    var g = layer(s);
    /* left: the four boxes of the loop */
    var bw = 118, bh = 46;
    var B = [[36, 40], [206, 40], [206, 190], [36, 190]];
    box(g, B[0][0], B[0][1], bw, bh, '\\text{policy } π_θ', 'acts in the world', BLUE);
    box(g, B[1][0], B[1][1], bw, bh, 'a batch', '\\text{collected under } π_θ');
    box(g, B[2][0], B[2][1], bw, bh, 'a gradient', 'estimated from it');
    box(g, B[3][0], B[3][1], bw, bh, 'a step', 'θ ← θ + αĝ', k >= 1 ? RED : null);
    arrow(g, B[0][0] + bw + 3, B[0][1] + bh / 2, B[1][0] - 3, B[1][1] + bh / 2, INK);
    arrow(g, B[1][0] + bw / 2, B[1][1] + bh + 3, B[2][0] + bw / 2, B[2][1] - 3, INK);
    arrow(g, B[2][0] - 3, B[2][1] + bh / 2, B[3][0] + bw + 3, B[3][1] + bh / 2, INK);
    arrow(g, B[3][0] + bw / 2, B[3][1] - 3, B[0][0] + bw / 2, B[0][1] + bh + 3, RED, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    tx(g, 20, 150, 'the next batch', { fill: RED, 'font-size': 10 });
    tx(g, 20, 163, 'comes from the', { fill: RED, 'font-size': 10 });
    tx(g, 20, 176, 'new policy', { fill: RED, 'font-size': 10 });
    tx(g, 180, H - 10, 'no fixed dataset to fall back on', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle' });
    /* right: behaviour space */
    var cx = 560, cy = 150;
    tx(g, cx, 24, 'the space of behaviours: action distributions', { 'text-anchor': 'middle', 'font-size': 11.5, fill: INK, 'font-weight': 600 });
    E('path', { d: 'M' + (cx - 95) + ' ' + (cy + 10) + ' C ' + (cx - 100) + ' ' + (cy - 70) + ', ' + (cx + 30) + ' ' + (cy - 90) + ', ' + (cx + 70) + ' ' + (cy - 30) + ' S ' + (cx + 40) + ' ' + (cy + 80) + ', ' + (cx - 40) + ' ' + (cy + 60) + ' S ' + (cx - 90) + ' ' + (cy + 60) + ', ' + (cx - 95) + ' ' + (cy + 10) + 'Z', fill: GREEN, 'fill-opacity': .12, stroke: GREEN, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, g);
    tx(g, cx - 20, cy + 95, 'where the batch is evidence', { fill: GREEN, 'font-size': 10.5, 'text-anchor': 'middle' });
    E('circle', { cx: cx - 10, cy: cy, r: 5, fill: INK }, g);
    tx(g, cx - 10, cy - 12, 'π_{old}', { 'text-anchor': 'middle', 'font-size': 11 });
    if (k >= 1) {
      var g1 = layer(s);
      arrow(g1, cx - 6, cy - 3, cx + 120, cy - 72, RED, { 'stroke-width': 2.4 });
      E('circle', { cx: cx + 127, cy: cy - 76, r: 5, fill: RED }, g1);
      tx(g1, cx + 138, cy - 72, 'π_{new}', { fill: RED, 'font-size': 11 });
      tx(g1, W - 12, cy - 104, 'the batch says nothing here;', { fill: RED, 'font-size': 10, 'text-anchor': 'end' });
      tx(g1, W - 12, cy - 91, 'the next batch is collected here', { fill: RED, 'font-size': 10, 'text-anchor': 'end' });
    }
    if (k >= 2) {
      var g2 = layer(s);
      E('circle', { cx: cx - 10, cy: cy, r: 44, fill: BLUE, 'fill-opacity': .08, stroke: BLUE, 'stroke-width': 1.8 }, g2);
      arrow(g2, cx - 6, cy + 3, cx + 22, cy + 28, BLUE, { 'stroke-width': 2.2 });
      tx(g2, cx + 40, cy + 40, 'KL(π_{old} ‖ π) ≤ δ', { fill: BLUE, 'font-size': 11 });
      tx(g2, cx + 40, cy + 55, 'a step the batch can vouch for', { fill: BLUE, 'font-size': 10 });
      tx(g2, cx + 60, H - 10, 'Lecture 1’s trust region, measured in behaviour, not in θ', { fill: BLUE, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
  }

  var DRAW = { families: drawFamilies, scores: drawScores, noise: drawNoise, loop: drawLoop };
  var STEPS = { families: 2, scores: 1, noise: 1, loop: 2 };
  var draw = DRAW[MODE] || drawFamilies, n = STEPS[MODE] == null ? 1 : STEPS[MODE];
  function render(i) { mount.innerHTML = ''; draw(Math.max(0, Math.min(n, i | 0))); }
  render(0);
  return { steps: n, step: function (i) { render(i); }, reset: function () { render(0); }, finish: function () { render(n); } };
});
