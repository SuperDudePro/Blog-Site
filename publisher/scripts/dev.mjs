import { spawn } from 'node:child_process';

const children = [
  spawn(process.execPath, ['server.mjs'], { stdio: 'inherit' }),
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:ui'], { stdio: 'inherit' }),
];

let closing = false;
const shutdown = (code = 0) => {
  if (closing) return;
  closing = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250).unref();
};

for (const child of children) {
  child.on('exit', (code) => {
    if (!closing && code !== 0) shutdown(code ?? 1);
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
