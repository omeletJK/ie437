#!/usr/bin/env node
/* Download the latin subsets of the three display faces into deck/fonts/,
   so a published deck needs no network at all.  Run once. */
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const URL = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,300;1,400&display=swap';
const OUT = 'deck/fonts';
fs.mkdirSync(OUT, { recursive: true });

const css = await (await fetch(URL, { headers: { 'User-Agent': UA } })).text();

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
fs.writeFileSync(path.join(OUT, 'fonts.css'), out);
console.log(`vendored ${n} faces, ${(bytes / 1024).toFixed(0)} KB -> ${OUT}/`);
