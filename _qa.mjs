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
// overflow audit across every slide
const over = await p.evaluate(() => {
  const bad = [];
  document.querySelectorAll('.slide').forEach((sl, i) => {
    const f = sl.querySelector('.fill'); if (!f) return;
    const kids = [...f.children].filter(k => k.offsetHeight > 0);
    const content = kids.reduce((a, k) => a + k.offsetHeight, 0);
    const cs = getComputedStyle(f);
    const avail = f.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const gaps = 14 * Math.max(0, kids.length - 1);
    if (content + gaps > avail + 2) bad.push({ i: i + 1, over: Math.round(content + gaps - avail) });
  });
  return bad;
});
console.log('page errors:', errs.length ? errs.join(' | ') : 'none');
console.log('overflowing slides:', over.length ? JSON.stringify(over) : 'none');
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
