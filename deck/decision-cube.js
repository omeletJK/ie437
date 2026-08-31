/* ============================================================
   decision-cube — the landing page's hero figure.

   Ported from ie437-platform's components/brand/DecisionCube.tsx
   (React) to plain DOM, and corrected for the v3 spine: the course
   crosses the model axis and then the stages axis and stops. The
   agents axis is drawn but never travelled — that corner is IE579's,
   which is exactly what Lecture 12 closes on. Drag or arrow-key to
   rotate; it drifts on its own, and the loop stops dead whenever the
   figure is off-screen or the tab is hidden.
   ============================================================ */
(function () {
  'use strict';
  var host = document.querySelector('[data-cube]');
  if (!host) return;

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  var set = function (e, a) { for (var k in a) e.setAttribute(k, a[k]); return e; };

  var TAU = Math.PI * 2, rad = function (d) { return d * Math.PI / 180; };
  var BASE_YAW = rad(33), BASE_PITCH = rad(20);
  var CX = 290, CY = 252, S = 124;

  /* the eight decision-problem classes */
  var C = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];
  /* The two axes the course crosses are laid on the near face and the one it
     never crosses recedes, so the whole route stays in front of the wireframe
     and the road not taken visibly leaves the picture. */
  var ORIGIN = 4;   // static · model-based · single       — Lecture 1
  var GOAL = 6;     // dynamic · data-driven · single      — where IE437 ends
  var BEYOND = 2;   // dynamic · data-driven · multi       — IE579's corner

  /* the three edges meeting at ORIGIN are drawn separately, as coloured axes */
  var EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [5, 6], [6, 7], [1, 5], [2, 6], [3, 7]];

  var FACES = [
    { pts: [0, 1, 2, 3], n: [0, 0, -1] }, { pts: [4, 5, 6, 7], n: [0, 0, 1] },
    { pts: [0, 1, 5, 4], n: [0, -1, 0] }, { pts: [3, 2, 6, 7], n: [0, 1, 0] },
    { pts: [0, 3, 7, 4], n: [-1, 0, 0] }, { pts: [1, 2, 6, 5], n: [1, 0, 0] }
  ];

  var AXES = [
    { tip: [1.5, -1, 1], name: 'MODEL', to: 'data-driven', color: 'var(--amber)', up: false },
    { tip: [-1, 1.5, 1], name: 'STAGES', to: 'dynamic', color: 'var(--teal)', up: true },
    { tip: [-1, -1, -1.5], name: 'AGENTS', to: 'multi-agent', color: 'var(--plum)',
      up: false, faded: true }
  ];

  /* the route the course actually takes: model first, then stages */
  var PATH = [C[ORIGIN], C[5], C[GOAL]];
  var SEG = ['var(--amber)', 'var(--teal)'];

  function proj(p, yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    var cp = Math.cos(pitch), sp = Math.sin(pitch);
    var y2 = p[1] * cp - z1 * sp;
    var zs = (p[1] * sp + z1 * cp) * 0.8;
    var f = 6 / (6 - zs);
    return { x: CX + x1 * S * f, y: CY - y2 * S * f, zs: zs, f: f };
  }
  var depth01 = function (zs) { return (zs + 1.6) / 3.2; };
  var clampPitch = function (v) { return Math.min(rad(50), Math.max(rad(4), v)); };

  /* eased position along the two segments, holding at the end before looping */
  function travel(t) {
    var p = (t % 9) / 9;
    var e = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, p / 0.78));
    var s = Math.min(1.999, e * 2), seg = Math.floor(s), f = s - seg;
    var a = PATH[seg], b = PATH[seg + 1];
    return { pos: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], seg: seg };
  }

  /* ---------- build once, then only ever update attributes ---------- */
  var svg = el('svg', {
    viewBox: '-96 -10 792 548', role: 'img', tabindex: '0',
    'aria-label': 'The decision cube: three axes — stages, model, decision makers — forming eight ' +
      'classes of decision problem. IE437 travels from the static, model-based, single-agent corner ' +
      'across the model axis and then the stages axis. Drag or use the arrow keys to rotate.'
  }, host);

  var defs = el('defs', {}, svg);
  var g1 = el('radialGradient', { id: 'dcGlow' }, defs);
  el('stop', { offset: '0%', 'stop-color': 'var(--teal-200)', 'stop-opacity': '.40' }, g1);
  el('stop', { offset: '65%', 'stop-color': 'var(--teal-200)', 'stop-opacity': '.13' }, g1);
  el('stop', { offset: '100%', 'stop-color': 'var(--teal-200)', 'stop-opacity': '0' }, g1);
  var g2 = el('radialGradient', { id: 'dcShadow' }, defs);
  el('stop', { offset: '0%', 'stop-color': 'var(--ink)', 'stop-opacity': '.16' }, g2);
  el('stop', { offset: '100%', 'stop-color': 'var(--ink)', 'stop-opacity': '0' }, g2);
  var pat = el('pattern', { id: 'dcDots', width: 22, height: 22, patternUnits: 'userSpaceOnUse' }, defs);
  el('circle', { cx: 1.5, cy: 1.5, r: 1.1, fill: 'var(--ink)', opacity: .07 }, pat);
  AXES.forEach(function (ax, i) {
    var m = el('marker', { id: 'dcArrow' + i, viewBox: '0 0 10 10', refX: 7, refY: 5,
      markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', fill: ax.color, 'fill-opacity': ax.faded ? .5 : 1 }, m);
  });

  el('circle', { cx: CX, cy: CY, r: 240, fill: 'url(#dcGlow)' }, svg);
  el('circle', { cx: CX, cy: CY, r: 212, fill: 'url(#dcDots)' }, svg);
  el('circle', { cx: CX, cy: CY, r: 212, fill: 'none', stroke: 'var(--line)' }, svg);
  el('ellipse', { cx: CX, cy: 462, rx: 142, ry: 14, fill: 'url(#dcShadow)' }, svg);

  var faceEls = FACES.map(function () { return el('polygon', { fill: 'var(--teal-d)' }, svg); });
  /* the axis this course never crosses, shown as the road not taken */
  var beyondEl = el('line', { stroke: 'var(--plum)', 'stroke-width': 1.8, 'stroke-dasharray': '2 7',
    'stroke-linecap': 'round', opacity: .5 }, svg);
  var pathEls = SEG.map(function (c) {
    return el('line', { stroke: c, 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: .9 }, svg);
  });
  var edgeEls = EDGES.map(function () { return el('line', { stroke: 'var(--ink)' }, svg); });
  var axisEls = AXES.map(function (ax, i) {
    return el('line', { stroke: ax.color, 'stroke-width': 1.9, opacity: ax.faded ? .5 : 1,
      'marker-end': 'url(#dcArrow' + i + ')' }, svg);
  });
  var vertEls = C.map(function () {
    return el('circle', { fill: 'var(--raised)', stroke: 'var(--ink2)', 'stroke-width': 1.2 }, svg);
  });
  var beyondDot = el('circle', { fill: 'none', stroke: 'var(--plum)', 'stroke-width': 1.4, opacity: .55 }, svg);
  var originDot = el('circle', { fill: 'var(--ink)' }, svg);
  var goalRing = el('circle', { fill: 'none', stroke: 'var(--teal-l)', 'stroke-width': 1.5 }, svg);
  var goalDot = el('circle', { fill: 'var(--teal)' }, svg);
  var travDim = el('circle', { opacity: .16 }, svg);
  var travDot = el('circle', {}, svg);

  var lab = AXES.map(function (ax) {
    var g = el('g', { class: 'mono' }, svg);
    return {
      name: el('text', { 'font-size': 15, 'letter-spacing': '.14em', fill: 'var(--ink2)',
        'fill-opacity': ax.faded ? .62 : 1, text: ax.name }, g),
      to: el('text', { 'font-size': 21, fill: ax.color, 'fill-opacity': ax.faded ? .68 : 1, text: ax.to }, g)
    };
  });
  var gT = el('g', { class: 'mono' }, svg);
  var oLab1 = el('text', { 'text-anchor': 'middle', 'font-size': 16, fill: 'var(--ink2)',
    text: 'static · model-based · single' }, gT);
  var oLab2 = el('text', { 'text-anchor': 'middle', 'font-size': 14, 'letter-spacing': '.14em',
    fill: 'var(--ink2)', 'fill-opacity': .72, text: 'LECTURE 1' }, gT);
  var gLab = el('text', { 'font-size': 16, 'font-weight': 600, fill: 'var(--ink)',
    'text-anchor': 'middle', text: 'Reinforcement Learning' }, gT);
  var bLab = el('text', { 'font-size': 14, 'letter-spacing': '.12em', fill: 'var(--plum)',
    'fill-opacity': .75, text: 'IE579' }, gT);

  /* ---------- draw ---------- */
  function draw(yaw, pitch, t) {
    var P = C.map(function (v) { return proj(v, yaw, pitch); });
    var op = P[ORIGIN], gp = P[GOAL], bp = P[BEYOND];

    FACES.map(function (fa, i) {
      var z1 = -fa.n[0] * Math.sin(yaw) + fa.n[2] * Math.cos(yaw);
      var nz = fa.n[1] * Math.sin(pitch) + z1 * Math.cos(pitch);
      var zAvg = fa.pts.reduce(function (s, k) { return s + P[k].zs; }, 0) / 4;
      return { i: i, fa: fa, nz: nz, zAvg: zAvg };
    }).sort(function (a, b) { return a.zAvg - b.zAvg; }).forEach(function (f, order) {
      var e = faceEls[f.i];
      set(e, { points: f.fa.pts.map(function (k) { return P[k].x + ',' + P[k].y; }).join(' '),
        opacity: 0.03 + 0.07 * Math.max(0, f.nz) });
      /* far faces first: reorder so the near ones paint last */
      if (svg.children[4 + order] !== e) svg.insertBefore(e, svg.children[4 + order]);
    });

    var PP = PATH.map(function (v) { return proj(v, yaw, pitch); });
    pathEls.forEach(function (e, i) {
      set(e, { x1: PP[i].x, y1: PP[i].y, x2: PP[i + 1].x, y2: PP[i + 1].y });
    });
    set(beyondEl, { x1: gp.x, y1: gp.y, x2: bp.x, y2: bp.y });

    EDGES.forEach(function (e, i) {
      var d = depth01((P[e[0]].zs + P[e[1]].zs) / 2);
      set(edgeEls[i], { x1: P[e[0]].x, y1: P[e[0]].y, x2: P[e[1]].x, y2: P[e[1]].y,
        'stroke-width': 1 + 0.6 * d, opacity: 0.12 + 0.3 * d });
    });

    AXES.forEach(function (ax, i) {
      var tp = proj(ax.tip, yaw, pitch);
      set(axisEls[i], { x1: op.x, y1: op.y, x2: tp.x, y2: tp.y });
      var L = lab[i];
      if (ax.up) {
        set(L.name, { x: tp.x - 13, y: tp.y - 26, 'text-anchor': 'end' });
        set(L.to, { x: tp.x - 13, y: tp.y - 3, 'text-anchor': 'end' });
      } else {
        var right = tp.x >= CX, dx = right ? 11 : -11, anchor = right ? 'start' : 'end';
        set(L.name, { x: tp.x + dx, y: tp.y - 11, 'text-anchor': anchor });
        set(L.to, { x: tp.x + dx, y: tp.y + 12, 'text-anchor': anchor });
      }
    });

    P.forEach(function (p, i) {
      var hide = (i === ORIGIN || i === GOAL);
      set(vertEls[i], { cx: p.x, cy: p.y, r: hide ? 0 : 3 * p.f, opacity: hide ? 0 : 0.35 + 0.55 * depth01(p.zs) });
    });
    set(beyondDot, { cx: bp.x, cy: bp.y, r: 5 * bp.f });
    set(originDot, { cx: op.x, cy: op.y, r: 4.5 * op.f });
    var pulse = (t * 0.7) % 1;
    set(goalRing, { cx: gp.x, cy: gp.y, r: 6 + 11 * pulse, opacity: 0.5 * (1 - pulse) });
    set(goalDot, { cx: gp.x, cy: gp.y, r: 4.5 * gp.f });

    var d = travel(t), dp = proj(d.pos, yaw, pitch);
    set(travDim, { cx: dp.x, cy: dp.y, r: t > 0 ? 9 * dp.f : 0, fill: SEG[d.seg] });
    set(travDot, { cx: dp.x, cy: dp.y, r: t > 0 ? 3.4 * dp.f : 0, fill: SEG[d.seg] });

    set(oLab1, { x: op.x, y: op.y + 28 });
    set(oLab2, { x: op.x, y: op.y + 48 });
    set(gLab, { x: gp.x, y: gp.y - 17 });
    var br = bp.x >= CX;
    set(bLab, { x: bp.x + (br ? 12 : -12), y: bp.y - 8, 'text-anchor': br ? 'start' : 'end' });
  }

  /* ---------- small screens ----------------------------------------
     The figure scales as one piece, so at phone width every label would
     land near 6px. Rather than shrink it, drop the uppercase axis names
     — the arrow and its colour already say which axis is which — and set
     what remains large enough to read. */
  var WIDE = '-96 -10 792 548', NARROW = '-186 -10 992 548';
  var small = null;
  function responsive() {
    var w = svg.getBoundingClientRect().width;
    if (!w) return;
    var now = w < 400;   // phones only — the hero column on a laptop is ~460
    if (now === small) return;
    small = now;
    /* a wider frame at phone size: the labels grow, so they need the room */
    svg.setAttribute('viewBox', now ? NARROW : WIDE);
    lab.forEach(function (L) {
      L.name.style.display = now ? 'none' : '';
      L.to.setAttribute('font-size', now ? 32 : 21);
    });
    /* only the three axes and the destination survive the narrow frame */
    oLab1.style.display = now ? 'none' : '';
    oLab2.style.display = now ? 'none' : '';
    bLab.style.display = now ? 'none' : '';
    gLab.setAttribute('font-size', now ? 26 : 16);
  }

  /* ---------- pose, drag, and a loop that stops when unseen ---------- */
  var drag = { on: false, x: 0, y: 0, dYaw: 0, dPitch: 0 };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0, running = false, last = 0, t = 0, visible = true;

  function step(now) {
    raf = requestAnimationFrame(step);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!drag.on) {
      drag.dYaw *= 0.94; drag.dPitch *= 0.94;
      if (Math.abs(drag.dYaw) < 1e-4) drag.dYaw = 0;
      if (Math.abs(drag.dPitch) < 1e-4) drag.dPitch = 0;
    }
    if (reduce.matches) {
      draw(BASE_YAW + drag.dYaw, clampPitch(BASE_PITCH + drag.dPitch), 0);
      if (!drag.on && drag.dYaw === 0 && drag.dPitch === 0) stop();
      return;
    }
    t += dt;
    draw(BASE_YAW + drag.dYaw + rad(8) * Math.sin(t * TAU / 16),
         clampPitch(BASE_PITCH + drag.dPitch + rad(2.5) * Math.sin(t * TAU / 11)), t);
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(step); }
  function stop() { if (!running) return; running = false; cancelAnimationFrame(raf); }
  function sync() { (visible && !document.hidden) ? start() : stop(); }

  svg.addEventListener('pointerdown', function (e) {
    if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId);
    drag.on = true; drag.x = e.clientX; drag.y = e.clientY; sync();
  });
  svg.addEventListener('pointermove', function (e) {
    if (!drag.on) return;
    drag.dYaw += (e.clientX - drag.x) * 0.006;
    drag.dPitch += (e.clientY - drag.y) * 0.005;
    drag.x = e.clientX; drag.y = e.clientY;
  });
  var up = function () { drag.on = false; };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('keydown', function (e) {
    var K = 0.09;
    if (e.key === 'ArrowLeft') drag.dYaw -= K;
    else if (e.key === 'ArrowRight') drag.dYaw += K;
    else if (e.key === 'ArrowUp') drag.dPitch -= K;
    else if (e.key === 'ArrowDown') drag.dPitch += K;
    else return;
    e.preventDefault(); sync();
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (en) { visible = en[0] ? en[0].isIntersecting : true; sync(); }).observe(svg);
  }
  document.addEventListener('visibilitychange', sync);
  if (window.ResizeObserver) new ResizeObserver(responsive).observe(svg);
  else addEventListener('resize', responsive);
  responsive();
  draw(BASE_YAW, BASE_PITCH, 0);
  sync();
})();
