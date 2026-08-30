/* ============================================================
   widget: ppo-clip                               (Chapter 10, Act 4)

   The clipped surrogate, drawn as a function of the probability ratio
   r(theta) = pi_theta(a|s) / pi_old(a|s), for a good action and a bad
   one:

     L(r, A) = min( r A , clip(r, 1-eps, 1+eps) A )

   The point of the picture is the asymmetry, which the formula hides:
   the clip does not build a symmetric box around r = 1. It removes the
   gradient only in the direction that would push the policy FURTHER
   out of the trust interval.

   VERIFIED IN NODE (eps = 0.2, dL/dr by central difference):
     A = +1 :  r 0.5 0.7 0.9 1.0 1.1 -> L = r,      dL/dr = +1
               r 1.2                  -> L = 1.2,   dL/dr = +0.5 (the kink)
               r 1.5, 2.0             -> L = 1.2,   dL/dr =  0
     A = -1 :  r 0.5, 0.7             -> L = -0.8,  dL/dr =  0
               r 0.8                  -> L = -0.8,  dL/dr = -0.5 (the kink)
               r 0.9 ... 2.0          -> L = -r,    dL/dr = -1
   so for A > 0 the incentive dies above 1+eps, while for A < 0 it dies
   below 1-eps and stays alive all the way up: an action that is both
   too probable and bad keeps being pushed down.
   ============================================================ */
IE437.widget('ppo-clip', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', SLATE = '#64748B', RED = '#D64545';

  var EPS = [0.1, 0.2, 0.3], ei = 1;
  if (opts.eps !== undefined) { var j = EPS.indexOf(opts.eps); if (j >= 0) ei = j; }
  var RS = [0.80, 0.95, 1.30, 1.65], ri = 2;
  var R0 = 0.45, R1 = 1.85;

  function clip(r, lo, hi) { return Math.max(lo, Math.min(hi, r)); }
  function L(r, A, e) { return Math.min(r * A, clip(r, 1 - e, 1 + e) * A); }
  function dL(r, A, e) { return (L(r + 1e-7, A, e) - L(r - 1e-7, A, e)) / 2e-7; }

  host.innerHTML =
    '<div class="wbar"><span class="wt">J<sup>CLIP</sup> &mdash; and the asymmetry the formula hides</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">epsilon</span><span class="wnum" data-e></span>' +
    '<button class="wb" data-eps>change &epsilon;</button>' +
    '<button class="wb" data-r>move the ratio</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div data-c></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">' +
    '<div data-tab style="font:400 11.5px/1.5 var(--mono);color:var(--ink2)"></div>' +
    '<div data-now style="padding:9px 11px;border:1px solid var(--line);background:var(--panel2);' +
    'font:400 11.5px/1.65 var(--sans);color:var(--ink2)"></div>' +
    '<div style="font:400 11px/1.5 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:9px">' +
    'A flat objective is a zero gradient. The clip buys a trust region by ' +
    'removing the reward for leaving one &mdash; no Fisher matrix, no line search.</div></div></div>';

  var CW = 468, CH = 250;
  var sv = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(sv);

  function draw() {
    var e = EPS[ei], r = RS[ri], pts1 = [], pts2 = [], v;
    for (v = R0; v <= R1 + 1e-9; v += 0.004) { pts1.push([v, L(v, 1, e)]); pts2.push([v, L(v, -1, e)]); }

    var m = IE437.plot(sv, {
      w: CW, h: CH, pad: { l: 46, r: 14, t: 14, b: 34 },
      xdom: [R0, R1], ydom: [-1.95, 1.45],
      yticks: [-1.5, -1, -0.5, 0, 0.5, 1], xticks: [0.5, 0.75, 1, 1.25, 1.5, 1.75],
      yfmt: function (t) { return t.toFixed(1); }, xfmt: function (t) { return t.toFixed(2); },
      xlabel: 'probability ratio  r(theta) = pi / pi_old', ylabel: 'clipped objective',
      series: []
    });

    /* the trust interval */
    E('rect', { x: m.X(1 - e), y: m.Y(1.45), width: m.X(1 + e) - m.X(1 - e),
      height: m.Y(-1.95) - m.Y(1.45), fill: INK, 'fill-opacity': .045 }, sv);
    [1 - e, 1 + e].forEach(function (b) {
      E('line', { x1: m.X(b), x2: m.X(b), y1: m.Y(1.45), y2: m.Y(-1.95),
        stroke: INK, 'stroke-width': 1, 'stroke-dasharray': '4 4', 'stroke-opacity': .4 }, sv);
    });
    E('line', { x1: m.X(1), x2: m.X(1), y1: m.Y(1.45), y2: m.Y(-1.95),
      stroke: INK, 'stroke-width': 1, 'stroke-opacity': .28 }, sv);
    E('text', { x: m.X(1), y: m.Y(1.45) + 10, 'text-anchor': 'middle', 'font-size': 9.5,
      fill: INK, 'fill-opacity': .55, 'font-family': 'IBM Plex Mono, monospace',
      text: 'the old policy' }, sv);

    /* the two curves, drawn after the band */
    [[pts1, BLUE, 'A > 0  (a good action)'], [pts2, AMBER, 'A < 0  (a bad action)']].forEach(function (S) {
      var d = S[0].map(function (p, i) {
        return (i ? 'L' : 'M') + m.X(p[0]).toFixed(1) + ' ' + m.Y(p[1]).toFixed(1);
      }).join(' ');
      E('path', { d: d, fill: 'none', stroke: S[1], 'stroke-width': 2.4,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, sv);
    });
    E('text', { x: m.X(R0) + 5, y: m.Y(L(R0, 1, e)) + 17, 'font-size': 10,
      fill: BLUE, 'font-family': 'IBM Plex Mono, monospace', text: 'good action, A > 0' }, sv);
    E('text', { x: m.X(1.42), y: m.Y(L(1.42, -1, e)) + 17, 'font-size': 10,
      fill: AMBER, 'font-family': 'IBM Plex Mono, monospace', text: 'bad action, A < 0' }, sv);

    /* the flat stretches, named */
    E('text', { x: m.X(1 + e) + 8, y: m.Y(1 + e) - 10, 'font-size': 9.5, fill: BLUE, 'fill-opacity': .85,
      'font-family': 'IBM Plex Mono, monospace', text: 'flat \u2014 gradient 0' }, sv);
    E('text', { x: m.X(1 - e) - 8, y: m.Y(-(1 - e)) + 16, 'text-anchor': 'end',
      'font-size': 9.5, fill: AMBER, 'fill-opacity': .9,
      'font-family': 'IBM Plex Mono, monospace', text: 'flat \u2014 gradient 0' }, sv);

    /* the current ratio */
    E('circle', { cx: m.X(r), cy: m.Y(L(r, 1, e)), r: 5, fill: BLUE }, sv);
    E('circle', { cx: m.X(r), cy: m.Y(L(r, -1, e)), r: 5, fill: AMBER }, sv);
    E('line', { x1: m.X(r), x2: m.X(r), y1: m.Y(L(r, 1, e)), y2: m.Y(L(r, -1, e)),
      stroke: INK, 'stroke-width': 1, 'stroke-opacity': .22 }, sv);

    host.querySelector('[data-e]').textContent = e.toFixed(2);

    var row = function (lbl, a, b) {
      return '<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0;' +
        'border-bottom:1px solid rgba(22,24,29,.06)"><span style="color:var(--ink3)">' + lbl +
        '</span><span><b style="color:' + BLUE + '">' + a + '</b> &nbsp; <b style="color:' +
        AMBER + '">' + b + '</b></span></div>';
    };
    var f = function (x) { return x === 0 ? '0' : (x > 0 ? '+' : '') + x.toFixed(0); };
    host.querySelector('[data-tab]').innerHTML =
      '<div class="wlabel" style="margin-bottom:5px">gradient dL/dr &nbsp; ' +
      '<span style="color:' + BLUE + '">A&gt;0</span> / <span style="color:' + AMBER + '">A&lt;0</span></div>' +
      row('r &lt; 1&minus;&epsilon;', f(dL(0.5 * (R0 + 1 - e), 1, e)), f(dL(0.5 * (R0 + 1 - e), -1, e))) +
      row('inside the band', f(dL(1, 1, e)), f(dL(1, -1, e))) +
      row('r &gt; 1+&epsilon;', f(dL(0.5 * (1 + e + R1), 1, e)), f(dL(0.5 * (1 + e + R1), -1, e)));

    var g1 = dL(r, 1, e), g2 = dL(r, -1, e);
    host.querySelector('[data-now]').innerHTML =
      'at r = <b>' + r.toFixed(2) + '</b> &nbsp;&middot;&nbsp; ' +
      (r < 1 - e ? 'below the band' : r > 1 + e ? 'above the band' : 'inside the band') + '<br>' +
      '<span style="color:' + BLUE + '">good action:</span> ' +
      (Math.abs(g1) < 1e-6 ? '<b>no incentive left</b> &mdash; already likelier than we are entitled to believe'
        : 'still being made likelier') + '<br>' +
      '<span style="color:' + AMBER + '">bad action:</span> ' +
      (Math.abs(g2) < 1e-6 ? '<b>no incentive left</b> &mdash; already unlikely enough'
        : 'still being pushed down');
  }

  host.querySelector('[data-eps]').onclick = function () { ei = (ei + 1) % EPS.length; draw(); };
  host.querySelector('[data-r]').onclick = function () { ri = (ri + 1) % RS.length; draw(); };

  draw();
  return { finish: function () { ri = 2; draw(); } };
});
