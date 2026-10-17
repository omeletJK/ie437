import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(here, '../../cgv-proposal');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const definitions = [
  {
    key: 'response', source: 'IE437_Response_Model_EN.html', slides: 'response-slides.html', output: 'response-demo.html', default: 's13',
    title: 'IE437 · Response Model and Deterministic ILS Demo', method: 'Response model + deterministic ILS / local search',
    entries: [
      ['s06', 'Response and cannibalization', 'Prepared response values'], ['s07', 'Potential vs realized demand', 'Prepared scenario values'],
      ['s13', 'ILS schedule search', 'Executed deterministic ILS'], ['s17', 'Booking signals and freeze', 'Prepared booking scenarios'], ['s18', 'Rolling horizon', 'Executed synthetic rolling model'],
    ],
  },
  {
    key: 'audience', source: 'IE437_Audience_Digital_Twin_EN.html', slides: 'audience-slides.html', output: 'audience-demo.html', default: 's09a',
    title: 'IE437 · Synthetic Audience and Choice Simulation Demo', method: 'Synthetic individuals + choice simulation',
    entries: [
      ['s09a', 'Daily viewing paths', 'Executed seeded sampling'], ['s10', 'Forecast evidence update', 'Prepared forecast values'], ['s12', 'Individual profiles', 'Prepared profile values'],
      ['s22', 'Schedule A/B', 'Prepared A/B outcomes'], ['s23', 'Illustrative search storyboard', 'Prepared candidate storyboard'], ['s25', 'Rescheduling', 'Prepared rescheduling scenarios'],
    ],
  },
];

const manifest = {
  schemaVersion: 1,
  builtAt: new Date().toISOString(),
  purpose: 'IE437 instructor reference demonstrations; separate from student assignment assets',
  disclosure: 'All displayed outcomes are illustrative and use synthetic data. They are not measured business effects.',
  prerequisites: 'Open either HTML in a modern desktop browser. No server, dependency installation, API key or network is required.',
  demos: [],
};
await mkdir(here, { recursive: true });
for (const d of definitions) {
  const sourcePath = path.join(sourceDir, d.source), original = await readFile(sourcePath, 'utf8');
  await copyFile(sourcePath, path.join(here, d.slides));
  let output = original
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/[^\n]*/gm, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/IMAX/g, 'Large screen')
    .replace(/4DX/g, 'Motion format')
    .replace(/ScreenX/gi, 'Panoramic format')
    .replace(/Yongsan/gi, 'Site A')
    .replace(/Gangnam/gi, 'Site B')
    .replace(/Hongdae/gi, 'Site C')
    .replace(/'IBM Plex Mono'/g, 'ui-monospace')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${d.title}</title>`);
  const options = d.entries.map(([id, label]) => `<option value="${id}"${id === d.default ? ' selected' : ''}>${label}</option>`).join('');
  const style = `<style id="class-demo-style">
.class-demo-bar{position:fixed;z-index:1000;top:8px;left:64px;right:64px;min-height:32px;display:flex;align-items:center;gap:12px;padding:6px 12px;border:1px solid rgba(100,116,139,.22);border-radius:4px;background:rgba(16,18,22,.95);color:#f2f3f5;font:11px/1.2 system-ui,sans-serif}
.class-demo-bar strong{font-weight:650}.class-demo-bar .demo-disclosure{opacity:.7;margin-right:auto}.class-demo-bar select{max-width:240px;border:1px solid #64748b;background:#20232a;color:#f2f3f5;padding:3px 6px;font:inherit}.class-demo-bar button{border:1px solid #64748b;background:#20232a;color:#f2f3f5;padding:3px 8px;font:inherit;cursor:pointer}
@media(max-width:850px){.class-demo-bar{left:8px;right:8px;font-size:10px;gap:6px}.class-demo-bar .demo-disclosure{display:none}.class-demo-bar strong{max-width:45%}.class-demo-bar select{max-width:40%}}
@media print{.class-demo-bar{display:none!important}}
#hw1CaseDialog{width:min(620px,calc(100vw - 32px));max-height:calc(100vh - 40px);margin:auto;border:1px solid #94a3b8;border-radius:8px;padding:24px;background:#f7f7f5;color:#16181d;font:14px/1.5 system-ui,sans-serif;overflow:auto}
#hw1CaseDialog::backdrop{background:rgba(0,0,0,.66)}#hw1CaseDialog h2{font-size:22px;margin:0 0 10px}#hw1CaseDialog p{margin:8px 0 14px}#hw1CaseDialog .case-presets{display:flex;gap:8px;margin:16px 0}#hw1CaseDialog button{padding:7px 12px;border:1px solid #94a3b8;background:#fff;border-radius:4px;cursor:pointer;font:inherit}#hw1CaseDialog .case-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}#hw1CaseDialog label{display:flex;flex-direction:column;gap:5px;font-size:12px}#hw1CaseDialog input{min-width:0;width:100%;padding:7px;border:1px solid #94a3b8;font:16px system-ui,sans-serif;border-radius:3px}#hw1CaseResult{display:block;margin:18px 0;padding:12px;border-left:4px solid #64748b;background:#fff;white-space:pre-line}#hw1CaseResult[data-status=feasible]{border-color:#15803d}#hw1CaseResult[data-status=infeasible],#hw1CaseResult[data-status=error]{border-color:#b91c1c}#hw1CaseDialog .case-note{font-size:12px;color:#475569}
</style>
<script>if(!location.hash)history.replaceState(null,'','#${d.default}');</script>`;
  const toolbar = `<div class="class-demo-bar noprint" role="region" aria-label="Classroom demonstration controls"><strong>${d.method}</strong><span id="classDemoStatus" class="demo-disclosure">Illustrative synthetic results</span><label for="classDemoSelect">Demo</label><select id="classDemoSelect" aria-label="Choose demonstration">${options}</select><button id="hw1CaseOpen" type="button">HW1 case checks</button><button id="classDemoReset" type="button">Reset</button></div>
<dialog id="hw1CaseDialog" class="noprint" aria-labelledby="hw1CaseTitle"><h2 id="hw1CaseTitle">HW1 case checks</h2><p>This supplemental feasibility calculation assumes fixed, non-overlapping screening slots. Every screen has the same number of slots, and each requested screening uses one slot.</p><p class="case-note">Capacity = screens × slots per screen. This is separate from the ILS and audience-choice engines. It does not test their constraints, forecast accuracy, or business impact.</p><div class="case-presets"><button type="button" data-case="normal">Normal</button><button type="button" data-case="boundary">Boundary</button><button type="button" data-case="failure">Failure</button></div><div class="case-fields"><label>Screens<input id="hw1Screens" type="number" min="0" step="1" value="2"></label><label>Slots per screen<input id="hw1Slots" type="number" min="0" step="1" value="3"></label><label>Required screenings<input id="hw1Required" type="number" min="0" step="1" value="4"></label></div><output id="hw1CaseResult" aria-live="polite"></output><p class="case-note">Teaching fixture: normal 2 × 3 slots / 4 required; boundary 6 required; failure 7 required. No confidential or operational data is used.</p><button id="hw1CaseClose" type="button">Close</button></dialog>`;
  const controls = `<script>
(function(){
  var selector=document.getElementById('classDemoSelect');
  var statuses=${JSON.stringify(Object.fromEntries(d.entries.map(([id, , status]) => [id, status])))};
  function sync(){var id=location.hash.slice(1);if(Array.from(selector.options).some(function(o){return o.value===id}))selector.value=id;document.getElementById('classDemoStatus').textContent=(statuses[id]||'Supporting explanation')+' · synthetic';}
  selector.addEventListener('change',function(){location.hash=selector.value;selector.blur();});
  document.getElementById('classDemoReset').addEventListener('click',function(){location.reload();});
  addEventListener('hashchange',sync);sync();
  var dialog=document.getElementById('hw1CaseDialog'),result=document.getElementById('hw1CaseResult');
  var screens=document.getElementById('hw1Screens'),slots=document.getElementById('hw1Slots'),required=document.getElementById('hw1Required');
  function checkCase(){
    delete result.dataset.capacity;delete result.dataset.required;
    var raw=[screens.value,slots.value,required.value],values=raw.map(Number);
    if(raw.some(function(v){return !v.trim();})||values.some(function(v){return !Number.isSafeInteger(v)||v<0;})){
      result.dataset.status='error';result.textContent='Input error: enter nonnegative whole numbers within the safe calculation range. No valid schedule is claimed.';return;
    }
    var capacity=values[0]*values[1],needed=values[2];
    if(!Number.isSafeInteger(capacity)){result.dataset.status='error';result.textContent='Input error: the capacity exceeds the safe calculation range. No valid schedule is claimed.';return;}
    result.dataset.capacity=String(capacity);result.dataset.required=String(needed);
    if(needed>capacity){result.dataset.status='infeasible';result.textContent='Infeasible in this fixture: '+needed+' screenings requested, but capacity is '+capacity+' fixed slots. No valid schedule is claimed.';}
    else{result.dataset.status='feasible';result.textContent='Feasible in this fixture: capacity '+capacity+' fixed slots; requested '+needed+'; unused '+(capacity-needed)+'.'+(needed===capacity?' Exactly at capacity.':'');}
  }
  document.getElementById('hw1CaseOpen').addEventListener('click',function(){checkCase();dialog.showModal();});
  document.getElementById('hw1CaseClose').addEventListener('click',function(){dialog.close();});
  dialog.addEventListener('keydown',function(e){e.stopPropagation();});
  dialog.querySelectorAll('[data-case]').forEach(function(b){b.addEventListener('click',function(){screens.value='2';slots.value='3';required.value=String({normal:4,boundary:6,failure:7}[b.dataset.case]);checkCase();});});
  [screens,slots,required].forEach(function(input){input.addEventListener('input',checkCase);});checkCase();
})();
</script>`;
  output = output.replace('</head>', style + '\n</head>').replace('<body>', '<body>\n' + toolbar).replace(/<\/body>(\s*<\/html>\s*)$/, controls + '\n</body>$1');
  if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(output)) throw new Error(`${d.key}: Korean text remains in source`);
  if (/\b(?:CGV|Omelet|KAIST|Stanford|Shinhan|Hyundai|Pantos|IMAX|4DX|ScreenX)\b/i.test(output)) throw new Error(`${d.key}: identifying commercial or institution name remains`);
  await writeFile(path.join(here, d.output), output);
  manifest.demos.push({
    key: d.key, file: d.output, title: d.title, method: d.method, defaultHash: '#' + d.default,
    sourceFile: d.source, sourceRelativePath: d.slides,
    sourceSHA256: sha256(original), outputSHA256: sha256(output),
    supportingDOM: 'All source slide IDs, presenter-note keys/timing and embedded calculations are retained.',
    modifications: 'English-only source comments; no external fonts; generic site/format labels; classroom selector and reload reset; separate supplemental HW1 feasibility fixture.',
    supplementalFixture: { assumption: 'Fixed non-overlapping slots; one requested screening per slot', capacity: 'screens × slotsPerScreen', cases: [{ id: 'normal', screens: 2, slotsPerScreen: 3, required: 4, expected: 'feasible' }, { id: 'boundary', screens: 2, slotsPerScreen: 3, required: 6, expected: 'feasible, exactly at capacity' }, { id: 'failure', screens: 2, slotsPerScreen: 3, required: 7, expected: 'infeasible' }] },
    entries: d.entries.map(([id, label, executionStatus]) => ({ label, executionStatus, hash: '#' + id, link: d.output + '#' + id })),
  });
  console.log(`${d.output} ${sha256(output)} (source ${sha256(original)})`);
}
await writeFile(path.join(here, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
