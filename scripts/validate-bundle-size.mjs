import fs from 'node:fs';
import path from 'node:path';

const budgetBytes = 300 * 1024;
const html = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
const source = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1];
if (!source) throw new Error('Could not identify the initial module script in dist/index.html.');
const assetPath = path.resolve('dist', source.replace(/^\//, ''));
const bytes = fs.statSync(assetPath).size;
if (bytes > budgetBytes) {
  throw new Error(`Initial JavaScript is ${(bytes / 1024).toFixed(2)} KB; budget is ${budgetBytes / 1024} KB.`);
}
console.log(`Initial JavaScript budget passed: ${(bytes / 1024).toFixed(2)} KB / ${budgetBytes / 1024} KB.`);
