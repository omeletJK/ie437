/* ============================================================
   widget: bayes-anatomy
   Redrawn from the source deck: Bayes' rule with each term named
   and pictured — a flat prior going in, a peaked posterior coming
   out, and the evidence sitting underneath as a normaliser.
   ============================================================ */
IE437.widget('bayes-anatomy', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706';

  function curve(w, h, fn, colour) {
    var sv = IE437.svg(w, h), pts = [];
    for (var i = 0; i <= 60; i++) {
      var t = i / 60, v = fn(t);
      pts.push([8 + t * (w - 16), h - 10 - v * (h - 22)]);
    }
    E('path', {
      d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') +
         'L' + (w - 8) + ' ' + (h - 10) + 'L8 ' + (h - 10) + 'Z',
      fill: colour, 'fill-opacity': .14, stroke: colour, 'stroke-width': 1.6
    }, sv);
    E('line', { x1: 6, y1: h - 10, x2: w - 4, y2: h - 10, stroke: INK, 'stroke-opacity': .35 }, sv);
    E('line', { x1: 8, y1: 6, x2: 8, y2: h - 8, stroke: INK, 'stroke-opacity': .35 }, sv);
    return sv;
  }

  host.innerHTML =
    '<div class="wbody" style="padding:20px 18px;gap:0">' +
    '<div style="display:grid;grid-template-columns:auto auto auto;gap:0;align-items:stretch;' +
    'justify-content:center">' +

    /* --- posterior, left --- */
    '<div style="background:rgba(37,99,235,.07);padding:16px 20px;display:flex;flex-direction:column;gap:8px;' +
    'min-width:250px">' +
    '<div style="font:700 12px/1.4 var(--sans);color:' + BLUE + '">The posterior</div>' +
    '<div style="font:400 11.5px/1.5 var(--sans);color:var(--ink2)">the probability of the parameter ' +
    '<i>&theta;</i> given the evidence (data)</div>' +
    '<div style="display:flex;align-items:flex-end;gap:8px;margin-top:2px">' +
    '<span style="font:italic 13px/1 var(--serif);color:' + BLUE + '">p(&theta;|data)</span>' +
    '<span data-post></span></div></div>' +

    /* --- the equation --- */
    '<div style="display:flex;align-items:center;gap:12px;padding:16px 24px;background:rgba(22,24,29,.03)">' +
    '<span style="font:italic 22px/1 var(--serif);color:' + BLUE + '">p(&theta;|data)</span>' +
    '<span style="font:400 22px/1 var(--serif)">=</span>' +
    '<span style="display:flex;flex-direction:column;align-items:center;gap:5px">' +
    '<span style="font:italic 19px/1 var(--serif)"><span style="color:' + GREEN + '">p(data|&theta;)</span>' +
    '<span style="color:' + AMBER + '">&thinsp;p(&theta;)</span></span>' +
    '<span style="height:1.5px;background:var(--ink);align-self:stretch"></span>' +
    '<span style="font:italic 19px/1 var(--serif)">p(data)</span></span></div>' +

    /* --- prior, right --- */
    '<div style="background:rgba(217,119,6,.08);padding:16px 20px;display:flex;flex-direction:column;gap:8px;' +
    'min-width:230px">' +
    '<div style="font:700 12px/1.4 var(--sans);color:' + AMBER + '">The prior</div>' +
    '<div style="font:400 11.5px/1.5 var(--sans);color:var(--ink2)">the belief about <i>&theta;</i> ' +
    'before any data</div>' +
    '<div style="display:flex;align-items:flex-end;gap:8px;margin-top:2px">' +
    '<span style="font:italic 13px/1 var(--serif);color:' + AMBER + '">p(&theta;)</span>' +
    '<span data-prior></span></div></div>' +
    '</div>' +

    /* --- the two remaining terms --- */
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:20px;max-width:820px;' +
    'align-self:center">' +
    '<div style="border-top:2px solid ' + GREEN + ';padding-top:11px">' +
    '<b style="font:700 12px/1.4 var(--sans);color:' + GREEN + '">The likelihood</b>' +
    '<div style="font:400 12.5px/1.55 var(--sans);color:var(--ink2);margin-top:3px">how probable this data is ' +
    'under each candidate <i>&theta;</i> — the only place the measurement enters</div></div>' +
    '<div style="border-top:2px solid var(--ink3);padding-top:11px">' +
    '<b style="font:700 12px/1.4 var(--sans)">The evidence &mdash; a normaliser</b>' +
    '<div style="font:400 12.5px/1.55 var(--sans);color:var(--ink2);margin-top:3px">' +
    'p(data) = &int; p(data|&theta;) p(&theta;) d&theta;, the probability of the data over every ' +
    'possibility. It does not depend on <i>&theta;</i>, which is why ' +
    '<b>posterior &prop; likelihood &times; prior</b> is usually enough</div></div>' +
    '</div></div>';

  host.querySelector('[data-post]').appendChild(
    curve(112, 54, function (t) { return Math.exp(-Math.pow((t - 0.42) / 0.16, 2)); }, BLUE));
  host.querySelector('[data-prior]').appendChild(
    curve(112, 54, function (t) { return (t > 0.06 && t < 0.94) ? 0.62 : 0; }, AMBER));

  return {};
});
