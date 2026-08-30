/* ============================================================
   widget: ensemble-alarm                           (Chapter 5, Act 4)
   The obvious answer to "the surrogate doesn't know what it doesn't
   know" is to fit several surrogates and watch them disagree. The
   source deck's NEMO experiment refutes it: out of support the
   bootstrapped ensemble "still outputs highly confident estimates,
   even though they may be wrong". This runs that experiment.

   K ridge surrogates share one feature basis and are each fitted to a
   bootstrap resample of the same fifteen points. Verified in node
   (seed 17, K = 10):
     in  distribution  mean sd 0.024, mean |mean - truth| 0.052  ->  2.2x
     out of it         mean sd 0.148, mean |mean - truth| 1.909  -> 12.9x
     spread grows 6.2x going out of distribution; the error grows 36.7x
     at the design ascent on the ensemble mean returns (x = 10.00) the
     truth is 18.2 standard deviations outside the band they agree on
   and more members do not help: K = 4 gives 18.2 sigma, K = 40 gives 15.4.
   ============================================================ */
IE437.widget('ensemble-alarm', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';

  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, LAM = 0.06, ETA = 0.35, N = 15;
  var KS = [4, 10, 20, 40], ki = 1, reveal = false;

  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  var KN = [], MK = 26, j;
  for (j = 0; j < MK; j++) KN.push(0.35 + 9.3 * j / (MK - 1));
  function phi(x) {
    var v = [1, x / 5], k;
    for (k = 0; k < MK; k++) { v.push(Math.max(0, x - KN[k]) / 3); v.push(Math.max(0, KN[k] - x) / 3); }
    return v;
  }
  var P = phi(0).length;
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); }), c, r, k, p, d, f, t;
    for (c = 0; c < n; c++) {
      p = c; for (r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      t = M[c]; M[c] = M[p]; M[p] = t;
      d = M[c][c]; for (k = c; k <= n; k++) M[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = M[r][c]; if (!f) continue;
        for (k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map(function (row) { return row[n]; });
  }
  function fitW(wt) {
    var A = [], b = new Array(P), i, q, n = 0;
    for (i = 0; i < P; i++) { b[i] = 0; A.push(new Array(P)); for (q = 0; q < P; q++) A[i][q] = 0; }
    D.forEach(function (d, m) {
      var c = wt ? wt[m] : 1; n += c; var p = phi(d.x);
      for (var a = 0; a < P; a++) { b[a] += c * p[a] * d.y; for (var e = 0; e < P; e++) A[a][e] += c * p[a] * p[e]; }
    });
    for (i = 0; i < P; i++) { b[i] /= n; for (q = 0; q < P; q++) A[i][q] /= n; A[i][i] += (i < 2 ? LAM * 1e-2 : LAM); }
    return solve(A, b);
  }

  var R = IE437.rng(opts.seed || 17), D = [], i;
  for (i = 0; i < N; i++) {
    var xi = DL + (DR - DL) * (i + 0.5 + 0.55 * (R() - 0.5)) / N;
    D.push({ x: xi, y: ftrue(xi) + 0.045 * (R() * 2 - 1) });
  }
  var RB = IE437.rng(101), MEM = [], m, wt, u;
  for (m = 0; m < 40; m++) {                       /* one stream, so K=4 is a prefix of K=40 */
    wt = new Array(N); for (u = 0; u < N; u++) wt[u] = 0.08;
    for (u = 0; u < N; u++) wt[Math.floor(RB() * N)] += 1;
    MEM.push(fitW(wt));
  }
  function ev(w, x) { var p = phi(x), s = 0; for (var a = 0; a < P; a++) s += w[a] * p[a]; return s; }

  function stat(x, K) {
    var v = [], s = 0, a;
    for (a = 0; a < K; a++) { v.push(ev(MEM[a], x)); s += v[a]; }
    var mn = s / K, q = 0;
    for (a = 0; a < K; a++) q += (v[a] - mn) * (v[a] - mn);
    return { m: mn, sd: Math.sqrt(q / K), v: v };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Would an ensemble have caught it?</span><span class="wspacer"></span>' +
    '<label class="wtog" data-rev><i></i><span>reveal the true f</span></label>' +
    '<span class="wlabel">members</span><span class="wnum" data-k></span>' +
    '<button class="wb" data-dn>K &darr;</button><button class="wb" data-up>K &uarr;</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:15px;align-items:flex-start;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">what the members agree on</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the truth, in their own sd</div><div data-c2></div></div>' +
    '<div style="width:196px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var CW = 470, CH = 288, TW = 342;
  var s1 = IE437.svg(CW, CH), s2 = IE437.svg(TW, CH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function draw() {
    var K = KS[ki], k, x;
    var YLO = -0.7, YHI = 4.8, L = 34, Rr = 14, T = 16, B = 30;

    /* where ascent on the ensemble mean ends up */
    var gm = function (z) { return (stat(z + 1e-4, K).m - stat(z - 1e-4, K).m) / 2e-4; };
    var xa = D[0].x, ya = D[0].y;
    D.forEach(function (d) { if (d.y > ya) { ya = d.y; xa = d.x; } });
    var xs = xa;
    for (k = 0; k < 40; k++) xs = Math.max(X0, Math.min(X1, xs + ETA * gm(xs)));
    var st = stat(xs, K), sig = Math.abs(st.m - ftrue(xs)) / Math.max(st.sd, 1e-9);

    /* aggregate diagnostics */
    var inSd = 0, inEr = 0, inN = 0, ouSd = 0, ouEr = 0, ouN = 0;
    for (k = 0; k <= 200; k++) {
      x = X0 + (X1 - X0) * k / 200; var s = stat(x, K), er = Math.abs(s.m - ftrue(x));
      if (x >= DL && x <= DR) { inSd += s.sd; inEr += er; inN++; }
      else if (x > DR) { ouSd += s.sd; ouEr += er; ouN++; }
    }
    inSd /= inN; inEr /= inN; ouSd /= ouN; ouEr /= ouN;

    /* ---------- left ---------- */
    while (s1.firstChild) s1.removeChild(s1.firstChild);
    var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rr); };
    var PY = function (v) { return CH - B - (v - YLO) / (YHI - YLO) * (CH - T - B); };
    E('rect', { x: PX(DL), y: T, width: PX(DR) - PX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, s1);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T + 12, 'text-anchor': 'middle', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, s1);
    E('line', { x1: L, x2: CW - Rr, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .22 }, s1);
    E('line', { x1: L, x2: L, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s1);
    [0, 2, 4].forEach(function (v) {
      E('text', { x: L - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s1);
    });
    /* the +/- 2 sigma ribbon */
    var up = [], dn = [];
    for (k = 0; k <= 220; k++) {
      x = X0 + (X1 - X0) * k / 220; var s = stat(x, K);
      up.push(PX(x).toFixed(1) + ' ' + PY(s.m + 2 * s.sd).toFixed(1));
      dn.unshift(PX(x).toFixed(1) + ' ' + PY(s.m - 2 * s.sd).toFixed(1));
    }
    E('path', { d: 'M' + up.join('L') + 'L' + dn.join('L') + 'Z', fill: BLUE, 'fill-opacity': .17,
      stroke: BLUE, 'stroke-width': .8, 'stroke-opacity': .4 }, s1);
    var mm = [];
    for (k = 0; k <= 220; k++) { x = X0 + (X1 - X0) * k / 220; mm.push(PX(x).toFixed(1) + ' ' + PY(stat(x, K).m).toFixed(1)); }
    E('path', { d: 'M' + mm.join('L'), fill: 'none', stroke: BLUE, 'stroke-width': 2.1, 'stroke-dasharray': '5 3' }, s1);
    if (reveal) {
      var tt = [];
      for (k = 0; k <= 300; k++) { x = X0 + (X1 - X0) * k / 300; tt.push(PX(x).toFixed(1) + ' ' + PY(ftrue(x)).toFixed(1)); }
      E('path', { d: 'M' + tt.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2.3, 'stroke-opacity': .8 }, s1);
      E('text', { x: CW - Rr, y: PY(ftrue(9.0)) + 15, 'text-anchor': 'end', 'font-size': 10, fill: INK,
        'fill-opacity': .7, 'font-weight': 700, text: 'true f' }, s1);
    }
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.9, fill: INK }, s1); });
    E('line', { x1: PX(xs), y1: T, x2: PX(xs), y2: CH - B, stroke: RED, 'stroke-opacity': .35, 'stroke-dasharray': '2 3' }, s1);
    E('circle', { cx: PX(xs), cy: PY(st.m), r: 4.5, fill: RED }, s1);
    if (reveal) E('circle', { cx: PX(xs), cy: PY(ftrue(xs)), r: 4.5, fill: 'none', stroke: INK, 'stroke-width': 2 }, s1);
    E('text', { x: PX(X1) - 4, y: PY(st.m) - 9, 'text-anchor': 'end', 'font-size': 9, fill: BLUE,
      'font-weight': 700, text: 'mean ± 2σ' }, s1);
    E('text', { x: CW / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .45, text: 'x' }, s1);

    /* ---------- right: the truth measured in the ensemble's own sigma ---------- */
    while (s2.firstChild) s2.removeChild(s2.firstChild);
    var l2 = 38, r2 = 14, SHI = 20;
    var QX = function (v) { return l2 + (v - X0) / (X1 - X0) * (TW - l2 - r2); };
    var QY = function (v) { return CH - B - Math.min(v, SHI) / SHI * (CH - T - B); };
    E('rect', { x: QX(DL), y: T, width: QX(DR) - QX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, s2);
    E('line', { x1: l2, x2: TW - r2, y1: QY(0), y2: QY(0), stroke: INK, 'stroke-opacity': .22 }, s2);
    E('line', { x1: l2, x2: l2, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s2);
    [0, 5, 10, 15, 20].forEach(function (v) {
      E('text', { x: l2 - 5, y: QY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v + 'σ' }, s2);
    });
    E('line', { x1: l2, x2: TW - r2, y1: QY(2), y2: QY(2), stroke: INK, 'stroke-opacity': .35, 'stroke-dasharray': '3 4' }, s2);
    E('text', { x: TW - r2, y: QY(2) - 5, 'text-anchor': 'end', 'font-size': 8.5, fill: INK, 'fill-opacity': .5,
      'font-family': 'IBM Plex Mono, monospace', text: 'the band should hold it' }, s2);
    var rr = [];
    for (k = 0; k <= 220; k++) {
      x = X0 + (X1 - X0) * k / 220; var s3 = stat(x, K);
      rr.push(QX(x).toFixed(1) + ' ' + QY(Math.abs(s3.m - ftrue(x)) / Math.max(s3.sd, 1e-9)).toFixed(1));
    }
    E('path', { d: 'M' + rr.join('L'), fill: 'none', stroke: RED, 'stroke-width': 2.3, 'stroke-linejoin': 'round' }, s2);
    E('circle', { cx: QX(xs), cy: QY(sig), r: 4, fill: RED }, s2);
    E('text', { x: QX(xs) - 6, y: QY(Math.min(sig, SHI)) + 4, 'text-anchor': 'end', 'font-size': 10,
      fill: RED, 'font-weight': 700, text: sig.toFixed(0) + 'σ' }, s2);
    E('text', { x: (l2 + TW - r2) / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'x' }, s2);

    /* ---------- readout ---------- */
    host.querySelector('[data-k]').textContent = K;
    host.querySelector('[data-num]').innerHTML =
      '<span style="color:var(--ink4)">inside D</span><br>' +
      'spread <b>' + inSd.toFixed(3) + '</b> · error <b>' + inEr.toFixed(3) + '</b><br>' +
      '<span style="color:var(--ink4)">outside D</span><br>' +
      'spread <b>' + ouSd.toFixed(3) + '</b> · error <b>' + ouEr.toFixed(2) + '</b><br>' +
      'spread ×<b>' + (ouSd / inSd).toFixed(1) + '</b>, error <b style="color:' + RED + '">×' +
      (ouEr / inEr).toFixed(0) + '</b>';
    host.querySelector('[data-note]').innerHTML =
      'Ascent on the ensemble mean returns x* = <b>' + xs.toFixed(2) + '</b>, where the truth lies <b style="color:' +
      RED + '">' + sig.toFixed(0) + 'σ</b> outside the band. ' +
      (K > 10 ? 'More members do not close it &mdash; they share a basis, so they extrapolate wrongly <i>together</i>.'
              : 'Try more members.');
  }

  host.querySelector('[data-rev]').onclick = function () { reveal = !reveal; this.classList.toggle('on', reveal); draw(); };
  host.querySelector('[data-up]').onclick = function () { ki = Math.min(KS.length - 1, ki + 1); draw(); };
  host.querySelector('[data-dn]').onclick = function () { ki = Math.max(0, ki - 1); draw(); };

  draw();
  return {
    finish: function () { reveal = true; ki = 1; host.querySelector('[data-rev]').classList.add('on'); draw(); }
  };
});
