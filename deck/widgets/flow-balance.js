/* ============================================================
   widget: flow-balance                       (Chapter 6, appendix)
   GFlowNet's target, P(x) = R(x) / Z, on the smallest graph where a
   policy over steps goes wrong: a design is a pair of parts, built
   one part at a time, and AB can be built in two orders.

     designs  AA, AB, BB        rewards R = 1, 2, 1     Z = 4
     target   P = R / Z = 25%, 50%, 25%

     0  the building graph, the rewards and the target
     1  first try: weight each building order by the reward of the
        design it ends at -> orders 1, 2, 2, 1 of 6 -> AB gets 4/6 = 67%
     2  flows: into a finished design flows R(x); through a partial
        design, in = out. F(start->A) = F(start->B) = 2, every last step
        1. The policy steps by the share of the outflow:
        P(AB) = 2/4 x 1/2 + 2/4 x 1/2 = 1/2 -> 25%, 50%, 25%, the target
   (This balanced set of flows is one of many; every balanced set gives
   the same P(x). tests/paper-selection.mjs recomputes the numbers.)
   ============================================================ */
IE437.widget('flow-balance', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', SLATE = '#64748B', BLUE = '#2563EB', RED = '#D64545', AMBER = '#B45309';
  var MONO = 'IBM Plex Mono, monospace';

  /* the graph: nodes and the steps between them */
  var NODE = {
    s: { x: 44, y: 117, t: 'start' },
    A: { x: 176, y: 80, t: 'A' }, B: { x: 176, y: 154, t: 'B' },
    AA: { x: 312, y: 43, t: 'AA' }, AB: { x: 312, y: 117, t: 'AB' }, BB: { x: 312, y: 191, t: 'BB' }
  };
  var DESIGNS = ['AA', 'AB', 'BB'], R = { AA: 1, AB: 2, BB: 1 };
  var STEPS = [['s', 'A'], ['s', 'B'], ['A', 'AA'], ['A', 'AB'], ['B', 'AB'], ['B', 'BB']];
  var FLOW = { 'A>AA': 1, 'A>AB': 1, 'B>AB': 1, 'B>BB': 1 };
  FLOW['s>A'] = FLOW['A>AA'] + FLOW['A>AB'];                       /* in = out at A */
  FLOW['s>B'] = FLOW['B>AB'] + FLOW['B>BB'];
  var Z = FLOW['s>A'] + FLOW['s>B'];
  function out(n) {                                                /* total flow leaving node n */
    return STEPS.reduce(function (t, e) { return e[0] === n ? t + FLOW[e[0] + '>' + e[1]] : t; }, 0);
  }
  function pi(a, b) { return FLOW[a + '>' + b] / out(a); }         /* the policy: share of the outflow */
  var target = DESIGNS.map(function (d) { return R[d] / Z; });
  /* first try: every building order weighted by the reward of the design it ends at */
  var ORDERS = [['A', 'AA'], ['A', 'AB'], ['B', 'AB'], ['B', 'BB']];
  var orderSum = ORDERS.reduce(function (t, o) { return t + R[o[1]]; }, 0);
  var naive = DESIGNS.map(function (d) {
    return ORDERS.reduce(function (t, o) { return o[1] === d ? t + R[d] : t; }, 0) / orderSum;
  });
  var flowP = DESIGNS.map(function (d) {
    return ORDERS.reduce(function (t, o) { return o[1] === d ? t + pi('s', o[0]) * pi(o[0], d) : t; }, 0);
  });

  var N = 2, st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">Draw designs in proportion to reward: why GFlowNet needs flows</span>' +
    '<span class="wspacer"></span><span class="wlabel">target</span><span class="wnum">P(x) = R(x) / Z</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:300px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  var W = 610, H = 208, BW = 58, BH = 28;
  var RX = 392, PX = 432, PS = 220;                               /* reward column, bar start, bar scale */
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  function txt(x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 11, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }
  function box(n, col, strong) {
    var p = NODE[n];
    E('rect', { x: p.x - BW / 2, y: p.y - BH / 2, width: BW, height: BH, rx: 6, fill: '#fff',
      stroke: col, 'stroke-width': strong ? 2 : 1.2, 'stroke-opacity': strong ? 1 : .55 }, sv);
    txt(p.x, p.y + 5, p.t, { 'text-anchor': 'middle', 'font-size': n === 's' ? 12 : 14, 'font-weight': 700,
      fill: n === 's' ? SLATE : INK, 'font-family': n === 's' ? '' : MONO });
  }
  function arrow(a, b, col, w, label, lcol) {
    var p = NODE[a], q = NODE[b];
    var x1 = p.x + BW / 2, y1 = p.y, x2 = q.x - BW / 2 - 2, y2 = q.y;
    var ang = Math.atan2(y2 - y1, x2 - x1), h = 7 + w;
    E('line', { x1: x1, y1: y1, x2: x2 - h * .8 * Math.cos(ang), y2: y2 - h * .8 * Math.sin(ang),
      stroke: col, 'stroke-width': w, 'stroke-opacity': .75 }, sv);
    E('path', { d: 'M' + x2 + ' ' + y2 +
      'L' + (x2 - h * Math.cos(ang - .4)) + ' ' + (y2 - h * Math.sin(ang - .4)) +
      'L' + (x2 - h * Math.cos(ang + .4)) + ' ' + (y2 - h * Math.sin(ang + .4)) + 'Z', fill: col, 'fill-opacity': .8 }, sv);
    if (label) {
      var f = b === 'AB' ? .3 : .5;                                 /* the two steps into AB: label near their source */
      var mx = x1 + f * (x2 - x1), my = y1 + f * (y2 - y1), up = y2 <= y1;
      txt(mx, my + (up ? -8 : 16), label, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700,
        fill: lcol, 'font-family': MONO });
    }
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    txt(4, 12, 'build one part at a time', { 'font-size': 12, 'font-weight': 700 });
    txt(4, 25, 'states s, steps s → s′', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(RX, 12, 'reward', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: AMBER });
    txt(RX, 25, 'R(x)', { 'text-anchor': 'middle', 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(PX, 12, 'how often x is drawn', { 'font-size': 12, 'font-weight': 700 });
    txt(PX, 25, 'P(x) · dashed: target R(x)/Z', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });

    STEPS.forEach(function (e) {
      var k = e[0] + '>' + e[1], f = FLOW[k];
      if (st === 0) arrow(e[0], e[1], e[1] === 'AB' ? INK : SLATE, e[1] === 'AB' ? 2 : 1.2);
      else if (st === 1) arrow(e[0], e[1], e[0] === 's' ? SLATE : RED, e[0] === 's' ? 1.2 : 1.2 + R[e[1]],
        e[0] === 's' ? '' : String(R[e[1]]), RED);
      else arrow(e[0], e[1], BLUE, 1 + 1.4 * f, String(f), BLUE);
    });
    Object.keys(NODE).forEach(function (n) {
      var fin = DESIGNS.indexOf(n) >= 0;
      box(n, fin ? BLUE : INK, fin);
    });
    if (st === 0) txt(NODE.AB.x, NODE.AB.y + 29, 'two orders', { 'text-anchor': 'middle', 'font-size': 11,
      'font-weight': 700 });
    if (st === 2) {
      txt(NODE.s.x, NODE.s.y + 32, 'out: Z = ' + Z, { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700,
        fill: BLUE, 'font-family': MONO });
      txt(NODE.A.x, NODE.A.y - 22, 'in ' + FLOW['s>A'] + ' = out ' + FLOW['A>AA'] + '+' + FLOW['A>AB'],
        { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: BLUE, 'font-family': MONO });
      txt(NODE.B.x - 14, NODE.B.y + 30, 'in ' + FLOW['s>B'] + ' = out ' + FLOW['B>AB'] + '+' + FLOW['B>BB'],
        { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: BLUE, 'font-family': MONO });
    }

    var cur = st === 1 ? naive : st === 2 ? flowP : null, col = st === 1 ? RED : BLUE;
    DESIGNS.forEach(function (d, i) {
      var y = NODE[d].y;
      txt(RX, y + 6, String(R[d]), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: AMBER,
        'font-family': MONO });
      E('rect', { x: PX, y: y - 13, width: PS * target[i], height: 26, fill: 'none', stroke: INK,
        'stroke-opacity': .5, 'stroke-dasharray': '4 3' }, sv);
      if (cur) {
        E('rect', { x: PX, y: y - 9, width: PS * cur[i], height: 18, fill: col, 'fill-opacity': .8 }, sv);
        txt(PX + PS * Math.max(cur[i], target[i]) + 6, y + 5, Math.round(cur[i] * 100) + '%',
          { 'font-size': 13, 'font-weight': 700, fill: col, 'font-family': MONO });
      } else txt(PX + PS * target[i] + 6, y + 5, Math.round(target[i] * 100) + '%',
        { 'font-size': 12, 'fill-opacity': .6, 'font-family': MONO });
    });
  }

  function show(i) {
    st = Math.max(0, Math.min(N, i));
    draw();
    host.querySelector('[data-note]').innerHTML = [
      'A design is a pair of parts, built one part at a time from the empty start. ' +
      '<b>AB can be built in two orders</b>: A first, or B first.<br>' +
      'R(x), the reward of a finished design: AA 1, AB 2, BB 1. ' +
      'The goal: draw each design with probability P(x) = R(x)/Z, where Z = 1 + 2 + 1 = 4 — so 25%, 50%, 25%.',
      'First try: weight each building order by the reward of the design it ends at — 1, 2, 2, 1, of 6 in all.<br>' +
      'AB collects 2 + 2 = 4 of 6 = <b style="color:#D64545">67%</b>, not 50%. ' +
      '==A design is over-drawn once per extra building order.==',
      'Put a flow F(s → s′) on every step. Into a finished design flows its reward R(x); ' +
      'through a partial one, <b>in = out</b>: A takes in 2, passes on 1 + 1.<br>' +
      'The sampler steps by the share of the outflow: A with 2/4, then AB with 1/2. ' +
      'P(AB) = 2/4 × 1/2 + 2/4 × 1/2 = 1/2. ==Every design comes out at exactly R(x)/Z.=='
    ][st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
