/* ============================================================
   widget: kkt-point
   The first-order condition, made draggable.  Minimise
   f(x) = ||x - c||^2 over a convex polygon.  Drag the point and read
   the test directly:  is there a feasible y with grad f . (y - x) < 0?
   If yes the arrow shows it; if no, the gradient supports the set and
   the point is optimal — which is exactly the KKT certificate.
   ============================================================ */
IE437.widget('kkt-point', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706';
  var POLY = [[2.1, 1.3], [7.7, 0.9], [9.1, 5.1], [5.3, 8.7], [1.3, 5.6]];
  var C = [9.6, 8.9];                       // the unconstrained minimiser, outside the set
  var W = 430, H = 330, PAD = 26, DOM = [0, 10.4];
  var pt = [4.2, 3.0];

  // Equal units on both axes keep Euclidean contours circular and normals perpendicular.
  var SCALE = Math.min(W - 2 * PAD, H - 2 * PAD) / (DOM[1] - DOM[0]);
  var MID = (DOM[0] + DOM[1]) / 2;
  var SX = function (v) { return W / 2 + (v - MID) * SCALE; };
  var SY = function (v) { return H / 2 - (v - MID) * SCALE; };
  var IX = function (px) { return MID + (px - W / 2) / SCALE; };
  var IY = function (py) { return MID - (py - H / 2) / SCALE; };

  var grad = function (p) { return [2 * (p[0] - C[0]), 2 * (p[1] - C[1])]; };

  function inside(p) {
    for (var i = 0; i < POLY.length; i++) {
      var a = POLY[i], b = POLY[(i + 1) % POLY.length];
      if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) < 0) return false;
    }
    return true;
  }
  function project(p) {
    if (inside(p)) return p;
    var best = null, bd = Infinity;
    for (var i = 0; i < POLY.length; i++) {
      var a = POLY[i], b = POLY[(i + 1) % POLY.length];
      var vx = b[0] - a[0], vy = b[1] - a[1];
      var t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy)));
      var q = [a[0] + t * vx, a[1] + t * vy];
      var d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  }
  /* min over the polygon of  grad.(y - x)  — linear, so it is attained at a vertex */
  function worst(p) {
    var g = grad(p), best = null, bv = Infinity;
    POLY.forEach(function (v) {
      var s = g[0] * (v[0] - p[0]) + g[1] * (v[1] - p[1]);
      if (s < bv) { bv = s; best = v; }
    });
    return { v: best, s: bv };
  }
  var OPT = project(C);

  host.innerHTML =
    '<div class="wbar"><span class="wt">Drag the point &mdash; is any feasible direction downhill?</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-snap>snap to optimum</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;max-width:430px;display:flex;flex-direction:column;gap:12px">' +
    '<div data-verdict style="padding:11px 14px;text-align:center;' +
    'font:700 13px/1.4 var(--mono);letter-spacing:.05em"></div>' +
    '<div data-num style="font:400 12.5px/1.9 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 12px/1.6 var(--sans);color:var(--ink3);border-top:1px solid rgba(22,24,29,.075);padding-top:11px">' +
    'The point c is the best choice without constraints, but it is outside the polygon. ' +
    'Click “snap to optimum”: the best allowed point lies on the boundary. ' +
    'There, &minus;&nabla;f points outside and every feasible direction has a non-negative initial slope. ' +
    'The next example explains how a boundary can balance a nonzero gradient.</div></div></div>';

  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var g = grad(pt), gl = Math.hypot(g[0], g[1]);
    var w = worst(pt), optimal = w.s > -1e-3;

    /* level sets of f, centred on c */
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (k) {
      E('circle', { cx: SX(C[0]), cy: SY(C[1]), r: (SX(k) - SX(0)), fill: 'none',
        stroke: INK, 'stroke-opacity': .09, 'stroke-width': 1 }, sv);
    });
    var rr = Math.hypot(pt[0] - C[0], pt[1] - C[1]);
    E('circle', { cx: SX(C[0]), cy: SY(C[1]), r: rr * SCALE, fill: 'none', 'data-role': 'current-contour',
      stroke: INK, 'stroke-opacity': .32, 'stroke-width': 1.3, 'stroke-dasharray': '4 4' }, sv);

    /* feasible set */
    E('path', {
      d: POLY.map(function (p, i) { return (i ? 'L' : 'M') + SX(p[0]) + ' ' + SY(p[1]); }).join('') + 'Z',
      fill: '#E7E7E1', 'fill-opacity': .85, stroke: INK, 'stroke-width': 1.4
    }, sv);
    E('text', { x: SX(4.4), y: SY(3.9), 'text-anchor': 'middle', 'font-size': 10,
      'letter-spacing': 1.4, fill: INK, 'fill-opacity': .34,
      'font-family': 'IBM Plex Mono, monospace', text: 'FEASIBLE' }, sv);

    /* c and the optimum */
    E('circle', { cx: SX(C[0]), cy: SY(C[1]), r: 4, fill: 'none', stroke: INK, 'data-role': 'unconstrained-centre',
      'stroke-opacity': .5, 'stroke-width': 1.4 }, sv);
    E('text', { x: SX(C[0]) - 8, y: SY(C[1]) - 8, 'text-anchor': 'end', 'font-size': 11,
      fill: INK, 'fill-opacity': .5, 'font-style': 'italic', text: 'c' }, sv);
    E('circle', { cx: SX(OPT[0]), cy: SY(OPT[1]), r: 6, fill: 'none', stroke: BLUE,
      'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, sv);

    /* the improving direction, or the supporting line */
    if (!optimal) {
      var dx = w.v[0] - pt[0], dy = w.v[1] - pt[1], L = Math.hypot(dx, dy);
      var ex = pt[0] + dx / L * Math.min(L, 3.2), ey = pt[1] + dy / L * Math.min(L, 3.2);
      E('line', { x1: SX(pt[0]), y1: SY(pt[1]), x2: SX(ex), y2: SY(ey),
        stroke: RED, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, sv);
      var a = Math.atan2(SY(ey) - SY(pt[1]), SX(ex) - SX(pt[0]));
      E('path', {
        d: 'M' + SX(ex) + ' ' + SY(ey) +
           'L' + (SX(ex) - 10 * Math.cos(a - .4)) + ' ' + (SY(ey) - 10 * Math.sin(a - .4)) +
           'L' + (SX(ex) - 10 * Math.cos(a + .4)) + ' ' + (SY(ey) - 10 * Math.sin(a + .4)) + 'Z',
        fill: RED
      }, sv);
    } else {
      var nx = -g[1] / gl, ny = g[0] / gl, T = 4.6;
      E('line', {
        x1: SX(pt[0] - nx * T), y1: SY(pt[1] - ny * T),
        x2: SX(pt[0] + nx * T), y2: SY(pt[1] + ny * T),
        stroke: BLUE, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', 'data-role': 'supporting-line'
      }, sv);
      [-1, 1].forEach(function (sign) {
        var ex = pt[0] + sign * g[0] / gl * 1.65;
        var ey = pt[1] + sign * g[1] / gl * 1.65;
        var angle = Math.atan2(SY(ey) - SY(pt[1]), SX(ex) - SX(pt[0]));
        var colour = sign > 0 ? BLUE : AMBER;
        E('line', { x1: SX(pt[0]), y1: SY(pt[1]), x2: SX(ex), y2: SY(ey),
          stroke: colour, 'stroke-width': 2, 'data-role': sign > 0 ? 'gradient-arrow' : 'descent-arrow' }, sv);
        E('path', { d: 'M' + SX(ex) + ' ' + SY(ey) +
          'L' + (SX(ex) - 8 * Math.cos(angle - .4)) + ' ' + (SY(ey) - 8 * Math.sin(angle - .4)) +
          'L' + (SX(ex) - 8 * Math.cos(angle + .4)) + ' ' + (SY(ey) - 8 * Math.sin(angle + .4)) + 'Z',
          fill: colour }, sv);
        E('text', { x: SX(ex) + 6, y: SY(ey) + 4, 'font-size': 11, fill: colour,
          text: sign > 0 ? '\u2207f' : '\u2212\u2207f' }, sv);
      });
    }

    /* the point itself */
    E('circle', { cx: SX(pt[0]), cy: SY(pt[1]), r: 7, fill: optimal ? BLUE : INK, 'data-role': 'current-point' }, sv);
    E('circle', { cx: SX(pt[0]), cy: SY(pt[1]), r: 12, fill: 'transparent', style: 'cursor:grab' }, sv);

    var vd = host.querySelector('[data-verdict]');
    vd.innerHTML = optimal
      ? 'OPTIMAL<br><span style="font-weight:400;font-size:11.5px;letter-spacing:0">no feasible direction points downhill</span>'
      : 'NOT OPTIMAL<br><span style="font-weight:400;font-size:11.5px;letter-spacing:0">the red arrow decreases f and stays feasible</span>';
    vd.style.background = optimal ? 'rgba(37,99,235,.10)' : 'rgba(214,69,69,.10)';
    vd.style.color = optimal ? BLUE : RED;

    host.querySelector('[data-num]').innerHTML =
      'x = (' + pt[0].toFixed(2) + ', ' + pt[1].toFixed(2) + ') &nbsp;&middot;&nbsp; ' +
      'f(x) = ' + (rr * rr).toFixed(2) + '<br>' +
      'min<sub>y feasible</sub> &nabla;f(x)<sup>T</sup>(y &minus; x) = <b style="color:' +
      (optimal ? BLUE : RED) + '">' + w.s.toFixed(2) + '</b>' +
      (optimal ? ' &ge; 0' : ' &lt; 0');
  }

  var dragging = false;
  function locate(ev) {
    var r = sv.getBoundingClientRect();
    var px = (ev.clientX - r.left) / r.width * W, py = (ev.clientY - r.top) / r.height * H;
    pt = project([IX(px), IY(py)]);
    draw();
  }
  sv.style.touchAction = 'none';
  sv.addEventListener('pointerdown', function (e) { dragging = true; sv.setPointerCapture(e.pointerId); locate(e); });
  sv.addEventListener('pointermove', function (e) { if (dragging) locate(e); });
  sv.addEventListener('pointerup', function () { dragging = false; });
  host.querySelector('[data-snap]').onclick = function () { pt = OPT.slice(); draw(); };
  var __reset = function () { pt = [4.2, 3.0]; draw(); };

  draw();
  return { reset: __reset, finish: function () { pt = OPT.slice(); draw(); } };
});
