/* ============================================================
   widget: coms-tabular                             (Chapter 5, Act 2)
   The tabular COMs solution  fh(x) = y(x) - alpha (mu(x)/d(x) - 1)
   on three designs, drawn instead of tabulated: how often the data and
   the attacker see each design, and where that moves its value.

     design   d     mu    y    fh (alpha 0.5)
     x1      0.5   0.1    1    1.4   attacker < data  -> pushed up
     x2      0.3   0.3    2    2.0   equal            -> unchanged
     x3      0.2   0.6    3    2.0   attacker > data  -> pushed down
   E_mu[fh - y] = -0.56 <= 0 (a lower bound on average); E_d[fh - y] = 0.

   Walked by the deck's ->:
     0  the two frequencies and the measured values
     1  the conservative values, as arrows from y
     2  what follows: x1 over-rated (not pointwise), x3 — the best design —
        pulled down to a tie (the cost A)
   ============================================================ */
IE437.widget('coms-tabular', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', SLATE = '#64748B', RED = '#D64545', GREEN = '#16A34A', AMBER = '#B45309';
  var MONO = 'IBM Plex Mono, monospace';
  var AL = 0.5;
  var X = [{ n: 'x₁', d: 0.5, m: 0.1, y: 1 }, { n: 'x₂', d: 0.3, m: 0.3, y: 2 }, { n: 'x₃', d: 0.2, m: 0.6, y: 3 }];
  X.forEach(function (x) { x.f = x.y - AL * (x.m / x.d - 1); });
  var st = 0, N = 2;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Three designs, one value each</span><span class="wspacer"></span>' +
    '<span class="wlabel">penalty weight</span><span class="wnum">α = 0.5</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:290px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  var W = 640, H = 300;
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  function txt(x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 11, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }
  var CX = function (i) { return 150 + i * 190; };

  /* top band: frequencies; bottom band: values */
  var fT = 22, fB = 104, FMAX = 0.65;                         /* frequency bars */
  var FY = function (v) { return fB - v / FMAX * (fB - fT); };
  var vT = 132, vB = 268, VMIN = 0.5, VMAX = 3.4;            /* values */
  var VY = function (v) { return vB - (v - VMIN) / (VMAX - VMIN) * (vB - vT); };

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    txt(14, fT + 6, 'how often', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(14, fT + 19, 'it is seen', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(14, vT + 6, 'its value', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    E('line', { x1: 80, x2: W - 10, y1: fB, y2: fB, stroke: INK, 'stroke-opacity': .25 }, sv);
    E('line', { x1: 80, x2: W - 10, y1: vB, y2: vB, stroke: INK, 'stroke-opacity': .12 }, sv);
    /* legend for the bars */
    E('rect', { x: W - 200, y: fT - 12, width: 11, height: 9, fill: SLATE, 'fill-opacity': .55 }, sv);
    txt(W - 184, fT - 4, 'data d(x)', { 'font-size': 10 });
    E('rect', { x: W - 112, y: fT - 12, width: 11, height: 9, fill: RED, 'fill-opacity': .75 }, sv);
    txt(W - 96, fT - 4, 'attacker μ(x)', { 'font-size': 10 });

    X.forEach(function (x, i) {
      var c = CX(i);
      E('rect', { x: c - 26, y: FY(x.d), width: 22, height: fB - FY(x.d), fill: SLATE, 'fill-opacity': .55 }, sv);
      E('rect', { x: c + 4, y: FY(x.m), width: 22, height: fB - FY(x.m), fill: RED, 'fill-opacity': .75 }, sv);
      txt(c, fB + 16, x.n, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
      /* measured value */
      E('circle', { cx: c, cy: VY(x.y), r: 6.5, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
      txt(c - 14, VY(x.y) + 4, 'measured', { 'text-anchor': 'end', 'font-size': 10.5, 'fill-opacity': .7 });
      if (st >= 1) {
        var up = x.f > x.y + 1e-9, dn = x.f < x.y - 1e-9, col = up ? AMBER : dn ? RED : SLATE;
        if (up || dn) {
          E('line', { x1: c + 16, x2: c + 16, y1: VY(x.y), y2: VY(x.f) + (up ? 6 : -6), stroke: col, 'stroke-width': 3 }, sv);
          E('path', { d: 'M' + (c + 10) + ' ' + (VY(x.f) + (up ? 8 : -8)) + 'L' + (c + 16) + ' ' + VY(x.f) +
            'L' + (c + 22) + ' ' + (VY(x.f) + (up ? 8 : -8)), fill: 'none', stroke: col, 'stroke-width': 3 }, sv);
        }
        E('circle', { cx: c, cy: VY(x.f), r: 6.5, fill: GREEN }, sv);
        txt(c + 30, VY(x.f) + 4, up ? 'pushed up' : dn ? 'pushed down' : 'unchanged',
          { 'font-size': 11, 'font-weight': 700, fill: col });
        txt(c + 30, VY(x.f) + 18, up ? 'μ < d' : dn ? 'μ > d' : 'μ = d', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
      }
    });
    if (st >= 1) {
      E('circle', { cx: W - 168, cy: vB - 8, r: 5, fill: GREEN }, sv);
      txt(W - 158, vB - 4, 'conservative value', { 'font-size': 10, fill: GREEN, 'font-weight': 700 });
    }
    if (st >= 2) {                                   /* the tie, and the over-rated one */
      E('line', { x1: CX(1) - 10, x2: CX(2) + 10, y1: VY(2.0), y2: VY(2.0), stroke: RED, 'stroke-opacity': .5, 'stroke-dasharray': '4 4' }, sv);
      E('rect', { x: CX(0) - 40, y: VY(1.6) - 4, width: 80, height: VY(0.75) - VY(1.6) + 8, fill: 'none',
        stroke: AMBER, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', rx: 6 }, sv);
      E('rect', { x: CX(2) - 40, y: VY(3.25) - 4, width: 80, height: VY(1.8) - VY(3.25) + 8, fill: 'none',
        stroke: RED, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', rx: 6 }, sv);
    }
    host.querySelector('[data-note]').innerHTML = [
      'The data sees x₁ most; the attacker goes mostly to x₃. Their measured values rise from x₁ to x₃.',
      'Each value moves by how much more the attacker visits it than the data does. On average over the attacker’s designs the values are now <b>too low</b> — a lower bound — and on average over the data, unchanged.',
      '<b>Not pointwise:</b> x₁ is now rated <b>above</b> its measurement. <b>It can cost A:</b> x₃ really is the best design, and it has been pulled down to a tie with x₂.'
    ][st];
  }

  var show = function (i) { st = Math.max(0, Math.min(N, i)); draw(); };
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
