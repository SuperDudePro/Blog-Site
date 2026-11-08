import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { checkPublishingPullRequest } from '../../scripts/validate-publishing-pr.mjs';
import { imageFixture } from '../test-support/fixtures.mjs';

function scenario(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publish-gate-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const slug='contract-check', title='Contract Check';
 const folder=path.join(root,'src','content','posts',slug);
 fs.mkdirSync(folder,{recursive:true});
 // A direct GitHub publishing PR must stage the new canonical URL in the checked-in sitemap.
 fs.mkdirSync(path.join(root,'public'),{recursive:true});
 fs.writeFileSync(path.join(root,'public','sitemap.xml'),
   '<urlset><url><loc>https://ourolddad.com/post/'+slug+'</loc></url></urlset>');
 const images=['card','hero'].map(role=>{
   const file=role+'-image.webp',bytes=imageFixture(role);
   fs.writeFileSync(path.join(folder,file),bytes);
   return {file,role,alt:role+' artwork.',caption:null,sha256:createHash('sha256').update(bytes).digest('hex')};
 });
 const manifest={targetSite:'Our Old Dad',repository:'SuperDudePro/Blog-Site',title,slug,
  excerpt:'A mechanical publishing test.',section:'diary',publishedAt:'2026-11-07',status:'Recent',
  canonicalUrl:'https://ourolddad.com/post/'+slug,destinationPath:'src/content/posts/'+slug+'/',
  buildCommand:'npm run build',images};
 fs.writeFileSync(path.join(folder,'index.ts'),[
 "import cardImage from './card-image.webp';", "import heroImage from './hero-image.webp';",
 'const post = {','title: "Contract Check", slug: "contract-check",',
 'excerpt: "A mechanical publishing test.", section: "diary",',
 'publishedAt: "2026-11-07", status: "Recent",',
 'cardImage, cardAlt: "card artwork.", heroImage, heroAlt: "hero artwork.",',
 'bodyHtml: "<p>Test. <a href=\'/contact\'>Contact us.</a></p>",',
 '}; export default post;'].join('\n'));
 const event={repository:{full_name:'SuperDudePro/Blog-Site'},pull_request:{
  number:123,title:'Publish '+title,html_url:'https://github.com/SuperDudePro/Blog-Site/pull/123',
  head:{ref:'publisher/'+slug,sha:'a'.repeat(40),repo:{full_name:'SuperDudePro/Blog-Site'}},
  base:{ref:'main'},state:'open'}};
 const body=(v=manifest)=>[
 '- Site profile: **Our Old Dad**','- Handoff method: **Direct GitHub**',
 '- Slug: `contract-check`',
 '- Destination: `src/content/posts/contract-check/`',
 '- Canonical URL: https://ourolddad.com/post/contract-check',
 '## Publisher manifest','','```json',JSON.stringify(v,null,2),'```'].join('\n');
 event.pull_request.body=body();
 return {root,folder,event,manifest,body};
}
test('valid zero-body draft and exact WebP digests pass',t=>{
 const f=scenario(t),r=checkPublishingPullRequest(f.event,{root:f.root});
 assert.deepEqual(r.errors,[]);assert.equal(r.imageCount,2);
});
test('missing or stale checked-in sitemap route fails before site build',t=>{
 const f=scenario(t);
 const sitemap=path.join(f.root,'public','sitemap.xml');
 fs.writeFileSync(sitemap,'<urlset><url><loc>https://ourolddad.com/post/old-route</loc></url></urlset>');
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/checked-in public\/sitemap.xml/);
 fs.rmSync(sitemap);
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/missing checked-in public\/sitemap.xml/);
});

test('missing manifest fails',t=>{
 const f=scenario(t);f.event.pull_request.body='- Handoff method: **Direct GitHub**';
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/manifest JSON/);
});
test('altered image SHA and unapproved extra file fail',t=>{
 const f=scenario(t);
 fs.appendFileSync(path.join(f.folder,'hero-image.webp'),Buffer.from([1]));
 fs.writeFileSync(path.join(f.folder,'extra.webp'),'extra');
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/SHA-256/);
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/Unexpected production file/);
});
test('branch drift and PR title mismatch fail',t=>{
 const f=scenario(t);
 f.event.pull_request.head.ref='publisher/wrong';
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/publisher\/<slug>/);
 f.event.pull_request.head.ref='publisher/contract-check';f.event.pull_request.title='Publish Wrong Title';
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/identity fields or title/);
});
test('recognized legacy ZIP handoff is supported',t=>{
 const f=scenario(t);f.event.pull_request.created_at='2026-10-25T22:00:00Z';f.event.pull_request.body='- Operation: **Publish new post**\n- Complete package preflight passed before GitHub production blobs were created';
 assert.equal(checkPublishingPullRequest(f.event,{root:f.root}).mode,'legacy-package');
});
test('unrelated PR is skipped, unknown publisher format fails closed',t=>{
 const f=scenario(t);f.event.pull_request.head.ref='feature/not-publishing';
 assert.equal(checkPublishingPullRequest(f.event,{root:f.root}).skipped,true);
 f.event.pull_request.head.ref='publisher/contract-check';f.event.pull_request.body='No manifest here';
 assert.ok(checkPublishingPullRequest(f.event,{root:f.root}).errors.length);
});

test('new PR cannot impersonate old ZIP workflow to bypass mandatory contract',t=>{
 const f=scenario(t);
 f.event.pull_request.created_at='2026-11-08T04:00:00Z';
 f.event.pull_request.body='- Operation: **Publish new post**\n- Complete package preflight passed before GitHub production blobs were created';
 assert.match(checkPublishingPullRequest(f.event,{root:f.root}).errors.join('\n'),/Handoff method/);
});
