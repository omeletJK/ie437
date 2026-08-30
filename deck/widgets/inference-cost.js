/* ============================================================
   widget: inference-cost
   The claim of Act 3, made arithmetic.  Query P(x1 | xn = 1) on a
   chain x1 -> x2 -> ... -> xn.  Enumerating the joint sums over
   every assignment of the n-2 hidden variables: 2^(n-2) terms.
   Variable elimination sums each hidden variable out once into a
   2x2 table: a fixed cost per variable.  Both compute the same
   number; only one of them finishes.
   ============================================================ */
IE437.widget('inference-cost', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', SLATE = '#64748B';
  var NMIN = 4, NMAX = 20, n = 8;

  /* naive enumeration: 2^(n-2) assignments of the hidden variables, for each of
     the two values of x1; each term is a product of n conditional factors. */
  function naiveTerms(n) { return Math.pow(2, n - 2); }
  function naiveMults(n) { return Math.pow(2, n - 1) * (n - 1); }
  /* variable elimination: n-2 eliminations, each a 2x2 output table whose every
     cell is a sum of two products; then one product with p(x1). */
  function veMults(n) { return 8 * (n - 2) + 2; }

  function ratio(r) {
    return r < 1.5 ? 'about level' : r < 100 ? r.toFixed(1) + '&times;' : fmt(r) + '&times;';
  }
  function fmt(v) {
    return v >= 1e9 ? (v / 1e9).toFixed(1) + 'B'
         : v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M'
         : v >= 1e3 ? (v / 1e3).toFixed(v >= 1e4 ? 0 : 1) + 'K'
         : String(Math.round(v));
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Same answer, two costs</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">chain length</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-dn>&minus;</button><button class="wb" data-up>+</button></div>' +
    '<div class="wbody" style="gap:12px">' +
    '<div data-chain style="align-self:center"></div>' +
    '<div style="display:flex;gap:22px;align-items:flex-start">' +
    '<div data-stats style="flex:1;min-width:0"></div>' +
    '<div data-chart style="flex:none"></div>' +
    '</div></div>';

  var KW = 700, KH = 66;
  var chain = IE437.svg(KW, KH);
  host.querySelector('[data-chain]').appendChild(chain);

  var CW = 430, CH = 178;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-chart]').appendChild(sv);

  function drawChain() {
    while (chain.firstChild) chain.removeChild(chain.firstChild);
    var pad = 26, span = KW - 2 * pad, r = Math.min(13, span / (n * 2.6));
    var y = 30;
    for (var i = 0; i < n; i++) {
      var x = pad + (n === 1 ? 0 : span * i / (n - 1));
      if (i > 0) {
        var xp = pad + span * (i - 1) / (n - 1);
        E('line', { x1: xp + r, y1: y, x2: x - r - 4, y2: y, stroke: INK,
          'stroke-opacity': .35, 'stroke-width': 1.3 }, chain);
        E('path', { d: 'M' + (x - r) + ' ' + y + 'L' + (x - r - 5) + ' ' + (y - 3) +
          'L' + (x - r - 5) + ' ' + (y + 3) + 'Z', fill: INK, 'fill-opacity': .45 }, chain);
      }
      var first = i === 0, last = i === n - 1;
      E('circle', { cx: x, cy: y, r: r,
        fill: first ? 'rgba(214,69,69,.15)' : last ? 'rgba(37,99,235,.18)' : '#FBFBF9',
        stroke: first ? RED : last ? BLUE : INK,
        'stroke-opacity': (first || last) ? 1 : .45, 'stroke-width': (first || last) ? 2 : 1.3 }, chain);
      if (first || last || n <= 10)
        E('text', { x: x, y: y + r + 15, 'text-anchor': 'middle', 'font-size': 9.5,
          fill: INK, 'fill-opacity': (first || last) ? .8 : .45,
          'font-family': 'IBM Plex Mono, monospace', text: 'x' + (i + 1) }, chain);
    }
    E('text', { x: pad, y: 12, 'font-size': 10, fill: RED, 'font-weight': 700,
      'font-family': 'IBM Plex Mono, monospace', text: 'QUERY' }, chain);
    E('text', { x: KW - pad, y: 12, 'text-anchor': 'end', 'font-size': 10, fill: BLUE,
      'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', text: 'EVIDENCE  xₙ = 1' }, chain);
    E('text', { x: KW / 2, y: 12, 'text-anchor': 'middle', 'font-size': 10, fill: INK,
      'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace',
      text: (n - 2) + ' hidden' }, chain);
  }

  function drawChart() {
    var a = [], b = [], i;
    for (i = NMIN; i <= NMAX; i++) {
      a.push([i, Math.log10(naiveMults(i))]);
      b.push([i, Math.log10(veMults(i))]);
    }
    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 40, r: 10, t: 12, b: 30 },
      xdom: [NMIN, NMAX], ydom: [0, 8],
      yticks: [0, 2, 4, 6, 8], yfmt: function (v) { return fmt(Math.pow(10, v)); },
      xticks: [4, 8, 12, 16, 20], xlabel: 'chain length n   ·   multiplications',
      series: [{ pts: a, color: RED, w: 2.2 }, { pts: b, color: BLUE, w: 2.2 }]
    });
    E('line', { x1: m.X(n), y1: m.Y(0), x2: m.X(n), y2: m.Y(8), stroke: INK,
      'stroke-opacity': .3, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, sv);
    E('circle', { cx: m.X(n), cy: m.Y(Math.log10(naiveMults(n))), r: 4, fill: RED }, sv);
    E('circle', { cx: m.X(n), cy: m.Y(Math.log10(veMults(n))), r: 4, fill: BLUE }, sv);
  }

  function tile(colour, head, big, lines) {
    return '<div style="border-top:2px solid ' + colour + ';padding-top:9px;flex:1;min-width:0">' +
      '<div style="font:700 11px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;' +
      'color:' + colour + '">' + head + '</div>' +
      '<div style="font:700 25px/1.15 var(--mono);color:' + INK + ';margin:6px 0 4px;' +
      'font-variant-numeric:tabular-nums">' + big + '</div>' +
      '<div style="font:400 11.5px/1.55 var(--sans);color:var(--ink3)">' + lines + '</div></div>';
  }

  function render() {
    drawChain(); drawChart();
    host.querySelector('[data-n]').textContent = 'n = ' + n;
    host.querySelector('[data-up]').disabled = n >= NMAX;
    host.querySelector('[data-dn]').disabled = n <= NMIN;

    var nm = naiveMults(n), vm = veMults(n);
    host.querySelector('[data-stats]').innerHTML =
      '<div style="display:flex;gap:20px">' +
      tile(RED, 'enumerate the joint', fmt(nm) + ' &times;',
        '<b>' + naiveTerms(n).toLocaleString() + '</b> terms in the sum — one per assignment of the ' +
        (n - 2) + ' hidden variables — each a product of ' + n + ' factors.<br>' +
        '<span style="color:' + RED + '">Doubles with every variable added.</span>') +
      tile(BLUE, 'variable elimination', fmt(vm) + ' &times;',
        '<b>' + (n - 2) + '</b> eliminations, each summing one variable out into a 2&times;2 table.<br>' +
        '<span style="color:' + BLUE + '">Grows by 8 with every variable added.</span>') +
      '</div>' +
      '<div style="margin-top:11px;border-top:1px solid rgba(22,24,29,.14);padding-top:9px;' +
      'font:400 12.5px/1.5 var(--sans);color:var(--ink2)">' +
      'Both return the identical posterior. Elimination is <b>' +
      ratio(nm / vm) + '</b> cheaper at n = ' + n +
      ' <span style="color:' + SLATE + '">— because on a chain every intermediate factor couples ' +
      'only two variables. Choose a worse order and the factors grow; that is the whole difficulty.</span></div>';
  }

  host.querySelector('[data-up]').onclick = function () { n = Math.min(NMAX, n + 1); render(); };
  host.querySelector('[data-dn]').onclick = function () { n = Math.max(NMIN, n - 1); render(); };

  render();
  return { finish: function () { n = 20; render(); } };
});
