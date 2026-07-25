import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import JSZip, { JSZipObject } from 'jszip';
import { api } from './api';

type ImageSpec = { file: string; role: string; alt: string; caption: string | null };
type Manifest = { targetSite: string; repository: string; title: string; slug: string; publishedAt: string; status: string; section: string; excerpt: string; canonicalUrl: string; destinationPath: string; buildCommand: string; images: ImageSpec[]; playlistLinks?: { youtube: string; youtubeMusic: string; playlistId: string } };
type Check = { group: string; label: string; ok: boolean; detail: string };
type ImageView = ImageSpec & { url: string; present: boolean; imported: boolean; altMatches: boolean; captionMatches: boolean };
type Inspection = { root: string; dropPrefix: string; manifest: Manifest; files: string[]; productionFiles: string[]; checks: Check[]; images: ImageView[] };
type Session = { repository: string; slug: string; title: string; destinationPath: string; canonicalUrl: string; baseBranch: string; baseCommitSha: string; baseTreeSha: string; branch: string };
type Handoff = { repository: string; branch: string; commit: string; prNumber: number; prUrl: string; baseBranch: string };
type Status = { checks: { state: 'pending' | 'success' | 'failed'; items: Array<{name:string; status:string; conclusion:string|null}> }; deploymentUrl: string | null; smoke: { state:'pending'|'success'|'failed'; status?:number; smokeUrl?:string; error?:string }; readyToMerge: boolean };
type StepState = 'pending'|'active'|'complete'|'failed';
type Step = { label: string; state: StepState; detail?: string };
type Props = { accessKey: string };

const labels = ['Approval confirmed','GitHub base loaded','Production files uploaded','Atomic folder replacement created','Draft PR opened','GitHub checks passed','Vercel preview discovered','Published page smoke tested','Ready to merge'];
const steps = (): Step[] => labels.map(label => ({ label, state:'pending' }));
const normalize = (value:string) => value.replace(/\\/g,'/').replace(/^\.\//,'');
const escapeRx = (value:string) => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const find = (zip:JSZip, test:(name:string)=>boolean):JSZipObject|undefined => Object.values(zip.files).find(entry => !entry.dir && test(normalize(entry.name)));
const extract = (source:string, field:string) => source.match(new RegExp(`${field}:\\s*(?:\\n\\s*)?(["'])([\\s\\S]*?)\\1,`))?.[2]?.trim() ?? '';
const delay = (ms:number) => new Promise(resolve => window.setTimeout(resolve,ms));

function toBase64(bytes:Uint8Array) {
  let binary='';
  for(let i=0;i<bytes.length;i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(binary);
}

async function inspect(file:File):Promise<Inspection>{
  const zip=await JSZip.loadAsync(file);
  const files=Object.values(zip.files).filter(e=>!e.dir).map(e=>normalize(e.name)).sort();
  const manifestEntry=find(zip,n=>n.endsWith('/source/package-manifest.json'));
  if(!manifestEntry) throw new Error('No source/package-manifest.json was found.');
  const manifest=JSON.parse(await manifestEntry.async('text')) as Manifest;
  const root=normalize(manifestEntry.name).replace(/\/source\/package-manifest\.json$/,'');
  const dropPrefix=`${root}/drop-in/${manifest.slug}/`;
  const indexEntry=zip.file(`${dropPrefix}index.ts`);
  const source=indexEntry?await indexEntry.async('text'):'';
  const notesEntry=zip.file(`${root}/source/image-notes.md`);
  const imageNotes=notesEntry?await notesEntry.async('text'):'';
  const checks:Check[]=[];
  const add=(group:string,label:string,ok:boolean,detail:string)=>checks.push({group,label,ok,detail});
  add('Package','Repository',manifest.repository==='SuperDudePro/Blog-Site',manifest.repository||'Missing');
  add('Package','Destination',manifest.destinationPath===`src/content/posts/${manifest.slug}/`,manifest.destinationPath||'Missing');
  add('Package','Canonical URL',manifest.canonicalUrl===`https://ourolddad.com/post/${manifest.slug}`,manifest.canonicalUrl||'Missing');
  add('Package','Build command',manifest.buildCommand==='npm run build',manifest.buildCommand||'Missing');
  add('Package','Production index',Boolean(indexEntry),indexEntry?'Found':'Missing index.ts');
  for(const name of ['README-HANDOFF.md','source/post.md','source/image-notes.md','source/proposed-tracker-entry.md']) add('Package',name,files.includes(`${root}/${name}`),files.includes(`${root}/${name}`)?'Found':'Missing');
  for(const field of ['title','slug','excerpt','section','publishedAt','status'] as const){ const actual=extract(source,field); const expected=String(manifest[field]??''); add('Metadata',field,actual===expected,actual===expected?expected:`Manifest: ${expected}; index.ts: ${actual||'missing'}`); }
  const images=await Promise.all((manifest.images||[]).map(async image=>{
    const entry=zip.file(`${dropPrefix}${image.file}`); const blob=entry?await entry.async('blob'):null;
    const encoded=(value:string)=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const view:ImageView={...image,url:blob?URL.createObjectURL(blob):'',present:Boolean(blob),imported:new RegExp(`["']\\./${escapeRx(image.file)}["']`).test(source),altMatches:Boolean(image.alt&&(source.includes(image.alt)||source.includes(encoded(image.alt)))),captionMatches:image.caption?(source.includes(image.caption)||source.includes(encoded(image.caption))):true};
    add('Images',`${image.file}: file`,view.present,view.present?'Found':'Missing');
    add('Images',`${image.file}: import`,view.imported,view.imported?'Referenced':'Not referenced');
    add('Images',`${image.file}: alt`,view.altMatches,view.altMatches?'Matches':'Does not match');
    if(image.caption) add('Images',`${image.file}: caption`,view.captionMatches,view.captionMatches?'Matches':'Does not match');
    return view;
  }));
  const expectedSix = ['card-image.webp','hero-image.webp','body-image-1.webp','body-image-2.webp','body-image-3.webp','body-image-4.webp'];
  const hasSix=expectedSix.every(name=>manifest.images?.some(image=>image.file===name));
  const documentedException=/image-role exceptions?(?:, if any)?\s*:\s*(?!none\b|n\/a\b)[^\n]+/i.test(imageNotes);
  add('Images','Our Old Dad six-image default',hasSix||documentedException,hasSix?'Dedicated card, hero, and four body images':documentedException?'Fewer than six images with a documented exception':'Fewer than six images; document the exception in image notes');
  if(manifest.playlistLinks){
    const p=manifest.playlistLinks;
    add('Playlist','YouTube URL',p.youtube.includes(`list=${p.playlistId}`),p.youtube);
    add('Playlist','YouTube Music URL',p.youtubeMusic.includes(`list=${p.playlistId}`),p.youtubeMusic);
    add('Playlist','Links rendered',source.includes(p.youtube)&&source.includes(p.youtubeMusic),p.playlistId);
  }
  return {root,dropPrefix,manifest,files,productionFiles:files.filter(n=>n.startsWith(dropPrefix)),checks,images};
}

export default function PublisherWorkspace({ accessKey }: Props){
  const [file,setFile]=useState<File|null>(null);
  const [inspection,setInspection]=useState<Inspection|null>(null);
  const [selected,setSelected]=useState<ImageView|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [drag,setDrag]=useState(false);
  const [approval,setApproval]=useState(false);
  const [pipeline,setPipeline]=useState<Step[]>(steps());
  const [handoff,setHandoff]=useState<Handoff|null>(null);
  const [status,setStatus]=useState<Status|null>(null);
  const passed=inspection?.checks.filter(c=>c.ok).length||0;
  const total=inspection?.checks.length||0;
  const ready=Boolean(inspection&&passed===total);
  const groups=useMemo(()=>inspection?[...new Set(inspection.checks.map(c=>c.group))]:[],[inspection]);
  const update=(i:number,state:StepState,detail?:string)=>setPipeline(current=>current.map((s,n)=>n===i?{...s,state,detail}:s));

  async function load(chosen?:File){
    if(!chosen)return;
    if(!chosen.name.toLowerCase().endsWith('.zip')){setError('Choose a ZIP package.');return;}
    inspection?.images.forEach(i=>i.url&&URL.revokeObjectURL(i.url));
    setBusy(true);setError('');setFile(chosen);setInspection(null);setSelected(null);setHandoff(null);setStatus(null);setPipeline(steps());
    try{const result=await inspect(chosen);setInspection(result);setSelected(result.images[0]||null);}catch(e){setError(e instanceof Error?e.message:'Inspection failed.');}finally{setBusy(false);}
  }

  async function poll(h:Handoff,m:Manifest){
    for(let attempt=0;attempt<180;attempt++){
      const current=await api<Status>('/api/publish/status',accessKey,{repository:h.repository,prNumber:h.prNumber,commit:h.commit,canonicalUrl:m.canonicalUrl});setStatus(current);
      if(current.checks.state==='failed'){update(5,'failed','A required check failed.');throw new Error('A pull-request check failed. Open the draft PR for details.');}
      update(5,current.checks.state==='success'?'complete':'active',current.checks.state==='success'?`${current.checks.items.length} checks passed`:'Waiting for checks');
      update(6,current.deploymentUrl?'complete':'pending',current.deploymentUrl||'Waiting for Vercel');
      if(current.smoke.state==='failed'){update(7,'failed',current.smoke.error);throw new Error(current.smoke.error||'Smoke test failed.');}
      update(7,current.smoke.state==='success'?'complete':current.deploymentUrl?'active':'pending',current.smoke.state==='success'?`HTTP ${current.smoke.status}`:'Waiting for deployable route');
      if(current.readyToMerge){update(8,'complete','Final human review and merge remain manual.');return;}
      await delay(5000);
    }
    throw new Error('The checks are still running. Use Check status again.');
  }

  async function publish(){
    if(!file||!inspection||!ready)return;setApproval(false);setBusy(true);setError('');setPipeline(steps());setHandoff(null);setStatus(null);update(0,'complete','Explicit approval received.');
    try{
      update(1,'active','Reading main from GitHub');
      const start=await api<{session:Session}>('/api/publish/start',accessKey,{manifest:inspection.manifest});update(1,'complete',`${start.session.baseBranch} @ ${start.session.baseCommitSha.slice(0,7)}`);
      const zip=await JSZip.loadAsync(file);const entries=Object.values(zip.files).filter(e=>!e.dir&&normalize(e.name).startsWith(inspection.dropPrefix));const blobs:Array<{path:string;sha:string;size:number}>=[];
      update(2,'active',`0/${entries.length} files`);
      for(let i=0;i<entries.length;i++){const entry=entries[i];const path=normalize(entry.name).slice(inspection.dropPrefix.length);const bytes=await entry.async('uint8array');const result=await api<{sha:string;size:number}>('/api/publish/blob',accessKey,{repository:inspection.manifest.repository,encoding:'base64',content:toBase64(bytes)});blobs.push({path,sha:result.sha,size:bytes.length});update(2,'active',`${i+1}/${entries.length}: ${path}`);}
      update(2,'complete',`${entries.length} files uploaded`);update(3,'active','Replacing the destination folder in one tree and commit');
      const finish=await api<{result:Handoff}>('/api/publish/finish',accessKey,{manifest:inspection.manifest,session:start.session,blobs});setHandoff(finish.result);update(3,'complete',finish.result.commit.slice(0,7));update(4,'complete',`PR #${finish.result.prNumber}`);update(5,'active','Waiting for checks');await poll(finish.result,inspection.manifest);
    }catch(e){setError(e instanceof Error?e.message:'Publishing failed.');setPipeline(current=>{const i=current.findIndex(s=>s.state==='active');return i<0?current:current.map((s,n)=>n===i?{...s,state:'failed',detail:e instanceof Error?e.message:'Failed'}:s);});}finally{setBusy(false);}
  }

  return <section className="publisher-shell">
    <header className="workspace-heading"><div><p className="eyebrow">Wilbert Package Publisher</p><h2>Package in. Draft preview out.</h2><p className="intro">Inspect the ZIP, atomically replace one post folder, create one controlled commit, wait for GitHub and Vercel, smoke-test the route, and stop before merge.</p></div><div className="gate-badge"><strong>Manual merge</strong><span>Production remains human-controlled.</span></div></header>
    <label className={`drop-zone ${drag?'active':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={(e:DragEvent)=>{e.preventDefault();setDrag(false);void load(e.dataTransfer.files?.[0])}}><input type="file" accept=".zip" onChange={(e:ChangeEvent<HTMLInputElement>)=>void load(e.target.files?.[0])}/><strong>{busy&&!inspection?'Reading package…':'Drop a finished post ZIP here'}</strong><span>or click to choose one</span></label>
    {error&&<div className="error-banner">{error}</div>}
    {approval&&inspection&&<section className="panel approval"><p className="eyebrow">Approval required</p><h3>Create the draft preview?</h3><p>This atomically replaces only <code>{inspection.manifest.destinationPath}</code>, opens a draft PR, and does not merge production.</p><div className="actions"><button className="ghost" onClick={()=>setApproval(false)}>Cancel</button><button onClick={()=>void publish()}>Approve and start</button></div></section>}
    {inspection&&<>
      <section className="hero"><div><p className="eyebrow">{inspection.manifest.targetSite}</p><h3>{inspection.manifest.title}</h3><p>{inspection.manifest.excerpt}</p></div><div className={`score ${ready?'good':''}`}><span>{status?.readyToMerge?'Ready to merge':ready?'Ready for approval':'Needs attention'}</span><strong>{passed}/{total}</strong><small>checks passed</small></div></section>
      <section className="meta">{[['Slug',inspection.manifest.slug],['Section',inspection.manifest.section],['Published',inspection.manifest.publishedAt],['Repository',inspection.manifest.repository],['Destination',inspection.manifest.destinationPath]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</section>
      {(busy||handoff)&&<section className="panel pipeline"><div className="panel-head"><div><p className="eyebrow">Draft preview pipeline</p><h3>{status?.readyToMerge?'Ready for final review':busy?'Working through the pipeline':'Current pipeline status'}</h3></div>{handoff&&<button className="ghost" disabled={busy} onClick={()=>{setBusy(true);void poll(handoff,inspection.manifest).catch(e=>setError(e.message)).finally(()=>setBusy(false));}}>Check status</button>}</div><div className="pipeline-grid"><div>{pipeline.map(s=><div className="step" key={s.label}><i className={s.state}>{s.state==='complete'?'✓':s.state==='failed'?'!':s.state==='active'?'…':'○'}</i><div><strong>{s.label}</strong><span>{s.detail||s.state}</span></div></div>)}</div>{handoff&&<aside><p><b>Branch</b><br/>{handoff.branch}</p><p><b>Commit</b><br/>{handoff.commit}</p><a href={handoff.prUrl} target="_blank" rel="noreferrer">Open draft PR</a>{status?.deploymentUrl&&<a href={status.deploymentUrl} target="_blank" rel="noreferrer">Open Vercel preview</a>}{status?.smoke.smokeUrl&&<a href={status.smoke.smokeUrl} target="_blank" rel="noreferrer">Open tested post</a>}</aside>}</div></section>}
      <section className="workspace"><div className="panel"><p className="eyebrow">Images</p><div className="image-grid">{inspection.images.map(img=><button className={selected?.file===img.file?'selected':''} key={img.file} onClick={()=>setSelected(img)}>{img.url?<img src={img.url} alt={img.alt}/>:<span>Missing</span>}<b>{img.file}</b><small>{img.role}</small></button>)}</div></div><aside className="panel inspector">{selected&&<><img src={selected.url} alt={selected.alt}/><h3>{selected.file}</h3><p><b>Alt:</b> {selected.alt}</p><p><b>Caption:</b> {selected.caption||'None'}</p></>}</aside></section>
      <section className="workspace lower"><div className="panel"><p className="eyebrow">Validation</p>{groups.map(g=><div key={g}><h3>{g}</h3>{inspection.checks.filter(c=>c.group===g).map(c=><div className="check" key={c.label}><i className={c.ok?'complete':'failed'}>{c.ok?'✓':'!'}</i><div><strong>{c.label}</strong><span>{c.detail}</span></div></div>)}</div>)}</div><div className="panel"><p className="eyebrow">Production files</p>{inspection.productionFiles.map(f=><code key={f}>{f.replace(`${inspection.root}/`,'')}</code>)}</div></section>
      <footer className="publisher-footer panel"><div><strong>{file?.name}</strong><span>{status?.readyToMerge?'Open the PR for final review and manual merge.':handoff?'The draft preview exists.':'Package is ready for approval.'}</span></div>{status?.readyToMerge&&handoff?<a href={handoff.prUrl} target="_blank" rel="noreferrer">Open PR to finish</a>:handoff?<button disabled={busy} onClick={()=>{setBusy(true);void poll(handoff,inspection.manifest).catch(e=>setError(e.message)).finally(()=>setBusy(false));}}>Check status</button>:<button disabled={!ready||busy} onClick={()=>setApproval(true)}>Create draft preview</button>}</footer>
    </>}
  </section>;
}
