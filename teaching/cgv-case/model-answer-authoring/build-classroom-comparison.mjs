import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const student=path.join(here,'student');
const course=process.env.IE437_SLIDES_ROOT||path.resolve(here,'../../../ie437-slides');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=[
  {topic:'Starting records',cells:[
    'Film, cinema, screening date/time, purchaser, paid tickets. One completed purchase per row; no dataset.',
    'Joined schedules and purchase outcomes would train the model. The demo uses declared coefficients.',
    'Purchasing accounts ≠ individual attendees. Fictional people and histories are generated.'
  ]},
  {topic:'Added data',cells:[
    'Full schedules, runtimes, seats and operating rules are not supplied.',
    '6 films × 6 sites × 3 screens; 90 reference showings. Added runtimes, seats, rules and response factors.',
    '24 films across 2027; profiles, tastes and histories; movie features/dates, seats, prices and rules.'
  ]},
  {topic:'Case assumptions',cells:[
    'Planning horizon, current workflow and policies are left for students to define and justify.',
    'One-day plan. Declared time/site/competition effects estimate attendance under operating rules.',
    'Annual horizon; 10,000 local synthetic people. Preferences/frequency → movie choices → seats.'
  ]},
  {topic:'Proposed strategy',cells:[
    'Choose and justify a programming strategy. No specific model or algorithm is prescribed.',
    'Learn schedule → audience response; use Bayesian optimization (BO) to select schedule evaluations.',
    'Model consumers → choices → demand → schedule search. Learned M1 is proposed.'
  ]},
  {topic:'Executable demo',cells:[
    'Inputs → execution → inspection → revision, with a reference-plan comparison.',
    'Upload → settings → ILS → compare/export. Synthetic response; no learned fitting or BO.',
    'Profiles/movies → demand → plan/choices → compare/replan. Rule-based M0 + local search; M1 not applied.'
  ]}
];
const title='From the classroom brief to the two proposals';
const subtitle='One comparison before the two case studies';
const conclusion='The examples add fictional planning inputs to make each strategy executable. Buying three tickets does not supply three attendee histories.';
const headings=['Comparison','Course brief','Case A · Response + BO','Case B · Synthetic consumers'];

async function embeddedFonts(){
  const deckFonts=path.join(course,'deck/fonts');
  const raw=(await readFile(path.join(deckFonts,'fonts.css'),'utf8'))+'\n'+await readFile(path.join(deckFonts,'display.css'),'utf8');
  const wanted=[['Inter','400'],['Inter','600'],['IBM Plex Mono','400'],['Space Grotesk','600']];
  let fonts=[...raw.matchAll(/@font-face\s*\{[^}]*\}/g)].map(match=>match[0]).filter(block=>wanted.some(([family,weight])=>block.includes("font-family: '"+family+"'")&&block.includes('font-weight: '+weight+';'))).join('\n');
  if((fonts.match(/@font-face/g)||[]).length!==wanted.length)throw new Error('Missing course font declarations');
  for(const match of [...fonts.matchAll(/url\(fonts\/([^)]+)\)/g)]){
    const bytes=await readFile(path.join(deckFonts,match[1]));
    fonts=fonts.replace(match[0],'url(data:font/woff2;base64,'+bytes.toString('base64')+')');
  }
  return fonts;
}

const fonts=await embeddedFonts();
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · IE437</title><style>
${fonts}
:root{--paper:#f7f7f5;--ink:#16181d;--muted:#66696e;--line:rgba(22,24,29,.16);--accent:#ab6528}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--paper);color:var(--ink)}body{font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.sheet{width:100%;max-width:1440px;min-height:100svh;margin:0 auto;padding:28px 42px 18px;display:flex;flex-direction:column}
.kicker{font:400 12px/1.3 'IBM Plex Mono',monospace;letter-spacing:.13em;color:var(--muted);text-transform:uppercase;display:flex;align-items:center;gap:10px}.kicker::before{content:'';width:14px;height:3px;background:var(--ink)}
h1{font:600 34px/1.15 'Space Grotesk',Inter,sans-serif;letter-spacing:-.035em;margin:17px 0 7px}.subtitle{font-size:18px;line-height:1.4;color:var(--muted);margin:0 0 18px}
table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:16px;line-height:1.3}col.topic{width:14%}col.context{width:28.667%}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:11px 14px}thead th{padding-top:10px;padding-bottom:12px;font:600 17px/1.3 'Space Grotesk',Inter,sans-serif;border-top:2px solid var(--ink);border-bottom:1px solid var(--ink)}thead th:first-child{font:400 12px/1.5 'IBM Plex Mono',monospace;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}tbody th{font:600 15px/1.3 Inter,sans-serif;padding-left:0}thead th:first-child{padding-left:0}thead th:nth-child(3){color:var(--accent)}thead th:nth-child(4){color:#306a60}tbody td:nth-child(2){color:#55585e}
.conclusion{font-size:16px;line-height:1.4;margin:14px 0 13px;max-width:1080px}.footer{margin-top:auto;padding-top:11px;display:flex;justify-content:space-between;align-items:center;gap:20px;font:400 12px/1.4 'IBM Plex Mono',monospace;color:var(--muted)}.links{display:flex;gap:22px;flex-wrap:wrap}.footer a{color:var(--ink);text-underline-offset:4px}.edition{white-space:nowrap}
@media(min-width:1500px){.sheet{padding:46px 58px 32px}h1{font-size:40px}.subtitle{font-size:21px}table{font-size:18px}th,td{padding:15px 17px}thead th{font-size:20px}tbody th{font-size:17px}.conclusion{font-size:18px}}
@media(max-width:900px){.sheet{padding:28px 24px}.table-wrap{overflow-x:auto}table{min-width:900px}h1{font-size:29px}.footer{align-items:flex-start;flex-direction:column;gap:13px}.conclusion{font-size:15px}}
@media print{@page{size:landscape;margin:0}.sheet{min-height:100vh;padding:25px 34px}.footer .links{display:none}h1{font-size:31px}table{font-size:14px}th,td{padding:10px 12px}.conclusion{font-size:14px}}
</style></head><body><main class="sheet">
<header><div class="kicker">IE437 · Assignment 1 · Data &amp; assumptions</div><h1>${title}</h1><p class="subtitle">${subtitle}</p></header>
<div class="table-wrap"><table aria-label="Course brief and case-study data and assumptions"><colgroup><col class="topic"><col class="context"><col class="context"><col class="context"></colgroup><thead><tr>${headings.map(value=>'<th scope="col">'+escape(value)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr><th scope="row">'+escape(row.topic)+'</th>'+row.cells.map(value=>'<td>'+escape(value)+'</td>').join('')+'</tr>').join('\n')}</tbody></table></div>
<p class="conclusion">${conclusion}</p><footer class="footer"><span class="edition">IE437 · Fictional cinema case</span><nav class="links" aria-label="Comparison resources"><a href="classroom-comparison.md" download>Download Markdown</a><a href="reference/assignment.md">Course brief</a><a href="index.html">All worked examples</a></nav></footer>
</main></body></html>\n`;
const markdown=`# ${title}

**IE437 Assignment 1 · Shared classroom comparison · English · Release 1.8**

${subtitle}. Read this comparison once, then follow the problem-solving argument in either proposal.

| ${headings.join(' | ')} |
|---|---|---|---|
${rows.map(row=>'| '+[row.topic,...row.cells].join(' | ')+' |').join('\n')}

${conclusion}

## What the six teaching fields mean

The [assignment brief](reference/assignment.md#2-client-brief-and-available-information) supplies a **record specification rather than an actual dataset**:

- \`title_tag\`: film alias; \`venue_tag\`: cinema alias.
- \`play_day\` and \`curtain_time\`: scheduled screening date and local start time, not purchase-event timestamps.
- \`account_tag\`: the purchasing account; \`passes_bought\`: the positive number of paid tickets in that completed purchase.

One row is one completed purchase for one screening. The brief does not supply dataset size, coverage period, quality, existing operating practice or measured performance. The records alone do not reveal zero-sales screenings, individual attendee histories, check-ins or the response to an alternative schedule.

## Where the added inputs are declared

- **Case A:** [CinemaPlanning.json](response/CinemaPlanning.json) declares films, runtimes, sites/screens/seats, response coefficients, operating rules and the 90-showing reference. [Screenings.csv](response/Screenings.csv) carries five timetable columns; it uses the active planning package's definitions. See the [Response problem definition](response/problem-definition.md) for the formula, supported inputs and one-day decision scope.
- **Case B:** [Movies.csv](audience/Movies.csv) restores the existing annual simulator's **24 distinct fictional films across 2027**, with two new films and overlapping windows each month. It supplies metadata and explicit preference-feature values. A film is active from its release date through the day before its exclusive end date; metadata are declared known at the January 1 annual cutoff. The application generates fictional audience profiles/people and supplies synthetic market/rule inputs. Its configured horizon is the full 2027 year; the local seat market contains 10,000 people. See the [Synthetic audience problem definition](audience/problem-definition.md) for the M0 calculation and revision scope.

The proposed learned models and the executable demonstrations are different stages of each strategy. The Case A app uses an explicit aggregate formula and Iterated Local Search (ILS); the Case B app uses rule-based Movie First M0 and bounded local search. Neither app establishes real business performance from the homework's purchase-field specification.

[One-page presentation](classroom-comparison.html) · [All worked examples](index.html)
`;
await writeFile(path.join(student,'classroom-comparison.html'),html);
await writeFile(path.join(student,'classroom-comparison.md'),markdown);
await mkdir(path.join(here,'authoring/qa'),{recursive:true});
const inputs=['reference/assignment.md','response/problem-definition.md','audience/problem-definition.md','response/CinemaPlanning.json','response/Screenings.csv','audience/Movies.csv'];
const sources=[];for(const file of inputs){const bytes=await readFile(path.join(student,file));sources.push({file,sha256:createHash('sha256').update(bytes).digest('hex')});}
const output=[];for(const file of ['classroom-comparison.html','classroom-comparison.md']){const bytes=await readFile(path.join(student,file));output.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
const qaPath=path.join(here,'authoring/qa/classroom-comparison-1.8.json');
let previousQA=null;try{previousQA=JSON.parse(await readFile(qaPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const samePage=previousQA?.output?.find(item=>item.file==='classroom-comparison.html')?.sha256===output.find(item=>item.file==='classroom-comparison.html').sha256;
const browserLayout=samePage&&previousQA?.checks?.browserLayout?.status==='PASS'?previousQA.checks.browserLayout:'pending browser review';
await writeFile(qaPath,JSON.stringify({version:'1.8',purpose:'One shared page compares the classroom brief with added data, assumptions, proposal strategies and executable scope of the two cases.',rows:rows.map(row=>row.topic),sources,output,checks:{oneTable:true,fiveComparisonRows:true,embeddedCourseFonts:wantedFontNames(fonts),externalAssets:false,relativeNavigation:true,staticContent:samePage?previousQA?.checks?.staticContent:'pending content review',browserLayout},scope:'No numerical demo or proposal slide modified by this generator.'},null,2)+'\n');
console.log('Built shared classroom-comparison.html and classroom-comparison.md.');

function wantedFontNames(css){return [...new Set([...css.matchAll(/font-family:\s*'([^']+)'/g)].map(match=>match[1]))];}
