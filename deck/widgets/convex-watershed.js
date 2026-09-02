/* ============================================================
   widget: convex-watershed
   Why convexity is the dividing line, shown rather than asserted.
   The same local descent, from the same twelve starts, on a convex
   and on a non-convex objective: one lands everywhere on the same
   point, the other sorts its starts into basins.

   The twelve walkers sit ON the curve at (x0, f(x0)) and are stepped
   by gradient descent one iteration at a time, so the descent is a
   process you watch rather than a before/after pair. Verified in node:
   f decreases monotonically along every path, the convex objective
   collects all twelve at x = 6.20, and the non-convex one sorts them
   into three basins (x = 0.00 at the boundary, 4.22, 9.24).
   ============================================================ */
IE437.widget('convex-watershed', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';
  var X0 = 0, X1 = 12, NSTART = 12, ALPHA = 0.32, ITERS = 90;
  var PER_FRAME = 2, FRAME_MS = 40, SETTLED = 2e-3;
  var convex = true, running = false, done = false, iter = 0, timer = null;

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
  var pos = starts.slice();

  host.innerHTML =
    '<div class="wbar"><span class="wt">Local descent, twelve starts, one objective</span>' +
    '<span class="wspacer"></span>' +
    '<label class="wtog on" data-cx><i></i><span>convex objective</span></label>' +
    '<button class="wb" data-auto data-run>descend</button>' +
    '</div>' +
    '<div class="wbody" style="align-items:center;gap:6px">' +
    '<div data-c></div>' +
    '<div class="wcap" data-v style="font:600 13px/1.4 var(--mono);letter-spacing:.03em"></div></div>';

  var CW = 780, CH = 262;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function clamp(x) { return x < X0 ? X0 : x > X1 ? X1 : x; }
  /* returns the largest move any walker made, so the run can stop when the
     picture has stopped changing rather than counting out an idle tail */
  function stepAll() {
    var moved = 0;
    for (var i = 0; i < pos.length; i++) {
      var nx = clamp(pos[i] - ALPHA * df(pos[i]));
      moved = Math.max(moved, Math.abs(nx - pos[i]));
      pos[i] = nx;
    }
    iter++;
    return moved;
  }

  function draw() {
    var curve = [], x;
    for (x = X0; x <= X1 + 1e-9; x += 0.04) curve.push([x, f(x)]);
    var ys = curve.map(function (p) { return p[1]; });
    var lo = Math.min.apply(null, ys) - 0.4, hi = Math.max.apply(null, ys) + 0.4;
    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 44, r: 14, t: 14, b: 30 },
      xdom: [X0, X1], ydom: [lo, hi],
      yticks: [], xticks: [0, 3, 6, 9, 12], xlabel: 'x',
      series: [{ pts: curve, color: INK, w: 2 }]
    });
    var hue = convex ? BLUE : RED;

    starts.forEach(function (x0, n) {
      var xc = pos[n];
      /* the stretch of curve this walker has travelled */
      if (Math.abs(xc - x0) > 1e-3) {
        var a = Math.min(x0, xc), b = Math.max(x0, xc), seg = [];
        for (x = a; x < b; x += 0.04) seg.push([x, f(x)]);
        seg.push([b, f(b)]);
        E('path', {
          d: seg.map(function (p, i) { return (i ? 'L' : 'M') + m.X(p[0]).toFixed(1) + ' ' + m.Y(p[1]).toFixed(1); }).join(' '),
          fill: 'none', stroke: hue, 'stroke-width': 2.6, 'stroke-opacity': .3, 'stroke-linecap': 'round'
        }, sv);
      }
      /* where it started — an open circle, on the curve */
      E('circle', { cx: m.X(x0), cy: m.Y(f(x0)), r: 3.1, fill: 'none',
        stroke: SLATE, 'stroke-width': 1.3, 'stroke-opacity': .75 }, sv);
      /* where it is now */
      E('circle', { cx: m.X(xc), cy: m.Y(f(xc)), r: 4.4,
        fill: hue, 'fill-opacity': done ? .9 : .75 }, sv);
    });

    var v = host.querySelector('[data-v]');
    if (!running && !done) {
      v.textContent = 'press “descend” — the twelve open circles are the starting points';
      v.style.color = ''; return;
    }
    if (!done) {
      v.textContent = 'descending — iteration ' + iter;
      v.style.color = ''; return;
    }
    var basins = [];
    pos.forEach(function (xx) {
      for (var i = 0; i < basins.length; i++) if (Math.abs(basins[i] - xx) < 0.35) return;
      basins.push(xx);
    });
    v.innerHTML = convex
      ? 'every start reached the <b>same</b> point &mdash; local minimum = global minimum'
      : '<b>' + basins.length + '</b> different minima reached &mdash; where you start decides where you stop';
    v.style.color = hue;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function rewind() { stop(); pos = starts.slice(); iter = 0; running = false; done = false; }

  function run() {
    rewind();
    running = true;
    draw();
    timer = setInterval(function () {
      var moved = 0;
      for (var k = 0; k < PER_FRAME && iter < ITERS; k++) moved = Math.max(moved, stepAll());
      if (iter >= ITERS || moved < SETTLED) { stop(); running = false; done = true; }
      draw();
    }, FRAME_MS);
  }

  host.querySelector('[data-run]').onclick = run;
  host.querySelector('[data-cx]').onclick = function () {
    convex = !convex; this.classList.toggle('on', convex); rewind(); draw();
  };

  draw();
  return {
    reset: function () { rewind(); draw(); },
    leave: stop,
    /* the PDF gets the finished descent, computed rather than animated */
    finish: function () {
      stop(); pos = starts.slice(); iter = 0;
      while (iter < ITERS && stepAll() >= SETTLED) { }
      running = false; done = true; draw();
    }
  };
});
