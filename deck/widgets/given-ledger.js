/* ============================================================
   widget: given-ledger
   The course read as a slow confiscation. Walk the lectures and
   watch each thing you were handed turn uncertain, then unknown.
   The counter is the point: the static half of the course learns
   ONE object (f); the dynamic half learns TWO (r and P).
   ============================================================ */
IE437.widget('given-ledger', function (host, opts) {
  var INK = '#16181D', BLUE = '#2563EB', AMBER = '#D97706', RED = '#D64545', SLATE = '#64748B';

  /* status codes: g given · u uncertain · s only samples · l learned back · n not in play */
  var ROWS = [
    { k: 'f', name: 'objective <i>f</i>', sub: 'what “good” means' },
    { k: 'q', name: 'the right to query <i>f</i>', sub: 'may I evaluate a new x?' },
    { k: 'r', name: 'reward <i>r</i>', sub: 'the per-step objective' },
    { k: 'P', name: 'dynamics <i>P</i> / <i>f</i>', sub: 'how the state moves' },
    { k: 'a', name: 'sole decision maker', sub: 'nobody else optimises' }
  ];
  var LECS = [
    { n: 1, t: 'Optimization modeling', s: { f: 'g', q: 'g', r: 'n', P: 'n', a: 'g' } },
    { n: 2, t: 'Bayesian statistics', s: { f: 'u', q: 'g', r: 'n', P: 'n', a: 'g' } },
    { n: 3, t: 'Bayesian networks', s: { f: 'u', q: 'g', r: 'n', P: 'n', a: 'g' } },
    { n: 4, t: 'Bayesian optimization', s: { f: 's', q: 'g', r: 'n', P: 'n', a: 'g' } },
    { n: 5, t: 'Surrogate design opt.', s: { f: 's', q: 's', r: 'n', P: 'n', a: 'g' } },
    { n: 6, t: 'Generative design opt.', s: { f: 's', q: 's', r: 'n', P: 'n', a: 'g' } },
    { n: 7, t: 'MDP & dynamic programming', s: { f: 'n', q: 'n', r: 'g', P: 'g', a: 'g' } },
    { n: 8, t: 'Value-based RL', s: { f: 'n', q: 'n', r: 's', P: 's', a: 'g' } },
    { n: 9, t: 'Optimal control', s: { f: 'n', q: 'n', r: 'g', P: 'g', a: 'g' } },
    { n: 10, t: 'Policy-based RL', s: { f: 'n', q: 'n', r: 's', P: 's', a: 'g' } },
    { n: 11, t: 'Model-based RL', s: { f: 'n', q: 'n', r: 's', P: 'l', a: 'g' } },
    { n: 12, t: 'Offline RL', s: { f: 'n', q: 's', r: 's', P: 's', a: 'g' } }
  ];
  var LABEL = {
    g: ['handed to us', INK, .85], u: ['uncertain — carry a belief', AMBER, 1],
    s: ['unknown — only samples', RED, 1], l: ['learned back', BLUE, 1],
    n: ['not in play', INK, .22]
  };
  var i = 0;

  host.innerHTML =
    '<div class="wbar"><span class="wt">What you were handed &mdash; and when it is taken away</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wnum" data-l style="min-width:210px;display:inline-block;text-align:center"></span>' +
    '</div>' +
    '<div class="wbody" style="gap:12px">' +
    '<input type="range" min="0" max="' + (LECS.length - 1) + '" value="0" data-sl ' +
    'style="width:100%;accent-color:#16181D">' +
    '<div data-rows style="display:flex;flex-direction:column"></div>' +
    '<div data-tot style="display:flex;align-items:baseline;gap:12px;justify-content:center;' +
    'border-top:1px solid rgba(22,24,29,.14);padding-top:12px"></div></div>';

  var rowsEl = host.querySelector('[data-rows]');
  ROWS.forEach(function (r) {
    var d = document.createElement('div');
    d.setAttribute('data-k', r.k);
    d.style.cssText = 'display:grid;grid-template-columns:230px 1fr;gap:14px;align-items:center;' +
      'padding:9px 4px;border-bottom:1px solid rgba(22,24,29,.075)';
    d.innerHTML = '<div><b style="font:600 13.5px/1.3 var(--sans)">' + r.name + '</b>' +
      '<div style="font:400 10.5px/1.3 var(--mono);color:var(--ink4);letter-spacing:.05em">' + r.sub + '</div></div>' +
      '<div data-v style="font:600 13px/1 var(--mono);letter-spacing:.04em"></div>';
    rowsEl.appendChild(d);
  });

  function draw() {
    var L = LECS[i];
    host.querySelector('[data-l]').textContent = 'Lecture ' + L.n;
    host.querySelector('[data-sl]').value = i;
    var unknown = 0;
    ROWS.forEach(function (r) {
      var st = L.s[r.k], m = LABEL[st];
      var cell = rowsEl.querySelector('[data-k="' + r.k + '"] [data-v]');
      cell.textContent = m[0];
      cell.style.color = m[1];
      cell.style.opacity = m[2];
      if (st === 's' || st === 'u') unknown++;
    });
    var tot = host.querySelector('[data-tot]');
    tot.innerHTML =
      '<span style="font:500 10px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;' +
      'color:var(--ink4)">' + L.t + '</span>' +
      '<span style="font:500 10px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;' +
      'color:var(--ink4);margin-left:auto">objects still to be learned</span>' +
      '<span style="font:700 30px/1 var(--sans);color:' + (unknown >= 2 ? RED : (unknown ? AMBER : INK)) +
      '">' + unknown + '</span>';
  }

  var slider = host.querySelector('[data-sl]');
  slider.oninput = function (e) { i = +e.target.value; draw(); };

  draw();
  /* default: Lecture 8, where the count of unknowns has doubled */
  return {
    /* the arrow key walks the ledger; the track drags to any lecture directly */
    steps: LECS.length - 1,
    step: function (k) { i = k; slider.value = k; draw(); },
    finish: function () {
      var want = opts && opts.lecture != null ? opts.lecture : 8;
      var k = LECS.findIndex(function (L) { return L.n === want; });
      i = k >= 0 ? k : 7; slider.value = i; draw();
    }
  };
});
