/* ============================================================
   widget: ridge-lasso-prior
   The two pictures the source deck places side by side. Left, the
   optimisation view: error contours meeting a budget set — a ball
   for the L2 penalty, a diamond for L1, whose corners are why
   Lasso sets coefficients exactly to zero. Right, the Bayesian
   view: the same λ read as the width of a prior.
   The solution is solved for, not sketched, so the corner is real.
   ============================================================ */
IE437.widget('ridge-lasso-prior', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', AMBER = '#D97706';
  var lasso = false, li = 3;   // λ = 1.6 — large enough that L¹ actually selects
  var LAM = [0.05, 0.2, 0.6, 1.6, 4, 10, 30];

  /* a fixed little least-squares problem: correlated features, OLS well off the origin */
  var XTX = [1.0, 0.85, 0.85, 1.0], XTY = [1.5975, 1.455];
  function inv2(m) { var d = m[0] * m[3] - m[1] * m[2]; return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d]; }
  function mul2v(m, v) { return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]; }
  var OLS = mul2v(inv2(XTX), XTY);
  function sse(w) {                                   // (w-ŵ)ᵀ XᵀX (w-ŵ), up to a constant
    var d = [w[0] - OLS[0], w[1] - OLS[1]], q = mul2v(XTX, d);
    return d[0] * q[0] + d[1] * q[1];
  }
  function ridgeSolve(lam) { return mul2v(inv2([XTX[0] + lam, XTX[1], XTX[2], XTX[3] + lam]), XTY); }
  function lassoSolve(lam) {                          // coordinate descent with soft thresholding
    var w = [0, 0], soft = function (z, g) { return Math.sign(z) * Math.max(0, Math.abs(z) - g); };
    for (var it = 0; it < 400; it++) {
      w[0] = soft(XTY[0] - XTX[1] * w[1], lam / 2) / XTX[0];
      w[1] = soft(XTY[1] - XTX[2] * w[0], lam / 2) / XTX[3];
    }
    return w;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">One dial, two stories</span><span class="wspacer"></span>' +
    '<label class="wtog" data-lasso><i></i><span>use the L¹ penalty (Lasso)</span></label>' +
    '<span class="wlabel">λ</span><span class="wnum" data-l></span>' +
    '<span data-sl></span></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:center">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0">' +
    '<div class="wlabel">optimisation view &mdash; error meets a budget</div><div data-c1></div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0">' +
    '<div class="wlabel">bayesian view &mdash; the same λ as a prior</div><div data-c2></div></div>' +
    '<div style="width:200px;display:flex;flex-direction:column;gap:10px">' +
    '<div data-num style="font:400 12.5px/1.85 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.6 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.075);padding-top:10px"></div></div></div>';

  var CW = 300, CH = 258;
  var sv1 = IE437.svg(CW, CH), sv2 = IE437.svg(CW, CH);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  function draw() {
    var lam = LAM[li];
    var w = lasso ? lassoSolve(lam) : ridgeSolve(lam);
    var t = lasso ? Math.abs(w[0]) + Math.abs(w[1]) : Math.hypot(w[0], w[1]);
    var col = lasso ? AMBER : GREEN;

    /* ---------- left: contours + budget set ---------- */
    while (sv1.firstChild) sv1.removeChild(sv1.firstChild);
    var D = [-0.4, 2.0];
    var PX = function (v) { return 34 + (v - D[0]) / (D[1] - D[0]) * (CW - 46); };
    var PY = function (v) { return CH - 32 - (v - D[0]) / (D[1] - D[0]) * (CH - 48); };
    E('line', { x1: PX(0), y1: 12, x2: PX(0), y2: CH - 24, stroke: INK, 'stroke-opacity': .3 }, sv1);
    E('line', { x1: 26, y1: PY(0), x2: CW - 10, y2: PY(0), stroke: INK, 'stroke-opacity': .3 }, sv1);
    /* error contours through a few levels, drawn by marching the ellipse analytically */
    var Li = [[Math.sqrt(XTX[0]), 0], [XTX[1] / Math.sqrt(XTX[0]), 0]];
    Li[1][1] = Math.sqrt(Math.max(XTX[3] - Li[1][0] * Li[1][0], 1e-9));
    [0.06, 0.2, 0.45, 0.85, 1.4].forEach(function (lev) {
      var r = Math.sqrt(lev), pts = [];
      for (var k = 0; k <= 96; k++) {
        var a = k / 96 * Math.PI * 2, u = [Math.cos(a) * r, Math.sin(a) * r];
        /* solve Lᵀd = u so that dᵀXᵀXd = lev */
        var d1 = u[1] / Li[1][1], d0 = (u[0] - Li[1][0] * d1) / Li[0][0];
        pts.push([PX(OLS[0] + d0), PY(OLS[1] + d1)]);
      }
      E('path', { d: pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z',
        fill: 'none', stroke: INK, 'stroke-opacity': .26, 'stroke-width': 1 }, sv1);
    });
    /* the budget set */
    if (lasso) {
      E('path', { d: 'M' + PX(t) + ' ' + PY(0) + 'L' + PX(0) + ' ' + PY(t) +
        'L' + PX(-t) + ' ' + PY(0) + 'L' + PX(0) + ' ' + PY(-t) + 'Z',
        fill: AMBER, 'fill-opacity': .17, stroke: AMBER, 'stroke-width': 1.6 }, sv1);
    } else {
      E('circle', { cx: PX(0), cy: PY(0), r: PX(t) - PX(0), fill: GREEN, 'fill-opacity': .15,
        stroke: GREEN, 'stroke-width': 1.6 }, sv1);
    }
    E('circle', { cx: PX(OLS[0]), cy: PY(OLS[1]), r: 4, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, sv1);
    E('text', { x: PX(OLS[0]) + 8, y: PY(OLS[1]) - 5, 'font-size': 9.5, fill: INK, 'fill-opacity': .5,
      'font-family': 'IBM Plex Mono, monospace', text: 'OLS' }, sv1);
    E('circle', { cx: PX(w[0]), cy: PY(w[1]), r: 5.5, fill: col }, sv1);
    E('text', { x: CW - 10, y: PY(0) - 7, 'text-anchor': 'end', 'font-size': 10, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .5, text: 'w₁' }, sv1);
    E('text', { x: PX(0) + 7, y: 22, 'font-size': 10, 'font-style': 'italic', fill: INK,
      'fill-opacity': .5, text: 'w₂' }, sv1);

    /* ---------- right: the prior the penalty came from ---------- */
    while (sv2.firstChild) sv2.removeChild(sv2.firstChild);
    var scale = lasso ? 2 / lam : Math.sqrt(1 / lam);   // Laplace rate vs Gaussian sd, up to σ²
    var pts = [], top = 0;
    for (var i = 0; i <= 240; i++) {
      var x = -2.2 + 4.4 * i / 240;
      var v = lasso ? Math.exp(-Math.abs(x) / Math.max(scale, 1e-6))
                    : Math.exp(-0.5 * x * x / Math.max(scale * scale, 1e-9));
      pts.push([x, v]); if (v > top) top = v;
    }
    var QX = function (v) { return 30 + (v + 2.2) / 4.4 * (CW - 44); };
    var QY = function (v) { return CH - 34 - v / top * (CH - 56); };
    E('path', {
      d: 'M' + QX(-2.2) + ' ' + QY(0) +
         pts.map(function (p) { return 'L' + QX(p[0]).toFixed(1) + ' ' + QY(p[1]).toFixed(1); }).join('') +
         'L' + QX(2.2) + ' ' + QY(0) + 'Z',
      fill: col, 'fill-opacity': .16, stroke: col, 'stroke-width': 2.2
    }, sv2);
    E('line', { x1: 24, y1: QY(0), x2: CW - 10, y2: QY(0), stroke: INK, 'stroke-opacity': .3 }, sv2);
    E('line', { x1: QX(0), y1: 14, x2: QX(0), y2: QY(0), stroke: INK, 'stroke-opacity': .22,
      'stroke-dasharray': '3 3' }, sv2);
    E('text', { x: CW / 2, y: CH - 12, 'text-anchor': 'middle', 'font-size': 10, 'font-style': 'italic',
      fill: INK, 'fill-opacity': .5, text: 'w' }, sv2);
    E('text', { x: QX(0) + 10, y: 26, 'font-size': 11, 'font-weight': 700, fill: col,
      text: lasso ? 'Laplace prior' : 'Gaussian prior' }, sv2);

    /* ---------- readout ---------- */
    host.querySelector('[data-l]').textContent = lam.toFixed(2);
    var zeroed = (Math.abs(w[0]) < 1e-6 ? 1 : 0) + (Math.abs(w[1]) < 1e-6 ? 1 : 0);
    host.querySelector('[data-num]').innerHTML =
      'OLS = (' + OLS[0].toFixed(2) + ', ' + OLS[1].toFixed(2) + ')<br>' +
      '<span style="color:' + col + '">solution</span> = (<b>' + w[0].toFixed(3) + '</b>, <b>' +
      w[1].toFixed(3) + '</b>)<br>' +
      'budget ' + (lasso ? '‖w‖₁' : '‖w‖₂') + ' = ' + t.toFixed(3) +
      (zeroed ? '<br><b style="color:' + AMBER + '">' + zeroed + ' coefficient' + (zeroed > 1 ? 's' : '') +
        ' exactly 0</b>' : '');
    host.querySelector('[data-note]').innerHTML = lasso
      ? 'The diamond has <b>corners on the axes</b>. The contours touch a corner for a wide range of λ, and a corner ' +
        'means a coefficient is exactly zero &mdash; selection, not just shrinkage.'
      : 'The ball is <b>smooth everywhere</b>, so the contact point almost never sits on an axis. Ridge shrinks ' +
        'coefficients toward zero but does not set them to zero.';
  }

  host.querySelector('[data-lasso]').onclick = function () {
    lasso = !lasso; this.classList.toggle('on', lasso); draw();
  };
  IE437.slider(host.querySelector('[data-sl]'), {
    bare: true, min: 0, max: LAM.length - 1, step: 1, value: li,
    on: function (v) { li = v; draw(); }
  });

  draw();
  return { finish: function () { lasso = true; host.querySelector('[data-lasso]').classList.add('on'); li = 3; draw(); } };
});
