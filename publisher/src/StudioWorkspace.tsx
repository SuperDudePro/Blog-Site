import { ChangeEvent, useMemo, useState } from 'react';
import { api } from './api';
import {
  buildPackageZip,
  extractParagraphs,
  extractReadableText,
  GeneratedAsset,
  ImageRole,
  normalizeImage,
  parseMetadata,
  PlanItem,
  ROLE_ORDER,
  ROLE_SPECS,
  slugify,
  sourceIsIndex,
  StudioMetadata,
} from './studio-utils';

type PlanResponse = { summary: string; visualThesis: string; images: Omit<PlanItem, 'planStatus'>[] };
type GenerateResponse = { base64: string; mediaType: string; model: string };

type Props = { accessKey: string };

const today = new Date().toISOString().slice(0, 10);
const blankMetadata: StudioMetadata = {
  title: '',
  slug: '',
  excerpt: '',
  section: 'diary',
  publishedAt: today,
  status: 'Recent',
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export default function StudioWorkspace({ accessKey }: Props) {
  const [source, setSource] = useState('');
  const [metadata, setMetadata] = useState<StudioMetadata>(blankMetadata);
  const [summary, setSummary] = useState('');
  const [visualThesis, setVisualThesis] = useState('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [assets, setAssets] = useState<Map<ImageRole, GeneratedAsset>>(new Map());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<ImageRole>('card');
  const [showOverride, setShowOverride] = useState<ImageRole | null>(null);
  const [overrideDraft, setOverrideDraft] = useState('');
  const paragraphs = useMemo(() => extractParagraphs(source), [source]);
  const selectedPlan = plan.find((item) => item.id === selected);
  const selectedAsset = assets.get(selected);
  const allPlanApproved = plan.length === 6 && plan.every((item) => item.planStatus === 'approved');
  const allImagesApproved = ROLE_ORDER.every((role) => assets.get(role)?.status === 'approved');
  const metadataReady = Boolean(metadata.title && metadata.slug && metadata.excerpt && metadata.section && metadata.publishedAt && metadata.status);

  function updateMetadata(field: keyof StudioMetadata, value: string) {
    setMetadata((current) => ({ ...current, [field]: value }));
  }

  async function loadSourceFile(file?: File) {
    if (!file) return;
    setError('');
    try {
      const text = await file.text();
      setSource(text);
      const parsed = parseMetadata(text);
      setMetadata((current) => {
        const title = parsed.title || current.title;
        return {
          ...current,
          ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => Boolean(value))),
          title,
          slug: parsed.slug || current.slug || slugify(title),
        } as StudioMetadata;
      });
      setPlan([]);
      setAssets(new Map());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read the post source.');
    }
  }

  async function proposePlan() {
    if (!metadataReady || !source.trim()) return;
    setBusy('Analyzing the finished post and building six distinct image roles…');
    setError('');
    try {
      const result = await api<PlanResponse>('/api/studio/plan', accessKey, {
        metadata,
        postText: extractReadableText(source),
        paragraphs,
        sourceMode: sourceIsIndex(source) ? 'production-index' : 'finished-text',
      });
      const normalized = ROLE_ORDER.map((role) => {
        const received = result.images.find((item) => item.id === role);
        if (!received) throw new Error(`The image plan is missing ${role}.`);
        return {
          ...received,
          file: ROLE_SPECS[role].file,
          role: ROLE_SPECS[role].label,
          placementIndex: role.startsWith('body-') ? received.placementIndex : null,
          planStatus: 'proposed' as const,
        };
      });
      assets.forEach((asset) => URL.revokeObjectURL(asset.url));
      setAssets(new Map());
      setSummary(result.summary);
      setVisualThesis(result.visualThesis);
      setPlan(normalized);
      setSelected('card');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Image planning failed.');
    } finally {
      setBusy('');
    }
  }

  function patchPlan(role: ImageRole, patch: Partial<PlanItem>) {
    setPlan((current) => current.map((item) => item.id === role ? { ...item, ...patch, planStatus: 'proposed' } : item));
    const existing = assets.get(role);
    if (existing) {
      URL.revokeObjectURL(existing.url);
      setAssets((current) => {
        const next = new Map(current);
        next.delete(role);
        return next;
      });
    }
  }

  function approvePlan(role: ImageRole) {
    setPlan((current) => current.map((item) => item.id === role ? { ...item, planStatus: 'approved' } : item));
  }

  function approveAllPlan() {
    setPlan((current) => current.map((item) => ({ ...item, planStatus: 'approved' })));
  }

  async function setAsset(role: ImageRole, input: Blob | string, sourceType: 'generated' | 'uploaded') {
    const normalized = await normalizeImage(input, role);
    const old = assets.get(role);
    if (old) URL.revokeObjectURL(old.url);
    const url = URL.createObjectURL(normalized.blob);
    setAssets((current) => {
      const next = new Map(current);
      next.set(role, {
        id: role,
        blob: normalized.blob,
        url,
        width: ROLE_SPECS[role].width,
        height: ROLE_SPECS[role].height,
        color: normalized.color,
        status: 'ready',
        overrideReason: '',
        source: sourceType,
      });
      return next;
    });
  }

  async function generate(role: ImageRole) {
    const item = plan.find((candidate) => candidate.id === role);
    if (!item || item.planStatus !== 'approved' || !allPlanApproved) return;
    setBusy(`Generating ${item.file}…`);
    setError('');
    try {
      const result = await api<GenerateResponse>('/api/studio/generate', accessKey, { image: item, metadata });
      await setAsset(role, `data:${result.mediaType};base64,${result.base64}`, 'generated');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Image generation failed.');
    } finally {
      setBusy('');
    }
  }

  async function uploadReplacement(role: ImageRole, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(`Preparing ${ROLE_SPECS[role].file}…`);
    setError('');
    try {
      await setAsset(role, file, 'uploaded');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The replacement image could not be prepared.');
    } finally {
      setBusy('');
    }
  }

  function approveImage(role: ImageRole, overrideReason = '') {
    const asset = assets.get(role);
    if (!asset) return;
    if (asset.color.warning && !overrideReason.trim()) {
      setOverrideDraft('');
      setShowOverride(role);
      return;
    }
    setAssets((current) => {
      const next = new Map(current);
      next.set(role, { ...asset, status: 'approved', overrideReason: overrideReason.trim() });
      return next;
    });
    setOverrideDraft('');
    setShowOverride(null);
  }

  function rejectImage(role: ImageRole) {
    const asset = assets.get(role);
    if (asset) URL.revokeObjectURL(asset.url);
    setAssets((current) => {
      const next = new Map(current);
      next.delete(role);
      return next;
    });
    setOverrideDraft('');
    setShowOverride(null);
  }

  async function exportPackage() {
    if (!allImagesApproved || !metadataReady) return;
    setBusy('Building the complete Wilbert Publisher ZIP…');
    setError('');
    try {
      const blob = await buildPackageZip(source, metadata, plan, assets);
      download(blob, `${metadata.publishedAt}--${metadata.slug}--our-old-dad.zip`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Package export failed.');
    } finally {
      setBusy('');
    }
  }

  return <section className="studio-shell">
    <header className="workspace-heading">
      <div>
        <p className="eyebrow">Our Old Dad Image Studio</p>
        <h2>Text approved. Images controlled.</h2>
        <p className="intro">Plan six separate image roles, approve every concept, generate or replace one asset at a time, and export a publisher-ready ZIP. Nothing here writes to GitHub.</p>
      </div>
      <div className="gate-badge"><strong>Human gate</strong><span>No branch, PR, deploy, or merge.</span></div>
    </header>

    {error && <div className="error-banner">{error}</div>}
    {busy && <div className="working-banner">{busy}</div>}

    <section className="panel intake-panel">
      <div className="panel-head"><div><p className="eyebrow">1. Finished post</p><h3>Load the approved text or current production index.</h3></div><label className="file-button">Choose .md, .txt, or .ts<input type="file" accept=".md,.txt,.ts,text/plain" onChange={(event) => void loadSourceFile(event.target.files?.[0])} /></label></div>
      <textarea className="source-input" value={source} onChange={(event) => { setSource(event.target.value); setPlan([]); setAssets(new Map()); }} placeholder="Paste the finished post text or its current production index.ts here." />
      <div className="field-grid">
        <label>Title<input value={metadata.title} onChange={(event) => { updateMetadata('title', event.target.value); if (!metadata.slug) updateMetadata('slug', slugify(event.target.value)); }} /></label>
        <label>Slug<input value={metadata.slug} onChange={(event) => updateMetadata('slug', slugify(event.target.value))} /></label>
        <label>Excerpt<input value={metadata.excerpt} onChange={(event) => updateMetadata('excerpt', event.target.value)} /></label>
        <label>Section<select value={metadata.section} onChange={(event) => updateMetadata('section', event.target.value)}><option value="diary">diary</option><option value="life-education">life-education</option><option value="music-playlists">music-playlists</option><option value="slow-travel">slow-travel</option><option value="advice">advice</option></select></label>
        <label>Published date<input type="date" value={metadata.publishedAt} onChange={(event) => updateMetadata('publishedAt', event.target.value)} /></label>
        <label>Status<select value={metadata.status} onChange={(event) => updateMetadata('status', event.target.value)}><option>Recent</option><option>Featured</option><option>Starter</option><option>Draft</option></select></label>
      </div>
      <div className="intake-footer"><span>{sourceIsIndex(source) ? 'Production index detected; existing image imports and figures will be replaced in the exported package.' : `${paragraphs.length} readable paragraphs detected.`}</span><button disabled={!metadataReady || !source.trim() || Boolean(busy)} onClick={() => void proposePlan()}>Propose six-image plan</button></div>
    </section>

    {plan.length > 0 && <>
      <section className="panel plan-overview">
        <div><p className="eyebrow">2. Plan before generation</p><h3>{visualThesis}</h3><p>{summary}</p></div>
        <button className="ghost" disabled={allPlanApproved} onClick={approveAllPlan}>{allPlanApproved ? 'All concepts approved' : 'Approve all concepts'}</button>
      </section>

      <section className="role-tabs" aria-label="Image roles">
        {plan.map((item) => <button key={item.id} className={selected === item.id ? 'selected' : ''} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span>{item.planStatus === 'approved' ? '✓' : '○'} {ROLE_SPECS[item.id].label}</span><small>{assets.get(item.id)?.status === 'approved' ? 'image approved' : assets.get(item.id) ? 'review image' : 'no image'}</small></button>)}
      </section>

      {selectedPlan && <section className="studio-grid">
        <div className="panel concept-editor">
          <div className="panel-head"><div><p className="eyebrow">Concept</p><h3>{selectedPlan.file}</h3></div><span className={`status-pill ${selectedPlan.planStatus}`}>{selectedPlan.planStatus}</span></div>
          <label>Strong visual moment<textarea value={selectedPlan.moment} onChange={(event) => patchPlan(selected, { moment: event.target.value })} /></label>
          <label>Concept<textarea value={selectedPlan.concept} onChange={(event) => patchPlan(selected, { concept: event.target.value })} /></label>
          <label>Composition<textarea value={selectedPlan.composition} onChange={(event) => patchPlan(selected, { composition: event.target.value })} /></label>
          {selected.startsWith('body-') && <label>Place after paragraph<select value={selectedPlan.placementIndex ?? 0} onChange={(event) => patchPlan(selected, { placementIndex: Number(event.target.value) })}>{paragraphs.map((paragraph) => <option key={paragraph.index} value={paragraph.index}>{paragraph.index + 1}. {paragraph.text.slice(0, 110)}</option>)}</select></label>}
          <label>Alt text<textarea value={selectedPlan.alt} onChange={(event) => patchPlan(selected, { alt: event.target.value })} /></label>
          <label>Caption (blank when unnecessary)<textarea value={selectedPlan.caption || ''} onChange={(event) => patchPlan(selected, { caption: event.target.value || null })} /></label>
          <label>Generation prompt<textarea className="prompt-input" value={selectedPlan.prompt} onChange={(event) => patchPlan(selected, { prompt: event.target.value })} /></label>
          <div className="actions"><button className="ghost" onClick={() => patchPlan(selected, {})}>Mark for revision</button><button disabled={selectedPlan.planStatus === 'approved'} onClick={() => approvePlan(selected)}>Approve concept</button></div>
        </div>

        <aside className="panel image-review">
          <p className="eyebrow">3. Generate and approve</p>
          {selectedAsset ? <>
            <img src={selectedAsset.url} alt={selectedPlan.alt} />
            <div className="image-metrics"><span><b>{selectedAsset.width}×{selectedAsset.height}</b> final WebP</span><span><b>{pct(selectedAsset.color.purpleRatio)}</b> purple</span><span><b>{pct(selectedAsset.color.darkPurpleRatio)}</b> dark purple</span><span><b>{pct(selectedAsset.color.darkRatio)}</b> very dark</span></div>
            {selectedAsset.color.warning && <div className="quality-warning"><strong>Visual-quality block</strong><p>{selectedAsset.color.warning}</p><p>Purple must remain a sparse accent, never the dominant shadow, background wash, or overall mood.</p></div>}
            {selectedAsset.status === 'approved' ? <div className="approved-banner">✓ Human approved {selectedAsset.overrideReason && `(override: ${selectedAsset.overrideReason})`}</div> : <div className="actions stacked"><button className="ghost" onClick={() => rejectImage(selected)}>Reject image</button><button onClick={() => approveImage(selected)}>Approve image</button></div>}
            {showOverride === selected && <div className="override-box"><label>Required override reason<textarea value={overrideDraft} onChange={(event) => setOverrideDraft(event.target.value)} placeholder="Explain why this warned image is still acceptable." /></label><button disabled={!overrideDraft.trim()} onClick={() => approveImage(selected, overrideDraft)}>Record override and approve</button></div>}
          </> : <div className="empty-image"><strong>No image generated.</strong><span>Approve this concept, then generate it. You can replace any result with your own file.</span></div>}
          <div className="actions stacked">
            <button disabled={selectedPlan.planStatus !== 'approved' || !allPlanApproved || Boolean(busy)} onClick={() => void generate(selected)}>{!allPlanApproved ? 'Approve the complete plan first' : selectedAsset ? 'Regenerate this role' : 'Generate this role'}</button>
            <label className={`file-button full ${!allPlanApproved ? 'disabled' : ''}`}>Replace with uploaded image<input disabled={!allPlanApproved} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadReplacement(selected, event)} /></label>
          </div>
        </aside>
      </section>}

      <footer className="studio-export panel"><div><p className="eyebrow">4. Package handoff</p><strong>{allImagesApproved ? 'All six images are approved.' : `${ROLE_ORDER.filter((role) => assets.get(role)?.status === 'approved').length}/6 images approved.`}</strong><span>The ZIP will contain the production post, six WebP files, alt text, captions, image notes, manifest records, and handoff materials.</span></div><button disabled={!allImagesApproved || Boolean(busy)} onClick={() => void exportPackage()}>Download publisher-ready ZIP</button></footer>
    </>}
  </section>;
}
