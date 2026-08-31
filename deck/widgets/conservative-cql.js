/* ============================================================
   widget: conservative-cql                        (Chapter 12, Act 3)
   The offline twin of Lecture 5's `conservative-coms`, on the machine
   of `offline-divergence`: the same log, the same fifty fitted-Q
   sweeps, the same ReLU-knot basis over the action axis. Only the
   training loss changes, by one term:

       alpha ( tau * logsumexp_a Q(s,a)/tau  -  E_{a ~ beta-hat} Q(s,a) )

   i.e. CQL(H), with the soft maximum at temperature tau = 0.05 so that
   it is a maximum rather than an average over 21 gridded actions. The
   per-state problem is convex and is solved exactly by Newton's method
   at every sweep, so the picture is the algorithm rather than a sketch.

   Verified in node before shipping (seed 11, 2674 transitions, 50
   sweeps, damping 0.22, 8 Newton steps). Reference values in the real
   machine: the operator earns 0.443, the best in-support policy 0.767,
   the best policy of any kind 0.920 (it needs a = 0.5, which is not in
   the log), a crash -1.000.

     alpha    Q promises   the policy earns   verdict
     0            990.74        -1.000        over-promised by 991.7
     0.005          0.701         0.767       a lower bound; a* = 0.3
     0.01           0.653         0.767       a lower bound; a* = 0.3, the
                                              best any in-support policy can do
     0.02           0.601         0.767       a lower bound, tightening
     0.05           0.528         0.694       improvement starting to cost
     0.1            0.479         0.623
     0.3            0.451         0.361       collapsed to beta's modal action
     1              0.481         0.361       -- below the log itself
   ============================================================ */
IE437.widget('conservative-cql', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A',
      RED = '#D64545', SLATE = '#64748B';

  /* ---------- the machine (identical to offline-divergence) ---------- */
  var NS = 10, GAM = 0.97, LIM = 0.5, ACT = [], k, u, v, s, j, i;
  for (k = -10; k <= 10; k++) ACT.push(k / 10);
  var AI = ACT.length;
  function step(st, a) {
    if (Math.abs(a) > LIM + 1e-9) return { s2: -2, r: -1, done: true };
    var n = st + Math.round(a * 10);
    if (n >= NS) return { s2: -1, r: 1, done: true };
    return { s2: Math.max(0, n), r: -0.05, done: false };
  }
  var BETA = [[-0.2, 0.05], [-0.1, 0.10], [0.1, 0.50], [0.2, 0.20], [0.3, 0.15]];
  function inD(a) { for (var q = 0; q < BETA.length; q++) if (Math.abs(BETA[q][0] - a) < 1e-9) return true; return false; }

  var MK = 12, KN = [];
  for (j = 0; j < MK; j++) KN.push(-0.95 + 1.9 * j / (MK - 1));
  function phi(a) { var w = [1, a], q;
    for (q = 0; q < MK; q++) { w.push(Math.max(0, a - KN[q]) / 0.5); w.push(Math.max(0, KN[q] - a) / 0.5); }
    return w; }
  var P = phi(0).length, LAM = 0.04, ETA = 0.22, ITER = 50, TAU = 0.05, NEWTON = 8;
  var PHIS = ACT.map(phi);
  var ALPHA = [0, 0.005, 0.01, 0.02, 0.05, 0.1, 0.3, 1], ai = 0;

  function solve(A, b) {
    var n = b.length, X = [], r, c, d, f;
    for (r = 0; r < n; r++) X.push(A[r].concat([b[r]]));
    for (c = 0; c < n; c++) {
      var p = c; for (r = c + 1; r < n; r++) if (Math.abs(X[r][c]) > Math.abs(X[p][c])) p = r;
      var t = X[c]; X[c] = X[p]; X[p] = t;
      d = X[c][c]; for (k = c; k <= n; k++) X[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = X[r][c]; if (!f) continue;
        for (k = c; k <= n; k++) X[r][k] -= f * X[c][k]; }
    }
    return X.map(function (row) { return row[n]; });
  }

  /* ---------- the log ------------------------------------------------ */
  var R = IE437.rng(opts.seed || 11), D = [], cum = [], accp = 0, ep, t;
  for (j = 0; j < BETA.length; j++) { accp += BETA[j][1]; cum.push([BETA[j][0], accp]); }
  for (ep = 0; ep < 300; ep++) {
    s = 0;
    for (t = 0; t < 40; t++) {
      var uu = R(), a = cum[cum.length - 1][0];
      for (j = 0; j < cum.length; j++) if (uu <= cum[j][1]) { a = cum[j][0]; break; }
      var tr = step(s, a);
      D.push({ s: s, k: Math.round(a * 10) + 10, r: tr.r, s2: tr.s2, done: tr.done });
      if (tr.done) break; s = tr.s2;
    }
  }
  /* per state: normal matrix (with ridge) and the empirical behaviour feature mean */
  var ST = [];
  for (s = 0; s < NS; s++) {
    var rows = [], A = [], eb = [];
    for (j = 0; j < D.length; j++) if (D[j].s === s) rows.push(D[j]);
    var n = rows.length || 1;
    for (u = 0; u < P; u++) { A.push([]); eb.push(0); for (v = 0; v < P; v++) A[u].push(0); }
    for (j = 0; j < rows.length; j++) { var pp = PHIS[rows[j].k];
      for (u = 0; u < P; u++) { eb[u] += pp[u] / n; for (v = 0; v < P; v++) A[u][v] += pp[u] * pp[v] / n; } }
    for (u = 0; u < P; u++) A[u][u] += (u < 2 ? LAM * 1e-2 : LAM);
    ST.push({ rows: rows, n: n, A: A, ebar: eb });
  }

  /* ---------- exact evaluation in the real machine -------------------- */
  function evalPi(pi) {
    var V = [], it, W, d;
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 3000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) { var q = step(s, pi[s]); W.push(q.r + (q.done ? 0 : GAM * V[q.s2])); }
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return V[0];
  }
  function fixedPoint(pick) {                  /* generic value iteration over an allowed set */
    var V = [], it, W, d;
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 3000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) W.push(pick(s, V));
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return V;
  }
  var QSTAR = (function () {
    var V = fixedPoint(function (st, V) { var b = -Infinity;
      for (var q = 0; q < AI; q++) { var z = step(st, ACT[q]); var w = z.r + (z.done ? 0 : GAM * V[z.s2]); if (w > b) b = w; }
      return b; });
    return ACT.map(function (a) { var z = step(0, a); return z.r + (z.done ? 0 : GAM * V[z.s2]); });
  })();
  var VBETA = fixedPoint(function (st, V) { var x = 0;
    for (var q = 0; q < BETA.length; q++) { var z = step(st, BETA[q][0]); x += BETA[q][1] * (z.r + (z.done ? 0 : GAM * V[z.s2])); }
    return x; })[0];
  var CEIL = fixedPoint(function (st, V) { var b = -Infinity;
    for (var q = 0; q < AI; q++) { if (!inD(ACT[q])) continue; var z = step(st, ACT[q]);
      var w = z.r + (z.done ? 0 : GAM * V[z.s2]); if (w > b) b = w; }
    return b; })[0];

  /* ---------- CQL fitted-Q iteration ---------------------------------- */
  var CACHE = {};
  function run(alpha) {
    if (CACHE[alpha]) return CACHE[alpha];
    var W = [], out = [];
    for (s = 0; s < NS; s++) { var w0 = []; for (u = 0; u < P; u++) w0.push(0); W.push(w0); }
    for (var it = 0; it < ITER; it++) {
      var QT = [], mx = [];
      for (s = 0; s < NS; s++) {
        var row = [], best = -Infinity;
        for (k = 0; k < AI; k++) { var qv = 0, pk = PHIS[k];
          for (u = 0; u < P; u++) qv += W[s][u] * pk[u];
          row.push(qv); if (qv > best) best = qv; }
        QT.push(row); mx.push(best);
      }
      var Wn = [];
      for (s = 0; s < NS; s++) {
        var st = ST[s], b = [];
        for (u = 0; u < P; u++) b.push(0);
        for (j = 0; j < st.rows.length; j++) {
          var d = st.rows[j], y = d.r + (d.done ? 0 : GAM * mx[d.s2]), pj = PHIS[d.k];
          for (u = 0; u < P; u++) b[u] += pj[u] * y / st.n;
        }
        var w = W[s].slice(), nt;
        if (alpha <= 0) {
          var Ac = st.A.map(function (rr) { return rr.slice(); });
          w = solve(Ac, b);
        } else for (nt = 0; nt < NEWTON; nt++) {
          /* softmax over the action grid at temperature TAU */
          var q2 = [], m2 = -Infinity;
          for (k = 0; k < AI; k++) { var z2 = 0, pk2 = PHIS[k];
            for (u = 0; u < P; u++) z2 += w[u] * pk2[u];
            q2.push(z2 / TAU); if (q2[k] > m2) m2 = q2[k]; }
          var Z = 0, sm = [];
          for (k = 0; k < AI; k++) { sm.push(Math.exp(q2[k] - m2)); Z += sm[k]; }
          var mu = []; for (u = 0; u < P; u++) mu.push(0);
          for (k = 0; k < AI; k++) { sm[k] /= Z;
            for (u = 0; u < P; u++) mu[u] += sm[k] * PHIS[k][u]; }
          var g = [], Hm = [];
          for (u = 0; u < P; u++) { var gg = -b[u];
            for (v = 0; v < P; v++) gg += st.A[u][v] * w[v];
            g.push(gg + alpha * (mu[u] - st.ebar[u])); }
          for (u = 0; u < P; u++) { var hr = [];
            for (v = 0; v < P; v++) { var cov = 0;
              for (k = 0; k < AI; k++) cov += sm[k] * (PHIS[k][u] - mu[u]) * (PHIS[k][v] - mu[v]);
              hr.push(st.A[u][v] + (alpha / TAU) * cov + (u === v ? 1e-9 : 0)); }
            Hm.push(hr); }
          var dw = solve(Hm, g), dn = 0;
          for (u = 0; u < P; u++) dn += dw[u] * dw[u];
          dn = Math.sqrt(dn);
          if (dn > 0.5) for (u = 0; u < P; u++) dw[u] *= 0.5 / dn;
          var mv = 0;
          for (u = 0; u < P; u++) { w[u] -= dw[u]; mv += dw[u] * dw[u]; }
          if (Math.sqrt(mv) < 1e-11) break;
        }
        var nw = [];
        for (u = 0; u < P; u++) nw.push((1 - ETA) * W[s][u] + ETA * w[u]);
        Wn.push(nw);
      }
      W = Wn;
      var q0 = [], pi = [], vhat = -Infinity;
      for (s = 0; s < NS; s++) {
        var rb = -Infinity, rk = 0, qq;
        for (k = 0; k < AI; k++) { qq = 0;
          for (u = 0; u < P; u++) qq += W[s][u] * PHIS[k][u];
          if (s === 0) q0.push(qq);
          if (qq > rb) { rb = qq; rk = k; } }
        pi.push(ACT[rk]);
        if (s === 0) vhat = rb;
      }
      out.push({ q0: q0, vhat: vhat, a0: pi[0], vtrue: evalPi(pi) });
    }
    return (CACHE[alpha] = out);
  }
  var BASE = run(0);
  if (typeof IE437.__probe === 'function')
    IE437.__probe({ run: run, ALPHA: ALPHA, VBETA: VBETA, CEIL: CEIL, QSTAR: QSTAR, N: D.length });

  /* ---------- shell ---------------------------------------------------- */
  host.innerHTML =
    '<div class="wbar"><span class="wt">Conservatism, dialled</span><span class="wspacer"></span>' +
    '<span class="wlabel">conservatism</span><span class="wnum" data-a></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:14px;align-items:flex-start;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">Q at s = 0, retrained</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">the value it believes, per sweep</div><div data-c2></div></div>' +
    '<div style="width:198px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.5 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var CW = 428, CH = 288, TW = 316;
  var s1 = IE437.svg(CW, CH), s2 = IE437.svg(TW, CH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);

  function SL(x) { return (x < 0 ? -1 : 1) * Math.log10(1 + Math.abs(x)); }
  var YLO = SL(-1.6), YHI = SL(1400), TICKS = [-1, 0, 1, 10, 1000];
  var YA = -1.3, YB = 1.5;                       /* the left panel is linear */
  function clear(sv) { while (sv.firstChild) sv.removeChild(sv.firstChild); }

  function draw() {
    var al = ALPHA[ai], TR = run(al), cur = TR[ITER - 1], b0 = BASE[ITER - 1];

    /* ---------- left: the action-value curve ---------- */
    clear(s1);
    var L = 40, Rr = 12, T = 14, B = 30;
    var PX = function (a) { return L + (a + 1) / 2 * (CW - L - Rr); };
    var PY = function (x) { return CH - B - (Math.max(YA, Math.min(YB, x)) - YA) / (YB - YA) * (CH - T - B); };
    [[-1, -LIM], [LIM, 1]].forEach(function (bd) {
      E('rect', { x: PX(bd[0]), y: T, width: PX(bd[1]) - PX(bd[0]), height: CH - B - T,
        fill: RED, 'fill-opacity': .055 }, s1);
    });
    E('rect', { x: PX(-0.25), y: T, width: PX(0.35) - PX(-0.25), height: CH - B - T,
      fill: SLATE, 'fill-opacity': .11 }, s1);
    E('text', { x: PX(0.05), y: T + 11, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5, text: 'actions in D' }, s1);
    E('line', { x1: L, x2: CW - Rr, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .2 }, s1);
    E('line', { x1: L, x2: L, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s1);
    [-1, 0, 1].forEach(function (x) {
      E('line', { x1: L, x2: CW - Rr, y1: PY(x), y2: PY(x), stroke: INK, 'stroke-opacity': .08 }, s1);
      E('text', { x: L - 5, y: PY(x) + 3.2, 'text-anchor': 'end', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: x }, s1);
    });
    function curveAt(vals, col, dash, w, op) {
      var pts = [], q;
      for (q = 0; q < AI; q++) pts.push(PX(ACT[q]).toFixed(1) + ' ' + PY(vals[q]).toFixed(1));
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash, 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, s1);
    }
    curveAt(QSTAR, INK, '', 2.2, .8);
    curveAt(b0.q0, RED, '4 4', 1.5, .4);
    if (al > 0) curveAt(cur.q0, GREEN, '5 3', 2.3);
    var bk = 0, bq = -Infinity;
    for (i = 0; i < AI; i++) if (cur.q0[i] > bq) { bq = cur.q0[i]; bk = i; }
    E('line', { x1: PX(ACT[bk]), y1: T, x2: PX(ACT[bk]), y2: CH - B, stroke: al > 0 ? GREEN : RED,
      'stroke-opacity': .35, 'stroke-dasharray': '2 3' }, s1);
    E('circle', { cx: PX(ACT[bk]), cy: PY(bq), r: 5, fill: al > 0 ? GREEN : RED }, s1);
    E('text', { x: PX(-0.98), y: PY(QSTAR[0]) - 8, 'font-size': 10, fill: INK, 'fill-opacity': .75,
      'font-weight': 700, text: 'true Q*' }, s1);
    E('text', { x: CW - Rr - 4, y: T + 24, 'text-anchor': 'end', 'font-size': 9.5, fill: RED,
      'fill-opacity': .6, 'font-weight': 700,
      text: 'no penalty — off the frame, at ' + b0.q0[AI - 1].toFixed(0) }, s1);
    if (al > 0) E('text', { x: PX(0.97), y: PY(cur.q0[20]) + 17, 'text-anchor': 'end', 'font-size': 10,
      fill: GREEN, 'font-weight': 700, text: 'conservative Q' }, s1);
    E('text', { x: CW - Rr, y: CH - 4, 'text-anchor': 'end', 'font-size': 9, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .45, text: 'action a' }, s1);

    /* ---------- right: the believed value across sweeps ---------- */
    clear(s2);
    var l2 = 40, r2 = 12, t2 = 14, b2 = 30;
    var AX = function (n) { return l2 + n / ITER * (TW - l2 - r2); };
    var AY = function (x) { return CH - b2 - (SL(x) - YLO) / (YHI - YLO) * (CH - t2 - b2); };
    E('line', { x1: l2, x2: TW - r2, y1: AY(0), y2: AY(0), stroke: INK, 'stroke-opacity': .2 }, s2);
    E('line', { x1: l2, x2: l2, y1: t2, y2: CH - b2, stroke: INK, 'stroke-opacity': .28 }, s2);
    TICKS.forEach(function (x) {
      E('text', { x: l2 - 5, y: AY(x) + 3.2, 'text-anchor': 'end', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: x }, s2);
    });
    [[CEIL, 'best in-support', -4], [VBETA, 'the operator', 12]].forEach(function (rf) {
      E('line', { x1: l2, x2: TW - r2, y1: AY(rf[0]), y2: AY(rf[0]), stroke: INK,
        'stroke-opacity': .28, 'stroke-dasharray': '3 4' }, s2);
      E('text', { x: l2 + 4, y: AY(rf[0]) + rf[2], 'font-size': 8.5,
        'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5, text: rf[1] }, s2);
    });
    function trace(TRx, col, w, dash) {
      var pts = [], q;
      for (q = 0; q < ITER; q++) pts.push(AX(q + 1).toFixed(1) + ' ' + AY(Math.min(1350, TRx[q].vhat)).toFixed(1));
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash || '', 'stroke-linejoin': 'round' }, s2);
    }
    trace(BASE, RED, 2.1);
    if (al > 0) trace(TR, GREEN, 2.4);
    E('circle', { cx: AX(ITER), cy: AY(cur.vtrue), r: 4.5, fill: 'none', stroke: INK, 'stroke-width': 2 }, s2);
    E('text', { x: AX(ITER) - 6, y: AY(cur.vtrue) + 17, 'text-anchor': 'end', 'font-size': 9,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, text: 'what it earns' }, s2);
    E('text', { x: AX(ITER) - 3, y: AY(Math.min(1350, BASE[ITER - 1].vhat)) - 8, 'text-anchor': 'end',
      'font-size': 9.5, fill: RED, 'font-weight': 700, text: 'no penalty' }, s2);
    E('text', { x: (l2 + TW - r2) / 2, y: CH - 5, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'fitted-Q sweep' }, s2);

    /* ---------- readout ---------- */
    var gap = cur.vhat - cur.vtrue, vs = cur.vtrue - VBETA;
    var fmt = function (x) { return Math.abs(x) >= 1000 ? x.toExponential(2) : x.toFixed(3); };
    host.querySelector('[data-a]').textContent = 'alpha = ' + (al === 0 ? '0' : al);
    host.querySelector('[data-num]').innerHTML =
      'the operator earns <b>' + VBETA.toFixed(3) + '</b> &middot; best in-support <b>' + CEIL.toFixed(3) + '</b><br>' +
      'chosen action <b>' + cur.a0.toFixed(1) + '</b><br>' +
      'Q promises <b>' + fmt(cur.vhat) + '</b><br>' +
      'the policy earns <b>' + cur.vtrue.toFixed(3) + '</b><br>' +
      '<b style="color:' + (gap > 0 ? RED : GREEN) + '">' +
      (gap > 0 ? 'over by ' + fmt(gap) : 'under by ' + (-gap).toFixed(3)) + '</b><br>' +
      'vs. the operator: <b style="color:' + (vs < 0 ? RED : GREEN) + '">' +
      (vs >= 0 ? '+' : '') + vs.toFixed(3) + '</b>';
    host.querySelector('[data-note]').innerHTML =
      al === 0 ? 'No penalty. The value climbs without bound and the policy it implies breaks the machine on the first step.'
      : gap > 0 ? 'Now <b>too</b> conservative: the argmax has been squeezed back onto the operator&rsquo;s most frequent action, and earns less than the log it was learned from.'
      : (vs > 0.25 ? 'The value <b>under</b>-promises &mdash; a lower bound, so what it reports can be trusted &mdash; and the policy beats the operator.'
                   : 'Still a lower bound, but the penalty is now costing real return.');
  }

  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: ALPHA.length - 1, step: 1, value: ai,
    on: function (v) { ai = v; draw(); }
  });

  draw();
  return { finish: function () { ai = 2; draw(); } };
});
