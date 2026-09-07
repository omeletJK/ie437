/* Compare parameter uncertainty and future observations using exact models.
   Coin: Beta(4,3) mixed with m Bernoulli trials sharing one theta.
   Normal: prior N(20,4), known noise variance 9, observed mean 23. */
IE437.widget('bayes-predictive', function (host, opts) {
  var E = IE437.el, BLUE = '#2563EB', AMBER = '#D97706', INK = '#16181D';
  var normal = opts.mode === 'normal', count = normal ? 4 : 10, W = 700, H = 290;
  host.innerHTML = '<div class="wbar"><span class="wt">' +
    (normal ? 'Temperature versus the next reading' : 'One uncertain coin, a batch of future tosses') +
    '</span><span class="wspacer"></span><span data-control></span></div>' +
    '<div class="wbody" style="flex-direction:row;align-items:center;gap:24px">' +
    '<div data-plot></div><div data-values aria-live="polite" style="flex:1;min-width:0;font:400 14px/1.8 var(--sans)"></div></div>';
  var svg = IE437.svg(W, H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', normal ? 'Posterior density for temperature and predictive density for a new reading' :
    'Predictive probabilities for head counts, comparing Beta Binomial and plug-in Binomial');
  host.querySelector('[data-plot]').appendChild(svg);
  var dial = IE437.slider(host.querySelector('[data-control]'), {
    label: normal ? 'readings n' : 'future tosses m', min: 1, max: normal ? 100 : 30,
    step: 1, value: count, width: 150, fmt: function (v) { return String(v); },
    on: function (v) { count = v; draw(); }
  });
  dial.input.setAttribute('aria-label', normal ? 'Number of observed temperature readings' : 'Number of future tosses');
  dial.input.addEventListener('keydown', function (event) {
    if (/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown)$/.test(event.key)) event.stopPropagation();
  });
  function fact(n) { var r = 0; for (var j = 2; j <= n; j++) r += Math.log(j); return r; }
  function beta(a, b) { return fact(a - 1) + fact(b - 1) - fact(a + b - 1); }
  function label(x, y, t, c, anchor) {
    E('text', { x: x, y: y, text: t, fill: c || INK, 'text-anchor': anchor || 'start',
      'font-size': 12, 'font-family': 'Inter, sans-serif' }, svg);
  }
  function coin() {
    var mean = 4 / 7, full = [], plug = [], max = 0;
    for (var k = 0; k <= count; k++) {
      var choose = fact(count) - fact(k) - fact(count - k);
      var f = Math.exp(choose + beta(4 + k, 3 + count - k) - beta(4, 3));
      var p = Math.exp(choose + k * Math.log(mean) + (count - k) * Math.log(1 - mean));
      full.push(f); plug.push(p); max = Math.max(max, f, p);
    }
    var m = IE437.plot(svg, { w: W, h: H, pad: { l: 52, r: 14, t: 44, b: 34 },
      xdom: [-0.6, count + 0.6], ydom: [0, max * 1.16],
      xticks: Array.from({ length: count + 1 }, function (_, k) { return k; }).filter(function (k) {
        return count <= 12 || k % 5 === 0 || k === count;
      }), yticks: [0, max / 2, max], xlabel: 'number of heads in the future batch',
      xfmt: function (v) { return String(v); }, yfmt: function (v) { return v.toFixed(2); }, series: [] });
    var bw = Math.min(32, (m.X(1) - m.X(0)) * 0.35);
    full.forEach(function (v, k) {
      E('rect', { x: m.X(k) - bw, y: m.Y(v), width: bw, height: m.Y(0) - m.Y(v), fill: BLUE,
        'data-role': 'full-probability', 'data-k': k, 'data-probability': v }, svg);
      E('rect', { x: m.X(k), y: m.Y(plug[k]), width: bw, height: m.Y(0) - m.Y(plug[k]), fill: AMBER,
        'fill-opacity': 0.65, 'data-role': 'plugin-probability', 'data-k': k, 'data-probability': plug[k] }, svg);
    });
    label(52, 19, 'Full Bayes: Beta–Binomial', BLUE);
    label(370, 19, 'Plug-in: Binomial at θ = 4/7', AMBER);
    label(5, 37, 'probability');
    var pv = count * mean * (1 - mean), fv = pv * (7 + count) / 8;
    host.querySelector('[data-values]').innerHTML = '<b>Same mean</b><br>' + (count * mean).toFixed(3) + ' heads<br><br>' +
      '<span style="color:' + BLUE + '">Full Bayes variance</span><br><b>' + fv.toFixed(3) + '</b><br>' +
      '<span style="color:' + AMBER + '">Plug-in variance</span><br><b>' + pv.toFixed(3) + '</b><br><br>' +
      (count === 1 ? 'For one toss, the two distributions <b>coincide</b>.' :
        'The same uncertain bias is shared by <b>all ' + count + ' future tosses</b>.');
    host.dataset.mean = count * mean; host.dataset.fullVariance = fv; host.dataset.pluginVariance = pv;
  }
  function temperature() {
    var variance = 1 / (1 / 4 + count / 9), mean = variance * (20 / 4 + count * 23 / 9);
    var future = 9 + variance, posterior = [], predictive = [];
    function pdf(x, v) { return Math.exp(-Math.pow(x - mean, 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v); }
    for (var i = 0; i <= 800; i++) {
      var x = 8 + 28 * i / 800;
      posterior.push([x, pdf(x, variance)]); predictive.push([x, pdf(x, future)]);
    }
    var hi = pdf(mean, variance) * 1.16;
    var m = IE437.plot(svg, { w: W, h: H, pad: { l: 52, r: 14, t: 44, b: 34 },
      xdom: [8, 36], ydom: [0, hi], xticks: [10, 15, 20, 25, 30, 35], yticks: [0, hi / 2, hi],
      xlabel: 'temperature (°C)', xfmt: function (v) { return String(v); },
      yfmt: function (v) { return v.toFixed(2); }, series: [
        { pts: predictive, color: AMBER, w: 2.8 }, { pts: posterior, color: BLUE, w: 2.8 }
      ] });
    label(52, 19, 'Unknown temperature θ | data', BLUE);
    label(370, 19, 'Next reading Y | data', AMBER);
    label(5, 37, 'density');
    E('line', { x1: m.X(mean), x2: m.X(mean), y1: m.Y(0), y2: m.Y(hi), stroke: INK,
      'stroke-dasharray': '3 5', 'stroke-opacity': 0.3 }, svg);
    host.querySelector('[data-values]').innerHTML = '<b>Same centre: ' + mean.toFixed(2) + ' °C</b><br><br>' +
      '<span style="color:' + BLUE + '">Parameter variance</span><br><b>' + variance.toFixed(3) + '</b><br>' +
      '<span style="color:' + AMBER + '">Predictive variance</span><br>9 + ' + variance.toFixed(3) + ' = <b>' + future.toFixed(3) + '</b><br><br>' +
      'Observation-noise variance stays at <b>9</b>.<br>More data learns the mean.';
    host.dataset.mean = mean; host.dataset.parameterVariance = variance; host.dataset.fullVariance = future;
  }
  function draw() { host.dataset.count = count; if (normal) temperature(); else coin(); }
  function reset() { count = normal ? 4 : 10; dial.set(count, false); draw(); }
  reset();
  return { reset: reset, finish: reset };
});
