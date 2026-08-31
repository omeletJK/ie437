/* ============================================================
   widget: bayes-update
   The Beta–Binomial updating panel of the source deck, made live.
   Toss a coin whose bias you are not told; the Beta posterior
   sharpens, and the readout decomposes the posterior mean into
   the weighted average the whole of Act 2 is about.
   ============================================================ */
IE437.widget('bayes-update', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', RED = '#D64545';
  var TRUE = opts.theta || 0.62;
  var PRIORS = [
    { a: 1, b: 1, name: 'uniform · Beta(1,1)', note: 'no opinion' },
    { a: 2, b: 2, name: 'weak · Beta(2,2)', note: 'worth 4 tosses' },
    { a: 20, b: 20, name: 'strong fair · Beta(20,20)', note: 'worth 40 tosses' },
    { a: 2, b: 8, name: 'sceptical · Beta(2,8)', note: 'expects tails' }
  ];
  var pi = 0, n = 0, y = 0, rand = IE437.rng(opts.seed || 39);

  host.innerHTML =
    '<div class="wbar"><span class="wt">A coin of unknown bias &mdash; belief, updated</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-prior></button>' +
    '<button class="wb" data-t1>+1 toss</button>' +
    '<button class="wb" data-t10>+10</button>' +
    '<button class="wb" data-t50>+50</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:12px">' +
    '<div data-num style="font:400 13px/1.9 var(--sans);color:var(--ink2)"></div>' +
    '<div data-bal style="border-top:1px solid rgba(22,24,29,.14);padding-top:12px"></div>' +
    '</div></div>';

  var CW = 470, CH = 268;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  /* Beta density, normalised numerically so no gamma function is needed */
  function betaPdf(a, b) {
    var N = 400, xs = [], raw = [], i, t, v, area = 0;
    for (i = 0; i <= N; i++) {
      t = i / N;
      v = (a === 1 && b === 1) ? 1 : Math.exp((a - 1) * Math.log(Math.max(t, 1e-12)) +
                                              (b - 1) * Math.log(Math.max(1 - t, 1e-12)));
      xs.push(t); raw.push(v);
    }
    for (i = 0; i < N; i++) area += (raw[i] + raw[i + 1]) / 2 * (1 / N);
    return xs.map(function (t, k) { return [t, raw[k] / area]; });
  }

  function toss(k) {
    for (var i = 0; i < k; i++) { n++; if (rand() < TRUE) y++; }
    draw();
  }

  function draw() {
    var P = PRIORS[pi], a0 = P.a, b0 = P.b, a1 = a0 + y, b1 = b0 + n - y;
    var pri = betaPdf(a0, b0), pos = betaPdf(a1, b1);
    var hi = 1.15 * Math.max(2, Math.max.apply(null, pos.map(function (p) { return p[1]; })));

    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 34, r: 12, t: 14, b: 30 },
      xdom: [0, 1], ydom: [0, hi], yticks: [],
      xticks: [0, 0.25, 0.5, 0.75, 1], xlabel: 'θ  —  probability of heads',
      xfmt: function (v) { return v.toFixed(2); },
      series: [
        { pts: pri, color: AMBER, w: 1.8, dash: '5 4' },
        { pts: pos, color: BLUE, w: 2.4 }
      ]
    });
    /* the truth, and the relative frequency */
    E('line', { x1: m.X(TRUE), y1: m.Y(0), x2: m.X(TRUE), y2: m.Y(hi), stroke: INK,
      'stroke-opacity': .45, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, sv);
    E('text', { x: m.X(TRUE) + 5, y: m.Y(hi) + 12, 'font-size': 9.5, fill: INK, 'fill-opacity': .5,
      'font-family': 'IBM Plex Mono, monospace', 'letter-spacing': .8, text: 'TRUE θ' }, sv);
    if (n) E('circle', { cx: m.X(y / n), cy: m.Y(0), r: 4.5, fill: RED }, sv);

    host.querySelector('[data-prior]').textContent = P.name;

    var mlPart = n ? (y / n) : NaN;
    var wPrior = (a0 + b0) / (a0 + b0 + n), wData = n / (a0 + b0 + n);
    var priorMean = a0 / (a0 + b0), postMean = a1 / (a1 + b1);

    host.querySelector('[data-num]').innerHTML =
      '<span style="color:' + AMBER + '">&#9473;&#9473; prior</span> Beta(' + a0 + ', ' + b0 + ') &middot; ' +
      P.note + '<br>' +
      '<span style="color:' + BLUE + '">&#9473;&#9473; posterior</span> Beta(<b>' + a1 + '</b>, <b>' + b1 + '</b>)' +
      ' &nbsp;&middot;&nbsp; ' + n + ' tosses, ' + y + ' heads<br>' +
      '<span style="color:' + RED + '">&#9679;</span> relative frequency ' +
      (n ? '<b>' + mlPart.toFixed(3) + '</b>' : '—') +
      ' &nbsp;&middot;&nbsp; posterior mean <b>' + postMean.toFixed(3) + '</b>';

    host.querySelector('[data-bal]').innerHTML =
      '<div class="wlabel" style="margin-bottom:8px">the posterior mean is a weighted average</div>' +
      '<div style="font:400 13px/1.7 var(--sans)">' +
      '<b>' + postMean.toFixed(3) + '</b> &nbsp;=&nbsp; ' +
      '<span style="color:' + AMBER + '">' + wPrior.toFixed(2) + '</span> &times; ' +
      priorMean.toFixed(2) + ' &nbsp;+&nbsp; ' +
      '<span style="color:' + RED + '">' + wData.toFixed(2) + '</span> &times; ' +
      (n ? mlPart.toFixed(3) : '—') + '</div>' +
      '<div style="display:flex;height:12px;margin-top:9px;border:1px solid rgba(22,24,29,.14)">' +
      '<div style="width:' + (wPrior * 100) + '%;background:' + AMBER + ';opacity:.55"></div>' +
      '<div style="width:' + (wData * 100) + '%;background:' + RED + ';opacity:.55"></div></div>' +
      '<div style="display:flex;justify-content:space-between;font:500 9.5px/1 var(--mono);' +
      'letter-spacing:.1em;color:var(--ink4);margin-top:5px">' +
      '<span>PRIOR ' + Math.round(wPrior * 100) + '%</span>' +
      '<span>DATA ' + Math.round(wData * 100) + '%</span></div>';
  }

  host.querySelector('[data-t1]').onclick = function () { toss(1); };
  host.querySelector('[data-t10]').onclick = function () { toss(10); };
  host.querySelector('[data-t50]').onclick = function () { toss(50); };
  var __reset = function () { n = 0; y = 0; rand = IE437.rng(opts.seed || 39); draw(); };
  host.querySelector('[data-prior]').onclick = function () { pi = (pi + 1) % PRIORS.length; draw(); };

  draw();
  return { reset: __reset, finish: function () { if (n < 50) toss(50 - n); } };
});
