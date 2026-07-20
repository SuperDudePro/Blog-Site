import { readFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync('redirects.json', 'utf8'));
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const errors = [];
const redirects = registry.redirects ?? [];

function fail(message) {
  errors.push(message);
}

let canonical;
try {
  canonical = new URL(registry.canonicalOrigin);
  if (canonical.pathname !== '/' || canonical.search || canonical.hash) {
    fail('canonicalOrigin must contain only scheme and host');
  }
} catch {
  fail('canonicalOrigin is not a valid absolute URL');
}

const keys = new Set();
const pathSources = new Map();
for (const [index, redirect] of redirects.entries()) {
  const label = `redirects[${index}]`;
  if (!redirect || typeof redirect !== 'object') {
    fail(`${label} must be an object`);
    continue;
  }
  if (typeof redirect.source !== 'string' || !redirect.source.startsWith('/')) {
    fail(`${label}.source must start with /`);
  }
  if (typeof redirect.destination !== 'string' || !redirect.destination) {
    fail(`${label}.destination is required`);
  }
  if (typeof redirect.permanent !== 'boolean') {
    fail(`${label}.permanent must be true or false`);
  }

  const runtimeRedirect = { ...redirect };
  delete runtimeRedirect.note;
  const key = JSON.stringify({ source: redirect.source, has: redirect.has ?? [], missing: redirect.missing ?? [] });
  if (keys.has(key)) fail(`${label} duplicates another redirect source and condition set`);
  keys.add(key);

  if (!redirect.has && !redirect.missing && typeof redirect.source === 'string') {
    pathSources.set(redirect.source, redirect.destination);
  }

  if (redirect.source === redirect.destination) {
    fail(`${label} redirects to itself`);
  }

  if (/^https?:\/\//i.test(redirect.destination)) {
    try {
      const destination = new URL(redirect.destination.replace(/:\w+\*/g, 'placeholder'));
      if (canonical && destination.origin !== canonical.origin) {
        fail(`${label} points to non-canonical origin ${destination.origin}`);
      }
    } catch {
      fail(`${label}.destination is malformed`);
    }
  } else if (!redirect.destination.startsWith('/')) {
    fail(`${label}.destination must be an absolute canonical URL or root-relative path`);
  }
}

for (const [source, destination] of pathSources) {
  if (!destination?.startsWith('/')) continue;
  const cleanDestination = destination.split(/[?#]/)[0];
  if (pathSources.has(cleanDestination)) {
    fail(`redirect chain detected: ${source} -> ${cleanDestination} -> ${pathSources.get(cleanDestination)}`);
  }
}

const runtimeRedirects = redirects.map((redirect) => {
  const copy = { ...redirect };
  delete copy.note;
  return copy;
});
if (JSON.stringify(vercel.redirects ?? []) !== JSON.stringify(runtimeRedirects)) {
  fail('vercel.json redirects do not exactly match redirects.json; run npm run sync:redirects');
}

if (errors.length) {
  console.error(`Redirect validation failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Redirect validation passed: ${redirects.length} redirect${redirects.length === 1 ? '' : 's'} checked.`);
