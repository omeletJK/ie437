/* ============================================================
   widget: heater-pictures                               (Chapter 9)
   Small drawn examples on the scalar heater, x_{k+1} = x + u (or
   ẋ = u) with running cost x² + u². Each mode is one picture of
   about 900 × 300 px computed from its closed form; the slide puts
   one sentence under it as the caption, so a mode labels only the
   few things named below and leaves the explanation to the caption.
   Axes come from IE437.plot, the marks are drawn on top with its X/Y
   mappers, every quantity label is set with IE437.math. Every step
   redraws the picture from scratch. Numbers checked in node
   (2026-11-15).

   mode "parabola"  stepped (2) — one-step control from x₀ = 2:
                    J(u) = u² + (2+u)² = 2(u+1)² + 2 on u ∈ [−3, 1].
                    Step 0 the three tried controls u = 0, −1, −2 as
                    points with their costs 4, 2, 4 beside them (the
                    slide's old table); step 1 the whole curve in ink;
                    step 2 the minimum in blue, u* = −1, and beside the
                    plot one stacked bar per tried control splitting
                    the cost into effort u² (amber) and final state
                    (2+u)² (slate): 4 = 0 + 4, 2 = 1 + 1, 4 = 4 + 0.
   mode "feedback"  stepped (2) — the error x_k over stages k = 0, 1, 2
                    from x₀ = 2. Step 0 the plan's predicted path in
                    slate dashes (u = −1 then −0.5: 2 → 1 → 0.5), the
                    prediction at k = 1 a hollow dot with its
                    precomputed command named; step 1 the measured
                    error +1.5 at k = 1, a blue dot off the path;
                    step 2 two branches from it: red dashes for the
                    plan reusing −0.5 (lands at +1.0), blue solid for
                    the rule −x/2 recomputing −0.75 (lands at +0.75).
   mode "decay"     stepped (3) — left x(t) on [0, 4] from x₀ = 2 under
                    u = −x (blue, 2e^{−t}), u = 0 (slate, flat at 2),
                    u = −2x (amber, 2e^{−2t}), one curve per press;
                    right one bar per control for J = ∫(x² + u²) dt,
                    appearing with its curve: 4 (∫ 8e^{−2t}), ∞ (the
                    bar runs off the top, open-ended), 5 (∫ 20e^{−4t}).
   mode "tangent"   stepped (1) — V(x) = x² on [0, 3] in ink; step 1 the
                    tangent at x = 2 in amber, λ = ∂V/∂x = 4, and a
                    step Δx = 0.5 as a horizontal-then-vertical bracket,
                    ΔV ≈ 4Δx = 2, the exact rise 2.5² − 4 = 2.25 as a
                    faint second tick.
   mode "unstable"  stepped (4) — the hazard x_{t+1} = 2x_t + 0·u_t from
                    x₀ = 1: left the states 1, 2, 4, 8, 16 as red bars,
                    one per press, a grey arrow under each labelled
                    0·u_t (the input does nothing); right the running
                    sum of x_t², 1, 5, 21, 85, 341, with → ∞ in red at
                    the last press.
   ============================================================ */
IE437.widget('heater-pictures', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'parabola';
  var uid = 'hp' + Math.floor(Math.random() * 1e9);
  var NS = 'http://www.w3.org/2000/svg';
  var W = 900, H = 300;

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- helpers ---------- */
  function canvas() { var s = IE437.svg(W, H); mount.appendChild(s); defs(s); return s; }
  function defs(s) {
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['r', RED], ['a', AMBER], ['s', SLATE], ['g', GREEN]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    /* an open-ended bar: solid at the foot, fading out towards the top */
    var lg = document.createElementNS(NS, 'linearGradient');
    lg.setAttribute('id', uid + 'inf'); lg.setAttribute('x1', 0); lg.setAttribute('y1', 1); lg.setAttribute('x2', 0); lg.setAttribute('y2', 0);
    [[0, 1], [.55, 1], [1, 0]].forEach(function (st) {
      var sp = document.createElementNS(NS, 'stop');
      sp.setAttribute('offset', st[0]); sp.setAttribute('stop-color', SLATE); sp.setAttribute('stop-opacity', st[1]); lg.appendChild(sp);
    });
    d.appendChild(lg);
  }
  /* a nested panel: IE437.plot clears whatever it is given, so each chart gets its own <svg> */
  function panel(s, x, y, w, h) { return E('svg', { x: x, y: y, width: w, height: h, overflow: 'visible' }, s); }
  function arrow(g, x1, y1, x2, y2, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' }[c] || 'k';
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.6, 'marker-end': 'url(#' + uid + key + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('line', a, g);
  }
  /* a quantity label, in the KaTeX faces (set 1.25 times a sans label, as the Ch 7 widgets do) */
  function mt(g, x, y, tex, a) {
    var m = { 'font-size': 15, fill: INK };
    for (var k in a || {}) m[k] = a[k];
    return IE437.math(g, x, y, tex, m);
  }
  /* a plain word, in the deck's sans */
  function word(g, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 12, fill: SLATE, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, g);
  }
  function dot(g, x, y, r, c, hollow) {
    return E('circle', { cx: x, cy: y, r: r, fill: hollow ? '#fff' : c, stroke: c, 'stroke-width': 1.8 }, g);
  }
  function drop(g, m, x, y, c) {               /* a faint vertical from a point down to the axis */
    return E('line', { x1: m.X(x), x2: m.X(x), y1: m.Y(y), y2: m.Y(0), stroke: c || SLATE, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .4 }, g);
  }
  function bar(g, m, x, y0, y1, w, c, extra) {
    var a = { x: m.X(x - w / 2), y: m.Y(y1), width: m.X(x + w / 2) - m.X(x - w / 2), height: m.Y(y0) - m.Y(y1), fill: c };
    for (var k in extra || {}) a[k] = extra[k];
    return E('rect', a, g);
  }
  function sample(f, a, b, n) { var p = []; for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; p.push([x, f(x)]); } return p; }
  function fix(v) { return (Math.round(v * 100) / 100).toString(); }

  /* ============================================================
     parabola — one-step control from x₀ = 2: J(u) = u² + (2 + u)²
     ============================================================ */
  var J = function (u) { return u * u + (2 + u) * (2 + u); };
  var TRIED = [-2, -1, 0];
  function drawParabola(k) {
    var s = canvas();
    var pw = 560, pl = panel(s, 0, 0, pw, H), P = { l: 54, r: 24, t: 22, b: 36 };
    var m = IE437.plot(pl, { w: pw, h: H, pad: P, xdom: [-3.2, 1.2], ydom: [0, 11],
      xticks: [-3, -2, -1, 0, 1], yticks: [0, 2, 4, 6, 8, 10],
      series: k >= 1 ? [{ pts: sample(J, -3, 1, 80), color: INK, w: 2 }] : [] });
    mt(pl, pw - P.r + 6, m.Y(0) + 5, 'u', { fill: SLATE, 'font-size': 14 });
    mt(pl, P.l + 6, P.t - 6, 'J(u)', { fill: SLATE, 'font-size': 14 });
    TRIED.forEach(function (u) {
      var best = k >= 2 && u === -1, c = best ? BLUE : INK;
      drop(pl, m, u, J(u));
      dot(pl, m.X(u), m.Y(J(u)), best ? 5.5 : 4.5, c, false);
      mt(pl, m.X(u), m.Y(J(u)) - 12, String(J(u)), { fill: c, 'text-anchor': 'middle' });
      if (best) mt(pl, m.X(u) + 10, m.Y(J(u)) + 22, 'u^* = -1', { fill: BLUE });
    });
    if (k < 2) return;
    /* the cost split into its two pieces, one stacked bar per tried control */
    var bw = 320, pb = panel(s, 580, 0, bw, H), PB = { l: 46, r: 16, t: 22, b: 36 };
    var mb = IE437.plot(pb, { w: bw, h: H, pad: PB, xdom: [-0.7, 2.7], ydom: [0, 5], xticks: [], yticks: [0, 1, 2, 3, 4, 5] });
    TRIED.forEach(function (u, i) {
      var eff = u * u, fin = (2 + u) * (2 + u);
      if (eff > 0) bar(pb, mb, i, 0, eff, .55, AMBER);
      if (fin > 0) bar(pb, mb, i, eff, eff + fin, .55, SLATE);
      mt(pb, mb.X(i), mb.Y(0) + 17, 'u = ' + u, { 'text-anchor': 'middle', 'font-size': 13.5, fill: u === -1 ? BLUE : INK });
    });
    var lx = PB.l + 108, ly = PB.t + 12;
    E('rect', { x: lx, y: ly - 9, width: 11, height: 11, fill: AMBER }, pb);
    mt(pb, lx + 17, ly + 1, 'u^2', { 'font-size': 13.5 }); word(pb, lx + 44, ly + 1, 'effort', { 'font-size': 11.5 });
    E('rect', { x: lx, y: ly + 10, width: 11, height: 11, fill: SLATE }, pb);
    mt(pb, lx + 17, ly + 20, '(2+u)^2', { 'font-size': 13.5 }); word(pb, lx + 78, ly + 20, 'final state', { 'font-size': 11.5 });
  }

  /* ============================================================
     feedback — the error over stages: a predicted path, a measured
     point that lands elsewhere, then two branches from it
     ============================================================ */
  function drawFeedback(k) {
    var s = canvas();
    var pw = 760, pl = panel(s, 70, 0, pw, H), P = { l: 54, r: 24, t: 22, b: 36 };
    var pred = [[0, 2], [1, 1], [2, 0.5]];                 /* the plan's model: x₀ = 2, u = −1, then −0.5 */
    var meas = [[0, 2], [1, 1.5]];                         /* a disturbance: the error lands at +1.5 */
    var series = [{ pts: pred, color: SLATE, w: 1.6, dash: '6 5' }];
    if (k >= 1) series.push({ pts: meas, color: BLUE, w: 2.2 });
    if (k >= 2) {
      series.push({ pts: [[1, 1.5], [2, 1.0]], color: RED, w: 1.8, dash: '6 5' });   /* reuses −0.5 */
      series.push({ pts: [[1, 1.5], [2, 0.75]], color: BLUE, w: 2.2 });             /* recomputes −0.75 */
    }
    var m = IE437.plot(pl, { w: pw, h: H, pad: P, xdom: [-0.2, 2.95], ydom: [0, 2.35],
      xticks: [0, 1, 2], yticks: [0, 1, 2], series: series });
    mt(pl, pw - P.r + 6, m.Y(0) + 5, 'k', { fill: SLATE, 'font-size': 14 });
    mt(pl, P.l + 6, P.t - 6, 'x_k', { fill: SLATE, 'font-size': 14 });
    dot(pl, m.X(0), m.Y(2), 5, INK, false);
    mt(pl, m.X(0) + 12, m.Y(2) - 12, 'x_0 = 2', { fill: INK, 'font-size': 14 });
    /* the prediction and the command precomputed for it */
    dot(pl, m.X(1), m.Y(1), 5, SLATE, true);
    dot(pl, m.X(2), m.Y(0.5), 4, SLATE, true);
    word(pl, m.X(1) - 12, m.Y(1) + 14, 'predicted +1', { fill: SLATE, 'text-anchor': 'end', 'font-size': 12.5 });
    word(pl, m.X(1) - 12, m.Y(1) + 30, 'command −0.5 precomputed', { fill: SLATE, 'text-anchor': 'end', 'font-size': 12.5 });
    if (k >= 1) {
      dot(pl, m.X(1), m.Y(1.5), 5.5, BLUE, false);
      word(pl, m.X(1) + 12, m.Y(1.5) - 10, 'measured +1.5', { fill: BLUE, 'font-size': 12.5 });
    }
    if (k >= 2) {
      dot(pl, m.X(2), m.Y(1.0), 5.5, RED, true);
      word(pl, m.X(2) + 12, m.Y(1.0) - 8, 'plan: reuses −0.5', { fill: RED, 'font-size': 12.5 });
      word(pl, m.X(2) + 12, m.Y(1.0) + 8, 'lands at +1.0', { fill: RED, 'font-size': 12.5 });
      dot(pl, m.X(2), m.Y(0.75), 5.5, BLUE, false);
      word(pl, m.X(2) + 12, m.Y(0.75) + 6, 'rule: −1.5/2 = −0.75', { fill: BLUE, 'font-size': 12.5 });
      word(pl, m.X(2) + 12, m.Y(0.75) + 22, 'lands at +0.75', { fill: BLUE, 'font-size': 12.5 });
    }
  }

  /* ============================================================
     decay — x(t) from x₀ = 2 under three feedback gains, and the
     total cost of each: 4, ∞, 5
     ============================================================ */
  var GAINS = [
    { lbl: 'u = -x', c: BLUE, x: function (t) { return 2 * Math.exp(-t); }, J: 4 },
    { lbl: 'u = 0', c: SLATE, x: function () { return 2; }, J: Infinity },
    { lbl: 'u = -2x', c: AMBER, x: function (t) { return 2 * Math.exp(-2 * t); }, J: 5 }
  ];
  function drawDecay(k) {
    var s = canvas();
    var pw = 540, pl = panel(s, 0, 0, pw, H), P = { l: 54, r: 24, t: 22, b: 36 };
    var m = IE437.plot(pl, { w: pw, h: H, pad: P, xdom: [0, 4.2], ydom: [0, 2.3],
      xticks: [0, 1, 2, 3, 4], yticks: [0, 1, 2],
      series: GAINS.slice(0, k).map(function (g) { return { pts: sample(g.x, 0, 4, 120), color: g.c, w: 2.1 }; }) });
    mt(pl, pw - P.r + 6, m.Y(0) + 5, 't', { fill: SLATE, 'font-size': 14 });
    mt(pl, P.l + 6, P.t - 6, 'x(t)', { fill: SLATE, 'font-size': 14 });
    dot(pl, m.X(0), m.Y(2), 4, INK, false);
    GAINS.slice(0, k).forEach(function (g, i) {
      var y = m.Y(1.75) + i * 20;
      E('line', { x1: m.X(2.55), x2: m.X(2.85), y1: y, y2: y, stroke: g.c, 'stroke-width': 2.4 }, pl);
      mt(pl, m.X(2.95), y + 5, g.lbl, { fill: g.c, 'font-size': 14 });
    });
    var bw = 340, pb = panel(s, 560, 0, bw, H), PB = { l: 46, r: 16, t: 22, b: 36 };
    var mb = IE437.plot(pb, { w: bw, h: H, pad: PB, xdom: [-0.7, 2.7], ydom: [0, 6.5], xticks: [], yticks: [0, 2, 4, 6] });
    mt(pb, PB.l + 6, PB.t - 6, 'J', { fill: SLATE, 'font-size': 14 });
    GAINS.slice(0, k).forEach(function (g, i) {
      if (isFinite(g.J)) bar(pb, mb, i, 0, g.J, .55, g.c);
      else {
        bar(pb, mb, i, 0, 6.5, .55, g.c, { fill: 'url(#' + uid + 'inf)' });
        mt(pb, mb.X(i), PB.t - 4, '\\infty', { 'text-anchor': 'middle', fill: g.c, 'font-size': 16 });
      }
      mt(pb, mb.X(i), mb.Y(0) + 17, g.lbl, { 'text-anchor': 'middle', 'font-size': 13.5, fill: g.c });
    });
  }

  /* ============================================================
     tangent — V(x) = x², its tangent at x = 2, and a step Δx = 0.5
     ============================================================ */
  function drawTangent(k) {
    var s = canvas();
    var pw = 640, pl = panel(s, 130, 0, pw, H), P = { l: 54, r: 130, t: 22, b: 36 };
    var V = function (x) { return x * x; }, T = function (x) { return 4 + 4 * (x - 2); };
    var series = [{ pts: sample(V, 0, 3, 80), color: INK, w: 2 }];
    if (k >= 1) series.push({ pts: [[1, T(1)], [3.05, T(3.05)]], color: AMBER, w: 2 });
    var m = IE437.plot(pl, { w: pw, h: H, pad: P, xdom: [0, 3.2], ydom: [0, 9.8],
      xticks: [0, 1, 2, 3], yticks: [0, 2, 4, 6, 8], series: series });
    mt(pl, pw - P.r + 6, m.Y(0) + 5, 'x', { fill: SLATE, 'font-size': 14 });
    mt(pl, P.l + 6, P.t - 6, 'V(x) = x^2', { fill: SLATE, 'font-size': 14 });
    if (k < 1) return;
    dot(pl, m.X(2), m.Y(4), 4.5, AMBER, false);
    mt(pl, m.X(3.05) + 8, m.Y(T(3.05)) + 5, 'λ = ∂V/∂x = 4', { fill: AMBER });
    /* the bracket: Δx along the tangent's foot, then ΔV up the tangent */
    E('path', { d: 'M' + m.X(2) + ' ' + m.Y(4) + 'L' + m.X(2.5) + ' ' + m.Y(4) + 'L' + m.X(2.5) + ' ' + m.Y(6),
      fill: 'none', stroke: INK, 'stroke-width': 1.3 }, pl);
    [[2, 4], [2.5, 4], [2.5, 6]].forEach(function (p) { E('circle', { cx: m.X(p[0]), cy: m.Y(p[1]), r: 2.2, fill: INK }, pl); });
    mt(pl, m.X(2.25), m.Y(4) + 18, 'Δx', { 'text-anchor': 'middle' });
    mt(pl, m.X(2.5) + 9, m.Y(5) + 5, 'ΔV\\ ≈\\ 4Δx = 2');
    /* the exact rise on the curve, a faint tick */
    E('line', { x1: m.X(2.5) - 7, x2: m.X(2.5) + 7, y1: m.Y(6.25), y2: m.Y(6.25), stroke: SLATE, 'stroke-width': 1.2, opacity: .55 }, pl);
    word(pl, m.X(2.5) - 11, m.Y(6.25) + 4, 'exact', { 'text-anchor': 'end', 'font-size': 10.5, opacity: .7 });
  }

  /* ============================================================
     unstable — x_{t+1} = 2x_t + 0·u_t from x₀ = 1: the state doubles
     while the input does nothing; the cost sum runs away
     ============================================================ */
  var XS = [1, 2, 4, 8, 16], CUM = [1, 5, 21, 85, 341];
  function drawUnstable(k) {
    var s = canvas();
    var pw = 470, pl = panel(s, 0, 0, pw, H), P = { l: 54, r: 24, t: 22, b: 72 };
    var m = IE437.plot(pl, { w: pw, h: H, pad: P, xdom: [-0.6, 4.6], ydom: [0, 17],
      xticks: [0, 1, 2, 3, 4], yticks: [0, 4, 8, 12, 16] });
    mt(pl, pw - P.r + 6, m.Y(0) + 5, 't', { fill: SLATE, 'font-size': 14 });
    mt(pl, P.l + 6, P.t - 6, 'x_t', { fill: SLATE, 'font-size': 14 });
    var ax = m.Y(0);
    for (var t = 0; t <= k; t++) {
      bar(pl, m, t, 0, XS[t], .55, RED);
      arrow(pl, m.X(t), ax + 60, m.X(t), ax + 26, SLATE, { 'stroke-width': 1.5 });
      mt(pl, m.X(t) + 6, ax + 50, '0 \\cdot u_' + t, { fill: SLATE, 'font-size': 12.5 });
    }
    var bw = 400, pb = panel(s, 500, 0, bw, H), PB = { l: 54, r: 70, t: 22, b: 72 };
    var mb = IE437.plot(pb, { w: bw, h: H, pad: PB, xdom: [-0.6, 4.6], ydom: [0, 360],
      xticks: [0, 1, 2, 3, 4], yticks: [0, 100, 200, 300] });
    mt(pb, bw - PB.r + 6, mb.Y(0) + 5, 't', { fill: SLATE, 'font-size': 14 });
    mt(pb, PB.l + 6, PB.t - 6, '\\sum x_t^2', { fill: SLATE, 'font-size': 14 });
    for (t = 0; t <= k; t++) {
      bar(pb, mb, t, 0, Math.max(CUM[t], 2), .55, RED);
      mt(pb, mb.X(t), mb.Y(CUM[t]) - 7, String(CUM[t]), { 'text-anchor': 'middle', 'font-size': 13.5 });
    }
    if (k >= 4) mt(pb, mb.X(4) + 24, mb.Y(CUM[4]) + 4, '\\to \\infty', { fill: RED, 'font-size': 16 });
  }

  /* ---------- dispatch ---------- */
  var DRAW = { parabola: drawParabola, feedback: drawFeedback, decay: drawDecay, tangent: drawTangent, unstable: drawUnstable };
  var STEPS = { parabola: 2, feedback: 2, decay: 3, tangent: 1, unstable: 4 };
  var draw = DRAW[MODE] || drawParabola, n = STEPS[MODE] == null ? 2 : STEPS[MODE];

  function render(i) {
    mount.innerHTML = '';
    draw(Math.max(0, Math.min(n, i | 0)));
  }
  render(0);
  return {
    steps: n,
    step: function (i) { render(i); },
    reset: function () { render(0); },
    finish: function () { render(n); }
  };
});
