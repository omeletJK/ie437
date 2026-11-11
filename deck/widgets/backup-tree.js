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

   Chapter 8 continues the picture with the model gone: the whole
   tree is drawn faded and one sampled path full weight over it, the
   rewards sit on the chance edges taken (green r_{t+1}), and the last
   step writes the update under the picture with its target in red.
   mode "return"   Ch 8 pp. 43–44 — Monte Carlo: the sampled episode runs
                   S_t … S_{t+2} ⋯ T; step 2 writes G_t, step 3 the
                   update V(s) ← V(s) + α[G_t − V(s)]. Stepped (3).
   mode "sample"   TD(0) on the eval layout: both successors faded with
                   their T labels, the observed one forward with r_{t+1},
                   a cone for the current estimate V(s_1); step 2 the
                   update with the TD target in red. Stepped (2; 3 with
                   nums {v, v1, r, alpha, gamma}: the numbers substituted;
                   4 with nums.mc = {r2}: the realised continuation after
                   s_1 — next step pays r2, episode ends — drawn faded
                   past s_1, and the Monte Carlo line G_t = r + γ r2,
                   V(s) ← V(s) + α[G_t − V(s)] written under the TD line,
                   so the picture shows what MC had to wait for).
   mode "sarsa"    Ch 8 pp. 51–55 — a^2 at s^0 by ε-greedy, r_{t+1} to
                   s^1, then the action chosen next by the same policy as a
                   thick blue edge (the tree's "taken" mark; the other two
                   stay faded), its value green under the node: it stands in
                   the target. The last press executes it: a green
                   transition r_{t+2} to a blank s_{t+2}. Stepped (4; 5 with
                   nums {q, r, qnext[], pick, alpha, gamma}, pick indexing
                   qnext; the numbers come before the execution).
   mode "qlearn"   Ch 8 pp. 62–66 — the same through step 1; at s^1 the
                   three actions are thin red edges (values read, not
                   taken), the argmax (from qnext, else the middle one)
                   thicker, the red max arc across them, "read for the
                   target, not executed" beside the best node. The last
                   press draws the action ε-greedy then executes (nums.pick,
                   else the bottom one) as a thick blue edge continuing to
                   s_{t+2}; the max branch ends. Without nums or pick (the
                   worked numbers) the execution is left out. Same nums;
                   with nums the fan has qnext.length edges (two or three)
                   and the values are written. {"both": true} draws the
                   executed action blue from step 2, as SARSA's tuple knows
                   it, and the last numeric step writes both lines,
                   "Q-learning:" and "SARSA:", prefixed in slate, the
                   backed-up value red in each.
                   {"both": true, "policies": true} names the two policies
                   instead (Ch 8 pp. 75–77): the data come from π_B (the
                   blue edges, a_t and a′_B), the target of Q-learning from
                   π_E = greedy(Q), never executed (red, at the max arc);
                   without nums the last written step gives the two update
                   rules, SARSA's and Q-learning's, with that note.
   Both Ch 8 options: names {s, s1, s2, a, a1, actions[]} relabels the
   sampled path (s^0 → "x=−2", s^1 → the state reached, s^2 → the other
   successor, the chosen action → "heat", …) in node labels and in the
   written-out lines, set upright; named circles are drawn wider and
   their label shrinks to fit. names.actions with TWO entries draws two
   root actions (the chosen one is the second) and the same two at s^1,
   matching a two-entry qnext.
   Written lines: a negative number after an operator is parenthesised,
   0.9·(−1) − (−4); the red side note goes inline after a short line and
   on its own right-aligned row under a long one (names); the rows are
   laid out from the bottom of the SVG and the tree shrinks vertically
   when three or four rows are written, so nothing runs past the bottom.
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
    if (label) fit(tx(g, x, y + 4, label, { 'text-anchor': 'middle', 'font-size': fs || 12 }), 2 * r - 6);
  }
  /* a label that must stay inside a width: shrink its face when the slide is laid out and it is wider
     (a hidden slide measures 0 and is left alone; it is redrawn on entry) */
  function fit(t, maxW) {
    var w = 0; try { w = t.getComputedTextLength(); } catch (e) { }
    if (!w || w <= maxW) return t;
    var fs = parseFloat(t.getAttribute('font-size')) || 12, k = maxW / w;
    t.setAttribute('font-size', Math.round(fs * k * 10) / 10);
    var sp = t.getElementsByTagName('tspan');
    for (var i = 0; i < sp.length; i++) {
      var f = sp[i].getAttribute('font-size'); if (f) sp[i].setAttribute('font-size', Math.round(parseFloat(f) * k * 10) / 10);
      var dy = sp[i].getAttribute('dy'); if (dy) sp[i].setAttribute('dy', Math.round(parseFloat(dy) * k * 10) / 10);
    }
    return t;
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

  /* ============================================================
     Chapter 8 — the same tree, but the model is gone: one sampled
     path is drawn full weight over the whole tree faded, rewards sit
     on the chance edges actually taken, and the last step writes the
     update under the picture with its target in red.
     Shared options: names {s, s1, s2, a, a1, actions[]} relabels the
     sampled path for the temperature example (set upright, in \text);
     nums substitutes numbers on one more step.
     ============================================================ */
  var NM = opts.names || {}, NUMS = opts.nums || null;
  var NAMED = !!(NM.s || NM.s1 || NM.s2 || NM.a || NM.a1 || NM.actions);   /* the written lines are long */
  function nm(key, dflt) { return NM[key] ? '\\text{' + NM[key] + '}' : dflt; }
  /* a name set upright inside a circle of radius r needs a smaller face than a symbol */
  function nfs(r, named, dflt) { return !named ? dflt : r <= 12 ? 8 : r <= 13 ? 8.5 : r <= 15 ? 9 : r <= 17 ? 9.5 : 10; }
  function fix2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  /* a number written after an operator: a negative one is parenthesised, 0.9·(−1) − (−4) */
  function pn(v) { return v < 0 ? '(' + v + ')' : String(v); }
  /* the maths renderer spaces every minus as a binary sign (thin spaces); after "(", "[" or a space it is unary */
  function tight(t) {
    var sp = t.getElementsByTagName('tspan');
    for (var i = 0; i < sp.length; i++) {
      if (!/^\s−\s$/.test(sp[i].textContent)) continue;
      var prev = i ? sp[i - 1].textContent : '';
      if (!prev || /[(\[\s]$/.test(prev)) sp[i].textContent = '−';
    }
    return t;
  }
  /* rows of written lines, laid out upwards from the bottom of an SVG of height H */
  function rowY(H, rows, i) { return H - 10 - 22 * (rows - 1 - i); }
  /* the symbols of a sampled path: sup = the source's s^k, a^k (pp. 51–66), else Ch 7's s_k, a_k */
  function symbols(sup) {
    return {
      s: nm('s', sup ? 's^0' : 's'),
      succ: function (j) { return j ? nm('s2', sup ? 's^2' : 's_2') : nm('s1', sup ? 's^1' : 's_1'); },
      a: function (i, chosen) {
        if (NM.actions && NM.actions[i]) return '\\text{' + NM.actions[i] + '}';
        if (chosen && NM.a) return '\\text{' + NM.a + '}';
        return (sup ? 'a^' : 'a_') + (i + 1);
      },
      a1: function (i) {
        if (NM.actions && NM.actions[i]) return '\\text{' + NM.actions[i] + '}';
        return NM.a1 ? '\\text{' + NM.a1 + '}' : (sup ? 'a^' : 'a_') + (i + 1);
      }
    };
  }
  /* a written-out line under the picture, and a red side note after it */
  function line(g, x, y, str) { return tight(tx(g, x, y, str, { 'font-size': 14 })); }
  /* the same line opening with a name in slate: "Q-learning:  Q(s,a) ← …" */
  function named(g, x, y, prefix, str) {
    var t = line(g, x, y, '\\text{' + prefix + '  }' + str);
    if (t.firstChild) t.firstChild.setAttribute('fill', SLATE);
    return t;
  }
  /* the note sits after the line when it fits; `own` (a long, named line) puts it on the row below,
     right-aligned; `ownY` is that row's baseline (default y + 20) */
  function note(g, t, y, str, W, own, ownY) {
    var w = 0; try { w = t.getComputedTextLength(); } catch (e) { }
    if (!w) w = (t.textContent || '').length * 7.2;          /* the slide is not laid out yet */
    var x = parseFloat(t.getAttribute('x')) + w + 14;
    var plain = str.replace(/\\text\{|\}/g, '');                 /* the markup takes no room */
    if (own || x + plain.length * 5.6 > W - 6) tx(g, W - 10, ownY == null ? y + 20 : ownY, str, { fill: RED, 'font-size': 11, 'text-anchor': 'end' });
    else tx(g, x, y, str, { fill: RED, 'font-size': 11 });
  }
  /* the faded trajectory tree behind a sampled path: root, three actions with two outcomes
     each, and from the chosen branch's first successor three actions again. G holds the
     geometry; Y the symbols; the labels of the sampled branch are drawn again, full, by the
     caller, so the base keeps every label plain */
  function baseTree(g, G, Y, pick) {
    var root = G.root, ch = G.ch, succ = G.succ, fans = G.fans;
    ch.forEach(function (c, i) {
      edge(g, root[0], root[1], G.RS, c[0], c[1], G.RC, BLUE);
      elab(g, root[0], root[1], c[0], c[1], [Y.a(i, i === pick)], i === ch.length - 1 ? -1 : 1, { t: .55, d: 10 });
      chance(g, c[0], c[1], G.RC, Y.s + ',' + Y.a(i, i === pick), 'above');
      succ[i].forEach(function (p, j) {
        edge(g, c[0], c[1], G.RC, p[0], p[1], G.RC, GREEN);
        state(g, p[0], p[1], G.RC, Y.succ(j), nfs(G.RC, NM.s1 || NM.s2, 11));
        if (i !== pick) tx(g, p[0] + G.RC + 8, p[1] + 4, '⋯', { fill: SLATE, 'font-size': 13 });
      });
    });
    var p = succ[pick][0];
    fans.forEach(function (c, i) {
      edge(g, p[0], p[1], G.RC, c[0], c[1], G.RC2, BLUE);
      elab(g, p[0], p[1], c[0], c[1], [Y.a1(i)], i === fans.length - 1 ? -1 : 1, { t: .62, d: 9, fs: 10 });
      chance(g, c[0], c[1], G.RC2, G.fanLabels === false ? '' : G.fanLabel(i), G.fanPos ? G.fanPos(i) : 'right', 10.5);
    });
    state(g, root[0], root[1], G.RS, Y.s, nfs(G.RS, NM.s, 12));
  }

  /* ============================================================
     return — Monte Carlo (pp. 43–44): one whole episode is sampled
     and its discounted reward sum G_t is the target. Stepped (3).
     ============================================================ */
  function drawReturn(k) {
    var W = 740, H = 336, s = svg(W, H);
    var Y = symbols(false), PICK = 1, NEXT = 0;
    var G = { root: [50, 160], RS: 14, RC: 12, RC2: 10,
      ch: [[165, 80], [165, 160], [165, 240]],
      succ: [[[280, 60], [280, 100]], [[280, 140], [280, 180]], [[280, 220], [280, 260]]],
      fans: [[400, 100], [400, 140], [400, 180]],
      fanLabel: function (i) { return Y.succ(0) + ',' + Y.a1(i); },
      fanPos: function (i) { return i === 0 ? 'above' : 'right'; } };
    var leaves = [[520, 80], [520, 120]], RL = 8, T = [655, 120];
    header(s, 50, 22, 'S_t'); header(s, 165, 22, 'A_t'); header(s, 280, 22, 'S_{t+1}');
    header(s, 400, 22, 'A_{t+1}'); header(s, 520, 22, 'S_{t+2}'); header(s, T[0], 22, 'S_T');
    var gLo = layer(s, FADE), gHi = layer(s);
    baseTree(gLo, G, Y, PICK);
    leaves.forEach(function (q, m) {
      edge(gLo, G.fans[NEXT][0], G.fans[NEXT][1], G.RC2, q[0], q[1], RL, GREEN);
      state(gLo, q[0], q[1], RL, '');
      tx(gLo, q[0] + RL + 5, q[1] + 4, Y.succ(m), { fill: SLATE, 'font-size': 10.5 });
    });
    /* the sampled path, full weight: s —a_2→ (s,a_2) —r_{t+1}→ s_1 —a_1→ (s_1,a_1) —r_{t+2}→ s_2 ⋯ r_T → T */
    var root = G.root, c = G.ch[PICK], p = G.succ[PICK][0], f = G.fans[NEXT], q = leaves[1];
    edge(gHi, root[0], root[1], G.RS, c[0], c[1], G.RC, BLUE, { 'stroke-width': 2.6 });
    elab(gHi, root[0], root[1], c[0], c[1], [Y.a(PICK, true)], 1, { t: .55, d: 10, fill: BLUE });
    chance(gHi, c[0], c[1], G.RC, Y.s + ',' + Y.a(PICK, true), 'above');
    state(gHi, root[0], root[1], G.RS, Y.s, nfs(G.RS, NM.s, 12));
    if (k >= 1) {
      edge(gHi, c[0], c[1], G.RC, p[0], p[1], G.RC, GREEN, { 'stroke-width': 2.6 });
      elab(gHi, c[0], c[1], p[0], p[1], ['r_{t+1}'], 1, { t: .5, d: 11, fs: 11, fill: GREEN });
      state(gHi, p[0], p[1], G.RC, Y.succ(0), nfs(G.RC, NM.s1, 11));
      edge(gHi, p[0], p[1], G.RC, f[0], f[1], G.RC2, BLUE, { 'stroke-width': 2.6 });
      elab(gHi, p[0], p[1], f[0], f[1], [Y.a1(NEXT)], 1, { t: .62, d: 9, fs: 10, fill: BLUE });
      chance(gHi, f[0], f[1], G.RC2, G.fanLabel(NEXT), 'above', 10.5);
      edge(gHi, f[0], f[1], G.RC2, q[0], q[1], RL, GREEN, { 'stroke-width': 2.6 });
      elab(gHi, f[0], f[1], q[0], q[1], ['r_{t+2}'], -1, { t: .5, d: 11, fs: 11, fill: GREEN });
      state(gHi, q[0], q[1], RL, '');
      tx(gHi, q[0] + RL + 5, q[1] + 4, Y.succ(1), { fill: SLATE, 'font-size': 10.5 });
      tx(gHi, 578, q[1] + 4, '⋯', { fill: GREEN, 'font-size': 14, 'text-anchor': 'middle' });
      arrow(gHi, 598, q[1], T[0] - 12, q[1], GREEN, { 'stroke-width': 2.6 });
      tx(gHi, 621, q[1] - 13, 'r_T', { fill: GREEN, 'font-size': 11, 'text-anchor': 'middle' });
      E('rect', { x: T[0] - 9, y: T[1] - 9, width: 18, height: 18, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, gHi);
      tx(gHi, T[0], T[1] + 4, 'T', { 'text-anchor': 'middle', 'font-size': 11 });
      tx(gHi, T[0] + 14, T[1] + 4, 'terminal', { fill: SLATE, 'font-size': 10.5 });
    }
    if (k >= 2) {
      var g2 = layer(s);
      var t = line(g2, 40, 300, 'G_t = r_{t+1} + γ r_{t+2} + γ^2 r_{t+3} + \\cdots + γ^{T−t−1} r_T');
      note(g2, t, 300, 'the return actually collected', W);
    }
    if (k >= 3) line(layer(s), 40, 324, 'V(' + Y.s + ')\\ \\leftarrow\\ V(' + Y.s + ') + α[\\red{G_t} − V(' + Y.s + ')]');
  }

  /* ============================================================
     sample — TD(0): the eval picture with the model gone. Both
     successors stay faded with their T labels; the one the world
     chose comes forward with r_{t+1}, and the cone at s_1 is the
     current estimate. Stepped (2; 3 with nums).
     ============================================================ */
  function drawSample(k) {
    var MC = NUMS && NUMS.mc && NUMS.mc.r2 != null ? NUMS.mc : null;
    var rows = 1 + (NUMS ? 1 : 0) + (MC ? 1 : 0);
    var W = MC ? 760 : 720, H = 248 + 22 * rows, s = svg(W, H);
    var Y = symbols(false), A = nm('a', 'a');
    var S = [70, 140], RS = 18, C = [260, 140], RC = 16;
    var succ = [[430, 75], [430, 205]];
    var gLo = layer(s, FADE), g0 = layer(s);
    tx(g0, 30, 110, 'V(' + Y.s + ')', { fill: BLUE, 'font-size': 12 });
    edge(g0, S[0], S[1], RS, C[0], C[1], RC, BLUE, { 'stroke-width': 2.2 });
    elab(g0, S[0], S[1], C[0], C[1], [A + ' = π(' + Y.s + ')'], 1, { d: 11, fs: 11, fill: BLUE });
    chance(g0, C[0], C[1], RC, Y.s + ',' + A, 'below');
    state(g0, S[0], S[1], RS, Y.s, nfs(RS, NM.s, 12));
    succ.forEach(function (p, j) {
      if (k >= 1 && j === 0) return;
      edge(gLo, C[0], C[1], RC, p[0], p[1], RS, GREEN, { 'stroke-width': 2.2 });
      elab(gLo, C[0], C[1], p[0], p[1], ['T(' + Y.s + ',' + A + ',' + Y.succ(j) + ')', 'R(' + Y.s + ',' + A + ',' + Y.succ(j) + ')'], j === 0 ? 1 : -1, { t: NM.s ? .4 : .5, d: NM.s ? 22 : 20, fill: GREEN });
      state(gLo, p[0], p[1], RS, Y.succ(j), nfs(RS, NM.s1 || NM.s2, 12));
    });
    if (k >= 1) {
      var g1 = layer(s), p = succ[0];
      edge(g1, C[0], C[1], RC, p[0], p[1], RS, GREEN, { 'stroke-width': 2.6 });
      elab(g1, C[0], C[1], p[0], p[1], ['r_{t+1}'], -1, { d: 12, fs: 11, fill: GREEN });
      state(g1, p[0], p[1], RS, Y.succ(0), nfs(RS, NM.s1, 12));
      cone(g1, p[0], p[1], RS, 'V(' + Y.succ(0) + ')\\ \\text{(current estimate)}');
    }
    if (k >= 2) {
      var g2 = layer(s);
      var t = line(g2, 40, rowY(H, rows, 0), 'V(' + Y.s + ')\\ \\leftarrow\\ V(' + Y.s + ') + α[\\red{r_{t+1} + γ V(' + Y.succ(0) + ')} − V(' + Y.s + ')]');
      note(g2, t, rowY(H, rows, 0), 'TD target', W);
    }
    if (k >= 3 && NUMS) {
      var n = NUMS, v = n.v + n.alpha * (n.r + n.gamma * n.v1 - n.v);
      line(layer(s), 40, rowY(H, rows, 1), '= ' + n.v + ' + ' + n.alpha + '[' + n.r + ' + ' + n.gamma + '\\cdot' + pn(n.v1) + ' − ' + pn(n.v) + '] = ' + fix2(v));
    }
    /* the continuation Monte Carlo had to wait for: s_1 —a′→ chance —r_{t+2}→ T, drawn faded, and its line */
    if (k >= 4 && MC) {
      var n2 = NUMS, Gt = Math.round((n2.r + n2.gamma * MC.r2) * 1000) / 1000, vm = n2.v + n2.alpha * (Gt - n2.v);
      var gm = layer(s, .45), p1 = succ[0], c2 = [518, 150], T = [606, 190], RC2 = 11, RT = 9;
      edge(gm, p1[0], p1[1], RS, c2[0], c2[1], RC2, BLUE, { 'stroke-width': 2.2 });
      elab(gm, p1[0], p1[1], c2[0], c2[1], ['a′'], -1, { t: .55, d: 10, fs: 10.5, fill: BLUE });
      chance(gm, c2[0], c2[1], RC2, '', 'right');
      edge(gm, c2[0], c2[1], RC2, T[0], T[1], RT + 2, GREEN, { 'stroke-width': 2.2 });
      elab(gm, c2[0], c2[1], T[0], T[1], ['r_{t+2} = ' + MC.r2], -1, { t: .5, d: 14, fs: 11, fill: GREEN });
      E('rect', { x: T[0] - RT, y: T[1] - RT, width: 2 * RT, height: 2 * RT, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, gm);
      tx(gm, T[0], T[1] + 4, 'T', { 'text-anchor': 'middle', 'font-size': 11 });
      tx(gm, T[0] + RT + 5, T[1] + 4, 'episode ends', { fill: SLATE, 'font-size': 10.5 });
      named(layer(s), 40, rowY(H, rows, 2), 'Monte Carlo, once the episode ends:',
        '\\red{G_t} = ' + n2.r + ' + ' + n2.gamma + '\\cdot' + pn(MC.r2) + ' = ' + Gt + ',\\quad V(' + Y.s + ')\\ \\leftarrow\\ ' +
        n2.v + ' + ' + n2.alpha + '[\\red{' + pn(Gt) + '} − ' + pn(n2.v) + '] = ' + fix2(vm));
    }
  }

  /* ============================================================
     sarsa (pp. 51–55) and qlearn (pp. 62–66): two levels of the tree,
     the behaviour policy's a^2 at s^0, the observed r_{t+1} to s^1, then
     what happens at s^1. The grammar is the tree's own: a thick blue
     edge is an action the agent takes, a faded one an action it does
     not, a thin red edge a value only read. SARSA: a′ chosen (blue),
     the update reads it, then it is executed. Q-learning: the three
     values read (red) and the max backed up; after the update the agent
     chooses a′ by ε-greedy (blue), whichever it is, and executes it; the
     max branch ends there, never executed. The last press draws the
     execution: a green transition from the blue branch to s_{t+2}.
     Stepped (4; 5 with nums, the numbers before the execution).
     ============================================================ */
  function drawControl(k, ql) {
    var Y = symbols(true), PICK = 1, BOTH = ql && !!opts.both;
    var POL = BOTH && !!opts.policies;                        /* name π_B on the data and π_E on the target */
    var n = NUMS;
    var hasPick = !!(n && n.pick != null);
    var NEXT = hasPick ? n.pick : (ql ? 2 : 0);              /* the action the behaviour policy takes next */
    /* how many actions: at the root names.actions decides, at s^1 qnext (or the same names) */
    var nA = NM.actions && NM.actions.length === 2 ? 2 : 3;
    var nF = n && n.qnext && n.qnext.length === 2 ? 2 : (nA === 2 ? 2 : 3);
    /* the argmax at s^1: from qnext when given, else the middle action, so that the picture has one */
    var ARG = 1;
    if (n && n.qnext) { ARG = 0; for (i = 1; i < n.qnext.length; i++) if (n.qnext[i] > n.qnext[ARG]) ARG = i; }
    if (ARG >= nF) ARG = nF - 1;
    /* Q-learning draws the executed action only where the story has one: the concept slides
       (no nums) and the comparisons (nums.pick); the worked numbers alone leave it out */
    var EXEC = !ql || !n || hasPick, kExec = n ? 5 : 4;
    /* the rows written under the tree: the update, its note on its own row when the line is long
       (names), then one numeric row, or two with "both"; the tree shrinks to leave them room */
    var rows = 1 + (NAMED ? 1 : 0) + (n ? (BOTH ? 2 : 1) : (POL ? 1 : 0));
    /* one written row needs less canvas; the formula slides below the figure gain the room */
    var W = 760, H = rows >= 2 ? 336 : 324, s = svg(W, H);
    var f = rows >= 4 ? .75 : rows >= 3 ? .85 : 1, cy = rows >= 4 ? 140 : rows >= 3 ? 150 : 160;
    var circ = !!(NM.s || NM.s1 || NM.s2);
    var RS = circ ? 20 : 16, RC = circ ? (nA === 2 ? 17 : 15) : 13, RC2 = 11;
    var pitch = nA === 2 ? 110 : circ ? 90 : 85, dS = circ ? 26 : 22;
    function yy(d) { return Math.round((cy + d * f) * 10) / 10; }     /* a vertical offset from the root, scaled */
    var ch = [], succ = [], i;
    for (i = 0; i < nA; i++) {
      var d = (i - (nA - 1) / 2) * pitch;
      ch.push([230, yy(d)]); succ.push([[370, yy(d - dS)], [370, yy(d + dS)]]);
    }
    var p = succ[PICK][0], fans = [];
    for (i = 0; i < nF; i++) fans.push([520, Math.round((p[1] + (i - (nF - 1) / 2) * 50 * f) * 10) / 10]);
    var G = { root: [70, cy], RS: RS, RC: RC, RC2: RC2, ch: ch, succ: succ, fans: fans,
      fanLabel: function (i) { return Y.succ(0) + ',' + Y.a1(i); }, fanLabels: k < 2 };
    header(s, 70, 22, 'S_t'); header(s, 230, 22, 'A_t'); header(s, 370, 22, 'S_{t+1}'); header(s, 520, 22, ql ? '\\max A_{t+1}' : 'A_{t+1}');
    var gLo = layer(s, FADE), gHi = layer(s);
    baseTree(gLo, G, Y, PICK);
    var root = G.root, c = G.ch[PICK];
    /* step 0: the behaviour policy picks a^2 at s^0 */
    edge(gHi, root[0], root[1], G.RS, c[0], c[1], G.RC, BLUE, { 'stroke-width': 2.6 });
    elab(gHi, root[0], root[1], c[0], c[1], [Y.a(PICK, true)], nA === 2 ? -1 : 1, { t: .55, d: 10, fill: BLUE });
    chance(gHi, c[0], c[1], G.RC, Y.s + ',' + Y.a(PICK, true), 'above');
    var rootLbl = POL ? 'a_t ∼ π_B\\ \\text{(the behaviour policy drives)}' : 'a_t \\leftarrow ε\\text{-greedy}(Q(s_t,\\cdot))';
    if (nA === 2) tx(gHi, 8, cy + 62, rootLbl, { fill: BLUE, 'font-size': 9.5 });
    else tx(gHi, 128, cy + 23, rootLbl, { fill: BLUE, 'font-size': 9.5 });
    state(gHi, root[0], root[1], G.RS, Y.s, nfs(G.RS, NM.s, 12));
    /* step 1: the world answers with s^1 and r_{t+1} */
    if (k >= 1) {
      edge(gHi, c[0], c[1], G.RC, p[0], p[1], G.RC, GREEN, { 'stroke-width': 2.6 });
      elab(gHi, c[0], c[1], p[0], p[1], ['r_{t+1}'], 1, { t: .5, d: 11, fs: 11, fill: GREEN });
      state(gHi, p[0], p[1], G.RC, Y.succ(0), nfs(G.RC, NM.s1, 12));
    }
    /* the fan node labels sit under their nodes, so that the executed branch can continue to the right */
    function fanText(g, i, str, col, op) {
      var f = G.fans[i];
      tight(tx(g, f[0], f[1] + G.RC2 + 12, str, { 'text-anchor': 'middle', fill: col, 'font-size': 10.5, opacity: op == null ? 1 : op }));
    }
    /* the executed next action: a thick blue edge, as a_t at the root */
    function execEdge(g, i, lbl, withLabel) {
      var f = G.fans[i];
      edge(g, p[0], p[1], G.RC, f[0], f[1], G.RC2, BLUE, { 'stroke-width': 2.6 });
      if (withLabel) elab(g, p[0], p[1], f[0], f[1], [Y.a1(i)], i === G.fans.length - 1 ? -1 : 1, { t: .62, d: 9, fs: 10, fill: BLUE });
      chance(g, f[0], f[1], G.RC2, '', 'right');
      if (lbl) tx(g, 430, G.fans[G.fans.length - 1][1] + G.RC2 + 34, lbl, { fill: BLUE, 'font-size': 9.5 });
    }
    var nextLbl = POL ? 'a′_B ∼ π_B\\text{: chosen by the policy that acts}'
      : ql ? 'a′ \\leftarrow ε\\text{-greedy}(Q(s′,\\cdot))\\text{: chosen after the update, best or not}'
      : 'a′ \\leftarrow ε\\text{-greedy}(Q(s′,\\cdot))\\text{: chosen now, in the target}';
    var blueNow = ql && EXEC && (BOTH || k >= kExec);        /* the executed action is already known in blue */
    /* step 2: what the target reads at s^1 */
    if (k >= 2) {
      var g2 = layer(s);
      if (!ql) {
        /* SARSA: one action chosen now, the others stay faded; its value is the target */
        execEdge(g2, NEXT, nextLbl, true);
        var vS = n && n.qnext && n.qnext[NEXT] != null ? ' = ' + n.qnext[NEXT] : '';
        fanText(g2, NEXT, 'Q(' + G.fanLabel(NEXT) + ')' + vS, GREEN);
      } else {
        /* Q-learning: every action's value is read, in red, and the max is kept */
        G.fans.forEach(function (f, i) {
          var val = n && n.qnext && n.qnext[i] != null ? ' = ' + n.qnext[i] : '';
          var isNext = blueNow && i === NEXT;
          if (!isNext) edge(g2, p[0], p[1], G.RC, f[0], f[1], G.RC2, RED, { 'stroke-width': i === ARG ? 2.2 : 1.3, opacity: i === ARG ? 1 : .6 });
          elab(g2, p[0], p[1], f[0], f[1], [Y.a1(i)], i === G.fans.length - 1 ? -1 : 1, { t: .62, d: 9, fs: 10, fill: isNext ? BLUE : i === ARG ? RED : SLATE });
          chance(g2, f[0], f[1], G.RC2, '', 'right');
          if (i !== ARG) fanText(g2, i, 'Q(' + G.fanLabel(i) + ')' + val, GREEN, val ? 1 : .55);
        });
        var fst = G.fans[0], lst = G.fans[G.fans.length - 1];
        maxArc(g2, p[0], p[1], 52, deg(p[0], p[1], fst[0], fst[1]) - 8, deg(p[0], p[1], lst[0], lst[1]) + 8);
        /* the best action's node carries the max itself, beside it; above it when that branch also continues */
        var fa = G.fans[ARG], mx = fa[0] + G.RC2 + 6, my = fa[1] + 4;
        if (EXEC && ARG === NEXT) { mx = fa[0] - 30; my = fa[1] - G.RC2 - 21; }
        var vMax = n && n.qnext ? ' = ' + n.qnext[ARG] : '';
        tight(tx(g2, mx, my, '\\max_{a′} Q(' + Y.succ(0) + ',a′)' + vMax + (POL ? '\\text{: } π_E = \\text{greedy}(Q)' : ''), { fill: RED, 'font-size': 11 }));
        tx(g2, mx, my + 13, POL ? '\\text{read for the target, never executed}' : '\\text{read for the target, not executed}', { fill: RED, 'font-size': 9.5 });
        /* the comparisons know the action taken next already: SARSA's tuple carries it */
        if (BOTH && EXEC) execEdge(g2, NEXT, nextLbl, false);
      }
    }
    /* step 3: the update, target in red */
    var Qsa = 'Q(' + Y.s + ',' + Y.a(PICK, true) + ')';
    var target = ql ? '\\max_{a′} Q(' + Y.succ(0) + ',a′)' : 'Q(' + G.fanLabel(NEXT) + ')';
    if (k >= 3 && POL && !n) {
      /* the two rules on the same tuple: SARSA reads π_B's next action, Q-learning reads π_E's */
      var g3p = layer(s), yS = rowY(H, rows, 0), yQ = rowY(H, rows, 1);
      var tS = named(g3p, 30, yS, 'SARSA:', Qsa + '\\ \\leftarrow\\ ' + Qsa + ' + α[r_{t+1} + γ\\,\\red{Q(' + Y.succ(0) + ',a′_B)} − ' + Qsa + ']');
      note(g3p, tS, yS, 'a′_B\\text{: what } π_B \\text{ does}', W);
      var tQ = named(g3p, 30, yQ, 'Q-learning:', Qsa + '\\ \\leftarrow\\ ' + Qsa + ' + α[r_{t+1} + γ\\,\\red{\\max_{a′} Q(' + Y.succ(0) + ',a′)} − ' + Qsa + ']');
      note(g3p, tQ, yQ, '\\text{what } π_E \\text{ would do}', W);
    } else if (k >= 3) {
      var g3 = layer(s), y3 = rowY(H, rows, 0);
      var t = line(g3, 30, y3, Qsa + '\\ \\leftarrow\\ ' + Qsa + ' + α[r_{t+1} + γ\\,\\red{' + target + '} − ' + Qsa + ']');
      note(g3, t, y3, ql ? 'the best action, executed or not' : 'the action chosen, executed next', W, NAMED, rowY(H, rows, 1));
    }
    /* step 4: the numbers; with "both" the same transition backed up by each rule */
    if (k >= 4 && n) {
      var g4 = layer(s), r0 = NAMED ? 2 : 1;
      function numeric(qn) {
        var q = n.q + n.alpha * (n.r + n.gamma * qn - n.q);
        return n.q + ' + ' + n.alpha + '[' + n.r + ' + ' + n.gamma + '\\cdot\\red{' + pn(qn) + '} − ' + pn(n.q) + '] = ' + fix2(q);
      }
      var qMax = Math.max.apply(null, n.qnext), qPick = n.qnext[NEXT];
      if (BOTH) {
        named(g4, 30, rowY(H, rows, r0), 'Q-learning:', Qsa + '\\ \\leftarrow\\ ' + numeric(qMax));
        named(g4, 30, rowY(H, rows, r0 + 1), 'SARSA:', Qsa + '\\ \\leftarrow\\ ' + numeric(qPick));
      } else line(g4, 30, rowY(H, rows, r0), '= ' + numeric(ql ? qMax : qPick));
    }
    /* last step: the execution. Q-learning chooses its next action only now, by ε-greedy, whichever
       it is; the blue branch continues into the world with a green transition to s_{t+2}, the max
       branch does not */
    if (k >= kExec && EXEC) {
      var g5 = layer(s);
      if (ql && !BOTH) execEdge(g5, NEXT, nextLbl, false);
      var fx = G.fans[NEXT], sx = [640, fx[1]];
      header(g5, 640, 22, 'S_{t+2}');
      edge(g5, fx[0], fx[1], G.RC2, sx[0], sx[1], G.RC, GREEN, { 'stroke-width': 2.6 });
      elab(g5, fx[0], fx[1], sx[0], sx[1], ['r_{t+2}'], 1, { t: .5, d: 10, fs: 10.5, fill: GREEN });
      state(g5, sx[0], sx[1], G.RC, '', 11);
      tx(g5, sx[0] + G.RC + 6, sx[1] + 4, '\\text{executed}', { fill: GREEN, 'font-size': 10 });
    }
  }
  function drawSarsa(k) { drawControl(k, false); }
  function drawQlearn(k) { drawControl(k, true); }

  /* ---------- dispatch ---------- */
  var DRAW = { tree: drawTree, eval: drawEval, opt: drawOpt, qopt: drawQopt, improve: drawImprove,
    'return': drawReturn, sample: drawSample, sarsa: drawSarsa, qlearn: drawQlearn };
  var STEPS = { tree: 3, eval: opts.q ? 2 : 3, opt: 1, qopt: 1, improve: 2,
    'return': 3, sample: NUMS ? (NUMS.mc && NUMS.mc.r2 != null ? 4 : 3) : 2, sarsa: NUMS ? 5 : 4, qlearn: NUMS ? 5 : 4 };
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
