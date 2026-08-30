/* ============================================================
   widget: convex-watershed
   Why convexity is the dividing line, shown rather than asserted.
   The same local descent, from the same twelve starts, on a convex
   and on a non-convex objective: one lands everywhere on the same
   point, the other sorts its starts into basins.
   ============================================================ */
IE437.widget('convex-watershed', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';
  var X0 = 0, X1 = 12, NSTART = 12, ALPHA = 0.32, ITERS = 90;
  var convex = true, ran = false, finals = [];

  function f(x) {
    return convex ? 0.12 * (x - 6.2) * (x - 6.2) + 0.55
      : 0.95 * Math.sin(1.15 * x) + 0.055 * (x - 5.6) * (x - 5.6) + 1.7;
  }
  function df(x) {
    return convex ? 0.24 * (x - 6.2)
      : 1.0925 * Math.cos(1.15 * x) + 0.11 * (x - 5.6);
  }
  var starts = [];
  for (var s = 0; s < NSTART; s++) starts.push(X0 + 0.5 + s * (X1 - X0 - 1) / (NSTART - 1));

  host.innerHTML =
    '<div class="wbar"><span class="wt">Local descent, twelve starts, one objective</span>' +
    '<span class="wspacer"></span>' +
    '<label class="wtog on" data-cx><i></i><span>convex objective</span></label>' +
    '<button class="wb" data-run>descend</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="align-items:center;gap:6px">' +
    '<div data-c></div>' +
    '<div class="wcap" data-v style="font:600 13px/1.4 var(--mono);letter-spacing:.03em"></div></div>';

  var CW = 780, CH = 262;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function descend(x) {
    for (var t = 0; t < ITERS; t++) {
      x = x - ALPHA * df(x);
      if (x < X0) x = X0; if (x > X1) x = X1;
    }
    return x;
  }

  function draw() {
    var curve = [];
    for (var x = X0; x <= X1 + 1e-9; x += 0.04) curve.push([x, f(x)]);
    var ys = curve.map(function (p) { return p[1]; });
    var lo = Math.min.apply(null, ys) - 0.4, hi = Math.max.apply(null, ys) + 0.4;
    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 44, r: 14, t: 14, b: 30 },
      xdom: [X0, X1], ydom: [lo, hi],
      yticks: [], xticks: [0, 3, 6, 9, 12], xlabel: 'x',
      series: [{ pts: curve, color: INK, w: 2 }]
    });
    /* starts along the top, finals on the curve, a thin thread between */
    starts.forEach(function (x0, n) {
      var xf = ran ? finals[n] : x0;
      E('circle', { cx: m.X(x0), cy: m.Y(hi) + 12, r: 3, fill: 'none',
        stroke: SLATE, 'stroke-width': 1.3 }, sv);
      if (ran) {
        E('path', {
          d: 'M' + m.X(x0) + ' ' + (m.Y(hi) + 12) + 'L' + m.X(xf) + ' ' + m.Y(f(xf)),
          stroke: convex ? BLUE : RED, 'stroke-width': 1, 'stroke-opacity': .38,
          'stroke-dasharray': '3 3', fill: 'none'
        }, sv);
        E('circle', { cx: m.X(xf), cy: m.Y(f(xf)), r: 4.4,
          fill: convex ? BLUE : RED, 'fill-opacity': .85 }, sv);
      }
    });
    var v = host.querySelector('[data-v]');
    if (!ran) { v.textContent = 'press “descend” — the twelve open circles are the starting points'; v.style.color = ''; return; }
    var basins = [];
    finals.forEach(function (x) {
      for (var i = 0; i < basins.length; i++) if (Math.abs(basins[i] - x) < 0.35) return;
      basins.push(x);
    });
    v.innerHTML = convex
      ? 'every start reached the <b>same</b> point &mdash; local minimum = global minimum'
      : '<b>' + basins.length + '</b> different minima reached &mdash; where you start decides where you stop';
    v.style.color = convex ? BLUE : RED;
  }

  host.querySelector('[data-run]').onclick = function () {
    finals = starts.map(descend); ran = true; draw();
  };
  host.querySelector('[data-rs]').onclick = function () { ran = false; draw(); };
  host.querySelector('[data-cx]').onclick = function () {
    convex = !convex; this.classList.toggle('on', convex); ran = false; draw();
  };

  draw();
  return {
    finish: function () { finals = starts.map(descend); ran = true; draw(); }
  };
});
