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
   mode "ratio"   CbAS's importance weight. Proposal q = (0.2, 0.3, 0.5);
                  weight p/q * P(S) = (0.30, 0.50, 0.16);
                  q * weight = (0.06, 0.15, 0.08) = p * P(S), the target.
                  Without the ratio, q * P(S) = (0.02, 0.15, 0.40).
                    0  the target  1  the proposal  2  the weights  3  they
                    give back the target  4  without the ratio, C takes the mass
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

  var N = { heater: 2, 'try': 2, rare: 2, abc: 2, ratio: 4 }[MODE], st = 0;
  var TITLE = {
    heater: 'Propose ten rooms, keep the ones that reach 22 °C',
    'try': 'Propose 25 rooms, keep the ones that reach 22 °C',
    rare: 'Propose 100 rooms, keep the ones that reach 22 °C in five minutes',
    abc: 'Three designs: how common, how promising, what is left',
    ratio: 'Sampling from last round’s model, and correcting for it'
  }[MODE];

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + TITLE + '</span><span class="wspacer"></span>' +
    '<span class="wlabel">rule</span><span class="wnum">' +
    (MODE === 'ratio' ? 'weight = prior / proposal × success' : 'after ∝ prior × success') + '</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:290px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  var SMALL = MODE === 'rare';                                   /* 100 rooms: smaller, 17 to a line */
  var W = 660, H = SMALL ? 296 : HEAT ? 266 : 300, PT = 40, PB = 236;   /* plot top and base */
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

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    if (HEAT) drawCount();
    else if (MODE === 'ratio') {
      var rs = st - 1;                                       /* step 0 shows only the target */
      if (rs >= 0) panel(0, 'how often proposed', 'q(x), last round', q, 0.6, SLATE, two);
      else empty(0, 'how often proposed');
      op(0, '×');
      if (rs >= 1) panel(1, 'weight on each draw', 'p(x)/q(x) × P(S|x)', wt, 0.6, AMBER, two,
        { hi: ['up', '', 'down'], hiCol: AMBER });
      else empty(1, 'weight on each draw');
      op(1, '=');
      if (rs < 0) panel(2, 'what we want to fit', 'prior × success, p × P(S)', prod, 0.45, GREEN, two);
      else if (rs >= 3) panel(2, 'without the ratio', 'q(x) × P(S|x)', noRatio, 0.45, RED, two,
        { ghost: prod, dash: true, headCol: RED });
      else if (rs >= 2) panel(2, 'what each design adds', 'q × weight = p × P(S)', contrib, 0.45, GREEN, two,
        { ghost: prod });
      else empty(2, 'what each design adds');
      if (rs >= 2) {
        E('rect', { x: px(2) + PW - 112, y: PT - 8, width: 14, height: 9, fill: 'none', stroke: INK,
          'stroke-opacity': .45, 'stroke-dasharray': '3 3' }, sv);
        txt(px(2) + PW - 94, PT, 'the target p × P(S)', { 'font-size': 9.5, 'fill-opacity': .6 });
      }
    } else {
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
        'Four and four — half and half.<br>Right: proposed four times as often.<br>' +
        'Left: succeeds four times as often.<br>==What you get is set by the prior and the success model together.=='
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
        'What we want to fit: prior × success for three designs. B — plausible and promising — gets the most; C, rare but promising, comes second.',
        'Last round’s model proposes C most often — it has already moved toward success.',
        'Each draw is weighted by prior / proposal × success: C is <b>down</b>-weighted for being over-proposed, A <b>up</b>-weighted for being under-proposed.',
        'Proposal × weight gives back exactly prior × success — the target. ==The proposal changes where we look, not what we fit.==',
        'Drop the ratio and C takes most of the mass: the refit would chase the proposal’s own drift. A design the proposal never draws cannot be corrected at all — the proposal must cover the target.'
      ]
    })[MODE][st].replace(/==(.+?)==/g, '<span class="hl">$1</span>');
  }
  var show = function (i) { st = Math.max(0, Math.min(N, i)); draw(); };
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
