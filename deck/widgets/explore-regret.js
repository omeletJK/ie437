/* ============================================================
   widget: explore-regret
   The exploration sweep of the source deck (p. 77), read as regret.
   Ten Bernoulli arms with unknown payout probabilities, a thousand
   pulls, cumulative regret averaged over 80 seeded runs. Pure greed
   locks on and never recovers; constant thrashing pays a toll every
   round; the best fixed rate is in between — and the confidence
   bound, which explores where the uncertainty is rather than at
   random, beats every fixed rate.
   ============================================================ */
IE437.widget('explore-regret', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706',
      RED = '#D64545', SLATE = '#64748B';

  var K = 10, T = 1000, RUNS = 80, SEED = opts.seed || 21;
  var EPS = [0, 0.01, 0.05, 0.1, 0.2, 0.5];
  var KAP = [0.1, 0.2, 0.3, 0.5, 1, 2];
  var rule = 'eps', pi = 3;                      /* eps = 0.1 */

  function arms(seed) {
    var R = IE437.rng(seed), p = [], i;
    for (i = 0; i < K; i++) p.push(0.15 + 0.8 * R());
    return p;
  }
  function play(kind, par, seed, P) {
    var R = IE437.rng(seed), Q = new Float64Array(K), N = new Float64Array(K);
    var pstar = Math.max.apply(null, P), creg = 0, curve = new Float64Array(T), t, i, a, b, u, r;
    for (t = 0; t < T; t++) {
      a = 0;
      if (kind === 'eps') {
        if (R() < par) a = Math.floor(R() * K);
        else { b = -1e9; for (i = 0; i < K; i++) if (Q[i] > b) { b = Q[i]; a = i; } }
      } else {
        b = -1e9;
        for (i = 0; i < K; i++) {
          u = N[i] === 0 ? 1e9 : Q[i] + par * Math.sqrt(2 * Math.log(t + 1) / N[i]);
          if (u > b) { b = u; a = i; }
        }
      }
      r = R() < P[a] ? 1 : 0;
      N[a]++; Q[a] += (r - Q[a]) / N[a];
      creg += pstar - P[a]; curve[t] = creg;
    }
    return curve;
  }
  var CACHE = {};
  function sweep(kind, par) {
    var key = kind + par;
    if (CACHE[key]) return CACHE[key];
    var avg = new Float64Array(T), run, c, t;
    for (run = 0; run < RUNS; run++) {
      c = play(kind, par, SEED + 7000 + run * 13, arms(SEED + 1000 + run));
      for (t = 0; t < T; t++) avg[t] += c[t] / RUNS;
    }
    return (CACHE[key] = avg);
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">How much exploration?</span><span class="wspacer"></span>' +
    '<button class="wb" data-rule></button>' +
    '<span class="wlabel" data-pl></span><span class="wnum" data-pv></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">cumulative regret over 1000 pulls</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">final regret vs the dial</div><div data-c2></div></div>' +
    '<div style="width:194px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div>';

  var W1 = 400, H1 = 246, W2 = 250, H2 = 246;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }
  function pars() { return rule === 'eps' ? EPS : KAP; }
  function col() { return rule === 'eps' ? BLUE : GREEN; }

  function draw() {
    var P = pars(), finals = P.map(function (p) { return sweep(rule, p)[T - 1]; });
    var hi = Math.max.apply(null, finals) * 1.06;

    /* ---------- left: the regret curves ---------- */
    clear(sv1);
    var L = 40, R = 10, B = 26, Tp = 12;
    var CX = function (t) { return L + t / (T - 1) * (W1 - L - R); };
    var CY = function (v) { return H1 - B - v / hi * (H1 - B - Tp); };
    [0, 100, 200, 300].forEach(function (t) {
      if (t > hi) return;
      E('line', { x1: L, y1: CY(t), x2: W1 - R, y2: CY(t), stroke: INK, 'stroke-opacity': .1 }, sv1);
      E('text', { x: L - 5, y: CY(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv1);
    });
    E('line', { x1: L, y1: H1 - B, x2: W1 - R, y2: H1 - B, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: L, y1: Tp, x2: L, y2: H1 - B, stroke: INK, 'stroke-opacity': .28 }, sv1);
    [0, 250, 500, 750, 1000].forEach(function (t) {
      E('text', { x: CX(Math.min(t, T - 1)), y: H1 - 12, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: t }, sv1);
    });
    P.forEach(function (p, k) {
      var c = sweep(rule, p), d = '', t;
      for (t = 0; t < T; t += 8) d += (t ? 'L' : 'M') + CX(t).toFixed(1) + ' ' + CY(c[t]).toFixed(1);
      d += 'L' + CX(T - 1).toFixed(1) + ' ' + CY(c[T - 1]).toFixed(1);
      var on = k === pi;
      E('path', { d: d, fill: 'none', stroke: on ? col() : INK, 'stroke-opacity': on ? 1 : .18,
        'stroke-width': on ? 2.6 : 1.2 }, sv1);
      if (on) E('text', { x: CX(T - 1) - 4, y: CY(c[T - 1]) - 7, 'text-anchor': 'end', 'font-size': 10.5,
        'font-weight': 700, fill: col(), text: c[T - 1].toFixed(0) }, sv1);
    });
    E('text', { x: (W1 + L) / 2, y: H1 - 2, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
      'font-family': 'IBM Plex Mono, monospace', text: 'pulls' }, sv1);

    /* ---------- right: the U ---------- */
    clear(sv2);
    var L2 = 38, R2 = 14, B2 = 30, T2 = 14;
    var UX = function (k) { return L2 + (P.length < 2 ? 0.5 : k / (P.length - 1)) * (W2 - L2 - R2); };
    var UY = function (v) { return H2 - B2 - v / hi * (H2 - B2 - T2); };
    [0, 100, 200, 300].forEach(function (t) {
      if (t > hi) return;
      E('line', { x1: L2, y1: UY(t), x2: W2 - R2, y2: UY(t), stroke: INK, 'stroke-opacity': .1 }, sv2);
      E('text', { x: L2 - 5, y: UY(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .45,
        'font-family': 'IBM Plex Mono, monospace', text: t }, sv2);
    });
    E('line', { x1: L2, y1: H2 - B2, x2: W2 - R2, y2: H2 - B2, stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('line', { x1: L2, y1: T2, x2: L2, y2: H2 - B2, stroke: INK, 'stroke-opacity': .28 }, sv2);
    E('path', { d: finals.map(function (v, k) { return (k ? 'L' : 'M') + UX(k).toFixed(1) + ' ' + UY(v).toFixed(1); }).join(''),
      fill: 'none', stroke: col(), 'stroke-width': 2, 'stroke-opacity': .5 }, sv2);
    var bi = 0; finals.forEach(function (v, k) { if (v < finals[bi]) bi = k; });
    finals.forEach(function (v, k) {
      E('circle', { cx: UX(k), cy: UY(v), r: k === pi ? 5.5 : 3.4, fill: k === pi ? RED : col(),
        'fill-opacity': k === pi ? 1 : .55 }, sv2);
      E('text', { x: UX(k), y: H2 - 16, 'text-anchor': 'middle', 'font-size': 8.5, fill: INK,
        'fill-opacity': k === pi ? .8 : .42, 'font-family': 'IBM Plex Mono, monospace', text: P[k] }, sv2);
    });
    E('path', { d: 'M' + (UX(bi) - 4) + ' ' + (UY(finals[bi]) - 15) + 'h8l-4 7Z', fill: AMBER }, sv2);
    E('text', { x: (W2 + L2) / 2, y: H2 - 3, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45,
      'font-family': 'IBM Plex Mono, monospace', text: rule === 'eps' ? 'ε' : 'κ' }, sv2);

    /* ---------- readout ---------- */
    host.querySelector('[data-rule]').textContent = rule === 'eps' ? 'ε-greedy' : 'UCB';
    host.querySelector('[data-pl]').textContent = rule === 'eps' ? 'explore rate' : 'price';
    host.querySelector('[data-pv]').textContent = P[pi];
    var bestEps = Math.min.apply(null, EPS.map(function (p) { return sweep('eps', p)[T - 1]; }));
    var bestUcb = Math.min.apply(null, KAP.map(function (p) { return sweep('ucb', p)[T - 1]; }));
    host.querySelector('[data-num]').innerHTML =
      'regret at 1000 pulls<br><b style="font-size:16px">' + finals[pi].toFixed(0) + '</b><br>' +
      '<span style="color:' + SLATE + '">best ε-greedy &nbsp;' + bestEps.toFixed(0) + '</span><br>' +
      '<span style="color:' + GREEN + '">best UCB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + bestUcb.toFixed(0) + '</span><br>' +
      '<span style="color:var(--ink4)">10 arms · 80 runs</span>';

    var note;
    if (rule === 'eps' && P[pi] === 0) note = 'Pure greed. It locks onto whichever arm paid first and <b>never finds out it was wrong</b> — regret grows linearly for ever.';
    else if (rule === 'eps' && P[pi] >= 0.5) note = 'Constant thrashing. The best arm is known by pull 50, and it still throws away half of every round after that.';
    else if (rule === 'eps') note = 'A fixed rate can do no better than choosing the best arm <b>1 − ε</b> of the time. That floor is why the curve turns back up.';
    else note = 'The bound explores <b>where the uncertainty is</b>, not at random, and stops exploring an arm once its count makes the bonus small. This is μ + κσ with a count in place of the width.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  host.querySelector('[data-rule]').onclick = function () {
    rule = rule === 'eps' ? 'ucb' : 'eps'; pi = rule === 'eps' ? 3 : 2;
    /* the two rules have dials of different lengths, so re-range the track */
    dial.input.max = pars().length - 1;
    dial.set(pi, false);
    draw();
  };
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: pars().length - 1, step: 1, value: pi,
    on: function (v) { pi = v; draw(); }
  });

  draw();
  return { finish: function () { rule = 'eps'; pi = 3; draw(); } };
});
