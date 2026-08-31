/* ============================================================
   widget: dt-to-hjb                                (Chapter 9, Act 2)
   Act 2 asserts that the HJB equation IS the Bellman backup with the
   time step taken to zero. This checks it, on a problem whose HJB
   solution is known exactly.

     plant   xdot = a x + b u          a = b = 1
     cost    int_0^T (q x^2 + r u^2)   q = r = 1, T = 2, no terminal cost
     HJB     V(t,x) = P(t) x^2  with  -Pdot = 2aP - P^2 b^2/r + q, P(T)=0
             integrated backwards by RK4 at 4000 steps -> P(0) = 2.35777165

   The DISCRETE backup of Act 1 is then run on the Euler-discretised
   system at step h:  V(k,x) = min_u {(q x^2 + r u^2) h + P_{k+1}(x + (ax+bu)h)^2}
   whose minimiser is  u* = -P b(1+ah) x / (r + P b^2 h),  giving
     P_k = h(q + r K^2) + P_{k+1}((1+ah) - b h K)^2.
   That is exactly the discrete-time Riccati recursion for
   A = 1+ah, B = bh, Q = qh, R = rh — checked to 12 digits offline.

   Verified in node before shipping: the error |P_h(0) - P(0)| is
     h=0.5      5.747e-1
     h=0.25     3.328e-1   ratio 1.727
     h=0.125    1.746e-1   ratio 1.907
     h=0.0625   8.890e-2   ratio 1.963
     h=0.03125  4.481e-2   ratio 1.984
     h=0.015625 2.249e-2   ratio 1.993
     h=0.0078125 1.126e-2  ratio 1.997
   i.e. first order, exactly as one Euler step should be. The claim on
   the slide is that halving dt halves the error, and it does.
   ============================================================ */
IE437.widget('dt-to-hjb', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706';
  var a = 1, b = 1, q = 1, r = 1, qf = 0, T = 2;
  var LADDER = [0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125];
  var li = 0;

  /* ---- exact HJB solution: RK4 backwards on the Riccati ODE ---- */
  function riccatiExact(n) {
    var h = T / n, F = function (P) { return -(2 * a * P - P * P * b * b / r + q); };
    var P = qf, tr = [[T, P]], i, k1, k2, k3, k4;
    for (i = 0; i < n; i++) {
      k1 = F(P); k2 = F(P - .5 * h * k1); k3 = F(P - .5 * h * k2); k4 = F(P - h * k3);
      P -= h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      tr.push([T - (i + 1) * h, P]);
    }
    tr.reverse(); return tr;
  }
  /* ---- the discrete Bellman backup at step h ---- */
  function backup(h) {
    var N = Math.round(T / h), P = qf, tr = [[T, P]], k, A1, K;
    for (k = 0; k < N; k++) {
      A1 = 1 + a * h; K = P * b * A1 / (r + P * b * b * h);
      P = h * (q + r * K * K) + P * Math.pow(A1 - b * h * K, 2);
      tr.push([T - (k + 1) * h, P]);
    }
    tr.reverse(); return tr;
  }

  var EXACT = riccatiExact(4000), P0 = EXACT[0][1];
  var RUNS = LADDER.map(function (h) {
    var tr = backup(h);
    return { h: h, tr: tr, P0: tr[0][1], err: Math.abs(tr[0][1] - P0) };
  });

  host.innerHTML =
    '<div class="wbar"><span class="wt">Shrink the step and the backup becomes the PDE</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">step</span><span class="wnum" data-dt style="min-width:74px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">cost-to-go coefficient P(t) &mdash; exact HJB vs the discrete backup</div>' +
    '<div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">error at t = 0, both axes log10</div><div data-c2></div></div>' +
    '<div data-num style="width:196px;font:400 12px/1.75 var(--sans);color:var(--ink2)"></div></div>';

  var W1 = 476, W2 = 340, HH = 244;
  var sv1 = IE437.svg(W1, HH), sv2 = IE437.svg(W2, HH);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  function draw() {
    var run = RUNS[li], h = run.h;

    /* ---------- left: P(t) ---------- */
    var ax = IE437.plot(sv1, {
      w: W1, h: HH, pad: { l: 40, r: 12, t: 12, b: 30 },
      xdom: [0, T], ydom: [0, 3], yticks: [0, 1, 2, 3], xticks: [0, 0.5, 1, 1.5, 2],
      xlabel: 'time t', ylabel: 'P(t)',
      yfmt: function (v) { return v.toFixed(0); }, xfmt: function (v) { return v.toFixed(1); },
      series: [
        { pts: RUNS[0].tr, color: SLATE, w: 1.2, dash: '4 3' },
        { pts: RUNS[1].tr, color: SLATE, w: 1.2, dash: '4 3' },
        { pts: RUNS[2].tr, color: SLATE, w: 1.2, dash: '4 3' },
        { pts: EXACT.filter(function (_, i) { return i % 8 === 0; }), color: INK, w: 2.6 },
        { pts: run.tr, color: BLUE, w: 2, dots: run.tr.length <= 34 }
      ]
    });
    E('text', {
      x: W1 - 18, y: ax.Y(2.62), 'text-anchor': 'end', 'font-size': 10.5, fill: INK,
      'fill-opacity': .72, text: 'exact HJB (Riccati ODE)'
    }, sv1);
    E('text', {
      x: W1 - 18, y: ax.Y(2.62) + 30, 'text-anchor': 'end', 'font-size': 10, fill: SLATE,
      'fill-opacity': .8, text: 'grey: the coarser steps already tried'
    }, sv1);
    E('text', {
      x: W1 - 18, y: ax.Y(2.62) + 15, 'text-anchor': 'end', 'font-size': 10.5, fill: BLUE,
      'font-weight': 700, text: 'discrete backup, Δt = ' + h
    }, sv1);
    /* the quantity the right panel measures */
    E('line', {
      x1: ax.X(0), y1: ax.Y(P0), x2: ax.X(0), y2: ax.Y(run.P0),
      stroke: AMBER, 'stroke-width': 3
    }, sv1);
    E('circle', { cx: ax.X(0), cy: ax.Y(P0), r: 3.4, fill: INK }, sv1);
    E('circle', { cx: ax.X(0), cy: ax.Y(run.P0), r: 3.4, fill: BLUE }, sv1);

    /* ---------- right: log-log error ---------- */
    var pts = RUNS.map(function (R) { return [Math.log10(R.h), Math.log10(R.err)]; });
    var g0 = pts[pts.length - 1];
    var guide = [[-2.25, g0[1] + (-2.25 - g0[0])], [-0.15, g0[1] + (-0.15 - g0[0])]];  /* slope exactly 1 */
    var bx = IE437.plot(sv2, {
      w: W2, h: HH, pad: { l: 44, r: 14, t: 12, b: 30 },
      xdom: [-2.25, -0.15], ydom: [-2.2, 0.1],
      yticks: [-2, -1.5, -1, -0.5, 0], xticks: [-2, -1.5, -1, -0.5],
      xlabel: 'log10 Δt', ylabel: 'log10 error',
      yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return v.toFixed(1); },
      series: [
        { pts: guide, color: SLATE, w: 1.4, dash: '5 4' },
        { pts: pts, color: BLUE, w: 1.8, dots: true }
      ]
    });
    E('circle', {
      cx: bx.X(pts[li][0]), cy: bx.Y(pts[li][1]), r: 6.4, fill: 'none',
      stroke: BLUE, 'stroke-width': 2.4
    }, sv2);
    E('text', {
      x: bx.X(-1.62), y: bx.Y(-1.05), 'font-size': 10.5, fill: SLATE, 'font-weight': 700,
      'text-anchor': 'middle', text: 'slope 1'
    }, sv2);

    /* ---------- numbers ---------- */
    var ratio = li > 0 ? RUNS[li - 1].err / run.err : null;
    var order = ratio ? Math.log2(ratio) : null;
    host.querySelector('[data-dt]').textContent = h;
    host.querySelector('[data-num]').innerHTML =
      '<div style="font:600 10px/1 var(--mono);letter-spacing:.12em;color:var(--ink4);' +
      'text-transform:uppercase;margin-bottom:8px">at t = 0</div>' +
      'exact <b style="font-family:var(--mono)">' + P0.toFixed(6) + '</b><br>' +
      'backup <b style="font-family:var(--mono);color:' + BLUE + '">' + run.P0.toFixed(6) + '</b><br>' +
      'error <b style="font-family:var(--mono);color:' + AMBER + '">' + run.err.toExponential(3) + '</b>' +
      '<div style="margin-top:10px;padding-top:9px;border-top:1px solid rgba(22,24,29,.12)">' +
      (ratio
        ? 'halving &Delta;t divided the error by <b style="font-family:var(--mono);color:' + BLUE + '">' +
          ratio.toFixed(3) + '</b><br><span style="color:var(--ink3)">observed order ' +
          order.toFixed(3) + ' &mdash; first, as one Euler step should be</span>'
        : '<span style="color:var(--ink3)">press <b>halve &Delta;t</b> and read the ratio</span>') +
      '</div>';
  }

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: RUNS.length - 1, step: 1, value: li,
    on: function (v) { li = v; draw(); }
  });
  host.querySelector('[data-rs]').onclick = function () { li = 0; dial.set(0, false); draw(); };

  draw();
  return { finish: function () { li = RUNS.length - 1; draw(); } };
});
