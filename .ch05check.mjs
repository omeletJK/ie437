import { chromium } from 'playwright';
import path from 'node:path';
const file = 'file://' + path.resolve('html/ch05_surrogate_design_optimization.html');
const b = await chromium.launch();
const p = await b.newPage({ viewportSize:{width:1400,height:840} });
const errs = [];
p.on('console', m => { if (m.type()==='error') errs.push('CONSOLE: '+m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
await p.goto(file, { waitUntil:'networkidle' });
const t0 = Date.now();
const n = await p.evaluate(() => window.__deckPrintReady());
console.log('slides:', n, ' printReady took', Date.now()-t0, 'ms');
await p.waitForTimeout(400);
// overflow report
const rep = await p.evaluate(() => {
  const out=[];
  document.querySelectorAll('.slide').forEach((s,i)=>{
    const fill=s.querySelector('.fill');
    const title=s.querySelector('.head');
    const foot=s.querySelector('.foot');
    let over=0;
    if(fill){ over = fill.scrollHeight - fill.clientHeight; }
    // also detect any child sticking out of the 720px stage
    const sr=s.getBoundingClientRect();
    let maxb=0, w=0;
    s.querySelectorAll('*').forEach(e=>{ const r=e.getBoundingClientRect();
      if(r.height>0){ maxb=Math.max(maxb, r.bottom-sr.top); w=Math.max(w, r.right-sr.left);} });
    out.push({i:i+1, title:(title?title.textContent:'(section)').slice(0,48), over, maxb:Math.round(maxb), maxw:Math.round(w)});
  });
  return out;
});
const H = await p.evaluate(()=>document.querySelector('.slide').getBoundingClientRect().height);
const Wd = await p.evaluate(()=>document.querySelector('.slide').getBoundingClientRect().width);
console.log('slide box', Math.round(Wd), 'x', Math.round(H));
rep.forEach(r=>{ const bad = r.over>1 || r.maxb > H+1 || r.maxw > Wd+1;
  if(bad) console.log('  !! slide', r.i, JSON.stringify(r)); });
console.log('overflowing slides:', rep.filter(r=>r.over>1||r.maxb>H+1||r.maxw>Wd+1).length);
// widget heights
const wh = await p.evaluate(()=>Array.from(document.querySelectorAll('.widget')).map(w=>({id:w.dataset.widget,h:Math.round(w.getBoundingClientRect().height),w:Math.round(w.getBoundingClientRect().width)})));
console.log('widgets:', JSON.stringify(wh));
if(errs.length){ console.log('\nERRORS:'); errs.forEach(e=>console.log('  '+e)); } else console.log('\nno console/page errors');
await b.close();
