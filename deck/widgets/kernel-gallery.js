/* ============================================================
   widget: kernel-gallery                           (Chapter 4, Act 2)
   The kernel vocabulary of the source deck (pp. 22-25), drawn. For each
   kernel: its covariance matrix over the input range (left), and four
   functions drawn from the GP prior it defines (right).

   The four draws reuse the SAME standard-normal vectors for every
   kernel and every length scale — f = L z with z fixed — so whatever
   changes on screen is caused by the kernel and nothing else. That is
   the claim of the slide: the kernel is the modelling assumption, and
   you can see it before a single data point arrives.
   ============================================================ */
IE437.widget('kernel-gallery', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', RED = '#D64545';
  var COLS = [BLUE, AMBER, GREEN, RED];
  var N = 120, LO = -3, HI = 3, NH = 40;          // sample grid, heatmap grid
  var PER = 2;                                     // period of the periodic kernel

  function m32(r, l) { var a = Math.sqrt(3) * r / l; return (1 + a) * Math.exp(-a); }
  function m52(r, l) { var a = Math.sqrt(5) * r / l; return (1 + a + a * a / 3) * Math.exp(-a); }
  function se(r, l) { return Math.exp(-0.5 * r * r / (l * l)); }
  function per(r, l) { var s = Math.sin(Math.PI * r / PER); return Math.exp(-2 * s * s / (l * l)); }

  var K = [
    { k: 'se',  n: 'Squared exponential', ls: true,
      f: function (x, y, l) { return se(Math.abs(x - y), l); },
      a: 'Infinitely differentiable. Assumes the function is <b>very smooth</b> everywhere &mdash; often too smooth for physical data.' },
    { k: 'm52', n: 'Matérn 5/2', ls: true,
      f: function (x, y, l) { return m52(Math.abs(x - y), l); },
      a: 'Twice differentiable. Smooth, but allows <b>sharper turns</b> than SE &mdash; the usual default in Bayesian optimisation.' },
    { k: 'm32', n: 'Matérn 3/2', ls: true,
      f: function (x, y, l) { return m32(Math.abs(x - y), l); },
      a: 'Once differentiable. <b>Visibly rough</b> sample paths; honest when the response has kinks.' },
    { k: 'per', n: 'Periodic', ls: true,
      f: function (x, y, l) { return per(Math.abs(x - y), l); },
      a: 'Points one period apart are <b>perfectly correlated</b>. Assumes the function repeats, with period ' + PER + '.' },
    { k: 'lin', n: 'Linear', ls: false,
      f: function (x, y) { return 0.25 + 0.25 * x * y; },
      a: 'Not stationary: variance grows away from the origin. Every draw is a <b>straight line</b> &mdash; Bayesian linear regression.' },
    { k: 'sum', n: 'SE + Linear', ls: true,
      f: function (x, y, l) { return se(Math.abs(x - y), l) * 0.6 + 0.25 * x * y; },
      a: '<b>Sum</b> = independent components added: a linear trend plus smooth wiggles around it.' },
    { k: 'prod', n: 'SE × Periodic', ls: true,
      f: function (x, y, l) { return se(Math.abs(x - y), 2.5) * per(Math.abs(x - y), l); },
      a: '<b>Product</b> = both similarities required: a pattern that repeats, but <b>drifts</b> from one period to the next.' }
  ];
  var LS = [0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0, 2.8];
  var ki = 0, li = 4;

  host.innerHTML =
    '<div class="wbar"><span class="wt">One prior per kernel &mdash; before any data</span>' +
    '<span class="wspacer"></span><div data-sl></div></div>' +
    '<div class="wbody" style="gap:10px">' +
    '<div data-k style="display:flex;gap:6px;flex-wrap:wrap"></div>' +
    '<div style="display:flex;gap:22px;align-items:center;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">covariance k(x, x′)</div><div data-h></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">four draws from the prior</div><div data-s></div></div></div>' +
    '<div data-a style="font:400 13px/1.55 var(--sans);color:var(--ink2);text-align:center;min-height:21px"></div></div>';

  var kb = host.querySelector('[data-k]');
  K.forEach(function (k, i) {
    var b = document.createElement('button'); b.className = 'wb'; b.textContent = k.n;
    b.onclick = function () { ki = i; draw(); }; kb.appendChild(b);
  });

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    label: 'length scale', min: 0, max: LS.length - 1, step: 1, value: li,
    fmt: function (i) { return 'λ = ' + LS[i]; },
    on: function (i) { li = i; draw(); }
  });

  var HS = 220, SW = 560, SH = 220;
  var svH = IE437.svg(HS, HS), svS = IE437.svg(SW, SH);
  host.querySelector('[data-h]').appendChild(svH);
  host.querySelector('[data-s]').appendChild(svS);

  /* the fixed noise every kernel is fed */
  var rand = IE437.rng(opts.seed || 11), Z = [];
  function g() { var u = Math.max(1e-12, rand()), v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  for (var d = 0; d < 4; d++) { var z = []; for (var i = 0; i < N; i++) z.push(g()); Z.push(z); }
  var XS = []; for (i = 0; i < N; i++) XS.push(LO + (HI - LO) * i / (N - 1));

  function chol(A) {
    var n = A.length, L = [], i, j, k, s;
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      s = A[i][j];
      for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) L[i][j] = Math.sqrt(Math.max(s, 1e-12));
      else L[i][j] = s / L[j][j];
    }
    return L;
  }

  function draw() {
    var kk = K[ki], l = LS[li];
    [].forEach.call(kb.children, function (b, i) { b.classList.toggle('on', i === ki); });
    dial.el.style.opacity = kk.ls ? 1 : .35;
    dial.input.disabled = !kk.ls;

    /* covariance heatmap */
    while (svH.firstChild) svH.removeChild(svH.firstChild);
    var c = HS / NH, mx = 0, M = [];
    for (var a = 0; a < NH; a++) { M.push([]); for (var b = 0; b < NH; b++) {
      var xa = LO + (HI - LO) * (a + .5) / NH, xb = LO + (HI - LO) * (b + .5) / NH;
      var v = kk.f(xa, xb, l); M[a].push(v); mx = Math.max(mx, Math.abs(v)); } }
    for (a = 0; a < NH; a++) for (b = 0; b < NH; b++) {
      var t = M[a][b] / mx;
      E('rect', { x: b * c, y: a * c, width: c + .4, height: c + .4,
        fill: t >= 0 ? BLUE : RED, 'fill-opacity': Math.min(1, Math.abs(t)) * .9 }, svH);
    }
    E('rect', { x: .5, y: .5, width: HS - 1, height: HS - 1, fill: 'none', stroke: INK, 'stroke-opacity': .25 }, svH);

    /* prior draws: f = L z */
    var A = [];
    for (i = 0; i < N; i++) { A.push([]); for (var j = 0; j < N; j++) A[i].push(kk.f(XS[i], XS[j], l) + (i === j ? 1e-6 : 0)); }
    var L = chol(A), series = [], ymax = 0;
    Z.forEach(function (z, s) {
      var pts = [];
      for (var r = 0; r < N; r++) { var sum = 0; for (var q = 0; q <= r; q++) sum += L[r][q] * z[q]; pts.push([XS[r], sum]); ymax = Math.max(ymax, Math.abs(sum)); }
      series.push({ pts: pts, color: COLS[s], w: 1.8 });
    });
    var yl = Math.max(2.5, Math.ceil(ymax * 1.05 * 2) / 2);
    IE437.plot(svS, { w: SW, h: SH, pad: { l: 30, r: 8, t: 8, b: 22 }, xdom: [LO, HI], ydom: [-yl, yl],
      xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [-2, 0, 2], xlabel: 'x',
      xfmt: function (v) { return String(v); }, series: series });

    host.querySelector('[data-a]').innerHTML = '<b>' + kk.n + '</b> &mdash; ' + kk.a;
  }

  draw();
  return {
    reset: function () { ki = 0; li = 4; dial.set(li, false); draw(); },
    finish: function () { ki = opts && opts.kernel != null ? opts.kernel : 0; draw(); }
  };
});
