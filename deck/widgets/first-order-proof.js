/* Three one-dimensional illustrations of the first-order optimality theorem.
   They illustrate the arguments; the neighbouring text proves the general case. */
IE437.widget('first-order-proof', function (host, opts) {
  var E = IE437.el, BLUE = '#2563EB', RED = '#D64545', INK = '#16181D', AMBER = '#D97706';
  var mode = opts.mode || 'necessary';
  var necessary = mode === 'necessary', sufficient = mode === 'sufficient';
  var initial = necessary ? 0.10 : sufficient ? 2 : -0.5;
  var value = initial, W = 480, H = 248;
  var formula = necessary ? 'f(x) = (x − 2)²' : sufficient ? 'f(x) = x²' : 'f(x) = x³';
  host.dataset.proofMode = mode;
  host.innerHTML = '<div class="wbar" style="gap:12px"><span class="wt" style="text-transform:none;letter-spacing:0">' + formula +
    '</span><span class="wspacer"></span><span data-slider></span></div>' +
    '<div class="wbody" style="align-items:center;padding:12px;gap:8px">' +
    '<div data-plot></div><div data-values aria-live="polite" style="font:500 13px/1.65 var(--mono);' +
    'text-align:center;min-height:44px"></div></div>';
  var svg = IE437.svg(W, H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', necessary ? 'A small feasible move lowers the cost of a candidate point.' :
    sufficient ? 'The convex function lies above its tangent, which lies above the candidate cost on the feasible interval.' :
    'The cubic has a horizontal tangent at zero, but points to the left have lower values.');
  host.querySelector('[data-plot]').appendChild(svg);
  var slider = IE437.slider(host.querySelector('[data-slider]'), {
    label: necessary ? 'step t' : 'point y', min: necessary ? 0 : sufficient ? 1 : -1,
    max: necessary ? 0.4 : sufficient ? 3 : 1, step: 0.01, value: initial, width: 90,
    fmt: function (v) { return v.toFixed(2); }, on: function (v) { value = v; draw(); }
  });
  slider.input.setAttribute('aria-label', necessary ? 'Feasible step fraction t' : 'Comparison point y');
  // Keep native range-key behaviour while the lecture's document-level shortcuts are active.
  slider.input.addEventListener('keydown', function (event) {
    if (/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown)$/.test(event.key)) event.stopPropagation();
  });

  function label(x, y, text, colour, anchor) {
    return E('text', { x: x, y: y, text: text, fill: colour || INK,
      'font-size': 12, 'font-family': 'Inter, sans-serif', 'text-anchor': anchor || 'start' }, svg);
  }
  function dot(m, x, y, colour, role, open) {
    return E('circle', { cx: m.X(x), cy: m.Y(y), r: 5, fill: open ? '#FBFBF9' : colour,
      stroke: colour, 'stroke-width': 2, 'data-role': role }, svg);
  }
  function draw() {
    var f = necessary ? function (x) { return (x - 2) * (x - 2); } :
      sufficient ? function (x) { return x * x; } : function (x) { return x * x * x; };
    var xs = necessary ? [-0.15, 3.15] : sufficient ? [-0.1, 3.2] : [-1.2, 1.2];
    var ys = necessary ? [-0.85, 4.5] : sufficient ? [-1, 10.5] : [-1.9, 1.9];
    var curve = [];
    for (var i = 0; i <= 160; i++) { var x = xs[0] + (xs[1] - xs[0]) * i / 160; curve.push([x, f(x)]); }
    var m = IE437.plot(svg, { w: W, h: H, pad: { l: 40, r: 20, t: 25, b: 35 },
      xdom: xs, ydom: ys, xticks: necessary || sufficient ? [0, 1, 2, 3] : [-1, 0, 1],
      yticks: necessary ? [0, 2, 4] : sufficient ? [0, 4, 8] : [-1, 0, 1],
      xlabel: 'x', series: [] });
    if (necessary || sufficient) {
      E('rect', { x: m.X(sufficient ? 1 : 0), y: m.Y(ys[1]),
        width: m.X(3) - m.X(sufficient ? 1 : 0), height: m.Y(ys[0]) - m.Y(ys[1]),
        fill: BLUE, 'fill-opacity': 0.05 }, svg);
      label(W - 22, 17, sufficient ? 'FEASIBLE X = [1, 3]' : 'FEASIBLE X = [0, 3]', BLUE, 'end');
    } else label(W - 22, 17, 'ALL REAL x ARE FEASIBLE', INK, 'end');
    E('path', { d: curve.map(function (p, j) { return (j ? 'L' : 'M') + m.X(p[0]) + ' ' + m.Y(p[1]); }).join(' '),
      fill: 'none', stroke: INK, 'stroke-width': 2.5 }, svg);
    var out = host.querySelector('[data-values]');
    if (necessary) {
      var a = 0.5, y = 2.5, xt = a + value * (y - a);
      E('line', { x1: m.X(a), y1: m.Y(-0.35), x2: m.X(y), y2: m.Y(-0.35),
        stroke: BLUE, 'stroke-width': 3 }, svg);
      E('line', { x1: m.X(xt), y1: m.Y(-0.35), x2: m.X(xt), y2: m.Y(f(xt)),
        stroke: RED, 'stroke-dasharray': '3 4' }, svg);
      dot(m, a, f(a), INK, 'candidate', true); dot(m, y, f(y), BLUE, 'comparison', true);
      dot(m, xt, f(xt), RED, 'moving-point');
      label(m.X(a) - 8, m.Y(f(a)) - 13, 'candidate x* = 0.5', INK, 'start');
      label(m.X(y) + 7, m.Y(f(y)) - 12, 'y = 2.5', BLUE);
      label(m.X(xt) + 9, m.Y(f(xt)) + 18, 'xₜ', RED);
      out.innerHTML = 'xₜ = ' + xt.toFixed(2) + ' &nbsp;·&nbsp; f(xₜ) = <b>' + f(xt).toFixed(3) + '</b><br>' +
        (value > 0 ? '<span style="color:' + RED + '">below f(x*) = 2.250 — candidate disproved</span>' : 't = 0: start at the candidate');
      host.dataset.point = xt; host.dataset.cost = f(xt); host.dataset.directionalDerivative = -6;
    } else if (sufficient) {
      var tangent = function (x) { return 2 * x - 1; };
      E('line', { x1: m.X(xs[0]), y1: m.Y(tangent(xs[0])), x2: m.X(xs[1]), y2: m.Y(tangent(xs[1])),
        stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '6 4', 'data-role': 'tangent' }, svg);
      E('line', { x1: m.X(1), y1: m.Y(1), x2: m.X(3), y2: m.Y(1),
        stroke: BLUE, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
      E('line', { x1: m.X(value), y1: m.Y(1), x2: m.X(value), y2: m.Y(f(value)),
        stroke: BLUE, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
      dot(m, 1, 1, BLUE, 'candidate'); dot(m, value, f(value), INK, 'moving-point');
      dot(m, value, tangent(value), AMBER, 'tangent-point', true);
      label(m.X(1) - 8, m.Y(1) + 19, 'x* = 1', BLUE, 'end');
      label(m.X(value) - 8, m.Y(f(value)) - 12, 'f(y)', INK, 'end');
      label(m.X(2.7), m.Y(tangent(2.7)) + 20, 'tangent T', AMBER, 'end');
      out.innerHTML = 'f(y) = <b>' + f(value).toFixed(2) + '</b> ≥ T(y) = <b>' + tangent(value).toFixed(2) + '</b> ≥ 1<br>' +
        '<span style="color:' + BLUE + '">every feasible y is above f(x*) = 1</span>';
      host.dataset.point = value; host.dataset.cost = f(value); host.dataset.lowerBound = tangent(value);
    } else {
      E('line', { x1: m.X(xs[0]), y1: m.Y(0), x2: m.X(xs[1]), y2: m.Y(0),
        stroke: AMBER, 'stroke-width': 2, 'stroke-dasharray': '6 4', 'data-role': 'tangent' }, svg);
      E('line', { x1: m.X(value), y1: m.Y(0), x2: m.X(value), y2: m.Y(f(value)),
        stroke: value < 0 ? RED : BLUE, 'stroke-dasharray': '3 4' }, svg);
      dot(m, 0, 0, INK, 'candidate', true); dot(m, value, f(value), value < 0 ? RED : BLUE, 'moving-point');
      label(m.X(0) + 10, m.Y(0) - 12, 'f′(0) = 0', INK);
      label(m.X(-1.1), m.Y(0) - 12, 'horizontal tangent', AMBER);
      var cubicCost = f(value);
      var costText = cubicCost !== 0 && Math.abs(cubicCost) < 0.001 ? cubicCost.toExponential(1) : cubicCost.toFixed(3);
      out.innerHTML = 'y = ' + value.toFixed(2) + ' &nbsp;·&nbsp; f(y) = <b>' + costText + '</b><br>' +
        (value < 0 ? '<span style="color:' + RED + '">lower than f(0) = 0 — zero is not a minimum</span>' :
          value > 0 ? 'this point is higher; points just left of zero are lower' : 'zero slope alone does not certify a minimum');
      host.dataset.point = value; host.dataset.cost = f(value); host.dataset.directionalDerivative = 0;
    }
  }
  function reset() { value = initial; slider.set(initial); draw(); }
  reset();
  return { reset: reset, finish: reset };
});
