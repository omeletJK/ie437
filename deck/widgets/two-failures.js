/* ============================================================
   widget: two-failures                             (Chapter 5, Act 2)
   A redrawing of the two figures the source deck places under
   "Problem 1" and "Problem 2" — not a simulation, because neither is
   an empirical claim: they are the two geometric facts the rest of
   the lecture is a response to.

   Left  (source part 1, p.22): the dataset pins the function down only
     inside its own support; off it a whole fan of continuations is
     equally consistent, and the fitted surrogate is simply whichever
     one the architecture prefers. The true value out there (the hollow
     mark) was never measured, and offline it never will be.
   Right (source part 1, p.24): the valid designs are a small region
     inside a large input space. Ascent started inside it leaves almost
     at once, and the returned designs are not designs at all.
   ============================================================ */
IE437.widget('two-failures', function (host, opts) {
  var E = IE437.el, INK = '#16181D', RED = '#D64545', GREEN = '#16A34A', SLATE = '#64748B';
  var W = 462, H = 288;

  host.innerHTML =
    '<div class="wbody" style="flex-direction:row;gap:24px;align-items:flex-start;justify-content:center;' +
    'padding:16px 18px 12px">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
    '<div data-a></div><div style="font:600 11px/1.4 var(--mono);letter-spacing:.06em;color:' + RED + '">' +
    'PROBLEM 1 &mdash; D DOES NOT DETERMINE f OFF D</div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' +
    '<div data-b></div><div style="font:600 11px/1.4 var(--mono);letter-spacing:.06em;color:' + RED + '">' +
    'PROBLEM 2 &mdash; AND ASCENT LEAVES THE VALID SET</div></div></div>';

  function cross(sv, x, y, r, col, w) {
    E('line', { x1: x - r, y1: y - r, x2: x + r, y2: y + r, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, sv);
    E('line', { x1: x - r, y1: y + r, x2: x + r, y2: y - r, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, sv);
  }

  /* ---------------- panel A — the fan of extrapolations ---------------- */
  var A = IE437.svg(W, H);
  host.querySelector('[data-a]').appendChild(A);
  (function () {
    var L = 22, Rr = 16, T = 16, B = 34, XB = 0.50;
    var px = function (t) { return L + t * (W - L - Rr); };
    var py = function (v) { return H - B - v * (H - T - B); };

    E('rect', { x: px(0), y: T, width: px(XB) - px(0), height: H - B - T, fill: SLATE, 'fill-opacity': .10 }, A);
    E('line', { x1: px(XB), y1: T, x2: px(XB), y2: H - B, stroke: INK, 'stroke-opacity': .4, 'stroke-dasharray': '4 3' }, A);
    E('line', { x1: px(0), y1: H - B, x2: px(1), y2: H - B, stroke: INK, 'stroke-opacity': .3 }, A);
    E('text', { x: px(XB / 2), y: H - 13, 'text-anchor': 'middle', 'font-size': 10,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .55, text: 'in distribution' }, A);
    E('text', { x: px((1 + XB) / 2), y: H - 13, 'text-anchor': 'middle', 'font-size': 10,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .35, text: 'out of distribution' }, A);
    E('text', { x: px(0.02), y: T + 11, 'font-size': 11, 'font-style': 'italic', fill: INK,
      'fill-opacity': .55, text: 'f' }, A);

    var g = function (t) { return 0.26 + 0.46 / (1 + Math.exp(-(t - 0.28) * 12)); };
    var pts = [], i, t;
    for (i = 0; i <= 120; i++) { t = XB * i / 120; pts.push(px(t).toFixed(1) + ' ' + py(g(t)).toFixed(1)); }
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2.5 }, A);
    [0.05, 0.16, 0.27, 0.38, 0.48].forEach(function (u) { cross(A, px(u), py(g(u)), 4.5, INK, 2.2); });

    var y0 = g(XB), slopes = [1.05, 0.66, 0.34, 0.06, -0.24, -0.56];
    slopes.forEach(function (s, k) {
      var q = [], j, u, x;
      for (j = 0; j <= 60; j++) {
        u = j / 60; x = XB + u * (0.965 - XB);
        q.push(px(x).toFixed(1) + ' ' + py(Math.max(0.03, Math.min(0.94, y0 + s * u * u * 0.62 + 0.07 * s * u))).toFixed(1));
      }
      E('path', { d: 'M' + q.join('L'), fill: 'none', stroke: SLATE, 'stroke-width': k === 1 ? 2.1 : 1.5,
        'stroke-dasharray': '5 4', 'stroke-opacity': k === 1 ? .9 : .45 }, A);
    });

    E('circle', { cx: px(0.79), cy: py(0.40), r: 5.5, fill: 'none', stroke: INK, 'stroke-width': 2.2 }, A);
    E('text', { x: px(0.79), y: py(0.40) + 19, 'text-anchor': 'middle', 'font-size': 10, fill: INK,
      'fill-opacity': .62, 'font-family': 'IBM Plex Mono, monospace', text: 'the truth out here' }, A);
    E('text', { x: px(0.99), y: py(0.09), 'text-anchor': 'end', 'font-size': 10.5, fill: SLATE,
      'font-weight': 700, text: 'every one of these fits D' }, A);
  })();

  /* ---------------- panel B — the valid manifold ---------------- */
  var B2 = IE437.svg(W, H);
  host.querySelector('[data-b]').appendChild(B2);
  (function () {
    var cx = 146, cy = 142, Rout = 122, vx = 124, vy = 100, Rin = 52;
    E('circle', { cx: cx, cy: cy, r: Rout, fill: SLATE, 'fill-opacity': .10, stroke: INK,
      'stroke-opacity': .25, 'stroke-width': 1.2 }, B2);
    E('circle', { cx: vx, cy: vy, r: Rin, fill: GREEN, 'fill-opacity': .16, stroke: GREEN, 'stroke-width': 1.8 }, B2);
    [[-27, -25], [-5, -32], [17, -20], [-30, 5], [5, 3], [30, 10], [-12, 22], [15, 27]]
      .forEach(function (d) { cross(B2, vx + d[0], vy + d[1], 4, INK, 2); });

    var sx = vx - 17, sy = vy + Rin - 6;
    [[-86, 96, -116, 42], [-19, 130, -70, 92], [37, 122, 8, 76]].forEach(function (e) {
      var ex = vx + e[0], ey = vy + e[1], qx = vx + e[2], qy = vy + e[3];
      E('path', { d: 'M' + sx + ' ' + sy + 'Q' + qx + ' ' + qy + ' ' + ex + ' ' + ey,
        fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-opacity': .85 }, B2);
      cross(B2, ex, ey, 5, RED, 2.6);
    });
    E('circle', { cx: sx, cy: sy, r: 5, fill: '#FAFAF8', stroke: INK, 'stroke-width': 2.2 }, B2);

    var LX = 300;
    [['valid designs', GREEN, 'sw'], ['every input', SLATE, 'sw'], ['the dataset D', INK, 'x'],
     ['ascent starts here', INK, 'o'], ['and ends here', RED, 'x']].forEach(function (r, i) {
      var y = 44 + i * 26;
      if (r[2] === 'sw') E('rect', { x: LX, y: y - 9, width: 14, height: 14, rx: 2, fill: r[1],
        'fill-opacity': r[1] === GREEN ? .3 : .18, stroke: r[1], 'stroke-opacity': .85 }, B2);
      else if (r[2] === 'o') E('circle', { cx: LX + 7, cy: y - 2, r: 5, fill: 'none', stroke: r[1],
        'stroke-width': 2.2 }, B2);
      else cross(B2, LX + 7, y - 2, 4.5, r[1], 2.2);
      E('text', { x: LX + 23, y: y + 2, 'font-size': 10.5, fill: INK, 'fill-opacity': .72, text: r[0] }, B2);
    });
    ['A molecule plus one', 'gradient step is', 'usually not a molecule.'].forEach(function (s, i) {
      E('text', { x: LX, y: 196 + i * 16, 'font-size': 10.5, 'font-style': 'italic', fill: INK,
        'fill-opacity': .5, text: s }, B2);
    });
  })();

  return { finish: function () { } };
});
