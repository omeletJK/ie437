/* ============================================================
   widget: cond-bars                                (Chapter 6, Act 3)
   Conditioning on success, drawn as pictures instead of a table: how
   common each design is, how likely it is to succeed, and what
   conditioning on success leaves. The professor found the same
   examples as tables of products hard to lecture from.

     p(x | S) = P(S | x) p(x) / sum_x' P(S | x') p(x')

   mode "heater"  the temperature thread as a literal count, Lecture 3's
                  rejection sampling: the generator proposes rooms with the
                  left or the right heater on, the success model keeps the
                  ones that reach 22 °C, and the share among the kept rooms
                  is p(x | S). Ten rooms, 5 left and 5 right; success
                  8 in 10 and 2 in 10 -> kept 4 and 1 -> 80% left.
                    0  the proposals and the success model
                    1  keep the rooms that succeed
                    2  the share among the kept: p(x | S)
   mode "try"     the same count with 5 left and 20 right -> kept 4 and 4.
                    0  proposals   1  keep   2  half and half
                  (The professor could not read the earlier bar version of
                  these two, 2026-10-26: a count of rooms needs no decoding.)
   mode "rare"    why one shot fails: a harder request (22 °C in five
                  minutes) that only the left heater meets, half the time,
                  while the generator proposes it 2 times in 100. Of 100
                  rooms, 2 left and 98 right -> kept 1 and 0: the answer
                  rests on one room. Smaller rooms, 17 to a line.
                    0  proposals   1  keep   2  the share, from one room
   mode "abc"     prior (0.6, 0.3, 0.1), success (0.1, 0.5, 0.8)
                  -> products (0.06, 0.15, 0.08) -> (0.207, 0.517, 0.276).
                    0  prior   1  success   2  the conditional: B, not C
   mode "ratio"   CbAS's importance weight, as a count of 100 draws.
                  p = the prior generator (trained once on the data, fixed):
                  (0.6, 0.3, 0.1). q = the proposal, last round's refit,
                  already leaning to success: (0.2, 0.3, 0.5). Success
                  P(S|x) = (0.1, 0.5, 0.8).
                    0  draw 100 from p, keep what succeeds: 6, 15, 8 — the target
                    1  draw 100 from q instead: 20, 30, 50
                    2  keep what succeeds: 2, 15, 40 — C over-counted 5x
                    3  count each kept draw p/q times: x3, x1, x1/5 -> 6, 15, 8
   ============================================================ */
IE437.widget('cond-bars', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', SLATE = '#64748B', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', AMBER = '#B45309';
  var MONO = 'IBM Plex Mono, monospace';
  var MODE = opts.mode || 'abc';
  var HEAT = MODE === 'heater' || MODE === 'try' || MODE === 'rare';

  var names = HEAT ? ['L', 'R'] : ['A', 'B', 'C'];
  var prior = { heater: [0.5, 0.5], 'try': [0.2, 0.8], rare: [0.02, 0.98] }[MODE] || [0.6, 0.3, 0.1];
  var succ = MODE === 'rare' ? [0.5, 0] : HEAT ? [0.8, 0.2] : [0.1, 0.5, 0.8];
  var prod = prior.map(function (p, i) { return p * succ[i]; });
  var Z = prod.reduce(function (a, b) { return a + b; }, 0);
  var post = prod.map(function (v) { return v / Z; });
  var q = [0.2, 0.3, 0.5];
  var wt = q.map(function (qi, i) { return prior[i] / qi * succ[i]; });
  var contrib = q.map(function (qi, i) { return qi * wt[i]; });
  var noRatio = q.map(function (qi, i) { return qi * succ[i]; });

  var N = { heater: 2, 'try': 2, rare: 2, abc: 2, ratio: 3 }[MODE], st = 0;
  var TITLE = {
    heater: 'Propose ten rooms, keep the ones that reach 22 °C',
    'try': 'Propose 25 rooms, keep the ones that reach 22 °C',
    rare: 'Propose 100 rooms, keep the ones that reach 22 °C in five minutes',
    abc: 'Three designs: how common, how promising, what is left',
    ratio: 'Draw from last round’s model, then correct the count'
  }[MODE];

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + TITLE + '</span><span class="wspacer"></span>' +
    '<span class="wlabel">rule</span><span class="wnum">' +
    (MODE === 'ratio' ? 'weight = p / q × success' : 'after ∝ prior × success') + '</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:' + (MODE === 'ratio' ? 250 : 290) + 'px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  var SMALL = MODE === 'rare';                                   /* 100 rooms: smaller, 17 to a line */
  var W = MODE === 'ratio' ? 790 : 660, H = SMALL ? 296 : HEAT ? 266 : MODE === 'ratio' ? 300 : 300, PT = 40, PB = 236;   /* plot top and base */
  var PW = 178, GAP = 63;                                        /* panel width and gap */
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  function txt(x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 11, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }
  function px(k) { return 6 + k * (PW + GAP); }                 /* left edge of panel k */
  function bx(k, i) {                                            /* centre of bar i in panel k */
    var n = names.length, w = PW / n;
    return px(k) + w * (i + 0.5);
  }
  /* one panel of bars */
  function panel(k, head, sub, vals, max, col, fmt, opt) {
    opt = opt || {};
    txt(px(k), 14, head, { 'font-size': 12, 'font-weight': 700, fill: opt.headCol || INK });
    if (sub) txt(px(k), 28, sub, { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    E('line', { x1: px(k), x2: px(k) + PW, y1: PB, y2: PB, stroke: INK, 'stroke-opacity': .3 }, sv);
    vals.forEach(function (v, i) {
      var h = v / max * (PB - PT - 18), bw = Math.min(40, PW / names.length - 18), c = bx(k, i);
      if (opt.ghost) E('rect', { x: c - bw / 2 - 3, y: PB - opt.ghost[i] / max * (PB - PT - 18) - 3, width: bw + 6,
        height: opt.ghost[i] / max * (PB - PT - 18) + 3, fill: 'none', stroke: INK, 'stroke-opacity': .45,
        'stroke-dasharray': '3 3' }, sv);
      E('rect', { x: c - bw / 2, y: PB - h, width: bw, height: h, fill: col, 'fill-opacity': opt.dash ? .08 : .78,
        stroke: opt.dash ? col : 'none', 'stroke-width': 1.6, 'stroke-dasharray': opt.dash ? '4 3' : '' }, sv);
      txt(c, PB - h - 6, fmt(v), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: col,
        'font-family': MONO });
      if (opt.hi && opt.hi[i]) txt(c, PB - h - 21, opt.hi[i], { 'text-anchor': 'middle', 'font-size': 10.5,
        'font-weight': 700, fill: opt.hiCol || INK });
      txt(c, PB + 18, names[i], { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
    });
  }
  function op(k, s) {                                            /* operator between panel k and k+1 */
    txt(px(k) + PW + GAP / 2, (PT + PB) / 2 + 8, s, { 'text-anchor': 'middle', 'font-size': 26, 'fill-opacity': .45 });
  }
  function empty(k, head) {
    txt(px(k), 14, head, { 'font-size': 12, 'font-weight': 700, 'fill-opacity': .35 });
    E('line', { x1: px(k), x2: px(k) + PW, y1: PB, y2: PB, stroke: INK, 'stroke-opacity': .15 }, sv);
    txt(px(k) + PW / 2, (PT + PB) / 2 + 10, '?', { 'text-anchor': 'middle', 'font-size': 34, 'fill-opacity': .2 });
  }
  var pct = function (v) { return Math.round(v * 100) + '%'; };
  var two = function (v) { return v.toFixed(2); };

  /* ---- the temperature thread as a count ------------------------------------------------
     Expected counts, drawn exactly: of n proposals of a design, n × P(S | x) are kept. */
  var PROP = { heater: [5, 5], 'try': [5, 20], rare: [2, 98] }[MODE];
  var KEPT = { heater: [[0, 1, 2, 4], [1]], 'try': [[0, 1, 2, 4], [2, 7, 13, 17]], rare: [[0], []] }[MODE];
  var ROWY = SMALL ? [66, 118] : [72, 138];                      /* first line of rooms per design */
  var PER = SMALL ? 17 : 10, PITCH = SMALL ? 24 : 42, LINE = SMALL ? 18 : 32, S = SMALL ? .6 : 1;
  var SUCX = 494, KEPTX = 600, BARY = SMALL ? 244 : 220, BARW = 418;
  /* a room with a heater on each wall, scaled by S; on = [left, right]; mark = '' | 'kept' | 'failed' */
  function room(cx, cy, on, mark) {
    var g = E('g', { opacity: mark === 'failed' ? .25 : 1 }, sv);
    E('rect', { x: cx - 17 * S, y: cy - 10 * S, width: 34 * S, height: 20 * S, rx: 3 * S, fill: '#fff',
      stroke: mark === 'kept' ? BLUE : INK, 'stroke-width': mark === 'kept' ? 2.2 : 1,
      'stroke-opacity': mark === 'kept' ? 1 : .45 }, g);
    [[-17, on[0]], [12, on[1]]].forEach(function (h) {
      E('rect', { x: cx + h[0] * S, y: cy - 5 * S, width: 5 * S, height: 10 * S, rx: 1, fill: RED,
        'fill-opacity': .12 + .8 * h[1], stroke: RED, 'stroke-opacity': .7 }, g);
    });
    var d = 9 * S;
    if (mark === 'failed') E('path', { d: 'M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) +
      'M' + (cx + d) + ' ' + (cy - d) + 'L' + (cx - d) + ' ' + (cy + d), stroke: INK, 'stroke-width': SMALL ? 1.2 : 1.6,
      'stroke-opacity': .5 }, sv);
  }
  function drawCount() {
    txt(3, 14, 'proposed by the generator', { 'font-size': 12, 'font-weight': 700 });
    txt(3, 28, 'prior p(x)', { 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(SUCX, 14, 'chance of success', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: AMBER });
    txt(SUCX, 28, 'P(S | x)', { 'text-anchor': 'middle', 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    txt(KEPTX, 14, 'kept', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: BLUE });
    txt(KEPTX, 28, SMALL ? '22 °C in five minutes' : 'reach 22 °C', { 'text-anchor': 'middle', 'font-size': 10,
      'fill-opacity': .55 });
    [0, 1].forEach(function (i) {
      var y = ROWY[i];
      txt(3, y - (SMALL ? 14 : 20), (i === 0 ? 'left' : 'right') + ' heater on · ' + PROP[i] + ' proposed',
        { 'font-size': 11, 'fill-opacity': .7 });
      for (var j = 0; j < PROP[i]; j++) {
        room((SMALL ? 13 : 22) + (j % PER) * PITCH, y + Math.floor(j / PER) * LINE, i === 0 ? [1, 0] : [0, 1],
          st < 1 ? '' : KEPT[i].indexOf(j) >= 0 ? 'kept' : 'failed');
      }
      txt(SUCX, y + 6, Math.round(succ[i] * 10) + ' in 10', { 'text-anchor': 'middle', 'font-size': 17,
        'font-weight': 700, fill: AMBER, 'font-family': MONO });
      if (st >= 1) txt(KEPTX, y + 7, String(KEPT[i].length), { 'text-anchor': 'middle', 'font-size': 20,
        'font-weight': 700, fill: BLUE, 'font-family': MONO });
      else txt(KEPTX, y + 8, '?', { 'text-anchor': 'middle', 'font-size': 20, 'fill-opacity': .2 });
    });
    /* the share among the kept rooms */
    var k0 = KEPT[0].length, k1 = KEPT[1].length, s0 = k0 / (k0 + k1);
    txt(3, BARY - 10, 'after conditioning: the share among the kept', { 'font-size': 12, 'font-weight': 700,
      fill: st >= 2 ? INK : SLATE, 'fill-opacity': st >= 2 ? 1 : .5 });
    txt(BARW + 3, BARY - 10, 'p(x | S)', { 'text-anchor': 'end', 'font-size': 10, 'fill-opacity': .55, 'font-family': MONO });
    if (st >= 2) {
      E('rect', { x: 3, y: BARY, width: BARW * s0, height: 26, fill: BLUE, 'fill-opacity': .82 }, sv);
      E('rect', { x: 3 + BARW * s0, y: BARY, width: BARW * (1 - s0), height: 26, fill: BLUE, 'fill-opacity': .28 }, sv);
      txt(11, BARY + 17, 'left ' + pct(s0), { 'font-size': 12, 'font-weight': 700, fill: '#fff', 'font-family': MONO });
      if (k1) txt(BARW - 5, BARY + 17, 'right ' + pct(1 - s0), { 'text-anchor': 'end', 'font-size': 12,
        'font-weight': 700, fill: BLUE, 'font-family': MONO });
      txt(KEPTX, BARY + 17, k0 + ' : ' + k1, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700,
        fill: BLUE, 'font-family': MONO });
      if (k0 + k1 < 2) txt(3, BARY + 44, 'from one kept room out of 100', { 'font-size': 11.5, 'font-weight': 700,
        fill: RED });
    } else {
      E('rect', { x: 3, y: BARY, width: BARW, height: 26, fill: 'none', stroke: INK, 'stroke-opacity': .25,
        'stroke-dasharray': '4 3' }, sv);
      txt(3 + BARW / 2, BARY + 18, '?', { 'text-anchor': 'middle', 'font-size': 16, 'fill-opacity': .25 });
    }
  }

  /* ---- CbAS's ratio as a count: 100 draws from p, 100 from q -------------------------- */
  function tiles(x0, y0, n, kept, col) {                        /* n draws, the first `kept` filled */
    for (var k = 0; k < n; k++) {
      var cx = x0 + (k % 20) * 8, cy = y0 + Math.floor(k / 20) * 9;
      E('rect', { x: cx, y: cy, width: 7, height: 7, rx: 1.5, fill: k < kept ? col : '#fff',
        stroke: k < kept ? col : SLATE, 'stroke-width': .8, 'stroke-opacity': k < kept ? 1 : .55 }, sv);
    }
  }
  function card(x, y, w, col, title, l1, l2, on) {
    E('rect', { x: x, y: y, width: w, height: 58, rx: 6, fill: '#fff', stroke: col, 'stroke-width': on ? 1.6 : 1, 'stroke-opacity': on ? .9 : .35 }, sv);
    txt(x + 10, y + 18, title, { 'font-size': 13, 'font-weight': 700, fill: col, 'fill-opacity': on ? 1 : .45 });
    txt(x + 10, y + 35, l1, { 'font-size': 11.5, 'font-weight': 700, 'fill-opacity': on ? .85 : .35 });
    txt(x + 10, y + 50, l2, { 'font-size': 11, 'fill-opacity': on ? .6 : .3 });
  }
  function drawRatio() {
    var ROW = [110, 170, 230], P100 = prior.map(function (v) { return Math.round(100 * v); }),
        Q100 = q.map(function (v) { return Math.round(100 * v); }),
        KP = P100.map(function (n, i) { return Math.round(n * succ[i]); }),
        KQ = Q100.map(function (n, i) { return Math.round(n * succ[i]); }),
        RAT = prior.map(function (v, i) { return v / q[i]; }),
        RTXT = P100.map(function (n, i) { return '× ' + n + '/' + Q100[i]; }),
        sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var LX = 26, RX = 372;
    /* two generators, two jobs */
    card(0, 2, 330, GREEN, 'p — the prior generator', 'job: say what a realistic design is', 'trained once on the data; never moves', true);
    card(RX - 26, 2, 404, INK, 'q — last round’s refit', 'job: look where success is common', 'refit every round, so it leans toward success', st >= 1);
    txt(LX, 86, '100 drawn from p · filled = succeeds', { 'font-size': 10, 'font-family': MONO, 'fill-opacity': .5 });
    if (st >= 1) txt(RX, 86, '100 drawn from q' + (st >= 2 ? ' · filled = succeeds' : ''), { 'font-size': 10, 'font-family': MONO, 'fill-opacity': .5 });
    if (st >= 3) txt(RX + 240, 86, 'count each p/q times', { 'font-size': 10, 'font-family': MONO, fill: GREEN });
    E('line', { x1: RX - 34, x2: RX - 34, y1: 70, y2: 300, stroke: INK, 'stroke-opacity': .12 }, sv);
    names.forEach(function (nm, i) {
      var y = ROW[i];
      txt(0, y + 9, nm, { 'font-size': 15, 'font-weight': 700 });
      tiles(LX, y, P100[i], KP[i], GREEN);
      txt(LX + 168, y + 12, KP[i] + ' of ' + P100[i], { 'font-size': 12.5, 'font-weight': 700, fill: GREEN, 'font-family': MONO });
      txt(RX - 26, y + 9, nm, { 'font-size': 15, 'font-weight': 700, 'fill-opacity': st >= 1 ? 1 : .3 });
      if (st >= 1) tiles(RX, y, Q100[i], st >= 2 ? KQ[i] : 0, st >= 3 ? AMBER : RED);
      if (st === 1) txt(RX + 168, y + 12, 'drew ' + Q100[i], { 'font-size': 12.5, 'font-weight': 700, fill: SLATE, 'font-family': MONO });
      if (st >= 2) txt(RX + 168, y + 12, KQ[i] + ' of ' + Q100[i], { 'font-size': 12.5, 'font-weight': 700, fill: st >= 3 ? AMBER : RED, 'font-family': MONO });
      if (st >= 3) txt(RX + 240, y + 12, RTXT[i] + ' = ' + Math.round(KQ[i] * RAT[i]), { 'font-size': 12.5, 'font-weight': 700, fill: GREEN, 'font-family': MONO });
    });
    txt(LX, 286, '= the target · but only ' + sum(KP) + ' of 100 kept', { 'font-size': 12, 'font-weight': 700, fill: GREEN });
    if (st === 2) txt(RX, 286, sum(KQ) + ' of 100 kept — but C is 40, not 8', { 'font-size': 12, 'font-weight': 700, fill: RED });
    if (st >= 3) txt(RX + 240, 286, '= the target again', { 'font-size': 12, 'font-weight': 700, fill: GREEN });
  }
  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    if (HEAT) drawCount();
    else if (MODE === 'ratio') drawRatio();
    else {
      panel(0, 'how common', 'prior p(x)', prior, 1, SLATE, two);
      op(0, '×');
      if (st >= 1) panel(1, 'how likely to succeed', 'P(S | x)', succ, 1, AMBER, two,
        st >= 2 ? { hi: ['', '', 'most promising'], hiCol: AMBER } : null);
      else empty(1, 'how likely to succeed');
      op(1, '→');
      if (st >= 2) panel(2, 'after conditioning', 'p(x | S)', post, 1, BLUE, pct,
        { hi: ['', 'most mass', ''], hiCol: BLUE });
      else empty(2, 'after conditioning');
    }
    host.querySelector('[data-note]').innerHTML = ({
      heater: [
        'The generator proposes ten rooms, five of each. The success model says the left heater reaches 22 °C ' +
        '<b>8 times in 10</b>; the right one, under the window, only <b>2 in 10</b>.',
        'Keep only the rooms that succeed: <b>4</b> of the five left, <b>1</b> of the five right. ' +
        'Every kept room is still a real design — one heater on.',
        'Among the kept rooms, 4 in 5 use the left heater. ==That share is p(x | S): propose, keep what succeeds, count.=='
      ],
      'try': [
        'Same success model. But the generator now proposes the right heater <b>four times as often</b>: ' +
        '5 left, 20 right.',
        'Keep the rooms that succeed: <b>4</b> of the five left, <b>4</b> of the twenty right.',
        'Four and four — half and half.<br>' +
        'Success favours the left heater 4×.<br>' +
        'Proposals favour the right heater 4×.<br>' +
        '==Conditioning reweights the proposals — it does not pick the best design.=='
      ],
      rare: [
        'A harder request: 22 °C in five minutes. The left heater manages it <b>5 times in 10</b>; the right one, ' +
        'under the window, <b>never</b>. But the generator proposes the left heater only <b>2 times in 100</b>.',
        'Keep the rooms that succeed: <b>1</b> of 100. Ninety-nine proposals are thrown away. ' +
        'Ten proposals would usually keep none.',
        'The answer, the left heater, is right. ==But it rests on one room.==<br><br>Two fixes follow.<br>' +
        '<b>Fix 1</b> · propose from last round’s model, not the prior.<br>' +
        '<b>Fix 2</b> · raise the bar step by step, not all at once.'
      ],
      abc: [
        'The generator’s prior: A is the common design, C the rare one.',
        'The success model prefers the rare design, C.',
        'After conditioning, <b>B</b> — plausible <i>and</i> promising — holds the most mass. ==The best success probability does not win on its own.== This is the distribution CbAS approximates when the designs cannot be listed.'
      ],
      ratio: [
        'Two generators, two jobs.<br>' +
        'From <b style="color:#16A34A">p</b>, success keeps 6, 15, 8 — ==the target==.<br>' +
        'But only 29 of 100 draws are kept; with a harder request, 1 in 100 (last slide).',
        'So draw from <b>q</b>, last round’s refit. It has moved toward success: it draws C <b>five times</b> as often as p.',
        'Twice as many kept: 57. But they follow ==q’s taste, not p’s==: C is 40, where the target has 8.<br>' +
        'Fit this, and next round q leans further to C.',
        'Count each kept draw ==p / q times== — like a poll that over-sampled one city: each answer there counts less.<br>' +
        'Back to 6, 15, 8, with q’s efficiency.'
      ]
    })[MODE][st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  var show = function (i) { st = Math.max(0, Math.min(N, i)); draw(); };
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
