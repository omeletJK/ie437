/* ============================================================
   widget: bo-frontier                          (Chapter 4, Frontier)
   Where the textbook loop breaks, and the research streams that
   answer each break -- with this lab's papers placed in them.

     map     the three walls as swimlanes over four eras; every node
             clickable. {"view":"lab"} walks the lab's own thread in
             time order instead of revealing the lanes.
     kernel  Wall 1. The same seven observations under SE, Matern-1/2
             and periodic kernels, each fitted by marginal likelihood:
             three posteriors, three EI curves, three next experiments.
     dim     Wall 2. 100 observations in [0,1]^d, read in more and more
             coordinates: where is the GP as ignorant as its prior?
     data    Wall 3. 400 observations; the exact posterior against a
             sparse one built on m inducing points, and what each costs.

   Every number is computed here, from seeded data; nothing is drawn
   to look right. Source alignment lives in the slide notes.
   ============================================================ */
(function () {
IE437.widget('bo-frontier', function (host, opts) {
  opts = opts || {};
  var NS = 'http://www.w3.org/2000/svg';
  function S(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', PURPLE = '#6D4AFF', SLATE = '#64748B',
      RED = '#D64545', GREEN = '#16A34A';
  var MONO = "'IBM Plex Mono', monospace", SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
  var MODE = ['map', 'kernel', 'dim', 'data'].indexOf(opts.mode) >= 0 ? opts.mode : 'map';

  /* ---------- shared numerics ---------- */
  function chol(A) {
    var n = A.length, L = [], i, j, k, s;
    for (i = 0; i < n; i++) L.push(new Float64Array(n));
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      s = A[i][j];
      for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (s <= 0) return null; L[i][j] = Math.sqrt(s); } else L[i][j] = s / L[j][j];
    }
    return L;
  }
  function solveL(L, b) { var n = L.length, y = new Float64Array(n), i, k, s;
    for (i = 0; i < n; i++) { s = b[i]; for (k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; }
  function solveLT(L, b) { var n = L.length, x = new Float64Array(n), i, k, s;
    for (i = n - 1; i >= 0; i--) { s = b[i]; for (k = i + 1; k < n; k++) s -= L[k][i] * x[k]; x[i] = s / L[i][i]; } return x; }
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
  }
  var PHI = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  var phi = function (z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); };
  function gaussFrom(g) { return function () { var u = Math.max(1e-12, g()), v = g(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }; }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function txt(sv, x, y, s, o) {
    o = o || {};
    var n = S('text', { x: x, y: y, 'text-anchor': o.anchor || 'start', 'font-size': o.size || 10.5,
      'font-weight': o.weight || 400, fill: o.fill || INK, 'font-family': o.sans ? SANS : MONO, text: s }, sv);
    if (o.op != null) n.setAttribute('fill-opacity', o.op);
    if (o.halo) { n.setAttribute('stroke', '#FFFFFF'); n.setAttribute('stroke-width', 3.2); n.setAttribute('paint-order', 'stroke'); }
    return n;
  }
  function sci(v) {                                /* 2.1×10⁷ */
    if (v < 1e4) return String(Math.round(v));
    var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
    var sup = String(e).split('').map(function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }).join('');
    return m.toFixed(1) + '×10' + sup;
  }
  function panelHTML(w) {
    return '<div style="width:' + w + 'px;display:flex;flex-direction:column;gap:9px;padding-top:2px">' +
      '<div data-num style="font:400 12.5px/1.7 var(--sans);color:var(--ink2)"></div>' +
      '<div data-note style="font:400 12px/1.55 var(--sans);color:var(--ink3);' +
      'border-top:1px solid rgba(22,24,29,.12);padding-top:9px"></div></div>';
  }
  function show(num, note) {
    host.querySelector('[data-num]').innerHTML = num;
    host.querySelector('[data-note]').innerHTML = note;
  }
  function b(s, c) { return '<b' + (c ? ' style="color:' + c + '"' : '') + '>' + s + '</b>'; }

  if (MODE === 'map') return mapMode();
  if (MODE === 'kernel') return kernelMode();
  if (MODE === 'dim') return dimMode();
  return dataMode();

  /* =================================================================
     map -- three walls as swimlanes; filled chips are the lab's papers
     ================================================================= */
  function mapMode() {
    var VIEW = opts.view === 'lab' ? 'lab' : 'all';
    var LANES = [
      { name: 'Kernel', sub: 'the prior is a guess' },
      { name: 'Dimension', sub: 'experiments cannot cover the space' },
      { name: 'Data', sub: 'O(n³) for every refit' }];
    var ERAS = ['2006 – 12', '2013 – 17', '2018 – 21', '2022 – 26'];
    function era(y) { return y < 2013 ? 0 : y < 2018 ? 1 : y < 2022 ? 2 : 3; }
    /* lab nodes carry n (their place in the thread) and long text for the walk */
    var NODES = [
      { l: 0, y: 2012, t: 'Average over θ', d: 'Snoek, Larochelle & Adams (NeurIPS 2012) — sample the kernel hyperparameters by MCMC and average the acquisition, instead of trusting one fitted θ.' },
      { l: 0, y: 2013, t: 'Spectral mixture', d: 'Wilson & Adams (ICML 2013) — a Gaussian mixture over the spectral density can represent any stationary kernel.' },
      { l: 0, y: 2013, t: 'Kernel grammar', d: 'Duvenaud et al. (ICML 2013) — search sums and products of base kernels, scored by marginal likelihood.' },
      { l: 0, y: 2016, t: 'Deep kernel', d: 'Wilson et al. (AISTATS 2016) — a network learns the features; a GP kernel sits on top of them.' },
      { l: 0, y: 2016, t: 'Kernel by BO', d: 'Malkomes, Schaff & Garnett (NeurIPS 2016) — choose the kernel itself with a second, model-level BO.' },
      { l: 0, y: 2018, t: 'Neural process', d: 'Garnelo et al. (ICML 2018) — learn the map from a context set to predictions, across many related tasks.' },
      { l: 0, y: 2022, t: 'Prior-fitted net', d: 'Müller et al. (ICLR 2022; PFNs4BO, ICML 2023) — a transformer pre-trained on functions drawn from a prior returns the posterior in one forward pass.' },
      { l: 0, y: 2022, lab: 1, n: 4, t: 'SM kernel, learned', also: 2,
        d: 'Jung, Song & Park (ICML 2022) — learn a spectral mixture kernel by random Fourier features and variational inference over its spectral points.',
        long: 'A spectral mixture kernel can represent any stationary kernel — Wall 1’s answer — but its many parameters overfit and train slowly. Approximating it with random Fourier features and inferring the spectral points variationally tames both, and the random-feature form also scales (Wall 3).' },
      { l: 0, y: 2023, lab: 1, n: 6, t: 'Bayesian ConvDeepSets', also: 2,
        d: 'Jung & Park (AISTATS 2023) — a neural process for stationary data, with a stationary prior chosen per task.',
        long: 'Convolutional deep sets build stationarity into a neural process but give ambiguous representations from few points. A Bayesian version with a stationary prior chosen per task — a wrongly imposed prior is worse than none — learns the prior across tasks (Wall 1) and predicts by a forward pass (Wall 3).' },
      { l: 0, y: 2024, lab: 1, n: 7, t: 'Offline meta-BBO',
        d: 'Yun, Lee et al. (KDD 2024) — traffic-light designs optimised from an offline meta-dataset collected under many traffic patterns.',
        long: 'Phase combinations and timings for city traffic lights are optimised from an offline meta-dataset of (design, congestion) pairs gathered under many traffic patterns, so the design adapts to the pattern at hand — prior knowledge from related tasks instead of new experiments.' },

      { l: 1, y: 2013, t: 'Random embedding', d: 'Wang et al. (IJCAI 2013) — optimise in a random low-dimensional subspace; enough when only a few inputs matter (REMBO).' },
      { l: 1, y: 2014, t: 'Learned embedding', d: 'Garnett, Osborne & Hennig (UAI 2014) — learn the linear embedding while optimising.' },
      { l: 1, y: 2015, t: 'Additive GP', d: 'Kandasamy, Schneider & Póczos (ICML 2015) — model f as a sum of low-dimensional parts.' },
      { l: 1, y: 2016, lab: 1, n: 2, t: 'Bayesian Ascent',
        d: 'Park & Law (IEEE TCST 2016) — BO restricted to a trust region around the incumbent, for real-time wind-farm control.',
        long: 'Maximise a wind farm’s total power by coordinating its turbines, using only power measurements. The next query is restricted to a trust region around the best point so far, so power rises monotonically with few trial actions — validated in a wind tunnel with scaled turbines (Energies 2017). TuRBO (2019) later used the same device to scale BO to high-dimensional problems.' },
      { l: 1, y: 2018, t: 'Latent-space BO', d: 'Gómez-Bombarelli et al. (ACS Cent. Sci. 2018) — optimise in a VAE’s latent space and decode the answer (Lecture 6).' },
      { l: 1, y: 2019, t: 'TuRBO', d: 'Eriksson et al. (NeurIPS 2019) — local trust regions, each with its own GP, grown on success and shrunk on failure.' },
      { l: 1, y: 2020, lab: 1, n: 3, t: 'CBOTR',
        d: 'Park (Sustain. Energy Technol. Assess. 2020) — contextual BO with a trust region, for wind farms under changing wind.',
        long: 'The wind keeps changing, so the best turbine settings depend on a context. CBOTR puts the context into the GP and keeps the trust region, reaching near-optimal power in a few trials per wind condition. Contextual Bayesian ascent first appeared at ACC 2017.' },
      { l: 1, y: 2021, t: 'SAASBO', d: 'Eriksson & Jankowiak (UAI 2021) — a sparsity prior on the length scales switches most inputs off.' },
      { l: 1, y: 2025, lab: 1, n: 8, t: 'DiBO', also: 2,
        d: 'Yun, Om et al. (ICML 2025) — candidate selection as posterior inference with a fine-tuned diffusion model.',
        long: 'Candidates are sampled from a posterior — a diffusion prior over good designs, times exp(β · UCB) of a deep ensemble — so arg-max becomes amortised sampling. Tested at 200–400 inputs with 10 000 evaluations, and on 100–180-dimensional robot, rover and DNA tasks.' },
      { l: 1, y: 2025, lab: 1, n: 9, t: 'Latent constrained',
        d: 'Om, Sim, Yun et al. (NeurIPS 2025 SPIGM workshop, oral) — posterior inference in a flow model’s latent space, with constraints.',
        long: 'Constrained black-box optimisation as posterior inference in the latent space of a flow model, with surrogates for the objective and for constraint violations; a diffusion sampler amortises the inference.' },

      { l: 2, y: 2006, t: 'Pseudo-inputs', d: 'Snelson & Ghahramani (2006) — m inducing points summarise n observations: O(nm²).' },
      { l: 2, y: 2007, t: 'Random features', d: 'Rahimi & Recht (NeurIPS 2007) — M random Fourier features turn the GP into Bayesian linear regression: O(nM²).' },
      { l: 2, y: 2009, t: 'Variational sparse GP', d: 'Titsias (AISTATS 2009) — place the inducing points by maximising a variational bound.' },
      { l: 2, y: 2013, t: 'SVGP', d: 'Hensman, Fusi & Lawrence (UAI 2013) — mini-batch training for millions of observations.' },
      { l: 2, y: 2015, t: 'DNGO', d: 'Snoek et al. (ICML 2015) — a network’s last layer as Bayesian linear regression: linear in n.' },
      { l: 2, y: 2015, t: 'KISS-GP', d: 'Wilson & Nickisch (ICML 2015) — interpolate onto a grid and exploit its structure.' },
      { l: 2, y: 2015, lab: 1, n: 1, t: 'Real-time sparse GP',
        d: 'Park et al. (IEEE BigData 2015) — sparse GP regression predicts a milling machine’s energy use in real time.',
        long: 'A machine tool streams sensor data; sparse GP regression keeps the model small enough to predict its energy use in real time. Wall 3, met in manufacturing before it was met in BO.' },
      { l: 2, y: 2018, t: 'GPU solvers', d: 'Gardner et al. (NeurIPS 2018) — exact GPs on GPUs through iterative solvers (GPyTorch).' },
      { l: 2, y: 2018, t: 'Ensemble BO', d: 'Wang et al. (AISTATS 2018) — partition the space and fit a local GP to each piece (EBO).' },
      { l: 2, y: 2022, lab: 1, n: 5, t: 'GP-emission HMM',
        d: 'Jung & Park (J. Comput. Graph. Stat. 2022) — scalable inference for a hidden Markov model with GP emissions.',
        long: 'A hidden Markov model whose emissions are Gaussian processes, with inference made scalable for long sequential time series.' }
    ];
    var LAB = NODES.filter(function (q) { return q.lab; }).sort(function (u, v) { return u.n - v.n; });
    var CIRC = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

    host.innerHTML =
      '<div class="wbar"><span class="wt">' + (VIEW === 'lab' ? 'Our lab’s thread through the three walls' : 'Three walls, and the streams that climb them') +
      '</span><span class="wspacer"></span><span class="wlabel">click any paper</span></div>' +
      '<div class="wbody" style="gap:8px;padding:10px 14px"><div data-g></div>' +
      '<div data-i style="min-height:' + (VIEW === 'lab' ? 66 : 38) + 'px;font:400 12.5px/1.5 var(--sans);color:var(--ink2);' +
      'border-top:1px solid rgba(22,24,29,.12);padding-top:8px"></div></div>';
    var G = host.querySelector('[data-g]'), INFO = host.querySelector('[data-i]');
    var st = 0, sel = null;
    var STEPS = VIEW === 'lab' ? LAB.length : 3;

    function chip(q, echo, fade) {
      var lab = !!q.lab, on = sel === q;
      var c = document.createElement('span');
      c.setAttribute('role', 'button'); c.tabIndex = 0;
      var base = 'display:inline-flex;align-items:center;gap:4px;margin:2px;padding:1px 7px 1px 6px;border-radius:10px;' +
        'font:500 10.5px/1.45 ' + SANS + ';cursor:pointer;white-space:nowrap;transition:opacity .2s;';
      if (echo) base += 'border:1px dashed ' + BLUE + ';color:' + BLUE + ';background:rgba(37,99,235,.05);';
      else if (lab) base += 'border:1px solid ' + BLUE + ';background:' + BLUE + ';color:#fff;';
      else base += 'border:1px solid rgba(22,24,29,.22);background:#fff;color:' + INK + ';';
      if (on) base += 'box-shadow:0 0 0 2px ' + INK + ';';
      if (fade) base += 'opacity:.3;';
      c.style.cssText = base;
      var num = lab && (st >= 3 || VIEW === 'lab') ? CIRC[q.n] + ' ' : '';
      c.innerHTML = (echo ? '↔ ' : num) + q.t +
        '<span style="font:500 9px/1 ' + MONO + ';opacity:.7">' + String(q.y).slice(2) + '</span>';
      /* render() replaces this chip, and a detached target no longer looks like it sits
         inside the widget -- so stop the click here, or the deck reads it as next() */
      c.onclick = function (ev) { ev.stopPropagation(); sel = q; render(); };
      return c;
    }
    function render() {
      var shown = VIEW === 'lab' ? 3 : Math.min(3, st + 1);
      var focus = VIEW === 'lab' || st >= 3;
      clear(G);
      var grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:128px 0.9fr 1.15fr 0.95fr 1.45fr;border:1px solid rgba(22,24,29,.12);background:#fff';
      var cell = function (html, css) {
        var d = document.createElement('div'); d.style.cssText = css || ''; if (html) d.innerHTML = html; grid.appendChild(d); return d;
      };
      cell('', 'border-bottom:1px solid rgba(22,24,29,.12)');
      ERAS.forEach(function (e, i) {
        cell(e, 'font:600 9.5px/1 ' + MONO + ';letter-spacing:.08em;color:var(--ink3);padding:5px 7px;' +
          'border-bottom:1px solid rgba(22,24,29,.12);border-left:1px solid rgba(22,24,29,.08);' + (i % 2 ? 'background:#FAFAF8' : ''));
      });
      LANES.forEach(function (ln, li) {
        var vis = li < shown;
        cell('<div style="font:650 13px/1.2 ' + SANS + ';color:' + INK + '">' + ln.name + '</div>' +
          '<div style="font:400 10.5px/1.35 ' + SANS + ';color:var(--ink3);margin-top:2px">' + ln.sub + '</div>',
          'padding:6px 9px;' + (li < 2 ? 'border-bottom:1px solid rgba(22,24,29,.12);' : '') + (vis ? '' : 'opacity:.35'));
        for (var e = 0; e < 4; e++) {
          var c = cell('', 'padding:3px;min-height:' + (VIEW === 'lab' ? 34 : 42) + 'px;display:flex;flex-wrap:wrap;align-content:center;' +
            'border-left:1px solid rgba(22,24,29,.08);' + (li < 2 ? 'border-bottom:1px solid rgba(22,24,29,.12);' : '') +
            (e % 2 ? 'background:#FAFAF8;' : ''));
          if (!vis) continue;
          NODES.forEach(function (q) {
            if (q.l === li && era(q.y) === e && (q.lab || VIEW !== 'lab')) c.appendChild(chip(q, false, focus && !q.lab));
            if (q.also === li && era(q.y) === e) c.appendChild(chip(q, true, false));
          });
        }
      });
      G.appendChild(grid);

      var info;
      if (sel) {
        info = (sel.lab ? '<b style="color:' + BLUE + '">' + CIRC[sel.n] + ' ' + sel.t + '</b> — ' : '<b>' + sel.t + '</b> — ') + sel.d +
          (sel.lab && VIEW === 'lab' && sel.long ? '<br><span style="color:var(--ink2)">' + sel.long + '</span>' : '');
      } else if (VIEW === 'lab') {
        info = 'Our lab’s papers in the order they appeared: ' + LAB.map(function (q) {
          return '<b style="color:' + BLUE + '">' + CIRC[q.n] + '</b> ' + q.t + ' (' + q.y + ')'; }).join(' · ') +
          '. Press → to walk them.';
      } else {
        info = [
          '<b>Wall 1 — which kernel?</b> Average over the prior, learn a richer one, or transfer it from related tasks. Filled chips are our lab’s papers.',
          '<b>Wall 2 — many inputs.</b> Assume structure, stay local inside a trust region, or move the search into a learned space.',
          '<b>Wall 3 — many observations.</b> Summarise the data with inducing points, approximate the kernel with random features, or replace the GP by a network that carries uncertainty. A dashed chip is a paper that answers this wall too.',
          'Numbered in time order, our lab’s papers form one thread: from wind-farm control (2015–16) to diffusion-based search (2025). The last slide of this part walks it.'][st];
      }
      INFO.innerHTML = info;
    }
    function step(i) {
      st = i;
      sel = VIEW === 'lab' && i > 0 ? LAB[i - 1] : null;
      render();
    }
    render();
    return {
      steps: STEPS, step: step,
      reset: function () { sel = VIEW === 'lab' && st > 0 ? LAB[st - 1] : null; render(); },
      finish: function () { step(VIEW === 'lab' ? 0 : 3); }
    };
  }

  /* =================================================================
     kernel -- Wall 1: the same data under three priors
     ================================================================= */
  function kernelMode() {
    var TRUTH = function (x) { return 0.8 * Math.sin(2 * Math.PI * x / 0.36) + 0.2; };
    var XO = [0.04, 0.10, 0.20, 0.28, 0.36, 0.50, 0.58], YO = XO.map(TRUTH), SN = 0.05;
    var FPLUS = Math.max.apply(null, YO);
    var KS = [
      { k: 'se', n: 'Squared exponential', c: BLUE, form: 'k(r) = s² exp(−r²/2ℓ²)',
        f: function (r, h) { return h.s2 * Math.exp(-0.5 * r * r / (h.l * h.l)); },
        why: 'Smooth: it bridges neighbouring observations with a gentle curve, so it expects a crest inside the widest gap — and EI goes to that gap.' },
      { k: 'm12', n: 'Matérn 1/2', c: AMBER, form: 'k(r) = s² exp(−|r|/ℓ)',
        f: function (r, h) { return h.s2 * Math.exp(-Math.abs(r) / h.l); },
        why: 'Rough: a neighbour says little beyond a short distance, so away from the data it reverts to the mean — EI stays beside the best observation.' },
      { k: 'per', n: 'Periodic', c: PURPLE, form: 'k(r) = s² exp(−2 sin²(πr/p)/ℓ²)',
        f: function (r, h) { var s = Math.sin(Math.PI * Math.abs(r) / h.p); return h.s2 * Math.exp(-2 * s * s / (h.l * h.l)); },
        why: 'It believes the pattern repeats: it extrapolates a crest where there are no data at all, is confident about it, and EI goes straight there.' }];

    /* type-II maximum likelihood on a grid: the honest way to give each kernel its best shot */
    var n = XO.length, M0 = YO.reduce(function (a, c) { return a + c; }, 0) / n, YC = YO.map(function (v) { return v - M0; });
    var LS = [], i; for (i = 0; i < 32; i++) LS.push(0.03 * Math.pow(100, i / 31));
    var S2 = [0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1, 1.5, 2, 3];
    KS.forEach(function (K) {
      var PS = K.k === 'per' ? (function () { var a = []; for (var j = 0; j < 36; j++) a.push(0.15 + 0.02 * j); return a; })() : [1];
      var best = null;
      LS.forEach(function (l) { S2.forEach(function (s2) { PS.forEach(function (p) {
        var h = { l: l, s2: s2, p: p };
        var A = XO.map(function (a, r) { return XO.map(function (c, q) { return K.f(a - c, h) + (r === q ? SN * SN : 0); }); });
        var L = chol(A); if (!L) return;
        var al = solveL(L, YC), qf = 0, ld = 0, t;
        for (t = 0; t < n; t++) { qf += al[t] * al[t]; ld += Math.log(L[t][t]); }
        var lml = -0.5 * qf - ld - 0.5 * n * Math.log(2 * Math.PI);
        if (!best || lml > best.lml) best = { h: h, lml: lml, L: L };
      }); }); });
      K.fit = best;
      K.alpha = solveLT(best.L, solveL(best.L, YC));
      K.G = []; K.ei = []; var bi = 0;
      for (i = 0; i <= 240; i++) {
        var x = i / 240, kx = XO.map(function (a) { return K.f(x - a, best.h); }), mu = M0, j;
        for (j = 0; j < n; j++) mu += kx[j] * K.alpha[j];
        var v = solveL(best.L, kx), vv = 0; for (j = 0; j < n; j++) vv += v[j] * v[j];
        var s = Math.sqrt(Math.max(1e-12, K.f(0, best.h) - vv)), z = (mu - FPLUS) / s;
        K.G.push({ x: x, mu: mu, s: s });
        K.ei.push(Math.max(0, (mu - FPLUS) * PHI(z) + s * phi(z)));
        if (K.ei[i] > K.ei[bi]) bi = i;
      }
      K.next = bi / 240;
    });

    host.innerHTML =
      '<div class="wbar"><span class="wt">Same seven observations, three kernels</span><span class="wspacer"></span>' +
      '<span class="wlabel">each fitted by marginal likelihood</span></div>' +
      '<div class="wbody" style="flex-direction:row;gap:20px;align-items:flex-start;justify-content:center"><div data-c></div>' +
      panelHTML(330) + '</div>';
    var W = 600, HP = 222, HA = 62, GAP = 14, H = HP + GAP + HA + 18, PL = 34, PR = 10;
    var sv = IE437.svg(W, H);
    host.querySelector('[data-c]').appendChild(sv);
    var X = function (x) { return PL + x * (W - PL - PR); };
    var YLO = -1.25, YHI = 1.75;
    var Y = function (v) { return 8 + (YHI - Math.max(YLO, Math.min(YHI, v))) / (YHI - YLO) * (HP - 16); };
    var ABOT = HP + GAP + HA;
    var st = 0;

    function curve(arr, fy) { return arr.map(function (g, k) { return (k ? 'L' : 'M') + X(g.x).toFixed(1) + ' ' + fy(g).toFixed(1); }).join(''); }
    function draw() {
      clear(sv);
      S('rect', { x: X(0), y: 4, width: X(1) - X(0), height: HP - 4, fill: '#FFFFFF' }, sv);
      [-1, 0, 1].forEach(function (v) {
        S('line', { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), stroke: INK, 'stroke-opacity': .08 }, sv);
        txt(sv, PL - 5, Y(v) + 3.5, String(v), { anchor: 'end', size: 9, op: .45 });
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(sv, X(v), ABOT + 13, String(v), { anchor: 'middle', size: 9, op: .45 }); });
      S('line', { x1: X(0), x2: X(1), y1: Y(FPLUS), y2: Y(FPLUS), stroke: INK, 'stroke-opacity': .45, 'stroke-dasharray': '4 3' }, sv);
      txt(sv, X(1) - 2, Y(FPLUS) - 5, 'f⁺ best so far', { anchor: 'end', size: 9.5, op: .6, halo: true });
      var list = st < 3 ? [KS[st]] : KS;
      list.forEach(function (K) {
        if (st < 3) {
          var band = curve(K.G, function (g) { return Y(g.mu + 2 * g.s); }) + K.G.slice().reverse().map(function (g) {
            return 'L' + X(g.x).toFixed(1) + ' ' + Y(g.mu - 2 * g.s).toFixed(1); }).join('') + 'Z';
          S('path', { d: band, fill: K.c, 'fill-opacity': .13 }, sv);
        }
        S('path', { d: curve(K.G, function (g) { return Y(g.mu); }), fill: 'none', stroke: K.c, 'stroke-width': 2 }, sv);
      });
      XO.forEach(function (x, k) { S('circle', { cx: X(x), cy: Y(YO[k]), r: 4, fill: INK }, sv); });
      /* the acquisition strip: each EI scaled to its own peak, since only the argmax matters here */
      S('line', { x1: X(0), x2: X(1), y1: ABOT, y2: ABOT, stroke: INK, 'stroke-opacity': .25 }, sv);
      txt(sv, X(0) + 3, HP + GAP + 9, 'EI(x), each scaled to its peak', { size: 9.5, op: .55 });
      list.forEach(function (K, li) {
        var mx = Math.max.apply(null, K.ei) || 1;
        S('path', { d: K.ei.map(function (v, k) { return (k ? 'L' : 'M') + X(k / 240).toFixed(1) + ' ' + (ABOT - v / mx * (HA - 14)).toFixed(1); }).join(''),
          fill: 'none', stroke: K.c, 'stroke-width': 1.8 }, sv);
        var nx = X(K.next);
        S('line', { x1: nx, x2: nx, y1: 6, y2: ABOT, stroke: K.c, 'stroke-width': 1.3, 'stroke-dasharray': '3 3', 'stroke-opacity': .8 }, sv);
        S('path', { d: 'M' + (nx - 6) + ' ' + (ABOT + 1) + 'h12l-6 -9Z', fill: K.c }, sv);
        txt(sv, Math.min(nx + 5, X(1) - 4), 18 + 13 * li, 'next ' + K.next.toFixed(2), { anchor: K.next > 0.85 ? 'end' : 'start', size: 10, weight: 600, fill: K.c, halo: true });
      });

      var num, note;
      if (st < 3) {
        var K = KS[st], h = K.fit.h;
        num = b(K.n, K.c) + ' &nbsp;<span style="color:var(--ink3)">' + K.form + '</span><br>' +
          'fitted: ' + (K.k === 'per' ? 'period p = ' + h.p.toFixed(2) + ', ' : '') + 'ℓ = ' + h.l.toFixed(2) + ', s = ' + Math.sqrt(h.s2).toFixed(2) + '<br>' +
          'log evidence log p(y | k, θ̂) = ' + b(K.fit.lml.toFixed(2)) + '<br>' +
          'EI sends the next experiment to ' + b('x = ' + K.next.toFixed(2), K.c);
        note = K.why;
      } else {
        var ord = KS.slice().sort(function (u, v) { return v.fit.lml - u.fit.lml; });
        num = '<table style="border-collapse:collapse;font:400 12px/1.65 var(--mono);color:var(--ink2)">' +
          '<tr><td style="padding:0 8px 0 0"></td><td style="padding:0 8px">log evidence</td><td>next x</td></tr>' +
          KS.map(function (K) {
            return '<tr><td style="padding:0 8px 0 0;color:' + K.c + ';font-weight:600">' + K.n + '</td><td style="padding:0 8px;text-align:right">' +
              K.fit.lml.toFixed(2) + '</td><td style="text-align:right;color:' + K.c + ';font-weight:600">' + K.next.toFixed(2) + '</td></tr>';
          }).join('') + '</table>';
        note = 'Same seven numbers, three experiments. The evidence prefers the ' + ord[0].n.toLowerCase() + ' kernel — by a factor e<sup>' +
          (ord[0].fit.lml - ord[1].fit.lml).toFixed(1) + '</sup> ≈ ' + Math.round(Math.exp(ord[0].fit.lml - ord[1].fit.lml)) +
          ' over the runner-up — but it can only rank the kernels we wrote down.';
      }
      show(num, note);
    }
    draw();
    return {
      steps: 3, step: function (i) { st = i; draw(); },
      reset: function () { draw(); },
      finish: function () { st = 3; draw(); }
    };
  }

  /* =================================================================
     dim -- Wall 2: what 100 experiments let the GP see, as knobs are added
     A 2-D window through the design (knob 1 x knob 2, every other knob at
     0.5), shaded by how much the GP knows there: 1 - sigma(x)/sigma0.
     ================================================================= */
  function dimMode() {
    var N = 100, DMAX = 20, ELL = 0.2, Q = 600, G = 40;
    var DS = [2, 3, 4, 5, 6, 8, 10, 20], WALK = [0, 1, 2, 3, 4, 6];
    var g = IE437.rng(opts.seed || 7), r, k;
    var XX = [], ZZ = [];
    for (r = 0; r < N; r++) { var a = new Float64Array(DMAX); for (k = 0; k < DMAX; k++) a[k] = g(); XX.push(a); }
    var g2 = IE437.rng(99);
    for (r = 0; r < Q; r++) { var z = new Float64Array(DMAX); for (k = 0; k < DMAX; k++) z[k] = g2(); ZZ.push(z); }
    var cache = {};
    function stats(d) {
      if (cache[d]) return cache[d];
      var e2 = 2 * ELL * ELL;
      var d2 = function (u, v) { var s = 0; for (var t = 0; t < d; t++) { var w = u[t] - v[t]; s += w * w; } return s; };
      var L = chol(XX.map(function (u, i) { return XX.map(function (v, j) { return Math.exp(-d2(u, v) / e2) + (i === j ? 1e-4 : 0); }); }));
      /* how far each experiment sits from the window, in the knobs the window hides */
      var del = XX.map(function (u) { var s = 0; for (var t = 2; t < d; t++) { var w = u[t] - 0.5; s += w * w; } return s; });
      var know = [], i, j;
      for (i = 0; i < G; i++) for (j = 0; j < G; j++) {
        var x = (i + 0.5) / G, y = (j + 0.5) / G;
        var kx = XX.map(function (u, m) { var dx = x - u[0], dy = y - u[1]; return Math.exp(-(dx * dx + dy * dy + del[m]) / e2); });
        var v = solveL(L, kx), vv = 0; for (var t = 0; t < N; t++) vv += v[t] * v[t];
        know.push(1 - Math.sqrt(Math.max(0, 1 - vv)));
      }
      var known = 0;
      ZZ.forEach(function (q) {
        var kq = XX.map(function (u) { return Math.exp(-d2(q, u) / e2); }), v = solveL(L, kq), vv = 0;
        for (var t = 0; t < N; t++) vv += v[t] * v[t];
        if (Math.sqrt(Math.max(0, 1 - vv)) < 0.5) known++;
      });
      var near = del.filter(function (s) { return Math.exp(-s / e2) > 0.3; }).length;
      return (cache[d] = { know: know, del: del, share: known / Q, near: near });
    }

    host.innerHTML =
      '<div class="wbar"><span class="wt">100 experiments on a design with d knobs</span><span class="wspacer"></span>' +
      '<span class="wlabel">knobs</span><span class="wnum" data-dv></span><div data-sl></div></div>' +
      '<div class="wbody" style="flex-direction:row;gap:18px;align-items:flex-start;justify-content:center">' +
      '<div style="display:flex;flex-direction:column;gap:3px"><div class="wlabel" data-wl></div><div data-c1></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:3px"><div class="wlabel">share of the whole space the GP knows</div><div data-c2></div></div>' +
      panelHTML(300) + '</div>';
    var W1 = 292, H1 = 270, W2 = 270, H2 = 236;
    var sv1 = IE437.svg(W1, H1), sv2 = IE437.svg(W2, H2);
    host.querySelector('[data-c1]').appendChild(sv1);
    host.querySelector('[data-c2]').appendChild(sv2);
    var di = 0;
    var dial = IE437.slider(host.querySelector('[data-sl]'), {
      bare: true, min: 0, max: DS.length - 1, step: 1, value: 0, width: 120, on: function (v) { di = v; draw(); }
    });
    function sup(n) { return String(n).split('').map(function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }).join(''); }

    function draw() {
      var d = DS[di], s = stats(d), i, j;
      host.querySelector('[data-dv]').textContent = 'd = ' + d;
      host.querySelector('[data-wl]').textContent = d === 2 ? 'the whole design: knob 1 × knob 2' : 'a window: knob 1 × knob 2, the other ' + (d - 2) + ' at 0.5';
      /* the window, lit where the GP knows something */
      clear(sv1);
      var PL = 30, PT = 4, SZ = 236;
      S('rect', { x: PL, y: PT, width: SZ, height: SZ, fill: '#FFFFFF' }, sv1);
      /* one G x G bitmap, upscaled smoothly: light, not a mosaic of seams */
      var cv = document.createElement('canvas'); cv.width = G; cv.height = G;
      var cx = cv.getContext('2d'), im = cx.createImageData(G, G);
      for (i = 0; i < G; i++) for (j = 0; j < G; j++) {
        var o = ((G - 1 - j) * G + i) * 4;
        im.data[o] = 37; im.data[o + 1] = 99; im.data[o + 2] = 235;
        im.data[o + 3] = Math.round(255 * 0.85 * Math.max(0, s.know[i * G + j]));
      }
      cx.putImageData(im, 0, 0);
      S('image', { x: PL, y: PT, width: SZ, height: SZ, href: cv.toDataURL(), preserveAspectRatio: 'none' }, sv1);
      XX.forEach(function (u, m) {
        var w = Math.exp(-s.del[m] / (2 * ELL * ELL));
        if (w > 0.03) S('circle', { cx: PL + u[0] * SZ, cy: PT + SZ - u[1] * SZ, r: 2.6, fill: INK, 'fill-opacity': (0.9 * w).toFixed(3) }, sv1);
      });
      S('rect', { x: PL, y: PT, width: SZ, height: SZ, fill: 'none', stroke: INK, 'stroke-opacity': .35 }, sv1);
      txt(sv1, PL + SZ / 2, PT + SZ + 16, 'knob 1', { anchor: 'middle', size: 10, op: .6 });
      var t2 = txt(sv1, PL - 8, PT + SZ / 2, 'knob 2', { anchor: 'middle', size: 10, op: .6 });
      t2.setAttribute('transform', 'rotate(-90 ' + (PL - 8) + ' ' + (PT + SZ / 2) + ')');
      /* share known against d */
      clear(sv2);
      var QL = 36, QB = 30, QT = 8, QR = 12;
      var XD = function (ix) { return QL + ix / (DS.length - 1) * (W2 - QL - QR); };
      var YD = function (f) { return H2 - QB - f * (H2 - QB - QT); };
      S('rect', { x: QL, y: QT, width: W2 - QL - QR, height: H2 - QB - QT, fill: '#FFFFFF' }, sv2);
      [0, 0.5, 1].forEach(function (f) {
        S('line', { x1: QL, x2: W2 - QR, y1: YD(f), y2: YD(f), stroke: INK, 'stroke-opacity': .08 }, sv2);
        txt(sv2, QL - 5, YD(f) + 3.5, Math.round(f * 100) + '%', { anchor: 'end', size: 9, op: .45 });
      });
      DS.forEach(function (dd, ix) { txt(sv2, XD(ix), H2 - QB + 14, String(dd), { anchor: 'middle', size: 9.5, op: .55 }); });
      txt(sv2, W2 - QR, H2 - 3, 'knobs d', { anchor: 'end', size: 9, op: .5 });
      var seen = [];
      DS.forEach(function (dd, ix) { if (ix <= di || cache[dd]) seen.push(ix); });
      S('path', { d: seen.map(function (ix, n) { return (n ? 'L' : 'M') + XD(ix).toFixed(1) + ' ' + YD(stats(DS[ix]).share).toFixed(1); }).join(''),
        fill: 'none', stroke: BLUE, 'stroke-width': 1.8 }, sv2);
      seen.forEach(function (ix) {
        var cur = ix === di;
        S('circle', { cx: XD(ix), cy: YD(stats(DS[ix]).share), r: cur ? 5.5 : 3.2, fill: cur ? BLUE : '#FFFFFF', stroke: BLUE, 'stroke-width': 1.5 }, sv2);
      });
      S('line', { x1: QL, x2: W2 - QR, y1: YD(0), y2: YD(0), stroke: INK, 'stroke-opacity': .3 }, sv2);

      var pct = s.share * 100, years = Math.pow(10, d) / 365;
      show(
        b(d + ' knobs') + ', each scaled to [0, 1] · ' + b('100 experiments') + ' · length scale 0.2<br>' +
        'the GP knows ' + b((pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct)) + '%', s.share > 0.5 ? BLUE : SLATE) + ' of the whole space' +
        ' <span style="color:var(--ink3)">(σ below half its prior)</span><br>' +
        'experiments close to this window: ' + b(s.near + ' of 100') + '<br>' +
        'to keep the 2-knob spacing: ' + b('10' + sup(d)) + ' experiments' +
        (d > 2 ? ' <span style="color:var(--ink3)">— one a day: ' + (years < 1e3 ? Math.round(years) + ' years' : (years / 1e6 >= 1 ? sci(years).replace('×', ' × ') + ' years' : Math.round(years).toLocaleString('en-US') + ' years')) + '</span>' : ''),
        d === 2 ? 'Each experiment teaches the GP about its neighbourhood — about one length scale around it. With two knobs, 100 experiments light up the whole design.'
          : d <= 4 ? 'Only experiments whose other knobs happen to sit near 0.5 still light this window. The same 100 points are spread over a much larger space.'
          : 'The window is dark: every point is several length scales from every experiment, so μ(x) and σ(x) are just the prior there — EI is flat, and BO has nothing to compare.');
    }
    draw();
    return {
      steps: WALK.length - 1,
      step: function (i) { di = WALK[i]; dial.set(di, false); draw(); },
      reset: function () { draw(); },
      finish: function () { di = 3; dial.set(3, false); draw(); }
    };
  }

  /* =================================================================
     data -- Wall 3: the exact posterior against m inducing points
     ================================================================= */
  function dataMode() {
    var TRUE = function (x) { return 0.55 + 0.42 * Math.sin(6.1 * x - 1.1) + 0.30 * Math.sin(2.0 * x + 0.4) + 0.10 * x + 0.18 * Math.sin(17 * x); };
    var N = 400, SN = 0.2, S0 = 0.5, LS = 0.07, GN = 200;
    var g = IE437.rng(opts.seed || 11), gauss = gaussFrom(g), i, j;
    var XD = []; for (i = 0; i < N; i++) XD.push(g()); XD.sort(function (u, v) { return u - v; });
    var YD = XD.map(function (x) { return TRUE(x) + SN * gauss(); });
    var kf = function (a, c) { var t = a - c; return S0 * S0 * Math.exp(-0.5 * t * t / (LS * LS)); };
    var M0 = YD.reduce(function (a, c) { return a + c; }, 0) / N, YC = YD.map(function (v) { return v - M0; });
    var GX = []; for (i = 0; i <= GN; i++) GX.push(i / GN);
    /* the exact posterior: one 400 x 400 Cholesky, done once */
    var Kn = XD.map(function (a, r) { return XD.map(function (c, q) { return kf(a, c) + (r === q ? SN * SN : 0); }); });
    var LN = chol(Kn), AL = solveLT(LN, solveL(LN, YC));
    var EX = GX.map(function (x) {
      var kx = XD.map(function (a) { return kf(x, a); }), mu = M0, t;
      for (t = 0; t < N; t++) mu += kx[t] * AL[t];
      var v = solveL(LN, kx), vv = 0; for (t = 0; t < N; t++) vv += v[t] * v[t];
      return { mu: mu, s: Math.sqrt(Math.max(0, S0 * S0 - vv)) };
    });
    function sparse(m) {                         /* DTC / Titsias predictive, inducing points on a grid */
      var Z = [], t, u;
      for (t = 0; t < m; t++) Z.push((t + 0.5) / m);
      var Kmm = Z.map(function (a, r) { return Z.map(function (c, q) { return kf(a, c) + (r === q ? 1e-8 : 0); }); });
      var Kmn = Z.map(function (a) { return XD.map(function (c) { return kf(a, c); }); });
      var A = Z.map(function (_, r) { return Z.map(function (__, q) { var s = Kmm[r][q]; for (var w = 0; w < N; w++) s += Kmn[r][w] * Kmn[q][w] / (SN * SN); return s; }); });
      var LA = chol(A), Lm = chol(Kmm);
      var bb = Z.map(function (_, r) { var s = 0; for (var w = 0; w < N; w++) s += Kmn[r][w] * YC[w]; return s / (SN * SN); });
      var wv = solveLT(LA, solveL(LA, bb)), gap = 0;
      var P = GX.map(function (x, gi) {
        var ks = Z.map(function (zz) { return kf(x, zz); }), mu = M0, a1 = solveL(Lm, ks), a2 = solveL(LA, ks), q1 = 0, q2 = 0;
        for (u = 0; u < m; u++) { mu += ks[u] * wv[u]; q1 += a1[u] * a1[u]; q2 += a2[u] * a2[u]; }
        gap = Math.max(gap, Math.abs(mu - EX[gi].mu));
        return { mu: mu, s: Math.sqrt(Math.max(0, S0 * S0 - q1 + q2)) };
      });
      return { Z: Z, P: P, gap: gap };
    }
    var MS = [0, 4, 8, 16, 24];

    host.innerHTML =
      '<div class="wbar"><span class="wt">400 observations: exact GP against m inducing points</span><span class="wspacer"></span>' +
      '<span class="wlabel">inducing points m</span><span class="wnum" data-mv></span><div data-sl></div></div>' +
      '<div class="wbody" style="flex-direction:row;gap:20px;align-items:flex-start;justify-content:center"><div data-c></div>' +
      panelHTML(330) + '</div>';
    var W = 600, H = 270, PL = 34, PR = 10, PT = 6, PB = 26;
    var sv = IE437.svg(W, H);
    host.querySelector('[data-c]').appendChild(sv);
    var X = function (x) { return PL + x * (W - PL - PR); };
    var YLO = -0.6, YHI = 1.9;
    var Y = function (v) { return PT + (YHI - Math.max(YLO, Math.min(YHI, v))) / (YHI - YLO) * (H - PT - PB); };
    var m = 0;
    var dial = IE437.slider(host.querySelector('[data-sl]'), {
      bare: true, min: 2, max: 40, step: 1, value: 8, width: 120, on: function (v) { m = v; draw(); }
    });
    function band(P, c, op) {
      var d = P.map(function (p, k) { return (k ? 'L' : 'M') + X(GX[k]).toFixed(1) + ' ' + Y(p.mu + 2 * p.s).toFixed(1); }).join('') +
        P.slice().reverse().map(function (p, k) { return 'L' + X(GX[GN - k]).toFixed(1) + ' ' + Y(p.mu - 2 * p.s).toFixed(1); }).join('') + 'Z';
      S('path', { d: d, fill: c, 'fill-opacity': op }, sv);
    }
    function line(P, attrs) {
      attrs.d = P.map(function (p, k) { return (k ? 'L' : 'M') + X(GX[k]).toFixed(1) + ' ' + Y(p.mu).toFixed(1); }).join('');
      attrs.fill = 'none'; S('path', attrs, sv);
    }
    function draw() {
      clear(sv);
      host.querySelector('[data-mv]').textContent = m ? 'm = ' + m : 'exact';
      S('rect', { x: X(0), y: PT, width: X(1) - X(0), height: H - PT - PB, fill: '#FFFFFF' }, sv);
      [0, 1].forEach(function (v) {
        S('line', { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), stroke: INK, 'stroke-opacity': .08 }, sv);
        txt(sv, PL - 5, Y(v) + 3.5, String(v), { anchor: 'end', size: 9, op: .45 });
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { txt(sv, X(v), H - PB + 14, String(v), { anchor: 'middle', size: 9, op: .45 }); });
      XD.forEach(function (x, k) { S('circle', { cx: X(x), cy: Y(YD[k]), r: 1.5, fill: INK, 'fill-opacity': .22 }, sv); });
      var sp = m ? sparse(m) : null;
      if (sp) band(sp.P, BLUE, .14); else band(EX, INK, .07);
      line(EX, { stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': m ? '5 3' : '', 'stroke-opacity': m ? .75 : .9 });
      if (sp) {
        line(sp.P, { stroke: BLUE, 'stroke-width': 2.2 });
        sp.Z.forEach(function (zz) { S('path', { d: 'M' + (X(zz) - 5) + ' ' + (H - PB) + 'h10l-5 -9Z', fill: BLUE }, sv); });
      }
      S('line', { x1: X(0), x2: X(1), y1: H - PB, y2: H - PB, stroke: INK, 'stroke-opacity': .3 }, sv);
      txt(sv, X(0) + 4, PT + 12, m ? 'dashed: exact GP · blue: sparse GP, ±2σ · ▲ inducing points' : 'exact GP from all 400 points, ±2σ', { size: 9.5, op: .65, halo: true });

      var ex = N * N * N / 3;
      var num = 'n = ' + b('400') + ' observations, length scale 0.07<br>' +
        b('exact', INK) + ': Cholesky of a 400×400 matrix ≈ n³/3 = ' + b(sci(ex)) + ' flops, ' + sci(N * N) + ' kernel entries';
      if (sp) num += '<br>' + b('sparse, m = ' + m, BLUE) + ': ≈ n m² = ' + b(sci(N * m * m)) + ' flops, ' + sci(N * m) + ' entries' +
        '<br>largest gap to the exact mean: ' + b(sp.gap.toFixed(3), sp.gap < 0.02 ? BLUE : AMBER);
      num += '<br><span style="color:var(--ink3)">at n = 10 000: exact ≈ ' + sci(1e12 / 3) + ' flops and 0.8 GB per refit</span>';
      var note = !sp ? 'Every new observation means refactorising this matrix — and refitting the kernel means doing it many times. That is why BO usually stops at a few thousand evaluations.'
        : 1 / m > LS * 1.6 ? 'With inducing points ' + (1 / m).toFixed(2) + ' apart against a length scale of 0.07, the summary cannot carry the wiggles: the sparse posterior is smoother than the data allow.'
        : sp.gap > 0.02 ? 'Closer: the inducing points now nearly resolve the length scale, at a cost ' + Math.round(ex / (N * m * m)) + ' times smaller.'
        : 'Once the spacing is below the length scale, ' + m + ' inducing points stand in for 400 observations — the same posterior at about 1/' + Math.round(ex / (N * m * m)) + ' of the cost.';
      show(num, note);
    }
    function setM(v) { m = v; if (v) dial.set(v, false); dial.el.style.opacity = v ? 1 : .45; draw(); }
    setM(0);
    return {
      steps: MS.length - 1,
      step: function (i) { setM(MS[i]); },
      reset: function () { draw(); },
      finish: function () { setM(16); }
    };
  }
});
})();
