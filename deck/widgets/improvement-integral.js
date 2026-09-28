/* ============================================================
   widget: improvement-integral
   The source deck's own build-up (pp. 113-116 for PI, 118-123 for
   EI), redrawn. At one candidate x the posterior is a Gaussian, so
   it is laid on its side against the incumbent line f+, and the
   acquisition value is read off as an area under it.

     mode "pi"  the tail above f+                    -> Phi(z)
     mode "ei"  the same tail, each slice weighted
                by how far above f+ it sits          -> sigma[zPhi(z)+phi(z)]

   The EI mode is the reason this is a widget and not a picture: the
   source needs five printed pages to accumulate the slices, and the
   sum only becomes an integral when you watch it refine. The slice
   count is a dial so the Riemann sum visibly closes on the exact
   value rather than being asserted to.

   The density is drawn to a common peak width, so shapes stay
   comparable as x moves. Horizontal scaling leaves the shaded
   *fraction* untouched, so the areas still read honestly; every
   number shown is computed in data units, never off the picture.
   ============================================================ */
IE437.widget('improvement-integral', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', GREEN = '#16A34A', RED = '#D64545', SLATE = '#64748B';
  var MODE = (opts && opts.mode) === 'ei' ? 'ei' : 'pi';

  /* ---------- linear algebra ---------- */
  function chol(A) {
    var n = A.length, L = [], i, j, k, s;
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      s = A[i][j];
      for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (s <= 0) s = 1e-10; L[i][j] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function solveL(L, b) { var n = L.length, y = new Float64Array(n), i, k, s;
    for (i = 0; i < n; i++) { s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; }
  function solveLT(L, b) { var n = L.length, x = new Float64Array(n), i, k, s;
    for (i = n - 1; i >= 0; i--) { s = b[i]; for (k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; } return x; }

  var S0 = 0.42, LAM = 0.16, SN = 0.02;
  function kSE(a, b) { var d = a - b; return S0 * S0 * Math.exp(-0.5 * d * d / (LAM * LAM)); }
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
    return s * y;
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var pdf = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };

  /* ---------- the same posterior acquisition-zoo uses ---------- */
  var TRUE = function (x) { return 0.55 + 0.42 * Math.sin(6.1 * x - 1.1) + 0.30 * Math.sin(2.0 * x + 0.4) + 0.10 * x; };
  var XO = [0.05, 0.15, 0.20, 0.65, 0.92], YO = XO.map(TRUE);
  var FPLUS = Math.max.apply(null, YO);

  var G = (function () {
    var n = XO.length, K = [], i, j;
    for (i = 0; i < n; i++) K.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) K[i][j] = kSE(XO[i], XO[j]) + (i === j ? SN * SN : 0);
    var m0 = 0; for (i = 0; i < n; i++) m0 += YO[i] / n;
    var L = chol(K), a = solveLT(L, solveL(L, YO.map(function (v) { return v - m0; })));
    return { L: L, a: a, m0: m0 };
  })();
  function pred(x) {
    var n = XO.length, k = new Float64Array(n), i, mu = G.m0, vv = 0;
    for (i = 0; i < n; i++) k[i] = kSE(x, XO[i]);
    for (i = 0; i < n; i++) mu += k[i] * G.a[i];
    var v = solveL(G.L, k);
    for (i = 0; i < n; i++) vv += v[i] * v[i];
    return { mu: mu, s: Math.sqrt(Math.max(1e-9, S0 * S0 - vv)) };
  }
  var GRID = []; (function () { for (var i = 0; i <= 300; i++) GRID.push(i / 300); })();
  var POST = GRID.map(pred);

  /* candidate columns: beside the incumbent, and out in the wide valley */
  var CAND = [0.30, 0.47, 0.63, 0.80];
  var ci = MODE === 'ei' ? 1 : 2;
  var NSLICE = [6, 12, 30, 120], ni = 0;
  var shown = 0;                                   /* how many slices are drawn */

  /* ---------- exact values, in data units ---------- */
  function exact(x) {
    var p = pred(x), z = (p.mu - FPLUS) / p.s;
    return { mu: p.mu, s: p.s, z: z, pi: PHI(z), ei: (p.mu - FPLUS) * PHI(z) + p.s * pdf(z) };
  }
  /* the Riemann sum the slices actually draw */
  function riemann(x, n, upto) {
    var p = pred(x), hi = FPLUS + 4.2 * p.s, df = (hi - FPLUS) / n, sum = 0, i;
    for (i = 0; i < Math.min(n, upto); i++) {
      var f = FPLUS + (i + 0.5) * df;
      sum += (f - FPLUS) * pdf((f - p.mu) / p.s) / p.s * df;
    }
    return { sum: sum, df: df, hi: hi };
  }

  /* ---------- chrome ---------- */
  var title = MODE === 'ei'
    ? 'Expected improvement &mdash; every slice, weighted by its height'
    : 'Probability of improvement &mdash; the area above the line';
  var ctrl = '<span class="wlabel">candidate</span><span class="wnum" data-x></span>' +
    '<button class="wb" data-xl>&lsaquo;</button><button class="wb" data-xr>&rsaquo;</button>';
  if (MODE === 'ei') ctrl +=
    '<span class="wlabel" style="margin-left:10px">slices</span><span class="wnum" data-n></span>' +
    '<button class="wb" data-add>+ one</button><button class="wb" data-all>all</button>' +
    '<button class="wb" data-fine>finer</button>';
  else ctrl += '<button class="wb" data-fill style="margin-left:10px">shade the tail</button>';
  ctrl += '<button class="wb" data-rs>reset</button>';

  host.innerHTML =
    '<div class="wbar"><span class="wt">' + title + '</span><span class="wspacer"></span>' + ctrl + '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px;align-items:flex-start">' +
    '<div data-c></div>' +
    '<div style="width:224px;display:flex;flex-direction:column;gap:9px;padding-top:6px">' +
    '<div data-num style="font:400 12.5px/1.75 var(--sans);color:var(--ink2)"></div>' +
    '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
    'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div></div>';

  var W = 566, H = 208, PAD = 32, RGT = 10;
  var sv = IE437.svg(W, H);
  host.querySelector('[data-c]').appendChild(sv);
  var PX = function (v) { return PAD + v * (W - PAD - RGT); };
  var LO = -0.10, HI = 1.70;
  var Y = function (v) { return H - 18 - (Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO) * (H - 30); };
  var PEAK = 62;                                   /* pixels at the density's mode */
  function clear(s) { while (s.firstChild) s.removeChild(s.firstChild); }

  function draw() {
    clear(sv);
    var x0 = CAND[ci], p = pred(x0), ex = exact(x0), n = NSLICE[ni];
    var x0p = PX(x0);

    /* --- posterior band, truth, mean --- */
    var d = 'M' + PX(0) + ' ' + Y(POST[0].mu + 2 * POST[0].s), i;
    for (i = 1; i < POST.length; i++) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y(POST[i].mu + 2 * POST[i].s).toFixed(1);
    for (i = POST.length - 1; i >= 0; i--) d += 'L' + PX(GRID[i]).toFixed(1) + ' ' + Y(POST[i].mu - 2 * POST[i].s).toFixed(1);
    E('path', { d: d + 'Z', fill: BLUE, 'fill-opacity': .12 }, sv);
    E('path', { d: GRID.map(function (x, k) { return (k ? 'L' : 'M') + PX(x).toFixed(1) + ' ' + Y(TRUE(x)).toFixed(1); }).join(''),
      fill: 'none', stroke: INK, 'stroke-opacity': .3, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, sv);
    E('path', { d: POST.map(function (q, k) { return (k ? 'L' : 'M') + PX(GRID[k]).toFixed(1) + ' ' + Y(q.mu).toFixed(1); }).join(''),
      fill: 'none', stroke: BLUE, 'stroke-width': 2 }, sv);
    XO.forEach(function (x, k) { E('circle', { cx: PX(x), cy: Y(YO[k]), r: 3.6, fill: INK }, sv); });

    /* --- the incumbent line: everything is measured from here --- */
    E('line', { x1: PAD, y1: Y(FPLUS), x2: W - RGT, y2: Y(FPLUS), stroke: INK, 'stroke-width': 1.6 }, sv);
    E('text', { x: PAD + 3, y: Y(FPLUS) - 6, 'font-size': 10.5, 'font-weight': 700, fill: INK,
      'font-family': 'IBM Plex Mono, monospace', text: 'f+ = ' + FPLUS.toFixed(2) }, sv);

    /* --- the candidate column --- */
    E('line', { x1: x0p, y1: Y(LO), x2: x0p, y2: Y(HI), stroke: SLATE, 'stroke-width': 1,
      'stroke-dasharray': '3 3', 'stroke-opacity': .8 }, sv);
    E('text', { x: x0p, y: H - 4, 'text-anchor': 'middle', 'font-size': 9.5, fill: SLATE,
      'font-family': 'IBM Plex Mono, monospace', text: 'x = ' + x0.toFixed(2) }, sv);

    /* --- the posterior at x0, laid on its side --- */
    var scale = PEAK * p.s * Math.sqrt(2 * Math.PI);        /* peak maps to PEAK px */
    var dens = function (f) { return pdf((f - p.mu) / p.s) / p.s * scale; };
    /* below about 2.6 sd the density is a pixel wide and hugs the column,
       where it reads as a deliberate vertical rule rather than a tail */
    var f0 = Math.max(p.mu - 2.6 * p.s, LO + 0.03), f1 = Math.min(p.mu + 4.0 * p.s, HI - 0.03);
    var STEP = (f1 - f0) / 160;
    var curve = '';
    for (var f = f0; f <= f1 + 1e-9; f += STEP)
      curve += (curve ? 'L' : 'M') + (x0p + dens(f)).toFixed(1) + ' ' + Y(f).toFixed(1);
    E('path', { d: curve, fill: 'none', stroke: RED, 'stroke-width': 1.7, 'stroke-opacity': .9 }, sv);

    var sum = 0;
    if (MODE === 'pi') {
      /* the whole tail above f+, one region, every slice counting 1 */
      if (shown) {
        var tail = 'M' + x0p + ' ' + Y(FPLUS);
        for (var g = FPLUS; g <= f1 + 1e-9; g += STEP) tail += 'L' + (x0p + dens(g)).toFixed(1) + ' ' + Y(g).toFixed(1);
        tail += 'L' + x0p + ' ' + Y(f1) + 'Z';
        E('path', { d: tail, fill: RED, 'fill-opacity': .30 }, sv);
      }
    } else {
      /* one strip per slice; the strip's tint is its weight */
      var R = riemann(x0, n, shown), df = R.df;
      sum = R.sum;
      for (i = 0; i < Math.min(n, shown); i++) {
        var fc = FPLUS + (i + 0.5) * df, wgt = (fc - FPLUS) / (R.hi - FPLUS);
        E('rect', { x: x0p, y: Y(fc + df / 2), width: Math.max(.6, dens(fc)),
          height: Math.max(.8, Math.abs(Y(fc - df / 2) - Y(fc + df / 2))),
          fill: RED, 'fill-opacity': (0.12 + 0.55 * wgt).toFixed(3) }, sv);
      }
      /* the slice just added, annotated the way the source annotates it */
      if (shown > 0 && shown <= n && n <= 30) {
        var fk = FPLUS + (shown - 0.5) * df, yk = Y(fk), wk = dens(fk);
        E('line', { x1: x0p, y1: yk, x2: x0p + wk, y2: yk, stroke: RED, 'stroke-width': 2.4 }, sv);
        E('line', { x1: x0p - 13, y1: Y(FPLUS), x2: x0p - 13, y2: yk, stroke: GREEN, 'stroke-width': 2.4 }, sv);
        E('path', { d: 'M' + (x0p - 16.5) + ' ' + (yk + 5.5) + 'h7l-3.5 -6.5Z', fill: GREEN }, sv);
        E('text', { x: x0p + wk + 5, y: yk - 4, 'font-size': 9.5, fill: RED,
          'font-family': 'IBM Plex Mono, monospace', text: 'p(f)' }, sv);
        E('text', { x: x0p - 18, y: (yk + Y(FPLUS)) / 2 + 3.5, 'text-anchor': 'end', 'font-size': 9.5,
          fill: GREEN, 'font-family': 'IBM Plex Mono, monospace', text: 'f - f+' }, sv);
      }
    }

    /* --- readout --- */
    var num, note;
    if (MODE === 'pi') {
      num = 'at <b>x = ' + x0.toFixed(2) + '</b><br>' +
        'mean ' + p.mu.toFixed(3) + ', sd ' + p.s.toFixed(3) + '<br>' +
        'z = (mean &minus; f+)/sd = <b>' + ex.z.toFixed(2) + '</b><br>' +
        '<span style="color:' + RED + '">PI</span> = area above f+ = <b>' + ex.pi.toFixed(3) + '</b>';
      note = shown
        ? 'The shaded tail <b>is</b> the number. Integrating the curve once, at this one x, answers <i>how often</i> &mdash; but every sliver of it counts the same, however far above the line it sits.'
        : 'Press <b>shade the tail</b>. PI is the probability mass of this one Gaussian lying above f+.';
    } else {
      num = 'at <b>x = ' + x0.toFixed(2) + '</b><br>' +
        'mean ' + p.mu.toFixed(3) + ', sd ' + p.s.toFixed(3) + '<br>' +
        'slices drawn <b>' + Math.min(shown, n) + ' / ' + n + '</b><br>' +
        'running sum <b>' + sum.toFixed(4) + '</b><br>' +
        '<span style="color:' + BLUE + '">exact EI</span> = <b>' + ex.ei.toFixed(4) + '</b>';
      if (shown === 0) note = 'Press <b>+ one</b>. Each slice contributes its height above f+ <i>times</i> its probability &mdash; the green length times the red one.';
      else if (shown < n) note = 'Every strip adds (f &minus; f+)&thinsp;&times;&thinsp;p(f). Darker strips sit further above the line, so they are worth more.';
      else if (n < 120) note = 'The sum is <b>' + (100 * sum / ex.ei).toFixed(1) + '%</b> of the exact value. Press <b>finer</b>: more, thinner slices and the sum closes on the integral.';
      else note = 'At 120 slices the sum agrees with the closed form to <b>' + Math.abs(sum - ex.ei).toExponential(1) + '</b>. The sum <i>is</i> the integral &mdash; PI weighted every slice by 1, EI weights each by how far it clears f+.';
    }
    host.querySelector('[data-num]').innerHTML = num;
    host.querySelector('[data-note]').innerHTML = note;
    host.querySelector('[data-x]').textContent = x0.toFixed(2);
    if (MODE === 'ei') host.querySelector('[data-n]').textContent = n;
  }

  /* ---------- controls ---------- */
  var q = function (s) { return host.querySelector(s); };
  q('[data-xl]').onclick = function () { ci = Math.max(0, ci - 1); if (MODE === 'ei') shown = 0; draw(); };
  q('[data-xr]').onclick = function () { ci = Math.min(CAND.length - 1, ci + 1); if (MODE === 'ei') shown = 0; draw(); };
  q('[data-rs]').onclick = function () { shown = 0; ni = 0; draw(); };
  if (MODE === 'pi') q('[data-fill]').onclick = function () { shown = shown ? 0 : 1; draw(); };
  else {
    q('[data-add]').onclick = function () { shown = Math.min(NSLICE[ni], shown + 1); draw(); };
    q('[data-all]').onclick = function () { shown = NSLICE[ni]; draw(); };
    q('[data-fine]').onclick = function () { ni = Math.min(NSLICE.length - 1, ni + 1); shown = NSLICE[ni]; draw(); };
  }

  draw();
  /* the printed deck shows the finished picture */
  return { finish: function () {
    if (MODE === 'pi') shown = 1;
    else { ni = NSLICE.length - 1; shown = NSLICE[ni]; }
    draw();
  } };
});
