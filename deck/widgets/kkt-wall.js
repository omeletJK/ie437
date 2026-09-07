/* A single lower bound makes the KKT balance and its price visible.
   min x^2 subject to x >= a: x* = max(a, 0), lambda* = 2 max(a, 0). */
IE437.widget('kkt-wall', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', GREY = '#64748B';
  var adjustable = opts.mode === 'price', a = 1, W = 480, H = 224;
  var X = function (x) { return 34 + (x + 0.75) / 3 * (W - 58); };
  host.innerHTML = '<div class="wbar"><span class="wt">' +
    (adjustable ? 'Move the lower bound' : 'One variable, one wall') +
    '</span><span class="wspacer"></span><span data-control></span></div>' +
    '<div class="wbody" style="align-items:center;padding:12px;gap:8px">' +
    '<div data-picture></div><div data-values aria-live="polite" style="font:500 13px/1.7 var(--mono);text-align:center;min-height:44px"></div></div>';
  var svg = IE437.svg(W, H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'A lower bound blocks a move toward zero. At the optimum the cost and constraint pushes balance.');
  host.querySelector('[data-picture]').appendChild(svg);
  var dial;
  if (adjustable) {
    dial = IE437.slider(host.querySelector('[data-control]'), {
      label: 'a', min: -0.5, max: 1.5, step: 0.01, value: 1, width: 110,
      fmt: function (v) { return v.toFixed(2); },
      on: function (v) { a = v; draw(); }
    });
    dial.input.setAttribute('aria-label', 'Minimum allowed setting a');
    dial.input.addEventListener('keydown', function (event) {
      if (/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|PageUp|PageDown)$/.test(event.key)) event.stopPropagation();
    });
  }
  function text(x, y, value, colour, anchor, size) {
    E('text', { x: x, y: y, text: value, fill: colour || INK, 'text-anchor': anchor || 'middle',
      'font-size': size || 12, 'font-family': 'Inter, sans-serif' }, svg);
  }
  function arrow(start, end, y, colour, role) {
    var direction = end > start ? 1 : -1;
    var head = Math.min(7, Math.abs(end - start) * 0.4);
    E('line', { x1: start, x2: end, y1: y, y2: y, stroke: colour, 'stroke-width': 3, 'data-role': role }, svg);
    E('path', { d: 'M' + end + ' ' + y + 'L' + (end - direction * head) + ' ' + (y - head / 2) +
      'L' + (end - direction * head) + ' ' + (y + head / 2) + 'Z', fill: colour }, svg);
  }
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var best = Math.max(a, 0), price = 2 * best, cost = best * best;
    var point = X(best), wall = X(a), row = 120, axis = 183;
    E('rect', { x: wall, y: 43, width: X(2.25) - wall, height: 121, fill: BLUE, 'fill-opacity': 0.06 }, svg);
    E('line', { x1: wall, x2: wall, y1: 43, y2: 164, stroke: GREY, 'stroke-width': 4, 'data-role': 'wall' }, svg);
    text(W / 2, 24, 'Allowed: x ≥ ' + a.toFixed(2), BLUE, 'middle', 14);
    E('line', { x1: X(-0.75), x2: X(2.25), y1: axis, y2: axis, stroke: GREY, 'stroke-opacity': 0.45 }, svg);
    [-0.5, 0, 1, 2].forEach(function (v) {
      E('line', { x1: X(v), x2: X(v), y1: axis - 3, y2: axis + 3, stroke: GREY }, svg);
      text(X(v), axis + 19, String(v), GREY, 'middle', 11);
    });
    text(W - 14, axis + 5, 'x', GREY);
    if (best > 0) {
      E('circle', { cx: X(0), cy: row, r: 5, fill: '#FBFBF9', stroke: GREY, 'stroke-width': 1.5 }, svg);
      text(X(0), 152, 'preferred without the bound', GREY, 'middle', 11);
      arrow(point, point - price * 29, row, RED, 'cost-push');
      arrow(point, point + price * 29, row, BLUE, 'bound-push');
      text(118, 71, 'Cost pulls left: −' + price.toFixed(2), RED);
      text(365, 71, 'Bound pushes right: +' + price.toFixed(2), BLUE);
    } else {
      text(W / 2, 75, 'The preferred point x = 0 is allowed.', INK);
      text(W / 2, 97, 'No opposing push is needed.', GREY);
    }
    E('line', { x1: point, x2: point, y1: row + 9, y2: axis - 7, stroke: BLUE, 'stroke-dasharray': '3 4' }, svg);
    E('circle', { cx: point, cy: row, r: 7, fill: BLUE, 'data-role': 'optimum' }, svg);
    text(point, 218, 'best x* = ' + best.toFixed(2), BLUE);
    var status = a < 0 ? 'SLACK BOUND · zero price' : a === 0 ? 'TIGHT BOUND · still zero price' : 'TIGHT BOUND · positive price';
    host.querySelector('[data-values]').innerHTML = 'minimum cost = <b>' + cost.toFixed(4) + '</b> &nbsp;·&nbsp; λ = <b>' + price.toFixed(2) + '</b><br>' +
      (adjustable ? status : 'At x = 1: −2 + 2 = 0');
    host.dataset.bound = a;
    host.dataset.optimum = best;
    host.dataset.cost = cost;
    host.dataset.multiplier = price;
    host.dataset.slack = best - a;
  }
  function reset() { a = 1; if (dial) dial.set(a, false); draw(); }
  reset();
  return { reset: reset, finish: reset };
});
