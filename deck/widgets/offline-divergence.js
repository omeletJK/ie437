/* ============================================================
   widget: offline-divergence                     (Chapter 12, Act 1)
   The offline twin of Lecture 5's `surrogate-exploit`, and built on
   the same machinery: the identical ReLU-knot basis and ridge, moved
   from the design axis x to the ACTION axis a.

   A machine on a ten-step track. The action a in [-1,1] is how hard
   you push; k = round(10a) states are traversed; |a| > 0.5 breaks the
   machine (terminal, r = -1); reaching state 10 is the goal (r = +1);
   every other transition costs 0.05.  So within the logged range,
   pushing HARDER IS GENUINELY BETTER -- right up to a cliff nobody
   ever drove over.  The operator who produced D never pushed past 0.3.

   Then run Lecture 8's backup unchanged, in its batch form (fitted Q
   iteration): fit Q by least squares to r + gamma max_a' Q(s',a').

   Verified in node before shipping (seed 11, 300 episodes = 2674
   transitions, 50 sweeps, damping 0.22):

     max over ALL actions        max over the 5 actions in D
     ------------------------    ---------------------------
     sweep 10   Vhat    1.51     sweep 10   Vhat  0.052
     sweep 30   Vhat   20.49     sweep 30   Vhat  0.753
     sweep 50   Vhat  990.74     sweep 50   Vhat  0.788
     growth 1.2140 per sweep     converged
     true return  -1.000         true return  0.767  (policy a = +0.3)

   Unbounded, not merely large: continued to 120 sweeps it reaches
   2.58e7 and is still growing geometrically. Reference values in the
   real machine: behaviour policy 0.443, best in-support policy 0.767,
   best policy of any kind 0.920 (needs a = 0.5, which is not in D),
   crash -1.000.
   ============================================================ */
IE437.widget('offline-divergence', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545',
      GREEN = '#16A34A', SLATE = '#64748B';

  /* ---------- the machine ------------------------------------------ */
  var NS = 10, GAM = 0.97, LIM = 0.5, ACT = [], k;
  for (k = -10; k <= 10; k++) ACT.push(k / 10);
  var AI = ACT.length;
  function step(s, a) {
    if (Math.abs(a) > LIM + 1e-9) return { s2: -2, r: -1, done: true };
    var n = s + Math.round(a * 10);
    if (n >= NS) return { s2: -1, r: 1, done: true };
    return { s2: Math.max(0, n), r: -0.05, done: false };
  }
  var BETA = [[-0.2, 0.05], [-0.1, 0.10], [0.1, 0.50], [0.2, 0.20], [0.3, 0.15]];
  function inD(a) { for (var i = 0; i < BETA.length; i++) if (Math.abs(BETA[i][0] - a) < 1e-9) return true; return false; }

  /* ---------- Lecture 5's basis, on the action axis ----------------- */
  var MK = 12, KN = [], j;
  for (j = 0; j < MK; j++) KN.push(-0.95 + 1.9 * j / (MK - 1));
  function phi(a) {
    var v = [1, a], q;
    for (q = 0; q < MK; q++) { v.push(Math.max(0, a - KN[q]) / 0.5); v.push(Math.max(0, KN[q] - a) / 0.5); }
    return v;
  }
  var P = phi(0).length, LAM = 0.04, ETA = 0.22, ITER = 50;
  var PHIS = ACT.map(phi);

  function inv(A) {                                    /* Gauss-Jordan */
    var n = A.length, X = [], r, c, d, f;
    for (r = 0; r < n; r++) { var row = A[r].slice(); for (c = 0; c < n; c++) row.push(r === c ? 1 : 0); X.push(row); }
    for (c = 0; c < n; c++) {
      var p = c; for (r = c + 1; r < n; r++) if (Math.abs(X[r][c]) > Math.abs(X[p][c])) p = r;
      var t = X[c]; X[c] = X[p]; X[p] = t;
      d = X[c][c]; for (k = c; k < 2 * n; k++) X[c][k] /= d;
      for (r = 0; r < n; r++) { if (r === c) continue; f = X[r][c]; if (!f) continue;
        for (k = c; k < 2 * n; k++) X[r][k] -= f * X[c][k]; }
    }
    return X.map(function (row) { return row.slice(n); });
  }

  /* ---------- the log ----------------------------------------------- */
  var R = IE437.rng(opts.seed || 11), D = [], cum = [], acc = 0, e, s, t, u;
  for (j = 0; j < BETA.length; j++) { acc += BETA[j][1]; cum.push([BETA[j][0], acc]); }
  for (e = 0; e < 300; e++) {
    s = 0;
    for (t = 0; t < 40; t++) {
      var uu = R(), a = cum[cum.length - 1][0];
      for (j = 0; j < cum.length; j++) if (uu <= cum[j][1]) { a = cum[j][0]; break; }
      var tr = step(s, a);
      D.push({ s: s, k: Math.round(a * 10) + 10, r: tr.r, s2: tr.s2, done: tr.done });
      if (tr.done) break; s = tr.s2;
    }
  }

  /* per-state normal equations, factored once */
  var ST = [];
  for (s = 0; s < NS; s++) {
    var rows = [], A = [], n;
    for (j = 0; j < D.length; j++) if (D[j].s === s) rows.push(D[j]);
    n = rows.length || 1;
    for (u = 0; u < P; u++) { A.push([]); for (var v = 0; v < P; v++) A[u].push(0); }
    for (j = 0; j < rows.length; j++) { var pp = PHIS[rows[j].k];
      for (u = 0; u < P; u++) for (v = 0; v < P; v++) A[u][v] += pp[u] * pp[v] / n; }
    for (u = 0; u < P; u++) A[u][u] += (u < 2 ? LAM * 1e-2 : LAM);
    ST.push({ rows: rows, n: n, Ainv: inv(A) });
  }

  /* ---------- exact evaluation in the real machine ------------------ */
  function evalPi(pi) {
    var V = [], it, s2, W, d;
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 3000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) { var q = step(s, pi[s]); W.push(q.r + (q.done ? 0 : GAM * V[q.s2])); }
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return V[0];
  }
  function qStar() {                                   /* value iteration, all actions */
    var V = [], it, W, d, q;
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 3000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) { var b = -Infinity;
        for (k = 0; k < AI; k++) { q = step(s, ACT[k]); var vv = q.r + (q.done ? 0 : GAM * V[q.s2]); if (vv > b) b = vv; }
        W.push(b); }
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return ACT.map(function (a) { var z = step(0, a); return z.r + (z.done ? 0 : GAM * V[z.s2]); });
  }
  var QSTAR = qStar();
  var VBETA = (function () {                           /* value of the behaviour policy */
    var V = [], it, W, d;
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 4000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) { var x = 0;
        for (j = 0; j < BETA.length; j++) { var z = step(s, BETA[j][0]); x += BETA[j][1] * (z.r + (z.done ? 0 : GAM * V[z.s2])); }
        W.push(x); }
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return V[0];
  })();
  var CEIL = (function () {                            /* best policy using only D's actions */
    var V = [], it, W, d, allow = [];
    for (k = 0; k < AI; k++) if (inD(ACT[k])) allow.push(k);
    for (s = 0; s < NS; s++) V.push(0);
    for (it = 0; it < 3000; it++) {
      W = []; d = 0;
      for (s = 0; s < NS; s++) { var b = -Infinity;
        for (j = 0; j < allow.length; j++) { var z = step(s, ACT[allow[j]]);
          var vv = z.r + (z.done ? 0 : GAM * V[z.s2]); if (vv > b) b = vv; }
        W.push(b); }
      for (s = 0; s < NS; s++) d = Math.max(d, Math.abs(W[s] - V[s]));
      V = W; if (d < 1e-12) break;
    }
    return V[0];
  })();

  /* ---------- fitted Q iteration, both modes, precomputed ----------- */
  function fqi(restrict) {
    var W = [], allow = [], out = [];
    for (k = 0; k < AI; k++) if (!restrict || inD(ACT[k])) allow.push(k);
    for (s = 0; s < NS; s++) { var w = []; for (u = 0; u < P; u++) w.push(0); W.push(w); }
    for (var it = 0; it < ITER; it++) {
      /* Q(s, .) for every state and action, once */
      var QT = [], mx = [];
      for (s = 0; s < NS; s++) {
        var row = [], best = -Infinity;
        for (k = 0; k < AI; k++) { var qv = 0, pk = PHIS[k];
          for (u = 0; u < P; u++) qv += W[s][u] * pk[u];
          row.push(qv); }
        for (j = 0; j < allow.length; j++) if (row[allow[j]] > best) best = row[allow[j]];
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
        var nw = [];
        for (u = 0; u < P; u++) { var z = 0;
          for (var vv2 = 0; vv2 < P; vv2++) z += st.Ainv[u][vv2] * b[vv2];
          nw.push((1 - ETA) * W[s][u] + ETA * z); }
        Wn.push(nw);
      }
      W = Wn;
      /* readouts */
      var q0 = [], pi = [], vhat = -Infinity;
      for (s = 0; s < NS; s++) {
        var rowb = -Infinity, rowk = allow[0], qq;
        for (j = 0; j < allow.length; j++) { k = allow[j]; qq = 0;
          for (u = 0; u < P; u++) qq += W[s][u] * PHIS[k][u];
          if (qq > rowb) { rowb = qq; rowk = k; } }
        pi.push(ACT[rowk]);
        if (s === 0) { vhat = rowb;
          for (k = 0; k < AI; k++) { qq = 0;
            for (u = 0; u < P; u++) qq += W[0][u] * PHIS[k][u]; q0.push(qq); } }
      }
      out.push({ q0: q0, vhat: vhat, a0: pi[0], vtrue: evalPi(pi) });
    }
    return out;
  }
  var TR = { all: fqi(false), data: fqi(true) };
  if (typeof IE437.__probe === 'function') IE437.__probe({ TR: TR, QSTAR: QSTAR, VBETA: VBETA, CEIL: CEIL, N: D.length });

  /* ---------- shell -------------------------------------------------- */
  var restrict = false, sweep = ITER;
  host.innerHTML =
    '<div class="wbar"><span class="wt">Lecture 8&rsquo;s backup, on a log that never grows</span><span class="wspacer"></span>' +
    '<label class="wtog" data-rs2><i></i><span>max only over actions in D</span></label>' +
    '<span class="wlabel">sweep</span><span class="wnum" data-t></span>' +
    '<button class="wb" data-back>&larr;</button><button class="wb" data-fw>&rarr;</button>' +
    '<button class="wb" data-run>run 50</button><button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:14px;align-items:flex-start;justify-content:center">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
    '<div class="wlabel">what Q says about each action at s = 0</div><div data-c1></div></div>' +
    '<div style="display:flex;flex-direction:column;gap:7px">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:2px">' +
    '<div class="wlabel">the value it believes</div><div data-c2></div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:2px">' +
    '<div class="wlabel">what the policy actually earns</div><div data-c3></div></div></div>' +
    '<div style="width:194px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-num style="font:400 12px/1.7 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 11.5px/1.5 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px"></div></div></div>';

  var CW = 434, CH = 288, TW = 322, TH = 140;
  var s1 = IE437.svg(CW, CH), s2 = IE437.svg(TW, TH), s3 = IE437.svg(TW, TH);
  host.querySelector('[data-c1]').appendChild(s1);
  host.querySelector('[data-c2]').appendChild(s2);
  host.querySelector('[data-c3]').appendChild(s3);

  /* the left panel is linear, so the true cliff and the fitted shape are both
     readable; anything the model believes above YB has simply left the frame,
     which is the point.  The right panel carries the magnitude, on a signed log. */
  var YA = -1.3, YB = 1.5;
  function SL(v) { return (v < 0 ? -1 : 1) * Math.log10(1 + Math.abs(v)); }
  var YLO = SL(-1.6), YHI = SL(1400);

  function clear(sv) { while (sv.firstChild) sv.removeChild(sv.firstChild); }

  function draw() {
    var TRC = restrict ? TR.data : TR.all, cur = TRC[sweep - 1] || TRC[0];
    var q0 = sweep === 0 ? ACT.map(function () { return 0; }) : cur.q0;
    var i;

    /* ======== left: Q(s0, .) over the action axis ======== */
    clear(s1);
    var L = 40, Rr = 12, T = 14, B = 30;
    var PX = function (a) { return L + (a + 1) / 2 * (CW - L - Rr); };
    var PY = function (v) { return CH - B - (Math.max(YA, Math.min(YB, v)) - YA) / (YB - YA) * (CH - T - B); };
    /* hazard bands */
    [[-1, -LIM], [LIM, 1]].forEach(function (bd) {
      E('rect', { x: PX(bd[0]), y: T, width: PX(bd[1]) - PX(bd[0]), height: CH - B - T,
        fill: RED, 'fill-opacity': .055 }, s1);
    });
    E('text', { x: PX(-0.75), y: T + 11, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: RED, 'fill-opacity': .7, text: 'machine breaks' }, s1);
    E('text', { x: PX(0.75), y: T + 11, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: RED, 'fill-opacity': .7, text: 'machine breaks' }, s1);
    /* the actions actually logged */
    E('rect', { x: PX(-0.25), y: T, width: PX(0.35) - PX(-0.25), height: CH - B - T,
      fill: SLATE, 'fill-opacity': .11 }, s1);
    E('text', { x: PX(0.05), y: T + 11, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5, text: 'actions in D' }, s1);
    BETA.forEach(function (bb) {
      E('line', { x1: PX(bb[0]), x2: PX(bb[0]), y1: CH - B, y2: CH - B - 5 - 26 * bb[1],
        stroke: INK, 'stroke-opacity': .45, 'stroke-width': 2 }, s1);
    });
    E('line', { x1: L, x2: CW - Rr, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .2 }, s1);
    E('line', { x1: L, x2: L, y1: T, y2: CH - B, stroke: INK, 'stroke-opacity': .28 }, s1);
    [-1, 0, 1].forEach(function (v) {
      E('line', { x1: L, x2: CW - Rr, y1: PY(v), y2: PY(v), stroke: INK, 'stroke-opacity': .08 }, s1);
      E('text', { x: L - 5, y: PY(v) + 3.2, 'text-anchor': 'end', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s1);
    });
    function curveAt(vals, col, dash, w, op) {
      var pts = [];
      for (i = 0; i < AI; i++) pts.push(PX(ACT[i]).toFixed(1) + ' ' + PY(vals[i]).toFixed(1));
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w,
        'stroke-dasharray': dash, 'stroke-opacity': op == null ? 1 : op, 'stroke-linejoin': 'round' }, s1);
    }
    curveAt(QSTAR, INK, '', 2.2, .8);
    curveAt(q0, BLUE, '5 3', 2.2);
    var bk = 0, bq = -Infinity;
    for (i = 0; i < AI; i++) if ((!restrict || inD(ACT[i])) && q0[i] > bq) { bq = q0[i]; bk = i; }
    E('line', { x1: PX(ACT[bk]), y1: T, x2: PX(ACT[bk]), y2: CH - B, stroke: RED,
      'stroke-opacity': .35, 'stroke-dasharray': '2 3' }, s1);
    E('circle', { cx: PX(ACT[bk]), cy: PY(bq), r: 5, fill: RED }, s1);
    E('text', { x: PX(-0.98), y: PY(QSTAR[0]) - 8, 'font-size': 10, fill: INK, 'fill-opacity': .75,
      'font-weight': 700, text: 'true Q*' }, s1);
    var qmax = -Infinity, qmin = Infinity;
    for (i = 0; i < AI; i++) { if (q0[i] > qmax) qmax = q0[i]; if (q0[i] < qmin) qmin = q0[i]; }
    if (qmax > YB) E('text', { x: CW - Rr - 4, y: T + 24, 'text-anchor': 'end', 'font-size': 10,
      fill: BLUE, 'font-weight': 700,
      text: 'Q has left the frame — it reads ' + (qmax >= 1000 ? qmax.toExponential(2) : qmax.toFixed(1)) + ' at a = 1' }, s1);
    else E('text', { x: PX(0.62), y: PY(q0[16]) - 9, 'font-size': 10, fill: BLUE, 'font-weight': 700,
      text: 'Q, fitted offline' }, s1);
    E('text', { x: CW - Rr, y: CH - 4, 'text-anchor': 'end', 'font-size': 9, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .45, text: 'action a  (how hard you push)' }, s1);

    /* ======== upper right: the believed value, per sweep ======== */
    clear(s2);
    var l2 = 40, r2 = 10, t2 = 22, b2 = 22;
    var AX = function (n) { return l2 + n / ITER * (TW - l2 - r2); };
    var AY = function (v) { return TH - b2 - (SL(v) - YLO) / (YHI - YLO) * (TH - t2 - b2); };
    E('line', { x1: l2, x2: TW - r2, y1: AY(0), y2: AY(0), stroke: INK, 'stroke-opacity': .2 }, s2);
    E('line', { x1: l2, x2: l2, y1: t2, y2: TH - b2, stroke: INK, 'stroke-opacity': .28 }, s2);
    [0, 1, 100, 1000].forEach(function (v) {
      E('text', { x: l2 - 5, y: AY(v) + 3, 'text-anchor': 'end', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s2);
    });
    var pa = [];
    for (i = 0; i < sweep; i++) pa.push(AX(i + 1).toFixed(1) + ' ' + AY(Math.min(1350, TRC[i].vhat)).toFixed(1));
    if (pa.length) E('path', { d: 'M' + pa.join('L'), fill: 'none', stroke: restrict ? GREEN : RED,
      'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s2);
    E('text', { x: TW - r2 - 2, y: 12, 'text-anchor': 'end', 'font-size': 9.5,
      fill: restrict ? GREEN : RED, 'font-weight': 700, text: 'max Q(s0, a)' }, s2);

    /* ======== lower right: the true return of that policy ======== */
    clear(s3);
    var RA = -1.35, RB = 1.05;
    var BX = AX, BY = function (v) { return TH - b2 - (v - RA) / (RB - RA) * (TH - t2 - b2); };
    E('line', { x1: l2, x2: TW - r2, y1: BY(0), y2: BY(0), stroke: INK, 'stroke-opacity': .2 }, s3);
    E('line', { x1: l2, x2: l2, y1: t2, y2: TH - b2, stroke: INK, 'stroke-opacity': .28 }, s3);
    [-1, 0, 1].forEach(function (v) {
      E('text', { x: l2 - 5, y: BY(v) + 3, 'text-anchor': 'end', 'font-size': 8.5, fill: INK,
        'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: v }, s3);
    });
    [[VBETA, 'the operator'], [CEIL, 'best in-support']].forEach(function (rf) {
      E('line', { x1: l2, x2: TW - r2, y1: BY(rf[0]), y2: BY(rf[0]), stroke: INK,
        'stroke-opacity': .3, 'stroke-dasharray': '3 4' }, s3);
      E('text', { x: TW - r2 - 2, y: BY(rf[0]) - 3, 'text-anchor': 'end', 'font-size': 8.5,
        'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .5, text: rf[1] }, s3);
    });
    var pb = [];
    for (i = 0; i < sweep; i++) pb.push(BX(i + 1).toFixed(1) + ' ' + BY(TRC[i].vtrue).toFixed(1));
    if (pb.length) E('path', { d: 'M' + pb.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2.2,
      'stroke-linejoin': 'round' }, s3);
    E('text', { x: (l2 + TW - r2) / 2, y: TH - 4, 'text-anchor': 'middle', 'font-size': 8.5,
      'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45, text: 'fitted-Q sweep' }, s3);

    /* ======== readout ======== */
    host.querySelector('[data-t]').textContent = sweep + ' / ' + ITER;
    var vt = sweep ? cur.vtrue : 0, vh = sweep ? cur.vhat : 0;
    var fmt = function (v) { return Math.abs(v) >= 1000 ? v.toExponential(2) : v.toFixed(3); };
    host.querySelector('[data-num]').innerHTML =
      'log D <b>' + D.length + '</b> transitions<br>' +
      'the operator earns <b>' + VBETA.toFixed(3) + '</b><br>' +
      'best in-support <b>' + CEIL.toFixed(3) + '</b><br>' +
      '<span style="color:' + (restrict ? GREEN : RED) + '">Q says it can get</span> <b>' + fmt(vh) + '</b><br>' +
      'chosen action <b>' + cur.a0.toFixed(1) + '</b><br>' +
      'it actually earns <b style="color:' + (vt < VBETA ? RED : GREEN) + '">' + vt.toFixed(3) + '</b>';
    host.querySelector('[data-note]').innerHTML = restrict
      ? 'The <b>max</b> may now only name an action the operator tried. Nothing else changed &mdash; and the divergence is gone. Note the curve is still wrong out at a&nbsp;=&nbsp;1; it is simply never asked.'
      : (sweep < 6
        ? 'Early sweeps: the goal reward has not yet reached s&nbsp;=&nbsp;0, so there is nothing to over-estimate.'
        : 'The peak has left the shaded band. Every sweep raises the promise and the promise is never tested &mdash; so the next sweep raises it again.');
  }

  host.querySelector('[data-rs2]').onclick = function () {
    restrict = !restrict; this.classList.toggle('on', restrict); draw();
  };
  host.querySelector('[data-fw]').onclick = function () { sweep = Math.min(ITER, sweep + 1); draw(); };
  host.querySelector('[data-back]').onclick = function () { sweep = Math.max(1, sweep - 1); draw(); };
  host.querySelector('[data-run]').onclick = function () { sweep = ITER; draw(); };
  host.querySelector('[data-rs]').onclick = function () {
    sweep = 1; restrict = false; host.querySelector('[data-rs2]').classList.remove('on'); draw();
  };

  sweep = 1; draw();
  return { finish: function () { sweep = ITER; restrict = false; draw(); } };
});
