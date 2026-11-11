/* ============================================================
   widget: max-bias                                    (Chapter 8)
   Why the max in the Q-learning target over-estimates, and what
   Double DQN changes. Five actions, every one truly worth 0.

     bars      estimate A of each action: the true value plus noise.
               The largest bar is red: it is what a max reads.
     dot       estimate B of that same action: a second, independent
               estimate (Double DQN's frozen network scoring the action
               the online network picked).
     right     the two readings averaged over every draw so far, on
               the same axis: the max sits above 0, the dot at 0.

   Buttons: new estimates x1 / x200, reset. Arrival draws once.
   Options: seed (default 5), k — number of actions (default 5).
   ============================================================ */
IE437.widget('max-bias', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B', LBLUE = '#E3ECFB';
  var MONO = 'IBM Plex Mono, monospace';
  var K = Math.max(2, Math.min(7, +opts.k || 5)), seed = +opts.seed || 5;
  var rand, est, pick, second, n, sumMax, sumSec;

  function gauss() {
    var u = 1 - rand(), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + K + ' actions, every true value 0 &mdash; what a max reads</span><span class="wspacer"></span>' +
    '<span class="wlabel">draws</span><span class="wnum" data-n>0</span>' +
    '<button class="wb" data-d1>new estimates</button>' +
    '<button class="wb" data-d200>&times;200</button>' +
    '<button class="wb" data-reset>reset</button></div>' +
    '<div class="wbody" style="align-items:center;padding:10px 14px 6px"><div data-c></div></div>';
  var W = 1040, H = 340, s = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(s);

  var Y0 = 160, SC = 54;                         /* value 0 at y = 160; one unit is 54 px */
  function Y(v) { return Y0 - Math.max(-2.4, Math.min(2.5, v)) * SC; }
  function sgn(v) { return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2); }
  var XL = 60, XR = 640, XS = 712;               /* bars live in XL..XR, the averages from XS */

  function reset() {
    rand = IE437.rng(seed); est = null; pick = -1; second = 0; n = 0; sumMax = 0; sumSec = 0;
    draw();
  }
  function sample(m) {
    for (var i = 0; i < m; i++) {
      est = []; pick = 0;
      for (var a = 0; a < K; a++) { est.push(gauss()); if (est[a] > est[pick]) pick = a; }
      second = gauss();                          /* an independent estimate of the picked action */
      n++; sumMax += est[pick]; sumSec += second;
    }
    draw();
  }

  function draw() {
    while (s.firstChild) s.removeChild(s.firstChild);
    host.querySelector('[data-n]').textContent = n;
    /* axis */
    [-2, -1, 1, 2].forEach(function (v) {
      E('line', { x1: XL, x2: XR, y1: Y(v), y2: Y(v), stroke: INK, 'stroke-opacity': .1 }, s);
      E('text', { x: XL - 10, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 12, fill: SLATE, 'font-family': MONO, text: v < 0 ? '−' + (-v) : '+' + v }, s);
    });
    E('line', { x1: XL, x2: XR, y1: Y(0), y2: Y(0), stroke: INK, 'stroke-width': 1.6 }, s);
    E('line', { x1: XS, x2: W - 10, y1: Y(0), y2: Y(0), stroke: INK, 'stroke-opacity': .3, 'stroke-width': 1.2 }, s);
    E('text', { x: XL - 10, y: Y(0) + 4, 'text-anchor': 'end', 'font-size': 12, fill: INK, 'font-family': MONO, 'font-weight': 700, text: '0' }, s);

    /* the bars: estimate A */
    var gap = (XR - XL) / K, BW = Math.min(52, gap * 0.5);
    for (var a = 0; a < K; a++) {
      var cx = XL + gap * (a + 0.5), hot = est && a === pick;
      if (est) {
        var v = est[a], top = Math.min(Y(0), Y(v)), h = Math.max(1, Math.abs(Y(v) - Y(0)));
        E('rect', { x: cx - BW / 2, y: top, width: BW, height: h, fill: hot ? RED : LBLUE, 'fill-opacity': hot ? .85 : 1,
          stroke: hot ? RED : BLUE, 'stroke-width': 1.4 }, s);
        if (hot) {
          var ym = top - 9;                                          /* the max label sits above the bar */
          E('text', { x: cx, y: ym, 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: RED, text: 'max ' + sgn(v) }, s);
          /* estimate B of the same action: a dot beside the bar, its value under or over the dot */
          var bx = cx + BW / 2 + 18, by = Y(second), ty = by + 22;
          if (Math.abs(ty - ym) < 16 || ty > 296) ty = by - 12;
          E('circle', { cx: bx, cy: by, r: 7, fill: '#fff', stroke: BLUE, 'stroke-width': 2.8 }, s);
          E('text', { x: bx, y: ty, 'text-anchor': 'middle', 'font-size': 12, 'font-family': MONO, fill: BLUE, text: sgn(second) }, s);
        }
      }
      IE437.math(s, cx, H - 28, 'a_' + (a + 1), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': hot ? 700 : 400, fill: hot ? RED : INK });
    }
    /* legend, under the action labels */
    var LY = H - 6;
    E('rect', { x: XL, y: LY - 10, width: 14, height: 10, fill: LBLUE, stroke: BLUE, 'stroke-width': 1 }, s);
    E('text', { x: XL + 21, y: LY, 'font-size': 12.5, fill: SLATE, text: 'estimate A: true value + noise' }, s);
    E('circle', { cx: XL + 236, cy: LY - 5, r: 5, fill: '#fff', stroke: BLUE, 'stroke-width': 2.2 }, s);
    E('text', { x: XL + 248, y: LY, 'font-size': 12.5, fill: SLATE, text: 'estimate B of the picked action' }, s);
    E('line', { x1: XL + 452, x2: XL + 474, y1: LY - 5, y2: LY - 5, stroke: INK, 'stroke-width': 1.6 }, s);
    E('text', { x: XL + 481, y: LY, 'font-size': 12.5, fill: SLATE, text: 'true value: 0' }, s);

    /* the running averages, on the same axis */
    E('line', { x1: XS - 36, x2: XS - 36, y1: 12, y2: H - 44, stroke: INK, 'stroke-opacity': .18 }, s);
    E('text', { x: XS, y: 22, 'font-size': 11.5, fill: SLATE, 'font-family': MONO, 'letter-spacing': '.08em', text: n ? 'AVERAGE OVER ' + n + (n === 1 ? ' DRAW' : ' DRAWS') : 'AVERAGE OVER THE DRAWS' }, s);
    if (n) {
      var am = sumMax / n, as = sumSec / n;
      var ya = Math.max(62, Y(am)), yb = Math.max(62, Y(as));
      /* the higher reading carries its label above, the lower one below, so they never meet */
      var maxUp = ya <= yb, la = maxUp ? ya - 13 : ya + 25, lb = maxUp ? yb + 27 : yb - 15;
      E('line', { x1: XS, x2: XS + 70, y1: ya, y2: ya, stroke: RED, 'stroke-width': 3.6 }, s);
      E('text', { x: XS, y: la, 'font-size': 13.5, 'font-weight': 700, fill: RED, text: 'the max of A' }, s);
      E('text', { x: XS + 96, y: la, 'font-size': 12.5, 'font-family': MONO, fill: RED, text: sgn(am) }, s);
      E('circle', { cx: XS + 35, cy: yb, r: 7, fill: '#fff', stroke: BLUE, 'stroke-width': 2.8 }, s);
      E('text', { x: XS, y: lb, 'font-size': 13.5, 'font-weight': 700, fill: BLUE, text: 'B at the picked action' }, s);
      E('text', { x: XS + 158, y: lb, 'font-size': 12.5, 'font-family': MONO, fill: BLUE, text: sgn(as) }, s);
    }
  }

  host.querySelector('[data-d1]').onclick = function () { sample(1); };
  host.querySelector('[data-d200]').onclick = function () { sample(200); };
  host.querySelector('[data-reset]').onclick = reset;

  reset();
  return {
    reset: reset,
    auto: function () { if (n === 0) sample(1); },
    finish: function () { if (n < 200) sample(200 - n); }
  };
});
