/* ============================================================
   widget: discount-dial
   gamma is not bookkeeping — it changes the answer.

   A corridor of eight cells.  Cell 0 is terminal and pays +1;
   cell 7 is terminal and pays +10.  From the interior cell j,
   going left reaches the small prize in j steps and going right
   reaches the large one in 7-j steps, so the two action values are

        Q(j, left)  = gamma^(j-1) * 1
        Q(j, right) = gamma^(6-j) * 10

   and cell j flips at gamma = 10^(1/(2j-7)):  cell 3 at 0.100,
   cell 2 at 10^(-1/3) = 0.4642, cell 1 at 10^(-1/5) = 0.6310.
   Cells 4-6 never point left.  The frontier therefore sweeps
   leftwards as gamma rises; the values below are solved for by
   value iteration, not by the closed form, so the picture is a
   check on the algebra rather than a restatement of it.
   ============================================================ */
IE437.widget('discount-dial', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', SLATE = '#64748B';
  var NC = 8, LEFT_PRIZE = 1, RIGHT_PRIZE = 10;
  var GAMMAS = [0.10, 0.25, 0.35, 0.45, 0.50, 0.60, 0.65, 0.75, 0.85, 0.95];
  var gi = 4;                                           /* 0.50 — start on the myopic side */
  for (var i = 0; i < GAMMAS.length; i++) if (Math.abs(GAMMAS[i] - (opts.gamma || 0.5)) < 0.06) gi = i;

  var term = function (s) { return s === 0 || s === NC - 1; };
  var prize = function (s) { return s === 0 ? LEFT_PRIZE : s === NC - 1 ? RIGHT_PRIZE : 0; };

  function solve(g) {                                   /* value iteration on the corridor */
    var V = new Array(NC), s, k;
    for (s = 0; s < NC; s++) V[s] = 0;
    for (k = 0; k < 4000; k++) {
      var W = V.slice(), d = 0;
      for (s = 1; s < NC - 1; s++) {
        var m = -1e18;
        for (var dir = -1; dir <= 1; dir += 2) {
          var ns = s + dir;
          m = Math.max(m, prize(ns) + (term(ns) ? 0 : g * V[ns]));
        }
        d = Math.max(d, Math.abs(m - V[s])); W[s] = m;
      }
      V = W; if (d < 1e-13) break;
    }
    var pol = [];
    for (s = 1; s < NC - 1; s++) {
      var qL = prize(s - 1) + (term(s - 1) ? 0 : g * V[s - 1]);
      var qR = prize(s + 1) + (term(s + 1) ? 0 : g * V[s + 1]);
      pol.push(qR > qL + 1e-12 ? 1 : -1);
    }
    return { V: V, pol: pol };
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">The same MDP, two different answers</span><span class="wspacer"></span>' +
    '<span data-sl></span><button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0">' +
    '<div class="wlabel">optimal value, and the optimal move out of each cell</div>' +
    '<div data-corr></div>' +
    '<div data-read style="font:400 12px/1.6 var(--sans);color:var(--ink3);text-align:center"></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">' +
    '<div class="wlabel">the two action values at the start cell</div><div data-ch></div></div></div>';

  var CW = 470, CH = 176, CELL = 54, X0 = 12, ROWY = 116;
  var corr = IE437.svg(CW, CH);
  host.querySelector('[data-corr]').appendChild(corr);
  var PW = 268, PH = 214, plot = IE437.svg(PW, PH);
  host.querySelector('[data-ch]').appendChild(plot);

  function drawCorridor(g, r) {
    while (corr.firstChild) corr.removeChild(corr.firstChild);
    var maxV = RIGHT_PRIZE, BARH = 78;
    for (var s = 0; s < NC; s++) {
      var x = X0 + s * CELL, v = term(s) ? prize(s) : r.V[s];
      /* value bar */
      var h = Math.max(1.5, BARH * v / maxV);
      E('rect', { x: x + 9, y: ROWY - 8 - h, width: CELL - 18, height: h,
        fill: term(s) ? (s === 0 ? AMBER : GREEN) : BLUE,
        'fill-opacity': term(s) ? .38 : .26, stroke: 'none' }, corr);
      E('text', { x: x + CELL / 2, y: ROWY - 13 - h, 'text-anchor': 'middle', 'font-size': 10,
        'font-family': 'IBM Plex Mono, monospace', fill: 'currentColor', 'fill-opacity': .55,
        text: v.toFixed(v >= 10 ? 0 : 2) }, corr);
      /* the cell */
      E('rect', { x: x, y: ROWY, width: CELL, height: 42,
        fill: term(s) ? (s === 0 ? AMBER : GREEN) : 'none', 'fill-opacity': term(s) ? .14 : 0,
        stroke: 'currentColor', 'stroke-opacity': .24 }, corr);
      if (term(s)) {
        E('text', { x: x + CELL / 2, y: ROWY + 27, 'text-anchor': 'middle', 'font-size': 14,
          'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace',
          fill: s === 0 ? AMBER : GREEN, text: '+' + prize(s) }, corr);
      } else {
        var d = r.pol[s - 1];
        E('text', { x: x + CELL / 2, y: ROWY + 29, 'text-anchor': 'middle', 'font-size': 19,
          fill: d > 0 ? GREEN : AMBER, 'fill-opacity': .95, text: d > 0 ? '→' : '←' }, corr);
      }
    }
    /* the start marker */
    E('text', { x: X0 + 1 * CELL + CELL / 2, y: ROWY + 56, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: 'currentColor', 'fill-opacity': .5,
      text: 'START' }, corr);
  }

  function drawPlot(g) {
    var lo = 0.05, hi = 0.95, N = 180, pts = [], k;
    for (k = 0; k <= N; k++) {
      var x = lo + (hi - lo) * k / N;
      pts.push([x, Math.pow(x, 5) * RIGHT_PRIZE]);
    }
    var ax = IE437.plot(plot, {
      w: PW, h: PH, pad: { l: 34, r: 10, t: 12, b: 30 },
      xdom: [lo, hi], ydom: [0, 8], xticks: [0.2, 0.4, 0.631, 0.8],
      yticks: [0, 2, 4, 6, 8], xlabel: 'discount', xfmt: function (v) { return v.toFixed(2); },
      series: [
        { pts: [[lo, LEFT_PRIZE], [hi, LEFT_PRIZE]], color: AMBER, w: 1.9 },
        { pts: pts, color: GREEN, w: 1.9 }
      ]
    });
    var gc = Math.pow(10, -1 / 5);
    E('line', { x1: ax.X(gc), x2: ax.X(gc), y1: 12, y2: PH - 30, stroke: INK,
      'stroke-opacity': .3, 'stroke-dasharray': '3 3' }, plot);
    E('text', { x: ax.X(gc) + 4, y: 40, 'font-size': 9.5, 'font-family': 'IBM Plex Mono, monospace',
      fill: INK, 'fill-opacity': .6, text: 'flips at 0.631' }, plot);
    E('line', { x1: ax.X(g), x2: ax.X(g), y1: 12, y2: PH - 30, stroke: BLUE, 'stroke-width': 1.6 }, plot);
    E('circle', { cx: ax.X(g), cy: ax.Y(Math.pow(g, 5) * RIGHT_PRIZE), r: 3.2, fill: GREEN }, plot);
    E('circle', { cx: ax.X(g), cy: ax.Y(LEFT_PRIZE), r: 3, fill: AMBER }, plot);
    E('text', { x: 40, y: ax.Y(LEFT_PRIZE) - 7, 'text-anchor': 'start', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: AMBER, text: 'go left, 1 step' }, plot);
    E('text', { x: 40, y: 22, 'text-anchor': 'start', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: GREEN, text: 'go right, 6 steps' }, plot);
  }

  function draw() {
    var g = GAMMAS[gi], r = solve(g);
    drawCorridor(g, r); drawPlot(g);
    var right = 0; for (var i = 0; i < r.pol.length; i++) if (r.pol[i] > 0) right++;
    host.querySelector('[data-read]').innerHTML =
      '<b>' + right + ' of 6</b> cells head for the large prize &nbsp;·&nbsp; ' +
      'from START the optimal move is <b style="color:' + (r.pol[0] > 0 ? GREEN : AMBER) + '">' +
      (r.pol[0] > 0 ? 'right — six steps to +10' : 'left — one step to +1') + '</b>';
  }
  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    label: 'discount', min: 0, max: GAMMAS.length - 1, step: 1, value: gi,
    fmt: function (i) { return 'γ = ' + GAMMAS[i].toFixed(2); },
    on: function (i) { gi = i; draw(); }
  });
  host.querySelector('[data-rs]').onclick = function () { dial.set(4); };
  /* keep the dial stops clear of the exact thresholds 10^(-1/3)=0.4642 and 10^(-1/5)=0.6310,
     so no frame of this widget ever sits on a knife-edge tie. */

  draw();
  return { finish: function () { gi = 8; draw(); } };   /* 0.85 — the patient answer, for the printed page */
});
