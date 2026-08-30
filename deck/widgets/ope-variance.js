/* ============================================================
   widget: ope-variance                            (Chapter 12, Act 4)
   Off-policy evaluation: how wrong is an estimate of a policy you are
   not allowed to run?

   The problem is deliberately the smallest one that shows the wall.
   H decisions; two actions; the good action pays 1 and the other 0,
   plus N(0, 0.3^2) noise; gamma = 1, so V^pi = 0.9 H exactly.
   The behaviour policy is a coin flip, the target takes the good
   action nine times in ten -- so the per-step ratio is 1.8 or 0.2 and
   E_beta[rho^2] = q = 1.64.

   IS, per-decision IS, doubly robust and the direct (model / FQE)
   estimator all have CLOSED-FORM error here, and the widget draws
   those exact curves rather than a simulation, because a simulation of
   this quantity is itself untrustworthy -- see below. Only weighted IS,
   which has no closed form, is simulated (150 replications of n = 200
   trajectories, prefixes shared across H, seeded).

   Verified in node before shipping. n = 200 logged trajectories, model
   reward error b = 0.05; RMSE, and the analytic value checked against
   2000 simulated replications at every H up to 14:

       H      V^pi        IS      PDIS       WIS        DR     model
       1       0.9     0.069     0.069     0.028     0.027     0.045
       4       3.6     0.717     0.390     0.143     0.087     0.180
       8       7.2     4.037     1.447     0.609     0.254     0.360
      12      10.8    16.361     4.219     1.125     0.692     0.540
      16      14.4    58.665    11.569     1.843     1.866     0.720
      20      18.0   197.128    31.250     2.718     5.023     0.900
      24      21.6   635.970    84.124     3.903    13.510     1.080

   analytic vs simulated (2000 reps) agree to ~1% up to H = 12 and then
   diverge -- at H = 24 the simulation reports 112 where the truth is
   636, because the weight distribution is so heavy-tailed that 2000
   replications never see the tail. Doubly robust runs a decade and a
   half below IS and PARALLEL to it: it scales the exponential by the
   Bellman residual, it does not remove it.
   ============================================================ */
IE437.widget('ope-variance', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  var PB = 0.5, PT = 0.9, SIG = 0.3, NTRAJ = 200, HMAX = 24;
  var W1 = PT / PB, W0 = (1 - PT) / (1 - PB);
  var Q2 = PB * W1 * W1 + (1 - PB) * W0 * W0;            /* E_beta[rho^2] = 1.64 */
  var E_r2r2 = PB * W1 * W1 * (1 + SIG * SIG) + (1 - PB) * W0 * W0 * SIG * SIG;
  var E_r2r  = PB * W1 * W1;
  var E_rr   = PB * W1;
  var BIAS = [0.02, 0.05, 0.30], bi = 1, H = 12;

  /* ---------- exact root-mean-square error --------------------------- */
  function curves(H, b) {
    var V = PT * H, t, s, c, n = NTRAJ;
    /* importance sampling */
    var EW2G2 = H * Math.pow(Q2, H - 1) * E_r2r2 + H * (H - 1) * Math.pow(Q2, H - 2) * E_r2r * E_r2r;
    var vIS = (EW2G2 - V * V) / n;
    /* per-decision importance sampling */
    s = 0; c = 0;
    for (t = 1; t <= H; t++) { s += Math.pow(Q2, t - 1) * E_r2r2; c += Math.pow(Q2, t - 1) * E_r2r * E_rr * (H - t); }
    var vPD = (s + 2 * c - V * V) / n;
    /* doubly robust: the residual is r - muhat(a), muhat(good) = 1 - b */
    var E_r2d2 = PB * W1 * W1 * (SIG * SIG + b * b) + (1 - PB) * W0 * W0 * SIG * SIG;
    var E_r2d = PB * W1 * W1 * b, E_rd = PB * W1 * b;
    s = 0; c = 0;
    for (t = 1; t <= H; t++) { s += Math.pow(Q2, t - 1) * E_r2d2; c += Math.pow(Q2, t - 1) * E_r2d * E_rd * (H - t); }
    var m = H * E_rd, vDR = (s + 2 * c - m * m) / n;
    return { IS: Math.sqrt(Math.max(1e-12, vIS)), PDIS: Math.sqrt(Math.max(1e-12, vPD)),
             DR: Math.sqrt(Math.max(1e-12, vDR)), MODEL: PT * H * b, V: V };
  }

  /* ---------- weighted IS has no closed form, so simulate it ---------- */
  var REPS = 150;
  var WISC = (function () {
    var R = IE437.rng(opts.seed || 9), acc = [], h, k, jj, t;
    for (h = 0; h <= HMAX; h++) acc.push(0);
    for (k = 0; k < REPS; k++) {
      var num = [], den = [];
      for (h = 0; h <= HMAX; h++) { num.push(0); den.push(0); }
      for (jj = 0; jj < NTRAJ; jj++) {
        var w = 1, g = 0;
        for (t = 1; t <= HMAX; t++) {
          var a = R() < PB ? 1 : 0;
          var u1 = R() || 1e-12, u2 = R();
          var eps = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          w *= a ? W1 : W0;
          g += (a ? 1 : 0) + SIG * eps;
          num[t] += w * g; den[t] += w;
        }
      }
      for (h = 1; h <= HMAX; h++) {
        var est = den[h] > 0 ? num[h] / den[h] : 0;
        acc[h] += Math.pow(est - PT * h, 2) / REPS;
      }
    }
    return acc.map(function (v) { return Math.sqrt(v); });
  })();

  if (typeof IE437.__probe === 'function') IE437.__probe({ curves: curves, WISC: WISC, HMAX: HMAX, N: NTRAJ, Q2: Q2 });

  /* ---------- shell ---------------------------------------------------- */
  host.innerHTML =
    '<div class="wbar"><span class="wt">The estimate you must trust before you deploy</span><span class="wspacer"></span>' +
    '<span class="wlabel">reward model off by</span>' +
    '<button class="wb" data-b="0">2%</button><button class="wb on" data-b="1">5%</button>' +
    '<button class="wb" data-b="2">30%</button></div>' +
    '<div class="wbody" style="gap:8px">' +
    '<div style="display:flex;flex-direction:row;gap:14px;align-items:flex-start;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:212px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.5 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>' +
    '<input type="range" min="1" max="' + HMAX + '" value="' + H + '" data-sl ' +
    'style="width:100%;accent-color:#16181D">' +
    '</div>';

  var CW = 656, CH = 266;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  var SERIES = [
    { k: 'IS',    lab: 'importance sampling', col: RED,   w: 2.4 },
    { k: 'PDIS',  lab: 'per-decision IS',     col: AMBER, w: 2.0 },
    { k: 'DR',    lab: 'doubly robust',       col: GREEN, w: 2.2 },
    { k: 'WIS',   lab: 'weighted IS',         col: BLUE,  w: 2.0 },
    { k: 'MODEL', lab: 'model / FQE',         col: SLATE, w: 1.8, dash: '4 3' }
  ];

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var b = BIAS[bi], L = 46, Rr = 118, T = 12, B = 28, h, i;
    var lo = -2.1, hi = 3.05;
    var PX = function (x) { return L + (x - 1) / (HMAX - 1) * (CW - L - Rr); };
    var PY = function (y) { return CH - B - (Math.log10(Math.max(1e-3, y)) - lo) / (hi - lo) * (CH - T - B); };

    [-2, -1, 0, 1, 2, 3].forEach(function (e) {
      E('line', { x1: L, x2: CW - Rr, y1: PY(Math.pow(10, e)), y2: PY(Math.pow(10, e)),
        stroke: INK, 'stroke-opacity': .085 }, sv);
      E('text', { x: L - 5, y: PY(Math.pow(10, e)) + 3.2, 'text-anchor': 'end', 'font-size': 8.5,
        fill: INK, 'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace',
        text: e === -2 ? '0.01' : (e === -1 ? '0.1' : String(Math.pow(10, e))) }, sv);
    });
    E('line', { x1: L, x2: CW - Rr, y1: CH - B, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: L, x2: L, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    [1, 6, 12, 18, 24].forEach(function (x) {
      E('text', { x: PX(x), y: CH - B + 14, 'text-anchor': 'middle', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: x }, sv);
    });
    E('text', { x: (L + CW - Rr) / 2, y: CH - 3, 'text-anchor': 'middle', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45,
      text: 'horizon H  (decisions per trajectory)' }, sv);

    /* the quantity being estimated, for scale */
    var vp = [];
    for (h = 1; h <= HMAX; h++) vp.push(PX(h).toFixed(1) + ' ' + PY(PT * h).toFixed(1));
    E('path', { d: 'M' + vp.join('L'), fill: 'none', stroke: INK, 'stroke-width': 1.4,
      'stroke-dasharray': '2 4', 'stroke-opacity': .55 }, sv);
    var ends = [{ y: PY(PT * HMAX), col: INK, lab: 'V of the policy', faint: 1 }];
    SERIES.forEach(function (se) {
      var pts = [], last = 0;
      for (h = 1; h <= HMAX; h++) {
        var y = se.k === 'WIS' ? WISC[h] : curves(h, b)[se.k];
        last = y;
        pts.push(PX(h).toFixed(1) + ' ' + PY(y).toFixed(1));
      }
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: se.col, 'stroke-width': se.w,
        'stroke-dasharray': se.dash || '', 'stroke-linejoin': 'round' }, sv);
      ends.push({ y: PY(last), col: se.col, lab: se.lab });
    });
    /* de-collide the right-hand labels */
    ends.sort(function (p, q) { return p.y - q.y; });
    for (i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;
    ends.forEach(function (p) {
      E('text', { x: CW - Rr + 5, y: p.y + 3.5, 'font-size': 9.5, fill: p.col,
        'fill-opacity': p.faint ? .6 : 1, 'font-weight': p.faint ? 600 : 700, text: p.lab }, sv);
    });

    /* the marker */
    var c = curves(H, b);
    E('line', { x1: PX(H), y1: T, x2: PX(H), y2: CH - B, stroke: INK, 'stroke-opacity': .3,
      'stroke-dasharray': '2 3' }, sv);
    SERIES.forEach(function (se) {
      var y = se.k === 'WIS' ? WISC[H] : c[se.k];
      E('circle', { cx: PX(H), cy: PY(y), r: 3.4, fill: se.col }, sv);
    });

    /* ---------- readout ---------- */
    var rows = [['importance sampling', c.IS, RED], ['per-decision IS', c.PDIS, AMBER],
                ['weighted IS', WISC[H], BLUE], ['doubly robust', c.DR, GREEN],
                ['model / FQE', c.MODEL, SLATE]];
    host.querySelector('[data-num]').innerHTML =
      '<b>H = ' + H + '</b> &middot; n = ' + NTRAJ + ' logged trajectories<br>' +
      'the true value is <b>' + c.V.toFixed(1) + '</b><br>' +
      '<div style="margin-top:6px;font:400 11.5px/1.6 var(--sans)">' + rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between">' +
          '<span style="color:' + r[2] + '">' + r[0] + '</span><b>' +
          (r[1] >= 100 ? r[1].toFixed(0) : r[1].toFixed(r[1] < 1 ? 3 : 2)) + '</b></div>';
      }).join('') + '</div>';
    host.querySelector('[data-note]').innerHTML =
      c.IS > c.V
        ? 'Ordinary IS is now <b>wrong by more than the quantity it is estimating</b>. Its weight is a product of ' + H +
          ' ratios, and Var grows like q<sup>H</sup> with q = 1.64.'
        : 'Every ratio in the product is either 1.8 or 0.2. At short horizons that is survivable; the exponent is the horizon.';
  }

  host.querySelectorAll('.wb').forEach(function (btn) {
    btn.onclick = function () {
      bi = +btn.getAttribute('data-b');
      host.querySelectorAll('.wb').forEach(function (o) { o.classList.toggle('on', o === btn); });
      draw();
    };
  });
  host.querySelector('[data-sl]').oninput = function (ev) { H = +ev.target.value; draw(); };

  draw();
  return { finish: function () { H = 20; bi = 1; draw(); } };
});
