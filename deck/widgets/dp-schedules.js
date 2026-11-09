/* ============================================================
   widget: dp-schedules
   Three schedules of the same machine, counted in backups.

   The arena is the deck's own gridworld (Sutton & Barto 4.1): 4x4,
   two terminal corners, reward -1 on every move, gamma = 1, and the
   starting policy is the equiprobable random policy the evaluation
   slides used.  Policy iteration evaluates that policy to convergence
   and then improves; value iteration takes one max sweep and repeats;
   the dial sets m, the number of evaluation sweeps per improvement,
   and m = 3 is the blue cross of 'the policy is optimal long before
   the value is'.

   Work is counted literally, one (s,a) one-step lookahead = one backup:
     evaluation sweep    one backup per action the policy still uses
     improvement sweep   |S|.|A| backups
     value-iteration sweep |S|.|A| backups (a max backup)
   Grey is evaluation (expectation backups), red is improvement or the
   max backup.  All three stop under the same rule: the last sweep moved
   V by at most 0.01 and the policy is already greedy on that V (the
   improvement that finds this out is counted).  Steps: policy iteration
   alone, then value iteration, then the dial's schedule.
   ============================================================ */
IE437.widget('dp-schedules', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', RED = '#D64545', SLATE = '#64748B', BLUE = '#2563EB';
  var N = 16, NA = 4, EPS = 0.01, DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];
  var term = function (s) { return s === 0 || s === 15; };
  function mv(s, a) {
    var r = ((s / 4) | 0) + DR[a], c = (s % 4) + DC[a];
    return (r < 0 || r > 3 || c < 0 || c > 3) ? s : r * 4 + c;
  }
  function q(V, s, a) { return -1 + V[mv(s, a)]; }
  function zeros() { var V = []; for (var s = 0; s < N; s++) V.push(0); return V; }
  function uniform() { var P = []; for (var s = 0; s < N; s++) P.push(term(s) ? [0, 0, 0, 0] : [.25, .25, .25, .25]); return P; }

  /* one expectation sweep under a (possibly stochastic) policy; returns the new array,
     the cost in backups and the largest change */
  function evalSweep(V, P) {
    var W = V.slice(), cost = 0, ch = 0;
    for (var s = 0; s < N; s++) {
      if (term(s)) continue;
      var v = 0;
      for (var a = 0; a < NA; a++) if (P[s][a] > 0) { v += P[s][a] * q(V, s, a); cost++; }
      ch = Math.max(ch, Math.abs(v - V[s])); W[s] = v;
    }
    return { V: W, cost: cost, ch: ch };
  }
  /* greedy on V; ties share the probability, as the source's arrows do */
  function greedy(V) {
    var P = [];
    for (var s = 0; s < N; s++) {
      if (term(s)) { P.push([0, 0, 0, 0]); continue; }
      var qs = [], m = -1e18, a;
      for (a = 0; a < NA; a++) { qs.push(q(V, s, a)); m = Math.max(m, qs[a]); }
      var best = [], k = 0;
      for (a = 0; a < NA; a++) { best.push(qs[a] > m - 1e-9 ? 1 : 0); k += best[a]; }
      P.push(best.map(function (x) { return x / k; }));
    }
    return { P: P, cost: 14 * NA };
  }
  /* the textbook stopping test: the policy is stable when every action it
     still uses is a maximiser of the current Q — ties may be shared either way */
  function stable(P, V) {
    for (var s = 0; s < N; s++) {
      if (term(s)) continue;
      var m = -1e18, a;
      for (a = 0; a < NA; a++) m = Math.max(m, q(V, s, a));
      for (a = 0; a < NA; a++) if (P[s][a] > 0 && q(V, s, a) < m - 1e-9) return false;
    }
    return true;
  }
  /* m evaluation sweeps per improvement; m = Infinity evaluates to convergence */
  function runMPI(m) {
    var V = zeros(), P = uniform(), evalB = 0, impB = 0, sweeps = 0, improvements = 0, ch = 1;
    for (var it = 0; it < 1000; it++) {
      for (var k = 0; k < (m === Infinity ? 100000 : m); k++) {
        var r = evalSweep(V, P); V = r.V; evalB += r.cost; sweeps++; ch = r.ch;
        if (m === Infinity && ch <= EPS) break;
      }
      var g = greedy(V); impB += g.cost; improvements++;   /* the check costs a sweep too */
      if (stable(P, V) && ch <= EPS) break;
      P = g.P;
    }
    return { evalB: evalB, impB: impB, total: evalB + impB, sweeps: sweeps, improvements: improvements };
  }
  function runVI() {
    var V = zeros(), b = 0, sweeps = 0;
    for (var it = 0; it < 1000; it++) {
      var W = V.slice(), ch = 0;
      for (var s = 0; s < N; s++) {
        if (term(s)) continue;
        var mx = -1e18;
        for (var a = 0; a < NA; a++) { mx = Math.max(mx, q(V, s, a)); b++; }
        ch = Math.max(ch, Math.abs(mx - V[s])); W[s] = mx;
      }
      V = W; sweeps++;
      if (ch <= EPS) break;
    }
    return { evalB: 0, impB: b, total: b, sweeps: sweeps, improvements: 0 };
  }

  var PI = runMPI(Infinity), VI = runVI(), CACHE = {};
  function mpi(m) { if (!CACHE[m]) CACHE[m] = runMPI(m); return CACHE[m]; }
  var m = opts.m > 0 ? opts.m : 3, shown = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Three schedules of one machine, counted in backups</span><span class="wspacer"></span>' +
    '<span class="wlabel">sweeps per improvement&nbsp; m =</span><span class="wnum" data-m></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;padding:12px 16px 8px">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">' +
    '<div class="wlabel">the gridworld from before</div><div data-g></div>' +
    '<div style="font:400 10px/1.45 var(--mono);color:var(--ink4);text-align:center">' +
    '−1 per move, γ = 1<br>start: the random policy</div></div>' +
    '<div style="flex:1;min-width:0" data-c></div></div>';

  /* the arena */
  var GS = 30, grid = IE437.svg(4 * GS + 6, 4 * GS + 6);
  host.querySelector('[data-g]').appendChild(grid);
  for (var s = 0; s < N; s++) {
    var gr = (s / 4) | 0, gc = s % 4, gx = 3 + gc * GS, gy = 3 + gr * GS;
    E('rect', { x: gx, y: gy, width: GS, height: GS, fill: term(s) ? INK : 'none', 'fill-opacity': term(s) ? .32 : 0,
      stroke: 'currentColor', 'stroke-opacity': .2 }, grid);
    if (!term(s)) E('text', { x: gx + GS / 2, y: gy + GS / 2 + 3.5, 'text-anchor': 'middle', 'font-size': 11,
      'font-family': 'IBM Plex Mono, monospace', fill: 'currentColor', 'fill-opacity': .4, text: '−1' }, grid);
  }

  /* the bars */
  var W = 880, H = 318, ROW = 92, BH = 28, LX = 0, BX = 4, BW = 690;
  var svg = IE437.svg(W, H); host.querySelector('[data-c]').appendChild(svg);
  var mono = 'IBM Plex Mono, monospace';
  function text(x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 12.5, 'font-family': mono, fill: INK, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, svg);
  }
  function fmt(n) { return n.toLocaleString('en-US'); }
  function bar(i, name, how, run, scale) {
    var y0 = 6 + i * ROW;
    text(LX, y0 + 12, name, { 'font-weight': 700, 'font-size': 13.5 });
    text(LX + name.length * 8.4 + 12, y0 + 12, how, { fill: SLATE, 'font-size': 12 });
    var y = y0 + 22, we = run.evalB * scale, wi = run.impB * scale;
    E('rect', { x: BX, y: y, width: BW, height: BH, fill: 'currentColor', 'fill-opacity': .05 }, svg);
    if (we > 0) E('rect', { x: BX, y: y, width: Math.max(we, 1), height: BH, fill: SLATE, 'fill-opacity': .55 }, svg);
    if (wi > 0) E('rect', { x: BX + we, y: y, width: Math.max(wi, 1.5), height: BH, fill: RED, 'fill-opacity': .85 }, svg);
    text(BX + we + wi + 10, y + BH / 2 + 5, fmt(run.total), { 'font-weight': 700, 'font-size': 14.5 });
    text(BX + we + wi + 10 + (fmt(run.total).length) * 9 + 5, y + BH / 2 + 5, 'backups', { fill: SLATE, 'font-size': 12 });
    var parts = [];
    if (run.improvements) parts.push(run.improvements + ' improvement' + (run.improvements > 1 ? 's' : ''));
    parts.push(run.sweeps + (run.evalB ? ' evaluation' : ' max') + ' sweep' + (run.sweeps > 1 ? 's' : ''));
    if (run.evalB) parts.push(fmt(run.evalB) + ' grey + ' + fmt(run.impB) + ' red');
    text(BX, y + BH + 17, parts.join('  ·  '), { fill: SLATE, 'font-size': 12 });
  }
  function draw() {
    svg.innerHTML = '';
    host.querySelector('[data-m]').textContent = m;
    var cur = mpi(m), scale = BW / (Math.max(PI.total, VI.total, cur.total) * 1.0);
    bar(0, 'policy iteration', 'evaluate to convergence, then improve', PI, scale);
    if (shown >= 1) bar(2, 'value iteration', 'one max sweep, repeated', VI, scale);
    if (shown >= 2) bar(1, 'm = ' + m, m + ' evaluation sweep' + (m > 1 ? 's' : '') + ', then improve', cur, scale);
    /* legend */
    var ly = H - 8;
    E('rect', { x: BX, y: ly - 10, width: 13, height: 10, fill: SLATE, 'fill-opacity': .55 }, svg);
    text(BX + 19, ly, 'expectation backup — evaluation', { fill: SLATE, 'font-size': 11.5 });
    E('rect', { x: BX + 290, y: ly - 10, width: 13, height: 10, fill: RED, 'fill-opacity': .85 }, svg);
    text(BX + 309, ly, 'max backup — improvement, or a value-iteration sweep', { fill: SLATE, 'font-size': 11.5 });
  }
  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 1, max: 10, step: 1, value: m,
    on: function (v) { m = v; draw(); }
  });
  draw();
  return {
    steps: 2,
    step: function (i) { shown = Math.max(0, Math.min(2, i | 0)); draw(); },
    reset: function () { shown = 0; draw(); },
    finish: function () { shown = 2; draw(); }
  };
});
