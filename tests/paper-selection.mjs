// Run from repository root. Guard course prerequisites and recompute the new teaching examples.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const files=fs.readdirSync('md').filter(f=>/^ch\d+.*\.md$/.test(f)).sort();
const decks=new Map(files.map(f=>[f.slice(0,4),{file:f,text:fs.readFileSync('md/'+f,'utf8')}]));
for(const d of decks.values())d.headings=[...d.text.matchAll(/^#{2,3} (.+)$/gm)].map(m=>m[1]);
assert.equal(decks.size,14);
for(const d of decks.values()){
 assert.equal(d.headings.filter(h=>h.startsWith('Reading guide — ')).length,1,d.file);
 assert.equal((d.text.match(/^::: quiz /gm)||[]).length,4,d.file);
}
const position=(ch,prefix)=>{
 const d=decks.get(ch),hits=d.headings.map((h,i)=>h.startsWith(prefix)?i:-1).filter(i=>i>=0);
 assert.equal(hits.length,1,ch+': '+prefix);return hits[0];
};
const core=(ch,prefix)=>assert.ok(position(ch,prefix)<position(ch,'Appendix —'),ch+': required main lesson '+prefix);
const advanced=(ch,prefix)=>assert.ok(position(ch,prefix)>position(ch,'Appendix —'),ch+': expected advanced lesson '+prefix);
const order=(ch,prefixes)=>{
 const ps=prefixes.map(h=>position(ch,h));assert.ok(ps.every((n,i)=>!i||n>ps[i-1]),ch+': prerequisite order');
};
for(const h of ['COMs — train','The loss, term by term','One COMs loss'])core('ch05',h);
for(const h of ['NEMO — how','RoMA — flatten','What the benchmark says'])advanced('ch05',h);
order('ch06',['The evidence is intractable','DDPM training','CbAS — fit','Diffusion Policy —']);
for(const h of ['The 2023 descendants','DDOM — reweight','BootGen — generated'])advanced('ch06',h);
order('ch08',['Double DQN —','What comes after DQN']);
order('ch10',['A deterministic actor explores','TD3 — keep','Calculate a TD3 target','SAC — reward','SAC in the learning loop','PPO and SAC —','Appendix —']);
order('ch11',['Dyna — the same update','MBPO — branch','Dreamer — learn','What imagination teaches','From Dreamer to DreamerV3','Appendix —']);
for(const h of ['Guided policy search — solve','What makes it work —','The teacher that watches'])advanced('ch11',h);
order('ch12',['TD3+BC —','Three ways to say','Fence the value','IQL —','One offline problem','Off-policy evaluation —']);
const checks=[];
function near(name,actual,expected,tol=1e-9){assert.ok(Math.abs(actual-expected)<tol,`${name}: ${actual} != ${expected}`);checks.push({name,actual,expected});}
// Distances from coordinates, independently of the displayed simplified expressions.
const cities=[[0,0],[1,0],[1,1],[0,1]];
const tour=ids=>{assert.equal(new Set(ids.slice(0,-1)).size,4);assert.equal(ids.at(0),ids.at(-1));return ids.slice(1).reduce((s,id,i)=>s+Math.hypot(...cities[id].map((x,k)=>x-cities[ids[i]][k])),0);};
near('Square perimeter',tour([0,1,2,3,0]),4);
near('Crossing square tour',tour([0,2,1,3,0]),2+2*Math.SQRT2);
// Check the solution using candidate objective values and finite differences away from the kink.
const qp=c=>Math.max(0,c),eps=1e-5;
for(const c of [-1,2]){
 const z=qp(c);assert.ok(z>=0);
 for(const candidate of [0,.1,1,2,2.1,3])assert.ok((z-c)**2<=(candidate-c)**2+1e-12);
 near('QP sensitivity at '+c,(qp(c+eps)-qp(c-eps))/(2*eps),c>0?1:0);
}
const loss=c=>.5*(qp(c)-3)**2;
near('Decision-loss gradient',(loss(2+eps)-loss(2-eps))/(2*eps),-1);
near('Decision loss after update',loss(2.1),.405);
const online=[8,7],target=[4,6],selected=online.indexOf(Math.max(...online));
near('DQN target',1+.9*Math.max(...target),6.4);
near('Double DQN target',1+.9*target[selected],4.6);
// Numerical quadrature independently checks the continuous-time cost integral.
const dt=.0001,N=200000;let cost=0;
for(let i=0;i<N;i++){const x=2*Math.exp(-(i+.5)*dt),u=-x;cost+=(x*x+u*u)*dt;}
near('Stabilizing scalar LQR total cost',cost,4,1e-7);
const clip=(x,a,b)=>Math.min(b,Math.max(a,x));
near('TD3 smoothed action',clip(.5+clip(.3,-.1,.1),-1,1),.6);
near('TD3 twin-critic target',1+.9*Math.min(8,6),6.4);
near('TD3 terminal target',1+.9*(1-1)*Math.min(8,6),1);
near('Single-critic target for comparison',1+.9*8,8.2);
const entropy=ps=>-ps.filter(p=>p>0).reduce((s,p)=>s+p*Math.log(p),0);
near('Deterministic entropy',entropy([1,0]),0);
near('Mixture reward plus entropy',.5*2+.5*1.8+.5*entropy([.5,.5]),2.2465735902799726);
near('Two-step imagined return',[2,1,4].reduce((s,r,i)=>s+.9**i*r,0),6.14);
console.log(JSON.stringify({decks:decks.size,numericalChecks:checks.length,checks},null,2));
console.log('PASS: reading guides, main/advanced placement, prerequisite order and new numerical examples.');
