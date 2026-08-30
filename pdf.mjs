#!/usr/bin/env node
/* ============================================================
   IE437 · pdf.mjs  —  html/*.html  →  pdf/*.pdf   (1280x720 pages)
   Headless Chromium renders exactly what the browser's
   "Print -> Save as PDF" would produce, with every reveal opened
   and every widget frozen in its finished state.

     node pdf.mjs --all
     node pdf.mjs ch08
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(ROOT, 'html');
const OUT = path.join(ROOT, 'pdf');

const args = process.argv.slice(2);
let files = fs.readdirSync(HTML).filter(f => f.endsWith('.html') && f !== 'index.html');
if (!(args.includes('--all') || args.length === 0)) {
  files = files.filter(f => args.some(a => f.startsWith(a)));
}
if (!files.length) { console.error('no matching html/ files — run `node build.mjs` first'); process.exit(1); }

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

for (const f of files.sort()) {
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
  console.log('OK  ' + f + '  ->  ' + path.relative(ROOT, out) + '   ' + n + ' pages, ' + kb + ' KB');
}

await browser.close();
