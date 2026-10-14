/* ============================================================
   widget: lookahead-brake                          (Chapter 5, Act 2)
   What Algorithm 2 of COMs climbs. A sketch surrogate — a rise through
   the data onto a plateau, then a steep climb beyond it — and the
   trust-region objective of Trabucco et al. (2021), Eq. 4:
        L_opt(x) = fh(x) - beta * fh(x + eta * fh'(x)),   beta = 0.9,
   which subtracts most of what the surrogate promises one trial step
   ahead. Top panel: the surrogate and the construction at one point —
   "says" (dot), the trial step, "promises" (hollow dot). Bottom panel:
   what the search actually climbs, on its own scale.
     step 0  P on the plateau: promises ≈ says, keeps a tenth
     step 1  Q on the steep edge: promises ≫ says, L_opt below zero
     step 2  the whole L_opt curve, and where 450 steps from the best
             design in D end
   eta = 0.5 here, enlarged so the trial step is visible (the toy in
   conservative-coms uses 0.34). Verified in node:
     P 6.20  says 2.35  promises 2.35  keeps  0.23
     Q 8.80  says 3.54  promises 4.20  keeps -0.24
     search from x = 5.40: ends at x = 6.9 on the plateau (fh 2.38);
     plain ascent on fh runs to the edge (fh 5.16 at x = 10).
     L_opt ranges from -0.76 (the edge) to 0.24 (the plateau).
   ============================================================ */
IE437.widget('lookahead-brake', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  var X0 = 0, X1 = 10, DL = 0.8, DR = 5.4, BETA = 0.9, ETA = 0.5, T = 450;
  function sig(z) { return 1 / (1 + Math.exp(-z)); }
  function fh(x) { var r = Math.max(0, x - 6.9); return 0.10 + 2.3 * sig((x - 3.2) / 0.8) + 0.36 * Math.pow(r, 1.8); }
  function dfh(x) { var h = 1e-4; return (fh(x + h) - fh(x - h)) / (2 * h); }
  function Lopt(x) { return fh(x) - BETA * fh(x + ETA * dfh(x)); }
  function dL(x) { var h = 1e-4; return (Lopt(x + h) - Lopt(x - h)) / (2 * h); }
  var xs = DR, t; for (t = 0; t < T; t++) xs = Math.min(X1, Math.max(X0, xs + ETA * dL(xs)));
  function at(x) { var s = fh(x), xp = x + ETA * dfh(x), p = fh(xp); return { x: x, xp: xp, says: s, prom: p, keep: s - BETA * p }; }
  var P = at(6.2), Q = at(8.8);
  function f2(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2); }

  host.innerHTML =
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-side style="width:330px;display:flex;flex-direction:column;gap:8px;font:400 12.5px/1.55 var(--sans);color:var(--ink2)"></div></div>';
  var CW = 520, CH = 232, Lm = 38, Rm = 12;
  var TT = 12, TB = 134, BT = 156, BB = 218;          /* top and bottom panels */
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return Lm + (v - X0) / (X1 - X0) * (CW - Lm - Rm); };
  var YT = function (v) { return TB - (v + 0.2) / 5.6 * (TB - TT); };          /* top: -0.2 .. 5.4 */
  var YB = function (v) { return BB - (v + 0.75) / 1.10 * (BB - BT); };        /* bottom: -0.75 .. 0.35 */
  var GX = []; for (var i = 0; i <= 400; i++) GX.push(X0 + (X1 - X0) * i / 400);
  function path(fn, py, col, w, dash) {
    var pts = GX.map(function (x) { return PX(x).toFixed(1) + ' ' + py(fn(x)).toFixed(1); });
    E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash || '', 'stroke-linejoin': 'round' }, sv);
  }
  function txt(x, y, s, o) {
    o = o || {};
    E('text', { x: x, y: y, 'text-anchor': o.a || 'start', 'font-size': o.fs || 10, 'font-weight': o.b ? 700 : 400,
      'font-family': o.mono ? MONO : 'inherit', fill: o.c || INK, 'fill-opacity': o.op == null ? 1 : o.op, text: s }, sv);
  }
  function point(p, col, label) {
    var x = PX(p.x), xp = PX(p.xp), ys = YT(p.says), yp = YT(p.prom);
    /* the trial step: a chord from "here" to one step up, then the rise it promises */
    E('line', { x1: x, y1: ys, x2: xp, y2: ys, stroke: col, 'stroke-width': 1.6 }, sv);
    E('path', { d: 'M' + (xp - 4) + ' ' + (ys - 3.5) + 'L' + xp + ' ' + ys + 'L' + (xp - 4) + ' ' + (ys + 3.5), fill: 'none', stroke: col, 'stroke-width': 1.6 }, sv);
    if (p.prom - p.says > 0.05) E('line', { x1: xp, y1: ys, x2: xp, y2: yp, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': '3 2' }, sv);
    E('circle', { cx: x, cy: ys, r: 4.6, fill: col }, sv);
    if (xp - x < 6) {                       /* flat: the trial step is too short to see — one ring, one line */
      E('circle', { cx: x, cy: ys, r: 9, fill: 'none', stroke: col, 'stroke-width': 2 }, sv);
      txt(x, ys - 16, label + ' · says ' + f2(p.says) + ' = promises ' + f2(p.prom), { a: 'middle', b: true, c: col, fs: 10.5 });
    } else {                                /* steep: "says" to the left, "promises" under the rising curve */
      E('circle', { cx: xp, cy: yp, r: 4.6, fill: '#fff', stroke: col, 'stroke-width': 2 }, sv);
      txt(x - 12, ys + 4, 'says ' + f2(p.says), { a: 'end', b: true, c: col, fs: 10 });
      txt(xp - 10, yp - 7, 'promises ' + f2(p.prom), { a: 'end', b: true, c: col, fs: 10 });
      txt(x + 4, ys + 17, label, { a: 'middle', b: true, c: col, fs: 11 });
    }
    /* and what is left, on the lower panel */
    var y0 = YB(0), yk = YB(p.keep), kc = p.keep >= 0 ? GREEN : RED;
    E('rect', { x: x - 5, y: Math.min(y0, yk), width: 10, height: Math.abs(yk - y0), fill: kc, 'fill-opacity': .85 }, sv);
    var left = p.x > 8;
    txt(x + (left ? -10 : 10), (p.keep >= 0 ? Math.min(y0, yk) : Math.max(y0, yk)) + 4, 'keeps ' + f2(p.keep), { a: left ? 'end' : 'start', b: true, c: kc, fs: 10 });
  }
  function draw(k) {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    /* top panel */
    E('rect', { x: PX(DL), y: TT, width: PX(DR) - PX(DL), height: TB - TT, fill: SLATE, 'fill-opacity': .09 }, sv);
    txt((PX(DL) + PX(DR)) / 2, TT + 11, 'the dataset D', { a: 'middle', fs: 9, mono: true, op: .45 });
    E('line', { x1: Lm, x2: CW - Rm, y1: YT(0), y2: YT(0), stroke: INK, 'stroke-opacity': .22 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: TT, y2: TB, stroke: INK, 'stroke-opacity': .28 }, sv);
    [0, 2, 4].forEach(function (v) { txt(Lm - 5, YT(v) + 3.2, v, { a: 'end', fs: 9, mono: true, op: .45 }); });
    path(fh, YT, BLUE, 2, '5 3');
    txt(PX(9.85), YT(1.0), 'what the surrogate says, f̂', { a: 'end', b: true, c: BLUE, fs: 10.5 });
    txt(PX(9.5), YT(2.2), 'steep', { a: 'middle', c: BLUE, fs: 10, op: .7 });
    txt(PX(6.9), YT(fh(6.9)) + 15, 'flat', { a: 'middle', c: BLUE, fs: 10, op: .7 });
    /* bottom panel */
    E('line', { x1: Lm, x2: CW - Rm, y1: YB(0), y2: YB(0), stroke: INK, 'stroke-opacity': .22 }, sv);
    E('line', { x1: Lm, x2: Lm, y1: BT, y2: BB, stroke: INK, 'stroke-opacity': .28 }, sv);
    [-0.6, 0, 0.3].forEach(function (v) { txt(Lm - 5, YB(v) + 3.2, f2(v).replace('.00', ''), { a: 'end', fs: 9, mono: true, op: .45 }); });
    txt(Lm + 6, BB - 5, 'L_opt = says − 0.9 × promises: what the search climbs', { b: true, c: GREEN, fs: 10.5 });
    txt(CW / 2, CH - 3, 'x', { a: 'middle', fs: 9.5, op: .45 });
    if (k >= 2) {
      path(Lopt, YB, GREEN, 2.2);
      E('rect', { x: PX(DR) - 4.5, y: YB(Lopt(DR)) - 4.5, width: 9, height: 9, fill: '#fff', stroke: INK, 'stroke-width': 1.8 }, sv);
      E('circle', { cx: PX(xs), cy: YB(Lopt(xs)), r: 5, fill: GREEN, stroke: '#fff', 'stroke-width': 1.5 }, sv);
      txt(PX(xs), YB(Lopt(xs)) - 10, '450 steps end here', { a: 'middle', b: true, c: GREEN, fs: 10 });
      txt(PX(DR) - 10, YB(Lopt(DR)) - 9, 'start: best design in D', { a: 'end', fs: 9.5, op: .6 });
      txt(PX(9.3), YB(Lopt(9.3)) - 9, 'downhill', { a: 'middle', c: RED, fs: 10, b: true });
    }
    if (k === 0) point(P, INK, 'P');
    if (k === 1) point(Q, RED, 'Q');
    /* side text */
    var side = host.querySelector('[data-side]'), M = 'font-family:' + MONO + ';font-size:12px', blocks = [
      '<div><b style="color:' + INK + '">P — on flat ground.</b> A trial step up promises what the surrogate already says, so nine tenths of the same number is subtracted: ' +
      '<span style="' + M + '">' + f2(P.says) + ' − 0.9 × ' + f2(P.prom) + ' = <b>' + f2(P.keep) + '</b></span>. A tenth is left: climb, gently.</div>',
      '<div><b style="color:' + RED + '">Q — on the steep edge.</b> A step up promises much more, and nine tenths of that is subtracted too: ' +
      '<span style="' + M + '">' + f2(Q.says) + ' − 0.9 × ' + f2(Q.prom) + ' = <b>' + f2(Q.keep) + '</b></span>. Below zero: downhill for the search.</div>',
      '<div><b style="color:' + GREEN + '">What the search climbs.</b> Flat and high wins; the steep edge, where plain ascent would run, is a valley. 450 steps from the best design end at ' +
      '<span style="' + M + '">x = ' + xs.toFixed(1) + '</span>, on the plateau.</div>'
    ];
    if (k >= 2) blocks = [
      '<div><b style="color:' + INK + '">P, flat:</b> keeps <span style="' + M + '"><b>' + f2(P.keep) + '</b></span> — a tenth of what it says.<br>' +
      '<b style="color:' + RED + '">Q, steep:</b> keeps <span style="' + M + '"><b>' + f2(Q.keep) + '</b></span> — the promise is subtracted.</div>', blocks[2]];
    side.innerHTML = blocks.slice(0, k + 1).join('') +
      '<div style="color:var(--ink3);font-size:11.5px;border-top:1px solid rgba(22,24,29,.1);padding-top:7px">A sketch, not the toy; η enlarged so the trial step shows.' +
      (k < 2 ? ' Press → ' + (k === 0 ? 'for the steep edge.' : 'for the whole curve.') : '') + '</div>';
  }
  draw(0);
  return { steps: 2, step: draw, reset: function () { draw(0); }, finish: function () { draw(2); } };
});
