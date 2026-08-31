#!/usr/bin/env node
/* Download the latin subsets of the display faces into deck/fonts/, so a
   published deck — and the landing page — needs no network at all. Run once.

     deck faces  -> deck/fonts/fonts.css     (inlined into every chapter)
     site face   -> deck/fonts/display.css   (inlined into html/index.html only)

   They are kept apart on purpose: Space Grotesk is the landing page's display
   face and no deck uses it, so it must not ride along in fourteen chapters. */
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const OUT = 'deck/fonts';
fs.mkdirSync(OUT, { recursive: true });

const SETS = [
  { css: 'fonts.css', url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,300;1,400&display=swap' },
  { css: 'display.css', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap' }
];

for (const set of SETS) {
  const css = await (await fetch(set.url, { headers: { 'User-Agent': UA } })).text();
  /* keep only the blocks whose unicode-range covers basic latin */
  const blocks = css.split('@font-face').slice(1).map(b => '@font-face' + b.split('}')[0] + '}');
  let out = '', n = 0, bytes = 0;
  for (const b of blocks) {
    const ur = (b.match(/unicode-range:\s*([^;]+);/) || [, ''])[1];
    if (!/U\+0000-00FF/.test(ur)) continue;               // latin only
    const m = b.match(/url\((https:[^)]+\.woff2)\)/);
    if (!m) continue;
    const fam = (b.match(/font-family:\s*'([^']+)'/) || [, 'x'])[1].replace(/\s+/g, '');
    const wt = (b.match(/font-weight:\s*(\d+)/) || [, '400'])[1];
    const st = /font-style:\s*italic/.test(b) ? 'i' : 'n';
    const file = `${fam}-${wt}${st}.woff2`;
    const buf = Buffer.from(await (await fetch(m[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
    fs.writeFileSync(path.join(OUT, file), buf);
    bytes += buf.length; n++;
    out += b.replace(m[0], `url(fonts/${file})`).replace(/unicode-range:[^;]+;/, '') + '\n';
  }
  if (!n) throw new Error('vendored nothing into ' + set.css + ' — the Google Fonts response changed shape');
  fs.writeFileSync(path.join(OUT, set.css), out);
  console.log(`vendored ${n} faces, ${(bytes / 1024).toFixed(0)} KB -> ${OUT}/${set.css}`);
}
