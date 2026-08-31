/* ============================================================
   widget: variance-split
   The two laws of Chapter 2, computed rather than asserted.

   A Beta(alpha,beta) prior and n Bernoulli observations. Every
   possible dataset is enumerated — y = 0..n with weight given by
   the Beta-Binomial — so nothing here is sampled and nothing is
   approximate. Left: the prior against all n+1 posteriors, with
   their means as ticks whose height is p(y). Right: the ledger.

     total expectation   E[ E[theta|y] ]        = E[theta]
     total variance      E[var(theta|y)] + var(E[theta|y]) = var(theta)

   Both hold to machine precision, and the *between* share turns
   out to be exactly n/(n+alpha+beta) — the weight Chapter 2 put
   on the data in its posterior-mean slide.
   ============================================================ */
IE437.widget('variance-split', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B';

  var NS = [1, 2, 5, 10, 20, 50];
  var PRIORS = [
    { a: 1, b: 1, name: 'Beta(1,1) — flat' },
    { a: 2, b: 2, name: 'Beta(2,2) — mild' },
    { a: 3, b: 7, name: 'Beta(3,7) — sceptical' },
    { a: 8, b: 8, name: 'Beta(8,8) — firm' }
  ];
  var pi = 1, ni = 3;

  /* ---------- special functions ---------- */
  var G = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(z) {
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1; var x = 0.99999999999980993, i;
    for (i = 0; i < 8; i++) x += G[i] / (z + i + 1);
    var t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function lbeta(a, b) { return lgamma(a) + lgamma(b) - lgamma(a + b); }
  function lchoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
  function betaPdf(x, a, b) {
    if (x <= 0 || x >= 1) return 0;
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lbeta(a, b));
  }

  /* ---------- the exact ledger ---------- */
  function ledger() {
    var P = PRIORS[pi], a = P.a, b = P.b, n = NS[ni], k;
    var priorMean = a / (a + b), priorVar = a * b / ((a + b) * (a + b) * (a + b + 1));
    var rows = [], Em = 0, Em2 = 0, EV = 0, sw = 0;
    for (k = 0; k <= n; k++) {
      var w = Math.exp(lchoose(n, k) + lbeta(a + k, b + n - k) - lbeta(a, b));
      var A = a + k, B = b + n - k;
      var m = A / (A + B), v = A * B / ((A + B) * (A + B) * (A + B + 1));
      rows.push({ y: k, w: w, a: A, b: B, m: m, v: v });
      sw += w; Em += w * m; Em2 += w * m * m; EV += w * v;
    }
    var between = Em2 - Em * Em;
    return { a: a, b: b, n: n, rows: rows, sw: sw, priorMean: priorMean, priorVar: priorVar,
             Em: Em, within: EV, between: between, total: EV + between };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Both laws, on every possible dataset at once</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">prior</span><span class="wnum" data-p></span>' +
    '<button class="wb" data-pd>&minus;</button><button class="wb" data-pu>+</button>' +
    '<span class="wlabel" style="margin-left:6px">observations n</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-nd>&minus;</button><button class="wb" data-nu>+</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">prior, and every posterior it could become</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">where the variance went</div><div data-c2></div></div>' +
    '<div style="width:224px;display:flex;flex-direction:column;gap:8px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:8px"></div></div></div>';

  var W1 = 330, H1 = 252, W2 = 302, H2 = 252;
  var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  /* ---------- left: the fan of posteriors ---------- */
  var pl = 26, pr = 10, pt = 12, pb = 26, STRIP = 46;
  var TX = function (x) { return pl + x * (W1 - pl - pr); };

  function drawFan(L) {
    clear(sv1);
    var i, k, top = pt, bot = H1 - pb - STRIP;
    var peak = 0;
    L.rows.forEach(function (r) {
      var mode = (r.a > 1 && r.b > 1) ? (r.a - 1) / (r.a + r.b - 2) : r.m;
      peak = Math.max(peak, betaPdf(mode, r.a, r.b));
    });
    var pmode = (L.a > 1 && L.b > 1) ? (L.a - 1) / (L.a + L.b - 2) : L.priorMean;
    peak = Math.max(peak, betaPdf(pmode, L.a, L.b)) * 1.08;
    var DY = function (d) { return bot - Math.min(d, peak) / peak * (bot - top); };

    /* every posterior, opacity by how likely that dataset is */
    var wmax = 0; L.rows.forEach(function (r) { wmax = Math.max(wmax, r.w); });
    L.rows.forEach(function (r) {
      var d = '', N = 120, x;
      for (i = 0; i <= N; i++) {
        x = i / N; d += (i ? 'L' : 'M') + TX(x).toFixed(1) + ' ' + DY(betaPdf(x, r.a, r.b)).toFixed(1);
      }
      E('path', { d: d, fill: 'none', stroke: BLUE, 'stroke-width': 1.5,
        'stroke-opacity': (0.16 + 0.72 * r.w / wmax).toFixed(3) }, sv1);
    });

    /* the prior, on top */
    var dp = '';
    for (i = 0; i <= 160; i++) { var xx = i / 160; dp += (i ? 'L' : 'M') + TX(xx).toFixed(1) + ' ' + DY(betaPdf(xx, L.a, L.b)).toFixed(1); }
    E('path', { d: dp, fill: 'none', stroke: SLATE, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }, sv1);

    E('line', { x1: pl, y1: bot, x2: W1 - pr, y2: bot, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('line', { x1: pl, y1: top, x2: pl, y2: bot, stroke: INK, 'stroke-opacity': .28 }, sv1);
    E('text', { x: pl + 4, y: top + 10, 'font-size': 9.5, 'font-weight': 700, fill: SLATE, text: 'prior' }, sv1);
    E('text', { x: pl + 4, y: top + 23, 'font-size': 9.5, 'font-weight': 700, fill: BLUE,
      text: (L.n + 1) + ' possible posteriors' }, sv1);

    /* the strip of posterior means, height = p(y) */
    var sy0 = H1 - pb, sy1 = H1 - pb - STRIP + 8;
    E('line', { x1: pl, y1: sy0, x2: W1 - pr, y2: sy0, stroke: INK, 'stroke-opacity': .28 }, sv1);
    L.rows.forEach(function (r) {
      var h = (r.w / wmax) * (sy0 - sy1);
      E('line', { x1: TX(r.m), y1: sy0, x2: TX(r.m), y2: sy0 - h, stroke: BLUE, 'stroke-width': 2.4,
        'stroke-opacity': .62 }, sv1);
    });
    E('line', { x1: TX(L.priorMean), y1: top, x2: TX(L.priorMean), y2: sy0, stroke: AMBER,
      'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, sv1);
    E('text', { x: TX(L.priorMean) + 5, y: top + 10, 'font-size': 9, fill: AMBER, 'font-weight': 700,
      'font-family': 'IBM Plex Mono, monospace', text: 'E[θ] = ' + L.priorMean.toFixed(2) }, sv1);

    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
      E('text', { x: TX(v), y: H1 - pb + 13, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
        'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace', text: v }, sv1);
    });
    E('text', { x: (W1 + pl) / 2, y: H1 - 1, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .42, 'font-family': 'IBM Plex Mono, monospace',
      text: 'θ — ticks are posterior means, height p(y)' }, sv1);
  }

  /* ---------- right: the ledger, as two bars of equal height ---------- */
  function drawBars(L) {
    clear(sv2);
    var bw = 62, y0 = H2 - 34, y1 = 46, H = y0 - y1;
    var xA = 58, xB = 178;
    var hTot = H, hWithin = H * (L.within / L.priorVar), hBetween = H * (L.between / L.priorVar);

    E('rect', { x: xA, y: y0 - hTot, width: bw, height: hTot, fill: SLATE, 'fill-opacity': .55,
      stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('text', { x: xA + bw / 2, y: y0 + 14, 'text-anchor': 'middle', 'font-size': 10, fill: INK,
      'font-weight': 700, text: 'var(θ)' }, sv2);
    E('text', { x: xA + bw / 2, y: y0 + 26, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: L.priorVar.toFixed(5) }, sv2);

    E('rect', { x: xB, y: y0 - hWithin, width: bw, height: hWithin, fill: BLUE, 'fill-opacity': .45,
      stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('rect', { x: xB, y: y0 - hTot, width: bw, height: hBetween, fill: AMBER, 'fill-opacity': .5,
      stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('text', { x: xB + bw / 2, y: y0 + 14, 'text-anchor': 'middle', 'font-size': 10, fill: INK,
      'font-weight': 700, text: 'the split' }, sv2);
    E('text', { x: xB + bw / 2, y: y0 + 26, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: L.total.toFixed(5) }, sv2);

    E('text', { x: (xA + bw + xB) / 2, y: y0 - H / 2 + 5, 'text-anchor': 'middle', 'font-size': 17,
      fill: INK, 'fill-opacity': .55, text: '=' }, sv2);

    /* the shares, inside their own segments, so nothing can be clipped */
    var pctB = 100 * L.between / L.priorVar, pctW = 100 * L.within / L.priorVar;
    if (hBetween > 15) E('text', { x: xB + bw / 2, y: y0 - hTot + hBetween / 2 + 4, 'text-anchor': 'middle',
      'font-size': 12, fill: INK, 'font-weight': 700, text: pctB.toFixed(0) + '%' }, sv2);
    if (hWithin > 15) E('text', { x: xB + bw / 2, y: y0 - hWithin / 2 + 4, 'text-anchor': 'middle',
      'font-size': 12, fill: INK, 'font-weight': 700, text: pctW.toFixed(0) + '%' }, sv2);
    E('text', { x: xB + bw + 8, y: y0 - hTot + hBetween / 2 + 3.5, 'font-size': 9.5, fill: AMBER,
      'font-weight': 700, text: 'between' }, sv2);
    E('text', { x: xB + bw + 8, y: y0 - hWithin / 2 + 3.5, 'font-size': 9.5, fill: BLUE,
      'font-weight': 700, text: 'within' }, sv2);

    E('text', { x: 8, y: 16, 'font-size': 9.5, fill: AMBER, 'font-weight': 700,
      text: 'between = var(E[θ|y]) — how far the answer moves' }, sv2);
    E('text', { x: 8, y: 29, 'font-size': 9.5, fill: BLUE, 'font-weight': 700,
      text: 'within = E[var(θ|y)] — what the data leaves behind' }, sv2);
    E('line', { x1: 8, y1: H2 - 4, x2: W2 - 8, y2: H2 - 4, stroke: INK, 'stroke-opacity': .1 }, sv2);
  }

  function drawNums(L) {
    var share = L.n / (L.n + L.a + L.b);
    host.querySelector('[data-p]').textContent = 'Beta(' + L.a + ',' + L.b + ')';
    host.querySelector('[data-n]').textContent = L.n;
    host.querySelector('[data-num]').innerHTML =
      '<b>total expectation</b><br>' +
      '<span style="font-family:var(--mono);font-size:11px">E[E[θ|y]] = ' + L.Em.toFixed(12) + '<br>' +
      'E[θ] &nbsp;&nbsp;&nbsp;&nbsp;= ' + L.priorMean.toFixed(12) + '</span>' +
      '<hr style="border:0;border-top:1px solid rgba(22,24,29,.12);margin:7px 0">' +
      '<b>total variance</b><br>' +
      '<span style="font-family:var(--mono);font-size:11px">' +
      '<span style="color:' + BLUE + '">within &nbsp;</span> ' + L.within.toFixed(8) + '<br>' +
      '<span style="color:' + AMBER + '">between </span> ' + L.between.toFixed(8) + '<br>' +
      'sum &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + L.total.toFixed(8) + '<br>' +
      'var(θ) &nbsp;&nbsp;' + L.priorVar.toFixed(8) + '</span>' +
      '<hr style="border:0;border-top:1px solid rgba(22,24,29,.12);margin:7px 0">' +
      'between share = <b>n/(n+α+β)</b> = ' + L.n + '/' + (L.n + L.a + L.b) +
      ' = <b>' + (100 * share).toFixed(1) + '%</b>';

    var note;
    if (L.n <= 2) note = 'With almost no data the posteriors barely move: nearly all the variance is still <b>within</b>, waiting to be resolved.';
    else if (share > 0.85) note = 'The data now explains <b>' + (100 * share).toFixed(0) +
      '%</b> of the prior variance. Each posterior is a spike; what is left is where the spike landed.';
    else note = 'The between share is <b>exactly the weight Chapter 2 put on the data</b> in the posterior mean — the same n/(n+α+β), arrived at from variance rather than from the mean.';
    host.querySelector('[data-note]').innerHTML = note;
  }

  function draw() { var L = ledger(); drawFan(L); drawBars(L); drawNums(L); }

  host.querySelector('[data-nu]').onclick = function () { ni = Math.min(NS.length - 1, ni + 1); draw(); };
  host.querySelector('[data-nd]').onclick = function () { ni = Math.max(0, ni - 1); draw(); };
  host.querySelector('[data-pu]').onclick = function () { pi = Math.min(PRIORS.length - 1, pi + 1); draw(); };
  host.querySelector('[data-pd]').onclick = function () { pi = Math.max(0, pi - 1); draw(); };
  var __reset = function () { pi = 1; ni = 3; draw(); };

  draw();
  return { reset: __reset, finish: function () { pi = 1; ni = 3; draw(); } };
});
