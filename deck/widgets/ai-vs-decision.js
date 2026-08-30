/* ============================================================
   widget: ai-vs-decision
   Redrawn from the source deck: the two pipelines side by side —
   AI turns complex data into a well-structured answer, decision
   making turns a formalised problem into an optimal action — and
   the sweep that joins them, which is decision-centric AI.
   ============================================================ */
IE437.widget('ai-vs-decision', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', GREEN = '#16A34A', BLUE = '#2563EB', RED = '#D64545';
  var W = 860, H = 372, step = 0;

  var BANDS = [
    { y: 14, colour: GREEN, tint: 'rgba(22,163,74,.10)',
      lhead: 'complex data', chead: 'Complex Algorithm', rhead: 'Best Decision', core: 'AI',
      left: ['Speech', 'Image', 'Video', 'Text', 'Time series'],
      right: ['Prediction', 'Classification', 'Clustering'] },
    { y: 198, colour: BLUE, tint: 'rgba(37,99,235,.10)',
      lhead: 'Simplified Problem Definition', chead: 'Structured Algorithm', rhead: 'Optimum Decision',
      core: 'Decision Making',
      left: ['Objective', 'Optimization Variable', 'Constraints'],
      right: ['Optimum Design', 'Optimum Planning'] }
  ];

  host.innerHTML =
    '<div class="wbar"><span class="wt">Two pipelines, and what joins them</span><span class="wspacer"></span>' +
    '<button class="wb" data-prev>&lsaquo; back</button>' +
    '<button class="wb" data-next>next &rsaquo;</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="align-items:center;gap:6px">' +
    '<div data-c></div><div class="wcap" data-cap style="min-height:20px;max-width:800px"></div></div>';

  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function arrow(x1, x2, y) {
    E('line', { x1: x1, y1: y, x2: x2 - 9, y2: y, stroke: INK, 'stroke-width': 2.2 }, sv);
    E('path', { d: 'M' + x2 + ' ' + y + 'L' + (x2 - 10) + ' ' + (y - 5) + 'L' + (x2 - 10) + ' ' + (y + 5) + 'Z',
      fill: INK }, sv);
  }

  function band(b, on) {
    var g = E('g', { opacity: on ? 1 : .16 }, sv);
    var top = b.y, hgt = 160;
    E('rect', { x: 24, y: top, width: W - 48, height: hgt, fill: 'none',
      stroke: INK, 'stroke-opacity': .3, 'stroke-width': 1 }, g);
    /* headings */
    E('text', { x: 168, y: top + 26, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700,
      fill: INK, text: b.lhead }, g);
    E('text', { x: 430, y: top + 24, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700,
      fill: INK, text: b.chead }, g);
    E('text', { x: 706, y: top + 26, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700,
      fill: INK, text: b.rhead }, g);
    /* the two columns */
    b.left.forEach(function (t, i) {
      E('text', { x: 168, y: top + 54 + i * 21, 'text-anchor': 'middle', 'font-size': 13.5,
        fill: INK, 'fill-opacity': .82, text: t }, g);
    });
    b.right.forEach(function (t, i) {
      E('text', { x: 706, y: top + 62 + i * 21, 'text-anchor': 'middle', 'font-size': 13.5,
        fill: INK, 'fill-opacity': .82, text: t }, g);
    });
    /* the core box */
    var cy = top + hgt / 2 + 4;
    E('rect', { x: 328, y: top + 42, width: 204, height: 78, rx: 8, fill: b.tint,
      stroke: b.colour, 'stroke-opacity': .35 }, g);
    var words = b.core.split(' ');
    words.forEach(function (w, i) {
      E('text', { x: 430, y: top + 42 + 78 / 2 + 8 - (words.length - 1) * 13 + i * 26,
        'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: b.colour, text: w }, g);
    });
    var ag = E('g', {}, g);
    sv.appendChild(ag);
    arrow(248, 320, cy - 4); arrow(540, 612, cy - 4);
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    band(BANDS[0], true);
    band(BANDS[1], step >= 1);

    if (step >= 1) {
      E('text', { x: 430, y: 190, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700,
        fill: INK, 'fill-opacity': .75, text: '+' }, sv);
    }
    if (step >= 2) {
      /* the sweep from the AI outputs down into the optimum decision */
      E('path', {
        d: 'M 640 46 C 780 60, 800 128, 700 138 C 560 152, 300 150, 246 214 C 210 256, 400 288, 660 292',
        fill: 'none', stroke: RED, 'stroke-width': 6, 'stroke-opacity': .78, 'stroke-linecap': 'round'
      }, sv);
      E('path', { d: 'M 672 292 L 650 284 L 650 300 Z', fill: RED, 'fill-opacity': .78 }, sv);
    }
    var caps = [
      '<b>Artificial intelligence</b> turns complex data into a well-structured answer — prediction, classification, clustering. The task is given; the data is hard.',
      '<b>Decision making</b> turns a formalised problem — objective, variables, constraints — into an optimal action. The data may be easy; the decision is hard.',
      '<b>Decision-centric AI.</b> Feed what AI learns from data into the decision problem, and high-dimensional decisions become reachable that neither could reach alone.'
    ];
    host.querySelector('[data-cap]').innerHTML = caps[step];
  }

  host.querySelector('[data-next]').onclick = function () { step = Math.min(2, step + 1); draw(); };
  host.querySelector('[data-prev]').onclick = function () { step = Math.max(0, step - 1); draw(); };
  host.querySelector('[data-rs]').onclick = function () { step = 0; draw(); };

  draw();
  return { finish: function () { step = 2; draw(); } };
});
