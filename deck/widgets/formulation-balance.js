/* ============================================================
   widget: formulation-balance
   Redrawn from the source deck: formulation is the act of turning a
   real problem into a mathematical one, and it is always a trade —
   how much of the world the model still represents against how much
   of it a solver can still handle.
   ============================================================ */
IE437.widget('formulation-balance', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545';
  var W = 640, H = 322;

  host.innerHTML = '<div class="wbody" style="align-items:center;padding-top:14px"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function box(x, y, w, h, text, weight) {
    E('rect', { x: x, y: y, width: w, height: h, fill: '#FBFBF9', stroke: INK, 'stroke-width': 1.2 }, sv);
    var lines = text.split('|');
    lines.forEach(function (t, i) {
      E('text', { x: x + w / 2, y: y + h / 2 + 6 - (lines.length - 1) * 10 + i * 20,
        'text-anchor': 'middle', 'font-size': 15, 'font-weight': weight || 700, fill: INK, text: t }, sv);
    });
  }

  /* the real problem, and the act of formulating it */
  box(210, 16, 220, 52, 'Real-world problems');
  E('path', {
    d: 'M 282 74 L 358 74 L 358 148 L 386 148 L 320 210 L 254 148 L 282 148 Z',
    fill: BLUE, 'fill-opacity': .12, stroke: BLUE, 'stroke-opacity': .3
  }, sv);
  E('text', { x: 320, y: 126, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700,
    fill: BLUE, text: 'Formulation' }, sv);

  /* the beam it has to balance on */
  box(30, 148, 190, 56, 'Representability');
  box(420, 140, 190, 64, 'Mathematical|tractability');
  E('rect', { x: 26, y: 210, width: 588, height: 9, fill: INK, 'fill-opacity': .55 }, sv);
  E('path', { d: 'M 320 222 L 356 274 L 284 274 Z', fill: INK, 'fill-opacity': .55 }, sv);
  E('text', { x: 320, y: 302, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700,
    fill: RED, text: 'Balance!' }, sv);

  return {};
});
