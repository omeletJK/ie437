/* ============================================================
   widget: cbas-ladder                              (Chapter 6, Act 4)
   Conditioning by Adaptive Sampling, run rather than described.

   Same offline problem as `condition-shift`: 200 designs from
   N(3.0, 1.15^2) capped at x = 5.5, an oracle fitted with Lecture 5's
   ReLU-knot ridge basis, oracle sd 0.20. The variational family is
   Gaussian, so CbAS's weighted maximum likelihood has a closed form
   (a weighted mean and variance) and the algorithm is exact:

     draw x_1..x_M ~ q^(t)
     gamma <- min(target, 85th percentile of f_hat on those samples)   (relax)
     w_i   <- [p(x_i | theta_0) / q(x_i | phi_t)] * P(y >= gamma | x_i)
     q^(t+1) <- weighted MLE on {x_i, w_i}                             (refit)

   Verified in node before shipping (seed 31, M = 400 per round, Q = 0.85,
   8 rounds; one-shot uses 4000 prior draws, seed 29):

     target 2.65   ONE SHOT     70 effective of 4,000   (1.76%)
                   round 0  gamma 1.891  q=N(3.04,1.12^2)  109/400
                   round 1  gamma 2.239  q=N(4.52,0.68^2)  189/400
                   round 2  gamma 2.506  q=N(5.09,0.60^2)  109/400
                   round 3  gamma 2.650  q=N(5.74,0.66^2)  354/400
                   ...      final q = N(5.88, 0.54^2), f at its mean 2.647
                   worst round 27.3% against one-shot 1.76%  ->  15.5x

     target 3.00   ONE SHOT      8 effective of 4,000   (0.21%)
                   final q = N(6.54, 0.52^2), f at its mean 2.552
                   worst round 27.3% against 0.21%  ->  131x
   Asking for 3.00 — more than the landscape can give — returns a WORSE
   design (2.552) than asking for 2.65 (2.647). The best design in the
   dataset is worth 2.523; the true optimum is 2.657.
   ============================================================ */
IE437.widget('cbas-ladder', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  function erf(z) { var s = z < 0 ? -1 : 1; z = Math.abs(z); var t = 1 / (1 + 0.3275911 * z);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t
      + 0.254829592) * t * Math.exp(-z * z)); }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function gs(rr) { var u = 0, v = 0; while (u === 0) u = rr(); while (v === 0) v = rr();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- dataset and oracle, identical to condition-shift ---------- */
  var R = IE437.rng(11), N = 200, XCAP = 5.5, SIGO = 0.20, D = [], i;
  while (D.length < N) { var x = 3.0 + 1.15 * gs(R); if (x > 0.30 && x < XCAP) D.push({ x: x, y: ftrue(x) + 0.03 * gs(R) }); }
  var MU = 0, SD = 0;
  D.forEach(function (d) { MU += d.x; }); MU /= N;
  D.forEach(function (d) { SD += (d.x - MU) * (d.x - MU); }); SD = Math.sqrt(SD / N);
  var BEST = -9; D.forEach(function (d) { if (ftrue(d.x) > BEST) BEST = ftrue(d.x); });

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
  function nd(x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)) / (s * Math.sqrt(2 * Math.PI)); }

  /* ---------- one shot from the prior ---------- */
  var RS = IE437.rng(29), SAM = [], MM = 4000;
  for (i = 0; i < MM; i++) { var xx = MU + SD * gs(RS); if (xx < 0.05) xx = 0.05; if (xx > 9.95) xx = 9.95; SAM.push(xx); }
  function oneShot(T) {
    var s1 = 0, s2 = 0, ex = 0, ef = 0, k;
    for (k = 0; k < MM; k++) { var w = Phi((fhat(SAM[k]) - T) / SIGO); s1 += w; s2 += w * w; ex += w * SAM[k]; ef += w * ftrue(SAM[k]); }
    return { eff: s1 * s1 / s2, ex: ex / s1, ef: ef / s1 };
  }

  /* ---------- the ladder ---------- */
  var MS = 400, ROUNDS = 8, Q = 0.85;
  function ladder(T) {
    var rr = IE437.rng(opts.seed || 31), mu = MU, sd = SD, h = [], t, k;
    for (t = 0; t < ROUNDS; t++) {
      var S = [];
      for (k = 0; k < MS; k++) { var xq = mu + sd * gs(rr); if (xq < 0.05) xq = 0.05; if (xq > 9.95) xq = 9.95; S.push(xq); }
      var pred = S.map(fhat).slice().sort(function (a, b) { return a - b; });
      var gam = Math.min(T, pred[Math.floor(Q * MS)]);
      var w = S.map(function (xq) { return (nd(xq, MU, SD) / nd(xq, mu, sd)) * Phi((fhat(xq) - gam) / SIGO); });
      var a1 = 0, a2 = 0, m1 = 0, e1 = 0;
      w.forEach(function (wi, k2) { a1 += wi; a2 += wi * wi; m1 += wi * S[k2]; e1 += wi * ftrue(S[k2]); });
      var eff = a1 * a1 / a2, nm = m1 / a1, vv = 0;
      w.forEach(function (wi, k2) { vv += wi * Math.pow(S[k2] - nm, 2); }); vv /= a1;
      h.push({ mu: mu, sd: sd, gam: gam, eff: eff, ef: e1 / a1 });
      mu = nm; sd = Math.max(0.10, Math.sqrt(vv));
    }
    h.push({ mu: mu, sd: sd, gam: T, eff: NaN, ef: NaN, last: true });
    return h;
  }

  var TARGETS = [2.65, 3.00], LAD = TARGETS.map(ladder), ONE = TARGETS.map(oneShot);
  var ti = 0, r = 0, showOne = false;

  host.innerHTML =
    '<div class="wbar"><span class="wt">a hard conditional query, replaced by a sequence of easy ones</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-tg style="min-width:104px"></button>' +
    '<button class="wb" data-one>one shot</button>' +
    '<button class="wb" data-step>step</button>' +
    '<button class="wb" data-run>run the ladder</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:flex-start;padding:11px 16px 9px">' +
    '<div data-c></div><div data-t style="flex:1;min-width:0"></div></div>';

  var CW = 596, CH = 248, PL = 30, PR = 12, PT = 14, PB = 26;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  function cx(v) { return PL + v / 10 * (CW - PL - PR); }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var T = TARGETS[ti], H = LAD[ti], one = ONE[ti];
    var BT = CH - PB, HB = BT - PT;

    /* peak density across everything drawn, so the curves share a scale */
    var mx = 0, t, k;
    for (k = 0; k <= r && k < H.length; k++) mx = Math.max(mx, 1 / (H[k].sd * Math.sqrt(2 * Math.PI)));
    var condMx = 0, cond = [];
    for (t = 0; t <= 300; t++) { var v = 10 * t / 300, c = nd(v, MU, SD) * Phi((fhat(v) - T) / SIGO);
      cond.push([v, c]); if (c > condMx) condMx = c; }

    E('line', { x1: PL, y1: BT, x2: CW - PR, y2: BT, stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: PL, y1: PT, x2: PL, y2: BT, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 2, 4, 6, 8, 10].forEach(function (v) {
      E('text', { x: cx(v), y: CH - 9, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5,
        'font-family': 'IBM Plex Mono, monospace', text: v }, sv);
    });
    E('text', { x: (PL + CW - PR) / 2, y: CH - 1, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: 'design x' }, sv);

    /* the two landmarks */
    [[5.43, 'best design in D', SLATE], [6.04, 'true optimum', GREEN]].forEach(function (m) {
      E('line', { x1: cx(m[0]), y1: PT, x2: cx(m[0]), y2: BT, stroke: m[2], 'stroke-width': 1.3,
        'stroke-opacity': .6, 'stroke-dasharray': '3 3' }, sv);
      E('text', { x: cx(m[0]) + 4, y: PT + 10, 'font-size': 9.5, fill: m[2], 'fill-opacity': .95,
        'font-family': 'IBM Plex Mono, monospace', text: m[1] }, sv);
    });

    function curve(m, s, col, w, op, dash) {
      var p = [], t2;
      for (t2 = 0; t2 <= 300; t2++) { var v = 10 * t2 / 300;
        p.push(cx(v).toFixed(1) + ' ' + (BT - nd(v, m, s) / mx * HB).toFixed(1)); }
      E('path', { d: 'M' + p.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-opacity': op, 'stroke-dasharray': dash || '' }, sv);
    }
    if (showOne) {
      var d2 = 'M' + cx(0) + ' ' + BT + 'L' + cond.map(function (p) {
        return cx(p[0]).toFixed(1) + ' ' + (BT - p[1] / condMx * HB * 0.92).toFixed(1); }).join('L') + 'L' + cx(10) + ' ' + BT + 'Z';
      E('path', { d: d2, fill: RED, 'fill-opacity': .10, stroke: RED, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, sv);
      E('text', { x: cx(one.ex) + 5, y: PT + 62, 'font-size': 10.5, fill: RED, 'font-weight': 700,
        text: 'one shot: ' + one.eff.toFixed(one.eff < 10 ? 1 : 0) + ' of 4,000 draws count' }, sv);
    }
    for (k = 0; k <= r && k < H.length; k++) {
      var last = (k === r);
      curve(H[k].mu, H[k].sd, k === 0 ? SLATE : BLUE, last ? 2.6 : 1.5,
        k === 0 ? .8 : (last ? 1 : 0.22 + 0.5 * k / Math.max(1, r)), k === 0 ? '5 4' : '');
    }
    E('text', { x: cx(MU), y: BT - nd(MU, MU, SD) / mx * HB - 6, 'text-anchor': 'middle', 'font-size': 10,
      fill: SLATE, 'font-weight': 700, text: 'prior' }, sv);
    var cur = H[Math.min(r, H.length - 1)];
    E('text', { x: cx(cur.mu), y: BT - 1 / (cur.sd * Math.sqrt(2 * Math.PI)) / mx * HB - 6, 'text-anchor': 'middle',
      'font-size': 10.5, fill: BLUE, 'font-weight': 700,
      text: cur.last ? 'final q' : 'q at round ' + r }, sv);

    /* ---- the table ---- */
    var rows = '', k2;
    for (k2 = 0; k2 <= r && k2 < ROUNDS; k2++) {
      var h = H[k2], hot = (k2 === r);
      rows += '<tr style="' + (hot ? 'font-weight:600;' : 'opacity:.62;') + '">' +
        '<td style="padding:1px 8px 1px 0">' + k2 + '</td>' +
        '<td style="padding:1px 8px 1px 0">' + h.gam.toFixed(3) + '</td>' +
        '<td style="padding:1px 8px 1px 0">N(' + h.mu.toFixed(2) + ', ' + h.sd.toFixed(2) + '&sup2;)</td>' +
        '<td style="padding:1px 0;color:' + (h.eff / MS > 0.2 ? GREEN : AMBER) + '">' +
        (100 * h.eff / MS).toFixed(0) + '%</td></tr>';
    }
    var fin = H[H.length - 1], done = (r >= ROUNDS);
    var worst = Math.min.apply(null, H.slice(0, ROUNDS).map(function (h) { return h.eff / MS; }));
    host.querySelector('[data-tg]').textContent = 'target ' + T.toFixed(2);
    host.querySelector('[data-t]').innerHTML =
      '<div class="wlabel" style="margin-bottom:6px">the relaxed conditions</div>' +
      '<table style="font:400 11.5px/1.5 var(--mono);color:var(--ink2);border-collapse:collapse">' +
      '<tr style="color:var(--ink4)"><td style="padding-right:8px">t</td><td style="padding-right:8px">bar</td>' +
      '<td style="padding-right:8px">q</td><td>useful</td></tr>' + rows + '</table>' +
      '<div style="border-top:1px solid rgba(22,24,29,.14);margin-top:9px;padding-top:9px;' +
      'font:400 12px/1.65 var(--sans);color:var(--ink2)">' +
      (showOne
        ? '<span style="color:' + RED + '">Straight to the target: <b>' +
          one.eff.toFixed(one.eff < 10 ? 1 : 0) + '</b> of 4,000 draws carry weight (' +
          (100 * one.eff / MM).toFixed(2) + '%).</span><br>'
        : '') +
      (done
        ? 'The ladder’s worst round kept <b style="color:' + GREEN + '">' + (100 * worst).toFixed(0) + '%</b>' +
          (showOne ? ' &mdash; <b>' + ((worst) / (one.eff / MM)).toFixed(0) + '&times;</b> the one-shot rate' : '') +
          '.<br>Final <b>q = N(' + fin.mu.toFixed(2) + ', ' + fin.sd.toFixed(2) + '&sup2;)</b>; the design at its mean is worth ' +
          '<b style="color:' + (ftrue(fin.mu) > BEST ? GREEN : AMBER) + '">' + ftrue(fin.mu).toFixed(3) + '</b>' +
          ' <span style="color:var(--ink4)">(best in D ' + BEST.toFixed(3) + ', true optimum 2.657)</span>'
        : '<span style="color:var(--ink4)">Step the ladder: relax the bar to the 85th percentile of the model’s own ' +
          'predictions, refit, tighten, repeat.</span>') +
      '</div>';
  }

  host.querySelector('[data-step]').onclick = function () { r = Math.min(ROUNDS, r + 1); draw(); };
  host.querySelector('[data-run]').onclick = function () { r = ROUNDS; draw(); };
  host.querySelector('[data-one]').onclick = function () { showOne = !showOne; draw(); };
  host.querySelector('[data-rs]').onclick = function () { r = 0; showOne = false; draw(); };
  host.querySelector('[data-tg]').onclick = function () { ti = (ti + 1) % TARGETS.length; r = 0; draw(); };

  draw();
  return { finish: function () { ti = 0; r = ROUNDS; showOne = true; draw(); } };
});
