/* ============================================================
   widget: cliff-walk
   Sutton & Barto Example 6.6. SARSA and Q-learning trained on
   their own experience, same epsilon, same alpha, same grid.
   Q-learning learns the OPTIMAL (cliff-edge) path but scores
   worse online, because it must keep acting epsilon-greedily.
   SARSA accounts for its own exploration and detours.
   ============================================================ */
IE437.widget('cliff-walk', function (host, opts) {
  var E = IE437.el;
  var R = 4, C = 12, START = [3, 0], GOAL = [3, 11];
  var SARSA = '#2563EB', QL = '#16181D', RED = '#D64545';   // on-policy = blue, off-policy = ink
  var ALPHA = 0.5, GAMMA = 1.0, MAXT = 300;
  var ACT = [[-1, 0], [0, 1], [1, 0], [0, -1]], GLYPH = ['↑', '→', '↓', '←'];
  var eps = opts.eps || 0.1, ep = 0, S, Q;

  var idx = function (r, c) { return r * C + c; };
  var isCliff = function (r, c) { return r === 3 && c >= 1 && c <= 10; };
  var isGoal = function (r, c) { return r === GOAL[0] && c === GOAL[1]; };

  function agent(seed) {
    var q = []; for (var i = 0; i < R * C; i++) q.push([0, 0, 0, 0]);
    return { Q: q, rand: IE437.rng(seed), ret: [] };
  }
  function pick(ag, s) {
    if (ag.rand() < eps) return Math.floor(ag.rand() * 4) % 4;
    var q = ag.Q[s], a = 0; for (var k = 1; k < 4; k++) if (q[k] > q[a]) a = k;
    return a;
  }
  function stepEnv(r, c, a) {
    var nr = Math.max(0, Math.min(R - 1, r + ACT[a][0]));
    var nc = Math.max(0, Math.min(C - 1, c + ACT[a][1]));
    if (isCliff(nr, nc)) return { r: START[0], c: START[1], rew: -100, done: false };
    return { r: nr, c: nc, rew: -1, done: isGoal(nr, nc) };
  }
  function episode(ag, sarsa) {
    var r = START[0], c = START[1], G = 0;
    var s = idx(r, c), a = pick(ag, s);
    for (var t = 0; t < MAXT; t++) {
      var o = stepEnv(r, c, a), ns = idx(o.r, o.c);
      var na = pick(ag, ns);
      var boot = o.done ? 0 : (sarsa ? ag.Q[ns][na] : Math.max.apply(null, ag.Q[ns]));
      ag.Q[s][a] += ALPHA * (o.rew + GAMMA * boot - ag.Q[s][a]);
      G += o.rew;
      r = o.r; c = o.c; s = ns; a = na;
      if (o.done) break;
    }
    ag.ret.push(G);
  }
  function greedyPath(ag) {
    var r = START[0], c = START[1], p = [[r, c]], seen = {};
    for (var t = 0; t < 40; t++) {
      var s = idx(r, c); if (seen[s]) break; seen[s] = 1;
      var q = ag.Q[s], a = 0; for (var k = 1; k < 4; k++) if (q[k] > q[a]) a = k;
      var nr = Math.max(0, Math.min(R - 1, r + ACT[a][0])), nc = Math.max(0, Math.min(C - 1, c + ACT[a][1]));
      p.push([nr, nc]);
      if (isGoal(nr, nc) || isCliff(nr, nc)) break;
      r = nr; c = nc;
    }
    return p;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">The cliff &mdash; on-policy vs. off-policy control</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">&epsilon;</span><span class="wnum" data-e></span>' +
    '<button class="wb" data-ec>cycle &epsilon;</button>' +
    '<button class="wb" data-r1>+1 ep</button>' +
    '<button class="wb" data-r50>+50</button>' +
    '<button class="wb" data-r200>+200</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:stretch">' +
    '<div style="flex:1.25;display:flex;flex-direction:column;gap:9px;justify-content:center;min-width:0">' +
    '<div><div class="wlabel" style="color:' + SARSA + ';margin-bottom:3px">SARSA &mdash; greedy path after <span data-ep>0</span> episodes</div>' +
    '<div data-g1></div></div>' +
    '<div><div class="wlabel" style="color:' + QL + ';margin-bottom:3px">Q-learning &mdash; greedy path</div>' +
    '<div data-g2></div></div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">' +
    '<div class="wlabel" style="margin-bottom:3px">online return per episode (smoothed)</div>' +
    '<div data-c></div></div></div>' +
    '<div style="display:flex;gap:18px;justify-content:center;padding-bottom:8px;' +
    'font:500 10px/1 var(--mono);letter-spacing:.07em">' +
    '<span style="color:' + SARSA + '">&#9473;&#9473; SARSA (on-policy)</span>' +
    '<span>&#9473;&#9473; Q-learning (off-policy)</span>' +
    '<span style="color:' + RED + '">&#9632; the cliff &mdash; &minus;100 and back to start</span></div>';

  var CW = 470, CH = 268;
  var g1 = IE437.svg(346, 122), g2 = IE437.svg(346, 122), ch = IE437.svg(CW, CH);
  host.querySelector('[data-g1]').appendChild(g1);
  host.querySelector('[data-g2]').appendChild(g2);
  host.querySelector('[data-c]').appendChild(ch);

  function drawGrid(sv, ag, color) {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var w = 28, o = 5;
    for (var r = 0; r < R; r++) for (var c = 0; c < C; c++) {
      var x = o + c * w, y = o + r * w, cliff = isCliff(r, c);
      E('rect', { x: x, y: y, width: w, height: w, fill: cliff ? RED : 'none',
        'fill-opacity': cliff ? .22 : 0, stroke: 'currentColor', 'stroke-opacity': .16 }, sv);
      if (r === START[0] && c === START[1])
        E('text', { x: x + w / 2, y: y + w / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700,
          fill: 'currentColor', 'fill-opacity': .6, 'font-family': 'IBM Plex Mono, monospace', text: 'S' }, sv);
      else if (isGoal(r, c))
        E('text', { x: x + w / 2, y: y + w / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700,
          fill: SARSA, 'font-family': 'IBM Plex Mono, monospace', text: 'G' }, sv);
      else if (!cliff) {
        var s = idx(r, c), q = ag.Q[s], any = false, a = 0;
        for (var k = 0; k < 4; k++) { if (q[k] !== 0) any = true; if (q[k] > q[a]) a = k; }
        if (any) E('text', { x: x + w / 2, y: y + w / 2 + 5, 'text-anchor': 'middle', 'font-size': 13,
          fill: 'currentColor', 'fill-opacity': .38, text: GLYPH[a] }, sv);
      }
    }
    var p = greedyPath(ag);
    if (p.length > 1) {
      var d = p.map(function (q, i) { return (i ? 'L' : 'M') + (o + q[1] * w + w / 2) + ' ' + (o + q[0] * w + w / 2); }).join(' ');
      E('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 2.4, 'stroke-linejoin': 'round',
        'stroke-linecap': 'round', 'stroke-opacity': .95 }, sv);
    }
  }
  function smooth(a, k) {
    var out = [];
    for (var i = 0; i < a.length; i++) {
      var lo = Math.max(0, i - k + 1), s = 0;
      for (var j = lo; j <= i; j++) s += a[j];
      out.push([i + 1, Math.max(-145, s / (i - lo + 1))]);   // clamp into the plot box
    }
    return out;
  }
  function draw() {
    host.querySelector('[data-e]').textContent = eps.toFixed(2);
    host.querySelector('[data-ep]').textContent = ep;
    drawGrid(g1, S, SARSA); drawGrid(g2, Q, QL);
    var mx = Math.max(20, ep);
    IE437.plot(ch, {
      w: CW, h: CH, pad: { l: 44, r: 10, t: 12, b: 28 },
      xdom: [1, mx], ydom: [-150, 0], yticks: [-150, -100, -50, 0],
      xticks: [1, Math.round(mx / 2), mx], xlabel: 'episodes',
      yfmt: function (v) { return String(v); },
      series: [
        { pts: smooth(S.ret, 10), color: SARSA, w: 1.8 },
        { pts: smooth(Q.ret, 10), color: QL, w: 1.8 }
      ]
    });
  }
  function reset() { ep = 0; S = agent(opts.seed || 3); Q = agent(opts.seed || 3); draw(); }
  function run(n) { for (var i = 0; i < n; i++) { episode(S, true); episode(Q, false); ep++; } draw(); }

  host.querySelector('[data-r1]').onclick = function () { run(1); };
  host.querySelector('[data-r50]').onclick = function () { run(50); };
  host.querySelector('[data-r200]').onclick = function () { run(200); };
  var __reset = reset;
  host.querySelector('[data-ec]').onclick = function () {
    eps = eps === 0.05 ? 0.1 : eps === 0.1 ? 0.2 : 0.05; reset();
  };

  reset();
  return { reset: __reset, finish: function () { if (ep < 400) run(400 - ep); } };
});
