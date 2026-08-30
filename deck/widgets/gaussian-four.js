/* ============================================================
   widget: gaussian-four
   Property 4, made draggable. Left: the joint N(mu, Sigma) as
   contours, with 3000 seeded draws behind them and the locus of
   conditional means (the regression line) across it. Drag the
   cross-hair to move mu; click or drag anywhere else to move the
   conditioning line y1 = c. Right: the exact conditional density
   p(y2 | y1 = c) against the marginal p(y2), with the draws that
   actually fell inside the strip histogrammed on top of it — so
   the analytic curve is checked against samples on screen.

   The two presets are Chapter 4's own numbers: corr(f1,f2)=0.966
   (a narrow spike) and corr(f1,f5)=0.573 (barely narrower), both
   conditioned on the deck's observed value f1 = -0.313.
   ============================================================ */
IE437.widget('gaussian-four', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B';

  /* ---------- state ---------- */
  var S = { m1: 0, m2: 0, s1: 1, s2: 1, rho: 0.75, c: 0.9 };
  var D0 = { m1: 0, m2: 0, s1: 1, s2: 1, rho: 0.75, c: 0.9 };

  var RHOS = [-0.95, -0.85, -0.7, -0.5, -0.25, 0, 0.25, 0.5, 0.573, 0.7, 0.85, 0.95, 0.966];
  var SIGS = [0.45, 0.6, 0.8, 1.0, 1.25, 1.5];

  /* ---------- 3000 fixed standard-normal draws ---------- */
  var NS = 3000, Z = new Float64Array(2 * NS);
  (function () {
    var r = IE437.rng(opts.seed || 11), i, u, v, R;
    for (i = 0; i < NS; i++) {
      u = Math.max(1e-12, r()); v = r(); R = Math.sqrt(-2 * Math.log(u));
      Z[2 * i] = R * Math.cos(2 * Math.PI * v);
      Z[2 * i + 1] = R * Math.sin(2 * Math.PI * v);
    }
  })();

  host.innerHTML =
    '<div class="wbar"><span class="wt">Condition on y&#8321; = c, and watch the slice</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">correlation</span><span class="wnum" data-r></span>' +
    '<button class="wb" data-rd>&minus;</button><button class="wb" data-ru>+</button>' +
    '<span class="wlabel" style="margin-left:6px">spread of y&#8322;</span>' +
    '<button class="wb" data-sd>&minus;</button><button class="wb" data-su>+</button>' +
    '<button class="wb" data-p1>Ch 4 &middot; neighbours</button>' +
    '<button class="wb" data-p2>Ch 4 &middot; four apart</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the joint &mdash; drag the cross, or drag the line</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">marginal vs. conditional</div><div data-c2></div></div>' +
    '<div style="width:232px;display:flex;flex-direction:column;gap:8px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:8px"></div></div></div>';

  var W1 = 396, H1 = 274, W2 = 236, H2 = 274;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  var DOM = [-3.5, 3.5];
  var PL = 30, PR = 10, PT = 12, PB = 26;
  var X1 = function (v) { return PL + (v - DOM[0]) / (DOM[1] - DOM[0]) * (W1 - PL - PR); };
  var Y1 = function (v) { return H1 - PB - (v - DOM[0]) / (DOM[1] - DOM[0]) * (H1 - PT - PB); };
  var iX1 = function (px) { return DOM[0] + (px - PL) / (W1 - PL - PR) * (DOM[1] - DOM[0]); };
  var iY1 = function (py) { return DOM[0] + (H1 - PB - py) / (H1 - PT - PB) * (DOM[1] - DOM[0]); };

  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  function fmt(x, d) { return (x < 0 ? '−' : '') + Math.abs(x).toFixed(d); }

  /* ---------- the closed forms (Property 4) ---------- */
  function cond() {
    var m = S.m2 + S.rho * (S.s2 / S.s1) * (S.c - S.m1);
    var sd = S.s2 * Math.sqrt(1 - S.rho * S.rho);
    return { m: m, sd: sd, shrink: Math.sqrt(1 - S.rho * S.rho) };
  }
  /* Cholesky of Sigma: L = [[s1,0],[rho*s2, s2*sqrt(1-rho^2)]] */
  function chol() { return [S.s1, 0, S.rho * S.s2, S.s2 * Math.sqrt(1 - S.rho * S.rho)]; }
  function map(z1, z2) { var L = chol(); return [S.m1 + L[0] * z1, S.m2 + L[2] * z1 + L[3] * z2]; }
  var npdf = function (x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); };

  /* ---------- left: the joint ---------- */
  function drawJoint() {
    clear(sv1);
    var i, k, t, p;

    /* the draws, faint; the ones inside the strip, ink */
    var HW = 0.16 * S.s1, inStrip = [];
    var g = E('g', {}, sv1);
    for (i = 0; i < NS; i += 2) {                       /* every other draw: 1500 dots */
      p = map(Z[2 * i], Z[2 * i + 1]);
      if (p[0] < DOM[0] || p[0] > DOM[1] || p[1] < DOM[0] || p[1] > DOM[1]) continue;
      var hit = Math.abs(p[0] - S.c) < HW;
      E('circle', { cx: X1(p[0]).toFixed(1), cy: Y1(p[1]).toFixed(1), r: hit ? 1.35 : 1,
        fill: hit ? BLUE : INK, 'fill-opacity': hit ? .5 : .13 }, g);
    }
    for (i = 0; i < NS; i++) {                          /* all draws feed the histogram */
      p = map(Z[2 * i], Z[2 * i + 1]);
      if (Math.abs(p[0] - S.c) < HW) inStrip.push(p[1]);
    }

    /* axes */
    E('line', { x1: PL, y1: Y1(0), x2: W1 - PR, y2: Y1(0), stroke: INK, 'stroke-opacity': .16 }, sv1);
    E('line', { x1: X1(0), y1: PT, x2: X1(0), y2: H1 - PB, stroke: INK, 'stroke-opacity': .16 }, sv1);
    E('line', { x1: PL, y1: H1 - PB, x2: W1 - PR, y2: H1 - PB, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: PL, y1: PT, x2: PL, y2: H1 - PB, stroke: INK, 'stroke-opacity': .28 }, sv1);
    [-3, -2, -1, 0, 1, 2, 3].forEach(function (v) {
      E('text', { x: X1(v), y: H1 - PB + 13, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
        'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: v }, sv1);
    });
    [-3, 0, 3].forEach(function (v) {
      E('text', { x: PL - 5, y: Y1(v) + 3.4, 'text-anchor': 'end', 'font-size': 9, fill: INK,
        'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: v }, sv1);
    });

    /* the contours: y = mu + k * L * (cos t, sin t) */
    var L = chol();
    [0.75, 1.5, 2.25].forEach(function (kk, idx) {
      var d = '';
      for (k = 0; k <= 72; k++) {
        t = 2 * Math.PI * k / 72;
        var a = kk * Math.cos(t), b = kk * Math.sin(t);
        var yy1 = S.m1 + L[0] * a, yy2 = S.m2 + L[2] * a + L[3] * b;
        d += (k ? 'L' : 'M') + X1(yy1).toFixed(1) + ' ' + Y1(yy2).toFixed(1);
      }
      E('path', { d: d + 'Z', fill: 'none', stroke: INK, 'stroke-width': idx === 1 ? 1.6 : 1.1,
        'stroke-opacity': idx === 1 ? .55 : .3 }, sv1);
    });

    /* the regression line: the locus of conditional means as c sweeps */
    var slope = S.rho * S.s2 / S.s1;
    var ra = S.m2 + slope * (DOM[0] - S.m1), rb = S.m2 + slope * (DOM[1] - S.m1);
    E('line', { x1: X1(DOM[0]), y1: Y1(Math.max(DOM[0], Math.min(DOM[1], ra))),
      x2: X1(DOM[1]), y2: Y1(Math.max(DOM[0], Math.min(DOM[1], rb))),
      stroke: AMBER, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', 'stroke-opacity': .85 }, sv1);
    E('text', { x: W1 - PR - 3, y: 22, 'text-anchor': 'end', 'font-size': 9.5, fill: AMBER,
      'font-weight': 700, text: 'E[y₂ | y₁]' }, sv1);

    /* the conditioning line and the conditional's mean and +/- 1 sd */
    var C = cond();
    E('rect', { x: X1(S.c - HW), y: PT, width: Math.max(1.5, X1(S.c + HW) - X1(S.c - HW)),
      height: H1 - PT - PB, fill: BLUE, 'fill-opacity': .07 }, sv1);
    E('line', { x1: X1(S.c), y1: PT, x2: X1(S.c), y2: H1 - PB, stroke: BLUE, 'stroke-width': 2 }, sv1);
    var lo = Math.max(DOM[0], C.m - C.sd), hi = Math.min(DOM[1], C.m + C.sd);
    E('line', { x1: X1(S.c), y1: Y1(lo), x2: X1(S.c), y2: Y1(hi), stroke: BLUE, 'stroke-width': 6,
      'stroke-opacity': .45, 'stroke-linecap': 'butt' }, sv1);
    E('circle', { cx: X1(S.c), cy: Y1(C.m), r: 4.2, fill: BLUE }, sv1);
    E('text', { x: X1(S.c) + 7, y: H1 - PB - 6, 'font-size': 9.5, fill: BLUE, 'font-weight': 700,
      'font-family': 'IBM Plex Mono, monospace', text: 'c = ' + fmt(S.c, 2) }, sv1);

    /* the mean handle */
    E('path', { d: 'M' + (X1(S.m1) - 7) + ' ' + Y1(S.m2) + 'h14M' + X1(S.m1) + ' ' + (Y1(S.m2) - 7) + 'v14',
      stroke: INK, 'stroke-width': 2.1, 'stroke-linecap': 'round' }, sv1);
    E('circle', { cx: X1(S.m1), cy: Y1(S.m2), r: 9, fill: 'transparent' }, sv1);

    E('text', { x: (W1 + PL) / 2, y: H1 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: 'y₁' }, sv1);
    return inStrip;
  }

  /* ---------- right: marginal against conditional ---------- */
  function drawSlice(inStrip) {
    clear(sv2);
    var C = cond(), i, v;
    var pkC = 1 / (C.sd * Math.sqrt(2 * Math.PI)), pkM = 1 / (S.s2 * Math.sqrt(2 * Math.PI));
    var DMAX = Math.max(pkC, pkM) * 1.1;
    var pl = 12, pr = 24, pt = 12, pb = 26;
    var DX = function (d) { return W2 - pr - d / DMAX * (W2 - pl - pr); };   /* density grows leftward */
    var VY = function (v) { return H2 - pb - (v - DOM[0]) / (DOM[1] - DOM[0]) * (H2 - pt - pb); };

    /* the y2 axis, on the right */
    E('line', { x1: W2 - pr, y1: pt, x2: W2 - pr, y2: H2 - pb, stroke: INK, 'stroke-opacity': .28 }, sv2);
    [-3, -2, -1, 0, 1, 2, 3].forEach(function (t) {
      E('line', { x1: W2 - pr, y1: VY(t), x2: W2 - pr + 4, y2: VY(t), stroke: INK, 'stroke-opacity': .28 }, sv2);
      E('text', { x: W2 - pr + 7, y: VY(t) + 3.4, 'font-size': 9, fill: INK, 'fill-opacity': .42,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv2);
    });

    /* the histogram of the draws that actually landed in the strip */
    if (inStrip.length > 8) {
      var NB = 26, bw = (DOM[1] - DOM[0]) / NB, cnt = new Float64Array(NB);
      for (i = 0; i < inStrip.length; i++) {
        var b = Math.floor((inStrip[i] - DOM[0]) / bw);
        if (b >= 0 && b < NB) cnt[b]++;
      }
      for (i = 0; i < NB; i++) {
        var dens = cnt[i] / (inStrip.length * bw);
        if (dens <= 0) continue;
        var yTop = VY(DOM[0] + (i + 1) * bw), yBot = VY(DOM[0] + i * bw);
        E('rect', { x: DX(Math.min(dens, DMAX)), y: yTop.toFixed(1),
          width: Math.max(0, W2 - pr - DX(Math.min(dens, DMAX))).toFixed(1),
          height: (yBot - yTop).toFixed(1), fill: BLUE, 'fill-opacity': .16 }, sv2);
      }
    }

    /* the marginal p(y2), and the exact conditional */
    function curve(m, s, col, w, dash, fill) {
      var d = '', N = 160, first = true;
      for (i = 0; i <= N; i++) {
        v = DOM[0] + (DOM[1] - DOM[0]) * i / N;
        var dd = Math.min(npdf(v, m, s), DMAX);
        d += (first ? 'M' : 'L') + DX(dd).toFixed(1) + ' ' + VY(v).toFixed(1);
        first = false;
      }
      if (fill) E('path', { d: d + 'L' + DX(0) + ' ' + VY(DOM[1]) + 'L' + DX(0) + ' ' + VY(DOM[0]) + 'Z',
        fill: col, 'fill-opacity': .1 }, sv2);
      E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '' }, sv2);
    }
    curve(S.m2, S.s2, SLATE, 1.7, '5 4', false);
    curve(C.m, C.sd, BLUE, 2.3, '', true);

    /* the two means, as ticks */
    E('line', { x1: DX(0), y1: VY(S.m2), x2: DX(pkM), y2: VY(S.m2), stroke: SLATE, 'stroke-width': 1,
      'stroke-opacity': .55, 'stroke-dasharray': '2 3' }, sv2);
    E('line', { x1: DX(0), y1: VY(C.m), x2: DX(Math.min(pkC, DMAX)), y2: VY(C.m), stroke: BLUE,
      'stroke-width': 1, 'stroke-opacity': .55, 'stroke-dasharray': '2 3' }, sv2);

    E('text', { x: pl + 2, y: 20, 'font-size': 9.5, 'font-weight': 700, fill: SLATE, text: 'marginal p(y₂)' }, sv2);
    E('text', { x: pl + 2, y: 33, 'font-size': 9.5, 'font-weight': 700, fill: BLUE, text: 'conditional | y₁ = c' }, sv2);
    E('text', { x: pl + 2, y: 46, 'font-size': 9, fill: INK, 'fill-opacity': .4,
      'font-family': 'IBM Plex Mono, monospace', text: inStrip.length + ' draws in the strip' }, sv2);
    E('text', { x: (W2 - pr + pl) / 2, y: H2 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: 'density' }, sv2);
  }

  /* ---------- numbers ---------- */
  function drawNums() {
    var C = cond(), r = S.rho;
    var cov = r * S.s1 * S.s2;
    host.querySelector('[data-r]').textContent = fmt(r, 3);
    host.querySelector('[data-num]').innerHTML =
      '<span style="font-family:var(--mono);font-size:11px">' +
      '&mu; = (' + fmt(S.m1, 2) + ', ' + fmt(S.m2, 2) + ')<br>' +
      '&Sigma; = [' + fmt(S.s1 * S.s1, 2) + ' &nbsp;' + fmt(cov, 2) + ' ; ' +
      fmt(cov, 2) + ' &nbsp;' + fmt(S.s2 * S.s2, 2) + ']</span>' +
      '<hr style="border:0;border-top:1px solid rgba(22,24,29,.12);margin:7px 0">' +
      '<b style="color:' + BLUE + '">E[y₂ | y₁=c]</b> = ' + fmt(S.m2, 2) + ' + ' +
      fmt(r * S.s2 / S.s1, 3) + '&middot;(' + fmt(S.c, 2) + '&minus;' + fmt(S.m1, 2) + ')' +
      ' = <b>' + fmt(C.m, 3) + '</b><br>' +
      '<b style="color:' + BLUE + '">sd(y₂ | y₁=c)</b> = ' + fmt(S.s2, 2) + '&middot;&radic;(1&minus;' +
      fmt(r * r, 3) + ') = <b>' + fmt(C.sd, 3) + '</b><br>' +
      '<span style="color:' + SLATE + '">prior sd ' + fmt(S.s2, 2) + ' &rarr; shrunk to <b>' +
      (100 * C.shrink).toFixed(1) + '%</b></span>';

    var a = Math.abs(r), note;
    if (a < 0.08) note = 'Uncorrelated. The conditional <b>is</b> the marginal &mdash; and because this is a Gaussian, y₂ is genuinely independent of y₁. Property 1.';
    else if (a > 0.93) note = 'Almost measured for free. One observation of y₁ leaves <b>' +
      (100 * C.shrink).toFixed(1) + '%</b> of the prior width &mdash; Chapter 4’s <i>narrow spike</i>.';
    else if (a < 0.62) note = 'Weakly coupled: the mean barely moves and <b>' + (100 * C.shrink).toFixed(0) +
      '%</b> of the width survives. Chapter 4’s <i>value you still have to buy</i>.';
    else note = 'The mean slides along the amber line; the width falls to &radic;(1&minus;&rho;²) of the prior &mdash; <b>independent of what c actually is</b>.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  function draw() { drawSlice(drawJoint()); drawNums(); }

  /* ---------- interaction ---------- */
  var drag = null;
  function pos(ev) {
    var r = sv1.getBoundingClientRect(), t = ev.touches ? ev.touches[0] : ev;
    return { x: (t.clientX - r.left) / r.width * W1, y: (t.clientY - r.top) / r.height * H1 };
  }
  function clampC(v) { return Math.max(DOM[0] + 0.3, Math.min(DOM[1] - 0.3, v)); }
  sv1.style.cursor = 'crosshair';
  function down(ev) {
    var p = pos(ev), dx = p.x - X1(S.m1), dy = p.y - Y1(S.m2);
    drag = (dx * dx + dy * dy < 210) ? 'mu' : 'c';
    move(ev); ev.preventDefault();
  }
  function move(ev) {
    if (!drag) return;
    var p = pos(ev);
    if (drag === 'mu') {
      S.m1 = Math.max(-1.8, Math.min(1.8, iX1(p.x)));
      S.m2 = Math.max(-1.8, Math.min(1.8, iY1(p.y)));
    } else S.c = clampC(iX1(p.x));
    draw(); ev.preventDefault();
  }
  function up() { drag = null; }
  sv1.addEventListener('mousedown', down);
  sv1.addEventListener('touchstart', down, { passive: false });
  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('mouseup', up);
  window.addEventListener('touchend', up);

  function nearest(arr, v) {
    var bi = 0, bd = 1e9;
    arr.forEach(function (a, i) { var d = Math.abs(a - v); if (d < bd) { bd = d; bi = i; } });
    return bi;
  }
  host.querySelector('[data-ru]').onclick = function () {
    S.rho = RHOS[Math.min(RHOS.length - 1, nearest(RHOS, S.rho) + 1)]; draw();
  };
  host.querySelector('[data-rd]').onclick = function () {
    S.rho = RHOS[Math.max(0, nearest(RHOS, S.rho) - 1)]; draw();
  };
  host.querySelector('[data-su]').onclick = function () {
    S.s2 = SIGS[Math.min(SIGS.length - 1, nearest(SIGS, S.s2) + 1)]; draw();
  };
  host.querySelector('[data-sd]').onclick = function () {
    S.s2 = SIGS[Math.max(0, nearest(SIGS, S.s2) - 1)]; draw();
  };
  host.querySelector('[data-p1]').onclick = function () {
    S.m1 = 0; S.m2 = 0; S.s1 = 1; S.s2 = 1; S.rho = 0.966; S.c = -0.313; draw();
  };
  host.querySelector('[data-p2]').onclick = function () {
    S.m1 = 0; S.m2 = 0; S.s1 = 1; S.s2 = 1; S.rho = 0.573; S.c = -0.313; draw();
  };
  host.querySelector('[data-rs]').onclick = function () {
    for (var k in D0) S[k] = D0[k];
    draw();
  };

  draw();
  return { finish: function () { S.m1 = 0; S.m2 = 0; S.s1 = 1; S.s2 = 1; S.rho = 0.966; S.c = -0.313; draw(); } };
});
