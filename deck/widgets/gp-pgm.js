/* ============================================================
   widget: gp-pgm                                   (Chapter 4, Act 2)
   A redrawing of the graphical model on p. 14 of the Lecture 2 source
   deck ("Bayesian Inference Problems"), with theta replaced by the
   GP's latent function values. Not a simulation: it is the picture
   that makes GP regression read as Lecture 2's posterior predictive.

     latent, jointly Gaussian under the GP prior:  f_1 ... f_n , f*
     observed through independent noise:           f_i -> y_i
     query, never observed:                        f*

   The claim it carries is the conditional independence the integral
   needs:  f* is independent of y given f  — so p(f* | x*, f, y) is
   just p(f* | x*, f), and y enters only through p(f | X, y).
   ============================================================ */
IE437.widget('gp-pgm', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', SLATE = '#64748B', PANEL2 = '#E7E7E1';
  var W = 980, H = 300;

  host.innerHTML =
    '<div class="wbody" style="padding:12px 12px 8px;align-items:center"><div data-c></div></div>';
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);

  var defs = E('defs', {}, sv);
  var mk = E('marker', { id: 'gpp-ah', viewBox: '0 0 10 10', refX: 9, refY: 5,
    markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  E('path', { d: 'M0 0L10 5L0 10z', fill: INK, 'fill-opacity': .75 }, mk);

  function txt(x, y, s, o) {
    o = o || {};
    var n = E('text', { x: x, y: y, 'text-anchor': o.anchor || 'middle',
      'font-size': o.size || 15, 'font-weight': o.weight || 400,
      fill: o.fill || INK, 'fill-opacity': o.op === undefined ? 1 : o.op, text: s }, sv);
    n.setAttribute('font-family', o.mono ? 'IBM Plex Mono, monospace'
      : (o.serif ? 'Source Serif 4, Georgia, serif' : 'Inter, sans-serif'));
    if (o.italic) n.setAttribute('font-style', 'italic');
    if (o.ls) n.setAttribute('letter-spacing', o.ls);
    return n;
  }
  function node(cx, cy, label, kind) {
    var obs = kind === 'obs', q = kind === 'query';
    E('circle', { cx: cx, cy: cy, r: 27,
      fill: obs ? PANEL2 : '#FFFFFF',
      stroke: q ? BLUE : INK, 'stroke-width': q ? 2.2 : 1.4,
      'stroke-opacity': q ? 1 : .8 }, sv);
    txt(cx, cy + 6, label, { size: 18, italic: true, serif: true, fill: q ? BLUE : INK });
  }
  function arrow(x1, y1, x2, y2) {
    E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: INK, 'stroke-opacity': .7,
      'stroke-width': 1.4, 'marker-end': 'url(#gpp-ah)' }, sv);
  }

  /* columns: three training points, an ellipsis, the n-th, a gap, then the query */
  var cols = [
    { x: 150, f: 'f₁', y: 'y₁', xl: 'x₁' },
    { x: 270, f: 'f₂', y: 'y₂', xl: 'x₂' },
    { x: 390, f: '⋯', y: '⋯', xl: '', dots: true },
    { x: 510, f: 'fₙ', y: 'yₙ', xl: 'xₙ' }
  ];
  var QX = 760, FY = 118, YY = 238, XY = 34;

  /* the GP prior couples every latent value, training and query alike */
  E('rect', { x: 92, y: FY - 50, width: QX + 60 - 92, height: 100, rx: 14,
    fill: 'none', stroke: SLATE, 'stroke-width': 1.3, 'stroke-dasharray': '6 5' }, sv);
  txt(QX + 70, FY - 34, 'GP prior 𝒢𝒫(m, k)', { anchor: 'start', size: 13, weight: 600, fill: SLATE });
  txt(QX + 70, FY - 16, 'every latent value', { anchor: 'start', size: 12, fill: SLATE });
  txt(QX + 70, FY + 0, 'is jointly Gaussian', { anchor: 'start', size: 12, fill: SLATE });

  cols.forEach(function (c) {
    if (c.dots) {
      txt(c.x, FY + 6, '⋯', { size: 22, op: .6 });
      txt(c.x, YY + 6, '⋯', { size: 22, op: .6 });
      return;
    }
    txt(c.x, XY, c.xl, { size: 14, italic: true, serif: true, op: .6 });
    arrow(c.x, XY + 8, c.x, FY - 30);
    node(c.x, FY, c.f, 'latent');
    arrow(c.x, FY + 27, c.x, YY - 30);
    node(c.x, YY, c.y, 'obs');
  });

  /* the query: an input we choose, a latent value we want, and no observation */
  txt(QX, XY, 'x*', { size: 14, italic: true, serif: true, fill: BLUE });
  arrow(QX, XY + 8, QX, FY - 30);
  node(QX, FY, 'f*', 'query');
  E('circle', { cx: QX, cy: YY, r: 27, fill: 'none', stroke: INK, 'stroke-opacity': .25,
    'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, sv);
  txt(QX, YY + 5, 'not observed', { size: 11, mono: true, op: .45 });

  /* the brace labels under the rows */
  txt(330, YY + 50, 'observed  𝐲 = (y₁, …, yₙ)', { size: 13, weight: 600 });
  txt(QX, YY + 50, 'the query', { size: 13, weight: 600, fill: BLUE });
  txt(40, FY + 5, 'latent', { anchor: 'start', size: 11, mono: true, op: .5, ls: '.08em' });
  txt(40, YY + 5, 'data', { anchor: 'start', size: 11, mono: true, op: .5, ls: '.08em' });

  /* the conditional independence the integral relies on */
  txt(QX + 70, YY - 8, 'f* ⊥ 𝐲  |  𝐟', { anchor: 'start', size: 16, italic: true, serif: true, fill: BLUE });
  txt(QX + 70, YY + 14, 'y reaches f* only', { anchor: 'start', size: 12, fill: SLATE });
  txt(QX + 70, YY + 30, 'through 𝐟', { anchor: 'start', size: 12, fill: SLATE });

  return { finish: function () {} };
});
