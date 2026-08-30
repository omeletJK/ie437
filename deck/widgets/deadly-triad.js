/* ============================================================
   widget: deadly-triad
   Tsitsiklis & Van Roy's two-state counterexample, wired to the
   three switches. Every reward is 0, so the true value is 0
   everywhere. Turn on all three ingredients and the estimate
   explodes; turn any ONE of them off and it collapses to 0.
      s1 (phi = 1)  ->  s2 (phi = 2)  ->  s2 ... -> terminal
   ============================================================ */
IE437.widget('deadly-triad', function (host, opts) {
  var TEAL = '#2563EB', RED = '#D64545';   // converged = blue, diverging = red
  var GAMMA = 0.99, ALPHA = 0.02, PHI = [1, 2], TOTAL = 4000;
  var fa = true, boot = true, off = true;
  var w, V, s, n, hist, rand;

  host.innerHTML =
    '<div class="wbar"><span class="wt">Two states, zero rewards, true value = 0 &mdash; what could go wrong</span>' +
    '<span class="wspacer"></span>' +
    '<button class="wb" data-run>run 4000 updates</button>' +
    '<button class="wb" data-rs>reset</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:18px">' +
    '<div style="flex:.85;display:flex;flex-direction:column;gap:9px;justify-content:center;min-width:0">' +
    '<label class="wtog on" data-t="fa"><i></i><span>function approximation<br>' +
    '<span style="opacity:.65;font-weight:400">one shared w, not a table</span></span></label>' +
    '<label class="wtog on" data-t="boot"><i></i><span>bootstrapping<br>' +
    '<span style="opacity:.65;font-weight:400">target r + &gamma;V(s&prime;), not the return</span></span></label>' +
    '<label class="wtog on" data-t="off"><i></i><span>off-policy distribution<br>' +
    '<span style="opacity:.65;font-weight:400">update s&#8321;&rarr;s&#8322; only</span></span></label>' +
    '<div data-verdict style="margin-top:6px;padding:9px 12px;border-radius:4px;text-align:center;' +
    'font:600 12px/1.4 var(--mono);letter-spacing:.04em"></div>' +
    '</div>' +
    '<div style="flex:1.15;display:flex;flex-direction:column;align-items:center;min-width:0">' +
    '<div class="wlabel" style="margin-bottom:3px">|V(s&#8321;)| &mdash; log scale, true value is 0</div>' +
    '<div data-c></div></div></div>';

  var CW = 540, CH = 292;
  var ch = IE437.svg(CW, CH);
  host.querySelector('[data-c]').appendChild(ch);

  function value(st) { return fa ? w * PHI[st] : V[st]; }

  function update() {
    var st, nx, done;
    if (off) { st = 0; nx = 1; done = false; }                 // always the s1 -> s2 transition
    else {
      st = s;
      if (st === 0) { nx = 1; done = false; }
      else { done = rand() < 0.1; nx = 1; }
      s = done ? 0 : nx;
    }
    var target = boot ? (done ? 0 : GAMMA * value(nx)) : 0;     // all rewards are zero
    var delta = target - value(st);
    if (fa) w += ALPHA * delta * PHI[st];
    else V[st] += ALPHA * delta;
    n++;
    if (n % 20 === 0) hist.push([n, Math.log10(Math.max(1e-6, Math.abs(value(0))))]);
  }

  function verdict() {
    var m = Math.abs(value(0)), el = host.querySelector('[data-verdict]');
    if (n < 100) { el.style.background = 'transparent'; el.style.color = 'var(--ink3)'; el.innerHTML = 'press run'; return; }
    if (m > 1e3) {
      el.style.background = 'rgba(176,58,46,.12)'; el.style.color = RED;
      el.innerHTML = 'DIVERGING<br><span style="font-weight:400;font-size:11px">|V(s&#8321;)| = ' + m.toExponential(1) + '</span>';
    } else if (m < 0.02) {
      el.style.background = 'rgba(15,110,86,.12)'; el.style.color = TEAL;
      el.innerHTML = 'CONVERGED TO 0<br><span style="font-weight:400;font-size:11px">|V(s&#8321;)| = ' + m.toFixed(4) + '</span>';
    } else {
      el.style.background = 'rgba(26,26,25,.05)'; el.style.color = 'var(--ink2)';
      el.innerHTML = 'still settling<br><span style="font-weight:400;font-size:11px">|V(s&#8321;)| = ' + m.toFixed(3) + '</span>';
    }
  }

  function draw() {
    var lo = -4, hi = Math.max(1, Math.ceil(hist.length ? hist[hist.length - 1][1] : 0) + 1);
    var ticks = []; for (var t = lo; t <= hi; t += Math.max(1, Math.round((hi - lo) / 5))) ticks.push(t);
    IE437.plot(ch, {
      w: CW, h: CH, pad: { l: 48, r: 12, t: 12, b: 28 },
      xdom: [0, TOTAL], ydom: [lo, hi], yticks: ticks,
      xticks: [0, TOTAL / 2, TOTAL], xlabel: 'updates',
      yfmt: function (v) { return '1e' + v; },
      series: [
        { pts: [[0, 0], [TOTAL, 0]], color: 'currentColor', w: 1, dash: '3 3' },
        { pts: hist, color: (Math.abs(value(0)) > 1e3 ? RED : TEAL), w: 2 }
      ]
    });
    verdict();
  }

  function reset() {
    w = 1; V = [1, 0]; s = 0; n = 0; rand = IE437.rng(opts.seed || 5);
    hist = [[0, Math.log10(Math.abs(value(0)))]];
    draw();
  }
  function run() { while (n < TOTAL) update(); draw(); }

  host.querySelectorAll('.wtog').forEach(function (el) {
    el.onclick = function () {
      var k = el.getAttribute('data-t');
      if (k === 'fa') fa = !fa; else if (k === 'boot') boot = !boot; else off = !off;
      el.classList.toggle('on');
      reset();
    };
  });
  host.querySelector('[data-run]').onclick = run;
  host.querySelector('[data-rs]').onclick = reset;

  reset();
  return { finish: function () { if (n < TOTAL) run(); } };
});
