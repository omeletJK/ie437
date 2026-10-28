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
// Lectures 5–6 follow the 2026-10-11 rewrite: the problem, then research streams with their representative papers.
for(const h of ['COMs — what we want','The loss, term by term','NEMO — uncertainty as','Structure — count'])core('ch05',h);
for(const h of ['Backup — one COMs loss','Backup — RoMA','What the benchmark says'])advanced('ch05',h);
order('ch05',['Offline model-based','COMs — what we want','Uncertainty is Lecture 4','Knowledge, ordered','Appendix —']);
order('ch06',['Comparing two distributions','VAE — encode','Diffusion — learn the noise','CbAS — fit','G3 — ask','Classifier-free guidance','A KL-regularised view','How the KL view','G4 — use performance','Diffusion Policy —','Appendix —']);
core('ch06','A conditional diffusion model');core('ch06','What the guidance strength');
for(const h of ['Backup — one VAE calculation','DDOM and BootGen — the reported','BootGen — generated','Backup — GFlowNet','Backup — BootGen'])advanced('ch06',h);
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
// Ch 6 flow-balance widget: GFlowNet's P(x) = R(x)/Z on designs built in steps (AB has two building orders).
{const R={AA:1,AB:2,BB:1},orders=[['A','AA'],['A','AB'],['B','AB'],['B','BB']],F={'A>AA':1,'A>AB':1,'B>AB':1,'B>BB':1};
 F['s>A']=F['A>AA']+F['A>AB'];F['s>B']=F['B>AB']+F['B>BB'];const Z=F['s>A']+F['s>B'];
 near('GFlowNet total flow equals total reward',Z,R.AA+R.AB+R.BB);
 const out=n=>Object.entries(F).filter(([k])=>k.startsWith(n+'>')).reduce((t,[,f])=>t+f,0),pi=(a,b)=>F[a+'>'+b]/out(a);
 const byFlow=d=>orders.filter(o=>o[1]===d).reduce((t,o)=>t+pi('s',o[0])*pi(o[0],d),0);
 for(const d of ['AA','AB','BB'])near('GFlowNet balanced flows draw '+d+' at R/Z',byFlow(d),R[d]/Z);
 const orderTotal=orders.reduce((t,o)=>t+R[o[1]],0);
 near('Weighting each building order by R over-draws AB',orders.filter(o=>o[1]==='AB').reduce((t,o)=>t+R.AB,0)/orderTotal,2/3);}
// Ch 6 cfg-guide widget: the denoiser's guesses at x_t are exact for a two-group mixture (Tweedie: x_t + tau^2 * score).
{const MO=[-0.8,0],SO=.65,MH=[.9,.25],SH=.55,PH=.35,X=[-.05,1.45],T=.95;
 const g=(m,v)=>Math.exp(-((X[0]-m[0])**2+(X[1]-m[1])**2)/(2*v))/(2*Math.PI*v);
 const vo=SO*SO+T*T,vh=SH*SH+T*T,a=(1-PH)*g(MO,vo),b=PH*g(MH,vh),r=b/(a+b);
 const U=[0,1].map(k=>X[k]+T*T*((1-r)*(MO[k]-X[k])/vo+r*(MH[k]-X[k])/vh)),C=[0,1].map(k=>X[k]+T*T*(MH[k]-X[k])/vh);
 near('CFG guess without y, x1',U[0],-.10,.005);near('CFG guess with y, x1',C[0],.66,.005);
 near('CFG guided guess (w=2) equals the guided noise prediction mapped to a guess, x1',C[0]+2*(C[0]-U[0]),2.18,.005);}
// BootGen rank weights: best over worst is (k|D|+|D|-1)/(k|D|), about 1+1/k.
{const k=.01,n=1000,w=r=>1/(k*n+r);near('BootGen best-to-worst rank weight ratio',w(0)/w(n-1),(k*n+n-1)/(k*n));}
console.log(JSON.stringify({decks:decks.size,numericalChecks:checks.length,checks},null,2));
console.log('PASS: reading guides, main/advanced placement, prerequisite order and new numerical examples.');
