/* ============================================================
   widget: greedy-trap                              (Chapter 4, Act 3)
   Why an acquisition function has to exist at all.

   A true f with a modest local peak near x = 2.4 and a much higher
   global one near x = 7.6. Three samples are given, all in the left
   half. A kernel-ridge fit — the GP posterior mean with the variance
   thrown away — is drawn through them, and the student clicks its
   maximum to spend a query there. Refit, click again.

   Verified in node (ell = 1.3, lambda = 1e-3, data at 0.8, 3.3, 4.9):
   the greedy peak walks 2.98 -> 2.35 -> 2.30 and then never moves.
   Best found 1.481 against a global optimum of 2.636 — 44% short —
   and nothing beyond x = 4.9 is ever queried, though the optimum sits
   at 7.67. The true f is drawn faintly throughout — the slide is not a
   reveal but the sight of a rule refusing to go somewhere plainly there.
   At x = 7.67 the fit predicts -0.011 where f is 2.636: a regression with
   no uncertainty cannot say "I have not looked here"; it says "bad".
   ============================================================ */
IE437.widget('greedy-trap', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', GREEN = '#16A34A', SLATE = '#64748B';
  var X0 = 0, X1 = 10, ELL = 1.3, LAM = 1e-3;
  var INIT = [0.8, 3.3, 4.9];

  function ftrue(x) {
    return 1.55 * Math.exp(-0.5 * Math.pow((x - 2.4) / 1.05, 2))
         + 2.60 * Math.exp(-0.5 * Math.pow((x - 7.6) / 1.15, 2))
         + 0.09 * Math.sin(1.7 * x);
  }

  /* kernel ridge = the GP posterior mean, with the variance discarded */
  function solve(K, Y) {
    var n = Y.length, A = K.map(function (r, i) { return r.concat([Y[i]]); }), c, r, k, p, t, d, f;
    for (c = 0; c < n; c++) {
      p = c;
      for (r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      t = A[c]; A[c] = A[p]; A[p] = t;
      d = A[c][c];
      for (k = c; k <= n; k++) A[c][k] /= d;
      for (r = 0; r < n; r++) {
        if (r === c) continue;
        f = A[r][c];
        for (k = c; k <= n; k++) A[r][k] -= f * A[c][k];
      }
    }
    return A.map(function (r) { return r[n]; });
  }
  function fitted(Xs, Ys) {
    var n = Xs.length, K = [], i, j;
    for (i = 0; i < n; i++) {
      K.push([]);
      for (j = 0; j < n; j++)
        K[i].push(Math.exp(-0.5 * Math.pow((Xs[i] - Xs[j]) / ELL, 2)) + (i === j ? LAM : 0));
    }
    var a = solve(K, Ys);
    return function (x) {
      var s = 0, i;
      for (i = 0; i < n; i++) s += a[i] * Math.exp(-0.5 * Math.pow((x - Xs[i]) / ELL, 2));
      return s;
    };
  }

  var GRID = [], x;
  for (x = X0; x <= X1 + 1e-9; x += 0.02) GRID.push(x);
  var GX = GRID.reduce(function (b, x) { return ftrue(x) > ftrue(b) ? x : b; }, X0);
  var GY = ftrue(GX);

  var X, Y, mu, peak, stuck = 0;

  function refit() {
    mu = fitted(X, Y);
    peak = GRID.reduce(function (b, x) { return mu(x) > mu(b) ? x : b; }, X0);
  }
  function start() { X = INIT.slice(); Y = X.map(ftrue); stuck = 0; refit(); }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Fit, take the best point, repeat</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">queries</span><span class="wnum" data-n></span>' +
    '<span class="wlabel">best found</span><span class="wnum" data-b></span>' +
    '<span class="wlabel">true optimum</span><span class="wnum" data-g></span></div>' +
    '<div class="wbody" style="gap:6px"><div data-c></div>' +
    '<div data-v style="text-align:center;font:400 13px/1.5 var(--sans);color:var(--ink2);min-height:20px"></div></div>';

  var CW = 780, CH = 286, P = { l: 40, r: 14, t: 16, b: 28 };
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  var LO = -0.45, HI = 3.05;
  var SX = function (v) { return P.l + (v - X0) / (X1 - X0) * (CW - P.l - P.r); };
  var SY = function (v) { return CH - P.b - (v - LO) / (HI - LO) * (CH - P.t - P.b); };
  var path = function (fn, step) {
    var d = '', first = true, x;
    for (x = X0; x <= X1 + 1e-9; x += (step || 0.02)) {
      d += (first ? 'M' : 'L') + SX(x).toFixed(1) + ' ' + SY(fn(x)).toFixed(1);
      first = false;
    }
    return d;
  };

  /* Clicking anywhere queries that x. The peak is only marked, not a target to
     hit — so the greedy loop is easy to run, and stepping off it deliberately
     (into the half greedy never visits) is just as easy. */
  function query(xq) {
    if (X.length >= 14) return;
    var onPeak = Math.abs(xq - peak) < 0.35;
    var moved = Math.abs(peak - X[X.length - 1]);
    X.push(xq); Y.push(ftrue(xq));
    stuck = (onPeak && X.length > INIT.length + 1 && moved < 0.06) ? stuck + 1 : 0;
    refit(); draw();
  }
  /* The listener sits on the container, not on the SVG: draw() replaces every
     SVG child on each query, and hit-testing against elements that are being
     rebuilt under the cursor is how the second click gets lost. The container
     is never rebuilt, so every click lands. */
  var pane = host.querySelector('[data-c]');
  pane.style.cursor = 'crosshair';
  pane.addEventListener('click', function (ev) {
    /* the deck advances on a click that reaches the stage, and a query is not
       a request to move on */
    ev.stopPropagation();
    var r = sv.getBoundingClientRect();
    if (!r.width) return;
    var xq = X0 + (X1 - X0) * ((ev.clientX - r.left) / r.width * CW - P.l) / (CW - P.l - P.r);
    if (xq >= X0 && xq <= X1) query(Math.round(xq * 100) / 100);
  });

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);

    /* A transparent plate under everything. Without it a click between the
       strokes falls straight through the SVG to the slide, which both loses
       the query and makes deck.js treat it as click-to-advance. */
    E('rect', { x: 0, y: 0, width: CW, height: CH, fill: '#fff', 'fill-opacity': .001 }, sv);

    /* axes */
    E('line', { x1: P.l, x2: CW - P.r, y1: SY(0), y2: SY(0), stroke: 'currentColor', 'stroke-opacity': .22 }, sv);
    E('line', { x1: P.l, x2: P.l, y1: P.t, y2: CH - P.b, stroke: 'currentColor', 'stroke-opacity': .28 }, sv);
    [0, 1, 2, 3].forEach(function (t) {
      E('text', { x: P.l - 7, y: SY(t) + 3.5, 'text-anchor': 'end', 'font-size': 9.5, fill: 'currentColor',
        'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
    });
    [0, 2, 4, 6, 8, 10].forEach(function (t) {
      E('text', { x: SX(t), y: CH - P.b + 15, 'text-anchor': 'middle', 'font-size': 9.5, fill: 'currentColor',
        'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
    });

    /* the region no query has ever reached */
    var seen = Math.max.apply(null, X);
    if (seen < X1 - 0.3) {
      E('rect', { x: SX(seen), y: P.t, width: SX(X1) - SX(seen), height: CH - P.b - P.t,
        fill: SLATE, 'fill-opacity': .05 }, sv);
      /* at the foot of the band, so it never collides with the optimum's label */
      E('text', { x: (SX(seen) + SX(X1)) / 2, y: CH - P.b - 8, 'text-anchor': 'middle', 'font-size': 10,
        fill: SLATE, 'font-family': 'IBM Plex Mono, monospace', text: 'never queried' }, sv);
    }

    /* The truth is on the board the whole time. The point of the slide is not
       a reveal — it is watching a rule refuse to go somewhere visible. */
    E('path', { d: path(ftrue), fill: 'none', stroke: GREEN, 'stroke-width': 1.8,
      'stroke-dasharray': '5 4', 'stroke-opacity': .55 }, sv);
    E('circle', { cx: SX(GX), cy: SY(GY), r: 5, fill: 'none', stroke: GREEN, 'stroke-width': 2 }, sv);
    E('text', { x: SX(GX), y: SY(GY) - 12, 'text-anchor': 'middle', 'font-size': 10.5, fill: GREEN,
      'font-family': 'IBM Plex Mono, monospace', text: 'the true optimum, ' + GY.toFixed(2) }, sv);

    /* the fit */
    E('path', { d: path(mu), fill: 'none', stroke: INK, 'stroke-width': 2.2 }, sv);

    /* the data */
    X.forEach(function (xi, i) {
      var given = i < INIT.length;
      E('circle', { cx: SX(xi), cy: SY(Y[i]), r: given ? 3.6 : 4.2,
        fill: given ? 'none' : BLUE, stroke: given ? SLATE : BLUE,
        'stroke-width': 1.6, 'fill-opacity': .9 }, sv);
    });

    /* the peak — the thing you click */
    var py = mu(peak);
    E('line', { x1: SX(peak), x2: SX(peak), y1: SY(py), y2: SY(LO), stroke: RED,
      'stroke-width': 1, 'stroke-dasharray': '3 3', 'stroke-opacity': .5 }, sv);
    E('circle', { cx: SX(peak), cy: SY(py), r: 6.5, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, sv);
    if (X.length < 14) {
      E('text', { x: SX(peak), y: SY(py) - 15, 'text-anchor': 'middle', 'font-size': 10.5, fill: RED,
        'font-family': 'IBM Plex Mono, monospace',
        text: stuck >= 2 ? 'greedy is still here' : 'greedy picks here' }, sv);
    }

    /* readouts */
    var best = Math.max.apply(null, Y);
    host.querySelector('[data-n]').textContent = (X.length - INIT.length);
    host.querySelector('[data-b]').textContent = best.toFixed(2);
    host.querySelector('[data-g]').textContent = GY.toFixed(2);

    var v = host.querySelector('[data-v]');
    if (stuck >= 2) {
      v.innerHTML = 'The peak has stopped moving — <b style="color:' + RED + '">greedy has nothing left to propose</b>. ' +
        'Best found <b>' + best.toFixed(2) + '</b> against <b>' + GY.toFixed(2) + '</b>, and the fit predicts <b>' +
        mu(GX).toFixed(2) + '</b> where the optimum plainly is.';
      v.style.color = '';
    } else if (X.length > INIT.length) {
      v.textContent = 'The fit moved, and its peak moved with it. Click again.';
      v.style.color = '';
    } else {
      v.innerHTML = 'The green dashes are the truth, which the fit cannot see — it has only the three samples. ' +
        '<b>Click the plot to spend a query</b>: the red peak to follow the greedy rule, or anywhere else to test it.';
      v.style.color = '';
    }
  }

  start(); draw();
  return {
    reset: function () { start(); draw(); },
    /* the printed slide shows the trap already sprung, with the truth up */
    finish: function () {
      start();
      for (var i = 0; i < 5; i++) { X.push(peak); Y.push(ftrue(peak)); refit(); }
      /* the printed state is the greedy one, so the peak is where it froze */
      stuck = 3;
      draw();
    }
  };
});
