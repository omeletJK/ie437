/* ============================================================
   widget: kl-direction                             (Chapter 6, Act 2)
   The KL divergence has a direction, and Lecture 6 uses both.
        KL(a || b) = E_a[ log a(x) / b(x) ]   >= 0, = 0 only when a = b
   p: the data, two modes, 0.5 N(-1.6, 0.55^2) + 0.5 N(1.6, 0.55^2)
   q: a model that sits on one mode, N(1.6, 0.6^2)
   Walked by the deck's ->:
     0  the two distributions
     1  KL(p || q): its integrand p log(p/q), large where p lives and q
        does not — the missed mode costs 6.43 nats
     2  KL(q || p): its integrand q log(q/p), small — q stays where p
        lives; 0.69 nats (about log 2: q covers half of p's mass)
   Verified on a 4001-point grid over [-6, 6].
   ============================================================ */
IE437.widget('kl-direction', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#B45309', SLATE = '#64748B';
  var MONO = 'IBM Plex Mono, monospace';
  function nd(x, m, s) { return Math.exp(-0.5 * (x - m) * (x - m) / (s * s)) / (s * Math.sqrt(2 * Math.PI)); }
  function p(x) { return 0.5 * nd(x, -1.6, 0.55) + 0.5 * nd(x, 1.6, 0.55); }
  function q(x) { return nd(x, 1.6, 0.6); }
  var G = [], i, DX = 12 / 4000;
  for (i = 0; i <= 4000; i++) G.push(-6 + i * DX);
  function kl(a, b) { var s = 0; G.forEach(function (x) { var u = a(x), v = b(x); if (u > 1e-300) s += u * Math.log(u / Math.max(v, 1e-300)) * DX; }); return s; }
  var KPQ = kl(p, q), KQP = kl(q, p);

  var st = 0;
  host.innerHTML =
    '<div class="wbar"><span class="wt">Which way round matters</span><span class="wspacer"></span>' +
    '<span class="wlabel">definition</span><span class="wnum">KL(a‖b) = E_a[log a/b]</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div><div style="width:300px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 13px/1.75 var(--sans);color:var(--ink2)"></div>' +
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
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    E('line', { x1: L, x2: CW - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .3 }, sv);
    /* the integrands, scaled to share the axis */
    if (st === 1) E('path', { d: path(function (x) { return Math.max(0, p(x) * Math.log(p(x) / q(x))) / 9; }, true), fill: RED, 'fill-opacity': .22, stroke: RED, 'stroke-width': 1.4 }, sv);
    if (st === 2) E('path', { d: path(function (x) { return Math.max(0, q(x) * Math.log(q(x) / p(x))); }, true), fill: AMBER, 'fill-opacity': .25, stroke: AMBER, 'stroke-width': 1.4 }, sv);
    E('path', { d: path(p, true), fill: SLATE, 'fill-opacity': .18, stroke: SLATE, 'stroke-width': 1.6 }, sv);
    E('path', { d: path(q), fill: 'none', stroke: BLUE, 'stroke-width': 2.4 }, sv);
    E('text', { x: PX(-1.6), y: PY(p(-1.6)) - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: SLATE, text: 'p — the data' }, sv);
    E('text', { x: PX(2.55), y: PY(q(2.2)) - 4, 'font-size': 10.5, 'font-weight': 700, fill: BLUE, text: 'q — a model' }, sv);
    if (st === 1) E('text', { x: PX(-1.6), y: PY(0) - 18, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: RED, text: 'q misses this mode: charged here' }, sv);
    if (st === 2) E('text', { x: PX(1.6), y: PY(0) - 10, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: AMBER, text: 'small: q stays where p lives' }, sv);
    E('text', { x: CW / 2, y: CH - 8, 'text-anchor': 'middle', 'font-size': 9.5, 'font-style': 'italic', fill: INK, 'fill-opacity': .45, text: 'design x' }, sv);
    var row = function (lab, v, c, on) {
      return '<div style="display:flex;justify-content:space-between;opacity:' + (on ? 1 : .3) + '"><span>' + lab + '</span><b style="color:' + c +
        ';font-family:var(--mono)">' + (on ? v.toFixed(2) : '—') + '</b></div>';
    };
    host.querySelector('[data-num]').innerHTML =
      row('KL(p‖q) — average over the data', KPQ, RED, st >= 1) + row('KL(q‖p) — average over the model', KQP, AMBER, st >= 2);
    host.querySelector('[data-note]').innerHTML = [
      'The data has two modes; the model sits on one. How far apart are they? It depends on <b>whose eyes</b> you average with.',
      '<b>KL(p‖q)</b> averages over the data, so q pays for every place the data lives and q does not. Fitting a model to data — maximum likelihood — uses this direction: ==the model must cover the data==.',
      '<b>KL(q‖p)</b> averages over the model, so q pays only for going where p does not. The tilt of Session 2 uses this direction: ==q must stay where the generator lives== — and is infinite if q puts mass where p has none.'
    ][st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  var show = function (k) { st = Math.max(0, Math.min(2, k)); draw(); };
  show(0);
  return { steps: 2, step: show, reset: function () { show(0); }, finish: function () { show(2); } };
});
