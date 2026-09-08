/* ============================================================
   widget: bayes-anatomy
   Redrawn from the source deck: the one picture the equation
   cannot carry — a flat prior going in on the left, a peaked
   posterior coming out on the right, and between them the two
   operations the rule performs. The equation itself and the four
   definitions are typeset in the markdown, as maths and a table,
   so they set exactly like every other formula in the course.
   ============================================================ */
IE437.widget('bayes-anatomy', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706';
  var W = 760, H = 138;

  host.innerHTML = '<div class="wbody" style="align-items:center;padding:12px 14px"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  /* one small density panel: a curve on a baseline, its name beneath */
  function panel(x0, fn, colour, name, formula, gloss) {
    var w = 216, h = 78, top = 8, pts = [];
    for (var i = 0; i <= 80; i++) {
      var t = i / 80;
      pts.push([x0 + 6 + t * (w - 12), top + h - 4 - fn(t) * (h - 14)]);
    }
    E('path', {
      d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') +
         'L' + (x0 + w - 6) + ' ' + (top + h - 4) + 'L' + (x0 + 6) + ' ' + (top + h - 4) + 'Z',
      fill: colour, 'fill-opacity': .13, stroke: colour, 'stroke-width': 2, 'stroke-linejoin': 'round'
    }, sv);
    E('line', { x1: x0, y1: top + h - 4, x2: x0 + w, y2: top + h - 4, stroke: INK, 'stroke-opacity': .32 }, sv);
    E('text', { x: x0 + w + 3, y: top + h, 'font-size': 11, 'font-style': 'italic', fill: INK,
      'fill-opacity': .55, text: 'θ' }, sv);
    var nm = E('text', { x: x0, y: top + h + 22, 'font-size': 13, 'font-weight': 700, fill: colour, text: name }, sv);
    /* measure the name once it is in the tree, so the formula sits a fixed gap after it */
    var nw = 0; try { nw = nm.getComputedTextLength(); } catch (e) { nw = name.length * 7; }
    E('text', { x: x0 + nw + 9, y: top + h + 22, 'font-size': 13, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .72, text: formula }, sv);
    E('text', { x: x0, y: top + h + 40, 'font-size': 11.5, fill: INK, 'fill-opacity': .55, text: gloss }, sv);
  }

  panel(24, function (t) { return (t > 0.04 && t < 0.96) ? 0.5 : 0; }, AMBER,
    'prior', 'p(θ)', 'before the data: every θ about as plausible');
  panel(W - 24 - 216, function (t) { return Math.exp(-Math.pow((t - 0.62) / 0.11, 2)); }, BLUE,
    'posterior', 'p(θ | data)', 'after the data: the candidates reweighted');

  /* the arrow between them, carrying the two operations of the rule */
  var ax = 286, bx = W - 286, ay = 48;
  E('line', { x1: ax, y1: ay, x2: bx - 10, y2: ay, stroke: INK, 'stroke-width': 2 }, sv);
  E('path', { d: 'M' + bx + ' ' + ay + 'L' + (bx - 11) + ' ' + (ay - 5.5) + 'L' + (bx - 11) + ' ' + (ay + 5.5) + 'Z',
    fill: INK }, sv);
  E('text', { x: (ax + bx) / 2, y: ay - 12, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700,
    fill: GREEN, text: '× likelihood  p(data | θ)' }, sv);
  E('text', { x: (ax + bx) / 2, y: ay + 20, 'text-anchor': 'middle', 'font-size': 12.5, fill: INK,
    'fill-opacity': .6, text: '÷ evidence  p(data)' }, sv);
  E('text', { x: (ax + bx) / 2, y: ay + 40, 'text-anchor': 'middle', 'font-size': 11.5, fill: INK,
    'fill-opacity': .5, text: 'the data enter only here' }, sv);

  return {};
});
