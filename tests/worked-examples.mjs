// Public package integrity and publisher-boundary checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {publishWorkedExamples} from '../worked-examples.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
execFileSync(process.execPath,['site.mjs'],{cwd:root,stdio:'pipe'});
const published=publishWorkedExamples(root);assert.equal(published.length,1);
const item=published[0],out=path.join(root,'html/worked-examples',item.id),zip=path.join(out,item.archive.name);
const names=execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim().split('\n');
assert.deepEqual(names.sort(),item.files.map(f=>f.name).sort());
assert.ok(!names.some(n=>/instructor|grading-guide|preparation-notes|qa\/|node_modules|src\//i.test(n)));
for(const name of names)assert.deepEqual(execFileSync('unzip',['-p',zip,name]),fs.readFileSync(path.join(root,'teaching',item.id,'student',name)));
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
assert.ok(Array.isArray(manifest.files),'Manifest must list every public file except itself');
assert.deepEqual(manifest.files.map(file=>file.file).sort(),names.filter(name=>name!=='manifest.json').sort(),'Manifest file coverage must exactly match the published allowlist');
for(const file of manifest.files){const data=fs.readFileSync(path.join(out,file.file));assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256);assert.equal(data.length,file.bytes);}
for(const name of names.filter(n=>n.endsWith('.html'))){
 const source=fs.readFileSync(path.join(out,name),'utf8');
 assert.doesNotMatch(source,/\b(?:CGV|Omelet|Jinkyoo|Changhyun|Seounghoon|Youngseok|Kyuree)\b/i,'Identifying name in '+name);
 assert.doesNotMatch(source,/\/Users\/|127\.0\.0\.1|localhost/,'Host-specific dependency in '+name);
 for(const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const href=match[1];if(/^(?:https?:|data:|blob:|#|mailto:)/.test(href))continue;
  assert.ok(!href.startsWith('/'),'Absolute site path in '+name+': '+href);
  const target=path.resolve(path.dirname(path.join(out,name)),href.split('#')[0]);assert.ok(target.startsWith(out+path.sep)||target===zip);assert.ok(fs.existsSync(target),'Broken relative link '+name+' → '+href);
 }
}
const landing=fs.readFileSync(path.join(root,'html/index.html'),'utf8');assert.ok(landing.includes(item.startURL));assert.ok(landing.includes(item.archive.url));
for(const [folder,sections] of [['response',44],['audience',59]]){
 const proposal=fs.readFileSync(path.join(out,folder,'proposal.html'),'utf8');
 assert.equal([...proposal.matchAll(/<section\b/g)].length,sections,'Original presentation sections must be retained');
 assert.equal(proposal,fs.readFileSync(path.join(out,folder,'extended-proposal.html'),'utf8'),'Primary proposal must use the preserved original design');
 assert.match(proposal,/href="\.\.\/index\.html"/,'Proposal needs a package-home link');
}
const hub=fs.readFileSync(path.join(out,'index.html'),'utf8');
assert.deepEqual(names.filter(name=>name.endsWith('/demo.html')).sort(),['audience/demo.html','response/demo.html'],'Exactly one demo site per case must be shared');
assert.ok(!names.some(name=>name.startsWith('advanced/')),'Older demo versions must stay outside the public package');
assert.doesNotMatch(hub,/Additional demos|advanced\//,'Hub must expose only the two selected demo sites');
assert.match(hub,/Response Model Simulator/,'Case A must describe its independent response simulator');
assert.doesNotMatch(hub,/Schedule Studio/,'Case A must not be mapped to the individual audience app');
const responseDemo=fs.readFileSync(path.join(out,'response/demo.html'),'utf8');
assert.match(responseDemo,/var SIM2=/,'Case A must retain its original aggregate response engine');
assert.doesNotMatch(responseDemo,/new Worker\(|atob\("[A-Za-z0-9+/=]+"\)/,'Case A must not embed the individual-audience Worker');
assert.match(responseDemo,/Response workflow steps/,'Case A needs a gated operator workflow');
for(const id of ['planningFile','loadSample','settingOpen','settingClose','settingClean','settingIterations','settingSeed','workflowNext','reviewReference','runProgress','exportTimetable'])assert.match(responseDemo,new RegExp('id="'+id+'"'),'Operator workflow control '+id+' is required');
for(const page of [1,2,3,4])assert.match(responseDemo,new RegExp('data-page="'+page+'"'),'Operator stage '+page+' is required');
for(const file of ['response/CinemaPlanning.json','response/Screenings.csv'])assert.ok(names.includes(file),'Shareable planning file '+file+' is required');
assert.match(responseDemo,/inspectDataset:inspectDataset,loadDataset:loadDataset/,'Uploaded planning files must feed the calculation engine');
for(const id of ['swapFirst','swapSecond','swapDelay','swapApply','editBefore','editAfter','editRows','factorRows','compareOriginal','compareApplied','compareBest','searchBefore','searchAfter'])assert.match(responseDemo,new RegExp('id="'+id+'"'),'Case A needs timetable and response comparison controls');
assert.match(responseDemo,/<details class="constraint-check">/,'The scalar delay test must be auxiliary and collapsed initially');
assert.doesNotMatch(responseDemo,/<details class="constraint-check"[^>]*\bopen\b/,'Constraint checks must not replace the primary experiment');
assert.match(responseDemo,/comparison:comparison\(\)/,'Export must contain original, applied and searched timetables');
const responseRecord=JSON.parse(fs.readFileSync(path.join(out,'response/verification.json'),'utf8'));
assert.equal(responseRecord.currentBuild.demoSHA256,createHash('sha256').update(responseDemo).digest('hex'),'Response verification must refer to the delivered simulator bytes');
const audienceDemo=fs.readFileSync(path.join(out,'audience/demo.html'),'utf8');
assert.match(audienceDemo,/<title>IE437 · Movie-First Audience Simulator · M0<\/title>/,'Case B must remain the selected movie-first M0 app');
assert.match(audienceDemo,/new Worker\(/,'Case B must retain its individual-audience computation Worker');
assert.notEqual(responseDemo,audienceDemo,'Each case must expose its own evaluator');
for(const folder of ['response','audience']){
 const demo=fs.readFileSync(path.join(out,folder,'demo.html'),'utf8');
 assert.match(demo,/<html lang="en">/);
 const readable=demo.replace(/\\u\{([\da-f]+)\}|\\u([\da-f]{4})/gi,(_,long,short)=>String.fromCodePoint(parseInt(long??short,16)));
 assert.doesNotMatch(readable,/[가-힣]/,'English app UI contains untranslated text');
 for(const match of demo.matchAll(/atob\("([A-Za-z0-9+/=]+)"\)/g)){
  const worker=Buffer.from(match[1],'base64').toString('utf8').replace(/\\u\{([\da-f]+)\}|\\u([\da-f]{4})/gi,(_,long,short)=>String.fromCodePoint(parseInt(long??short,16)));
  assert.doesNotMatch(worker,/[가-힣]/,'English Worker contains untranslated progress or error text');
 }
 assert.ok(names.includes(folder+'/demo-guide.html')&&names.includes(folder+'/demo-guide.md'),'Each selected demo needs a shareable English guide');
}
assert.match(hub,/class="assignment-list"/,'Hub must use the course assignment-list layout');
assert.match(hub,/font-family:\s*'Space Grotesk'/,'Hub must embed the course display font');
assert.doesNotMatch(hub,/url\(fonts\//,'Portal fonts must be self-contained');
const first=fs.readFileSync(zip);publishWorkedExamples(root);assert.deepEqual(fs.readFileSync(zip),first);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ie437-worked-example-'));
const src=path.join(temp,'teaching/task-one/student'),catalog=path.join(temp,'md/_WORKED_EXAMPLES.md');fs.mkdirSync(src,{recursive:true});fs.mkdirSync(path.dirname(catalog),{recursive:true});fs.mkdirSync(path.join(temp,'teaching/task-one/instructor'));fs.writeFileSync(path.join(temp,'teaching/task-one/instructor/private.md'),'PRIVATE SENTINEL');fs.writeFileSync(path.join(src,'index.html'),'<h1>Public</h1>');fs.writeFileSync(path.join(src,'unlisted.md'),'UNLISTED');
const config=(file='index.html')=>`---\nworked_examples:\n  - id: task-one\n    assignment: 1\n    title: Example\n    summary: Public example.\n    version: '1'\n    entry: ${file}\n    files:\n      - ${file}\n---\n`;
try{
 fs.writeFileSync(catalog,config());assert.equal(publishWorkedExamples(temp)[0].files.length,1);assert.deepEqual(fs.readdirSync(path.join(temp,'html/worked-examples/task-one')).sort(),['IE437-Assignment-01-Worked-Examples-EN.zip','index.html']);
 fs.writeFileSync(catalog,config('../instructor/private.md'));assert.throws(()=>publishWorkedExamples(temp),/file name/i);
 fs.symlinkSync('../instructor/private.md',path.join(src,'leak.html'));fs.writeFileSync(catalog,config('leak.html'));assert.throws(()=>publishWorkedExamples(temp),/symlink|regular/i);
 fs.writeFileSync(catalog,config('missing.html'));assert.throws(()=>publishWorkedExamples(temp),/ENOENT/);
 fs.writeFileSync(catalog,'---\nworked_examples: []\n---\n');assert.deepEqual(publishWorkedExamples(temp),[]);assert.deepEqual(fs.readdirSync(path.join(temp,'html/worked-examples')),[]);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log('PASS: public package/ZIP, checksum integrity, static HTML links, stable archive, landing links, allowlist and traversal/symlink/missing-file boundaries.');
