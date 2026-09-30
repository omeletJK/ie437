/* ============================================================
   widget: ucb-heater
   The temperature thread's one-step UCB choice, drawn instead of
   written. Room error x = -2, heater u in [0,2], hidden score
       f(u) = -[(x+u)^2 + u^2] = -[(u-2)^2 + u^2]
   The GP's belief at two candidates:
       A: u = 0.8, mu = -1.9, sigma = 0.1   (good mean, sure)
       B: u = 1.6, mu = -2.2, sigma = 0.5   (worse mean, unsure)
   UCB a = mu + kappa*sigma. The lines cross at kappa = 0.3/0.4 = 0.75:
   below it A wins, above it B wins.

   Walked by the deck's ->, so the room predicts before it sees:
     0  the two beliefs only (mean and +-sigma band)
     1  the optimism bonus kappa*sigma, both acquisition values, the pick
     2  run the experiment: the hidden f appears and the pick is measured
   The kappa slider works at every step.
   ============================================================ */
IE437.widget('ucb-heater', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706';
  var MONO = 'IBM Plex Mono, monospace';

  var X0 = -2;
  var f = function (u) { return -((X0 + u) * (X0 + u) + u * u); };
  var C = [
    { n: 'A', u: 0.8, mu: -1.9, s: 0.1, col: BLUE },
    { n: 'B', u: 1.6, mu: -2.2, s: 0.5, col: AMBER }
  ];
  var KX = (C[0].mu - C[1].mu) / (C[1].s - C[0].s);   /* 0.75 */
  var K0 = opts.kappa == null ? 1 : +opts.kappa;
  var kappa = K0, st = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">UCB on two heater settings</span><span class="wspacer"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:column;gap:6px;align-items:center">' +
    '<div style="display:flex;gap:22px;align-items:center"><div data-c1></div><div data-c2></div></div>' +
    '<div data-note style="width:912px;min-height:38px;font:400 12.5px/1.55 var(--sans);color:var(--ink2);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:7px"></div></div>';

  var W1 = 560, W2 = 330, H = 232;
  var sv1 = IE437.svg(W1, H), sv2 = IE437.svg(W2, H);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  function T(sv, x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 10, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    label: 'κ', min: 0, max: 2, step: 0.05, value: kappa,
    fmt: function (v) { return v.toFixed(2); },
    on: function (v) { kappa = v; draw(); }
  });

  function pick() {
    var a0 = C[0].mu + kappa * C[0].s, a1 = C[1].mu + kappa * C[1].s;
    return a1 > a0 + 1e-9 ? 1 : 0;
  }

  /* ---------- left: the heater axis, beliefs, bonus, measurement ---------- */
  var L = 46, R = 104, TP = 30, BT = 34;
  var UD = [0, 2], SD = [-3.0, -1.2];
  var PX = function (u) { return L + (u - UD[0]) / (UD[1] - UD[0]) * (W1 - L - R); };
  var PY = function (v) { return TP + (SD[1] - v) / (SD[1] - SD[0]) * (H - TP - BT); };

  function drawLeft(w) {
    clear(sv1);
    var i;
    /* axes */
    E('line', { x1: L, y1: H - BT, x2: W1 - R, y2: H - BT, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: L, y1: TP - 8, x2: L, y2: H - BT, stroke: INK, 'stroke-opacity': .28 }, sv1);
    [0, 0.5, 1, 1.5, 2].forEach(function (t) {
      T(sv1, PX(t), H - BT + 14, t, { 'text-anchor': 'middle', 'font-size': 9, 'fill-opacity': .45, 'font-family': MONO });
    });
    T(sv1, (L + W1 - R) / 2, H - 4, 'heater command u', { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .55 });
    [-3, -2.5, -2, -1.5].forEach(function (t) {
      E('line', { x1: L, y1: PY(t), x2: W1 - R, y2: PY(t), stroke: INK, 'stroke-opacity': .06 }, sv1);
      T(sv1, L - 6, PY(t) + 3.5, t, { 'text-anchor': 'end', 'font-size': 9, 'fill-opacity': .45, 'font-family': MONO });
    });
    T(sv1, L - 36, TP - 14, 'score f = −cost  (higher is better)', { 'font-size': 9.5, 'fill-opacity': .55 });

    /* step 2: the hidden truth, which the learner never sees whole */
    if (st >= 2) {
      var d = '';
      for (i = 0; i <= 80; i++) { var u = 2 * i / 80; d += (i ? 'L' : 'M') + PX(u).toFixed(1) + ' ' + PY(f(u)).toFixed(1); }
      E('path', { d: d, fill: 'none', stroke: INK, 'stroke-opacity': .38, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, sv1);
      T(sv1, PX(0.1), PY(-2.42), 'hidden f', { 'font-size': 9.5, 'font-weight': 700, 'fill-opacity': .5 });
      T(sv1, PX(0.1), PY(-2.42) + 12, '(simulator only)', { 'font-size': 9, 'fill-opacity': .45 });
      E('path', { d: 'M' + (PX(1) - 4) + ' ' + (PY(-2) - 4) + 'l8 8M' + (PX(1) + 4) + ' ' + (PY(-2) - 4) + 'l-8 8',
        stroke: INK, 'stroke-opacity': .5, 'stroke-width': 1.5 }, sv1);
      T(sv1, PX(1), PY(-2) - 9, 'true best u = 1', { 'text-anchor': 'middle', 'font-size': 9, 'fill-opacity': .5 });
    }

    C.forEach(function (c, k) {
      var x = PX(c.u), win = st >= 1 && k === w, a = c.mu + kappa * c.s;
      /* belief band: mean +- sigma */
      E('rect', { x: x - 9, y: PY(c.mu + c.s), width: 18, height: PY(c.mu - c.s) - PY(c.mu + c.s),
        fill: c.col, 'fill-opacity': .18, stroke: c.col, 'stroke-opacity': .5, rx: 2 }, sv1);
      E('line', { x1: x - 13, y1: PY(c.mu), x2: x + 13, y2: PY(c.mu), stroke: c.col, 'stroke-width': 2.4 }, sv1);
      T(sv1, x - 25, PY(c.mu) + 3.5, 'μ ' + c.mu.toFixed(1), { 'text-anchor': 'end', 'font-size': 9.5, fill: c.col,
        'font-family': MONO });
      T(sv1, x - 25, Math.max(PY(c.mu) + 16, PY(c.mu - c.s) + 4), '±σ ' + c.s.toFixed(1), { 'text-anchor': 'end',
        'font-size': 9, 'fill-opacity': .5, 'font-family': MONO });
      T(sv1, x, H - BT - 6, c.n, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: c.col });

      if (st >= 1) {
        /* the optimism bonus: an arrow from the mean up by kappa*sigma */
        if (kappa * c.s > 0.004) {
          E('line', { x1: x, y1: PY(c.mu), x2: x, y2: PY(a) + 5, stroke: c.col, 'stroke-width': 2.2 }, sv1);
          E('path', { d: 'M' + (x - 4.5) + ' ' + (PY(a) + 6) + 'l4.5 -7l4.5 7Z', fill: c.col }, sv1);
        }
        /* the acquisition level, carried right so the two heights compare */
        E('line', { x1: x, y1: PY(a), x2: W1 - R + 6, y2: PY(a), stroke: win ? GREEN : c.col,
          'stroke-width': win ? 1.8 : 1.2, 'stroke-dasharray': '3 3', 'stroke-opacity': win ? 1 : .7 }, sv1);
        T(sv1, W1 - R + 10, PY(a) + 3.5, c.n + '  a = ' + a.toFixed(2), { 'font-size': 10, 'font-weight': win ? 700 : 400,
          fill: win ? GREEN : c.col, 'font-family': MONO });
        if (win) {
          E('rect', { x: x - 20, y: TP - 6, width: 40, height: H - BT - TP + 12, fill: 'none', stroke: GREEN,
            'stroke-width': 1.6, rx: 5 }, sv1);
          T(sv1, x, TP - 11, 'UCB picks ' + c.n, { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: GREEN });
        }
      }
    });

    /* step 2: run the picked experiment */
    if (st >= 2) {
      var c = C[w], y = f(c.u);
      E('circle', { cx: PX(c.u), cy: PY(y), r: 5, fill: INK }, sv1);
      T(sv1, PX(c.u) + 9, PY(y) + 4, 'measured ' + y.toFixed(2), { 'font-size': 10, 'font-weight': 700, 'font-family': MONO });
    }
  }

  /* ---------- right: a(kappa) for both, and where they cross ---------- */
  var L2 = 40, R2 = 12, KD = [0, 2], AD = [-2.3, -1.1];
  var QX = function (k) { return L2 + (k - KD[0]) / (KD[1] - KD[0]) * (W2 - L2 - R2); };
  var QY = function (v) { return TP + (AD[1] - v) / (AD[1] - AD[0]) * (H - TP - BT); };

  function drawRight(w) {
    clear(sv2);
    E('line', { x1: L2, y1: H - BT, x2: W2 - R2, y2: H - BT, stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('line', { x1: L2, y1: TP - 8, x2: L2, y2: H - BT, stroke: INK, 'stroke-opacity': .28 }, sv2);
    [0, 0.5, 1, 1.5, 2].forEach(function (t) {
      T(sv2, QX(t), H - BT + 14, t, { 'text-anchor': 'middle', 'font-size': 9, 'fill-opacity': .45, 'font-family': MONO });
    });
    T(sv2, (L2 + W2 - R2) / 2, H - 4, 'exploration weight κ', { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .55 });
    [-2.2, -1.8, -1.4].forEach(function (t) {
      T(sv2, L2 - 6, QY(t) + 3.5, t, { 'text-anchor': 'end', 'font-size': 9, 'fill-opacity': .45, 'font-family': MONO });
    });
    T(sv2, L2 - 30, TP - 14, 'a = μ + κσ', { 'font-size': 10, 'font-weight': 700, 'fill-opacity': .7 });

    if (st < 1) {
      T(sv2, (L2 + W2 - R2) / 2, (TP + H - BT) / 2, 'predict first — then →', { 'text-anchor': 'middle',
        'font-size': 11, 'fill-opacity': .4 });
      return;
    }
    /* who wins where */
    E('rect', { x: QX(0), y: TP - 8, width: QX(KX) - QX(0), height: H - BT - TP + 8, fill: BLUE, 'fill-opacity': .06 }, sv2);
    E('rect', { x: QX(KX), y: TP - 8, width: QX(2) - QX(KX), height: H - BT - TP + 8, fill: AMBER, 'fill-opacity': .07 }, sv2);
    T(sv2, (QX(0) + QX(KX)) / 2, H - BT - 7, 'A wins', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: BLUE });
    T(sv2, (QX(KX) + QX(2)) / 2, H - BT - 7, 'B wins', { 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: AMBER });
    C.forEach(function (c) {
      E('line', { x1: QX(0), y1: QY(c.mu), x2: QX(2), y2: QY(c.mu + 2 * c.s), stroke: c.col, 'stroke-width': 2.2 }, sv2);
      T(sv2, QX(2) - 2, QY(c.mu + 2 * c.s) + (c.n === 'A' ? 14 : -7), c.n + '  slope σ = ' + c.s,
        { 'text-anchor': 'end', 'font-size': 9.5, fill: c.col, 'font-family': MONO });
    });
    var yx = C[0].mu + KX * C[0].s;
    E('line', { x1: QX(KX), y1: TP - 2, x2: QX(KX), y2: H - BT, stroke: INK, 'stroke-opacity': .35, 'stroke-dasharray': '2 3' }, sv2);
    E('circle', { cx: QX(KX), cy: QY(yx), r: 3.2, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, sv2);
    T(sv2, QX(KX), TP - 5, 'flip at κ = ' + KX.toFixed(2), { 'text-anchor': 'middle', 'font-size': 9.5, 'fill-opacity': .6,
      'font-family': MONO });
    /* the current kappa */
    E('line', { x1: QX(kappa), y1: TP - 8, x2: QX(kappa), y2: H - BT, stroke: GREEN, 'stroke-width': 1.6 }, sv2);
    C.forEach(function (c, k) {
      E('circle', { cx: QX(kappa), cy: QY(c.mu + kappa * c.s), r: k === w ? 5 : 3.6, fill: k === w ? GREEN : c.col,
        stroke: '#fff', 'stroke-width': 1.2 }, sv2);
    });
  }

  /* the answer lives here, not in the caption, so it appears only when stepped to */
  function note(w) {
    var c = C[w], o = C[1 - w], y = f(c.u), k = kappa.toFixed(2);
    var ab = function (d) { return '<b style="color:' + d.col + '">' + d.n + '</b>: ' + d.mu.toFixed(1) + ' + ' + k +
      '·' + d.s.toFixed(1) + ' = <b>' + (d.mu + kappa * d.s).toFixed(2) + '</b>'; };
    if (st === 0) return 'Two beliefs about two untried settings. <b>Which one will UCB pick?</b> Commit to an answer, then press →.';
    var s1 = ab(C[0]) + ' &nbsp;·&nbsp; ' + ab(C[1]) + ' &nbsp;→&nbsp; <b style="color:' + GREEN + '">UCB picks ' + c.n + '</b>. ' +
      (w === 1 ? 'The wider band earns the bigger bonus, enough to overcome the worse mean.'
               : (kappa < 0.001 ? 'With no bonus, UCB is just the mean — pure exploitation.'
                                : 'The bonus is too small to overcome A\'s better mean.')) +
      ' The pick flips at κ = ' + KX.toFixed(2) + '.';
    if (st === 1) return s1;
    return 'Measured f(' + c.n + ') = <b>' + y.toFixed(2) + '</b>. ' + (w === 1
      ? 'Worse than either prediction — a disappointing score, yet now the model knows high u is bad and its band at B collapses.'
      : 'A better score this time — but one lucky comparison is not evidence that κ = ' + k + ' is the better policy over a whole budget.');
  }
  function draw() { var w = pick(); drawLeft(w); drawRight(w); host.querySelector('[data-note]').innerHTML = note(w); }
  function show(s) { st = s; draw(); }
  function reset() { kappa = K0; dial.set(K0, false); show(0); }

  reset();
  return {
    steps: 2,
    step: show,
    reset: reset,
    finish: function () { kappa = K0; dial.set(K0, false); show(2); }
  };
});
