/* ============================================================
   widget: dyna-imagination
   Act 4's claim, run. Dyna-Q on Sutton's maze: one real step, then
   k imagined updates drawn from the learned model. Raising k
   collapses the number of REAL environment steps needed — and then
   corrupting a fraction of the model's transitions shows the other
   half of the trade, where planning harder on a wrong model is
   worse than not planning at all.

   Tabular Q-learning, alpha .1, gamma .95, eps .1, random
   tie-breaking; 25 episodes averaged over 10 seeded runs, model
   corruption fixed per (s,a) so it is a bias, not noise.

   Swept in node before shipping. Real steps over 25 episodes:
     clean model   k=0 4956 · k=1 2054 · k=2 1462 · k=5 1362 · k=10 1055 · k=25 1394
     35% corrupt   k=0 4956 · k=1 2540 · k=2 2334 · k=5 2765 · k=10 3641 · k=25 4707
   So the clean gain is 4.7x at k=10, and at 35% corruption the
   optimum moves to k=2 and k=25 is no better than planning not at all.
   ============================================================ */
IE437.widget('dyna-imagination', function (host) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706',
      RED = '#D64545', SLATE = '#64748B';

  var ROWS = 6, COLS = 9;
  var WALL = { '1,2': 1, '2,2': 1, '3,2': 1, '4,5': 1, '0,7': 1, '1,7': 1, '2,7': 1 };
  var START = 2 * COLS + 0, GOAL = 0 * COLS + 8;
  var MOV = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function step(s, a) {
    var r = Math.floor(s / COLS), c = s % COLS;
    var nr = r + MOV[a][0], nc = c + MOV[a][1];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || WALL[nr + ',' + nc]) { nr = r; nc = c; }
    var ns = nr * COLS + nc, done = (ns === GOAL);
    return [ns, done ? 1 : 0, done];
  }

  var EP = 25, CAP = 1200, RUNS = 10;
  var KS = [0, 1, 2, 5, 10, 25], BIAS = [0, 0.15, 0.35];
  var ALPHA = 0.1, GAMMA = 0.95, EPS = 0.1;

  function run(k, bias, seed) {
    var rnd = IE437.rng(seed), brnd = IE437.rng(seed * 7919 + 13);
    var nSA = ROWS * COLS * 4;
    var Q = new Float64Array(nSA), Mns = new Int32Array(nSA), Mr = new Float64Array(nSA);
    var seen = [], seenSet = new Uint8Array(nSA);
    var corrupt = new Uint8Array(nSA);
    for (var i = 0; i < nSA; i++) corrupt[i] = brnd() < bias ? 1 : 0;
    var perEp = [], total = 0;
    for (var ep = 0; ep < EP; ep++) {
      var s = START, steps = 0;
      for (;;) {
        var a;
        if (rnd() < EPS) a = Math.floor(rnd() * 4);
        else {
          var bv = -1e9, ties = [];
          for (var q = 0; q < 4; q++) {
            var v = Q[s * 4 + q];
            if (v > bv + 1e-12) { bv = v; ties = [q]; }
            else if (v > bv - 1e-12) ties.push(q);
          }
          a = ties[Math.floor(rnd() * ties.length)];
        }
        var t = step(s, a), ns = t[0], r = t[1], done = t[2];
        steps++; total++;
        var mx = -1e9;
        for (var j = 0; j < 4; j++) if (Q[ns * 4 + j] > mx) mx = Q[ns * 4 + j];
        Q[s * 4 + a] += ALPHA * (r + GAMMA * (done ? 0 : mx) - Q[s * 4 + a]);
        var key = s * 4 + a;
        if (corrupt[key]) { var w = step(s, (a + 1) % 4); Mns[key] = w[0]; Mr[key] = w[1]; }
        else { Mns[key] = ns; Mr[key] = r; }
        if (!seenSet[key]) { seenSet[key] = 1; seen.push(key); }
        for (var p = 0; p < k; p++) {
          var k2 = seen[Math.floor(rnd() * seen.length)];
          var ns2 = Mns[k2], r2 = Mr[k2], mx2 = -1e9;
          for (var j2 = 0; j2 < 4; j2++) if (Q[ns2 * 4 + j2] > mx2) mx2 = Q[ns2 * 4 + j2];
          Q[k2] += ALPHA * (r2 + GAMMA * (ns2 === GOAL ? 0 : mx2) - Q[k2]);
        }
        s = ns;
        if (done || steps >= CAP) break;
      }
      perEp.push(steps);
    }
    return { perEp: perEp, total: total };
  }

  function avg(k, bias) {
    var acc = new Array(EP).fill(0), tot = 0;
    for (var s = 1; s <= RUNS; s++) {
      var r = run(k, bias, s * 101 + 7);
      for (var e = 0; e < EP; e++) acc[e] += r.perEp[e];
      tot += r.total;
    }
    return { perEp: acc.map(function (v) { return v / RUNS; }), total: tot / RUNS };
  }

  /* everything is precomputed once and cached — the buttons only redraw */
  var CURVE_K = [0, 5, 25];
  var DATA = BIAS.map(function (b) {
    return { sweep: KS.map(function (k) { return avg(k, b).total; }),
             curves: CURVE_K.map(function (k) { return avg(k, b).perEp; }) };
  });

  var bi = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">One real step, then k imagined ones</span>' +
    '<span class="wspacer"></span><span class="wlabel">wrong transitions in the model</span>' +
    BIAS.map(function (b, i) {
      return '<button class="wb" data-b="' + i + '">' + Math.round(b * 100) + '%</button>';
    }).join('') + '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:24px;align-items:center;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">real steps per episode &mdash; log scale</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">total real steps for 25 episodes</div><div data-c2></div></div>' +
    '<div style="width:222px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var W1 = 336, W2 = 306, CH = 212;
  var s1 = IE437.svg(W1, CH), s2 = IE437.svg(W2, CH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  var CCOL = [SLATE, BLUE, AMBER];
  var BCOL = [GREEN, AMBER, RED];

  function draw() {
    var D = DATA[bi];

    /* --- 1 · learning curves --- */
    var lg = function (v) { return Math.log(Math.max(v, 1)) / Math.LN10; };
    var series = D.curves.map(function (c, i) {
      return { pts: c.map(function (v, e) { return [e + 1, lg(v)]; }), color: CCOL[i], w: 2 };
    });
    IE437.plot(s1, {
      w: W1, h: CH, pad: { l: 36, r: 10, t: 12, b: 28 }, xdom: [1, EP], ydom: [1, 3],
      xticks: [1, 5, 10, 15, 20, 25], yticks: [1, 1.5, 2, 2.5, 3],
      yfmt: function (t) { return t === 1 ? '10' : t === 2 ? '100' : t === 3 ? '1000' : ''; },
      xlabel: 'episode', series: series
    });
    CURVE_K.forEach(function (k, i) {
      var yy = 24 + i * 12;
      E('line', { x1: 206, y1: yy, x2: 220, y2: yy, stroke: CCOL[i], 'stroke-width': 2 }, s1);
      E('text', { x: 224, y: yy + 3.2, 'font-size': 8.5, fill: INK, 'fill-opacity': .62,
        'font-family': 'IBM Plex Mono, monospace',
        text: k === 0 ? 'k = 0  (no model)' : 'k = ' + k }, s1);
    });

    /* --- 2 · total real steps vs k --- */
    var ymax = 5600;
    var faint = BIAS.map(function (_, i) {
      return { pts: DATA[i].sweep.map(function (v, j) { return [j, v]; }),
               color: BCOL[i], w: i === bi ? 2.6 : 1.2, dots: i === bi };
    });
    var p2 = IE437.plot(s2, {
      w: W2, h: CH, pad: { l: 40, r: 10, t: 12, b: 28 }, xdom: [0, KS.length - 1], ydom: [0, ymax],
      xticks: KS.map(function (_, i) { return i; }),
      xfmt: function (i) { return String(KS[i]); },
      yticks: [0, 2000, 4000], yfmt: function (t) { return t / 1000 + 'k'; },
      xlabel: 'imagined updates per real step, k', series: faint
    });
    /* the "no model at all" reference */
    E('line', { x1: p2.X(0), y1: p2.Y(D.sweep[0]), x2: p2.X(KS.length - 1), y2: p2.Y(D.sweep[0]),
      stroke: INK, 'stroke-opacity': .35, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, s2);
    E('text', { x: p2.X(KS.length - 1) - 2, y: p2.Y(D.sweep[0]) - 5, 'text-anchor': 'end',
      'font-size': 8.5, 'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45,
      text: 'no model at all' }, s2);
    BIAS.forEach(function (bv, i) {
      var yy = CH - 76 + i * 13;
      E('line', { x1: 52, y1: yy, x2: 66, y2: yy, stroke: BCOL[i],
        'stroke-width': i === bi ? 2.6 : 1.2, 'stroke-opacity': i === bi ? 1 : .55 }, s2);
      E('text', { x: 70, y: yy + 3.2, 'font-size': 8.5, 'font-weight': i === bi ? 700 : 400,
        'font-family': 'IBM Plex Mono, monospace', fill: BCOL[i],
        'fill-opacity': i === bi ? .95 : .55, text: Math.round(bv * 100) + '% wrong' }, s2);
    });
    var best = 0;
    D.sweep.forEach(function (v, i) { if (v < D.sweep[best]) best = i; });
    E('circle', { cx: p2.X(best), cy: p2.Y(D.sweep[best]), r: 5.5, fill: 'none',
      stroke: BCOL[bi], 'stroke-width': 2 }, s2);

    Array.prototype.forEach.call(host.querySelectorAll('[data-b]'), function (b, i) {
      b.classList.toggle('on', i === bi);
    });
    var gain = D.sweep[0] / D.sweep[best], last = D.sweep[KS.length - 1];
    host.querySelector('[data-num]').innerHTML =
      'best <b>k = ' + KS[best] + '</b><br>' +
      '<b>' + Math.round(D.sweep[best]) + '</b> real steps, against <b>' + Math.round(D.sweep[0]) +
      '</b> with no model<br><br>a saving of <b>' + gain.toFixed(1) + '&times;</b>' +
      '<br>at k = 25: <b style="color:' + (last > D.sweep[0] * 0.9 ? RED : GREEN) + '">' +
      Math.round(last) + '</b>';
    host.querySelector('[data-note]').innerHTML = bi === 0
      ? 'A perfect model. More imagination is simply more value iteration, and it is nearly free.'
      : (bi === 1
        ? 'One transition in seven is wrong. The optimum survives, but it has stopped rewarding a bigger k.'
        : 'One in three is wrong. The optimum has moved down to <b>k = 2</b>, and by k = 25 the model has <b>stopped buying anything</b> — on the left, its curve sits <b>above</b> k = 0 from the twentieth episode on.');
  }

  Array.prototype.forEach.call(host.querySelectorAll('[data-b]'), function (b) {
    b.onclick = function () { bi = +b.getAttribute('data-b'); draw(); };
  });

  draw();
  return { finish: function () { bi = 2; draw(); } };
});
