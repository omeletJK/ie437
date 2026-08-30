#!/usr/bin/env node
/* ============================================================
   IE437 · build.mjs  —  md/*.md  →  html/*.html
   The markdown in md/ is the single source of truth.
   Everything in html/ is generated; never edit it by hand.

     node build.mjs --all
     node build.mjs ch08
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import katex from 'katex';
import { marked } from 'marked';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MD = path.join(ROOT, 'md');
const OUT = path.join(ROOT, 'html');

marked.setOptions({ mangle: false, headerIds: false, breaks: false });

/* ---------------- math -------------------------------------------- */
const KATEX_OPTS = {
  throwOnError: false, strict: false, trust: true,
  macros: {
    '\\hl': '\\htmlClass{mhl}{#1}',
    '\\alert': '\\htmlClass{mhl}{#1}',
    '\\dm': '\\htmlClass{mdim}{#1}',
    '\\E': '\\mathbb{E}',
    '\\R': '\\mathbb{R}',
    '\\argmax': '\\operatorname*{arg\\,max}',
    '\\argmin': '\\operatorname*{arg\\,min}'
  }
};
let MATHSTORE = [];
const MARK = 'zmathz';
function protectMath(src) {
  const stash = (tex, display) => {
    const i = MATHSTORE.length;
    let html;
    try { html = katex.renderToString(tex, { ...KATEX_OPTS, displayMode: display }); }
    catch (e) { html = '<span style="color:#B03A2E">[math error]</span>'; }
    MATHSTORE.push(display ? '<div class="mathblock">' + html + '</div>' : html);
    return MARK + i + MARK;
  };
  src = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => stash(t.trim(), true));
  src = src.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_, t) => stash(t.trim(), false));
  return src;
}
function restoreMath(html) {
  const re = new RegExp(MARK + '(\\d+)' + MARK, 'g');
  html = html.replace(re, (_, i) => MATHSTORE[+i]);
  html = html.replace(/<p>\s*(<div class="mathblock">[\s\S]*?<\/div>)\s*<\/p>/g, '$1');
  return html;
}

/* ---------------- inline roles ------------------------------------ */
function inlineRoles(s) {
  s = s.replace(/==([^=]+)==/g, '<span class="hl">$1</span>');
  s = s.replace(/\{p\}\(([^)]*)\)/g, '<span class="paper-ref">($1)</span>');
  return s;
}
function md2html(text) {
  if (!text.trim()) return '';
  return restoreMath(marked.parse(inlineRoles(protectMath(text))));
}
function mdInline(text) {
  if (!String(text).trim()) return '';
  return restoreMath(marked.parseInline(inlineRoles(protectMath(String(text)))));
}
/* "Act 3 — whose value?"  ->  "whose value?"  (the Act label lives in the kicker) */
const stripLead = t => String(t).replace(/^\s*(act|part|appendix|closing)\b[^\u2014-]*[\u2014-]\s*/i, '')
  .replace(/^([a-z])/, (m) => m.toUpperCase());
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rawText = n => n.children.map(c => c.text || '').join('\n');

/* ---------------- attribute line  {a: b, c: d} -------------------- */
function parseAttrs(line) {
  const o = {};
  line.replace(/^\{|\}$/g, '').split(',').forEach(kv => {
    const i = kv.indexOf(':'); if (i < 0) return;
    o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  });
  return o;
}

/* ---------------- block parser (nested ::: fences) ---------------- */
function parseBlocks(lines) {
  const root = { type: 'root', children: [] };
  const stack = [root];
  let buf = [];
  const flush = () => {
    if (buf.join('').trim()) stack[stack.length - 1].children.push({ type: 'text', text: buf.join('\n') });
    buf = [];
  };
  for (const raw of lines) {
    const t = raw.trimEnd();
    if (/^:::\s*$/.test(t)) { flush(); if (stack.length > 1) stack.pop(); continue; }
    const m = t.match(/^:::\s*([a-zA-Z][\w.-]*)\s*(.*)$/);
    if (m) {
      flush();
      const node = { type: 'dir', name: m[1], arg: m[2].trim(), children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      continue;
    }
    buf.push(raw);
  }
  flush();
  return root;
}

/* ---------------- directive renderers ----------------------------- */
function renderChildren(node, ctx) {
  return node.children.map(c => renderNode(c, ctx)).join('\n');
}

function renderNode(n, ctx) {
  if (n.type === 'text') return md2html(n.text);
  const [name, ...mods] = n.name.split('.');
  const cls = mods.join(' ');
  const inner = () => renderChildren(n, ctx);

  switch (name) {
    case 'reveal': {
      const k = ++ctx.frag;
      return '<div class="frag" data-frag="' + k + '">\n' + inner() + '\n</div>';
    }
    case 'note':
      return '<div class="pnote">' + inner() + '</div>';

    case 'lede':
      return '<p class="lede">' + mdInline(rawText(n)) + '</p>';
    case 'small':
      return '<p class="small">' + mdInline(rawText(n)) + '</p>';

    case 'keypoint':
      return '<div class="thesis ' + cls + '">' + mdInline(rawText(n).replace(/\n+/g, ' ')) + '</div>';

    case 'block': {
      let title = n.arg, note = '';
      const bar = n.arg.split('|');
      if (bar.length > 1) { title = bar[0].trim(); note = '<span class="bx">' + mdInline(bar[1].trim()) + '</span>'; }
      return '<div class="blk ' + cls + '">' +
        (title ? '<div class="bt">' + mdInline(title) + note + '</div>' : '') +
        '<div class="bb">' + inner() + '</div></div>';
    }

    case 'cols':
      return '<div class="cols ' + (n.arg || 'c2') + '">' + inner() + '</div>';
    case 'col':
      return '<div class="col ' + cls + '">' + (n.arg ? '<h3>' + mdInline(n.arg) + '</h3>' : '') + inner() + '</div>';

    case 'center':
      return '<div style="text-align:center">' + inner() + '</div>';

    case 'widget': {
      const sp = n.arg.indexOf(' ');
      const id = (sp < 0 ? n.arg : n.arg.slice(0, sp)).trim();
      const opts = (sp < 0 ? '' : n.arg.slice(sp + 1).trim()) || '{}';
      ctx.widgets.add(id);
      const cap = rawText(n).trim();
      return '<div class="widget" data-widget="' + esc(id) + '" data-opts=\'' + esc(opts) + '\'></div>' +
        (cap ? '<div class="wcap">' + mdInline(cap) + '</div>' : '');
    }

    case 'flow': {
      const items = rawText(n).split('\n').map(l => l.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
      const lbls = (n.arg || '').split('|').map(s => s.trim());
      const out = [];
      items.forEach((it, i) => {
        if (i) {
          const L = lbls[i - 1];
          out.push('<span class="farrow' + (L ? ' lbl' : '') + '"' + (L ? ' data-l="' + esc(L) + '"' : '') + '></span>');
        }
        let k = '';
        if (it.startsWith('!!')) { k = 'danger'; it = it.slice(2).trim(); }
        else if (it.startsWith('!')) { k = 'accent'; it = it.slice(1).trim(); }
        const parts = it.split('|');
        out.push('<div class="fbox ' + k + '"><b>' + mdInline(parts[0].trim()) + '</b>' +
          (parts[1] ? '<small>' + mdInline(parts[1].trim()) + '</small>' : '') + '</div>');
      });
      return '<div class="flow">' + out.join('') + '</div>';
    }

    case 'qstrip':
      return qstrip(ctx.fm.questions || [], +(n.arg || ctx.slideAttrs.q || 0));

    case 'tracker':
      return tracker(ctx.fm);

    case 'lineage':
      return lineage(n.arg || ctx.fm.lineage_here || '');

    case 'table':
      return inner().replace('<table>', '<table class="' + (n.arg || '') + '">');

    default:
      return '<div class="' + esc(n.name) + '">' + inner() + '</div>';
  }
}

/* ---------------- recurring components ---------------------------- */
function qstrip(questions, at) {
  if (!questions.length) return '';
  const parts = questions.map((q, i) => {
    const n = i + 1;
    const k = n === at ? 'on' : (at && n < at ? 'done' : '');
    return '<span class="qn ' + k + '">Q' + n + '  ' + esc(q) + '</span>';
  });
  return '<div class="qstrip">' + parts.join('<span class="qa"></span>') + '</div>';
}

const AXES = [
  { key: 'stages', name: 'stages', a: 'static', b: 'dynamic' },
  { key: 'model', name: 'model', a: 'model-based', b: 'data-driven' },
  { key: 'agents', name: 'agents', a: 'single agent', b: 'multi-agent' }
];
function tracker(fm) {
  const cube = fm.cube || {};
  const crossing = fm.crossing || '';
  const from = fm.cube_from || {};
  return '<div class="tracker">' + AXES.map(ax => {
    const at = cube[ax.key] || ax.a;
    const isB = /dynamic|data|multi/.test(at);
    const cross = crossing === ax.key;
    const prev = from[ax.key];
    return '<div class="axis ' + (cross ? 'cross' : '') + '">' +
      '<span class="an">' + ax.name + (cross ? ' · crossing' : '') + '</span>' +
      '<span class="av">' + (prev ? '<span>' + esc(prev) + '</span><span class="arw">&rarr;</span>' : '') +
      '<b>' + esc(at) + '</b></span>' +
      '<span class="dotrow"><i class="pt ' + (!isB ? 'at' : '') + '"></i><i class="seg"></i>' +
      '<i class="pt ' + (isB ? 'at' : '') + '"></i></span></div>';
  }).join('') + '</div>';
}

const LINEAGE_CELLS = {
  'mb-A': { t: 'MDP &amp; Dynamic Programming', s: 'Lecture 7' },
  'mb-B': { t: 'Optimal Control / Planning', s: 'Lecture 9' },
  'dd-A': { t: 'Value-Based RL', s: 'Lecture 8' },
  'dd-B': { t: 'Policy-Based RL', s: 'Lecture 10' }
};
function lineage(here) {
  const cell = k => '<div class="cell ' + (here === k ? 'here' : '') + '"><b>' +
    LINEAGE_CELLS[k].t + '</b><small>' + LINEAGE_CELLS[k].s + '</small></div>';
  return '<div class="lgrid">' +
    '<div class="lh"></div><div class="lh">Lineage A &middot; OR / Dynamic Programming</div>' +
    '<div class="lh">Lineage B &middot; Control Theory</div>' +
    '<div class="rh">Model-based<br>(origin)</div>' + cell('mb-A') + cell('mb-B') +
    '<div class="rh">Data-driven<br>(extension)</div>' + cell('dd-A') + cell('dd-B') +
    '</div>';
}

/* How many visually separate blocks does this slide have at the top level?
   Three or more and we spread them over the whole canvas (`split`);
   fewer and we centre them, which reads better than a top-heavy stub. */
function blockCount(root) {
  return root.children.reduce((n, c) => n + (c.type === 'text'
    ? c.text.split(/\n\s*\n/).filter(t => t.trim()).length : 1), 0);
}

/* ---------------- self-contained assets ---------------------------
   Every chapter is published as ONE file that opens on its own: the
   stylesheet, the engine, its widgets, KaTeX and the display faces are
   all inlined. Build with --linked instead to reference deck/ during
   development, when editing deck.css should not need a rebuild.      */
const dataURI = f => 'data:font/woff2;base64,' + fs.readFileSync(f).toString('base64');
let _katex = null, _faces = null, _engine = null;

function katexCSS() {
  if (_katex) return _katex;
  let css = fs.readFileSync(path.join(ROOT, 'deck/katex/katex.min.css'), 'utf8');
  /* the src run ends at ';' OR at the closing '}' of the @font-face block —
     matching only ';' silently left every KaTeX face pointing at a missing file */
  css = css.replace(/src:url\(fonts\/([\w-]+)\.woff2\)[^;}]*/g, (m, name) => {
    const p = path.join(ROOT, 'deck/katex/fonts', name + '.woff2');
    return fs.existsSync(p) ? `src:url(${dataURI(p)}) format("woff2")` : m;
  });
  if (/url\(fonts\//.test(css)) throw new Error('KaTeX font inlining left a relative url(fonts/...)');
  return (_katex = css);
}
function faceCSS() {
  if (_faces) return _faces;
  const dir = path.join(ROOT, 'deck/fonts');
  if (!fs.existsSync(path.join(dir, 'fonts.css'))) return (_faces = '');
  const css = fs.readFileSync(path.join(dir, 'fonts.css'), 'utf8')
    .replace(/url\(fonts\/([\w.-]+)\)/g, (m, name) => {
      const p = path.join(dir, name);
      return fs.existsSync(p) ? `url(${dataURI(p)})` : m;
    });
  return (_faces = css);
}
function engineJS() {
  if (_engine) return _engine;
  return (_engine = fs.readFileSync(path.join(ROOT, 'deck/deck.js'), 'utf8'));
}
function widgetJS(id) {
  const p = path.join(ROOT, 'deck/widgets', id + '.js');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

/* ---------------- document assembly ------------------------------- */
function build(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) throw new Error(path.basename(file) + ': missing YAML front matter');
  const fm = yaml.load(fmMatch[1]) || {};
  const body = fmMatch[2];

  const lines = body.split('\n');
  const slides = [];
  let section = null, curSlide = null;
  const pushSlide = () => { if (curSlide) { slides.push(curSlide); curSlide = null; } };

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    let m;
    if ((m = L.match(/^##\s+(?!#)(.*)$/))) {
      pushSlide();
      let attrs = {};
      while (/^\{.*\}\s*$/.test((lines[i + 1] || '').trim())) Object.assign(attrs, parseAttrs(lines[++i].trim()));
      section = { title: m[1].trim(), attrs };
      if (attrs.divider !== 'false') slides.push({ kind: 'section', section, title: m[1].trim(), attrs, lines: [] });
      continue;
    }
    if ((m = L.match(/^###\s+(.*)$/))) {
      pushSlide();
      let attrs = {};
      while (/^\{.*\}\s*$/.test((lines[i + 1] || '').trim())) Object.assign(attrs, parseAttrs(lines[++i].trim()));
      curSlide = { kind: 'slide', section, title: m[1].trim(), attrs, lines: [] };
      continue;
    }
    if (curSlide) curSlide.lines.push(L);
    else if (slides.length && slides[slides.length - 1].kind === 'section') slides[slides.length - 1].lines.push(L);
  }
  pushSlide();

  const ctx = { fm, widgets: new Set(), frag: 0, slideAttrs: {} };
  const N = slides.length;
  const chapLabel = 'Lecture ' + fm.ch + ' · ' + fm.title;

  const html = slides.map((s, i) => {
    ctx.frag = 0; ctx.slideAttrs = s.attrs;
    const layout = s.attrs.layout || (s.kind === 'section' ? 'section' : 'default');
    const dark = s.attrs.theme === 'dark' || layout === 'title' || layout === 'section' || layout === 'standout';
    const ast = parseBlocks(s.lines);
    /* a question strip that opens a slide belongs to the header, not the body —
       otherwise centring the body floats it away from the title it annotates */
    let stripHtml = '';
    while (ast.children.length && ast.children[0].type === 'dir' &&
           /^(qstrip|tracker)$/.test(ast.children[0].name)) {
      stripHtml += renderNode(ast.children.shift(), ctx);
    }
    const bodyHtml = renderChildren(ast, ctx);
    const rhythm = s.attrs.fill || 'auto';   // 'auto' = deck.js measures and balances
    const pct = ((i + 1) / N * 100).toFixed(1);

    if (layout === 'title') {
      return '<section class="slide dark" data-layout="title" data-i="' + i + '">\n' +
        '  <div class="tmeta">' + esc(fm.course || 'IE437 · Data-Driven Decision Making and Control') + ' &mdash; Lecture ' + fm.ch + '</div>\n' +
        '  <h1 class="head rise">' + mdInline(fm.title) + '</h1>\n' +
        (fm.subtitle ? '  <div class="tsub rise" style="--d:1">' + mdInline(fm.subtitle) + '</div>\n' : '') +
        '  <div class="trule rise" style="--d:2"></div>\n' +
        '  <div class="tby rise" style="--d:3">' + esc(fm.author || '') + (fm.institute ? ' · ' + esc(fm.institute) : '') +
        (fm.tagline ? '<br><span style="color:rgba(244,243,238,.42)">' + mdInline(fm.tagline) + '</span>' : '') + '</div>\n' +
        bodyHtml + '\n</section>';
    }
    if (layout === 'section') {
      return '<section class="slide dark" data-layout="section" data-i="' + i + '">\n' +
        '  <div class="snum">' + esc(s.attrs.num || s.attrs.short || '') + '</div>\n' +
        '  <h1 class="head rise">' + mdInline(stripLead(s.title)) + '</h1>\n' +
        (bodyHtml.trim() ? '  <div class="sq rise" style="--d:1">' + bodyHtml.replace(/^<p>|<\/p>\s*$/g, '') + '</div>\n' : '') +
        '</section>';
    }
    if (layout === 'standout') {
      return '<section class="slide dark" data-layout="standout" data-i="' + i + '">\n' +
        '  <div class="big rise">' + mdInline(s.title) + '</div>\n' +
        (bodyHtml.trim() ? '  <div class="sub rise" style="--d:1">' + bodyHtml.replace(/^<p>|<\/p>\s*$/g, '') + '</div>\n' : '') +
        '</section>';
    }

    const kickN = s.attrs.kicker || (s.section && s.section.attrs.short) || '';
    let kick = s.section ? (kickN ? stripLead(s.section.title) : s.section.title) : (fm.title || '');
    if (kickN && kick.toUpperCase() === kickN.toUpperCase()) kick = '';   // no "CLOSING CLOSING"
    return '<section class="slide' + (dark ? ' dark' : '') + '" data-layout="' + esc(layout) + '" data-i="' + i + '">\n' +
      '  <div class="kicker"><span class="tick"></span>' + (kickN ? '<span class="kn">' + esc(kickN) + '</span>' : '') +
      '<span>' + esc(kick) + '</span><span class="kx">Lecture ' + fm.ch + '</span></div>\n' +
      '  <h1 class="head rise">' + mdInline(s.title) +
      (s.attrs.sub ? '<span class="sub">' + mdInline(s.attrs.sub) + '</span>' : '') + '</h1>\n' + stripHtml +
      '  <div class="fill ' + esc(rhythm) + '">\n' + bodyHtml + '\n  </div>\n' +
      '  <div class="foot"><span>' + esc(chapLabel) + '</span><span class="fspacer"></span><span>' +
      (i + 1) + ' / ' + N + '</span><span class="fbar"><i style="width:' + pct + '%"></i></span></div>\n' +
      '</section>';
  }).join('\n\n');

  const menu = slides.map((s, i) => s.kind === 'section'
    ? '<div class="msec">' + esc(s.title) + '</div>'
    : '<div class="mrow" data-i="' + i + '"><span class="mn">' + (i + 1) + '</span><span>' + esc(s.title) + '</span></div>'
  ).join('\n');

  const widgets = [...ctx.widgets];
  const head = LINKED
    ? '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700' +
      '&family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,300;1,400' +
      '&display=swap" rel="stylesheet">\n' +
      '<link rel="stylesheet" href="../deck/katex/katex.min.css">\n' +
      '<link rel="stylesheet" href="../deck/deck.css">'
    : '<style>' + faceCSS() + '</style>\n<style>' + katexCSS() + '</style>\n<style>' +
      fs.readFileSync(path.join(ROOT, 'deck/deck.css'), 'utf8') + '</style>';
  const scripts = LINKED
    ? '<script src="../deck/deck.js"></script>\n' +
      widgets.map(w => '<script src="../deck/widgets/' + w + '.js"></script>').join('\n')
    : '<script>' + engineJS() + '</script>\n' +
      widgets.map(w => '<script>' + widgetJS(w) + '</script>').join('\n');

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IE437 · Lecture ${fm.ch} — ${esc(fm.title)}</title>
${head}
<style>.mhl{color:var(--accent)}.dark .mhl{color:var(--accent-d)}.mdim{color:var(--ink3)}.dark .mdim{color:var(--wink3)}</style>
</head>
<body>
<div id="rail"></div>
<div id="deck"><div id="stage">
${html}
</div></div>

<div id="hud">
  <button id="hmenu" title="Slide index (M)">INDEX</button>
  <button id="hprev" title="Previous">&lsaquo;</button>
  <span class="ctr" id="hudn"></span>
  <button id="hnext" title="Next">&rsaquo;</button>
  <button id="hpdf" title="Print / Save as PDF (P)">PDF</button>
  <button id="hhelp" title="Keys (?)">?</button>
</div>

<div id="menu">
  <h2>IE437 &middot; Lecture ${fm.ch} &mdash; ${esc(fm.title)}</h2>
${menu}
</div>

<div id="help">
  <h2>Keys</h2>
  <dl>
    <dt>&rarr; / space</dt><dd>next reveal, then next slide</dd>
    <dt>&larr;</dt><dd>back</dd>
    <dt>&uarr; &darr;</dt><dd>skip a whole slide</dd>
    <dt>M</dt><dd>slide index</dd>
    <dt>P</dt><dd>print &rarr; save as PDF (1280&times;720)</dd>
    <dt>F</dt><dd>fullscreen</dd>
  </dl>
</div>

${scripts}
</body>
</html>
`;
  const out = path.join(OUT, path.basename(file).replace(/\.md$/, '.html'));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(out, doc);
  return { out, n: N, widgets: [...ctx.widgets], ch: fm.ch, title: fm.title,
           subtitle: fm.subtitle, file: path.basename(out) };
}

/* ---------------- the launcher page ------------------------------- */
function writeIndex(chapters) {
  const rows = chapters.sort((a, b) => a.ch - b.ch).map(c =>
    `<a class="row" href="${esc(c.file)}">
       <span class="n">${c.ch < 10 ? '0' + c.ch : c.ch}</span>
       <span class="t"><b>${esc(c.title)}</b><i>${esc(c.subtitle || '')}</i></span>
       <span class="m">${c.n} slides</span>
     </a>`).join('\n');
  const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IE437 — lecture notes</title>
<style>${faceCSS()}</style>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0A0B0D;color:#F2F3F5;min-height:100vh;padding:76px 40px;
  font:400 15px/1.6 'Inter','Helvetica Neue',-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:860px;margin:0 auto}
h1{font:700 34px/1.2 'Inter',sans-serif;letter-spacing:-.9px;margin-bottom:8px}
.sub{color:rgba(242,243,245,.44);font-size:15px;margin-bottom:44px}
.eyebrow{display:flex;align-items:center;gap:12px;font:500 10.5px/1 'IBM Plex Mono',monospace;
  letter-spacing:.2em;text-transform:uppercase;color:rgba(242,243,245,.42);margin-bottom:22px}
.eyebrow::before{content:"";width:22px;height:3px;background:#64748B}
.row{display:grid;grid-template-columns:52px 1fr auto;gap:20px;align-items:baseline;
  padding:20px 14px;border-top:1px solid rgba(242,243,245,.12);text-decoration:none;color:inherit;
  transition:background .15s ease}
.row:last-child{border-bottom:1px solid rgba(242,243,245,.12)}
.row:hover{background:rgba(242,243,245,.055)}
.n{font:500 12px/1 'IBM Plex Mono',monospace;color:rgba(242,243,245,.34);letter-spacing:.08em}
.t b{display:block;font-weight:600;font-size:18px;letter-spacing:-.3px}
.t i{display:block;font-style:normal;color:rgba(242,243,245,.46);font-size:13.5px;margin-top:3px}
.m{font:500 10.5px/1 'IBM Plex Mono',monospace;color:rgba(242,243,245,.3);letter-spacing:.1em;white-space:nowrap}
.foot{margin-top:38px;font:400 12.5px/1.7 'Inter',sans-serif;color:rgba(242,243,245,.34)}
.foot code{font:500 12px/1 'IBM Plex Mono',monospace;background:rgba(242,243,245,.09);padding:2px 6px;border-radius:2px}
</style></head><body><div class="wrap">
<div class="eyebrow">IE437 · KAIST · Jinkyoo Park</div>
<h1>Data-Driven Decision Making and Control</h1>
<div class="sub">Interactive lecture notes. Each chapter is a single self-contained file — open, present, or hand it on by itself.</div>
${rows}
<div class="foot">In a deck: <code>&rarr;</code> next reveal &middot; <code>&larr;</code> back &middot;
<code>M</code> slide index &middot; <code>P</code> save as PDF &middot; <code>F</code> fullscreen &middot; <code>?</code> keys.</div>
</div></body></html>
`;
  fs.writeFileSync(path.join(OUT, 'index.html'), doc);
}

/* ---------------- cli --------------------------------------------- */
const args = process.argv.slice(2);
const LINKED = args.includes('--linked');
let files;
if (args.includes('--all') || args.length === 0) {
  files = fs.readdirSync(MD).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();
} else {
  files = fs.readdirSync(MD).filter(f => f.endsWith('.md') && args.some(a => a !== '--linked' && f.startsWith(a)));
}
if (!files.length) { console.error('no matching md/ files'); process.exit(1); }
const made = [];
for (const f of files) {
  try {
    const r = build(path.join(MD, f));
    made.push(r);
    console.log('OK  ' + f + '  ->  ' + path.relative(ROOT, r.out) + '   ' + r.n + ' slides' +
      (r.widgets.length ? '   widgets: ' + r.widgets.join(', ') : ''));
    for (const w of r.widgets) {
      if (!fs.existsSync(path.join(ROOT, 'deck/widgets', w + '.js')))
        console.log('    ! missing widget file: deck/widgets/' + w + '.js');
    }
  } catch (e) { console.error('FAIL ' + f + ': ' + e.message); process.exitCode = 1; }
}
if (made.length > 1) {
  writeIndex(made);
  console.log('OK  index.html  ->  html/index.html   ' + made.length + ' chapters');
}
