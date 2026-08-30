/* ============================================================
   widget: convex-set
   Redrawn from the source deck: a set is convex when the segment
   joining any two of its points stays inside it. Both shapes are
   generated from a radial function, and the segment is sampled
   against that function — so the red stretch is genuinely outside
   the set, not merely drawn to look that way.
   ============================================================ */
IE437.widget('convex-set', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', RED = '#D64545', BLUE = '#2563EB';
  var W = 680, H = 268;

  /* r(theta) for each shape; the second has three deep notches */
  var SHAPES = [
    { c: [168, 116], r: function (t) { return 84 + 6 * Math.sin(2 * t + 0.6); },
      label: 'convex', note: 'every chord stays inside', at: [Math.PI * 0.80, Math.PI * 0.06], f: 0.68 },
    { c: [508, 116], r: function (t) { return 76 + 32 * Math.cos(3 * t); },
      label: 'not convex', note: 'this chord leaves the set', at: [Math.PI * 2 / 3, 0], f: 0.90 }
  ];

  host.innerHTML = '<div class="wbody" style="align-items:center;padding-top:14px"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  SHAPES.forEach(function (s) {
    var pt = function (t, f) { return [s.c[0] + Math.cos(t) * s.r(t) * f, s.c[1] - Math.sin(t) * s.r(t) * f]; };
    var inside = function (p) {
      var dx = p[0] - s.c[0], dy = s.c[1] - p[1];
      var t = Math.atan2(dy, dx);
      return Math.hypot(dx, dy) <= s.r(t) + 0.001;
    };

    /* the boundary */
    var d = '';
    for (var i = 0; i <= 240; i++) {
      var t = i / 240 * Math.PI * 2, p = pt(t, 1);
      d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    E('path', { d: d + 'Z', fill: '#E7E7E1', stroke: INK, 'stroke-width': 1.6,
      'stroke-linejoin': 'round' }, sv);

    /* two points, and the segment between them, sampled against the set */
    var a = pt(s.at[0], s.f), b = pt(s.at[1], s.f);
    var N = 200, run = null, anyOut = false;
    for (var k = 0; k <= N; k++) {
      var u = k / N, q = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      var ok = inside(q);
      if (!ok) anyOut = true;
      if (run === null || run.ok !== ok) {
        if (run) E('line', { x1: run.x1, y1: run.y1, x2: q[0], y2: q[1],
          stroke: run.ok ? INK : RED, 'stroke-width': run.ok ? 2 : 3.2, 'stroke-linecap': 'round' }, sv);
        run = { ok: ok, x1: q[0], y1: q[1] };
      }
    }
    E('line', { x1: run.x1, y1: run.y1, x2: b[0], y2: b[1], stroke: run.ok ? INK : RED,
      'stroke-width': run.ok ? 2 : 3.2, 'stroke-linecap': 'round' }, sv);

    [[a, 'x'], [b, 'y']].forEach(function (m) {
      E('circle', { cx: m[0][0], cy: m[0][1], r: 4, fill: INK }, sv);
      E('text', { x: m[0][0] + (m[1] === 'x' ? -12 : 12), y: m[0][1] + (m[1] === 'x' ? 16 : -8),
        'text-anchor': m[1] === 'x' ? 'end' : 'start', 'font-size': 15, 'font-style': 'italic',
        fill: INK, text: m[1] }, sv);
    });

    E('text', { x: s.c[0], y: 236, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700,
      fill: anyOut ? RED : BLUE, text: s.label }, sv);
    E('text', { x: s.c[0], y: 254, 'text-anchor': 'middle', 'font-size': 12, fill: INK,
      'fill-opacity': .55, text: s.note }, sv);
  });

  return {};
});
