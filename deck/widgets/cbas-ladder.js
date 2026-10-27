/* ============================================================
   widget: cbas-ladder                              (Chapter 6, Act 3)
   One shot at a hard target, then the ladder — drawn as simply as it
   can be: one design axis on which the score rises to the right, so
   "good enough" is everything right of a line.

   prior (the trained generator): N(3, 1)        target: x >= 6
   Each round: 20 proposals (evenly spaced quantiles of the current
   generator, so the picture is the expectation, not a lucky draw);
   the bar is set at the best 4 of the 20, capped at the target; the
   generator is refitted to the prior cut at the bar — what CbAS's
   weighted fit, weights p/q x 1[x >= bar], aims at — by matching a
   Gaussian's mean and variance (truncated-normal moments).

   Walked by the deck's ->:
     0  one shot: 20 proposals from the prior, 0 reach the target
        (P(x >= 6) = 0.00135, about 1 in 740)
     1  round 1  bar 3.85  kept 4   -> N(4.40, 0.47^2)
     2  round 2  bar 4.80  kept 4   -> N(5.19, 0.36^2)
     3  round 3  bar 5.50  kept 4   -> N(5.82, 0.30^2)
     4  round 4  bar 6.00 = target, 5 of 20 reach it -> N(6.28, 0.27^2)
     5  the last generator: 17 of 20 proposals reach the target
   Verified in node before shipping.
   ============================================================ */
IE437.widget('cbas-ladder', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', SLATE = '#64748B';
  var M0 = 3, S0 = 1, T = 6, N = 20, K = 4;
  function nd(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  function phi(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2),
        p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function iPhi(p) { var lo = -8, hi = 8, k, m; for (k = 0; k < 80; k++) { m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function draws(m, s) { var a = [], i; for (i = 1; i <= N; i++) a.push(m + s * iPhi((i - 0.5) / N)); return a; }

  /* the rounds: proposal, bar, and the refit it leads to */
  var R = [], m = M0, s = S0, r;
  for (r = 0; r < 6; r++) {
    var xs = draws(m, s), bar = Math.min(T, (xs[N - K] + xs[N - K - 1]) / 2);
    var a = (bar - M0) / S0, lam = phi(a) / (1 - Phi(a));
    R.push({ m: m, s: s, xs: xs, bar: bar });
    m = M0 + S0 * lam; s = S0 * Math.sqrt(1 + a * lam - lam * lam);
    if (bar >= T) break;
  }
  var LAST = { m: m, s: s, xs: draws(m, s) };
  var NR = R.length;                                   /* 4 rounds */
  var reach = function (xs) { return xs.filter(function (x) { return x >= T; }).length; };

  var st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">A hard request, replaced by easy ones</span><span class="wspacer"></span>' +
    '<span class="wlabel">target</span><span class="wnum">x ≥ ' + T + '</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:300px;display:flex;flex-direction:column;gap:12px">' +
    '<div data-read style="font:400 13px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 13px/1.6 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.1);padding-top:10px"></div></div></div>';
  var CW = 600, CH = 230, L = 16, Rm = 16, TOP = 26, B = 30, X0 = 0, X1 = 8;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rm); };
  var YM = 1.6, BASE = CH - B, PY = function (v) { return BASE - v / YM * (BASE - TOP); };
  function curve(mm, ss, attrs) {
    var pts = [], i, x;
    for (i = 0; i <= 400; i++) { x = X0 + (X1 - X0) * i / 400; pts.push(PX(x).toFixed(1) + ' ' + PY(nd(x, mm, ss)).toFixed(1)); }
    attrs.d = 'M' + pts.join('L'); attrs.fill = 'none'; E('path', attrs, sv);
  }
  function vline(x, attrs) { attrs.x1 = attrs.x2 = PX(x); attrs.y1 = BASE; attrs.y2 = TOP - 4; E('line', attrs, sv); }
  function dots(xs, cut, colour) {
    xs.forEach(function (x, i) {
      var on = x >= cut;
      E('circle', { cx: PX(x), cy: BASE - 7 - (i % 3) * 7, r: 3.6, fill: on ? colour : '#fff', 'fill-opacity': on ? .9 : 1,
                    stroke: on ? colour : SLATE, 'stroke-width': 1.2, 'stroke-opacity': on ? 1 : .55 }, sv);
    });
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    /* the target: everything right of x = 6 is good enough */
    E('rect', { x: PX(T), y: TOP - 4, width: PX(X1) - PX(T), height: BASE - TOP + 4, fill: GREEN, 'fill-opacity': .07 }, sv);
    vline(T, { stroke: GREEN, 'stroke-width': 1.4 });
    E('text', { x: PX(X1) - 6, y: TOP + 8, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: GREEN, text: 'target: x ≥ ' + T }, sv);
    E('line', { x1: L, x2: CW - Rm, y1: BASE, y2: BASE, stroke: INK, 'stroke-opacity': .3 }, sv);
    [0, 2, 4, 6, 8].forEach(function (v) { E('text', { x: PX(v), y: BASE + 13, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45, text: String(v) }, sv); });
    E('text', { x: CW / 2, y: CH - 3, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'design x — the score rises to the right' }, sv);

    /* the prior, always */
    curve(M0, S0, { stroke: SLATE, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'stroke-opacity': .8 });
    E('text', { x: PX(M0) - 34, y: PY(nd(M0, M0, S0)) - 6, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: SLATE, text: 'prior' }, sv);

    if (st === 0) {                                       /* one shot */
      dots(R[0].xs, T, GREEN);
      return;
    }
    var k, cur = st <= NR ? R[st - 1] : LAST;
    /* the rungs already climbed, faint; the current one, bold */
    for (k = 0; k < Math.min(st, NR); k++) {
      var now = k === st - 1;
      if (R[k].bar >= T && !now) continue;
      vline(R[k].bar, { stroke: BLUE, 'stroke-width': now ? 2 : 1, 'stroke-dasharray': '4 3', 'stroke-opacity': now ? 1 : .35 });
      E('text', { x: PX(R[k].bar), y: TOP - 8, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700,
                  fill: BLUE, 'fill-opacity': now ? 1 : .45, text: now ? 'bar ' + (k + 1) : String(k + 1) }, sv);
    }
    curve(cur.m, cur.s, { stroke: BLUE, 'stroke-width': 2.4 });
    if (st <= NR) dots(cur.xs, cur.bar, BLUE); else dots(cur.xs, T, GREEN);
  }

  function readout() {
    var xs = st === 0 ? R[0].xs : (st <= NR ? R[st - 1].xs : LAST.xs), n = reach(xs);
    var rungs = R.map(function (q, k) {
      var on = st >= 1 && k <= st - 1;
      return '<b style="color:' + (on ? BLUE : 'rgba(22,24,29,.3)') + '">' + q.bar.toFixed(1) + '</b>';
    }).join(' <span style="opacity:.4">→</span> ');
    return '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
      '<span>proposals that reach the target</span><b style="font:700 18px var(--mono);color:' + (n >= 10 ? GREEN : INK) + '">' + n + ' / ' + N + '</b></div>' +
      '<div style="margin-top:6px">the bar, round by round: ' + rungs + '</div>';
  }

  var NOTES = [
    'The generator proposes designs near x = 3; the target needs x ≥ 6. ==One shot: 0 of 20 proposals reach it== — nothing left to refit to.',
    'Round 1 — set an easy bar: the best 4 of the 20. Refit the generator to those 4.',
    'Round 2 — propose from the refitted generator. The bar rises to its best 4. Refit again.',
    'Round 3 — the same step, one rung higher.',
    'Round 4 — the bar reaches the target: 5 of 20 pass. Refit to them.',
    'The last generator: ==17 of 20 proposals reach the target==. Every round asked only for the best 4 of 20.'
  ];
  function show(k) {
    st = Math.max(0, Math.min(NR + 1, k));
    draw();
    host.querySelector('[data-read]').innerHTML = readout();
    host.querySelector('[data-note]').innerHTML = NOTES[st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  show(0);
  return { steps: NR + 1, step: show, reset: function () { show(0); }, finish: function () { show(NR + 1); } };
});
