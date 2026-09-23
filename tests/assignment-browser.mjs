// npm run site first. Exercises real HTTP downloads under a GitHub Pages subpath.
// IE437_SITE_URL may point to the deployed site for the same checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'html');
let server;
let browser;
const downloads = fs.mkdtempSync(path.join(os.tmpdir(), 'ie437-downloads-'));
try {
  let url = process.env.IE437_SITE_URL;
  if (!url) {
    server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(output, pathname.replace(/^\/ie437\//, '') || 'index.html');
      if (!pathname.startsWith('/ie437/') || !file.startsWith(output + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end(); return;
      }
      const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.md') ? 'text/plain; charset=utf-8' : 'application/zip';
      res.writeHead(200, { 'Content-Type': type });
      res.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${server.address().port}/ie437/`;
  }
  browser = await chromium.launch();
  for (const [width, theme] of [[1280, 'light'], [390, 'light'], [320, 'light'], [390, 'dark']]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(url);
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const nav = page.locator('.tnav a[href="#assignments"]');
    assert.ok(await nav.isVisible(), 'Assignments navigation must remain visible on mobile');
    await nav.focus();
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash, '#assignments');
    const section = page.locator('#assignments');
    const top = await section.boundingBox();
    const header = await page.locator('.top').boundingBox();
    assert.ok(top.y >= header.height - 1 && top.y < 150, 'Anchor must place the section below the sticky header');
    const overflow = await page.locator('.top, #assignments').evaluateAll(roots => roots.flatMap(root => [...root.querySelectorAll('*')].filter(el => {
      if (!el.getClientRects().length) return false;
      const r = el.getBoundingClientRect();
      return r.left < -1 || r.right > innerWidth + 1;
    }).map(el => el.className)));
    assert.deepEqual(overflow, [], 'Assignment and navigation content must fit the viewport');
    const links = section.locator('a[download]');
    assert.ok(await links.count() >= 5);
    if (width === 1280) {
      for (const link of await links.all()) {
        const expected = await link.getAttribute('download');
        const href = await link.getAttribute('href');
        const event = page.waitForEvent('download');
        await link.click();
        const download = await event;
        assert.equal(download.suggestedFilename(), expected);
        const target = path.join(downloads, expected);
        await download.saveAs(target);
        assert.equal(await download.failure(), null);
        assert.deepEqual(fs.readFileSync(target), fs.readFileSync(path.join(output, href)), 'HTTP download must match the current build');
        if (expected.endsWith('.zip')) execFileSync('unzip', ['-t', target]);
      }
    }
    if (process.env.IE437_ASSIGNMENT_SCREENSHOTS) {
      fs.mkdirSync(process.env.IE437_ASSIGNMENT_SCREENSHOTS, { recursive: true });
      await section.screenshot({ path: path.join(process.env.IE437_ASSIGNMENT_SCREENSHOTS, `${width}-${theme}.png`) });
    }
    assert.deepEqual(errors, [], 'Landing page must have no JavaScript errors');
    await page.close();
  }
  console.log('PASS: desktop, 390px/320px mobile, dark mode, keyboard navigation, and every listed HTTP download.');
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  fs.rmSync(downloads, { recursive: true, force: true });
}
