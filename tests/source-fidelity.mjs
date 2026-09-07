// Run from the repository root: node tests/source-fidelity.mjs
// Validates the auditable source map and independently recomputes worked examples.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const map=JSON.parse(fs.readFileSync('md/_source/source_fidelity_map.json','utf8'));
let pages=0,blocks=0,links=0;
for(const source of map.sources){
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source.path)).digest('hex'),source.sha256,source.path+': source changed; re-audit');
 let next=1;
 for(const block of source.blocks){
  assert.equal(block.pages[0],next,source.path+': gap or overlap');
  assert.ok(block.pages[1]>=next);next=block.pages[1]+1;blocks++;
  assert.ok(block.note&&block.treatment&&block.targets.length);
  for(const t of block.targets){
   const headings=[...fs.readFileSync('md/'+t.deck+'.md','utf8').matchAll(/^#{2,3} (.+)$/gm)].map(m=>m[1]);
   assert.equal(headings[t.slide_at_review-1],t.heading,t.deck+': slide moved; update map');links++;
  }
 }
 assert.equal(next,source.pages+1);pages+=source.pages;
}
assert.equal(map.source_pdf_count,map.sources.length);
assert.equal(map.source_pdf_pages,pages);
for(const source of map.supplemental_sources)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source.path)).digest('hex'),source.sha256,source.path);
const checks=[];
const near=(name,actual,expected,tol=1e-10)=>{assert.ok(Math.abs(actual-expected)<tol,`${name}: ${actual} != ${expected}`);checks.push({name,actual,expected});};
const norm=xs=>xs.map(x=>x/xs.reduce((s,v)=>s+v,0));
near('Naive Bayes posterior',norm([.4*.8*.5,.6*.2*.5])[0],8/11);
near('BN alarm row: Beta posterior', (8+1)/(10+2),.75);
near('BN healthy row: Beta posterior',(18+1)/(90+2),19/92);
const states=['A','A','B','A','B','B'];const counts=[[0,0],[0,0]];
for(let i=0;i<states.length-1;i++)counts[states[i+1]==='A'?0:1][states[i]==='A'?0:1]++;
near('Transition fit A to A',counts[0][0]/(counts[0][0]+counts[1][0]),1/3);
near('Transition fit B to A',counts[0][1]/(counts[0][1]+counts[1][1]),.5);
near('Stationary mass of A',.9*(2/3)+.2*(1/3),2/3);
const priorMean=10,priorVar=4,measurement=12,noiseVar=1;
const gain=priorVar/(priorVar+noiseVar);
near('Kalman gain',gain,.8);near('Kalman posterior mean',priorMean+gain*(measurement-priorMean),11.6);near('Kalman posterior variance',(1-gain)*priorVar,.8);
near('Constrained EI: candidate A',2*.2,.4);near('Constrained EI: candidate B',1*.9,.9);
// Exact unit-cell area, independent of the diagram's rectangle arithmetic.
const hv=pts=>{let area=0;for(let x=0;x<3;x++)for(let y=0;y<3;y++)if(pts.some(([a,b])=>a>=x+1&&b>=y+1))area++;return area;};
near('Pareto hypervolume',hv([[3,1],[1,3]]),5);near('Added hypervolume',hv([[3,1],[1,3],[2,2]])-hv([[3,1],[1,3]]),1);
near('DDPM noisy sample',Math.sqrt(.64)*2+Math.sqrt(1-.64)*1,2.2);near('DDPM noise-prediction loss',(1-.5)**2,.25);
const rewards=[1,2,3];const returns=rewards.map((_,i)=>rewards.slice(i).reduce((a,b)=>a+b,0));
near('First-visit MC return',returns[0],6);near('Every-visit MC mean',(returns[0]+returns[2])/2,4.5);
const td=(old,reward,next)=>old+.5*(reward+.8*next-old);
near('Room B to terminal F, first update',td(0,100,0),50);near('Room D to B',td(0,0,50),20);near('Room B to terminal F, second update',td(50,100,0),75);
near('Terminal room fixed point',100+.8*0,100);near('Continuing rewarded room fixed point',100/(1-.8),500);
near('E of nonlinear dynamics',(.5*(-1)**2+.5*1**2),1);near('Dynamics of expected state',(.5*(-1)+.5*1)**2,0);
near('Epsilon-soft greedy probability',1-.2+.2/4,.85);
console.log(JSON.stringify({sourcePDFs:map.sources.length,pages,topicBlocks:blocks,slideReferences:links,numericalChecks:checks.length,checks},null,2));
console.log('PASS: source hashes, complete nonoverlapping page inventory, current target headings and numerical examples.');
