// Build first: node build.mjs ch02 --no-pdf
// Run: node tests/ch02-labs.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch();
try {
const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.IE437_CH02_URL || new URL('../html/ch02_bayesian_statistics.html',import.meta.url).href;
await page.goto(url+'#1');await page.evaluate(()=>document.fonts.ready);
const titles=await page.locator('.slide').evaluateAll(es=>es.map(e=>e.querySelector('h1,h2')?.textContent));
assert.equal(await page.locator('.fill p').filter({hasText:/^\{(?:layout|sub|math|q):/}).count(),0);
async function show(n){
 await page.goto(url+'#'+n);await page.waitForSelector('.slide.active[data-i="'+(n-1)+'"]');
 const steps=await page.locator('.slide.active .frag').evaluateAll(es=>new Set(es.map(e=>e.dataset.frag)).size);
 for(let j=0;j<steps;j++)await page.keyboard.press('ArrowRight');
 await page.evaluate(()=>document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish();}));
}
const results={};
const labs=await page.locator('[data-widget="ch02-experiments"]').evaluateAll(es=>es.map(e=>({mode:JSON.parse(e.dataset.opts).mode,n:Number(e.closest('.slide').dataset.i)+1})));
for(const lab of labs){
 await show(lab.n);
 const host=page.locator('.slide.active [data-widget="ch02-experiments"]');
 const read=()=>host.evaluate(e=>JSON.parse(e.dataset.result));
 async function set(label,v){await host.getByLabel(label,{exact:true}).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},v);}
 results[lab.mode]={default:await read()};
 if(lab.mode==='sampling'){
  for(const si of [0,1,2]){await set('tosses per experiment',si);const d=await read();assert.equal(d.estimates.length,200);assert.ok(Math.abs(d.mean-.6)<.06);assert.ok(Math.abs(d.empiricalVariance/d.theoreticalVariance-1)<.35);}
  const before=await read();await host.getByRole('button',{name:'Repeat 200',exact:true}).click();assert.notDeepEqual((await read()).estimates,before.estimates);
 }else if(lab.mode==='poisson'){
  for(const n of [0,1,20]){await set('districts observed',n);const d=await read();assert.equal(d.sum,d.counts.reduce((s,v)=>s+v,0));assert.equal(d.a,d.a0+d.sum);assert.equal(d.b,d.b0+n);if(n===0)assert.equal(d.mean,20);if(n===20){assert.equal(d.sum,211);assert.ok(Math.abs(d.mean-215/20.2)<1e-10);}}
  for(let j=0;j<3;j++){await host.locator('button').click();const d=await read();assert.equal(d.sum,211);assert.equal(d.a0/d.b0,20);}
 }else if(lab.mode==='normal'){
  for(const n of [1,4,40]){await set('readings n',n);for(let j=0;j<3;j++){for(let k=0;k<3;k++){const d=await read();assert.ok(d.mean>20&&d.mean<23);assert.ok(d.variance<d.priorSd**2);assert.ok(Math.abs(d.variance*(d.priorPrecision+d.dataPrecision)-1)<1e-12);await host.getByRole('button',{name:/prior SD/}).click();}await host.getByRole('button',{name:/noise SD/}).click();}}
 }else if(lab.mode==='categories'){
  const d=await read();assert.deepEqual(d.probabilities,[7/13,5/13,1/13]);
  await host.getByRole('button',{name:'+ Return',exact:true}).click();assert.deepEqual((await read()).counts,[6,4,1]);
  await host.getByRole('button',{name:'Clear',exact:true}).click();assert.deepEqual((await read()).probabilities,[1/3,1/3,1/3]);
  for(let j=0;j<3;j++){await host.getByRole('button',{name:/α each/}).click();assert.deepEqual((await read()).probabilities,[1/3,1/3,1/3]);}
 }else if(lab.mode==='residuals'){
  await host.getByRole('button',{name:'Fit least squares',exact:true}).click();const d=await read();assert.ok(Math.abs(d.sse-1/6)<1e-12);assert.ok(Math.abs(d.residuals.reduce((s,v)=>s+v,0))<1e-12);assert.ok(Math.abs(d.residuals.reduce((s,v,i)=>s+i*v,0))<1e-12);
 }else if(lab.mode==='regularisation'){
  results[lab.mode].states=[];
  for(let n=0;n<3;n++){
   for(let v=0;v<6;v++){
    await set('penalty λ',v);const d=await read();assert.ok(d.models.every(m=>Number.isFinite(m.train)&&Number.isFinite(m.validation)));d.models.slice(1).forEach((m,i)=>assert.ok(m.train>=d.models[i].train-1e-9));
    if(v===2)results[lab.mode].states.push(d);
   }
   await host.getByRole('button',{name:/^n =/}).click();
  }
  const d=await read();await host.getByRole('button',{name:'New training data',exact:true}).click();const e=await read();assert.notDeepEqual(e.training,d.training);assert.deepEqual(e.validation,d.validation);
 }
 const input=host.locator('input').first();if(await input.count()){await input.focus();await page.keyboard.press('Home');assert.ok(page.url().endsWith('#'+lab.n));await input.blur();}
 results[lab.mode].last=await read();
}
// Controlled HHT ties the updating experiment to the preceding calculation.
await show(titles.findIndex(t=>t?.includes('change the prior, keep the data'))+1);
const update=page.locator('.slide.active [data-widget="bayes-update"]');
await update.getByRole('button',{name:'Load HHT',exact:true}).click();
assert.equal(await update.getAttribute('data-alpha'),'4');assert.equal(await update.getAttribute('data-beta'),'3');
await update.getByRole('button',{name:'Record a head',exact:true}).click();assert.equal(await update.getAttribute('data-alpha'),'5');
await update.getByRole('button',{name:'Record a tail',exact:true}).click();assert.equal(await update.getAttribute('data-beta'),'4');
await update.locator('[data-prior]').click();assert.equal(await update.getAttribute('data-heads'),'3');
await page.evaluate(async()=>{await window.__deckPrintReady();});
const mathErrors=await page.locator('.katex-error').count();
assert.equal(mathErrors,0);assert.deepEqual(errors,[]);
console.log('Lecture 2: all six experiment models, HHT controls and keyboard navigation passed.');
}finally{await browser.close();}
