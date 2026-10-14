/* ============================================================
   widget: fgm-stitch                               (Chapter 5, Act 4)
   Structure as knowledge — functional graphical models
   (Grudzien Kuba, Uehara, Abbeel & Levine, AISTATS 2024), drawn.

   mode "graph"   four variables, f = f12(x1,x2) + f23(x2,x3) + f4(x4);
                  cut each variable into ten cells and COUNT what it takes
                  to see every cell: 10^4 = 10,000 for the whole space,
                  10^2 + 10^2 + 10 = 210 for the parts — drawn to the
                  same scale. (An intuition about coverage, not the
                  paper's sample-complexity result.)  -> adds the parts.
   mode "stitch"  two variables, f = g(x1) + h(x2), both peaked at 7.
                  The data saw one row (x2 = 1) and one column (x1 = 1):
                  19 of 100 cells, best observed about 2.0. An additive
                  model predicts every cell from three observed ones,
                     f(i, j) = f(i, 1) + f(1, j) - f(1, 1),
                  and points to (7, 7), never measured, worth about 4.0.
                    0  the data and the best observed design
                    1  the stitched prediction and its choice
                    2  the truth at the choice — and the assumption
   ============================================================ */
IE437.widget('fgm-stitch', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', RED = '#D64545',
      SLATE = '#64748B', PURPLE = '#6D4AFF';
  var MONO = 'IBM Plex Mono, monospace';
  var MODE = opts.mode === 'graph' ? 'graph' : 'stitch';
  var st = 0, N;

  if (MODE === 'graph') {
    N = 1;
    host.innerHTML =
      '<div class="wbar"><span class="wt">Count the cells — the whole space, or its parts</span><span class="wspacer"></span>' +
      '<span class="wlabel">each variable</span><span class="wnum">10 cells</span></div>' +
      '<div class="wbody" style="flex-direction:row;gap:26px;align-items:center;justify-content:center"><div data-c></div></div>';
    var W = 980, H = 300, sv = IE437.svg(W, H);
    host.querySelector('[data-c]').appendChild(sv);
    var drawG = function () {
      while (sv.firstChild) sv.removeChild(sv.firstChild);
      /* the graph */
      var nx = [50, 150, 250, 350], ny = 110, groups = [[0, 1, BLUE], [1, 2, PURPLE]];
      groups.forEach(function (g) {
        E('rect', { x: nx[g[0]] - 30, y: ny - 32 + (g[2] === PURPLE ? 6 : 0), width: nx[g[1]] - nx[g[0]] + 60, height: 64 - (g[2] === PURPLE ? 12 : 0),
          rx: 30, fill: g[2], 'fill-opacity': .08, stroke: g[2], 'stroke-opacity': .5 }, sv);
      });
      E('rect', { x: nx[3] - 30, y: ny - 32, width: 60, height: 64, rx: 30, fill: AMBER, 'fill-opacity': .08, stroke: AMBER, 'stroke-opacity': .5 }, sv);
      [[0, 1], [1, 2]].forEach(function (e) {
        E('line', { x1: nx[e[0]], x2: nx[e[1]], y1: ny, y2: ny, stroke: INK, 'stroke-width': 2 }, sv);
      });
      nx.forEach(function (x, i) {
        E('circle', { cx: x, cy: ny, r: 18, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
        E('text', { x: x, y: ny + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic', fill: INK, text: 'x' + '₁₂₃₄'[i] }, sv);
      });
      E('text', { x: 200, y: 190, 'text-anchor': 'middle', 'font-size': 15, fill: INK, 'font-style': 'italic',
        text: 'f(x) = f₁₂(x₁, x₂) + f₂₃(x₂, x₃) + f₄(x₄)' }, sv);
      E('text', { x: 200, y: 214, 'text-anchor': 'middle', 'font-size': 11, fill: SLATE,
        text: 'an edge joins variables that act together' }, sv);
      /* the count, one square per cell, same scale for both */
      var cs = 2.4, bx = 470, by = 34;
      E('rect', { x: bx, y: by, width: 100 * cs, height: 100 * cs, fill: SLATE, 'fill-opacity': .22, stroke: SLATE, 'stroke-opacity': .6 }, sv);
      E('text', { x: bx, y: by - 10, 'font-size': 12.5, 'font-weight': 700, fill: INK, text: 'to see every cell of the whole space' }, sv);
      E('text', { x: bx + 50 * cs, y: by + 50 * cs + 6, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: INK, 'fill-opacity': .7,
        text: '10⁴ = 10,000' }, sv);
      if (st >= 1) {
        var px = bx + 100 * cs + 40;
        E('text', { x: px, y: by - 10, 'font-size': 12.5, 'font-weight': 700, fill: INK, text: 'to see every cell of each part' }, sv);
        [[BLUE, 10, 10, 'x₁, x₂'], [PURPLE, 10, 10, 'x₂, x₃'], [AMBER, 10, 1, 'x₄']].forEach(function (b, i) {
          var y = by + i * 48;
          E('rect', { x: px, y: y, width: b[1] * cs, height: b[2] * cs, fill: b[0], 'fill-opacity': .3, stroke: b[0] }, sv);
          E('text', { x: px + 34, y: y + 15, 'font-size': 12, fill: INK, text: b[3] + ':  ' + (b[1] * b[2]) + ' cells' }, sv);
        });
        E('text', { x: px, y: by + 170, 'font-size': 20, 'font-weight': 700, fill: GREEN, text: '100 + 100 + 10 = 210' }, sv);
        E('text', { x: px, y: by + 194, 'font-size': 11, fill: SLATE, text: 'the same squares, the same scale' }, sv);
      }
    };
    var showG = function (i) { st = Math.max(0, Math.min(N, i)); drawG(); };
    showG(0);
    return { steps: N, step: showG, reset: function () { showG(0); }, finish: function () { showG(N); } };
  }

  /* ----------------------------- mode "stitch" ----------------------------- */
  N = 2;
  var g = function (i) { return 2 * Math.exp(-0.5 * Math.pow((i - 7) / 1.8, 2)); };
  var f = function (i, j) { return g(i) + g(j); };
  var R = IE437.rng(opts.seed || 5), OBS = {}, i, j;
  for (i = 0; i < 10; i++) OBS[i + ',1'] = f(i, 1) + 0.03 * (2 * R() - 1);
  for (j = 0; j < 10; j++) if (j !== 1) OBS['1,' + j] = f(1, j) + 0.03 * (2 * R() - 1);
  var pred = function (a, b) { return OBS[a + ',1'] + OBS['1,' + b] - OBS['1,1']; };
  var bo = null, bov = -1e9; Object.keys(OBS).forEach(function (key) { if (OBS[key] > bov) { bov = OBS[key]; bo = key; } });
  var pi = 0, pj = 0, pv = -1e9;
  for (i = 0; i < 10; i++) for (j = 0; j < 10; j++) if (pred(i, j) > pv) { pv = pred(i, j); pi = i; pj = j; }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Predict a design no one has measured, from its parts</span><span class="wspacer"></span>' +
    '<span class="wlabel">assumed</span><span class="wnum">f = g(x₁) + h(x₂)</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:26px;align-items:center;justify-content:center">' +
    '<div data-c></div><div data-note style="width:330px;font:400 13.5px/1.6 var(--sans);color:var(--ink2)"></div></div>';
  var CS = 27, GX0 = 46, GY0 = 14, sv2 = IE437.svg(GX0 + 10 * CS + 20, GY0 + 10 * CS + 40);
  host.querySelector('[data-c]').appendChild(sv2);
  var col = function (v) { var t = Math.max(0, Math.min(1, v / 4)); return 'rgba(37,99,235,' + (0.06 + 0.8 * t).toFixed(3) + ')'; };
  var CX = function (a) { return GX0 + a * CS; }, CY = function (b) { return GY0 + (9 - b) * CS; };
  var drawS = function () {
    while (sv2.firstChild) sv2.removeChild(sv2.firstChild);
    for (i = 0; i < 10; i++) for (j = 0; j < 10; j++) {
      var key = i + ',' + j, seen = key in OBS, fill;
      if (seen) fill = col(OBS[key]);
      else if (st >= 1) fill = col(pred(i, j));
      else fill = '#fff';
      E('rect', { x: CX(i), y: CY(j), width: CS - 2, height: CS - 2, rx: 3, fill: fill,
        stroke: seen ? INK : 'rgba(22,24,29,.12)', 'stroke-width': seen ? 1.4 : 1, 'stroke-dasharray': seen || st >= 1 ? '' : '2 2' }, sv2);
    }
    for (i = 0; i < 10; i++) {
      E('text', { x: CX(i) + CS / 2 - 1, y: CY(-1) + 14, 'text-anchor': 'middle', 'font-size': 9, fill: INK, 'fill-opacity': .5, 'font-family': MONO, text: i }, sv2);
      E('text', { x: GX0 - 8, y: CY(i) + CS / 2 + 3, 'text-anchor': 'end', 'font-size': 9, fill: INK, 'fill-opacity': .5, 'font-family': MONO, text: i }, sv2);
    }
    E('text', { x: GX0 + 5 * CS, y: GY0 + 10 * CS + 32, 'text-anchor': 'middle', 'font-size': 11, 'font-style': 'italic', fill: INK, 'fill-opacity': .6, text: 'x₁' }, sv2);
    E('text', { x: 12, y: GY0 + 5 * CS, 'text-anchor': 'middle', 'font-size': 11, 'font-style': 'italic', fill: INK, 'fill-opacity': .6, text: 'x₂' }, sv2);
    var b = bo.split(',').map(Number);
    E('rect', { x: CX(b[0]) - 2, y: CY(b[1]) - 2, width: CS + 2, height: CS + 2, rx: 4, fill: 'none', stroke: AMBER, 'stroke-width': 3 }, sv2);
    if (st >= 1) {
      [[pi, 1], [1, pj], [1, 1]].forEach(function (c, n) {
        E('line', { x1: CX(pi) + CS / 2, y1: CY(pj) + CS / 2, x2: CX(c[0]) + CS / 2, y2: CY(c[1]) + CS / 2,
          stroke: n < 2 ? GREEN : RED, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', 'stroke-opacity': .8 }, sv2);
      });
      E('rect', { x: CX(pi) - 2, y: CY(pj) - 2, width: CS + 2, height: CS + 2, rx: 4, fill: 'none', stroke: GREEN, 'stroke-width': 3 }, sv2);
      E('text', { x: CX(pi) + CS / 2 - 1, y: CY(pj) + CS / 2 + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff', text: '★' }, sv2);
    }
    if (st >= 2) E('text', { x: CX(pi) + CS + 4, y: CY(pj) + CS / 2 + 4, 'font-size': 11, 'font-weight': 700, fill: GREEN, text: '✓ ' + f(pi, pj).toFixed(1) }, sv2);
    var nObs = Object.keys(OBS).length;
    host.querySelector('[data-note]').innerHTML = [
      'The data saw one row and one column — <b>' + nObs + ' of 100</b> designs (outlined). The best of them (amber) is worth about <b>' + bov.toFixed(1) +
        '</b>. Without structure, the other ' + (100 - nObs) + ' cells are simply unknown.',
      'If f really is a sum of a part in x₁ and a part in x₂, any cell follows from three observed ones:<br><span style="font-family:var(--mono);font-size:12px">f(i, j) = f(i, 1) + f(1, j) − f(1, 1)</span><br>The stitched surface points to the <b style="color:' + GREEN + '">★</b>, a design <b>no one measured</b>.',
      'Its true value is about <b>' + f(pi, pj).toFixed(1) + '</b> — twice the best design in the data. That is the whole promise of structure, and its whole assumption: had x₁ and x₂ <b>interacted</b>, the stitched value would be wrong.'
    ][st];
  };
  var show = function (k) { st = Math.max(0, Math.min(N, k)); drawS(); };
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
