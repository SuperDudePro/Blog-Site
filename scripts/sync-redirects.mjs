import { readFileSync, writeFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync('redirects.json', 'utf8'));
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
vercel.redirects = (registry.redirects ?? []).map((redirect) => {
  const copy = { ...redirect };
  delete copy.note;
  return copy;
});
writeFileSync('vercel.json', `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`Synchronized ${vercel.redirects.length} redirect${vercel.redirects.length === 1 ? '' : 's'} into vercel.json.`);
