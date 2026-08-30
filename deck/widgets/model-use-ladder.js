/* ============================================================
   widget: model-use-ladder
   A redrawing of the organising figure of the source deck
   (pp. 2-8): four ways to get from data to a decision, with the
   dynamics model made progressively less explicit. The deck walks
   it one row at a time; so does this. Nothing is simulated — the
   picture *is* the argument, and the two bars on the right read
   off the trade the act is about.
   ============================================================ */
IE437.widget('model-use-ladder', function (host) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', SLATE = '#64748B';

  var ROWS = [
    { key: 'oc',  name: 'Analytical Optimal Control', sub: '',
      data: false, model: 'Analytical\ndynamic model', kind: 'given', plan: true, policy: true,
      where: 'Lecture 9', struct: 1.00, risk: 0.10,
      note: 'The model is <b>handed to you</b>, so no data is needed at all. Riccati, HJB, Pontryagin — everything Lecture 9 solved exactly.' },
    { key: 'two', name: '2-stage Model-Based RL', sub: 'model building + planning / control',
      data: true, model: 'Data-driven\ndynamic model', kind: 'fit', plan: true, policy: true,
      where: 'Acts 2 and 4', struct: 0.78, risk: 0.85,
      note: 'Fit <b>f<sub>&theta;</sub></b> to transitions, then plan or derive a policy inside it. The model is trained on a <b>prediction</b> loss — task-independent, data-dependent.' },
    { key: 'e2e', name: 'End-to-end Model-Based RL', sub: 'dynamics as an inductive bias',
      data: true, model: 'Inductive biases\non dynamics', kind: 'bias', plan: true, policy: true,
      where: 'Act 3', struct: 0.55, risk: 0.45,
      note: 'The dynamics constraint is <b>baked into the architecture</b> and the whole thing is trained on the <b>task</b> loss. Differentiable MPC lives here.' },
    { key: 'mf',  name: 'Model-Free RL', sub: '',
      data: true, model: 'dynamic model', kind: 'deleted', plan: false, policy: true,
      where: 'Lectures 8 and 10', struct: 0.06, risk: 0.05,
      note: 'The model is <b>deleted</b>. Nothing to get wrong — and nothing to plan in, which is why the planning box is gone. The price is paid in samples.' }
  ];

  var sel = 1;

  host.innerHTML =
    '<div class="wbar"><span class="wt">How much of the world do you make explicit</span>' +
    '<span class="wspacer"></span>' +
    ROWS.map(function (r, i) {
      return '<button class="wb" data-r="' + i + '">' + (i + 1) + ' &middot; ' + r.name.replace(/ Model-Based RL/, ' MBRL').replace('Analytical Optimal Control', 'analytical OC').replace('Model-Free RL', 'model-free') + '</button>';
    }).join('') + '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:22px;align-items:center;justify-content:center">' +
    '<div data-c></div>' +
    '<div style="width:276px;display:flex;flex-direction:column;gap:9px">' +
    '<div data-hd style="font:600 12.5px/1.3 var(--sans);color:var(--ink)"></div>' +
    '<div data-note style="font:400 12px/1.6 var(--sans);color:var(--ink3)"></div>' +
    '<div data-bars></div></div></div>';

  var CW = 604, CH = 292;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);
  var bars = IE437.svg(268, 74);
  host.querySelector('[data-bars]').appendChild(bars);

  var RH = 60, GAP = 7, TOP = 26;
  var LX = 2, LW = 156, DX = 172, DW = 62, MX = 252, MW = 116, PX = 392, PW = 96;

  function box(g, x, y, w, h, txt, fill, stroke, on, small) {
    E('rect', { x: x, y: y, width: w, height: h, rx: 2, fill: fill,
      'fill-opacity': on ? 1 : 0.32, stroke: stroke, 'stroke-width': on ? 1.5 : 1,
      'stroke-opacity': on ? 1 : 0.3 }, g);
    var lines = String(txt).split('\n');
    lines.forEach(function (L, i) {
      E('text', { x: x + w / 2, y: y + h / 2 + 3.5 - (lines.length - 1) * 5.5 + i * 11,
        'text-anchor': 'middle', 'font-size': small ? 8.5 : 9.5,
        fill: on ? INK : SLATE, 'fill-opacity': on ? 0.92 : 0.5, text: L }, g);
    });
  }
  function arrow(g, x1, y, x2, on, col) {
    E('line', { x1: x1, y1: y, x2: x2 - 5, y2: y, stroke: on ? col : SLATE,
      'stroke-opacity': on ? 0.95 : 0.28, 'stroke-width': on ? 2 : 1.2 }, g);
    E('path', { d: 'M' + (x2 - 5.5) + ' ' + (y - 3.4) + 'L' + x2 + ' ' + y + 'L' + (x2 - 5.5) + ' ' + (y + 3.4) + 'Z',
      fill: on ? col : SLATE, 'fill-opacity': on ? 0.95 : 0.28 }, g);
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    ['data', 'dynamics model', 'plan  /  policy'].forEach(function (t, i) {
      E('text', { x: [DX + DW / 2, MX + MW / 2, PX + PW / 2][i], y: 13, 'text-anchor': 'middle',
        'font-size': 8.5, 'letter-spacing': '.1em', fill: INK, 'fill-opacity': .4,
        'font-family': 'IBM Plex Mono, monospace', text: t.toUpperCase() }, sv);
    });
    E('line', { x1: LX, y1: 19, x2: CW - 2, y2: 19, stroke: INK, 'stroke-opacity': .12 }, sv);

    ROWS.forEach(function (r, i) {
      var y = TOP + i * (RH + GAP), on = (i === sel), cy = y + RH / 2;
      var g = E('g', {}, sv);
      if (on) E('rect', { x: LX - 2, y: y - 4, width: CW - LX, height: RH + 8, rx: 3,
        fill: INK, 'fill-opacity': .045 }, g);
      /* the row label */
      E('text', { x: LX + 6, y: cy - (r.sub ? 4 : -3.5), 'font-size': 10,
        'font-weight': on ? 700 : 500, fill: on ? INK : SLATE, 'fill-opacity': on ? 1 : .6,
        text: r.name }, g);
      if (r.sub) E('text', { x: LX + 6, y: cy + 9, 'font-size': 8.5, 'font-style': 'italic',
        fill: on ? INK : SLATE, 'fill-opacity': on ? .55 : .45, text: r.sub }, g);

      /* data */
      box(g, DX, cy - 15, DW, 30, 'data', r.data ? GREEN : '#ffffff',
        r.data ? GREEN : SLATE, on && r.data, true);
      if (!r.data) E('line', { x1: DX + 8, y1: cy + 11, x2: DX + DW - 8, y2: cy + 11,
        stroke: SLATE, 'stroke-opacity': .35, 'stroke-dasharray': '2 2' }, g);
      arrow(g, DX + DW + 3, cy, MX - 2, on && r.data, r.kind === 'fit' ? BLUE : RED);

      /* the model box */
      if (r.kind === 'deleted') {
        E('rect', { x: MX, y: cy - 15, width: MW, height: 30, rx: 2, fill: INK,
          'fill-opacity': on ? .9 : .3 }, g);
        E('text', { x: MX + MW / 2, y: cy + 3.5, 'text-anchor': 'middle', 'font-size': 9,
          fill: '#fff', 'fill-opacity': on ? .95 : .6, text: 'dynamic model' }, g);
        E('line', { x1: MX + 8, y1: cy, x2: MX + MW - 8, y2: cy, stroke: '#fff',
          'stroke-opacity': on ? .8 : .4, 'stroke-width': 1.4 }, g);
      } else {
        box(g, MX, cy - 19, MW, 38, r.model,
          r.kind === 'given' ? BLUE : (r.kind === 'fit' ? BLUE : '#ffffff'),
          BLUE, on, true);
        if (r.kind !== 'deleted') E('rect', { x: MX, y: cy - 19, width: MW, height: 38, rx: 2,
          fill: 'none', stroke: BLUE, 'stroke-opacity': on ? 1 : .3,
          'stroke-width': on ? 1.5 : 1, 'stroke-dasharray': r.kind === 'bias' ? '4 2.5' : '' }, g);
      }

      /* planning / policy */
      arrow(g, MX + MW + 3, r.plan ? cy - 11 : cy, PX - 2, on, RED);
      if (r.plan) {
        box(g, PX, cy - 24, PW, 21, 'planning', RED, RED, on, true);
        box(g, PX, cy + 3, PW, 21, 'policy', RED, RED, on, true);
        arrow(g, MX + MW + 3, cy + 13, PX - 2, on, RED);
      } else {
        box(g, PX, cy - 11, PW, 22, 'policy', RED, RED, on, true);
      }
      /* the greyed-out planning slot on the model-free row */
      if (!r.plan) E('text', { x: PX + PW / 2, y: cy - 17, 'text-anchor': 'middle',
        'font-size': 8, 'font-style': 'italic', fill: SLATE, 'fill-opacity': on ? .65 : .3,
        text: 'nothing to plan in' }, g);

      E('text', { x: CW - 4, y: cy + 3.5, 'text-anchor': 'end', 'font-size': 8.5,
        'font-family': 'IBM Plex Mono, monospace', fill: INK,
        'fill-opacity': on ? .55 : .22, text: r.where }, g);
    });

    /* ---- the two bars, read off the selected row ---- */
    while (bars.firstChild) bars.removeChild(bars.firstChild);
    var r = ROWS[sel];
    [['structure made explicit', r.struct, BLUE], ['exposure to model bias', r.risk, RED]]
      .forEach(function (b, i) {
        var y = 14 + i * 34;
        E('text', { x: 0, y: y - 4, 'font-size': 8.5, 'letter-spacing': '.09em',
          'font-family': 'IBM Plex Mono, monospace', fill: INK, 'fill-opacity': .45,
          text: b[0].toUpperCase() }, bars);
        E('rect', { x: 0, y: y, width: 268, height: 9, rx: 1.5, fill: INK, 'fill-opacity': .07 }, bars);
        E('rect', { x: 0, y: y, width: Math.max(3, 268 * b[1]), height: 9, rx: 1.5,
          fill: b[2], 'fill-opacity': .85 }, bars);
      });

    host.querySelector('[data-hd]').innerHTML = r.name +
      ' <span style="color:var(--ink4);font-weight:400">&middot; ' + r.where + '</span>';
    host.querySelector('[data-note]').innerHTML = r.note;
    Array.prototype.forEach.call(host.querySelectorAll('[data-r]'), function (b, i) {
      b.classList.toggle('on', i === sel);
    });
  }

  Array.prototype.forEach.call(host.querySelectorAll('[data-r]'), function (b) {
    b.onclick = function () { sel = +b.getAttribute('data-r'); draw(); };
  });

  draw();
  return { finish: function () { sel = 1; draw(); } };
});
