/* ============================================================
   widget: cfg-guide                              (Chapter 6, Act 4)
   Classifier-free guidance on a picture students can read: designs in
   two dimensions, in two groups — high-score designs (y = high) and the
   others. One denoiser, asked with y and without it (∅), looks at a
   noisy design x_t; removing the noise it predicts gives its guess of
   the clean design. The arrows run from x_t to those guesses.

     other designs  N((-0.8, 0), 0.65^2 I), weight 0.65
     high-score     N(( 0.9, 0.25), 0.55^2 I), weight 0.35
     noisy design   x_t = (-0.05, 1.45) at noise level tau = 0.95
     guess          x_t + tau^2 * grad log p_tau(x_t)   (exact, Gaussian mixture)
                    without y (-0.10, 0.50)   with y (0.66, 0.55)
     guided, w = 2  with-y guess + 2 x (with y - without y) = (2.18, 0.66)

   Samples: 120 runs of the probability-flow ODE with the exact scores,
   80 steps from tau = 3 to 0.01, guided by eps(y) + w [eps(y) - eps(∅)].
   Recomputed in node with the same seed: w = 0 -> 83% of samples on the
   high-score side of the implied classifier, spread 0.57, centre
   x1 = 0.78; w = 3 -> 100%, spread 0.42, centre 1.52 — past the
   high-score group's centre (0.90), toward its far edge.

   mode "cond"      0 the data and x_t   1 guess without y   2 guess with y
   mode "guide"     0 both guesses and what y adds   1 the guided guess, w = 2
   mode "strength"  0 whole runs at w = 0   1 beside them, w = 3
   ============================================================ */
IE437.widget('cfg-guide', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', SLATE = '#64748B', BLUE = '#2563EB', RED = '#D64545', AMBER = '#B45309';
  var MONO = 'IBM Plex Mono, monospace';
  var MODE = opts.mode || 'guide';

  /* ---------- the toy: a two-group mixture, exact scores at every noise level ---------- */
  var MO = [-0.8, 0], SO = 0.65, MH = [0.9, 0.25], SH = 0.55, PH = 0.35;
  function g(x, m, v) {
    var a = x[0] - m[0], b = x[1] - m[1];
    return Math.exp(-(a * a + b * b) / (2 * v)) / (2 * Math.PI * v);
  }
  function scoreU(x, t) {                                          /* no condition: the whole mixture */
    var vo = SO * SO + t * t, vh = SH * SH + t * t;
    var a = (1 - PH) * g(x, MO, vo), b = PH * g(x, MH, vh), r = b / (a + b);
    return [(1 - r) * (MO[0] - x[0]) / vo + r * (MH[0] - x[0]) / vh,
            (1 - r) * (MO[1] - x[1]) / vo + r * (MH[1] - x[1]) / vh];
  }
  function scoreC(x, t) {                                          /* y = high: the high-score group */
    var vh = SH * SH + t * t;
    return [(MH[0] - x[0]) / vh, (MH[1] - x[1]) / vh];
  }
  function pHigh(x) {                                              /* the classifier the guidance implies */
    var a = (1 - PH) * g(x, MO, SO * SO), b = PH * g(x, MH, SH * SH);
    return b / (a + b);
  }
  var R = IE437.rng(opts.seed || 5);
  function gs() { var u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); }
  var DATA = [], i;
  for (i = 0; i < 64; i++) DATA.push([MO[0] + SO * gs(), MO[1] + SO * gs(), 0]);
  for (i = 0; i < 34; i++) DATA.push([MH[0] + SH * gs(), MH[1] + SH * gs(), 1]);

  var XT = [-0.05, 1.45], TAU = 0.95, W = 2;
  var su = scoreU(XT, TAU), sc = scoreC(XT, TAU);
  var GU = [XT[0] + TAU * TAU * su[0], XT[1] + TAU * TAU * su[1]];   /* guess without y */
  var GC = [XT[0] + TAU * TAU * sc[0], XT[1] + TAU * TAU * sc[1]];   /* guess with y */
  var GW = [GC[0] + W * (GC[0] - GU[0]), GC[1] + W * (GC[1] - GU[1])];

  function run(w, n, seed) {
    var Q = IE437.rng(seed), out = [], T = 3, K = 80;
    function q() { var u = 0; while (u === 0) u = Q(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Q()); }
    for (var j = 0; j < n; j++) {
      var x = [T * q(), T * q()];
      for (var k = 0; k < K; k++) {
        var t = T * Math.pow(0.01 / T, k / K), t2 = T * Math.pow(0.01 / T, (k + 1) / K);
        var u = scoreU(x, t), c = scoreC(x, t);
        var s0 = c[0] + w * (c[0] - u[0]), s1 = c[1] + w * (c[1] - u[1]);
        x = [x[0] + t * (t - t2) * s0, x[1] + t * (t - t2) * s1];   /* probability-flow ODE */
      }
      out.push(x);
    }
    var hi = out.filter(function (p) { return pHigh(p) > 0.5; }).length / n;
    var cx = out.reduce(function (a, p) { return a + p[0]; }, 0) / n, cy = out.reduce(function (a, p) { return a + p[1]; }, 0) / n;
    var sd = Math.sqrt(out.reduce(function (a, p) { return a + (p[0] - cx) * (p[0] - cx) + (p[1] - cy) * (p[1] - cy); }, 0) / n / 2);
    return { pts: out, hi: hi, cx: cx, sd: sd };
  }
  var SAMP = MODE === 'strength' ? [run(0, 120, 11), run(3, 120, 11)] : null;

  /* ---------- layout ---------- */
  var N = { cond: 2, guide: 1, strength: 1 }[MODE], st = 0;
  var TITLE = { cond: 'One denoiser, asked with y and without it',
                guide: 'Guidance: go w times further in the direction y adds',
                strength: 'Whole runs of the generator, at two guidance strengths' }[MODE];
  var RULE = { cond: ['inputs', 'ε_θ(x_t, t, y) · y or ∅'], guide: ['guided', 'ε(y) + w [ε(y) − ε(∅)]'],
               strength: ['implied classifier', 'p(y | x) ∝ p(x | y) / p(x)'] }[MODE];
  host.innerHTML =
    '<div class="wbar"><span class="wt">' + TITLE + '</span><span class="wspacer"></span>' +
    '<span class="wlabel">' + RULE[0] + '</span><span class="wnum">' + RULE[1] + '</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:' + (MODE === 'strength' ? 260 : 300) + 'px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  /* the arrow modes zoom in on x_t and the guesses; the strength mode shows both groups whole */
  var ST = MODE === 'strength';
  var X0 = ST ? -2.5 : -2.0, X1 = ST ? 3.0 : 2.6, Y0 = ST ? -1.5 : -0.6, Y1 = ST ? 2.0 : 1.75, GAP = 22;
  var PT = ST ? 44 : 4;
  var SC = ST ? 58 : 66, PWD = (X1 - X0) * SC, PHT = (Y1 - Y0) * SC;
  var NP = MODE === 'strength' ? 2 : 1;
  var sv = IE437.svg(Math.round(NP * PWD + (NP - 1) * GAP) + 4, Math.round(PHT) + PT + 4);
  host.querySelector('[data-c]').appendChild(sv);
  var OX = 2;                                                      /* left edge of the current panel */
  function PX(x) { return OX + (x - X0) * SC; }
  function PY(y) { return PT + (Y1 - y) * SC; }
  function txt(x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 11, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }
  function label(x, y, s, col, o) {                                /* text with a halo, readable over dots */
    var a = { 'font-size': 12, 'font-weight': 700, fill: col, stroke: '#F1F1ED', 'stroke-width': 4,
      'paint-order': 'stroke', 'stroke-linejoin': 'round' };
    for (var k in o) a[k] = o[k];
    return txt(x, y, s, a);
  }
  function arrow(a, b, col, w, dash) {
    var x1 = PX(a[0]), y1 = PY(a[1]), x2 = PX(b[0]), y2 = PY(b[1]);
    var ang = Math.atan2(y2 - y1, x2 - x1), h = 10;
    E('line', { x1: x1, y1: y1, x2: x2 - h * .7 * Math.cos(ang), y2: y2 - h * .7 * Math.sin(ang), stroke: col,
      'stroke-width': w, 'stroke-dasharray': dash || '' }, sv);
    E('path', { d: 'M' + x2 + ' ' + y2 + 'L' + (x2 - h * Math.cos(ang - .4)) + ' ' + (y2 - h * Math.sin(ang - .4)) +
      'L' + (x2 - h * Math.cos(ang + .4)) + ' ' + (y2 - h * Math.sin(ang + .4)) + 'Z', fill: col }, sv);
  }
  function inside(p) { return p[0] > X0 && p[0] < X1 && p[1] > Y0 && p[1] < Y1; }
  function frame(faded) {
    E('rect', { x: PX(X0), y: PY(Y1), width: PWD, height: PHT, fill: 'none', stroke: INK, 'stroke-opacity': .15 }, sv);
    DATA.forEach(function (d) {
      if (inside(d)) E('circle', { cx: PX(d[0]), cy: PY(d[1]), r: 3.2, fill: d[2] ? BLUE : SLATE,
        'fill-opacity': faded ? (d[2] ? .3 : .22) : (d[2] ? .7 : .45) }, sv);
    });
  }
  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    if (MODE === 'strength') {
      [0, 1].forEach(function (k) {
        OX = 2 + k * (PWD + GAP);
        var col = k ? RED : BLUE, on = k <= st;
        txt(OX, 15, 'w = ' + (k ? 3 : 0) + (k ? ' — guided' : ' — the plain conditional model'),
          { 'font-size': 12.5, 'font-weight': 700, fill: on ? col : SLATE, 'fill-opacity': on ? 1 : .4, 'font-family': MONO });
        frame(true);
        if (!on) return;
        txt(OX, 33, pct(SAMP[k].hi) + ' look high-score · spread ' + SAMP[k].sd.toFixed(2),
          { 'font-size': 12, fill: col, 'font-family': MONO });
        SAMP[k].pts.forEach(function (p) {
          if (inside(p)) E('circle', { cx: PX(p[0]), cy: PY(p[1]), r: 3, fill: 'none', stroke: col, 'stroke-width': 1.3 }, sv);
        });
      });
      return;
    }
    OX = 2;
    var arrows = MODE === 'guide' || st >= 1;
    frame(arrows);
    E('circle', { cx: PX(XT[0]), cy: PY(XT[1]), r: 6, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
    label(PX(XT[0]) + 12, PY(XT[1]) + 4, 'x_t, a noisy design', INK);
    if (MODE === 'guide' || st >= 1) {
      arrow(XT, GU, SLATE, 2.6);
      label(PX(GU[0]) - 10, PY(GU[1]) + 4, 'guess without y', SLATE, { 'text-anchor': 'end' });
    }
    if (MODE === 'guide' || st >= 2) {
      arrow(XT, GC, BLUE, 2.6);
      label(PX(GC[0]) + 8, PY(GC[1]) - 14, 'guess with y', BLUE);
    }
    if (MODE === 'guide') {
      arrow(GU, GC, AMBER, 2.2, '5 3');
      label((PX(GU[0]) + PX(GC[0])) / 2, PY(GU[1]) + 20, 'what y adds', AMBER, { 'text-anchor': 'middle' });
      if (st >= 1) {
        arrow(GC, GW, RED, 2.8);
        label(PX(GW[0]) - 20, PY(GW[1]) + 24, 'guided, w = ' + W, RED, { 'text-anchor': 'middle', 'font-family': MONO });
      }
    }
  }

  var pct = function (v) { return Math.round(v * 100) + '%'; };
  function show(k) {
    st = Math.max(0, Math.min(N, k));
    draw();
    var NOTE = {
      cond: [
        'Each dot is a measured design. <b>y</b> is its condition: here, whether it is a high-score design.<br>' +
        'Act 2’s denoiser looks at a noisy design <b>x_t</b> and predicts the noise in it. ' +
        'Removing that noise gives ==its guess of the clean design==.',
        'Asked <b>without y</b> (∅), the guess is a design like the data as a whole: ' +
        'x_t could have come from either group, so the guess lands between them.',
        'Asked <b>with y = high</b>, the guess is a high-score design.<br>' +
        'Generate with y fixed at every step, and the designs come out high-score: ==a conditional generator, G3==.'
      ],
      guide: [
        'The same denoiser, asked both ways at the same noisy design. ' +
        'The dashed arrow, from one guess to the other, is ==what the condition adds==.',
        'Guidance takes the with-y guess and goes <b>w</b> times further along that arrow:<br>' +
        'guided = with y + w × (with y − without y).<br>' +
        'With w = 0 it is the plain conditional model; here w = ' + W + '.'
      ],
      strength: MODE !== 'strength' ? [] : [
        'Each circle is one generated design. With w = 0, ' + pct(SAMP[0].hi) + ' fall where the designs look ' +
        'high-score; the rest land in the overlap with the other designs.',
        'With w = 3, ' + pct(SAMP[1].hi) + ' look high-score, and they vary less: spread ' + SAMP[0].sd.toFixed(2) +
        ' → ' + SAMP[1].sd.toFixed(2) + '.<br>They also move ==away from the other designs==, to the far edge of ' +
        'the high-score group.'
      ]
    }[MODE];
    var KEY = ST ? '' : '<div style="font:700 12.5px/1.5 var(--sans);margin-bottom:8px">' +
      '<span style="color:' + BLUE + '">● high-score designs (y = high)</span>&nbsp;&nbsp;' +
      '<span style="color:' + SLATE + '">● other designs</span></div>';
    host.querySelector('[data-note]').innerHTML = KEY + NOTE[st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
