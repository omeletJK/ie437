// Run real landing-page and assignment publishing builds. No instructor fixture may escape.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
execFileSync(process.execPath, ['site.mjs'], { cwd: root, stdio: 'pipe' });
const landing = fs.readFileSync(path.join(root, 'html/index.html'), 'utf8');
assert.ok(/<section[^>]+id="assignments"/.test(landing), 'Students need an assignment section on the built landing page');
const section = landing.match(/<section[^>]+id="assignments"[\s\S]*?<\/section>/)[0];
assert.match(landing, /href="#assignments"/, 'The section must be reachable from the landing page');
const links = [...section.matchAll(/href="([^"]+)"[^>]*download/g)].map(m => m[1]);
assert.ok(links.length >= 5, 'Assignment 1 must offer four documents and the ZIP');
for (const href of links) {
  assert.ok(!href.startsWith('/'), 'Downloads must work under the GitHub Pages repository prefix');
  assert.ok(fs.statSync(path.join(root, 'html', href)).isFile(), 'Missing download: ' + href);
}
const actualZip = path.join(root, 'html', links.find(h => h.endsWith('/IE437-Assignment-01.zip')));
const actualNames = execFileSync('unzip', ['-Z1', actualZip], { encoding: 'utf8' }).trim().split('\n');
assert.deepEqual(actualNames.sort(), ['assignment.md', 'problem-classification-reference.md', 'problem-definition-example.md', 'problem-definition-template.md']);
for (const name of actualNames) {
  assert.deepEqual(execFileSync('unzip', ['-p', actualZip, name]), fs.readFileSync(path.join(root, 'teaching/assignment-01-movie-programming/student', name)));
}
assert.doesNotMatch(section, /instructor|grading-guide|preparation-notes|\/Users\//);

const { publishAssignments } = await import('../assignments.mjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ie437-assignments-'));
const catalog = path.join(temp, 'md/_ASSIGNMENTS.md');
const source = path.join(temp, 'teaching/task-one/student');
const output = path.join(temp, 'html/assignments');
fs.mkdirSync(path.dirname(catalog), { recursive: true });
fs.mkdirSync(source, { recursive: true });
fs.mkdirSync(path.join(temp, 'teaching/task-one/instructor'));
fs.writeFileSync(path.join(temp, 'teaching/task-one/instructor/private.md'), 'PRIVATE-GRADING-SENTINEL');
fs.writeFileSync(path.join(source, 'extra.md'), 'UNLISTED-SENTINEL');
fs.writeFileSync(path.join(source, 'brief.md'), '# Public brief\nOriginal content.\n');
const config = (id = 'task-one', file = 'brief.md') => `---\nassignments:\n  - id: ${id}\n    number: 1\n    title: Public exercise\n    summary: A small exercise.\n    version: '2.0'\n    files:\n      - name: ${file}\n        label: Assignment brief\n---\n`;
fs.writeFileSync(catalog, config());
try {
  let items = publishAssignments(temp);
  assert.equal(items.length, 1);
  const entries = fs.readdirSync(path.join(output, 'task-one'));
  assert.deepEqual(entries.sort(), ['IE437-Assignment-01.zip', 'brief.md']);
  const zip = path.join(output, 'task-one/IE437-Assignment-01.zip');
  assert.equal(execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim(), 'brief.md');
  const first = fs.readFileSync(zip);
  publishAssignments(temp);
  assert.deepEqual(fs.readFileSync(zip), first, 'Unchanged sources must produce a byte-identical ZIP');
  fs.writeFileSync(path.join(source, 'brief.md'), '# Public brief\nChanged source, café and 한글.\n');
  publishAssignments(temp);
  assert.equal(execFileSync('unzip', ['-p', zip, 'brief.md'], { encoding: 'utf8' }), '# Public brief\nChanged source, café and 한글.\n');
  assert.notDeepEqual(fs.readFileSync(zip), first, 'ZIP must refresh when a document changes');
  const secondSource = path.join(temp, 'teaching/task-two/student');
  fs.mkdirSync(secondSource, { recursive: true });
  fs.writeFileSync(path.join(secondSource, 'brief.md'), '# Second assignment');
  const second = config('task-two').split('assignments:\n')[1].split('---')[0].replace('number: 1', 'number: 2');
  fs.writeFileSync(catalog, config().replace(/---\n$/, second + '---\n'));
  assert.equal(publishAssignments(temp).length, 2, 'The catalog must publish multiple assignments');
  assert.equal(execFileSync('unzip', ['-p', path.join(output, 'task-two/IE437-Assignment-02.zip'), 'brief.md'], { encoding: 'utf8' }), '# Second assignment');
  assert.equal(fs.readFileSync(path.join(output, 'task-one/brief.md'), 'utf8'), '# Public brief\nChanged source, café and 한글.\n', 'Assignments with the same document name must remain independent');
  fs.writeFileSync(catalog, config());
  publishAssignments(temp);
  assert.ok(!fs.existsSync(path.join(output, 'task-two')), 'A removed assignment must not leave files behind');
  fs.writeFileSync(catalog, config('../task-one'));
  assert.throws(() => publishAssignments(temp), /id/i, 'An assignment ID must not escape teaching/');
  fs.writeFileSync(catalog, config('task-one', '../instructor/private.md'));
  assert.throws(() => publishAssignments(temp), /file|name/i, 'Downloads must not escape student/');
  fs.symlinkSync('../instructor/private.md', path.join(source, 'leak.md'));
  fs.writeFileSync(catalog, config('task-one', 'leak.md'));
  assert.throws(() => publishAssignments(temp), /symlink|regular file/i, 'A symlink must not expose private material');
  fs.renameSync(source, source + '-saved');
  fs.symlinkSync(source + '-saved', source);
  fs.writeFileSync(catalog, config());
  assert.throws(() => publishAssignments(temp), /directory|symlink/i, 'Source directories must not redirect the public boundary');
  fs.unlinkSync(source);
  fs.renameSync(source + '-saved', source);
  fs.writeFileSync(catalog, config('task-one', 'missing.md'));
  assert.throws(() => publishAssignments(temp), /missing|ENOENT/i, 'A broken download must fail the build');
  fs.writeFileSync(catalog, '---\nassignments: []\n---\n');
  assert.deepEqual(publishAssignments(temp), []);
  assert.deepEqual(fs.readdirSync(output), [], 'Removing a listing must also remove its old public downloads');
  fs.rmSync(catalog);
  assert.deepEqual(publishAssignments(temp), [], 'A course without assignments can still build');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
console.log('PASS: landing downloads, ZIP contents and freshness, public allowlist, path boundaries, missing files, and removed listings.');
