/* ============================================================
   widget: gen-pictures                             (Chapter 6, Act 2)
   The source deck's pictures of generative-model basics, redrawn
   (Part 1 pp. 6, 8, 12, 13, 16–18). Plain figure panels, one per mode.

   mode "goal"     p. 6 — noise z -> a network -> the model's distribution,
                   pulled onto the data's distribution by a loss
   mode "latent"   p. 8 — each hidden factor a plain Gaussian; one draw of
                   all of them, decoded, is one face. Sample A is the
                   source's vector (smile .23, skin .02, beard .71,
                   glasses -.19, hair .33; its gender axis is left out);
                   sample B is chosen to contrast. Right: z -> x, and the
                   dashed inference arrow back.
   mode "arch"     pp. 11–12 — encoder -> (mu, sigma) -> z = mu + sigma*eps
                   -> decoder -> reconstruction; where the two ELBO terms
                   attach; and generation after training
   mode "reparam"  p. 12 — why the sample must be rewritten: a random draw
                   has no derivative; mu + sigma*eps does
   mode "terms"    p. 13 — {"k":1|2|3}: three designs' code distributions
                   q(z|x) against the prior N(0,1).
                   1 reconstruction alone moves the codes apart
                     (means -2.0, 0.3, 2.3; sd .42)
                   2 ... and shrinks them to spikes (sd .06): prior draws
                     land between them
                   3 the KL pulls them back and widens them
                     (means -.85, .05, .9; sd .5)
   mode "ladder"   pp. 16–18 — one code, two stacked codes, T codes with a
                   fixed noising encoder. Walked by the deck's ->.
   ============================================================ */
IE437.widget('gen-pictures', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B',
      GREEN = '#16A34A', TEAL = '#0F9D8A', PANEL = '#F1F1ED', PANEL2 = '#E7E7E1';
  var MODE = opts.mode || 'goal';
  var uid = 'gp' + Math.floor(Math.random() * 1e9);

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* ---------- helpers ---------- */
  function svg(w, h) { var s = IE437.svg(w, h); mount.appendChild(s); defs(s); return s; }
  function defs(s) {
    var d = E('defs', {}, s);
    [['k', INK], ['b', BLUE], ['r', RED], ['a', AMBER], ['s', SLATE], ['g', GREEN]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
  }
  function arrow(s, x1, y1, x2, y2, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' }[c] || 'k';
    var a = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('line', a, s);
  }
  function curve(s, d, c, extra) {
    var key = { '#16181D': 'k', '#2563EB': 'b', '#D64545': 'r', '#D97706': 'a', '#64748B': 's', '#16A34A': 'g' }[c] || 'k';
    var a = { d: d, fill: 'none', stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' };
    for (var k in extra || {}) a[k] = extra[k];
    return E('path', a, s);
  }
  /* text with _x / _{xy} subscripts and ^x superscripts */
  function tx(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 12, fill: INK };
    for (var k in a || {}) at[k] = a[k];
    var t = E('text', at, s), i = 0, buf = '';
    function flush() { if (buf) { E('tspan', { text: buf }, t); buf = ''; } }
    while (i < str.length) {
      var ch = str[i];
      if ((ch === '_' || ch === '^') && i + 1 < str.length) {
        flush();
        var body;
        if (str[i + 1] === '{') { var j = str.indexOf('}', i); body = str.slice(i + 2, j); i = j + 1; }
        else { body = str[i + 1]; i += 2; }
        var dy = ch === '_' ? '0.32em' : '-0.42em';
        E('tspan', { dy: dy, 'font-size': '0.74em', text: body }, t);
        E('tspan', { dy: ch === '_' ? '-0.32em' : '0.42em', text: '​' }, t);
      } else { buf += ch; i++; }
    }
    flush();
    return t;
  }
  function nd(x, m, sd) { return Math.exp(-0.5 * (x - m) * (x - m) / (sd * sd)) / (sd * Math.sqrt(2 * Math.PI)); }
  function blob(cx, cy, R, amp, k, ph) { return function (t) { return R + amp * Math.cos(k * t + ph); }; }
  function blobPath(cx, cy, r) {
    var d = '';
    for (var i = 0; i <= 200; i++) {
      var t = i / 200 * 2 * Math.PI, rr = r(t);
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(t)).toFixed(1) + ' ' + (cy - rr * Math.sin(t)).toFixed(1);
    }
    return d + 'Z';
  }
  function dotsIn(s, cx, cy, r, n, seed, fill, rad) {
    var rng = IE437.rng(seed), k = 0, guard = 0;
    while (k < n && guard++ < 5000) {
      var t = rng() * 2 * Math.PI, u = Math.sqrt(rng()) * 0.86;
      var rr = r(t) * u;
      E('circle', { cx: cx + rr * Math.cos(t), cy: cy - rr * Math.sin(t), r: rad || 2.6, fill: fill }, s);
      k++;
    }
  }
  /* a 7 x 7 "design": a bracket shape, optionally blurred or noised */
  var SHAPE = [
    '1111110', '1000000', '1000000', '1011100', '1000100', '1000100', '1111100'
  ];
  var SHAPE2 = [
    '0111110', '0100010', '0100010', '0111110', '0000010', '0000010', '0111110'
  ];
  function thumb(s, x, y, size, opt) {
    opt = opt || {};
    var g = E('g', {}, s), n = 7, c = size / n, rng = IE437.rng(opt.seed || 3), sh = opt.shape || SHAPE;
    E('rect', { x: x - 1, y: y - 1, width: size + 2, height: size + 2, fill: '#fff', stroke: INK, 'stroke-opacity': .35 }, g);
    for (var r = 0; r < n; r++) for (var q = 0; q < n; q++) {
      var v = sh[r][q] === '1' ? 1 : 0;
      if (opt.blur) {
        var acc = 0, w = 0;
        for (var dr = -1; dr <= 1; dr++) for (var dq = -1; dq <= 1; dq++) {
          var rr = r + dr, qq = q + dq;
          if (rr < 0 || qq < 0 || rr >= n || qq >= n) continue;
          var ww = (dr || dq) ? 0.35 : 1;
          acc += ww * (sh[rr][qq] === '1' ? 1 : 0); w += ww;
        }
        v = 0.55 * v + 0.45 * acc / w;
      }
      if (opt.noise != null) {
        var a = Math.sqrt(1 - opt.noise * opt.noise);
        var g1 = Math.sqrt(-2 * Math.log(rng() + 1e-12)) * Math.cos(2 * Math.PI * rng());
        v = a * v + opt.noise * (0.5 + 0.45 * g1);
      }
      v = Math.max(0, Math.min(1, v));
      if (v < 0.04) continue;
      E('rect', { x: x + q * c, y: y + r * c, width: c + 0.2, height: c + 0.2, fill: INK, 'fill-opacity': v.toFixed(2) }, g);
    }
    return g;
  }
  function ell(s, cx, cy, rx, ry, a) {
    var o = { d: 'M' + (cx - rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + (2 * rx) + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + (-2 * rx) + ' 0Z' };
    for (var k in a) o[k] = a[k];
    return E('path', o, s);
  }
  function box(s, x, y, w, h, fill, stroke) {
    return E('rect', { x: x, y: y, width: w, height: h, rx: 6, fill: fill || PANEL, stroke: stroke || INK, 'stroke-opacity': .5, 'stroke-width': 1.2 }, s);
  }
  function trap(s, x, y, w, h, narrowRight, fill, stroke) {
    var i = h * 0.22;
    var pts = narrowRight
      ? [[x, y], [x + w, y + i], [x + w, y + h - i], [x, y + h]]
      : [[x, y + i], [x + w, y], [x + w, y + h], [x, y + h - i]];
    return E('polygon', { points: pts.map(function (p) { return p.join(','); }).join(' '), fill: fill, stroke: stroke, 'stroke-width': 1.4 }, s);
  }

  /* ---------- p. 6: what a generative model learns ---------- */
  function drawGoal() {
    var s = svg(940, 236);
    /* unit Gaussian */
    tx(s, 82, 30, 'unit Gaussian', { 'text-anchor': 'middle', 'font-weight': 700, fill: SLATE, 'font-size': 11.5 });
    box(s, 22, 42, 120, 120);
    var rng = IE437.rng(11), i;
    for (i = 0; i < 46; i++) {
      var g1 = Math.sqrt(-2 * Math.log(rng() + 1e-12)), th = 2 * Math.PI * rng();
      var zx = g1 * Math.cos(th), zy = g1 * Math.sin(th);
      if (Math.abs(zx) > 2.6 || Math.abs(zy) > 2.6) continue;
      E('circle', { cx: 82 + zx * 20, cy: 102 + zy * 20, r: 2.4, fill: SLATE }, s);
    }
    tx(s, 82, 184, 'z ~ N(0, I)', { 'text-anchor': 'middle', 'font-size': 12.5 });
    arrow(s, 146, 102, 186, 102, INK);
    /* the network */
    trap(s, 190, 52, 104, 100, false, '#FDF0DC', AMBER);
    tx(s, 242, 98, 'generator', { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 12.5 });
    tx(s, 242, 116, 'a network, weights θ', { 'text-anchor': 'middle', 'font-size': 11 });
    arrow(s, 298, 102, 340, 102, INK);
    /* the model's distribution */
    var rG = blob(0, 0, 54, 13, 5, 0.9);
    E('path', { d: blobPath(440, 106, rG), fill: GREEN, 'fill-opacity': .14, stroke: GREEN, 'stroke-width': 1.6 }, s);
    dotsIn(s, 440, 106, rG, 22, 4, GREEN, 2.4);
    tx(s, 440, 30, 'p̂_θ(x) — what the model generates', { 'text-anchor': 'middle', 'font-weight': 700, fill: GREEN, 'font-size': 11.5 });
    /* the loss */
    E('line', { x1: 522, y1: 106, x2: 640, y2: 106, stroke: RED, 'stroke-width': 1.8, 'stroke-dasharray': '6 4',
      'marker-end': 'url(#' + uid + 'r)', 'marker-start': 'url(#' + uid + 'r)' }, s);
    tx(s, 581, 94, 'loss:', { 'text-anchor': 'middle', fill: RED, 'font-weight': 700, 'font-size': 11.5 });
    tx(s, 581, 126, 'how far apart?', { 'text-anchor': 'middle', fill: RED, 'font-size': 11.5 });
    /* the data's distribution */
    var rD = blob(0, 0, 62, 17, 5, 0);
    E('path', { d: blobPath(735, 106, rD), fill: BLUE, 'fill-opacity': .10, stroke: BLUE, 'stroke-width': 1.6 }, s);
    dotsIn(s, 735, 106, rD, 30, 8, INK, 2.6);
    tx(s, 735, 30, 'p_{data}(x) — the designs we have', { 'text-anchor': 'middle', 'font-weight': 700, fill: BLUE, 'font-size': 11.5 });
    tx(s, 590, 214, 'design space — the same shape, not only the same centre, must be learned', { 'text-anchor': 'middle', 'font-style': 'italic', fill: INK, 'fill-opacity': .5, 'font-size': 11 });
  }

  /* ---------- p. 8: hidden factors ---------- */
  var FACTORS = ['smile', 'skin tone', 'beard', 'glasses', 'hair colour'];
  var SA = [0.23, 0.02, 0.71, -0.19, 0.33], SB = [1.4, -0.9, -1.2, 1.1, -1.0];
  function mix(c1, c2, t) {
    var a = [1, 3, 5].map(function (k) { return parseInt(c1.substr(k, 2), 16); }),
        b = [1, 3, 5].map(function (k) { return parseInt(c2.substr(k, 2), 16); });
    return 'rgb(' + a.map(function (v, k) { return Math.round(v + (b[k] - v) * t); }).join(',') + ')';
  }
  function face(s, cx, cy, z) {
    var cl = function (v) { return Math.max(0, Math.min(1, v)); };
    var skin = mix('#F7DCC0', '#A06B45', cl((z[1] + 2) / 4)), hair = mix('#2B1D14', '#E2B04F', cl((z[4] + 2) / 4));
    ell(s, cx, cy, 34, 40, { fill: skin, stroke: INK, 'stroke-width': 1.4 });
    E('path', { d: 'M' + (cx - 35) + ' ' + (cy - 4) + 'Q' + (cx - 40) + ' ' + (cy - 52) + ' ' + cx + ' ' + (cy - 46) +
      'Q' + (cx + 40) + ' ' + (cy - 52) + ' ' + (cx + 35) + ' ' + (cy - 4) +
      'Q' + (cx + 24) + ' ' + (cy - 30) + ' ' + cx + ' ' + (cy - 29) + 'Q' + (cx - 24) + ' ' + (cy - 30) + ' ' + (cx - 35) + ' ' + (cy - 4) + 'Z',
      fill: hair, stroke: INK, 'stroke-width': 1.1 }, s);
    if (z[2] > 0) E('path', { d: 'M' + (cx - 31) + ' ' + (cy + 6) + 'Q' + (cx - 28) + ' ' + (cy + 44) + ' ' + cx + ' ' + (cy + 43) +
      'Q' + (cx + 28) + ' ' + (cy + 44) + ' ' + (cx + 31) + ' ' + (cy + 6) +
      'Q' + (cx + 16) + ' ' + (cy + 26) + ' ' + cx + ' ' + (cy + 25) + 'Q' + (cx - 16) + ' ' + (cy + 26) + ' ' + (cx - 31) + ' ' + (cy + 6) + 'Z',
      fill: hair, 'fill-opacity': (0.35 + 0.45 * Math.min(1, z[2])).toFixed(2) }, s);
    E('circle', { cx: cx - 12, cy: cy - 7, r: 2.8, fill: INK }, s);
    E('circle', { cx: cx + 12, cy: cy - 7, r: 2.8, fill: INK }, s);
    if (z[3] > 0) {
      E('circle', { cx: cx - 12, cy: cy - 7, r: 8.5, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, s);
      E('circle', { cx: cx + 12, cy: cy - 7, r: 8.5, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, s);
      E('line', { x1: cx - 3.5, y1: cy - 7, x2: cx + 3.5, y2: cy - 7, stroke: INK, 'stroke-width': 1.8 }, s);
    }
    E('line', { x1: cx, y1: cy - 1, x2: cx - 2, y2: cy + 8, stroke: INK, 'stroke-width': 1.1, 'stroke-opacity': .6 }, s);
    var k = Math.max(-1.6, Math.min(1.6, z[0]));
    E('path', { d: 'M' + (cx - 12) + ' ' + (cy + 17) + 'Q' + cx + ' ' + (cy + 17 + 9 * k) + ' ' + (cx + 12) + ' ' + (cy + 17),
      fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-linecap': 'round' }, s);
  }
  function drawLatent() {
    var s = svg(990, 252), i;
    tx(s, 190, 18, 'p(z): each hidden factor is a plain Gaussian', { 'text-anchor': 'middle', 'font-weight': 700, fill: SLATE, 'font-size': 11.5 });
    var X0 = 108, X1 = 280, PX = function (v) { return X0 + (v + 3) / 6 * (X1 - X0); };
    FACTORS.forEach(function (f, r) {
      var y = 62 + r * 42;
      tx(s, 100, y - 2, f, { 'text-anchor': 'end', 'font-size': 12 });
      var d = '';
      for (i = 0; i <= 80; i++) { var v = -3 + 6 * i / 80; d += (i ? 'L' : 'M') + PX(v).toFixed(1) + ' ' + (y - nd(v, 0, 1) * 62).toFixed(1); }
      E('path', { d: d, fill: 'none', stroke: SLATE, 'stroke-width': 1.4 }, s);
      E('line', { x1: X0, x2: X1, y1: y, y2: y, stroke: INK, 'stroke-opacity': .25 }, s);
      E('circle', { cx: PX(SA[r]), cy: y, r: 4.6, fill: AMBER, stroke: '#fff', 'stroke-width': 1 }, s);
      E('circle', { cx: PX(SB[r]), cy: y, r: 4.6, fill: BLUE, stroke: '#fff', 'stroke-width': 1 }, s);
    });
    /* the two drawn vectors */
    [[SA, AMBER, 30, 'draw A'], [SB, BLUE, 136, 'draw B']].forEach(function (c) {
      var y0 = c[2];
      box(s, 312, y0, 74, 92, '#fff', c[1]);
      tx(s, 349, y0 - 5, c[3], { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: c[1] });
      c[0].forEach(function (v, k) {
        tx(s, 349, y0 + 18 + k * 16, (v >= 0 ? ' ' : '−') + Math.abs(v).toFixed(2), { 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace', 'font-size': 11.5, fill: c[1] });
      });
      arrow(s, 392, y0 + 46, 520, y0 + 46, INK);
      tx(s, 456, y0 + 38, 'decoder p_θ(x|z)', { 'text-anchor': 'middle', 'font-size': 11.5 });
    });
    arrow(s, 284, 120, 306, 80, SLATE, { 'stroke-width': 1.2 });
    arrow(s, 284, 150, 306, 178, SLATE, { 'stroke-width': 1.2 });
    face(s, 572, 74, SA);
    face(s, 572, 184, SB);
    /* the graphical model */
    var gx = 790;
    box(s, gx - 70, 26, 260, 208, PANEL, INK);
    tx(s, gx + 60, 46, 'the model, as a graph', { 'text-anchor': 'middle', 'font-weight': 700, fill: SLATE, 'font-size': 11.5 });
    E('circle', { cx: gx, cy: 84, r: 19, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }, s);
    tx(s, gx, 89, 'z', { 'text-anchor': 'middle', 'font-size': 15, 'font-style': 'italic' });
    E('circle', { cx: gx, cy: 190, r: 19, fill: PANEL2, stroke: INK, 'stroke-width': 1.5 }, s);
    tx(s, gx, 195, 'x', { 'text-anchor': 'middle', 'font-size': 15, 'font-style': 'italic' });
    arrow(s, gx, 105, gx, 168, INK, { 'stroke-width': 2 });
    curve(s, 'M' + (gx + 18) + ' 180Q' + (gx + 56) + ' 137 ' + (gx + 18) + ' 96', BLUE, { 'stroke-dasharray': '5 4' });
    tx(s, gx + 10, 128, 'p_θ(x|z)', { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, 'dx': -14 });
    tx(s, gx - 4, 142, 'generate', { 'text-anchor': 'end', 'font-size': 10.5, fill: SLATE, 'dx': -10 });
    tx(s, gx + 52, 128, 'q(z|x)', { 'font-size': 12, 'font-weight': 700, fill: BLUE });
    tx(s, gx + 52, 142, 'infer — Bayes', { 'font-size': 10.5, fill: BLUE });
    tx(s, gx + 26, 222, 'shaded: observed', { 'font-size': 10, fill: SLATE });
  }

  /* ---------- pp. 11–12: the VAE ---------- */
  function drawArch() {
    var s = svg(1010, 222), y = 112;
    thumb(s, 18, y - 32, 64);
    tx(s, 50, y + 50, 'x — a design', { 'text-anchor': 'middle', 'font-size': 11.5 });
    arrow(s, 86, y, 110, y, INK);
    trap(s, 114, y - 46, 92, 92, true, '#E3ECFD', BLUE);
    tx(s, 160, y - 4, 'encoder', { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 12 });
    tx(s, 160, y + 14, 'q_φ(z|x)', { 'text-anchor': 'middle', 'font-size': 12, fill: BLUE });
    arrow(s, 206, y - 14, 236, y - 34, INK);
    arrow(s, 206, y + 14, 236, y + 34, INK);
    box(s, 238, y - 52, 66, 30, '#fff', BLUE); tx(s, 271, y - 32, 'μ_φ(x)', { 'text-anchor': 'middle', 'font-size': 12.5 });
    box(s, 238, y + 22, 66, 30, '#fff', BLUE); tx(s, 271, y + 42, 'σ_φ(x)', { 'text-anchor': 'middle', 'font-size': 12.5 });
    arrow(s, 304, y - 37, 350, y - 10, INK);
    arrow(s, 304, y + 37, 350, y + 10, INK);
    box(s, 352, y - 20, 132, 40, '#fff', INK);
    tx(s, 418, y + 5, 'z = μ + σ ⊙ ε', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
    E('circle', { cx: 418, cy: y + 82, r: 22, fill: PANEL2, stroke: SLATE }, s);
    tx(s, 418, y + 86, 'ε', { 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic' });
    tx(s, 446, y + 86, '~ N(0, I)', { 'font-size': 11.5, fill: SLATE });
    arrow(s, 418, y + 59, 418, y + 23, SLATE);
    arrow(s, 484, y, 512, y, INK);
    trap(s, 516, y - 46, 92, 92, false, '#FDF0DC', AMBER);
    tx(s, 562, y - 4, 'decoder', { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 12 });
    tx(s, 562, y + 14, 'p_θ(x|z)', { 'text-anchor': 'middle', 'font-size': 12, fill: AMBER });
    arrow(s, 610, y, 634, y, INK);
    thumb(s, 638, y - 32, 64, { blur: true });
    tx(s, 670, y + 50, 'x̂ — reconstruction', { 'text-anchor': 'middle', 'font-size': 11.5 });
    /* where the two terms attach */
    curve(s, 'M670 ' + (y - 36) + 'C 640 20, 80 20, 50 ' + (y - 38), BLUE, { 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
    tx(s, 360, 30, 'reconstruction term: does x̂ match x?', { 'text-anchor': 'middle', fill: BLUE, 'font-weight': 700, 'font-size': 12 });
    tx(s, 271, y + 84, 'KL term: is N(μ, σ²)', { 'text-anchor': 'middle', fill: AMBER, 'font-weight': 700, 'font-size': 12 });
    tx(s, 271, y + 100, 'close to N(0, I)?', { 'text-anchor': 'middle', fill: AMBER, 'font-weight': 700, 'font-size': 12 });
    E('line', { x1: 271, y1: y + 55, x2: 271, y2: y + 70, stroke: AMBER, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, s);
    /* generating after training */
    box(s, 748, 40, 250, 150, '#fff', SLATE);
    E('rect', { x: 748, y: 40, width: 250, height: 150, rx: 6, fill: 'none', stroke: SLATE, 'stroke-dasharray': '5 4' }, s);
    tx(s, 873, 60, 'after training — generate', { 'text-anchor': 'middle', 'font-weight': 700, fill: SLATE, 'font-size': 11.5 });
    tx(s, 783, 112, 'z ~ N(0, I)', { 'text-anchor': 'middle', 'font-size': 12 });
    arrow(s, 770, 128, 808, 128, INK);
    trap(s, 812, 98, 56, 60, false, '#FDF0DC', AMBER);
    tx(s, 840, 133, 'p_θ', { 'text-anchor': 'middle', 'font-size': 11.5 });
    arrow(s, 870, 128, 890, 128, INK);
    thumb(s, 896, 100, 56, { shape: SHAPE2, blur: true });
    tx(s, 873, 180, 'no encoder, no data, no optimiser', { 'text-anchor': 'middle', 'font-size': 10.5, fill: SLATE });
  }
  function drawReparam() {
    var s = svg(960, 224);
    function panel(x0, good) {
      var c = good ? BLUE : RED, y = 116;
      tx(s, x0 + 220, 22, good ? 'rewrite the draw: z = μ + σ ε' : 'draw z directly', { 'text-anchor': 'middle', 'font-weight': 700, fill: c, 'font-size': 13 });
      E('circle', { cx: x0 + 34, cy: y, r: 20, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, s);
      tx(s, x0 + 34, y + 5, 'φ', { 'text-anchor': 'middle', 'font-size': 15, 'font-style': 'italic' });
      arrow(s, x0 + 55, y, x0 + 86, y, INK);
      box(s, x0 + 88, y - 18, 70, 36, '#fff', INK);
      tx(s, x0 + 123, y + 5, 'μ, σ', { 'text-anchor': 'middle', 'font-size': 13 });
      arrow(s, x0 + 158, y, x0 + 192, y, INK);
      if (good) {
        box(s, x0 + 194, y - 18, 116, 36, '#fff', BLUE);
        tx(s, x0 + 252, y + 5, 'z = μ + σ ε', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
        E('circle', { cx: x0 + 252, cy: y + 66, r: 17, fill: PANEL2, stroke: SLATE }, s);
        tx(s, x0 + 252, y + 70, 'ε', { 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic' });
        tx(s, x0 + 276, y + 71, '~ N(0, 1) — an input', { 'font-size': 11, fill: SLATE });
        arrow(s, x0 + 252, y + 48, x0 + 252, y + 20, SLATE);
      } else {
        ell(s, x0 + 252, y, 62, 20, { fill: '#FBE3E3', stroke: RED, 'stroke-width': 1.4 });
        tx(s, x0 + 252, y + 5, 'z ~ N(μ, σ²)', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
        tx(s, x0 + 252, y + 44, 'a random draw', { 'text-anchor': 'middle', 'font-size': 11, fill: RED });
      }
      arrow(s, x0 + 312, y, x0 + 346, y, INK);
      box(s, x0 + 348, y - 18, 76, 36, '#fff', INK);
      tx(s, x0 + 386, y + 5, 'loss(z)', { 'text-anchor': 'middle', 'font-size': 13 });
      /* the gradient path, backwards above */
      var gy = y - 40;
      if (good) {
        curve(s, 'M' + (x0 + 386) + ' ' + (y - 20) + 'C ' + (x0 + 380) + ' ' + gy + ', ' + (x0 + 60) + ' ' + gy + ', ' + (x0 + 40) + ' ' + (y - 22), BLUE, { 'stroke-width': 2 });
        tx(s, x0 + 220, 48, 'gradient flows:  ∂z/∂μ = 1,  ∂z/∂σ = ε', { 'text-anchor': 'middle', fill: BLUE, 'font-size': 12, 'font-weight': 700 });
      } else {
        E('path', { d: 'M' + (x0 + 386) + ' ' + (y - 20) + 'C ' + (x0 + 380) + ' ' + gy + ', ' + (x0 + 300) + ' ' + gy + ', ' + (x0 + 268) + ' ' + (y - 34),
          fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s);
        E('path', { d: 'M' + (x0 + 254) + ' ' + (y - 48) + 'l14 14m0 -14l-14 14', stroke: RED, 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
        tx(s, x0 + 220, 48, 'gradient stops: what is ∂z/∂μ of a dice roll?', { 'text-anchor': 'middle', fill: RED, 'font-size': 12, 'font-weight': 700 });
      }
    }
    panel(10, false);
    E('line', { x1: 478, x2: 478, y1: 10, y2: 214, stroke: INK, 'stroke-opacity': .15 }, s);
    panel(500, true);
  }

  /* ---------- p. 13: the two terms, one panel each ---------- */
  function drawTerms(k) {
    var W = 340, H = 168, L = 10, Rm = 10, T = 12, B = 26, X0 = -3.4, X1 = 3.4, YM = 1.05;
    var s = svg(W, H), i;
    var PX = function (v) { return L + (v - X0) / (X1 - X0) * (W - L - Rm); };
    var PY = function (v) { return H - B - Math.min(v, YM) / YM * (H - T - B); };
    function path(m, sd, fill, c, dash) {
      var d = '';
      for (i = 0; i <= 300; i++) { var v = X0 + (X1 - X0) * i / 300; d += (i ? 'L' : 'M') + PX(v).toFixed(1) + ' ' + PY(nd(v, m, sd)).toFixed(1); }
      if (fill) E('path', { d: 'M' + PX(X0) + ' ' + PY(0) + d.replace(/^M/, 'L') + 'L' + PX(X1) + ' ' + PY(0) + 'Z', fill: c, 'fill-opacity': .16 }, s);
      E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': dash ? 1.4 : 2, 'stroke-dasharray': dash || 'none' }, s);
    }
    E('line', { x1: L, x2: W - Rm, y1: PY(0), y2: PY(0), stroke: INK, 'stroke-opacity': .3 }, s);
    path(0, 1, true, SLATE, '5 4');
    var cols = [BLUE, AMBER, TEAL];
    var M = k === 3 ? [-0.85, 0.05, 0.9] : [-2.0, 0.3, 2.3], SD = k === 1 ? 0.42 : k === 2 ? 0.06 : 0.5;
    M.forEach(function (m, j) {
      if (k === 2) {
        E('line', { x1: PX(m), x2: PX(m), y1: PY(0), y2: PY(YM) + 2, stroke: cols[j], 'stroke-width': 3 }, s);
        E('path', { d: 'M' + (PX(m) - 4) + ' ' + (PY(YM) + 8) + 'L' + PX(m) + ' ' + (PY(YM)) + 'L' + (PX(m) + 4) + ' ' + (PY(YM) + 8), fill: 'none', stroke: cols[j], 'stroke-width': 2 }, s);
      } else path(m, SD, true, cols[j]);
    });
    if (k === 2) [-1.05, 1.3].forEach(function (z) {
      E('path', { d: 'M' + (PX(z) - 5) + ' ' + (PY(0) - 5) + 'l10 10m0 -10l-10 10', stroke: RED, 'stroke-width': 2.2 }, s);
    });
    if (k === 2) tx(s, PX(-0.85), T + 14, 'prior draws', { 'text-anchor': 'middle', fill: RED, 'font-size': 10.5 });
    if (k === 2) tx(s, PX(-0.85), T + 27, 'land between', { 'text-anchor': 'middle', fill: RED, 'font-size': 10.5 });
    if (k === 1) tx(s, PX(-0.02), PY(nd(0, 0, 1)) - 6, 'prior p(z)', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 10.5 });
    tx(s, W / 2, H - 7, 'code z — three designs, three colours', { 'text-anchor': 'middle', 'font-style': 'italic', fill: INK, 'fill-opacity': .5, 'font-size': 10.5 });
  }

  /* ---------- pp. 16–18: from one code to T codes ---------- */
  var ladderSvg, st = 0;
  function drawLadder() {
    var s = ladderSvg;
    while (s.childNodes.length > 1) s.removeChild(s.lastChild);
    var ROWS = [
      { y: 44, nodes: ['x', 'z'], tag: ['VAE', 'one code; the encoder q_φ is learned'] },
      { y: 128, nodes: ['x', 'z_1', 'z_2'], tag: ['hierarchical VAE', 'codes stacked; every arrow learned'] },
      { y: 216, nodes: ['x_0', 'x_1', 'x_2', '…', 'x_T'], tag: ['diffusion', 'T codes, each the size of x;', 'encoder fixed: add noise; p(x_T) = N(0, I)'] }
    ];
    ROWS.forEach(function (row, r) {
      if (r > st) return;
      var xs = row.nodes.map(function (_, j) { return 70 + j * 132; });
      var diff = r === 2;
      row.nodes.forEach(function (n, j) {
        var cx = xs[j];
        if (n === '…') { tx(s, cx, row.y + 6, '…', { 'text-anchor': 'middle', 'font-size': 20 }); return; }
        if (diff) thumb(s, cx - 20, row.y - 20, 40, { noise: [0, 0.45, 0.7, 0, 1][j], seed: 20 + j });
        else {
          E('circle', { cx: cx, cy: row.y, r: 20, fill: j ? '#fff' : PANEL2, stroke: INK, 'stroke-width': 1.5 }, s);
          tx(s, cx, row.y + 5, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-style': 'italic' });
        }
        if (diff) tx(s, cx, row.y + 38, n, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-style': 'italic' });
      });
      for (var j = 0; j + 1 < xs.length; j++) {
        var a = xs[j] + 24, b = xs[j + 1] - 24;
        curve(s, 'M' + a + ' ' + (row.y + 9) + 'Q' + ((a + b) / 2) + ' ' + (row.y + 24) + ' ' + b + ' ' + (row.y + 9), diff ? SLATE : BLUE, { 'stroke-width': 1.5 });
        curve(s, 'M' + b + ' ' + (row.y - 9) + 'Q' + ((a + b) / 2) + ' ' + (row.y - 24) + ' ' + a + ' ' + (row.y - 9), AMBER, { 'stroke-width': 1.5 });
      }
      if (r === 0) {
        tx(s, 136, row.y - 22, 'decoder p_θ(x|z)', { 'text-anchor': 'middle', fill: AMBER, 'font-size': 11 });
        tx(s, 136, row.y + 34, 'encoder q_φ(z|x)', { 'text-anchor': 'middle', fill: BLUE, 'font-size': 11 });
      }
      if (diff) {
        tx(s, 136, row.y - 30, 'remove noise — learned', { 'text-anchor': 'middle', fill: AMBER, 'font-size': 11 });
        tx(s, 400, row.y - 30, 'add a little noise — fixed', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 11 });
      }
      var tg = 700;
      tx(s, tg, row.y - (row.tag.length > 2 ? 12 : 4), row.tag[0], { 'font-weight': 700, 'font-size': 13, fill: diff ? INK : SLATE });
      row.tag.slice(1).forEach(function (t, q) { tx(s, tg, row.y + 12 - (row.tag.length > 2 ? 8 : 0) + q * 15, t, { 'font-size': 11.5, fill: INK, 'fill-opacity': .72 }); });
    });
  }

  if (MODE === 'goal') drawGoal();
  else if (MODE === 'latent') drawLatent();
  else if (MODE === 'arch') drawArch();
  else if (MODE === 'reparam') drawReparam();
  else if (MODE === 'terms') drawTerms(opts.k || 1);
  else if (MODE === 'ladder') {
    ladderSvg = svg(980, 270);
    var show = function (k) { st = Math.max(0, Math.min(2, k)); drawLadder(); };
    show(0);
    return { steps: 2, step: show, reset: function () { show(0); }, finish: function () { show(2); } };
  }
  return { finish: function () {} };
});
