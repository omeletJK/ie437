/* ============================================================
   widget: pg-trajectory                         (Chapter 10, Acts 1–2)
   The source deck's scored-trajectory figure (deck 9, p. 37), redrawn
   as one picture for the whole of Acts 1 and 2: one episode of the
   heater, x_{t+1} = x_t + u_t with u = −0.6x + noise, drawn as the
   state over time, with five sampled (s_t, a_t) marked. Every mode
   starts from this drawing and adds one thing, so the variance ladder
   is read on the figure the students met first (one figure format per
   story). Plain figure panel, stepped; every step redraws.

   mode "law"      p. 81 — the law of a trajectory. The π_θ(a_t|s_t)
                   factors sit under the sampled points (blue) and the
                   P(s_{t+1}|s_t,a_t) factors on the edges (green). Step 1
                   writes p_θ(τ) under the picture; step 2 fades the P
                   factors and writes ∇_θ log p_θ(τ) = Σ_t ∇_θ log π_θ:
                   the dynamics enter the law and leave its log-gradient.
                   Stepped (2).
   mode "return"   p. 37 — REINFORCE. Step 1 runs a dashed line from each
                   sampled point to the episode's end, where G_t stack, and
                   scores each point ∇ log π_θ(a_t|s_t) G_t; step 2 brackets
                   the whole episode: "update only after the episode ends".
                   Stepped (2).
   mode "causal"   p. 85 — reward-to-go. Step 0 is the return picture; step
                   1 cuts each dashed line to start at t and greys the
                   rewards before t; step 2 draws the cross-term triangle:
                   the products score_t × r_{t′} with t′ < t have mean zero.
                   Stepped (2).
   mode "baseline" pp. 86–88 — under each sampled point, at its own t, a
                   strip: step 0 is the cost that followed as a grey bar
                   from a zero line with the cost expected from that state,
                   b(s_t), as an amber tick on it (every weight a cost, one
                   sign); step 1 subtracts: the bars are re-anchored on one
                   "as expected" line and only the difference is left, up
                   and blue when the action did better than its state
                   usually does, down and red when worse. One scale in both
                   steps, so the press is literally the subtraction.
                   Stepped (2). The deck gives this mode seed 39, a run in
                   which three of the five points come out better and two
                   worse (the default episode has all five better); the
                   other modes keep the default so their labels stay apart.
   mode "nstep"    p. 46 — the n-step return. Step 1 runs each dashed line
                   only to t + n and bootstraps there on a value cone
                   V(s_{t+n}); the tail is greyed. {"n": 1} is the one-step
                   actor–critic, the TD error. Stepped (1).
   Options: n (nstep only, default 2), seed (default 5).
   ============================================================ */
IE437.widget('pg-trajectory', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'return';
  var NSTEP = opts.n == null ? 2 : Math.max(1, Math.min(3, +opts.n));
  var SEED = opts.seed == null ? 5 : +opts.seed;
  var uid = 'pg' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- the episode: the heater, one run, seeded ---------- */
  var T = 10, K = 0.6, SIG = 0.3, X0 = 1.2;
  var rand = IE437.rng(SEED);
  function gauss() { var a = rand(); if (a < 1e-12) a = 1e-12; var b = rand(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); }
  var xs = [X0], us = [], rs = [], t, x = X0;
  for (t = 0; t < T; t++) { var u = -K * x + SIG * gauss(); us.push(u); rs.push(-(x * x + u * u)); x = x + u; xs.push(x); }
  var rtg = new Array(T), run = -xs[T] * xs[T];
  for (t = T - 1; t >= 0; t--) { run += rs[t]; rtg[t] = run; }
  /* the expected cost-to-go of the mean policy from the state actually reached: the baseline b(s_t) */
  function expectedRtg(x0, from) {
    var c = 1 - K, Ex2 = x0 * x0, tot = 0, i;
    for (i = from; i < T; i++) { tot += Ex2 + (K * K * Ex2 + SIG * SIG); Ex2 = c * c * Ex2 + SIG * SIG; }
    return -(tot + Ex2);
  }
  var MARK = [1, 3, 5, 7, 9];                 /* the five sampled points of the source figure */

  /* ---------- helpers ---------- */
  function svg(w, h) { var s = IE437.svg(w, h); mount.appendChild(s); var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['g', GREEN], ['r', RED], ['s', SLATE]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m); });
    return s; }
  function arrow(s, x1, y1, x2, y2, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#16A34A': 'g', '#D64545': 'r', '#64748B': 's' }[c] || 'k';
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.5, 'marker-end': 'url(#' + uid + key + ')' };
    for (var q in extra || {}) a[q] = extra[q];
    return E('line', a, s);
  }
  function tx(s, x, y, str, a) {
    var m = { 'font-size': 12 }; for (var q in a || {}) m[q] = a[q];
    if (/[_^()=|∼\\′+−]/.test(str) || /^[A-Za-z]$/.test(str)) {
      m['font-size'] = Math.round(parseFloat(m['font-size']) * 1.25 * 10) / 10;
      return IE437.math(s, x, y, str, m);
    }
    var at = { x: x, y: y, 'font-size': 12, fill: INK, text: str }; for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  function layer(s, op) { return E('g', op != null ? { opacity: op } : {}, s); }

  /* ---------- the shared drawing: axis, trajectory, five points ---------- */
  var W = 760, H = 336;
  var X0P = 60, XT = 600, YLO = MODE === 'baseline' ? 160 : 236, YHI = 56;       /* the plot frame; the baseline mode keeps a strip below */
  function X(tt) { return X0P + (XT - X0P) * tt / T; }
  function Y(v) { return YLO - (v + 0.7) / 2.1 * (YLO - YHI); }
  function base(s, o) {
    o = o || {};
    var g = layer(s);
    /* time axis */
    E('line', { x1: X0P - 10, x2: XT + 30, y1: YLO + 14, y2: YLO + 14, stroke: INK, 'stroke-opacity': .35, 'stroke-width': 1 }, g);
    for (var i = 0; i <= T; i++) {
      E('line', { x1: X(i), x2: X(i), y1: YLO + 11, y2: YLO + 17, stroke: INK, 'stroke-opacity': .35 }, g);
      if (i === 0 || i === T) tx(g, X(i), YLO + 31, i === 0 ? 't = 0' : 't = T', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
    tx(g, XT + 36, YLO + 18, 'time t', { fill: SLATE, 'font-size': 10.5 });
    tx(g, X0P - 44, (YLO + YHI) / 2, 'state', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle', transform: 'rotate(-90 ' + (X0P - 44) + ' ' + ((YLO + YHI) / 2) + ')' });
    /* the trajectory: edges green (the world moved it), states as dots */
    var d = xs.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
    E('path', { d: d, fill: 'none', stroke: GREEN, 'stroke-width': 1.6, opacity: .8, 'stroke-linejoin': 'round' }, g);
    xs.forEach(function (v, i) { E('circle', { cx: X(i), cy: Y(v), r: 3, fill: '#fff', stroke: BLUE, 'stroke-width': 1.3 }, g); });
    /* the terminal state */
    E('rect', { x: X(T) - 7, y: Y(xs[T]) - 7, width: 14, height: 14, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
    tx(g, X(T), Y(xs[T]) + 3.5, 'T', { 'text-anchor': 'middle', 'font-size': 9.5 });
    /* the five sampled points */
    MARK.forEach(function (i) {
      E('circle', { cx: X(i), cy: Y(xs[i]), r: 6, fill: BLUE }, g);
      if (!o.noLabels) tx(g, X(i), Y(xs[i]) - 12, '(s_{' + i + '},a_{' + i + '})', { fill: BLUE, 'font-size': 10, 'text-anchor': 'middle' });
    });
    return g;
  }
  /* a dashed line from the sampled point i to time tEnd, with an optional end label */
  function dash(g, i, tEnd, c, label) {
    var y = Y(xs[i]);
    E('line', { x1: X(i) + 7, x2: X(tEnd) - (tEnd === T ? 9 : 2), y1: y, y2: y, stroke: c || INK, 'stroke-width': 1.3, 'stroke-dasharray': '4 4', 'stroke-opacity': .7 }, g);
    if (label) tx(g, X(tEnd) + 12, y + 4, label, { fill: c || INK, 'font-size': 11 });
  }
  /* a horizontal bracket over [t0, t1] at height y, with a label above */
  function bracket(g, t0, t1, y, c, label, above) {
    var x0 = X(t0), x1 = X(t1);
    E('path', { d: 'M' + x0 + ' ' + (y + 6) + 'V' + y + 'H' + x1 + 'V' + (y + 6), fill: 'none', stroke: c, 'stroke-width': 1.4 }, g);
    if (label) tx(g, (x0 + x1) / 2, above ? y - 6 : y + 20, label, { fill: c, 'font-size': 10.5, 'text-anchor': 'middle' });
  }
  /* a written line under the figure, and a red note after or under it */
  function line(g, x, y, str, fs) { return tx(g, x, y, str, { 'font-size': fs || 13.5 }); }
  function note(g, y, str, c) { tx(g, W - 10, y, str, { fill: c || RED, 'font-size': 11, 'text-anchor': 'end' }); }
  /* recolour the tspans whose text matches a pattern */
  function recolour(t, re, fill, op) {
    var sp = t.getElementsByTagName('tspan');
    for (var i = 0; i < sp.length; i++) if (re.test(sp[i].textContent)) { sp[i].setAttribute('fill', fill); if (op != null) sp[i].setAttribute('opacity', op); }
  }

  /* ============================================================ law ============================================================ */
  function drawLaw(k) {
    var s = svg(W, H), g = base(s, { noLabels: true });
    var gP = layer(s, k >= 2 ? .22 : 1), gPi = layer(s);
    MARK.forEach(function (i) {
      tx(gPi, X(i), Y(xs[i]) - 12, 'π_θ(a_{' + i + '}|s_{' + i + '})', { fill: BLUE, 'font-size': 10, 'text-anchor': 'middle' });
      var xm = (X(i) + X(i + 1)) / 2, ym = (Y(xs[i]) + Y(xs[i + 1])) / 2;
      tx(gP, xm, ym + 20, 'P(s_{' + (i + 1) + '}|s_{' + i + '},a_{' + i + '})', { fill: GREEN, 'font-size': 9.5, 'text-anchor': 'middle' });
    });
    tx(gPi, X(0), Y(xs[0]) + 22, 'p_0(s_0)', { fill: SLATE, 'font-size': 10, 'text-anchor': 'middle' });
    if (k >= 1) {
      var g1 = layer(s), y1 = H - 40;
      var t1 = line(g1, 28, y1, 'p_θ(τ) = p_0(s_0) ∏_{t} π_θ(a_t|s_t)\\, P(s_{t+1}|s_t,a_t)');
      recolour(t1, /^π$/, BLUE); recolour(t1, /^P$/, GREEN);
      note(g1, y1, '\\text{the policy chooses } a_t\\text{; the world answers with } s_{t+1}', SLATE);
    }
    if (k >= 2) {
      var g2 = layer(s), y2 = H - 14;
      var t2 = line(g2, 28, y2, '∇_θ \\log p_θ(τ) = \\sum_{t} ∇_θ \\log π_θ(a_t|s_t) + \\sum_t ∇_θ \\log P(s_{t+1}|s_t,a_t)');
      recolour(t2, /^P$/, GREEN, .35);
      note(g2, y2, '\\text{the P factors carry no θ: zero}', RED);
    }
  }

  /* ============================================================ return ============================================================ */
  function drawReturn(k) {
    var s = svg(W, H), g = base(s);
    if (k >= 1) {
      var g1 = layer(s);
      MARK.forEach(function (i) { dash(g1, i, T, INK, 'G_{' + i + '}'); });
      tx(g1, X(T) + 46, Y(xs[MARK[0]]) + 4, '\\text{the return after } t', { fill: SLATE, 'font-size': 10 });
      MARK.forEach(function (i) {
        tx(g1, X(i), Y(xs[i]) + 22, '∇_θ\\log π_θ(a_{' + i + '}|s_{' + i + '})\\, G_{' + i + '}', { fill: RED, 'font-size': 9.5, 'text-anchor': 'middle' });
      });
    }
    if (k >= 2) {
      var g2 = layer(s);
      bracket(g2, 0, T, 28, GREEN, '\\text{can be updated only after the episode is finished}', true);
      var y2 = H - 14;
      var t = line(g2, 28, y2, 'θ ← θ + α \\sum_{t=0}^{T-1} γ^t\\, ∇_θ \\log π_θ(a_t|s_t)\\, G_t');
      note(g2, y2, '\\text{one score per action, weighted by what followed it}', SLATE);
    }
  }

  /* ============================================================ causal ============================================================ */
  function drawCausal(k) {
    var s = svg(W, H), g = base(s, { noLabels: k >= 1 });
    var g1 = layer(s);
    if (k === 0) { MARK.forEach(function (i) { dash(g1, i, T, INK, 'G_{' + i + '}'); }); }
    else {
      /* reward ticks along the axis, those before the chosen point greyed */
      var i0 = 5;
      for (var i = 0; i < T; i++) {
        var before = i < i0;
        tx(g1, (X(i) + X(i + 1)) / 2, YLO + 31, 'r_{' + (i + 1) + '}', { fill: before ? SLATE : GREEN, 'font-size': 9.5, 'text-anchor': 'middle', opacity: before ? .4 : 1 });
      }
      MARK.forEach(function (i) { dash(g1, i, T, i === i0 ? GREEN : INK, ''); });
      tx(g1, X(i0) + 44, Y(xs[i0]) - 13, '\\sum_{t′≥5} r_{t′+1}', { fill: GREEN, 'font-size': 10 });
      tx(g1, X(i0), Y(xs[i0]) - 12, '(s_{5},a_{5})', { fill: BLUE, 'font-size': 10, 'text-anchor': 'middle' });
      bracket(g1, i0, T, YLO + 40, GREEN, '\\text{reward to go: what } a_5 \\text{ could still cause}', false);
      E('line', { x1: X(0), x2: X(i0) - 4, y1: YLO + 44, y2: YLO + 44, stroke: SLATE, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', opacity: .6 }, g1);
      tx(g1, X(i0 / 2), YLO + 60, '\\text{paid before } a_5\\text{: not its doing}', { fill: SLATE, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
    if (k >= 2) {
      /* the cross-term triangle: (Σ_t f_t)(Σ_t' r_t') laid out as a grid; below the diagonal t' < t */
      var g2 = layer(s), n = 5, cs = 20, gx = 646, gy = 64;
      tx(g2, gx + n * cs / 2 + 12, gy - 26, '(\\sum_t f_t)(\\sum_{t′} r_{t′})', { fill: INK, 'font-size': 10.5, 'text-anchor': 'middle' });
      tx(g2, gx + n * cs / 2 + 12, gy - 12, 'f_t = ∇_θ\\log π_θ(a_t|s_t)', { fill: SLATE, 'font-size': 8.5, 'text-anchor': 'middle' });
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) {
        var noise = b < a;     /* row a = score index t, column b = reward index t′ ; t′ < t is noise */
        E('rect', { x: gx + b * cs + 12, y: gy + a * cs, width: cs - 2, height: cs - 2, fill: noise ? PANEL2 : BLUE, 'fill-opacity': noise ? 1 : .18, stroke: noise ? PANEL2 : BLUE, 'stroke-opacity': .6 }, g2);
      }
      for (var a2 = 0; a2 < n; a2++) {
        tx(g2, gx + 2, gy + a2 * cs + cs / 2 + 3, 'f_{' + MARK[a2] + '}', { fill: RED, 'font-size': 8.5, 'text-anchor': 'end' });
        tx(g2, gx + a2 * cs + 12 + cs / 2 - 1, gy + n * cs + 10, 'r_{' + MARK[a2] + '}', { fill: GREEN, 'font-size': 8.5, 'text-anchor': 'middle' });
      }
      tx(g2, gx + n * cs / 2 + 12, gy + n * cs + 26, '\\text{grey: } t′ < t', { fill: SLATE, 'font-size': 9.5, 'text-anchor': 'middle' });
      tx(g2, gx + n * cs / 2 + 12, gy + n * cs + 38, 'mean zero: noise', { fill: SLATE, 'font-size': 9.5, 'text-anchor': 'middle' });
      var y2 = H - 14;
      var t = line(g2, 28, y2, '∇_θ J = \\text{E}[ \\sum_t ∇_θ\\log π_θ(a_t|s_t) \\; \\red{\\sum_{t′ ≥ t} r_{t′+1}} ]');
      note(g2, y2, '\\text{the cheapest variance reduction in RL: one index}', SLATE);
    }
  }

  /* ============================================================ baseline ============================================================ */
  function drawBaseline(k) {
    var s = svg(W, H), g = base(s, { noLabels: true });
    var g1 = layer(s);
    /* the strip under the time axis: one bar per sampled point, at its own t, one scale in both steps */
    var floor = 284, mid = 250, sc = 40, bw = 16;
    var stripL = X0P - 10, stripR = XT + 30;
    MARK.forEach(function (i) {
      var c = -rtg[i], b = -expectedRtg(xs[i], i), A = b - c;   /* A > 0: less cost than expected, the action did better */
      var cx = X(i);
      /* a faint guide from the sampled point down into the strip */
      E('line', { x1: cx, x2: cx, y1: Y(xs[i]) + 8, y2: (k === 0 ? floor - c * sc : mid - (A > 0 ? A * sc : 0)) - 3, stroke: SLATE, 'stroke-width': 1, 'stroke-dasharray': '2 4', opacity: .45 }, g1);
      if (k === 0) {
        E('rect', { x: cx - bw / 2, y: floor - c * sc, width: bw, height: c * sc, fill: PANEL2, stroke: SLATE, 'stroke-width': .9 }, g1);
        E('line', { x1: cx - bw / 2 - 5, x2: cx + bw / 2 + 5, y1: floor - b * sc, y2: floor - b * sc, stroke: AMBER, 'stroke-width': 2.2 }, g1);
        tx(g1, cx, floor + 13, 'G_{' + i + '}', { fill: INK, 'font-size': 10, 'text-anchor': 'middle' });
      } else {
        var better = A > 0, h = Math.abs(A) * sc;
        E('rect', { x: cx - bw / 2, y: better ? mid - h : mid, width: bw, height: Math.max(h, 1.5), fill: better ? BLUE : RED, 'fill-opacity': .8 }, g1);
        tx(g1, cx, better ? mid - h - 6 : mid + h + 13, better ? '\\text{better}' : '\\text{worse}', { fill: better ? BLUE : RED, 'font-size': 9.5, 'text-anchor': 'middle' });
      }
    });
    if (k === 0) {
      E('line', { x1: stripL, x2: stripR, y1: floor, y2: floor, stroke: INK, 'stroke-opacity': .35 }, g1);
      tx(g1, stripR + 6, floor + 4, '0', { fill: SLATE, 'font-size': 10 });
      tx(g1, stripR + 6, floor - 24, '\\text{the cost that}', { fill: SLATE, 'font-size': 10 });
      tx(g1, stripR + 6, floor - 11, '\\text{followed, } -G_t', { fill: SLATE, 'font-size': 10 });
      var lx = 300, ly = 311;
      E('line', { x1: lx, x2: lx + 14, y1: ly, y2: ly, stroke: AMBER, 'stroke-width': 2.2 }, g1);
      tx(g1, lx + 20, ly + 4, 'b(s_t)\\text{: the cost expected from } s_t\\text{, before the action}', { fill: AMBER, 'font-size': 9.5 });
      tx(g1, 28, H - 8, '\\text{every return here is a cost paid: the sign of the weight says nothing about the action}', { fill: SLATE, 'font-size': 11 });
    } else {
      E('line', { x1: stripL, x2: stripR, y1: mid, y2: mid, stroke: AMBER, 'stroke-width': 2.2 }, g1);
      tx(g1, stripR + 6, mid - 3, '\\text{as expected,}', { fill: AMBER, 'font-size': 10 });
      tx(g1, stripR + 6, mid + 10, 'b(s_t)', { fill: AMBER, 'font-size': 10 });
      var lx2 = 300, ly2 = 311;
      E('rect', { x: lx2, y: ly2 - 5, width: 10, height: 8, fill: BLUE, 'fill-opacity': .8 }, g1);
      tx(g1, lx2 + 16, ly2 + 3, '\\text{up: better than expected, made likelier}', { fill: BLUE, 'font-size': 9.5 });
      E('rect', { x: lx2 + 236, y: ly2 - 5, width: 10, height: 8, fill: RED, 'fill-opacity': .8 }, g1);
      tx(g1, lx2 + 252, ly2 + 3, '\\text{down: worse, made less likely}', { fill: RED, 'font-size': 9.5 });
      line(g1, 28, H - 8, '∇_θ J = \\text{E}[ \\sum_t ∇_θ\\log π_θ(a_t|s_t)\\, ( \\sum_{t′≥t} r_{t′+1} \\red{- b(s_t)} ) ]', 12.5);
    }
  }

  /* ============================================================ nstep ============================================================ */
  function drawNstep(k) {
    var s = svg(W, H), g = base(s);
    if (k >= 1) {
      var g1 = layer(s), n = NSTEP;
      MARK.forEach(function (i) {
        var e = Math.min(T, i + n), y = Y(xs[i]);
        dash(g1, i, e, INK, '');
        /* the value cone: the bootstrap at s_{t+n} */
        if (e < T) {
          var cx = X(e) + 4, L = 30, h = 9;
          E('path', { d: 'M' + cx + ' ' + y + 'L' + (cx + L) + ' ' + (y - h) + 'L' + (cx + L) + ' ' + (y + h) + 'Z', fill: BLUE, opacity: .14 }, g1);
          E('path', { d: 'M' + cx + ' ' + y + 'L' + (cx + L) + ' ' + (y - h) + 'M' + cx + ' ' + y + 'L' + (cx + L) + ' ' + (y + h), fill: 'none', stroke: BLUE, 'stroke-width': 1, opacity: .5 }, g1);
          tx(g1, cx + L + 4, y + 4, 'V(s_{' + e + '})', { fill: BLUE, 'font-size': 9.5 });
        }
        /* the tail that is no longer waited for */
        if (e < T) E('line', { x1: X(e) + 40 + (n === 1 ? 26 : 30), x2: X(T) - 9, y1: y, y2: y, stroke: SLATE, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: .35 }, g1);
      });
      bracket(g1, MARK[2], MARK[2] + n, Y(xs[MARK[2]]) + 24, GREEN, (n === 1 ? 'r_{6}' : n === 2 ? 'r_6 + r_7' : 'r_6 + r_7 + r_8') + '\\text{, then bootstrap}', false);
      var y2 = H - 14;
      if (n === 1) {
        var t = line(g1, 28, y2, 'δ_t = r_{t+1} + γ V(s_{t+1}) − V(s_t)');
        note(g1, y2, '\\text{the critic’s TD error, Lecture 8’s engine, now the weight of the score}', SLATE);
      } else {
        var t2 = line(g1, 28, y2, 'R_t^{(n)} = r_{t+1} + \\cdots + r_{t+n} + \\red{V(s_{t+n})}');
        note(g1, y2, '\\text{n steps sampled, the rest read off the critic}', SLATE);
      }
    }
  }

  /* ---------- dispatch ---------- */
  var DRAW = { law: drawLaw, 'return': drawReturn, causal: drawCausal, baseline: drawBaseline, nstep: drawNstep };
  var STEPS = { law: 2, 'return': 2, causal: 2, baseline: 2, nstep: 1 };
  var draw = DRAW[MODE] || drawReturn, n = STEPS[MODE] == null ? 1 : STEPS[MODE];
  function render(i) { mount.innerHTML = ''; draw(Math.max(0, Math.min(n, i | 0))); }
  render(0);
  return { steps: n, step: function (i) { render(i); }, reset: function () { render(0); }, finish: function () { render(n); } };
});
