/* ============================================================
   widget: two-failures                             (Chapter 5, Act 2)
   A redrawing of the two figures the source deck puts under
   "Problem 1" and "Problem 2" — not a simulation, because neither is
   an empirical claim: they are the two geometric facts the rest of
   the lecture is a response to.

   Left  (source part 1, p.22): the dataset pins the function down
     only inside its own support; off it, a whole fan of continuations
     is equally consistent, and the surrogate is simply whichever one
     the architecture prefers. The true value out there (hollow mark)
     was never measured.
   Right (source part 1, p.24): the valid designs are a small region
     inside a large input space. Ascent started inside it leaves almost
     at once, and the returned designs are not designs at all.
   ============================================================ */
IE437.widget('two-failures', function (host, opts) {
  var E = IE437.el, INK = '#16181D', RED = '#D64545', GREEN = '#16A34A', SLATE = '#64748B';
  var W = 462, H = 290;

  host.innerHTML =
    '<div class="wbody" style="flex-direction:row;gap:26px;align-items:flex-start;justify-content:center;' +
    'padding:16px 18px 12px">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:7px">' +
    '<div data-a></div><div style="font:600 11px/1.4 var(--mono);letter-spacing:.06em;color:' + RED + '">' +
    'PROBLEM 1 &mdash; THE DATA DOES NOT DETERMINE f OFF THE DATA</div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:7px">' +
    '<div data-b></div><div style="font:600 11px/1.4 var(--mono);letter-spacing:.06em;color:' + RED + '">' +
    'PROBLEM 2 &mdash; AND ASCENT LEAVES THE VALID SET</div></div></div>';

  function cross(sv, x, y, r, col, w, hollow) {
    if (hollow) {
      E('circle', { cx: x, cy: y, r: r + 1.5, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-opacity': .85 }, sv);
      return;
    }
    E('line', { x1: x - r, y1: y - r, x2: x + r, y2: y + r, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, sv);
    E('line', { x1: x - r, y1: y + r, x2: x + r, y2: y - r, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, sv);
  }

  /* ---------------- panel A — the fan of extrapolations ---------------- */
  var A = IE437.svg(W, H);
  host.querySelector('[data-a]').appendChild(A);
  (function () {
    var L = 20, Rr = 12, T = 14, B = 30, XB = 0.52;         /* data occupies the left 52% */
    var px = function (t) { return L + t * (W - L - Rr); };
    var py = function (v) { return H - B - v * (H - T - B); };
    E('rect', { x: px(0), y: T, width: px(XB) - px(0), height: H - B - T, fill: SLATE, 'fill-opacity': .10 }, A);
    E('line', { x1: px(XB), y1: T, x2: px(XB), y2: H - B, stroke: INK, 'stroke-opacity': .4, 'stroke-dasharray': '4 3' }, A);
    E('line', { x1: px(0), y1: H - B, x2: px(1), y2: H - B, stroke: INK, 'stroke-opacity': .3 }, A);
    E('text', { x: px(XB / 2), y: H - 12, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .55, text: 'in distribution' }, A);
    E('text', { x: px((1 + XB) / 2), y: H - 12, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .35, text: 'out of distribution' }, A);

    /* the measured part of f: a smooth rise across the data band */
    var g = function (t) { return 0.24 + 0.50 / (1 + Math.exp(-(t - 0.30) * 11)); };
    var pts = [], i;
    for (i = 0; i <= 120; i++) { var t = XB * i / 120; pts.push(px(t).toFixed(1) + ' ' + py(g(t)).toFixed(1)); }
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2.4 }, A);
    [0.06, 0.19, 0.31, 0.42, 0.50].forEach(function (t) { cross(A, px(t), py(g(t)), 4, INK, 2); });

    /* every continuation that fits it equally well */
    var y0 = g(XB), slopes = [1.25, 0.80, 0.42, 0.10, -0.22, -0.62];
    slopes.forEach(function (s, k) {
      var q = [], j;
      for (j = 0; j <= 60; j++) {
        var u = j / 60, t = XB + u * (1 - XB);
        q.push(px(t).toFixed(1) + ' ' + py(Math.max(0.01, Math.min(0.97, y0 + s * u * u * 0.62 + 0.06 * s * u))).toFixed(1));
      }
      E('path', { d: 'M' + q.join('L'), fill: 'none', stroke: SLATE, 'stroke-width': k === 1 ? 2 : 1.4,
        'stroke-dasharray': '5 4', 'stroke-opacity': k === 1 ? .85 : .42 }, A);
    });
    cross(A, px(0.80), py(0.42), 4.5, INK, 2.2, true);
    E('text', { x: px(0.80) + 9, y: py(0.42) + 4, 'font-size': 9, fill: INK, 'fill-opacity': .6,
      'font-family': 'IBM Plex Mono, monospace', text: 'the truth here' }, A);
    E('text', { x: px(0.99), y: py(0.93), 'text-anchor': 'end', 'font-size': 9.5, fill: SLATE,
      'font-weight': 700, text: 'all equally consistent with D' }, A);
    E('text', { x: px(0.02), y: T + 10, 'font-size': 9.5, 'font-style': 'italic', fill: INK,
      'fill-opacity': .55, text: 'f' }, A);
  })();

  /* ---------------- panel B — the valid manifold ---------------- */
  var B2 = IE437.svg(W, H);
  host.querySelector('[data-b]').appendChild(B2);
  (function () {
    var cx = 138, cy = 116, Rout = 100, vx = 118, vy = 82, Rin = 42;
    E('circle', { cx: cx, cy: cy, r: Rout, fill: SLATE, 'fill-opacity': .10, stroke: INK,
      'stroke-opacity': .25, 'stroke-width': 1.2 }, B2);
    E('circle', { cx: vx, cy: vy, r: Rin, fill: GREEN, 'fill-opacity': .16, stroke: GREEN, 'stroke-width': 1.6 }, B2);
    [[-22, -20], [-4, -26], [14, -16], [-24, 4], [4, 2], [24, 8], [-10, 18], [12, 22]]
      .forEach(function (d) { cross(B2, vx + d[0], vy + d[1], 3.4, INK, 1.9); });

    var sx = vx - 14, sy = vy + Rin - 5;
    E('circle', { cx: sx, cy: sy, r: 4.2, fill: 'none', stroke: INK, 'stroke-width': 2 }, B2);
    E('text', { x: sx - 8, y: sy + 13, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .6,
      'font-family': 'IBM Plex Mono, monospace', text: 'start' }, B2);

    [[-72, 78, -96, 34], [-16, 106, -58, 74], [30, 100, 6, 62]].forEach(function (e) {
      var ex = vx + e[0], ey = vy + e[1], qx = vx + e[2], qy = vy + e[3];
      E('path', { d: 'M' + sx + ' ' + sy + 'Q' + qx + ' ' + qy + ' ' + ex + ' ' + ey,
        fill: 'none', stroke: RED, 'stroke-width': 1.9, 'stroke-opacity': .85 }, B2);
      cross(B2, ex, ey, 4.2, RED, 2.3);
    });

    var LX = 258;
    [['valid designs', GREEN, 0], ['every input', SLATE, 1], ['the dataset D', INK, 2],
     ['where ascent ends', RED, 3]].forEach(function (r, i) {
      var y = 60 + i * 26;
      if (r[2] === 0 || r[2] === 1) E('rect', { x: LX, y: y - 8, width: 13, height: 13, rx: 2,
        fill: r[1], 'fill-opacity': r[2] === 0 ? .3 : .18, stroke: r[1], 'stroke-opacity': .8 }, B2);
      else cross(B2, LX + 6.5, y - 1.5, 4, r[1], 2.1);
      E('text', { x: LX + 21, y: y + 2.5, 'font-size': 10, fill: INK, 'fill-opacity': .72, text: r[0] }, B2);
    });
    E('text', { x: LX, y: 176, 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .5, text: 'A molecule' }, B2);
    E('text', { x: LX, y: 190, 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .5, text: 'plus a gradient' }, B2);
    E('text', { x: LX, y: 204, 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .5, text: 'step is usually' }, B2);
    E('text', { x: LX, y: 218, 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .5, text: 'not a molecule.' }, B2);
  })();

  return { finish: function () { } };
});
