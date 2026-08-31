/* ============================================================
   widget: mc-vs-td
   Sutton & Barto's 5-state random walk (Example 6.2).
   Both methods estimate the SAME V^pi from the SAME episodes;
   only the target differs — realized return G_t (MC) vs.
   one step then bootstrap, r + gamma*V(s') (TD).
   Shows: TD's low-variance target converges faster and smoother.
   ============================================================ */
IE437.widget('mc-vs-td', function (host, opts) {
  var E = IE437.el, NAMES = ['A', 'B', 'C', 'D', 'E'];
  var TRUE = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6];
  var TD = '#2563EB', MC = '#D97706';   // bootstrap = blue, realized return = amber
  var alpha = opts.alpha || 0.1, seed = opts.seed || 7;
  var rand, ep, Vmc, Vtd, hist;

  host.innerHTML =
    '<div class="wbar">' +
    '<span class="wt">Random walk &mdash; prediction from the same episodes</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel">step size</span><span class="wnum" data-a></span>' +
    '<button class="wb" data-al>&alpha; = 0.05 / 0.1 / 0.2</button>' +
    '<button class="wb" data-r1>+1 ep</button>' +
    '<button class="wb" data-r10>+10</button>' +
    '<button class="wb" data-r100>+100</button>' +
    '' +
    '</div>' +
    '<div class="wbody" style="flex-direction:row;gap:16px">' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">' +
    '<div class="wlabel" style="margin-bottom:3px">estimated value V(s) after <span data-ep>0</span> episodes</div>' +
    '<div data-c1></div></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;min-width:0">' +
    '<div class="wlabel" style="margin-bottom:3px">RMS error over the five states</div>' +
    '<div data-c2></div></div>' +
    '</div>' +
    '<div style="display:flex;gap:18px;justify-content:center;padding:0 0 9px;' +
    'font:500 10px/1 var(--mono);letter-spacing:.08em">' +
    '<span style="color:' + MC + '">&#9473;&#9473; Monte Carlo &mdash; wait for G<sub>t</sub></span>' +
    '<span style="color:' + TD + '">&#9473;&#9473; TD(0) &mdash; bootstrap after one step</span>' +
    '<span style="opacity:.45">&#9476;&#9476; true V<sup>&pi;</sup></span></div>';

  var CW = 512, CH = 286;
  var sv1 = IE437.svg(CW, CH), sv2 = IE437.svg(CW, CH);
  host.querySelector('[data-c1]').appendChild(sv1);
  host.querySelector('[data-c2]').appendChild(sv2);

  function reset() {
    rand = IE437.rng(seed); ep = 0;
    Vmc = [.5, .5, .5, .5, .5]; Vtd = [.5, .5, .5, .5, .5];
    hist = { mc: [[0, rms(Vmc)]], td: [[0, rms(Vtd)]] };
    draw();
  }
  function rms(V) {
    var s = 0; for (var i = 0; i < 5; i++) { var d = V[i] - TRUE[i]; s += d * d; }
    return Math.sqrt(s / 5);
  }
  function episode() {
    /* one walk from C; terminals are index -1 (left, r=0) and 5 (right, r=1) */
    var s = 2, traj = [];
    while (s >= 0 && s <= 4) {
      var ns = s + (rand() < 0.5 ? -1 : 1);
      var r = (ns > 4) ? 1 : 0;
      traj.push([s, r, ns]);
      s = ns;
    }
    /* TD(0): update online, one transition at a time */
    traj.forEach(function (t) {
      var vn = (t[2] < 0 || t[2] > 4) ? 0 : Vtd[t[2]];
      Vtd[t[0]] += alpha * (t[1] + vn - Vtd[t[0]]);
    });
    /* MC: wait for the episode to end, then use the realized return (gamma = 1) */
    var G = 0;
    for (var i = traj.length - 1; i >= 0; i--) {
      G = traj[i][1] + G;
      Vmc[traj[i][0]] += alpha * (G - Vmc[traj[i][0]]);
    }
    ep++;
    hist.mc.push([ep, rms(Vmc)]);
    hist.td.push([ep, rms(Vtd)]);
  }
  function run(n) { for (var i = 0; i < n; i++) episode(); draw(); }

  function draw() {
    host.querySelector('[data-ep]').textContent = ep;
    host.querySelector('[data-a]').textContent = alpha.toFixed(2);
    var xs = [0, 1, 2, 3, 4];
    IE437.plot(sv1, {
      w: CW, h: CH, pad: { l: 40, r: 10, t: 12, b: 28 },
      xdom: [0, 4], ydom: [0, 1], yticks: [0, .25, .5, .75, 1],
      xticks: xs, xfmt: function (i) { return NAMES[i]; },
      yfmt: function (v) { return v.toFixed(2); },
      series: [
        { pts: xs.map(function (i) { return [i, TRUE[i]]; }), color: 'currentColor', w: 1.2, dash: '3 3' },
        { pts: xs.map(function (i) { return [i, Vmc[i]]; }), color: MC, w: 2, dots: true },
        { pts: xs.map(function (i) { return [i, Vtd[i]]; }), color: TD, w: 2, dots: true }
      ]
    });
    var maxEp = Math.max(20, ep);
    IE437.plot(sv2, {
      w: CW, h: CH, pad: { l: 40, r: 10, t: 12, b: 28 },
      xdom: [0, maxEp], ydom: [0, 0.45], yticks: [0, .1, .2, .3, .4],
      xticks: [0, Math.round(maxEp / 2), maxEp], xlabel: 'episodes',
      yfmt: function (v) { return v.toFixed(2); },
      series: [
        { pts: hist.mc, color: MC, w: 1.8 },
        { pts: hist.td, color: TD, w: 1.8 }
      ]
    });
  }

  host.querySelector('[data-r1]').onclick = function () { run(1); };
  host.querySelector('[data-r10]').onclick = function () { run(10); };
  host.querySelector('[data-r100]').onclick = function () { run(100); };
  var __reset = reset;
  host.querySelector('[data-al]').onclick = function () {
    alpha = alpha === 0.05 ? 0.1 : alpha === 0.1 ? 0.2 : 0.05; reset();
  };

  reset();
  return { reset: __reset, finish: function () { if (ep < 100) run(100 - ep); } };
});
