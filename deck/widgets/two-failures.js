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
   Right (source part 1, p.24, redrawn): only when designs must satisfy
     a constraint. The valid designs are a thin curve in a large input
     space; ascent from a data point leaves it at once. Two marks separate
     the problems: a point right next to the data can already be off the
     curve (near D, invalid), and a point far from the data can still be
     on it (out of distribution, valid). OOD and invalid are independent.
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
    'PROBLEM 2 &mdash; WITH A CONSTRAINT: ASCENT LEAVES THE VALID SET</div></div></div>';

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

  /* ---------------- panel B — the valid set, a thin curve ---------------- */
  var B2 = IE437.svg(W, H);
  host.querySelector('[data-b]').appendChild(B2);
  (function () {
    var X0 = 18, X1 = 282, Y0 = 18, Y1 = 270;
    E('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, rx: 10, fill: SLATE, 'fill-opacity': .10, stroke: INK,
      'stroke-opacity': .25, 'stroke-width': 1.2 }, B2);
    /* the valid designs: a thin band along a curve */
    var cy = function (x) { return 150 - 58 * Math.sin((x - 30) / 236 * 5.2); };
    var pts = [], x;
    for (x = 30; x <= 270; x += 3) pts.push(x.toFixed(1) + ' ' + cy(x).toFixed(1));
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: GREEN, 'stroke-width': 12, 'stroke-opacity': .22, 'stroke-linecap': 'round' }, B2);
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: GREEN, 'stroke-width': 1.6, 'stroke-opacity': .8 }, B2);
    /* the data: on one stretch of the curve */
    [44, 60, 76, 92, 108, 124, 140].forEach(function (u) { cross(B2, u, cy(u), 4, INK, 2); });
    /* ascent from a data point leaves the curve at once */
    var sx = 124, sy = cy(124);
    E('path', { d: 'M' + sx + ' ' + sy + 'Q' + 150 + ' ' + 150 + ' ' + 170 + ' ' + 232, fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-opacity': .85 }, B2);
    cross(B2, 170, 232, 5, RED, 2.6);
    E('circle', { cx: sx, cy: sy, r: 5, fill: '#FAFAF8', stroke: INK, 'stroke-width': 2.2 }, B2);
    /* next to the data, but off the curve */
    var nx = 84, ny = cy(84) + 22;
    E('circle', { cx: nx, cy: ny, r: 5.5, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, B2);
    /* far from the data, but on the curve */
    var fx = 250, fy = cy(250);
    E('circle', { cx: fx, cy: fy, r: 5.5, fill: 'none', stroke: GREEN, 'stroke-width': 2.4 }, B2);

    var LX = 300;
    [['valid designs', GREEN, 'band'], ['every input', SLATE, 'sw'], ['the dataset D', INK, 'x'],
     ['ascent starts here', INK, 'o'], ['and ends here', RED, 'x'],
     ['next to D, not a design', RED, 'ring'], ['far from D, a design', GREEN, 'ring']].forEach(function (r, i) {
      var y = 34 + i * 24;
      if (r[2] === 'band') { E('line', { x1: LX, x2: LX + 14, y1: y - 2, y2: y - 2, stroke: GREEN, 'stroke-width': 8, 'stroke-opacity': .3 }, B2);
        E('line', { x1: LX, x2: LX + 14, y1: y - 2, y2: y - 2, stroke: GREEN, 'stroke-width': 1.4 }, B2); }
      else if (r[2] === 'sw') E('rect', { x: LX, y: y - 9, width: 14, height: 14, rx: 2, fill: r[1],
        'fill-opacity': .18, stroke: r[1], 'stroke-opacity': .85 }, B2);
      else if (r[2] === 'o' || r[2] === 'ring') E('circle', { cx: LX + 7, cy: y - 2, r: 5, fill: 'none', stroke: r[1],
        'stroke-width': 2.2 }, B2);
      else cross(B2, LX + 7, y - 2, 4.5, r[1], 2.2);
      E('text', { x: LX + 23, y: y + 2, 'font-size': 10.5, fill: INK, 'fill-opacity': .72, text: r[0] }, B2);
    });
    ['Only when designs must', 'satisfy a constraint.', 'A molecule plus one', 'gradient step is', 'usually not a molecule.'].forEach(function (t, i) {
      E('text', { x: LX, y: 214 + i * 15 + (i >= 2 ? 6 : 0), 'font-size': 10.5, 'font-style': 'italic', fill: INK,
        'fill-opacity': i < 2 ? .75 : .5, 'font-weight': i < 2 ? 700 : 400, text: t }, B2);
    });
  })();

  return { finish: function () { } };
});
