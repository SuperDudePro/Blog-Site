import fs from 'node:fs';
import path from 'node:path';
import { candidateBaseline, ctaAuditMarkdown, evaluateBaseline, inventoryMarkdown, scanOurOldDad } from './post-contract.mjs';

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function touchedPostSlugs(root, base) {
  if (!base) return new Set();
  const { execFileSync } = await import('node:child_process');
  const output = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { cwd: root, encoding: 'utf8' });
  return new Set(
    output
      .split(/\r?\n/)
      .map((file) => file.match(/^src\/content\/posts\/([^/]+)\//)?.[1])
      .filter(Boolean),
  );
}

const root = process.cwd();
const scan = scanOurOldDad(root);
const report = inventoryMarkdown(scan);
const candidate = candidateBaseline(scan);
const reportPath = option('--write-report');
const candidatePath = option('--write-candidate');
const ctaReportPath = option('--write-cta-report');

if (reportPath) {
  fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
  fs.writeFileSync(path.resolve(reportPath), report);
}
if (candidatePath) {
  fs.mkdirSync(path.dirname(path.resolve(candidatePath)), { recursive: true });
  fs.writeFileSync(path.resolve(candidatePath), `${JSON.stringify(candidate, null, 2)}\n`);
}
if (ctaReportPath) {
  fs.mkdirSync(path.dirname(path.resolve(ctaReportPath)), { recursive: true });
  fs.writeFileSync(path.resolve(ctaReportPath), ctaAuditMarkdown(scan));
}

const current = scan.posts.filter((post) => !post.defects.length).length;
const legacy = scan.posts.length - current;
console.log(`${scan.site} post contract: ${scan.posts.length} scanned, ${current} current, ${legacy} legacy.`);

if (process.argv.includes('--enforce')) {
  const baselinePath = path.resolve(option('--baseline') || 'post-contract-baseline.json');
  if (!fs.existsSync(baselinePath)) {
    console.error(`Post contract failed: missing reviewed baseline ${baselinePath}.`);
    process.exit(1);
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const base = option('--changed-from') || process.env.POST_CONTRACT_BASE_SHA;
  const touchedSlugs = await touchedPostSlugs(root, base);
  const errors = evaluateBaseline(scan, baseline, { touchedSlugs });
  if (errors.length) {
    console.error(`Post contract failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Post contract passed with the reviewed legacy baseline.');
}
