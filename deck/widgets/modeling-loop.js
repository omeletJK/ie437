/* ============================================================
   widget: modeling-loop
   Redrawn from the source deck: a real system becomes a formal
   model, a formal model becomes an algorithm — and the two
   questions that police the arrows.  Validation asks whether the
   model is the right one; verification asks whether the algorithm
   really solves it.  Data helps on the left, not only the right.
   ============================================================ */
IE437.widget('modeling-loop', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', GREEN = '#16A34A', GREY = 'rgba(22,24,29,.42)';
  var W = 820, H = 326;

  host.innerHTML =
    '<div class="wbody" style="align-items:center;gap:6px;padding-top:16px"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  function panel(x, y, w, h, head) {
    E('text', { x: x + w / 2, y: y - 12, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700,
      fill: INK, text: head }, sv);
    return E('rect', { x: x, y: y, width: w, height: h, fill: '#FBFBF9', stroke: INK,
      'stroke-opacity': .3 }, sv);
  }
  function fatArrow(x1, x2, y, colour, label) {
    E('line', { x1: x1, y1: y, x2: x2 - 12, y2: y, stroke: colour, 'stroke-width': 7,
      'stroke-linecap': 'butt' }, sv);
    E('path', { d: 'M' + x2 + ' ' + y + 'L' + (x2 - 14) + ' ' + (y - 9) + 'L' + (x2 - 14) + ' ' + (y + 9) + 'Z',
      fill: colour }, sv);
    E('text', { x: (x1 + x2) / 2, y: y - 18, 'text-anchor': 'middle', 'font-size': 13,
      'font-weight': 700, fill: colour, text: label }, sv);
  }

  /* --- three panels ------------------------------------------------ */
  panel(30, 46, 190, 124, 'Real-world task');
  E('circle', { cx: 125, cy: 108, r: 42, fill: 'none', stroke: GREEN, 'stroke-width': 2 }, sv);
  E('text', { x: 125, y: 113, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700,
    fill: INK, text: 'Systems' }, sv);

  panel(315, 46, 190, 124, 'Formal task (model)');
  E('text', { x: 410, y: 100, 'text-anchor': 'middle', 'font-size': 13, fill: INK,
    'fill-opacity': .55, 'font-family': 'IBM Plex Mono, monospace', text: 'objective · variables' }, sv);
  E('text', { x: 410, y: 118, 'text-anchor': 'middle', 'font-size': 13, fill: INK,
    'fill-opacity': .55, 'font-family': 'IBM Plex Mono, monospace', text: 'constraints' }, sv);
  E('text', { x: 410, y: 148, 'text-anchor': 'middle', 'font-size': 15, fill: INK,
    'font-style': 'italic', text: 'maxₓ Σ Pᵢ(x; θ, U)' }, sv);

  panel(600, 46, 190, 124, 'Algorithm (program)');
  (function () {                                  // a small response-surface sketch
    var g = E('g', {}, sv);
    for (var i = 0; i < 5; i++) {
      E('path', {
        d: 'M 620 ' + (150 - i * 8) + ' Q 695 ' + (92 - i * 15) + ' 770 ' + (150 - i * 8),
        fill: 'none', stroke: BLUE, 'stroke-opacity': .18 + i * 0.11, 'stroke-width': 1.4
      }, g);
    }
    E('path', { d: 'M 695 74 l 5 10 11 1 -8 8 2 11 -10 -6 -10 6 2 -11 -8 -8 11 -1 z',
      fill: RED, 'fill-opacity': .85 }, g);
  })();

  fatArrow(228, 306, 108, BLUE, 'Modeling');
  fatArrow(513, 591, 108, RED, 'Solving');

  /* --- validation / verification, as the wide bands of the source --- */
  var BAND = 13;                                  // half-height of a band
  function span(x1, x2, y, title, question) {
    E('path', {
      d: 'M' + x1 + ' ' + y +
         'L' + (x1 + 22) + ' ' + (y - BAND - 6) + 'L' + (x1 + 22) + ' ' + (y - BAND) +
         'L' + (x2 - 22) + ' ' + (y - BAND) + 'L' + (x2 - 22) + ' ' + (y - BAND - 6) +
         'L' + x2 + ' ' + y +
         'L' + (x2 - 22) + ' ' + (y + BAND + 6) + 'L' + (x2 - 22) + ' ' + (y + BAND) +
         'L' + (x1 + 22) + ' ' + (y + BAND) + 'L' + (x1 + 22) + ' ' + (y + BAND + 6) + 'Z',
      fill: GREY
    }, sv);
    E('text', { x: (x1 + x2) / 2, y: y + 5, 'text-anchor': 'middle', 'font-size': 13.5,
      'font-weight': 700, fill: '#FBFBF9', 'letter-spacing': .3, text: title }, sv);
    E('text', { x: (x1 + x2) / 2, y: y + 38, 'text-anchor': 'middle', 'font-size': 12.5,
      'font-style': 'italic', fill: INK, 'fill-opacity': .62, text: question }, sv);
  }
  span(40, 400, 212, 'Validation', 'Are we building the right model?');
  span(420, 780, 212, 'Verification', 'Does the algorithm capture the model?');

  /* the loop back to the system */
  E('path', { d: 'M 782 250 L 782 296 L 46 296 L 46 262', fill: 'none', stroke: GREY,
    'stroke-width': 24, 'stroke-linejoin': 'round' }, sv);
  E('path', { d: 'M 46 234 L 28 262 L 64 262 Z', fill: GREY }, sv);
  E('text', { x: 420, y: 301, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600,
    fill: '#FBFBF9', text: 'Is this solution good for the target system?' }, sv);

  return {};
});
