/* ============================================================
   widget: dp-schedules
   Policy iteration and value iteration are the two endpoints of
   ONE family: modified policy iteration with m evaluation sweeps
   per improvement.  m = 1 is (essentially) value iteration,
   m = infinity is policy iteration, and every m between is legal.

   The arena is a 6x6 gridworld with walls, one absorbing goal,
   reward -1 on every non-goal step, gamma = 0.9, and a 0.2 chance
   of slipping perpendicular to the chosen direction -- stochastic,
   because on a deterministic grid policy iteration degenerates into
   needing as many improvements as value iteration needs sweeps.

   Cost is counted honestly, in (s,a) expectation evaluations:
     evaluation sweep   |S|      backups
     improvement sweep  |S|.|A|  backups
     value-iteration sweep |S|.|A| backups
   and both run to the SAME stopping rule, ||V - V*||_inf <= 0.01,
   with V* computed offline.  Verified in node: VI 17 sweeps /
   1972 backups; PI 9 improvements / 16124 backups; the cheapest
   schedule is m = 2 at 1740.
   ============================================================ */
IE437.widget('dp-schedules', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B', GREEN = '#16A34A';

  /* ---------- the MDP ---------- */
  var R = 6, C = 6, GOAL = 35, SLIP = 0.2, GAM = 0.9, EPS = 0.01;
  var WALL = { 8: 1, 14: 1, 20: 1, 15: 1, 21: 1, 27: 1 };
  var S = R * C, NA = 4, DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1], GLYPH = ['↑', '↓', '←', '→'];
  var dead = function (s) { return s === GOAL || WALL[s]; };
  function mv(s, a) {
    var r = (s / C) | 0, c = s % C, nr = r + DR[a], nc = c + DC[a];
    if (nr < 0 || nr >= R || nc < 0 || nc >= C) return s;
    var t = nr * C + nc; return WALL[t] ? s : t;
  }
  function trans(s, a) {                                 /* [[s',p], ...] */
    if (dead(s)) return [[s, 1]];
    var p = a < 2 ? [2, 3] : [0, 1];
    return [[mv(s, a), 1 - SLIP], [mv(s, p[0]), SLIP / 2], [mv(s, p[1]), SLIP / 2]];
  }
  function q(V, s, a) {
    var t = trans(s, a), e = 0;
    for (var i = 0; i < t.length; i++) e += t[i][1] * V[t[i][0]];
    return (s === GOAL ? 0 : -1) + GAM * e;
  }
  var LIVE = []; for (var i = 0; i < S; i++) if (!dead(i)) LIVE.push(i);

  var VSTAR = (function () {
    var V = new Array(S), k, j, s, a;
    for (j = 0; j < S; j++) V[j] = 0;
    for (k = 0; k < 20000; k++) {
      var W = V.slice(), d = 0;
      for (j = 0; j < LIVE.length; j++) {
        s = LIVE[j]; var m = -1e18;
        for (a = 0; a < NA; a++) m = Math.max(m, q(V, s, a));
        d = Math.max(d, Math.abs(m - V[s])); W[s] = m;
      }
      V = W; if (d < 1e-13) break;
    }
    return V;
  })();
  function err(V) { var e = 0; for (var j = 0; j < LIVE.length; j++) e = Math.max(e, Math.abs(V[LIVE[j]] - VSTAR[LIVE[j]])); return e; }
  var PISTAR = (function () {
    var P = new Array(S), j, s, a;
    for (j = 0; j < LIVE.length; j++) {
      s = LIVE[j]; var b = 0, bv = -1e18;
      for (a = 0; a < NA; a++) { var v = q(VSTAR, s, a); if (v > bv + 1e-12) { bv = v; b = a; } }
      P[s] = b;
    }
    return P;
  })();

  /* ---------- the three runs ---------- */
  function runVI() {
    var V = new Array(S), b = 0, k = 0, j, s, a;
    for (j = 0; j < S; j++) V[j] = 0;
    var tr = [[1, err(V)]];
    while (err(V) > EPS && k < 5000) {
      var W = V.slice();
      for (j = 0; j < LIVE.length; j++) {
        s = LIVE[j]; var m = -1e18;
        for (a = 0; a < NA; a++) { m = Math.max(m, q(V, s, a)); b++; }
        W[s] = m;
      }
      V = W; k++; tr.push([b, err(V)]);
    }
    return { name: 'value iteration', iters: k, backups: b, tr: tr, V: V, unit: 'sweeps' };
  }
  function runMPI(m) {                                   /* m = Infinity is policy iteration */
    var V = new Array(S), P = new Array(S), b = 0, outer = 0, j, s, a, tr;
    for (j = 0; j < S; j++) { V[j] = 0; P[j] = 0; }
    tr = [[1, err(V)]];
    while (err(V) > EPS && outer < 5000) {
      outer++;
      var sw = 0;
      for (;;) {
        var W = V.slice(), d = 0;
        for (j = 0; j < LIVE.length; j++) { s = LIVE[j]; var v = q(V, s, P[s]); b++; d = Math.max(d, Math.abs(v - V[s])); W[s] = v; }
        V = W; sw++;
        if (sw >= m) break;
        if (d < 1e-12) break;
        if (sw > 20000) break;
      }
      for (j = 0; j < LIVE.length; j++) {
        s = LIVE[j]; var bs = P[s], bv = -1e18;
        for (a = 0; a < NA; a++) { var vv = q(V, s, a); b++; if (vv > bv + 1e-12) { bv = vv; bs = a; } }
        P[s] = bs;
      }
      tr.push([b, err(V)]);
    }
    return { name: m === Infinity ? 'policy iteration' : 'm = ' + m, iters: outer, backups: b,
      tr: tr, V: V, P: P, unit: 'improvements' };
  }

  var MS = [1, 2, 3, 5, 10, Infinity], mi = 0;
  for (var z = 0; z < MS.length; z++) if (MS[z] === opts.m) mi = z;
  var VI = runVI(), PI = runMPI(Infinity), CACHE = {};
  function mpi(m) { if (!CACHE[m]) CACHE[m] = runMPI(m); return CACHE[m]; }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Two schedules of one dance, counted</span><span class="wspacer"></span>' +
    '<span class="wlabel">sweeps per improvement</span><span class="wnum" data-m></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;align-items:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<div class="wlabel">the shared arena</div><div data-g></div>' +
    '<div style="font:400 10px/1.4 var(--mono);color:var(--ink4);text-align:center">' +
    '6&times;6, slip 0.2<br>γ = 0.9</div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">' +
    '<div class="wlabel">distance from the optimal value, against work done</div><div data-c></div></div>' +
    '<div style="width:216px" data-stats></div></div>';

  var GS = 23, GW = C * GS + 6, grid = IE437.svg(GW, R * GS + 6);
  host.querySelector('[data-g]').appendChild(grid);
  var PW = 400, PH = 244, chart = IE437.svg(PW, PH);
  host.querySelector('[data-c]').appendChild(chart);

  (function drawGrid() {
    for (var s = 0; s < S; s++) {
      var r = (s / C) | 0, c = s % C, x = 3 + c * GS, y = 3 + r * GS;
      E('rect', { x: x, y: y, width: GS, height: GS,
        fill: WALL[s] ? INK : (s === GOAL ? GREEN : 'none'),
        'fill-opacity': WALL[s] ? .5 : (s === GOAL ? .3 : 0),
        stroke: 'currentColor', 'stroke-opacity': .18 }, grid);
      if (s === GOAL)
        E('text', { x: x + GS / 2, y: y + GS / 2 + 4, 'text-anchor': 'middle', 'font-size': 11,
          'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', fill: GREEN, text: 'G' }, grid);
      else if (!WALL[s])
        E('text', { x: x + GS / 2, y: y + GS / 2 + 4.5, 'text-anchor': 'middle', 'font-size': 12,
          fill: 'currentColor', 'fill-opacity': .45, text: GLYPH[PISTAR[s]] }, grid);
    }
  })();

  var YLO = Math.log10(0.004), YHI = Math.log10(30);
  function lg(v) { return Math.log10(Math.max(v, 1e-9)); }
  /* clamp into the plot box: IE437.plot does not clip, and policy iteration's
     final error is ~1e-13, which would otherwise draw a line off the bottom. */
  function curve(tr) {
    return tr.map(function (p) {
      return [Math.log10(Math.max(p[0], 1)), Math.max(YLO, Math.min(YHI, lg(p[1])))];
    });
  }

  function draw() {
    var m = MS[mi], cur = m === Infinity ? PI : mpi(m);
    host.querySelector('[data-m]').textContent = (m === Infinity ? '∞' : m);
    var xmax = Math.log10(Math.max(PI.backups, VI.backups, cur.backups) * 1.35);
    var ax = IE437.plot(chart, {
      w: PW, h: PH, pad: { l: 44, r: 12, t: 12, b: 30 },
      xdom: [Math.log10(60), xmax], ydom: [YLO, YHI],
      xticks: [2, 3, 4], xfmt: function (v) { return v === 2 ? '100' : v === 3 ? '1k' : '10k'; },
      yticks: [1, 0, -1, -2], yfmt: function (v) { return v === 1 ? '10' : v === 0 ? '1' : v === -1 ? '0.1' : '0.01'; },
      xlabel: 'cumulative (s,a) backups',
      series: [
        { pts: curve(PI.tr), color: SLATE, w: 1.8 },
        { pts: curve(VI.tr), color: BLUE, w: 2.0 },
        (m === Infinity) ? { pts: [] }
          : { pts: curve(cur.tr), color: AMBER, w: 2.0, dash: '5 3' }
      ]
    });
    /* the stopping line */
    var Y = ax.Y;   /* the stopping line sits inside the same box */
    E('line', { x1: 44, x2: PW - 12, y1: Y(lg(EPS)), y2: Y(lg(EPS)), stroke: INK,
      'stroke-opacity': .34, 'stroke-dasharray': '2 4' }, chart);
    E('text', { x: PW - 14, y: Y(lg(EPS)) - 5, 'text-anchor': 'end', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5,
      text: 'stop:  0.01' }, chart);

    var row = function (col, name, it, unit, bk, best) {
      return '<div style="display:flex;align-items:baseline;gap:7px;padding:7px 0;' +
        'border-bottom:1px solid rgba(22,24,29,.075)">' +
        '<span style="color:' + col + ';font:700 12px/1 var(--mono)">&#9473;&#9473;</span>' +
        '<span style="font:600 11.5px/1.3 var(--mono);color:var(--ink)">' + name + '</span>' +
        '<span style="flex:1"></span>' +
        '<span style="font:400 11px/1.3 var(--mono);color:var(--ink3);text-align:right">' +
        it + ' ' + unit + '<br><b style="color:' + (best ? BLUE : 'var(--ink2)') + '">' +
        bk.toLocaleString('en-US') + '</b> backups</span></div>';
    };
    var best = Math.min(VI.backups, PI.backups, cur.backups);
    var html = row(BLUE, 'value iteration', VI.iters, 'sweeps', VI.backups, VI.backups === best) +
      row(SLATE, 'policy iteration', PI.iters, 'improvements', PI.backups, PI.backups === best);
    if (m !== Infinity)
      html += row(AMBER, 'm = ' + m, cur.iters, 'improvements', cur.backups, cur.backups === best);
    html += '<div style="font:400 11.5px/1.6 var(--sans);color:var(--ink3);padding-top:9px">' +
      'Both stop at the same tolerance and return the <b>same</b> V* and π*. ' +
      'Policy iteration wins on iterations and loses on work by roughly <b>8&times;</b>; ' +
      'the cheapest schedule is neither endpoint.</div>';
    host.querySelector('[data-stats]').innerHTML = html;
  }
  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: MS.length - 1, step: 1, value: mi,
    on: function (v) { mi = v; draw(); }
  });

  draw();
  return { finish: function () { mi = 1; draw(); } };   /* m = 2, the cheapest schedule */
});
