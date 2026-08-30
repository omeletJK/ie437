/* ============================================================
   widget: rollout-drift
   Act 2's claim, watched rather than asserted. A model fitted to
   transitions collected in a band around the origin is excellent
   inside that band and hopeless outside it. Rolled out open loop
   it is composed with its OWN output, walks out of the band, and
   the error climbs by orders of magnitude. Re-measuring the state
   each step — which is all MPC does — holds it flat.

   Everything here is solved, not sketched: the model is a real
   least-squares fit and the rollouts are real compositions.
   Verified in node over the whole coverage grid; at the default
   setting the open-loop error at h = 14 is ~2.2e1 against a
   re-planned ~2.3e-1, a factor of about 100.
   ============================================================ */
IE437.widget('rollout-drift', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', SLATE = '#64748B';
  var seed = (opts && opts.seed) || 17;

  /* --- the world: x' = 0.45x + 0.5 sin(2x) + 0.35u  (bounded, folds back) --- */
  var A = 0.45, S = 0.50, KK = 2.0, B = 0.35, NOISE = 0.02, NDATA = 300;
  function f(x, u) { return A * x + S * Math.sin(KK * x) + B * u; }
  function gauss(r) { var s = 0; for (var i = 0; i < 12; i++) s += r(); return s - 6; }

  var COV = [0.3, 0.5, 0.8, 1.3, 2.0];
  var ci = 1, H = 10, HMAX = 14;

  var ACTS = []; for (var h = 0; h < HMAX; h++) ACTS.push(0.5 * Math.sin(0.8 * h + 0.4));
  var X0 = 0.15;

  /* least squares for x' ~ a x + b u, plus the training residual */
  function fit(spread) {
    var r = IE437.rng(seed), Sxx = 0, Sxu = 0, Suu = 0, Sxy = 0, Suy = 0, D = [];
    for (var i = 0; i < NDATA; i++) {
      var x = (r() * 2 - 1) * spread, u = (r() * 2 - 1) * 0.6, y = f(x, u) + gauss(r) * NOISE;
      Sxx += x * x; Sxu += x * u; Suu += u * u; Sxy += x * y; Suy += u * y;
      D.push([x, u, y]);
    }
    var det = Sxx * Suu - Sxu * Sxu;
    var a = (Suu * Sxy - Sxu * Suy) / det, b = (Sxx * Suy - Sxu * Sxy) / det;
    var sse = 0;
    D.forEach(function (d) { var e = a * d[0] + b * d[1] - d[2]; sse += e * e; });
    /* a separate stream for the scatter, so it never perturbs the fit */
    var rs = IE437.rng(seed + 991), pts = [];
    for (var k = 0; k < 46; k++) {
      var xs = (rs() * 2 - 1) * spread;
      pts.push([xs, f(xs, 0) + gauss(rs) * NOISE]);
    }
    return { a: a, b: b, rmse: Math.sqrt(sse / NDATA), pts: pts };
  }

  function roll(m) {
    var xt = X0, xo = X0, tr = [X0], mo = [X0], rp = [], eo = [], er = [];
    for (var h = 0; h < HMAX; h++) {
      var u = ACTS[h];
      var xoN = m.a * xo + m.b * u, xrN = m.a * xt + m.b * u, xtN = f(xt, u);
      eo.push(Math.abs(xoN - xtN)); er.push(Math.abs(xrN - xtN));
      rp.push(xrN); xo = xoN; xt = xtN; tr.push(xtN); mo.push(xoN);
    }
    return { tr: tr, mo: mo, rp: rp, eo: eo, er: er };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">A learned model, iterated on its own output</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">data band</span><span class="wnum" data-cv style="min-width:44px;display:inline-block;text-align:right"></span>' +
    '<button class="wb" data-cd>narrower</button><button class="wb" data-cu>wider</button>' +
    '<span class="wlabel" style="margin-left:10px">horizon</span>' +
    '<span class="wnum" data-hh style="min-width:22px;display:inline-block;text-align:right"></span>' +
    '<button class="wb" data-hd>&minus;</button><button class="wb" data-hu>+</button></div>' +
    '<div class="wbody">' +
    '<div style="display:flex;flex-direction:row;gap:22px;align-items:flex-start;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">one step &mdash; truth vs learned model</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the rollout</div><div data-c2></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">error, log&#8321;&#8320; scale</div><div data-c3></div></div></div>' +
    '<div data-num style="font:400 12px/1.6 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:8px;margin-top:2px"></div></div>';

  var W = 296, Hh = 190;
  var s1 = IE437.svg(W, Hh), s2 = IE437.svg(W, Hh), s3 = IE437.svg(W, Hh);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);
  host.querySelector('[data-c3]').appendChild(s3);

  function legend(sv, items, x, y) {
    items.forEach(function (it, i) {
      var yy = y + i * 12;
      E('line', { x1: x, y1: yy, x2: x + 14, y2: yy, stroke: it[1], 'stroke-width': 2,
        'stroke-dasharray': it[2] || '' }, sv);
      E('text', { x: x + 18, y: yy + 3.2, 'font-size': 8.5, fill: INK, 'fill-opacity': .6,
        'font-family': 'IBM Plex Mono, monospace', text: it[0] }, sv);
    });
  }

  function draw() {
    var spread = COV[ci], m = fit(spread), R = roll(m);

    /* ---------- 1 · the one-step map ---------- */
    var xd = [-2.4, 2.4], yd = [-1.5, 1.5];
    var truePts = [], modPts = [];
    for (var i = 0; i <= 200; i++) {
      var x = xd[0] + (xd[1] - xd[0]) * i / 200;
      truePts.push([x, f(x, 0)]);
      var mv = m.a * x; if (mv > yd[1] + 0.4) mv = yd[1] + 0.4; if (mv < yd[0] - 0.4) mv = yd[0] - 0.4;
      modPts.push([x, mv]);
    }
    var p1 = IE437.plot(s1, {
      w: W, h: Hh, pad: { l: 30, r: 8, t: 10, b: 26 }, xdom: xd, ydom: yd,
      xticks: [-2, -1, 0, 1, 2], yticks: [-1, 0, 1], xlabel: 'state x',
      series: [{ pts: truePts, color: BLUE, w: 2.2 }, { pts: modPts, color: AMBER, w: 2, dash: '5 3' }]
    });
    E('rect', { x: p1.X(-spread), y: 10, width: p1.X(spread) - p1.X(-spread), height: Hh - 36,
      fill: GREEN, 'fill-opacity': .085 }, s1);
    E('text', { x: (p1.X(-spread) + p1.X(spread)) / 2, y: 20, 'text-anchor': 'middle',
      'font-size': 8, 'font-family': 'IBM Plex Mono, monospace', fill: GREEN, 'fill-opacity': .9,
      text: 'DATA' }, s1);
    m.pts.forEach(function (p) {
      if (Math.abs(p[1]) < yd[1]) E('circle', { cx: p1.X(p[0]), cy: p1.Y(p[1]), r: 1.9,
        fill: GREEN, 'fill-opacity': .75 }, s1);
    });
    legend(s1, [['truth', BLUE], ['model', AMBER, '5 3']], 36, 22);

    /* ---------- 2 · the rollout ---------- */
    var yd2 = [-0.5, 2.1];
    var trS = [], moS = [], escape = null;
    for (var h = 0; h <= H; h++) trS.push([h, R.tr[h]]);
    for (var h2 = 0; h2 <= H; h2++) {
      var v = R.mo[h2];
      if (v > yd2[1]) {
        var prev = R.mo[h2 - 1], t = (yd2[1] - prev) / (v - prev);
        moS.push([h2 - 1 + t, yd2[1]]); escape = h2 - 1 + t; break;
      }
      moS.push([h2, v]);
    }
    var p2 = IE437.plot(s2, {
      w: W, h: Hh, pad: { l: 30, r: 8, t: 10, b: 26 }, xdom: [0, H], ydom: yd2,
      xticks: (function () { var t = []; for (var k = 0; k <= H; k += (H > 8 ? 2 : 1)) t.push(k); return t; })(),
      yticks: [0, 1, 2], xlabel: 'planning step h',
      series: [{ pts: trS, color: BLUE, w: 2.2, dots: true },
               { pts: moS, color: AMBER, w: 2, dash: '5 3' }]
    });
    for (var h3 = 0; h3 < H; h3++) {
      if (R.rp[h3] > yd2[0] && R.rp[h3] < yd2[1])
        E('circle', { cx: p2.X(h3 + 1), cy: p2.Y(R.rp[h3]), r: 2.9, fill: 'none',
          stroke: GREEN, 'stroke-width': 1.6 }, s2);
    }
    if (escape !== null) {
      E('path', { d: 'M' + p2.X(escape) + ' ' + (p2.Y(yd2[1]) + 1) + 'l-4 7 l8 0 Z',
        fill: AMBER }, s2);
      E('text', { x: Math.min(p2.X(escape) + 7, W - 12), y: p2.Y(yd2[1]) + 15, 'font-size': 8,
        'font-family': 'IBM Plex Mono, monospace', fill: AMBER, text: 'off the chart' }, s2);
    }
    legend(s2, [['true', BLUE], ['open loop', AMBER, '5 3'], ['re-planned', GREEN]], 36, 24);

    /* ---------- 3 · error, log scale ---------- */
    var lg = function (v) { return Math.log(Math.max(v, 1e-4)) / Math.LN10; };
    var eo = [], er = [];
    for (var h4 = 1; h4 <= H; h4++) { eo.push([h4, lg(R.eo[h4 - 1])]); er.push([h4, lg(R.er[h4 - 1])]); }
    IE437.plot(s3, {
      w: W, h: Hh, pad: { l: 32, r: 8, t: 10, b: 26 }, xdom: [1, H], ydom: [-3, 1.8],
      xticks: (function () { var t = []; for (var k = 1; k <= H; k += (H > 8 ? 3 : 2)) t.push(k); return t; })(),
      yticks: [-3, -2, -1, 0, 1], yfmt: function (t) { return '10' + ['⁻³', '⁻²', '⁻¹', '⁰', '¹'][t + 3]; },
      xlabel: 'planning step h',
      series: [{ pts: eo, color: AMBER, w: 2.2, dots: true }, { pts: er, color: GREEN, w: 2.2, dots: true }]
    });
    legend(s3, [['open loop', AMBER], ['re-planned', GREEN]], 40, 22);

    /* ---------- readout ---------- */
    var e1 = R.eo[0], eH = R.eo[H - 1], rH = R.er[H - 1];
    var ex = function (v) { return v < 1 ? v.toFixed(3) : (v < 10 ? v.toFixed(2) : v.toFixed(1)); };
    host.querySelector('[data-cv]').textContent = '±' + spread.toFixed(1);
    host.querySelector('[data-hh]').textContent = H;
    host.querySelector('[data-num]').innerHTML =
      'model fitted on ' + NDATA + ' transitions from |x| &le; ' + spread.toFixed(1) +
      ' &nbsp;&middot;&nbsp; <b>training residual ' + m.rmse.toFixed(3) + '</b>' +
      ' &nbsp;&middot;&nbsp; one step ahead ' + e1.toFixed(3) +
      ' &nbsp;&middot;&nbsp; <b style="color:' + AMBER + '">open loop at h=' + H + ': ' + ex(eH) + '</b>' +
      ' &nbsp;&middot;&nbsp; <b style="color:' + GREEN + '">re-planned: ' + rH.toFixed(3) + '</b>' +
      ' &nbsp;&middot;&nbsp; a factor of <b>' + (eH / rH).toFixed(0) + '</b>';
  }

  host.querySelector('[data-cd]').onclick = function () { ci = Math.max(0, ci - 1); draw(); };
  host.querySelector('[data-cu]').onclick = function () { ci = Math.min(COV.length - 1, ci + 1); draw(); };
  host.querySelector('[data-hd]').onclick = function () { H = Math.max(4, H - 2); draw(); };
  host.querySelector('[data-hu]').onclick = function () { H = Math.min(HMAX, H + 2); draw(); };

  draw();
  return { finish: function () { ci = 1; H = 14; draw(); } };
});
