/* ============================================================
   widget: manifold-search                          (Chapter 6, G1 and G4)
   Validity is not the same as reliability, drawn on one 2-D problem.

   The design space is the plane, but the valid designs form a thin curve
        c(t) = (t, 0.9 sin(1.15 t)),  t in [-2.8, 2.8],  half-width 0.12.
   Off the curve a point is not a design at all. Along it the true value is
        g(t) = 2.2 N(t; 1.8, 0.45) + 1.2 N(t; -1.5, 0.55) + 0.2   (unnormalised bumps)
   36 measured designs lie on the curve with t in [-2.5, 1.05]: the left
   good region is measured, the right (better) one is not.
   The surrogate f_hat(x) is a ridge fit on quadratic features of x (data
   RMSE 0.065). A latent surrogate f_hat(t) is a ridge fit on ReLU knots in t.

   mode "g1"  walked by the deck's ->:
     0  the valid curve, the data, and the latent coordinate t
     1  ascent on f_hat(x) from the best design: off the curve within two
        steps; at the corner f_hat promises 4.97
     The decoder is the known curve itself — a teaching device, exact by
     construction; a learned decoder is only approximately valid.
     2  search the code t instead: argmax f_hat(t) = t 2.80 — valid, but
        worth 0.39 (f_hat 1.88); the true best is 2.40 at t = 1.8
   mode "g4"  drag s, the guidance strength. The sampler stands in for a
        diffusion sampler: annealed Langevin dynamics on a kernel density of
        the data (bandwidth 0.10; its noise-conditional score is exact),
        plus s * grad f_hat(x); 150 samples, 9 noise levels x 12 steps.
        Verified in node (seed 5, sampler seed 9), averages over the VALID
        samples only, predicted / true:
          s 0    valid 87%  0.68 / 0.68 (= the data's)
          s 1    valid 83%  0.91 / 0.90      s 1.5  valid 74%  0.97 / 0.96
          s 2    valid 63%  1.00 / 0.99      s 3    valid 37%  0.95 / 0.98
          s 4    valid 19%  0.83 / 0.98
        On the curve the surrogate is accurate; what grows with s is the
        share of samples that are not designs. Seeds 3, 7, 11 agree.
   ============================================================ */
IE437.widget('manifold-search', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', AMBER = '#B45309', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  var MODE = opts.mode === 'g4' ? 'g4' : 'g1';
  var AMP = 0.9, FRQ = 1.15, T0 = -2.8, T1 = 2.8, HW = 0.12, N = 36;
  function c(t) { return [t, AMP * Math.sin(FRQ * t)]; }
  function bump(t, m, s) { return Math.exp(-(t - m) * (t - m) / (2 * s * s)); }
  function g(t) { return 2.2 * bump(t, 1.8, 0.45) + 1.2 * bump(t, -1.5, 0.55) + 0.2; }
  function gauss(r) { var u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var TG = [], i, j;
  for (i = 0; i <= 2800; i++) TG.push(T0 + (T1 - T0) * i / 2800);
  function proj(x) {
    var bd = 1e9, bt = 0;
    for (var k = 0; k < TG.length; k += 2) { var p = c(TG[k]), d = (p[0] - x[0]) * (p[0] - x[0]) + (p[1] - x[1]) * (p[1] - x[1]); if (d < bd) { bd = d; bt = TG[k]; } }
    return { t: bt, d: Math.sqrt(bd) };
  }
  /* the data */
  var R = IE437.rng(opts.seed || 5), D = [];
  for (i = 0; i < N; i++) {
    var t = -2.5 + 3.6 * (i + 0.5 + 0.6 * (R() - 0.5)) / N, p = c(t);
    var nx = -AMP * FRQ * Math.cos(FRQ * t), ny = 1, L = Math.hypot(nx, ny), o = 0.05 * (2 * R() - 1);
    D.push({ x: [p[0] + o * nx / L, p[1] + o * ny / L], t: t, y: g(t) + 0.03 * (2 * R() - 1) });
  }
  function ridge(F, y, lam) {
    var P = F[0].length, M = [], b = new Array(P).fill(0), a, k;
    for (a = 0; a < P; a++) M.push(new Array(P).fill(0));
    F.forEach(function (f, n) { for (a = 0; a < P; a++) { b[a] += f[a] * y[n]; for (k = 0; k < P; k++) M[a][k] += f[a] * f[k]; } });
    for (a = 1; a < P; a++) M[a][a] += lam;
    var X = M.map(function (r, q) { return r.concat([b[q]]); }), cc, r2, pv, d, f2, tmp;
    for (cc = 0; cc < P; cc++) {
      pv = cc; for (r2 = cc + 1; r2 < P; r2++) if (Math.abs(X[r2][cc]) > Math.abs(X[pv][cc])) pv = r2;
      tmp = X[cc]; X[cc] = X[pv]; X[pv] = tmp; d = X[cc][cc]; for (k = cc; k <= P; k++) X[cc][k] /= d;
      for (r2 = 0; r2 < P; r2++) { if (r2 === cc) continue; f2 = X[r2][cc]; for (k = cc; k <= P; k++) X[r2][k] -= f2 * X[cc][k]; }
    }
    return X.map(function (row) { return row[P]; });
  }
  function fx(x) { return [1, x[0], x[1], x[0] * x[0], x[0] * x[1], x[1] * x[1]]; }
  var WX = ridge(D.map(function (d) { return fx(d.x); }), D.map(function (d) { return d.y; }), 0.05);
  function fhx(x) { var f = fx(x), s = 0; for (var a = 0; a < 6; a++) s += f[a] * WX[a]; return s; }
  function gradx(x) { var h = 1e-4; return [(fhx([x[0] + h, x[1]]) - fhx([x[0] - h, x[1]])) / (2 * h), (fhx([x[0], x[1] + h]) - fhx([x[0], x[1] - h])) / (2 * h)]; }
  var KN = []; for (j = 0; j < 20; j++) KN.push(T0 + (T1 - T0) * j / 19);
  function ft(t) { var v = [1, t / 3]; KN.forEach(function (k) { v.push(Math.max(0, t - k) / 2); v.push(Math.max(0, k - t) / 2); }); return v; }
  var WT = ridge(D.map(function (d) { return ft(d.t); }), D.map(function (d) { return d.y; }), 0.02);
  function fht(t) { var f = ft(t), s = 0; for (var a = 0; a < f.length; a++) s += f[a] * WT[a]; return s; }
  function clipx(x) { return [Math.max(-3, Math.min(3, x[0])), Math.max(-2, Math.min(2, x[1]))]; }
  var bi = 0; D.forEach(function (d, k) { if (d.y > D[bi].y) bi = k; });
  var DMAX = Math.max.apply(null, D.map(function (d) { return d.t; }));
  /* G1: ascent in x, and the arg-max over the code */
  var XP = [D[bi].x.slice()];
  (function () { var x = D[bi].x.slice(); for (var k = 0; k < 60; k++) { var gr = gradx(x); x = clipx([x[0] + 0.05 * gr[0], x[1] + 0.05 * gr[1]]); XP.push(x); } })();
  var TB = T0, TV = -1e9; TG.forEach(function (t) { var v = fht(t); if (v > TV) { TV = v; TB = t; } });
  /* G4: guided annealed Langevin on a kernel density of the data */
  var BW = 0.10, SIG = [0.8, 0.55, 0.38, 0.26, 0.18, 0.12, 0.08, 0.05, 0.03], CACHE = {};
  function kscore(x, sig) {
    var s2 = BW * BW + sig * sig, ws = 0, gx = 0, gy = 0;
    D.forEach(function (d) { var dx = d.x[0] - x[0], dy = d.x[1] - x[1], w = Math.exp(-(dx * dx + dy * dy) / (2 * s2)); ws += w; gx += w * dx; gy += w * dy; });
    return ws < 1e-300 ? [0, 0] : [gx / ws / s2, gy / ws / s2];
  }
  function sample(s) {
    if (CACHE[s]) return CACHE[s];
    var r = IE437.rng(9), out = [], m;
    for (m = 0; m < 150; m++) {
      var d = D[Math.floor(r() * N)], x = [d.x[0] + 0.8 * gauss(r), d.x[1] + 0.8 * gauss(r)];
      SIG.forEach(function (sig) {
        var eps = 0.1 * sig * sig;
        for (var k = 0; k < 12; k++) {
          var sc = kscore(x, sig), gr = gradx(x);
          x = clipx([x[0] + eps * (sc[0] + s * gr[0]) + Math.sqrt(2 * eps) * gauss(r) * 0.6,
                     x[1] + eps * (sc[1] + s * gr[1]) + Math.sqrt(2 * eps) * gauss(r) * 0.6]);
        }
      });
      var pj = proj(x);
      out.push({ x: x, ok: pj.d <= HW, t: pj.t });
    }
    return (CACHE[s] = out);
  }

  var st = 0, sg = typeof opts.s === 'number' ? opts.s : 1, S0 = sg;
  var G1 = MODE === 'g1';
  host.innerHTML =
    '<div class="wbar"><span class="wt">' + (G1 ? 'Search the plane, or search the code' : 'Guide the sampler with the surrogate') + '</span>' +
    '<span class="wspacer"></span>' +
    (G1 ? '<span class="wlabel">valid designs</span><span class="wnum">a thin curve in the plane</span>'
        : '<span class="wlabel">guidance strength</span><span class="wnum" data-s></span><span data-sl></span>') + '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:' + (G1 ? 250 : 270) + 'px;display:flex;flex-direction:column;gap:10px">' +
    (G1 ? '' : '<div data-num style="font:400 13px/1.75 var(--sans);color:var(--ink2)"></div>') +
    '<div data-note style="font:400 ' + (G1 ? '13.5px/1.6' : '12.5px/1.55') + ' var(--sans);color:var(--ink' + (G1 ? '2' : '3') +
    ');' + (G1 ? '' : 'border-top:1px solid rgba(22,24,29,.1);padding-top:9px') + '"></div></div></div>';
  var CW = G1 ? 760 : 470, CH = 300, SC = 70, OX = 24, OY = 10;            /* 70 px per unit */
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return OX + (v + 3) * SC; }, PY = function (v) { return OY + (2 - v) * SC; };
  function curvePath(t0, t1, n) {
    var pts = []; for (var k = 0; k <= n; k++) { var p = c(t0 + (t1 - t0) * k / n); pts.push(PX(p[0]).toFixed(1) + ' ' + PY(p[1]).toFixed(1)); }
    return 'M' + pts.join('L');
  }
  function plane(showHeat) {
    E('rect', { x: PX(-3), y: PY(2), width: 6 * SC, height: 4 * SC, fill: '#fff', stroke: INK, 'stroke-opacity': .2 }, sv);
    if (showHeat) {
      var NX = 48, NY = 32, k, q;
      for (k = 0; k < NX; k++) for (q = 0; q < NY; q++) {
        var xx = -3 + 6 * (k + .5) / NX, yy = -2 + 4 * (q + .5) / NY, v = Math.max(0, Math.min(3, fhx([xx, yy]))) / 3;
        E('rect', { x: PX(-3) + k * 6 * SC / NX, y: PY(2) + (NY - 1 - q) * 4 * SC / NY, width: 6 * SC / NX + .5, height: 4 * SC / NY + .5,
          fill: BLUE, 'fill-opacity': (0.02 + 0.30 * v).toFixed(3) }, sv);
      }
      E('text', { x: PX(-2.92), y: PY(1.82), 'font-size': 9.5, fill: BLUE, 'font-weight': 700, text: 'surrogate f̂(x): darker = promises more' }, sv);
    }
    E('path', { d: curvePath(T0, T1, 280), fill: 'none', stroke: GREEN, 'stroke-width': 2 * HW * SC, 'stroke-opacity': .22, 'stroke-linecap': 'round' }, sv);
    E('path', { d: curvePath(T0, T1, 280), fill: 'none', stroke: GREEN, 'stroke-width': 1, 'stroke-opacity': .6 }, sv);
    var lp = c(-0.2);
    E('text', { x: PX(lp[0]) + 4, y: PY(lp[1]) + 22, 'font-size': 10, fill: GREEN, 'font-weight': 700, text: 'the valid designs' }, sv);
    var sb = c(1.8);
    E('path', { d: 'M' + PX(sb[0]) + ' ' + (PY(sb[1]) - 7) + 'l2 5 5 0 -4 3 2 5 -5 -3 -5 3 2 -5 -4 -3 5 0z', fill: '#fff', stroke: INK, 'stroke-opacity': .55 }, sv);
    E('text', { x: PX(sb[0]) - 6, y: PY(sb[1]) - 12, 'text-anchor': 'end', 'font-size': 9.5, fill: INK, 'fill-opacity': .55, text: 'true best — never measured' }, sv);
    D.forEach(function (d) { E('circle', { cx: PX(d.x[0]), cy: PY(d.x[1]), r: 2.7, fill: INK }, sv); });
    E('text', { x: PX(0), y: CH - 1, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'design x = (x₁, x₂)' }, sv);
  }
  function cross(x, y, col, r) {
    E('path', { d: 'M' + (x - r) + ' ' + (y - r) + 'L' + (x + r) + ' ' + (y + r) + 'M' + (x + r) + ' ' + (y - r) + 'L' + (x - r) + ' ' + (y + r),
      stroke: col, 'stroke-width': 2.2 }, sv);
  }
  /* the latent axis, to the right of the plane (G1 only) */
  var LX0 = 470, LX1 = 750, LY0 = 268, LY1 = 30;
  var TX = function (t) { return LX0 + (t - T0) / (T1 - T0) * (LX1 - LX0); }, VY = function (v) { return LY0 - v / 2.6 * (LY0 - LY1); };
  function latent() {
    E('line', { x1: LX0, x2: LX1, y1: LY0, y2: LY0, stroke: INK, 'stroke-opacity': .3 }, sv);
    E('line', { x1: LX0, x2: LX0, y1: LY1, y2: LY0, stroke: INK, 'stroke-opacity': .3 }, sv);
    E('rect', { x: TX(-2.5), y: LY1, width: TX(DMAX) - TX(-2.5), height: LY0 - LY1, fill: SLATE, 'fill-opacity': .08 }, sv);
    E('text', { x: (TX(-2.5) + TX(DMAX)) / 2, y: LY1 + 11, 'text-anchor': 'middle', 'font-size': 9, 'font-family': MONO, fill: INK, 'fill-opacity': .45, text: 'measured codes' }, sv);
    [0, 1, 2].forEach(function (v) { E('text', { x: LX0 - 5, y: VY(v) + 3, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45, 'font-family': MONO, text: v }, sv); });
    var tp = []; TG.forEach(function (t, k) { if (k % 7 === 0) tp.push(TX(t).toFixed(1) + ' ' + VY(g(t)).toFixed(1)); });
    E('path', { d: 'M' + tp.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-opacity': .34 }, sv);
    E('text', { x: TX(1.8), y: VY(g(1.8)) - 7, 'text-anchor': 'middle', 'font-size': 9.5, fill: INK, 'fill-opacity': .55, text: 'true value' }, sv);
    D.forEach(function (d) { E('circle', { cx: TX(d.t), cy: VY(d.y), r: 2.5, fill: INK }, sv); });
    E('text', { x: (LX0 + LX1) / 2, y: CH - 1, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'latent code t (position along the curve)' }, sv);
  }

  function f2(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }
  function drawG1() {
    plane(st >= 1);
    latent();
    if (st >= 1) {
      E('path', { d: 'M' + XP.map(function (x) { return PX(x[0]).toFixed(1) + ' ' + PY(x[1]).toFixed(1); }).join('L'), fill: 'none', stroke: RED, 'stroke-width': 2.4 }, sv);
      var xe = XP[XP.length - 1];
      cross(PX(xe[0]) + 6, PY(xe[1]) - 6, RED, 6);
      E('text', { x: PX(xe[0]) + 18, y: PY(xe[1]) - 22, 'font-size': 10.5, fill: RED, 'font-weight': 700, text: 'f̂ promises ' + f2(fhx(xe)) + ' — not a design' }, sv);
    }
    if (st >= 2) {
      var tp = []; TG.forEach(function (t, k) { if (k % 7 === 0) tp.push(TX(t).toFixed(1) + ' ' + VY(fht(t)).toFixed(1)); });
      E('path', { d: 'M' + tp.join('L'), fill: 'none', stroke: BLUE, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, sv);
      E('text', { x: TX(-0.4), y: VY(fht(-0.4)) + 16, 'text-anchor': 'middle', 'font-size': 10, fill: BLUE, 'font-weight': 700, text: 'f̂(t)' }, sv);
      E('line', { x1: TX(TB), x2: TX(TB), y1: VY(TV), y2: VY(g(TB)), stroke: BLUE, 'stroke-opacity': .5, 'stroke-dasharray': '2 3' }, sv);
      E('circle', { cx: TX(TB), cy: VY(TV), r: 6, fill: BLUE }, sv);
      E('circle', { cx: TX(TB), cy: VY(g(TB)), r: 5, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
      var pb = c(TB);
      E('circle', { cx: PX(pb[0]), cy: PY(pb[1]), r: 7, fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, sv);
      E('text', { x: PX(pb[0]) - 10, y: PY(pb[1]) + 20, 'text-anchor': 'end', 'font-size': 10.5, fill: BLUE, 'font-weight': 700, text: 'decoded: valid, worth ' + f2(g(TB)) }, sv);
    }
    host.querySelector('[data-note]').innerHTML = [
      'The valid designs form a <b>thin curve</b>; most of the plane is not a design. A decoder gives each valid design one coordinate, its position along the curve — the <b>latent code</b> <i>t</i> (right). Here the decoder is the curve itself, exact by construction.',
      'Climb the surrogate in <i>x</i>: within two steps the path leaves the curve, and the surrogate promises <b>' + f2(fhx(XP[XP.length - 1])) + '</b> at a point that is not a design. Lecture 5’s exploitation, plus invalidity.',
      'Search the code instead: with this exact decoder every candidate lands on the curve, so the choice is <b>valid</b>. But <i>f̂(t)</i> still extrapolates past the measured codes and picks the far end, worth <b>' + f2(g(TB)) +
        '</b>. <span class="hl">Valid is not reliable</span> — the latent predictor needs Lecture 5’s tools.'
    ][st];
  }
  function drawG4() {
    plane(true);
    var S = sample(sg), nv = 0, tv = 0, fp = 0;
    S.forEach(function (q) {
      if (q.ok) { nv++; tv += g(q.t); fp += fhx(q.x); E('circle', { cx: PX(q.x[0]), cy: PY(q.x[1]), r: 3.2, fill: GREEN, 'fill-opacity': .85, stroke: '#fff', 'stroke-width': .6 }, sv); }
      else cross(PX(q.x[0]), PY(q.x[1]), RED, 3);
    });
    var vf = nv / S.length, mt = nv ? tv / nv : 0, mp = nv ? fp / nv : 0;
    host.querySelector('[data-s]').textContent = 's = ' + sg.toFixed(1);
    host.querySelector('[data-num]').innerHTML =
      '<span style="color:' + GREEN + '">●</span> valid designs <b>' + Math.round(100 * vf) + '%</b> &nbsp;<span style="color:' + RED + '">✕</span> not designs<br>' +
      'on the valid designs, predicted <b style="color:' + BLUE + '">' + f2(mp) + '</b><br>' +
      'and true, on average <b style="color:' + (mt > 0.85 ? GREEN : INK) + '">' + f2(mt) + '</b><br>' +
      '<span style="color:var(--ink3)">the data: average 0.68, best 1.40</span>';
    host.querySelector('[data-note]').innerHTML = sg === 0
      ? 'No guidance: the sampler reproduces the data — mostly valid, mostly average. A few samples fall off the curve: a learned density has tails.'
      : sg <= 1.5
      ? 'A little guidance moves samples along the curve toward higher predictions; on the valid samples, prediction and truth rise together.'
      : 'More guidance stops paying: the valid samples are worth no more, and more samples leave the valid set — the surrogate’s gradient off the curve, where it has no data, pulls them out. <span class="hl">Here the failure is validity</span>, not over-prediction on the valid designs.';
  }
  function draw() { while (sv.firstChild) sv.removeChild(sv.firstChild); (G1 ? drawG1 : drawG4)(); }
  if (G1) {
    var show = function (k) { st = Math.max(0, Math.min(2, k)); draw(); };
    show(0);
    return { steps: 2, step: show, reset: function () { show(0); }, finish: function () { show(2); } };
  }
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: 4, step: 0.5, value: sg,
    on: function (v) { sg = +v; draw(); }
  });
  draw();
  return {
    reset: function () { sg = S0; dial.set(S0, false); draw(); },
    finish: function () { sg = 3; dial.set(3, false); draw(); }
  };
});
