/* ============================================================
   widget: course-cube
   The course map, redrawn from the original lecture deck: a 3-D
   wireframe cube in oblique projection, with the model-based plane
   below and the data-driven plane above, and the three coloured
   axes — multi stages, multi agents, data-driven — leaving the
   origin at "Optimization".  Stepping walks the numbered route
   that IE437 actually takes through it.
   ============================================================ */
IE437.widget('course-cube', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', GREEN = '#16A34A', GREY = 'rgba(22,24,29,.34)';

  /* oblique projection, proportions taken from the source slide */
  var W = 780, H = 392;
  var O = [112, 332];                       // Optimization
  var AX = [276, 0];                        // multi stages   (blue)
  var AY = [0, -146];                       // data-driven    (green)
  var AZ = [104, -104];                     // multi agents   (red)
  var EXT = 186;                            // how far the two planes run past the cube
  var P = function (i, j, k) { return [O[0] + i * AX[0] + j * AY[0] + k * AZ[0],
                                       O[1] + i * AX[1] + j * AY[1] + k * AZ[1]]; };

  /* i = stages, j = data-driven, k = agents */
  var V = [
    { i: 0, j: 0, k: 0, lec: 'Lec 1', name: ['Optimization'], at: 'below' },
    { i: 1, j: 0, k: 0, lec: 'Lec 7 · 9', name: ['Markov Decision Process', 'Optimal Control'], at: 'below-r' },
    { i: 0, j: 1, k: 0, lec: 'Lec 2–6', name: ['Model-free', 'Optimization'], at: 'left' },
    { i: 1, j: 1, k: 0, lec: 'Lec 8 · 10 · 11', name: ['Reinforcement Learning'], at: 'above' },
    { i: 0, j: 0, k: 1, lec: '', name: ['Static Game'], at: 'right', muted: 1 },
    { i: 1, j: 0, k: 1, lec: 'IE579', name: ['Markov Game', 'Stochastic Game', 'Differential Game'], at: 'right', muted: 1 },
    { i: 0, j: 1, k: 1, lec: '', name: ['Learning in', 'Repeated Games'], at: 'above', muted: 1 },
    { i: 1, j: 1, k: 1, lec: 'IE579', name: ['Multi-agent', 'Reinforcement Learning'], at: 'above-r', muted: 1 }
  ];
  var vkey = function (v) { return v.i + ',' + v.j + ',' + v.k; };

  /* the route IE437 takes, numbered as in the source deck */
  var STEPS = [
    { badges: [], axis: null, cap: 'Any decision problem sits somewhere in this cube. Three axes, eight cells — and the course is a tour of it.' },
    { badges: [[0, 0, 0]], axis: null, cap: '<b>①  Optimization.</b> One decision, a known objective, no rivals — the origin. <i>Lecture 1.</i>' },
    { badges: [[0, 0, 0], [0, 1, 0]], axis: 'Y', from: [0, 0, 0], cap: '<b>②  Model-free optimization.</b> Up the <b>data-driven</b> axis: the objective <i>f</i> becomes unknown. <b>One</b> unknown to learn. <i>Lectures 2–6.</i>' },
    { badges: [[0, 0, 0], [0, 1, 0], [1, 0, 0]], axis: 'X', from: [0, 0, 0], cap: '<b>③  MDP and optimal control.</b> Along <b>multi stages</b>: decisions unfold in time, and the model is handed back. <i>Lectures 7 and 9.</i>' },
    { badges: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]], axis: 'Y', from: [1, 0, 0], cap: '<b>④  Reinforcement learning.</b> The data-driven axis again — but now <b>two</b> unknowns, reward <i>r</i> and transition <i>P</i>. The count doubles. <i>Lectures 8, 10, 11.</i>' },
    { badges: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0], [1, 1, 0]], axis: null, cap: '<b>⑤  And then the interaction goes too.</b> Same cell, but the right to try is withdrawn: only a fixed log of someone else&rsquo;s decisions. <i>Lecture 12 — offline RL.</i>' },
    { badges: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]], axis: 'Z', from: [1, 1, 0], dash: 1, cap: '<b>The far face is not ours.</b> Cross <b>multi agents</b> and the optimum becomes an <b>equilibrium</b> — the subject of <b>IE579</b>, Game Theory and Multi-Agent RL. This course stops at the near face.' }
  ];
  var step = 0, timer = null;

  host.innerHTML =
    '<div class="wbar"><span class="wt">The cube &mdash; every lecture, one map</span><span class="wspacer"></span>' +
    '<span class="wlabel">step</span><span class="wnum" data-n></span>' +
    '</div>' +
    '<div class="wbody" style="align-items:center;gap:6px">' +
    '<div data-c></div><div class="wcap" data-cap style="min-height:30px;max-width:900px"></div></div>';

  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function line(a, b, o) {
    E('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1],
      stroke: o.c || GREY, 'stroke-width': o.w || 1,
      'stroke-dasharray': o.d || '', 'stroke-opacity': o.op === undefined ? 1 : o.op }, sv);
  }
  function arrow(a, b, colour, label, live) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    var x1 = a[0] + ux * 6, y1 = a[1] + uy * 6, x2 = b[0] - ux * 5, y2 = b[1] - uy * 5;
    var op = live ? 1 : .22;
    E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: colour, 'stroke-width': live ? 3 : 2,
      'stroke-opacity': op, 'stroke-linecap': 'round' }, sv);
    var a2 = Math.atan2(dy, dx);
    E('path', {
      d: 'M' + x2 + ' ' + y2 +
         'L' + (x2 - 12 * Math.cos(a2 - .38)) + ' ' + (y2 - 12 * Math.sin(a2 - .38)) +
         'L' + (x2 - 12 * Math.cos(a2 + .38)) + ' ' + (y2 - 12 * Math.sin(a2 + .38)) + 'Z',
      fill: colour, 'fill-opacity': op
    }, sv);
    if (label) {
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, deg = a2 * 180 / Math.PI;
      if (deg > 90 || deg < -90) deg += 180;
      E('text', { x: mx, y: my - 7, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700,
        fill: colour, 'fill-opacity': live ? 1 : .3, transform: 'rotate(' + deg.toFixed(1) + ' ' + mx + ' ' + (my - 7) + ')',
        text: label }, sv);
    }
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var s = STEPS[step];
    /* two stops can share a cell — Lecture 12 sits where Lecture 8 already is */
    var badge = {};
    s.badges.forEach(function (b, n) {
      var k = b.join(',');
      badge[k] = badge[k] ? badge[k] + '·' + (n + 1) : String(n + 1);
    });

    /* the two decision-making planes, running past the cube as in the source */
    [[0, 'rgba(37,99,235,.07)', BLUE, 'Model based Decision Making'],
     [1, 'rgba(22,163,74,.07)', GREEN, 'Data-Driven Decision Making']].forEach(function (pl) {
      var j = pl[0];
      var a = P(0, j, 0), b = P(1, j, 0), c = P(1, j, 1), d = P(0, j, 1);
      E('path', {
        d: 'M' + a[0] + ' ' + a[1] + 'L' + (b[0] + EXT) + ' ' + b[1] +
           'L' + (c[0] + EXT) + ' ' + c[1] + 'L' + d[0] + ' ' + d[1] + 'Z',
        fill: pl[1], stroke: pl[2], 'stroke-opacity': .16, 'stroke-width': 1
      }, sv);
      E('text', { x: c[0] + EXT - 14, y: (b[1] + c[1]) / 2 + 4, 'text-anchor': 'end',
        'font-size': 12, 'font-weight': 700, fill: pl[2], 'fill-opacity': .85, text: pl[3] }, sv);
    });

    /* the twelve edges — anything touching the far face is dashed */
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) {
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (d) {
        if (i + d[0] > 1 || j + d[1] > 1 || k + d[2] > 1) return;
        var far = (k === 1 || d[2] === 1);
        line(P(i, j, k), P(i + d[0], j + d[1], k + d[2]),
          { c: INK, w: 1, op: far ? .22 : .34, d: far ? '5 4' : '' });
      });
    }

    /* the three axes, live one in full colour */
    arrow(P(0, 0, 0), P(1, 0, 0), BLUE, 'Multi stages', s.axis === 'X' && !s.from[1] && !s.from[2]);
    arrow(P(0, 0, 0), P(0, 1, 0), GREEN, 'Data-driven', s.axis === 'Y' && !s.from[0]);
    arrow(P(0, 0, 0), P(0, 0, 1), RED, 'Multi agents', s.axis === 'Z' && !s.from[0]);
    /* the crossing being made this step, when it is a parallel edge rather than an axis */
    if (s.axis && s.from && (s.from[0] || s.from[1] || s.from[2])) {
      var f = s.from.slice(), t = s.from.slice();
      if (s.axis === 'X') t[0] = 1; if (s.axis === 'Y') t[1] = 1; if (s.axis === 'Z') t[2] = 1;
      arrow(P(f[0], f[1], f[2]), P(t[0], t[1], t[2]),
        s.axis === 'X' ? BLUE : s.axis === 'Y' ? GREEN : RED, null, true);
      if (s.axis === 'Z') arrow(P(1, 1, 0), P(1, 1, 1), RED, null, true);
    }

    /* vertices and their labels */
    V.forEach(function (v) {
      var p = P(v.i, v.j, v.k), k = vkey(v), on = badge[k] !== undefined;
      E('circle', { cx: p[0], cy: p[1], r: 3.4, fill: INK, 'fill-opacity': v.muted ? .22 : .7 }, sv);
      var ax = p[0], ay = p[1], anchor = 'middle';
      if (v.at === 'below') { ay = p[1] + 24; }
      else if (v.at === 'below-r') { ax = p[0] + 12; ay = p[1] + 22; anchor = 'start'; }
      else if (v.at === 'left') { ax = p[0] - 14; ay = p[1] - 4; anchor = 'end'; }
      else if (v.at === 'right') { ax = p[0] + 14; ay = p[1] - 2; anchor = 'start'; }
      else if (v.at === 'above') { ay = p[1] - 38 - (v.name.length - 1) * 14; }
      else if (v.at === 'above-r') { ax = p[0] + 10; ay = p[1] - 38 - (v.name.length - 1) * 14; anchor = 'start'; }
      v.name.forEach(function (t, n) {
        E('text', { x: ax, y: ay + n * 14, 'text-anchor': anchor, 'font-size': 12.5,
          'font-weight': 600, fill: INK, 'fill-opacity': v.muted ? .3 : (on ? 1 : .72), text: t }, sv);
      });
      if (v.lec) E('text', { x: ax, y: ay + v.name.length * 14, 'text-anchor': anchor,
        'font-size': 10, 'letter-spacing': 1, 'font-family': 'IBM Plex Mono, monospace',
        fill: on ? BLUE : INK, 'fill-opacity': on ? 1 : .38, text: v.lec.toUpperCase() }, sv);
      if (on) {
        var lab = String(badge[k]), wide = lab.length > 1;
        if (wide) E('rect', { x: p[0] - 19, y: p[1] - 11, width: 38, height: 22, rx: 11, fill: INK }, sv);
        else E('circle', { cx: p[0], cy: p[1], r: 11, fill: INK }, sv);
        E('text', { x: p[0], y: p[1] + 4, 'text-anchor': 'middle', 'font-size': wide ? 10.5 : 11.5,
          'font-weight': 700, fill: '#FBFBF9', 'font-family': 'IBM Plex Mono, monospace',
          text: lab }, sv);
      }
    });

    host.querySelector('[data-n]').textContent = step + ' / ' + (STEPS.length - 1);
    host.querySelector('[data-cap]').innerHTML = s.cap;
  }

  function go(n) { step = Math.max(0, Math.min(STEPS.length - 1, n)); draw(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  /* `step:` in the mount options is where this chapter's walk begins — Lecture 0
     starts at the empty cube and tours the whole route; Lecture 12 opens already
     at ⑤ and has only the face it never crosses left to show. */
  var BASE = opts && opts.step != null ? opts.step : 0;
  go(BASE);
  return {
    /* driven by the deck's arrow key — see showStep() in deck.js */
    steps: STEPS.length - 1 - BASE,
    step: function (i) { stop(); go(BASE + i); },
    finish: function () { stop(); go(STEPS.length - 1); },
    leave: stop
  };
});
