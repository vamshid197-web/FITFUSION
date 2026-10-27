import fs from 'fs';
import path from 'path';

function findFiles(dir, exts = ['.js', '.jsx', '.json']) {
  let list = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules') list = list.concat(findFiles(full, exts));
    } else if (exts.includes(path.extname(item.name))) {
      list.push(full);
    }
  }
  return list;
}

const files = findFiles('C:/FITFUSION/frontend/src');
const urlRegex = /https?:\/\/[^\s'"\`)]+/g;
const allUrls = new Set();
const unsplashUrls = new Set();
const pexelsUrls = new Set();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf-8');
  const matches = text.match(urlRegex) || [];
  for (const m of matches) {
    allUrls.add(m);
    if (m.includes('unsplash.com')) unsplashUrls.add(m);
    if (m.includes('pexels.com')) pexelsUrls.add(m);
  }
}

import { execSync } from 'child_process';
try {
  const gitMock = execSync('git show 34c4853:frontend/src/data/mockProducts.js', { encoding: 'utf-8' });
  const gitMatches = gitMock.match(urlRegex) || [];
  gitMatches.forEach(m => {
    allUrls.add(m);
    if (m.includes('unsplash.com')) unsplashUrls.add(m);
    if (m.includes('pexels.com')) pexelsUrls.add(m);
  });
} catch (e) {}

console.log('Total external URLs in frontend/src + git:', allUrls.size);
console.log('Unsplash URLs:', unsplashUrls.size);
console.log('Pexels URLs:', pexelsUrls.size);

console.log('\nSample Unsplash URLs:');
[...unsplashUrls].slice(0, 10).forEach(u => console.log(u));
