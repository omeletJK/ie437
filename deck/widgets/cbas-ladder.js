/* ============================================================
   widget: cbas-ladder                              (Chapter 6, Act 3)
   CbAS run as the paper writes it, on one design axis where the score
   rises to the right (y_hat(x) = x), so "good enough" is everything
   right of a line. The slide carries the four lines of the algorithm,
   tagged \htmlClass{alg1}..{alg4}; this widget lights the line it is
   showing.

     1 propose   x_1..x_N ~ q(x | phi_{t-1}),  q(x | phi_0) = p(x | theta) (the prior)
     2 bar       gamma_t = min(gamma, Q-th percentile of y_hat(x_i))
     3 weight    w_i = p(x_i | theta) / q(x_i | phi_{t-1}) * P(y_hat >= gamma_t | x_i)
     4 refit     phi_t = argmax sum_i w_i log q(x_i | phi)
                 (q Gaussian: the weighted mean and variance)

   prior N(3, 1), target gamma = 6, Q = 0.8, M = 1000 proposals per
   round taken as evenly spaced quantiles of q (the expectation, not a
   lucky draw); 20 of them, quantiles (i - 1/2)/20, are drawn as dots.
   A smaller M is not a simplification: with M = 20 the weighted
   variance collapses and the ladder stalls near x = 5.35.

   Walked by the deck's ->:
     0-3  round 1, one line per press (bar 3.84, refit N(4.40, 0.47^2))
     4-7  rounds 2-5, all four lines per press
          bars 4.79 -> 5.41 -> 5.86 -> 6.00 (capped at the target)
     8    the last refit, N(6.21, 0.16^2): 91% of proposals reach x >= 6
   One shot (the bar at 6 in round 1) passes about 1 proposal in 740.
   Verified in node before shipping.
   ============================================================ */
IE437.widget('cbas-ladder', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', SLATE = '#64748B';
  var M0 = 3, S0 = 1, T = 6, Q = 0.8, M = 1000, ND = 20;
  function nd(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2),
        p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
  function iPhi(p) { var lo = -8, hi = 8, k, m; for (k = 0; k < 80; k++) { m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
  function quantiles(m, s, n) { var a = [], i; for (i = 1; i <= n; i++) a.push(m + s * iPhi((i - 0.5) / n)); return a; }

  /* CbAS, exactly: rounds until the bar reaches the target */
  var R = [], m = M0, s = S0, r;
  for (r = 0; r < 12; r++) {
    var xs = quantiles(m, s, M), k = Math.ceil(Q * M);
    var bar = Math.min(T, (xs[k - 1] + xs[k]) / 2);                          /* line 2 */
    var w = xs.map(function (x) { return x >= bar ? nd(x, M0, S0) / nd(x, m, s) : 0; });   /* line 3 */
    var W = 0, mu = 0, v = 0;
    w.forEach(function (wi, i) { W += wi; mu += wi * xs[i]; });
    mu /= W;
    w.forEach(function (wi, i) { v += wi * (xs[i] - mu) * (xs[i] - mu); });
    R.push({ m: m, s: s, bar: bar, nm: mu, ns: Math.sqrt(v / W), dots: quantiles(m, s, ND) });   /* line 4 */
    m = mu; s = Math.sqrt(v / W);
    if (bar >= T) break;
  }
  var NR = R.length, LAST = { m: m, s: s, dots: quantiles(m, s, ND) };
  var FINAL = 3 + NR;                                      /* the step showing the last refit */
  var reach = function (xs) { return xs.filter(function (x) { return x >= T; }).length; };
  var fx = function (v) { return v.toFixed(1); };

  var st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">A hard request, replaced by easy ones</span><span class="wspacer"></span>' +
    '<span class="wlabel">target</span><span class="wnum">γ = ' + T + '</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:320px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-read style="font:400 13px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 13px/1.6 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.1);padding-top:9px"></div></div></div>';
  var CW = 600, CH = 180, L = 16, Rm = 16, TOP = 24, B = 30, X0 = 0, X1 = 8;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rm); };
  var YM = 2.7, BASE = CH - B, PY = function (v) { return BASE - Math.min(v, YM) / YM * (BASE - TOP); };
  function curve(mm, ss, attrs) {
    var pts = [], i, x;
    for (i = 0; i <= 400; i++) { x = X0 + (X1 - X0) * i / 400; pts.push(PX(x).toFixed(1) + ' ' + PY(nd(x, mm, ss)).toFixed(1)); }
    attrs.d = 'M' + pts.join('L'); attrs.fill = 'none'; E('path', attrs, sv);
  }
  function vline(x, attrs) { attrs.x1 = attrs.x2 = PX(x); attrs.y1 = BASE; attrs.y2 = TOP - 4; E('line', attrs, sv); }
  /* dots: hollow = weight 0; filled = weight > 0, area by weight */
  function dots(rd, weighted, colour, cut) {
    var ws = rd.dots.map(function (x) { return x >= cut ? (weighted ? nd(x, M0, S0) / nd(x, rd.m, rd.s) : 1) : 0; });
    var wmax = Math.max.apply(null, ws) || 1;
    rd.dots.forEach(function (x, i) {
      var on = ws[i] > 0, rad = on && weighted ? 2.4 + 3 * Math.sqrt(ws[i] / wmax) : 3.6;
      E('circle', { cx: PX(x), cy: BASE - 6 - (i % 4) * 6.5, r: rad, fill: on ? colour : '#fff', 'fill-opacity': on ? .9 : 1,
                    stroke: on ? colour : SLATE, 'stroke-width': 1.2, 'stroke-opacity': on ? 1 : .55 }, sv);
    });
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('rect', { x: PX(T), y: TOP - 4, width: PX(X1) - PX(T), height: BASE - TOP + 4, fill: GREEN, 'fill-opacity': .07 }, sv);
    vline(T, { stroke: GREEN, 'stroke-width': 1.4 });
    E('text', { x: PX(X1) - 6, y: TOP + 8, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: GREEN, text: 'target: x ≥ ' + T }, sv);
    E('line', { x1: L, x2: CW - Rm, y1: BASE, y2: BASE, stroke: INK, 'stroke-opacity': .3 }, sv);
    [0, 2, 4, 6, 8].forEach(function (v) { E('text', { x: PX(v), y: BASE + 13, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .45, text: String(v) }, sv); });
    E('text', { x: CW / 2, y: CH - 3, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'design x — the score rises to the right' }, sv);
    curve(M0, S0, { stroke: SLATE, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'stroke-opacity': .8 });
    E('text', { x: PX(M0) - 30, y: PY(nd(M0, M0, S0)) - 6, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: SLATE, text: 'prior' }, sv);

    if (st === FINAL) {                                     /* the last refit */
      rungs(-1, NR);
      curve(LAST.m, LAST.s, { stroke: BLUE, 'stroke-width': 2.4 });
      dots(LAST, false, GREEN, T);
      return;
    }
    var round = st < 4 ? 0 : st - 3, line = st < 4 ? st + 1 : 4, rd = R[round];
    if (st === 0) rungs(-1, 0); else rungs(round, round);
    curve(rd.m, rd.s, { stroke: BLUE, 'stroke-width': line === 4 && st < 4 ? 1.4 : 2.4, 'stroke-opacity': line === 4 && st < 4 ? .45 : 1 });
    if (line === 4 && st < 4) {                            /* round 1, line 4: the refit, drawn */
      curve(rd.nm, rd.ns, { stroke: BLUE, 'stroke-width': 2.4 });
      E('text', { x: PX(rd.nm) + 26, y: PY(nd(rd.nm, rd.nm, rd.ns)) + 4, 'font-size': 10.5, 'font-weight': 700, fill: BLUE, text: 'refit' }, sv);
    }
    if (line === 1) dots(rd, false, BLUE, Infinity);
    else if (line === 2) dots(rd, false, BLUE, Infinity);
    else dots(rd, round > 0, BLUE, rd.bar);
  }
  /* the bars of earlier rounds, faint; the current one, bold */
  function rungs(cur, faint) {
    for (var k = 0; k < Math.min(faint, NR); k++) {
      if (k === cur || R[k].bar >= T) continue;
      vline(R[k].bar, { stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '4 3', 'stroke-opacity': .35 });
      E('text', { x: PX(R[k].bar), y: TOP - 8, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: BLUE, 'fill-opacity': .45, text: String(k + 1) }, sv);
    }
    if (cur < 0) return;
    vline(R[cur].bar, { stroke: BLUE, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
    E('text', { x: PX(R[cur].bar) + (R[cur].bar >= T ? 6 : 0), y: TOP - 8, 'text-anchor': R[cur].bar >= T ? 'start' : 'middle', 'font-size': 10, 'font-weight': 700, fill: BLUE, text: 'γ' + sub(cur + 1) + (R[cur].bar >= T ? ' = γ' : '') }, sv);
  }
  function sub(n) { return String(n).replace(/\d/g, function (d) { return '₀₁₂₃₄₅₆₇₈₉'[d]; }); }

  function readout() {
    var shown = st === FINAL ? LAST.dots : R[st < 4 ? 0 : st - 3].dots, n = reach(shown);
    var climbed = st === FINAL ? NR : (st < 4 ? (st >= 1 ? 1 : 0) : st - 2);
    var bars = R.map(function (q, k) {
      return '<b style="color:' + (k < climbed ? BLUE : 'rgba(22,24,29,.3)') + '">' + fx(q.bar) + '</b>';
    }).join(' <span style="opacity:.4">→</span> ');
    return '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
      '<span>proposals that reach the target</span><b style="font:700 18px var(--mono);color:' + (n >= 10 ? GREEN : INK) + '">' + n + ' / ' + ND + '</b></div>' +
      '<div style="margin-top:2px;white-space:nowrap">bars γ<sub>t</sub>: ' + bars + '</div>';
  }

  var r1 = R[0];
  var NOTES = [
    '<b>Line 1</b> — propose from the generator; round 1 proposes from the prior. ==None of the 20 reaches the target==: with the bar at 6 at once, every weight in line 3 would be 0.',
    '<b>Line 2</b> — set the bar at the 80th percentile of this round\'s scores: γ₁ = ' + fx(r1.bar) + '. The best 4 of 20 clear it — an easy request.',
    '<b>Line 3</b> — weigh: 1 right of the bar, 0 left of it. Round 1 proposes from the prior, so p/q = 1 and the four count equally.',
    '<b>Line 4</b> — refit q to the weighted designs: their weighted mean and variance. The generator moves right.'
  ];
  for (r = 1; r < NR; r++) {
    NOTES.push(r === 1
      ? '<b>Round 2</b> — lines 1–4 again, proposing from the refit. Now q is not the prior, so line 3\'s ratio p/q matters — dot size is weight. γ₂ = ' + fx(R[1].bar) + '.'
      : R[r].bar >= T
        ? '<b>Round ' + (r + 1) + '</b> — the percentile passes the target, so line 2 caps the bar at γ = ' + T + '. ' + reach(R[r].dots) + ' of 20 already pass.'
        : '<b>Round ' + (r + 1) + '</b> — the same four lines, one rung higher: γ' + sub(r + 1) + ' = ' + fx(R[r].bar) + '.');
  }
  NOTES.push('The last refit: ==' + reach(LAST.dots) + ' of 20 proposals reach the target==. No round asked for more than its best 20%.');

  function light() {
    var sec = host.closest('section'); if (!sec) return;
    for (var k = 1; k <= 4; k++) {
      var on = st < 4 ? k === st + 1 : true;
      Array.prototype.forEach.call(sec.querySelectorAll('.alg' + k), function (el) {
        el.style.opacity = (st < 4 && !on) ? '.32' : '1';
        el.style.color = (st < 4 && on) ? BLUE : '';
      });
    }
  }
  function show(k) {
    st = Math.max(0, Math.min(FINAL, k));
    draw();
    host.querySelector('[data-read]').innerHTML = readout();
    host.querySelector('[data-note]').innerHTML = NOTES[st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
    light();
  }
  show(0);
  return { steps: FINAL, step: show, reset: function () { show(0); }, finish: function () { show(FINAL); } };
});
