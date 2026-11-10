/* ============================================================
   widget: deadly-triad
   Tsitsiklis & Van Roy's two-state counterexample, wired to the
   three switches. Every reward is 0, so the true value is 0
   everywhere. Turn on all three ingredients and the estimate
   explodes; turn any ONE of them off and it shrinks back to 0.
      s1 (phi = 1)  ->  s2 (phi = 2)  ->  s2 ... -> terminal

   Two literal pictures, no log axis: the chain itself with the
   one shared weight, and six bars of |V(s1)| after 0, 10, ... 50
   updates on a linear axis. A bar taller than the axis is clipped
   and says by how much it went off the chart.

   Parameters. GAMMA = 0.99 and PHI = [1, 2] are the paper's. With
   all three on, each update of the s1 -> s2 transition multiplies w
   by 1 + ALPHA*(2*GAMMA - 1) = 1.0735 at ALPHA = 0.075, so |V(s1)|
   doubles every ten updates (x2.03): 1, 2.0, 4.1, 8.4, 17, 35.
   With the table (fa off) or the return as target (boot off) the
   same ALPHA shrinks the estimate by 1 - ALPHA per update: 1,
   0.46, 0.21, 0.10, 0.04, 0.02. On-policy, the chain is followed
   and s2 -> terminal (prob PEND = 0.1) pulls w down by 1 - 4*ALPHA
   each time it happens: 1, 0.79, 0.58, 0.43, 0.31, 0.30 with
   seed 5. TOTAL = 50 updates, AXTOP = 10 on the bar axis.
   ============================================================ */
IE437.widget('deadly-triad', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B', PANEL2 = '#E7E7E1', LBLUE = '#E3ECFB';
  var MONO = 'IBM Plex Mono, monospace';
  var GAMMA = 0.99, ALPHA = 0.075, PHI = [1, 2], PEND = 0.1, TOTAL = 50, EVERY = 10, AXTOP = 10;
  var fa = true, boot = true, off = true;
  var w, V, s, n, bars, rand, shown = 0, timers = [];

  host.innerHTML =
    '<div class="wbar"><span class="wt">Two states, zero rewards, true value = 0 &mdash; what could go wrong</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-auto data-run>run ' + TOTAL + ' updates</button>' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px;padding-top:10px;padding-bottom:10px">' +
    '<div style="flex:.85;display:flex;flex-direction:column;gap:9px;justify-content:center;min-width:0">' +
    '<label class="wtog on" data-t="fa"><i></i><span>function approximation<br>' +
    '<span style="opacity:.65;font-weight:400">one shared w, not a table</span></span></label>' +
    '<label class="wtog on" data-t="boot"><i></i><span>bootstrapping<br>' +
    '<span style="opacity:.65;font-weight:400">target r + &gamma;V(s&prime;), not the return</span></span></label>' +
    '<label class="wtog on" data-t="off"><i></i><span>off-policy distribution<br>' +
    '<span style="opacity:.65;font-weight:400">update s&#8321;&rarr;s&#8322; only</span></span></label>' +
    '<div data-verdict style="margin-top:6px;padding:9px 12px;border-radius:4px;text-align:center;' +
    'font:600 12px/1.4 var(--mono);letter-spacing:.04em"></div>' +
    '</div>' +
    '<div style="flex:1.15;display:flex;flex-direction:column;align-items:center;min-width:0;gap:2px">' +
    '<div class="wlabel">the problem &mdash; and how V is stored</div>' +
    '<div data-p></div>' +
    '<div class="wlabel" style="margin-top:6px">|V(s&#8321;)| after 0 &hellip; ' + TOTAL + ' updates &mdash; linear axis, dashed line = true value 0</div>' +
    '<div data-c></div></div></div>';

  var PW = 560, PH = 112, CW = 560, CH = 186;
  var pic = IE437.svg(PW, PH), ch = IE437.svg(CW, CH);
  host.querySelector('[data-p]').appendChild(pic);
  host.querySelector('[data-c]').appendChild(ch);
  var uid = 'dt' + Math.floor(Math.random() * 1e9);

  function value(st) { return fa ? w * PHI[st] : V[st]; }

  function update() {
    var st, nx, done;
    if (off) { st = 0; nx = 1; done = false; }                 // always the s1 -> s2 transition
    else {
      st = s;
      if (st === 0) { nx = 1; done = false; }
      else { done = rand() < PEND; nx = 1; }
      s = done ? 0 : nx;
    }
    var target = boot ? (done ? 0 : GAMMA * value(nx)) : 0;     // all rewards are zero
    var delta = target - value(st);
    if (fa) w += ALPHA * delta * PHI[st];
    else V[st] += ALPHA * delta;
    n++;
  }

  /* ---------- picture (a): the chain, the weight, the target ---------- */
  function drawPic() {
    while (pic.firstChild) pic.removeChild(pic.firstChild);
    var d = E('defs', {}, pic);
    [['k', INK], ['r', RED], ['s', SLATE]].forEach(function (c) {
      var m = E('marker', { id: uid + c[0], viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, d);
      E('path', { d: 'M0 0L10 5L0 10Z', fill: c[1] }, m);
    });
    function arrow(x1, y1, x2, y2, c, key) {
      E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': c === RED ? 2 : 1.4, 'marker-end': 'url(#' + uid + key + ')' }, pic);
    }
    var cy = 70, r = 17, X1 = 56, X2 = 236, XT = 376;
    /* states and terminal */
    E('circle', { cx: X1, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, pic);
    E('circle', { cx: X2, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, pic);
    IE437.math(pic, X1, cy + 5, 's_1', { 'text-anchor': 'middle', 'font-size': 15 });
    IE437.math(pic, X2, cy + 5, 's_2', { 'text-anchor': 'middle', 'font-size': 15 });
    E('rect', { x: XT - 15, y: cy - 15, width: 30, height: 30, fill: PANEL2, stroke: SLATE, 'stroke-width': 1.1 }, pic);
    E('text', { x: XT, y: cy + 3, 'text-anchor': 'middle', 'font-size': 8, fill: SLATE, 'font-family': MONO, 'letter-spacing': '.06em', text: 'end' }, pic);
    IE437.math(pic, X1, PH - 6, '\\phi(s_1)=1', { 'text-anchor': 'middle', 'font-size': 12.5 });
    IE437.math(pic, X2, PH - 6, '\\phi(s_2)=2', { 'text-anchor': 'middle', 'font-size': 12.5 });
    /* transitions: s1 -> s2 (the off-policy update), s2 self-loop, s2 -> end */
    arrow(X1 + r + 3, cy, X2 - r - 4, cy, off ? RED : INK, off ? 'r' : 'k');
    /* the self-loop sits at the top-right of s2, clear of the weight box above it */
    E('path', { d: 'M' + (X2 + 3) + ' ' + (cy - r + 1) + ' C ' + (X2 + 6) + ' ' + (cy - r - 28) + ', ' + (X2 + r + 30) + ' ' + (cy - 14) + ', ' + (X2 + r - 2) + ' ' + (cy - 5),
      fill: 'none', stroke: INK, 'stroke-width': 1.4, 'marker-end': 'url(#' + uid + 'k)' }, pic);
    arrow(X2 + r + 3, cy, XT - 15 - 4, cy, INK, 'k');
    E('text', { x: X2 + r + 10, y: cy - r - 10, 'font-size': 9.5, fill: SLATE, 'font-family': MONO, text: (1 - PEND).toFixed(1) }, pic);
    E('text', { x: (X2 + XT) / 2, y: cy - 7, 'text-anchor': 'middle', 'font-size': 9.5, fill: SLATE, 'font-family': MONO, text: PEND.toFixed(1) }, pic);
    E('text', { x: (X1 + X2) / 2, y: cy + 19, 'text-anchor': 'middle', 'font-size': 9.5, fill: off ? RED : SLATE, 'font-family': MONO,
      'font-weight': off ? 700 : 500, 'letter-spacing': '.04em', text: off ? 'only this transition' : 'follow the chain' }, pic);
    E('text', { x: PW - 4, y: 11, 'text-anchor': 'end', 'font-size': 8.5, fill: SLATE, 'font-family': MONO, 'letter-spacing': '.08em', text: 'EVERY REWARD 0' }, pic);
    /* how V is stored: one shared weight, or one cell per state */
    var fx = 436;
    if (fa) {
      var bx = (X1 + X2) / 2, by = 28;
      E('rect', { x: bx - 20, y: by - 11, width: 40, height: 22, rx: 3, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.2 }, pic);
      IE437.math(pic, bx, by + 5, 'w', { 'text-anchor': 'middle', 'font-size': 14, fill: BLUE });
      E('line', { x1: bx - 14, y1: by + 11, x2: X1 + 6, y2: cy - r - 1, stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '3 2' }, pic);
      E('line', { x1: bx + 14, y1: by + 11, x2: X2 - 8, y2: cy - r - 1, stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '3 2' }, pic);
      E('text', { x: bx, y: by - 15, 'text-anchor': 'middle', 'font-size': 8.5, fill: BLUE, 'font-family': MONO, 'letter-spacing': '.08em', text: 'ONE SHARED WEIGHT' }, pic);
      IE437.math(pic, fx, 44, 'V(s) = w\\,\\phi(s)', { 'font-size': 15 });
      IE437.math(pic, fx, 63, 'V(s_1) = w,\\; V(s_2) = 2w', { 'font-size': 11.5, fill: SLATE });
    } else {
      [[X1, 's_1'], [X2, 's_2']].forEach(function (p) {
        E('rect', { x: p[0] - 24, y: 17, width: 48, height: 22, rx: 3, fill: LBLUE, stroke: BLUE, 'stroke-width': 1.2 }, pic);
        IE437.math(pic, p[0], 33, 'V(' + p[1] + ')', { 'text-anchor': 'middle', 'font-size': 12.5, fill: BLUE });
        E('line', { x1: p[0], y1: 39, x2: p[0], y2: cy - r - 1, stroke: BLUE, 'stroke-width': 1, 'stroke-dasharray': '3 2' }, pic);
      });
      E('text', { x: (X1 + X2) / 2, y: 11, 'text-anchor': 'middle', 'font-size': 8.5, fill: BLUE, 'font-family': MONO, 'letter-spacing': '.08em', text: 'A TABLE: ONE CELL EACH' }, pic);
      IE437.math(pic, fx, 44, 'V(s) \\text{ is a table}', { 'font-size': 15 });
      IE437.math(pic, fx, 63, '\\text{one cell per update}', { 'font-size': 11.5, fill: SLATE });
    }
    IE437.math(pic, fx, 90, boot ? '\\text{target } \\gamma V(s\')' : '\\text{target } G = 0', { 'font-size': 13 });
    IE437.math(pic, fx, 106, boot ? '\\text{(bootstrap)}' : '\\text{(the return)}', { 'font-size': 11, fill: SLATE });
  }

  /* ---------- picture (b): six bars on a linear axis ---------- */
  function drawBars() {
    while (ch.firstChild) ch.removeChild(ch.firstChild);
    var P = { l: 44, r: 14, t: 24, b: 28 };
    var Y = function (v) { return CH - P.b - v / AXTOP * (CH - P.t - P.b); };
    var k = bars.length, slot = (CW - P.l - P.r) / k, bw = Math.min(46, slot * 0.6);
    [0, AXTOP / 2, AXTOP].forEach(function (t) {
      E('line', { x1: P.l, x2: CW - P.r, y1: Y(t), y2: Y(t), stroke: 'currentColor', 'stroke-opacity': .12 }, ch);
      E('text', { x: P.l - 6, y: Y(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: 'currentColor', 'fill-opacity': .5,
        'font-family': MONO, text: String(t) }, ch);
    });
    E('line', { x1: P.l, x2: P.l, y1: P.t, y2: CH - P.b, stroke: 'currentColor', 'stroke-opacity': .28 }, ch);
    E('line', { x1: P.l, x2: CW - P.r, y1: Y(0), y2: Y(0), stroke: RED, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, ch);
    E('text', { x: (P.l + CW - P.r) / 2, y: CH - 3, 'text-anchor': 'middle', 'font-size': 9, fill: 'currentColor',
      'fill-opacity': .45, 'font-family': MONO, text: 'updates' }, ch);
    for (var i = 0; i < k; i++) {
      var cx = P.l + slot * (i + 0.5);
      E('text', { x: cx, y: CH - P.b + 14, 'text-anchor': 'middle', 'font-size': 9, fill: 'currentColor', 'fill-opacity': .5,
        'font-family': MONO, text: String(i * EVERY) }, ch);
      if (i >= shown) continue;
      var v = bars[i], over = v > AXTOP, top = Y(Math.min(v, AXTOP));
      E('rect', { x: cx - bw / 2, y: top, width: bw, height: Y(0) - top, fill: BLUE, 'fill-opacity': over ? .55 : .85 }, ch);
      if (over) {
        /* clipped: a torn top edge and the multiple of the axis */
        E('path', { d: 'M' + (cx - bw / 2 - 3) + ' ' + (P.t + 2) + ' l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4 l6 -4 l6 4', fill: 'none', stroke: '#fff', 'stroke-width': 3 }, ch);
        E('text', { x: cx, y: P.t - 12, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': 700, fill: RED, 'font-family': MONO,
          text: 'off the chart' }, ch);
        E('text', { x: cx, y: P.t - 2, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: RED, 'font-family': MONO,
          text: '×' + (v / AXTOP).toFixed(1) }, ch);
      } else {
        E('text', { x: cx, y: top - 4, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: INK, 'font-family': MONO,
          text: v < 0.1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(1) }, ch);
      }
    }
  }

  function verdict() {
    var el = host.querySelector('[data-verdict]');
    if (shown < bars.length) {
      el.style.background = 'transparent'; el.style.color = 'var(--ink3)';
      el.innerHTML = shown ? '&hellip;' : 'press run'; return;
    }
    var m = bars[bars.length - 1];
    if (m >= AXTOP) {
      el.style.background = 'rgba(214,69,69,.12)'; el.style.color = RED;
      el.innerHTML = 'DIVERGING<br><span style="font-weight:400;font-size:11px">&times;' + Math.round(m / bars[0]) + ' in ' + TOTAL + ' updates</span>';
    } else if (m <= 0.5) {
      el.style.background = 'rgba(37,99,235,.12)'; el.style.color = BLUE;
      el.innerHTML = 'SHRINKING TO 0<br><span style="font-weight:400;font-size:11px">|V(s&#8321;)| = ' + m.toFixed(3) + '</span>';
    } else {
      el.style.background = 'rgba(26,26,25,.05)'; el.style.color = 'var(--ink2)';
      el.innerHTML = 'still settling<br><span style="font-weight:400;font-size:11px">|V(s&#8321;)| = ' + m.toFixed(3) + '</span>';
    }
  }

  function draw() { drawBars(); verdict(); }

  function stopTimers() { timers.forEach(clearTimeout); timers = []; }
  function reset() {
    stopTimers();
    w = 1; V = [1, 0]; s = 0; n = 0; rand = IE437.rng(opts.seed || 5);
    bars = [Math.abs(value(0))];
    while (n < TOTAL) { update(); if (n % EVERY === 0) bars.push(Math.abs(value(0))); }
    shown = 0;
    drawPic(); draw();
  }
  /* run: the six bars appear left to right */
  function run() {
    stopTimers(); shown = 0; draw();
    for (var i = 1; i <= bars.length; i++) (function (k) {
      timers.push(setTimeout(function () { shown = k; draw(); }, 160 + 260 * (k - 1)));
    })(i);
  }
  function finish() { stopTimers(); shown = bars.length; draw(); }

  host.querySelectorAll('.wtog').forEach(function (el) {
    el.onclick = function () {
      var k = el.getAttribute('data-t');
      if (k === 'fa') fa = !fa; else if (k === 'boot') boot = !boot; else off = !off;
      el.classList.toggle('on');
      reset(); run();
    };
  });
  host.querySelector('[data-run]').onclick = run;
  var __reset = reset;

  reset();
  return { reset: __reset, finish: finish };
});
