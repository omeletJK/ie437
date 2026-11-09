/* ============================================================
   widget: lineage-tables
   The source deck's taxonomy (pp. 4-5) as ONE full-width table at a
   time: model-based first, and the arrow key swaps it for the
   model-free table.  Two tabs above the table name both and mark
   the one on show, so the swap reads as "same grid, other column of
   the lineage".  The formula strip under the model-based table is
   typeset at build time in a ::: wformulas block and adopted here;
   the model-free table carries a plain sentence instead.
   ============================================================ */
IE437.widget('lineage-tables', function (host, opts) {
  var BLUE = '#2563EB';
  var TABS = ['Model based — T and R given', 'Model free — learned from experience'];
  var HEAD = ['', 'finite actions', 'infinite actions'];
  var ROWS = [
    [['discrete time', 'MDP <i>(Lec 7)</i>', 'dynamic system <i>(Lec 9)</i>'],
     ['continuous time', 'continuous-time MDP', 'continuous-time system']],
    [['discrete time', 'value-based RL <i>(Lec 8)</i>', 'policy-based RL <i>(Lec 10)</i>'],
     ['continuous time', '—', '—']]
  ];
  var HERE = [[0, 1], [0, 1]];          /* the highlighted cell: row, column, per table */
  var FOOT1 = 'The empty cells are outside this course’s scope.';

  host.innerHTML =
    '<div class="wbody" style="padding:14px 18px 10px;gap:12px">' +
    '<div data-tabs style="display:flex;gap:28px;font:600 11px/1.3 var(--mono);letter-spacing:.13em;text-transform:uppercase"></div>' +
    '<div data-t></div>' +
    '<div data-f style="min-height:34px"></div>' +
    '<div data-f1 style="display:none;font:400 15px/1.5 var(--sans);color:var(--ink3)">' + FOOT1 + '</div>' +
    '</div>';
  var tabs = host.querySelector('[data-tabs]'), tbl = host.querySelector('[data-t]');
  var slide = host.closest('.slide'), fl = slide && slide.querySelector('.wformulas');
  if (fl) { host.querySelector('[data-f]').appendChild(fl); fl.querySelectorAll('li').forEach(function (li) { li.classList.add('on'); }); }

  function draw(k) {
    tabs.innerHTML = '';
    TABS.forEach(function (t, i) {
      var sp = document.createElement('span');
      sp.textContent = t;
      sp.style.cssText = 'padding-bottom:6px;border-bottom:2px solid ' + (i === k ? 'var(--ink)' : 'transparent') +
        ';color:' + (i === k ? 'var(--ink)' : 'var(--ink4)') + ';cursor:pointer';
      sp.onclick = function () { show(i); };
      tabs.appendChild(sp);
    });
    var h = '<table style="background:#fff;margin:0;table-layout:fixed"><colgroup><col style="width:28%"><col style="width:36%"><col style="width:36%"></colgroup><thead><tr>';
    HEAD.forEach(function (c) { h += '<th style="padding:0 18px 10px">' + c + '</th>'; });
    h += '</tr></thead><tbody>';
    ROWS[k].forEach(function (r, ri) {
      h += '<tr>';
      r.forEach(function (c, ci) {
        var here = ri === HERE[k][0] && ci === HERE[k][1];
        h += '<td style="white-space:nowrap;padding:18px 18px;font-size:19px' + (here ? ';color:' + BLUE + ';font-weight:600' : '') + '">' + c + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table>';
    tbl.innerHTML = h;
    host.querySelector('[data-f]').style.display = k === 0 ? '' : 'none';
    host.querySelector('[data-f1]').style.display = k === 1 ? '' : 'none';
  }
  var cur = 0;
  function show(i) { cur = Math.max(0, Math.min(1, i)); draw(cur); }
  show(0);
  return { steps: 1, step: show, reset: function () { show(0); }, finish: function () { show(1); } };
});
