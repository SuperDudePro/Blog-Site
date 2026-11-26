import { setTimeout as wait } from 'node:timers/promises';
import { getSiteProfile } from '../siteProfiles.mjs';
import { LEDGER_REPO, LEDGER_CONTEXT, mergedManifest, verifyLivePost, reconcileLedger } from '../lib/postLedger.mjs';

const repository = process.env.SITE_REPOSITORY;
const prNumber = Number(process.env.PUBLISHING_PR_NUMBER);
const token = process.env.GITHUB_TOKEN;
const ledgerToken = process.env.WILBERT_LEDGER_TOKEN;
getSiteProfile({ repository });
if (!Number.isSafeInteger(prNumber) || prNumber < 1 || !token) throw new Error('Missing trusted site repository, pull request number or site token.');
function requester(repo, credential) {
  return async (path, options = {}) => {
    const response = await fetch('https://api.github.com/repos/' + repo + path, {
      method: options.method || 'GET', redirect: 'error',
      signal: AbortSignal.timeout(25000),
      headers: { accept: 'application/vnd.github+json', authorization: 'Bearer ' + credential, 'content-type': 'application/json', 'x-github-api-version': '2022-11-28', 'user-agent': 'wilbert-post-ledger' },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    if (!response.ok) throw Object.assign(new Error('GitHub request failed (HTTP ' + response.status + ').'), { status: response.status });
    return response.json();
  };
}
const request = requester(repository, token);
const pull = await request('/pulls/' + prNumber);
const { manifest } = mergedManifest(repository, pull);
const status = (state, description) => request('/statuses/' + pull.merge_commit_sha, { method: 'POST', body: { state, context: LEDGER_CONTEXT, description, target_url: 'https://github.com/' + repository + '/actions/runs/' + process.env.GITHUB_RUN_ID } });
const date = new Date().toISOString().slice(0, 10);
if (!['Featured','Recent'].includes(manifest.status)) {
  await status('success', 'Non-public draft/placeholder; no published-ledger entry.');
  console.log('Non-public post intentionally excluded.');
} else {
  await status('pending', 'Waiting for verified live post and ledger reconciliation.');
  try {
    if (!ledgerToken) throw new Error('Configure WILBERT_LEDGER_TOKEN in the trusted publishing repository.');
    // Token is never sent to public pages, never printed, and is only used
    // for the hard-coded private ledger repository.
    const fetchText = async url => {
      const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'cache-control': 'no-cache' } });
      if (!response.ok) throw new Error('Public verification HTTP ' + response.status);
      return response.text();
    };
    let record;
    for (let i = 0; i < 24; i++) {
      try { record = await verifyLivePost({ repository, pull, request, fetchText, date }); break; }
      catch (error) { if (i === 23) throw error; await wait(12000); }
    }
    if (!record || record.skipped) throw new Error('No verified public post record.');
    const result = await reconcileLedger(record, requester(LEDGER_REPO, ledgerToken));
    await status('success', 'Published-post ledger verified; entry ' + String(result.id).padStart(3, '0') + '.');
    console.log('Ledger entry ' + result.id + (result.changed ? ' written and verified.' : ' already present and verified.'));
  } catch (error) {
    await status('failure', 'Post ledger closeout failed; inspect and rerun this workflow.');
    // Do not echo private ledger content, API response bodies or credentials.
    console.error('Post ledger closeout: ' + String(error.message).slice(0, 300));
    process.exitCode = 1;
  }
}
