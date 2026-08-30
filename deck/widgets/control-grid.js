/* ============================================================
   widget: control-grid                             (Chapter 9, Act 1)
   A redrawing of the source deck's own "Overview" pages (deck 9,
   pp. 4-5, repeated at pp. 23-24). Not a simulation — it is the
   figure the professor uses to place this lecture, and it makes a
   claim the course cube cannot: Lectures 7 and 9 occupy the SAME
   cell of the cube, and separate only one level down, on two finer
   coordinates the cube does not resolve —

       action space   finite (lineage A)   vs   infinite (lineage B)
       time space     discrete             vs   continuous

   Deleting the model is then a single vertical arrow acting on both
   columns at once: 7 -> 8 on the left, 9 -> 10 on the right.
   The empty continuous-time row of the model-free layer is the
   source deck's own, and it is honest: this course does not go there.
   ============================================================ */
IE437.widget('control-grid', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', PANEL2 = '#E7E7E1';
  var W = 1064, H = 322;

  host.innerHTML =
    '<div class="wbody" style="padding:10px 12px 8px;align-items:center"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function txt(x, y, s, o) {
    o = o || {};
    var n = E('text', {
      x: x, y: y, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 11,
      'font-weight': o.weight || 400, fill: o.fill || INK,
      'fill-opacity': o.op === undefined ? 1 : o.op, text: s
    }, sv);
    if (o.mono) n.setAttribute('font-family', 'IBM Plex Mono, monospace');
    if (o.italic) n.setAttribute('font-style', 'italic');
    if (o.rot) n.setAttribute('transform', o.rot);
    return n;
  }
  function box(x, y, w, h, o) {
    o = o || {};
    return E('rect', {
      x: x, y: y, width: w, height: h, fill: o.fill || 'none',
      'fill-opacity': o.fo === undefined ? 1 : o.fo,
      stroke: o.stroke || INK, 'stroke-opacity': o.so === undefined ? 0.26 : o.so,
      'stroke-width': o.sw || 1
    }, sv);
  }

  /* ================= left — the outer 2x2 of the source deck ============ */
  var LX = 2, LW = 72, CW = 92, LY = 92, HH = 28, RH = 50;
  var LR = LX + LW + 2 * CW;                       /* right edge = 258 */
  (function () {
    txt(LX + LW + CW, LY - 14, 'the cube — one cell of it', { size: 10, mono: true, op: .42 });
    box(LX + LW, LY, CW, HH, { fill: PANEL2, fo: .9 });
    box(LX + LW + CW, LY, CW, HH, { fill: PANEL2, fo: .9 });
    txt(LX + LW + CW / 2, LY + 17, 'Single Agent', { size: 10, weight: 600, op: .8 });
    txt(LX + LW + CW * 1.5, LY + 17, 'Multi Agent', { size: 10, weight: 600, op: .4 });
    [['Static', 'Static', 'optimization', 'Static', 'Game', false],
     ['Dynamic', 'Dynamic', 'Optimization', 'Dynamic', 'Game', true]].forEach(function (r, i) {
      var y = LY + HH + i * RH;
      box(LX, y, LW, RH, { fill: PANEL2, fo: .9 });
      txt(LX + LW / 2, y + RH / 2 + 4, r[0], { size: 10, weight: 600, op: .8 });
      box(LX + LW, y, CW, RH, r[5] ? { fill: BLUE, fo: .14, stroke: INK, so: .9, sw: 1.6 } : {});
      box(LX + LW + CW, y, CW, RH, {});
      var w = r[5] ? 700 : 400, op = r[5] ? 1 : .6;
      txt(LX + LW + CW / 2, y + RH / 2 - 2, r[1], { size: 10, weight: w, op: op });
      txt(LX + LW + CW / 2, y + RH / 2 + 11, r[2], { size: 10, weight: w, op: op });
      txt(LX + LW + CW * 1.5, y + RH / 2 - 2, r[3], { size: 10, op: .32 });
      txt(LX + LW + CW * 1.5, y + RH / 2 + 11, r[4], { size: 10, op: .32 });
    });
  })();

  /* ================= the zoom wedge ==================================== */
  var AX = 316;                                    /* left edge of the axis label */
  E('path', {
    d: 'M' + LR + ' ' + (LY + HH) + 'L' + AX + ' 10 L' + AX + ' ' + (H - 10) +
       'L' + LR + ' ' + (LY + HH + RH) + 'Z',
    fill: SLATE, 'fill-opacity': .085
  }, sv);
  txt((LR + AX) / 2, LY + HH + RH / 2 + 4, 'zoom', { size: 9, mono: true, op: .38 });

  /* ================= right — action space x time space ================== */
  var LC = 336, LCW = 56, TC = 392, TCW = 78, D0 = 470;
  var COL = (1062 - D0) / 2;                       /* = 296 */
  var GY = 34, HDR = 26, yA = GY + HDR, R1 = 64, SEP = 32;
  var yB = yA + 2 * R1 + SEP, R2 = 58;

  txt(D0 + COL, GY - 10, 'ACTION SPACE', { size: 9.5, mono: true, weight: 600, op: .45 });
  box(D0, GY, COL, HDR, { fill: PANEL2, fo: .9 });
  box(D0 + COL, GY, COL, HDR, { fill: PANEL2, fo: .9 });
  txt(D0 + COL / 2, GY + 16, 'Finite', { size: 11, weight: 600, op: .8 });
  txt(D0 + COL * 1.5, GY + 16, 'Infinite', { size: 11, weight: 600, op: .8 });
  txt(AX + 10, (yA + yB + R2) / 2, 'TIME SPACE', {
    size: 9.5, mono: true, weight: 600, op: .45,
    rot: 'rotate(-90 ' + (AX + 10) + ' ' + ((yA + yB + R2) / 2) + ')'
  });

  /* layer columns */
  box(LC, yA, LCW, 2 * R1, { fill: PANEL2, fo: .9 });
  box(LC, yB, LCW, R2, { fill: PANEL2, fo: .9 });
  txt(LC + LCW / 2, yA + R1, 'MODEL BASED', {
    size: 9.5, mono: true, weight: 700, op: .7,
    rot: 'rotate(-90 ' + (LC + LCW / 2) + ' ' + (yA + R1) + ')'
  });
  txt(LC + LCW / 2, yB + R2 / 2 + 1, 'MODEL FREE', {
    size: 9.5, mono: true, weight: 700, op: .7,
    rot: 'rotate(-90 ' + (LC + LCW / 2) + ' ' + (yB + R2 / 2 + 1) + ')'
  });

  /* time-row columns */
  [[yA, R1, 'Discrete'], [yA + R1, R1, 'Continuous'], [yB, R2, 'Discrete']].forEach(function (t) {
    box(TC, t[0], TCW, t[1], { fill: PANEL2, fo: .55 });
    txt(TC + TCW / 2, t[0] + t[1] / 2 + 4, t[2], { size: 10, weight: 600, op: .68 });
  });

  function cell(cx, y, w, h, o) {
    box(cx, y, w, h, o.here
      ? { fill: BLUE, fo: .12, stroke: BLUE, so: .9, sw: 1.7 }
      : (o.dim ? { so: .16 } : { fill: SLATE, fo: .075 }));
    var op = o.dim ? .36 : 1;
    txt(cx + w / 2, y + 20, o.t1, {
      size: 11.5, weight: o.here ? 700 : 600, op: op * (o.here ? 1 : .8),
      fill: o.here ? BLUE : INK
    });
    if (o.t2) txt(cx + w / 2, y + 34, o.t2, { size: 10.5, mono: true, op: op * .55 });
    if (o.tag) txt(cx + w / 2, y + h - 8, o.tag, {
      size: 9, mono: true, weight: 700, op: op * .85, fill: o.here ? BLUE : INK
    });
  }

  cell(D0, yA, COL, R1, { t1: 'Discrete-time MDP', t2: 'P(s′ | s, a)', tag: 'LECTURE 7' });
  cell(D0 + COL, yA, COL, R1, {
    t1: 'Discrete-time dynamic system', t2: 'x(k+1) = f(x, u)', tag: 'LECTURE 9', here: true
  });
  cell(D0, yA + R1, COL, R1, {
    t1: 'Continuous-time MDP', t2: 'P(s(t+h) | s, a)', tag: 'not in this course', dim: true
  });
  cell(D0 + COL, yA + R1, COL, R1, {
    t1: 'Continuous-time dynamic system', t2: 'dx/dt = f(x, u)', tag: 'LECTURE 9', here: true
  });

  /* ---- the arrow band: delete the model ---- */
  var ay = yA + 2 * R1;
  E('line', {
    x1: LC, y1: ay + 1, x2: 1062, y2: ay + 1,
    stroke: INK, 'stroke-opacity': .2, 'stroke-dasharray': '5 4'
  }, sv);
  [[COL / 2, 'delete P, R'], [COL * 1.5, 'delete f']].forEach(function (d) {
    var cx = D0 + d[0];
    E('path', { d: 'M' + cx + ' ' + (ay + 6) + 'L' + cx + ' ' + (ay + SEP - 9), stroke: SLATE, 'stroke-width': 1.7 }, sv);
    E('path', {
      d: 'M' + (cx - 4.5) + ' ' + (ay + SEP - 12) + 'L' + cx + ' ' + (ay + SEP - 3) +
         'L' + (cx + 4.5) + ' ' + (ay + SEP - 12) + 'Z', fill: SLATE
    }, sv);
    txt(cx + 54, ay + SEP / 2 + 4, d[1], { size: 9.5, mono: true, weight: 600, op: .6, fill: SLATE });
  });

  cell(D0, yB, COL, R2, { t1: 'Value-based RL', tag: 'LECTURE 8' });
  cell(D0 + COL, yB, COL, R2, { t1: 'Policy-based RL', tag: 'LECTURE 10' });

  txt(D0 + COL, yB + R2 + 16,
    'the model-free continuous-time row is empty in the source deck — and stays empty here',
    { size: 9.5, mono: true, op: .34 });

  return { finish: function () { } };
});
