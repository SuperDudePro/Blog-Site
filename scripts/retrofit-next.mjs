import fs from 'node:fs';
import path from 'node:path';
import { retrofitQueue, scanOurOldDad } from './post-contract.mjs';

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const root = process.cwd();
const baselinePath = path.resolve(option('--baseline') || 'post-contract-baseline.json');
if (!fs.existsSync(baselinePath)) {
  console.error(`Retrofit queue failed: missing reviewed baseline ${baselinePath}.`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
if (baseline.status !== 'reviewed') {
  console.error('Retrofit queue failed: the legacy baseline is not marked reviewed.');
  process.exit(1);
}

const scan = scanOurOldDad(root);
const queue = retrofitQueue(scan, baseline);
const result = {
  site: scan.site,
  repository: scan.repository,
  total: queue.length,
  next: queue[0] || null,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else if (!result.next) {
  console.log('The Our Old Dad retrofit queue is empty.');
} else {
  console.log(
    `Next: ${result.next.slug} (${result.next.queueNumber}/${result.next.queueTotal}, `
    + `${result.next.publishedAt || 'date unavailable'}, ${result.next.priority})`,
  );
  for (const defect of result.next.defects) {
    console.log(`- ${defect.ruleId}: ${defect.message}`);
  }
}
