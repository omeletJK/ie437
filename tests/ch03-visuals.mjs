// Preserve the original Lecture 3 artwork and its teaching sequence.
// Run from the repository root after editing the source/asset manifest.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync('md/_source/ch03_visual_restoration.json','utf8'));
const text=fs.readFileSync('md/ch03_bayesian_network.md','utf8');
const matches=[...text.matchAll(/^#{2,3} (.+)$/gm)];
const blocks=matches.map((m,i)=>text.slice(m.index,matches[i+1]?.index??text.length));
assert.equal(hash(manifest.source.path),manifest.source.sha256,'Original PDF changed: re-audit figures.');
assert.equal(matches.length,manifest.slides_after);
assert.equal(matches.findIndex(m=>m[1].startsWith('Appendix'))+1,manifest.appendix_start);
assert.equal(manifest.assets.length,51);
assert.equal(new Set(manifest.assets.map(a=>a.asset)).size,51);
for(const a of manifest.assets){
 assert.equal(hash(a.asset),a.sha256,a.asset+': artwork changed; review source fidelity.');
 assert.ok(a.source_page>=1&&a.source_page<=94);
 const [x0,y0,x1,y1]=a.crop_points;
 assert.ok(x0>=0&&y0>=0&&x1<=960&&y1<=540&&x1>x0&&y1>y0);
 assert.ok(a.targets.length);
 for(const t of a.targets){
  assert.equal(matches[t.slide-1][1],t.heading);
  assert.ok(blocks[t.slide-1].includes(a.asset.split('/').at(-1).replace('.svg','')));
 }
 const svg=fs.readFileSync(a.asset,'utf8');
 assert.match(svg,/viewBox="0 0 /);
 assert.doesNotMatch(svg,/<script\b|<foreignObject\b|(?:xlink:)?href="https?:/);
}
const slide=id=>manifest.assets.find(a=>a.asset.endsWith('/original-'+id+'.svg')).targets[0].slide;
for(let i=2;i<=5;i++)assert.equal(slide('sample-'+i),slide('sample-1')+i-1);
assert.ok(slide('sample-5')<slide('rejection-samples'));
assert.ok(slide('rejection-samples')<slide('weighted-samples'));
assert.ok(slide('weighted-samples')<slide('rare-cause'));
assert.ok(slide('hmm-filtering')<slide('hmm-prediction'));
assert.ok(slide('hmm-prediction')<slide('hmm-smoothing'));
assert.ok(slide('decision-network')<slide('phd-network'));
assert.ok(slide('phd-network')<slide('startup-network'));
// Recompute quantities printed in the original restored panels.
const sequence=[1,3,2,4,1,4,3,5,1,3,4,2,1,4,4,2,4,5,1,3,3,4];
let departures=0,to3=0;
for(let i=0;i<sequence.length-1;i++)if(sequence[i]===1){departures++;if(sequence[i+1]===3)to3++;}
assert.equal(departures,5);assert.equal(to3,3);
const rows=[[1,1,1,0,0],[0,1,0,1,0],[1,0,1,1,1],[0,1,0,0,1],[0,1,1,1,1],[0,1,0,0,1],[0,0,0,1,0],[0,1,1,1,0],[0,1,0,1,1]];
const kept=rows.filter(r=>r[3]===1&&r[4]===1);
assert.equal(kept.length,3);assert.equal(kept.filter(r=>r[0]===1).length/kept.length,1/3);
assert.equal((.999*.001)/(.999*.001+.001*.999),.5);
assert.equal(-10*.1,-1);
console.log('PASS: 51 source artworks, crop/source hashes, slide references, sampling/HMM/decision order and original numerical examples.');
