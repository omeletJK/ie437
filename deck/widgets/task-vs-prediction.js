/* ============================================================
   widget: task-vs-prediction
   Act 3's claim, computed. A misspecified model class is fitted
   twice to the same system: once to minimise prediction error on
   the data, once to minimise the TASK loss by differentiating
   through the planner. As the task drifts away from where the
   data was collected, the task-fitted model becomes a worse
   predictor and a better controller — the shape of Figure 5 of
   the differentiable-MPC paper, reproduced from first principles.

   truth      x' = 0.9 x + b(x) u,   b(x) = 1 + 0.6 x^2
   model      x' = a x + b u                (b cannot depend on x)
   planner    min_u (x')^2 + 0.5 u^2   =>   u = -[ab/(b^2+0.5)] x
   expert     the same planner on the TRUE dynamics

   Both losses have closed forms in the fitted parameters, so
   nothing here is sampled. Checked in node against a direct
   quadrature over both distributions; the two agree to 5 dp.
   At the default setting the prediction-fitted model predicts
   3.5x better and controls 4.7x worse.
   ============================================================ */
IE437.widget('task-vs-prediction', function (host) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706', SLATE = '#64748B';

  var A = 0.9, G = 0.6, LAM = 0.5, SD = 0.5, EU2 = 1 / 3;
  function bx(x) { return 1 + G * x * x; }
  function kstar(x) { var b = bx(x); return A * b / (b * b + LAM); }
  function kmod(a, b) { return a * b / (b * b + LAM); }

  /* moments of the DATA distribution x ~ N(0, SD^2), u ~ U[-1,1] */
  var Ex2d = SD * SD, Eb = 1 + G * Ex2d, Eb2 = 1 + 2 * G * Ex2d + 3 * G * G * Ex2d * Ex2d;
  function predLoss(a, b) { return (A - a) * (A - a) * Ex2d + EU2 * (Eb2 - 2 * b * Eb + b * b); }

  /* moments of the TASK distribution x ~ N(0, st^2) */
  function taskMom(st) {
    var m0 = 0, m1 = 0, m2 = 0, Z = 0, M = 6 * st, N = 801;
    for (var i = 0; i < N; i++) {
      var x = -M + 2 * M * i / (N - 1), w = Math.exp(-0.5 * x * x / (st * st)), k = kstar(x);
      Z += w; m0 += w * x * x; m1 += w * x * x * k; m2 += w * x * x * k * k;
    }
    return { Ex2: m0 / Z, Exk: m1 / Z, Exk2: m2 / Z };
  }
  function taskLoss(k, M) { return k * k * M.Ex2 - 2 * k * M.Exk + M.Exk2; }

  var ST = [0.3, 0.5, 0.8, 1.1, 1.5], si = 3;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Fit the model to predict, or fit it to control</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">where the task lives</span>' +
    '<span class="wnum" data-st style="min-width:56px;display:inline-block;text-align:right"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:24px;align-items:center;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the control law each model asks for</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    '<div class="wlabel">prediction loss, on the data</div><div data-c2></div>' +
    '<div class="wlabel">task loss &mdash; distance to the expert</div><div data-c3></div></div>' +
    '<div style="width:238px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var CW = 330, CH = 216, BW = 274, BH = 74;
  var s1 = IE437.svg(CW, CH), s2 = IE437.svg(BW, BH), s3 = IE437.svg(BW, BH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);
  host.querySelector('[data-c3]').appendChild(s3);

  function barPair(sv, vals, cols, labels, fmt) {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var mx = Math.max(vals[0], vals[1]) * 1.28 + 1e-9;
    vals.forEach(function (v, i) {
      var y = 6 + i * 34, w = Math.max(2, (BW - 122) * v / mx);
      E('text', { x: 0, y: y + 12, 'font-size': 9, 'font-family': 'IBM Plex Mono, monospace',
        fill: INK, 'fill-opacity': .55, text: labels[i] }, sv);
      E('rect', { x: 68, y: y + 3, width: w, height: 13, rx: 1.5, fill: cols[i], 'fill-opacity': .85 }, sv);
      E('text', { x: 68 + w + 6, y: y + 13.5, 'font-size': 9.5, 'font-weight': 600,
        'font-family': 'IBM Plex Mono, monospace', fill: cols[i], text: fmt(v) }, sv);
    });
  }

  function draw() {
    var st = ST[si], M = taskMom(st), kt = M.Exk / M.Ex2;
    var ap = A, bp = Eb, kp = kmod(ap, bp);
    /* the task-loss fit: hit k_task, breaking the tie by prediction loss */
    var best = null;
    for (var i = 1; i <= 3000; i++) {
      var b = 0.05 + i * 0.001, a = kt * (b * b + LAM) / b, L = predLoss(a, b);
      if (!best || L < best.L) best = { a: a, b: b, L: L };
    }
    var lpP = predLoss(ap, bp), lpT = best.L, ltP = taskLoss(kp, M), ltT = taskLoss(kt, M);

    /* ---------- the control laws ---------- */
    var xd = [-2.2, 2.2], yd = [-1.4, 1.4], ex = [], pl = [], tl = [];
    for (var j = 0; j <= 220; j++) {
      var x = xd[0] + (xd[1] - xd[0]) * j / 220;
      ex.push([x, -kstar(x) * x]); pl.push([x, -kp * x]); tl.push([x, -kt * x]);
    }
    var p = IE437.plot(s1, {
      w: CW, h: CH, pad: { l: 34, r: 10, t: 12, b: 28 }, xdom: xd, ydom: yd,
      xticks: [-2, -1, 0, 1, 2], yticks: [-1, 0, 1], xlabel: 'state x', ylabel: 'action u',
      series: [{ pts: ex, color: BLUE, w: 2.4 },
               { pts: pl, color: AMBER, w: 1.9, dash: '5 3' },
               { pts: tl, color: GREEN, w: 1.9 }]
    });
    /* where the data was, and where the task is */
    E('rect', { x: p.X(-SD), y: 12, width: p.X(SD) - p.X(-SD), height: CH - 40,
      fill: SLATE, 'fill-opacity': .11 }, s1);
    E('text', { x: p.X(0), y: 22, 'text-anchor': 'middle', 'font-size': 8,
      'font-family': 'IBM Plex Mono, monospace', fill: SLATE, text: 'DATA' }, s1);
    [-st, st].forEach(function (v) {
      E('line', { x1: p.X(v), y1: 12, x2: p.X(v), y2: CH - 28, stroke: BLUE,
        'stroke-opacity': .45, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, s1);
    });
    E('text', { x: p.X(st) + 4, y: 22, 'font-size': 8, 'font-family': 'IBM Plex Mono, monospace',
      fill: BLUE, 'fill-opacity': .8, text: 'TASK' }, s1);
    E('rect', { x: 38, y: CH - 88, width: 128, height: 40, rx: 2, fill: '#ffffff',
      'fill-opacity': .8 }, s1);
    [['expert', BLUE, ''], ['fitted to predict', AMBER, '5 3'], ['fitted to the task', GREEN, '']]
      .forEach(function (it, i) {
        var yy = CH - 78 + i * 12;
        E('line', { x1: 42, y1: yy, x2: 56, y2: yy, stroke: it[1], 'stroke-width': 2,
          'stroke-dasharray': it[2] }, s1);
        E('text', { x: 60, y: yy + 3.2, 'font-size': 8.5, fill: INK, 'fill-opacity': .6,
          'font-family': 'IBM Plex Mono, monospace', text: it[0] }, s1);
      });

    /* ---------- the two ledgers ---------- */
    var f4 = function (v) { return v.toFixed(4); };
    barPair(s2, [lpP, lpT], [AMBER, GREEN], ['predict-fit', 'task-fit'], f4);
    barPair(s3, [ltP, ltT], [AMBER, GREEN], ['predict-fit', 'task-fit'], f4);

    host.querySelector('[data-st]').textContent = 'σ = ' + st.toFixed(1);
    host.querySelector('[data-num]').innerHTML =
      'fitted to <b style="color:' + AMBER + '">predict</b>: a = ' + ap.toFixed(2) + ', b = ' + bp.toFixed(2) +
      '<br>fitted to the <b style="color:' + GREEN + '">task</b>: a = ' + best.a.toFixed(2) + ', b = ' + best.b.toFixed(2) +
      '<br><br>predicts <b>' + (lpT / lpP).toFixed(1) + '&times;</b> worse' +
      '<br>controls <b>' + (ltP / ltT).toFixed(1) + '&times;</b> better';
    host.querySelector('[data-note]').innerHTML = (si === 0)
      ? 'With the task inside the data band the two fits <b>coincide</b>. Task-loss training buys nothing when the model is already right where it is used.'
      : 'The model class cannot bend, so it must choose <b>where</b> to be wrong. Prediction loss chooses on the data’s terms; the task loss chooses on the controller’s.';
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: ST.length - 1, step: 1, value: si,
    on: function (v) { si = v; draw(); }
  });

  draw();
  return { finish: function () { si = 4; draw(); } };
});
