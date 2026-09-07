/* ============================================================
   widget: trust-region
   Successive convexification on a non-convex objective. Each step
   fits a convex quadratic model, minimises it inside the trust
   radius, then judges the step by the ratio of actual to predicted
   improvement. Grow after a successful boundary step; shrink after
   rejection. Stop using a projected-gradient test for the box domain.
   ============================================================ */
IE437.widget('trust-region', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B';
  var X0 = 0, X1 = 12, B = 0.35, ETA = 0.25, RHO0 = 0.8, RHOMAX = 3.2;
  // Two interior basins and a boundary optimum; modest curvature also exposes rejected steps.
  var STARTS = [1.1, 8.6, 0.12];
  var si = 0, x, rho, k, hist, last, stopped;
  var TOL = 2e-3;

  function f(v) { return 0.95 * Math.sin(1.15 * v) + 0.055 * (v - 5.6) * (v - 5.6) + 1.7; }
  function df(v) { return 1.0925 * Math.cos(1.15 * v) + 0.11 * (v - 5.6); }
  function model(v, xk) { var d = v - xk; return f(xk) + df(xk) * d + 0.5 * B * d * d; }
  function residual() { return Math.abs(x - Math.max(X0, Math.min(X1, x - df(x)))); }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Successive convexification &mdash; a staircase of easy problems</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">iterate</span><span class="wnum" data-k></span>' +
    '<button class="wb" data-start>new start</button>' +
    '<button class="wb" data-step>one step</button>' +
    '<button class="wb" data-auto data-run>run 15</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:11px">' +
    '<div data-status style="padding:11px 14px;text-align:center;font:700 12.5px/1.4 var(--mono);' +
    'letter-spacing:.05em"></div>' +
    '<div data-num style="font:400 12.5px/1.95 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 12px/1.6 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:11px">' +
    'The ratio tests the local model. Strong agreement at the interval boundary can enlarge it; ' +
    'rejection shrinks it. The projected-gradient residual recognises stationary points of the ' +
    'box-constrained problem, including boundary optima. This is not a global certificate.</div></div></div>';

  var CW = 520, CH = 276;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function reset() {
    x = STARTS[si]; rho = RHO0; k = 0; hist = [x]; last = null; stopped = ''; draw();
  }
  function step() {
    if (stopped) return;
    if (residual() <= TOL) { stopped = 'stationary'; draw(); return; }
    var g = df(x);
    var cand = x - g / B;                                  // unconstrained model minimiser
    if (cand < x - rho) cand = x - rho;
    if (cand > x + rho) cand = x + rho;
    if (cand < X0) cand = X0; if (cand > X1) cand = X1;
    var pred = f(x) - model(cand, x);
    var act = f(x) - f(cand);
    if (pred <= 1e-12) { stopped = 'stalled'; draw(); return; }
    var r = act / pred;
    var accept = r >= ETA;
    var grow = accept && r > 0.75 && Math.abs(cand - x) >= 0.9 * rho && rho < RHOMAX;
    last = { cand: cand, r: r, accept: accept, from: x, rho: rho, grow: grow };
    if (accept) { x = cand; if (grow) rho = Math.min(RHOMAX, rho * 2); hist.push(x); }
    else { rho = rho * 0.5; }
    k++;
    if (residual() <= TOL) stopped = 'stationary';
    else if (rho < 1e-10) stopped = 'stalled';
    draw();
  }

  function draw() {
    var curve = [];
    for (var v = X0; v <= X1 + 1e-9; v += 0.04) curve.push([v, f(v)]);
    var ys = curve.map(function (p) { return p[1]; });
    var lo = Math.min.apply(null, ys) - 0.5, hi = Math.max.apply(null, ys) + 0.5;

    var mdl = [];
    for (var u = Math.max(X0, x - rho); u <= Math.min(X1, x + rho) + 1e-9; u += 0.03) mdl.push([u, model(u, x)]);

    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 40, r: 14, t: 14, b: 30 },
      xdom: [X0, X1], ydom: [lo, hi], yticks: [], xticks: [0, 3, 6, 9, 12], xlabel: 'x',
      series: [
        { pts: curve, color: INK, w: 2 },
        { pts: mdl, color: BLUE, w: 2, dash: '5 4' }
      ]
    });

    /* the trust region band */
    var a = m.X(Math.max(X0, x - rho)), b = m.X(Math.min(X1, x + rho));
    E('rect', { x: a, y: m.Y(hi), width: b - a, height: m.Y(lo) - m.Y(hi),
      fill: BLUE, 'fill-opacity': .07 }, sv);
    E('text', { x: (a + b) / 2, y: m.Y(hi) + 13, 'text-anchor': 'middle', 'font-size': 9.5,
      'letter-spacing': 1.2, fill: BLUE, 'fill-opacity': .8,
      'font-family': 'IBM Plex Mono, monospace', text: 'TRUST REGION' }, sv);

    hist.forEach(function (h, i) {
      E('circle', { cx: m.X(h), cy: m.Y(f(h)), r: 3, fill: INK,
        'fill-opacity': i === hist.length - 1 ? 0 : .22 }, sv);
    });
    if (last) {
      E('circle', { cx: m.X(last.cand), cy: m.Y(f(last.cand)), r: 5,
        fill: 'none', stroke: last.accept ? BLUE : RED, 'stroke-width': 2 }, sv);
    }
    E('circle', { cx: m.X(x), cy: m.Y(f(x)), r: 6.5, fill: INK }, sv);

    host.querySelector('[data-k]').textContent = k;
    var st = host.querySelector('[data-status]');
    if (stopped === 'stationary') {
      st.innerHTML = 'FIRST-ORDER STATIONARY<br><span style="font-weight:400;font-size:11px;letter-spacing:0">' +
        'projected-gradient residual is small; global optimality is not certified</span>';
      st.style.background = 'rgba(22,24,29,.06)'; st.style.color = 'var(--ink)';
    } else if (stopped === 'stalled') {
      st.innerHTML = 'STALLED<br><span style="font-weight:400;font-size:11px;letter-spacing:0">' +
        'no reliable model step; the optimality test has not passed</span>';
      st.style.background = 'rgba(214,69,69,.10)'; st.style.color = RED;
    } else if (!last) {
      st.textContent = 'press “one step”'; st.style.background = 'rgba(22,24,29,.05)'; st.style.color = 'var(--ink2)';
    } else if (last.accept) {
      st.innerHTML = 'ACCEPTED &nbsp;·&nbsp; r = ' + last.r.toFixed(2) +
        '<br><span style="font-weight:400;font-size:11px;letter-spacing:0">the model was believable &mdash; step taken' +
        (last.grow ? ', trust grown' : '') + '</span>';
      st.style.background = 'rgba(37,99,235,.10)'; st.style.color = BLUE;
    } else {
      st.innerHTML = 'REJECTED &nbsp;·&nbsp; r = ' + last.r.toFixed(2) +
        '<br><span style="font-weight:400;font-size:11px;letter-spacing:0">the model over-promised &mdash; trust halved</span>';
      st.style.background = 'rgba(214,69,69,.10)'; st.style.color = RED;
    }
    host.querySelector('[data-num]').innerHTML =
      'x<sup>(k)</sup> = <b>' + x.toFixed(3) + '</b> &nbsp;&middot;&nbsp; f = <b>' + f(x).toFixed(3) + '</b><br>' +
      'trust radius &rho; = <b>' + rho.toFixed(3) + '</b> &nbsp;&middot;&nbsp; ' +
      'gradient f&prime; = ' + df(x).toFixed(3) + '<br>' +
      'projected-gradient residual = <b data-residual>' + residual().toFixed(4) + '</b><br>' +
      'accepted steps: ' + (hist.length - 1) + ' of ' + k;
  }

  host.querySelector('[data-step]').onclick = function () { step(); };
  host.querySelector('[data-run]').onclick = function () { for (var i = 0; i < 15; i++) step(); };
  var __reset = reset;
  host.querySelector('[data-start]').onclick = function () { si = (si + 1) % STARTS.length; reset(); };

  reset();
  return { reset: __reset, finish: function () { for (var i = 0; i < 120 && !stopped; i++) step(); } };
});
