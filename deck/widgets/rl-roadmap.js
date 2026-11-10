/* ============================================================
   widget: rl-roadmap                                  (Chapter 8)
   The source deck's 2 x 2 map of model-free methods (pp. 12, 59),
   redrawn as a tracker the chapter returns to.

     How to learn a value from experience          (title option)
            Monte Carlo (non-bootstrap) | Temporal difference (bootstrap)
     on-policy   On-policy MC control   | SARSA
     off-policy  Off-policy MC control  | Q-learning

   Options
     cell   "mc-on" | "sarsa" | "mc-off" | "q"  — that cell fills yellow
            with bold text, as the source highlights where it is
     cells  an array of those, for several at once
     dim    true greys the text of every other cell
     title  the line above the table, plain prose; default
            "How to learn a value from experience" — it must hold for
            Act 1 (prediction of a fixed policy) as well as for control
   No steps; the figure is static.  SVG 640 x 250.
   ============================================================ */
IE437.widget('rl-roadmap', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B', PANEL2 = '#E7E7E1';
  var LBLUE = '#E3ECFB', LAMBER = '#FDF0DC', YELLOW = '#FDE68A', DIM = '#A1A8B3';

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  var on = {};
  (Array.isArray(opts.cells) ? opts.cells : opts.cell ? [opts.cell] : []).forEach(function (k) { on[k] = true; });
  var any = Object.keys(on).length > 0, dim = !!opts.dim && any;

  function text(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 13, fill: INK, 'text-anchor': 'middle', text: str };
    for (var k in a || {}) at[k] = a[k];
    return E('text', at, s);
  }
  function rect(s, x, y, w, h, fill) {
    E('rect', { x: x, y: y, width: w, height: h, fill: fill || '#fff', stroke: INK, 'stroke-width': 1.1 }, s);
  }

  var s = IE437.svg(640, 250); mount.appendChild(s);
  /* geometry: row-header column, then the two method columns */
  var XH = 100, WH = 100, X1 = XH + WH, CW = 210, X2 = X1 + CW;
  var YS = 52, HS = 32, Y1 = YS + HS, RH = 60, Y2 = Y1 + RH;

  /* title and the two column headers */
  var TITLE = typeof opts.title === 'string' && opts.title ? opts.title : 'How to learn a value from experience';
  text(s, X1 + CW, 18, TITLE, { 'font-size': 14, 'font-weight': 600 });
  text(s, X1 + CW / 2, 42, 'Monte Carlo method', { fill: BLUE, 'font-weight': 700 });
  text(s, X2 + CW / 2, 42, 'Temporal-difference methods', { fill: RED, 'font-weight': 700 });

  /* sub-headers */
  rect(s, X1, YS, CW, HS, LBLUE); text(s, X1 + CW / 2, YS + HS / 2 + 5, 'Non-bootstrap');
  rect(s, X2, YS, CW, HS, LAMBER); text(s, X2 + CW / 2, YS + HS / 2 + 5, 'Bootstrap');

  /* row headers */
  text(s, XH / 2, Y1 + RH - 4, 'How to', { fill: SLATE });
  text(s, XH / 2, Y1 + RH + 14, 'explore?', { fill: SLATE });
  rect(s, XH, Y1, WH, RH, PANEL2); text(s, XH + WH / 2, Y1 + RH / 2 + 5, 'On-policy');
  rect(s, XH, Y2, WH, RH, PANEL2); text(s, XH + WH / 2, Y2 + RH / 2 + 5, 'Off-policy');

  /* the four cells */
  function cell(key, x, y, lines) {
    var hot = !!on[key];
    rect(s, x, y, CW, RH, hot ? YELLOW : '#fff');
    var a = { fill: dim && !hot ? DIM : INK };
    if (hot) a['font-weight'] = 700;
    if (lines.length === 1) text(s, x + CW / 2, y + RH / 2 + 5, lines[0], a);
    else { text(s, x + CW / 2, y + RH / 2 - 4, lines[0], a); text(s, x + CW / 2, y + RH / 2 + 14, lines[1], a); }
  }
  cell('mc-on', X1, Y1, ['On-policy', 'Monte Carlo control']);
  cell('sarsa', X2, Y1, ['SARSA']);
  cell('mc-off', X1, Y2, ['Off-policy', 'Monte Carlo control']);
  cell('q', X2, Y2, ['Q-learning']);

  /* footnotes */
  var YF = Y2 + RH + 24;
  E('circle', { cx: X1 + 48, cy: YF - 4, r: 2.5, fill: BLUE }, s);
  text(s, X1 + 58, YF, 'episode based', { fill: BLUE, 'text-anchor': 'start', 'font-size': 12.5 });
  E('circle', { cx: X2 + 30, cy: YF - 4, r: 2.5, fill: RED }, s);
  text(s, X2 + 40, YF, 'single-transition based', { fill: RED, 'text-anchor': 'start', 'font-size': 12.5 });

  return { finish: function () {} };
});
