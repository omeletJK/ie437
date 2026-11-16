/* ============================================================
   widget: deadly-triad                                 (Chapter 8)
   Tsitsiklis & Van Roy's two-state example, drawn as a chase.
   One transition s1 -> s2 with reward 0 is all the data, so both
   true values are 0. The same TD(0) update,
       V(s1) <- V(s1) + alpha [ gamma V(s2) - V(s1) ],
   is applied once per press, with V stored two ways side by side:
     left   a table: V(s2) is its own cell and is never touched, so
            the target gamma V(s2) stays at 0 and V(s1) halves each
            press (alpha = 0.5): 1, .5, .25, .125, .0625.
     right  one shared weight, V(s1) = w and V(s2) = 2w: raising w
            to chase the target raises the target twice as much, so
            w grows by 1 + alpha (2 gamma - 1) = 1.495 per press:
            1, 1.50, 2.24, 3.34, 5.00; V(s2) ends at 9.99.
   Each bar shows what the last press added (a light cap) or took
   away (a dashed outline); the red line is the target and the red
   bracket the gap to it. The three legs of the triad are the three
   red labels on the picture. Steps: 4 presses = 4 updates.
   Options: alpha (0.5), gamma (0.99), steps (4), axis (10).
   ============================================================ */
IE437.widget('deadly-triad', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B', LBLUE = '#E3ECFB';
  var MONO = 'IBM Plex Mono, monospace';
  var ALPHA = +opts.alpha || 0.5, GAMMA = +opts.gamma || 0.99, N = +opts.steps || 4, AXTOP = +opts.axis || 10;
  var k = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">one transition, reward 0 &mdash; the same update, V stored two ways</span>' +
    '<span class="wspacer"></span><span class="wlabel">updates</span><span class="wnum" data-n>0</span></div>' +
    '<div class="wbody" style="align-items:center;padding:8px 14px 6px"><div data-c></div></div>';
  var W = 1060, H = 336, s = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(s);
  var uid = 'dt' + Math.floor(Math.random() * 1e9);

  /* both runs precomputed: table[i] = [V(s1), V(s2)], shared[i] = [w, 2w] after i updates */
  var table = [[1, 0]], shared = [[1, 2]];
  for (var i = 1; i <= N; i++) {
    var t = table[i - 1];
    table.push([t[0] + ALPHA * (GAMMA * t[1] - t[0]), t[1]]);
    var w = shared[i - 1][0];
    w = w + ALPHA * (GAMMA * 2 * w - w);                 /* phi(s1) = 1 */
    shared.push([w, 2 * w]);
  }

  function mono(x, y, text, attrs) {
    var a = { x: x, y: y, 'font-family': MONO, 'font-size': 9.5, fill: SLATE, text: text };
    for (var q in attrs) a[q] = attrs[q];
    return E('text', a, s);
  }
  function tag(x, y, text, anchor) {              /* a leg of the triad: red, small caps */
    return mono(x, y, text, { fill: RED, 'font-size': 8.5, 'font-weight': 700, 'letter-spacing': '.1em', 'text-anchor': anchor || 'start' });
  }
  function arrow(x1, y1, x2, y2, c, key, wd) {
    E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': wd || 1.4, 'marker-end': 'url(#' + uid + key + ')' }, s);
  }
  function fmt(v) { return v === 0 ? '0' : v < 0.1 ? v.toFixed(3) : v.toFixed(2); }

  /* ---------- the top strip: the data and the update, shared by both panels ---------- */
  function drawTop() {
    var cy = 36, r = 16, X1 = 78, X2 = 218;
    E('circle', { cx: X1, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, s);
    E('circle', { cx: X2, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, s);
    IE437.math(s, X1, cy + 5, 's_1', { 'text-anchor': 'middle', 'font-size': 15 });
    IE437.math(s, X2, cy + 5, 's_2', { 'text-anchor': 'middle', 'font-size': 15 });
    arrow(X1 + r + 3, cy, X2 - r - 4, cy, INK, 'k');
    mono((X1 + X2) / 2, cy - 8, 'reward 0', { 'text-anchor': 'middle' });
    mono(X1 - r, 68, 'THE ONLY TRANSITION IN THE DATA', { 'font-size': 8.5, 'letter-spacing': '.1em' });
    tag(X2 + r + 10, cy - 2, 'OFF-POLICY');
    mono(X2 + r + 10, cy + 10, 's₂ itself is never updated', { 'font-size': 9 });

    mono(470, 20, 'TD(0) UPDATE, ACT 1 — APPLIED ONCE PER PRESS', { 'font-size': 8.5, 'letter-spacing': '.1em' });
    IE437.math(s, 470, 46, 'V(s_1)\\;\\leftarrow\\;V(s_1) + \\alpha\\,[\\,\\red{\\gamma V(s_2)} - V(s_1)\\,]', { 'font-size': 17 });
    tag(470, 66, 'BOOTSTRAPPING');
    mono(576, 66, 'the target in red is built from the estimate V(s₂)', { 'font-size': 9 });
    IE437.math(s, W - 8, 46, '\\alpha = ' + ALPHA + '\\text{, }\\gamma = ' + GAMMA, { 'font-size': 12, 'text-anchor': 'end', fill: SLATE });
    mono(W - 8, 20, 'EVERY REWARD 0, SO BOTH TRUE VALUES ARE 0', { 'font-size': 8.5, 'letter-spacing': '.1em', 'text-anchor': 'end' });
  }

  /* ---------- one panel: how V is stored, then the two bars and the target ---------- */
  function drawPanel(px, fa, run) {
    var PY = 84, PW = 512, PH = H - PY - 4, cur = run[k], prev = k ? run[k - 1] : null;
    E('rect', { x: px, y: PY, width: PW, height: PH, rx: 3, fill: 'none', stroke: 'currentColor', 'stroke-opacity': .18 }, s);
    mono(px + 14, PY + 19, fa ? 'ONE SHARED WEIGHT' : 'A TABLE', { fill: INK, 'font-size': 10, 'font-weight': 700, 'letter-spacing': '.12em' });
    mono(px + 14 + (fa ? 142 : 66), PY + 19, fa ? '— V(s₁) = w, V(s₂) = 2w' : '— V(s₁) and V(s₂) are separate cells', { 'font-size': 10 });

    /* storage glyph */
    var gx = px + 24, gy = PY + 40;
    if (fa) {
      E('rect', { x: gx + 44, y: gy, width: 44, height: 24, rx: 3, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.2 }, s);
      IE437.math(s, gx + 66, gy + 17, 'w', { 'text-anchor': 'middle', 'font-size': 15, fill: BLUE });
      arrow(gx + 56, gy + 26, gx + 26, gy + 52, BLUE, 'b', 1.1);
      arrow(gx + 76, gy + 26, gx + 106, gy + 52, BLUE, 'b', 1.1);
      IE437.math(s, gx + 20, gy + 70, 'V(s_1) = 1\\cdot w', { 'text-anchor': 'middle', 'font-size': 11.5 });
      IE437.math(s, gx + 112, gy + 70, 'V(s_2) = 2\\cdot w', { 'text-anchor': 'middle', 'font-size': 11.5 });
      tag(gx + 66, gy + 90, 'FUNCTION APPROXIMATION', 'middle');
      mono(gx + 66, gy + 103, 'one update moves both states', { 'text-anchor': 'middle', 'font-size': 9 });
    } else {
      [['V(s_1)', 0], ['V(s_2)', 1]].forEach(function (c) {
        E('rect', { x: gx + 2 + c[1] * 70, y: gy + 18, width: 60, height: 24, rx: 3, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.2 }, s);
        IE437.math(s, gx + 32 + c[1] * 70, gy + 35, c[0], { 'text-anchor': 'middle', 'font-size': 12.5, fill: BLUE });
      });
      mono(gx + 66, gy + 70, 'TWO CELLS', { 'text-anchor': 'middle', 'font-size': 8.5, 'letter-spacing': '.1em', fill: BLUE, 'font-weight': 700 });
      mono(gx + 66, gy + 84, 'one update moves one cell', { 'text-anchor': 'middle', 'font-size': 9 });
    }

    /* the gap and the verdict, under the glyph */
    var tgt = GAMMA * cur[1], gap = Math.abs(tgt - cur[0]);
    mono(gx + 66, PY + 172, 'GAP TO THE TARGET', { 'text-anchor': 'middle', 'font-size': 8.5, 'letter-spacing': '.1em' });
    mono(gx + 66, PY + 194, fmt(gap), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: INK });
    if (k >= 1) {
      var grow = gap > Math.abs(GAMMA * prev[1] - prev[0]) + 1e-9;
      mono(gx + 66, PY + 212, grow ? 'growing — runs away' : 'shrinking — settles at 0',
        { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: grow ? RED : BLUE });
    } else {
      mono(gx + 66, PY + 212, 'press → for one update', { 'text-anchor': 'middle', 'font-size': 10 });
    }

    /* bars */
    var y0 = PY + 214, top = PY + 44, scale = (y0 - top) / AXTOP, ax = px + 196, bw = 56;
    var C1 = px + 272, C2 = px + 428;
    function Y(v) { return y0 - Math.min(v, AXTOP) * scale; }
    [0, AXTOP / 2, AXTOP].forEach(function (t) {
      E('line', { x1: ax, x2: px + PW - 14, y1: Y(t), y2: Y(t), stroke: 'currentColor', 'stroke-opacity': t ? .1 : .35 }, s);
      mono(ax - 6, Y(t) + 3.5, String(t), { 'text-anchor': 'end', 'font-size': 9, fill: 'currentColor', 'fill-opacity': .5 });
    });
    function bar(cx, v, p, color, label) {
      if (v > 0) E('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: y0 - Y(v), fill: color, 'fill-opacity': .85 }, s);
      if (p !== null && v > p + 1e-9)                 /* what this press added: a light cap */
        E('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: Y(p) - Y(v), fill: '#fff', 'fill-opacity': .45 }, s);
      if (p !== null && v < p - 1e-9)                 /* what this press took away: a dashed outline */
        E('rect', { x: cx - bw / 2, y: Y(p), width: bw, height: Y(v) - Y(p), fill: 'none', stroke: color, 'stroke-width': 1, 'stroke-dasharray': '3 2' }, s);
      var ty = Y(p === null ? v : Math.max(v, p)) - 5;
      mono(cx, ty, fmt(v), { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: INK });
      IE437.math(s, cx, y0 + 17, label, { 'text-anchor': 'middle', 'font-size': 13 });
    }
    bar(C1, cur[0], prev && prev[0], BLUE, 'V(s_1)');
    bar(C2, cur[1], prev && prev[1], SLATE, 'V(s_2)');
    /* the target: read off V(s2), carried across to the V(s1) column */
    E('line', { x1: C1 - bw / 2 - 8, x2: C2 + bw / 2, y1: Y(tgt), y2: Y(tgt), stroke: RED, 'stroke-width': 1.1, 'stroke-dasharray': '4 3' }, s);
    E('line', { x1: C1 - bw / 2 - 8, x2: C1 + bw / 2 + 8, y1: Y(tgt), y2: Y(tgt), stroke: RED, 'stroke-width': 2.2 }, s);
    IE437.math(s, (C1 + C2) / 2, Y(tgt) - 5, '\\text{target } \\gamma V(s_2) = ' + fmt(tgt), { 'text-anchor': 'middle', 'font-size': 11, fill: RED });
    /* the gap: a bracket beside the V(s1) bar */
    if (Math.abs(Y(tgt) - Y(cur[0])) > 4) {
      var bx = C1 - bw / 2 - 14, ya = Y(cur[0]), yb = Y(tgt);
      E('line', { x1: bx, x2: bx, y1: ya, y2: yb, stroke: RED, 'stroke-width': 1.2 }, s);
      E('line', { x1: bx - 3, x2: bx + 3, y1: ya, y2: ya, stroke: RED, 'stroke-width': 1.2 }, s);
      E('line', { x1: bx - 3, x2: bx + 3, y1: yb, y2: yb, stroke: RED, 'stroke-width': 1.2 }, s);
      mono(bx - 6, (ya + yb) / 2 + 3.5, 'gap', { 'text-anchor': 'end', fill: RED, 'font-weight': 700 });
    }
  }

  function draw() {
    while (s.firstChild) s.removeChild(s.firstChild);
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    drawTop();
    drawPanel(12, false, table);
    drawPanel(536, true, shared);
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
