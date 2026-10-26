/* ============================================================
   widget: kl-direction                             (Chapter 6, Act 2)
   What the KL from the data to a model charges for, and what fitting
   does to it. One thing changes — the model — and one thing is read —
   the red area.
        KL(p || q) = E_p[ log p(x) / q(x) ]
   p: the data, two modes, 0.5 N(-1.6, 0.55^2) + 0.5 N(1.6, 0.55^2)
   Walked by the deck's ->:
     0  q sits on one mode, N(1.6, 0.6^2). The integrand p log(p/q) is
        large where p lives and q does not: the missed mode (6.43 nats)
     1  q spreads over both modes, 0.5 N(-1.6, 0.6^2) + 0.5 N(1.6, 0.6^2):
        the red area is gone (under 0.01 nats)
   The bar is the integral, scaled to step 0. The second direction,
   KL(q || p), is introduced where it is used: the tilt of Session 2.
   Verified on a 4001-point grid over [-6, 6].
   ============================================================ */
IE437.widget('kl-direction', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';
  function nd(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  function p(x) { return 0.5 * nd(x, -1.6, 0.55) + 0.5 * nd(x, 1.6, 0.55); }
  var Q = [function (x) { return nd(x, 1.6, 0.6); },
           function (x) { return 0.5 * nd(x, -1.6, 0.6) + 0.5 * nd(x, 1.6, 0.6); }];
  var G = [], i, DX = 12 / 4000;
  for (i = 0; i <= 4000; i++) G.push(-6 + i * DX);
  function kl(a, b) { var s = 0; G.forEach(function (x) { var u = a(x), v = b(x); if (u > 1e-300) s += u * Math.log(u / Math.max(v, 1e-300)) * DX; }); return s; }
  var K = Q.map(function (q) { return kl(p, q); });

  var st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">What the KL charges for</span><span class="wspacer"></span>' +
    '<span class="wlabel">averaged over</span><span class="wnum">the data</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:300px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-bar style="font:400 13px/1.6 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 13px/1.6 var(--sans);color:var(--ink2);border-top:1px solid rgba(22,24,29,.1);padding-top:9px"></div></div></div>';
  var CW = 600, CH = 214, L = 20, Rm = 14, T = 14, B = 30, X0 = -4, X1 = 4;
  var sv = IE437.svg(CW, CH); host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return L + (v - X0) / (X1 - X0) * (CW - L - Rm); };
  var YM = 0.75, PY = function (v) { return CH - B - v / YM * (CH - T - B); };
  function path(fn, close) {
    var pts = [], x;
    for (i = 0; i <= 400; i++) { x = X0 + (X1 - X0) * i / 400; pts.push(PX(x).toFixed(1) + ' ' + PY(Math.max(0, Math.min(YM * 1.02, fn(x)))).toFixed(1)); }
    return close ? 'M' + PX(X0) + ' ' + PY(0) + 'L' + pts.join('L') + 'L' + PX(X1) + ' ' + PY(0) + 'Z' : 'M' + pts.join('L');
  }
  function draw() {
    var q = Q[st];
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('line', { x1: L, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .3 }, sv);
    /* the integrand p log(p/q), scaled to share the axis */
    E('path', { d: path(function (x) { return Math.max(0, p(x) * Math.log(p(x) / q(x))) / 9; }, true), fill: RED, 'fill-opacity': .22, stroke: RED, 'stroke-width': 1.4 }, sv);
    E('path', { d: path(p, true), fill: SLATE, 'fill-opacity': .18, stroke: SLATE, 'stroke-width': 1.6 }, sv);
    E('path', { d: path(q), fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, sv);
    E('text', { x: PX(1.6), y: PY(0.1), 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: SLATE, text: 'p — the data' }, sv);
    E('text', { x: PX(2.55), y: PY(q(2.2)) - 4, 'font-size': 10.5, 'font-weight': 700, fill: BLUE, text: 'q — the model' }, sv);
    if (st === 0) E('text', { x: PX(-1.6), y: PY(Math.min(YM, p(-1.6) * Math.log(p(-1.6) / q(-1.6)) / 9)) - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: RED, text: 'data here, model absent: charged' }, sv);
    E('text', { x: CW / 2, y: CH - 8, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'design x' }, sv);
    var w = Math.max(1.5, 100 * K[st] / K[0]);
    host.querySelector('[data-bar]').innerHTML =
      '<div style="margin-bottom:6px"><b style="color:' + RED + '">KL(data ‖ model)</b> — the red area, added up</div>' +
      '<div style="height:12px;background:rgba(22,24,29,.06);border-radius:2px"><div style="height:12px;width:' + w.toFixed(1) +
      '%;background:' + RED + ';opacity:.75;border-radius:2px;transition:width .4s"></div></div>';
    host.querySelector('[data-note]').innerHTML = [
      'The data has two modes; the model covers one. Averaged over the data, the KL charges every place ==the data lives and the model does not==.',
      'Spread the model over both modes and the charge is gone. Fitting a model drives this KL down: ==the model must cover the data==.'
    ][st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  var show = function (k) { st = Math.max(0, Math.min(1, k)); draw(); };
  show(0);
  return { steps: 1, step: show, reset: function () { show(0); }, finish: function () { show(1); } };
});
