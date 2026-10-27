const { execSync } = require('child_process');
const content = execSync('git show 34c4853:frontend/src/data/mockProducts.js', { encoding: 'utf8' });
const matches = [];
const regex = /id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push({ id: m[1], name: m[2] });
}
console.log('Total products in 34c4853 mockProducts.js:', matches.length);
console.log(matches.slice(0, 30));
