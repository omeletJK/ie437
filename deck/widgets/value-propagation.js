/* ============================================================
   widget: value-propagation
   The source deck's own gridworld (p.36-37, after Sutton &
   Barto Fig. 4.1) with the backup stepped by hand.

   4x4 grid, two terminal corners, R = -1 on every transition,
   gamma = 1.  Two backups share the stepper:

     expectation  V(s) <- (1/4) SUM_a [ -1 + V(s') ]   (policy evaluation
                                                       of the random policy)
     max          V(s) <- max_a  [ -1 + V(s') ]        (value iteration)

   The expectation backup reproduces the printed figure exactly:
   -1.0, -1.7 (which is -1.75 truncated), -2.4, ... -14, -20, -22.
   The max backup settles in three sweeps at minus the distance
   to the nearest corner.

   The arrows are greedy w.r.t. the numbers beside them, recomputed
   every sweep, and the badge reports whether that greedy policy is
   optimal at every state -- which first happens at k = 3 under the
   expectation backup, long before the values converge.  That is the
   deck's annotated slide, made live.
   ============================================================ */
IE437.widget('value-propagation', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', SLATE = '#64748B';
  var N = 4, S = 16, TERM = { 0: 1, 15: 1 };
  var DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1], GLYPH = ['↑', '↓', '←', '→'];

  function nxt(s, a) {
    if (TERM[s]) return s;
    var r = (s / N) | 0, c = s % N, nr = r + DR[a], nc = c + DC[a];
    if (nr < 0 || nr >= N || nc < 0 || nc >= N) return s;
    return nr * N + nc;
  }
  function sweep(V, useMax) {
    var W = V.slice();
    for (var s = 0; s < S; s++) {
      if (TERM[s]) { W[s] = 0; continue; }
      if (useMax) {
        var m = -1e18;
        for (var a = 0; a < 4; a++) m = Math.max(m, -1 + V[nxt(s, a)]);
        W[s] = m;
      } else {
        var acc = 0;
        for (var b = 0; b < 4; b++) acc += 0.25 * (-1 + V[nxt(s, b)]);
        W[s] = acc;
      }
    }
    return W;
  }
  /* V* of this grid = minus the number of steps to the nearest corner */
  var VSTAR = (function () {
    var V = new Array(S); for (var i = 0; i < S; i++) V[i] = 0;
    for (var k = 0; k < 40; k++) V = sweep(V, true);
    return V;
  })();
  function greedySet(V) {                       /* every maximising action, per state */
    var P = [];
    for (var s = 0; s < S; s++) {
      if (TERM[s]) { P.push(null); continue; }
      var q = [], m = -1e18, a;
      for (a = 0; a < 4; a++) { q.push(-1 + V[nxt(s, a)]); if (q[a] > m) m = q[a]; }
      var set = []; for (a = 0; a < 4; a++) if (q[a] > m - 1e-9) set.push(a);
      P.push(set);
    }
    return P;
  }
  function policyOptimal(P) {                   /* is every greedy action also optimal? */
    for (var s = 0; s < S; s++) {
      if (TERM[s]) continue;
      var m = -1e18, a;
      for (a = 0; a < 4; a++) m = Math.max(m, -1 + VSTAR[nxt(s, a)]);
      for (var i = 0; i < P[s].length; i++) if (-1 + VSTAR[nxt(s, P[s][i])] < m - 1e-9) return false;
    }
    return true;
  }

  var useMax = (opts.mode === 'max'), k = 0, V = null, firstOpt = -1;

  host.innerHTML =
    '<div class="wbar"><span class="wt">One backup, stepped</span><span class="wspacer"></span>' +
    '<label class="wtog" data-mx><i></i><span>max backup (value iteration)</span></label>' +
    '<span class="wlabel">sweep</span><span class="wnum" data-k></span>' +
    '<button class="wb" data-s1>+1</button><button class="wb" data-s5>+5</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="wlabel" data-t1></div><div data-g1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="wlabel">greedy policy w.r.t. those numbers</div><div data-g2></div></div>' +
    '<div style="width:196px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-badge style="font:600 12px/1.5 var(--mono);padding:8px 10px;border-radius:2px"></div>' +
    '<div data-note style="font:400 11.5px/1.62 var(--sans);color:var(--ink3)"></div></div></div>';

  var CELL = 54, PAD = 4, GW = N * CELL + PAD * 2;
  var g1 = IE437.svg(GW, GW), g2 = IE437.svg(GW, GW);
  host.querySelector('[data-g1]').appendChild(g1);
  host.querySelector('[data-g2]').appendChild(g2);

  function frame(sv, s, fill) {
    var r = (s / N) | 0, c = s % N;
    return E('rect', { x: PAD + c * CELL, y: PAD + r * CELL, width: CELL, height: CELL,
      fill: fill || 'none', 'fill-opacity': fill ? 0.16 : 0,
      stroke: 'currentColor', 'stroke-opacity': .22 }, sv);
  }
  function drawValues() {
    while (g1.firstChild) g1.removeChild(g1.firstChild);
    /* shade by depth of value so the wave front is visible */
    var lo = 0; for (var i = 0; i < S; i++) lo = Math.min(lo, V[i]);
    for (var s = 0; s < S; s++) {
      var r = (s / N) | 0, c = s % N;
      if (!TERM[s] && lo < -1e-9) {
        E('rect', { x: PAD + c * CELL, y: PAD + r * CELL, width: CELL, height: CELL,
          fill: BLUE, 'fill-opacity': (0.03 + 0.24 * (V[s] / lo)).toFixed(3), stroke: 'none' }, g1);
      }
      frame(g1, s, TERM[s] ? GREEN : null);
      var txt = TERM[s] ? '0.0' : (Math.abs(V[s]) < 9.95 ? V[s].toFixed(1)
        : String(Math.round(V[s])) + '.');
      E('text', { x: PAD + c * CELL + CELL / 2, y: PAD + r * CELL + CELL / 2 + 4.5,
        'text-anchor': 'middle', 'font-size': 13.5, 'font-family': 'IBM Plex Mono, monospace',
        'font-weight': TERM[s] ? 700 : 500,
        fill: TERM[s] ? GREEN : 'currentColor', 'fill-opacity': TERM[s] ? 1 : .82, text: txt }, g1);
    }
  }
  function drawPolicy(P, opt) {
    while (g2.firstChild) g2.removeChild(g2.firstChild);
    for (var s = 0; s < S; s++) {
      var r = (s / N) | 0, c = s % N;
      frame(g2, s, TERM[s] ? GREEN : null);
      if (TERM[s]) continue;
      var set = P[s], gl = set.map(function (a) { return GLYPH[a]; }).join('');
      var many = set.length > 2;
      E('text', { x: PAD + c * CELL + CELL / 2, y: PAD + r * CELL + CELL / 2 + (many ? 4 : 5.5),
        'text-anchor': 'middle', 'font-size': many ? 10 : (set.length > 1 ? 13 : 17),
        fill: opt ? BLUE : 'currentColor', 'fill-opacity': opt ? .95 : .45, text: gl }, g2);
    }
  }
  function draw() {
    var P = greedySet(V), opt = policyOptimal(P);
    if (opt && firstOpt < 0) firstOpt = k;
    drawValues(); drawPolicy(P, opt);
    host.querySelector('[data-k]').textContent = 'k = ' + k;
    host.querySelector('[data-t1]').textContent = useMax
      ? 'V after k max backups' : 'V of the random policy after k sweeps';
    var b = host.querySelector('[data-badge]');
    b.textContent = opt ? 'policy already optimal' : 'policy not yet optimal';
    b.style.background = opt ? 'rgba(37,99,235,.10)' : 'rgba(22,24,29,.045)';
    b.style.color = opt ? BLUE : SLATE;
    var nx = sweep(V, useMax), conv = true;
    for (var i = 0; i < S; i++) if (Math.abs(V[i] - nx[i]) > 5e-4) conv = false;
    host.querySelector('[data-note]').innerHTML = useMax
      ? ('The max backup is value iteration. It reaches V* — minus the distance to the nearest corner — '
        + 'in <b>3</b> sweeps, and the arrows never change after that.'
        + (conv ? '<br><br><b>Values converged.</b>' : ''))
      : ('The expectation backup is policy evaluation of the random walk. '
        + 'Its values head for &minus;14, &minus;20, &minus;22 and take dozens of sweeps to arrive — '
        + 'but the arrows are optimal from <b>k = ' + (firstOpt < 0 ? '?' : firstOpt) + '</b> onward.'
        + (conv ? '<br><br><b>Values converged.</b>' : ''));
  }
  function reset() {
    k = 0; firstOpt = -1;
    V = new Array(S); for (var i = 0; i < S; i++) V[i] = 0;
    draw();
  }
  function step(n) { for (var i = 0; i < n; i++) { V = sweep(V, useMax); k++; } draw(); }

  var tog = host.querySelector('[data-mx]');
  function syncTog() { tog.className = 'wtog' + (useMax ? ' on' : ''); }
  tog.onclick = function () { useMax = !useMax; syncTog(); reset(); };
  host.querySelector('[data-s1]').onclick = function () { step(1); };
  host.querySelector('[data-s5]').onclick = function () { step(5); };
  host.querySelector('[data-rs]').onclick = reset;

  syncTog(); reset();
  return { finish: function () { if (k < 3) step(3 - k); } };
});
