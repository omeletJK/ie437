/* ============================================================
   widget: condition-shift                          (Chapter 6, Act 4)
   Raising the bar: p(x | y >= gamma) shifts, then thins, then decays.

   The objective is Lecture 5's, unchanged, so the two lectures can be
   compared on one problem. Two hundred designs are drawn from
   N(3.0, 1.15^2) and kept only below x = 5.5 — nobody has ever built
   a design past there — and an oracle is fitted to them with the same
   ReLU-knot ridge basis Lecture 5 used for its surrogate. The prior
   p(x) is the Gaussian fitted back to those designs. Conditioning
   reweights prior draws by P(y >= gamma | x) = Phi((f_hat(x) - gamma)/sigma).

   Verified in node before shipping (seed 11, 4000 prior draws, seed 29,
   oracle sd 0.20; the dataset's best design is worth 2.523, the true
   global optimum is 2.657 at x = 6.04):

     gamma   effective draws / 4000   E[x | S]   E[f_true | S]
      1.00          3750               3.260        1.560
      2.00           780               4.734        2.129
      2.30           278               5.292        2.390
      2.65            70               5.881        2.550   <- best
      2.80            32               6.148        2.537
      3.00             8               6.571        2.427
      3.80           1.5               7.131        2.163

   And the Lecture 5 route on the identical problem: gradient ascent on
   the same oracle from the best design in D runs to the boundary,
   x* = 10.00, where the oracle promises 4.18 and the truth is -0.136.
   ============================================================ */
IE437.widget('condition-shift', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  /* ---------- Lecture 5's objective, unchanged ---------- */
  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  function erf(z) { var s = z < 0 ? -1 : 1; z = Math.abs(z); var t = 1 / (1 + 0.3275911 * z);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t
      + 0.254829592) * t * Math.exp(-z * z)); }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  /* ---------- the offline dataset ---------- */
  var SEED = opts.seed || 11, R = IE437.rng(SEED), N = 200, XCAP = 5.5, SIGO = 0.20;
  function gs(rr) { var u = 0, v = 0; while (u === 0) u = rr(); while (v === 0) v = rr();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var D = [];
  while (D.length < N) { var x = 3.0 + 1.15 * gs(R); if (x > 0.30 && x < XCAP) D.push({ x: x, y: ftrue(x) + 0.03 * gs(R) }); }
  var MU = 0, SD = 0, i;
  D.forEach(function (d) { MU += d.x; }); MU /= N;
  D.forEach(function (d) { SD += (d.x - MU) * (d.x - MU); }); SD = Math.sqrt(SD / N);
  var BEST = -9, BX = 0;
  D.forEach(function (d) { if (ftrue(d.x) > BEST) { BEST = ftrue(d.x); BX = d.x; } });

  /* ---------- the oracle: the same basis Lecture 5 fitted ---------- */
  var KN = [], MK = 26, j, LAM = 0.06;
  for (j = 0; j < MK; j++) KN.push(0.35 + 9.3 * j / (MK - 1));
  function phi(x) { var v = [1, x / 5], k; for (k = 0; k < MK; k++) { v.push(Math.max(0, x - KN[k]) / 3); v.push(Math.max(0, KN[k] - x) / 3); } return v; }
  var P = phi(0).length;
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, k) { return r.concat([b[k]]); }), c, r, k, p, d, f, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      t = M[c]; M[c] = M[p]; M[p] = t;
      d = M[c][c]; for (k = c; k <= n; k++) M[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = M[r][c]; if (!f) continue;
        for (k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (row) { return row[n]; });
  }
  var A0 = [], b0 = new Array(P), q;
  for (i = 0; i < P; i++) { b0[i] = 0; A0.push(new Array(P)); for (q = 0; q < P; q++) A0[i][q] = 0; }
  D.forEach(function (d) { var p = phi(d.x);
    for (var a = 0; a < P; a++) { b0[a] += p[a] * d.y / N; for (var c = 0; c < P; c++) A0[a][c] += p[a] * p[c] / N; } });
  for (i = 0; i < P; i++) A0[i][i] += (i < 2 ? LAM * 1e-2 : LAM);
  var WV = solve(A0, b0);
  function fhat(x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += WV[a] * p[a]; return s; }

  /* ---------- Lecture 5's answer on the same problem ---------- */
  var XA = BX;
  for (i = 0; i < 60; i++) { var g = (fhat(XA + 1e-4) - fhat(XA - 1e-4)) / 2e-4; XA = Math.max(0, Math.min(10, XA + 0.35 * g)); }

  /* ---------- 4000 draws from the prior, fixed ---------- */
  var RS = IE437.rng(29), SAM = [], MM = 4000;
  for (i = 0; i < MM; i++) { var xx = MU + SD * gs(RS); if (xx < 0.05) xx = 0.05; if (xx > 9.95) xx = 9.95; SAM.push(xx); }

  var GAM = [1.00, 1.50, 2.00, 2.30, 2.50, 2.65, 2.80, 3.00, 3.30, 3.80], gi = 5;
  function stats(g) {
    var s1 = 0, s2 = 0, ex = 0, ef = 0, k;
    for (k = 0; k < MM; k++) { var w = Phi((fhat(SAM[k]) - g) / SIGO); s1 += w; s2 += w * w; ex += w * SAM[k]; ef += w * ftrue(SAM[k]); }
    return { eff: s1 * s1 / s2, ex: ex / s1, ef: ef / s1 };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">the same objective as Lecture 5 &mdash; now conditioned, not searched</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">threshold</span>' +
    '<span class="wnum" data-val style="min-width:92px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:flex-start;padding:11px 16px 9px">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12.5px/1.8 var(--sans);color:var(--ink2)"></div>' +
    '<div data-cmp style="border-top:1px solid rgba(22,24,29,.14);padding-top:10px"></div>' +
    '</div></div>';

  var CW = 604, CH = 300, PL = 34, PR = 12, PT = 12, PB = 22, SPLIT = 176;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  function cx(v) { return PL + v / 10 * (CW - PL - PR); }
  var YL = -0.6, YH = 4.6;
  function cy(v) { return SPLIT - PB / 2 - (v - YL) / (YH - YL) * (SPLIT - PT - PB / 2); }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var g = GAM[gi], S = stats(g), k;

    /* ---- upper panel: the truth, the oracle, the data, the bar ---- */
    E('line', { x1: PL, y1: cy(YL), x2: CW - PR, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: PL, y1: PT, x2: PL, y2: cy(YL), stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 1, 2, 3, 4].forEach(function (t) {
      E('text', { x: PL - 6, y: cy(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
      E('line', { x1: PL, x2: CW - PR, y1: cy(t), y2: cy(t), stroke: INK, 'stroke-opacity': .07 }, sv);
    });
    E('rect', { x: cx(0.30), y: PT, width: cx(XCAP) - cx(0.30), height: cy(YL) - PT, fill: SLATE, 'fill-opacity': .09 }, sv);
    E('text', { x: (cx(0.30) + cx(XCAP)) / 2, y: PT + 11, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'where the data lives' }, sv);

    function line(fn, col, w, dash, op) {
      var p = [], t;
      for (t = 0; t <= 300; t++) { var v = 10 * t / 300; p.push(cx(v).toFixed(1) + ' ' + cy(Math.max(YL, Math.min(YH, fn(v)))).toFixed(1)); }
      E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash || '', 'stroke-opacity': op === undefined ? 1 : op }, sv);
    }
    line(fhat, BLUE, 2, '6 4');
    line(ftrue, INK, 2.2, '');
    D.forEach(function (d) { E('circle', { cx: cx(d.x), cy: cy(d.y), r: 1.8, fill: SLATE, 'fill-opacity': .55 }, sv); });

    E('line', { x1: PL, y1: cy(g), x2: CW - PR, y2: cy(g), stroke: AMBER, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, sv);
    E('text', { x: PL + 5, y: cy(g) - 4, 'font-size': 10, fill: AMBER, 'font-weight': 700,
      text: 'the bar  y ≥ ' + g.toFixed(2) }, sv);

    /* Lecture 5's answer */
    E('line', { x1: cx(XA), y1: cy(fhat(XA)), x2: cx(XA), y2: cy(ftrue(XA)), stroke: RED,
      'stroke-width': 1.4, 'stroke-opacity': .8, 'stroke-dasharray': '2 2' }, sv);
    E('circle', { cx: cx(XA), cy: cy(fhat(XA)), r: 3.4, fill: BLUE }, sv);
    E('circle', { cx: cx(XA), cy: cy(ftrue(XA)), r: 4.2, fill: RED }, sv);
    E('text', { x: cx(XA) - 6, y: cy(fhat(XA)) - 5, 'text-anchor': 'end', 'font-size': 10, fill: RED,
      'font-weight': 700, text: 'Lecture 5 lands here' }, sv);
    E('text', { x: cx(XA) - 6, y: cy(fhat(XA)) + 7, 'text-anchor': 'end', 'font-size': 9.5, fill: INK,
      'fill-opacity': .55, text: 'oracle ' + fhat(XA).toFixed(2) + ', truth ' + ftrue(XA).toFixed(2) }, sv);

    /* ---- lower panel: the prior and the conditional ---- */
    var BT = CH - 20, BB = SPLIT + 12, HB = BT - BB;
    var dens = [], cond = [], t2, mxd = 0, mxc = 0;
    for (t2 = 0; t2 <= 300; t2++) {
      var v = 10 * t2 / 300;
      var pp = Math.exp(-0.5 * Math.pow((v - MU) / SD, 2)) / (SD * Math.sqrt(2 * Math.PI));
      var cc = pp * Phi((fhat(v) - g) / SIGO);
      dens.push([v, pp]); cond.push([v, cc]);
      if (pp > mxd) mxd = pp; if (cc > mxc) mxc = cc;
    }
    function area(pts, mx, col, op, w) {
      var d2 = 'M' + cx(0) + ' ' + BT + 'L' + pts.map(function (p) {
        return cx(p[0]).toFixed(1) + ' ' + (BT - p[1] / mx * HB).toFixed(1); }).join('L') + 'L' + cx(10) + ' ' + BT + 'Z';
      E('path', { d: d2, fill: col, 'fill-opacity': op, stroke: col, 'stroke-width': w }, sv);
    }
    E('line', { x1: PL, y1: BT, x2: CW - PR, y2: BT, stroke: INK, 'stroke-opacity': .28 }, sv);
    area(dens, mxd, SLATE, .14, 1.4);
    area(cond, mxc, BLUE, .26, 2.2);
    E('line', { x1: cx(S.ex), y1: BB, x2: cx(S.ex), y2: BT, stroke: BLUE, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, sv);
    E('text', { x: cx(S.ex) + 4, y: BB + 10, 'font-size': 10, fill: BLUE, 'font-weight': 700,
      text: 'E[x | bar] = ' + S.ex.toFixed(2) }, sv);
    E('text', { x: cx(MU) - 4, y: BB + 10, 'text-anchor': 'end', 'font-size': 10, fill: SLATE, text: 'prior p(x)' }, sv);
    [0, 2, 4, 6, 8, 10].forEach(function (t) {
      E('text', { x: cx(t), y: CH - 5, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv);
    });

    /* ---- readouts ---- */
    host.querySelector('[data-val]').textContent = 'y ≥ ' + g.toFixed(2);
    var better = S.ef > BEST;
    host.querySelector('[data-num]').innerHTML =
      '<span style="color:' + INK + '">&#9473;&#9473; true f</span> &middot; ' +
      '<span style="color:' + BLUE + '">&#9548;&#9548; the oracle fitted to D</span><br>' +
      'effective draws <b>' + (S.eff >= 10 ? S.eff.toFixed(0) : S.eff.toFixed(1)) + '</b> of 4,000' +
      ' &nbsp;<span style="color:var(--ink4)">(' + (100 * S.eff / MM).toFixed(2) + '%)</span><br>' +
      'the sampled designs average <b style="color:' + (better ? GREEN : AMBER) + '">' + S.ef.toFixed(3) + '</b>' +
      ' in truth<br>' +
      '<span style="color:var(--ink4)">best design in D: ' + BEST.toFixed(3) +
      ' &nbsp;&middot;&nbsp; true optimum: 2.657</span>';
    var bar = Math.max(2, Math.round(200 * S.eff / MM));
    host.querySelector('[data-cmp]').innerHTML =
      '<div class="wlabel" style="margin-bottom:7px">how much of the prior still counts</div>' +
      '<div style="height:12px;border:1px solid rgba(22,24,29,.14);width:200px">' +
      '<div style="width:' + bar + 'px;height:100%;background:' + BLUE + ';opacity:.6"></div></div>' +
      '<div style="font:400 12.5px/1.75 var(--sans);color:var(--ink2);margin-top:9px">' +
      (better
        ? '<span style="color:' + GREEN + '">Above the dataset’s best &mdash; and still on the manifold.</span>'
        : S.ef < 2.3
          ? '<span style="color:' + RED + '">The bar has left the data. The samples are thin, and worse.</span>'
          : '<span style="color:' + AMBER + '">Past the peak: precision is going, not validity.</span>') +
      '</div>';
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: GAM.length - 1, step: 1, value: gi,
    on: function (v) { gi = v; draw(); }
  });

  draw();
  return { finish: function () { gi = 5; draw(); } };
});
