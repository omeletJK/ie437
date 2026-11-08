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
    var at = { x: x, y: y, 'font-size': 12, fill: INK };
    for (var k in a || {}) at[k] = a[k];
    var t = E('text', at, s), i = 0, buf = '';
    function flush() { if (buf) { E('tspan', { text: buf }, t); buf = ''; } }
    while (i < str.length) {
      var ch = str[i];
      if ((ch === '_' || ch === '^') && i + 1 < str.length) {
        flush();
        var body;
        if (str[i + 1] === '{') { var j = str.indexOf('}', i); body = str.slice(i + 2, j); i = j + 1; }
        else { body = str[i + 1]; i += 2; }
        var dy = ch === '_' ? '0.32em' : '-0.42em';
        E('tspan', { dy: dy, 'font-size': '0.74em', text: body }, t);
        E('tspan', { dy: ch === '_' ? '-0.32em' : '0.42em', text: '​' }, t);
      } else { buf += ch; i++; }
    }
    flush();
    return t;
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
    tx(s, 8, 262, 'maximise the sum of rewards  r_t + r_{t+1} + r_{t+2} + ⋯');
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
    tx(g, 410, 130, 'A_t : action taken at time t');
    tx(g, 410, 156, 'R_t : reward received at time t');
    tx(g, 410, 182, 'S_t : state at time t');
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
    var L = ['S = {1, …, 14}, two terminal corners', 'A = {↑, ↓, ←, →}, deterministic moves',
             'a move off the grid leaves the state unchanged', 'R = −1 on every move,  γ = 1'];
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
    tx(s, 285, 121, 'Backgammon: about 10^{20} states', { 'text-anchor': 'middle', 'font-size': 11 });
    tx(s, 285, 140, 'Go: 3^{361} states', { 'text-anchor': 'middle', 'font-size': 11 });

    tx(s, 410, 16, 'Asynchronous DP: any order', { 'font-weight': 700 });
    column(s, 460, Y, 60, H, rows);
    /* s_1 -> s_3 (right), s_3 -> s_2 (left), s_N -> s_1 (right, wide) */
    curve(s, 'M520 ' + (Y + 10) + ' C 565 ' + (Y + 10) + ', 565 ' + (Y + 2 * H + 12) + ', 522 ' + (Y + 2 * H + 12), RED);
    curve(s, 'M460 ' + (Y + 2 * H + 20) + ' C 420 ' + (Y + 2 * H + 20) + ', 420 ' + (Y + H + 15) + ', 458 ' + (Y + H + 15), RED);
    curve(s, 'M520 ' + (Y + 5 * H + 15) + ' C 620 ' + (Y + 5 * H + 15) + ', 620 ' + (Y + 22) + ', 522 ' + (Y + 22), RED);
  }

  /* ---------- gpi (p. 54) ---------- */
  function drawGpi(st) {
    clear();
    var s = svg(580, 300), xv = 480, yv = 160, k = 0.28, x0 = 40;
    var up = function (x) { return yv - k * (xv - x); }, lo = function (x) { return yv + k * (xv - x); };
    E('line', { x1: x0, y1: up(x0), x2: xv, y2: yv, stroke: INK, 'stroke-width': 1.2 }, s);
    E('line', { x1: x0, y1: lo(x0), x2: xv, y2: yv, stroke: INK, 'stroke-width': 1.2 }, s);
    var deg = Math.atan(k) * 180 / Math.PI, mx = 250;
    /* screen y grows downward, so the upper line (falling to the right) is a +deg rotation */
    tx(s, mx, up(mx) - 8, 'V = V^π  (policy evaluation)', { fill: BLUE, 'font-size': 11, 'text-anchor': 'middle', transform: 'rotate(' + deg.toFixed(2) + ' ' + mx + ' ' + (up(mx) - 8).toFixed(1) + ')' });
    tx(s, mx, lo(mx) + 16, 'π = greedy(V)  (policy improvement)', { fill: GREEN, 'font-size': 11, 'text-anchor': 'middle', transform: 'rotate(' + (-deg).toFixed(2) + ' ' + mx + ' ' + (lo(mx) + 16).toFixed(1) + ')' });
    E('circle', { cx: xv, cy: yv, r: 3.5, fill: INK }, s);
    tx(s, xv + 10, yv - 6, 'V^*');
    tx(s, xv + 10, yv + 16, 'π^*');
    /* start */
    var sx = 60, sy = yv;
    E('circle', { cx: sx, cy: sy, r: 4, fill: INK }, s);
    tx(s, sx, sy + 20, 'start: V, π', { 'text-anchor': 'middle', 'font-size': 11, fill: SLATE });
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

  if (MODE === 'career') {
    var cst = 0, cshow = function (i) { cst = Math.max(0, Math.min(1, i)); drawCareer(cst); };
    cshow(0);
    return { steps: 1, step: cshow, reset: function () { cshow(0); }, finish: function () { cshow(1); } };
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
