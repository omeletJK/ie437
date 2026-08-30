/* ============================================================
   widget: offline-stitch                          (Chapter 12, Act 2)
   The one capability that separates offline RL from behaviour cloning.

   Two logged routes from S to G cross at M. tau1 is cheap early and
   expensive late; tau2 is expensive early and cheap late. Each costs 7,
   and the dataset holds three copies of tau1 and two of tau2 -- twenty
   transitions in all.

   Verified in node before shipping (seed 3):
     best trajectory in D           cost 7   (both of them)
     behaviour cloning, modal       cost 7   S -> A1 -> M -> B1 -> G
     behaviour cloning, stochastic  cost 7.000 in expectation
     tabular Q-learning on D        cost 4   S -> A1 -> M -> B2 -> G
   with the converged action values
     Q(S,up) = -4   Q(S,down) = -7   Q(M,up) = -5   Q(M,down) = -2
   The stitched route was never driven; every step of it was.
   ============================================================ */
IE437.widget('offline-stitch', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      AMBER = '#D97706', SLATE = '#64748B';

  /* ---------- the map ------------------------------------------------ */
  var MID = 138;
  var NODE = [
    { n: 'S',  x:  56, y: MID }, { n: 'A₁', x: 176, y:  50 }, { n: 'A₂', x: 176, y: 226 },
    { n: 'M',  x: 296, y: MID }, { n: 'B₁', x: 416, y:  50 }, { n: 'B₂', x: 416, y: 226 },
    { n: 'G',  x: 520, y: MID }
  ];
  var EDGE = [
    { f: 0, t: 1, a: 'up',   c: 1 }, { f: 0, t: 2, a: 'down', c: 4 },
    { f: 1, t: 3, a: 'on',   c: 1 }, { f: 2, t: 3, a: 'on',   c: 1 },
    { f: 3, t: 4, a: 'up',   c: 4 }, { f: 3, t: 5, a: 'down', c: 1 },
    { f: 4, t: 6, a: 'on',   c: 1 }, { f: 5, t: 6, a: 'on',   c: 1 }
  ];
  function edge(f, a) { for (var i = 0; i < EDGE.length; i++) if (EDGE[i].f === f && EDGE[i].a === a) return EDGE[i]; return null; }
  var TAU1 = [[0, 'up'], [1, 'on'], [3, 'up'], [4, 'on']];      /* S A1 M B1 G */
  var TAU2 = [[0, 'down'], [2, 'on'], [3, 'down'], [5, 'on']];  /* S A2 M B2 G */
  function cost(tr) { var c = 0, i; for (i = 0; i < tr.length; i++) c += edge(tr[i][0], tr[i][1]).c; return c; }

  /* ---------- the log: three copies of tau1, two of tau2 ------------- */
  var D = [], i, j;
  for (i = 0; i < 3; i++) for (j = 0; j < TAU1.length; j++) { var e1 = edge(TAU1[j][0], TAU1[j][1]);
    D.push({ s: e1.f, a: e1.a, r: -e1.c, s2: e1.t, done: e1.t === 6 }); }
  for (i = 0; i < 2; i++) for (j = 0; j < TAU2.length; j++) { var e2 = edge(TAU2[j][0], TAU2[j][1]);
    D.push({ s: e2.f, a: e2.a, r: -e2.c, s2: e2.t, done: e2.t === 6 }); }

  /* ---------- behaviour cloning: counts, mode, and the stochastic clone */
  var CNT = {};
  D.forEach(function (d) { CNT[d.s] = CNT[d.s] || {}; CNT[d.s][d.a] = (CNT[d.s][d.a] || 0) + 1; });
  var BCPI = {};
  Object.keys(CNT).forEach(function (s) {
    var best = null, bn = -1;
    Object.keys(CNT[s]).forEach(function (a) { if (CNT[s][a] > bn) { bn = CNT[s][a]; best = a; } });
    BCPI[s] = best;
  });
  function expCost(s) {                        /* expected cost of sampling from the clone */
    if (s === 6) return 0;
    var tot = 0, v = 0;
    Object.keys(CNT[s]).forEach(function (a) { tot += CNT[s][a]; });
    Object.keys(CNT[s]).forEach(function (a) { var e = edge(+s, a); v += CNT[s][a] / tot * (e.c + expCost(e.t)); });
    return v;
  }

  /* ---------- tabular Q-learning, run for real on D ------------------ */
  var Q = {};
  EDGE.forEach(function (e) { Q[e.f] = Q[e.f] || {}; Q[e.f][e.a] = 0; });
  var R = IE437.rng(opts.seed || 3), STEPS = 4000;
  for (i = 0; i < STEPS; i++) {
    var d = D[Math.floor(R() * D.length)], mx = 0;
    if (!d.done) { mx = -Infinity; for (var a2 in Q[d.s2]) if (Q[d.s2][a2] > mx) mx = Q[d.s2][a2]; }
    Q[d.s][d.a] += 0.1 * (d.r + mx - Q[d.s][d.a]);
  }
  function greedy(s) { var b = null, bq = -Infinity; for (var a in Q[s]) if (Q[s][a] > bq) { bq = Q[s][a]; b = a; } return b; }
  function walk(pi) {
    var s = 0, c = 0, route = [0], n;
    for (n = 0; n < 8 && s !== 6; n++) { var e = edge(s, pi(s)); c += e.c; s = e.t; route.push(s); }
    return { c: c, route: route };
  }
  var QL = walk(greedy), BC = walk(function (s) { return BCPI[s]; });
  var BEST = Math.min(cost(TAU1), cost(TAU2));
  if (typeof IE437.__probe === 'function') IE437.__probe({ Q: Q, QL: QL, BC: BC, BEST: BEST, EXP: expCost(0), N: D.length });

  /* ---------- shell --------------------------------------------------- */
  var mode = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">Two mediocre logs, and the route neither took</span><span class="wspacer"></span>' +
    '<button class="wb on" data-m="0">the log</button>' +
    '<button class="wb" data-m="1">behaviour cloning</button>' +
    '<button class="wb" data-m="2">offline Q-learning</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:flex-start;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:224px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:10px"></div></div></div>';

  var CW = 566, CH = 276;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function pathKey(tr) { var k = {}, i; for (i = 0; i < tr.length; i++) k[tr[i][0] + ':' + tr[i][1]] = 1; return k; }
  var K1 = pathKey(TAU1), K2 = pathKey(TAU2);
  function routeKey(route, pi) {
    var k = {}, i; for (i = 0; i + 1 < route.length; i++) k[route[i] + ':' + pi(route[i])] = 1; return k;
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var hi = mode === 1 ? routeKey(BC.route, function (s) { return BCPI[s]; })
           : mode === 2 ? routeKey(QL.route, greedy) : null;
    var col = mode === 2 ? GREEN : (mode === 1 ? BLUE : INK);

    EDGE.forEach(function (e) {
      var A = NODE[e.f], B = NODE[e.t];
      var dx = B.x - A.x, dy = B.y - A.y, L = Math.sqrt(dx * dx + dy * dy);
      var x1 = A.x + dx / L * 21, y1 = A.y + dy / L * 21;
      var x2 = B.x - dx / L * 21, y2 = B.y - dy / L * 21;
      var key = e.f + ':' + e.a;
      var on = hi ? !!hi[key] : (K1[key] || K2[key]);
      var base = hi ? SLATE : (K1[key] && K2[key] ? INK : (K1[key] ? SLATE : AMBER));
      E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: on ? (hi ? col : base) : SLATE,
        'stroke-width': on ? (hi ? 3.4 : 2.6) : 1.2, 'stroke-opacity': on ? (hi ? 1 : .85) : .22,
        'stroke-linecap': 'round' }, sv);
      /* arrow head */
      var ang = Math.atan2(dy, dx), h = 6.5;
      E('path', { d: 'M' + x2 + ' ' + y2 + 'L' + (x2 - h * Math.cos(ang - 0.4)) + ' ' + (y2 - h * Math.sin(ang - 0.4)) +
        'L' + (x2 - h * Math.cos(ang + 0.4)) + ' ' + (y2 - h * Math.sin(ang + 0.4)) + 'Z',
        fill: on ? (hi ? col : base) : SLATE, 'fill-opacity': on ? 1 : .22 }, sv);
      /* cost, and the learned action value — always on the outside of the diamond */
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, up = my < MID;
      var ly = my + (up ? -13 : 19);
      E('text', { x: mx, y: ly, 'text-anchor': 'middle', 'font-size': 11.5,
        'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace',
        fill: on ? (hi ? col : base) : SLATE, 'fill-opacity': on ? 1 : .3, text: '−' + e.c }, sv);
      if (mode === 2) E('text', { x: mx, y: ly + (up ? -13 : 13), 'text-anchor': 'middle',
        'font-size': 9.5, 'font-family': 'IBM Plex Mono, monospace',
        fill: GREEN, 'fill-opacity': .8, text: 'Q ' + Q[e.f][e.a].toFixed(0) }, sv);
    });

    NODE.forEach(function (v, i2) {
      var on = hi ? (mode === 1 ? BC.route.indexOf(i2) >= 0 : QL.route.indexOf(i2) >= 0) : true;
      E('circle', { cx: v.x, cy: v.y, r: 20, fill: i2 === 3 ? 'var(--panel2)' : 'var(--paper)',
        stroke: i2 === 3 ? INK : (on ? col : SLATE), 'stroke-width': i2 === 3 ? 2.2 : (on ? 2 : 1.1),
        'stroke-opacity': on ? 1 : .3 }, sv);
      E('text', { x: v.x, y: v.y + 5, 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700,
        fill: INK, 'fill-opacity': on ? 1 : .35, text: v.n }, sv);
    });
    E('text', { x: NODE[3].x, y: CH - 6, 'text-anchor': 'middle', 'font-size': 9.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5,
      text: 'both logs pass through M' }, sv);
    if (mode === 0) {
      E('text', { x: 176, y: 18, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700,
        fill: SLATE, text: 'log 1  — cost 7' }, sv);
      E('text', { x: 176, y: 268, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700,
        fill: AMBER, text: 'log 2  — cost 7' }, sv);
    }

    /* ---------- readout ---------- */
    var rows = [
      ['best trajectory in D', BEST, INK],
      ['behaviour cloning', BC.c, mode === 1 ? BLUE : INK],
      ['offline Q-learning', QL.c, mode === 2 ? GREEN : INK]
    ];
    host.querySelector('[data-num]').innerHTML =
      '<b>' + D.length + '</b> logged transitions<br>' +
      '<div style="margin-top:7px">' + rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between;padding:3px 0">' +
          '<span>' + r[0] + '</span><b style="color:' + r[2] + '">cost ' + r[1].toFixed(0) + '</b></div>';
      }).join('') + '</div>' +
      '<div style="font:400 11px/1.5 var(--mono);color:var(--ink4);margin-top:2px">' +
      'sampling the clone instead of taking its mode: ' + expCost(0).toFixed(1) + '</div>';
    host.querySelector('[data-note]').innerHTML =
      mode === 0 ? 'Neither log is good. One wastes its first leg, the other its second &mdash; and they cost the same.'
      : mode === 1 ? 'Cloning reproduces what was driven. At <b>M</b> it copies the majority choice and turns up, into the expensive leg. It cannot do better than the logs, because doing better is not what it is asked to do.'
      : 'The backup at <b>M</b> compares two continuations that came from <b>different trajectories</b>. Bellman does not know or care which; it takes the max. Cost <b>4</b>, on a route no one drove.';
  }

  host.querySelectorAll('.wb').forEach(function (b) {
    b.onclick = function () {
      mode = +b.getAttribute('data-m');
      host.querySelectorAll('.wb').forEach(function (o) { o.classList.toggle('on', o === b); });
      draw();
    };
  });

  draw();
  return { finish: function () {
    mode = 2;
    host.querySelectorAll('.wb').forEach(function (o) { o.classList.toggle('on', o.getAttribute('data-m') === '2'); });
    draw();
  } };
});
