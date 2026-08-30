/* ============================================================
   widget: influence-diagram
   Examples 3.4 and 3.5 of the source deck, live.  A Bayesian
   network (prize, income) plus a decision node (do the PhD?) plus
   two utility nodes.  Pick an action and the expected utility is
   computed by the machinery of Acts 1-3.  Then switch on the
   second decision and the recommendation reverses — without a
   single utility number changing, because one edge moved.
   Every figure here is the source deck's own, reproduced exactly.
   ============================================================ */
IE437.widget('influence-diagram', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545',
      GREEN = '#16A34A', AMBER = '#D97706', SLATE = '#64748B';

  var UC = { phd: -50000, no: 0 };
  var UB = { low: 100000, avg: 200000, high: 500000 };
  var US = { yes: -200000, no: 0 };
  var pPrize = { phd: 0.001, no: 0.0000001 };
  var INC = ['low', 'avg', 'high'];

  var I34 = {                                     // p(I | E, P)   — Example 3.4
    'phd|prize': { low: 0.01, avg: 0.04, high: 0.95 },
    'phd|none':  { low: 0.10, avg: 0.50, high: 0.40 },
    'no|prize':  { low: 0.01, avg: 0.04, high: 0.95 },
    'no|none':   { low: 0.20, avg: 0.60, high: 0.20 }
  };
  var I35 = {                                     // p(I | S, P)   — Example 3.5
    'yes|prize': { low: 0.005, avg: 0.005, high: 0.99 },
    'yes|none':  { low: 0.10, avg: 0.50, high: 0.40 },
    'no|prize':  { low: 0.05, avg: 0.15, high: 0.80 },
    'no|none':   { low: 0.20, avg: 0.60, high: 0.20 }
  };

  var startup = false, pick = 'phd';

  /* expected utility of the education decision, with the branch detail */
  function EU(e) {
    var total = 0, rows = [];
    ['prize', 'none'].forEach(function (P) {
      var pp = (P === 'prize') ? pPrize[e] : 1 - pPrize[e];
      var inner, best = null;
      if (!startup) {
        var t = I34[e + '|' + P]; inner = 0;
        INC.forEach(function (i) { inner += t[i] * (UC[e] + UB[i]); });
      } else {
        inner = -Infinity;
        ['yes', 'no'].forEach(function (S) {
          var t = I35[S + '|' + P], v = 0;
          INC.forEach(function (i) { v += t[i] * (UC[e] + UB[i] + US[S]); });
          if (v > inner) { inner = v; best = S; }
        });
      }
      total += pp * inner;
      rows.push({ P: P, p: pp, inner: inner, best: best });
    });
    return { total: total, rows: rows };
  }

  function money(v) {
    var s = Math.round(Math.abs(v)).toLocaleString();
    return (v < 0 ? '−' : '') + s;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Should I do a PhD?</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-a="phd">do PhD</button>' +
    '<button class="wb" data-a="no">no PhD</button>' +
    '<button class="wb" data-su>+ start-up decision</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:flex-start">' +
    '<div data-g style="flex:none"></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:9px">' +
    '<div data-bars></div>' +
    '<div data-break style="border-top:1px solid rgba(22,24,29,.14);padding-top:9px"></div>' +
    '<div data-mdp style="border-top:1px solid rgba(22,24,29,.14);padding-top:9px;' +
    'font:400 11.5px/1.5 var(--sans);color:var(--ink3)"></div>' +
    '</div></div>';

  var GW = 392, GH = 262;
  var sv = IE437.svg(GW, GH);
  host.querySelector('[data-g]').appendChild(sv);

  var POS = {
    E:  { x: 52,  y: 46,  kind: 'dec',  lab: 'E',   cap: 'PhD?' },
    UC: { x: 52,  y: 150, kind: 'util', lab: 'U_C', cap: 'cost' },
    P:  { x: 168, y: 46,  kind: 'ch',   lab: 'P',   cap: 'prize?' },
    I:  { x: 168, y: 144, kind: 'ch',   lab: 'I',   cap: 'income' },
    UB: { x: 168, y: 218, kind: 'util', lab: 'U_B', cap: 'benefit' },
    S:  { x: 306, y: 46,  kind: 'dec',  lab: 'S',   cap: 'start-up?' },
    US: { x: 306, y: 144, kind: 'util', lab: 'U_S', cap: 'cost' }
  };

  function edge(a, b, colour, dashed) {
    var A = POS[a], B = POS[b];
    var dx = B.x - A.x, dy = B.y - A.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L, r = 24;
    E('line', { x1: A.x + ux * r, y1: A.y + uy * r, x2: B.x - ux * (r + 6), y2: B.y - uy * (r + 6),
      stroke: colour, 'stroke-opacity': dashed ? .7 : .85, 'stroke-width': 1.6,
      'stroke-dasharray': dashed ? '4 3' : '' }, sv);
    E('path', { d: 'M' + (B.x - ux * r) + ' ' + (B.y - uy * r) +
      'L' + (B.x - ux * (r + 8) - uy * 3.8) + ' ' + (B.y - uy * (r + 8) + ux * 3.8) +
      'L' + (B.x - ux * (r + 8) + uy * 3.8) + ' ' + (B.y - uy * (r + 8) - ux * 3.8) + 'Z',
      fill: colour, 'fill-opacity': .85 }, sv);
  }

  function node(key, on) {
    var d = POS[key], g = E('g', {}, sv);
    var col = d.kind === 'dec' ? BLUE : d.kind === 'util' ? RED : INK;
    var fill = d.kind === 'dec' ? 'rgba(37,99,235,.12)'
             : d.kind === 'util' ? 'rgba(214,69,69,.12)' : '#FBFBF9';
    if (!on) { col = SLATE; fill = 'transparent'; }
    if (d.kind === 'dec')
      E('rect', { x: d.x - 21, y: d.y - 17, width: 42, height: 34, fill: fill, stroke: col,
        'stroke-width': on ? 2 : 1.2, 'stroke-opacity': on ? 1 : .35 }, g);
    else if (d.kind === 'util')
      E('path', { d: 'M' + d.x + ' ' + (d.y - 21) + 'L' + (d.x + 21) + ' ' + d.y +
        'L' + d.x + ' ' + (d.y + 21) + 'L' + (d.x - 21) + ' ' + d.y + 'Z',
        fill: fill, stroke: col, 'stroke-width': on ? 2 : 1.2, 'stroke-opacity': on ? 1 : .35 }, g);
    else
      E('circle', { cx: d.x, cy: d.y, r: 19, fill: fill, stroke: col,
        'stroke-width': on ? 1.8 : 1.2, 'stroke-opacity': on ? 1 : .35 }, g);
    var parts = d.lab.split('_');
    var t = E('text', { x: d.x, y: d.y + 5, 'text-anchor': 'middle', 'font-size': 14,
      'font-style': 'italic', fill: on ? INK : SLATE, 'fill-opacity': on ? 1 : .5 }, g);
    t.textContent = parts[0];
    if (parts[1]) E('tspan', { 'font-size': 9, dy: 4, text: parts[1] }, t);
    E('text', { x: d.x, y: d.y + (d.kind === 'util' ? 34 : 32), 'text-anchor': 'middle',
      'font-size': 9.5, fill: INK, 'fill-opacity': on ? .5 : .25, text: d.cap }, g);
  }

  function drawGraph() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    edge('E', 'P', GREEN);
    edge('P', 'I', GREEN);
    if (!startup) edge('E', 'I', GREEN);
    edge('E', 'UC', RED);
    edge('I', 'UB', RED);
    if (startup) { edge('P', 'S', BLUE, true); edge('S', 'I', GREEN); edge('S', 'US', RED); }
    ['E', 'UC', 'P', 'I', 'UB'].forEach(function (k) { node(k, true); });
    node('S', startup); node('US', startup);

    /* legend, drawn rather than set in glyphs so no font can lose it */
    [['dec', BLUE, 'decision'], ['ch', INK, 'chance'], ['util', RED, 'utility']]
      .forEach(function (row, i) {
        var y = 198 + i * 22, x = 254;
        if (row[0] === 'dec')
          E('rect', { x: x - 7, y: y - 5, width: 14, height: 11, fill: 'none', stroke: row[1],
            'stroke-width': 1.4 }, sv);
        else if (row[0] === 'ch')
          E('circle', { cx: x, cy: y, r: 6.5, fill: 'none', stroke: row[1],
            'stroke-opacity': .6, 'stroke-width': 1.4 }, sv);
        else
          E('path', { d: 'M' + x + ' ' + (y - 7) + 'L' + (x + 7) + ' ' + y +
            'L' + x + ' ' + (y + 7) + 'L' + (x - 7) + ' ' + y + 'Z', fill: 'none',
            stroke: row[1], 'stroke-width': 1.4 }, sv);
        E('text', { x: x + 14, y: y + 3.5, 'font-size': 10, fill: INK, 'fill-opacity': .5,
          text: row[2] + ' node' }, sv);
      });
    if (startup)
      E('text', { x: 200, y: 13, 'text-anchor': 'middle', 'font-size': 9.5, fill: BLUE,
        'font-family': 'IBM Plex Mono, monospace', text: 'income now hangs off S, not E' }, sv);
  }

  function render() {
    drawGraph();
    var a = EU('phd'), b = EU('no');
    var best = a.total >= b.total ? 'phd' : 'no';
    var SCALE = 300000;

    function row(key, res, label) {
      var win = key === best, sel = key === pick;
      return '<div style="margin-bottom:9px;padding-left:8px;border-left:3px solid ' +
        (sel ? INK : 'transparent') + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
        '<span style="font:' + (win ? 700 : 400) + ' 12.5px/1.4 var(--sans);color:' +
        (win ? INK : 'var(--ink3)') + '">' + label +
        (win ? ' <span style="color:' + GREEN + ';font-weight:700">&#9664; choose</span>' : '') + '</span>' +
        '<span class="wnum" style="color:' + (win ? GREEN : SLATE) + '">' + money(res.total) + '</span></div>' +
        '<div style="height:12px;margin-top:4px;border:1px solid rgba(22,24,29,.14)">' +
        '<div style="height:100%;width:' + Math.max(0, Math.min(100, res.total / SCALE * 100)) +
        '%;background:' + (win ? GREEN : SLATE) + ';opacity:.5"></div></div></div>';
    }

    host.querySelector('[data-bars]').innerHTML =
      '<div class="wlabel" style="margin-bottom:7px">expected utility &nbsp;EU(E) = &Sigma;<sub>P</sub> ' +
      (startup ? 'max<sub>S</sub> ' : '') + '&Sigma;<sub>I</sub> p&middot;[U<sub>C</sub>+U<sub>B</sub>' +
      (startup ? '+U<sub>S</sub>' : '') + ']</div>' +
      row('phd', a, 'do the PhD') + row('no', b, 'do not');

    var res = pick === 'phd' ? a : b;
    var cells = res.rows.map(function (r) {
      return '<tr><td style="padding:2px 10px 2px 0">' +
        (r.P === 'prize' ? 'wins the prize' : 'no prize') + '</td>' +
        '<td style="padding:2px 10px 2px 0;font-family:var(--mono);color:var(--ink3)">p = ' +
        (r.p >= 0.9995 ? '≈ 1' : r.p < 0.001 ? r.p.toExponential(0) : r.p.toFixed(3)) + '</td>' +
        (startup ? '<td style="padding:2px 10px 2px 0;color:' + BLUE + '">start-up: ' +
          (r.best === 'yes' ? 'yes' : 'no') + '</td>' : '') +
        '<td style="padding:2px 0;text-align:right;font-family:var(--mono);font-weight:600">' +
        money(r.inner) + '</td></tr>';
    }).join('');

    host.querySelector('[data-break]').innerHTML =
      '<div class="wlabel" style="margin-bottom:5px">branch by branch &mdash; ' +
      (pick === 'phd' ? 'do the PhD' : 'do not') + '</div>' +
      '<table style="width:100%;border-collapse:collapse;font:400 11.5px/1.4 var(--sans)">' +
      cells + '</table>' +
      '<div style="display:flex;justify-content:space-between;margin-top:5px;padding-top:5px;' +
      'border-top:1px solid rgba(22,24,29,.14);font:400 12px/1.4 var(--sans)">' +
      '<span>weighted total</span><span class="wnum">' + money(res.total) + '</span></div>';

    host.querySelector('[data-mdp]').innerHTML = startup
      ? 'The start-up is never founded &mdash; <b>&ldquo;no&rdquo; wins the inner max in both branches</b> &mdash; ' +
        'and yet the answer flipped. No utility number changed; the income node simply stopped ' +
        'depending on <i>E</i>, so the doctorate’s only route to income is a 0.001 chance at the prize.'
      : '<b>Read it as one step of an MDP.</b> <i>E</i> is the action <i>a</i>, ' +
        '(<i>P</i>, <i>I</i>) is the next state <i>s&prime;</i>, ' +
        '<i>U</i><sub>C</sub>+<i>U</i><sub>B</sub> is the reward, and ' +
        '<b>argmax<sub>E</sub> EU</b> is a Bellman backup with the horizon set to one.';

    host.querySelectorAll('[data-a]').forEach(function (btn) {
      btn.classList.toggle('on', btn.getAttribute('data-a') === pick);
    });
    host.querySelector('[data-su]').classList.toggle('on', startup);
  }

  host.querySelectorAll('[data-a]').forEach(function (btn) {
    btn.onclick = function () { pick = btn.getAttribute('data-a'); render(); };
  });
  host.querySelector('[data-su]').onclick = function () { startup = !startup; render(); };

  render();
  return { finish: function () { startup = false; pick = 'phd'; render(); } };
});
