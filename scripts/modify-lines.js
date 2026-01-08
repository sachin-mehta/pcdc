#!/usr/bin/env node
/*
 Simple utility to modify specific lines in files.
 Usage examples:
  - Modify a single file: 
      node scripts/modify-lines.js --file "path/to/file" --match "old text" --replace "new text"
  - Recursively modify files under a directory:
      node scripts/modify-lines.js --dir "some/dir" --match "old text" --replace "new text"

 This script intentionally has no external dependencies so it can run in CI without installing extras.
 It performs a plain string replacement (not a regex) on files that contain the match.
*/
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/modify-lines.js [--file <file>] [--dir <dir>] --match <text> --replace <text>');
  process.exit(1);
}

const argv = process.argv.slice(2);
let file, dir, match, replaceWith;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--file') file = argv[++i];
  else if (a === '--dir') dir = argv[++i];
  else if (a === '--match') match = argv[++i];
  else if (a === '--replace') replaceWith = argv[++i];
}

if (!match || replaceWith === undefined) usage();

function processFile(fpath) {
  try {
    const content = fs.readFileSync(fpath, 'utf8');
    if (content.indexOf(match) === -1) return false;
    const updated = content.split(match).join(replaceWith);
    fs.writeFileSync(fpath, updated, 'utf8');
    console.log(`Modified: ${fpath}`);
    return true;
  } catch (err) {
    console.error(`Error processing ${fpath}:`, err.message);
    return false;
  }
}

function walkAndProcess(dirPath) {
  let changed = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach(e => {
    const p = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      // skip node_modules by default unless explicitly editing there
      if (e.name === 'node_modules' && !process.env.ALLOW_NODE_MODULES) return;
      changed += walkAndProcess(p);
    } else if (e.isFile()) {
      const ok = processFile(p);
      if (ok) changed++;
    }
  });
  return changed;
}

let total = 0;
if (file) {
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    if (processFile(file)) total++;
  } else {
    console.error('File not found:', file);
    process.exit(2);
  }
}

if (dir) {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    total += walkAndProcess(dir);
  } else {
    console.error('Directory not found:', dir);
    process.exit(2);
  }
}

if (!file && !dir) usage();

console.log(`Completed. Files modified: ${total}`);
process.exit(0);
