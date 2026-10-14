/* ============================================================
   widget: nml-explain                              (Chapter 5, Act 3)
   The NML formula, one label at a time, on the same fifteen points.

     p_NML(y | x) = p(y | x; theta_hat[D + (x,y)]) / sum over y' of the same

   Model class: kernel ridge regression = the GP mean of Lecture 4 (linear
   trend + RBF, ell 1, s2 1, noise sd 0.1); its likelihood is
   N(y; f(x), 0.1^2). Refitting with one extra point (x, y) moves the
   prediction at x by the share  s2(x) / (s2(x) + 0.1^2)  of the way to y,
   so the refit misses y by  (1 - share) * (y - m(x)).  Labels are 81 values
   over [-0.5, 3.5] (the data's range plus a margin), as NEMO quantises y.
   Walked by the deck's -> (drag the query x at any step):
     0  the question: a distribution over the value y at this design
     1  pretend: refit with (x, y) added, for three labels
     2  score each label by how likely its own refit finds it  (numerator)
     3  normalise over all labels                              (denominator)
     4  the decision: E_NML[y | x] over every x, and its peak
   Verified in node (seed 17):
     x 3.0  one new point moves the model 26% of the way  NML sd 0.14  mean 1.45 (= model)
     x 8.5  99%  NML sd 1.17 (flat)  mean 1.53 (the middle of the labels); model says 3.50
     peak of E_NML: x 5.52 (worth 2.56; best in D 2.43) on the 251-point grid
     peak of the model's mean: x 10.00 (worth -0.14)
   ============================================================ */
IE437.widget('nml-explain', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', AMBER = '#B45309', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, N = 15, ELL = 1, S2 = 1, SN = 0.1;
  function ftrue(x) {
    return 2.55 * Math.exp(-0.5 * Math.pow((x - 6.1) / 1.75, 2))
         + 0.95 * Math.exp(-0.5 * Math.pow((x - 2.3) / 1.30, 2))
         - 0.55 * Math.exp(-0.5 * Math.pow((x - 9.3) / 1.10, 2)) + 0.10;
  }
  var R = IE437.rng(opts.seed || 17), D = [], i, j;
  for (i = 0; i < N; i++) {
    var xi = DL + (DR - DL) * (i + 0.5 + 0.55 * (R() - 0.5)) / N;
    D.push({ x: xi, y: ftrue(xi) + 0.045 * (R() * 2 - 1) });
  }
  var mx = 0, my = 0; D.forEach(function (d) { mx += d.x / N; my += d.y / N; });
  var sxy = 0, sxx = 0; D.forEach(function (d) { sxy += (d.x - mx) * (d.y - my); sxx += (d.x - mx) * (d.x - mx); });
  var slope = sxy / sxx;
  function mf(x) { return my + slope * (x - mx); }
  function kf(a, b) { return S2 * Math.exp(-0.5 * Math.pow((a - b) / ELL, 2)); }
  var K = D.map(function (a) { return D.map(function (b) { return kf(a.x, b.x); }); });
  for (i = 0; i < N; i++) K[i][i] += SN * SN;
  var L = []; for (i = 0; i < N; i++) L.push(new Array(N).fill(0));
  for (i = 0; i < N; i++) for (j = 0; j <= i; j++) { var s = K[i][j]; for (var q = 0; q < j; q++) s -= L[i][q] * L[j][q]; L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j]; }
  function fwd(b) { var y = []; for (var a = 0; a < N; a++) { var s = b[a]; for (var c = 0; c < a; c++) s -= L[a][c] * y[c]; y.push(s / L[a][a]); } return y; }
  function bwd(y) { var x = new Array(N); for (var a = N - 1; a >= 0; a--) { var s = y[a]; for (var c = a + 1; c < N; c++) s -= L[c][a] * x[c]; x[a] = s / L[a][a]; } return x; }
  var al = bwd(fwd(D.map(function (d) { return d.y - mf(d.x); })));
  function vec(x) { return fwd(D.map(function (d) { return kf(x, d.x); })); }
  function post(x) {
    var m = mf(x), a; D.forEach(function (d, n) { m += kf(x, d.x) * al[n]; });
    var v = vec(x), vv = 0; for (a = 0; a < N; a++) vv += v[a] * v[a];
    return { m: m, s2: Math.max(S2 - vv, 1e-12), v: v };
  }
  function pcov(z, x, vz, vx) { var c = kf(z, x); for (var a = 0; a < N; a++) c -= vz[a] * vx[a]; return c; }
  /* labels */
  var Y0 = -0.5, Y1 = 3.5, KY = 81, YG = [];
  for (i = 0; i < KY; i++) YG.push(Y0 + (Y1 - Y0) * i / (KY - 1));
  function nml(x) {
    var p = post(x), share = p.s2 / (p.s2 + SN * SN), lam = 1 - share;
    var w = YG.map(function (y) { return Math.exp(-0.5 * Math.pow(lam * (y - p.m), 2) / (SN * SN)); });
    var Z = w.reduce(function (a, b) { return a + b; }, 0), qd = w.map(function (v) { return v / Z; });
    var mean = 0, v2 = 0; qd.forEach(function (qq, n) { mean += qq * YG[n]; });
    qd.forEach(function (qq, n) { v2 += qq * Math.pow(YG[n] - mean, 2); });
    return { p: p, share: share, lam: lam, w: w, q: qd, mean: mean, sd: Math.sqrt(v2) };
  }
  /* the decision curve, once */
  var GX = [], GM = [], GE = [];
  for (i = 0; i <= 250; i++) { var xx = X0 + (X1 - X0) * i / 250; GX.push(xx); var r = nml(xx); GM.push(r.p.m); GE.push(r.mean); }
  var iE = 0, iM = 0; GE.forEach(function (v, n) { if (v > GE[iE]) iE = n; if (GM[n] > GM[iM]) iM = n; });

  var xq = typeof opts.x === 'number' ? opts.x : 8.5, XQ0 = xq, st = 0, NS = 4;
  host.innerHTML =
    '<div class="wbar"><span class="wt">One design, every possible label</span><span class="wspacer"></span>' +
    '<span class="wlabel">query design</span><span class="wnum" data-x></span><span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:270px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12.5px/1.55 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.1);padding-top:9px"></div></div></div>';
  var CW = 660, CH = 300, Lm = 34, Rm = 14, T = 14, B = 28, YLO = -0.7, YHI = 4.3;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  sv.setAttribute('data-try-anchor', ''); sv.setAttribute('data-try-x', 470); sv.setAttribute('data-try-y', 40);
  var PX = function (v) { return Lm + (v - X0) / (X1 - X0) * (CW - Lm - Rm); };
  var PY = function (v) { return CH - B - (v - YLO) / (YHI - YLO) * (CH - T - B); };
  function path(fn, col, w, dash, op) {
    var pts = []; for (var k = 0; k <= 250; k++) { var x = X0 + (X1 - X0) * k / 250; pts.push(PX(x).toFixed(1) + ' ' + PY(fn(x, k)).toFixed(1)); }
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '', 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, sv);
  }
  function f2(v) { var s = Math.abs(v).toFixed(2); return (v < 0 && +s ? '−' : '') + s; }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var r = nml(xq), p = r.p, X = PX(xq);
    E('rect', { x: PX(DL), y: T, width: PX(DR) - PX(DL), height: CH - B - T, fill: SLATE, 'fill-opacity': .09 }, sv);
    E('text', { x: (PX(DL) + PX(DR)) / 2, y: T + 11, 'text-anchor': 'middle', 'font-size': 9, 'font-family': MONO, fill: INK, 'fill-opacity': .45, text: 'the dataset D' }, sv);
    E('line', { x1: Lm, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .2 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 1, 2, 3, 4].forEach(function (v) { E('text', { x: Lm - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45, 'font-family': MONO, text: v }, sv); });
    path(function (x) { return ftrue(x); }, INK, 2, '', .25);
    path(function (x, k) { return GM[k]; }, BLUE, 2, '5 3', st >= 4 ? .5 : 1);
    D.forEach(function (d) { E('circle', { cx: PX(d.x), cy: PY(d.y), r: 2.8, fill: INK }, sv); });
    /* key */
    [['true f — never queried', INK, '', .3], ['the model fitted to D', BLUE, '5 3', 1]].forEach(function (k2, n) {
      var y = T + 10 + 14 * n;
      E('line', { x1: Lm + 8, x2: Lm + 26, y1: y - 3, y2: y - 3, stroke: k2[1], 'stroke-width': 2, 'stroke-dasharray': k2[2], 'stroke-opacity': k2[3] }, sv);
      E('text', { x: Lm + 31, y: y, 'font-size': 9.5, fill: INK, 'fill-opacity': .7, text: k2[0] }, sv);
    });
    if (st >= 4) {                                        /* the decision curve */
      path(function (x, k) { return GE[k]; }, GREEN, 2.6);
      E('text', { x: PX(8.2), y: PY(GE[205]) - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: GREEN, text: 'E_NML[y | x]' }, sv);
      [[iE, GREEN, GE], [iM, BLUE, GM]].forEach(function (c) {
        var x = GX[c[0]];
        E('line', { x1: PX(x), x2: PX(x), y1: PY(c[2][c[0]]), y2: PY(ftrue(x)), stroke: c[1], 'stroke-opacity': .5, 'stroke-dasharray': '2 3' }, sv);
        E('circle', { cx: PX(x), cy: PY(c[2][c[0]]), r: 6, fill: c[1] }, sv);
        E('circle', { cx: PX(x), cy: PY(ftrue(x)), r: 5, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
      });
    } else {
      /* the query line and its candidate labels */
      E('line', { x1: X, x2: X, y1: PY(Y1), y2: PY(Y0), stroke: AMBER, 'stroke-width': 1.6, 'stroke-opacity': .8 }, sv);
      E('text', { x: X, y: PY(Y1) - 6, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: AMBER, text: 'design x' }, sv);
      var TICK = [];
      for (i = 0; i <= 8; i++) TICK.push(Y0 + i * 0.5);
      if (st >= 1) {                                      /* pretend and refit, for three labels */
        [0, 1.5, 3].forEach(function (yk) {
          var dy = (yk - p.m) / (p.s2 + SN * SN), pts = [];
          for (var k = 0; k <= 250; k++) {
            var z = X0 + (X1 - X0) * k / 250, pz = post(z);
            pts.push(PX(z).toFixed(1) + ' ' + PY(pz.m + pcov(z, xq, pz.v, p.v) * dy).toFixed(1));
          }
          E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: RED, 'stroke-width': 1.4, 'stroke-opacity': .55 }, sv);
          var fit = p.m + r.share * (yk - p.m);
          E('line', { x1: X, x2: X, y1: PY(yk), y2: PY(fit), stroke: RED, 'stroke-width': 3, 'stroke-opacity': .35 }, sv);
          E('circle', { cx: X, cy: PY(fit), r: 3.5, fill: RED }, sv);
        });
      }
      var BW = Math.min(110, CW - Rm - X - 10);
      TICK.forEach(function (yk) {
        var n = Math.round((yk - Y0) / (Y1 - Y0) * (KY - 1));
        E('line', { x1: X - 5, x2: X + 5, y1: PY(yk), y2: PY(yk), stroke: AMBER, 'stroke-width': 1.6 }, sv);
        if (st === 2) E('rect', { x: X + 7, y: PY(yk) - 4, width: BW * r.w[n], height: 8, fill: AMBER, 'fill-opacity': .75 }, sv);
      });
      if (st >= 3) {                                      /* normalised: the NML distribution */
        var pts2 = [];                                    /* one fixed scale, so flat looks low and narrow looks tall */
        YG.forEach(function (y, n) { pts2.push((X + 7 + BW * Math.min(1, r.q[n] / 0.06)).toFixed(1) + ' ' + PY(y).toFixed(1)); });
        E('path', { d: 'M' + (X + 7) + ' ' + PY(Y0) + 'L' + pts2.join('L') + 'L' + (X + 7) + ' ' + PY(Y1) + 'Z', fill: GREEN, 'fill-opacity': .25, stroke: GREEN, 'stroke-width': 1.6 }, sv);
        E('path', { d: 'M' + (X - 7) + ' ' + PY(r.mean) + 'l7 -7 7 7 -7 7z', fill: GREEN }, sv);
      }
      if (st === 0 || st >= 3) E('circle', { cx: X, cy: PY(p.m), r: 5, fill: BLUE }, sv);
    }
    E('text', { x: CW / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'x' }, sv);

    host.querySelector('[data-x]').textContent = 'x = ' + xq.toFixed(1);
    var row = function (lab, v, c) { return '<div style="display:flex;justify-content:space-between"><span>' + lab + '</span><b style="color:' + (c || INK) + ';font-family:var(--mono)">' + v + '</b></div>'; };
    host.querySelector('[data-num]').innerHTML = st >= 4
      ? row('NEMO climbs to', 'x = ' + GX[iE].toFixed(2), GREEN) + row('worth', f2(ftrue(GX[iE])), GREEN) +
        row('the model\'s own peak', 'x = ' + GX[iM].toFixed(2), BLUE) + row('worth', f2(ftrue(GX[iM])), RED) +
        row('best design in D', f2(Math.max.apply(null, D.map(function (d) { return ftrue(d.x); }))))
      : row('the model predicts', f2(p.m), BLUE) +
        row('one new point moves it', Math.round(100 * r.share) + '% of the way', r.share > 0.8 ? RED : INK) +
        (st >= 3 ? row('NML spread (sd)', r.sd.toFixed(2), r.sd > 0.6 ? RED : GREEN) + row('NML mean', f2(r.mean), GREEN) : '');
    var far = r.share > 0.8;
    host.querySelector('[data-note]').innerHTML = [
      'We want a distribution over the value <i>y</i> of this design. NML asks one question of every candidate label (ticks): <b>how readily would the model accept it?</b> Drag <i>x</i> into the data and back out.',
      'Pretend each label was measured here, add it to <i>D</i>, and refit. ' + (far
        ? 'Far from the data nothing holds the model: every refit bends right through its label.'
        : 'Inside the data the neighbours hold the model: the refits barely move toward the labels.'),
      '<b>The numerator.</b> Score each label by how likely its <i>own</i> refit finds it. ' + (far
        ? 'Every label passes its own test — all bars are long.'
        : 'Only labels near the trend pass — the bars are long only there.'),
      '<b>The denominator.</b> Divide by the sum over all labels so the scores add to one. ' + (far
        ? 'Every label scored alike, so the distribution is <b>flat</b>: “I don’t know” — and its mean (◆) sits mid-range, far below the model’s 3.5.'
        : 'One region scored high, so the distribution is <b>narrow</b>: the data pin the value, and its mean (◆) is the model’s prediction (●).'),
      '<b>The decision.</b> NEMO climbs <i>x</i> on the NML mean (green). Inside the data it follows the model; outside, it sinks to the middle of the label range — so its peak stays near the data, while the model’s own peak runs to the edge.'
    ][st];
  }
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0.5, max: 9, step: 0.5, value: xq,
    on: function (v) { xq = +v; draw(); }
  });
  var show = function (k) { st = Math.max(0, Math.min(NS, k)); draw(); };
  show(0);
  return { steps: NS, step: show,
    reset: function () { xq = XQ0; dial.set(XQ0, false); show(0); },
    finish: function () { xq = XQ0; dial.set(XQ0, false); show(NS); } };
});
