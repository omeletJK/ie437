/* ============================================================
   widget: ci-vs-cr
   The two-panel comparison of the source deck. Both intervals say
   "95%", and they are not the same claim. On the left, variability
   in the DATA at a fixed θ: run the experiment many times and 95%
   of the intervals you draw will cover the truth. On the right,
   variability in θ for the ONE dataset you actually have.
   ============================================================ */
IE437.widget('ci-vs-cr', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545';
  var TRUE = 1000, SD = 20, N = 12, REPS = 26;   // flux, measurement sd, sample size
  var seed = opts.seed || 31, runs = [], rand;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Both say 95% &mdash; and they are different claims</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-auto data-run>run ' + REPS + ' experiments</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">' +
    '<div class="wlabel" style="color:' + GREEN + '">frequentist &mdash; variability in the data</div>' +
    '<div data-c1></div>' +
    '<div class="wcap" data-s1 style="min-height:34px"></div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">' +
    '<div class="wlabel" style="color:' + RED + '">bayesian &mdash; variability in θ</div>' +
    '<div data-c2></div>' +
    '<div class="wcap" data-s2 style="min-height:34px"></div></div>' +
    '</div>';

  var W = 380, H = 232;
  var sv1 = IE437.svg(W, H), sv2 = IE437.svg(W, H);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  function gauss() {                                  // Box–Muller on the seeded stream
    var u = Math.max(1e-9, rand()), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function experiment() {
    var s = 0; for (var i = 0; i < N; i++) s += TRUE + SD * gauss();
    var mean = s / N, half = 1.96 * SD / Math.sqrt(N);
    return { m: mean, lo: mean - half, hi: mean + half, ok: (mean - half <= TRUE && TRUE <= mean + half) };
  }
  function reset() { rand = IE437.rng(seed); runs = []; draw(); }
  function run() { for (var i = 0; i < REPS; i++) runs.push(experiment()); draw(); }

  var DOM = [TRUE - 3.2 * SD, TRUE + 3.2 * SD];
  var X = function (v) { return 40 + (v - DOM[0]) / (DOM[1] - DOM[0]) * (W - 54); };

  function draw() {
    /* ---------- left: many intervals, one fixed truth ---------- */
    while (sv1.firstChild) sv1.removeChild(sv1.firstChild);
    E('line', { x1: X(TRUE), y1: 10, x2: X(TRUE), y2: H - 26, stroke: RED, 'stroke-width': 2.2 }, sv1);
    E('text', { x: X(TRUE) + 6, y: 20, 'font-size': 9.5, fill: RED, 'letter-spacing': .8,
      'font-family': 'IBM Plex Mono, monospace', text: 'TRUE θ' }, sv1);
    var shown = runs.slice(-REPS);
    shown.forEach(function (r, i) {
      var y = 30 + i * ((H - 62) / Math.max(1, REPS - 1));
      var c = r.ok ? GREEN : RED;
      E('line', { x1: X(r.lo), y1: y, x2: X(r.hi), y2: y, stroke: c, 'stroke-opacity': r.ok ? .55 : 1,
        'stroke-width': r.ok ? 1.4 : 2 }, sv1);
      E('circle', { cx: X(r.m), cy: y, r: 2.4, fill: c }, sv1);
    });
    E('line', { x1: 30, y1: H - 26, x2: W - 8, y2: H - 26, stroke: INK, 'stroke-opacity': .3 }, sv1);
    E('text', { x: (30 + W) / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 9.5, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: 'measured value' }, sv1);

    /* ---------- right: one dataset, a posterior over θ ---------- */
    while (sv2.firstChild) sv2.removeChild(sv2.firstChild);
    var last = runs.length ? runs[runs.length - 1] : null;
    var mu = last ? last.m : TRUE, sd = SD / Math.sqrt(N);
    var pts = [], i, t, v, top = 0;
    for (i = 0; i <= 200; i++) {
      t = DOM[0] + (DOM[1] - DOM[0]) * i / 200;
      v = Math.exp(-0.5 * Math.pow((t - mu) / sd, 2));
      pts.push([t, v]); if (v > top) top = v;
    }
    var Y = function (v) { return (H - 30) - v / top * (H - 62); };
    /* the 95% credible band */
    var lo = mu - 1.96 * sd, hi = mu + 1.96 * sd;
    var band = pts.filter(function (p) { return p[0] >= lo && p[0] <= hi; });
    if (band.length) {
      E('path', {
        d: 'M' + X(band[0][0]) + ' ' + Y(0) +
           band.map(function (p) { return 'L' + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('') +
           'L' + X(band[band.length - 1][0]) + ' ' + Y(0) + 'Z',
        fill: RED, 'fill-opacity': .16
      }, sv2);
    }
    E('path', {
      d: pts.map(function (p, k) { return (k ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(''),
      fill: 'none', stroke: RED, 'stroke-width': 2.2
    }, sv2);
    E('line', { x1: X(TRUE), y1: 10, x2: X(TRUE), y2: H - 30, stroke: INK, 'stroke-opacity': .4,
      'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, sv2);
    E('line', { x1: 30, y1: H - 30, x2: W - 8, y2: H - 30, stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('line', { x1: X(lo), y1: H - 30, x2: X(hi), y2: H - 30, stroke: RED, 'stroke-width': 3 }, sv2);
    E('text', { x: X(mu), y: H - 12, 'text-anchor': 'middle', 'font-size': 10, fill: RED,
      'font-family': 'IBM Plex Mono, monospace', 'letter-spacing': .8, text: '95% CREDIBLE' }, sv2);

    var hit = shown.filter(function (r) { return r.ok; }).length;
    host.querySelector('[data-s1]').innerHTML = runs.length
      ? '<b>' + hit + ' of ' + shown.length + '</b> intervals cover the true θ.<br>' +
        'The 95% is a property of <b>the procedure</b>, not of any one interval.'
      : 'press run — each line is one repetition of the whole experiment';
    host.querySelector('[data-s2]').innerHTML = runs.length
      ? 'From <b>this one dataset</b>: Pr(θ &isin; CR) = 0.95.<br>' +
        'The 95% is a property of <b>θ</b>, given what was seen.'
      : 'the posterior from a single dataset';
  }

  host.querySelector('[data-run]').onclick = run;
  host.querySelector('[data-rs]').onclick = reset;
  reset();
  return { finish: function () { if (!runs.length) run(); } };
});
