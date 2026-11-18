/* ============================================================
   widget: lqr-riccati                              (Chapter 9, Act 3)
   The one problem in this course with a closed form, so the widget's
   job is to be checkable rather than merely illustrative.

   Plant: the double integrator — a unit mass you can push.
     A = [[0,1],[0,0]]   B = [[0],[1]]   Q = diag(q, 1)   R = r

   The algebraic Riccati equation A'P + PA - PBR^-1B'P + Q = 0 has,
   for this A and B, an exact solution obtained by hand:
     p2 = sqrt(q r),  p3 = sqrt(r (2 p2 + 1)),  p1 = p2 p3 / r
     K  = R^-1 B' P = [ sqrt(q/r),  sqrt((2 sqrt(qr) + 1)/r) ]
   The right-hand panel does NOT use that formula: it integrates the
   Riccati differential equation -Pdot = A'P + PA - PBR^-1B'P + Q
   backwards from P = 0 by RK4 and watches the gain stop moving. The
   dashed lines are the closed form. They must coincide, and they do.

   Verified in node against the same integration at 20000 steps:
     q=1   r=1     K = [1.00000, 1.73205]   agreement to 5 dp
     q=1   r=0.01  K = [10.00000, 10.95445]
     q=1   r=100   K = [0.10000,  0.45826]
     q=10  r=1     K = [3.16228,  2.70639]
     q=0.1 r=1     K = [0.31623,  1.27768]
   and the optimal cost from x0 = [1,0] is x0'Px0 = p1, which the
   simulated trajectory's running cost reproduces.

   mode: "recursion"  (Chapter 9, the Riccati recursion as plates)
   The discrete-time recursion run backwards from the one-step problem,
   one plate per sweep, the digits that changed since the previous
   plate in red, and under the plates the gain K_k against k so the
   class watches it stop moving.  Options:
     system  "heater" (default)  x+ = x + u, cost SUM(x^2 + u^2):
                                 A = B = Q = R = 1, so
                                 P_{k+1} = 1 + P_k/(1 + P_k),  K_k = P_k/(1 + P_k)
             "double"            the double integrator sampled at h = 0.5:
                                 A = [[1,h],[0,1]]  B = [h^2/2, h]'  Q = I  R = 1
     n       plates to draw (default 6); steps = n, step 0 shows plate 1,
             each press adds one plate, the last press draws the limit
   with P_1 = Q and  P_{k+1} = Q + A'P_k A - A'P_k B (R + B'P_k B)^-1 B'P_k A,
   K_k = (R + B'P_k B)^-1 B'P_k A,  u = -K x.  Verified in node:
     heater  P = 1.0000 1.5000 1.6000 1.6154 1.6176 1.6180 -> (1+sqrt5)/2 = 1.618034
             K = 0.5000 0.6000 0.6154 0.6176 0.6180 0.6180 -> (sqrt5-1)/2 = 0.618034
     double  K_1 = [0.0988, 0.4444]  K_6 = [0.6349, 1.2929]
             K_60 = [0.651402, 1.314202],  P_60 = [[4.0350, 2.0616],[2.0616, 4.1438]]
             (the 60th iterate is stable to 6 dp; the 6th is still 0.02 short,
              so six plates show the approach rather than the arrival)
   Without mode the widget is the dial figure above, unchanged.
   ============================================================ */
IE437.widget('lqr-riccati', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B',
      AMBER = '#D97706', GREEN = '#16A34A', RED = '#D64545', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  if (opts.mode === 'recursion') return recursion();

  var QL = [0.1, 0.3, 1, 3, 10], RL = [0.01, 0.1, 1, 10, 100];
  var qi = QL.indexOf(opts.q === undefined ? 1 : opts.q); if (qi < 0) qi = 2;
  var ri = RL.indexOf(opts.r === undefined ? 1 : opts.r); if (ri < 0) ri = 2;

  /* ---- exact ARE solution for this (A,B) ---- */
  function areClosed(q, r) {
    var p2 = Math.sqrt(q * r), p3 = Math.sqrt(r * (2 * p2 + 1)), p1 = p2 * p3 / r;
    return { P: [p1, p2, p3], K: [p2 / r, p3 / r] };
  }
  /* ---- the Riccati ODE, integrated backwards (i.e. forward in time-to-go) ---- */
  function riccatiRun(q, r, tmax, n) {
    var h = tmax / n, p1 = 0, p2 = 0, p3 = 0, tr = [], i, k1, k2, k3, k4;
    var F = function (p1, p2, p3) {
      return [-p2 * p2 / r + q, p1 - p2 * p3 / r, 2 * p2 - p3 * p3 / r + 1];
    };
    tr.push([0, 0, 0]);
    for (i = 0; i < n; i++) {
      k1 = F(p1, p2, p3);
      k2 = F(p1 + .5 * h * k1[0], p2 + .5 * h * k1[1], p3 + .5 * h * k1[2]);
      k3 = F(p1 + .5 * h * k2[0], p2 + .5 * h * k2[1], p3 + .5 * h * k2[2]);
      k4 = F(p1 + h * k3[0], p2 + h * k3[1], p3 + h * k3[2]);
      p1 += h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
      p2 += h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
      p3 += h * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]) / 6;
      tr.push([(i + 1) * h, p2 / r, p3 / r]);       /* the gain, not P */
    }
    return { tr: tr, K: [p2 / r, p3 / r] };
  }
  /* ---- closed loop xdot = (A - BK)x from x0 = [1,0] ---- */
  function sim(K, tmax, n) {
    var h = tmax / n, x = [1, 0], out = [], u, i, k1, k2, k3, k4, J = 0, q = QL[qi], r = RL[ri];
    var f = function (v) { return [v[1], -K[0] * v[0] - K[1] * v[1]]; };
    for (i = 0; i <= n; i++) {
      u = -K[0] * x[0] - K[1] * x[1];
      out.push([i * h, x[0], x[1], u]);
      if (i === n) break;
      J += (q * x[0] * x[0] + x[1] * x[1] + r * u * u) * h;
      k1 = f(x);
      k2 = f([x[0] + .5 * h * k1[0], x[1] + .5 * h * k1[1]]);
      k3 = f([x[0] + .5 * h * k2[0], x[1] + .5 * h * k2[1]]);
      k4 = f([x[0] + h * k3[0], x[1] + h * k3[1]]);
      x = [x[0] + h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6,
           x[1] + h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6];
    }
    return { tr: out, J: J };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">A mass you can push &mdash; the dials <i>are</i> the objective</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">state cost Q</span><span class="wnum" data-q style="min-width:34px;text-align:right;display:inline-block"></span>' +
    '<button class="wb" data-qd>&darr;</button><button class="wb" data-qu>&uarr;</button>' +
    '<span class="wlabel" style="margin-left:8px">control cost R</span>' +
    '<span class="wnum" data-r style="min-width:40px;text-align:right;display:inline-block"></span>' +
    '<button class="wb" data-rd>&darr;</button><button class="wb" data-ru>&uarr;</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">closed loop from position 1, at rest</div><div data-c1></div>' +
    '<div class="wlabel" style="margin-top:2px">the control it asks for</div><div data-c2></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the gain stops moving &mdash; Riccati, backwards</div><div data-c3></div></div>' +
    '<div data-num style="width:198px;font:400 11.5px/1.7 var(--sans);color:var(--ink2)"></div></div>';

  var W1 = 392, H1 = 128, H2 = 100, W3 = 328, H3 = 248;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W1, H2), sv3 = IE437.svg(W3, H3);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  host.querySelector('[data-c3]').appendChild(sv3);

  function nice(v) {                               /* a round-ish tick step */
    var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
  }
  function ticks(lo, hi, n) {
    var st = nice((hi - lo) / n), out = [], t = Math.ceil(lo / st) * st;
    for (; t <= hi + 1e-9; t += st) out.push(Math.abs(t) < 1e-12 ? 0 : t);
    return out;
  }

  function draw() {
    var q = QL[qi], r = RL[ri], cf = areClosed(q, r), K = cf.K;
    /* slowest closed-loop mode sets both time windows: poles of s^2 + k2 s + k1 */
    var disc = K[1] * K[1] - 4 * K[0];
    var reMin = disc >= 0 ? Math.min(Math.abs((-K[1] + Math.sqrt(disc)) / 2),
                                     Math.abs((-K[1] - Math.sqrt(disc)) / 2))
                          : K[1] / 2;
    var Tw = Math.min(40, Math.max(2, 6.5 / reMin));

    var run = riccatiRun(q, r, Tw, 1600);
    var runLong = riccatiRun(q, r, 4 * Tw, 4000);   /* the same sweep, given longer to settle */
    var S = sim(K, Tw, 900);

    /* ---------- position and velocity ---------- */
    var xs = S.tr.map(function (p) { return p[1]; }), vs = S.tr.map(function (p) { return p[2]; });
    var lo = Math.min(0, Math.min.apply(null, vs)) * 1.12, hi = 1.12;
    var a1 = IE437.plot(sv1, {
      w: W1, h: H1, pad: { l: 40, r: 12, t: 8, b: 20 },
      xdom: [0, Tw], ydom: [lo, hi], yticks: ticks(lo, hi, 3), xticks: [],
      yfmt: function (v) { return v.toFixed(1); },
      series: [
        { pts: [[0, 0], [Tw, 0]], color: INK, w: 1, dash: '3 3' },
        { pts: S.tr.map(function (p) { return [p[0], p[2]]; }), color: SLATE, w: 1.6 },
        { pts: S.tr.map(function (p) { return [p[0], p[1]]; }), color: BLUE, w: 2.2 }
      ]
    });
    E('text', { x: W1 - 14, y: 20, 'text-anchor': 'end', 'font-size': 10.5, fill: BLUE,
      'font-weight': 700, text: 'position' }, sv1);
    E('text', { x: W1 - 14, y: 34, 'text-anchor': 'end', 'font-size': 10.5, fill: SLATE,
      text: 'velocity' }, sv1);

    /* ---------- control ---------- */
    var us = S.tr.map(function (p) { return p[3]; });
    var ulo = Math.min.apply(null, us) * 1.15, uhi = Math.max(0.02, Math.max.apply(null, us) * 1.25);
    var a2 = IE437.plot(sv2, {
      w: W1, h: H2, pad: { l: 40, r: 12, t: 8, b: 26 },
      xdom: [0, Tw], ydom: [ulo, uhi], yticks: ticks(ulo, uhi, 3),
      xticks: [0, Tw / 2, Tw], xlabel: 'time (s)',
      yfmt: function (v) { return Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1); },
      xfmt: function (v) { return v.toFixed(v < 10 ? 1 : 0); },
      series: [
        { pts: [[0, 0], [Tw, 0]], color: INK, w: 1, dash: '3 3' },
        { pts: S.tr.map(function (p) { return [p[0], p[3]]; }), color: AMBER, w: 2 }
      ]
    });
    E('text', { x: W1 - 14, y: H2 - 34, 'text-anchor': 'end', 'font-size': 10.5, fill: AMBER,
      'font-weight': 700, text: 'u = −Kx' }, sv2);

    /* ---------- the gain converging ---------- */
    var gm = Math.max(K[0], K[1]) * 1.3;
    var a3 = IE437.plot(sv3, {
      w: W3, h: H3, pad: { l: 46, r: 14, t: 12, b: 30 },
      xdom: [0, Tw], ydom: [0, gm], yticks: ticks(0, gm, 4),
      xticks: [0, Tw / 2, Tw], xlabel: 'time-to-go (s)', ylabel: 'gain entries',
      yfmt: function (v) { return v.toFixed(gm >= 30 ? 0 : gm >= 3 ? 1 : 2); },
      xfmt: function (v) { return v.toFixed(v < 10 ? 1 : 0); },
      series: [
        { pts: [[0, K[0]], [Tw, K[0]]], color: INK, w: 1.3, dash: '5 4' },
        { pts: [[0, K[1]], [Tw, K[1]]], color: INK, w: 1.3, dash: '5 4' },
        { pts: run.tr.map(function (p) { return [p[0], p[1]]; }), color: BLUE, w: 2.2 },
        { pts: run.tr.map(function (p) { return [p[0], p[2]]; }), color: GREEN, w: 2.2 }
      ]
    });
    E('text', { x: a3.X(Tw) - 6, y: a3.Y(K[0]) - 7, 'text-anchor': 'end', 'font-size': 10.5,
      fill: BLUE, 'font-weight': 700, text: 'k₁' }, sv3);
    E('text', { x: a3.X(Tw) - 6, y: a3.Y(K[1]) - 7, 'text-anchor': 'end', 'font-size': 10.5,
      fill: GREEN, 'font-weight': 700, text: 'k₂' }, sv3);
    E('text', { x: a3.X(Tw * 0.05), y: 26, 'font-size': 10, 'font-style': 'italic', fill: INK,
      'fill-opacity': .5, text: 'dashed = the algebraic solution' }, sv3);

    /* ---------- numbers ---------- */
    var errW = Math.max(Math.abs(run.K[0] - K[0]), Math.abs(run.K[1] - K[1]));
    var err = Math.max(Math.abs(runLong.K[0] - K[0]), Math.abs(runLong.K[1] - K[1]));
    var pol = disc >= 0
      ? ((-K[1] + Math.sqrt(disc)) / 2).toFixed(2) + ', ' + ((-K[1] - Math.sqrt(disc)) / 2).toFixed(2)
      : (-K[1] / 2).toFixed(2) + ' ± ' + (Math.sqrt(-disc) / 2).toFixed(2) + 'i';
    var peak = Math.max.apply(null, us.map(Math.abs));
    host.querySelector('[data-q]').textContent = q;
    host.querySelector('[data-r]').textContent = r;
    host.querySelector('[data-num]').innerHTML =
      '<div style="font:600 10px/1 var(--mono);letter-spacing:.12em;color:var(--ink4);' +
      'text-transform:uppercase;margin-bottom:7px">the optimal controller</div>' +
      '<div style="font:700 14px/1.5 var(--mono);color:' + BLUE + '">u = −[' +
      K[0].toFixed(3) + ', ' + K[1].toFixed(3) + '] x</div>' +
      '<div style="margin-top:8px;font-size:11px;color:var(--ink3)">closed form<br>' +
      'k₁ = √(Q/R) = ' + K[0].toFixed(3) + '<br>k₂ = √((2√(QR)+1)/R) = ' + K[1].toFixed(3) + '</div>' +
      '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(22,24,29,.12)">' +
      '<span style="color:' + GREEN + ';font-weight:700">✓</span> the sweep matches it to ' +
      errW.toExponential(0) + ' by the end of the window, ' + err.toExponential(0) +
      ' given four times as long</div>' +
      '<div style="margin-top:7px;font-size:11px">poles <b style="font-family:var(--mono)">' + pol + '</b><br>' +
      'optimal cost <b style="font-family:var(--mono)">' + areClosed(q, r).P[0].toFixed(3) + '</b>' +
      ' <span style="color:var(--ink4)">= x₀ᵀPx₀</span><br>' +
      'peak |u| <b style="font-family:var(--mono);color:' + AMBER + '">' +
      (peak >= 10 ? peak.toFixed(1) : peak.toFixed(2)) + '</b></div>';
    host.querySelector('[data-qd]').disabled = qi <= 0;
    host.querySelector('[data-qu]').disabled = qi >= QL.length - 1;
    host.querySelector('[data-rd]').disabled = ri <= 0;
    host.querySelector('[data-ru]').disabled = ri >= RL.length - 1;
  }

  host.querySelector('[data-qd]').onclick = function () { if (qi > 0) { qi--; draw(); } };
  host.querySelector('[data-qu]').onclick = function () { if (qi < QL.length - 1) { qi++; draw(); } };
  host.querySelector('[data-rd]').onclick = function () { if (ri > 0) { ri--; draw(); } };
  host.querySelector('[data-ru]').onclick = function () { if (ri < RL.length - 1) { ri++; draw(); } };

  draw();
  return { finish: function () { draw(); } };

  /* ================= mode: recursion ================= */
  function recursion() {
    var SYS = opts.system === 'double' ? 'double' : 'heater';
    var N = Math.max(1, Math.min(12, Math.round(+opts.n || 6)));
    var FS = 13.5;                                   /* maths size inside a plate */

    /* ---- the recursion itself, on 2x2 matrices (the heater is the 1x1 case) ---- */
    var A, B, Q, R, D;                               /* D: state dimension */
    if (SYS === 'double') {
      var h = 0.5;
      A = [[1, h], [0, 1]]; B = [h * h / 2, h]; Q = [[1, 0], [0, 1]]; R = 1; D = 2;
    } else {
      A = [[1]]; B = [1]; Q = [[1]]; R = 1; D = 1;
    }
    function mul(X, Y) {                             /* DxD times DxD */
      var Z = [], i, j, k;
      for (i = 0; i < D; i++) { Z.push([]); for (j = 0; j < D; j++) { var acc = 0; for (k = 0; k < D; k++) acc += X[i][k] * Y[k][j]; Z[i].push(acc); } }
      return Z;
    }
    function tr(X) { var Z = [], i, j; for (i = 0; i < D; i++) { Z.push([]); for (j = 0; j < D; j++) Z[i].push(X[j][i]); } return Z; }
    function sweep(P) {                              /* one backward sweep: {K, Pnext} */
      var PA = mul(P, A), APA = mul(tr(A), PA), i, j;
      var BPA = [], BPB = 0;
      for (j = 0; j < D; j++) { var acc = 0; for (i = 0; i < D; i++) acc += B[i] * PA[i][j]; BPA.push(acc); }
      for (i = 0; i < D; i++) for (j = 0; j < D; j++) BPB += B[i] * P[i][j] * B[j];
      var K = BPA.map(function (v) { return v / (R + BPB); });
      var Pn = [];
      for (i = 0; i < D; i++) { Pn.push([]); for (j = 0; j < D; j++) Pn[i].push(Q[i][j] + APA[i][j] - BPA[i] * K[j]); }
      return { K: K, P: Pn };
    }
    var SEQ = [], P = Q, k, r;                       /* SEQ[k-1] = {P: P_k, K: K_k} */
    for (k = 1; k <= 60; k++) { r = sweep(P); SEQ.push({ P: P, K: r.K }); P = r.P; }
    var LIM = SEQ[59].K;                             /* the gain the recursion settles on */

    /* ---- digits: red where the previous plate had a different digit ---- */
    function f4(v) { return v.toFixed(4); }
    function diffTex(cur, prev) {
      var a = f4(cur), b = prev == null ? a : f4(prev), out = '', run = '', red = false, i;
      function flush() { if (run) out += red ? '\\red{' + run + '}' : run; run = ''; }
      for (i = 0; i < a.length; i++) {
        var isRed = a[i] !== b[i];
        if (isRed !== red) { flush(); red = isRed; }
        run += a[i];
      }
      flush();
      return out;
    }

    host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:8px 12px 4px"><div data-c></div></div>';
    var mount = host.querySelector('[data-c]');
    var W = 1000, H = SYS === 'double' ? 340 : 320;
    var svg = IE437.svg(W, H); mount.appendChild(svg);

    /* geometry: a row of plates, the plot under them */
    var PX = 10, GAP = 10, PW = Math.min(170, Math.floor((W - 2 * PX - GAP * (N - 1)) / N));
    var PY = 30, PH = SYS === 'double' ? 88 : 62, ROWS = SYS === 'double' ? 2 : 1;
    var PLOT_T = PY + PH + 34, PLOT_R = W - 200, PLOT_L = 60;

    function lbl(x, y, str, a) {
      var at = { x: x, y: y, 'font-size': 11.5, fill: SLATE, 'font-family': 'var(--sans)', text: str };
      for (var q in a || {}) at[q] = a[q];
      return E('text', at, svg);
    }
    /* a bracketed block of numbers, right-aligned columns; rows = [[tex, tex], ...] */
    function matrix(x, y, rows, colW, rowH) {
      var cols = rows[0].length, innerW = cols * colW + (cols - 1) * 8, hgt = rows.length * rowH;
      var top = y - rowH + 4, bot = top + hgt + 2, i, j;
      var bl = x, br = x + 5 + innerW + 5;
      E('path', { d: 'M' + (bl + 4) + ' ' + top + ' H' + bl + ' V' + bot + ' H' + (bl + 4), fill: 'none', stroke: INK, 'stroke-width': 1.1 }, svg);
      E('path', { d: 'M' + (br - 4) + ' ' + top + ' H' + br + ' V' + bot + ' H' + (br - 4), fill: 'none', stroke: INK, 'stroke-width': 1.1 }, svg);
      for (i = 0; i < rows.length; i++) for (j = 0; j < cols; j++)
        IE437.math(svg, bl + 5 + (j + 1) * colW + j * 8, y + i * rowH, rows[i][j], { 'font-size': FS, 'text-anchor': 'end' });
      return br;
    }

    function nice(v) { var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
    function ticks(lo, hi, n) {
      var st = nice((hi - lo) / n), out = [], t = Math.ceil(lo / st) * st;
      for (; t <= hi + 1e-9; t += st) out.push(Math.abs(t) < 1e-12 ? 0 : t);
      return out;
    }

    function draw(st) {
      var m = Math.min(N, st + 1), limit = st >= N, i, j;
      /* ---- the plot first: IE437.plot clears the svg ---- */
      var top = 0; for (i = 0; i < N; i++) for (j = 0; j < D; j++) top = Math.max(top, SEQ[i].K[j]);
      for (j = 0; j < D; j++) top = Math.max(top, LIM[j]);
      var ymax = nice(top * 1.25), series = [], COL = [BLUE, GREEN];
      if (limit) for (j = 0; j < D; j++) series.push({ pts: [[0.5, LIM[j]], [N + 0.5, LIM[j]]], color: INK, w: 1.3, dash: '5 4' });
      for (j = 0; j < D; j++) series.push({ pts: SEQ.slice(0, m).map(function (q, idx) { return [idx + 1, q.K[j]]; }), color: COL[j], w: 2, dots: true });
      var xt = []; for (i = 1; i <= N; i++) xt.push(i);
      var ax = IE437.plot(svg, {
        w: W, h: H, pad: { l: PLOT_L, r: W - PLOT_R, t: PLOT_T, b: 28 },
        xdom: [0.5, N + 0.5], ydom: [0, ymax], xticks: xt, yticks: ticks(0, ymax, 4),
        xlabel: 'sweep k', ylabel: D > 1 ? 'gain entries' : 'gain K',
        xfmt: function (v) { return String(v); }, yfmt: function (v) { return v.toFixed(ymax >= 3 ? 1 : 2); },
        series: series
      });
      if (D > 1) {                                   /* which line is which entry: in the gap left of the first dot */
        IE437.math(svg, ax.X(1) - 9, ax.Y(SEQ[0].K[0]) + 3, 'k_1', { 'font-size': 12.5, fill: BLUE, 'font-weight': 700, 'text-anchor': 'end' });
        IE437.math(svg, ax.X(1) - 9, ax.Y(SEQ[0].K[1]) + 3, 'k_2', { 'font-size': 12.5, fill: GREEN, 'font-weight': 700, 'text-anchor': 'end' });
      }
      if (limit) {
        var lx = PLOT_R + 10;
        if (D > 1) {
          IE437.math(svg, lx, ax.Y(LIM[0]) + 4, 'K_{\\infty,1} = ' + LIM[0].toFixed(3), { 'font-size': 13.5, fill: BLUE });
          IE437.math(svg, lx, ax.Y(LIM[1]) + 4, 'K_{\\infty,2} = ' + LIM[1].toFixed(3), { 'font-size': 13.5, fill: GREEN });
          lbl(lx, ax.Y(LIM[1]) - 16, 'the gain stops moving');
        } else {
          IE437.math(svg, lx, ax.Y(LIM[0]) + 4, 'K_\\infty = ' + LIM[0].toFixed(3), { 'font-size': 13.5 });
          lbl(lx, ax.Y(LIM[0]) - 14, 'the gain stops moving');
        }
      }
      /* ---- the plates ---- */
      for (i = 0; i < m; i++) {
        var x = PX + i * (PW + GAP), cur = SEQ[i], prev = i > 0 ? SEQ[i - 1] : null, lit = i === m - 1;
        lbl(x, PY - 8, 'sweep ' + (i + 1), { fill: RED, 'font-weight': 700, 'font-size': 12 });
        E('rect', { x: x, y: PY, width: PW, height: PH, rx: 6, fill: PANEL, stroke: lit ? BLUE : PANEL2, 'stroke-width': lit ? 1.8 : 1 }, svg);
        if (i === 0) lbl(x, PY + PH + 15, '= the one-step problem');
        var sub = String(i + 1);
        if (D === 1) {
          IE437.math(svg, x + 12, PY + 24, 'P_{' + sub + '} = ' + diffTex(cur.P[0][0], prev && prev.P[0][0]), { 'font-size': FS });
          IE437.math(svg, x + 12, PY + 48, 'K_{' + sub + '} = ' + diffTex(cur.K[0], prev && prev.K[0]), { 'font-size': FS });
        } else {
          var rowsP = cur.P.map(function (row, a) { return row.map(function (v, b) { return diffTex(v, prev && prev.P[a][b]); }); });
          var rowK = [cur.K.map(function (v, b) { return diffTex(v, prev && prev.K[b]); })];
          IE437.math(svg, x + 10, PY + 24, 'P_{' + sub + '} =', { 'font-size': FS });
          matrix(x + 44, PY + 24, rowsP, 40, 20);
          IE437.math(svg, x + 10, PY + 70, 'K_{' + sub + '} =', { 'font-size': FS });
          matrix(x + 44, PY + 70, rowK, 40, 20);
        }
      }
    }

    draw(0);
    return { steps: N, step: draw, reset: function () { draw(0); }, finish: function () { draw(N); } };
  }
});
