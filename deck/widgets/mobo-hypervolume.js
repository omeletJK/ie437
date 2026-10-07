/* ============================================================
   widget: mobo-hypervolume                        (Chapter 4, Act 4)
   The source deck's multi-objective pictures (pp. 187-205), redrawn
   on the source's own coordinates: five Pareto points on a staircase
   and a reference point r in the far corner, with BOTH objectives
   MINIMISED, as in the source's car example. One widget, five modes,
   each walked by the deck's arrow key:

     front  dominance, and the Pareto front              pp. 187-189
     hvi    HV(P) -> HV(P u f) -> HVI -> A(P)             pp. 191-195
     phvi   the predictive density, and its mass in A(P) pp. 197-199
     ehvi   the HVI of one outcome, of three, of many    pp. 200-204
     hvpi   HVI at the mean times PHVI -- and a second
            candidate, where it parts company with EHVI  p. 205

   Every number is exact, never read off the picture. With independent
   Gaussian outputs, A(P) = {z <= r : no p in P dominates z} splits into
   vertical strips -- one left of the front, one under each Pareto
   point -- so, since HVI(P, f) = integral over A(P) of 1[f <= z] dz,

     PHVI = sum over strips of  P(f1 in the strip) * P(f2 < its cap)
     EHVI = integral over A(P) of P(f <= z) dz
          = sum over strips of  (integral of Phi1) * (integral of Phi2)

   using  integral of Phi((z - m)/s) dz = s [u Phi(u) + phi(u)],
   u = (z - m)/s. The Monte Carlo dots are there to be counted, and
   they agree with the closed forms.
   ============================================================ */
(function () {
var COUNT = 0;
IE437.widget('mobo-hypervolume', function (host, opts) {
  var UID = 'mhv' + (++COUNT);
  var NS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, parent) {        /* IE437.el knows no ellipse, gradient or clipPath */
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', AMBER = '#D97706',
      SLATE = '#64748B';
  /* quoted: an unquoted family name with a bare number in it ("Source Serif 4") is invalid CSS */
  var MONO = "'IBM Plex Mono', monospace", SERIF = "'Source Serif 4', Georgia, serif",
      KMAIN = "KaTeX_Main, 'Source Serif 4', Georgia, serif", KMATH = "KaTeX_Math, 'Source Serif 4', Georgia, serif";
  var MODE = ['front', 'hvi', 'phvi', 'ehvi', 'hvpi'].indexOf(opts && opts.mode) >= 0 ? opts.mode : 'hvi';

  /* ---------- the source's figure, in its own units (36 pt = 1) ---------- */
  var P = [[1.6, 5.55], [2.8, 4.2], [4.4, 2.55], [5.6, 1.95], [7.1, 0.8]];  /* f1 up, f2 down */
  var R = [10, 7.8];
  var ST = [{ lo: -Infinity, hi: P[0][0], cap: R[1] }];                     /* the strips of A(P) */
  P.forEach(function (p, i) { ST.push({ lo: p[0], hi: i + 1 < P.length ? P[i + 1][0] : R[0], cap: p[1] }); });
  var MU0 = [3.5, 3.5], S0 = 0.75, ASP = 0.72;       /* the source's contours: sigma2 = 0.72 sigma1 */
  var F0 = [3.4, 3.2];                               /* the new outcome on pp. 193-195 */
  var OUT = [                                        /* pp. 201, 202, 203 -- and one it leaves out */
    { f: [3.4, 3.2], n: '①' }, { f: [2.4, 2.95], n: '②' }, { f: [2.3, 2.2], n: '③' }, { f: [4.1, 4.5], n: '④' }];
  var CAND = [{ n: 'A', mu: [2.3, 4.6], s: 0.3, dx: -10 }, { n: 'B', mu: [5.0, 3.1], s: 1.4, dx: 8 }];
  var CARS = [
    { p: [1.2, 7.3], n: 'city car' }, { p: [1.9, 5.3] }, { p: [2.9, 3.7], n: 'sedan', dx: -9, dy: 16, a: 'end' },
    { p: [4.4, 2.5] }, { p: [6.4, 1.6] }, { p: [9.1, 1.0], n: 'hypercar', dx: 0, dy: 19, a: 'middle' }, { p: [2.7, 6.6] }, { p: [3.7, 5.5] },
    { p: [5.0, 4.4], n: 'SUV' }, { p: [6.0, 6.3] }, { p: [4.1, 3.9] }, { p: [7.2, 3.2] },
    { p: [8.3, 2.5] }, { p: [3.7, 7.7] }];
  var SEDAN = 2, SUV = 8;

  /* ---------- exact arithmetic ---------- */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var phi = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };
  function cdf(v, m, s) { return v === -Infinity ? 0 : PHI((v - m) / s); }
  function icdf(v, m, s) { if (v === -Infinity) return 0; var u = (v - m) / s; return s * (u * PHI(u) + phi(u)); }
  function sdOf(s) { return [s, ASP * s]; }
  /* the region f alone adds: a staircase of rectangles, one per strip it reaches */
  function hviShape(f) {
    var pts = [], rects = [], area = 0, last = 0;
    for (var i = 0; i < ST.length; i++) {
      var s = ST[i], lo = Math.max(s.lo, f[0]);
      if (s.hi <= lo) continue;
      if (s.cap <= f[1]) break;                  /* caps only fall from here on */
      if (!pts.length) pts.push([lo, f[1]]);
      pts.push([lo, s.cap], [s.hi, s.cap]);
      rects.push([lo, s.hi, f[1], s.cap]);
      area += (s.hi - lo) * (s.cap - f[1]);
      last = s.hi;
    }
    if (!pts.length) return { area: 0, pts: null, rects: [] };
    pts.push([last, f[1]]);
    return { area: area, pts: pts, rects: rects };
  }
  function hvi(f) { return hviShape(f).area; }
  var HVP = (function () {
    var a = 0; P.forEach(function (p, i) { a += ((i + 1 < P.length ? P[i + 1][0] : R[0]) - p[0]) * (R[1] - p[1]); });
    return a;
  })();
  function acq(mu, sd) {
    var ph = 0, eh = 0;
    ST.forEach(function (s) {
      ph += (cdf(s.hi, mu[0], sd[0]) - cdf(s.lo, mu[0], sd[0])) * cdf(s.cap, mu[1], sd[1]);
      eh += (icdf(s.hi, mu[0], sd[0]) - icdf(s.lo, mu[0], sd[0])) * icdf(s.cap, mu[1], sd[1]);
    });
    var hm = hvi(mu);
    return { phvi: ph, ehvi: eh, hvim: hm, hvpi: hm * ph };
  }
  function domBy(f) {                            /* the Pareto points that dominate f */
    var d = [];
    P.forEach(function (p, i) { if (p[0] <= f[0] && p[1] <= f[1]) d.push(i); });
    return d;
  }
  function relDens(f, mu, sd) {                  /* p(f) / p(mu) */
    var a = (f[0] - mu[0]) / sd[0], b = (f[1] - mu[1]) / sd[1];
    return Math.exp(-0.5 * (a * a + b * b));
  }

  /* the same standard-normal draws for every mean and width, so the
     cloud slides with the drag instead of reshuffling under it */
  var NMC = 160, ZZ = [];
  (function () {
    var g = IE437.rng((opts && opts.seed) || 98);  /* 129 of 160 in A(P) at the start: near 0.820, visibly an estimate */
    for (var k = 0; k < NMC; k++) {
      var u = Math.max(1e-12, g()), v = g(), rr = Math.sqrt(-2 * Math.log(u));
      ZZ.push([rr * Math.cos(2 * Math.PI * v), rr * Math.sin(2 * Math.PI * v)]);
    }
  })();

  /* ---------- chrome ---------- */
  var TITLES = {
    front: 'Two objectives, both minimised',
    hvi: 'Hypervolume, and what one outcome adds',
    phvi: 'PHVI &mdash; how likely is any gain in hypervolume',
    ehvi: 'EHVI &mdash; the gain, averaged over every outcome',
    hvpi: 'HVPI &mdash; the gain at the mean, times PHVI'
  };
  var DENS = MODE === 'phvi' || MODE === 'ehvi' || MODE === 'hvpi';
  host.innerHTML =
    '<div class="wbar"><span class="wt">' + TITLES[MODE] + '</span><span class="wspacer"></span>' +
    (DENS ? '<span class="wlabel" style="margin-left:14px">posterior width</span><span class="wnum" data-sv></span><div data-sl></div>' : '') +
    '</div>' +
    '<div class="wbody" style="gap:8px">' +
    '<div data-f></div>' +
    '<div style="display:flex;gap:20px;align-items:flex-start;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:318px;display:flex;flex-direction:column;gap:9px;padding-top:2px">' +
    '<div data-num style="font:400 12.5px/1.72 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div></div>';

  /* the formulas live in the markdown (::: wformulas, one item per state)
     because KaTeX runs only at build time; adopt them if the slide has some */
  var slide = host.closest('.slide');
  var fl = slide && slide.querySelector('.wformulas');
  var FL = [];
  if (fl) { host.querySelector('[data-f]').appendChild(fl); FL = fl.querySelectorAll('li'); }
  else host.querySelector('[data-f]').style.display = 'none';

  var XMAX = 10.9, YMAX = 8.3, K = 32, PL = 46, PT = 10, PR = 12, PB = 30;
  var W = Math.round(PL + XMAX * K + PR), H = Math.round(PT + YMAX * K + PB);
  var X = function (v) { return PL + v * K; };
  var Y = function (v) { return PT + (YMAX - v) * K; };
  var sv = IE437.svg(W, H);
  sv.style.touchAction = 'none';
  /* the try-it prompt sits in open space at the top of the plot (pixels in sv) */
  var TRYXY = { front: [270, 14], hvi: [193, 32], phvi: [180, 32], ehvi: [180, 32], hvpi: [180, 32] }[MODE];
  sv.setAttribute('data-try-anchor', ''); sv.setAttribute('data-try-x', TRYXY[0]); sv.setAttribute('data-try-y', TRYXY[1]);
  host.querySelector('[data-c]').appendChild(sv);

  function path(pts, close) {
    return 'M' + pts.map(function (p) { return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('L') + (close ? 'Z' : '');
  }
  function hvPts() {                            /* the region P dominates, closed off by r */
    var pts = [[P[0][0], R[1]]];
    P.forEach(function (p, i) { pts.push([p[0], p[1]], [i + 1 < P.length ? P[i + 1][0] : R[0], p[1]]); });
    pts.push([R[0], R[1]]);
    return pts;
  }
  function aPts() {                             /* A(P), as far as the axes show it */
    var st = hvPts(), pts = [[0, 0], [0, R[1]]];
    for (var i = 0; i < st.length - 1; i++) pts.push(st[i]);
    pts.push([R[0], 0]);
    return pts;
  }

  /* fixed defs: a Gaussian radial fade, and clips for A(P) and everything else */
  var defs = S('defs', {}, sv);
  [['r', RED], ['s', SLATE]].forEach(function (c) {
    var g = S('radialGradient', { id: UID + 'g' + c[0] }, defs);
    for (var t = 0; t <= 1.0001; t += 0.1)
      S('stop', { offset: t.toFixed(2), 'stop-color': c[1], 'stop-opacity': (0.6 * Math.exp(-4.5 * t * t)).toFixed(4) }, g);
  });
  var VIEW = [[0, 0], [0, YMAX], [XMAX, YMAX], [XMAX, 0]];
  S('path', { d: path(aPts(), true) }, S('clipPath', { id: UID + 'ca' }, defs));
  S('path', { d: path(VIEW, true) + path(aPts(), true), 'clip-rule': 'evenodd' }, S('clipPath', { id: UID + 'cd' }, defs));
  S('path', { d: path(VIEW, true) }, S('clipPath', { id: UID + 'cv' }, defs));
  var layer = S('g', {}, sv);

  /* ---------- text ---------- */
  function txt(x, y, s, o) {
    o = o || {};
    var n = S('text', { x: x, y: y, 'text-anchor': o.anchor || 'start', 'font-size': o.size || 12,
      'font-weight': o.weight || 400, fill: o.fill || INK, text: s }, o.parent || layer);
    n.setAttribute('font-family', o.serif ? SERIF : MONO);
    if (o.italic) n.setAttribute('font-style', 'italic');
    if (o.op != null) n.setAttribute('fill-opacity', o.op);
    if (o.halo !== false) { n.setAttribute('stroke', '#FFFFFF'); n.setAttribute('stroke-width', 3.5);
      n.setAttribute('stroke-opacity', .9); n.setAttribute('paint-order', 'stroke'); n.setAttribute('stroke-linejoin', 'round'); }
    return n;
  }
  /* a label set the way the formula above it is: KaTeX's own faces, which the
     page already carries -- upright names, italic symbols, a bold vector f --
     each part coloured by what it is. Style codes: i, b, bi, and s (subscript). */
  function mlabel(x, y, parts, o) {
    o = o || {};
    var n = S('text', { x: x, y: y, 'text-anchor': o.anchor || 'start', 'font-size': o.size || 17,
      'font-family': KMAIN, stroke: '#FFFFFF', 'stroke-width': 3.5, 'stroke-opacity': .9,
      'paint-order': 'stroke', 'stroke-linejoin': 'round' }, layer);
    parts.forEach(function (p) {
      var t = S('tspan', { fill: p[1] || INK, text: p[0] }, n);
      if (p[2] === 'i' || p[2] === 'bi') { t.setAttribute('font-family', KMATH); t.setAttribute('font-style', 'italic'); }
      if (p[2] === 'b' || p[2] === 'bi') t.setAttribute('font-weight', 700);
      if (p[2] === 's') { t.setAttribute('font-size', '70%'); t.setAttribute('baseline-shift', '-22%'); }
    });
    return n;
  }
  var L_P = [['P', BLUE, 'i']], L_F = [['f', RED, 'b'], ['(', RED], ['x', RED, 'i'], [')', RED]];
  function lHV() { return [['HV(']].concat(L_P, [[')']]); }
  function lHVI() { return [['HVI(']].concat(L_P, [[', ']], L_F, [[')']]); }
  function lA() { return [['A', GREEN, 'i'], ['(', GREEN], ['P', GREEN, 'i'], [')', GREEN]]; }

  /* ---------- the frame every mode shares ---------- */
  function frame(o) {
    /* the plot ground, and the source's grid through every Pareto coordinate */
    S('rect', { x: X(0), y: Y(YMAX), width: XMAX * K, height: YMAX * K, fill: '#FFFFFF' }, layer);
    if (!o.cars) {
      var gx = P.map(function (p) { return p[0]; }).concat([R[0]]), gy = P.map(function (p) { return p[1]; }).concat([R[1]]);
      gx.forEach(function (v) { S('line', { x1: X(v), y1: Y(0), x2: X(v), y2: Y(R[1]), stroke: INK, 'stroke-opacity': .1 }, layer); });
      gy.forEach(function (v) { S('line', { x1: X(0), y1: Y(v), x2: X(R[0]), y2: Y(v), stroke: INK, 'stroke-opacity': .1 }, layer); });
      if (o.a) S('path', { d: path(aPts(), true), fill: GREEN, 'fill-opacity': .13 }, layer);
      if (o.hv) S('path', { d: path(hvPts(), true), fill: o.hvFill || BLUE, 'fill-opacity': o.hvOp || .15 }, layer);
    }
  }
  function axes(xl, yl) {
    var ah = function (x, y, dir) {
      var d = dir === 'x' ? 'M' + x + ' ' + y + 'l-9 -4.5v9Z' : 'M' + x + ' ' + y + 'l-4.5 9h9Z';
      S('path', { d: d, fill: INK }, layer);
    };
    S('line', { x1: X(0), y1: Y(0), x2: X(XMAX) - 2, y2: Y(0), stroke: INK, 'stroke-width': 1.6 }, layer);
    S('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(YMAX) + 2, stroke: INK, 'stroke-width': 1.6 }, layer);
    ah(X(XMAX), Y(0), 'x'); ah(X(0), Y(YMAX), 'y');
    if (typeof xl === 'string') txt(X(XMAX), Y(0) + 22, xl, { anchor: 'end', size: 11, fill: INK, op: .7, halo: false });
    else mlabel(X(XMAX) - 4, Y(0) + 24, xl, { anchor: 'end', size: 16 });
    if (typeof yl === 'string') {
      var t = txt(X(0) - 12, Y(YMAX) + 4, yl, { anchor: 'end', size: 11, fill: INK, op: .7, halo: false });
      t.setAttribute('transform', 'rotate(-90 ' + (X(0) - 12) + ' ' + (Y(YMAX) + 4) + ')');
    } else mlabel(X(0) - 6, Y(YMAX) + 12, yl, { anchor: 'end', size: 16 });
  }
  var AX1 = [['f', INK, 'i'], ['1', INK, 's'], ['(', INK], ['x', INK, 'i'], [')', INK]];
  var AX2 = [['f', INK, 'i'], ['2', INK, 's'], ['(', INK], ['x', INK, 'i'], [')', INK]];
  function paretoDots() {
    P.forEach(function (p) { S('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.2, fill: BLUE, stroke: '#FFFFFF', 'stroke-width': 1.4 }, layer); });
    S('circle', { cx: X(R[0]), cy: Y(R[1]), r: 5, fill: INK }, layer);
    mlabel(X(R[0]) + 9, Y(R[1]) + 6, [['r', INK, 'i']], { size: 18 });
  }
  function hviPatch(f, strong) {                 /* the added region, as the source draws it */
    var sh = hviShape(f);
    if (!sh.pts) return sh;
    /* opaque underneath, so the gain reads as one orange whatever region it covers */
    S('path', { d: path(sh.pts, true), fill: '#FFFFFF' }, layer);
    S('path', { d: path(sh.pts, true), fill: AMBER, 'fill-opacity': strong ? .42 : .2,
      stroke: RED, 'stroke-width': strong ? 1.8 : 1, 'stroke-opacity': strong ? .95 : .5, 'stroke-linejoin': 'round' }, layer);
    return sh;
  }
  function fDot(f, label, o) {
    o = o || {};
    S('circle', { cx: X(f[0]), cy: Y(f[1]), r: o.r || 5.6, fill: RED, stroke: '#FFFFFF', 'stroke-width': 1.3,
      'fill-opacity': o.op == null ? 1 : o.op }, layer);
    if (label) mlabel(X(f[0]) - 9, Y(f[1]) + 5, label, { anchor: 'end', size: o.size || 16 });
  }
  function density(mu, sd, o) {
    o = o || {};
    var cx = X(mu[0]), cy = Y(mu[1]);
    var g = S('g', { 'clip-path': 'url(#' + UID + 'cv)' }, layer);
    if (o.mass && o.part !== 'lines') {
      S('ellipse', { cx: cx, cy: cy, rx: 3.2 * sd[0] * K, ry: 3.2 * sd[1] * K, fill: 'url(#' + UID + 'gs)',
        'clip-path': 'url(#' + UID + 'cd)' }, g);
      S('ellipse', { cx: cx, cy: cy, rx: 3.2 * sd[0] * K, ry: 3.2 * sd[1] * K, fill: 'url(#' + UID + 'gr)',
        'clip-path': 'url(#' + UID + 'ca)' }, g);
    }
    if (o.part === 'fill') return;
    (o.levels || [0.4, 0.7, 1.0, 1.5, 2.2, 3.0]).forEach(function (k) {
      S('ellipse', { cx: cx, cy: cy, rx: k * sd[0] * K, ry: k * sd[1] * K, fill: 'none', stroke: RED,
        'stroke-width': 1, 'stroke-dasharray': '3.5 2.2', 'stroke-opacity': o.faint ? .45 : .85 }, g);
    });
    /* the mean itself: a small cross, so HVPI has somewhere to stand */
    S('path', { d: 'M' + (cx - 5) + ' ' + cy + 'h10M' + cx + ' ' + (cy - 5) + 'v10', stroke: RED, 'stroke-width': 1.8 }, layer);
    if (o.label !== false) {
      var lx = mu[0] - 2.35 * sd[0], ly = mu[1] + 2.25 * sd[1];
      mlabel(X(lx), Y(ly), [['p', RED, 'i'], ['(', RED], ['f', RED, 'b'], ['(', RED], ['x', RED, 'i'], ['))', RED]],
        { anchor: 'end', size: 15 });
    }
  }
  function clouds(mu, sd, weigh) {
    var g = S('g', { 'clip-path': 'url(#' + UID + 'cv)' }, layer), n = 0, sum = 0;
    ZZ.forEach(function (z) {
      var f = [mu[0] + sd[0] * z[0], mu[1] + sd[1] * z[1]], h = hvi(f);
      sum += h; if (h > 0) n++;
      if (h > 0) S('circle', { cx: X(f[0]), cy: Y(f[1]), r: weigh ? 1.6 + 1.25 * Math.sqrt(h) : 2.3,
        fill: RED, 'fill-opacity': weigh ? .5 : .75, stroke: RED, 'stroke-width': .6 }, g);
      else S('circle', { cx: X(f[0]), cy: Y(f[1]), r: 2.1, fill: '#FFFFFF', stroke: SLATE, 'stroke-width': .9,
        'stroke-opacity': .8 }, g);
    });
    return { n: n, mean: sum / NMC };
  }
  function f2(v) { return v.toFixed(2); }
  function f3(v) { return v.toFixed(3); }
  function pt(f) { return '(' + f2(f[0]) + ', ' + f2(f[1]) + ')'; }
  function b(s, c) { return '<b' + (c ? ' style="color:' + c + '"' : '') + '>' + s + '</b>'; }
  function pname(i) { return 'p<sub>' + (i + 1) + '</sub>'; }
  function clear() { while (layer.firstChild) layer.removeChild(layer.firstChild); }
  /* every formula plate gets the height of the tallest, so pressing → never
     moves the caption below it. Measured once the slide is actually laid out. */
  var plateH = 0;
  function fixPlate() {
    if (plateH || !FL.length || !host.offsetParent) return;
    var m = 0;
    [].forEach.call(FL, function (li) { li.classList.add('on'); m = Math.max(m, li.offsetHeight); li.classList.remove('on'); });
    if (!m) return;
    plateH = m;
    [].forEach.call(FL, function (li) {
      var mb = li.querySelector('.mathblock');
      if (mb) { mb.style.minHeight = m + 'px'; mb.style.boxSizing = 'border-box'; mb.style.display = 'flex';
        mb.style.flexDirection = 'column'; mb.style.justifyContent = 'center'; }
    });
  }
  function show(num, note) {
    host.querySelector('[data-num]').innerHTML = num;
    host.querySelector('[data-note]').innerHTML = note;
    fixPlate();
    var fi = FMAP[MODE] ? FMAP[MODE][st] : Math.min(st, FL.length - 1);
    [].forEach.call(FL, function (li, i) { li.classList.toggle('on', i === fi); });
  }
  /* the arithmetic of an HVI, rectangle by rectangle */
  function arith(sh) {
    return sh.rects.map(function (q) { return f2(q[1] - q[0]) + '&times;' + f2(q[3] - q[2]); }).join(' + ');
  }

  /* ---------- state ---------- */
  var st = 0, f = F0.slice(), mu = MU0.slice(), s = S0, sel = SEDAN, cand = CAND.map(function (c) { return { mu: c.mu.slice(), s: c.s }; });
  var STEPS = { front: 3, hvi: 3, phvi: 2, ehvi: 5, hvpi: 3 }[MODE];
  /* which formula each step shows (default: one per step), and which step the
     printed deck keeps -- for EHVI the source's own L-shaped outcome, not the cloud */
  var FMAP = { ehvi: [0, 0, 0, 0, 0, 1] };
  var FIN = { front: 3, hvi: 3, phvi: 1, ehvi: 3, hvpi: 3 }[MODE];

  var dial = null;
  if (DENS) {
    dial = IE437.slider(host.querySelector('[data-sl]'), {
      bare: true, min: 0.25, max: 1.5, step: 0.05, value: S0, width: 104,
      on: function (v) { s = v; draw(); }
    });
  }

  /* ---------- mode: front ---------- */
  function paretoCars() {
    return CARS.map(function (c, i) {
      return !CARS.some(function (d, j) { return j !== i && d.p[0] <= c.p[0] && d.p[1] <= c.p[1] && (d.p[0] < c.p[0] || d.p[1] < c.p[1]); });
    });
  }
  var ISP = paretoCars();
  function drawFront() {
    frame({ cars: true });
    /* the walk shows the sedan, then the SUV; a click tests any design */
    var focus = sel !== null ? sel : st === 1 ? SEDAN : st === 2 ? SUV : null;
    var c = focus === null ? null : CARS[focus], beats = [];
    if (c) CARS.forEach(function (d, j) {
      if (j !== focus && d.p[0] <= c.p[0] && d.p[1] <= c.p[1] && (d.p[0] < c.p[0] || d.p[1] < c.p[1])) beats.push(j);
    });
    if (c) {
      /* the box a car better on both would have to sit in */
      var ok = !beats.length;
      S('rect', { x: X(0), y: Y(c.p[1]), width: c.p[0] * K, height: c.p[1] * K,
        fill: ok ? GREEN : RED, 'fill-opacity': ok ? .13 : .08 }, layer);
      S('path', { d: 'M' + X(0) + ' ' + Y(c.p[1]) + 'H' + X(c.p[0]) + 'V' + Y(0), fill: 'none',
        stroke: ok ? GREEN : RED, 'stroke-width': 1.8, 'stroke-opacity': .85 }, layer);
      if (ok) {
        txt(X(c.p[0] / 2), Y(c.p[1] / 2) - 6, 'no better car', { anchor: 'middle', size: 11, fill: GREEN, weight: 600 });
        txt(X(c.p[0] / 2), Y(c.p[1] / 2) + 9, 'on both', { anchor: 'middle', size: 11, fill: GREEN, weight: 600 });
      }
    }
    if (st === 3) {
      var front = CARS.filter(function (d, i) { return ISP[i]; }).map(function (d) { return d.p; })
        .sort(function (u, v) { return u[0] - v[0]; });
      S('path', { d: path(front), fill: 'none', stroke: RED, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, layer);
      /* the utopia point takes the best of each objective separately */
      var ux = Math.min.apply(null, CARS.map(function (d) { return d.p[0]; })),
          uy = Math.min.apply(null, CARS.map(function (d) { return d.p[1]; }));
      S('path', { d: 'M' + X(ux) + ' ' + (Y(uy) - 6.5) + 'l6.5 6.5l-6.5 6.5l-6.5 -6.5Z', fill: '#FFFFFF', stroke: AMBER, 'stroke-width': 1.8 }, layer);
      txt(X(ux) + 10, Y(uy) + 4, 'utopia point — no design reaches it', { size: 10.5, fill: AMBER, weight: 600 });
      txt(X(3.9), Y(2.05), 'Pareto front', { anchor: 'end', size: 12, fill: RED, weight: 700 });
    }
    CARS.forEach(function (d, j) {
      var par = ISP[j], isF = j === focus, isB = beats.indexOf(j) >= 0;
      var fill = st === 3 ? (par ? BLUE : '#FFFFFF') : INK, stroke = st === 3 && !par ? SLATE : '#FFFFFF';
      if (isF) { fill = beats.length ? RED : GREEN; stroke = '#FFFFFF'; }
      S('circle', { cx: X(d.p[0]), cy: Y(d.p[1]), r: isF ? 6.5 : 5, fill: fill, stroke: stroke, 'stroke-width': 1.3,
        'fill-opacity': focus !== null && st < 3 && !isF && !isB ? .4 : 1 }, layer);
      if (isB) S('circle', { cx: X(d.p[0]), cy: Y(d.p[1]), r: 9.5, fill: 'none', stroke: RED, 'stroke-width': 1.6 }, layer);
      if (d.n && (st === 0 || st === 3 || isF))
        txt(X(d.p[0]) + (d.dx || 9), Y(d.p[1]) + (d.dy || -7), d.n, { anchor: d.a || 'start', size: 10.5, fill: INK, op: .75 });
    });
    axes('fuel per km →', 'time to 100 km/h →');

    var num, note, nm = c && c.n ? c.n : 'this design';
    if (!c && st === 0) {
      num = b('14 designs') + ', two costs each:<br>fuel per km &nbsp;and&nbsp; time to reach 100 km/h.<br>Both are <b>minimised</b> &mdash; lower-left is better.';
      note = 'Which car is best? The fastest is the thirstiest. This section minimises both objectives &mdash; only the direction changes from the rest of the chapter, which maximised.';
    } else if (c) {
      num = b(nm) + ' &mdash; a car better on both would sit in its box.<br>' +
        (beats.length ? 'In the box: ' + b(beats.length + ' design' + (beats.length > 1 ? 's' : ''), RED) + ' &rarr; ' + b(nm, RED) + ' is ' + b('dominated', RED) + '.'
                      : 'The box is ' + b('empty', GREEN) + ' &rarr; ' + b(nm, GREEN) + ' is ' + b('Pareto-optimal', GREEN) + '.');
      note = beats.length
        ? '<i>y</i>&Prime; dominates <i>y</i>&prime; if it is no worse in every objective and strictly better in one. The ringed designs dominate this one: nobody should choose it.'
        : 'Improving either objective from here makes the other worse. Click any design to test it.';
    } else {
      num = b(ISP.filter(Boolean).length + ' of 14', BLUE) + ' designs are non-dominated: the ' + b('Pareto set', BLUE) + '. Joined up, they are the ' + b('Pareto front', RED) + '.';
      note = 'Each point on the front is the best car for <i>some</i> trade-off between fuel and time. The utopia point takes the best of each and no car reaches it; choosing among the front needs a preference.';
    }
    show(num, note);
  }

  /* ---------- mode: hvi ---------- */
  function drawHVI() {
    var sh = hviShape(f), inA = sh.area > 0;
    frame({ a: st >= 3, hv: true, hvFill: st === 1 ? AMBER : BLUE, hvOp: st === 1 ? .2 : .15 });
    if (st === 1 && sh.pts) S('path', { d: path(sh.pts, true), fill: AMBER, 'fill-opacity': .2 }, layer);
    if (st >= 2) hviPatch(f, true);
    paretoDots();
    if (st === 0) mlabel(X(5.1), Y(5.5), lHV(), { size: 21 });
    else if (st === 1) mlabel(X(4.7), Y(5.5), [['HV(']].concat(L_P, [[', ']], L_F, [[')']]), { size: 20 });
    else mlabel(X(5.6), Y(6.3), lHV(), { size: 19 });
    if (st >= 3) mlabel(X(0.25), Y(1.2), lA(), { size: 20 });
    if (st >= 1) {
      fDot(f, [['f', RED, 'b']], { size: 17 });
      if (st >= 2) {
        var ax, ay;
        if (sh.pts) { var q = sh.rects[0]; ax = X(q[1]); ay = Y(q[3]); }
        else { ax = X(f[0]) + 5; ay = Y(f[1]) - 5; }
        var lx = X(5.3), ly = Y(4.75);
        S('line', { x1: lx - 6, y1: ly - 5, x2: ax + 3, y2: ay + 2, stroke: RED, 'stroke-width': 1.6 }, layer);
        S('circle', { cx: ax + 2, cy: ay + 1.5, r: 2.4, fill: RED }, layer);
        mlabel(lx, ly, lHVI().concat(sh.pts ? [] : [[' = 0', RED]]), { size: 17 });
      }
    }
    axes(AX1, AX2);

    var num = '', note = '', dom = domBy(f);
    var hvu = HVP + sh.area;
    if (st === 0) {
      num = b('HV(<i>P</i>)', BLUE) + ' = ' + b(f2(HVP)) + '<br>the area the front dominates, fenced off by the reference point <i>r</i>.';
      note = 'One number for a whole set of trade-offs: the further the front sits from <i>r</i>, the larger it is. Each Pareto point adds the strip that it alone dominates.';
    } else if (st === 1) {
      num = 'a new outcome ' + b('<b>f</b>(<i>x</i>) = ' + pt(f), RED) + '<br>' +
        b('HV(<i>P</i>, <b>f</b>(<i>x</i>))', AMBER) + ' = ' + b(f2(hvu)) + '<br>&mdash; the front as it would be with <b>f</b> in it.';
      note = 'Add one point to the set and measure the area again: a front that moved outward dominates more.';
    } else if (st === 2) {
      num = b('HVI', RED) + ' = ' + f2(hvu) + ' &minus; ' + f2(HVP) + ' = ' + b(f2(sh.area), RED) +
        (sh.rects.length ? '<br>= ' + arith(sh) : '');
      note = 'Only the orange region is new. It is the improvement: the part of the plane that <b>f</b> dominates and the old front did not. Drag <b>f</b> toward the lower left and it grows.';
    } else {
      num = (inA ? b('<b>f</b>(<i>x</i>) &isin; <i>A</i>(<i>P</i>)', GREEN) + ' &rarr; HVI = ' + b(f2(sh.area), RED) + ' &gt; 0'
                 : b('<b>f</b>(<i>x</i>) &notin; <i>A</i>(<i>P</i>)', SLATE) + ' &rarr; HVI = ' + b('0', RED)) +
        (dom.length ? '<br>dominated by ' + dom.map(pname).join(', ') : '');
      note = '<span style="color:' + GREEN + '"><b>A(<i>P</i>)</b></span> is the non-dominated region: an outcome landing there moves the front; one landing in the blue does nothing. Drag <b>f</b> into the blue and watch the orange vanish.';
    }
    show(num, note);
  }

  /* ---------- modes: phvi, ehvi, hvpi ---------- */
  function drawDens() {
    var sd = sdOf(s), a = acq(mu, sd), num = '', note = '';
    var cmp = MODE === 'hvpi' && st === 3;
    frame({ a: true, hv: true });
    if (MODE === 'phvi') {
      density(mu, sd, { mass: st >= 1 });
      paretoDots();
      var cl = st === 2 ? clouds(mu, sd, false) : null;
      mlabel(X(5.6), Y(6.3), lHV(), { size: 19 }); mlabel(X(0.25), Y(1.2), lA(), { size: 20 });
      axes(AX1, AX2);
      num = 'mean ' + b('&mu;(<i>x</i>) = ' + pt(mu), RED) + '<br>width &sigma;(<i>x</i>) = (' + f2(sd[0]) + ', ' + f2(sd[1]) + ')';
      if (st >= 1) num += '<br>' + b('PHVI', RED) + ' = mass in <i>A</i>(<i>P</i>) = ' + b(f3(a.phvi), RED);
      if (cl) num += '<br>draws landing in <i>A</i>(<i>P</i>): ' + b(cl.n + ' / ' + NMC) + ' = ' + f3(cl.n / NMC);
      note = st === 0
        ? 'The GP gives each objective a Gaussian, so before <i>x</i> is run its outcome <b>f</b>(<i>x</i>) could land anywhere under these contours.'
        : st === 1
          ? 'Red mass lands in <i>A</i>(<i>P</i>) and moves the front; grey mass lands where <i>P</i> already dominates. PHVI is the red fraction. Widen &sigma; and watch it fall.'
          : 'PHVI only <b>counts</b>: every red draw is worth one, whether it clears the front by a hair or by a mile &mdash; the same blind spot as PI.';
    } else if (MODE === 'ehvi') {
      var o = st >= 1 && st <= 4 ? OUT[st - 1] : null, sh = o ? hviShape(o.f) : null, mc = null;
      if (o) hviPatch(o.f, true);
      density(mu, sd, { mass: false, faint: st === 5 });
      paretoDots();
      if (st === 5) mc = clouds(mu, sd, true);
      OUT.forEach(function (q, i) {
        if (st >= 1 && st <= 4 && i < st) {
          var cur = i === st - 1;
          fDot(q.f, [['f', RED, 'b'], [q.n, RED]], { r: cur ? 5.6 : 4, op: cur ? 1 : .45, size: cur ? 15 : 12 });
        }
      });
      mlabel(X(5.6), Y(6.3), lHV(), { size: 19 }); mlabel(X(0.25), Y(1.2), lA(), { size: 20 });
      axes(AX1, AX2);
      num = 'mean ' + b('&mu;(<i>x</i>) = ' + pt(mu), RED) + ', width &sigma;(<i>x</i>) = (' + f2(sd[0]) + ', ' + f2(sd[1]) + ')';
      if (st >= 1 && st <= 4) {
        OUT.slice(0, st).forEach(function (q, i) {
          var h = hviShape(q.f), cur = i === st - 1;
          num += '<br>' + (cur ? '<b>' : '<span style="opacity:.6">') + q.n + ' ' + pt(q.f) + ': HVI = ' +
            (h.area > 0 ? f2(h.area) : '0') + (cur ? '</b>' : '</span>') +
            ' <span style="color:var(--ink3)">&middot; p(<b>f</b>)/p(&mu;) = ' + f2(relDens(q.f, mu, sd)) + '</span>';
        });
        if (sh.rects.length) num += '<br><span style="color:var(--ink3)">' + OUT[st - 1].n + ' = ' + arith(sh) + '</span>';
      }
      if (st === 5) num += '<br>average HVI over ' + NMC + ' draws = ' + b(f3(mc.mean)) + '<br>' + b('EHVI', RED) + ' (exact) = ' + b(f3(a.ehvi), RED);
      if (st === 0) num += '<br>' + b('EHVI', RED) + ' = ' + b(f3(a.ehvi), RED);
      note = [
        'EHVI averages the improvement over every place <b>f</b>(<i>x</i>) might land. Walk three possible outcomes, one that adds nothing, then all of them.',
        'Outcome ① lands just inside the notch: one small rectangle of improvement, at a likely spot.',
        'Outcome ② lands further out: it now dominates a strip under <i>p</i><sub>1</sub> too, so its gain is L-shaped and three times larger &mdash; at a less likely spot.',
        'Outcome ③ clears two Pareto points at once. Rare, but worth five times ①. EHVI keeps both ingredients of EI: <b>how likely</b> and <b>how far</b>.',
        'Outcome ④ lands where <i>P</i> already dominates. It adds nothing: max{0, HVI} = 0, exactly as in EI.',
        'Each dot is one draw of <b>f</b>(<i>x</i>), sized by its HVI; hollow ones add nothing. Their average is EHVI. Widen &sigma; and it <b>rises</b> &mdash; while PHVI falls.'][st];
    } else {
      /* hvpi */
      if (!cmp) {
        density(mu, sd, { mass: st >= 1, part: 'fill' });
        var hs = hviPatch(mu, true);
        density(mu, sd, { part: 'lines' });
        paretoDots();
        mlabel(X(5.6), Y(6.3), lHV(), { size: 19 }); mlabel(X(0.25), Y(1.2), lA(), { size: 20 });
        if (hs.pts) {
          var q0 = hs.rects[0], hx = X(q0[1]) + 3, hy = Y(q0[3]) + 1;
          S('line', { x1: X(5.3) - 6, y1: Y(4.75) - 5, x2: hx, y2: hy, stroke: RED, 'stroke-width': 1.6 }, layer);
          mlabel(X(5.3), Y(4.75), [['HVI(']].concat(L_P, [[', ', INK], ['μ', RED, 'bi'], ['(', RED], ['x', RED, 'i'], [')', RED], [')', INK]]), { size: 17 });
        }
        axes(AX1, AX2);
        num = 'mean ' + b('&mu;(<i>x</i>) = ' + pt(mu), RED) + ', width &sigma;(<i>x</i>) = (' + f2(sd[0]) + ', ' + f2(sd[1]) + ')' +
          '<br>HVI(<i>P</i>, &mu;(<i>x</i>)) = ' + b(f2(a.hvim), AMBER);
        if (st >= 1) num += '<br>&times; ' + b('PHVI', RED) + ' = ' + f3(a.phvi) + '<br>= ' + b('HVPI = ' + f3(a.hvpi), RED);
        if (st >= 2) num += '<br>compare ' + b('EHVI = ' + f3(a.ehvi), BLUE);
        note = [
          'HVPI takes the improvement at one point only &mdash; the mean. That is a single rectangle, not an average.',
          'Then it multiplies by the chance of any improvement at all: HVI at the mean, times PHVI. Cheap: no integral of HVI is needed.',
          'A product of two summaries is not the average of a product: HVPI &ne; EHVI in general. Widen &sigma;: EHVI rises, HVPI falls.'][st];
      } else {
        CAND.forEach(function (c0, i) {
          var c = cand[i], sdc = sdOf(c.s);
          var hs = hviPatch(c.mu, true);
          density(c.mu, sdc, { mass: false, levels: [0.5, 1.0, 2.0], label: false });
          txt(X(c.mu[0]) + c0.dx, Y(c.mu[1]) - 8, c0.n, { anchor: c0.dx < 0 ? 'end' : 'start', size: 15, weight: 700, fill: RED });
          if (!hs.pts) txt(X(c.mu[0]) + c0.dx + 15, Y(c.mu[1]) - 8, '— HVI at its mean = 0', { size: 10.5, fill: RED, weight: 600 });
        });
        paretoDots();
        mlabel(X(5.6), Y(6.3), lHV(), { size: 19 }); mlabel(X(0.25), Y(1.2), lA(), { size: 20 });
        axes(AX1, AX2);
        var rows = cand.map(function (c) { return acq(c.mu, sdOf(c.s)); });
        var win = function (k) { return rows[0][k] >= rows[1][k] ? 0 : 1; };
        var cell = function (i, k) { var v = f3(rows[i][k]); return '<td style="text-align:right;padding:1px 6px">' + (win(k) === i ? '<b style="color:' + RED + '">' + v + '</b>' : v) + '</td>'; };
        num = '<table style="border-collapse:collapse;font:400 12.5px/1.6 var(--mono);color:var(--ink2)">' +
          '<tr><td></td><td style="padding:1px 6px">PHVI</td><td style="padding:1px 6px">EHVI</td><td style="padding:1px 6px">HVPI</td></tr>' +
          cand.map(function (c, i) {
            return '<tr><td style="padding:1px 6px"><b>' + CAND[i].n + '</b> <span style="color:var(--ink3)">&sigma;=' + f2(c.s) + '</span></td>' +
              cell(i, 'phvi') + cell(i, 'ehvi') + cell(i, 'hvpi') + '</tr>';
          }).join('') +
          '<tr><td style="padding:1px 6px;color:var(--ink3)">picks</td><td style="padding:1px 6px;text-align:right">' + CAND[win('phvi')].n +
          '</td><td style="padding:1px 6px;text-align:right">' + CAND[win('ehvi')].n + '</td><td style="padding:1px 6px;text-align:right">' + CAND[win('hvpi')].n + '</td></tr></table>';
        note = '<b>A</b> is a near-certain small gain in the notch. <b>B</b>&rsquo;s mean is dominated, so HVI at its mean is 0 and ' +
          '<b>HVPI can never choose it</b> &mdash; yet its wide posterior reaches deep into <i>A</i>(<i>P</i>), and EHVI prefers it. The same split as PI against EI.';
      }
    }
    if (dial) { dial.el.style.opacity = cmp ? .35 : 1; dial.input.disabled = cmp; }
    var sv2 = host.querySelector('[data-sv]');
    if (sv2) sv2.textContent = cmp ? 'set per candidate' : 'σ₁ = ' + f2(s);
    show(num, note);
  }

  function draw() {
    clear();
    if (MODE === 'front') drawFront();
    else if (MODE === 'hvi') drawHVI();
    else drawDens();
    /* before the first press there is no f to drag, so no prompt to drag it */
    if (MODE === 'hvi') { if (st === 0) host.setAttribute('data-try-off', ''); else host.removeAttribute('data-try-off'); }
  }

  /* ---------- the drag ---------- */
  var drag = null;
  function at(ev) {
    var r = sv.getBoundingClientRect();
    var px = (ev.clientX - r.left) / r.width * W, py = (ev.clientY - r.top) / r.height * H;
    return [Math.max(0.05, Math.min(XMAX - 0.1, (px - PL) / K)), Math.max(0.05, Math.min(YMAX - 0.1, YMAX - (py - PT) / K))];
  }
  function move(ev) {
    var q = at(ev);
    if (MODE === 'front') {
      var best = -1, bd = 0.5;
      CARS.forEach(function (c, i) { var d = Math.hypot(c.p[0] - q[0], c.p[1] - q[1]); if (d < bd) { bd = d; best = i; } });
      if (best < 0) return;
      sel = best;                                /* a click takes over from the walked example */
    } else if (MODE === 'hvi') { if (st === 0) return; f = q; }
    else if (MODE === 'hvpi' && st === 3) {
      if (drag === 'start') drag = Math.hypot(cand[0].mu[0] - q[0], cand[0].mu[1] - q[1]) <= Math.hypot(cand[1].mu[0] - q[0], cand[1].mu[1] - q[1]) ? 0 : 1;
      cand[drag].mu = q;
    } else mu = q;
    draw();
  }
  sv.addEventListener('pointerdown', function (e) { drag = 'start'; try { sv.setPointerCapture(e.pointerId); } catch (x) { } move(e); });
  sv.addEventListener('pointermove', function (e) { if (drag !== null) move(e); });
  sv.addEventListener('pointerup', function () { drag = null; });
  sv.addEventListener('pointercancel', function () { drag = null; });

  function defaults() {
    f = F0.slice(); mu = MU0.slice(); s = S0; sel = null;
    cand = CAND.map(function (c) { return { mu: c.mu.slice(), s: c.s }; });
    if (dial) dial.set(S0, false);
  }
  defaults();
  draw();
  return {
    steps: STEPS,
    step: function (i) { st = i; if (MODE === 'front') sel = null; draw(); },
    /* arriving resets what was dragged, not where the arrow key has walked to */
    reset: function () { defaults(); draw(); },
    finish: function () { defaults(); st = FIN; draw(); }
  };
});
})();
