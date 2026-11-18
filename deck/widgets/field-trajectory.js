/* ============================================================
   widget: field-trajectory                         (Chapter 9, thesis picture)
   The chapter's claim in one plane: HJB answers with a FIELD over every
   (t, x) — a value V(t,x) and a feedback rule u*(t,x) everywhere, the
   Eulerian view — while Pontryagin answers with ONE TRAJECTORY through
   that plane, the Lagrangian view, and the costate lambda(t) is the
   field's slope dV/dx read along that trajectory.

   The running system is the chapter's heater:
     plant   xdot = u,  cost int_0^2 (x^2 + u^2) dt,  x(0) = 1
     HJB     V(t,x) = P(t) x^2,  P(t) = tanh(2 - t),  u* = -P(t) x
     PMP     x*(t) = cosh(2 - t) / cosh 2,  lambda(t) = 2 P(t) x*(t)
                   = 2 sinh(2 - t) / cosh 2,  lambda(0) = 1.928,  lambda(2) = 0
   P is taken in closed form; the trajectories are integrated by RK4 on
   xdot = -P(t) x (the optimal rule) or xdot = -0.5 P(t) x (a rule that
   is not optimal), 400 steps. Checked in node: the RK4 trajectory from
   x0 = 1 agrees with cosh(2-t)/cosh 2 to 1.7e-13.

   Two mounts, both stepped (steps: 2, walked by the deck's arrow key):

     {"mode":"field"}       0  the plane with the level curves of V
                            1  + the feedback rule as a short blue arrow
                                 on a 9 x 7 grid of (t, x) points
                            2  + three trajectories that follow it from
                                 x0 = 1, 0.4, -0.8

     {"mode":"trajectory"}  0  the plane, the level curves faint, and the
                                 one optimal trajectory x*(t) from x0 = 1
                            1  + the costate as the slope of V along it:
                                 an amber arrow at t = 0, 0.5, 1, 1.5, 2
                                 whose length is lambda(t), ending at 0
                            2  + a second trajectory from the same x0
                                 under u = -0.5 P(t) x, dashed slate

   The level curves are x = +-sqrt(c / P(t)) for c in {0.1, 0.3, 0.6,
   1.0, 1.5}; they rise towards t = 2 as P -> 0 and each is drawn up to
   the point where it leaves the plot box. On-figure text is kept to the
   labels that name a quantity; the explanation is the slide caption.
   ============================================================ */
IE437.widget('field-trajectory', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B';
  var mode = (opts && opts.mode) === 'trajectory' ? 'trajectory' : 'field';
  var T = 2, XMAX = 1.6;
  var P = function (t) { return Math.tanh(T - t); };

  /* ---- RK4 on xdot = -s P(t) x, s = 1 for the optimal rule ---- */
  function run(x0, s, n) {
    n = n || 400;
    var h = T / n, x = x0, pts = [[0, x]], i, t, k1, k2, k3, k4;
    var f = function (t, x) { return -s * P(t) * x; };
    for (i = 0; i < n; i++) {
      t = i * h;
      k1 = f(t, x); k2 = f(t + .5 * h, x + .5 * h * k1);
      k3 = f(t + .5 * h, x + .5 * h * k2); k4 = f(t + h, x + h * k3);
      x += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      pts.push([(i + 1) * h, x]);
    }
    return pts;
  }
  var XSTAR = function (t) { return Math.cosh(T - t) / Math.cosh(T); };
  var LAM = function (t) { return 2 * Math.sinh(T - t) / Math.cosh(T); };

  host.innerHTML =
    '<div class="wbar"><span class="wt">' +
    (mode === 'field' ? 'HJB: a field over every (t, x)' : 'Pontryagin: one trajectory through the field') +
    '</span></div>' +
    '<div class="wbody" style="align-items:center;justify-content:center"><div data-c></div></div>';

  var W = 980, H = 330, PAD = { l: 44, r: 16, t: 14, b: 30 };
  var svg = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(svg);

  var ax = IE437.plot(svg, {
    w: W, h: H, pad: PAD, xdom: [0, T], ydom: [-XMAX, XMAX],
    xticks: [0, 0.5, 1, 1.5, 2], yticks: [-1, 0, 1], xlabel: 't', ylabel: 'x',
    xfmt: function (v) { return v.toFixed(1); }, yfmt: function (v) { return v.toFixed(0); },
    series: [{ pts: [[0, 0], [T, 0]], color: INK, w: 1, dash: '3 3' }]
  });
  var X = ax.X, Y = ax.Y;
  var layers = [E('g', {}, svg), E('g', {}, svg), E('g', {}, svg)];
  /* every label sits on a small plate in the panel colour so it reads over the
     level curves (a stroke halo would close the counters of P and ∂ at this size).
     The plates are measured with getBBox, again on each step so a late font load
     is caught; slides are hidden by visibility, not display, so the measure works. */
  var PLATES = [], BG = (function () {
    var c = getComputedStyle(host.closest('.widget') || host).backgroundColor;
    return c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' ? c : '#F1F1ED';
  })();
  function plated(textEl) {
    var r = E('rect', { fill: BG, rx: 2 }, textEl.parentNode);
    textEl.parentNode.insertBefore(r, textEl);
    PLATES.push([textEl, r]); return textEl;
  }
  function layoutPlates() {
    PLATES.forEach(function (p) {
      try {
        var b = p[0].getBBox();
        p[1].setAttribute('x', b.x - 3); p[1].setAttribute('y', b.y - 1);
        p[1].setAttribute('width', b.width + 6); p[1].setAttribute('height', b.height + 2);
      } catch (e) { }
    });
  }

  /* ---- step 0: the level curves of V, on both mounts ---- */
  var faint = mode === 'field' ? .55 : .28;
  [0.1, 0.3, 0.6, 1.0, 1.5].forEach(function (c) {
    /* the curve leaves the box where P(t) = c / XMAX^2 */
    var tEnd = Math.min(T, T - Math.atanh(Math.min(0.999999, c / (XMAX * XMAX))));
    [1, -1].forEach(function (sg) {
      var pts = [], i, t, n = 160;
      for (i = 0; i <= n; i++) { t = tEnd * i / n; pts.push([t, sg * Math.sqrt(c / P(t))]); }
      E('path', {
        d: pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '),
        fill: 'none', stroke: SLATE, 'stroke-width': 1.1, 'stroke-opacity': faint
      }, layers[0]);
    });
  });
  if (mode === 'field') {
    plated(IE437.math(layers[0], X(0.04), Y(1.42), 'V(t,x) = P(t)\\,x^2', { 'font-size': 14, fill: SLATE }));
  }

  function arrow(g, x1, y1, x2, y2, color, w) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
    var hl = 5, hw = 2.6, bx = x2 - ux * hl, by = y2 - uy * hl;
    E('line', { x1: x1, y1: y1, x2: bx, y2: by, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
    E('path', {
      d: 'M' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
         'L' + (bx - uy * hw).toFixed(1) + ' ' + (by + ux * hw).toFixed(1) +
         'L' + (bx + uy * hw).toFixed(1) + ' ' + (by - ux * hw).toFixed(1) + 'Z',
      fill: color
    }, g);
  }

  if (mode === 'field') {
    /* ---- step 1: the rule drawn everywhere — the flow (1, -P x) at a 9 x 7 grid,
            each arrow tangent to the trajectory through its point, 18 px long ---- */
    var ti, xi, t, x, vx, vy, L, cx, cy;
    for (ti = 0; ti < 9; ti++) {
      t = 0.1 + ti * 0.225;
      for (xi = 0; xi < 7; xi++) {
        x = -1.2 + xi * 0.4;
        vx = X(1) - X(0); vy = Y(-P(t) * x) - Y(0);         /* pixel image of (1, xdot) */
        L = Math.sqrt(vx * vx + vy * vy); vx = 9 * vx / L; vy = 9 * vy / L;
        cx = X(t); cy = Y(x);
        arrow(layers[1], cx - vx, cy - vy, cx + vx, cy + vy, BLUE, 1.5);
      }
    }
    plated(IE437.math(layers[1], X(0.04), Y(-1.47), 'u^* = -P(t)\\,x', { 'font-size': 14, fill: BLUE }));

    /* ---- step 2: three trajectories that follow the arrows ---- */
    [1, 0.4, -0.8].forEach(function (x0) {
      var pts = run(x0, 1);
      E('path', {
        d: pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '),
        fill: 'none', stroke: BLUE, 'stroke-width': 2.4, 'stroke-linejoin': 'round'
      }, layers[2]);
      E('circle', { cx: X(0), cy: Y(x0), r: 3.4, fill: BLUE }, layers[2]);
    });
    plated(E('text', { x: X(T) - 6, y: Y(-0.62), 'text-anchor': 'end', 'font-size': 11, fill: SLATE,
      'font-weight': 600, text: 'a rule, valid from any state' }, layers[2]));
  } else {
    /* ---- step 0: the one optimal trajectory ---- */
    var opt = run(1, 1);
    E('path', {
      d: opt.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '),
      fill: 'none', stroke: BLUE, 'stroke-width': 2.6, 'stroke-linejoin': 'round'
    }, layers[0]);
    E('circle', { cx: X(0), cy: Y(1), r: 3.6, fill: BLUE }, layers[0]);
    plated(IE437.math(layers[0], X(0.62), Y(0.2), 'x^*(t)', { 'font-size': 14, fill: BLUE }));

    /* ---- step 1: the costate as the slope of V in x, read along x*(t) ----
            V(t, .) is a parabola in x, so its slope at x*(t) is drawn as an arrow
            in the x direction of length 24 px per unit of lambda; it shrinks to
            the dot at t = 2 where lambda(2) = 0 ---- */
    var K = 24;
    [0, 0.5, 1, 1.5, 2].forEach(function (t) {
      var xs = XSTAR(t), lam = LAM(t), x0p = X(t), y0p = Y(xs);
      E('circle', { cx: x0p, cy: y0p, r: 3.2, fill: AMBER }, layers[1]);
      if (lam * K > 4) arrow(layers[1], x0p, y0p, x0p, y0p - lam * K, AMBER, 2);
    });
    plated(IE437.math(layers[1], X(0.06), Y(1.42), '\\lambda(t) = ∂V/∂x', { 'font-size': 14, fill: AMBER }));
    plated(IE437.math(layers[1], X(T) - 6, Y(-0.22), '\\lambda(2) = 0', { 'font-size': 14, fill: AMBER, 'text-anchor': 'end' }));

    /* ---- step 2: any other trajectory from the same start ---- */
    var other = run(1, 0.5);
    E('path', {
      d: other.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '),
      fill: 'none', stroke: SLATE, 'stroke-width': 2, 'stroke-dasharray': '6 4', 'stroke-linejoin': 'round'
    }, layers[2]);
    plated(E('text', { x: X(1.05), y: Y(0.88), 'font-size': 11, fill: SLATE, 'font-weight': 600,
      text: 'any other trajectory costs more' }, layers[2]));
  }

  function show(i) {
    layoutPlates();
    layers.forEach(function (g, k) { g.setAttribute('visibility', k <= i ? 'visible' : 'hidden'); });
  }
  show(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutPlates);
  return { steps: 2, step: show, reset: function () { show(0); }, finish: function () { show(2); } };
});
