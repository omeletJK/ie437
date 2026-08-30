import { chromium } from 'playwright';
import path from 'node:path';
const file='file://'+path.resolve('html/ch05_surrogate_design_optimization.html');
const b=await chromium.launch(); const p=await b.newPage({viewportSize:{width:1280,height:720}});
await p.goto(file,{waitUntil:'networkidle'});
const OUT='/private/tmp/claude-501/-Users-jinkyoo-Projects-ie437-slides/54e639e3-1cc5-4e14-97f8-f73af4f2c98e/scratchpad/ch05shots';
const list = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : Array.from({length:40},(_,i)=>i+1);
for(const i of list){
  await p.evaluate((k)=>{location.hash='#'+k;}, i);
  await p.waitForTimeout(200);
  await p.evaluate(()=>window.__deckPrintReady());
  await p.waitForTimeout(300);
  await p.screenshot({path:`${OUT}/ch05_${String(i).padStart(2,'0')}.png`});
}
await b.close(); console.log('shots written');
