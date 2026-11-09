/* ============================================================
   widget: sweep-backup
   Policy evaluation watched one backup at a time (source deck p. 35,
   the two-arrays versus in-place picture, made to move).

   A five-state chain under a fixed policy: from s_i the policy's
   action moves right to s_{i+1} with probability 0.6 and left to
   s_{i-1} with probability 0.4 (s_1 bounces back onto itself),
   every move costs 1, s_5 is terminal, gamma = 0.9.  Both panels
   sweep the same states in the same order:

     two arrays   V_{k+1}(s) <- SUM_{s'} T(s,pi(s),s') [ -1 + gamma V_k(s') ]
     in place     V(s)       <- SUM_{s'} T(s,pi(s),s') [ -1 + gamma V(s')   ]

   and the formula under each panel is written out with the numbers
   actually read: on the left both successors come from the old
   array; on the right the state above has already been refreshed
   this sweep, and that fresh number is red.  Arrival autoplays three
   sweeps; the toolbar steps one backup at a time or replays.
   ============================================================ */
IE437.widget('sweep-backup', function (host, opts) {
  var E = IE437.el;
  var INK = '#16181D', BLUE = '#2563EB', RED = '#D64545', AMBER = '#D97706', SLATE = '#64748B';
  var LBLUE = '#E3ECFB', LAMBER = '#FDF0DC', LRED = '#FBE3E3', PANEL = '#F1F1ED';
  var N = 5, TERM = N - 1, G = 0.9, PR = 0.6, PL = 0.4, R = -1;
  var SWEEPS = +opts.sweeps || 3;
  var uid = 'sb' + Math.floor(Math.random() * 1e9);

  host.innerHTML =
    '<div class="wbar"><span class="wt">One sweep, one backup at a time</span><span class="wspacer"></span>' +
    '<span class="wlabel">sweep</span><span class="wnum" data-k></span>' +
    '<button class="wb" data-s1>+1 backup</button><button class="wb" data-auto data-run>run</button></div>' +
    '<div class="wbody" style="align-items:center;justify-content:center;padding:8px 12px 4px"><div data-c></div></div>';
  var mount = host.querySelector('[data-c]');

  /* successors of s under the policy: [[s', prob], ...] */
  function succ(s) {
    var left = s === 0 ? 0 : s - 1, right = s + 1;
    return [[left, PL], [right, PR]];
  }
  function backup(s, read) {
    var acc = 0;
    succ(s).forEach(function (p) { acc += p[1] * (R + G * read(p[0])); });
    return acc;
  }

  /* state of the animation: sweep k, next state to back up i (0..N-2), both value arrays */
  var k, i, Vold, Vnew, Vin, done;
  function reset() {
    k = 0; i = 0; done = false;
    Vold = [0, 0, 0, 0, 0]; Vnew = Vold.slice(); Vin = Vold.slice();
    draw(null);
  }
  /* one backup for both panels; returns the record for the formula lines */
  function one() {
    if (done) return null;
    var s = i;
    var rec = { s: s, k: k, a: succ(s), oldv: Vold.slice(), inv: Vin.slice(), fresh: s > 0 };
    Vnew[s] = backup(s, function (x) { return Vold[x]; });
    Vin[s] = backup(s, function (x) { return Vin[x]; });
    rec.two = Vnew[s]; rec.inp = Vin[s];
    i++;
    if (i >= N - 1) {               /* sweep complete: V_{k+1} becomes V_k */
      i = 0; k++;
      Vold = Vnew.slice();            /* the two-arrays method copies; in place has nothing to copy */
      if (k >= SWEEPS) { done = true; }
      rec.endOfSweep = true;
    }
    return rec;
  }

  /* ---------- drawing ---------- */
  function clear() { while (mount.firstChild) mount.removeChild(mount.firstChild); }
  function marker(s, id, c) {
    var d = E('defs', {}, s), m = E('marker', { id: id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    E('path', { d: 'M0 0L10 5L0 10Z', fill: c }, m);
  }
  function fmt(v) { return (Math.round(v * 100) / 100).toFixed(2).replace('-', '−'); }
  function cell(s, x, y, w, h, label, value, fill, stroke) {
    E('rect', { x: x, y: y, width: w, height: h, fill: fill || '#fff', stroke: stroke || INK, 'stroke-width': stroke ? 1.8 : 1.1 }, s);
    IE437.math(s, x + 14, y + h / 2 + 4, label, { 'font-size': 12.5, 'text-anchor': 'middle' });
    E('text', { x: x + w - 8, y: y + h / 2 + 4, 'font-size': 12, 'text-anchor': 'end', fill: INK, 'font-family': 'var(--mono)', text: value }, s);
  }
  function column(s, x, y, w, h, vals, fills, strokes) {
    for (var r = 0; r < N; r++) {
      cell(s, x, y + r * h, w, h, 's_' + (r + 1), r === TERM ? '0' : fmt(vals[r]), fills[r], strokes[r]);
    }
  }
  function arrow(s, x1, y1, x2, y2, c, key) {
    E('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' }, s);
  }
  function curve(s, d, c, key) {
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': 1.7, 'marker-end': 'url(#' + uid + key + ')' }, s);
  }
  function label(s, x, y, str, a) {
    var at = { x: x, y: y, 'font-size': 11.5, fill: SLATE, text: str };
    for (var q in a || {}) at[q] = a[q];
    return E('text', at, s);
  }
  /* the backup written out with the numbers read: p[−1 + 0.9·v1] + p[−1 + 0.9·v2] = v */
  function formula(s, x, y, lhs, rec, vals, freshIdx) {
    var parts = [lhs + ' ← '];
    rec.a.forEach(function (p, j) {
      var v = vals[p[0]], txt = fmt(v).replace('−', '-');
      var num = freshIdx === p[0] ? '\\red{' + txt + '}' : txt;
      parts.push((j ? ' + ' : '') + p[1].toFixed(1) + '[−1 + 0.9·(' + num + ')]');
    });
    var tex = parts.join('').replace(/-/g, '−');
    IE437.math(s, x, y, tex, { 'font-size': 13 });
  }

  function draw(rec) {
    clear();
    var s = IE437.svg(760, 330); mount.appendChild(s);
    marker(s, uid + 'b', BLUE); marker(s, uid + 'r', RED);
    var H = 30, Y = 46, W = 92;
    var cur = rec ? rec.s : -1;
    host.querySelector('[data-k]').textContent = 'k = ' + (rec ? rec.k : k);

    /* ----- left: two arrays ----- */
    label(s, 10, 16, 'Two-arrays update', { fill: INK, 'font-weight': 700, 'font-size': 12.5 });
    IE437.math(s, 56, 38, 'V_k', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 12 });
    IE437.math(s, 236, 38, 'V_{k+1}', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 12 });
    var fl = [], sl = [], fr = [], sr = [];
    if (rec) {
      rec.a.forEach(function (p) { fl[p[0]] = LAMBER; });
      fr[cur] = LBLUE; sr[cur] = BLUE;
      for (var r = 0; r < cur; r++) fr[r] = LBLUE;
    }
    column(s, 10, Y, W, H, rec ? rec.oldv : Vold, fl, sl);
    column(s, 190, Y, W, H, Vnew, fr, sr);
    if (rec) {
      rec.a.forEach(function (p) {
        arrow(s, 10 + W + 2, Y + p[0] * H + H / 2, 188, Y + cur * H + H / 2, BLUE, 'b');
      });
      IE437.math(s, 148, Y - 6 + Math.min.apply(null, rec.a.map(function (p) { return p[0]; })) * H, 'T(s,π(s),s\')', { fill: BLUE, 'font-size': 10.5, 'text-anchor': 'middle' });
    }
    label(s, 10, Y + N * H + 24, 'every term reads the old array', { fill: BLUE });
    if (rec) formula(s, 10, Y + N * H + 50, 'V_{k+1}(s_' + (cur + 1) + ')', rec, rec.oldv, -1);
    if (rec) IE437.math(s, 10, Y + N * H + 74, '= ' + fmt(rec.two), { 'font-size': 12.5, fill: BLUE });

    /* ----- right: in place ----- */
    var X = 470;
    label(s, X, 16, 'In-place update', { fill: INK, 'font-weight': 700, 'font-size': 12.5 });
    IE437.math(s, X + W / 2, 38, 'V', { 'text-anchor': 'middle', fill: SLATE, 'font-size': 12 });
    var fi = [], si = [];
    if (rec) {
      rec.a.forEach(function (p) { fi[p[0]] = p[0] < cur ? LRED : LAMBER; });
      fi[cur] = LBLUE; si[cur] = RED;
    }
    column(s, X, Y, W, H, rec ? rec.inv : Vin, fi, si);
    if (rec) {
      rec.a.forEach(function (p) {
        var y1 = Y + p[0] * H + H / 2, y2 = Y + cur * H + H / 2, xr = X + W;
        if (p[0] === cur) curve(s, 'M' + (xr + 2) + ' ' + (y1 - 8) + ' C ' + (xr + 44) + ' ' + (y1 - 8) + ', ' + (xr + 44) + ' ' + (y2 + 8) + ', ' + (xr + 4) + ' ' + (y2 + 8), RED, 'r');
        else curve(s, 'M' + (xr + 2) + ' ' + y1 + ' C ' + (xr + 48) + ' ' + y1 + ', ' + (xr + 48) + ' ' + y2 + ', ' + (xr + 4) + ' ' + y2, RED, 'r');
      });
    }
    label(s, X, Y + N * H + 24, rec && rec.fresh ? 'the state above was refreshed a moment ago' : 'one array: fresh values travel within the sweep', { fill: RED });
    if (rec) formula(s, X - 60, Y + N * H + 50, 'V(s_' + (cur + 1) + ')', rec, rec.inv, rec.fresh ? cur - 1 : -1);
    if (rec) IE437.math(s, X - 60, Y + N * H + 74, '= ' + fmt(rec.inp), { 'font-size': 12.5, fill: RED });

    /* ----- footer: what the two methods have reached ----- */
    if (done) {
      label(s, 10, 318, 'after ' + SWEEPS + ' sweeps: two arrays ' + fmt(Vnew[0]) + ' at s₁, in place ' + fmt(Vin[0]) + ' (true value ' + fmt(trueV()[0]) + ')', { fill: INK });
    } else if (!rec) {
      label(s, 10, 318, 'V₀ = 0 everywhere; press run, or +1 backup', { fill: SLATE });
    }
  }
  function trueV() {
    var V = [0, 0, 0, 0, 0];
    for (var t = 0; t < 400; t++) for (var s = 0; s < N - 1; s++) V[s] = backup(s, function (x) { return V[x]; });
    return V;
  }

  /* ---------- controls ---------- */
  var timer = null;
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function tick() {
    var rec = one();
    if (!rec) { stop(); return; }
    draw(rec);
    if (done) stop();
  }
  function run() {
    stop();
    if (done) reset();
    timer = setInterval(tick, 900);
  }
  host.querySelector('[data-s1]').onclick = function () { stop(); if (done) reset(); tick(); };
  host.querySelector('[data-run]').onclick = run;
  reset();
  return {
    auto: run,
    reset: function () { stop(); reset(); },
    finish: function () { stop(); var rec; while (!done) rec = one(); draw(rec); }
  };
});
