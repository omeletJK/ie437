/* ============================================================
   widget: mdp-pictures                                (Chapter 7)
   The source deck's pictures of Markov decision processes and
   dynamic programming, redrawn. Plain figure panels, one per mode.

   mode "career"   p. 6  — one state, three actions, one of them opening
                   onto many possible next states. Stepped (1 step).
   mode "loop"     p. 12 — agent and environment exchanging a_t and r_t
                   over t, t+1, t+2, t+3, towards the goals
   mode "graph"    pp. 9, 11 — the MDP as a graphical model; three time
                   slices, or one slice when {"stationary": true}
   mode "grid"     p. 36 — the 4 x 4 gridworld with its two terminal
                   corners and the move table on the right
   mode "arrays"   p. 35 — two-arrays policy evaluation against the
                   in-place update
   mode "async"    p. 52 — a full sweep against updates in any order
   mode "gpi"      p. 54 — generalised policy iteration: evaluation and
                   improvement zigzagging into V*, pi*. Stepped (2 steps).
                   {"labels": "q"} writes the Ch 8 form: Q = Q^π, π =
                   ε-greedy(Q), meeting at Q*, π*.
   mode "count"    Ch 8 p. 15 — a model learned by counting: the 3 x 3 grid
                   (A above, B C D across, E below; exits at A −10 and D +10),
                   four episodes drawn as arrows one per press, each in its
                   own colour and offset so parallel arrows stay visible, and
                   on the right the counted T̂ and R̂ filling in as the
                   episodes arrive. Stepped (4).
   mode "readoff"  p. 47 — policy improvement on the gridworld: V^π of the
                   random policy on the left, the greedy policy read off it
                   on the right. Stepped (3): one cell and its two best
                   neighbours; that cell's arrows; every cell.
   mode "ladder"   p. 53 — the summary: one backup, four loop scopes.
                   Policy evaluation, policy improvement (the two bracketed
                   as policy iteration), value iteration, asynchronous value
                   iteration, as a staircase of plates; each step down
                   deletes one loop and the deleted thing is red. Options
                   start (first state shown) and upto (last state, max 3).
                   With {"plates": [...]} the same staircase is drawn from the
                   caller's own plates instead (Ch 8: MC, TD, SARSA, Q-learning,
                   DQN). Each plate is {title, line, formula, note, loop}:
                   title red bold prose above the plate, line prose inside
                   (routed through the maths renderer only if it holds a TeX
                   command), formula maths centred, note red prose beside the
                   title, loop an optional self-loop label. Up to six plates;
                   start/upto index them as before. The Ch 7 drawing is
                   untouched when plates is absent.
   ============================================================ */
IE437.widget('mdp-pictures', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', TEAL = '#0F9D8A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var LBLUE = '#E3ECFB', LAMBER = '#FDF0DC', LAMBER2 = '#FEF8EC';
  var MODE = opts.mode || 'career';
  var uid = 'mp' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- helpers ---------- */
  function clear() { while (mount.firstChild) mount.removeChild(mount.firstChild); }
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
  /* text with _x / _{xy} subscripts and ^x superscripts */
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
  /* a rounded box with one centred line of text */
  function box(s, x, y, w, h, label, stroke, fill, a) {
    var at = { x: x, y: y, width: w, height: h, rx: 6, fill: fill || '#fff', stroke: stroke || INK, 'stroke-width': 1.3 };
    for (var k in a || {}) at[k] = a[k];
    E('rect', at, s);
    if (label) tx(s, x + w / 2, y + h / 2 + 4, label, { 'text-anchor': 'middle' });
  }
  function star(s, cx, cy, R, r, fill) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R;
      pts.push((cx + rad * Math.cos(ang)).toFixed(1) + ',' + (cy + rad * Math.sin(ang)).toFixed(1));
    }
    E('polygon', { points: pts.join(' '), fill: fill }, s);
  }

  /* ---------- career (p. 6) ---------- */
  function drawCareer(st) {
    clear();
    var s = svg(760, 348);
    var P = [212, 182];
    box(s, 8, 160, 200, 44, 'State: final year of a degree');
    /* action 1: a job */
    arrow(s, P[0], P[1], 300, 48, INK);
    E('circle', { cx: 300, cy: 48, r: 4, fill: SLATE }, s);
    tx(s, 312, 45, 'Action 1 · get a job', { fill: RED, 'font-size': 11 });
    tx(s, 312, 60, 'reward 4,000 $ per month', { fill: RED, 'font-size': 11 });
    /* action 3: a company */
    arrow(s, P[0], P[1], 300, 316, INK);
    E('circle', { cx: 300, cy: 316, r: 4, fill: SLATE }, s);
    tx(s, 312, 313, 'Action 3 · start a company', { fill: SLATE, 'font-size': 11 });
    tx(s, 312, 328, 'reward 0 $ per month', { fill: SLATE, 'font-size': 11 });
    /* action 2: graduate school */
    arrow(s, P[0], P[1], 398, 182, INK);
    tx(s, 350, 140, 'Action 2 · go to graduate school', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle' });
    tx(s, 350, 154, 'reward 500 $ per month', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle' });
    box(s, 400, 160, 160, 44, 'State: graduate school');
    if (st >= 1) {
      var outs = ['no job', 'researcher', 'professor', 'private company', 'officer', 'house keeper'];
      outs.forEach(function (o, i) {
        var y = 60 + 50 * i;
        arrow(s, 562, 182, 646, y, INK);
        E('circle', { cx: 652, cy: y, r: 5, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, s);
        tx(s, 664, y + 4, o);
      });
      tx(s, 640, 38, 'Action · publish X papers', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle' });
      tx(s, 8, 342, 'one action leads to one of many possible states', { fill: SLATE, 'font-size': 11 });
    }
  }

  /* ---------- loop (p. 12) ---------- */
  function drawLoop() {
    var s = svg(670, 272);
    var labels = ['t', 't+1', 't+2', 't+3'], sub = ['t', 't+1', 't+2', 't+3'];
    for (var i = 0; i < 4; i++) {
      var x0 = 8 + 136 * i, W = 104;
      tx(s, x0 + W / 2, 14, labels[i], { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
      box(s, x0, 24, W, 40, 'Agent', BLUE);
      box(s, x0, 170, W, 60, '', GREEN);
      tx(s, x0 + W / 2, 192, 'Environment', { 'text-anchor': 'middle' });
      tx(s, x0 + W / 2, 218, 's_{' + sub[i] + '}', { 'text-anchor': 'middle' });
      /* a_t down, r_t up */
      arrow(s, x0 + 36, 64, x0 + 36, 168, INK);
      tx(s, x0 + 28, 120, 'a_{' + sub[i] + '}', { 'text-anchor': 'end' });
      arrow(s, x0 + 68, 170, x0 + 68, 66, INK);
      tx(s, x0 + 76, 120, 'r_{' + sub[i] + '}');
      /* to the next environment */
      if (i < 3) arrow(s, x0 + W, 200, x0 + 136 - 2, 200, INK);
    }
    arrow(s, 8 + 136 * 3 + 104, 200, 532, 200, INK);
    tx(s, 546, 204, '⋯', { 'text-anchor': 'middle', 'font-size': 14 });
    arrow(s, 560, 200, 578, 200, INK);
    box(s, 580, 170, 82, 60, 'Goals', AMBER, LAMBER2, { rx: 14 });
    tx(s, 8, 262, '\\text{maximise the sum of rewards  }r_t + r_{t+1} + r_{t+2} + ⋯');
  }

  /* ---------- graph (pp. 9, 11) ---------- */
  function sq(s, cx, cy, half, label, stroke) {
    E('rect', { x: cx - half, y: cy - half, width: 2 * half, height: 2 * half, rx: 3, fill: '#fff', stroke: stroke, 'stroke-width': 1.5 }, s);
    tx(s, cx, cy + 4, label, { 'text-anchor': 'middle' });
  }
  function dia(s, cx, cy, half, label, stroke) {
    E('polygon', { points: cx + ',' + (cy - half) + ' ' + (cx + half) + ',' + cy + ' ' + cx + ',' + (cy + half) + ' ' + (cx - half) + ',' + cy, fill: '#fff', stroke: stroke, 'stroke-width': 1.5 }, s);
    tx(s, cx, cy + 4, label, { 'text-anchor': 'middle' });
  }
  function circ(s, cx, cy, r, label, stroke) {
    E('circle', { cx: cx, cy: cy, r: r, fill: '#fff', stroke: stroke, 'stroke-width': 1.5 }, s);
    tx(s, cx, cy + 4, label, { 'text-anchor': 'middle' });
  }
  function drawGraph(stationary) {
    var YA = 50, YR = 150, YS = 260, HA = 18, HR = 24, RS = 18;
    if (stationary) {
      YA = 40; YR = 128; YS = 222;
      var s = svg(360, 280), xa = 90, xb = 220;
      sq(s, xa, YA, HA, 'A', BLUE);
      dia(s, xa, YR, HR, 'R', RED);
      circ(s, xa, YS, RS, 'S', INK);
      circ(s, xb, YS, RS, "S′", INK);
      arrow(s, xa, YA + HA, xa, YR - HR - 1, INK);
      arrow(s, xa, YS - RS, xa, YR + HR + 1, INK);
      arrow(s, xa + HA, YA + HA, xb - RS * 0.72, YS - RS * 0.72, INK);
      arrow(s, xa + RS, YS, xb - RS - 1, YS, GREEN);
      tx(s, 8, 268, 'stationary: T and R are the same at every time step', { fill: RED });
      return;
    }
    var g = svg(620, 300), cols = [70, 190, 310], hd = ['t−1', 't', 't+1'], sb = ['t−1', 't', 't+1'];
    cols.forEach(function (cx, i) {
      tx(g, cx, 16, hd[i], { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
      sq(g, cx, YA, HA, 'A_{' + sb[i] + '}', BLUE);
      dia(g, cx, YR, HR, 'R_{' + sb[i] + '}', RED);
      circ(g, cx, YS, RS, 'S_{' + sb[i] + '}', INK);
      arrow(g, cx, YA + HA, cx, YR - HR - 1, INK);
      arrow(g, cx, YS - RS, cx, YR + HR + 1, INK);
      if (i < 2) {
        var nx = cols[i + 1];
        arrow(g, cx + HA, YA + HA, nx - RS * 0.72, YS - RS * 0.72, INK);
        arrow(g, cx + RS, YS, nx - RS - 1, YS, GREEN);
      } else {
        arrow(g, cx + HA, YA + HA, cx + 44, YA + HA + 60, INK, { 'stroke-dasharray': '3 3' });
        arrow(g, cx + RS, YS, cx + 52, YS, GREEN, { 'stroke-dasharray': '3 3' });
        tx(g, cx + 64, YS + 4, '⋯');
      }
    });
    tx(g, 410, 130, 'A_t\\text{ : action taken at time }t');
    tx(g, 410, 156, 'R_t\\text{ : reward received at time }t');
    tx(g, 410, 182, 'S_t\\text{ : state at time }t');
  }

  /* ---------- grid (p. 36) ---------- */
  function drawGrid() {
    var s = svg(640, 290), X0 = 8, Y0 = 20, C = 64, n = 1;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var x = X0 + c * C, y = Y0 + r * C, term = (r === 0 && c === 0) || (r === 3 && c === 3);
      E('rect', { x: x, y: y, width: C, height: C, fill: term ? PANEL2 : '#fff', stroke: INK, 'stroke-width': 1.2 }, s);
      if (term) star(s, x + C / 2, y + C / 2, 14, 6, RED);
      else tx(s, x + C / 2, y + C / 2 - 4, String(n++), { 'text-anchor': 'middle' });
    }
    /* cell 5 -> cell 6 */
    var cy1 = Y0 + C + C / 2;
    arrow(s, X0 + C + 44, cy1 + 10, X0 + 2 * C + 22, cy1 + 10, BLUE);
    E('rect', { x: X0 + 2 * C - 38, y: cy1 + 17, width: 76, height: 13, fill: '#fff' }, s);
    tx(s, X0 + 2 * C, cy1 + 27, 'T(5,→,6) = 1', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle' });
    /* cell 7 -> off the grid -> back to 7 */
    var ex = X0 + 4 * C;
    curve(s, 'M' + (ex - 22) + ' ' + (cy1 + 6) + ' C ' + (ex + 34) + ' ' + (cy1 - 2) + ', ' + (ex + 34) + ' ' + (cy1 + 30) + ', ' + (ex - 14) + ' ' + (cy1 + 20), RED);
    tx(s, ex + 8, cy1 + 46, 'T(7,→,7) = 1', { fill: RED, 'font-size': 11 });
    /* the facts */
    var L = ['S = \\{1, …, 14\\},\\text{ two terminal corners}', 'A = \\{↑, ↓, ←, →\\},\\text{ deterministic moves}',
             'a move off the grid leaves the state unchanged', 'R = −1\\text{ on every move,  }γ = 1'];
    L.forEach(function (t, i) { tx(s, 350, 60 + 26 * i, t); });
    tx(s, 350, 60 + 26 * 4, 'policy: all four actions equally likely', { fill: BLUE });
  }

  /* ---------- arrays (p. 35) ---------- */
  var ROWS = ['s_1', 's_2', 's_3', '⋮', 's_N'];
  function column(s, x, y0, w, h, rows, fills) {
    rows.forEach(function (r, i) {
      var y = y0 + i * h;
      E('rect', { x: x, y: y, width: w, height: h, fill: (fills && fills[i]) || '#fff', stroke: INK, 'stroke-width': 1.2 }, s);
      tx(s, x + w / 2, y + h / 2 + 4, r, { 'text-anchor': 'middle' });
    });
  }
  function drawArrays() {
    var s = svg(520, 232), H = 30, Y = 48;
    tx(s, 8, 16, 'Two-arrays update', { 'font-weight': 700 });
    tx(s, 60, 40, 'V_k', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
    column(s, 30, Y, 60, H, ROWS, [LAMBER, null, LAMBER, null, null]);
    tx(s, 230, 40, 'V_{k+1}', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
    column(s, 200, Y, 60, H, ROWS, [null, LBLUE, null, null, null]);
    arrow(s, 90, Y + 15, 198, Y + H + 13, BLUE);
    arrow(s, 90, Y + 2 * H + 15, 198, Y + H + 17, BLUE);
    tx(s, 147, 58, 'T(s_2,π(s_2),s_1)', { fill: SLATE, 'font-size': 11, 'text-anchor': 'middle' });

    tx(s, 330, 16, 'In-place update', { 'font-weight': 700 });
    tx(s, 420, 40, 'V_{k+1}', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
    column(s, 390, Y, 60, H, ROWS, [LBLUE, LBLUE, LAMBER, null, null]);
    curve(s, 'M450 ' + (Y + 12) + ' C 500 ' + (Y + 12) + ', 500 ' + (Y + H + 10) + ', 452 ' + (Y + H + 10), RED);
    curve(s, 'M450 ' + (Y + 2 * H + 18) + ' C 500 ' + (Y + 2 * H + 18) + ', 500 ' + (Y + H + 20) + ', 452 ' + (Y + H + 20), RED);
    tx(s, 330, 220, 'usually faster, half the memory', { fill: BLUE, 'font-size': 11 });
  }

  /* ---------- async (p. 52) ---------- */
  function drawAsync() {
    var s = svg(620, 232), H = 30, Y = 40;
    var rows = ['s_1', 's_2', 's_3', '⋮', 's_{N−1}', 's_N'];
    tx(s, 8, 16, 'Conventional DP: sweep every state', { 'font-weight': 700 });
    column(s, 62, Y, 60, H, rows);
    arrow(s, 50, Y + 4, 50, Y + 6 * H - 4, RED, { 'stroke-dasharray': '4 3' });
    tx(s, 42, Y + 3 * H + 4, 'sweep', { 'text-anchor': 'end', fill: RED, 'font-size': 11 });

    box(s, 190, 100, 190, 52, '');
    tx(s, 285, 121, '\\text{Backgammon: }10^{20}\\text{ states}', { 'text-anchor': 'middle', 'font-size': 11 });
    tx(s, 285, 140, '\\text{Go: }3^{361}\\text{ states}', { 'text-anchor': 'middle', 'font-size': 11 });

    tx(s, 410, 16, 'Asynchronous DP: any order', { 'font-weight': 700 });
    column(s, 460, Y, 60, H, rows);
    /* s_1 -> s_3 (right), s_3 -> s_2 (left), s_N -> s_1 (right, wide) */
    curve(s, 'M520 ' + (Y + 10) + ' C 565 ' + (Y + 10) + ', 565 ' + (Y + 2 * H + 12) + ', 522 ' + (Y + 2 * H + 12), RED);
    curve(s, 'M460 ' + (Y + 2 * H + 20) + ' C 420 ' + (Y + 2 * H + 20) + ', 420 ' + (Y + H + 15) + ', 458 ' + (Y + H + 15), RED);
    curve(s, 'M520 ' + (Y + 5 * H + 15) + ' C 620 ' + (Y + 5 * H + 15) + ', 620 ' + (Y + 22) + ', 522 ' + (Y + 22), RED);
  }

  /* ---------- ladder (p. 53) ---------- */
  /* plain prose label (never routed through the maths renderer) */
  function lbl(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 11.5, fill: SLATE, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  /* one algorithm plate: red title above, a "for ..." line and one formula inside */
  var PH = 58;
  function plate(s, x, y, w, title, line1, formula) {
    lbl(s, x, y - 7, title, { fill: RED, 'font-weight': 700, 'font-size': 12 });
    E('rect', { x: x, y: y, width: w, height: PH, rx: 6, fill: PANEL, stroke: PANEL2, 'stroke-width': 1 }, s);
    tx(s, x + 14, y + 20, line1, { 'font-size': 12.5 });
    tx(s, x + w / 2 + 16, y + 44, formula, { 'font-size': 13.5, 'text-anchor': 'middle' });
  }
  /* a self-loop on the right edge of a plate, with a short label */
  function selfLoop(s, x, y, c, text) {
    curve(s, 'M' + x + ' ' + (y - 14) + ' C ' + (x + 40) + ' ' + (y - 14) + ', ' + (x + 40) + ' ' + (y + 14) + ', ' + (x + 2) + ' ' + (y + 14), c, { 'stroke-width': 1.5 });
    if (text) lbl(s, x + 46, y + 4, text, { fill: c });
  }
  function drawLadder(st) {
    clear();
    var s = svg(760, 336), W = 480;
    var YA = 20, YB = 100, YC = 186, YD = 272;
    /* 0 — policy evaluation */
    plate(s, 10, YA, W, 'Policy evaluation', '\\text{for each state }s\\text{:}',
      'V_{k+1}(s) ← \\sum_{s\'} T(s,π(s),s\')[R + γ V_k(s\')]');
    if (st < 1) selfLoop(s, 10 + W, YA + PH / 2, BLUE, 'repeat until V stops changing');
    /* 1 — policy improvement, and the loop that makes policy iteration */
    if (st >= 1) {
      plate(s, 10, YB, W, 'Policy improvement', '\\text{for each state }s\\text{:}',
        'π\'(s) = \\argmax_a \\sum_{s\'} T(s,a,s\')[R + γ V^π(s\')]');
      var xr = 10 + W, ya = YA + PH / 2, yb = YB + PH / 2;
      curve(s, 'M' + xr + ' ' + yb + ' C ' + (xr + 72) + ' ' + yb + ', ' + (xr + 72) + ' ' + ya + ', ' + (xr + 2) + ' ' + ya, INK, { 'stroke-width': 1.6 });
      lbl(s, xr + 76, (ya + yb) / 2 - 4, 'Policy iteration', { fill: INK, 'font-weight': 700, 'font-size': 12.5 });
      lbl(s, xr + 76, (ya + yb) / 2 + 13, 'evaluate, improve, repeat');
    }
    /* 2 — value iteration: the two plates folded into one */
    if (st >= 2) {
      plate(s, 70, YC, W, 'Value iteration', '\\text{for each state }s\\text{:}',
        'V_{k+1}(s) ← \\red{\\max_a} \\sum_{s\'} T(s,a,s\')[R + γ V_k(s\')]');
      lbl(s, 178, YC - 7, 'one evaluation sweep, the improvement folded into it', { fill: RED });
      selfLoop(s, 70 + W, YC + PH / 2, INK, 'one sweep per round');
    }
    /* 3 — asynchronous value iteration: the sweep dropped */
    if (st >= 3) {
      plate(s, 120, YD, W, 'Asynchronous value iteration', '\\text{for }\\red{\\text{any single}}\\text{ state }s\\text{:}',
        'V(s) ← \\max_a \\sum_{s\'} T(s,a,s\')[R + γ V(s\')]');
      lbl(s, 312, YD - 7, 'no sweep: any order, every state often enough', { fill: RED });
      selfLoop(s, 120 + W, YD + PH / 2, INK, 'one state per round');
    }
  }

  /* ---------- ladder from the caller's plates (Ch 8 and later) ---------- */
  var PLATE_W = 480, PLATE_INDENT = 50, PLATE_MAX = 6;
  function drawPlates(list, st, nmax) {
    clear();
    /* the drawing is sized for the plates this slide can reach (upto), not for every plate given */
    var n = Math.min(PLATE_MAX, list.length, nmax || list.length), tall = n > 4;
    var pitch = tall ? 74 : 86, ph = tall ? 52 : 58, W = PLATE_W;
    var width = 10 + PLATE_INDENT * (n - 1) + W + 180;          /* room for the self-loop and its label */
    var s = svg(width, 20 + n * pitch);
    for (var i = 0; i <= st && i < n; i++) {
      var p = list[i] || {}, x = 10 + PLATE_INDENT * i, y = 20 + pitch * i;
      var title = lbl(s, x, y - 7, p.title || '', { fill: RED, 'font-weight': 700, 'font-size': 12 });
      E('rect', { x: x, y: y, width: W, height: ph, rx: 6, fill: PANEL, stroke: PANEL2, 'stroke-width': 1 }, s);
      if (p.line) {
        if (/\\/.test(p.line)) tx(s, x + 14, y + (tall ? 18 : 20), p.line, { 'font-size': 12.5 });
        else lbl(s, x + 14, y + (tall ? 18 : 20), p.line, { fill: INK, 'font-size': 13 });
      }
      if (p.formula) {
        var fs = +p.size || 13.5;
        var f = tx(s, x + W / 2 + 16, y + (tall ? 40 : 44), p.formula, { 'font-size': fs, 'text-anchor': 'middle' });
        /* a long formula shrinks to the plate rather than running out of it */
        var fw = 0; try { fw = f.getBBox().width; } catch (e) { }
        if (fw > W - 24) f.setAttribute('font-size', Math.max(13, Math.round(fs * 1.25 * (W - 24) / fw * 10) / 10));
      }
      if (p.note) {
        var tw = 0; try { tw = title.getComputedTextLength(); } catch (e) { }
        if (!tw) tw = 6.4 * (p.title || '').length;
        lbl(s, x + tw + 14, y - 7, p.note, { fill: RED });
      }
      if (p.loop) selfLoop(s, x + W, y + ph / 2, INK, p.loop);
    }
  }

  /* ---------- gpi (p. 54) ---------- */
  function drawGpi(st) {
    clear();
    var s = svg(580, 300), xv = 480, yv = 160, k = 0.28, x0 = 40;
    var up = function (x) { return yv - k * (xv - x); }, lo = function (x) { return yv + k * (xv - x); };
    E('line', { x1: x0, y1: up(x0), x2: xv, y2: yv, stroke: INK, 'stroke-width': 1.2 }, s);
    E('line', { x1: x0, y1: lo(x0), x2: xv, y2: yv, stroke: INK, 'stroke-width': 1.2 }, s);
    var deg = Math.atan(k) * 180 / Math.PI, mx = 250, Q = opts.labels === 'q';
    /* screen y grows downward, so the upper line (falling to the right) is a +deg rotation */
    tx(s, mx, up(mx) - 8, (Q ? 'Q = Q^π' : 'V = V^π') + '\\quad\\text{(policy evaluation)}', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle', transform: 'rotate(' + deg.toFixed(2) + ' ' + mx + ' ' + (up(mx) - 8).toFixed(1) + ')' });
    tx(s, mx, lo(mx) + 16, (Q ? 'π = ε\\text{-greedy}(Q)' : 'π = \\text{greedy}(V)') + '\\quad\\text{(policy improvement)}', { fill: GREEN, 'font-size': 11, 'text-anchor': 'middle', transform: 'rotate(' + (-deg).toFixed(2) + ' ' + mx + ' ' + (lo(mx) + 16).toFixed(1) + ')' });
    E('circle', { cx: xv, cy: yv, r: 3.5, fill: INK }, s);
    tx(s, xv + 10, yv - 6, Q ? 'Q^*' : 'V^*');
    tx(s, xv + 10, yv + 16, 'π^*');
    /* start */
    var sx = 60, sy = yv;
    E('circle', { cx: sx, cy: sy, r: 4, fill: INK }, s);
    tx(s, sx, sy + 20, '\\text{start: }' + (Q ? 'Q' : 'V') + ',\\ π', { 'text-anchor': 'middle', 'font-size': 11, fill: SLATE });
    /* the zigzag: hop i lands at x_i, remaining distance shrinking geometrically */
    var legs = st >= 2 ? 8 : (st === 1 ? 2 : 0), r = 0.68, d0 = xv - sx;
    var px = sx, py = sy;
    for (var i = 1; i <= legs; i++) {
      var x = xv - d0 * Math.pow(r, i), onUp = i % 2 === 1, y = onUp ? up(x) : lo(x);
      arrow(s, px, py, x, y, onUp ? BLUE : GREEN);
      px = x; py = y;
    }
    if (st >= 2) tx(s, xv + 36, yv + 4, 'stabilised', { fill: RED });
  }

  /* ---------- count (Ch 8 p. 15): a model learned by counting ---------- */
  var CELLS = { A: [0, 1], B: [1, 0], C: [1, 1], D: [1, 2], E: [2, 1] };
  var EPIS = [{ c: BLUE, path: ['B', 'C', 'D'], r: '+10' }, { c: GREEN, path: ['B', 'C', 'D'], r: '+10' },
              { c: AMBER, path: ['E', 'C', 'D'], r: '+10' }, { c: RED, path: ['E', 'C', 'A'], r: '−10' }];
  function drawCount(st) {
    clear();
    var s = svg(720, 236), X0 = 16, Y0 = 36, C = 60;
    function ctr(name) { var rc = CELLS[name]; return [X0 + rc[1] * C + C / 2, Y0 + rc[0] * C + C / 2]; }
    /* the grid: five cells named, the corners blank */
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
      var name = null; for (var k in CELLS) if (CELLS[k][0] === r && CELLS[k][1] === c) name = k;
      var x = X0 + c * C, y = Y0 + r * C;
      E('rect', { x: x, y: y, width: C, height: C, fill: name ? '#fff' : PANEL2, stroke: INK, 'stroke-width': 1.2 }, s);
      if (!name) continue;
      lbl(s, x + 6, y + 15, name, { fill: SLATE, 'font-weight': 700, 'font-size': 12.5 });
      /* A's exit arrow runs up through the cell, so its label stacks in the left half */
      if (name === 'A') { lbl(s, x + 5, y + C - 18, 'exit', { fill: RED, 'font-size': 9.5 }); lbl(s, x + 5, y + C - 6, '−10', { fill: RED, 'font-size': 9.5 }); }
      if (name === 'D') lbl(s, x + 5, y + C - 6, 'exit +10', { fill: GREEN, 'font-size': 9.5 });
    }
    /* the episodes, one per step, each offset so parallel arrows stay apart */
    var OFF = [-7.5, -2.5, 2.5, 7.5];
    for (var e = 0; e < st && e < EPIS.length; e++) (function (ep, o) {
      for (var i = 0; i + 1 < ep.path.length; i++) {
        var a = ctr(ep.path[i]), b = ctr(ep.path[i + 1]), horiz = a[1] === b[1];
        if (horiz) arrow(s, a[0] + 8, a[1] + o, b[0] - 8, b[1] + o, ep.c, { 'stroke-width': 2 });
        else arrow(s, a[0] + o, a[1] - 8, b[0] + o, b[1] + 8, ep.c, { 'stroke-width': 2 });
      }
      var last = ctr(ep.path[ep.path.length - 1]);
      if (ep.path[ep.path.length - 1] === 'D') arrow(s, last[0] + 8, last[1] + o, X0 + 3 * C + 22, last[1] + o, ep.c, { 'stroke-width': 2 });
      else arrow(s, last[0] + o, last[1] - 8, last[0] + o, Y0 - 18, ep.c, { 'stroke-width': 2 });
    })(EPIS[e], OFF[e]);
    if (st >= 1) lbl(s, X0 + 3 * C + 28, ctr('D')[1] + 4, '+10', { fill: GREEN, 'font-size': 12, 'font-weight': 700 });
    if (st >= 4) lbl(s, ctr('A')[0] + 16, Y0 - 12, '−10', { fill: RED, 'font-size': 12, 'font-weight': 700 });
    /* the key: each episode as it is drawn */
    for (var j = 0; j < st && j < EPIS.length; j++) {
      var ep2 = EPIS[j];
      lbl(s, 244, 64 + 26 * j, 'Episode ' + (j + 1) + '   ' + ep2.path.join(' → ') + ' → exit, ' + ep2.r, { fill: ep2.c, 'font-size': 12 });
    }
    /* the counted model */
    var TX = 470;
    lbl(s, TX, 52, 'Model learned by counting', { fill: SLATE, 'font-size': 11 });
    var nB = Math.min(st, 2), nC = st, nCD = Math.min(st, 3), nCA = st >= 4 ? 1 : 0;
    var rows = [];
    if (nB) rows.push('T̂(B, east, C) = ' + nB + '/' + nB);
    if (nCD) rows.push('T̂(C, east, D) = ' + nCD + '/' + nC);
    if (nCA) rows.push('T̂(C, east, A) = ' + nCA + '/' + nC);
    if (st >= 1) rows.push('R̂(D, exit) = +10');
    if (st >= 4) rows.push('R̂(A, exit) = −10');
    rows.forEach(function (t, i) { lbl(s, TX, 78 + 22 * i, t, { fill: INK, 'font-size': 12.5 }); });
    if (!st) lbl(s, TX, 78, 'nothing observed yet', { fill: SLATE, 'font-size': 12 });
  }

  /* ---------- readoff (p. 47) ---------- */
  var VINF = [[0, -14, -20, -22], [-14, -18, -20, -20], [-20, -20, -18, -14], [-22, -20, -14, 0]];
  var DIRS = [[-1, 0], [0, -1], [0, 1], [1, 0]];           /* up, left, right, down */
  function isTerm(r, c) { return (r === 0 && c === 0) || (r === 3 && c === 3); }
  function greedy(r, c) {                                  /* actions whose successor has the best value */
    var best = -Infinity, out = [];
    DIRS.forEach(function (d, i) {
      var rr = r + d[0], cc = c + d[1];
      if (rr < 0 || rr > 3 || cc < 0 || cc > 3) { rr = r; cc = c; }  /* off the grid: stay */
      var v = VINF[rr][cc];
      if (v > best + 1e-9) { best = v; out = [i]; } else if (Math.abs(v - best) < 1e-9) out.push(i);
    });
    return out;
  }
  function drawReadoff(st) {
    clear();
    var s = svg(660, 300), C = 50, Y0 = 72, XL = 44, XR = 406, HR = 1, HC = 1, LRED = '#F6CACA';
    tx(s, XL + 2 * C, 40, 'V^π(s)', { 'text-anchor': 'middle', 'font-size': 15 });
    tx(s, XR + 2 * C, 40, 'π′(s)', { 'text-anchor': 'middle', 'font-size': 15 });
    function grid(X) {
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var hl = st >= 1 && r === HR && c === HC;
        E('rect', { x: X + c * C, y: Y0 + r * C, width: C, height: C, fill: isTerm(r, c) ? PANEL2 : hl ? LRED : '#fff', stroke: INK, 'stroke-width': 1.2 }, s);
      }
    }
    grid(XL); grid(XR);
    /* left: the values */
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var v = VINF[r][c], label = v === 0 ? '0.0' : String(v) + '.';
      tx(s, XL + c * C + C / 2, Y0 + r * C + C / 2 + 5, label, { 'text-anchor': 'middle', 'font-size': 14, fill: '#1E3A8A' });
    }
    /* right: the greedy arrows */
    function cellArrows(r, c) {
      var cx = XR + c * C + C / 2, cy = Y0 + r * C + C / 2;
      greedy(r, c).forEach(function (i) {
        var d = DIRS[i];
        arrow(s, cx + d[1] * 3, cy + d[0] * 3, cx + d[1] * 19, cy + d[0] * 19, INK, { 'stroke-width': 1.5 });
      });
    }
    if (st >= 2) cellArrows(HR, HC);
    if (st >= 3) for (var r2 = 0; r2 < 4; r2++) for (var c2 = 0; c2 < 4; c2++) if (!isTerm(r2, c2) && !(r2 === HR && c2 === HC)) cellArrows(r2, c2);
    if (st >= 1) {
      /* the chosen cell looks at its two best neighbours */
      var cx = XL + HC * C + C / 2, cy = Y0 + HR * C + C / 2;
      greedy(HR, HC).forEach(function (i) {
        var d = DIRS[i];
        arrow(s, cx + d[1] * 10, cy + d[0] * 10, cx + d[1] * (C + 22), cy + d[0] * (C + 22), RED, { 'stroke-width': 2.6 });
      });
      tx(s, XL, Y0 + 4 * C + 24, '\\text{from }−18\\text{, the best neighbours are the two }−14\\text{s}', { fill: RED, 'font-size': 11 });
    }
    if (st >= 2) {
      curve(s, 'M' + (XL + 4 * C - 10) + ' 46 C ' + (XL + 4 * C + 60) + ' -4, ' + (XR - 60) + ' -4, ' + (XR + 6) + ' 46', RED, { 'stroke-width': 2.2 });
      tx(s, (XL + 4 * C + XR) / 2, 30, '\\argmax_a', { fill: RED, 'font-size': 11, 'text-anchor': 'middle' });
      tx(s, XR, Y0 + 4 * C + 24, st >= 3 ? 'best neighbour at every cell; ties keep both' : 'the cell\u2019s greedy action, read off the values', { fill: SLATE, 'font-size': 11 });
    }
  }

  if (MODE === 'readoff') {
    var rst = 0, rshow = function (i) { rst = Math.max(0, Math.min(3, i)); drawReadoff(rst); };
    rshow(0);
    return { steps: 3, step: rshow, reset: function () { rshow(0); }, finish: function () { rshow(3); } };
  }
  if (MODE === 'career') {
    var cst = 0, cshow = function (i) { cst = Math.max(0, Math.min(1, i)); drawCareer(cst); };
    cshow(0);
    return { steps: 1, step: cshow, reset: function () { cshow(0); }, finish: function () { cshow(1); } };
  }
  if (MODE === 'ladder') {
    var plates = Array.isArray(opts.plates) && opts.plates.length ? opts.plates.slice(0, PLATE_MAX) : null;
    var lmax = plates ? plates.length - 1 : 3;
    var l0 = Math.max(0, Math.min(lmax, +opts.start || 0)), l1 = Math.max(l0, Math.min(lmax, opts.upto == null ? lmax : +opts.upto));
    var lst = l0, lshow = function (i) { lst = Math.max(l0, Math.min(l1, l0 + i)); if (plates) drawPlates(plates, lst, l1 + 1); else drawLadder(lst); };
    lshow(0);
    return { steps: l1 - l0, step: lshow, reset: function () { lshow(0); }, finish: function () { lshow(l1 - l0); } };
  }
  if (MODE === 'count') {
    var nst = 0, nshow = function (i) { nst = Math.max(0, Math.min(4, i)); drawCount(nst); };
    nshow(0);
    return { steps: 4, step: nshow, reset: function () { nshow(0); }, finish: function () { nshow(4); } };
  }
  if (MODE === 'gpi') {
    var gst = 0, gshow = function (i) { gst = Math.max(0, Math.min(2, i)); drawGpi(gst); };
    gshow(0);
    return { steps: 2, step: gshow, reset: function () { gshow(0); }, finish: function () { gshow(2); } };
  }
  if (MODE === 'loop') drawLoop();
  else if (MODE === 'graph') drawGraph(!!opts.stationary);
  else if (MODE === 'grid') drawGrid();
  else if (MODE === 'arrays') drawArrays();
  else if (MODE === 'async') drawAsync();
  return { finish: function () {} };
});
