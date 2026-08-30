/* ============================================================
   widget: contraction-rate
   Act 4's proof, drawn rather than asserted.

   The Bellman optimality operator is a gamma-contraction in the
   sup norm, so  ||V_k - V*||_inf <= gamma^k ||V_0 - V*||_inf.
   On a log axis that bound is a straight line of slope log(gamma),
   and the measured error must sit on or below it.

   Run on a seeded random MDP (8 states, 3 actions, dense kernel,
   rewards in [-1,1]) so the picture is the general theorem, not a
   feature of one gridworld.  Checked in node: the least-squares
   slope of log10||V_k - V*|| over sweeps 5..25 equals log10(gamma)
   to five decimal places at gamma = 0.5, 0.8 and 0.95, and the
   bound holds at every k.
   ============================================================ */
IE437.widget('contraction-rate', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706';
  var NS = 8, NA = 3, KMAX = 60;

  /* ---------- a seeded random MDP ---------- */
  var rnd = IE437.rng(opts.seed || 11);
  var T = [], RW = [], s, a, n;
  for (s = 0; s < NS; s++) {
    T.push([]); RW.push([]);
    for (a = 0; a < NA; a++) {
      var row = [], z = 0;
      for (n = 0; n < NS; n++) { var v = Math.pow(rnd(), 3); row.push(v); z += v; }
      for (n = 0; n < NS; n++) row[n] /= z;
      T[s].push(row); RW[s].push(rnd() * 2 - 1);
    }
  }
  function apply(V, g) {
    var W = [], i, j, k;
    for (i = 0; i < NS; i++) {
      var m = -1e18;
      for (j = 0; j < NA; j++) {
        var e = 0;
        for (k = 0; k < NS; k++) e += T[i][j][k] * V[k];
        m = Math.max(m, RW[i][j] + g * e);
      }
      W.push(m);
    }
    return W;
  }
  function trace(g) {
    var V = [], i;
    for (i = 0; i < NS; i++) V.push(0);
    for (i = 0; i < 6000; i++) V = apply(V, g);
    var VS = V.slice(), U = [], errs = [];
    for (i = 0; i < NS; i++) U.push(0);
    for (var k = 0; k <= KMAX; k++) {
      var e = 0;
      for (i = 0; i < NS; i++) e = Math.max(e, Math.abs(U[i] - VS[i]));
      errs.push(e); U = apply(U, g);
    }
    /* least-squares slope of log10(err) over the clean middle of the run */
    var xs = [], ys = [];
    for (k = 5; k <= 30; k++) if (errs[k] > 1e-12) { xs.push(k); ys.push(Math.log10(errs[k])); }
    var N = xs.length, mx = 0, my = 0;
    for (i = 0; i < N; i++) { mx += xs[i] / N; my += ys[i] / N; }
    var num = 0, den = 0;
    for (i = 0; i < N; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) * (xs[i] - mx); }
    return { errs: errs, slope: N > 2 ? num / den : 0, e0: errs[0] };
  }

  var GAMMAS = [0.50, 0.70, 0.80, 0.90, 0.95, 0.99], gi = 2;
  for (var z = 0; z < GAMMAS.length; z++) if (Math.abs(GAMMAS[z] - (opts.gamma || 0.8)) < 0.02) gi = z;
  var CACHE = {};
  function tr(g) { if (!CACHE[g]) CACHE[g] = trace(g); return CACHE[g]; }

  host.innerHTML =
    '<div class="wbar"><span class="wt">The error contracts by a factor of the discount, every sweep</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">discount</span><span class="wnum" data-g></span>' +
    '<button class="wb" data-dn>&darr;</button><button class="wb" data-up>&uarr;</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0">' +
    '<div class="wlabel">sup-norm distance to the fixed point, log scale</div><div data-c></div></div>' +
    '<div style="width:224px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12px/1.9 var(--mono);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.6 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var PW = 470, PH = 258, chart = IE437.svg(PW, PH);
  host.querySelector('[data-c]').appendChild(chart);

  var LO = -6, HI = 1.8;                                 /* log10 error window */
  function clip(y) { return Math.max(LO, Math.min(HI, y)); }

  function draw() {
    var g = GAMMAS[gi], r = tr(g), k, pts = [], bnd = [];
    for (k = 0; k <= KMAX; k++) {
      if (r.errs[k] <= 0) break;
      var ly = Math.log10(r.errs[k]);
      pts.push([k, clip(ly)]);
      bnd.push([k, clip(Math.log10(r.e0) + k * Math.log10(g))]);
      if (ly < LO) break;                                /* stop at the floor, do not crawl along it */
    }
    var ghosts = [];
    for (var i = 0; i < GAMMAS.length; i++) {
      if (i === gi) continue;
      var q = tr(GAMMAS[i]), gp = [];
      for (k = 0; k <= KMAX; k++) {
        if (q.errs[k] <= 0) break;
        var qy = Math.log10(q.errs[k]); gp.push([k, clip(qy)]); if (qy < LO) break;
      }
      ghosts.push({ pts: gp, color: SLATE, w: 1, dash: '' });
    }
    var ax = IE437.plot(chart, {
      w: PW, h: PH, pad: { l: 46, r: 14, t: 12, b: 30 },
      xdom: [0, KMAX], ydom: [LO, HI], xticks: [0, 15, 30, 45, 60],
      yticks: [1, 0, -1, -2, -3, -4, -5, -6],
      yfmt: function (v) { return v === 0 ? '1' : v === 1 ? '10' : '1e' + v; },
      xlabel: 'sweeps of the Bellman optimality operator',
      series: ghosts.concat([
        { pts: bnd, color: AMBER, w: 1.5, dash: '5 4' },
        { pts: pts, color: BLUE, w: 2.2 }
      ])
    });
    /* label the ghost family once */
    E('text', { x: PW - 18, y: PH - 40, 'text-anchor': 'end', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: SLATE, 'fill-opacity': .85,
      text: 'the other discounts' }, chart);

    host.querySelector('[data-g]').textContent = 'γ = ' + g.toFixed(2);
    var reach = -1;
    for (k = 0; k <= KMAX; k++) if (r.errs[k] <= 1e-3) { reach = k; break; }
    host.querySelector('[data-num]').innerHTML =
      'measured slope&nbsp; <b style="color:' + BLUE + '">' + r.slope.toFixed(5) + '</b><br>' +
      'log&#8321;&#8320;(γ)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b style="color:' + AMBER + '">' +
      Math.log10(g).toFixed(5) + '</b><br>' +
      'sweeps to 1e&minus;3&nbsp; <b>' + (reach < 0 ? '> ' + KMAX : reach) + '</b>';
    host.querySelector('[data-note]').innerHTML =
      'The dashed line is the <i>a priori</i> bound γ<sup>k</sup>&middot;‖V&#8320;&minus;V*‖, and the ' +
      'measured error never crosses it. Its slope is log&#8321;&#8320;(γ) by construction; that the blue ' +
      'curve <b>runs parallel to it</b> is the contraction, not an assumption.';
  }
  host.querySelector('[data-up]').onclick = function () { gi = Math.min(GAMMAS.length - 1, gi + 1); draw(); };
  host.querySelector('[data-dn]').onclick = function () { gi = Math.max(0, gi - 1); draw(); };

  draw();
  return { finish: function () { gi = 2; draw(); } };    /* γ = 0.80 */
});
