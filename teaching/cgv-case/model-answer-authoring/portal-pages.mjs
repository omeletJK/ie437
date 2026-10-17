// Reuse the course portal's actual styles and embedded font assets.
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cube='<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,8 90,30 50,52 10,30" fill="var(--teal-200)" stroke="var(--teal-d)" stroke-width="3"/><polygon points="10,30 50,52 50,92 10,70" fill="var(--teal)" stroke="var(--teal-d)" stroke-width="3"/><polygon points="90,30 50,52 50,92 90,70" fill="var(--teal-l)" stroke="var(--teal-d)" stroke-width="3"/></svg>';
const downloadIcon='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1v8m0 0L4.8 5.8M8 9l3.2-3.2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 11.5v2h11v-2" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';

export async function portalCSS(course){
 const deck=path.join(course,'deck'),families=['Inter','IBM Plex Mono','Space Grotesk'];
 let fonts=(await readFile(path.join(deck,'fonts/fonts.css'),'utf8'))+'\n'+await readFile(path.join(deck,'fonts/display.css'),'utf8');
 fonts=fonts.split('@font-face').filter((block,i)=>i===0||families.some(family=>new RegExp("font-family:\\s*'"+family+"'").test(block))).join('@font-face');
 for(const family of families)if(!new RegExp("font-family:\\s*'"+family+"'").test(fonts))throw new Error('Missing portal font '+family);
 const matches=[...fonts.matchAll(/url\(fonts\/([^)]+)\)/g)];
 for(const match of matches){const data=await readFile(path.join(deck,'fonts',match[1]));fonts=fonts.replace(match[0],'url(data:font/woff2;base64,'+data.toString('base64')+')');}
 if(/url\(fonts\//.test(fonts))throw new Error('Unembedded portal font');
 return fonts+'\n'+await readFile(path.join(deck,'site.css'),'utf8');
}

export function navigationScript(prefix=''){
 return String.raw`<script>(function(){
 const hosted=location.protocol!=='file:'&&/\/worked-examples\/[^/]+\//.test(location.pathname);
 document.querySelectorAll('[data-course-home]').forEach(link=>{if(hosted)link.href=new URL('${prefix}../../index.html#assignments',location.href).href;});
 document.querySelectorAll('[data-course-only]').forEach(link=>{link.hidden=!hosted;});
 if(location.protocol==='file:')document.querySelectorAll('[data-package-zip]').forEach(link=>link.remove());
 const top=document.querySelector('.top');const sync=()=>top.classList.toggle('stuck',scrollY>6);addEventListener('scroll',sync,{passive:true});sync();
 })();</script>`;
}

export function header(home,reading=false){
 return `<header class="top"><div class="wrap"><a class="mark" data-course-home href="${home}">${cube}<b>IE<i>437</i></b></a><nav class="tnav" aria-label="Course navigation">${reading?`<a class="keep" href="${home}">All worked examples</a>`:'<a class="keep" href="#cases">Cases</a><a href="#resources">Resources</a>'}<a ${reading?'':'class="keep"'} data-course-home data-course-only href="${home}" hidden>Course portal</a></nav></div></header>`;
}

function documentPage({title,body,css,home='index.html',prefix='',actions=''}){
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · IE437</title><style>${css}</style><style>
 [hidden]{display:none!important}.reading{padding:44px 0 64px}.reading h1{font:600 clamp(1.8rem,3vw,2.2rem)/1.2 var(--disp);letter-spacing:-.02em;margin:12px 0 24px}.reading h2{margin:34px 0 14px}.reading h3{font:600 19px/1.35 var(--disp);margin:24px 0 12px}.reading p{margin:14px 0}.reading ul,.reading ol{margin:14px 0 14px 23px}.reading li{margin:7px 0}.reading a{color:var(--teal);text-underline-offset:3px}.reading table{display:block;max-width:100%;overflow:auto;border-collapse:collapse;font-size:14px;margin:18px 0}.reading td,.reading th{border:1px solid var(--line);padding:10px;text-align:left;vertical-align:top}.reading th{background:var(--sunk)}.reading code{font:13px/1.6 var(--mono);overflow-wrap:anywhere}.reading pre{overflow:auto;background:var(--sunk);padding:16px;margin:18px 0}.reading blockquote{border-left:3px solid var(--teal);padding:4px 18px;margin:18px 0;background:var(--raised)}.reading .document-actions{margin-bottom:30px;display:flex;flex-wrap:wrap;gap:11px}.reading .document-actions a{color:var(--ink)}@media print{.top,.document-actions,footer{display:none}.reading{padding:0}body{background:white;color:#1c2321}}
 </style></head><body>${header(home,true)}<main class="reading"><div class="wrap"><div class="document-actions">${actions}</div>${body}</div></main><footer><div class="wrap"><span class="who">IE437 · Assignment 1</span><a class="dl open" href="${home}">All worked examples</a></div></footer>${navigationScript(prefix)}</body></html>\n`;
}

export async function generatePortalPages(student,course){
 const css=await portalCSS(course),require=createRequire(path.join(course,'package.json')),{marked}=require('marked');
 const cases=[
  {folder:'response',id:'case-response',letter:'A',title:'Response model and programming experiments',description:'Import planning data, review the response model and operating rules, optimize the timetable, then inspect and export the result. This independent simulator uses explicit response assumptions and ILS; learned response fitting and Bayesian optimization are proposal extensions.',engine:'Response Model Simulator'},
  {folder:'audience',id:'case-audience',letter:'B',title:'Synthetic audience simulation',description:'Load the existing 24-film sample covering all of 2027, forecast movie demand, allocate feasible screening capacity, and inspect audience choices in the movie-first M0 app. Continue with schedule improvement or reaction-shock replanning.',engine:'Movie-first M0'}
 ];
 for(const item of cases){const proposal=await readFile(path.join(student,item.folder,'proposal.html'),'utf8');item.slides=[...proposal.matchAll(/<section\b/g)].length;}
 const rows=cases.map(item=>`<li class="assignment" id="${item.id}"><article aria-labelledby="${item.id}-title"><div class="assignment-head"><div><div class="assignment-number">Case ${item.letter}</div><h3 id="${item.id}-title">${item.title}</h3><p class="assignment-subtitle">Original design · English classroom edition</p></div><div class="case-actions"><a class="btn solid" href="${item.folder}/proposal.html">Open proposal</a><a class="btn ghost" href="${item.folder}/demo.html">Open demo site</a></div></div><p class="assignment-summary">${item.description}</p><dl class="assignment-meta"><div><dt>Proposal</dt><dd>${item.slides} slides</dd></div><div><dt>Demo</dt><dd>${item.engine}</dd></div><div><dt>Deliverables</dt><dd>Markdown + HTML</dd></div></dl><ul class="assignment-files"><li><a href="${item.folder}/demo-guide.html"><span>Demo guide and classroom experiments</span><span class="assignment-format">EN ↗</span></a></li><li><a href="${item.folder}/problem-definition.html"><span>Read the problem definition</span><span class="assignment-format">HTML ↗</span></a></li><li><a href="${item.folder}/problem-definition.md" download><span>Download problem definition</span><span class="assignment-format">MD ${downloadIcon}</span></a></li></ul></article></li>`).join('\n');
 const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Assignment 1 · Movie Programming · IE437</title><style>${css}</style><style>
 [hidden]{display:none!important}.page-title{font:600 clamp(1.8rem,3vw,2rem)/1.2 var(--disp);letter-spacing:-.02em;margin-top:12px}.case-actions{display:flex;gap:11px;flex-wrap:wrap;flex:none}.case-actions .btn{white-space:nowrap}.package-actions{margin-top:24px}.package-actions svg{width:16px;height:16px}.reference-note{margin-top:24px;color:var(--ink3);font-size:14px;max-width:78ch}.resource-links{margin-top:26px}.resource-links .ch .ct a{font-size:18px}@media(max-width:850px){.assignment-head{flex-direction:column;align-items:start;gap:20px}.case-actions{flex-wrap:wrap}}@media(max-width:380px){.wrap{padding-inline:16px}.case-actions{width:100%;flex-direction:column}.case-actions .btn{justify-content:center}.assignment-meta{gap:10px 16px}.assignment{padding:20px 18px}}@media print{.top,.package-actions,footer{display:none}.band{padding:26px 0!important}.assignment{break-inside:avoid}}
 </style></head><body>${header('index.html#top')}<main id="top"><section class="band sunk" id="cases"><div class="wrap"><div class="shead"><div><div class="snum">Assignment 1 · Worked examples</div><h1 class="page-title">Movie Programming</h1></div></div><p class="sintro">Two problem-solving proposals and two independent interactive simulators, with English demo guides and completed Markdown problem definitions.</p><div class="cta" style="margin:22px 0"><a class="btn ghost" href="classroom-comparison.html">One-page comparison · brief, data &amp; assumptions</a></div><ol class="assignment-list">${rows}</ol><div class="cta package-actions"><a class="btn ghost" data-package-zip href="IE437-Assignment-01-Worked-Examples-EN.zip" download>${downloadIcon} Download all materials</a><a class="btn ghost" href="README.html">Classroom guide</a></div><p class="reference-note">Read the one-page comparison once for the classroom brief and the additional case data and assumptions. Each proposal then develops its solution; the guides support the experiments.</p></div></section>
 <section class="band sunk" id="resources"><div class="wrap"><div class="shead"><div><div class="snum">Resources</div><h2>Assignment context and checks</h2></div></div><ul class="assignment-files"><li><a href="reference/assignment.md"><span>Assignment brief and rubric</span><span class="assignment-format">MD</span></a></li><li><a href="reference/problem-classification-reference.md"><span>Problem classification reference</span><span class="assignment-format">MD</span></a></li><li><a href="verification.html"><span>Verification record</span><span class="assignment-format">HTML</span></a></li><li><a href="THIRD_PARTY_NOTICES.md"><span>Library and font notices</span><span class="assignment-format">MD</span></a></li></ul></div></section></main><footer><div class="wrap"><span class="who">IE437 · Movie Programming · English teaching materials</span><a class="dl open" href="manifest.json">File manifest</a></div></footer>${navigationScript()}</body></html>\n`;
 await writeFile(path.join(student,'index.html'),page);
 for(const name of ['README.md','verification.md','response/problem-definition.md','audience/problem-definition.md','response/demo-guide.md','audience/demo-guide.md']){
  const md=await readFile(path.join(student,name),'utf8'),nested=name.includes('/'),prefix=nested?'../':'',home=prefix+'index.html',title=md.match(/^#\s+(.+)$/m)?.[1]||'IE437 worked example';
  const actions=`<a class="btn ghost" href="${path.basename(name)}" download>${downloadIcon} Download Markdown</a>`+(name.includes('/')?'<a class="btn ghost" href="proposal.html">Original English proposal</a><a class="btn ghost" href="demo.html">Open demo site</a>':'');
  await writeFile(path.join(student,name.replace(/\.md$/,'.html')),documentPage({title,body:marked.parse(md),css,home,prefix,actions}));
 }
 console.log('Portal design applied to landing and six Markdown reading views; original proposals are primary.');
}
