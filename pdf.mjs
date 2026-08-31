#!/usr/bin/env node
/* ============================================================
   IE437 · pdf.mjs  —  html/*.html  →  html/pdf/*.pdf   (1280x720 pages)
   Headless Chromium renders exactly what the browser's
   "Print -> Save as PDF" would produce, with every reveal opened
   and every widget frozen in its finished state.

     node pdf.mjs --all           every chapter whose PDF is out of date
     node pdf.mjs ch08            one chapter
     node pdf.mjs --all --force   rebuild even the up-to-date ones

   Incremental on purpose. build.mjs calls this after every build, so
   a chapter's PDF can never be older than the deck a student is
   reading — and skipping the untouched ones keeps that free.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(ROOT, 'html');
const OUT = path.join(ROOT, 'html', 'pdf');   // html/ is the folder you publish

/* a PDF is stale the moment its deck is rewritten */
export function stale(file) {
  const html = path.join(HTML, file);
  const pdf = path.join(OUT, file.replace(/\.html$/, '.pdf'));
  if (!fs.existsSync(pdf)) return true;
  return fs.statSync(pdf).mtimeMs < fs.statSync(html).mtimeMs;
}

export async function writePDFs(match, opts = {}) {
  if (!fs.existsSync(HTML)) return [];
  let files = fs.readdirSync(HTML).filter(f => f.endsWith('.html') && f !== 'index.html');
  if (match && match.length) files = files.filter(f => match.some(a => f.startsWith(a)));
  const todo = opts.force ? files : files.filter(stale);
  const skipped = files.length - todo.length;
  if (!todo.length) {
    if (opts.log && files.length) console.log('    ' + files.length + ' PDF' +
      (files.length > 1 ? 's' : '') + ' already up to date');
    return [];
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const made = [];
  fs.mkdirSync(OUT, { recursive: true });

  for (const f of todo.sort()) {
    const url = pathToFileURL(path.join(HTML, f)).href;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const n = await page.evaluate(() => (window.__deckPrintReady ? window.__deckPrintReady() : 0));
    await page.waitForTimeout(400);
    const out = path.join(OUT, f.replace(/\.html$/, '.pdf'));
    await page.pdf({
      path: out,
      width: '1280px', height: '720px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true
    });
    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    made.push(out);
    if (opts.log !== false)
      console.log('PDF ' + f + '  ->  ' + path.relative(ROOT, out) + '   ' + n + ' pages, ' + kb + ' KB');
  }
  await browser.close();
  if (skipped && opts.log !== false)
    console.log('    ' + skipped + ' unchanged PDF' + (skipped > 1 ? 's' : '') + ' skipped');
  return made;
}

/* run directly: node pdf.mjs [chNN...] [--all] [--force] */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const match = args.filter(a => !a.startsWith('--'));
  const made = await writePDFs(match, { force, log: true });
  if (!made.length && !fs.readdirSync(HTML).some(f => f.endsWith('.html') && f !== 'index.html'))
    { console.error('no html/ decks — run `node build.mjs` first'); process.exit(1); }
}
