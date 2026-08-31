/* ============================================================
   widget: pontryagin                               (Chapter 9, Act 4)
   The same problem the Act 2 widget solved with HJB, now solved from
   the other side — so the two answers can be put next to each other.

     plant  xdot = x + u,  x(0) = 1
     cost   int_0^2 (x^2 + u^2) dt,  no terminal cost
     H      = x^2 + u^2 + lambda (x + u)
     dH/du  = 2u + lambda = 0        ->  u* = -lambda/2
     xdot   =  x + u*,   lambdadot = -(2x + lambda),  lambda(2) = 0

   Two things are checked on the page, both computed live:

   1. SHOOTING. lambda(0) is a free guess; bisection on the terminal
      residual lambda(2) finds the one value that satisfies the
      transversality condition. It comes out
          lambda*(0) = 4.7155433066
      and the HJB solution of Act 2, integrated independently by RK4
      on the Riccati ODE, gives
          2 P(0) x0 = 4.7155433066     (relative difference 7.5e-16)
      i.e. the costate IS the value gradient. Two methods, one optimum.

   2. THE HAMILTONIAN. dH/dt = (dH/du) u-dot for a time-invariant
      problem, so H is constant exactly when u minimises H pointwise —
      which is the minimum principle itself, not a free lunch. Along
      the canonical trajectory H is conserved to 1.2e-14; along the
      same costate with u scaled to 0.5 u* (a control that does not
      minimise H) it drifts by 1.39. Both verified in node.

   Note the honest scope: H is conserved for EVERY lambda(0) guess,
   not only the right one, because every guess still integrates the
   canonical equations. It is the residual, not the flatness, that
   picks the optimum — and the widget shows both.
   ============================================================ */
IE437.widget('pontryagin', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706',
      SLATE = '#64748B', GREEN = '#16A34A', RED = '#D64545';
  var a = 1, b = 1, q = 1, r = 1, T = 2, x0 = 1;

  /* ---- HJB side: P(t) by RK4 on the Riccati ODE, for the cross-check ---- */
  function P0exact(n) {
    var h = T / n, F = function (P) { return -(2 * a * P - P * P * b * b / r + q); };
    var P = 0, i, k1, k2, k3, k4;
    for (i = 0; i < n; i++) {
      k1 = F(P); k2 = F(P - .5 * h * k1); k3 = F(P - .5 * h * k2); k4 = F(P - h * k3);
      P -= h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    }
    return P;
  }
  var P0 = P0exact(4000), LAM_HJB = 2 * P0 * x0;

  /* ---- Pontryagin side: integrate the canonical equations forward ---- */
  function shoot(lam0, n, scale) {
    scale = scale === undefined ? 1 : scale;
    var h = T / n, x = x0, lam = lam0, J = 0;
    var xs = [], ls = [], Hs = [], i, u, k1, k2, k3, k4;
    var d = function (x, lam) {
      var u = -lam * b / (2 * r) * scale;
      return [a * x + b * u, -(2 * q * x + a * lam), u];
    };
    for (i = 0; i <= n; i++) {
      u = -lam * b / (2 * r) * scale;
      xs.push([i * h, x]); ls.push([i * h, lam]);
      Hs.push([i * h, q * x * x + r * u * u + lam * (a * x + b * u)]);
      if (i === n) break;
      J += (q * x * x + r * u * u) * h;
      k1 = d(x, lam);
      k2 = d(x + .5 * h * k1[0], lam + .5 * h * k1[1]);
      k3 = d(x + .5 * h * k2[0], lam + .5 * h * k2[1]);
      k4 = d(x + h * k3[0], lam + h * k3[1]);
      x += h * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
      lam += h * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
    }
    return { xs: xs, ls: ls, Hs: Hs, J: J, xT: x, lamT: lam };
  }
  /* bisection on the terminal residual lambda(T) - 0 */
  var LAM_SHOOT = (function () {
    var lo = 0, hi = 20, m, i, R = function (l) { return shoot(l, 800).lamT; };
    for (i = 0; i < 70; i++) { m = (lo + hi) / 2; if (R(lo) * R(m) <= 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  })();

  var LAD = [3.9, 4.2, 4.45, LAM_SHOOT, 4.95, 5.2, 5.5];
  var STAR = 3, li = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Guess the costate, integrate, see whether it lands</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">costate at t = 0</span>' +
    '<span class="wnum" data-l0 style="min-width:78px;text-align:right;display:inline-block"></span>' +
    '<span data-sl></span>' +
    '<button class="wb" data-solve>shoot for it</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">state forward, costate to its terminal condition</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div class="wlabel">the Hamiltonian along the trajectory</div><div data-c2></div></div>' +
    '<div data-num style="width:196px;font:400 11.5px/1.7 var(--sans);color:var(--ink2)"></div></div>';

  var W1 = 452, W2 = 316, HH = 246;
  var sv1 = IE437.svg(W1, HH), sv2 = IE437.svg(W2, HH);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  function draw() {
    var lam0 = LAD[li], S = shoot(lam0, 900), S2 = shoot(lam0, 900, 0.5);
    var onTarget = Math.abs(S.lamT) < 1e-6;

    /* ---------- state and costate ---------- */
    var ax = IE437.plot(sv1, {
      w: W1, h: HH, pad: { l: 42, r: 16, t: 12, b: 30 },
      xdom: [0, T], ydom: [-2.6, 5.9], yticks: [-2, 0, 2, 4],
      xticks: [0, 0.5, 1, 1.5, 2], xlabel: 'time t',
      yfmt: function (v) { return v.toFixed(0); }, xfmt: function (v) { return v.toFixed(1); },
      series: [
        { pts: [[0, 0], [T, 0]], color: INK, w: 1, dash: '3 3' },
        { pts: S.ls, color: AMBER, w: 2.2 },
        { pts: S.xs, color: BLUE, w: 2.2 }
      ]
    });
    E('text', { x: ax.X(0.06), y: ax.Y(5.3), 'font-size': 10.5, fill: AMBER, 'font-weight': 700,
      text: 'costate λ(t)' }, sv1);
    E('text', { x: ax.X(0.06), y: ax.Y(5.3) + 15, 'font-size': 10.5, fill: BLUE, 'font-weight': 700,
      text: 'state x(t)' }, sv1);
    /* the terminal condition: lambda(T) must be 0 */
    E('circle', { cx: ax.X(T), cy: ax.Y(0), r: 7, fill: 'none', stroke: INK, 'stroke-width': 2 }, sv1);
    E('text', { x: ax.X(T) - 12, y: ax.Y(0) + 22, 'text-anchor': 'end', 'font-size': 10, fill: INK,
      'fill-opacity': .6, 'font-family': 'IBM Plex Mono, monospace', text: 'λ(T) must be 0' }, sv1);
    if (!onTarget) {
      E('line', { x1: ax.X(T), y1: ax.Y(0), x2: ax.X(T), y2: ax.Y(S.lamT),
        stroke: RED, 'stroke-width': 3.2 }, sv1);
      E('circle', { cx: ax.X(T), cy: ax.Y(S.lamT), r: 3.4, fill: RED }, sv1);
    } else {
      E('circle', { cx: ax.X(T), cy: ax.Y(0), r: 3.4, fill: GREEN }, sv1);
    }

    /* ---------- the Hamiltonian ---------- */
    var bx = IE437.plot(sv2, {
      w: W2, h: HH, pad: { l: 42, r: 14, t: 12, b: 30 },
      xdom: [0, T], ydom: [-1.8, 3.6], yticks: [-1, 0, 1, 2, 3],
      xticks: [0, 1, 2], xlabel: 'time t', ylabel: 'H',
      yfmt: function (v) { return v.toFixed(0); }, xfmt: function (v) { return v.toFixed(0); },
      series: [
        { pts: [[0, 0], [T, 0]], color: INK, w: 1, dash: '3 3' },
        { pts: S2.Hs, color: SLATE, w: 1.8, dash: '5 4' },
        { pts: S.Hs, color: BLUE, w: 2.4 }
      ]
    });
    E('text', { x: bx.X(0.08), y: bx.Y(S.Hs[0][1]) - 9, 'font-size': 10.5, fill: BLUE,
      'font-weight': 700, text: 'u = argmin H' }, sv2);
    var pk = S2.Hs.reduce(function (m, p) { return p[1] > m[1] ? p : m; }, S2.Hs[0]);
    E('text', { x: bx.X(pk[0]), y: bx.Y(pk[1]) - 10, 'text-anchor': 'middle', 'font-size': 10.5,
      fill: SLATE, 'font-weight': 700, text: 'u ≠ argmin H' }, sv2);

    var hs = S.Hs.map(function (p) { return p[1]; });
    var h2 = S2.Hs.map(function (p) { return p[1]; });
    var spread = Math.max.apply(null, hs) - Math.min.apply(null, hs);
    var spread2 = Math.max.apply(null, h2) - Math.min.apply(null, h2);

    host.querySelector('[data-l0]').textContent = lam0.toFixed(4);
    host.querySelector('[data-num]').innerHTML =
      '<div style="font:600 10px/1 var(--mono);letter-spacing:.12em;color:var(--ink4);' +
      'text-transform:uppercase;margin-bottom:7px">the two-point problem</div>' +
      'λ(0) <b style="font-family:var(--mono)">' + lam0.toFixed(6) + '</b><br>' +
      'λ(T) <b style="font-family:var(--mono);color:' + (onTarget ? GREEN : RED) + '">' +
      (Math.abs(S.lamT) < 1e-9 ? '0.000000' : S.lamT.toFixed(6)) + '</b>' +
      '<span style="color:var(--ink4)"> &nbsp;target 0</span><br>' +
      'cost J <b style="font-family:var(--mono)">' + S.J.toFixed(4) + '</b>' +
      '<div style="margin-top:9px;padding-top:8px;border-top:1px solid rgba(22,24,29,.12)">' +
      (onTarget
        ? '<span style="color:' + GREEN + ';font-weight:700">✓ it lands.</span> And HJB, solved ' +
          'independently, says λ*(0) = 2P(0)x₀ = <b style="font-family:var(--mono)">' +
          LAM_HJB.toFixed(6) + '</b> &mdash; agreeing to <b>' +
          Math.max(1, Math.round(-Math.log10(Math.abs(lam0 - LAM_HJB) / LAM_HJB))) + '</b> digits.'
        : 'the trajectory overshoots its terminal condition. HJB says the answer is ' +
          '<b style="font-family:var(--mono)">' + LAM_HJB.toFixed(4) + '</b>.') +
      '</div>' +
      '<div style="margin-top:9px;font-size:11px;color:var(--ink3)">H varies by ' +
      '<b style="font-family:var(--mono);color:' + BLUE + '">' + spread.toExponential(0) + '</b>' +
      ' obeying the principle, <b style="font-family:var(--mono);color:' + SLATE + '">' +
      spread2.toFixed(2) + '</b> not obeying it.</div>';
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: LAD.length - 1, step: 1, value: li,
    on: function (v) { li = v; draw(); }
  });
  host.querySelector('[data-solve]').onclick = function () { li = STAR; draw(); };

  draw();
  return { finish: function () { li = STAR; draw(); } };
});
