/* ============================================================
   widget: six-rooms                                   (Chapter 8)
   The source deck's Q-learning step-by-step example (pp. 67-73):
   six rooms A-F, F is outside and the goal.  Doors (undirected):
   A-E, B-F, B-D, C-D, D-E, E-F.  An action is the room moved into;
   a wall is not an action.  Reward 100 for any move into F, 0 for
   every other allowed move.  gamma = 0.8, step size 0.5, Q = 0 at
   the start.

   In this deck F is TERMINAL: the episode ends on entering F, so the
   target of a move into F is the reward alone.  (The source's
   continuing-F variant, where Q*(.,F) grows to 500, is not used.)

   Left the room graph, right the R and Q matrices, under them the
   backup written out with the numbers read and the fresh number red.

   Steps (4):
     0  everything at 0
     1  episode 1: in B, choose F at random  ->  Q(B,F) = 50
     2  episode 2: in D, choose B            ->  Q(D,B) = 20
     3  then B -> F                          ->  Q(B,F) = 75
     4  after many episodes: Q*, computed here by value iteration
        on the terminal-F MDP and shown rounded to integers
   No options.  SVG 760 x 330.
   ============================================================ */
IE437.widget('six-rooms', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B', GREEN = '#16A34A';
  var PANEL2 = '#E7E7E1', LBLUE = '#E3ECFB', LAMBER = '#FDF0DC', LRED = '#FBE3E3', LGREEN = '#DCFCE7';
  var G = 0.8, ALPHA = 0.5;
  var uid = 'sr' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- the MDP ---------- */
  var ROOMS = ['A', 'B', 'C', 'D', 'E', 'F'], F = 5;
  var DOORS = [[0, 4], [1, 5], [1, 3], [2, 3], [3, 4], [4, 5]];
  var ALLOWED = [];                                   /* ALLOWED[s][a] = true when the door exists */
  for (var i = 0; i < 6; i++) { ALLOWED.push([]); for (var j = 0; j < 6; j++) ALLOWED[i].push(false); }
  DOORS.forEach(function (d) { ALLOWED[d[0]][d[1]] = true; ALLOWED[d[1]][d[0]] = true; });
  function R(s, a) { return a === F ? 100 : 0; }
  function canAct(s, a) { return s !== F && ALLOWED[s][a]; }    /* nothing leaves the terminal room */

  /* Q* by value iteration: Q(s,a) = R + gamma * max_a' Q(a,a'), the max is 0 past F */
  function qstar() {
    var Q = [];
    for (var s = 0; s < 6; s++) { Q.push([]); for (var a = 0; a < 6; a++) Q[s].push(0); }
    for (var it = 0; it < 200; it++) {
      for (var s2 = 0; s2 < 6; s2++) for (var a2 = 0; a2 < 6; a2++) {
        if (!canAct(s2, a2)) continue;
        Q[s2][a2] = R(s2, a2) + G * (a2 === F ? 0 : vmax(Q, a2));
      }
    }
    return Q;
  }
  function vmax(Q, s) {
    if (s === F) return 0;
    var m = 0;
    for (var a = 0; a < 6; a++) if (canAct(s, a)) m = Math.max(m, Q[s][a]);
    return m;
  }
  function zeros() { var Q = []; for (var s = 0; s < 6; s++) { Q.push([0, 0, 0, 0, 0, 0]); } return Q; }

  /* the four states of the table, one per step */
  var Q0 = zeros();
  var Q1 = zeros(); Q1[1][F] = 0 + ALPHA * (100 - 0);                                      /* 50 */
  var Q2 = zeros(); Q2[1][F] = Q1[1][F]; Q2[3][1] = 0 + ALPHA * (0 + G * vmax(Q1, 1) - 0);  /* 20 */
  var Q3 = zeros(); Q3[3][1] = Q2[3][1]; Q3[1][F] = Q2[1][F] + ALPHA * (100 - Q2[1][F]);    /* 75 */
  var QS = qstar();
  var TABLES = [Q0, Q1, Q2, Q3, QS];

  /* ---------- drawing ---------- */
  function clear() { while (mount.firstChild) mount.removeChild(mount.firstChild); }
  function marker(s, id, c) {
    var d = E('defs', {}, s), m = E('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, d);
    E('path', { d: 'M0 0L10 5L0 10Z', fill: c }, m);
  }
  function lbl(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 12, fill: SLATE, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  function fmt(v) { return String(Math.round(v)); }

  /* room positions, as the source lays them out */
  var POS = [[70, 70], [230, 70], [310, 150], [230, 230], [70, 230], [150, 150]], RR = 21;
  function edge(s, a, b, c, width, dash, key) {
    var p = POS[a], q = POS[b], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy);
    var ux = dx / L, uy = dy / L, at = { x1: p[0] + ux * (RR + 2), y1: p[1] + uy * (RR + 2), x2: q[0] - ux * (RR + 2), y2: q[1] - uy * (RR + 2),
      stroke: c, 'stroke-width': width, 'marker-start': 'url(#' + uid + key + ')', 'marker-end': 'url(#' + uid + key + ')' };
    if (dash) at['stroke-dasharray'] = dash;
    E('line', at, s);
  }
  function graph(s, cur, chosen, read) {
    marker(s, uid + 'k', INK); marker(s, uid + 'r', RED); marker(s, uid + 'b', BLUE);
    DOORS.forEach(function (d) {
      var isChosen = chosen && ((d[0] === chosen[0] && d[1] === chosen[1]) || (d[1] === chosen[0] && d[0] === chosen[1]));
      var isRead = read && (d[0] === read || d[1] === read) && !isChosen;
      edge(s, d[0], d[1], isChosen ? RED : isRead ? BLUE : INK, isChosen ? 2.6 : 1.5, isRead ? '4 3' : null, isChosen ? 'r' : isRead ? 'b' : 'k');
      /* the reward on the door, beside its midpoint */
      var mx = (POS[d[0]][0] + POS[d[1]][0]) / 2, my = (POS[d[0]][1] + POS[d[1]][1]) / 2, into = d[0] === F || d[1] === F;
      var ox = 0, oy = -6;
      if (d[0] === 0 && d[1] === 4) { ox = -10; oy = 4; }          /* A-E: label to the left */
      if (d[0] === 1 && d[1] === 3) { ox = 10; oy = 4; }           /* B-D: to the right */
      if (d[0] === 3 && d[1] === 4) { ox = 0; oy = 16; }           /* D-E: below */
      if (d[0] === 2 && d[1] === 3) { ox = 12; oy = 12; }          /* C-D */
      if (d[0] === 1 && d[1] === 5) { ox = -16; oy = -4; }         /* B-F */
      if (d[0] === 4 && d[1] === 5) { ox = 18; oy = 8; }           /* E-F */
      lbl(s, mx + ox, my + oy, into ? '100' : '0', { fill: into ? RED : SLATE, 'font-size': 11.5, 'text-anchor': 'middle', 'font-weight': into ? 700 : 400 });
    });
    ROOMS.forEach(function (r, i) {
      var p = POS[i], hot = i === cur;
      E('circle', { cx: p[0], cy: p[1], r: RR, fill: i === F ? LGREEN : hot ? LAMBER : '#fff', stroke: hot ? RED : i === F ? GREEN : INK, 'stroke-width': hot ? 2.2 : 1.4 }, s);
      lbl(s, p[0], p[1] + 5, r, { fill: INK, 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 600 });
    });
    lbl(s, POS[F][0], POS[F][1] + RR + 14, 'outside', { fill: GREEN, 'font-size': 11, 'text-anchor': 'middle' });
  }

  /* a 6 x 6 matrix with row and column letters; cells[s][a] = {text, fill, color, bold} */
  var CW = 26, CH = 23;
  function matrix(s, x, y, title, get) {
    IE437.math(s, x + 12 + 3 * CW, y - 6, title, { 'font-size': 13, 'text-anchor': 'middle' });
    for (var a = 0; a < 6; a++) lbl(s, x + 12 + a * CW + CW / 2, y + 10, ROOMS[a], { 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 600, fill: INK });
    for (var r = 0; r < 6; r++) {
      var yy = y + 14 + r * CH;
      lbl(s, x + 5, yy + CH / 2 + 4, ROOMS[r], { 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 600, fill: INK });
      for (var c = 0; c < 6; c++) {
        var cell = get(r, c), xx = x + 12 + c * CW;
        E('rect', { x: xx, y: yy, width: CW, height: CH, fill: cell.fill || '#fff', stroke: INK, 'stroke-width': 0.9 }, s);
        E('text', { x: xx + CW / 2, y: yy + CH / 2 + 4, 'font-size': 11.5, 'text-anchor': 'middle', fill: cell.color || INK,
          'font-family': 'var(--mono)', 'font-weight': cell.bold ? 700 : 400, text: cell.text }, s);
      }
    }
  }

  /* per step: caption, the current state, the chosen move, the state whose row is read, the lines */
  var STEPS = [
    { cap: 'start: Q(s,a) = 0 everywhere',
      lines: ['Q(s,a) ← Q(s,a) + 0.5[r + 0.8 \\max_{a\'} Q(s\',a\') − Q(s,a)]'] },
    { cap: 'episode 1: in B, choose F at random — the move is rewarded 100 and the episode ends',
      cur: 1, move: [1, F], fresh: [1, F],
      lines: ['Q(B,F) ← 0 + 0.5[100 + 0.8·0 − 0] = \\red{50}', '\\text{F is terminal: nothing to bootstrap from, the target is the reward alone}'] },
    { cap: 'episode 2: in D, choose B — the move is rewarded 0, but B already holds a value',
      cur: 3, move: [3, 1], fresh: [3, 1], read: 1,
      lines: ['Q(D,B) ← 0 + 0.5[0 + 0.8·\\max\\{Q(B,D), Q(B,F)\\} − 0] = 0 + 0.5[0 + 0.8·\\hl{50} − 0] = \\red{20}',
              '\\text{the value of F\'s door leaks one room back, scaled by 0.8 and the step size}'] },
    { cap: 'episode 2 continues: B → F again, and the episode ends',
      cur: 1, move: [1, F], fresh: [1, F],
      lines: ['Q(B,F) ← 50 + 0.5[100 + 0.8·0 − 50] = \\red{75}', '\\text{half-way from 50 to 100: each visit closes half the gap to the target}'] },
    { cap: 'after many episodes: every visited door converged to Q*',
      lines: ['\\text{converged (F terminal): }Q^*(D,B) = 0 + 0.8 \\max_{a\'} Q^*(B,a\') = 0.8·100 = \\red{' + fmt(QS[3][1]) + '}',
              '\\text{each door is worth 0.8 of the best door in the room it opens onto; the doors into F are worth 100}'] }
  ];

  function draw(k) {
    clear();
    var s = IE437.svg(760, 330); mount.appendChild(s);
    var st = STEPS[k], Q = TABLES[k];
    lbl(s, 10, 18, st.cap, { fill: SLATE, 'font-size': 12.5 });
    graph(s, st.cur == null ? -1 : st.cur, st.move || null, st.read == null ? -1 : st.read);

    var XR = 352, XQ = 560, YM = 56;
    matrix(s, XR, YM, 'R(s,a)', function (r, c) {
      if (!canAct(r, c)) return { text: '−', color: SLATE, fill: r === F ? PANEL2 : '#fff' };
      return { text: String(R(r, c)), color: c === F ? RED : INK, bold: c === F };
    });
    matrix(s, XQ, YM, k === 4 ? 'Q^*(s,a)' : 'Q(s,a)', function (r, c) {
      if (!canAct(r, c)) return { text: '−', color: SLATE, fill: r === F ? PANEL2 : '#fff' };
      var fresh = st.fresh && st.fresh[0] === r && st.fresh[1] === c;
      var read = st.read != null && r === st.read && Q[r][c] > 0;
      return { text: fmt(Q[r][c]), color: fresh ? RED : read ? BLUE : INK, bold: fresh, fill: fresh ? LRED : read ? LBLUE : '#fff' };
    });
    lbl(s, XR, YM + 14 + 6 * CH + 16, '− : a wall, not an action; row F: terminal, no moves out', { 'font-size': 11 });
    lbl(s, XR, YM + 14 + 6 * CH + 32, 'reward 100 into F, 0 elsewhere; γ = 0.8, step size 0.5', { 'font-size': 11 });

    /* the backup written out, across the full width under the figure */
    var y0 = 290;
    st.lines.forEach(function (t, i) { IE437.math(s, 10, y0 + 24 * i, t, { 'font-size': i ? 12 : 13.5 }); });
  }

  var cur = 0;
  function show(i) { cur = Math.max(0, Math.min(4, i)); draw(cur); }
  show(0);
  return { steps: 4, step: show, reset: function () { show(0); }, finish: function () { show(4); } };
});
