import fs from 'node:fs';
import path from 'node:path';

const commit =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.COMMIT_SHA ||
  'local';

const outputPath = path.join(process.cwd(), 'public', 'deployment.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ commit, generatedAt: new Date().toISOString() }, null, 2)}\n`,
);

console.log(`Wrote public/deployment.json for ${commit}.`);
