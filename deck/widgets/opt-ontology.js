/* ============================================================
   widget: opt-ontology
   The knowledge a formulator needs before it can write a model.
   A problem class is not one object but four, and the ontology is
   what says how they attach to each other: which parameter a
   constraint reads, which table a parameter is drawn from, which
   objective term a phrase like "fuel cost" resolves to. Without
   it, "minimise cost under nine hours" is ambiguous; with it, the
   sentence has exactly one formulation.
   ============================================================ */
IE437.widget('opt-ontology', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', GREEN = '#16A34A', SLATE = '#64748B';
  var W = 880, HH = 244;

  var F = [
    { k: 'obj', x: 96,  y: 14,  c: GREEN, n: 'Objective',
      s: 'what “better” means',
      d: 'The terms that may appear in the objective, their units and their sign. ' +
         '<b>“Minimise fuel cost”</b> resolves to <code>Σ distance × ₩/km</code> &mdash; not to travel time, ' +
         'and not to driver wage, which are different terms the same sentence could have meant.',
      ex: 'fuel · travel time · wage · lateness · vehicles used' },
    { k: 'con', x: 588, y: 14,  c: AMBER, n: 'Constraints',
      s: 'what may not be violated',
      d: 'Each constraint carries its own <b>executable validator</b>, so a candidate decision can be checked ' +
         'rather than trusted. It also carries whether it is hard or soft &mdash; <b>“under nine hours”</b> is ' +
         'a legal limit, so it is hard, and a solution that breaks it is not a worse solution but a wrong one.',
      ex: 'capacity · time window · shift length · depot return' },
    { k: 'dat', x: 96,  y: 178, c: SLATE, n: 'Data',
      s: 'what the instance is made of',
      d: 'The contract with the customer&rsquo;s systems: which table, which key, which refresh rate, which ' +
         'units. This is the layer that decides whether the model can be run tomorrow morning at all, and it ' +
         'is where most industrial projects actually fail.',
      ex: 'orders · road network · fleet · depots · traffic' },
    { k: 'par', x: 588, y: 178, c: BLUE, n: 'Parameters',
      s: 'what is tuned, not decided',
      d: 'Coefficients the operation owns rather than the solver: the fuel price, the service-time allowance, ' +
         'the penalty for arriving late. They belong to the ontology because a change of parameter must not ' +
         'require a change of model &mdash; and because the Decision Wiki learns their values from use.',
      ex: '₩/km · service time · lateness penalty · speed factor' }
  ];
  var BW = 196, BH = 52;
  var CX = 440, CY = 122, CW = 176, CH = 56;

  var i = -1;   /* -1 = the whole picture */

  host.innerHTML =
    '<div class="wbar"><span class="wt">The ontology &mdash; four things a formulation needs to know</span>' +
    '<span class="wspacer"></span>' +
    F.map(function (f) { return '<button class="wb" data-f="' + f.k + '">' + f.n + '</button>'; }).join('') +
    '<button class="wb" data-rs>all</button></div>' +
    '<div class="wbody" style="gap:10px">' +
    '<div data-c style="display:flex;justify-content:center"></div>' +
    '<div style="border-top:1px solid rgba(22,24,29,.12);padding-top:9px;min-height:58px">' +
    '<div data-d style="font:400 12.5px/1.6 var(--sans);color:var(--ink2)"></div></div></div>';

  var sv = IE437.svg(W, HH);
  host.querySelector('[data-c]').appendChild(sv);

  function box(x, y, w, h, col, on, title, sub) {
    E('rect', { x: x, y: y, width: w, height: h, rx: 3, fill: '#FFFFFF',
      stroke: on ? col : INK, 'stroke-opacity': on ? 1 : .2,
      'stroke-width': on ? 2 : 1 }, sv);
    E('text', { x: x + w / 2, y: y + 22, 'text-anchor': 'middle', 'font-family': 'Inter, sans-serif',
      'font-size': 13.5, 'font-weight': 600, fill: INK, 'fill-opacity': on ? 1 : .5, text: title }, sv);
    if (sub) E('text', { x: x + w / 2, y: y + 39, 'text-anchor': 'middle',
      'font-family': 'IBM Plex Mono, monospace', 'font-size': 9, 'letter-spacing': .5,
      fill: on ? col : INK, 'fill-opacity': on ? .95 : .32, text: sub }, sv);
  }

  function draw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);

    /* spokes first, so the boxes sit on top of them */
    F.forEach(function (f, k) {
      var on = (i < 0 || i === k);
      var fx = f.x + BW / 2, fy = f.y + (f.y < CY ? BH : 0);
      var tx = CX + (f.x < CX ? -CW / 2 : CW / 2), ty = CY + (f.y < CY ? -6 : 6);
      E('path', { d: 'M' + fx + ' ' + fy + 'C' + fx + ' ' + (fy + (f.y < CY ? 34 : -34)) +
        ' ' + tx + ' ' + ty + ' ' + tx + ' ' + ty,
        fill: 'none', stroke: on ? f.c : INK, 'stroke-opacity': on ? .55 : .13,
        'stroke-width': on ? 1.8 : 1.2 }, sv);
    });

    F.forEach(function (f, k) { box(f.x, f.y, BW, BH, f.c, i < 0 || i === k, f.n, f.s); });

    /* the centre: the problem class itself */
    E('rect', { x: CX - CW / 2, y: CY - CH / 2, width: CW, height: CH, rx: 3,
      fill: '#F1F1ED', stroke: INK, 'stroke-width': 1.6 }, sv);
    E('text', { x: CX, y: CY - 6, 'text-anchor': 'middle', 'font-family': 'Inter, sans-serif',
      'font-size': 13.5, 'font-weight': 600, fill: INK, text: 'Problem class' }, sv);
    E('text', { x: CX, y: CY + 12, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace',
      'font-size': 9, 'letter-spacing': .6, fill: INK, 'fill-opacity': .5, text: 'vehicle routing' }, sv);

    if (i < 0) {
      host.querySelector('[data-d]').innerHTML =
        'Supplied once per problem class and reused by every run. The formulator does not <i>invent</i> a model ' +
        'from a sentence &mdash; it <b>resolves</b> the sentence against this, which is why the same request ' +
        'twice gives the same formulation twice. Click a facet.';
    } else {
      var f = F[i];
      host.querySelector('[data-d]').innerHTML =
        '<b style="color:' + f.c + '">' + f.n + '</b> &mdash; ' + f.d +
        '<br><span style="font:400 11px/1.5 var(--mono);color:var(--ink3);letter-spacing:.04em">' +
        f.ex + '</span>';
    }
  }

  F.forEach(function (f, k) {
    host.querySelector('[data-f="' + f.k + '"]').onclick = function () { i = k; draw(); };
  });
  var __reset = function () { i = -1; draw(); };
  host.querySelector('[data-rs]').onclick = __reset;   // the "all" facet

  draw();
  return { reset: __reset, finish: function () { i = opts && opts.facet != null ? opts.facet : -1; draw(); } };
});
