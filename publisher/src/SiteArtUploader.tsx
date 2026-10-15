import { useState } from 'react';

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function base64(bytes: Uint8Array): string {
  let value = '';
  for (let offset = 0; offset < bytes.length; offset += 16000) value += String.fromCharCode(...bytes.slice(offset, offset + 16000));
  return btoa(value);
}
export function SiteArtUploader({ publisherKey }: { publisherKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [repo, setRepo] = useState('SuperDudePro/Blog-Site');
  const [path, setPath] = useState('public/site-art/');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  async function upload() {
    if (!file || !publisherKey) return;
    setWorking(true); setLink(''); setMessage('Checking file and uploading original pixels…');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes.byteLength > 6_000_000) throw new Error('Image is larger than 6 MB.');
      const request = { repository: repo, path, content: base64(bytes), sha256: await sha256(bytes) };
      const response = await fetch('/api/publish/site-artwork', { method: 'POST', headers: { 'content-type': 'application/json', 'x-publisher-key': publisherKey }, body: JSON.stringify(request), cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Site artwork upload failed.');
      if (result.sha256 !== request.sha256) throw new Error('Server-reported digest does not match the selected image.');
      setMessage(`Original ${bytes.length} bytes staged with matching SHA-256. Review and merge the draft PR.`);
      setLink(result.prUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setWorking(false); }
  }
  return <section className="panel" style={{ marginBlock: '1.5rem' }}>
    <p className="eyebrow">Site artwork (not a blog post)</p>
    <h2>Upload original website image</h2>
    <p>Stages the exact PNG, JPEG, or WebP bytes in a draft GitHub PR. This does not publish to production.</p>
    <label>Site <select value={repo} onChange={e => setRepo(e.target.value)}><option value="SuperDudePro/Blog-Site">Our Old Dad</option><option value="SuperDudePro/LifeEducationOrg">LifeEducation</option></select></label>
    <label>File <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const selected = e.target.files?.[0] || null; setFile(selected); if (selected) setPath(`public/site-art/${selected.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`); }} /></label>
    <label>Destination <input type="text" value={path} onChange={e => setPath(e.target.value)} /></label>
    <button disabled={!file || working} onClick={() => void upload()}>{working ? 'Uploading…' : 'Upload to draft PR'}</button>
    {message && <p role="status">{message}</p>}
    {link && <a href={link} target="_blank" rel="noreferrer">Review staged image on GitHub</a>}
  </section>;
}