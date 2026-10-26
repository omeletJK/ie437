/* ============================================================
   widget: elbo-views                               (Chapter 6, Act 2)
   The two derivations of the ELBO, drawn.

   mode "jensen"   the one inequality view 1 needs. log is concave, so
                   the chord between two points lies below the curve:
                   log(average of w) >= average of log w.
                   w1 = 0.3, w2 = 2.5: log of the average log 1.4 = 0.336,
                   average of the logs (-1.204 + 0.916)/2 = -0.144,
                   gap 0.480. Walked by ->: 0 the curve and two points,
                   1 the chord, the two averages and the gap.

   The toy model shared by "prior" and "gap":
                   z ~ N(0,1), x | z ~ N(z^2, 0.5^2); observe x = 2. Two
                   codes explain it (z near +-1.37), so the posterior has
                   two peaks. On a 2001-point grid over [-5, 5]:
                     log p(x) = -2.169
                   A draw "explains x" when p(x|z) is above 10% of its peak:
                   |z| in (0.96, 1.75), prior mass 0.256 — about 1 in 4;
                   ten factors that must each land so: 0.256^-10 = 826 018,
                   about 1 in 800 000.

   mode "prior"    the evidence integral, drawn. Walked by ->:
                   0 the prior p(z) and how well each z explains x, p(x|z)
                   1 forty draws from the prior (seed 7): 13 explain x
                   2 prior x likelihood / evidence = the two-peaked posterior

   mode "gap"      view 2: log p(x) = ELBO(q) + KL(q || p(z|x)).
                   q = N(m, s^2), two sliders.
                     q = prior N(0,1):      ELBO -6.23, KL 4.06
                     best Gaussian m 1.33, s 0.19: ELBO -2.88, KL 0.71
                   The best Gaussian sits on one peak; one bump cannot
                   cover two, so the gap stays near log 2.
                   -> jumps from q = prior to the best Gaussian.
   ============================================================ */
IE437.widget('elbo-views', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B';
  var MODE = opts.mode || 'jensen';
  function hl(t) { return t.replace(/==(.+?)==/g, '<span class="hl">$1</span>'); }

  /* ---------------- Jensen ---------------- */
  if (MODE === 'jensen') {
    host.innerHTML =
      '<div class="wbar"><span class="wt">the log is concave</span><span class="wspacer"></span>' +
      '<span class="wlabel">any two positive numbers</span><span class="wnum">w₁ = 0.3 &nbsp; w₂ = 2.5</span></div>' +
      '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
      '<div data-c></div><div data-note style="width:300px;font:400 13px/1.6 var(--sans);color:var(--ink2)"></div></div>';
    var W = 540, H = 236, L = 44, Rm = 16, T = 12, B = 30, X0 = 0, X1 = 3.2, Y0 = -2.0, Y1 = 1.4;
    var sv = IE437.svg(W, H); host.querySelector('[data-c]').appendChild(sv);
    var PX = function (v) { return L + (v - X0) / (X1 - X0) * (W - L - Rm); };
    var PY = function (v) { return H - B - (v - Y0) / (Y1 - Y0) * (H - T - B); };
    var w1 = 0.3, w2 = 2.5, wm = (w1 + w2) / 2, l1 = Math.log(w1), l2 = Math.log(w2), lm = Math.log(wm), ml = (l1 + l2) / 2;
    var st = 0;
    function t(x, y, s, a) { var o = { x: x, y: y, 'font-size': 11.5, fill: INK, text: s }; for (var k in a || {}) o[k] = a[k]; return E('text', o, sv); }
    function draw() {
      while (sv.firstChild) sv.removeChild(sv.firstChild);
      E('line', { x1: L, x2: W - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .25 }, sv);
      E('line', { x1: L, x2: L, y1: T, y2: H - B, stroke: INK, 'stroke-opacity': .25 }, sv);
      [-2, -1, 0, 1].forEach(function (v) { t(L - 6, PY(v) + 4, String(v).replace('-', '−'), { 'text-anchor': 'end', 'font-size': 10, fill: SLATE }); });
      [1, 2, 3].forEach(function (v) { t(PX(v), H - B + 14, String(v), { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE }); });
      t(W - Rm, H - 4, 'w', { 'text-anchor': 'end', 'font-style': 'italic', 'font-size': 12 });
      var d = '', i;
      for (i = 0; i <= 300; i++) { var w = 0.135 + (X1 - 0.135) * i / 300; d += (i ? 'L' : 'M') + PX(w).toFixed(1) + ' ' + PY(Math.log(w)).toFixed(1); }
      E('path', { d: d, fill: 'none', stroke: INK, 'stroke-width': 2.2 }, sv);
      t(PX(3.05), PY(Math.log(3.05)) - 10, 'log w', { 'text-anchor': 'end', 'font-weight': 700 });
      [[w1, l1, 'w₁'], [w2, l2, 'w₂']].forEach(function (p) {
        E('line', { x1: PX(p[0]), x2: PX(p[0]), y1: PY(0), y2: PY(p[1]), stroke: SLATE, 'stroke-dasharray': '3 3' }, sv);
        E('circle', { cx: PX(p[0]), cy: PY(p[1]), r: 5, fill: INK }, sv);
        t(PX(p[0]) + 8, PY(p[1]) + (p[1] < 0 ? 14 : -8), p[2], { 'font-weight': 700, 'font-size': 12.5 });
      });
      if (st >= 1) {
        E('line', { x1: PX(w1), y1: PY(l1), x2: PX(w2), y2: PY(l2), stroke: AMBER, 'stroke-width': 2 }, sv);
        E('line', { x1: PX(wm), x2: PX(wm), y1: PY(0) + 4, y2: PY(lm), stroke: SLATE, 'stroke-dasharray': '3 3' }, sv);
        t(PX(wm), H - B + 14, 'average of w', { 'text-anchor': 'middle', 'font-size': 10.5, fill: SLATE });
        E('line', { x1: PX(wm) + 9, x2: PX(wm) + 9, y1: PY(lm) + 2, y2: PY(ml) - 2, stroke: RED, 'stroke-width': 2.4 }, sv);
        E('circle', { cx: PX(wm), cy: PY(lm), r: 5.5, fill: BLUE }, sv);
        E('circle', { cx: PX(wm), cy: PY(ml), r: 5.5, fill: AMBER }, sv);
        t(PX(wm) - 10, PY(lm) - 9, 'log of the average', { 'text-anchor': 'end', fill: BLUE, 'font-weight': 700 });
        t(PX(wm) + 14, PY(ml) + 22, 'average of the logs', { fill: AMBER, 'font-weight': 700 });
        t(PX(wm) + 16, (PY(lm) + PY(ml)) / 2 + 4, 'gap ≥ 0', { fill: RED, 'font-weight': 700 });
      }
      host.querySelector('[data-note]').innerHTML = hl([
        'Two values of w, and the curve log w. The curve ==bends down==: it is concave — the mirror image of Lecture 1\'s convex functions.',
        '<b style="color:' + BLUE + '">log of the average</b> ' + lm.toFixed(3) + ' &nbsp;≥&nbsp; <b style="color:' + AMBER + '">average of the logs</b> ' + ml.toFixed(3).replace('-', '−') +
        '. The chord of a concave curve lies below the curve — for any two points, any weights, and so for any average.'
      ][st]);
    }
    var show = function (k) { st = Math.max(0, Math.min(1, k)); draw(); };
    show(0);
    return { steps: 1, step: show, reset: function () { show(0); }, finish: function () { show(1); } };
  }

  /* ---------------- the shared toy ---------------- */
  var XOBS = 2, SN = 0.5;
  function lnd(x, m, s) { return -0.5 * (x - m) * (x - m) / (s * s) - Math.log(s * Math.sqrt(2 * Math.PI)); }
  function lj(z) { return lnd(XOBS, z * z, SN) + lnd(z, 0, 1); }
  var N = 2001, Z0 = -5, Z1 = 5, DZ = (Z1 - Z0) / (N - 1), G = [], LJ = [], i;
  for (i = 0; i < N; i++) { G.push(Z0 + i * DZ); LJ.push(lj(G[i])); }
  var PXV = 0; for (i = 0; i < N; i++) PXV += Math.exp(LJ[i]) * DZ;
  var LPX = Math.log(PXV);
  function elbo(m, s) { var e = 0; for (var k = 0; k < N; k++) { var lq = lnd(G[k], m, s), q = Math.exp(lq); if (q < 1e-300) continue; e += q * (LJ[k] - lq) * DZ; } return e; }
  function kl(m, s) { var e = 0; for (var k = 0; k < N; k++) { var lq = lnd(G[k], m, s), q = Math.exp(lq); if (q < 1e-300) continue; e += q * (lq - (LJ[k] - LPX)) * DZ; } return e; }
  function lik(z) { return Math.exp(lnd(XOBS, z * z, SN)); }
  var LMAX = lik(Math.sqrt(XOBS));
  function key(sv, L, T, rows) {
    rows.forEach(function (r, k) {
      var y = T + 2 + k * 18;
      if (r.fill) E('rect', { x: L + 4, y: y, width: 18, height: 10, fill: r.fill, 'fill-opacity': .2, stroke: r.c, 'stroke-width': 1.4, 'stroke-dasharray': r.dash || 'none' }, sv);
      else E('line', { x1: L + 4, x2: L + 22, y1: y + 5, y2: y + 5, stroke: r.c, 'stroke-width': 2.4, 'stroke-dasharray': r.dash || 'none' }, sv);
      E('text', { x: L + 28, y: y + 9, 'font-size': 11.5, 'font-weight': 700, fill: r.c, text: r.t }, sv);
    });
  }

  /* ---------------- the evidence integral, drawn ---------------- */
  if (MODE === 'prior') {
    host.innerHTML =
      '<div class="wbar"><span class="wt">which codes explain the design?</span><span class="wspacer"></span>' +
      '<span class="wlabel">observed design</span><span class="wnum">x = 2</span></div>' +
      '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center;padding:8px 12px 6px">' +
      '<div data-c></div><div data-note style="width:330px;font:400 13px/1.6 var(--sans);color:var(--ink2)"></div></div>';
    var PW = 560, PH = 186, pL = 14, pR = 12, pT = 8, pB = 24, pX0 = -3, pX1 = 3, pYM = 1.75;
    var ps = IE437.svg(PW, PH); host.querySelector('[data-c]').appendChild(ps);
    var qX = function (v) { return pL + (v - pX0) / (pX1 - pX0) * (PW - pL - pR); };
    var qY = function (v) { return PH - pB - Math.min(v, pYM) / pYM * (PH - pT - pB); };
    var rng = IE437.rng(7), DR = [], k;
    for (k = 0; k < 40; k++) {
      var u1 = rng(), u2 = rng(), zz = Math.sqrt(-2 * Math.log(u1 + 1e-12)) * Math.cos(2 * Math.PI * u2);
      DR.push({ z: zz, hit: lik(zz) > 0.1 * LMAX, j: k % 3 });
    }
    var HITS = DR.filter(function (d) { return d.hit; }).length;
    var pst = 0;
    function cpath(fn, close) {
      var pts = [], x, j;
      for (j = 0; j <= 360; j++) { x = pX0 + (pX1 - pX0) * j / 360; pts.push(qX(x).toFixed(1) + ' ' + qY(Math.max(0, fn(x))).toFixed(1)); }
      return close ? 'M' + qX(pX0) + ' ' + qY(0) + 'L' + pts.join('L') + 'L' + qX(pX1) + ' ' + qY(0) + 'Z' : 'M' + pts.join('L');
    }
    function pdraw() {
      while (ps.firstChild) ps.removeChild(ps.firstChild);
      E('line', { x1: pL, x2: PW - pR, y1: qY(0), y2: qY(0), stroke: INK, 'stroke-opacity': .3 }, ps);
      E('path', { d: cpath(function (z) { return Math.exp(lnd(z, 0, 1)); }, true), fill: SLATE, 'fill-opacity': .1, stroke: SLATE, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, ps);
      E('path', { d: cpath(function (z) { return 0.95 * lik(z) / LMAX; }), fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, ps);
      if (pst >= 2) E('path', { d: cpath(function (z) { return Math.exp(lj(z) - LPX); }, true), fill: SLATE, 'fill-opacity': .2, stroke: INK, 'stroke-width': 1.8 }, ps);
      if (pst >= 1) DR.forEach(function (d) {
        if (d.z < pX0 || d.z > pX1) return;
        E('circle', { cx: qX(d.z), cy: qY(0) - 6 - d.j * 7, r: 3.6, fill: d.hit ? AMBER : '#fff', stroke: d.hit ? AMBER : SLATE, 'stroke-width': 1.3 }, ps);
      });
      var rows = [{ c: SLATE, fill: SLATE, dash: '5 4', t: 'prior p(z)' }, { c: AMBER, t: 'how well z explains x: p(x|z)' }];
      if (pst >= 2) rows.push({ c: INK, fill: SLATE, t: 'posterior p(z|x)' });
      key(ps, pL, pT, rows);
      E('text', { x: PW / 2, y: PH - 6, 'text-anchor': 'middle', 'font-style': 'italic', 'font-size': 10.5, fill: INK, 'fill-opacity': .5, text: 'code z — the decoder says x = z² + noise' }, ps);
      host.querySelector('[data-note]').innerHTML = hl([
        'Which codes could have produced the design x = 2? The decoder says x = z² + noise, so ==only z near ±1.4==.',
        'Draw codes from the prior and check each: <b style="color:' + AMBER + '">' + HITS + ' of 40</b> explain x; the rest are wasted. The evidence is the average of p(x|z) over such draws.<br><br>' +
        'With one factor, about 1 draw in 4 is useful on average. With ten factors that must each land this well: ==about 1 in 800 000==.',
        'Bayes\' rule: prior × likelihood ÷ evidence = the ==posterior, with two peaks==. This is what a simple q will have to imitate.'
      ][pst]);
    }
    var pshow = function (j) { pst = Math.max(0, Math.min(2, j)); pdraw(); };
    pshow(0);
    return { steps: 2, step: pshow, reset: function () { pshow(0); }, finish: function () { pshow(2); } };
  }

  /* ---------------- the gap: view 2 ---------------- */
  var PRE = [[0, 1], [1.33, 0.19]];
  var m = 0, s = 1;

  host.innerHTML =
    '<div class="wbar"><span class="wt">one design, two codes that explain it</span><span class="wspacer"></span>' +
    '<span data-m></span><span data-s></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center;padding:8px 12px 6px">' +
    '<div data-c></div><div data-g></div><div data-note style="width:236px;font:400 12.5px/1.55 var(--sans);color:var(--ink2)"></div></div>';
  var CW = 470, CH = 206, L = 14, Rm = 12, T = 14, B = 26, X0 = -3, X1 = 3, YM = 2.2;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var GW = 196, GH = 206, gv = IE437.svg(GW, GH); host.querySelector('[data-g]').appendChild(gv);
  var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rm); };
  var PY = function (v) { return CH - B - Math.min(v, YM) / YM * (CH - T - B); };
  var GLO = -10, GHI = 0, GT = 26, GB = 10;
  var GY = function (v) { return GT + (GHI - Math.max(GLO, Math.min(GHI, v))) / (GHI - GLO) * (GH - GT - GB); };
  function t(p, x, y, str, a) { var o = { x: x, y: y, 'font-size': 11.5, fill: INK, text: str }; for (var k in a || {}) o[k] = a[k]; return E('text', o, p); }
  function curvePath(fn, close) {
    var pts = [], x, k;
    for (k = 0; k <= 360; k++) { x = X0 + (X1 - X0) * k / 360; pts.push(PX(x).toFixed(1) + ' ' + PY(Math.max(0, fn(x))).toFixed(1)); }
    return close ? 'M' + PX(X0) + ' ' + PY(0) + 'L' + pts.join('L') + 'L' + PX(X1) + ' ' + PY(0) + 'Z' : 'M' + pts.join('L');
  }
  function draw() {
    var e = elbo(m, s), k = kl(m, s);
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('line', { x1: L, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .3 }, sv);
    E('path', { d: curvePath(function (z) { return Math.exp(lj(z) - LPX); }, true), fill: SLATE, 'fill-opacity': .2, stroke: INK, 'stroke-width': 1.8 }, sv);
    E('path', { d: curvePath(function (z) { return Math.exp(lnd(z, m, s)); }), fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, sv);
    /* a key, not inline labels: q moves under the sliders */
    key(sv, L, T, [{ c: INK, fill: SLATE, t: 'true posterior p(z|x)' }, { c: BLUE, t: 'q(z|x) = N(m, s²), our approximation' }]);
    t(sv, CW / 2, CH - 6, 'code z — the decoder says x = z² + noise, and x = 2 was observed', { 'text-anchor': 'middle', 'font-style': 'italic', 'font-size': 10.5, fill: INK, 'fill-opacity': .5 });
    /* the gauge: log p(x) = ELBO + KL */
    while (gv.firstChild) gv.removeChild(gv.firstChild);
    var bx = 70, bw = 40;
    E('line', { x1: bx - 10, x2: bx - 10, y1: GY(GHI), y2: GY(GLO), stroke: INK, 'stroke-opacity': .25 }, gv);
    [0, -2, -4, -6, -8, -10].forEach(function (v) {
      E('line', { x1: bx - 14, x2: bx - 10, y1: GY(v), y2: GY(v), stroke: INK, 'stroke-opacity': .35 }, gv);
      t(gv, bx - 17, GY(v) + 4, String(v).replace('-', '−'), { 'text-anchor': 'end', 'font-size': 9.5, fill: SLATE });
    });
    E('rect', { x: bx, y: GY(e), width: bw, height: GY(GLO) - GY(e), fill: BLUE, 'fill-opacity': .75 }, gv);
    E('rect', { x: bx, y: GY(LPX), width: bw, height: Math.max(0, GY(e) - GY(LPX)), fill: AMBER, 'fill-opacity': .55 }, gv);
    E('line', { x1: bx - 6, x2: bx + bw + 6, y1: GY(LPX), y2: GY(LPX), stroke: INK, 'stroke-width': 2.4 }, gv);
    t(gv, bx + bw + 8, GY(LPX) - 3, 'log p(x), fixed', { 'font-weight': 700, 'font-size': 11 });
    t(gv, bx + bw + 8, (GY(LPX) + GY(e)) / 2 + 4, 'gap = KL', { 'font-weight': 700, 'font-size': 11, fill: AMBER });
    t(gv, bx + bw + 8, Math.min(GY(GLO) - 4, Math.max(GY(e) + 14, (GY(LPX) + GY(e)) / 2 + 17)), 'ELBO', { 'font-weight': 700, 'font-size': 11, fill: BLUE });
    t(gv, GW / 2, 11, 'evidence = ELBO + gap', { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE, 'font-weight': 700 });
    host.querySelector('[data-note]').innerHTML = hl(
      '<div style="font-family:var(--mono);font-size:12px;line-height:1.9">' +
      'log p(x) &nbsp;<b>' + LPX.toFixed(2).replace('-', '−') + '</b><br>' +
      '= ELBO &nbsp;<b style="color:' + BLUE + '">' + e.toFixed(2).replace('-', '−') + '</b><br>' +
      '+ KL(q‖p(z|x)) &nbsp;<b style="color:' + AMBER + '">' + k.toFixed(2) + '</b></div>' +
      '<div style="margin-top:8px;border-top:1px solid rgba(22,24,29,.1);padding-top:8px">' +
      (k < 0.8 ? 'The best one-bump q sits on ==one peak==. Two peaks cannot be covered by one Gaussian, so a gap of about log 2 remains.'
        : 'Move q: the evidence line ==never moves==. Whatever the ELBO gains, the KL gap loses.') + '</div>');
  }
  var slM = IE437.slider(host.querySelector('[data-m]'), {
    label: 'mean m', min: -2, max: 2, step: 0.01, value: m, width: 110,
    fmt: function (v) { return v.toFixed(2); }, on: function (v) { m = v; draw(); }
  });
  var slS = IE437.slider(host.querySelector('[data-s]'), {
    label: 'spread s', min: 0.15, max: 1.5, step: 0.01, value: s, width: 110,
    fmt: function (v) { return v.toFixed(2); }, on: function (v) { s = v; draw(); }
  });
  function preset(k) { m = PRE[k][0]; s = PRE[k][1]; slM.set(m, false); slS.set(s, false); draw(); }
  preset(0);
  return { steps: 1, step: preset, reset: function () { preset(0); }, finish: function () { preset(1); } };
});
