import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import JSZip, { JSZipObject } from 'jszip';

type ImageSpec = { file: string; role: string; alt: string; caption: string | null };
type PlaylistLinks = { youtube: string; youtubeMusic: string; playlistId: string };
type PackageManifest = { targetSite: string; repository: string; title: string; slug: string; publishedAt: string; status: string; section: string; excerpt: string; canonicalUrl: string; destinationPath: string; buildCommand: string; images: ImageSpec[]; playlistLinks?: PlaylistLinks };
type ValidationItem = { group: string; label: string; ok: boolean; detail: string };
type InspectedImage = ImageSpec & { path: string; url: string; referencedInIndex: boolean; altFoundInIndex: boolean; captionFoundInIndex: boolean };
type Inspection = { archiveName: string; root: string; manifest: PackageManifest; files: string[]; sourceFiles: string[]; productionFiles: string[]; images: InspectedImage[]; validation: ValidationItem[] };
type Diagnosis = { code: string; problem: string; fix: string };
type PreviewResult = { ok: boolean; stage: string; logs?: string; error?: string; diagnosis?: Diagnosis; preview?: { id: string; url: string; canonicalUrl?: string } };
type PreviewStep = { label: string; status: 'complete' | 'active' | 'failed' | 'pending' };
type PreviewJob = { id: string; status: 'running' | 'complete' | 'failed'; stage: string; steps: PreviewStep[]; result?: PreviewResult | null };

const requiredSourceNames = ['post.md', 'image-notes.md', 'package-manifest.json', 'proposed-tracker-entry.md'];
const normalise = (value: string) => value.replace(/\\/g, '/').replace(/^\.\//, '');
const findEntry = (zip: JSZip, predicate: (name: string) => boolean): JSZipObject | undefined => Object.values(zip.files).find((entry) => !entry.dir && predicate(normalise(entry.name)));
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const extractField = (source: string, field: string) => source.match(new RegExp(`${field}:\\s*(?:\\n\\s*)?(["'])([\\s\\S]*?)\\1,`))?.[2]?.trim() ?? '';
const validHttpUrl = (value?: string) => { try { const url = new URL(value ?? ''); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } };
const playlistIdFromUrl = (value?: string) => { try { return new URL(value ?? '').searchParams.get('list') ?? ''; } catch { return ''; } };
const usefulLogs = (logs = '') => logs.split('\n').filter(Boolean).slice(-18).join('\n');
const pause = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function inspectArchive(file: File): Promise<Inspection> {
  const zip = await JSZip.loadAsync(file);
  const files = Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => normalise(entry.name)).sort();
  const manifestEntry = findEntry(zip, (name) => name.endsWith('/source/package-manifest.json'));
  if (!manifestEntry) throw new Error('No source/package-manifest.json was found.');
  const manifest = JSON.parse(await manifestEntry.async('text')) as PackageManifest;
  const root = normalise(manifestEntry.name).replace(/\/source\/package-manifest\.json$/, '');
  const sourcePrefix = `${root}/source/`;
  const dropInPrefix = `${root}/drop-in/${manifest.slug}/`;
  const indexPath = `${dropInPrefix}index.ts`;
  const indexEntry = zip.file(indexPath);
  const indexSource = indexEntry ? await indexEntry.async('text') : '';
  const images = await Promise.all(manifest.images.map(async (image): Promise<InspectedImage> => {
    const path = `${dropInPrefix}${image.file}`;
    const entry = zip.file(path);
    const blob = entry ? await entry.async('blob') : null;
    return { ...image, path, url: blob ? URL.createObjectURL(blob) : '', referencedInIndex: Boolean(indexSource.match(new RegExp(`['"]\\./${escapeRegExp(image.file)}['"]`))), altFoundInIndex: Boolean(image.alt && indexSource.includes(image.alt)), captionFoundInIndex: image.caption ? indexSource.includes(image.caption) : true };
  }));
  const validation: ValidationItem[] = [];
  const add = (group: string, label: string, ok: boolean, detail: string) => validation.push({ group, label, ok, detail });
  const readmePath = `${root}/README-HANDOFF.md`;
  add('Core package', 'Handoff instructions', files.includes(readmePath), files.includes(readmePath) ? 'README-HANDOFF.md found.' : 'README-HANDOFF.md is missing.');
  add('Core package', 'Production entry point', Boolean(indexEntry), indexEntry ? indexPath : `Missing ${indexPath}`);
  add('Core package', 'Destination contract', manifest.destinationPath.endsWith(`/${manifest.slug}/`), manifest.destinationPath);
  requiredSourceNames.forEach((name) => add('Core package', `Source: ${name}`, files.includes(`${sourcePrefix}${name}`), files.includes(`${sourcePrefix}${name}`) ? 'Found.' : 'Missing.'));
  const metadataChecks: Array<[keyof PackageManifest, string]> = [['title', 'Title'], ['slug', 'Slug'], ['excerpt', 'Excerpt'], ['section', 'Section'], ['publishedAt', 'Publication date'], ['status', 'Status']];
  metadataChecks.forEach(([field, label]) => { const expected = String(manifest[field] ?? ''); const actual = extractField(indexSource, field); add('Metadata', `${label} matches index.ts`, Boolean(indexSource) && actual === expected, actual === expected ? expected : `Manifest: ${expected || '—'} | index.ts: ${actual || 'not found'}`); });
  images.forEach((image) => {
    add('Images', `${image.file} exists`, Boolean(image.url), image.path);
    add('Images', `${image.file} imported`, image.referencedInIndex, image.referencedInIndex ? 'Referenced by index.ts.' : 'Not referenced by index.ts.');
    add('Images', `${image.file} alt text`, image.altFoundInIndex, image.altFoundInIndex ? 'Manifest alt text matches index.ts.' : 'Manifest alt text not found in index.ts.');
    if (image.caption) add('Images', `${image.file} caption`, image.captionFoundInIndex, image.captionFoundInIndex ? 'Manifest caption matches index.ts.' : 'Manifest caption not found in index.ts.');
  });
  if (manifest.section === 'music-playlists' || manifest.playlistLinks) {
    const links = manifest.playlistLinks; const youtubeId = playlistIdFromUrl(links?.youtube); const musicId = playlistIdFromUrl(links?.youtubeMusic);
    add('Playlist', 'Playlist contract exists', Boolean(links), links ? 'playlistLinks found in manifest.' : 'Playlist posts require playlistLinks in the manifest.');
    add('Playlist', 'YouTube playlist URL is valid', Boolean(validHttpUrl(links?.youtube) && links?.youtube.includes('youtube.com/playlist')), links?.youtube ?? 'Missing YouTube playlist URL.');
    add('Playlist', 'YouTube Music URL is valid', Boolean(validHttpUrl(links?.youtubeMusic) && links?.youtubeMusic.includes('music.youtube.com/playlist')), links?.youtubeMusic ?? 'Missing YouTube Music URL.');
    add('Playlist', 'Playlist ID is declared', Boolean(links?.playlistId), links?.playlistId ?? 'Missing playlistId.');
    add('Playlist', 'YouTube URL uses declared playlist ID', Boolean(links?.playlistId) && youtubeId === links?.playlistId, `Declared: ${links?.playlistId || 'missing'} | URL: ${youtubeId || 'missing'}`);
    add('Playlist', 'YouTube Music URL uses declared playlist ID', Boolean(links?.playlistId) && musicId === links?.playlistId, `Declared: ${links?.playlistId || 'missing'} | URL: ${musicId || 'missing'}`);
    add('Playlist', 'YouTube link rendered in index.ts', Boolean(links?.youtube && indexSource.includes(links.youtube)), links?.youtube ?? 'Missing from manifest.');
    add('Playlist', 'YouTube Music link rendered in index.ts', Boolean(links?.youtubeMusic && indexSource.includes(links.youtubeMusic)), links?.youtubeMusic ?? 'Missing from manifest.');
  }
  return { archiveName: file.name, root, manifest, files, sourceFiles: files.filter((name) => name.startsWith(sourcePrefix)), productionFiles: files.filter((name) => name.startsWith(dropInPrefix)), images, validation };
}

function App() {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<InspectedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');
  const [previewJob, setPreviewJob] = useState<PreviewJob | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const summary = useMemo(() => { if (!inspection) return null; const passed = inspection.validation.filter((item) => item.ok).length; return { passed, total: inspection.validation.length, ready: passed === inspection.validation.length }; }, [inspection]);
  const groups = useMemo(() => inspection ? [...new Set(inspection.validation.map((item) => item.group))] : [], [inspection]);

  const loadFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) { setError('Please choose a ZIP package.'); return; }
    inspection?.images.forEach((image) => image.url && URL.revokeObjectURL(image.url));
    setLoading(true); setError(''); setPreview(null); setPreviewJob(null); setInspection(null); setSelectedImage(null); setPackageFile(file);
    try { const result = await inspectArchive(file); setInspection(result); setSelectedImage(result.images[0] ?? null); }
    catch (reason) { setPackageFile(null); setError(reason instanceof Error ? reason.message : 'The package could not be inspected.'); }
    finally { setLoading(false); }
  };

  const buildPreview = async () => {
    if (!packageFile || !summary?.ready) return;
    setBuilding(true); setPreview(null); setPreviewJob(null); setError('');
    try {
      const response = await fetch('/api/preview', { method: 'POST', headers: { 'content-type': 'application/zip' }, body: packageFile });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'The preview service rejected the package.');
      let job = await response.json() as PreviewJob;
      setPreviewJob(job);
      while (job.status === 'running') {
        await pause(400);
        const poll = await fetch(`/api/preview/${job.id}`, { cache: 'no-store' });
        if (!poll.ok) throw new Error('The preview job could not be found.');
        job = await poll.json() as PreviewJob;
        setPreviewJob(job);
      }
      if (job.result) setPreview(job.result);
      if (job.status === 'failed' && !job.result) setError('The preview build failed without diagnostic output.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The preview service could not be reached.'); }
    finally { setBuilding(false); }
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragActive(false); loadFile(event.dataTransfer.files?.[0]); };

  return <main className="app-shell">
    <header className="masthead"><div><p className="eyebrow">Wilbert Publisher</p><h1>Inspect the package before it touches the site.</h1><p className="intro">The manifest is the contract. The production files have to prove they match it.</p></div><div className="phase-pill">Phase 2 · Inspector</div></header>
    <label className={`drop-zone ${dragActive ? 'drop-zone--active' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={onDrop}>
      <input type="file" accept=".zip,application/zip" onChange={onInput} /><strong>{loading ? 'Reading package…' : 'Drop a finished post ZIP here'}</strong><span>or click to choose one</span>
    </label>
    {error && <div className="error-banner">{error}</div>}
    {inspection && summary && <>
      <section className="package-hero"><div><p className="eyebrow">{inspection.manifest.targetSite}</p><h2>{inspection.manifest.title}</h2><p>{inspection.manifest.excerpt}</p></div><div className={`status-card ${summary.ready ? 'status-card--ready' : ''}`}><span>{summary.ready ? 'Ready for preview' : 'Needs attention'}</span><strong>{summary.passed}/{summary.total}</strong><small>checks passed</small></div></section>
      <section className="metadata-grid"><Metadata label="Slug" value={inspection.manifest.slug}/><Metadata label="Section" value={inspection.manifest.section}/><Metadata label="Status" value={inspection.manifest.status}/><Metadata label="Published" value={inspection.manifest.publishedAt}/><Metadata label="Repository" value={inspection.manifest.repository}/><Metadata label="Destination" value={inspection.manifest.destinationPath}/></section>
      {previewJob && <section className={`panel preview-panel ${previewJob.status === 'complete' ? 'preview-panel--ready' : previewJob.status === 'failed' ? 'preview-panel--failed' : ''}`}><p className="eyebrow">Preview pipeline</p><h3>{previewJob.status === 'running' ? 'Building site preview' : previewJob.status === 'complete' ? 'Preview ready' : `Failed during ${previewJob.stage}`}</h3><div className="validation-list">{previewJob.steps.map((step) => <div className="validation-row" key={step.label}><div className={`check ${step.status === 'complete' ? 'check--ok' : step.status === 'failed' ? 'check--bad' : ''}`}><span>{step.status === 'complete' ? '✓' : step.status === 'failed' ? '!' : step.status === 'active' ? '…' : '○'}</span><strong>{step.label}</strong></div><span>{step.status === 'active' ? 'In progress' : step.status}</span></div>)}</div>{preview?.ok && preview.preview && <><p>The real site build completed in an isolated workspace.</p><a className="preview-link" href={preview.preview.url} target="_blank" rel="noreferrer">Open generated preview</a></>}{preview && !preview.ok && <><p>{preview.diagnosis?.problem ?? preview.error ?? 'The site build returned an error.'}</p>{preview.diagnosis?.fix && <div className="definition"><span>Likely fix</span><p>{preview.diagnosis.fix}</p></div>}{preview.logs && <pre>{usefulLogs(preview.logs)}</pre>}</>}</section>}
      {inspection.manifest.playlistLinks && <section className="panel playlist-panel"><p className="eyebrow">Playlist module</p><h3>{inspection.manifest.playlistLinks.playlistId}</h3><Definition label="YouTube" value={inspection.manifest.playlistLinks.youtube}/><Definition label="YouTube Music" value={inspection.manifest.playlistLinks.youtubeMusic}/></section>}
      <section className="workspace-grid"><div className="panel image-panel"><p className="eyebrow">Image roles</p><h3>{inspection.images.length} production images</h3><div className="image-grid">{inspection.images.map((image) => <button className={`image-card ${selectedImage?.file === image.file ? 'image-card--selected' : ''}`} key={image.file} onClick={() => setSelectedImage(image)}>{image.url ? <img src={image.url} alt={image.alt}/> : <div className="missing-image">Missing</div>}<span>{image.file}</span><small>{image.role}</small></button>)}</div></div>
        <aside className="panel inspector-panel"><p className="eyebrow">Inspector</p>{selectedImage ? <>{selectedImage.url && <img className="inspector-preview" src={selectedImage.url} alt={selectedImage.alt}/>}<h3>{selectedImage.file}</h3><Definition label="Role" value={selectedImage.role}/><Definition label="Alt text" value={selectedImage.alt}/><Definition label="Caption" value={selectedImage.caption ?? 'No caption required'}/><div className="mini-checks"><Check ok={Boolean(selectedImage.url)} label="File present"/><Check ok={selectedImage.referencedInIndex} label="Imported in index.ts"/><Check ok={selectedImage.altFoundInIndex} label="Alt matches"/>{selectedImage.caption && <Check ok={selectedImage.captionFoundInIndex} label="Caption matches"/>}</div></> : <p>Select an image to inspect it.</p>}</aside>
      </section>
      <section className="workspace-grid lower-grid"><div className="panel"><p className="eyebrow">Validation</p><h3>Package contract</h3>{groups.map((group) => <div className="validation-group" key={group}><h4>{group}</h4><div className="validation-list">{inspection.validation.filter((item) => item.group === group).map((item) => <div className="validation-row" key={`${item.label}-${item.detail}`}><Check ok={item.ok} label={item.label}/><span>{item.detail}</span></div>)}</div></div>)}</div><div className="panel file-panel"><p className="eyebrow">Archive contents</p><h3>{inspection.files.length} files found</h3><FileGroup title="Source package" files={inspection.sourceFiles} root={inspection.root}/><FileGroup title="Production drop-in" files={inspection.productionFiles} root={inspection.root}/></div></section>
      <footer className="action-bar"><div><strong>{inspection.archiveName}</strong><span>{building ? `Preview pipeline: ${previewJob?.stage ?? 'starting'}…` : summary.ready ? 'The package is ready for the site-preview step.' : 'Resolve failed checks before previewing.'}</span></div>{preview?.ok && preview.preview ? <a className="preview-link" href={preview.preview.url} target="_blank" rel="noreferrer">Open preview</a> : <button disabled={!summary.ready || building} onClick={buildPreview}>{building ? 'Building preview…' : 'Build site preview'}</button>}</footer>
    </>}
  </main>;
}

function Metadata({ label, value }: { label: string; value: string }) { return <div className="metadata-item"><span>{label}</span><strong>{value}</strong></div>; }
function Definition({ label, value }: { label: string; value: string }) { return <div className="definition"><span>{label}</span><p>{value}</p></div>; }
function Check({ ok, label }: { ok: boolean; label: string }) { return <div className={`check ${ok ? 'check--ok' : 'check--bad'}`}><span>{ok ? '✓' : '!'}</span><strong>{label}</strong></div>; }
function FileGroup({ title, files, root }: { title: string; files: string[]; root: string }) { return <div className="file-group"><h4>{title}</h4>{files.map((file) => <code key={file}>{file.replace(`${root}/`, '')}</code>)}</div>; }
export default App;
