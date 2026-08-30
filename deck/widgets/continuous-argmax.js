/* ============================================================
   widget: continuous-argmax                      (Chapter 10, Act 3)

   The wall Lecture 8 handed over, made concrete: one state, one
   continuous action, and the critic's Q(s, .) across it. Q is a fixed
   non-convex function so that the two options of the source deck
   (pp. 51-52) can be tried against each other:

     Q(a) = exp(-((a-0.42)/0.20)^2)
          + 0.78 exp(-((a+0.52)/0.26)^2)
          + 0.18 exp(-((a-0.92)/0.16)^2)
          - 0.22 a^2 ,      a in [-1, 1]

   VERIFIED IN NODE (1e-6 sweep for the truth, exact grids):
     true max  Q = 0.961541  at  a* = 0.41634
     n   delta_a   best grid a   Q          gap        n^6
      3   1.0000    0.0000      0.02644   0.93510            729
      5   0.5000    0.5000      0.79733   0.16421         15,625
      9   0.2500    0.5000      0.79733   0.16421        531,441
     21   0.1000    0.4000      0.95486   0.00668     85,766,121
     51   0.0400    0.4000      0.95486   0.00668 17,596,287,801
   Note n = 9 buys nothing over n = 5 here: the grid gets finer but no
   new point lands nearer the peak. That is the honest shape of the
   resolution/cost trade-off, not a monotone curve.

   Gradient ascent on a (400 steps, rate 0.02) — what DDPG's actor
   effectively does, and it is only ever local:
     from -0.90 -> -0.5103  (local,  Q = 0.7216)
     from -0.30 -> -0.5103  (local,  Q = 0.7216)
     from  0.10 ->  0.4163  (GLOBAL, Q = 0.9615)
     from  0.80 ->  0.8826  (local,  Q = 0.0038)
   ============================================================ */
IE437.widget('continuous-argmax', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B', RED = '#D64545';

  var NS = [3, 5, 9, 21, 51], ni = 1;
  var STARTS = [0.10, -0.30, 0.80, -0.90], si = 0;
  var DS = [1, 2, 6], di = 2;
  var ASTAR = 0.41634, QSTAR = 0.961541;

  function Q(a) {
    return Math.exp(-Math.pow((a - 0.42) / 0.20, 2))
      + 0.78 * Math.exp(-Math.pow((a + 0.52) / 0.26, 2))
      + 0.18 * Math.exp(-Math.pow((a - 0.92) / 0.16, 2))
      - 0.22 * a * a;
  }
  function dQ(a) { return (Q(a + 1e-6) - Q(a - 1e-6)) / 2e-6; }

  function ascent(a0) {
    var a = a0, path = [a], i;
    for (i = 0; i < 400; i++) {
      a += 0.02 * dQ(a);
      if (a < -1) a = -1; if (a > 1) a = 1;
      if (i % 12 === 0) path.push(a);
    }
    path.push(a);
    return { path: path, a: a };
  }
  function grid(n) {
    var b = -1e9, ab = 0, i, a;
    for (i = 0; i < n; i++) { a = -1 + 2 * i / (n - 1); if (Q(a) > b) { b = Q(a); ab = a; } }
    return { a: ab, q: b, da: 2 / (n - 1) };
  }
  function commas(x) {
    var s = '', d = String(x), i;
    for (i = 0; i < d.length; i++) s += ((d.length - i) % 3 === 0 && i ? ',' : '') + d[i];
    return s;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">max<sub>a</sub> Q(s,a) over a continuum &mdash; two ways to fail</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">bins</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-grid>finer grid</button>' +
    '<button class="wb" data-dim>action dims</button>' +
    '<button class="wb" data-start>move the actor</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:9px">' +
    '<div data-g style="padding:9px 11px;border:1px solid var(--line);background:var(--panel2);' +
    'font:400 11.5px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '<div data-m style="padding:9px 11px;border:1px solid rgba(37,99,235,.35);' +
    'background:rgba(37,99,235,.06);font:400 11.5px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 11px/1.5 var(--sans);color:var(--ink3)">' +
    'Q-learning needs this maximum <i>at every transition</i>. The grid pays ' +
    'n<sup>d</sup> for it; the actor pays one forward pass and settles for a local answer.' +
    '</div></div></div>';

  var CW = 500, CH = 254;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function draw() {
    var n = NS[ni], g = grid(n), ac = ascent(STARTS[si]), d = DS[di];
    var curve = [], a;
    for (a = -1; a <= 1 + 1e-9; a += 0.004) curve.push([a, Q(a)]);

    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 44, r: 14, t: 14, b: 34 },
      xdom: [-1, 1], ydom: [-0.28, 1.14],
      yticks: [0, 0.5, 1.0], xticks: [-1, -0.5, 0, 0.5, 1],
      yfmt: function (t) { return t.toFixed(1); }, xfmt: function (t) { return t.toFixed(1); },
      xlabel: 'action a  (one joint, normalised)', ylabel: 'critic Q(s,a)',
      series: [{ pts: curve, color: SLATE, w: 1.8 }]
    });

    /* the true maximum */
    E('line', { x1: m.X(ASTAR), x2: m.X(ASTAR), y1: m.Y(-0.28), y2: m.Y(QSTAR),
      stroke: INK, 'stroke-width': 1.1, 'stroke-dasharray': '4 4', 'stroke-opacity': .45 }, sv);
    E('text', { x: m.X(ASTAR) + 6, y: m.Y(1.09), 'font-size': 9.5, fill: INK, 'fill-opacity': .6,
      'font-family': 'IBM Plex Mono, monospace', text: 'true max  a* = 0.416' }, sv);

    /* the grid */
    var i, av;
    for (i = 0; i < n; i++) {
      av = -1 + 2 * i / (n - 1);
      E('line', { x1: m.X(av), x2: m.X(av), y1: m.Y(-0.28), y2: m.Y(-0.22),
        stroke: AMBER, 'stroke-width': 1.2, 'stroke-opacity': .75 }, sv);
      if (n <= 51) E('circle', { cx: m.X(av), cy: m.Y(Q(av)), r: n > 21 ? 1.6 : 2.6,
        fill: AMBER, 'fill-opacity': .55 }, sv);
    }
    E('circle', { cx: m.X(g.a), cy: m.Y(g.q), r: 6, fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, sv);

    /* the actor: start, ascent, landing */
    ac.path.forEach(function (p, j) {
      E('circle', { cx: m.X(p), cy: m.Y(Q(p)), r: 2.2, fill: BLUE,
        'fill-opacity': 0.12 + 0.55 * j / (ac.path.length - 1) }, sv);
    });
    var glob = Math.abs(ac.a - ASTAR) < 0.01;
    E('circle', { cx: m.X(STARTS[si]), cy: m.Y(Q(STARTS[si])), r: 4, fill: 'none',
      stroke: BLUE, 'stroke-width': 1.4, 'stroke-dasharray': '2 2' }, sv);
    E('circle', { cx: m.X(ac.a), cy: m.Y(Q(ac.a)), r: 6, fill: glob ? BLUE : RED }, sv);

    /* legend, top-left, where the curve never goes */
    E('circle', { cx: 62, cy: 22, r: 5, fill: 'none', stroke: AMBER, 'stroke-width': 2.2 }, sv);
    E('text', { x: 74, y: 25.5, 'font-size': 10, fill: AMBER,
      'font-family': 'IBM Plex Mono, monospace', text: 'best on the grid' }, sv);
    E('circle', { cx: 62, cy: 40, r: 5, fill: glob ? BLUE : RED }, sv);
    E('text', { x: 74, y: 43.5, 'font-size': 10, fill: glob ? BLUE : RED,
      'font-family': 'IBM Plex Mono, monospace', text: 'the actor, mu(s) = ' + ac.a.toFixed(3) }, sv);

    host.querySelector('[data-n]').textContent = n;
    host.querySelector('[data-g]').innerHTML =
      '<b style="color:' + AMBER + '">Option 1 &mdash; discretise.</b> ' +
      '&Delta;a = ' + g.da.toFixed(4) + ' &nbsp;&middot;&nbsp; best grid action ' + g.a.toFixed(3) +
      '<br>resolution gap Q* &minus; Q = <b>' + (QSTAR - g.q).toFixed(5) + '</b>' +
      '<br>evaluations for one max, ' + d + ' joint' + (d > 1 ? 's' : '') + ': <b>' +
      commas(Math.round(Math.pow(n, d))) + '</b>' +
      (d > 1 && Math.pow(n, d) > 1e6 ? ' <span style="color:' + RED + '">&mdash; per transition</span>' : '');
    host.querySelector('[data-m]').innerHTML =
      '<b style="color:' + BLUE + '">Option 2 &mdash; the actor.</b> start ' + STARTS[si].toFixed(2) +
      ' &rarr; climbs &nabla;<sub>a</sub>Q &rarr; ' + ac.a.toFixed(3) +
      ' &nbsp;<b style="color:' + (glob ? BLUE : RED) + '">' + (glob ? 'global' : 'local only') + '</b>' +
      '<br>Q = ' + Q(ac.a).toFixed(4) + ' of ' + QSTAR.toFixed(4) +
      '<br>cost: <b>one forward pass and one gradient</b>, whatever d is.';
  }

  host.querySelector('[data-grid]').onclick = function () { ni = (ni + 1) % NS.length; draw(); };
  host.querySelector('[data-dim]').onclick = function () { di = (di + 1) % DS.length; draw(); };
  host.querySelector('[data-start]').onclick = function () { si = (si + 1) % STARTS.length; draw(); };

  draw();
  return { finish: function () { ni = 2; di = 2; si = 0; draw(); } };
});
