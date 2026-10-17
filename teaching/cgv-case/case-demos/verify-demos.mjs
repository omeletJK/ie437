import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { chromium } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = JSON.parse(await readFile(path.join(here, 'manifest.json'), 'utf8'));
const results = [], evidence = {};
const test = (deck, name, pass, detail = '') => { results.push({ deck, name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} | ${deck} | ${name}${detail ? ' | ' + JSON.stringify(detail) : ''}`); };
const sourceIds = s => [...s.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
const originalNotes = s => JSON.parse(s.match(/<script\b[^>]*id="notes"[^>]*>([\s\S]*?)<\/script>/)?.[1] || '{}');
async function go(page, id) { await page.selectOption('#classDemoSelect', id); await page.waitForFunction(id => document.querySelector('.slide.active')?.id === id, id); }
const text = (page, selector) => page.locator(selector).textContent();
const key = (page, k) => page.evaluate(k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })), k);
let executable;
for (const candidate of [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', chromium.executablePath()].filter(Boolean)) {
  try { await access(candidate, constants.X_OK); executable = candidate; break; } catch {}
}
const browser = await chromium.launch({ headless: true, executablePath: executable });
await mkdir(path.join(here, 'qa'), { recursive: true });
try {
  for (const demo of manifest.demos) {
    const file = path.join(here, demo.file), bytes = await readFile(file, 'utf8'), original = await readFile(path.resolve(here, demo.sourceRelativePath), 'utf8');
    test(demo.key, 'exact canonical and output checksums', sha(bytes) === demo.outputSHA256 && sha(original) === demo.sourceSHA256);
    test(demo.key, 'supporting slide IDs preserved', JSON.stringify(sourceIds(bytes)) === JSON.stringify(sourceIds(original)), sourceIds(bytes).length);
    test(demo.key, 'note keys and timing preserved', JSON.stringify(Object.entries(originalNotes(bytes)).map(([k, v]) => [k, v[0]])) === JSON.stringify(Object.entries(originalNotes(original)).map(([k, v]) => [k, v[0]])));
    test(demo.key, 'English-only anonymous source', !/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(bytes) && !/\b(?:CGV|Omelet|KAIST|Stanford|Shinhan|Hyundai|Pantos|IMAX|4DX|ScreenX)\b/i.test(bytes));
    test(demo.key, 'no external resource tags', !/<link\b|<script\b[^>]*\bsrc\s*=|<img\b|<iframe\b/i.test(bytes));
    for (const [i, m] of [...bytes.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].entries()) if (!/application\/json/.test(m[1])) new vm.Script(m[2], { filename: demo.file + `-script-${i}` });
    test(demo.key, 'inline scripts compile', true);
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } }), requests = [], errors = [];
    await context.route(/^https?:/, route => { requests.push(route.request().url()); return route.abort(); });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}.slide.active .rise{opacity:1!important;transform:none!important}' });
    test(demo.key, 'default demonstration loads', await page.locator('.slide.active').getAttribute('id') === demo.defaultHash.slice(1));
    await page.screenshot({ path: path.join(here, 'qa', demo.key + '-default.png') });
    for (const entry of demo.entries) await go(page, entry.hash.slice(1));
    test(demo.key, 'all demo selector entries open', true, demo.entries.length);
    if (demo.key === 'response') {
      await go(page, 's06');
      for (const [k, v] of [['t', '14'], ['s', '120'], ['f', '2']]) await page.locator(`#s06 [data-hb="${k}"] [data-v="${v}"]`).click();
      test(demo.key, 'response / cannibalization numerical setting', await text(page, '#hbAv') === '380' && await text(page, '#hbCv') === '−60' && await text(page, '#hbTv') === '3,720');
      await go(page, 's07'); await page.locator('#s07 [data-ha] [data-v="B"]').click();
      test(demo.key, 'potential-to-realized switch', (await text(page, '#haVal')).includes('0.90M'));
      await go(page, 's13');
      test(demo.key, 'ILS initial state', await text(page, '#s2Base') === '5,134' && await text(page, '#s2Best') === '5,134');
      await page.locator('#s2Speed').click(); await page.locator('#s2Play').click();
      await page.waitForFunction(() => document.querySelector('#s2Iter').textContent === '2,600', null, { timeout: 20000 });
      test(demo.key, 'executed deterministic ILS result', await text(page, '#s2Best') === '5,265' && await text(page, '#s2Delta') === '+2.6%' && await text(page, '#s2Calls') === '1,739' && await text(page, '#s2Viol') === '0');
      await page.screenshot({ path: path.join(here, 'qa', 'response-ils-complete.png') });
      await page.locator('#s2Reset').click(); test(demo.key, 'original ILS reset', await text(page, '#s2Best') === '5,134');
      await go(page, 's18'); await page.locator('#rlStep').click();
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      test(demo.key, 'rolling horizon result', await text(page, '#rlGap') === '+2.8%' && await text(page, '#rlChg') === '11');
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      await go(page, 's13');
    } else {
      await go(page, 's09a'); await page.locator('#s09aStep1').click(); await page.locator('#s09aFast').click();
      test(demo.key, '28-day four-path result', await text(page, '#s09aDay') === 'DAY 28' && await text(page, '#s09aEst') === '0.75 (3/4)');
      await page.screenshot({ path: path.join(here, 'qa', 'audience-paths-complete.png') });
      await go(page, 's10'); await page.locator('#s10 [data-hz] [data-v="t2w"]').click();
      test(demo.key, 'forecast evidence update', await text(page, '#hzVal') === '4.5M' && await text(page, '#hzRange') === '[4.1M, 4.9M]');
      await go(page, 's12'); await page.locator('#s12Users [data-u="2"]').click();
      test(demo.key, 'individual profile', await text(page, '#s12Prob') === '61%' && await text(page, '#s12vB') === '44%' && await text(page, '#s12vC') === '18%');
      await go(page, 's22'); await page.locator('#s22 [data-sc] [data-v="B"]').click();
      test(demo.key, 'same-audience A/B', await text(page, '#scAtt') === '34,180' && await page.locator('#scFlows .fr').count() === 4);
      await go(page, 's23'); await page.locator('#s23Play').click();
      await page.waitForFunction(() => document.querySelector('#s23Score').textContent.includes('5,265'), null, { timeout: 15000 });
      test(demo.key, 'prepared candidate animation', (await text(page, '#s23PopEval')).includes('60,000'));
      await go(page, 's09a');
    }
    const beforeReset = await page.locator('.slide.active').getAttribute('id');
    await page.locator('#classDemoReset').click(); await page.waitForLoadState('load');
    test(demo.key, 'classroom reload reset retains current demo', await page.locator('.slide.active').getAttribute('id') === beforeReset && (demo.key === 'response' ? await text(page, '#s2Best') === '5,134' : await text(page, '#s09aEst') === '—'));
    await page.locator('#hw1CaseOpen').click();
    for (const [preset, status, required] of [['normal', 'feasible', '4'], ['boundary', 'feasible', '6'], ['failure', 'infeasible', '7']]) {
      await page.locator(`[data-case="${preset}"]`).click();
      test(demo.key, `supplemental ${preset} fixture`, await page.locator('#hw1CaseResult').getAttribute('data-status') === status && await page.locator('#hw1CaseResult').getAttribute('data-capacity') === '6' && await page.locator('#hw1CaseResult').getAttribute('data-required') === required);
    }
    await page.screenshot({ path: path.join(here, 'qa', demo.key + '-failure-case.png') });
    for (const invalid of ['-1', '2.5', '', '9007199254740992']) {
      await page.locator('#hw1Screens').fill(invalid); test(demo.key, `reject invalid screens ${invalid || '(empty)'}`, await page.locator('#hw1CaseResult').getAttribute('data-status') === 'error');
    }
    await page.locator('#hw1Screens').fill('0'); await page.locator('#hw1Required').fill('0');
    test(demo.key, 'zero capacity / zero request boundary', await page.locator('#hw1CaseResult').getAttribute('data-status') === 'feasible' && await page.locator('#hw1CaseResult').getAttribute('data-capacity') === '0');
    await page.locator('#hw1Required').fill('1'); test(demo.key, 'zero capacity / positive request fails', await page.locator('#hw1CaseResult').getAttribute('data-status') === 'infeasible');
    await page.locator('#hw1Slots').fill('-2'); test(demo.key, 'invalid slots rejected', await page.locator('#hw1CaseResult').getAttribute('data-status') === 'error');
    await page.locator('#hw1Slots').fill('3'); await page.locator('#hw1Required').fill('1.5'); test(demo.key, 'invalid required count rejected', await page.locator('#hw1CaseResult').getAttribute('data-status') === 'error');
    const idBeforeDialogKey = await page.locator('.slide.active').getAttribute('id'); await page.locator('#hw1Screens').press('ArrowRight');
    test(demo.key, 'editing fixture does not advance source demo', await page.locator('.slide.active').getAttribute('id') === idBeforeDialogKey);
    await page.locator('#hw1CaseClose').click();
    const popupPending = page.waitForEvent('popup'); await key(page, 'n'); const popup = await popupPending; await popup.waitForLoadState();
    test(demo.key, 'English presenter console retained', await popup.locator('html').getAttribute('lang') === 'en' && !!await popup.locator('#pnote').textContent()); await popup.close();
    await key(page, 'a'); test(demo.key, 'original appendix menu retained', await page.locator('#amenu').evaluate(e => !e.hidden)); await key(page, 'Escape');
    const toolbarBounds = await page.locator('.class-demo-bar').boundingBox();
    test(demo.key, 'selector toolbar fits above source content', toolbarBounds.x >= 0 && toolbarBounds.x + toolbarBounds.width <= 1280 && toolbarBounds.y + toolbarBounds.height < 50, toolbarBounds);
    test(demo.key, 'offline without network requests', requests.length === 0, requests);
    test(demo.key, 'no runtime errors', errors.length === 0, errors);
    evidence[demo.key] = { file: demo.file, sourceSHA256: demo.sourceSHA256, outputSHA256: demo.outputSHA256, networkRequests: requests, runtimeErrors: errors, toolbarBounds };
    await context.close();
  }
} catch (error) { test('harness', 'completed', false, String(error.stack || error)); }
finally { await browser.close(); }
const summary = { pass: results.filter(r => r.pass).length, fail: results.filter(r => !r.pass).length };
await writeFile(path.join(here, 'qa', 'verification.json'), JSON.stringify({ timestamp: new Date().toISOString(), summary, results, evidence }, null, 2) + '\n');
console.log(`SUMMARY | pass=${summary.pass} fail=${summary.fail}`); process.exitCode = summary.fail ? 1 : 0;
