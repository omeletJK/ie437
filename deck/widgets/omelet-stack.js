/* ============================================================
   widget: omelet-stack
   The architecture slide of the source deck, redrawn and set in
   motion. The still version lights one path and leaves it lit,
   which shows the layering but not the claim: that the SAME
   foundation model and the SAME solver are reused across
   operations. So the paths light one after another — scheduling
   to a crew roster, then routing to a dispatch board, and so on —
   and the reuse is something you watch happen rather than read.
   ============================================================ */
IE437.widget('omelet-stack', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', PURPLE = '#6D4AFF', GREEN = '#16A34A', TEAL = '#0F9D8A';
  var GHOST = .30;                       // everything not on the live path

    /* The slide gives a widget 1152 x 528, and this one shares it with a
     caption and a revealed paragraph. 1140 x 320 is what is left — still
     far wider than the 810px still it replaces, which is where the gain
     in legibility comes from. */
  var W = 1140, H = 320;

  var COLS = [
    { x: 22, kick: 'OPTIMIZATION AI', name: 'FOUNDATION MODEL', c: INK },
    { x: 250, kick: 'PROBLEM-CLASS', name: 'SOLVER APIS', c: INK },
    { x: 520, kick: 'DOMAIN-SPECIFIC', name: 'OCP SERVERS', c: PURPLE },
    { x: 800, kick: 'OI', name: 'APPLICATIONS', c: INK }
  ];

  var SOLVERS = [
    { n: 'Routing', cy: 85 }, { n: 'Scheduling', cy: 147 },
    { n: 'Packaging', cy: 209 }, { n: 'Inventory Control', cy: 271 }
  ];
  var OCPS = [
    { n: 'TMS', cy: 60, s: 0 }, { n: 'Delivery', cy: 94, s: 0 },
    { n: 'Crew Scheduling', cy: 128, s: 1 }, { n: 'Nurse Scheduling', cy: 162, s: 1 },
    { n: 'Stowage Planning', cy: 196, s: 2 }, { n: '3D Bin-Packing', cy: 230, s: 2 },
    { n: 'Retail Inventory', cy: 264, s: 3 }, { n: 'Demand Prediction', cy: 298, s: 3 }
  ];
  /* the apps hang off their own OCP server, so nothing has to be
     re-measured when the column spacing changes */
  var APPS = [
    { o: 0, x: 800, dy: -11 }, { o: 0, x: 846, dy: 5 },
    { o: 1, x: 800, dy: -11 }, { o: 1, x: 846, dy: 5 },
    { o: 2, x: 800, dy: -11 }, { o: 2, x: 846, dy: 5 },
    { o: 3, x: 800, dy: -11 }, { o: 4, x: 846, dy: -5 },
    { o: 5, x: 800, dy: -11 }, { o: 5, x: 846, dy: 5 },
    { o: 6, x: 800, dy: -11 }, { o: 7, x: 800, dy: -11 }, { o: 7, x: 846, dy: 5 }
  ].map(function (a) { a.y = OCPS[a.o].cy + a.dy; return a; });

  /* the four operations the same stack serves, in the order they play */
  var ROUTES = [
    { s: 1, o: 2, a: 4, say: 'scheduling → crew scheduling → the roster app' },
    { s: 0, o: 1, a: 2, say: 'routing → delivery → the dispatch board' },
    { s: 2, o: 5, a: 8, say: 'packaging → 3D bin-packing → the load planner' },
    { s: 3, o: 7, a: 11, say: 'inventory → demand prediction → the replenishment desk' }
  ];

  host.innerHTML =
    '<div class="wbar"><span class="wt">One model, many operations</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">path</span><span class="wnum" data-say style="min-width:330px"></span>' +
    '<button class="wb" data-play></button>' +
    '<button class="wb" data-next>next &rsaquo;</button></div>' +
    '<div class="wbody"><div data-c></div></div>';

  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  var curve = function (x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
  };

  /* ---- the operational substrate everything on the right sits in ---- */
  E('rect', { x: 502, y: 40, width: 632, height: 274, rx: 9, fill: GREEN,
    'fill-opacity': .04, stroke: GREEN, 'stroke-opacity': .45, 'stroke-dasharray': '5 4' }, sv);

  COLS.forEach(function (c) {
    E('text', { x: c.x, y: 15, 'font-size': 8.5, 'letter-spacing': 1.2, fill: 'var(--ink3)',
      'font-family': 'IBM Plex Mono, monospace', text: c.kick }, sv);
    E('text', { x: c.x, y: 32, 'font-size': 12.5, 'font-weight': 700, 'letter-spacing': .2,
      fill: c.c, 'font-family': 'Inter, sans-serif', text: c.name }, sv);
  });

  /* ---- links, drawn faint and left that way ---- */
  var linkEls = [];
  function link(d) { linkEls.push(E('path', { d: d, fill: 'none', stroke: INK,
    'stroke-opacity': .16, 'stroke-width': 1 }, sv)); }
  SOLVERS.forEach(function (s) { link(curve(222, 179, 250, s.cy)); });
  OCPS.forEach(function (o) { link(curve(426, SOLVERS[o.s].cy, 520, o.cy)); });
  APPS.forEach(function (a) { link(curve(716, OCPS[a.o].cy, a.x, a.y + 11)); });

  /* ---- the live path: three segments, re-pointed on every route ---- */
  var hi = [PURPLE, PURPLE, GREEN].map(function (c) {
    return E('path', { d: 'M0 0', fill: 'none', stroke: c, 'stroke-width': 2.4,
      'stroke-linecap': 'round', 'stroke-dasharray': '6 5' }, sv);
  });

  /* ---- boxes ---- */
  function box(x, y, w, h, title, sub, accent) {
    var g = E('g', {}, sv);
    var r = E('rect', { x: x, y: y, width: w, height: h, rx: 9, fill: 'var(--paper)',
      stroke: INK, 'stroke-opacity': .16, 'stroke-width': 1.2 }, g);
    var ic = E('rect', { x: x + 10, y: y + (h - 20) / 2, width: 20, height: 20, rx: 6,
      fill: accent, 'fill-opacity': .10 }, g);
    E('circle', { cx: x + 20, cy: y + h / 2, r: 3.2, fill: accent, 'fill-opacity': .55 }, g);
    var t = E('text', { x: x + 39, y: y + (sub ? h / 2 - 1 : h / 2 + 4), 'font-size': 12.5,
      'font-weight': 600, fill: INK, 'font-family': 'Inter, sans-serif', text: title }, g);
    if (sub) E('text', { x: x + 39, y: y + h / 2 + 11, 'font-size': 9, fill: 'var(--ink3)',
      'font-family': 'IBM Plex Mono, monospace', text: sub }, g);
    return { g: g, rect: r, icon: ic, title: t, accent: accent };
  }

  var fmEl = box(22, 159, 200, 40, 'Foundation Model', '', PURPLE);
  var solverEls = SOLVERS.map(function (s) { return box(250, s.cy - 18, 176, 36, s.n, 'Solver', PURPLE); });
  var ocpEls = OCPS.map(function (o) { return box(520, o.cy - 15, 196, 30, o.n, 'OCP Server', PURPLE); });
  var appEls = APPS.map(function (a) {
    var g = E('g', {}, sv);
    var r = E('rect', { x: a.x, y: a.y, width: 22, height: 22, rx: 6, fill: 'var(--paper)',
      stroke: INK, 'stroke-opacity': .16, 'stroke-width': 1.2 }, g);
    E('circle', { cx: a.x + 11, cy: a.y + 11, r: 3.2, fill: GREEN, 'fill-opacity': .5 }, g);
    return { g: g, rect: r, accent: GREEN };
  });

  /* ---- the platform this all runs on ---- */
  var oip = E('g', {}, sv);
  var RX = 1118;
  E('text', { x: RX, y: 148, 'text-anchor': 'end', 'font-size': 21, 'font-weight': 700,
    fill: TEAL, 'font-family': 'Inter, sans-serif', text: 'OIP' }, oip);
  E('text', { x: RX, y: 165, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 600,
    fill: TEAL, 'font-family': 'Inter, sans-serif', text: 'Operational Intelligence Platform' }, oip);
  ['Deploy · Connect · Monitor · Govern', 'Secure · Evaluate · Remember · Improve']
    .forEach(function (t, i) {
      E('text', { x: RX, y: 188 + i * 13, 'text-anchor': 'end', 'font-size': 9, fill: 'var(--ink3)',
        'font-family': 'IBM Plex Mono, monospace', text: t }, oip);
    });
  [['One platform ·', INK], ['every OCP ·', INK], ['one substrate', TEAL]].forEach(function (p, i) {
    E('text', { x: RX, y: 226 + i * 16, 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700,
      fill: p[1], 'font-family': 'Inter, sans-serif', text: p[0] }, oip);
  });

  /* ---- lighting ------------------------------------------------------
     Everything sits ghosted; the live route is brought up to full and its
     three segments are drawn in, one after the other.                   */
  function lite(el, on) {
    el.g.setAttribute('opacity', on ? 1 : GHOST);
    el.rect.setAttribute('stroke', on ? el.accent : INK);
    el.rect.setAttribute('stroke-opacity', on ? .85 : .16);
    el.rect.setAttribute('stroke-width', on ? 1.8 : 1.2);
  }

  var ri = 0, t0 = 0, playing = true, raf = 0, frozen = false;
  var SEG = .55, HOLD = 1.5, FADE = .5, SPAN = SEG * 3 + HOLD + FADE;

  function place(r) {
    var s = SOLVERS[r.s], o = OCPS[r.o], a = APPS[r.a];
    hi[0].setAttribute('d', curve(222, 179, 250, s.cy));
    hi[1].setAttribute('d', curve(426, s.cy, 520, o.cy));
    hi[2].setAttribute('d', curve(716, o.cy, a.x, a.y + 11));
    hi.forEach(function (p) { var L = p.getTotalLength(); p.__L = L;
      p.setAttribute('stroke-dasharray', L); });
    host.querySelector('[data-say]').textContent = r.say;
  }

  function paint(p) {                    // p = 0..1 through the route
    var r = ROUTES[ri];
    var fade = p > (SEG * 3 + HOLD) / SPAN ? 1 - (p * SPAN - SEG * 3 - HOLD) / FADE : 1;
    hi.forEach(function (e, i) {
      var q = Math.max(0, Math.min(1, (p * SPAN - i * SEG) / SEG));
      e.setAttribute('stroke-dashoffset', e.__L * (1 - q));
      e.setAttribute('opacity', fade);
    });
    var q1 = p * SPAN > SEG * 0.5, q2 = p * SPAN > SEG * 1.5, q3 = p * SPAN > SEG * 2.5;
    lite(fmEl, true);
    solverEls.forEach(function (e, i) { lite(e, i === r.s && q1); });
    ocpEls.forEach(function (e, i) { lite(e, i === r.o && q2); });
    appEls.forEach(function (e, i) { lite(e, i === r.a && q3); });
    if (fade < 1) {
      [solverEls[r.s], ocpEls[r.o], appEls[r.a]].forEach(function (e) {
        e.g.setAttribute('opacity', GHOST + (1 - GHOST) * fade);
      });
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!t0) t0 = now;
    var p = ((now - t0) / 1000) / SPAN;
    if (p >= 1) { ri = (ri + 1) % ROUTES.length; t0 = now; place(ROUTES[ri]); p = 0; }
    paint(p);
  }
  function run() { if (raf || frozen) return; t0 = 0; raf = requestAnimationFrame(frame); }
  function halt() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function setBtn() { host.querySelector('[data-play]').innerHTML = playing ? '&#10073;&#10073; pause' : '&#9654; play'; }

  host.querySelector('[data-play]').onclick = function () {
    playing = !playing; setBtn(); playing ? run() : halt();
  };
  host.querySelector('[data-next]').onclick = function () {
    halt(); frozen = false; ri = (ri + 1) % ROUTES.length; place(ROUTES[ri]);
    if (playing) run(); else paint(SEG * 3 / SPAN);
  };

  setBtn();
  place(ROUTES[0]);
  paint(0);

  return {
    enter: function () { if (playing && !frozen) run(); },
    leave: halt,
    /* the PDF gets the path the caption names, fully lit */
    finish: function () {
      halt(); frozen = true;
      ri = opts && opts.route != null ? opts.route : 0;
      place(ROUTES[ri]); paint((SEG * 3 + HOLD * .5) / SPAN);
    }
  };
});
