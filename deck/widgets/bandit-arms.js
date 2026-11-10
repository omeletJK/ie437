/* ============================================================
   widget: bandit-arms                                  (Chapter 8)
   The n-armed bandit of the source deck's opening (pp. 4–8).

   mode "arms"    pp. 4–7 — five arms with hidden true means. Each pull
                  pays a noisy reward; the bar is the running average
                  Q(a) = (r_1 + ... + r_k)/k, a literal count. The agent
                  pulls ε-greedily; the greedy arm is drawn solid. Buttons:
                  pull ×1 / ×10 / ×100, cycle ε, reset. Arrival pulls 20.
                  Options: seed (default 3), eps (default 0.1).
   mode "curves"  p. 8 — Sutton & Barto's 10-armed testbed, computed here:
                  q*(a) ~ N(0,1), rewards N(q*,1), 1000 steps, 200 runs,
                  ε ∈ {0, 0.01, 0.1}. Average reward and % optimal action
                  against the step. Static; computed once and cached.
   mode "soft"    p. 37 — two bar charts over five actions, a* the third.
                  Left, an ε-soft policy: every bar at or above the dashed
                  line ε/|A|. Right, the ε-greedy policy: every bar ε/|A|
                  and a* raised by 1−ε. Static. Option: eps (default 0.2).
   ============================================================ */
(function () {
  var CURVES = null;   /* the testbed is the same in every mount */

  IE437.widget('bandit-arms', function (host, opts) {
    var E = IE437.el;
    var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B', LBLUE = '#E3ECFB';
    var MODE = opts.mode || 'arms';

    /* a standard normal from a uniform generator (Box–Muller) */
    function gauss(rand) {
      var u = 1 - rand(), v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    /* ================= curves (p. 8) ================= */
    if (MODE === 'curves') {
      var EPS = [0, 0.01, 0.1], COL = [SLATE, AMBER, BLUE], T = 1000, RUNS = 200, K = 10;
      if (!CURVES) {
        var rand = IE437.rng(11);
        var rew = EPS.map(function () { var a = new Float64Array(T); return a; });
        var opt = EPS.map(function () { var a = new Float64Array(T); return a; });
        for (var run = 0; run < RUNS; run++) {
          var qs = [], best = 0;
          for (var a = 0; a < K; a++) { qs.push(gauss(rand)); if (qs[a] > qs[best]) best = a; }
          for (var e = 0; e < EPS.length; e++) {
            var Q = [], N = [], i;
            for (i = 0; i < K; i++) { Q.push(0); N.push(0); }
            for (var t = 0; t < T; t++) {
              var act;
              if (rand() < EPS[e]) act = Math.floor(rand() * K);
              else { act = 0; for (i = 1; i < K; i++) if (Q[i] > Q[act]) act = i; }
              var r = qs[act] + gauss(rand);
              N[act]++; Q[act] += (r - Q[act]) / N[act];
              rew[e][t] += r; if (act === best) opt[e][t] += 1;
            }
          }
        }
        CURVES = EPS.map(function (eps, e) {
          var p1 = [], p2 = [];
          for (var t = 0; t < T; t += 4) {
            var r4 = 0, o4 = 0;
            for (var u = t; u < t + 4; u++) { r4 += rew[e][u]; o4 += opt[e][u]; }
            p1.push([t + 2.5, r4 / RUNS / 4]); p2.push([t + 2.5, 100 * o4 / RUNS / 4]);
          }
          return { reward: p1, optimal: p2 };
        });
      }
      host.innerHTML =
        '<div class="wbar"><span class="wt">10-armed testbed &mdash; 200 runs of 1000 steps</span><span class="wspacer"></span></div>' +
        '<div class="wbody" style="flex-direction:row;gap:16px;padding:12px 14px 6px">' +
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">' +
        '<div class="wlabel" style="margin-bottom:3px">average reward</div><div data-c1></div></div>' +
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">' +
        '<div class="wlabel" style="margin-bottom:3px">% optimal action</div><div data-c2></div></div>' +
        '</div>' +
        '<div style="display:flex;gap:22px;justify-content:center;padding:0 0 9px;font:500 10px/1 var(--mono);letter-spacing:.08em">' +
        '<span style="color:' + SLATE + '">&#9473;&#9473; &epsilon; = 0 (greedy)</span>' +
        '<span style="color:' + AMBER + '">&#9473;&#9473; &epsilon; = 0.01</span>' +
        '<span style="color:' + BLUE + '">&#9473;&#9473; &epsilon; = 0.1</span></div>';
      var CW = 350, CH = 236, sv1 = IE437.svg(CW, CH), sv2 = IE437.svg(CW, CH);
      host.querySelector('[data-c1]').appendChild(sv1);
      host.querySelector('[data-c2]').appendChild(sv2);
      var xt = [1, 250, 500, 750, 1000];
      IE437.plot(sv1, {
        w: CW, h: CH, pad: { l: 40, r: 12, t: 10, b: 30 }, xdom: [1, T], ydom: [0, 1.6],
        yticks: [0, .5, 1, 1.5], xticks: xt, xlabel: 'step', yfmt: function (v) { return v.toFixed(1); },
        series: CURVES.map(function (c, e) { return { pts: c.reward, color: COL[e], w: 1.6 }; })
      });
      IE437.plot(sv2, {
        w: CW, h: CH, pad: { l: 40, r: 12, t: 10, b: 30 }, xdom: [1, T], ydom: [0, 100],
        yticks: [0, 20, 40, 60, 80, 100], xticks: xt, xlabel: 'step', yfmt: function (v) { return v + '%'; },
        series: CURVES.map(function (c, e) { return { pts: c.optimal, color: COL[e], w: 1.6 }; })
      });
      return { finish: function () {} };
    }

    /* ================= soft (p. 37) ================= */
    if (MODE === 'soft') {
      var EPSV = opts.eps == null ? 0.2 : Math.max(0.02, Math.min(0.9, +opts.eps)), NA = 5;
      host.innerHTML =
        '<div class="wbar"><span class="wt">soft policies &mdash; every action keeps a chance</span><span class="wspacer"></span>' +
        '<span class="wlabel">&epsilon;</span><span class="wnum">' + EPSV + '</span>' +
        '<span class="wlabel">|A|</span><span class="wnum">' + NA + '</span></div>' +
        '<div class="wbody" style="align-items:center;padding:8px 14px 6px"><div data-c></div></div>';
      var SW = 720, SH = 260, ss = IE437.svg(SW, SH);
      host.querySelector('[data-c]').appendChild(ss);
      var MONO = 'IBM Plex Mono, monospace';
      /* heights are schematic, as on the source slide: the floor ε/|A| is drawn
         FLOOR px tall whatever ε is, so it stays readable; the raised part of
         a* is the rest of the room up to the axis top                        */
      var BASE = 214, TOP = 66, FLOOR = 24;
      function panel(x0, title, formula, heights, raise) {
        var AX = x0 + 44, AW = 272, BW = 30, STEP = 52, star = 2;
        E('text', { x: x0 + 14, y: 22, 'font-size': 12.5, fill: INK, 'font-weight': 700, style: 'font-family:var(--sans)', text: title }, ss);
        IE437.math(ss, x0 + 14, 46, formula, { 'font-size': 14 });
        /* axes */
        E('line', { x1: AX, y1: BASE, x2: AX + AW, y2: BASE, stroke: INK, 'stroke-width': 1.3 }, ss);
        E('line', { x1: AX, y1: BASE, x2: AX, y2: TOP - 6, stroke: INK, 'stroke-width': 1.3 }, ss);
        /* the floor ε/|A| as a dashed line, labelled on the axis */
        E('line', { x1: AX - 6, y1: BASE - FLOOR, x2: AX + AW, y2: BASE - FLOOR, stroke: BLUE, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, ss);
        IE437.math(ss, AX - 10, BASE - FLOOR + 5, '\\epsilon/|A|', { 'font-size': 13, 'text-anchor': 'end', fill: BLUE });
        for (var a = 0; a < NA; a++) {
          var cx = AX + 30 + a * STEP, h = heights[a];
          E('rect', { x: cx - BW / 2, y: BASE - h, width: BW, height: h, fill: '#D4D4CE', stroke: SLATE, 'stroke-width': 1 }, ss);
          if (raise && a === star) {
            var y1 = TOP, y2 = BASE - h;
            E('rect', { x: cx - BW / 2, y: y1, width: BW, height: y2 - y1, fill: BLUE, 'fill-opacity': .85, stroke: BLUE, 'stroke-width': 1 }, ss);
            /* a bracket beside the raised part, and its label 1−ε */
            var bx = cx + BW / 2 + 8;
            E('path', { d: 'M' + bx + ' ' + y1 + ' h5 V' + y2 + ' h-5', fill: 'none', stroke: BLUE, 'stroke-width': 1.2 }, ss);
            IE437.math(ss, bx + 11, (y1 + y2) / 2 + 5, '1 - \\epsilon', { 'font-size': 14, fill: BLUE });
          }
          IE437.math(ss, cx, BASE + 20, a === star ? 'a^*' : 'a_' + (a + 1), { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': a === star ? 700 : 400 });
        }
      }
      /* left: every action at or above the floor; the shape is arbitrary, the floor is the point */
      panel(0, 'ε-soft policy', '\\pi(a|s) \\ge \\epsilon/|A| \\quad \\text{for all } a', [1.3, 1.7, 2.8, 2.0, 1.2].map(function (k) { return FLOOR * k; }), false);
      /* right: the floor everywhere, and the whole 1−ε on top of a* */
      panel(360, 'ε-greedy policy', '\\pi(a^*|s) = 1 - \\epsilon + \\epsilon/|A|', [FLOOR, FLOOR, FLOOR, FLOOR, FLOOR], true);
      E('line', { x1: 358, y1: 10, x2: 358, y2: 236, stroke: INK, 'stroke-opacity': .15, 'stroke-width': 1 }, ss);
      E('text', { x: SW / 2, y: SH - 4, 'text-anchor': 'middle', 'font-size': 9.5, fill: SLATE, 'font-family': MONO, 'letter-spacing': '.06em',
        text: 'five actions, a* the third  ·  bar heights schematic, not to scale' }, ss);
      return { finish: function () {} };
    }

    /* ================= arms (pp. 4–7) ================= */
    var K5 = 5, seed = +opts.seed || 3, eps = opts.eps == null ? 0.1 : +opts.eps;
    var rand, truth, Q, N, pulls, last;

    host.innerHTML =
      '<div class="wbar"><span class="wt">five arms &mdash; the running average, pull by pull</span><span class="wspacer"></span>' +
      '<span class="wlabel">last pull</span><span class="wnum" data-last>&mdash;</span>' +
      '<button class="wb" data-e>&epsilon; = <span data-ev></span></button>' +
      '<button class="wb" data-p1>pull &times;1</button>' +
      '<button class="wb" data-p10>&times;10</button>' +
      '<button class="wb" data-p100>&times;100</button>' +
      '<button class="wb" data-reset>reset</button></div>' +
      '<div class="wbody" style="align-items:center;padding:10px 14px 8px;gap:4px"><div data-c></div><div data-f></div></div>';
    var mount = host.querySelector('[data-c]'), fmount = host.querySelector('[data-f]');
    var W = 640, H = 262, s = IE437.svg(W, H);
    mount.appendChild(s);
    var fs = IE437.svg(640, 26);
    fmount.appendChild(fs);
    IE437.math(fs, 320, 18, 'Q(a) = (r_1 + r_2 + \\cdots + r_{k_a}) / k_a\\quad\\text{the mean of the }k_a\\text{ rewards the arm has paid}', { 'text-anchor': 'middle', 'font-size': 14 });

    var Y0 = 150, SC = 40;                       /* value 0 sits at y = 150; one unit is 40 px */
    function Y(v) { return Y0 - v * SC; }
    function greedy() { var g = 0; for (var a = 1; a < K5; a++) if (Q[a] > Q[g]) g = a; return g; }

    function reset() {
      rand = IE437.rng(seed);
      truth = []; Q = []; N = []; pulls = 0; last = null;
      for (var a = 0; a < K5; a++) { truth.push(-1 + 3 * rand()); Q.push(0); N.push(0); }
      draw();
    }
    function pull(n) {
      for (var i = 0; i < n; i++) {
        var a;
        if (rand() < eps) a = Math.floor(rand() * K5);
        else {
          /* greedy, ties broken at random (every arm starts at Q = 0) */
          var best = -Infinity, ties = [];
          for (var j = 0; j < K5; j++) { if (Q[j] > best + 1e-12) { best = Q[j]; ties = [j]; } else if (Math.abs(Q[j] - best) < 1e-12) ties.push(j); }
          a = ties[Math.floor(rand() * ties.length)];
        }
        var r = truth[a] + gauss(rand);
        N[a]++; Q[a] += (r - Q[a]) / N[a]; pulls++;
        last = { a: a, r: r };
      }
      draw();
    }

    function draw() {
      while (s.firstChild) s.removeChild(s.firstChild);
      host.querySelector('[data-ev]').textContent = eps;
      host.querySelector('[data-last]').textContent = last ? 'a' + (last.a + 1) + '  r = ' + (last.r >= 0 ? '+' : '−') + Math.abs(last.r).toFixed(2) : '—';
      /* axis and gridlines */
      [-1, 0, 1, 2].forEach(function (v) {
        E('line', { x1: 48, x2: W - 10, y1: Y(v), y2: Y(v), stroke: INK, 'stroke-opacity': v === 0 ? .5 : .12, 'stroke-width': v === 0 ? 1.2 : 1 }, s);
        E('text', { x: 40, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 10, fill: SLATE, 'font-family': 'IBM Plex Mono, monospace', text: v < 0 ? '−1' : String(v) }, s);
      });
      E('text', { x: 40, y: Y(2) - 14, 'text-anchor': 'end', 'font-size': 10, fill: SLATE, 'font-family': 'IBM Plex Mono, monospace', text: 'Q(a)' }, s);
      var g = greedy(), CW = 44;
      for (var a = 0; a < K5; a++) {
        var cx = 110 + a * 112, q = Q[a], qd = Math.max(-1.5, Math.min(2.5, q)), top = Math.min(Y(0), Y(qd)), h = Math.abs(Y(qd) - Y(0));
        var isG = a === g && pulls > 0, isLast = last && last.a === a;
        /* the running average as a bar from zero */
        if (N[a] > 0) E('rect', { x: cx - CW / 2, y: top, width: CW, height: Math.max(h, 1), fill: isG ? BLUE : LBLUE, stroke: isLast ? AMBER : BLUE, 'stroke-width': isLast ? 2.5 : 1.3 }, s);
        else E('line', { x1: cx - CW / 2, x2: cx + CW / 2, y1: Y(0), y2: Y(0), stroke: SLATE, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }, s);
        /* the hidden true mean */
        E('line', { x1: cx - CW / 2 - 8, x2: cx + CW / 2 + 8, y1: Y(truth[a]), y2: Y(truth[a]), stroke: SLATE, 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, s);
        E('circle', { cx: cx + CW / 2 + 8, cy: Y(truth[a]), r: 4, fill: SLATE }, s);
        /* the arm label and its count */
        IE437.math(s, cx, 232, 'a_' + (a + 1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': isG ? 700 : 400, fill: isG ? BLUE : INK });
        E('text', { x: cx, y: 252, 'text-anchor': 'middle', 'font-size': 11, fill: SLATE, 'font-family': 'IBM Plex Mono, monospace', text: 'k = ' + N[a] + (N[a] > 0 ? '  Q = ' + (q >= 0 ? '' : '−') + Math.abs(q).toFixed(2) : '') }, s);
      }
      /* legend, top right */
      E('rect', { x: 452, y: 14, width: 14, height: 10, fill: BLUE }, s);
      E('text', { x: 472, y: 23, 'font-size': 10.5, fill: SLATE, text: 'greedy arm (largest average)' }, s);
      E('line', { x1: 452, x2: 466, y1: 36, y2: 36, stroke: SLATE, 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, s);
      E('circle', { cx: 466, cy: 36, r: 3.5, fill: SLATE }, s);
      E('text', { x: 472, y: 40, 'font-size': 10.5, fill: SLATE, text: 'hidden true mean q*(a)' }, s);
      E('text', { x: 472, y: 56, 'font-size': 10.5, fill: SLATE, text: pulls + ' pulls so far' }, s);
    }

    host.querySelector('[data-p1]').onclick = function () { pull(1); };
    host.querySelector('[data-p10]').onclick = function () { pull(10); };
    host.querySelector('[data-p100]').onclick = function () { pull(100); };
    host.querySelector('[data-reset]').onclick = reset;
    host.querySelector('[data-e]').onclick = function () { eps = eps === 0 ? 0.1 : eps === 0.1 ? 0.3 : 0; reset(); };

    reset();
    return {
      reset: reset,
      auto: function () { if (pulls === 0) pull(20); },
      finish: function () { if (pulls < 100) pull(100 - pulls); }
    };
  });
})();
