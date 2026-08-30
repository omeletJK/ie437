import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [FILE, OUT, ...idxs] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.4 });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL('/Users/jinkyoo/Projects/ie437-slides/html/' + FILE).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => window.__deckPrintReady());
await p.waitForTimeout(500);
/* what actually matters is whether anything reaches the footer, not an assumed gap */
const over = await p.evaluate(() => {
  const bad = [];
  document.querySelectorAll('.slide').forEach((sl, i) => {
    const f = sl.querySelector('.fill'); if (!f) return;
    const kids = [...f.children].filter(k => k.offsetHeight > 0);
    if (!kids.length) return;
    const footTop = sl.querySelector('.foot').getBoundingClientRect().top;
    const last = Math.max(...kids.map(k => k.getBoundingClientRect().bottom));
    if (last > footTop - 6) bad.push(i + 1 + ' (clearance ' + Math.round(footTop - last) + 'px)');
  });
  return bad;
});
console.log('page errors:', errs.length ? errs.join(' | ') : 'none');
console.log('overflowing slides:', over.length ? over.join(', ') : 'none');
const tag = FILE.slice(0, 4);
for (const s of idxs) {
  await p.evaluate(n => { location.hash = '#' + n; }, Number(s));
  await p.waitForTimeout(260);
  await p.evaluate(() => document.querySelectorAll('.slide.active .frag').forEach(f => f.classList.add('on')));
  await p.evaluate(() => window.__deckPrintReady());
  await p.waitForTimeout(220);
  await p.locator('.slide.active').screenshot({ path: path.join(OUT, tag + '_' + String(s).padStart(2, '0') + '.png') });
}
await b.close();
