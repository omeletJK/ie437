/* ============================================================
   widget: mc-estimator
   The 1/sqrt(N) law, and the constant in front of it.

   Target: P(X > t) for X ~ N(0,1) — an expectation with a known
   answer, so the error is real error, not an estimate of it.
   Left: the target density, the event, and the proposal, whose
   mean is draggable. Right: RMSE over 48 independent seeded runs
   against N on log-log, with the exact sigma/sqrt(N) line drawn
   under each cloud of points, and the 10%-relative-error rule
   as a horizontal cut: where a curve crosses it is the sample
   budget that estimator needs.

   Every "sigma" here is closed form, not simulated:
     plain MC        sigma^2 = p(1-p)
     IS, q=N(m,1)    sigma^2 = e^{m^2} * Q(t+m) - p^2
   (the second follows from phi^2/q = phi(x+m)*e^{m^2}/sqrt(2pi)).
   ============================================================ */
IE437.widget('mc-estimator', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  var TS = [1, 2, 3], ti = 2;                      /* threshold t */
  var m = 3;                                       /* proposal mean; q = N(m,1) */
  var REPS = 48, NMAX = 10000;
  var CK = [100, 200, 400, 800, 1600, 3200, 6400, 10000];

  /* ---------- exact tail, via erfc ---------- */
  function erfc(x) {
    var z = Math.abs(x), t = 2 / (2 + z), ty = 4 * t - 2, j, d = 0, dd = 0, tmp;
    var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2, -9.561514786808631e-3,
      -9.46595344482036e-4, 3.66839497852761e-4, 4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
      1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
      -2.27365122e-10, 9.6467911e-11, 2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13,
      3.81e-16, 7.106e-15];
    for (j = cof.length - 1; j > 0; j--) { tmp = d; d = ty * d - dd + cof[j]; dd = tmp; }
    var ans = t * Math.exp(-z * z + 0.5 * (cof[0] + ty * d) - dd);
    return x >= 0 ? ans : 2 - ans;
  }
  var Q = function (x) { return 0.5 * erfc(x / Math.SQRT2); };
  var phi = function (x) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); };

  function sigMC(t) { var p = Q(t); return Math.sqrt(p * (1 - p)); }
  function sigIS(t, mm) {
    var p = Q(t), m2 = Math.exp(mm * mm) * Q(t + mm);
    return Math.sqrt(Math.max(1e-300, m2 - p * p));
  }
  function budget(sig, p) { return Math.pow(sig / (0.1 * p), 2); }   /* N for 10% relative error */

  /* ---------- REPS x NMAX standard normals, fixed for the life of the widget ---------- */
  var Zs = new Float64Array(REPS * NMAX);
  (function () {
    var r = IE437.rng(opts.seed || 12345), i, u, v, R, cache = 0, have = false;
    for (i = 0; i < REPS * NMAX; i++) {
      if (have) { Zs[i] = cache; have = false; continue; }
      u = Math.max(1e-12, r()); v = r(); R = Math.sqrt(-2 * Math.log(u));
      Zs[i] = R * Math.cos(2 * Math.PI * v);
      cache = R * Math.sin(2 * Math.PI * v); have = true;
    }
  })();

  /* ---------- the two empirical RMSE curves ---------- */
  function rmseMC(t) {
    var p = Q(t), out = [], k, rep, i, acc, ci, ss = new Float64Array(CK.length);
    for (rep = 0; rep < REPS; rep++) {
      acc = 0; ci = 0;
      for (i = 0; i < NMAX; i++) {
        if (Zs[rep * NMAX + i] > t) acc++;
        if (i + 1 === CK[ci]) { var e = acc / CK[ci] - p; ss[ci] += e * e; ci++; }
      }
    }
    for (k = 0; k < CK.length; k++) out.push([CK[k], Math.sqrt(ss[k] / REPS)]);
    return out;
  }
  function rmseIS(t, mm) {
    var p = Q(t), out = [], k, rep, i, acc, ci, z, cut = t - mm, half = -0.5 * mm * mm;
    var ss = new Float64Array(CK.length);
    for (rep = 0; rep < REPS; rep++) {
      acc = 0; ci = 0;
      for (i = 0; i < NMAX; i++) {
        z = Zs[rep * NMAX + i];
        if (z > cut) acc += Math.exp(half - mm * z);       /* w = exp(-m^2/2 - m z) */
        if (i + 1 === CK[ci]) { var e = acc / CK[ci] - p; ss[ci] += e * e; ci++; }
      }
    }
    for (k = 0; k < CK.length; k++) out.push([CK[k], Math.sqrt(ss[k] / REPS)]);
    return out;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">The rate is a law; the constant is a choice</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">threshold</span><span class="wnum" data-t></span>' +
    '<button class="wb" data-td>&minus;</button><button class="wb" data-tu>+</button>' +
    '<button class="wb" data-good>aim at the event</button>' +
    '<button class="wb" data-bad>aim the wrong way</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:15px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">drag the proposal</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">root-mean-square error over 48 runs</div><div data-c2></div></div>' +
    '<div style="width:214px;display:flex;flex-direction:column;gap:8px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:8px"></div></div></div>';

  var W1 = 364, H1 = 258, W2 = 350, H2 = 258;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  var XD = [-3.4, 5.6], PL = 26, PR = 10, PT = 14, PB = 26;
  var AX = function (v) { return PL + (v - XD[0]) / (XD[1] - XD[0]) * (W1 - PL - PR); };
  var iAX = function (px) { return XD[0] + (px - PL) / (W1 - PL - PR) * (XD[1] - XD[0]); };
  var AY = function (d) { return H1 - PB - d / 0.45 * (H1 - PT - PB); };

  function drawDensities() {
    clear(sv1);
    var t = TS[ti], i, x, d;

    /* the event {x > t}: a full-height band, because the tail area itself is
       far too thin to see — which is the whole difficulty being illustrated */
    E('rect', { x: AX(t), y: PT, width: W1 - PR - AX(t), height: AY(0) - PT,
      fill: INK, 'fill-opacity': .06 }, sv1);
    d = 'M' + AX(t).toFixed(1) + ' ' + AY(0).toFixed(1);
    for (i = 0; i <= 120; i++) { x = t + (XD[1] - t) * i / 120; d += 'L' + AX(x).toFixed(1) + ' ' + AY(phi(x)).toFixed(1); }
    d += 'L' + AX(XD[1]).toFixed(1) + ' ' + AY(0).toFixed(1) + 'Z';
    E('path', { d: d, fill: INK, 'fill-opacity': .75, stroke: INK, 'stroke-width': 1 }, sv1);

    E('line', { x1: PL, y1: AY(0), x2: W1 - PR, y2: AY(0), stroke: INK, 'stroke-opacity': .3 }, sv1);
    [-3, -2, -1, 0, 1, 2, 3, 4, 5].forEach(function (v) {
      E('text', { x: AX(v), y: H1 - PB + 13, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
        'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: v }, sv1);
    });

    function curve(mm, ss, col, w, dash) {
      var dd = '';
      for (i = 0; i <= 220; i++) {
        x = XD[0] + (XD[1] - XD[0]) * i / 220;
        dd += (i ? 'L' : 'M') + AX(x).toFixed(1) + ' ' + AY(phi((x - mm) / ss) / ss).toFixed(1);
      }
      E('path', { d: dd, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }, sv1);
    }
    var better = sigIS(t, m) < sigMC(t), col = better ? BLUE : RED;
    curve(0, 1, SLATE, 2, '');
    curve(m, 1, col, 2.2, '4 3');

    /* the threshold, labelled down at the axis so it never fights the proposal */
    E('line', { x1: AX(t), y1: PT, x2: AX(t), y2: AY(0), stroke: INK, 'stroke-width': 1.6 }, sv1);
    E('text', { x: AX(t) + 5, y: AY(0) - 6, 'font-size': 9.5, fill: INK, 'font-weight': 700,
      'font-family': 'IBM Plex Mono, monospace', text: 't = ' + t }, sv1);
    E('text', { x: W1 - PR - 3, y: PT + 10, 'text-anchor': 'end', 'font-size': 9.5, fill: INK,
      'fill-opacity': .62, 'font-weight': 700, text: 'the event  x > t' }, sv1);
    E('text', { x: W1 - PR - 3, y: PT + 22, 'text-anchor': 'end', 'font-size': 9, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace',
      text: 'area = ' + Q(t).toExponential(2) }, sv1);

    /* the draggable proposal handle — labelled in the corner, never beside the
       handle, so it cannot collide with the threshold at any m */
    E('circle', { cx: AX(m), cy: AY(phi(0)), r: 5.5, fill: col }, sv1);
    E('circle', { cx: AX(m), cy: AY(phi(0)), r: 14, fill: 'transparent' }, sv1);
    E('path', { d: 'M' + (AX(m) - 15) + ' ' + (AY(phi(0)) - 12) + 'h-6m0 0l3 -3m-3 3l3 3' +
      'M' + (AX(m) + 15) + ' ' + (AY(phi(0)) - 12) + 'h6m0 0l-3 -3m3 3l-3 3',
      stroke: col, 'stroke-width': 1.3, fill: 'none', 'stroke-opacity': .8 }, sv1);

    E('text', { x: PL + 4, y: PT + 10, 'font-size': 9.5, fill: SLATE,
      'font-weight': 700, text: 'target  p = N(0,1)' }, sv1);
    E('text', { x: PL + 4, y: PT + 23, 'font-size': 9.5, fill: col, 'font-weight': 700,
      text: 'proposal  q = N(' + m.toFixed(1) + ', 1) — drag it' }, sv1);
    E('text', { x: (W1 + PL) / 2, y: H1 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: 'x — the band is the event we are estimating' }, sv1);
  }

  /* ---------- right: RMSE against N, log-log ---------- */
  var qL = 30, qR = 12, qT = 14, qB = 26;
  /* four decades of RMSE, fixed per threshold so the axis never moves while dragging.
     The bounds are chosen to hold every value the allowed proposal range can produce —
     checked offline over t in {1,2,3} and m in [-1.5, 4.5]. */
  var WINDOW = { 1: [-4, 0], 2: [-5, -1], 3: [-5, -1] };
  var LO = -5, HI = -1;
  var LX = function (n) { return qL + (Math.log10(n) - 2) / 2 * (W2 - qL - qR); };
  var LY = function (e) {
    var v = Math.max(LO, Math.min(HI, Math.log10(Math.max(1e-30, e))));
    return H2 - qB - (v - LO) / (HI - LO) * (H2 - qT - qB);
  };

  function drawCurves() {
    clear(sv2);
    var t = TS[ti], p = Q(t), k;
    LO = WINDOW[t][0]; HI = WINDOW[t][1];
    var sM = sigMC(t), sI = sigIS(t, m), better = sI < sM, col = better ? BLUE : RED;

    for (k = LO; k <= HI; k++) {
      E('line', { x1: qL, y1: LY(Math.pow(10, k)), x2: W2 - qR, y2: LY(Math.pow(10, k)),
        stroke: INK, 'stroke-opacity': .1 }, sv2);
      E('text', { x: qL - 5, y: LY(Math.pow(10, k)) + 3.4, 'text-anchor': 'end', 'font-size': 8.5,
        fill: INK, 'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: '1e' + k }, sv2);
    }
    [100, 1000, 10000].forEach(function (n) {
      E('text', { x: LX(n), y: H2 - qB + 13, 'text-anchor': 'middle', 'font-size': 8.5, fill: INK,
        'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: n }, sv2);
    });
    E('line', { x1: qL, y1: qT, x2: qL, y2: H2 - qB, stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('line', { x1: qL, y1: H2 - qB, x2: W2 - qR, y2: H2 - qB, stroke: INK, 'stroke-opacity': .28 }, sv2);

    /* the 10%-relative-error cut */
    E('line', { x1: qL, y1: LY(0.1 * p), x2: W2 - qR, y2: LY(0.1 * p), stroke: AMBER,
      'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, sv2);
    E('text', { x: W2 - qR - 2, y: LY(0.1 * p) - 4, 'text-anchor': 'end', 'font-size': 9, fill: AMBER,
      'font-weight': 700, text: '10% of the answer' }, sv2);

    /* the exact sigma/sqrt(N) lines */
    function theory(sig, c) {
      E('line', { x1: LX(100), y1: LY(sig / 10), x2: LX(10000), y2: LY(sig / 100),
        stroke: c, 'stroke-width': 1.1, 'stroke-opacity': .5, 'stroke-dasharray': '2 3' }, sv2);
    }
    theory(sM, SLATE); theory(sI, col);

    function pts(series, c, w) {
      var d = series.map(function (q, i) { return (i ? 'L' : 'M') + LX(q[0]).toFixed(1) + ' ' + LY(q[1]).toFixed(1); }).join('');
      E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': w }, sv2);
      series.forEach(function (q) { E('circle', { cx: LX(q[0]), cy: LY(q[1]), r: 2.6, fill: c }, sv2); });
    }
    pts(rmseMC(t), SLATE, 1.8);
    pts(rmseIS(t, m), col, 2.2);

    E('text', { x: qL + 6, y: qT + 9, 'font-size': 9.5, 'font-weight': 700, fill: SLATE, text: 'plain Monte Carlo' }, sv2);
    E('text', { x: qL + 6, y: qT + 22, 'font-size': 9.5, 'font-weight': 700, fill: col,
      text: 'importance sampling' }, sv2);
    E('text', { x: (W2 + qL) / 2, y: H2 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: 'N — samples (log)' }, sv2);
  }

  function drawNums() {
    var t = TS[ti], p = Q(t), sM = sigMC(t), sI = sigIS(t, m);
    var bM = budget(sM, p), bI = budget(sI, p), ratio = (sI * sI) / (sM * sM);
    function big(n) {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million';
      if (n >= 1e4) return Math.round(n / 1e3) + ',000';
      if (n >= 1e3) return (Math.round(n / 100) / 10).toFixed(1).replace('.', ',') + '00';
      return Math.round(n);
    }
    var SUP = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
      '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079' };
    function sci(v) {
      var parts = v.toExponential(2).split('e'), e = parts[1].replace('+', '');
      return parts[0] + ' \u00d7 10' + e.split('').map(function (c) {
        return c === '-' ? '\u207b' : (SUP[c] || c);
      }).join('');
    }
    host.querySelector('[data-t]').textContent = t.toFixed(0);
    host.querySelector('[data-num]').innerHTML =
      'true <b>P(X &gt; ' + t + ')</b> = <b>' + sci(p) + '</b>' +
      '<hr style="border:0;border-top:1px solid rgba(22,24,29,.12);margin:7px 0">' +
      '<span style="color:' + SLATE + '"><b>plain MC</b> &nbsp;&sigma; = ' + sM.toExponential(2) + '<br>' +
      '&nbsp;&nbsp;needs <b>' + big(bM) + '</b> samples for 10%</span><br>' +
      '<span style="color:' + (sI < sM ? BLUE : RED) + '"><b>IS, q = N(' + m.toFixed(1) + ',1)</b> &nbsp;&sigma; = ' +
      sI.toExponential(2) + '<br>&nbsp;&nbsp;needs <b>' + big(bI) + '</b> samples for 10%</span>' +
      '<hr style="border:0;border-top:1px solid rgba(22,24,29,.12);margin:7px 0">' +
      'variance ratio &nbsp;<b>' + (ratio < 1 ? '÷ ' + (1 / ratio).toFixed(0) : '× ' + ratio.toFixed(0)) + '</b>';

    var note;
    if (ratio < 0.02) note = 'The proposal sits on the event, so almost every draw carries information. <b>Both lines still fall as 1/&radic;N</b> — this one simply starts three decades lower.';
    else if (ratio < 0.9) note = 'Helping. The proposal overlaps the shaded region, the weights stay near one, and the constant drops.';
    else if (ratio < 3) note = 'Neither better nor worse than sampling from p itself. Unbiased, and pointless.';
    else note = 'Failing. The proposal almost never lands in the event, so the estimate sits at <b>a confident zero</b> and is rescued only by rare, enormous weights — which is why the early points fall <i>below</i> the line and the later ones above it.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  function draw() { drawDensities(); drawCurves(); drawNums(); }

  /* ---------- interaction ---------- */
  var drag = false;
  function px(ev) {
    var r = sv1.getBoundingClientRect(), tt = ev.touches ? ev.touches[0] : ev;
    return (tt.clientX - r.left) / r.width * W1;
  }
  sv1.style.cursor = 'ew-resize';
  function down(ev) { drag = true; move(ev); ev.preventDefault(); }
  function move(ev) {
    if (!drag) return;
    m = Math.round(Math.max(-1.5, Math.min(4.5, iAX(px(ev)))) * 10) / 10;
    draw(); ev.preventDefault();
  }
  function up() { drag = false; }
  sv1.addEventListener('mousedown', down);
  sv1.addEventListener('touchstart', down, { passive: false });
  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('mouseup', up);
  window.addEventListener('touchend', up);

  host.querySelector('[data-tu]').onclick = function () { ti = Math.min(TS.length - 1, ti + 1); draw(); };
  host.querySelector('[data-td]').onclick = function () { ti = Math.max(0, ti - 1); draw(); };
  host.querySelector('[data-good]').onclick = function () { m = TS[ti]; draw(); };
  host.querySelector('[data-bad]').onclick = function () { m = -1; draw(); };
  var __reset = function () { ti = 2; m = 3; draw(); };

  draw();
  return { reset: __reset, finish: function () { ti = 2; m = 3; draw(); } };
});
