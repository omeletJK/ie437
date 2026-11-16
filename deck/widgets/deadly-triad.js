/* ============================================================
   widget: deadly-triad                                 (Chapter 8)
   Tsitsiklis & Van Roy's two-state example, reduced to one picture:
   an estimate chasing a target that is tied to it.
     data     one transition s1 -> s2, reward 0, so both true values
              are 0.
     weight   one shared w: V(s1) = w, V(s2) = 2w.
     update   V(s1) <- V(s1) + alpha [ gamma V(s2) - V(s1) ], once
              per press.
   Two bars: the estimate V(s1) and its target gamma V(s2) = 2 gamma w.
   Each press moves the estimate up by alpha * gap and the target up
   by twice that, so the gap grows: with alpha = 0.5 and gamma = 0.99,
   w runs 1, 1.50, 2.24, 3.34, 5.00 and the gap 0.98, 1.47, 2.19,
   3.27, 4.90. The light cap on each bar is what the last press added
   and the two "+" numbers say by how much. Steps: 4 presses.
   Options: alpha (0.5), gamma (0.99), steps (4), axis (10).
   ============================================================ */
IE437.widget('deadly-triad', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B', LBLUE = '#E3ECFB';
  var MONO = 'IBM Plex Mono, monospace';
  var ALPHA = +opts.alpha || 0.5, GAMMA = +opts.gamma || 0.99, N = +opts.steps || 4, AXTOP = +opts.axis || 10;
  var k = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">chasing a target that is tied to your own estimate</span>' +
    '<span class="wspacer"></span><span class="wlabel">updates</span><span class="wnum" data-n>0</span></div>' +
    '<div class="wbody" style="align-items:center;padding:8px 14px 6px"><div data-c></div></div>';
  var W = 1060, H = 300, s = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(s);
  var uid = 'dt' + Math.floor(Math.random() * 1e9);

  /* w after i updates; phi(s1) = 1, so w <- w + alpha (gamma 2w - w) */
  var ws = [1];
  for (var i = 1; i <= N; i++) ws.push(ws[i - 1] + ALPHA * (GAMMA * 2 * ws[i - 1] - ws[i - 1]));

  function mono(x, y, text, attrs) {
    var a = { x: x, y: y, 'font-family': MONO, 'font-size': 9.5, fill: SLATE, text: text };
    for (var q in attrs) a[q] = attrs[q];
    return E('text', a, s);
  }
  function label(x, y, text) { return mono(x, y, text, { 'font-size': 8.5, 'letter-spacing': '.12em' }); }
  function fmt(v) { return v.toFixed(2); }

  /* ---------- left: the setup in three lines ---------- */
  function drawSetup() {
    var x = 24;
    label(x, 30, 'THE DATA');
    var cy = 58, r = 14, X1 = x + 16, X2 = x + 126;
    E('circle', { cx: X1, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.2 }, s);
    E('circle', { cx: X2, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.2 }, s);
    IE437.math(s, X1, cy + 5, 's_1', { 'text-anchor': 'middle', 'font-size': 14 });
    IE437.math(s, X2, cy + 5, 's_2', { 'text-anchor': 'middle', 'font-size': 14 });
    E('line', { x1: X1 + r + 3, y1: cy, x2: X2 - r - 4, y2: cy, stroke: INK, 'stroke-width': 1.3, 'marker-end': 'url(#' + uid + 'k)' }, s);
    mono((X1 + X2) / 2, cy - 7, 'reward 0', { 'text-anchor': 'middle' });
    mono(X2 + r + 12, cy + 4, 'so both true values are 0', { 'font-size': 10 });

    label(x, 112, 'ONE SHARED WEIGHT');
    IE437.math(s, x, 138, 'V(s_1) = w, \\quad V(s_2) = 2w', { 'font-size': 15 });

    label(x, 192, 'THE UPDATE, ONCE PER PRESS');
    IE437.math(s, x, 220, 'V(s_1)\\;\\leftarrow\\;V(s_1) + \\alpha\\,[\\,\\red{\\gamma V(s_2)} - V(s_1)\\,]', { 'font-size': 16 });
    mono(x, 244, 'the target in red is built from the estimate', { 'font-size': 10 });
    IE437.math(s, x, 272, '\\alpha = ' + ALPHA + '\\text{, }\\gamma = ' + GAMMA, { 'font-size': 12, fill: SLATE });
  }

  /* ---------- right: the chase ---------- */
  function drawChase() {
    var w = ws[k], p = k ? ws[k - 1] : null;
    var est = w, tgt = GAMMA * 2 * w, estP = p, tgtP = p === null ? null : GAMMA * 2 * p;
    var y0 = 246, top = 40, scale = (y0 - top) / AXTOP, ax = 500, bw = 88, C1 = 640, C2 = 880;
    function Y(v) { return y0 - Math.min(v, AXTOP) * scale; }
    [0, AXTOP / 2, AXTOP].forEach(function (t) {
      E('line', { x1: ax, x2: W - 20, y1: Y(t), y2: Y(t), stroke: 'currentColor', 'stroke-opacity': t ? .1 : .35 }, s);
      mono(ax - 6, Y(t) + 3.5, String(t), { 'text-anchor': 'end', 'font-size': 9, fill: 'currentColor', 'fill-opacity': .5 });
    });
    mono(ax + 4, y0 + 13, 'true value 0', { 'font-size': 8.5, 'letter-spacing': '.08em' });
    function bar(cx, v, pv, color, name, sub) {
      E('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: y0 - Y(v), fill: color, 'fill-opacity': .85 }, s);
      if (pv !== null) {                              /* what this press added: a light cap and a + number */
        E('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: Y(pv) - Y(v), fill: '#fff', 'fill-opacity': .45 }, s);
        mono(cx + bw / 2 + 8, (Y(v) + Y(pv)) / 2 + 4, '+' + fmt(v - pv), { fill: color, 'font-size': 11, 'font-weight': 700 });
      }
      mono(cx, Y(v) - 6, fmt(v), { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: INK });
      IE437.math(s, cx, y0 + 18, name, { 'text-anchor': 'middle', 'font-size': 13.5, fill: color });
      mono(cx, y0 + 33, sub, { 'text-anchor': 'middle', 'font-size': 9 });
    }
    bar(C1, est, estP, BLUE, 'V(s_1)', 'the estimate');
    bar(C2, tgt, tgtP, RED, '\\gamma V(s_2)', 'its target');
    /* the gap between them */
    var gx = (C1 + C2) / 2;
    E('line', { x1: C1 + bw / 2, x2: C2 - bw / 2, y1: Y(est), y2: Y(est), stroke: SLATE, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, s);
    E('line', { x1: gx, x2: gx, y1: Y(est), y2: Y(tgt), stroke: RED, 'stroke-width': 1.3, 'marker-end': 'url(#' + uid + 'r)' }, s);
    mono(gx, Y(tgt) - 8, 'gap ' + fmt(tgt - est), { 'text-anchor': 'middle', fill: RED, 'font-size': 11, 'font-weight': 700 });
    label(ax, 24, k === 0 ? 'PRESS → TO CHASE THE TARGET ONCE' : 'THE TARGET MOVED TWICE AS FAR — THE GAP GREW');
  }

  function draw() {
    while (s.firstChild) s.removeChild(s.firstChild);
    var d = E('defs', {}, s);
    [['k', INK], ['r', RED]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    drawSetup();
    drawChase();
    host.querySelector('[data-n]').textContent = String(k);
  }

  draw();
  return {
    steps: N,
    step: function (i) { k = Math.max(0, Math.min(N, i)); draw(); },
    reset: function () { k = 0; draw(); },
    finish: function () { k = N; draw(); }
  };
});
