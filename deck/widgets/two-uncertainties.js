/* ============================================================
   widget: two-uncertainties
   The distinction of Lecture 0, made arithmetic. Samples come from
   y ~ N(MU, SIGMA^2). Two bands are drawn over the same picture:

     aleatoric   MU +/- SIGMA          the world's own spread — fixed
     epistemic   ybar +/- 2*SIGMA/sqrt(n)   the standard error — shrinks

   Drag n and only one of them moves. That is the whole lesson: data
   buys down what we do not know and buys nothing against what the
   world does not decide until it happens.

   Ported from ie437-platform's UncertaintySim, redrawn in the deck's
   own language: same claim, deck chrome, deterministic seed.
   ============================================================ */
IE437.widget('two-uncertainties', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B';
  var MU = 0, SIGMA = 0.6, NMAX = 200;
  var n = Math.max(3, Math.min(NMAX, opts.n || 8));

  /* one fixed cloud; changing n reveals a prefix of it, so the picture
     never reshuffles under the drag */
  var rand = IE437.rng(opts.seed || 437);
  var PTS = [], i;
  for (i = 0; i < NMAX; i++) {
    var u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    /* x is its own random draw, not the index: a prefix of the cloud must still
       span the full width, or shrinking n would huddle the points to the left */
    PTS.push({ x: rand(), y: MU + SIGMA * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) });
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Data buys down one of these, and never the other</span>' +
    '<span class="wspacer"></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="gap:10px"><div data-c></div>' +
    '<div data-read style="text-align:center;font:400 13px/1.5 var(--sans);color:var(--ink2)"></div></div>';

  var W = 760, H = 268, P = { l: 46, r: 168, t: 16, b: 30 };
  var svg = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(svg);

  var Y0 = -2.1, Y1 = 2.1;
  var X = function (t) { return P.l + t * (W - P.l - P.r); };
  var Y = function (y) { return H - P.b - (y - Y0) / (Y1 - Y0) * (H - P.t - P.b); };

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var used = PTS.slice(0, n);
    var mean = 0, k;
    for (k = 0; k < n; k++) mean += used[k].y;
    mean /= n;
    var se = SIGMA / Math.sqrt(n);

    /* aleatoric: the world's own sigma — drawn first, and it never moves */
    E('rect', { x: X(0), y: Y(MU + SIGMA), width: X(1) - X(0), height: Y(MU - SIGMA) - Y(MU + SIGMA),
      fill: AMBER, 'fill-opacity': .13 }, svg);
    /* epistemic: two standard errors about the estimate */
    E('rect', { x: X(0), y: Y(mean + 2 * se), width: X(1) - X(0),
      height: Math.max(1.5, Y(mean - 2 * se) - Y(mean + 2 * se)), fill: BLUE, 'fill-opacity': .3 }, svg);

    E('line', { x1: X(0), x2: X(1), y1: Y(MU), y2: Y(MU), stroke: INK,
      'stroke-width': 1.2, 'stroke-dasharray': '5 3', 'stroke-opacity': .55 }, svg);
    E('line', { x1: X(0), x2: X(1), y1: Y(mean), y2: Y(mean), stroke: BLUE, 'stroke-width': 2 }, svg);

    used.forEach(function (p) {
      E('circle', { cx: X(p.x), cy: Y(p.y), r: 2.5, fill: SLATE, 'fill-opacity': .6 }, svg);
    });

    /* axis */
    E('line', { x1: P.l, x2: P.l, y1: P.t, y2: H - P.b, stroke: 'currentColor', 'stroke-opacity': .28 }, svg);
    [-2, -1, 0, 1, 2].forEach(function (t) {
      E('text', { x: P.l - 7, y: Y(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: 'currentColor',
        'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: t }, svg);
    });

    /* legend */
    var lx = W - P.r + 14, ly = P.t + 22;
    var row = function (y, colour, op, label, dash) {
      if (dash) E('line', { x1: lx, x2: lx + 13, y1: y, y2: y, stroke: colour, 'stroke-width': 1.4,
        'stroke-dasharray': '4 3', 'stroke-opacity': .7 }, svg);
      else E('rect', { x: lx, y: y - 6, width: 13, height: 12, fill: colour, 'fill-opacity': op }, svg);
      E('text', { x: lx + 20, y: y + 3.5, 'font-size': 10.5, fill: 'currentColor', 'fill-opacity': .78,
        'font-family': 'IBM Plex Mono, monospace', text: label }, svg);
    };
    row(ly, BLUE, .3, 'epistemic');
    row(ly + 21, AMBER, .13, 'aleatoric');
    row(ly + 42, BLUE, 1, 'estimate');
    row(ly + 63, INK, 1, 'true μ', true);

    host.querySelector('[data-read]').innerHTML =
      'epistemic <b style="color:' + BLUE + '">2·SE = ' + (2 * se).toFixed(3) +
      '</b>, shrinking like 1/√n &nbsp;·&nbsp; aleatoric <b style="color:' + AMBER + '">σ = ' +
      SIGMA.toFixed(2) + '</b>, unchanged at every n';
  }

  var dial = IE437.slider(host.querySelector('[data-sl]'), {
    label: 'samples', min: 3, max: NMAX, step: 1, value: n,
    fmt: function (v) { return 'n = ' + v; },
    on: function (v) { n = v; draw(); }
  });

  draw();
  /* the printed slide should show the band already collapsed */
  return { finish: function () { dial.set(NMAX); } };
});
