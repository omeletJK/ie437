/* ============================================================
   widget: rl-roadmap                                  (Chapter 8)
   The source deck's 2 x 2 map of model-free methods (pp. 12, 59),
   redrawn as a tracker the chapter returns to.

     How to learn a value from experience          (title option)
            Monte Carlo (non-bootstrap) | Temporal difference (bootstrap)
     on-policy   On-policy MC control   | SARSA
     off-policy  Off-policy MC control  | Q-learning

   Options
     grid   "methods" (default, the map above) or "problems": the
            opening grid (p. 9) in the same frame — model known or
            unknown across, one state or many down; cells opt, bandit,
            dp, rl.
     cell   "mc-on" | "sarsa" | "mc-off" | "q"  — that cell fills yellow
            with bold text, as the source highlights where it is
            (for "problems": "opt" | "bandit" | "dp" | "rl")
     cells  an array of those, for several at once
     skip   an array of keys drawn in slate with "not in this course"
            under the name: the map is complete, the course is not
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

  /* the two grids share one frame: coloured column heads, a tinted sub-head row, a row-question
     beside two row heads, four cells, a footnote per column */
  var SPECS = {
    methods: {
      title: 'How to learn a value from experience',
      heads: ['Monte Carlo method', 'Temporal-difference methods'],
      subs: ['Non-bootstrap', 'Bootstrap'],
      rowq: ['How to', 'explore?'],
      rows: [['On-policy'], ['Off-policy']],
      cells: [['mc-on', ['On-policy', 'Monte Carlo control']], ['sarsa', ['SARSA']],
              ['mc-off', ['Off-policy', 'Monte Carlo control']], ['q', ['Q-learning']]],
      foot: ['episode based', 'single-transition based']
    },
    problems: {
      title: 'How many states, and is the model known?',
      heads: ['Model is known', 'Model is unknown'],
      subs: ['Solve the model', 'Learn from experience'],
      rowq: ['How many', 'states?'],
      rows: [['Single state', 'an optimum action'], ['Many states', 'an optimum policy']],
      cells: [['opt', ['Optimisation', 'Lectures 1 and 4']], ['bandit', ['Bandit', 'this lecture, first']],
              ['dp', ['Dynamic programming', 'Lecture 7']], ['rl', ['Reinforcement learning', 'this lecture']]],
      where: true,                                   /* a cell's second line says where, in slate */
      foot: ['plan with T and R', 'sample transitions instead']
    }
  };
  var SP = SPECS[opts.grid] || SPECS.methods;

  host.innerHTML = '<div class="wbody" style="align-items:center;justify-content:center;padding:10px 12px 6px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  var on = {}, skip = {};
  (Array.isArray(opts.cells) ? opts.cells : opts.cell ? [opts.cell] : []).forEach(function (k) { on[k] = true; });
  (Array.isArray(opts.skip) ? opts.skip : []).forEach(function (k) { skip[k] = true; });
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
  var XH = 84, WH = 128, X1 = XH + WH, CW = 210, X2 = X1 + CW;   /* the row heads hold two lines of text */
  var YS = 52, HS = 32, Y1 = YS + HS, RH = 60, Y2 = Y1 + RH;

  /* title and the two column headers */
  var TITLE = typeof opts.title === 'string' && opts.title ? opts.title : SP.title;
  text(s, X1 + CW, 18, TITLE, { 'font-size': 14, 'font-weight': 600 });
  text(s, X1 + CW / 2, 42, SP.heads[0], { fill: BLUE, 'font-weight': 700 });
  text(s, X2 + CW / 2, 42, SP.heads[1], { fill: RED, 'font-weight': 700 });

  /* sub-headers */
  rect(s, X1, YS, CW, HS, LBLUE); text(s, X1 + CW / 2, YS + HS / 2 + 5, SP.subs[0]);
  rect(s, X2, YS, CW, HS, LAMBER); text(s, X2 + CW / 2, YS + HS / 2 + 5, SP.subs[1]);

  /* row headers */
  text(s, XH / 2, Y1 + RH - 4, SP.rowq[0], { fill: SLATE });
  text(s, XH / 2, Y1 + RH + 14, SP.rowq[1], { fill: SLATE });
  function rowHead(y, lines) {
    rect(s, XH, y, WH, RH, PANEL2);
    if (lines.length === 1) text(s, XH + WH / 2, y + RH / 2 + 5, lines[0]);
    else { text(s, XH + WH / 2, y + RH / 2 - 3, lines[0]); text(s, XH + WH / 2, y + RH / 2 + 14, lines[1], { fill: SLATE, 'font-size': 11.5 }); }
  }
  rowHead(Y1, SP.rows[0]); rowHead(Y2, SP.rows[1]);

  /* the four cells */
  function cell(key, x, y, lines) {
    var hot = !!on[key], off = !!skip[key];
    rect(s, x, y, CW, RH, hot ? YELLOW : '#fff');
    var a = { fill: off ? SLATE : dim && !hot ? DIM : INK };
    if (hot) a['font-weight'] = 700;
    if (off) {
      /* three lines: the name, then why it is grey */
      text(s, x + CW / 2, y + 22, lines[0], a);
      if (lines[1]) text(s, x + CW / 2, y + 38, lines[1], a);
      text(s, x + CW / 2, y + 54, 'not in this course', { fill: SLATE, 'font-size': 10.5, 'font-style': 'italic' });
      return;
    }
    if (lines.length === 1) text(s, x + CW / 2, y + RH / 2 + 5, lines[0], a);
    else {
      text(s, x + CW / 2, y + RH / 2 - 4, lines[0], a);
      var b = { fill: a.fill };
      if (SP.where) { b.fill = dim && !hot ? DIM : SLATE; b['font-size'] = 11.5; } else if (hot) b['font-weight'] = 700;
      text(s, x + CW / 2, y + RH / 2 + 14, lines[1], b);
    }
  }
  cell(SP.cells[0][0], X1, Y1, SP.cells[0][1]);
  cell(SP.cells[1][0], X2, Y1, SP.cells[1][1]);
  cell(SP.cells[2][0], X1, Y2, SP.cells[2][1]);
  cell(SP.cells[3][0], X2, Y2, SP.cells[3][1]);

  /* footnotes */
  var YF = Y2 + RH + 24;
  E('circle', { cx: X1 + 48, cy: YF - 4, r: 2.5, fill: BLUE }, s);
  text(s, X1 + 58, YF, SP.foot[0], { fill: BLUE, 'text-anchor': 'start', 'font-size': 12.5 });
  E('circle', { cx: X2 + 30, cy: YF - 4, r: 2.5, fill: RED }, s);
  text(s, X2 + 40, YF, SP.foot[1], { fill: RED, 'text-anchor': 'start', 'font-size': 12.5 });

  return { finish: function () {} };
});
