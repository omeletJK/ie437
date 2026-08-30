/* ============================================================
   widget: latent-beta                              (Chapter 6, Act 3)
   The ELBO's two terms, on a VAE that can be solved in closed form.

   Decoder: x = W z + b + eps, z ~ N(0, I2), eps ~ N(0, s2 I5); a
   "design" is the profile curve whose five sine coefficients are x.
   For a fixed linear-Gaussian decoder the beta-ELBO's optimal Gaussian
   encoder is available exactly:
        m = (W'W + beta s2 I)^-1 W'(x - b)        S = beta s2 (W'W + beta s2 I)^-1
   so every number on this panel is computed, not fitted, and the
   picture is the algebra rather than a sketch of it.

   The claim it earns: along an eigendirection of W'W with eigenvalue w,
        Var(code) = (w^2 + s2 w)/(w + beta s2)^2      Var(blur) = beta s2/(beta s2 + w)
   and their sum differs from 1 by exactly  s2 w (1 - beta)/(w + beta s2)^2,
   which vanishes if and only if beta = 1.  The aggregate posterior
   matches the prior at beta = 1 and at no other value.

   Verified in node (W1 = 1.15, W2 = 0.80, s2 = 0.55, D = 5):
     beta   code sd  blur sd  sum(var)  KL(agg||prior)  recon RMSE
     0.05    1.239    0.175    1.5648      0.12415        0.575
     0.20    1.132    0.334    1.3921      0.06433        0.581
     0.50    0.970    0.486    1.1764      0.01435        0.602
     1.00    0.789    0.615    1.0000      0.00000        0.643
     2.00    0.580    0.737    0.8799      0.00786        0.709
     5.00    0.328    0.862    0.8510      0.01282        0.811
    20.00    0.105    0.959    0.9298      0.00284        0.917
   Reconstruction error is monotone increasing in beta over (0.02, 60);
   KL(aggregate || prior) is minimised at beta = 1.0000 (value 1.2e-11).
   ============================================================ */
IE437.widget('latent-beta', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', AMBER = '#D97706';

  var DIM = 5, S2 = 0.55, SG = Math.sqrt(S2), NW = [1.15, 0.80];
  var BETAS = [0.05, 0.2, 0.5, 1, 2, 5, 20], bi = 3;

  /* ---------- an orthonormal pair of design directions ---------- */
  function nrm(v) { var s = Math.sqrt(v.reduce(function (a, x) { return a + x * x; }, 0));
    return v.map(function (x) { return x / s; }); }
  var u1 = nrm([0.62, 0.34, 0.55, 0.30, 0.32]);
  var raw = [-0.25, 0.86, -0.20, 0.36, 0.12];
  var dot = raw.reduce(function (a, x, i) { return a + x * u1[i]; }, 0);
  var u2 = nrm(raw.map(function (x, i) { return x - dot * u1[i]; }));
  var U = [u1, u2];
  var BASE = [0.95, 0.06, 0.22, 0.03, 0.06];
  function decode(z) {                                     /* W z + b */
    var c = BASE.slice(), j, k;
    for (j = 0; j < 2; j++) for (k = 0; k < DIM; k++) c[k] += NW[j] * z[j] * U[j][k];
    return c;
  }

  /* ---------- the dataset of designs ---------- */
  var R = IE437.rng(opts.seed || 5);
  function gs() { var u = 0, v = 0; while (u === 0) u = R(); while (v === 0) v = R();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var DATA = [], i, k;
  for (i = 0; i < 140; i++) {
    var z = [gs(), gs()], c = decode(z);
    for (k = 0; k < DIM; k++) c[k] += SG * gs();
    DATA.push({ z: z, c: c });
  }
  var SHOW = [3, 27, 61];                                  /* the designs drawn on the right */

  /* ---------- the exact beta-optimal encoder ---------- */
  function enc(c, beta) {                                  /* returns {m:[..], s:[..]} */
    var m = [], s = [], j;
    for (j = 0; j < 2; j++) {
      var w = NW[j] * NW[j], r = 0;
      for (k = 0; k < DIM; k++) r += NW[j] * U[j][k] * (c[k] - BASE[k]);
      m.push(r / (w + beta * S2));
      s.push(Math.sqrt(beta * S2 / (beta * S2 + w)));
    }
    return { m: m, s: s };
  }
  function codeVar(j, beta) { var w = NW[j] * NW[j]; return (w * w + S2 * w) / Math.pow(w + beta * S2, 2); }
  function blurVar(j, beta) { var w = NW[j] * NW[j]; return beta * S2 / (beta * S2 + w); }
  function klAgg(beta) {
    var t = 0, j;
    for (j = 0; j < 2; j++) { var a = codeVar(j, beta) + blurVar(j, beta); t += 0.5 * (a - 1 - Math.log(a)); }
    return t;
  }
  function reconRMSE(beta) {
    var t = (DIM - 2) * S2, j;
    for (j = 0; j < 2; j++) { var w = NW[j] * NW[j], g = w / (w + beta * S2); t += (1 - g) * (1 - g) * (w + S2); }
    return Math.sqrt(t / DIM);
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">an exactly solvable VAE &mdash; the KL weight, turned</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-dn>&minus; KL weight</button>' +
    '<button class="wb" data-val style="min-width:96px"></button>' +
    '<button class="wb" data-up>KL weight +</button></div>' +
    '<div class="wbody" style="flex-direction:column;gap:8px;padding:11px 16px 9px">' +
    '<div style="display:flex;gap:24px;justify-content:center;align-items:flex-start">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><div data-a></div>' +
    '<div style="font:600 10.5px/1.3 var(--mono);letter-spacing:.06em;color:' + SLATE + '">' +
    'THE LATENT CODE &mdash; DOTS ARE DESIGNS, RINGS ARE THE PRIOR</div></div>' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:5px"><div data-b></div>' +
    '<div style="font:600 10.5px/1.3 var(--mono);letter-spacing:.06em;color:' + SLATE + '">' +
    'THREE DESIGNS, AND WHAT THE DECODER RETURNS</div></div></div>' +
    '<div data-num style="font:400 12.5px/1.7 var(--sans);color:var(--ink2);text-align:center"></div>' +
    '</div>';

  var W = 306, H = 244;
  var A = IE437.svg(W, H), B = IE437.svg(W, H);
  host.querySelector('[data-a]').appendChild(A);
  host.querySelector('[data-b]').appendChild(B);

  var LX = 3.4;
  function ax(v) { return W / 2 + v / LX * (W / 2 - 12); }
  function ay(v) { return H / 2 - v / LX * (H / 2 - 12); }
  var RU = (W / 2 - 12) / LX, RV = (H / 2 - 12) / LX;

  function drawLatent(beta) {
    while (A.firstChild) A.removeChild(A.firstChild);
    E('rect', { x: 6, y: 6, width: W - 12, height: H - 12, fill: 'none', stroke: INK, 'stroke-opacity': .2 }, A);
    [1, 2].forEach(function (r) {
      E('ellipse', { cx: ax(0), cy: ay(0), rx: r * RU, ry: r * RV, fill: 'none', stroke: INK,
        'stroke-opacity': .34, 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, A);
    });
    E('text', { x: ax(0) + 2 * RU + 3, y: ay(0) - 3, 'font-size': 9, fill: INK, 'fill-opacity': .45,
      'font-family': 'IBM Plex Mono, monospace', text: 'prior 2sd' }, A);
    E('line', { x1: 6, y1: ay(0), x2: W - 6, y2: ay(0), stroke: INK, 'stroke-opacity': .12 }, A);
    E('line', { x1: ax(0), y1: 6, x2: ax(0), y2: H - 6, stroke: INK, 'stroke-opacity': .12 }, A);

    DATA.forEach(function (d, idx) {
      var e = enc(d.c, beta);
      if (SHOW.indexOf(idx) >= 0) {
        E('ellipse', { cx: ax(e.m[0]), cy: ay(e.m[1]), rx: Math.max(1, e.s[0] * RU), ry: Math.max(1, e.s[1] * RV),
          fill: BLUE, 'fill-opacity': .16, stroke: BLUE, 'stroke-opacity': .5 }, A);
      }
      E('circle', { cx: ax(e.m[0]), cy: ay(e.m[1]), r: SHOW.indexOf(idx) >= 0 ? 3.4 : 2.1,
        fill: SHOW.indexOf(idx) >= 0 ? INK : BLUE, 'fill-opacity': SHOW.indexOf(idx) >= 0 ? .95 : .55 }, A);
    });
    var cs = Math.sqrt((codeVar(0, beta) + codeVar(1, beta)) / 2);
    E('text', { x: 12, y: H - 12, 'font-size': 10, fill: INK, 'fill-opacity': .55,
      'font-family': 'IBM Plex Mono, monospace', text: 'code spread ' + cs.toFixed(2) }, A);
    var bs = Math.sqrt((blurVar(0, beta) + blurVar(1, beta)) / 2);
    E('text', { x: 12, y: H - 24, 'font-size': 10, fill: BLUE, 'fill-opacity': .8,
      'font-family': 'IBM Plex Mono, monospace', text: 'code blur   ' + bs.toFixed(2) }, A);
  }

  function curve(c) {
    var p = [], t, j, v;
    for (j = 0; j <= 64; j++) {
      t = j / 64; v = 0;
      for (k = 0; k < DIM; k++) v += c[k] * Math.sin((k + 1) * Math.PI * t);
      p.push([t, v]);
    }
    return p;
  }
  function drawDesigns(beta) {
    while (B.firstChild) B.removeChild(B.firstChild);
    var YL = -1.5, YH = 3.4, PL = 26, PR = 10, PT = 12, PB = 26;
    function cx(t) { return PL + t * (W - PL - PR); }
    function cy(v) { return H - PB - (v - YL) / (YH - YL) * (H - PT - PB); }
    E('line', { x1: PL, y1: cy(0), x2: W - PR, y2: cy(0), stroke: INK, 'stroke-opacity': .25 }, B);
    E('line', { x1: PL, y1: PT, x2: PL, y2: H - PB, stroke: INK, 'stroke-opacity': .25 }, B);
    E('text', { x: (PL + W - PR) / 2, y: H - 5, 'text-anchor': 'middle', 'font-size': 9, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: 'position along the design' }, B);

    function path(c, col, w2, op, dash) {
      var p = curve(c);
      E('path', { d: 'M' + p.map(function (q) { return cx(q[0]).toFixed(1) + ' ' + cy(q[1]).toFixed(1); }).join('L'),
        fill: 'none', stroke: col, 'stroke-width': w2, 'stroke-opacity': op, 'stroke-dasharray': dash || '' }, B);
    }
    path(BASE, SLATE, 1.6, .5, '5 4');
    SHOW.forEach(function (idx) {
      var d = DATA[idx], e = enc(d.c, beta), rec = decode(e.m);
      path(d.c, INK, 1.5, .32);
      path(rec, BLUE, 2.3, .95);
    });
    E('text', { x: W - PR - 4, y: PT + 11, 'text-anchor': 'end', 'font-size': 10, fill: INK,
      'fill-opacity': .45, text: 'three real designs' }, B);
    E('text', { x: W - PR - 4, y: PT + 24, 'text-anchor': 'end', 'font-size': 10, fill: BLUE,
      'font-weight': 700, text: 'what comes back out' }, B);
    E('text', { x: W - PR - 4, y: PT + 37, 'text-anchor': 'end', 'font-size': 10, fill: SLATE,
      text: 'the average design' }, B);
  }

  function draw() {
    var beta = BETAS[bi];
    drawLatent(beta); drawDesigns(beta);
    var sum = (codeVar(0, beta) + blurVar(0, beta) + codeVar(1, beta) + blurVar(1, beta)) / 2;
    var kl = klAgg(beta), rc = reconRMSE(beta);
    var verdict = beta < 1 ? '<span style="color:' + AMBER + '">the codes spill outside the prior &mdash; ' +
        'draw z from N(0, I) and the decoder lands where it was never trained</span>'
      : beta > 1 ? '<span style="color:' + AMBER + '">the codes are collapsing toward the origin &mdash; ' +
        'the blur has swallowed them and every design decodes to the average one</span>'
      : '<span style="color:' + BLUE + '">the aggregate code <b>is</b> the prior, exactly &mdash; ' +
        'every z the decoder will ever be handed is a z it has seen</span>';
    host.querySelector('[data-val]').textContent = 'beta = ' + (beta < 1 ? beta.toFixed(2) : beta.toFixed(0));
    host.querySelector('[data-num]').innerHTML =
      'code spread<sup>2</sup> <b>' + (sum - (blurVar(0, beta) + blurVar(1, beta)) / 2).toFixed(3) + '</b>' +
      ' &nbsp;+&nbsp; code blur<sup>2</sup> <b>' + ((blurVar(0, beta) + blurVar(1, beta)) / 2).toFixed(3) + '</b>' +
      ' &nbsp;=&nbsp; <b style="color:' + (Math.abs(sum - 1) < 1e-9 ? BLUE : INK) + '">' + sum.toFixed(4) + '</b>' +
      ' &nbsp;&middot;&nbsp; KL(aggregate &#8214; prior) <b>' + kl.toFixed(4) + '</b>' +
      ' &nbsp;&middot;&nbsp; reconstruction <b>' + rc.toFixed(3) + '</b><br>' + verdict;
  }

  host.querySelector('[data-up]').onclick = function () { bi = Math.min(BETAS.length - 1, bi + 1); draw(); };
  host.querySelector('[data-dn]').onclick = function () { bi = Math.max(0, bi - 1); draw(); };

  draw();
  return { finish: function () { bi = 3; draw(); } };
});
