/* ============================================================
   widget: backup-tree                                  (Chapter 7)
   The source deck's backup diagrams, redrawn in one language.
   A state node is a blue circle, a chance node a green dashed
   circle, and the edges take the colour of the node they leave:
   a DECISION edge (state -> chance, you choose the action) is blue,
   a CHANCE edge (chance -> state, the world chooses with T) is
   green. Emphasis is weight and fading, never a third colour; red
   is kept for comparison only (the max arcs, the improvement probe,
   the highlighted terms of a formula). A light-blue cone fanning
   out of a successor stands for its value. Plain figure panels, one
   per mode; every step redraws the picture from scratch.

   mode "tree"     pp. 19–20 — all possible trajectories: S_t, A_t,
                   S_{t+1}, A_{t+1}, S_{t+2}. Stepped (3): the root and
                   its actions; the successors with T/R; the next level;
                   then a policy is given and everything off its path
                   fades. The tree is also clickable: a decision edge
                   (or its chance node) at s, s_1 or s_2 sets the
                   policy's action there, so the audience can build the
                   path by hand; the arrow key fills in the source's
                   policy (a_2, a_1, a_2) wherever nothing was chosen,
                   and R clears the choices.
   mode "eval"     pp. 21–22, 28 — the Bellman expectation backup for
                   V^π(s): one action a_2 = π(s), two successors, two
                   value cones, then the backup written term by term.
                   Stepped (3). {"q": true} also names the chance node
                   Q^π(s,a) and stops at the cones (2).
   mode "opt"      p. 30 — Bellman optimality for V^*(s): three actions,
                   each a Q^{π*}. Step 1 puts the max arc on the edges
                   and keeps the chosen branch.
   mode "qopt"     p. 31 — Bellman optimality for Q^*(s,a): start at a
                   chance node, two successors, a max over a' at each.
                   Step 1 adds the two max arcs.
   mode "improve"  pp. 38–40 — policy improvement: the policy's action
                   a_2 in blue, V^π(s) = Q^π(s,π(s)); step 1 brings the
                   a_1 branch back and asks whether Q^π(s,a_1) beats it,
                   step 2 asks the same of a_3 (the source's three pages).
   ============================================================ */
IE437.widget('backup-tree', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', TEAL = '#0F9D8A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'eval';
  var uid = 'bt' + Math.floor(Math.random() * 1e9);
  var FADE = .25;

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- helpers ---------- */
  function svg(w, h) { var s = IE437.svg(w, h); mount.appendChild(s); defs(s); return s; }
  function defs(s) {
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['r', RED], ['a', AMBER], ['s', SLATE], ['g', GREEN]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
  }
  function arrow(s, x1, y1, x2, y2, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' }[c] || 'k';
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('line', a, s);
  }
  function curve(s, d, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' }[c] || 'k';
    var a = { d: d, fill: 'none', stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('path', a, s);
  }
  /* text with _x / _{xy} subscripts and ^x superscripts; a run between two § is red */
  function tx(s, x, y, str, a) {
    if (/[_^()=πγ≥⋯→\\′'+−]/.test(str) || /^[A-Za-z]$/.test(str) || (str.length <= 5 && /,/.test(str))) {
      var m = { 'font-size': 12 }; for (var q in a || {}) m[q] = a[q];
      m['font-size'] = Math.round(parseFloat(m['font-size']) * 1.25 * 10) / 10;   /* KaTeX faces set small */
      return IE437.math(s, x, y, str, m);
    }
    var at = { x: x, y: y, 'font-size': 12, fill: INK, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }

  /* ---------- the diagram vocabulary ---------- */
  /* a state node: blue circle, name inside */
  function state(g, x, y, r, label, fs) {
    E('circle', { cx: x, cy: y, r: r, fill: '#fff', stroke: BLUE, 'stroke-width': 1.7 }, g);
    if (label) tx(g, x, y + 4, label, { 'text-anchor': 'middle', 'font-size': fs || 12 });
  }
  /* a chance node: green dashed circle, name above or below */
  function chance(g, x, y, r, label, pos, fs) {
    E('circle', { cx: x, cy: y, r: r, fill: '#fff', stroke: GREEN, 'stroke-width': 1.7, 'stroke-dasharray': '4 3' }, g);
    if (!label) return;
    if (pos === 'right') { tx(g, x + r + 5, y + 4, label, { 'font-size': fs || 11 }); return; }
    var ly = pos === 'below' ? y + r + 12 : y - r - 6;
    tx(g, x, ly, label, { 'text-anchor': 'middle', 'font-size': fs || 11 });
  }
  /* an edge between two nodes, trimmed to their rims */
  function edge(g, x1, y1, r1, x2, y2, r2, c, extra) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    return arrow(g, x1 + ux * (r1 + 2), y1 + uy * (r1 + 2), x2 - ux * (r2 + 3), y2 - uy * (r2 + 3), c, extra);
  }
  /* a label beside an edge: lines centred at fraction t, pushed off the edge by d on one side */
  function elab(g, x1, y1, x2, y2, lines, side, o) {
    o = o || {};
    var t = o.t == null ? .5 : o.t, d = o.d == null ? 12 : o.d;
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    var nx = dy / L * side, ny = -dx / L * side;
    var px = x1 + dx * t + nx * d, py = y1 + dy * t + ny * d;
    var fs = o.fs || 10.5, fill = o.fill || SLATE;
    if (lines.length === 1) tx(g, px, py + 4, lines[0], { 'text-anchor': 'middle', 'font-size': fs, fill: fill });
    else {
      tx(g, px, py - 2, lines[0], { 'text-anchor': 'middle', 'font-size': fs, fill: fill });
      tx(g, px, py + 10, lines[1], { 'text-anchor': 'middle', 'font-size': fs, fill: fill });
    }
  }
  /* a value cone fanning right out of a state, with its V label */
  function cone(g, x, y, r, label) {
    var L = 70, h = 26, x0 = x + r;
    E('path', { d: 'M' + x0 + ' ' + y + 'L' + (x0 + L) + ' ' + (y - h) + 'L' + (x0 + L) + ' ' + (y + h) + 'Z', fill: BLUE, opacity: .12 }, g);
    E('path', { d: 'M' + x0 + ' ' + y + 'L' + (x0 + L) + ' ' + (y - h) + 'M' + x0 + ' ' + y + 'L' + (x0 + L) + ' ' + (y + h), fill: 'none', stroke: BLUE, 'stroke-width': 1, opacity: .45 }, g);
    if (label) tx(g, x0 + L + 6, y + 4, label, { fill: BLUE, 'font-size': 11.5 });
  }
  /* a red arc across a fan of edges leaving (cx, cy), between two angles in degrees */
  function maxArc(g, cx, cy, R, a0, a1) {
    var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180;
    var d = 'M' + (cx + R * Math.cos(r0)).toFixed(1) + ' ' + (cy + R * Math.sin(r0)).toFixed(1) +
            'A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(r1)).toFixed(1) + ' ' + (cy + R * Math.sin(r1)).toFixed(1);
    return E('path', { d: d, fill: 'none', stroke: RED, 'stroke-width': 2.2 }, g);
  }
  function layer(s, op) { return E('g', op != null ? { opacity: op } : {}, s); }
  function header(s, x, y, str) { tx(s, x, y, str, { 'text-anchor': 'middle', fill: SLATE, 'font-size': 12 }); }
  function deg(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; }

  /* a legend line: state node, chance node, then the two kinds of edge */
  function legend(s, x, y) {
    var lg = layer(s);
    E('circle', { cx: x + 7, cy: y, r: 7, fill: '#fff', stroke: BLUE, 'stroke-width': 1.6 }, lg);
    tx(lg, x + 19, y + 4, 'state node', { fill: SLATE, 'font-size': 11 });
    E('circle', { cx: x + 110, cy: y, r: 7, fill: '#fff', stroke: GREEN, 'stroke-width': 1.6, 'stroke-dasharray': '3 2.5' }, lg);
    tx(lg, x + 122, y + 4, 'chance node', { fill: SLATE, 'font-size': 11 });
    arrow(lg, x + 222, y, x + 262, y, BLUE, { 'stroke-width': 2 });
    tx(lg, x + 268, y + 4, 'decision edge: you choose the action', { fill: SLATE, 'font-size': 11 });
    arrow(lg, x + 502, y, x + 542, y, GREEN, { 'stroke-width': 2 });
    tx(lg, x + 548, y + 4, 'chance edge: the world chooses, with T and R', { fill: SLATE, 'font-size': 11 });
  }

  /* ============================================================
     tree — all possible trajectories, then a policy fixed (pp. 19–20)
     step 0 the root and its actions · 1 the successors with T, R ·
     2 the next level, grown from the a_2 branch · 3 a policy is given:
     π(s)=a_2, π(s_1)=a_1, π(s_2)=a_2 in red, the rest faded
     ============================================================ */
  var DEF = [1, 0, 1];                       /* the source's policy: π(s)=a_2, π(s_1)=a_1, π(s_2)=a_2 */
  var picks = [null, null, null], clicked = false;
  function drawTree(k) {
    var W = 800, H = 380, s = svg(W, H);
    var kk = Math.max(k, clicked ? 2 : 0);   /* a click opens the tree to the level it needs */
    var pol = k >= 3 || clicked;             /* policy mode: the chosen path stays, the rest fades */
    var eff = picks.map(function (p, i) { return p != null ? p : (k >= 3 ? DEF[i] : null); });
    var gLo = layer(s, pol ? FADE : null), gHi = layer(s);
    /* a decision at state `lvl` (0 = s, 1 = s_1, 2 = s_2) is "on" when chosen, "open" when nothing is chosen yet */
    function st(lvl, i) { return eff[lvl] == null ? 'open' : (eff[lvl] === i ? 'on' : 'off'); }
    function L(state) { return pol && state === 'off' ? gLo : gHi; }
    function wid(state) { return pol && state === 'on' ? { 'stroke-width': 2.6 } : {}; }
    function lab(state, c) { return pol && state === 'on' ? c : SLATE; }
    /* a clickable decision: a wide transparent line over the edge, setting picks[lvl] = i */
    function hit(x1, y1, x2, y2, lvl, i) {
      var h = E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#000', 'stroke-opacity': 0, 'stroke-width': 16, cursor: 'pointer', 'data-pick': lvl + ':' + i }, gHi);
      /* the deck advances on a click anywhere in a slide; a pick must not turn the page */
      h.addEventListener('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); picks[lvl] = i; clicked = true; render(k); });
      return h;
    }
    /* header: the policy so far */
    if (pol) {
      var parts = ['π(s) = ' + (eff[0] == null ? '?' : 'a_' + (eff[0] + 1)), 'π(s_1) = ' + (eff[1] == null ? '?' : 'a_' + (eff[1] + 1)), 'π(s_2) = ' + (eff[2] == null ? '?' : 'a_' + (eff[2] + 1))];
      tx(s, 8, 18, '\\text{' + (clicked ? 'Your policy: ' : 'A policy π is given: ') + '}' + parts.join(',\\quad '), { fill: INK, 'font-size': 12 });
      if (eff.some(function (p) { return p == null; })) tx(s, 520, 18, 'click an action at each open state', { fill: BLUE, 'font-size': 11 });
    } else {
      tx(s, 8, 18, 'All possible trajectories', { fill: INK, 'font-size': 12 });
      tx(s, 230, 18, 'click an action to start a policy', { fill: SLATE, 'font-size': 11 });
    }
    header(s, 60, 42, 'S_t'); header(s, 190, 42, 'A_t'); header(s, 330, 42, 'S_{t+1}');
    header(s, 490, 42, 'A_{t+1}'); header(s, 670, 42, 'S_{t+2}');

    var root = [60, 230], RS = 14, RC = 12, RC2 = 10, RL = 8;
    var ch = [[190, 140], [190, 230], [190, 320]];
    var succ = [[[330, 120], [330, 160]], [[330, 210], [330, 250]], [[330, 300], [330, 340]]];
    var r0 = eff[0] == null ? 1 : eff[0];    /* the branch the next level grows from */

    /* level 1: the root and its three actions (decision edges, blue) */
    ch.forEach(function (c, i) {
      var S0 = st(0, i), g = L(S0);
      edge(g, root[0], root[1], RS, c[0], c[1], RC, BLUE, wid(S0));
      elab(g, root[0], root[1], c[0], c[1], ['a_' + (i + 1)], i === 2 ? -1 : 1, { t: .55, d: 10, fill: lab(S0, BLUE) });
      chance(g, c[0], c[1], RC, 's,a_' + (i + 1), i === 2 ? 'below' : 'above');
      hit(root[0], root[1], c[0], c[1], 0, i);
    });
    state(gHi, root[0], root[1], RS, 's');

    /* level 2: every outcome of every action (chance edges, green) */
    if (kk >= 1) {
      ch.forEach(function (c, i) {
        var S0 = st(0, i), g = L(S0);
        succ[i].forEach(function (p, j) {
          edge(g, c[0], c[1], RC, p[0], p[1], RC, GREEN, wid(S0));
          if (i === 0 && j === 0 && r0 !== 0) elab(g, c[0], c[1], p[0], p[1], ['T(s,a_1,s_1)', 'R(s,a_1,s_1)'], 1, { d: 17, fs: 10 });
          if (i === r0 && j === 1) elab(g, c[0], c[1], p[0], p[1], ['T(s,a_' + (i + 1) + ',s_2)', 'R(s,a_' + (i + 1) + ',s_2)'], -1, { d: 17, fs: 10, fill: lab(S0, GREEN) });
          state(g, p[0], p[1], RC, 's_' + (j + 1), 11);
        });
      });
    }

    /* level 3: from the grown branch's two successors, every action again; the fans keep
       fixed positions so the picture does not jump when the root's action changes */
    if (kk >= 2) {
      var fans = [[[490, 110], [490, 155], [490, 200]], [[490, 260], [490, 305], [490, 350]]];
      succ[r0].forEach(function (p, j) {
        var lvl = j + 1;
        fans[j].forEach(function (c, i) {
          var S1 = st(lvl, i), g = L(S1);
          edge(g, p[0], p[1], RC, c[0], c[1], RC2, BLUE, wid(S1));
          elab(g, p[0], p[1], c[0], c[1], ['a_' + (i + 1)], j === 0 ? 1 : -1, { t: .62, d: 9, fs: 10, fill: lab(S1, BLUE) });
          chance(g, c[0], c[1], RC2, 's_' + (j + 1) + ',a_' + (i + 1), j === 0 ? 'above' : (i === 2 ? 'right' : 'below'), 10.5);
          hit(p[0], p[1], c[0], c[1], lvl, i);
          /* leaves hang off the chosen action only; while a state is still open under a hand-built
             policy nothing beyond it is shown, so the transitions unfold when the action is picked
             (the keyboard walk, which has no open states, shows the source's picture) */
          var leafOn = eff[lvl] != null ? (i === eff[lvl]) : (!clicked && i === DEF[lvl]);
          if (leafOn) [[670, c[1] - 22], [670, c[1] + 22]].forEach(function (q, m) {
            edge(g, c[0], c[1], RC2, q[0], q[1], RL, GREEN, wid(S1));
            if (j === 0 && m === 1) elab(g, c[0], c[1], q[0], q[1], ['T(s_1,a_' + (i + 1) + ',s_2)', 'R(s_1,a_' + (i + 1) + ',s_2)'], -1, { d: 17, fs: 10, fill: lab(S1, GREEN) });
            state(g, q[0], q[1], RL, '');
            tx(g, q[0] + RL + 5, q[1] + 4, 's_' + (m + 1), { fill: SLATE, 'font-size': 10.5 });
          });
        });
      });
      /* the other branches continue the same way */
      succ.forEach(function (pair, i) { if (i !== r0) pair.forEach(function (p) { tx(gLo, p[0] + RC + 8, p[1] + 4, '⋯', { fill: SLATE, 'font-size': 13 }); }); });
    }
    legend(s, 8, 372);
  }

  /* ============================================================
     eval — the Bellman expectation backup (pp. 21–22, 28)
     The tree with the policy fixed, cut at one step: s, the one action
     a_2 = π(s), two successors, two value cones. Step 3 writes the
     backup out term by term under the picture.
     {"q": true} names the chance node Q^π(s,a) and stops at the cones.
     ============================================================ */
  function drawEval(k) {
    var W = 640, H = 292, s = svg(W, H);
    var S = [70, 140], RS = 18, C = [260, 140], RC = 16;
    var succ = [[430, 75], [430, 205]];
    var g0 = layer(s);
    tx(g0, 30, 110, 'V^π(s)', { fill: BLUE, 'font-size': 12 });
    edge(g0, S[0], S[1], RS, C[0], C[1], RC, BLUE, { 'stroke-width': 2.2 });
    elab(g0, S[0], S[1], C[0], C[1], ['a_2 = π(s)'], 1, { d: 11, fs: 11, fill: BLUE });
    chance(g0, C[0], C[1], RC, 's,a_2', 'below');
    if (opts.q) tx(g0, C[0], C[1] - RC - 8, 'Q^π(s,a)', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 11.5 });
    state(g0, S[0], S[1], RS, 's');

    if (k >= 1) {
      var g1 = layer(s);
      succ.forEach(function (p, j) {
        edge(g1, C[0], C[1], RC, p[0], p[1], RS, GREEN, { 'stroke-width': 2.2 });
        elab(g1, C[0], C[1], p[0], p[1], ['T(s,π(s),s_' + (j + 1) + ')', 'R(s,π(s),s_' + (j + 1) + ')'], j === 0 ? 1 : -1, { d: 20, fill: GREEN });
        state(g1, p[0], p[1], RS, 's_' + (j + 1));
      });
    }
    if (k >= 2) {
      var g2 = layer(s);
      succ.forEach(function (p, j) { cone(g2, p[0], p[1], RS, 'V^π(s′=s_' + (j + 1) + ')'); });
    }
    if (k >= 3 && !opts.q) {
      var g3 = layer(s);
      tx(g3, 40, 262, 'V^π(s) = T(s,π(s),\\red{s_1})\\{R(s,π(s),s_1) + γV^π(s_1)\\}  +', { 'font-size': 14 });
      tx(g3, 110, 284, 'T(s,π(s),s_2)\\{R(s,π(s),s_2) + γV^π(\\red{s_2})\\}', { 'font-size': 14 });
    }
  }

  /* ============================================================
     opt — Bellman optimality for V* (p. 30)
     ============================================================ */
  function drawOpt(k) {
    var W = 580, H = 316, s = svg(W, H);
    var S = [70, 165], RS = 18, RC = 14, RL = 11;
    var ch = [[250, 70], [250, 165], [250, 260]];
    var succ = [[[400, 40], [400, 100]], [[400, 140], [400, 190]], [[400, 230], [400, 290]]];
    var gS = layer(s);
    tx(gS, 30, 133, 'V^*(s)', { fill: BLUE, 'font-size': 12 });
    state(gS, S[0], S[1], RS, 's');
    ch.forEach(function (c, i) {
      var chosen = k >= 1 && i === 0, faded = k >= 1 && i !== 0;
      var g = layer(s, faded ? FADE : null);
      edge(g, S[0], S[1], RS, c[0], c[1], RC, BLUE, chosen ? { 'stroke-width': 2.6 } : {});
      elab(g, S[0], S[1], c[0], c[1], ['a_' + (i + 1)], i === 2 ? -1 : 1, { t: .62, d: 10, fill: chosen ? BLUE : SLATE });
      chance(g, c[0], c[1], RC, '', 'above');
      tx(g, c[0], c[1] - RC - 7, 'Q^{π*}(s,a_' + (i + 1) + ')', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 11 });
      succ[i].forEach(function (p, j) {
        edge(g, c[0], c[1], RC, p[0], p[1], RL, GREEN, chosen ? { 'stroke-width': 2.6 } : {});
        state(g, p[0], p[1], RL, 's_' + (j + 1), 10.5);
        if (i === 0) cone(g, p[0], p[1], RL, 'V^*(s′=s_' + (j + 1) + ')');
      });
    });
    if (k >= 1) {
      var gm = layer(s);
      var a0 = deg(S[0], S[1], ch[0][0], ch[0][1]), a1 = deg(S[0], S[1], ch[2][0], ch[2][1]);
      maxArc(gm, S[0], S[1], 58, a0 - 7, a1 + 7);
      tx(gm, 118, 220, '\\max', { fill: RED, 'font-size': 12, 'text-anchor': 'middle' });
    }
  }

  /* ============================================================
     qopt — Bellman optimality for Q* (p. 31)
     ============================================================ */
  function drawQopt(k) {
    var W = 560, H = 316, s = svg(W, H);
    var C = [70, 165], RC = 16, RS = 18, RC2 = 10;
    var succ = [[230, 80], [230, 250]];
    var fans = [[[400, 40], [400, 80], [400, 120]], [[400, 210], [400, 250], [400, 290]]];
    var g0 = layer(s);
    tx(g0, C[0], C[1] - RC - 10, 'Q^*(s,a)', { fill: GREEN, 'text-anchor': 'middle', 'font-size': 12 });
    chance(g0, C[0], C[1], RC, 's,a', 'below');
    succ.forEach(function (p, j) {
      edge(g0, C[0], C[1], RC, p[0], p[1], RS, GREEN, { 'stroke-width': 2.2 });
      elab(g0, C[0], C[1], p[0], p[1], ['T(s,a,s_' + (j + 1) + ')', 'R(s,a,s_' + (j + 1) + ')'], j === 0 ? 1 : -1, { d: 20, fill: GREEN });
      state(g0, p[0], p[1], RS, 's_' + (j + 1));
      fans[j].forEach(function (q, i) {
        edge(g0, p[0], p[1], RS, q[0], q[1], RC2, BLUE);
        elab(g0, p[0], p[1], q[0], q[1], ['a′_' + (i + 1)], i === 2 ? -1 : 1, { t: .68, d: 9, fs: 10, fill: BLUE });
        chance(g0, q[0], q[1], RC2, '', 'above');
        tx(g0, q[0] + RC2 + 5, q[1] + 4, 's_' + (j + 1) + ',a′_' + (i + 1), { fill: SLATE, 'font-size': 10 });
      });
    });
    if (k >= 1) {
      var gm = layer(s);
      succ.forEach(function (p, j) {
        var a0 = deg(p[0], p[1], fans[j][0][0], fans[j][0][1]), a1 = deg(p[0], p[1], fans[j][2][0], fans[j][2][1]);
        maxArc(gm, p[0], p[1], 56, a0 - 8, a1 + 8);
        tx(gm, 262, j === 0 ? 50 : 296, '\\max_{a′} Q^*(s′,a′)', { fill: RED, 'text-anchor': 'middle', 'font-size': 11.5 });
      });
    }
  }

  /* ============================================================
     improve — policy improvement (pp. 38–40)
     ============================================================ */
  function drawImprove(k) {
    var W = 720, H = 316, s = svg(W, H);
    var S = [70, 165], RS = 18, RC = 14, RL = 11;
    var ch = [[250, 70], [250, 165], [250, 260]];
    var succ = [[[400, 35], [400, 90]], [[400, 135], [400, 195]], [[400, 240], [400, 295]]];
    var gS = layer(s);
    tx(gS, 30, 133, 'V^π(s)', { fill: BLUE, 'font-size': 12 });
    state(gS, S[0], S[1], RS, 's');
    ch.forEach(function (c, i) {
      var probeIdx = k === 1 ? 0 : k >= 2 ? 2 : -1;
      var policy = i === 1, probe = i === probeIdx, faded = !policy && !probe;
      var g = layer(s, faded ? FADE : null);
      var col = probe ? RED : BLUE;
      var extra = policy ? { 'stroke-width': 2.6 } : probe ? { 'stroke-width': 2.6, 'stroke-dasharray': '6 4' } : {};
      edge(g, S[0], S[1], RS, c[0], c[1], RC, col, extra);
      elab(g, S[0], S[1], c[0], c[1], [policy ? 'a_2 = π(s)' : 'a_' + (i + 1)], i === 2 ? -1 : 1, { t: .55, d: 11, fs: 11, fill: policy ? BLUE : probe ? RED : SLATE });
      chance(g, c[0], c[1], RC, '', 'above');
      tx(g, c[0], c[1] - RC - 7, 'Q^π(s,a_' + (i + 1) + ')', { fill: probe ? RED : GREEN, 'text-anchor': 'middle', 'font-size': 11 });
      succ[i].forEach(function (p, j) {
        edge(g, c[0], c[1], RC, p[0], p[1], RL, GREEN, policy ? { 'stroke-width': 2.2 } : {});
        state(g, p[0], p[1], RL, 's_' + (j + 1), 10.5);
        if (policy) cone(g, p[0], p[1], RL, 'V^π(s′=s_' + (j + 1) + ')');
      });
    });
    var gt = layer(s);
    tx(gt, 580, 160, 'V^π(s) = Q^π(s,π(s))', { fill: INK, 'font-size': 12 });
    if (k >= 1) tx(gt, 580, 184, 'Q^π(s,a_' + (k === 1 ? 1 : 3) + ') ≥ V^π(s) ?', { fill: RED, 'font-size': 12 });
  }

  /* ---------- dispatch ---------- */
  var DRAW = { tree: drawTree, eval: drawEval, opt: drawOpt, qopt: drawQopt, improve: drawImprove };
  var STEPS = { tree: 3, eval: opts.q ? 2 : 3, opt: 1, qopt: 1, improve: 2 };
  var draw = DRAW[MODE] || drawEval, n = STEPS[MODE] == null ? 2 : STEPS[MODE];

  function render(i) {
    mount.innerHTML = '';
    draw(Math.max(0, Math.min(n, i | 0)));
  }
  render(0);
  return {
    steps: n,
    step: function (i) { render(i); },
    reset: function () { picks = [null, null, null]; clicked = false; render(0); },
    finish: function () { render(n); }
  };
});
