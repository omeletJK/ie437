#!/usr/bin/env node
/* ============================================================
   IE437 · site.mjs  —  md/_SITE.md + md/_ANNOUNCEMENTS.md + every
   chapter's front matter  →  html/index.html

   The landing page: what the course is, what has been announced,
   and every chapter to open or download. One page, no tabs.

     node site.mjs          rebuild the landing page only  (fast)
     node build.mjs --all   rebuilds the decks and calls this at the end

   It is a separate entry point on purpose. Posting a notice should
   not mean re-rendering fourteen decks and their PDFs, so the two
   jobs stay independent: this reads the decks' *output* for slide
   counts rather than rebuilding them.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { marked } from 'marked';
import { stale } from './pdf.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MD = path.join(ROOT, 'md');
const DECK = path.join(ROOT, 'deck');
const OUT = path.join(ROOT, 'html');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hl = s => String(s ?? '').replace(/==([^=]+)==/g, '<b>$1</b>');
const mdBlock = t => (String(t || '').trim() ? marked.parse(hl(String(t))) : '');
const mdSpan = t => (String(t || '').trim() ? marked.parseInline(hl(String(t))) : '');

/* ---------------- front matter ------------------------------------ */
function readFm(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(path.basename(file) + ': missing YAML front matter');
  return { fm: yaml.load(m[1]) || {}, body: m[2] };
}

/* ---------------- the chapters ------------------------------------
   Metadata comes from each chapter's own front matter — the markdown
   stays the single source of truth. The slide count and the PDF come
   from html/, so a chapter that has not been built yet simply shows
   no count and a dead PDF button instead of breaking the page.     */
function chapters() {
  return fs.readdirSync(MD)
    .filter(f => /^ch\d+.*\.md$/.test(f))
    .map(f => {
      const { fm } = readFm(path.join(MD, f));
      const html = f.replace(/\.md$/, '.html');
      const pdf = 'pdf/' + f.replace(/\.md$/, '.pdf');
      const built = fs.existsSync(path.join(OUT, html));
      const num = fm.ch === 99 ? 'A' : String(fm.ch).padStart(2, '0');
      return {
        ch: Number(fm.ch),
        num,
        label: fm.label || ('Lecture ' + fm.ch),
        title: fm.title || f,
        subtitle: fm.subtitle || '',
        blurb: fm.blurb || fm.tagline || '',
        html, pdf, built,
        hasPdf: fs.existsSync(path.join(OUT, pdf)),
        /* a PDF older than its deck is worse than none: it downloads
           cleanly and is silently wrong */
        pdfStale: built && fs.existsSync(path.join(OUT, pdf)) && stale(html),
        slides: built
          ? (fs.readFileSync(path.join(OUT, html), 'utf8').match(/<section class="slide/g) || []).length
          : 0,
        /* what the student sees in their downloads folder */
        saveAs: 'IE437-' + num + '-' + String(fm.title).replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') + '.pdf'
      };
    })
    .sort((a, b) => a.ch - b.ch);
}

/* ---------------- announcements -----------------------------------
   ## 2026-09-01 · Title      one entry; `{pin}` on the next line
   pins it above the rest and never expires.                        */
function announcements() {
  const file = path.join(MD, '_ANNOUNCEMENTS.md');
  if (!fs.existsSync(file)) return [];
  const { body } = readFm(file);
  const out = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*(?:[·|—-]\s*)?(.*)$/);
    if (m) {
      if (cur) out.push(cur);
      cur = { date: m[1], title: m[2].trim(), pin: false, lines: [] };
      continue;
    }
    if (!cur) continue;
    if (/^\{pin\}\s*$/.test(line.trim())) { cur.pin = true; continue; }
    cur.lines.push(line);
  }
  if (cur) out.push(cur);

  const today = new Date();
  for (const a of out) {
    a.body = mdBlock(a.lines.join('\n'));
    const age = (today - new Date(a.date + 'T00:00:00')) / 86400000;
    a.fresh = age >= 0 && age <= 14;
  }
  /* newest first, pinned above everything */
  return out.sort((x, y) => (y.pin - x.pin) || y.date.localeCompare(x.date));
}

/* ---------------- the syllabus ------------------------------------
   md/_SYLLABUS.md owns the practical facts of the term — who teaches
   it, when it meets, and how it is graded. The file is optional: with
   no _SYLLABUS.md the section and its nav entry simply do not appear,
   so a term that has not published one yet still builds.            */
function syllabus() {
  const file = path.join(MD, '_SYLLABUS.md');
  if (!fs.existsSync(file)) return null;
  const { fm, body } = readFm(file);
  const grading = fm.grading || [];
  /* A syllabus that does not add up is the one thing on this page that
     nobody may read wrong, so this is an error and not a warning. */
  const sum = grading.reduce((s, g) => s + Number(g.weight || 0), 0);
  if (grading.length && sum !== 100)
    throw new Error('_SYLLABUS.md: grading weights sum to ' + sum + ', not 100');
  return { fm, body, grading };
}

/* ---------------- inlined assets ----------------------------------
   The page is one file, like the decks: faces, stylesheet, the cube.
   Fonts fail silently — a missing face just falls back — so assert
   instead of trusting it, exactly as build.mjs does.               */
const FACES_USED = ['Inter', 'IBM Plex Mono', 'Space Grotesk'];   // no serif on this page
function faceCSS(...names) {
  let css = '';
  for (const n of names) {
    const f = path.join(DECK, 'fonts', n);
    if (!fs.existsSync(f)) throw new Error('missing ' + path.relative(ROOT, f) + ' — run `node vendor-fonts.mjs`');
    css += fs.readFileSync(f, 'utf8');
  }
  /* the decks vendor a serif for their body copy; this page never sets it, and
     an unused face is a quarter of a megabyte the student downloads for nothing */
  css = css.split('@font-face').filter((b, i) => i === 0 ||
    FACES_USED.some(fam => new RegExp("font-family:\\s*'" + fam + "'").test(b)))
    .join('@font-face');
  for (const fam of FACES_USED)
    if (!new RegExp("font-family:\\s*'" + fam + "'").test(css))
      throw new Error('the landing page sets ' + fam + ' but no such face was vendored');
  css = css.replace(/url\(fonts\/([^)]+)\)/g, (_, file) =>
    'url(data:font/woff2;base64,' + fs.readFileSync(path.join(DECK, 'fonts', file)).toString('base64') + ')');
  if (/url\(fonts\//.test(css)) throw new Error('a face survived inlining — the landing page would silently fall back');
  return css;
}

/* The map is the one thing the page shares with the lectures: the very
   widget Lecture 0 mounts, kept in its own axis colours so the picture
   a student meets here is the picture the deck shows. deck.js is a deck
   engine and cannot run on this page, so only its helper block is taken. */
function cubeJS() {
  const src = fs.readFileSync(path.join(DECK, 'deck.js'), 'utf8');
  const a = src.indexOf('/* ---------- widget registry');
  const b = src.indexOf('/* ---------- boot');
  if (a < 0 || b <= a) throw new Error('deck.js: the widget-registry block is no longer where site.mjs looks for it');
  const shell = src.slice(a, b).trimEnd();
  if (!/\bvar REG\b/.test(shell) || !shell.endsWith('};'))
    throw new Error('deck.js: the extracted helper block is not self-contained any more');
  const widget = fs.readFileSync(path.join(DECK, 'widgets', 'course-cube.js'), 'utf8');
  return '(function(){"use strict";\n' + shell +
    '\nIE437.mount=function(id,host,opts){return REG[id](host,opts);};\n})();\n' + widget + `
(function () {
  var host = document.querySelector('.cubehost');
  if (!host || !window.IE437) return;
  IE437.mount('course-cube', host, {});
  /* the widget sizes its canvas in real pixels for a 1280px stage; on a
     fluid page let the viewBox do the scaling instead */
  var s = host.querySelector('svg');
  if (s) { s.removeAttribute('width'); s.removeAttribute('height');
           s.style.width = '100%'; s.style.height = 'auto'; }
})();`;
}

/* ---------------- page ------------------------------------------- */
const DL_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1v8m0 0L4.8 5.8M8 9l3.2-3.2" ' +
  'stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M2.5 11.5v2h11v-2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';

const CUBE_GLYPH = '<svg viewBox="0 0 100 100" aria-hidden="true">' +
  '<polygon points="50,8 90,30 50,52 10,30" fill="var(--teal-200)" stroke="var(--teal-d)" stroke-width="3"/>' +
  '<polygon points="10,30 50,52 50,92 10,70" fill="var(--teal)" stroke="var(--teal-d)" stroke-width="3"/>' +
  '<polygon points="90,30 50,52 50,92 90,70" fill="var(--teal-l)" stroke="var(--teal-d)" stroke-width="3"/></svg>';

/* the practical facts, set quietly under the course description rather than
   in the hero; a blank value is honestly marked rather than quietly dropped,
   so nobody ships a page claiming an office hour that was never set */
function infoStrip(info) {
  const rows = Object.entries(info || {});
  if (!rows.length) return '';
  return '<dl class="facts">' + rows.map(([k, v]) =>
    '<div><dt>' + esc(k) + '</dt><dd' + (v ? '' : ' class="todo"') + '>' +
    (v ? esc(v) : 'to be announced') + '</dd></div>').join('') + '</dl>';
}

function heroTitle(lines) {
  return lines.map(l => '<span>' + mdSpan(l).replace(/<em>/g, '<em>').replace(/<\/em>/g, '</em>') + '</span>').join('');
}

function chapterRow(c) {
  const open = c.built
    ? `<a class="dl open" href="${esc(c.html)}">open</a>`
    : `<span class="dl off" title="not built yet">open</span>`;
  const pdf = c.hasPdf
    ? `<a class="dl" href="${esc(c.pdf)}" download="${esc(c.saveAs)}" title="Download ${esc(c.saveAs)}">${DL_ICON}PDF</a>`
    : `<span class="dl off" title="run node pdf.mjs">${DL_ICON}PDF</span>`;
  return `<div class="ch">
      <div class="cn">${esc(c.num)}</div>
      <div class="ct">
        ${c.built ? `<a href="${esc(c.html)}">${mdSpan(c.title)}</a>` : `<a>${mdSpan(c.title)}</a>`}
        ${c.subtitle ? `<div class="cs">${mdSpan(c.subtitle)}</div>` : ''}
        ${c.blurb ? `<div class="cb">${mdSpan(c.blurb)}</div>` : ''}
      </div>
      <div class="cx">
        ${c.slides ? `<span class="slidecount">${c.slides} slides</span>` : ''}
        ${open}${pdf}
      </div>
    </div>`;
}

/* the people who teach it — one card each, contact details beneath */
function personCard(p) {
  const line = (cls, v) => v ? `<div class="${cls}">${mdSpan(v)}</div>` : '';
  return `<div class="who">
      <div class="role">${esc(p.role || '')}</div>
      <div class="name">${mdSpan(p.name || '')}</div>
      ${line('meta', p.office)}
      ${p.email ? `<div class="meta"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>` : ''}
      ${p.hours ? `<div class="hours">${mdSpan(p.hours)}</div>` : ''}
    </div>`;
}

/* the grading breakdown: one 100%-wide bar, then a row per component.
   A single-hue ramp, because this is one quantity split four ways and
   not four different kinds of thing. */
function gradingBlock(rows) {
  if (!rows.length) return '';
  const bar = rows.map((g, i) =>
    `<span style="--w:${Number(g.weight)}%;--i:${i}" title="${esc(g.name)} ${esc(g.weight)}%"></span>`).join('');
  const list = rows.map((g, i) => `<li style="--i:${i}">
      <div class="gw"><b>${esc(g.weight)}</b><i>%</i></div>
      <div class="gt">
        <h4>${mdSpan(g.name)}${g.tba ? '<span class="tba">details to come</span>' : ''}</h4>
        ${mdBlock(g.body || '')}
      </div>
    </li>`).join('');
  return `<div class="grading">
      <div class="gbar" role="img" aria-label="${esc(rows.map(g => g.name + ' ' + g.weight + '%').join(', '))}">${bar}</div>
      <ol class="grows">${list}</ol>
    </div>`;
}

/* the final project, set out under the assessment table rather than inside
   it. The three stages are three different kinds of work — a business case,
   a proof, a running thing — so they take the three identity hues rather
   than one hue stepped, which is what the grading bar above uses for the
   single quantity it splits. */
function projectBlock(p) {
  if (!p) return '';
  const stages = (p.stages || []).map(s => `<li class="pst" data-tone="${esc(s.tone || 'teal')}">
      <div class="pn">${esc(s.n || '')}</div>
      <h4>${mdSpan(s.name || '')}</h4>
      ${s.q ? `<div class="pq">&ldquo;${mdSpan(s.q)}&rdquo;</div>` : ''}
      ${mdBlock(s.body || '')}
    </li>`).join('');
  const deliv = (p.deliverables || []).map(d => `<li>
      <b>${mdSpan(d.name || '')}</b>${mdBlock(d.body || '')}
    </li>`).join('');
  return `<div class="project">
    <div class="phead">
      <div>
        <div class="pkick">40% &middot; ${mdSpan(p.heading || 'The final project')}</div>
        ${p.tagline ? `<h3>${mdSpan(p.tagline)}</h3>` : ''}
      </div>
    </div>
    ${p.lede ? `<div class="plede">${mdSpan(p.lede)}</div>` : ''}
    ${stages ? `<ol class="pstages">${stages}</ol>` : ''}
    ${deliv ? `<div class="pdel"><h4>What you hand in</h4><ul>${deliv}</ul></div>` : ''}
    ${p.note ? `<div class="pnote">${mdSpan(p.note)}</div>` : ''}
  </div>`;
}

function noticeRow(a, i) {
  const tags = (a.pin ? '<span class="tag pin">pinned</span>' : '') +
               (a.fresh && !a.pin ? '<span class="tag new">new</span>' : '');
  return `<article class="notice"${i >= 5 ? ' hidden data-extra' : ''}>
      <div class="when"><time datetime="${esc(a.date)}">${esc(a.date)}</time>${tags}</div>
      <div><h3>${mdSpan(a.title)}</h3><div class="body">${a.body}</div></div>
    </article>`;
}

export function writeSite() {
  const { fm, body } = readFm(path.join(MD, '_SITE.md'));
  const chs = chapters();
  const byCh = new Map(chs.map(c => [c.ch, c]));
  const news = announcements();
  const syl = syllabus();

  /* the body of _SITE.md is the "about" section: a lede, then one card
     per `### heading` */
  const cards = [];
  let lede = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const m = line.match(/^###\s+(.*)$/);
    if (m) { if (cur) cards.push(cur); cur = { title: m[1].trim(), lines: [] }; continue; }
    (cur ? cur.lines : lede).push(line);
  }
  if (cur) cards.push(cur);

  const parts = (fm.parts || []).map(p => {
    const rows = (p.chapters || []).map(n => byCh.get(Number(n))).filter(Boolean);
    if (!rows.length) return '';
    return `<div class="part">
      <div class="ph"><span class="pn">${esc(p.name)}</span><span class="pt">${mdSpan(p.theme || '')}</span></div>
      ${rows.map(chapterRow).join('\n')}
    </div>`;
  }).join('\n');

  /* every chapter must appear exactly once — a chapter added to md/ and
     forgotten in _SITE.md would otherwise vanish from the page silently */
  const listed = new Set((fm.parts || []).flatMap(p => (p.chapters || []).map(Number)));
  const missing = chs.filter(c => !listed.has(c.ch));
  if (missing.length)
    console.warn('    ! not listed under any part in md/_SITE.md: ' +
      missing.map(c => 'ch' + c.num).join(', '));

  /* the launcher hands these files to students, so it says out loud when one
     of them is older than the deck it claims to be a copy of */
  const behind = chs.filter(c => c.pdfStale);
  if (behind.length)
    console.warn('    ! PDF older than the deck for ' + behind.map(c => 'ch' + c.num).join(', ') +
      ' — run `node pdf.mjs --all`');
  const noPdf = chs.filter(c => c.built && !c.hasPdf);
  if (noPdf.length)
    console.warn('    ! no PDF yet for ' + noPdf.map(c => 'ch' + c.num).join(', ') +
      ' — run `node pdf.mjs --all`');

  /* the eyebrow numbers are positional: the syllabus section is optional, so
     counting them here keeps 01-02-03 contiguous either way */
  let _sn = 0;
  const sn = () => String(++_sn).padStart(2, '0');

  const stamp = fs.readdirSync(MD).filter(f => f.endsWith('.md'))
    .map(f => fs.statSync(path.join(MD, f)).mtime)
    .sort((a, b) => b - a)[0].toISOString().slice(0, 10);

  const totalSlides = chs.reduce((s, c) => s + c.slides, 0);

  const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fm.course || 'IE437')} — ${esc(fm.title || '')}</title>
<meta name="description" content="${esc(fm.thesis || '')}">
<style>${faceCSS('fonts.css', 'display.css')}</style>
<style>${fs.readFileSync(path.join(DECK, 'site.css'), 'utf8')}</style>
</head><body>

<header class="top"><div class="wrap">
  <a class="mark" href="#top">${CUBE_GLYPH}<b>IE<i>437</i></b></a>
  <nav class="tnav">
    <a href="#course">The course</a>
    <a href="#notices">Notices</a>
    ${syl ? '<a href="#syllabus">Syllabus</a>' : ''}
    <a class="keep" href="#materials">Materials</a>
  </nav>
</div></header>

<main id="top">

<section class="hero"><div class="wrap">
  <div>
  <div class="eyebrow rise">${esc(fm.eyebrow || fm.course || '')}</div>
  <h1 class="big rise" style="--d:1">${heroTitle(fm.title_lines || [fm.title])}</h1>
  ${fm.thesis ? `<p class="thesis rise" style="--d:2">${mdSpan(fm.thesis)}</p>` : ''}
  ${fm.lede ? `<p class="lede rise" style="--d:3">${mdSpan(fm.lede)}</p>` : ''}
  ${(fm.chips || []).length ? `<div class="chips rise" style="--d:4">${
    fm.chips.map((c, i) => `<span class="chip${i === 0 ? ' on' : ''}">${esc(c)}</span>`).join('')}</div>` : ''}
  <div class="cta rise" style="--d:5">
    <a class="btn solid" href="#materials">Lecture materials &rarr;</a>
    <a class="btn ghost" href="#notices">Notices</a>
  </div>
  </div>
  <div class="cubefig rise" style="--d:3">
    <div data-cube></div>
    <div class="chint">drag, or focus and use the arrow keys, to rotate</div>
  </div>
</div></section>

<section class="band sunk" id="course"><div class="wrap">
  <div class="shead"><div>
    <div class="snum">${sn()} &middot; The course</div>
    <h2>${mdSpan(fm.course_heading || 'What this course is about')}</h2>
  </div></div>
  ${lede.join('\n').trim() ? `<div class="sintro">${mdBlock(lede.join('\n'))}</div>` : ''}
  ${cards.length ? `<div class="cards">${cards.map((c, i) => `
    <div class="card">
      <div class="n">${String(i + 1).padStart(2, '0')}</div>
      <h3>${mdSpan(c.title)}</h3>
      ${mdBlock(c.lines.join('\n'))}
    </div>`).join('')}</div>` : ''}
  <div class="mapwrap"><div class="cubehost"></div></div>
</div></section>

<section class="band" id="notices"><div class="wrap">
  <div class="shead"><div>
    <div class="snum">${sn()} &middot; Notices</div>
    <h2>Announcements</h2>
  </div></div>
  ${news.length
    ? `<div class="notices">${news.map(noticeRow).join('\n')}</div>` +
      (news.length > 5 ? `<div class="more"><button class="btn ghost" id="moreb">Show all ${news.length} notices</button></div>` : '')
    : `<div class="empty">No notices yet. Add one to <code>md/_ANNOUNCEMENTS.md</code> and rebuild.</div>`}
</div></section>

${syl ? `
<section class="band sunk" id="syllabus"><div class="wrap">
  <div class="shead"><div>
    <div class="snum">${sn()} &middot; Syllabus</div>
    <h2>${mdSpan(syl.fm.heading || 'Syllabus')}</h2>
  </div>${syl.fm.term ? `<div class="stag">${esc(syl.fm.term)}</div>` : ''}</div>
  ${syl.fm.lede ? `<div class="sintro">${mdSpan(syl.fm.lede)}</div>` : ''}

  ${(syl.fm.people || []).length
    ? `<div class="people">${syl.fm.people.map(personCard).join('')}</div>` : ''}
  ${infoStrip(syl.fm.facts)}

  ${syl.body.trim() ? `<div class="sbody">${mdBlock(syl.body)}</div>` : ''}

  ${syl.grading.length ? `<div class="ghead"><h3>Assessment</h3>
    <span class="ghint">weights add to 100</span></div>${gradingBlock(syl.grading)}` : ''}
  ${projectBlock(syl.fm.project)}
</div></section>` : ''}

<section class="band" id="materials"><div class="wrap">
  <div class="shead"><div>
    <div class="snum">${sn()} &middot; Materials</div>
    <h2>Lecture notes</h2>
  </div><div class="slidecount">${chs.length} chapters &middot; ${totalSlides} slides</div></div>
  <div class="sintro">${mdSpan(fm.materials_intro || '')}</div>
  ${parts}
  <div class="howto">
    <b>Open</b> presents the chapter in the browser — it is interactive, with click-through
    reveals and live simulators. <b>PDF</b> downloads the same chapter as slides.
    In a deck: <kbd>&rarr;</kbd> next reveal &middot; <kbd>&larr;</kbd> back &middot;
    <kbd>&uarr;</kbd><kbd>&darr;</kbd> skip a slide &middot; <kbd>M</kbd> index &middot;
    <kbd>P</kbd> print &middot; <kbd>F</kbd> fullscreen &middot; <kbd>?</kbd> all keys.
    Each chapter is a single self-contained file: save it and it runs offline.
  </div>
</div></section>

</main>

<footer><div class="wrap">
  <div class="who"><b>${esc(fm.instructor || '')}</b>${fm.institute ? ' &middot; ' + esc(fm.institute) : ''}${
    fm.contact ? ' &middot; <a href="mailto:' + esc(fm.contact) + '">' + esc(fm.contact) + '</a>' : ''}</div>
  <div class="stamp">updated ${esc(stamp)}</div>
</div></footer>

<script>${fs.readFileSync(path.join(DECK, 'decision-cube.js'), 'utf8')}</script>
<script>${cubeJS()}</script>
<script>
(function () {
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('stuck', window.scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var b = document.getElementById('moreb');
  if (b) b.onclick = function () {
    document.querySelectorAll('.notice[data-extra]').forEach(function (n) { n.hidden = false; });
    b.parentNode.removeChild(b);
  };
})();
</script>
</body></html>
`;
  fs.mkdirSync(OUT, { recursive: true });
  const idx = path.join(OUT, 'index.html');
  if (!fs.existsSync(idx) || fs.readFileSync(idx, 'utf8') !== doc) fs.writeFileSync(idx, doc);
  return { chapters: chs.length, slides: totalSlides, notices: news.length,
           pdfs: chs.filter(c => c.hasPdf && !c.pdfStale).length };
}

/* run directly: node site.mjs */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = writeSite();
  console.log('OK  index.html  ->  html/index.html   ' + r.chapters + ' chapters, ' +
    r.slides + ' slides, ' + r.notices + ' notices, ' + r.pdfs + ' current PDFs');
}
