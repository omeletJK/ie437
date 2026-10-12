// Publish the explicitly listed public worked-example files, separately from assignment briefs.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export function zipFiles(files) {
  const local=[],central=[];let offset=0;
  for(const {name,data} of files){
    const filename=Buffer.from(name);let crc=0xffffffff;
    for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    crc=(crc^0xffffffff)>>>0;
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
    local.push(header,filename,data);
    const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);header.copy(entry,6,4,30);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=header.length+filename.length+data.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,end]);
}
const text=(value,field)=>{if(typeof value!=='string'||!value.trim())throw new Error(`Worked example ${field} must be nonempty text`);return value.trim();};
const safeName=value=>typeof value==='string'&&value.split('/').every(part=>/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part))&&/\.(?:html|md|json|csv|xlsx|js|css|svg|png|jpg|woff2)$/.test(value);
function regularPath(base,name,file=false){let current=base;const parts=name.split('/');for(let i=0;i<parts.length;i++){current=path.join(current,parts[i]);const stat=fs.lstatSync(current),last=i===parts.length-1;if(stat.isSymbolicLink()||!(last&&file?stat.isFile():stat.isDirectory()))throw new Error('Worked example source must be a regular '+(last&&file?'file':'directory')+', not a symlink: '+current);}return current;}

export function publishWorkedExamples(root){
  const catalog=path.join(root,'md/_WORKED_EXAMPLES.md');let entries=[];
  if(fs.existsSync(catalog)){const match=fs.readFileSync(catalog,'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!match)throw new Error('_WORKED_EXAMPLES.md: missing YAML front matter');entries=yaml.load(match[1])?.worked_examples;if(!Array.isArray(entries))throw new Error('worked_examples must be a list');}
  const ids=new Set();
  const prepared=entries.map(entry=>{
    const id=text(entry?.id,'id');if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||ids.has(id))throw new Error('Invalid or duplicate worked example id');ids.add(id);
    if(!Number.isSafeInteger(entry.assignment)||entry.assignment<1)throw new Error('Worked example assignment must be a positive integer');
    const title=text(entry.title,'title'),summary=text(entry.summary,'summary'),version=text(entry.version,'version'),start=text(entry.entry,'entry');
    if(!Array.isArray(entry.files)||!entry.files.length||entry.files.length>100)throw new Error('Worked example files must be a nonempty allowlist, at most 100');
    const source=regularPath(root,`teaching/${id}/student`),names=new Set();let modifiedAt=0;
    const files=entry.files.map(value=>{
      const name=text(value,'file name');if(!safeName(name)||names.has(name))throw new Error('Invalid or duplicate worked example file name: '+name);names.add(name);
      const filename=regularPath(source,name,true);modifiedAt=Math.max(modifiedAt,fs.statSync(filename).mtimeMs);return {name,data:fs.readFileSync(filename)};
    });
    if(!names.has(start)||!start.endsWith('.html'))throw new Error('Worked example entry must be a listed HTML file');
    const prefix=`worked-examples/${id}/`,archiveName=`IE437-Assignment-${String(entry.assignment).padStart(2,'0')}-Worked-Examples-EN.zip`;
    return {id,assignment:entry.assignment,title,summary,version,modifiedAt,startURL:prefix+start,files,archive:{name:archiveName,url:prefix+archiveName,data:zipFiles(files)}};
  });
  const output=path.join(root,'html/worked-examples');fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
  return prepared.map(item=>{const dir=path.join(output,item.id);fs.mkdirSync(dir);for(const file of item.files){const filename=path.join(dir,file.name);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,file.data);}fs.writeFileSync(path.join(dir,item.archive.name),item.archive.data);return {...item,files:item.files.map(({data,...file})=>({...file,size:data.length})),archive:{name:item.archive.name,url:item.archive.url,size:item.archive.data.length}};});
}
