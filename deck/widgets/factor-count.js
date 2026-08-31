/* ============================================================
   widget: factor-count
   The one number that motivates the entire field, from p.13 of
   the source deck: a joint over the five satellite variables
   needs 31 free parameters; its DAG needs 10.  The chart then
   lets that race run: the joint costs 2^n - 1 whatever happens,
   while a network costs (number of nodes) x (2 ^ parents), so
   one curve is exponential and the other is a straight line.
   ============================================================ */
IE437.widget('factor-count', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';
  var NMAX = 24, k = 2, n = 5;                    // k = parents per node, n = variables

  /* cost of a network on n binary nodes where node i has min(i-1,k) parents */
  function netCost(n, k) {
    var s = 0;
    for (var i = 0; i < n; i++) s += Math.pow(2, Math.min(i, k));
    return s;
  }
  function jointCost(n) { return Math.pow(2, n) - 1; }
  function ratio(r) {
    return r < 1.2 ? 'no saving yet — the graph is still nearly complete'
         : r < 10  ? r.toFixed(1) + '× cheaper'
         : Math.round(r).toLocaleString() + '× cheaper';
  }
  function fmt(v) {
    return v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M'
         : v >= 1e3 ? (v / 1e3).toFixed(v >= 1e4 ? 0 : 1) + 'K'
         : String(v);
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">One table, or a handful of small ones</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">parents per node</span>' +
    '<button class="wb" data-k="1">1</button>' +
    '<button class="wb" data-k="2">2</button>' +
    '<button class="wb" data-k="3">3</button>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:flex-start">' +
    '<div style="flex:none;display:flex;flex-direction:column;gap:8px">' +
    '<div class="wlabel">the satellite network &mdash; five variables</div>' +
    '<div data-sat></div></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">' +
    '<div data-chart></div>' +
    '<div data-read style="font:400 12px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '</div></div>';

  /* ---------- left: the satellite network, drawn with its table sizes ---------- */
  var SW = 344, SH = 248;
  var sat = IE437.svg(SW, SH);
  host.querySelector('[data-sat]').appendChild(sat);
  (function () {
    var N = {
      B: { x: 88, y: 38, lab: 'B', cpt: 'p(B)', np: 1 },
      S: { x: 252, y: 38, lab: 'S', cpt: 'p(S)', np: 1 },
      E: { x: 170, y: 112, lab: 'E', cpt: 'p(E|B,S)', np: 4 },
      D: { x: 88, y: 186, lab: 'D', cpt: 'p(D|E)', np: 2 },
      C: { x: 252, y: 186, lab: 'C', cpt: 'p(C|E)', np: 2 }
    };
    [['B', 'E'], ['S', 'E'], ['E', 'D'], ['E', 'C']].forEach(function (e) {
      var a = N[e[0]], b = N[e[1]];
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / L, uy = dy / L, r = 17;
      E('line', { x1: a.x + ux * r, y1: a.y + uy * r, x2: b.x - ux * (r + 6), y2: b.y - uy * (r + 6),
        stroke: INK, 'stroke-opacity': .45, 'stroke-width': 1.5 }, sat);
      E('path', { d: 'M' + (b.x - ux * r) + ' ' + (b.y - uy * r) +
        'L' + (b.x - ux * (r + 8) - uy * 3.6) + ' ' + (b.y - uy * (r + 8) + ux * 3.6) +
        'L' + (b.x - ux * (r + 8) + uy * 3.6) + ' ' + (b.y - uy * (r + 8) - ux * 3.6) + 'Z',
        fill: INK, 'fill-opacity': .55 }, sat);
    });
    Object.keys(N).forEach(function (key) {
      var d = N[key];
      E('circle', { cx: d.x, cy: d.y, r: 17, fill: '#FBFBF9', stroke: INK, 'stroke-width': 1.5 }, sat);
      E('text', { x: d.x, y: d.y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic',
        fill: INK, text: d.lab }, sat);
      var left = d.x < 160, ty = d.y + (key === 'E' ? -26 : 0);
      E('text', { x: left ? d.x - 24 : d.x + 24, y: ty - 2, 'text-anchor': left ? 'end' : 'start',
        'font-size': 10, fill: INK, 'fill-opacity': .55,
        'font-family': 'IBM Plex Mono, monospace', text: d.cpt }, sat);
      E('text', { x: left ? d.x - 24 : d.x + 24, y: ty + 11, 'text-anchor': left ? 'end' : 'start',
        'font-size': 10.5, 'font-weight': 700, fill: BLUE,
        'font-family': 'IBM Plex Mono, monospace', text: d.np + (d.np === 1 ? ' number' : ' numbers') }, sat);
    });
    E('text', { x: SW / 2, y: 218, 'text-anchor': 'middle', 'font-size': 9.5, fill: INK, 'fill-opacity': .42,
      text: 'only E has two parents — hence 10, not 15' }, sat);
    E('line', { x1: 8, y1: 228, x2: SW - 8, y2: 228, stroke: INK, 'stroke-opacity': .18 }, sat);
    E('text', { x: 8, y: 243, 'font-size': 11, fill: INK, 'fill-opacity': .6,
      'font-family': 'IBM Plex Mono, monospace', text: 'joint 2⁵−1 = 31' }, sat);
    E('text', { x: SW - 8, y: 243, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: BLUE,
      'font-family': 'IBM Plex Mono, monospace', text: 'network = 10' }, sat);
  })();

  /* ---------- right: the race, on a log scale ---------- */
  var CW = 452, CH = 196;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-chart]').appendChild(sv);

  function draw() {
    var jo = [], ne = [], i;
    for (i = 2; i <= NMAX; i++) {
      jo.push([i, Math.log10(jointCost(i))]);
      ne.push([i, Math.log10(netCost(i, k))]);
    }
    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 42, r: 12, t: 12, b: 30 },
      xdom: [2, NMAX], ydom: [0, 7.4],
      yticks: [0, 1, 2, 3, 4, 5, 6, 7], yfmt: function (v) { return fmt(Math.pow(10, v)); },
      xticks: [2, 5, 10, 15, 20, NMAX], xlabel: 'n  —  number of binary variables',
      series: [
        { pts: jo, color: RED, w: 2.2 },
        { pts: ne, color: BLUE, w: 2.2 }
      ]
    });
    /* the current n */
    E('line', { x1: m.X(n), y1: m.Y(0), x2: m.X(n), y2: m.Y(7.4), stroke: INK,
      'stroke-opacity': .3, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, sv);
    E('circle', { cx: m.X(n), cy: m.Y(Math.log10(jointCost(n))), r: 4, fill: RED }, sv);
    E('circle', { cx: m.X(n), cy: m.Y(Math.log10(netCost(n, k))), r: 4, fill: BLUE }, sv);

    host.querySelectorAll('[data-k]').forEach(function (b) {
      b.classList.toggle('on', +b.getAttribute('data-k') === k);
    });

    var j = jointCost(n), c = netCost(n, k);
    host.querySelector('[data-read]').innerHTML =
      '<b>n = ' + n + '</b> binary variables, at most <b>' + k + '</b> parent' + (k > 1 ? 's' : '') +
      ' each &nbsp;&middot;&nbsp; ' +
      '<span style="color:' + RED + '">&#9473; joint</span> <b>' + j.toLocaleString() + '</b>' +
      ' &nbsp;vs&nbsp; <span style="color:' + BLUE + '">&#9473; network</span> <b>' + c.toLocaleString() + '</b>' +
      ' &nbsp;&middot;&nbsp; <span style="color:' + SLATE + '">' + ratio(j / c) + '</span>';
  }

  host.querySelectorAll('[data-k]').forEach(function (b) {
    b.onclick = function () { k = +b.getAttribute('data-k'); draw(); };
  });
  IE437.slider(host.querySelector('[data-sl]'), {
    label: 'variables', min: 2, max: NMAX, step: 1, value: n,
    on: function (v) { n = v; draw(); }
  });

  draw();
  return { finish: function () { n = 20; k = 2; draw(); } };
});
