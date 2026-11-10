/* ============================================================
   widget: dqn-pictures                                 (Chapter 8)
   The source deck's pictures of DQN, redrawn. One clean panel per
   mode; a stepped mode redraws itself from scratch at every step.

   mode "pipeline"  p. 95  — four stacked frames → preprocessing →
                    convolutional network → one output per action. Static.
   mode "ball"      p. 96  — three frames of a ball: one frame gives a
                    position, two give a velocity. Stepped (1).
   mode "buffer"    p. 100 — the replay buffer as a FIFO queue: enqueue at
                    the back, dequeue at the front, sample a minibatch at
                    random. Stepped (2).
   mode "samenet"   p. 102 — bootstrapping on a network: the target branch
                    and the prediction branch run through the same Q_θ,
                    the loss on the right. Stepped (2).
   mode "targetnet" p. 107 — the same layout with the target branch moved
                    to a frozen copy Q_{θ⁻}, refreshed every C updates.
                    Stepped (2).
   mode "moving"    pp. 104–105 — a table changes one cell per update; a
                    network moves every entry. Stepped (1).
   mode "schematic" p. 108 — the whole training loop: sample collection,
                    sampling, parameter update with the target network and
                    the parameter copy. Stepped (2).
   ============================================================ */
IE437.widget('dqn-pictures', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var LBLUE = '#E3ECFB', LAMBER = '#FDF0DC';
  var MODE = opts.mode || 'pipeline';
  var uid = 'dq' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- helpers ---------- */
  function clear() { while (mount.firstChild) mount.removeChild(mount.firstChild); }
  function svg(w, h) { var s = IE437.svg(w, h); mount.appendChild(s); defs(s); return s; }
  var KEY = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' };
  function defs(s) {
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['r', RED], ['a', AMBER], ['s', SLATE], ['g', GREEN]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
  }
  function arrow(s, x1, y1, x2, y2, c, extra) {
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + (KEY[c] || 'k') + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('line', a, s);
  }
  function curve(s, d, c, extra) {
    var a = { d: d, fill: 'none', stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + (KEY[c] || 'k') + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('path', a, s);
  }
  /* maths-looking strings go through IE437.math, anything else is a plain <text> */
  function tx(s, x, y, str, a) {
    if (/[_^()=πγθ≥⋯→\\′'+−]/.test(str) || /^[A-Za-z]$/.test(str) || (str.length <= 5 && /,/.test(str))) {
      var m = { 'font-size': 12 }; for (var q in a || {}) m[q] = a[q];
      m['font-size'] = Math.round(parseFloat(m['font-size']) * 1.25 * 10) / 10;   /* KaTeX faces set small */
      return IE437.math(s, x, y, str, m);
    }
    var at = { x: x, y: y, 'font-size': 12, fill: INK, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  /* plain prose label, never routed through the maths renderer */
  function lbl(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 11.5, fill: SLATE, text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  function rect(s, x, y, w, h, fill, stroke, a) {
    var at = { x: x, y: y, width: w, height: h, rx: 6, fill: fill || '#fff', stroke: stroke || INK, 'stroke-width': 1.3 };
    for (var k in a || {}) at[k] = a[k];
    return E('rect', at, s);
  }
  /* the source's network symbol: a trapezoid, wide at the input, with white text inside */
  function trap(s, x, y, w, h, fill, lines, sub) {
    E('polygon', { points: x + ',' + y + ' ' + (x + w) + ',' + (y + h * 0.22) + ' ' + (x + w) + ',' + (y + h * 0.78) + ' ' + x + ',' + (y + h), fill: fill }, s);
    var n = lines.length, cx = x + w * 0.46;
    lines.forEach(function (t, i) {
      var yy = y + h / 2 + 4 + (i - (n - 1) / 2) * 15;
      tx(s, cx, yy, t, { fill: '#fff', 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 600 });
    });
    if (sub) tx(s, x + w / 2, y + h + 15, sub, { 'text-anchor': 'middle' });
  }
  /* a vertical column of n small boxes; fills[i] overrides the default */
  function column(s, x, y, n, bw, bh, gap, fill, stroke, hi, hiFill, hiStroke) {
    for (var i = 0; i < n; i++) {
      var h = i === hi;
      E('rect', { x: x, y: y + i * (bh + gap), width: bw, height: bh, fill: h ? hiFill : fill, stroke: h ? hiStroke : stroke, 'stroke-width': h ? 1.8 : 1.2 }, s);
    }
  }

  /* ---------- pipeline (p. 95) ---------- */
  function drawPipeline() {
    var s = svg(760, 196);
    /* four stacked frames, the front one carrying a small Atari-like doodle */
    for (var i = 0; i < 4; i++) {
      var x = 14 + 13 * i, y = 10 + 13 * i, front = i === 3;
      E('rect', { x: x, y: y, width: 84, height: 84, fill: front ? '#2E2E2E' : PANEL2, stroke: INK, 'stroke-width': 1.2 }, s);
      if (!front) { for (var r = 0; r < 3; r++) E('rect', { x: x + 10, y: y + 12 + r * 9, width: 64, height: 4, fill: '#C9C9C2' }, s); }
    }
    var fx = 14 + 39, fy = 10 + 39;
    for (var r2 = 0; r2 < 3; r2++) for (var c = 0; c < 6; c++)
      E('rect', { x: fx + 8 + c * 11.5, y: fy + 10 + r2 * 7, width: 10, height: 5, fill: ['#B8B8B0', '#8F8F88', '#6A6A64'][r2] }, s);
    E('rect', { x: fx + 30, y: fy + 72, width: 22, height: 4, fill: '#D8D8D0' }, s);
    E('circle', { cx: fx + 46, cy: fy + 58, r: 3, fill: '#F2F2EC' }, s);
    lbl(s, 72, 156, '4 recent frames', { 'text-anchor': 'middle', fill: INK });
    lbl(s, 72, 172, 'each 84 × 84, grey-scale', { 'text-anchor': 'middle' });
    arrow(s, 150, 72, 188, 72, INK);
    /* preprocessing */
    rect(s, 194, 40, 124, 64);
    lbl(s, 256, 68, 'image', { 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 });
    lbl(s, 256, 84, 'preprocessing', { 'text-anchor': 'middle', fill: INK, 'font-size': 12.5 });
    ['grey-scale', 'crop', 'stack the 4 recent frames'].forEach(function (t, i) { lbl(s, 256, 128 + 16 * i, t, { 'text-anchor': 'middle' }); });
    arrow(s, 322, 72, 360, 72, INK);
    /* the network */
    trap(s, 366, 28, 112, 88, BLUE, ['convolutional', 'network'], 'Q_θ');
    arrow(s, 484, 72, 522, 72, INK);
    /* one output per action */
    column(s, 530, 18, 4, 26, 26, 4, LAMBER, AMBER);
    ['Q_θ(s,a_1)', 'Q_θ(s,a_2)', '⋮', 'Q_θ(s,a_n)'].forEach(function (t, i) { tx(s, 566, 36 + 30 * i, t); });
    lbl(s, 530, 160, 'one forward pass gives every action value', { fill: INK });
  }

  /* ---------- ball (p. 96) ---------- */
  function drawBall(st) {
    clear();
    var s = svg(720, 252);
    var BX = 118, BY = 66, R = 14;
    var ghosts = [null, [58, 122], [160, 126]];
    var cap = ['one frame', 'the ball came from the lower left', 'the ball came from the right'];
    for (var i = 0; i < 3; i++) {
      var x0 = 16 + 238 * i;
      /* axes */
      arrow(s, x0 + 20, 150, x0 + 20, 16, INK, { 'stroke-width': 1.3 });
      arrow(s, x0 + 20, 150, x0 + 196, 150, INK, { 'stroke-width': 1.3 });
      E('circle', { cx: x0 + BX, cy: BY, r: R, fill: BLUE }, s);
      if (st >= 1 && ghosts[i]) {
        var gx = x0 + ghosts[i][0], gy = ghosts[i][1];
        E('circle', { cx: gx, cy: gy, r: R, fill: 'none', stroke: SLATE, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, s);
        var dx = x0 + BX - gx, dy = BY - gy, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
        arrow(s, gx + ux * (R + 2), gy + uy * (R + 2), x0 + BX - ux * (R + 3), BY - uy * (R + 3), SLATE, { 'stroke-width': 2 });
        tx(s, x0 + 108, 180, 's_{t−1}, s_t', { 'text-anchor': 'middle' });
        lbl(s, x0 + 108, 200, cap[i], { 'text-anchor': 'middle' });
      } else {
        tx(s, x0 + 108, 180, 's_t = [x_t, y_t]', { 'text-anchor': 'middle' });
        lbl(s, x0 + 108, 200, i === 0 ? cap[0] : 'the same frame', { 'text-anchor': 'middle' });
      }
    }
    if (st >= 1) lbl(s, 360, 238, 'from one frame you cannot infer the velocity; from two you can', { 'text-anchor': 'middle', fill: RED, 'font-size': 12 });
    else lbl(s, 360, 238, 'the same frame is consistent with any velocity', { 'text-anchor': 'middle', fill: INK, 'font-size': 12 });
  }

  /* ---------- buffer (p. 100) ---------- */
  function drawBuffer(st) {
    clear();
    var s = svg(760, 236);
    var N = 6, SW = 70, G = 6, QX = 148, QY = 66, QH = 68, QW = N * SW + (N - 1) * G;
    var t0 = st >= 1 ? 13 : 12, picked = { 1: 1, 3: 1, 4: 1 };
    lbl(s, QX + QW / 2, 44, 'replay buffer', { 'text-anchor': 'middle', fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    rect(s, QX - 10, QY - 10, QW + 20, QH + 20, '#fff', SLATE, { rx: 12, 'stroke-width': 1.5 });
    for (var i = 0; i < N; i++) {
      var x = QX + i * (SW + G), hi = st >= 2 && picked[i];
      E('rect', { x: x, y: QY, width: SW, height: QH, rx: 3, fill: hi ? LBLUE : PANEL, stroke: hi ? BLUE : INK, 'stroke-width': hi ? 1.8 : 1.1 }, s);
      tx(s, x + SW / 2, QY + 30, "(s,a,r,s')", { 'text-anchor': 'middle', 'font-size': 11 });
      tx(s, x + SW / 2, QY + 54, 't = ' + (t0 - i), { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
    }
    lbl(s, QX, QY + QH + 26, 'back', { fill: INK, 'font-weight': 600 });
    lbl(s, QX + QW, QY + QH + 26, 'front', { fill: INK, 'font-weight': 600, 'text-anchor': 'end' });
    lbl(s, QX + QW / 2, QY + QH + 26, 'a queue of fixed length: first in, first out', { 'text-anchor': 'middle' });
    /* the new tuple at the back */
    rect(s, 8, QY + 8, 72, 52, LAMBER, AMBER);
    tx(s, 44, QY + 30, "(s,a,r,s')", { 'text-anchor': 'middle', 'font-size': 11 });
    tx(s, 44, QY + 52, 't = ' + (t0 + (st >= 1 ? 1 : 1)), { 'text-anchor': 'middle', 'font-size': 10, fill: AMBER });
    arrow(s, 82, QY + 34, QX - 12, QY + 34, st >= 1 ? AMBER : SLATE, { 'stroke-width': 2 });
    lbl(s, 109, QY - 16, 'enqueue', { 'text-anchor': 'middle', fill: st >= 1 ? AMBER : SLATE, 'font-size': 10 });
    /* the oldest tuple at the front */
    if (st >= 1) {
      arrow(s, QX + QW + 12, QY + 34, 674, QY + 34, SLATE, { 'stroke-width': 2 });
      lbl(s, 647, QY - 16, 'dequeue', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 10 });
      rect(s, 676, QY + 8, 72, 52, PANEL2, SLATE);
      tx(s, 712, QY + 30, "(s,a,r,s')", { 'text-anchor': 'middle', 'font-size': 11, fill: SLATE });
      tx(s, 712, QY + 52, 't = ' + (t0 - N), { 'text-anchor': 'middle', 'font-size': 10, fill: SLATE });
    } else {
      arrow(s, QX + QW + 12, QY + 34, 674, QY + 34, SLATE, { 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      lbl(s, 647, QY - 16, 'dequeue', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 10 });
      rect(s, 676, QY + 8, 72, 52, '#fff', SLATE, { 'stroke-dasharray': '4 3' });
      lbl(s, 712, QY + 38, 'oldest', { 'text-anchor': 'middle' });
    }
    var note = st >= 2 ? 'sample a minibatch at random: consecutive frames are no longer neighbours in the batch'
             : st === 1 ? 'the newest tuple enters at the back; the buffer is full, so the oldest leaves at the front'
             : 'a finite queue of the most recent experience tuples';
    lbl(s, 380, 222, note, { 'text-anchor': 'middle', fill: st >= 2 ? BLUE : INK, 'font-size': 12 });
  }

  /* ---------- samenet (p. 102) and targetnet (p. 107) ---------- */
  /* o.top: draw the target branch; o.tgt: it runs through the frozen copy;
     o.loss: the loss box, its feeds and the formula; o.same: the yellow
     "same network" bar; o.copy: the dashed copy arrow                      */
  function drawNet(o) {
    clear();
    var s = svg(760, 340);
    var PX = 40, PW = 550, Y0 = 6, Y1 = 176, PH = 130, NX = PX + 91;
    var QT = o.tgt ? 'Q_{θ^−}' : 'Q_θ';
    /* bottom: the prediction branch */
    rect(s, PX, Y1, PW, PH, PANEL, INK, { rx: 16 });
    tx(s, PX + 12, Y1 + 75, 's_i', { 'font-size': 13 });
    arrow(s, PX + 34, Y1 + 70, PX + 54, Y1 + 70, INK);
    trap(s, PX + 56, Y1 + 30, 70, 80, BLUE, ['Q-net'], 'Q_θ');
    arrow(s, PX + 128, Y1 + 70, PX + 146, Y1 + 70, INK);
    column(s, PX + 148, Y1 + 28, 4, 22, 22, 2, LAMBER, AMBER, 2, LBLUE, BLUE);
    tx(s, PX + 159, Y1 + 21, 'Q_θ(s_i,·)', { 'text-anchor': 'middle', 'font-size': 11 });
    arrow(s, PX + 172, Y1 + 87, PX + 212, Y1 + 71, BLUE);
    E('rect', { x: PX + 214, y: Y1 + 59, width: 22, height: 22, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.8 }, s);
    tx(s, PX + 214, Y1 + 108, '\\text{select the entry for }a_i', { fill: BLUE, 'font-size': 11 });
    arrow(s, PX + 238, Y1 + 70, PX + 262, Y1 + 70, INK);
    tx(s, PX + 266, Y1 + 75, 'Q_θ(s_i,a_i)');
    /* top: the target branch */
    if (o.top) {
      rect(s, PX, Y0, PW, PH, LBLUE, INK, { rx: 16 });
      tx(s, PX + 12, Y0 + 75, "s'_i", { 'font-size': 13 });
      arrow(s, PX + 34, Y0 + 70, PX + 54, Y0 + 70, INK);
      trap(s, PX + 56, Y0 + 30, 70, 80, o.tgt ? AMBER : BLUE, o.tgt ? ['target', 'net'] : ['Q-net'], QT);
      arrow(s, PX + 128, Y0 + 70, PX + 146, Y0 + 70, INK);
      column(s, PX + 148, Y0 + 28, 4, 22, 22, 2, LAMBER, AMBER, 0, LAMBER, AMBER);
      tx(s, PX + 159, Y0 + 21, QT + "(s'_i,·)", { 'text-anchor': 'middle', 'font-size': 11 });
      arrow(s, PX + 172, Y0 + 39, PX + 212, Y0 + 69, AMBER);
      E('rect', { x: PX + 214, y: Y0 + 59, width: 22, height: 22, fill: LAMBER, stroke: AMBER, 'stroke-width': 1.8 }, s);
      tx(s, PX + 214, Y0 + 108, "\\text{pick the largest: }\\max_{a'}", { fill: AMBER, 'font-size': 11 });
      /* r_i comes in along the top and joins the max */
      tx(s, PX + 12, Y0 + 30, 'r_i', { 'font-size': 13 });
      E('path', { d: 'M' + (PX + 32) + ' ' + (Y0 + 26) + ' H ' + (PX + 300) + ' V ' + (Y0 + 70), fill: 'none', stroke: INK, 'stroke-width': 1.7 }, s);
      E('line', { x1: PX + 236, y1: Y0 + 70, x2: PX + 300, y2: Y0 + 70, stroke: INK, 'stroke-width': 1.7 }, s);
      arrow(s, PX + 300, Y0 + 70, PX + 318, Y0 + 70, INK);
      tx(s, PX + 322, Y0 + 75, "r_i + γ \\max_{a'} " + QT + "(s'_i,a')", { fill: BLUE });
      lbl(s, PX + PW - 14, Y0 + 20, 'do not compute the gradient of this part', { 'text-anchor': 'end', fill: RED, 'font-size': 11 });
      lbl(s, PX + PW - 14, Y0 + 34, 'it is the target', { 'text-anchor': 'end', fill: RED, 'font-size': 11 });
    }
    /* the two networks are one network */
    if (o.same) {
      E('line', { x1: NX, y1: Y0 + PH + 9, x2: NX, y2: Y1 - 9, stroke: AMBER, 'stroke-width': 5 }, s);
      E('polygon', { points: NX + ',' + (Y0 + PH + 2) + ' ' + (NX - 7) + ',' + (Y0 + PH + 12) + ' ' + (NX + 7) + ',' + (Y0 + PH + 12), fill: AMBER }, s);
      E('polygon', { points: NX + ',' + (Y1 - 2) + ' ' + (NX - 7) + ',' + (Y1 - 12) + ' ' + (NX + 7) + ',' + (Y1 - 12), fill: AMBER }, s);
      lbl(s, NX + 16, (Y0 + PH + Y1) / 2 + 4, 'same network', { fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    }
    if (o.copy) {
      arrow(s, NX, Y1 - 3, NX, Y0 + PH + 4, AMBER, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      tx(s, NX + 16, (Y0 + PH + Y1) / 2 + 4, '\\text{copy }θ → θ^−\\text{ every }C\\text{ updates}', { fill: AMBER, 'font-size': 11 });
    }
    /* the loss */
    if (o.loss) {
      rect(s, 612, 124, 140, 56);
      tx(s, 682, 148, "L(s_i,a_i,r_i,s'_i)", { 'text-anchor': 'middle', 'font-size': 11 });
      lbl(s, 682, 168, 'loss', { 'text-anchor': 'middle' });
      E('path', { d: 'M' + (PX + 520) + ' ' + (Y0 + 70) + ' H 600 V 140 H 608', fill: 'none', stroke: INK, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + 'k)' }, s);
      E('path', { d: 'M' + (PX + 360) + ' ' + (Y1 + 70) + ' H 600 V 164 H 608', fill: 'none', stroke: INK, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + 'k)' }, s);
      tx(s, 380, 332, "L = ( \\hl{r_i + γ \\max_{a'} " + QT + "(s'_i,a')} − Q_θ(s_i,a_i) )^2", { 'text-anchor': 'middle', 'font-size': 12.5 });
      if (o.tgt) lbl(s, 740, 332, 'the target no longer moves with θ', { 'text-anchor': 'end', fill: RED, 'font-size': 11 });
    }
  }

  /* ---------- moving (pp. 104–105) ---------- */
  function drawMoving(st) {
    clear();
    var s = svg(760, 196), C = 18;
    lbl(s, 14, 18, 'a table: one update changes one cell', { fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    var tabs = [ {}, { '0,2': -1 }, { '0,2': -1, '1,4': 4 } ], reds = [ {}, { '0,2': 1 }, { '1,4': 1 } ];
    for (var k = 0; k < 3; k++) {
      var X = 14 + k * 124, Y = 44;
      for (var c = 0; c < 5; c++) tx(s, X + C + c * C + C / 2, Y - 5, 'a_' + (c + 1), { 'text-anchor': 'middle', 'font-size': 9 });
      for (var r = 0; r < 3; r++) {
        tx(s, X + C / 2, Y + r * C + 13, 's_' + r, { 'text-anchor': 'middle', 'font-size': 9 });
        for (var c2 = 0; c2 < 5; c2++) {
          var key = r + ',' + c2, v = tabs[k][key] || 0, red = reds[k][key];
          E('rect', { x: X + C + c2 * C, y: Y + r * C, width: C, height: C, fill: red ? '#FBE3E3' : '#fff', stroke: INK, 'stroke-width': 1 }, s);
          E('text', { x: X + C + c2 * C + C / 2, y: Y + r * C + 13, 'text-anchor': 'middle', 'font-size': 11, fill: red ? RED : INK, 'font-weight': red ? 700 : 400, text: v < 0 ? '−' + (-v) : String(v) }, s);
        }
      }
      tx(s, X + C + 2.5 * C, Y + 3 * C + 18, 't_' + k, { 'text-anchor': 'middle', 'font-size': 11 });
      if (k < 2) arrow(s, X + 6 * C + 4, Y + 1.5 * C, X + 124 - 4, Y + 1.5 * C, INK);
    }
    lbl(s, 14, 146, 'the other 14 entries stay exactly where they were', { 'font-size': 11.5 });
    if (st < 1) return;
    lbl(s, 400, 18, 'a network: one update moves every entry', { fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    var vals = [[.45, .3, .85, .3], [.15, .3, .25, .9], [.2, .8, .35, .9]];
    for (var q = 0; q < 3; q++) {
      var X2 = 436 + q * 118;
      for (var i = 0; i < 4; i++)
        E('rect', { x: X2, y: 32 + i * 23, width: 26, height: 23, fill: AMBER, 'fill-opacity': vals[q][i], stroke: INK, 'stroke-width': 1.2 }, s);
      tx(s, X2 + 13, 140, 'Q_{θ_' + q + '}(s_0,·)', { 'text-anchor': 'middle', 'font-size': 11 });
      if (q < 2) E('text', { x: X2 + 72, y: 86, 'text-anchor': 'middle', 'font-size': 20, 'font-family': 'KaTeX_Main, serif', fill: INK, text: '≠' }, s);
    }
    arrow(s, 400, 164, 686, 164, INK);
    lbl(s, 692, 168, 'updates', { fill: INK });
    lbl(s, 400, 186, 'every entry moved, including the states the update never visited', { 'font-size': 11.5 });
  }

  /* ---------- schematic (p. 108) ---------- */
  function drawSchematic(st) {
    clear();
    var s = svg(760, 340);
    /* top: sample collection */
    rect(s, 10, 8, 520, 134, PANEL, SLATE, { rx: 18, 'stroke-width': 1.5 });
    lbl(s, 518, 26, 'sample collection', { 'text-anchor': 'end', fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    trap(s, 30, 44, 66, 62, BLUE, ['Q-net', 'Q_θ']);
    rect(s, 200, 50, 60, 50, AMBER, AMBER);
    lbl(s, 230, 79, 'Env', { 'text-anchor': 'middle', fill: '#fff', 'font-size': 12.5, 'font-weight': 700 });
    curve(s, 'M96 92 C 140 124, 160 124, 198 94', INK);
    tx(s, 148, 130, 'a', { 'text-anchor': 'middle' });
    curve(s, 'M198 56 C 160 26, 140 26, 100 54', INK);
    tx(s, 148, 27, 's, r', { 'text-anchor': 'middle' });
    arrow(s, 262, 75, 338, 75, AMBER, { 'stroke-width': 2 });
    lbl(s, 300, 50, 'experience', { 'text-anchor': 'middle', fill: INK });
    tx(s, 300, 66, "(s,a,r,s')", { 'text-anchor': 'middle', 'font-size': 11 });
    rect(s, 342, 52, 148, 46, '#fff', SLATE, { rx: 8, 'stroke-width': 1.5 });
    for (var i = 0; i < 4; i++) E('rect', { x: 350 + 34 * i, y: 60, width: 30, height: 30, rx: 2, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.2 }, s);
    lbl(s, 416, 42, 'replay buffer', { 'text-anchor': 'middle', fill: INK });
    if (st < 1) return;
    /* sampling, down into the update */
    arrow(s, 416, 100, 416, 180, AMBER, { 'stroke-width': 2 });
    lbl(s, 426, 160, 'sampling', { fill: INK });
    /* bottom: parameter update */
    rect(s, 180, 180, 570, 154, PANEL, SLATE, { rx: 18, 'stroke-width': 1.5 });
    lbl(s, 738, 200, 'parameter update', { 'text-anchor': 'end', fill: INK, 'font-size': 12.5, 'font-weight': 700 });
    trap(s, 210, 268, 66, 46, BLUE, ['Q-net', 'Q_{θ_0}']);
    rect(s, 386, 236, 60, 44, SLATE, SLATE);
    lbl(s, 416, 262, 'loss', { 'text-anchor': 'middle', fill: '#fff', 'font-size': 12.5, 'font-weight': 700 });
    curve(s, 'M276 292 C 330 292, 330 266, 384 266', BLUE);
    if (st >= 2) {
      trap(s, 210, 188, 66, 46, AMBER, ['target', 'Q_{θ^−}']);
      curve(s, 'M276 210 C 330 210, 330 250, 384 250', BLUE);
      trap(s, 520, 188, 66, 46, AMBER, ['target', 'Q_{θ^−}']);
      arrow(s, 243, 266, 243, 238, AMBER, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      arrow(s, 553, 266, 553, 238, AMBER, { 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      lbl(s, 562, 256, 'copy parameters', { fill: AMBER, 'font-size': 11 });
    } else {
      curve(s, 'M276 288 C 330 288, 330 250, 384 250', BLUE, { 'stroke-dasharray': '4 3' });
      lbl(s, 330, 232, 'target and prediction from the same net', { 'text-anchor': 'middle', fill: BLUE, 'font-size': 11 });
    }
    curve(s, 'M446 266 C 490 266, 490 292, 518 292', GREEN);
    tx(s, 452, 250, '\\text{update }θ', { fill: GREEN, 'font-size': 11 });
    trap(s, 520, 268, 66, 46, BLUE, ['Q-net', 'Q_{θ_C}']);
    tx(s, 640, 296, '⋯', { 'font-size': 16 });
    arrow(s, 200, 326, 676, 326, INK);
    lbl(s, 682, 330, 'updates', { fill: INK });
  }

  /* ---------- dispatch ---------- */
  function stepped(n, draw) {
    var st = 0, show = function (i) { st = Math.max(0, Math.min(n, i)); draw(st); };
    show(0);
    return { steps: n, step: show, reset: function () { show(0); }, finish: function () { show(n); } };
  }
  if (MODE === 'ball') return stepped(1, drawBall);
  if (MODE === 'buffer') return stepped(2, drawBuffer);
  if (MODE === 'moving') return stepped(1, drawMoving);
  if (MODE === 'schematic') return stepped(2, drawSchematic);
  if (MODE === 'samenet') return stepped(2, function (st) {
    drawNet({ top: st >= 1, loss: st >= 2, same: st >= 2 });
  });
  if (MODE === 'targetnet') return stepped(2, function (st) {
    if (st === 0) drawNet({ top: true, loss: true, same: true });
    else drawNet({ top: true, tgt: true, copy: true, loss: st >= 2 });
  });
  drawPipeline();
  return { finish: function () {} };
});
