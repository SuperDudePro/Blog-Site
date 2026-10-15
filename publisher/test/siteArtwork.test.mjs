import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateSiteArtwork } from '../lib/siteArtwork.mjs';
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/nX8AAAAASUVORK5CYII=', 'base64');
const data = { repository:'SuperDudePro/Blog-Site', path:'public/site-art/test.png', content:image.toString('base64'), sha256:createHash('sha256').update(image).digest('hex') };
test('accept unchanged PNG in allowlisted site-art directory',()=>{const result=validateSiteArtwork(data);assert.ok(result.bytes.equals(image));});
test('reject mismatched digest',()=>assert.throws(()=>validateSiteArtwork({...data,sha256:'0'.repeat(64)}),/SHA-256/));
test('reject traversal and unrelated source paths',()=>{for(const path of ['src/App.tsx','public/site-art/../index.html','/public/site-art/a.png'])assert.throws(()=>validateSiteArtwork({...data,path}));});
test('reject unsupported repositories and fake extensions',()=>{assert.throws(()=>validateSiteArtwork({...data,repository:'someone/else'}));assert.throws(()=>validateSiteArtwork({...data,path:'public/site-art/fake.svg'}));});
import { readFileSync } from 'node:fs';
import { unwrapWebp } from '../../scripts/raster-art-transport.mjs';
const sectionWebp = unwrapWebp(readFileSync(new URL('../../src/assets/section-sketch-everything.svg', import.meta.url), 'utf8'));
test('accept real WebP for all six homepage section slots', () => {
  for (const key of ['everything','diary','life-education','music-playlists','slow-travel','advice']) {
    const result = validateSiteArtwork({ repository: 'SuperDudePro/Blog-Site', path: `public/section-sketches/${key}.webp`, content: sectionWebp.toString('base64'), sha256: createHash('sha256').update(sectionWebp).digest('hex') });
    assert.ok(result.bytes.equals(sectionWebp));
  }
});
test('reject unrelated filenames and PNG files in section slots',()=>{
  for(const path of ['public/section-sketches/unknown.webp','public/section-sketches/diary.png','public/section-sketches/subdir/diary.webp']) assert.throws(()=>validateSiteArtwork({...data,path}),/Invalid homepage section image path/);
});
