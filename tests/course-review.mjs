// Build first: node build.mjs --all --no-pdf
// Optional: IE437_SITE_URL=https://omeletjk.github.io/ie437/ node tests/course-review.mjs
// Optional chapter filters: node tests/course-review.mjs ch10 ch11
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const root=new URL('../',import.meta.url);
const filters=process.argv.slice(2);
const files=fs.readdirSync(new URL('html/',root)).filter(f=>/^ch\d+.*\.html$/.test(f)&&(!filters.length||filters.some(c=>f.startsWith(c)))).sort();
assert.ok(files.length);
const browser=await chromium.launch();
const results=[];
function geometry(selector){
 return [...document.querySelectorAll(selector)].flatMap(sl=>{
  const box=sl.getBoundingClientRect(),foot=sl.querySelector('.foot')?.getBoundingClientRect();
  if(!box.height)return [];
  const lim=foot?.top??box.bottom;
  let minGap=Infinity,maxRight=0,maxLeft=0,who='';
  for(const el of sl.querySelectorAll('.fill *')){
   if(!el.getClientRects().length||el.closest('.katex-mathml')||el instanceof SVGElement)continue;
   const r=el.getBoundingClientRect();if(r.height<2||r.width<1)continue;
   if(lim-r.bottom<minGap){minGap=lim-r.bottom;who=String(el.className||el.tagName).slice(0,60);}
   // KaTeX internal struts and SVG plotting coordinates can deliberately extend.
   if(!el.closest('.katex')||el.classList.contains('katex')){
    maxRight=Math.max(maxRight,r.right-(box.right-24));maxLeft=Math.max(maxLeft,box.left+24-r.left);
   }
  }
  return minGap<6||maxRight>1||maxLeft>1?[{slide:+sl.dataset.i+1,title:sl.querySelector('h1,h2')?.textContent,gap:Math.round(minGap),right:Math.round(maxRight),left:Math.round(maxLeft),who}]:[];
 });
}
try{
 for(const file of files){
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  // Widget lifecycle errors are intentionally caught by the deck; surface them in QA.
  await page.addInitScript(()=>{
   let api;window.__widgetFailures=[];
   Object.defineProperty(window,'IE437',{configurable:true,get(){return api;},set(v){
    const register=v.widget;
    v.widget=function(id,factory){return register(id,function(host,opts){
     let w;try{w=factory(host,opts);}catch(e){window.__widgetFailures.push(id+': mount: '+e.message);throw e;}
     for(const key of ['finish','enter','leave','step','reset','auto'])if(typeof w?.[key]==='function'){
      const fn=w[key];w[key]=function(...args){try{return fn.apply(this,args);}catch(e){window.__widgetFailures.push(id+': '+key+': '+e.message);throw e;}};
     }
     return w;
    });};api=v;
   }});
  });
  const url=process.env.IE437_SITE_URL?new URL(file,process.env.IE437_SITE_URL).href:new URL('html/'+file,root).href;
  await page.goto(url);await page.evaluate(()=>document.fonts.ready);
  const n=await page.locator('.slide').count();const screen=[];let quizzes=0,widgets=0;
  for(let i=0;i<n;i++){
   await page.evaluate(n=>{location.hash='#'+n;},i+1);
   await page.waitForFunction(i=>document.querySelector('.slide.active')?.dataset.i===String(i),i);
   await page.evaluate(async()=>{
    document.querySelectorAll('.slide.active .frag').forEach(e=>e.classList.add('on'));
    document.getAnimations().forEach(a=>{if(a.effect.getTiming().iterations!==Infinity)a.finish();});
    await new Promise(requestAnimationFrame);
   });
   const q=page.locator('.slide.active .quiz');
   if(await q.count()){
    const a=+(await q.getAttribute('data-a'));assert.ok(a>=0&&a<4);
    await q.locator('.qopt').nth((a+1)%4).click();
    assert.equal(await q.locator('.qopt.right').count(),1);assert.equal(await q.locator('.qopt.wrong').count(),1);
    assert.ok((await q.getAttribute('class')).includes('done'));quizzes++;
   }
   const hosts=page.locator('.slide.active [data-widget]');
   for(let j=0;j<await hosts.count();j++){
    const h=hosts.nth(j);assert.ok(await h.locator('svg,canvas,button,input,.wbody').count(),file+': unmounted widget');widgets++;
    // Exercise an available input without changing its semantic range.
    const input=h.locator('input[type="range"]').first();
    if(await input.count())await input.evaluate(e=>{const old=e.value;e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));e.value=old;e.dispatchEvent(new Event('input',{bubbles:true}));});
   }
   screen.push(...await page.evaluate(geometry,'.slide.active'));
  }
  assert.equal(quizzes,4,file+': four concept checks');
  assert.equal(await page.locator('.katex-error').count(),0,file+': KaTeX error');
  const boxed=await page.locator('.katex .fbox').evaluateAll(es=>es.map(e=>({background:getComputedStyle(e).backgroundColor,minHeight:getComputedStyle(e).minHeight})));
  assert.ok(boxed.every(b=>b.background==='rgba(0, 0, 0, 0)'&&b.minHeight==='0px'),file+': diagram CSS obscures boxed math');
  const broken=await page.locator('img').evaluateAll(es=>es.filter(e=>!e.complete||e.naturalWidth===0).map(e=>e.getAttribute('src')));
  await page.emulateMedia({media:'print'});assert.equal(await page.evaluate(()=>window.__deckPrintReady()),n);
  await page.waitForTimeout(100);
  const print=await page.evaluate(geometry,'.slide');
  const hidden=await page.locator('.frag:not(.on)').count();
  const lifecycle=await page.evaluate(()=>window.__widgetFailures);
  const result={file,slides:n,quizzes,widgets,screen,print,broken,errors,lifecycle,hidden};results.push(result);
  console.log(JSON.stringify(result));await page.close();
 }
}finally{await browser.close();}
if(process.env.IE437_QA_OUT)fs.writeFileSync(process.env.IE437_QA_OUT,JSON.stringify(results,null,2));
assert.ok(results.every(r=>!r.screen.length&&!r.print.length&&!r.broken.length&&!r.errors.length&&!r.lifecycle.length&&!r.hidden),'Course review found rendering or interaction issues; see results above.');
console.log(`PASS: ${results.length} decks, ${results.reduce((a,r)=>a+r.slides,0)} slides; screen, print, quizzes, widget lifecycle and assets.`);
