/* ============================================================
   IE437 · Interactive Lecture Deck — engine
   navigation · fragments (\pause) · widget registry · print hooks
   ============================================================ */
(function () {
  'use strict';

  /* ---------- widget registry -------------------------------------- */
  var REG = Object.create(null);   // id -> factory(el, opts) -> {finish?, reset?}
  var LIVE = [];                   // mounted instances

  var IE437 = window.IE437 = {
    widget: function (id, factory) { REG[id] = factory; },
    // small shared helpers used by widgets
    fmt: function (x, d) { return (Math.round(x * Math.pow(10, d || 2)) / Math.pow(10, d || 2)).toFixed(d || 2); },
    rng: function (seed) {                       // deterministic PRNG (mulberry32)
      var t = seed >>> 0;
      return function () {
        t += 0x6D2B79F5; var r = t;
        r = Math.imul(r ^ (r >>> 15), r | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    },
    svg: function (w, h, cls) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (cls) s.setAttribute('class', cls);
      s.setAttribute('width', w); s.setAttribute('height', h);
      s.style.width = w + 'px'; s.style.height = h + 'px'; s.style.display = 'block';
      return s;
    },
    /* minimal line plot: series = [{pts:[[x,y]..], color, dash, w}] */
    plot: function (svg, spec) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var W = spec.w, H = spec.h, P = spec.pad || { l: 38, r: 10, t: 10, b: 24 };
      var xs = spec.xdom, ys = spec.ydom;
      var X = function (v) { return P.l + (v - xs[0]) / (xs[1] - xs[0] || 1) * (W - P.l - P.r); };
      var Y = function (v) { return H - P.b - (v - ys[0]) / (ys[1] - ys[0] || 1) * (H - P.t - P.b); };
      var E = IE437.el;
      var grid = E('g', {}, svg);
      (spec.yticks || []).forEach(function (t) {
        E('line', { x1: P.l, x2: W - P.r, y1: Y(t), y2: Y(t), stroke: 'currentColor', 'stroke-opacity': .12 }, grid);
        E('text', { x: P.l - 6, y: Y(t) + 3.5, 'text-anchor': 'end', 'font-size': 9, fill: 'currentColor',
          'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: spec.yfmt ? spec.yfmt(t) : t }, grid);
      });
      (spec.xticks || []).forEach(function (t) {
        E('text', { x: X(t), y: H - P.b + 14, 'text-anchor': 'middle', 'font-size': 9, fill: 'currentColor',
          'fill-opacity': .5, 'font-family': 'IBM Plex Mono, monospace', text: spec.xfmt ? spec.xfmt(t) : t }, grid);
      });
      E('line', { x1: P.l, x2: W - P.r, y1: H - P.b, y2: H - P.b, stroke: 'currentColor', 'stroke-opacity': .28 }, svg);
      E('line', { x1: P.l, x2: P.l, y1: P.t, y2: H - P.b, stroke: 'currentColor', 'stroke-opacity': .28 }, svg);
      (spec.series || []).forEach(function (s) {
        if (!s.pts || s.pts.length < 1) return;
        var d = s.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' ');
        E('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': s.w || 1.8,
          'stroke-dasharray': s.dash || '', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
        if (s.dots) s.pts.forEach(function (p) { E('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.6, fill: s.color }, svg); });
      });
      if (spec.xlabel) E('text', { x: (P.l + W - P.r) / 2, y: H - 2, 'text-anchor': 'middle', 'font-size': 9,
        fill: 'currentColor', 'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace', text: spec.xlabel }, svg);
      if (spec.ylabel) E('text', { x: 10, y: (P.t + H - P.b) / 2, 'text-anchor': 'middle', 'font-size': 9,
        fill: 'currentColor', 'fill-opacity': .45, 'font-family': 'IBM Plex Mono, monospace',
        transform: 'rotate(-90 10 ' + ((P.t + H - P.b) / 2) + ')', text: spec.ylabel }, svg);
      return { X: X, Y: Y };
    },
    /* A labelled range control. This is the deck's answer to the +/- button
       pair: one gesture instead of eight clicks, and the value is visible
       while you drag it rather than only after. Returns {set, get, input}.

         IE437.slider(bar, {label:'\u03bb', min:0, max:3, step:.1, value:1,
                            fmt:function(v){return v.toFixed(1)}, on:draw}) */
    slider: function (bar, o) {
      var wrap = document.createElement('label');
      wrap.className = 'wsl';
      var name = document.createElement('span');
      name.className = 'wsl-l'; name.innerHTML = o.label || '';
      var input = document.createElement('input');
      input.type = 'range';
      input.min = o.min; input.max = o.max;
      input.step = o.step == null ? (o.max - o.min) / 100 : o.step;
      input.value = o.value == null ? o.min : o.value;
      if (o.width) input.style.width = o.width + 'px';
      var out = document.createElement('span');
      out.className = 'wsl-v';
      var fmt = o.fmt || function (v) { return String(v); };
      function show() { if (!o.bare) out.textContent = fmt(+input.value); }
      show();
      input.addEventListener('input', function () { show(); if (o.on) o.on(+input.value); });
      /* bare: the widget already prints its own label and reading beside the
         track, so the slider contributes the track and nothing else. */
      if (!o.bare) { wrap.appendChild(name); wrap.appendChild(input); wrap.appendChild(out); }
      else wrap.appendChild(input);
      if (bar) bar.appendChild(wrap);
      return {
        input: input, el: wrap,
        get: function () { return +input.value; },
        set: function (v, fire) {
          input.value = v; show();
          if (fire !== false && o.on) o.on(+input.value);
        }
      };
    },
    el: function (tag, attrs, parent) {
      var NS = 'http://www.w3.org/2000/svg';
      var e = /^(svg|g|rect|circle|line|path|text|polyline|polygon|tspan|defs|marker)$/.test(tag)
        ? document.createElementNS(NS, tag) : document.createElement(tag);
      for (var k in attrs) {
        if (k === 'text') e.textContent = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
      if (parent) parent.appendChild(e);
      return e;
    }
  };

  /* ---------- boot ------------------------------------------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var stage = $('#stage'), slides = $$('.slide'), N = slides.length;
  var cur = 0, step = 0;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* per-slide fragment groups: elements sharing data-frag index reveal together */
  var FRAGS = slides.map(function (sl) {
    var groups = {}, order = [];
    $$('.frag', sl).forEach(function (f) {
      var k = f.getAttribute('data-frag') || '1';
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(f);
    });
    order.sort(function (a, b) { return (+a) - (+b); });
    return order.map(function (k) { return groups[k]; });
  });

  /* ---------- scaling ---------------------------------------------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------- vertical balance -------------------------------------
     CSS cannot know how tall a slide's prose turns out to be, so the
     leftover space is measured and handed back to the gaps — evenly,
     up to a cap, and whatever is still left over centres the column.
     This is what stops a slide reading "cramped on top, empty below".  */
  var GAP_MIN = 14, GAP_MAX = 64;
  var GROW = 'table,.lgrid,.flow,.cols,.blk';   // blocks whose rows can absorb height
  function balance(sl) {
    var fill = sl.querySelector('.fill');
    if (!fill || !fill.classList.contains('auto')) return;
    $$('[data-grown]', fill).forEach(function (e) { e.style.height = ''; e.removeAttribute('data-grown'); });
    fill.style.gap = GAP_MIN + 'px';
    fill.style.justifyContent = 'flex-start';
    var kids = Array.prototype.filter.call(fill.children, function (k) { return k.offsetHeight > 0; });
    var n = kids.length;
    if (!n) return;
    var cs = getComputedStyle(fill);
    var avail = fill.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var content = 0;
    kids.forEach(function (k) {
      var m = getComputedStyle(k);
      content += k.offsetHeight + parseFloat(m.marginTop || 0) + parseFloat(m.marginBottom || 0);
    });
    if (n < 2) { fill.style.justifyContent = 'center'; return; }
    var free = avail - content;
    if (free <= GAP_MIN * (n - 1)) return;                    // already full: keep the tight rhythm
    var gap = Math.min(GAP_MAX, free / (n - 1));
    fill.style.gap = gap.toFixed(1) + 'px';
    var left = avail - (content + gap * (n - 1));

    /* still short? hand some of the remainder to the tallest block that can use
       it — a table, grid or flow grows its rows rather than leaving a hole. The
       growth is capped so rows breathe instead of ballooning; the rest centres. */
    if (left > 40) {
      var best = null, bestH = 0;
      kids.forEach(function (k) {
        var c = k.matches(GROW) ? k : k.querySelector(GROW);
        if (c && !c.closest('.widget') && c.offsetHeight > bestH) { best = c; bestH = c.offsetHeight; }
      });
      if (best) {
        var grow = Math.min(left, bestH * 0.4, 120);
        best.style.height = Math.round(bestH + grow) + 'px';
        best.setAttribute('data-grown', '1');
        left -= grow;
      }
    }
    if (left > 6) fill.style.justifyContent = 'center';
  }
  function balanceAll() { slides.forEach(balance); }

  /* ---------- widget mounting -------------------------------------- */
  function mountWidgets(sl) {
    $$('[data-widget]', sl).forEach(function (host) {
      if (host.getAttribute('data-mounted')) return;
      var id = host.getAttribute('data-widget'), f = REG[id];
      if (!f) {                       /* leave it unmounted so a later visit can retry */
        host.innerHTML = '<div class="wcap" style="padding:26px">widget <code>' + id +
          '</code> is not registered — add <code>deck/widgets/' + id + '.js</code></div>';
        return;
      }
      host.setAttribute('data-mounted', '1');
      var opts = {};
      try { opts = JSON.parse(host.getAttribute('data-opts') || '{}'); } catch (e) { }
      var inst = f(host, opts) || {};
      inst.__id = id; inst.__host = host; LIVE.push(inst);
    });
  }

  /* ---------- quiz -------------------------------------------------
     One guess, then the verdict and the reason. The answer index lives
     in data-a and is read only on click, so it never has to be revealed
     to open the question. Answering does not advance the slide — the
     class reads the explanation before anyone presses on. */
  function mountQuizzes(sl) {
    $$('.quiz', sl).forEach(function (q) {
      if (q.getAttribute('data-wired')) return;
      q.setAttribute('data-wired', '1');
      var answer = +q.getAttribute('data-a');
      $$('.qopt', q).forEach(function (b) {
        b.onclick = function () {
          if (q.classList.contains('done')) return;
          var chose = +b.getAttribute('data-i');
          q.classList.add('done');
          $$('.qopt', q).forEach(function (o) {
            var i = +o.getAttribute('data-i');
            if (i === answer) o.classList.add('right');
            else if (i === chose) o.classList.add('wrong');
            o.disabled = true;
          });
          balance(sl);
        };
      });
    });
  }
  /* the printed deck is the answer key */
  function revealQuizzes() {
    $$('.quiz').forEach(function (q) {
      q.classList.add('done');
      var a = +q.getAttribute('data-a');
      $$('.qopt', q).forEach(function (o) {
        if (+o.getAttribute('data-i') === a) o.classList.add('right');
      });
    });
  }

  /* ---------- navigation ------------------------------------------- */
  function showStep(sl, k, animate) {
    var groups = FRAGS[cur];
    groups.forEach(function (g, i) {
      g.forEach(function (f) {
        if (!animate) f.style.transition = 'none';
        f.classList.toggle('on', i < k);
        if (!animate) requestAnimationFrame(function () { f.style.transition = ''; });
      });
    });
  }

  /* ---------- autoplay ---------------------------------------------
     A widget that sits dead until someone finds its toolbar and clicks
     "run" is a widget most of a class never sees work. So arriving at a
     slide starts it: the engine calls the instance's own auto(), or
     failing that clicks the control the widget marked data-auto. The
     buttons stay — they are now for running it *again*, not for the
     first time. Printing is exempt: finish() already freezes the end
     state, and so is reduced-motion, where boot() calls finish().    */
  var autoTimer = null;
  function autoplay(sl) {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (reduced || window.matchMedia('print').matches) return;
    autoTimer = setTimeout(function () {
      autoTimer = null;
      LIVE.forEach(function (w) {
        if (!w.__host || !sl.contains(w.__host) || !sl.classList.contains('active')) return;
        try {
          if (w.auto) { w.auto(); return; }
          var b = w.__host.querySelector('[data-auto]');
          if (b && !b.disabled) b.click();
        } catch (e) { }
      });
    }, 420);
  }

  function go(i, dir) {
    i = Math.max(0, Math.min(N - 1, i));
    var prev = cur;
    slides[prev].classList.remove('active');
    cur = i; step = (dir === 'back') ? FRAGS[cur].length : 0;
    var sl = slides[cur];
    mountWidgets(sl);
    mountQuizzes(sl);
    sl.classList.add('active');
    balance(sl);
    showStep(sl, step, false);
    LIVE.forEach(function (w) {
      if (w.__host && sl.contains(w.__host)) { if (w.enter) w.enter(); }
      else if (w.leave) w.leave();
    });
    autoplay(sl);
    $('#rail').style.width = ((cur + 1) / N * 100) + '%';
    var c = $('#hudn'); if (c) c.innerHTML = '<b>' + (cur + 1) + '</b> / ' + N;
    if (location.hash !== '#' + (cur + 1)) {
      try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) { location.hash = '#' + (cur + 1); }
    }
    $$('#menu .mrow').forEach(function (r) { r.classList.toggle('cur', +r.getAttribute('data-i') === cur); });
  }

  function next() {
    if (step < FRAGS[cur].length) { step++; showStep(slides[cur], step, true); }
    else if (cur < N - 1) go(cur + 1, 'fwd');
  }
  function prev() {
    if (step > 0) { step--; showStep(slides[cur], step, true); }
    else if (cur > 0) go(cur - 1, 'back');
  }

  /* ---------- keyboard --------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    var t = e.target, inCtl = t && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName);
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter':
        if (inCtl && e.key !== 'PageDown') return;
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case 'ArrowDown': e.preventDefault(); go(cur + 1, 'fwd'); break;
      case 'ArrowUp': e.preventDefault(); go(cur - 1, 'back'); break;
      case 'Home': e.preventDefault(); go(0, 'fwd'); break;
      case 'End': e.preventDefault(); go(N - 1, 'fwd'); break;
      case 'm': case 'M': if (inCtl) return; $('#menu').classList.toggle('on'); break;
      case '?': $('#help').classList.toggle('on'); break;
      case 'Escape': $('#menu').classList.remove('on'); $('#help').classList.remove('on'); break;
      case 'p': case 'P': if (inCtl) return; window.print(); break;
      case 'f': case 'F':
        if (inCtl) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
    }
  });

  /* click-to-advance (ignore interactive elements) */
  stage.addEventListener('click', function (e) {
    if (e.target.closest('button,input,select,label,a,.widget')) return;
    next();
  });

  /* ---------- print: freeze everything in its final state ---------- */
  window.addEventListener('beforeprint', function () {
    slides.forEach(function (sl) { mountWidgets(sl); mountQuizzes(sl); });
    revealQuizzes();
    balanceAll();
    LIVE.forEach(function (w) { if (w.finish) { try { w.finish(); } catch (e) { } } });
    $$('.frag').forEach(function (f) { f.classList.add('on'); });
  });
  window.__deckPrintReady = function () {          // called by pdf.mjs before printing
    slides.forEach(function (sl) { mountWidgets(sl); mountQuizzes(sl); });
    revealQuizzes();
    balanceAll();
    LIVE.forEach(function (w) { if (w.finish) { try { w.finish(); } catch (e) { } } });
    $$('.frag').forEach(function (f) { f.classList.add('on'); });
    balanceAll();
    return N;
  };

  /* ---------- HUD wiring ------------------------------------------- */
  var hb = $('#hprev'); if (hb) hb.onclick = prev;
  var hn = $('#hnext'); if (hn) hn.onclick = next;
  var hm = $('#hmenu'); if (hm) hm.onclick = function () { $('#menu').classList.toggle('on'); };
  var hp = $('#hpdf'); if (hp) hp.onclick = function () { window.print(); };
  var hh = $('#hhelp'); if (hh) hh.onclick = function () { $('#help').classList.toggle('on'); };
  $$('#menu .mrow').forEach(function (r) {
    r.onclick = function () { $('#menu').classList.remove('on'); go(+r.getAttribute('data-i'), 'fwd'); };
  });
  $('#menu').addEventListener('click', function (e) { if (e.target.id === 'menu') e.currentTarget.classList.remove('on'); });

  /* ---------- start ------------------------------------------------ */
  function fromHash() { var n = parseInt((location.hash || '').slice(1), 10); return isFinite(n) ? n - 1 : 0; }
  window.addEventListener('hashchange', function () { var i = fromHash(); if (i !== cur) go(i, 'fwd'); });
  function boot() {
    fit();
    go(fromHash(), 'fwd');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(balanceAll);
    if (reduced) LIVE.forEach(function (w) { if (w.finish) w.finish(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
