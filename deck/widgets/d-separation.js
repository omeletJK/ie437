/* ============================================================
   widget: d-separation
   Example 3.1 of the source deck (Wet Grass), made clickable.
   S -> T <- R -> J with the deck's own tables.  Click a node to
   observe it; the posterior over the sprinkler is recomputed by
   enumerating all sixteen states, so every number on screen is
   exact.  The collider at T is the point: it is the only node
   whose observation OPENS a path rather than blocking one.
   ============================================================ */
IE437.widget('d-separation', function (host, opts) {
  var E = IE437.el, INK = '#16181D', BLUE = '#2563EB', RED = '#D64545',
      GREEN = '#16A34A', SLATE = '#64748B', AMBER = '#D97706';

  var PS = 0.1, PR = 0.2;
  function pT1(r, s) { return (r === 1) ? 1 : (s === 1 ? 0.9 : 0); }
  function pJ1(r) { return r === 1 ? 1 : 0.2; }
  function jointP(t, j, r, s) {
    return (t ? pT1(r, s) : 1 - pT1(r, s)) *
           (j ? pJ1(r) : 1 - pJ1(r)) *
           (r ? PR : 1 - PR) * (s ? PS : 1 - PS);
  }

  /* ev[k] is null (unobserved), 1 or 0 */
  var ev = { S: null, R: null, T: null, J: null };
  var STORY = [
    { S: null, R: null, T: null, J: null },
    { S: null, R: null, T: 1, J: null },
    { S: null, R: null, T: 1, J: 1 },
    { S: null, R: 1, T: 1, J: null }
  ];
  var step = 0, free = false;

  function posterior(v) {                       // P(v = 1 | evidence), exact
    var num = 0, den = 0;
    for (var t = 0; t < 2; t++) for (var j = 0; j < 2; j++)
      for (var r = 0; r < 2; r++) for (var s = 0; s < 2; s++) {
        var st = { T: t, J: j, R: r, S: s }, ok = true;
        for (var key in ev) if (ev[key] !== null && st[key] !== ev[key]) ok = false;
        if (!ok) continue;
        var p = jointP(t, j, r, s);
        den += p; if (st[v] === 1) num += p;
      }
    return den > 1e-12 ? num / den : NaN;
  }

  host.innerHTML =
    '<div class="wbar"><span class="wt">Wet grass &mdash; click a node to observe it</span>' +
    '<span class="wspacer"></span>' +
    '<span class="wlabel" data-hint></span>' +
    '<button class="wb" data-step>walk the story &#9656;</button>' +
    '<button class="wb" data-clr>clear</button></div>' +
    '<div class="wbody" style="flex-direction:row;gap:20px;align-items:flex-start">' +
    '<div data-g style="flex:none"></div>' +
    '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:11px">' +
    '<div data-bars></div>' +
    '<div data-verdict style="border-top:1px solid rgba(22,24,29,.14);padding-top:11px;' +
    'font:400 12.5px/1.55 var(--sans);color:var(--ink2)"></div>' +
    '</div></div>';

  var GW = 372, GH = 250;
  var sv = IE437.svg(GW, GH);
  host.querySelector('[data-g]').appendChild(sv);

  var NODE = {
    S: { x: 78, y: 58, lab: 'S', cap: 'sprinkler on' },
    R: { x: 244, y: 58, lab: 'R', cap: 'raining' },
    T: { x: 140, y: 168, lab: 'T', cap: "Tracey's grass wet" },
    J: { x: 306, y: 168, lab: 'J', cap: "Jack's grass wet" }
  };
  var EDGES = [['S', 'T'], ['R', 'T'], ['R', 'J']];
  var RAD = 21;

  /* the only path between S and R runs S -> T <- R.  T is a collider, so the
     path is open exactly when T (or a descendant of T — there are none) is
     observed.  J is a descendant of R, not of T, and opens nothing. */
  function colliderOpen() { return ev.T !== null; }

  function drawGraph() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var open = colliderOpen();

    EDGES.forEach(function (e) {
      var a = NODE[e[0]], b = NODE[e[1]];
      var onPath = (e[0] === 'S' && e[1] === 'T') || (e[0] === 'R' && e[1] === 'T');
      var col = onPath ? (open ? BLUE : SLATE) : SLATE;
      var op = onPath ? (open ? 1 : .3) : .45;
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / L, uy = dy / L;
      E('line', { x1: a.x + ux * RAD, y1: a.y + uy * RAD,
        x2: b.x - ux * (RAD + 7), y2: b.y - uy * (RAD + 7),
        stroke: col, 'stroke-opacity': op, 'stroke-width': onPath && open ? 2.6 : 1.6 }, sv);
      E('path', { d: 'M' + (b.x - ux * RAD) + ' ' + (b.y - uy * RAD) +
        'L' + (b.x - ux * (RAD + 9) - uy * 4) + ' ' + (b.y - uy * (RAD + 9) + ux * 4) +
        'L' + (b.x - ux * (RAD + 9) + uy * 4) + ' ' + (b.y - uy * (RAD + 9) - ux * 4) + 'Z',
        fill: col, 'fill-opacity': op }, sv);
    });

    Object.keys(NODE).forEach(function (key) {
      var d = NODE[key], obs = ev[key] !== null;
      var g = E('g', { style: 'cursor:pointer' }, sv);
      g.addEventListener('click', function () { cycle(key); });
      E('circle', { cx: d.x, cy: d.y, r: RAD + 9, fill: 'transparent' }, g);
      E('circle', { cx: d.x, cy: d.y, r: RAD,
        fill: obs ? (ev[key] === 1 ? 'rgba(37,99,235,.16)' : 'rgba(100,116,139,.16)') : '#FBFBF9',
        stroke: obs ? (ev[key] === 1 ? BLUE : SLATE) : INK,
        'stroke-opacity': obs ? 1 : .55, 'stroke-width': obs ? 2.4 : 1.5 }, g);
      E('text', { x: d.x, y: d.y + 6, 'text-anchor': 'middle', 'font-size': 16,
        'font-style': 'italic', fill: INK, text: d.lab }, g);
      if (obs) {
        E('rect', { x: d.x + RAD - 5, y: d.y - RAD - 7, width: 26, height: 15, rx: 2,
          fill: ev[key] === 1 ? BLUE : SLATE }, g);
        E('text', { x: d.x + RAD + 8, y: d.y - RAD + 4, 'text-anchor': 'middle', 'font-size': 10,
          'font-weight': 700, fill: '#fff', 'font-family': 'IBM Plex Mono, monospace',
          text: '=' + ev[key] }, g);
      }
      E('text', { x: d.x, y: d.y + RAD + 15, 'text-anchor': 'middle', 'font-size': 10,
        fill: INK, 'fill-opacity': .5, text: d.cap }, g);
    });

    /* the collider annotation */
    E('text', { x: 140, y: 224, 'text-anchor': 'middle', 'font-size': 10.5,
      'font-family': 'IBM Plex Mono, monospace', 'letter-spacing': .06,
      fill: colliderOpen() ? BLUE : SLATE, 'font-weight': colliderOpen() ? 700 : 400,
      text: colliderOpen() ? 'S → T ← R  ·  COLLIDER OPEN' : 'S → T ← R  ·  collider blocked' }, sv);
    E('text', { x: 306, y: 224, 'text-anchor': 'middle', 'font-size': 10.5, fill: SLATE,
      'font-family': 'IBM Plex Mono, monospace', text: 'R → J' }, sv);
  }

  function bar(label, val, prior, colour) {
    var bad = isNaN(val);
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
      '<span style="font:400 12.5px/1.4 var(--sans);color:var(--ink2)">' + label + '</span>' +
      '<span class="wnum" style="color:' + colour + '">' + (bad ? '—' : val.toFixed(3)) + '</span></div>' +
      '<div style="position:relative;height:13px;margin-top:5px;border:1px solid rgba(22,24,29,.14)">' +
      '<div style="height:100%;width:' + (bad ? 0 : val * 100) + '%;background:' + colour + ';opacity:.55"></div>' +
      '<i style="position:absolute;top:-3px;bottom:-3px;left:' + (prior * 100) + '%;width:1.5px;' +
      'background:' + INK + ';opacity:.5"></i></div>' +
      '<div style="font:500 9px/1 var(--mono);letter-spacing:.1em;color:var(--ink4);margin-top:4px">' +
      'PRIOR ' + prior.toFixed(3) + '</div></div>';
  }

  function render() {
    drawGraph();
    var ps = posterior('S'), pr = posterior('R');
    var listed = Object.keys(ev).filter(function (k) { return ev[k] !== null; })
      .map(function (k) { return k + '=' + ev[k]; });

    host.querySelector('[data-bars]').innerHTML =
      '<div class="wlabel" style="margin-bottom:7px">evidence ' +
      (listed.length ? '<b style="color:' + INK + '">' + listed.join(' , ') + '</b>' : 'none') + '</div>' +
      bar('P(sprinkler on | evidence)', ps, PS, BLUE) +
      bar('P(raining | evidence)', pr, PR, AMBER);

    var v = host.querySelector('[data-verdict]');
    if (isNaN(ps)) {
      v.innerHTML = '<b style="color:' + RED + '">That evidence has probability zero</b> under this model — ' +
        'the tables rule it out, so there is nothing to condition on. Clear a node.';
    } else if (!colliderOpen()) {
      v.innerHTML = '<b style="color:' + SLATE + '">S &perp; R</b> &mdash; the collider at <i>T</i> is unobserved, ' +
        'so the only path between the sprinkler and the rain is blocked. Observing <i>J</i> ' +
        'moves the rain but leaves the sprinkler at its prior: <i>J</i> is a descendant of <i>R</i>, ' +
        'not of the collider.';
    } else if (Math.abs(ps - PS) < 5e-4) {
      v.innerHTML = '<b style="color:' + AMBER + '">The collider is open, and nothing happened.</b> ' +
        'The rain is observed directly, so wet grass is a foregone conclusion and carries no ' +
        'information — the sprinkler sits exactly at its prior. D-separation says what ' +
        '<b>must</b> hold, not everything that happens to.';
    } else {
      var d = ps - PS;
      v.innerHTML = '<b style="color:' + BLUE + '">S and R are now dependent</b> &mdash; observing the collider ' +
        '<i>T</i> opened the path. The sprinkler has moved <b>' + (d >= 0 ? '+' : '') + d.toFixed(3) +
        '</b> from its prior' +
        (ev.J !== null || ev.R !== null
          ? ', and the evidence about the <b>rain</b> is now moving it back — the rain ' +
            '<b style="color:' + GREEN + '">explains it away</b>.'
          : '. Now observe <i>J</i> or <i>R</i> and watch the rival cause take the blame.');
    }

    host.querySelector('[data-hint]').textContent = free ? '' :
      (['prior', 'Tracey wet', '+ Jack wet', '+ rain seen'][step] || '');
  }

  function cycle(key) {
    ev[key] = ev[key] === null ? 1 : (ev[key] === 1 ? 0 : null);
    free = true;
    render();
  }
  function setStep(i) {
    free = false;
    step = ((i % STORY.length) + STORY.length) % STORY.length;
    var s = STORY[step];
    for (var k in ev) ev[k] = s[k];
    render();
  }

  host.querySelector('[data-step]').onclick = function () { setStep(step + 1); };
  host.querySelector('[data-clr]').onclick = function () { setStep(0); };

  setStep(0);
  return { finish: function () { setStep(2); } };   // T=1, J=1 — the explaining-away frame
});
