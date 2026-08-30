/* ============================================================
   widget: policy-gradient                        (Chapter 10, Act 1)

   REINFORCE on the smallest continuous control problem there is —
   Lecture 9's LQ problem, scalar:

     x_{t+1} = A x_t + B u_t,   A = B = 1,   x_0 = 1,  T = 12
     cost    = sum_t (q x_t^2 + r u_t^2) + q x_T^2,   q = r = 1
     policy  = u = -k x + sigma * eps,  eps ~ N(0,1),  sigma = 0.25

   The only parameter is the gain k, so the whole policy-gradient
   machinery collapses to one number and can be checked against the
   closed form of Lecture 9.

     d/dk log pi(u|x) = -(u + k x) x / sigma^2 = -eps x / sigma

   The agent uses reward-to-go and NO baseline (the baseline is the
   subject of the next widget), so it is exactly the Act 1 estimator.

   VERIFIED IN NODE (200k episodes per point, seeded mulberry32):

   * the estimator is unbiased — batch mean vs exact dJ/dk, sigma=.35:
       k=0.30   exact  25.6236   sampled  25.729
       k=0.66   exact  -0.1173   sampled  -0.1186
       k=1.00   exact  -7.3036   sampled  -7.338
   * the target: the discrete algebraic Riccati equation
       P = q + A^2 P - (A P B)^2/(r + B^2 P),  K = B P A/(r + B^2 P)
     gives K = 0.6180339887 (= 1/phi), and the best CONSTANT gain for
     the finite-horizon stochastic problem, found by golden section on
     the closed-form J(k), agrees to 3e-3 for every sigma tried
     (certainty equivalence: the noise does not move the optimal gain).
   * convergence, alpha = 0.012, k0 = 1.15, 100 updates, seeds 1..10:
       N =   8  ends 0.60 0.50 0.85 0.57 0.55 0.57 0.56 0.73 0.32 0.65
       N =  32  ends 0.64 0.61 0.68 0.61 0.55 0.59 0.57 0.71 0.55 0.59
       N = 128  ends 0.59 0.59 0.63 0.71 0.65 0.59 0.64 0.66 0.57 0.57
     late rms|k - k*| = 0.148 / 0.071 / 0.045 and sd of the batch mean
     = 6.89 / 3.23 / 1.59 — halving as N quadruples, i.e. 1/sqrt(N).
   * seed 4, N = 32: k -> 0.6086, J = -3.536 = J(k*) to 3 dp.
   ============================================================ */
IE437.widget('policy-gradient', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706';

  var A = 1, B = 1, QC = 1, RC = 1, X0 = 1, T = 12, SIG = 0.25;
  var ALPHA = 0.012, K0 = 1.15, KLO = 0.15, KHI = 1.40;
  var KSTAR = 0.6180339887;                       /* Riccati gain, verified above */
  var NS = [8, 32, 128], ni = 1;
  var SEED = opts.seed === undefined ? 4 : opts.seed;

  var k, n, trace, rand, last;

  /* exact expected return of a constant gain — drawn for us, never used by the agent */
  function J(kk) {
    var c = A - B * kk, Ex2 = X0 * X0, tot = 0, t;
    for (t = 0; t < T; t++) {
      tot += QC * Ex2 + RC * (kk * kk * Ex2 + SIG * SIG);
      Ex2 = c * c * Ex2 + B * B * SIG * SIG;
    }
    return -(tot + QC * Ex2);
  }
  function dJ(kk) { return (J(kk + 1e-5) - J(kk - 1e-5)) / 2e-5; }

  function gauss() { var a = rand(); if (a < 1e-12) a = 1e-12; var b = rand();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }

  /* one episode -> per-step score and reward-to-go */
  function episode(kk) {
    var x = X0, sc = [], cs = [], t, e, u;
    for (t = 0; t < T; t++) {
      e = gauss(); u = -kk * x + SIG * e;
      cs.push(QC * x * x + RC * u * u);
      sc.push(-e * x / SIG);
      x = A * x + B * u;
    }
    cs.push(QC * x * x);
    var rtg = new Array(T), run = -cs[T];
    for (t = T - 1; t >= 0; t--) { run += -cs[t]; rtg[t] = run; }
    return { sc: sc, rtg: rtg };
  }

  function update() {
    var N = NS[ni], gs = [], i, t, g, ep;
    for (i = 0; i < N; i++) {
      ep = episode(k); g = 0;
      for (t = 0; t < T; t++) g += ep.sc[t] * ep.rtg[t];
      gs.push(g);
    }
    var m = 0; for (i = 0; i < N; i++) m += gs[i] / N;
    var v = 0; for (i = 0; i < N; i++) v += (gs[i] - m) * (gs[i] - m) / (N - 1);
    last = { g: m, sd: Math.sqrt(v), sem: Math.sqrt(v / N), truth: dJ(k) };
    k += ALPHA * m;
    if (k < 0.02) k = 0.02; if (k > 1.8) k = 1.8;
    n++; trace.push(k);
    draw();
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">REINFORCE on a scalar LQ system &mdash; the gain, learned blind</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">episodes / update</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-batch>batch size</button>' +
    '<button class="wb" data-one>one update</button>' +
    '<button class="wb" data-run>run 100</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">' +
    '<div data-big style="padding:10px 12px;background:var(--panel2);border:1px solid var(--line);' +
    'text-align:center;font:600 12.5px/1.5 var(--mono);letter-spacing:.03em"></div>' +
    '<div data-num style="font:400 12px/1.9 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:10px">' +
    'The grey bowl and the dashed line are drawn from A and B. ' +
    'The agent sees neither &mdash; only twelve rewards per episode.</div></div></div>';

  var CW = 470, CH = 256;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function draw() {
    var curve = [], v;
    for (v = KLO; v <= KHI + 1e-9; v += 0.01) curve.push([v, J(v)]);
    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 46, r: 14, t: 16, b: 32 },
      xdom: [KLO, KHI], ydom: [-7.1, -3.2],
      yticks: [-7, -6, -5, -4], xticks: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4],
      xlabel: 'gain k          (policy: u = -k x + noise)',
      ylabel: 'expected return J(k)',
      xfmt: function (t) { return t.toFixed(1); },
      series: [{ pts: curve, color: SLATE, w: 1.8 }]
    });

    /* the Riccati answer */
    E('line', { x1: m.X(KSTAR), x2: m.X(KSTAR), y1: m.Y(-3.2), y2: m.Y(-7.1),
      stroke: BLUE, 'stroke-width': 1.4, 'stroke-dasharray': '5 4', 'stroke-opacity': .85 }, sv);
    E('text', { x: m.X(KSTAR) + 6, y: m.Y(-6.55), 'font-size': 9.5, fill: BLUE,
      'letter-spacing': .6, 'font-family': 'IBM Plex Mono, monospace',
      text: 'k* = 0.618  (Riccati)' }, sv);

    /* where the gain has been */
    trace.forEach(function (h, i) {
      if (h < KLO || h > KHI) return;
      E('circle', { cx: m.X(h), cy: m.Y(J(h)), r: 3, fill: AMBER,
        'fill-opacity': 0.12 + 0.6 * i / Math.max(1, trace.length - 1) }, sv);
    });
    var kk = Math.max(KLO, Math.min(KHI, k));
    E('line', { x1: m.X(kk), x2: m.X(kk), y1: m.Y(J(kk)), y2: m.Y(-7.1),
      stroke: INK, 'stroke-width': 1, 'stroke-opacity': .28 }, sv);
    E('circle', { cx: m.X(kk), cy: m.Y(J(kk)), r: 6, fill: INK }, sv);

    host.querySelector('[data-n]').textContent = NS[ni];

    var d = Math.abs(k - KSTAR);
    var big = host.querySelector('[data-big]');
    big.innerHTML = 'k = <b style="font-size:16px">' + k.toFixed(4) + '</b>' +
      '<br><span style="font-weight:400;font-size:11px;color:var(--ink3)">' +
      (n === 0 ? 'press &ldquo;run 100&rdquo;'
        : '|k &minus; k*| = ' + d.toFixed(4) + ' &nbsp;&middot;&nbsp; J = ' + J(k).toFixed(3) +
          ' vs J(k*) = ' + J(KSTAR).toFixed(3)) + '</span>';
    big.style.color = (n && d < 0.08) ? BLUE : 'var(--ink)';

    host.querySelector('[data-num]').innerHTML = last
      ? 'batch estimate &nbsp;<b>&gcirc; = ' + last.g.toFixed(2) + '</b><br>' +
        'true &nabla;J = ' + last.truth.toFixed(2) +
        ' <span style="color:var(--ink4)">(unavailable to the agent)</span><br>' +
        'spread across the batch &nbsp;sd = <b>' + last.sd.toFixed(1) + '</b><br>' +
        'so sd of the mean = sd/&radic;N = <b>' + last.sem.toFixed(2) + '</b><br>' +
        'updates: ' + n + ' &nbsp;&middot;&nbsp; episodes used: ' + (n * NS[ni])
      : 'no update yet.<br>Each update runs ' + NS[ni] + ' episodes, scores every action it took,' +
        ' and weights each score by the reward that followed it.';
  }

  function reset() {
    rand = IE437.rng(SEED); k = K0; n = 0; trace = [k]; last = null; draw();
  }
  host.querySelector('[data-one]').onclick = function () { update(); };
  host.querySelector('[data-run]').onclick = function () { for (var i = 0; i < 100; i++) update(); };
  host.querySelector('[data-rs]').onclick = reset;
  host.querySelector('[data-batch]').onclick = function () { ni = (ni + 1) % NS.length; reset(); };

  reset();
  return { finish: function () { if (n === 0) for (var i = 0; i < 100; i++) update(); } };
});
