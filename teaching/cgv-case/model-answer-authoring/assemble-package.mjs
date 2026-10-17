import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {generatePortalPages} from './portal-pages.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),student=path.join(here,'student');
const course=process.env.IE437_SLIDES_ROOT||path.resolve(here,'../../../ie437-slides');
const files=['classroom-comparison.html','classroom-comparison.md','index.html','THIRD_PARTY_NOTICES.md','reference/assignment.md','reference/problem-definition-example.md','reference/problem-definition-template.md','reference/problem-classification-reference.md','response/verification.json','README.md','README.html','verification.md','verification.html','response/problem-definition.md','response/problem-definition.html','response/demo.html','response/proposal.html','response/extended-proposal.html','response/CinemaPlanning.json','response/Screenings.csv','audience/problem-definition.md','audience/problem-definition.html','audience/demo.html','audience/proposal.html','audience/extended-proposal.html','response/demo-guide.md','response/demo-guide.html','audience/demo-guide.md','audience/demo-guide.html','audience/Movies.csv'];
await import('./build-classroom-comparison.mjs');
await generatePortalPages(student,course);
const items=[];for(const name of files){const data=await readFile(path.join(student,name));items.push({file:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
await writeFile(path.join(student,'manifest.json'),JSON.stringify({schemaVersion:1,version:'1.8',purpose:'IE437 Assignment 1 public worked examples',disclosure:'All records, outcomes and engine results are synthetic. Case A supports planning JSON/CSV import, operating-rule configuration, aggregate-response ILS optimization and timetable inspection/export; learned response models and BO are not implemented. Case B uses the existing movie-first M0 individual-consumer simulator with its original 24-film, 365-day annual sample translated into English. Both demo sites and guides are English.',files:items},null,2)+'\n');
console.log(`Prepared ${files.length+1} public files with Markdown reading views and checksums.`);
