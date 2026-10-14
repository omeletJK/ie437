/* ============================================================
   widget: cond-bars                                (Chapter 6, Act 3)
   Conditioning on success, drawn as three bar charts instead of a
   table: how common each design is, how likely it is to succeed, and
   what conditioning on success leaves. The professor found the same
   examples as tables of products hard to lecture from.

     p(x | S) = P(S | x) p(x) / sum_x' P(S | x') p(x')

   mode "heater"  the temperature thread: one heater on, left L or right R.
                  prior (0.5, 0.5), success (0.8, 0.2) -> (0.8, 0.2).
                    0  the prior and the success model
                    1  the conditional
                    2  the average design (both half on) breaks the rule
   mode "try"     prior (0.2, 0.8), same success -> (0.5, 0.5).
                    0  prior and success   1  the conditional
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
  var HEAT = MODE === 'heater' || MODE === 'try';

  var names = HEAT ? ['L', 'R'] : ['A', 'B', 'C'];
  var prior = MODE === 'heater' ? [0.5, 0.5] : MODE === 'try' ? [0.2, 0.8] : [0.6, 0.3, 0.1];
  var succ = HEAT ? [0.8, 0.2] : [0.1, 0.5, 0.8];
  var prod = prior.map(function (p, i) { return p * succ[i]; });
  var Z = prod.reduce(function (a, b) { return a + b; }, 0);
  var post = prod.map(function (v) { return v / Z; });
  var q = [0.2, 0.3, 0.5];
  var wt = q.map(function (qi, i) { return prior[i] / qi * succ[i]; });
  var contrib = q.map(function (qi, i) { return qi * wt[i]; });
  var noRatio = q.map(function (qi, i) { return qi * succ[i]; });

  var N = { heater: 2, 'try': 1, abc: 2, ratio: 4 }[MODE], st = 0;
  var TITLE = {
    heater: 'One heater on — which one, after asking for success?',
    'try': 'The generator now prefers the right heater',
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

  var W = 660, H = 300, PT = 40, PB = 236;                      /* plot top and base */
  var PW = MODE === 'heater' ? 160 : 178, GAP = MODE === 'heater' ? 52 : 63;   /* panel width and gap; the
                                                                   heater keeps room for the average design */
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
  /* the heater icon: a room with a heater on each wall; on = [left, right] in 0..1 */
  function icon(cx, cy, on, bad) {
    E('rect', { x: cx - 19, y: cy - 11, width: 38, height: 22, rx: 3, fill: '#fff', stroke: INK, 'stroke-opacity': .45 }, sv);
    [[-19, on[0]], [13, on[1]]].forEach(function (h) {
      E('rect', { x: cx + h[0], y: cy - 6, width: 6, height: 12, rx: 1, fill: RED, 'fill-opacity': .12 + .8 * h[1],
        stroke: RED, 'stroke-opacity': .7 }, sv);
    });
    if (bad) {
      E('path', { d: 'M' + (cx - 24) + ' ' + (cy - 16) + 'L' + (cx + 24) + ' ' + (cy + 16) + 'M' + (cx + 24) + ' ' + (cy - 16) +
        'L' + (cx - 24) + ' ' + (cy + 16), stroke: RED, 'stroke-width': 2.4, 'stroke-opacity': .85 }, sv);
    }
  }
  function label(k, i) {
    if (HEAT) {
      icon(bx(k, i), PB + 22, i === 0 ? [1, 0] : [0, 1]);
      txt(bx(k, i), PB + 50, i === 0 ? 'left on' : 'right on', { 'text-anchor': 'middle', 'font-size': 10, 'fill-opacity': .6 });
    }
    else txt(bx(k, i), PB + 18, names[i], { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700 });
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
      label(k, i);
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

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    if (MODE === 'ratio') {
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
      var show2 = MODE === 'abc' ? st >= 1 : true, show3 = MODE === 'abc' ? st >= 2 : st >= 1;
      panel(0, 'how common', 'prior p(x)', prior, 1, SLATE, two);
      op(0, '×');
      if (show2) panel(1, 'how likely to succeed', 'P(S | x)', succ, 1, AMBER, two,
        MODE === 'abc' && st >= 2 ? { hi: ['', '', 'most promising'], hiCol: AMBER } : null);
      else empty(1, 'how likely to succeed');
      op(1, '→');
      if (show3) panel(2, 'after conditioning', 'p(x | S)', post, 1, BLUE, pct,
        MODE === 'abc' ? { hi: ['', 'most mass', ''], hiCol: BLUE } : null);
      else empty(2, 'after conditioning');
      if (MODE === 'heater' && st >= 2) {                     /* the average of the two designs */
        var cx = px(2) + PW + 34;
        E('line', { x1: px(2) + PW + 6, x2: px(2) + PW + 6, y1: PT, y2: PB + 34, stroke: INK, 'stroke-opacity': .12 }, sv);
        txt(cx, PT + 2, 'their', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: RED });
        txt(cx, PT + 16, 'average', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: RED });
        icon(cx, PB + 22, [0.5, 0.5], true);
        txt(cx, PB + 50, 'breaks the rule', { 'text-anchor': 'middle', 'font-size': 10, fill: RED });
        txt(cx, PB - 64, 'both', { 'text-anchor': 'middle', 'font-size': 10.5, fill: RED });
        txt(cx, PB - 51, 'half on', { 'text-anchor': 'middle', 'font-size': 10.5, fill: RED });
      }
    }
    host.querySelector('[data-note]').innerHTML = ({
      heater: [
        'The generator proposes either design half the time. The model says the <b>left</b> heater succeeds far more often.',
        'Conditioning on success multiplies and renormalises: the left heater becomes the likely draw — and every draw is still <b>one of the two designs</b>.',
        'Their average is no draw at all: both heaters half on, a design the rule forbids. ==Sampling keeps the alternatives; averaging erases them.=='
      ],
      'try': [
        'The same success model; the generator now proposes the right heater four times as often.',
        'The two pulls cancel and each design keeps half the mass. What you sample is set by <b>prior and success together</b> — and a draw is still L or R.'
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
