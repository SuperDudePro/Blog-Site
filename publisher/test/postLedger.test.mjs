import test from 'node:test';
import assert from 'node:assert/strict';
import { getSiteProfile } from '../siteProfiles.mjs';
import { upsertLedger, ledgerStatusFromStatuses, mergedManifest, reconcileLedger, verifyLivePost } from '../lib/postLedger.mjs';
const sha = 'a'.repeat(40), merge = 'b'.repeat(40), deployed = 'c'.repeat(40);
const date = '2026-11-26', mergedAt = date + 'T08:00:00Z';
const tracker = '# Blog Post Tracker\n\nVersion: 1.4\nLast Updated: 2026-11-25\n\n## Inventory Count Checkpoint — 2026-11-25\n\n- prior count\n\n## Our Old Dad Editorial Categories — Site Handoff\n\n- Published Junk Drawer entries: none.\n\n## Current Social-Ready Index\n\n### 001 — Legacy\n- Site: OurOldDad\n- Status: Legacy / unverified\n- Slug: \x60legacy\x60\n\n### 084 — Existing\n- Site: OurOldDad\n- Status: Recent\n- Slug: \x60existing\x60\n- Synopsis: hand-authored synopsis\n- Social angles/hooks: hand-authored hooks\n\n## Placeholder / Not Social-Ready\n\n### Draft\n- Slug: \x60draft\x60\n\n## Change Log\n- old\n';
const make = (kind = 'ood', slug = 'new-post') => {
  const profile = getSiteProfile({ targetSite: kind === 'ood' ? 'Our Old Dad' : 'LifeEducation' });
  const manifest = { targetSite: profile.targetSite, repository: profile.repository, title: 'New title', slug, excerpt: 'Excerpt of the article.', publishedAt: date, status: 'Recent', ...(kind === 'ood' ? { section: 'diary', format: 'junk-drawer' } : { topic: 'Domains', tags: ['LifeEducation'] }), canonicalUrl: profile.canonicalPrefix + slug, destinationPath: 'src/content/posts/' + slug + '/', buildCommand: profile.buildCommand, images: ['card','hero'].map(role => ({ role, file: profile.imageDirectory + role + '-image.webp', alt: role, caption: null, sha256: 'd'.repeat(64) })) };
  const sourceText = Object.entries(manifest).filter(([k,v]) => typeof v === 'string').map(([k,v]) => k + ': ' + JSON.stringify(v) + ',').join('\n') + '\n<h2>What changed</h2><p>This is a sufficiently long paragraph to derive an editorial extract from the published source.</p>';
  const body = '- Site profile: **' + manifest.targetSite + '**\n- Slug: \x60' + slug + '\x60\n- Destination: \x60' + manifest.destinationPath + '\x60\n- Canonical URL: ' + manifest.canonicalUrl + '\n- Handoff method: **Direct GitHub**\n\n## Publisher manifest\n\x60\x60\x60json\n' + JSON.stringify(manifest) + '\n\x60\x60\x60';
  const pull = { number: 12, title: 'Publish ' + manifest.title, body, merged: true, merged_at: mergedAt, merge_commit_sha: merge, base: { ref: 'main' }, head: { repo: { full_name: profile.repository }, ref: 'publisher/' + slug, sha }, html_url: 'https://github.com/' + profile.repository + '/pull/12' };
  return { profile, manifest, sourceText, mergeCommit: merge, prNumber: 12, mergedAt, date, pull };
};
test('appends after last number, preserves placeholders and is idempotent', () => {
  const record = make();
  const first = upsertLedger(tracker, record);
  assert.equal(first.id, 85); assert.equal(first.changed, true);
  assert.match(first.content, /### 085 — New title/);
  assert.match(first.content, /Source-derived extract/);
  assert.match(first.content, /3 numbered tracker entries/);
  assert.match(first.content, /## Placeholder \/ Not Social-Ready\n\n### Draft/);
  const second = upsertLedger(first.content, record);
  assert.equal(second.changed, false); assert.equal(second.content, first.content);
});
test('existing identity retains number and authored editorial data', () => {
  const record = make('ood','existing');
  const result = upsertLedger(tracker, record);
  assert.equal(result.id, 84);
  assert.match(result.content, /### 084 — New title/);
  assert.match(result.content, /Synopsis: hand-authored synopsis/);
  assert.match(result.content, /Social angles\/hooks: hand-authored hooks/);
  assert.doesNotMatch(result.content, /### 085/);
});
test('same slug on different site is separate; authored new fields are used', () => {
  const record = make('life','existing');
  record.manifest.tracker = { synopsis: 'Author synopsis', socialHooks: ['First', 'Second'] };
  const r = upsertLedger(tracker,record);
  assert.equal(r.id,85);
  assert.match(r.content,/Synopsis: Author synopsis/);
  assert.match(r.content,/Social angles\/hooks: First; Second/);
});
test('duplicate identities fail closed; newer verified entry cannot be rolled back', () => {
  assert.throws(() => upsertLedger(tracker.replace('### 084 — Existing','### 001 — Existing'),make()),/Duplicate/);
  const first = upsertLedger(tracker,make('ood','existing'));
  const old = {...make('ood','existing'), mergedAt:'2026-11-25T00:00:00Z'};
  assert.equal(upsertLedger(first.content,old).changed,false);
});
test('only trusted merged publisher PRs are admitted; package and direct are equivalent', () => {
  for (const kind of ['ood','life']) {
    const r = make(kind);
    assert.equal(mergedManifest(r.profile.repository,r.pull).manifest.slug,r.manifest.slug);
    assert.equal(mergedManifest(r.profile.repository,{...r.pull,body:r.pull.body.replace('Direct GitHub','Publisher package')}).manifest.slug,r.manifest.slug);
    assert.throws(() => mergedManifest(r.profile.repository,{...r.pull,merged:false}),/Only a merged/);
    assert.throws(() => mergedManifest(r.profile.repository,{...r.pull,head:{...r.pull.head,repo:{full_name:'Other/fork'}}}),/Only a merged/);
    assert.throws(() => mergedManifest(r.profile.repository,{...r.pull,title:'Publish Wrong'}),/identity/);
  }
});
const file = (text, hash = sha) => ({ type:'file', encoding:'base64', sha:hash, content:Buffer.from(text).toString('base64') });
test('live verifier requires marker, source identity, canonical article, and excludes drafts', async () => {
  for (const kind of ['ood','life']) {
    const r = make(kind), request = async path => path.includes('/compare/') ? {status:'ahead'} : path.includes('index.ts') || path.includes('meta.ts') ? file(r.sourceText) : [{name:'source',type:'file',sha}];
    const fetchText = async url => url.includes('/deployment.json') ? JSON.stringify({commit:deployed}) : '<html><head><title>New title</title><link rel="canonical" href="'+r.manifest.canonicalUrl+'"></head><body><article data-static-post>Article</article></body></html>';
    assert.equal((await verifyLivePost({repository:r.profile.repository,pull:r.pull,request,fetchText,date})).manifest.slug,r.manifest.slug);
    await assert.rejects(verifyLivePost({repository:r.profile.repository,pull:r.pull,request,fetchText:async url=>url.includes('/deployment.json')?JSON.stringify({commit:'invalid'}):'',date}),/not reached/);
    await assert.rejects(verifyLivePost({repository:r.profile.repository,pull:r.pull,request,fetchText:async url=>url.includes('/deployment.json')?JSON.stringify({commit:deployed}):'<html>generic SPA</html>',date}),/identity/);
  }
  const r=make('life');r.pull.body=r.pull.body.replace('"status":"Recent"','"status":"Draft"');
  assert.deepEqual(await verifyLivePost({repository:r.profile.repository,pull:r.pull,request:async()=>{throw Error('no network expected')},fetchText:async()=>{},date}),{skipped:true});
});
test('CAS retries, verified readback, and idempotency avoid lost writes', async () => {
  let content=tracker, hash=sha, puts=0;
  const request=async (path,opts={})=>{
    if(opts.method==='PUT'){
      puts++; if(puts===1)throw Object.assign(Error('conflict'),{status:409});
      assert.equal(opts.body.sha,hash); content=Buffer.from(opts.body.content,'base64').toString();hash=deployed;
      return {commit:{sha:merge},content:{sha:hash}};
    }
    return file(content,hash);
  };
  const result=await reconcileLedger(make(),request);
  assert.equal(result.id,85);assert.equal(puts,2);
  assert.equal((await reconcileLedger(make(),request)).changed,false);assert.equal(puts,2);
});
test('only verified GitHub Actions ledger status can finish publishing', () => {
  const good={context:'Wilbert post ledger',state:'success',creator:{login:'github-actions[bot]',type:'Bot'}};
  assert.equal(ledgerStatusFromStatuses([]).state,'pending');
  assert.equal(ledgerStatusFromStatuses([{...good,creator:{login:'someone'}}]).state,'pending');
  assert.equal(ledgerStatusFromStatuses([good]).state,'success');
  assert.equal(ledgerStatusFromStatuses([{...good,state:'failure'}]).state,'failed');
});

test('curated series enrichment survives same-section reconciliation', () => {
  const record = make('ood','existing');
  record.manifest.format = '';
  const input = tracker.replace('- Synopsis: hand-authored synopsis', '- Section/topic: diary / Recurring feature\n- Synopsis: hand-authored synopsis');
  assert.match(upsertLedger(input,record).content,/Section\/topic: diary \/ Recurring feature/);
});

test('missing tracker identity fails closed', () => {
  assert.throws(() => upsertLedger(tracker.replace('- Site: OurOldDad','- Site: unknown'),make()),/identity is incomplete/);
});
