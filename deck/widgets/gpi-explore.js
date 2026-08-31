/* ============================================================
   widget: gpi-explore
   The exploration tax. Two Q-learning agents, identical except
   for epsilon, on the same corridor: a NEAR small reward (+1)
   and a FAR large one (+5). The purely greedy agent locks onto
   whatever it stumbled into first and never tries the actions it
   currently dislikes — so it never learns they were better.
   The coverage figure is the point: greedy leaves most (s,a)
   pairs untried, and an untried pair can never be evaluated.
   ============================================================ */
IE437.widget('gpi-explore', function (host, opts) {
  var E = IE437.el;
  var R = 3, C = 7, START = [1, 3], SMALL = [1, 1], BIG = [1, 6];
  var TEAL = '#2563EB', RED = '#64748B', AMB = '#D97706';   // explore = blue, greedy = slate
  var GAMMA = 0.95, ALPHA = 0.3, STEP = -0.05, MAXT = 80, BIGR = 5;
  var ACT = [[-1, 0], [0, 1], [1, 0], [0, -1]];          // up right down left
  var GLYPH = ['↑', '→', '↓', '←'];
  var eps2 = opts.eps || 0.3, seed = opts.seed || 4, ep = 0, A, B;

  var idx = function (r, c) { return r * C + c; };
  var isGoal = function (r, c) { return (r === SMALL[0] && c === SMALL[1]) || (r === BIG[0] && c === BIG[1]); };
  var reward = function (r, c) {
    if (r === SMALL[0] && c === SMALL[1]) return 1;
    if (r === BIG[0] && c === BIG[1]) return BIGR;
    return STEP;
  };
  function agent(eps, sd) {
    var Q = [], visit = [], tried = [];
    for (var i = 0; i < R * C; i++) { Q.push([0, 0, 0, 0]); visit.push(0); tried.push([0, 0, 0, 0]); }
    return { eps: eps, Q: Q, visit: visit, tried: tried, rand: IE437.rng(sd), ret: [], goal: null };
  }
  function greedy(ag, s) {
    var q = ag.Q[s], best = -Infinity, ties = [];
    for (var a = 0; a < 4; a++) { if (q[a] > best) { best = q[a]; ties = [a]; } else if (q[a] === best) ties.push(a); }
    return ties[Math.floor(ag.rand() * ties.length) % ties.length];
  }
  function episode(ag) {
    var r = START[0], c = START[1], G = 0, t;
    for (t = 0; t < MAXT; t++) {
      var s = idx(r, c);
      ag.visit[s]++;
      var a = (ag.rand() < ag.eps) ? Math.floor(ag.rand() * 4) % 4 : greedy(ag, s);
      ag.tried[s][a] = 1;
      var nr = Math.max(0, Math.min(R - 1, r + ACT[a][0]));
      var nc = Math.max(0, Math.min(C - 1, c + ACT[a][1]));
      var rew = reward(nr, nc), ns = idx(nr, nc), done = isGoal(nr, nc);
      ag.Q[s][a] += ALPHA * (rew + (done ? 0 : GAMMA * Math.max.apply(null, ag.Q[ns])) - ag.Q[s][a]);
      G += rew; r = nr; c = nc;
      if (done) { ag.goal = (rew === BIGR) ? 'big' : 'small'; break; }
    }
    if (t >= MAXT) ag.goal = 'none';
    ag.ret.push(G);
  }
  function greedyPath(ag) {
    var r = START[0], c = START[1], path = [[r, c]], seen = {};
    for (var t = 0; t < 24; t++) {
      var s = idx(r, c);
      if (seen[s]) break; seen[s] = 1;
      var q = ag.Q[s], a = 0; for (var k = 1; k < 4; k++) if (q[k] > q[a]) a = k;
      r = Math.max(0, Math.min(R - 1, r + ACT[a][0]));
      c = Math.max(0, Math.min(C - 1, c + ACT[a][1]));
      path.push([r, c]);
      if (isGoal(r, c)) break;
    }
    return path;
  }
  function coverage(ag) {
    var n = 0, tot = 0;
    for (var s = 0; s < R * C; s++) {
      var rr = Math.floor(s / C), cc = s % C;
      if (isGoal(rr, cc)) continue;              // terminal states are never acted from
      for (var a = 0; a < 4; a++) { tot++; n += ag.tried[s][a]; }
    }
    return n / tot;
  }
  function endsAt(ag) {
    var p = greedyPath(ag), last = p[p.length - 1];
    if (last[0] === BIG[0] && last[1] === BIG[1]) return 'big';
    if (last[0] === SMALL[0] && last[1] === SMALL[1]) return 'small';
    return 'none';
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Generalized policy iteration &mdash; with and without exploration</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">right &epsilon;</span><span class="wnum" data-e></span>' +
    '<button class="wb" data-ec>cycle &epsilon;</button>' +
    '<button class="wb" data-r1>+1 ep</button>' +
    '<button class="wb" data-auto data-r50>+50</button>' +
    '<button class="wb" data-r200>+200</button>' +
    '</div>' +
    '<div class="wbody" style="gap:12px">' +
    '<div style="display:flex;gap:26px;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="wlabel" style="color:' + RED + '">&epsilon; = 0 &mdash; pure greedy</div>' +
    '<div data-g1></div><div class="wcap" data-s1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="wlabel" style="color:' + TEAL + '">&epsilon;-greedy &mdash; pays the tax</div>' +
    '<div data-g2></div><div class="wcap" data-s2></div></div>' +
    '</div>' +
    '<div style="text-align:center;font:400 11.5px/1.5 var(--sans);color:var(--ink3)">' +
    'near reward <b style="color:' + AMB + '">+1</b> &nbsp;&middot;&nbsp; far reward <b style="color:' + TEAL + '">+5</b>' +
    ' &nbsp;&middot;&nbsp; step cost &minus;0.05 &nbsp;&middot;&nbsp; shading = visit count' +
    ' &nbsp;&middot;&nbsp; <span data-ep>0</span> episodes</div></div>';

  var GW = 48, SVW = C * GW + 10, SVH = R * GW + 10;
  var sv1 = IE437.svg(SVW, SVH), sv2 = IE437.svg(SVW, SVH);
  host.querySelector('[data-g1]').appendChild(sv1);
  host.querySelector('[data-g2]').appendChild(sv2);

  function drawGrid(sv, ag, accent) {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var w = GW, o = 5, mx = 1;
    ag.visit.forEach(function (v) { if (v > mx) mx = v; });
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
      var s = idx(r, c), x = o + c * w, y = o + r * w;
      var v = Math.pow(ag.visit[s] / mx, 0.45);
      E('rect', { x: x, y: y, width: w, height: w, fill: accent, 'fill-opacity': (v * 0.30).toFixed(3),
        stroke: 'currentColor', 'stroke-opacity': .16 }, sv);
      if (r === SMALL[0] && c === SMALL[1]) {
        E('rect', { x: x, y: y, width: w, height: w, fill: AMB, 'fill-opacity': .28 }, sv);
        E('text', { x: x + w / 2, y: y + w / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700,
          fill: AMB, 'font-family': 'IBM Plex Mono, monospace', text: '+1' }, sv);
      } else if (r === BIG[0] && c === BIG[1]) {
        E('rect', { x: x, y: y, width: w, height: w, fill: TEAL, 'fill-opacity': .26 }, sv);
        E('text', { x: x + w / 2, y: y + w / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700,
          fill: TEAL, 'font-family': 'IBM Plex Mono, monospace', text: '+5' }, sv);
      } else {
        var q = ag.Q[s], a = 0, any = false;
        for (var k = 0; k < 4; k++) { if (q[k] !== 0) any = true; if (q[k] > q[a]) a = k; }
        if (any) E('text', { x: x + w / 2, y: y + w / 2 + 7, 'text-anchor': 'middle', 'font-size': 19,
          fill: 'currentColor', 'fill-opacity': .42, text: GLYPH[a] }, sv);
        if (r === START[0] && c === START[1])
          E('text', { x: x + 5, y: y + 14, 'font-size': 11, 'font-weight': 700, fill: 'currentColor',
            'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: 'S' }, sv);
      }
    }
    var p = greedyPath(ag);
    if (p.length > 1) {
      var d = p.map(function (q, i) { return (i ? 'L' : 'M') + (o + q[1] * w + w / 2) + ' ' + (o + q[0] * w + w / 2); }).join(' ');
      E('path', { d: d, fill: 'none', stroke: accent, 'stroke-width': 3, 'stroke-opacity': .9,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, sv);
    }
  }
  function stat(ag) {
    var g = endsAt(ag);
    var label = g === 'big' ? '<b style="color:' + TEAL + '">reaches the +5</b>'
      : g === 'small' ? '<b style="color:' + AMB + '">settles for the +1</b>' : 'no policy yet';
    return 'greedy policy ' + label + ' &middot; tried <b>' + Math.round(coverage(ag) * 100) + '%</b> of all (s, a)';
  }
  function draw() {
    host.querySelector('[data-e]').textContent = eps2.toFixed(2);
    host.querySelector('[data-ep]').textContent = ep;
    drawGrid(sv1, A, RED); drawGrid(sv2, B, TEAL);
    host.querySelector('[data-s1]').innerHTML = stat(A);
    host.querySelector('[data-s2]').innerHTML = stat(B);
  }
  function reset() { ep = 0; A = agent(0, seed); B = agent(eps2, seed); draw(); }
  function run(n) { for (var i = 0; i < n; i++) { episode(A); episode(B); ep++; } draw(); }

  host.querySelector('[data-r1]').onclick = function () { run(1); };
  host.querySelector('[data-r50]').onclick = function () { run(50); };
  host.querySelector('[data-r200]').onclick = function () { run(200); };
  var __reset = reset;
  host.querySelector('[data-ec]').onclick = function () {
    eps2 = eps2 === 0.1 ? 0.2 : eps2 === 0.2 ? 0.3 : 0.1; reset();
  };

  reset();
  return { reset: __reset, finish: function () { if (ep < 400) run(400 - ep); } };
});
