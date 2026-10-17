/** Rebuild the two existing public English demo sites without modifying src/ or dist/.
 * Run from the repository: node teaching/ie437-model-answer/build-apps.mjs
 * Requires the repository's already installed dependencies; no network access.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'teaching/ie437-model-answer/student');
const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'ie437-public-app-'));
const requireFromVite = createRequire(import.meta.resolve('vite'));
const esbuild = requireFromVite('esbuild');
// This installed distribution declares MIT but omitted its license file.
// Preserve the verified upstream repository license as an offline snapshot.
const upstreamLicenseSnapshots = new Map([['@nodable/entities@3.0.0', {
  source:'https://github.com/nodable/val-parsers/blob/main/LICENSE',
  retrieved:'2026-10-11',
  text:`MIT License

Copyright (c) 2026 Nodable

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
}], ['victory-vendor@37.3.6', {
  source:'https://github.com/FormidableLabs/victory/blob/v37.3.6/LICENSE.txt',
  retrieved:'2026-10-11',
  text:`The MIT License (MIT)

Copyright (c) 2015-2020 Formidable Labs.
Copyright (c) 2016-2020 Alexey Svetliakov <https://github.com/asvetliakov>,
snerks <https://github.com/snerks>, Krzysztof Cebula <https://github.com
Havret>, Vitaliy Polyanskiy <https://github.com/alreadyExisted>, James Lismore
<https://github.com/jlismore>, Stack Builders <https://github.com
stackbuilders>, Esteban Ibarra <https://github.com/ibarrae>, Dominic Lee
<https://github.com/dominictwlee>, Dave Vedder <https://github.com
veddermatic>, Alec Flett <https://github.com/alecf> and potentially other
DefinitelyTyped contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`,
}]]);
const bundledInputs = new Set();
function recordBundledInputs(result) {
  for (const bundle of Object.values(result.metafile.outputs)) {
    for (const [input, contribution] of Object.entries(bundle.inputs)) {
      if (contribution.bytesInOutput > 0 && input.includes('node_modules/')) bundledInputs.add(input);
    }
  }
}
async function thirdPartyNotices() {
  const fontNotices=await fs.readFile(path.join(root,'teaching/ie437-model-answer/vendor/font-notices.md'),'utf8');
  for (const family of ['Inter','IBM Plex Mono','Space Grotesk']) if (!fontNotices.includes(`## ${family}\n`)) throw new Error(`Missing official font license snapshot: ${family}`);
  const packages = new Map();
  for (const input of bundledInputs) {
    const bundledFile=await fs.realpath(path.resolve(input));
    let dir = path.dirname(bundledFile);
    while (dir !== path.dirname(dir)) {
      let info;
      try { info = JSON.parse(await fs.readFile(path.join(dir,'package.json'),'utf8')); } catch { /* Not a package root. */ }
      if (info?.name && info?.version) {
        const key=`${info.name}@${info.version}`;
        const entry=packages.get(key)??{ dir, info, inputs:new Set() };
        entry.inputs.add(bundledFile);
        packages.set(key,entry);
        break;
      }
      dir = path.dirname(dir);
    }
  }
  const sections = [];
  const rows = [];
  for (const [key,{dir,info,inputs}] of [...packages].sort(([a],[b])=>a.localeCompare(b))) {
    const files = new Set();
    // Include the published license/copyright/notice files, not package READMEs
    // or installation paths. Some distributions use a licenses/ subdirectory.
    async function findNotices(current, depth=0) {
      for (const entry of (await fs.readdir(current,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
        if (!/^(?:licen[sc]es?|notices?|copying|copyright)(?:[._ -].*)?$/i.test(entry.name)) continue;
        const file=path.join(current,entry.name);
        if (entry.isFile()) files.add(file);
        else if (entry.isDirectory() && depth < 2) {
          for (const child of await walk(file)) if (/\.(?:txt|md|text|html)?$/i.test(child) || !path.extname(child)) files.add(child);
        }
      }
    }
    await findNotices(dir);
    const nestedDirs=new Set();
    for (const input of inputs) {
      let nested=path.dirname(input);
      while (nested!==dir && nested.startsWith(dir+path.sep)) { nestedDirs.add(nested); nested=path.dirname(nested); }
    }
    for (const nested of [...nestedDirs].sort()) await findNotices(nested);
    const snapshot=upstreamLicenseSnapshots.get(key);
    if (!files.size && !snapshot) throw new Error(`Bundled dependency has no published license/notice file: ${key}`);
    const license=typeof info.license==='string'?info.license:JSON.stringify(info.license??'See published notices');
    rows.push(`| ${info.name} | ${info.version} | ${license} |`);
    const notices=[];
    for (const file of [...files].sort()) {
      const original=await fs.readFile(file,'utf8');
      let fence='```'; while(original.includes(fence)) fence+='`';
      notices.push(`### ${path.relative(dir,file).split(path.sep).join('/')}\n\n${fence}text\n${original}${original.endsWith('\n')?'':'\n'}${fence}`);
    }
    if (snapshot) {
      notices.push(`### Upstream root LICENSE snapshot\n\nThe installed distribution omits its root license file. Its package metadata declares ${license}. This text was verified from the [upstream repository LICENSE](${snapshot.source}) on ${snapshot.retrieved} and is stored in the rebuild script for offline reproduction. Any published notices for bundled vendor code appear above.\n\n\`\`\`text\n${snapshot.text}\`\`\``);
    }
    sections.push(`## ${key}\n\n${notices.join('\n\n')}`);
  }
  const content=`# Third-party notices\n\nThe Movie-First audience app in this package bundles the libraries listed below. The public landing, Markdown reading views and Response Model Simulator also embed three font families; their full official upstream licenses appear after the library notices. Notices are reproduced from the installed distributions used by the build, with a clearly marked upstream snapshot where a distribution omitted its license file. Original copyright holders and license wording are preserved. This attribution does not identify the organizations or people in the synthetic cinema case.\n\nLibrary notices apply to [the Movie-First audience app](audience/demo.html), including its embedded Worker. The [Response Model Simulator](response/demo.html) embeds its original calculation code without third-party JavaScript libraries. Libraries are selected from esbuild's actual output contributions; build-only tools are excluded.\n\nRegenerate from the source repository with \`node teaching/ie437-model-answer/build-apps.mjs\`. References below use package-relative filenames; no local installation paths are included. Font snapshots are stored in \`teaching/ie437-model-answer/vendor/font-notices.md\` for offline regeneration.\n\n| Package | Version | Declared license |\n| --- | --- | --- |\n${rows.join('\n')}\n\n${sections.join('\n\n')}\n\n## Embedded fonts\n\n${fontNotices.replace(/^# Font license snapshots\n\n/,'')}`;
  const target=path.join(output,'THIRD_PARTY_NOTICES.md');
  await fs.writeFile(target,content);
  return { file:'student/THIRD_PARTY_NOTICES.md', packages:packages.size, fonts:3, bytes:Buffer.byteLength(content), sha256:createHash('sha256').update(content).digest('hex') };
}
const translations = new Map(Object.entries({
  '결과를 숨긴 채 과거를 재현합니다': 'Replay the past with outcomes hidden',
  '이미 정답(실제 관객수)을 알고 있는 과거 영화를 골라, 모델에게는 개봉 전 정보만 주고 눈가리고 예측시킵니다. 정답은 예측이 끝나기 전까지 격리됩니다.': 'Select a historical synthetic film with a known outcome. Give the model only information available before release, and keep the outcome hidden until prediction is complete.',
  '실제 관객수는 이미 존재하지만, 모델 입력에서는 완전히 격리한 시험 대상 영화입니다.': 'The synthetic outcome already exists, but is excluded from model inputs for this held-out film.',
  '이 hash는 예측을 즉시 봉인한 지문입니다 — 실제 결과를 본 뒤에는 값을 바꿀 수 없습니다.': 'This hash seals the prediction before the hidden synthetic outcome is revealed.',
  'Predict를 실행하면 두 모델이 개봉 전 정보만으로 예측하고, 그 값을 즉시 hash로 잠급니다.': 'Predict runs both models using pre-release information and immediately seals their outputs with a hash.',
  '봉인된 예측 공개 후의 실제 관객수': 'Hidden synthetic outcome revealed after prediction',
  '볼 사람과 안 볼 사람을 구분하는 정도 · 1.0=완벽, 0.5=무작위': 'Discrimination between viewers and non-viewers · 1.0 perfect, 0.5 random',
  '예측 확률과 실제의 오차 · 낮을수록 정확': 'Probability error against synthetic outcomes · lower is better',
  'Predict → Reveal 순서를 강제하는 이유: 정답을 본 뒤 예측을 손보면 검증이 의미가 없어지기 때문입니다. 실제 CGV 데이터로 확장할 때도 같은 절차(과거 재현 → 모의 운영 → 소규모 실전)로 신뢰를 쌓습니다.': 'Predict must precede Reveal: changing predictions after seeing outcomes invalidates the test. Real deployment would also require historical validation, shadow operation, and a limited pilot. This demo contains synthetic data only.',
  '어디서, 언제, 어떤 포맷으로 볼까': 'Choose a site, time, and format',
  'Phase 1 확률에 극장·시간·가격·거리 효용과 outside option을 결합합니다.': 'Combine Phase 1 probabilities with site, time, price, and distance utility, including an outside option.',
  '동일한 관객 표현이 Phase 1과 Phase 2에 사용됩니다.': 'The same audience representation is used in Phase 1 and Phase 2.',
  '새 예매 신호로 미래만 다시 편성합니다': 'Reprogram future showings with new booking signals',
  '수요 충격과 편성 변경의 효과를 세 단계로 분리합니다.': 'Separate the demand shock and schedule-change effects into three states.',
  '실행하면 같은 시각·같은 난수 조건에서 세 상태를 비교합니다.': 'Run to compare three states with the same time and random conditions.',
  '누가 볼지를 합산해 수요를 만듭니다': 'Aggregate individual propensities into demand',
  '같은 Audience Twin에 시점별 공개 정보를 더해 믿음을 갱신합니다.': 'Update the same Audience Twin with information available at each forecast horizon.',
  '내 영화·연간 편성표 입력 →': 'Read the demo guide →',
  '전체 합성 시장 · 첫 7일': 'Full synthetic market · first 7 days',
  '전체 숫자보다 먼저,': 'Start with people.',
  '누가 선택할지': 'Predict who',
  '계산합니다.': ' will choose.',
  '개인의 관람 이력에서 시작해 전체 수요를 만들고, 동일한 관객이 극장·시간·포맷을 선택하도록 확장합니다.': 'Build demand from individual viewing histories, then let the same synthetic audience choose a site, time, and format.',
  '가상 관객의 장기 선택 이력': 'Long-term histories of synthetic audiences',
  '한 편을 한 행으로 보지 않고, 관객별 노출·관심·관람·평가를 분리해 모델링합니다.': 'Model exposure, interest, viewing, and ratings separately for each audience member.',
  '관람하지 않았다는 사실만으로 싫어한다고 판단하지 않습니다. 명시 평가와 노출 여부를 별도로 사용합니다.': 'Non-viewing does not imply dislike. Explicit ratings and exposure are separate evidence.',
  '편성이 바뀌면 관객도 다시 선택합니다': 'A new schedule changes audience choices',
  '회차를 편집한 뒤 같은 10,000명에게 다시 선택시켜 KPI를 비교합니다.': 'Edit a showing, let the same 10,000 synthetic people choose again, and compare KPIs.',
  '재계산 필요': 'Recalculation required',
  '모든 숫자는 반환 편성을 evaluator로 다시 계산한 합성 결과입니다.': 'All figures are synthetic results obtained by re-evaluating the returned schedule.',
  '유효 후보만 평가하며 개선이 없으면 기준 편성을 유지합니다.': 'Only valid candidates are evaluated. The baseline is kept if no improvement is found.',
  'Re-simulate를 실행하면 현재 편성의 KPI와 optimizer를 사용할 수 있습니다.': 'Re-simulate to calculate current KPIs and enable the reference optimizer.',
  '합성 영화': 'Synthetic film ',
  '의 관객 반응을 검증하기 위한 설명입니다.': ': an illustrative synopsis for synthetic audience experiments.',
  '기억을 보관하는 궤도 도시에서 사라진 기록을 추적하는 합성 SF.': 'A synthetic science-fiction story about missing records in an orbital city that stores memories.',
  '달빛 우체국에서 길 잃은 편지를 배달하는 합성 가족 애니메이션.': 'A synthetic family animation about delivering lost letters from a moonlit post office.',
  '증언이 사라지는 법정에서 한 기록관이 진실을 복원하는 합성 스릴러.': 'A synthetic thriller about an archivist restoring the truth when courtroom testimony disappears.',
  '[합성 리뷰] 인상적인 요소가 오래 남았습니다.': '[Synthetic review] Memorable elements stayed with me.',
  '[합성 리뷰] 기대와 맞지 않는 부분이 있었습니다.': '[Synthetic review] Some elements did not match my expectations.',
  '[합성 리뷰] 장단점이 고르게 느껴졌습니다.': '[Synthetic review] Strengths and weaknesses felt balanced.',
  '과거 평가에서 유사한 스타일 선호': 'Past ratings suggest a preference for a similar style',
  '유사 스타일 근거가 아직 제한적': 'Limited evidence for similar styles',
  '최근 극장 방문 빈도 높음': 'High recent cinema-visit frequency',
  '동일 장르 최근 관람 피로': 'Recent fatigue from the same genre',
}));

const fileTranslations=new Map();
for (const [file,scope] of [
  ['movie-first-english-suggestions.json',['MovieFirstApp.tsx','AnnualWorkflow.tsx','MovieCatalogPage.tsx','ScheduleComparison.tsx']],
  ['movie-first-detail-english.json',['MovieFirstTimeline.tsx','MovieFirstAudienceDetail.tsx']],
  ['movie-first-engine-english.json',[]],
]) {
  const map=JSON.parse(await fs.readFile(path.join(root,'teaching/ie437-model-answer/authoring',file),'utf8'));
  for(const [original,english] of Object.entries(map)) {
    if(typeof english!=='string'||/[가-힣]/.test(english))throw new Error('Incomplete English translation: '+original);
    if(!scope.length)translations.set(original,english);
  }
  for(const filename of scope)fileTranslations.set(filename,new Map(Object.entries(map)));
}

async function walk(dir) {
  const result = [];
  for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(p)); else result.push(p);
  }
  return result;
}
function escapedTemplate(value) { return value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${'); }
function translateSource(file, source) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  function visit(node) {
    const eligible = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node);
    if (eligible && /[가-힣]/.test(node.text)) {
      const translated = fileTranslations.get(path.basename(file))?.get(node.text.trim()) ?? translations.get(node.text.trim());
      if (translated !== undefined) {
        let replacement;
        if (ts.isJsxText(node)) replacement = translated.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') + (node.text.endsWith(' ') ? ' ' : '');
        else if (ts.isTemplateHead(node)) replacement = '`' + escapedTemplate(translated) + '${';
        else if (ts.isTemplateMiddle(node)) replacement = '}' + escapedTemplate(translated) + '${';
        else if (ts.isTemplateTail(node)) replacement = '}' + escapedTemplate(translated) + '`';
        else replacement = JSON.stringify(translated);
        edits.push({ start: node.getStart(parsed), end: node.end, replacement });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  for (const edit of edits.sort((a,b) => b.start-a.start)) source = source.slice(0,edit.start) + edit.replacement + source.slice(edit.end);
  return source.replaceAll("'ko-KR'", "'en-GB'").replaceAll('CGV', 'cinema operator').replaceAll('Omelet', 'development team').replaceAll('SCHEDULE B · VALID CHALLENGER','SCHEDULE B · CURRENT CANDIDATE');
}

try {
  await fs.cp(path.join(root, 'src'), path.join(scratch, 'src'), { recursive: true });
  await fs.copyFile(path.join(root, 'tsconfig.json'), path.join(scratch, 'tsconfig.json'));
  await fs.symlink(path.join(root, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
  // The existing import handler loads the original 24-film annual classroom fixture. The calculation
  // engine and its settings are unchanged; students can still upload their own files.
  const fixture=await fs.readFile(path.join(output,'audience/Movies.csv'),'utf8');
  const movieFirstFile=path.join(scratch,'src/components/annual/MovieFirstApp.tsx');
  let movieFirst=await fs.readFile(movieFirstFile,'utf8');
  const samples=`<a className="secondary-button" href="/samples/audience-annual-2027-sample.xlsx" download>샘플 엑셀 다운로드</a><button className="secondary-button" disabled={busy} onClick={()=>send({type:'SAMPLE_MF'})}>영화 CSV 다운로드</button>`;
  if(!movieFirst.includes(samples))throw new Error('Classroom sample anchor changed');
  movieFirst=movieFirst.replace(samples,`<button className="secondary-button" disabled={busy||!view} onClick={()=>void upload(new File([CLASSROOM_CSV],'Movies.csv',{type:'text/csv'}))}>Load annual sample · 24 films</button><a className="secondary-button" href="Movies.csv" download="Movies.csv">Download sample CSV</a>`);
  const catalogHeading='<h2>영화 상세와 연간 상영기간</h2>';
  if(!movieFirst.includes(catalogHeading))throw new Error('Annual catalog heading changed');
  movieFirst=movieFirst.replace(catalogHeading,catalogHeading+'<p className="note-box">Annual classroom sample: 24 fictional films, two releases each month from January through December 2027. The two films compete throughout each month. Load the sample below or upload your own Movies.csv / Excel workbook.</p>');
  movieFirst=movieFirst.replace('type Forecast=', 'const CLASSROOM_CSV='+JSON.stringify(fixture)+';\n\ntype Forecast=');
  movieFirst=movieFirst.replace(/<a className="annual-legacy"[^>]*>[\s\S]*?<\/a>/,'');
  movieFirst=movieFirst.replace('href="/?model=movie-first"','href="demo.html"');
  await fs.writeFile(movieFirstFile,movieFirst);
  const mainFile=path.join(scratch,'src/main.tsx');
  await fs.writeFile(mainFile,"if (!window.location.hash) window.location.hash='#schedule';\n"+await fs.readFile(mainFile,'utf8'));
  const studio=path.join(scratch,'src/components/schedule/ScheduleStudioPage.tsx');
  let studioSource=await fs.readFile(studio,'utf8');
  studioSource=studioSource.replace('    <div className="schedule-kpis">','    <p className="case-demo-scope">Case A · Schedule experiments. This existing application uses a synthetic audience evaluator and local candidate search. A learned response model and Bayesian optimization are proposed methods, not implemented engines in this app.</p>\n    <div className="schedule-kpis">');
  await fs.writeFile(studio,studioSource);
  const sourceFiles = await walk(path.join(root, 'src'));
  const hash = createHash('sha256');
  for (const file of sourceFiles) hash.update(path.relative(root,file)).update('\0').update(await fs.readFile(file)).update('\0');
  const sourceSha256 = hash.digest('hex');
  for (const file of await walk(path.join(scratch, 'src'))) {
    if (/\.tsx?$/.test(file)) await fs.writeFile(file, translateSource(file, await fs.readFile(file,'utf8')));
  }
  // Add public-package navigation in the React sidebar, outside the app's
  // internal nav so it stays visible when optional apps collapse that nav.
  const homeLink='<a className="worked-examples-home" href="../index.html"><span aria-hidden="true">←</span>All worked examples</a><a className="worked-examples-guide" href="demo-guide.html">Demo guide</a>';
  for (const file of ['src/components/layout/AppShell.tsx','src/components/annual/MovieFirstApp.tsx']) {
    const target=path.join(scratch,file);
    const source=await fs.readFile(target,'utf8');
    const brands=[...source.matchAll(/<a className="brand"[\s\S]*?<\/a>/g)];
    if (brands.length!==1) throw new Error(`Expected one sidebar brand for public navigation: ${file}`);
    await fs.writeFile(target,source.replace(brands[0][0],brands[0][0]+homeLink));
  }
  await fs.appendFile(path.join(scratch,'src/styles/global.css'),`\n/* Public worked-example navigation uses normal sidebar flow. */
.sidebar .worked-examples-home{display:flex;align-items:center;gap:8px;margin-top:20px;padding:11px 10px;border:1px solid #34363e;border-radius:4px;color:#c9cbd2;text-decoration:none;font-size:12px;line-height:1.35;flex-shrink:0}
.sidebar .worked-examples-home:hover{background:#292931;color:#fff}
.sidebar .worked-examples-guide+nav{margin-top:20px}
@media(max-width:1100px){.sidebar .worked-examples-home{flex-direction:column;gap:3px;text-align:center;margin-top:16px;padding:8px 2px;font-size:10px;overflow-wrap:anywhere}}
@media(max-width:760px){.sidebar .worked-examples-home{flex-direction:row;gap:8px;text-align:left;padding:11px 10px;font-size:12px}}
`);
  const dataUrl = (mime, bytes) => `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`;
  let movieCatalog = await fs.readFile(path.join(scratch,'src/data/movieCatalog.ts'),'utf8');
  for (const name of ['nebula','moonlight','verdict']) {
    movieCatalog = movieCatalog.replaceAll(`/posters/${name}.svg`, dataUrl('image/svg+xml',await fs.readFile(path.join(root,`public/posters/${name}.svg`))));
  }
  const archivePoster = dataUrl('image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect width="400" height="600" fill="#15243b"/><text x="200" y="275" text-anchor="middle" fill="white" font-family="sans-serif" font-size="26">ARCHIVE FILM</text><text x="200" y="320" text-anchor="middle" fill="#b7c5d9" font-family="sans-serif" font-size="15">SYNTHETIC DEMO</text></svg>');
  movieCatalog = movieCatalog.replace(/`\/posters\/history-\$\{[^}]+\}\.svg`/, JSON.stringify(archivePoster));
  await fs.writeFile(path.join(scratch,'src/data/movieCatalog.ts'),movieCatalog);
  const forecastPath = path.join(scratch,'src/components/forecast/ForecastPage.tsx');
  await fs.writeFile(forecastPath,(await fs.readFile(forecastPath,'utf8')).replace('href="/annual.html"','href="demo-guide.html"'));

  const common = { bundle:true, write:false, minify:true, target:'es2022', platform:'browser', format:'iife', legalComments:'none', define:{ 'process.env.NODE_ENV':'"production"', __MOVIE_FIRST_SOURCE_HASH__:JSON.stringify(sourceSha256) }, metafile:true, logLevel:'silent' };
  const workers = new Map();
  for (const [workerFile,clientFile] of [
    ['src/annual/movieFirst/movieFirst.worker.ts','src/annual/movieFirst/client.ts'],
  ]) {
    const worker = await esbuild.build({ ...common, entryPoints:[path.join(scratch,workerFile)] });
    recordBundledInputs(worker);
    const workerCode = worker.outputFiles[0].text;
    workers.set(workerFile,workerCode);
    const clientPath=path.join(scratch,clientFile);
    let client=await fs.readFile(clientPath,'utf8');
    const blob=`URL.createObjectURL(new Blob([new TextDecoder().decode(Uint8Array.from(atob(${JSON.stringify(Buffer.from(workerCode).toString('base64'))}), c => c.charCodeAt(0)))], { type: 'application/javascript' }))`;
    client=client.replace(/new URL\('\.\/[^']+\.worker\.ts',\s*import\.meta\.url\)/,blob);
    // The bundled IIFE has no imports. A classic Blob Worker also works from
    // file:// in Chrome, where module Workers reject opaque file origins.
    client=client.replace(/type:\s*'module'/g,"type: 'classic'");
    if (client.includes('import.meta.url')) throw new Error(`Worker path was not inlined: ${clientFile}`);
    await fs.writeFile(clientPath,client);
  }
  const standalone=path.join(scratch,'src/publicMovieFirst.tsx');
  await fs.writeFile(standalone,`import {StrictMode} from 'react';import {createRoot} from 'react-dom/client';import {MovieFirstApp} from './components/annual/MovieFirstApp';import './styles/tokens.css';import './styles/global.css';import './components/annual/annual.css';import './components/annual/timeline.css';import './components/annual/workflow.css';const root=document.getElementById('root');if(!root)throw new Error('Missing root');createRoot(root).render(<StrictMode><MovieFirstApp/></StrictMode>);`);
  const summaries=[];
  for (const [name,entry,title,workerFile] of [
    ['audience/demo.html','src/publicMovieFirst.tsx','Movie-First Audience Simulator · M0','src/annual/movieFirst/movieFirst.worker.ts'],
  ]) {
    const main = await esbuild.build({ ...common, entryPoints:[path.join(scratch,entry)], outdir:path.join(scratch,'output'), jsx:'automatic', tsconfig:path.join(scratch,'tsconfig.json') });
    recordBundledInputs(main);
    const js = main.outputFiles.filter(f=>f.path.endsWith('.js')).map(f=>f.text).join('\n');
    const css = main.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>f.text).join('\n');
    if (!js.includes('href:"../index.html"') || !js.includes('All worked examples') || !css.includes('.worked-examples-home')) throw new Error(`Public return link was not bundled: ${name}`);
    const worker=workers.get(workerFile);
    for (const [label,code] of [['main',js],['worker',worker],['CSS',css]]) {
      const readableCode=code.replace(/\\u\{([\da-f]+)\}|\\u([\da-f]{4})/gi,(_,long,short)=>String.fromCodePoint(parseInt(long??short,16)));
      if (/[가-힣]/.test(readableCode)) throw new Error(`${name}/${label}: untranslated Hangul remains`);
      if (/\b(?:cgv|omelet)\b/i.test(code)) throw new Error(`${label}: commercial identity remains`);
      if (/fonts\.googleapis|fonts\.gstatic|\/posters\//.test(code)) throw new Error(`${label}: external asset dependency remains`);
    }
    const extra='.sidebar .worked-examples-guide{display:block;color:#c9cbd2;padding:10px;font-size:12px;text-decoration:underline;text-underline-offset:3px}.case-demo-scope{padding:14px 18px;border:1px solid #353842;background:#171922;color:#bdc5d0;font-size:13px;line-height:1.6;margin-bottom:20px}';
    const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="ie437-source-sha256" content="${sourceSha256}"><title>IE437 · ${title}</title><style>${(css+extra).replaceAll('</style','<\\/style')}</style></head><body><div id="root"></div><noscript>This interactive synthetic demo requires JavaScript.</noscript><script>${js.replaceAll('</script','<\\/script')}</script></body></html>\n`;
    const target=path.join(output,name);
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,html);
    summaries.push({file:`student/${name}`,bytes:Buffer.byteLength(html),sourceSha256,outputSha256:createHash('sha256').update(html).digest('hex'),language:'en',workerBytes:Buffer.byteLength(worker)});
  }
  const notices=await thirdPartyNotices();
  console.log(JSON.stringify({apps:summaries,notices,translations:translations.size,originalSourceUnchanged:true,externalDependencies:0},null,2));
  if(!process.argv.includes('--audience-only'))await import('./build-response-demo.mjs');
} finally {
  await fs.rm(scratch,{recursive:true,force:true});
}
