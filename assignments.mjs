// Publish only the student documents explicitly listed in md/_ASSIGNMENTS.md.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// A deterministic, uncompressed ZIP: small Markdown handouts need no external archiver.
// Fixed DOS dates make the archive independent of checkout times and build machines.
function zipFiles(files) {
  const local = [], central = [];
  let offset = 0;
  for (const { name, data } of files) {
    const filename = Buffer.from(name);
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(0x21, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(filename.length, 26);
    local.push(header, filename, data);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    header.copy(entry, 6, 4, 30);
    entry.writeUInt32LE(offset, 42);
    central.push(entry, filename);
    offset += header.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

function requiredText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Assignment ${field} must be nonempty text`);
  return value.trim();
}

export function publishAssignments(root) {
  const catalog = path.join(root, 'md/_ASSIGNMENTS.md');
  let entries = [];
  if (fs.existsSync(catalog)) {
    const match = fs.readFileSync(catalog, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error('_ASSIGNMENTS.md: missing YAML front matter');
    entries = yaml.load(match[1])?.assignments;
    if (!Array.isArray(entries)) throw new Error('_ASSIGNMENTS.md: assignments must be a list');
  }
  const ids = new Set(), numbers = new Set();
  // Read and validate the entire catalog before replacing any existing public output.
  const prepared = entries.map(entry => {
    const id = requiredText(entry?.id, 'id');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error('Invalid or duplicate assignment id: ' + id);
    ids.add(id);
    const number = entry.number;
    if (!Number.isSafeInteger(number) || number < 1 || numbers.has(number)) throw new Error('Invalid or duplicate assignment number');
    numbers.add(number);
    const title = requiredText(entry.title, 'title');
    const summary = requiredText(entry.summary, 'summary');
    const version = requiredText(entry.version, 'version');
    const subtitle = entry.subtitle == null ? '' : requiredText(entry.subtitle, 'subtitle');
    const due = entry.due == null ? 'To be announced' : requiredText(entry.due, 'due');
    if (!Array.isArray(entry.files) || !entry.files.length || entry.files.length > 100) throw new Error('Assignment files must be a nonempty list (at most 100)');
    let source = root;
    for (const part of ['teaching', id, 'student']) {
      source = path.join(source, part);
      if (!fs.lstatSync(source).isDirectory()) throw new Error('Student source must be a regular directory, not a symlink: ' + source);
    }
    const names = new Set();
    const prefix = `assignments/${id}/`;
    let modifiedAt = 0;
    const files = entry.files.map(file => {
      const name = requiredText(file?.name, 'file name');
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.md$/.test(name) || names.has(name)) throw new Error('Invalid or duplicate student file name: ' + name);
      names.add(name);
      const label = requiredText(file.label, 'file label');
      const filename = path.join(source, name);
      const stat = fs.lstatSync(filename);
      if (!stat.isFile()) throw new Error('Student document must be a regular file, not a symlink: ' + filename);
      modifiedAt = Math.max(modifiedAt, stat.mtimeMs);
      return { name, label, url: prefix + name, data: fs.readFileSync(filename) };
    });
    const archiveName = `IE437-Assignment-${String(number).padStart(2, '0')}.zip`;
    return { id, number, title, subtitle, summary, version, due, modifiedAt, files,
      archive: { name: archiveName, url: prefix + archiveName, data: zipFiles(files) } };
  });
  const output = path.join(root, 'html/assignments');
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  return prepared.map(item => {
    const dir = path.join(output, item.id);
    fs.mkdirSync(dir);
    const publish = ({ data, ...file }) => {
      fs.writeFileSync(path.join(dir, file.name), data);
      return { ...file, size: data.length };
    };
    return { ...item, files: item.files.map(publish), archive: publish(item.archive) };
  });
}
