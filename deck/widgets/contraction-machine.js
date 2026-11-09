/* ============================================================
   widget: contraction-machine
   The Bellman optimality operator T drawn as a machine: a value
   table goes in, a value table comes out.  Three modes, all on the
   same five-state chain as sweep-backup (right 0.8 / 0.2, left
   0.2 / 0.8, cost 1, s_5 terminal, gamma 0.9), so the tables carry
   real numbers.

     mode "machine"  one table in, one table out; step 1 names the
                     output V_{k+1} and closes the loop (value iteration).
     mode "two"      two tables in, the largest gap between them
                     bracketed as d; two tables out, the largest gap
                     now at most gamma d.  Step 1 shows the output gaps,
                     step 2 turns the machine again and again: a strip of
                     bars 10, 9, 8.1, 7.29, ...
     mode "maxineq"  |max f - max g| <= max |f - g|: two students'
                     marks per question as paired bars, every pair within
                     3, so the two best marks are within 3.  Step 1 marks
                     the bests.
   ============================================================ */
IE437.widget('contraction-machine', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B', GREEN = '#16A34A';
  var LBLUE = '#E3ECFB', LAMBER = '#FDF0DC', LRED = '#FBE3E3', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'machine', G = 0.9, N = 5, TERM = 4;
  var uid = 'cm' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- the chain and its operator ---------- */
  function T(s) {                         /* two actions, each [[s', p], [s', p]] */
    var l = s === 0 ? 0 : s - 1, r = s + 1;
    return [[[r, 0.8], [l, 0.2]], [[r, 0.2], [l, 0.8]]];
  }
  function apply(V) {                      /* (T V)(s) = max_a sum_s' T [ -1 + gamma V(s') ] */
    var W = V.slice();
    for (var s = 0; s < TERM; s++) {
      W[s] = Math.max.apply(null, T(s).map(function (act) {
        return act.reduce(function (acc, p) { return acc + p[1] * (-1 + G * V[p[0]]); }, 0);
      }));
    }
    W[TERM] = 0;
    return W;
  }
  function fmt(v, d) { var k = Math.pow(10, d == null ? 2 : d); return (Math.round(v * k) / k).toFixed(d == null ? 2 : d).replace('-', '−'); }
  function gap(A, B) { var m = 0; for (var s = 0; s < N; s++) m = Math.max(m, Math.abs(A[s] - B[s])); return m; }

  /* ---------- drawing helpers ---------- */
  function clear() { while (mount.firstChild) mount.removeChild(mount.firstChild); }
  function svg(w, h) {
    var s = IE437.svg(w, h); mount.appendChild(s);
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['r', RED], ['s', SLATE]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    return s;
  }
  function arrow(s, x1, y1, x2, y2, c, key, extra) {
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' };
    for (var q in extra || {}) a[q] = extra[q];
    E('line', a, s);
  }
  function curve(s, d, c, key) {
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' }, s);
  }
  function lbl(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 11.5, fill: SLATE, text: str };
    for (var q in a || {}) at[q] = a[q];
    return E('text', at, s);
  }
  /* the operator's own letter, in KaTeX's calligraphic face (IE437.math has no \mathcal) */
  function calT(s, x, y, size, fill) {
    return E('text', { x: x, y: y, 'font-size': size || 13, fill: fill || SLATE, 'font-family': 'KaTeX_Caligraphic, "Times New Roman", serif', text: 'T' }, s);
  }
  /* a table title that starts with the operator: T followed by maths */
  function opTitle(s, x, y, tex, fill) {
    calT(s, x, y, 15, fill || SLATE);
    IE437.math(s, x + 13, y, tex, { fill: fill || SLATE, 'font-size': 12.5 });
  }
  var H = 26, W = 84;
  /* a value table: label above, five cells with s_i and a number */
  function table(s, x, y, title, V, fills, strokes) {
    if (title) IE437.math(s, x + W / 2, y - 8, title, { 'text-anchor': 'middle', fill: SLATE, 'font-size': 12.5 });
    for (var r = 0; r < N; r++) {
      var yy = y + r * H, st = strokes && strokes[r];
      E('rect', { x: x, y: yy, width: W, height: H, fill: (fills && fills[r]) || '#fff', stroke: st || INK, 'stroke-width': st ? 1.8 : 1.1 }, s);
      IE437.math(s, x + 13, yy + H / 2 + 4, 's_' + (r + 1), { 'font-size': 11.5, 'text-anchor': 'middle' });
      E('text', { x: x + W - 7, y: yy + H / 2 + 4, 'font-size': 11.5, 'text-anchor': 'end', fill: INK, 'font-family': 'var(--mono)', text: r === TERM ? '0' : fmt(V[r]) }, s);
    }
  }
  /* the machine box */
  function machine(s, x, y, w, h) {
    E('rect', { x: x, y: y, width: w, height: h, rx: 8, fill: PANEL2, stroke: INK, 'stroke-width': 1.3 }, s);
    calT(s, x + w / 2 - 8, y + 32, 26, INK);
    lbl(s, x + w / 2, y + 50, 'one max backup', { 'text-anchor': 'middle', fill: INK });
    lbl(s, x + w / 2, y + 65, 'at every state', { 'text-anchor': 'middle', fill: INK });
    IE437.math(s, x + w / 2, y + h - 14, '\\max_a \\sum_{s\'} T\\,[R + γ V(s\')]', { 'text-anchor': 'middle', 'font-size': 10.5, fill: SLATE });
  }

  /* ---------- machine ---------- */
  var V0 = apply(apply([0, 0, 0, 0, 0]));    /* a table two sweeps in, so the numbers differ */
  function drawMachine(st) {
    clear();
    var s = svg(760, 286), y = 40;
    table(s, 60, y, 'V_k\\ \\text{(a table)}', V0);
    arrow(s, 60 + W + 6, y + 2.5 * H, 250, y + 2.5 * H, INK, 'k');
    machine(s, 256, y - 10, 200, N * H + 20);
    arrow(s, 462, y + 2.5 * H, 540, y + 2.5 * H, INK, 'k');
    var V1 = apply(V0);
    table(s, 546, y, null, V1, st >= 1 ? [LBLUE, LBLUE, LBLUE, LBLUE, null] : null);
    opTitle(s, 546 + 4, y - 8, 'V_k\\ \\text{(a new table)}');
    lbl(s, 60, y + N * H + 30, 'a table in: one number per state', { fill: SLATE });
    if (st >= 1) { IE437.math(s, 546, y + N * H + 30, '= V_{k+1}', { fill: BLUE, 'font-size': 12.5 }); lbl(s, 546, y + N * H + 46, 'one sweep of value iteration', { fill: BLUE }); }
    else { lbl(s, 546, y + N * H + 30, 'a table out: the s-th entry is (TV)(s)', { fill: SLATE }); }
    if (st >= 1) {
      curve(s, 'M' + (546 + W / 2) + ' ' + (y + N * H + 40) + ' C ' + (546 + W / 2) + ' ' + (y + N * H + 80) + ', ' + (60 + W / 2) + ' ' + (y + N * H + 80) + ', ' + (60 + W / 2) + ' ' + (y + N * H + 42), BLUE, 'b');
      lbl(s, 340, y + N * H + 96, 'feed it back in: the next sweep', { 'text-anchor': 'middle', fill: BLUE });
    }
  }

  /* ---------- two ---------- */
  var VA = V0, VB = [V0[0] + 10, V0[1] - 4, V0[2] + 6, V0[3] - 2, 0];
  function drawTwo(st) {
    clear();
    var s = svg(760, 266), y = 30;
    var gIn = [], gOut = [], TA = apply(VA), TB = apply(VB);
    for (var r = 0; r < N; r++) { gIn[r] = Math.abs(VA[r] - VB[r]); gOut[r] = Math.abs(TA[r] - TB[r]); }
    var iIn = gIn.indexOf(Math.max.apply(null, gIn)), iOut = gOut.indexOf(Math.max.apply(null, gOut));
    var fa = [], fb = []; fa[iIn] = LAMBER; fb[iIn] = LAMBER;
    table(s, 20, y, 'V', VA, fa);
    table(s, 120, y, 'V\'', VB, fb);
    for (var r2 = 0; r2 < N; r2++) lbl(s, 214, y + r2 * H + H / 2 + 4, 'Δ ' + fmt(gIn[r2], 1), { fill: r2 === iIn ? AMBER : SLATE, 'font-size': 10.5 });
    lbl(s, 20, y + N * H + 22, 'largest gap  d = ‖V − V′‖∞ = ' + fmt(gIn[iIn], 1), { fill: AMBER, 'font-weight': 700 });
    arrow(s, 262, y + 2.5 * H, 296, y + 2.5 * H, INK, 'k');
    machine(s, 300, y - 10, 160, N * H + 20);
    arrow(s, 466, y + 2.5 * H, 500, y + 2.5 * H, INK, 'k');
    if (st >= 1) {
      var ga = [], gb = []; ga[iOut] = LBLUE; gb[iOut] = LBLUE;
      table(s, 506, y, null, TA, ga); opTitle(s, 506 + 30, y - 8, 'V');
      table(s, 606, y, null, TB, gb); opTitle(s, 606 + 30, y - 8, 'V\'');
      for (var r3 = 0; r3 < N; r3++) lbl(s, 700, y + r3 * H + H / 2 + 4, 'Δ ' + fmt(gOut[r3], 1), { fill: r3 === iOut ? BLUE : SLATE, 'font-size': 10.5 });
      lbl(s, 506, y + N * H + 22, 'largest gap now ' + fmt(gOut[iOut], 1) + '  ≤  γ·d = ' + fmt(G * gIn[iIn], 1), { fill: BLUE, 'font-weight': 700 });
    } else {
      table(s, 506, y, null, TA); opTitle(s, 506 + 30, y - 8, 'V');
      table(s, 606, y, null, TB); opTitle(s, 606 + 30, y - 8, 'V\'');
      lbl(s, 506, y + N * H + 22, 'how far apart are these two?', { fill: SLATE });
    }
    if (st >= 2) {
      /* the strip: turn the machine again and again */
      var yb = y + N * H + 46, x0 = 20, d = gIn[iIn], scale = 12;
      lbl(s, x0, yb + 8, 'turn the machine again:', { fill: INK, 'font-weight': 700 });
      var xx = x0 + 160;
      for (var t = 0; t < 5; t++) {
        var val = d * Math.pow(G, t), wbar = val * scale;
        E('rect', { x: xx, y: yb, width: wbar, height: 12, fill: t === 0 ? AMBER : BLUE, opacity: 1 - 0.1 * t }, s);
        lbl(s, xx + wbar / 2, yb + 26, fmt(val, t < 3 ? 1 : 2), { 'text-anchor': 'middle', fill: SLATE, 'font-size': 10.5 });
        xx += wbar + 10;
      }
      lbl(s, 20, yb + 50, 'every turn multiplies the largest gap by γ = 0.9, wherever the two tables started', { fill: BLUE });
    }
  }

  /* ---------- maxineq ---------- */
  var F = [62, 85, 71, 90], Gm = [60, 88, 69, 87];           /* marks per question, every pair within 3 */
  function drawMaxineq(st) {
    clear();
    var s = svg(760, 250), x0 = 160, base = 200, bw = 32, gapx = 92, scale = 1.9;
    E('line', { x1: x0 - 30, y1: base, x2: x0 + 4 * gapx, y2: base, stroke: INK, 'stroke-width': 1.1 }, s);
    var fi = F.indexOf(Math.max.apply(null, F)), gi = Gm.indexOf(Math.max.apply(null, Gm));
    for (var q = 0; q < 4; q++) {
      var xf = x0 + q * gapx, xg = xf + bw + 6, hf = F[q] * scale, hg = Gm[q] * scale;
      E('rect', { x: xf, y: base - hf, width: bw, height: hf, fill: LBLUE, stroke: BLUE, 'stroke-width': st >= 1 && q === fi ? 2.2 : 1 }, s);
      E('rect', { x: xg, y: base - hg, width: bw, height: hg, fill: LRED, stroke: RED, 'stroke-width': st >= 1 && q === gi ? 2.2 : 1 }, s);
      lbl(s, xf + bw / 2, base - hf - 5, String(F[q]), { 'text-anchor': 'middle', fill: BLUE, 'font-size': 10.5 });
      lbl(s, xg + bw / 2, base - hg - 5, String(Gm[q]), { 'text-anchor': 'middle', fill: RED, 'font-size': 10.5 });
      IE437.math(s, xf + bw + 3, base + 16, 'a_' + (q + 1), { 'text-anchor': 'middle', 'font-size': 12 });
      lbl(s, xf + bw + 3, base + 32, '|f − g| = ' + Math.abs(F[q] - Gm[q]), { 'text-anchor': 'middle', fill: SLATE, 'font-size': 10.5 });
    }
    IE437.math(s, 22, base - 150, 'f(a)\\text{: student 1}', { fill: BLUE, 'font-size': 12.5 });
    IE437.math(s, 22, base - 128, 'g(a)\\text{: student 2}', { fill: RED, 'font-size': 12.5 });
    lbl(s, 22, base - 104, 'same four questions,', { fill: SLATE, 'font-size': 10.5 });
    lbl(s, 22, base - 90, 'every pair within 3', { fill: SLATE, 'font-size': 10.5 });
    if (st >= 1) {
      var yf = base - F[fi] * scale, yg = base - Gm[gi] * scale, xr = x0 + 4 * gapx + 10;
      E('line', { x1: x0 + fi * gapx, y1: yf, x2: xr, y2: yf, stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '4 3' }, s);
      E('line', { x1: x0 + gi * gapx + bw + 6, y1: yg, x2: xr, y2: yg, stroke: RED, 'stroke-width': 1, 'stroke-dasharray': '4 3' }, s);
      var ym = (yf + yg) / 2;
      IE437.math(s, xr + 8, ym - 8, '\\max_a f = ' + F[fi], { fill: BLUE, 'font-size': 12.5 });
      IE437.math(s, xr + 8, ym + 14, '\\max_a g = ' + Gm[gi], { fill: RED, 'font-size': 12.5 });
      lbl(s, xr + 8, ym + 40, 'the bests differ by ' + Math.abs(F[fi] - Gm[gi]) + ', within 3', { fill: INK, 'font-weight': 700 });
      lbl(s, xr + 8, ym + 56, 'though on different questions', { fill: SLATE, 'font-size': 10.5 });
    }
  }

  /* ---------- dispatch ---------- */
  var draw = MODE === 'two' ? drawTwo : MODE === 'maxineq' ? drawMaxineq : drawMachine;
  var MAX = MODE === 'two' ? 2 : 1, cur = 0;
  function show(i) { cur = Math.max(0, Math.min(MAX, i)); draw(cur); }
  show(0);
  return { steps: MAX, step: show, reset: function () { show(0); }, finish: function () { show(MAX); } };
});
