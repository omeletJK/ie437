/* ============================================================
   widget: offline-heater                           (Chapter 5, Act 1)
   The temperature thread, offline: one surrogate, two heater commands,
   no experiment. Drawn instead of written — the professor found the
   same example as a paragraph of arithmetic hard to lecture from.

   Room error x = -2, heater command u, hidden score
       f(u) = -[(u - 2)^2 + u^2]          (best at u = 1, f = -2)

   mode "thread"  the surrogate scores u=1 at -2.1 and u=2 at -1.0, so it
                  picks u=2 (true -4). Walked by the deck's ->:
                    0  the two predictions
                    1  the real score appears; the pick is marked
                    2  the errors as bars: tiny A at u=1, large B at u=2
                    3  the cost of the choice: best minus chosen
   mode "try"     errors 0 at u=1 and +1 at u=2: predictions -2 and -3,
                  so the pick is u=1, the right command; the error at u=2
                  is still there and costs nothing.
                    0  the two predictions
                    1  the real score, the pick, the harmless error
   ============================================================ */
IE437.widget('offline-heater', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#B45309', GREEN = '#16A34A';
  var MONO = 'IBM Plex Mono, monospace';
  var TRY = opts.mode === 'try';

  var f = function (u) { return -((u - 2) * (u - 2) + u * u); };
  var C = TRY ? [{ u: 1, p: -2.0 }, { u: 2, p: -3.0 }] : [{ u: 1, p: -2.1 }, { u: 2, p: -1.0 }];
  var pick = C[1].p > C[0].p ? 1 : 0;              /* the surrogate's argmax */
  var best = f(C[0].u) >= f(C[1].u) ? 0 : 1;       /* the real best of the two */
  var N = TRY ? 1 : 3, st = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + (TRY ? 'The same two commands, smaller errors' :
      'Two heater commands, one surrogate, no experiment') + '</span><span class="wspacer"></span>' +
    '<span class="wlabel">score</span><span class="wnum">higher is better</span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div data-note style="width:300px;font:400 14px/1.6 var(--sans);color:var(--ink2)"></div></div>';

  var W = 600, H = 300, L = 46, R = 150, T = 18, B = 34;
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  var U0 = 0, U1 = 2.5, Y0 = -6.6, Y1 = -0.4;
  var PX = function (u) { return L + (u - U0) / (U1 - U0) * (W - L - R); };
  var PY = function (y) { return H - B - (y - Y0) / (Y1 - Y0) * (H - T - B); };
  function txt(x, y, s, o) {
    var a = { x: x, y: y, 'font-size': 11, fill: INK, text: s };
    for (var k in o) a[k] = o[k];
    return E('text', a, sv);
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var k;
    /* axes */
    E('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    E('line', { x1: L, x2: L, y1: T, y2: H - B, stroke: INK, 'stroke-opacity': .28 }, sv);
    [-6, -4, -2].forEach(function (v) {
      txt(L - 6, PY(v) + 3.5, String(v).replace('-', '−'), { 'text-anchor': 'end', 'font-size': 9.5,
        'fill-opacity': .45, 'font-family': MONO });
      E('line', { x1: L, x2: W - R, y1: PY(v), y2: PY(v), stroke: INK, 'stroke-opacity': .06 }, sv);
    });
    txt((L + W - R) / 2, H - 6, 'heater command u', { 'text-anchor': 'middle', 'font-size': 10,
      'fill-opacity': .5, 'font-family': MONO });
    /* the two candidate commands */
    C.forEach(function (c) {
      E('rect', { x: PX(c.u) - 20, y: T, width: 40, height: H - B - T, fill: INK, 'fill-opacity': .035 }, sv);
      txt(PX(c.u), H - B + 15, 'u = ' + c.u, { 'text-anchor': 'middle', 'font-size': 11, 'font-family': MONO });
    });

    /* the real score, once the experiment is (hypothetically) run */
    if (st >= 1) {
      var pts = [];
      for (k = 0; k <= 120; k++) { var u = U0 + (U1 - U0) * k / 120; pts.push(PX(u).toFixed(1) + ' ' + PY(f(u)).toFixed(1)); }
      E('path', { d: 'M' + pts.join('L'), fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-opacity': .5 }, sv);
      txt(PX(0.18), PY(f(0.18)) + 24, 'real score', { 'font-size': 10.5, 'font-weight': 700, 'fill-opacity': .6 });
      C.forEach(function (c) {
        E('circle', { cx: PX(c.u), cy: PY(f(c.u)), r: 6, fill: '#fff', stroke: INK, 'stroke-width': 2 }, sv);
      });
    }

    /* the errors as bars: prediction minus truth */
    var showBars = TRY ? st >= 1 : st >= 2;
    if (showBars) {
      C.forEach(function (c, i) {
        var e = c.p - f(c.u);
        if (Math.abs(e) < 1e-9) return;
        var big = Math.abs(e) > 0.5, col = i === best ? AMBER : RED, x = PX(c.u) + 13;
        E('line', { x1: x, x2: x, y1: PY(f(c.u)), y2: PY(c.p), stroke: col, 'stroke-width': big ? 4 : 3 }, sv);
        var lab = TRY ? 'over-rated, not chosen' : (i === best ? 'A' : 'B  over-rated');
        txt(x + 7, (PY(f(c.u)) + PY(c.p)) / 2 + 4, lab, { 'font-size': big ? 13 : 12, 'font-weight': 700, fill: col });
      });
    }

    /* the predictions, and the pick */
    C.forEach(function (c, i) {
      E('circle', { cx: PX(c.u), cy: PY(c.p), r: 6.5, fill: BLUE }, sv);
      var below = c.p < f(c.u) + 0.4;            /* a prediction just under the curve: label it below */
      txt(PX(c.u), below ? PY(c.p) + 24 : PY(c.p) - 17, 'predicted',
        { 'text-anchor': 'middle', 'font-size': 10.5, fill: BLUE, 'font-weight': 700 });
      if (st >= 1 && i === pick)
        E('circle', { cx: PX(c.u), cy: PY(c.p), r: 12, fill: 'none', stroke: pick === best ? GREEN : RED, 'stroke-width': 2.5 }, sv);
    });

    /* the cost of the choice */
    if (!TRY && st >= 3) {
      var xr = W - R + 36, yb = PY(f(C[best].u)), yc = PY(f(C[pick].u));
      [best, pick].forEach(function (i) {
        E('line', { x1: PX(C[i].u) + 7, x2: xr + 5, y1: PY(f(C[i].u)), y2: PY(f(C[i].u)), stroke: INK,
          'stroke-opacity': .35, 'stroke-dasharray': '3 4' }, sv);
      });
      E('line', { x1: xr, x2: xr, y1: yb, y2: yc, stroke: INK, 'stroke-width': 3 }, sv);
      txt(xr + 8, (yb + yc) / 2 - 2, 'cost of', { 'font-size': 11.5, 'font-weight': 700 });
      txt(xr + 8, (yb + yc) / 2 + 13, 'the choice', { 'font-size': 11.5, 'font-weight': 700 });
    }

    host.querySelector('[data-note]').innerHTML = TRY ? [
      'Now the surrogate is exact at u = 1 and over-rates u = 2 by less than before.',
      'It picks <b>u = 1</b>, the right command. The error at u = 2 is still there, but it no longer changes the choice, so it <b>costs nothing</b>.'
    ][st] : [
      'The surrogate scores two commands. Which one does maximising it pick?',
      'It picks <b>u = 2</b>, the one it rates higher. Run the heater, and u = 2 turns out to be the <b>worse</b> command.',
      'The surrogate is almost right about u = 1 (<span style="color:' + AMBER + '"><b>A</b></span>, tiny) and badly optimistic about u = 2 (<span style="color:' + RED + '"><b>B</b></span>) — and u = 2 is the one it chose.',
      'The cost of the decision is the drop from the best command to the chosen one. It comes from the over-rating at the chosen command, <b>B</b>.'
    ][st];
  }

  var show = function (i) { st = Math.max(0, Math.min(N, i)); draw(); };
  show(0);
  return { steps: N, step: show, reset: function () { show(0); }, finish: function () { show(N); } };
});
