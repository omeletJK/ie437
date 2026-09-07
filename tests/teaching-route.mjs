// Guard the undergraduate learning route and independently solve its common examples.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const map=JSON.parse(fs.readFileSync('md/_source/teaching_route_map.json','utf8'));
const decks=new Map();
for(const [name,r] of Object.entries(map.decks)){
 const text=fs.readFileSync(`md/${name}.md`,'utf8');
 const matches=[...text.matchAll(/^#{2,3} (.+)$/gm)];
 const hs=matches.map(m=>m[1]);const blocks=matches.map((m,i)=>text.slice(m.index,matches[i+1]?.index??text.length));
 decks.set(name.slice(0,4),{hs,blocks,text});
 assert.equal(hs.length,r.slides,name+': refresh route map');
 assert.equal(hs.findIndex(h=>h.startsWith('Appendix'))+1,r.appendix_start);
 assert.equal(hs.filter(h=>h.startsWith('Temperature thread —')).length,1);
 assert.equal(hs.filter(h=>h.startsWith('Try it —')).length,1);
 assert.equal(r.transfer_slide,r.worked_slide+1);
 assert.ok(r.transfer_slide<r.appendix_start);
 for(const n of [r.worked_slide,r.transfer_slide])assert.match(blocks[n-1],/^::: reveal$/m);
 assert.match(blocks[r.worked_slide-1],/\*\*Predict:\*\*/);
 assert.match(blocks[r.transfer_slide-1],/\*\*Check your answer\.\*\*/);
 assert.ok(hs.findIndex(h=>h.startsWith('Reading guide —'))>=r.appendix_start);
 assert.equal((text.match(/^::: quiz /gm)||[]).length,4);
 assert.deepEqual([...text.matchAll(/^::: widget ([\w-]+)/gm)].map(m=>m[1]).sort(),[...r.widgets].sort());
 if(r.first_topic_slide)assert.ok(r.first_topic_slide<=7,name+': opening has grown too long');
}
assert.equal(decks.size,14);
const pos=(ch,prefix)=>{const hits=decks.get(ch).hs.map((h,i)=>h.startsWith(prefix)?i:-1).filter(i=>i>=0);assert.equal(hits.length,1,ch+': '+prefix);return hits[0];};
const order=(ch,ps)=>{const ids=ps.map(p=>pos(ch,p));assert.ok(ids.every((x,i)=>!i||x>ids[i-1]),ch+': prerequisite order '+ps.join(' → '));};
order('ch01',['KKT setup','KKT conditions — formal','KKT optimality theorem','Certifying the production','Temperature thread','Why KKT certifies']);
order('ch03',['Act 3 — reasoning','Learning a model from data','Tracking a hidden state','Temperature thread','Act 4 — from belief']);
order('ch07',['Why the meeting point is unique','What the contraction bound','Check — what value iteration']);
order('ch08',['Why Q-learning','Temperature thread','Try it']);
order('ch09',['One-step control','Act 2 — compute','Act 3 — interpret','Act 4 —']);
order('ch11',['Act 2 — planning','Act 3 — learn','MBPO —','Act 4 — learn','Dreamer —','Appendix —','Treat the planner']);
const checks=[];
const near=(name,actual,expected,tol=1e-8)=>{assert.ok(Math.abs(actual-expected)<tol,`${name}: ${actual} != ${expected}`);checks.push({name,actual,expected});};
const c=(x,u,g=1)=>(x+g*u)**2+u*u;
for(const [u,value] of [[0,4],[1,2],[2,4]])near('Heater cost u='+u,c(-2,u),value);
// Exhaustive small grids independently recover the constrained solutions.
const gridMin=(fn,lo,hi,n=10000)=>{let best=lo;for(let i=1;i<=n;i++){const x=lo+(hi-lo)*i/n;if(fn(x)<fn(best))best=x;}return best;};
near('Unrestricted feasible command',gridMin(u=>c(-2,u),0,2),1);
near('Capped command',gridMin(u=>c(-2,u),0,.5),.5);
const e=1e-5,dc=u=>(c(-2,u+e)-c(-2,u-e))/(2*e);
near('Active upper-bound multiplier',-dc(.5),2);near('Capped cost',c(-2,.5),2.5);
// Numerical posterior integration, independent of the precision-update formula.
function posterior(variance){let z=0,m=0,m2=0;const dx=.002;for(let x=0;x<44;x+=dx){const w=Math.exp(-((x-20)**2)/8-(22-x)**2/(2*variance))*dx;z+=w;m+=w*x;m2+=w*x*x;}return [m/z,m2/z-(m/z)**2];}
for(const [v,mean,pv,predictive] of [[1,21.6,.8,1.8],[4,21,2,6]]){const [m,w]=posterior(v);near('Temperature posterior mean, sensor variance '+v,m,mean);near('Posterior variance '+v,w,pv);near('Predictive variance '+v,w+v,predictive);}
const predict=.6*.9+.4*.3;near('Predicted good heater mode',predict,.66);
near('Warm evidence posterior',.8*predict/(.8*predict+.2*(1-predict)),132/149);
near('Cool alternative posterior',.2*predict/(.2*predict+.8*(1-predict)),33/101);
const scores=[[-1.9,.1],[-2.2,.5]],ucb=k=>scores.map(([m,s])=>m+k*s);
assert.ok(ucb(1)[1]>ucb(1)[0]);assert.ok(ucb(0)[0]>ucb(0)[1]);near('Measured UCB candidate score',-c(-2,1.6),-2.72);
near('Surrogate predicted gain',-1-(-2.1),1.1);near('Real gain',-c(-2,2)+c(-2,1),-2);
assert.ok(-c(-2,1)+0>-c(-2,2)+1,'Largest error need not win');
const condition=p=>{const w=[p*.8,(1-p)*.2];return w[0]/(w[0]+w[1]);};
near('Conditional design probability, balanced prior',condition(.5),.8);near('Conditional design probability, shifted prior',condition(.2),.5);
const backup=(u,next,v)=>-(next*next+u*u)+.9*v;
const off=backup(0,-2,-3),heat=backup(1,-1,-1),failed=backup(1,-2,-3);
near('Off Bellman target',off,-6.7);near('Heat Bellman target',heat,-2.9);near('Weak heater expected target',.2*heat+.8*failed,-6.74);assert.ok(.2*heat+.8*failed<off);
near('Successful Q update',-4+.5*(heat+4),-3.45);near('Failed Q update',-4+.5*(failed+4),-5.85);
near('Feedback after measured disturbance',gridMin(u=>c(-1.5,u),0,2),.75);
const sigmoid=t=>1/(1+Math.exp(-t));const J=(t,shift=0)=>(1-sigmoid(t))*(off+shift)+sigmoid(t)*(heat+shift);
near('Policy gradient by finite differences',(J(e)-J(-e))/(2*e),.95);
near('Policy gradient after reward shift',(J(e,-100)-J(-e,-100))/(2*e),.95);
near('Baseline at equal probabilities',J(0),-4.8);
near('Refit weak-model optimum',gridMin(u=>c(-1.5,u,.5),0,2),.6);
near('Refit optimum cost',c(-1.5,.6,.5),1.8);
near('Importance-weighted one-step estimate',(.2/.5*-4+.8/.5*-2)/2,-2.4);
near('Logged behavior sample mean',(-4-2)/2,-3);
const supported=(target,behavior)=>target.every((p,i)=>p===0||behavior[i]>0);
assert.equal(supported([.2,.8],[.5,.5]),true);assert.equal(supported([.2,.8],[1,0]),false);
near('Total predictive variance',.8+1,1.8);near('Known temperature predictive variance',0+1,1);
console.log(JSON.stringify({decks:decks.size,numericalChecks:checks.length,checks},null,2));
console.log('PASS: main/appendix routes, prerequisite order, exercises, retained widgets and independent temperature calculations.');
