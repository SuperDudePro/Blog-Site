import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { inspectPackage } from './inspectPackage.js';
import type { ImageView, Inspection } from './inspectPackage.js';
import type { NormalizedManifest as Manifest } from './packageManifest.js';
import { clearPublisherJob, loadPublisherJob, savePublisherJob } from './jobPersistence.js';
import { resetPipelineForStatusCheck } from './pipelineState.js';
type Session = { repository: string; slug: string; title: string; destinationPath: string; canonicalUrl: string; baseBranch: string; baseCommitSha: string; baseTreeSha: string; branch?: string; operation?: 'create'|'replace'; existingFiles?: Array<{path:string;sha:string;size?:number}> };
type Handoff = { repository: string; branch: string; commit: string; prNumber: number; prUrl: string; baseBranch: string; canonicalUrl?: string; title?: string };
type ResumeJob = { handoff:Handoff; manifest:Manifest; state:'open'|'closed'|'merged'; updatedAt:string };
type Verification = { state:'pending'|'success'|'failed'; status?:number; smokeUrl?:string; error?:string; deployedCommit?:string; mergeCommit?:string };
type Status = { checks: { state: 'pending' | 'success' | 'failed'; items: Array<{name:string; status:string; conclusion:string|null}> }; deploymentUrl: string | null; smoke: Verification; readyToMerge: boolean; merged: boolean; mergedAt: string|null; production: Verification; publishingComplete: boolean };
type StepState = 'pending'|'active'|'complete'|'failed';
type Step = { label: string; state: StepState; detail?: string };

const KEY = 'wilbert-publisher-access-key';
const labels = ['Approval confirmed','GitHub base loaded','Production files uploaded','Atomic commit created','Draft PR opened','GitHub checks passed','Vercel preview discovered','Preview page verified','Ready for your merge','Production deployment verified'];
const steps = (): Step[] => labels.map(label => ({ label, state:'pending' }));
const normalize = (value:string) => value.replace(/\\/g,'/').replace(/^\.\//,'');
const delay = (ms:number) => new Promise(resolve => window.setTimeout(resolve,ms));
const jobKey = (handoff:Handoff) => `${handoff.repository}#${handoff.prNumber}`;
const rememberJob = (handoff:Handoff) => {
  const url=new URL(window.location.href);
  url.searchParams.set('job',jobKey(handoff));
  window.history.replaceState(null,'',url);
};

function toBase64(bytes:Uint8Array) {
  let binary='';
  for(let i=0;i<bytes.length;i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(binary);
}

async function api<T>(path:string,key:string,body?:unknown):Promise<T>{
  const response=await fetch(path,{method:'POST',headers:{'content-type':'application/json','x-publisher-key':key},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  const payload=await response.json().catch(()=>({error:`HTTP ${response.status}`}));
  if(!response.ok) throw new Error(payload.error || 'Publisher request failed.');
  return payload as T;
}

export default function App(){
  const [restoredJob] = useState(()=>loadPublisherJob(localStorage));
  const [key,setKey]=useState(sessionStorage.getItem(KEY)||'');
  const [keyInput,setKeyInput]=useState(key);
  const [authenticated,setAuthenticated]=useState(false);
  const [authError,setAuthError]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [inspection,setInspection]=useState<Inspection|null>(restoredJob?.inspection||null);
  const [selected,setSelected]=useState<ImageView|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [drag,setDrag]=useState(false);
  const [approval,setApproval]=useState(false);
  const [pipeline,setPipeline]=useState<Step[]>(()=>restoredJob
    ? steps().map((step,index)=>index<5?{...step,state:'complete' as StepState}:index===5?{...step,state:'active' as StepState}:step)
    : steps());
  const [handoff,setHandoff]=useState<Handoff|null>(restoredJob?.handoff||null);
  const [status,setStatus]=useState<Status|null>(null);
  const passed=inspection?.checks.filter(c=>c.ok).length||0;
  const total=inspection?.checks.length||0;
  const ready=Boolean(inspection&&passed===total);
  const groups=useMemo(()=>inspection?[...new Set(inspection.checks.map(c=>c.group))]:[],[inspection]);
  const update=(i:number,state:StepState,detail?:string)=>setPipeline(current=>current.map((s,n)=>n===i?{...s,state,detail}:s));

  function resumeInspection(job:ResumeJob):Inspection {
    return {
      manifest: job.manifest,
      profile: {
        id: job.manifest.repository === 'SuperDudePro/LifeEducationOrg' ? 'lifeeducation' : 'our-old-dad',
        targetSite: job.manifest.targetSite,
        repository: job.manifest.repository,
        canonicalPrefix: new URL(job.manifest.canonicalUrl).origin,
        buildCommand: '',
        sourceFiles: [],
        metadataFields: [],
        imageDirectory: '',
        statuses: [],
        sections: [],
      },
      files: [],
      checks: [{ group:'Recovery', label:'Publishing job restored from GitHub', ok:true, detail:`PR #${job.handoff.prNumber}` }],
      images: [],
      productionFiles: [],
      preflight: {
        productionPaths: [],
        sourceFiles: {},
        imageMetadata: [],
      },
      root: '',
      dropPrefix: '',
    };
  }

  async function login(candidate:string){ setAuthError(''); try{await api('/api/session',candidate);sessionStorage.setItem(KEY,candidate);setKey(candidate);setAuthenticated(true);}catch(e){setAuthenticated(false);setAuthError(e instanceof Error?e.message:'Access failed.');} }
  useEffect(()=>{if(key)void login(key);},[]);
  useEffect(()=>{
    if(!authenticated||restoredJob||handoff||inspection||busy)return;
    setBusy(true);
    const requestedJob=new URL(window.location.href).searchParams.get('job')||'';
    void api<{job:ResumeJob|null;jobKey:string;recoveryError?:string}>('/api/publish/resume',key,{job:requestedJob})
      .then(({job,recoveryError})=>{
        if(recoveryError)setError(recoveryError);
        if(!job)return;
        const recovered=resumeInspection(job);
        setInspection(recovered);
        setHandoff(job.handoff);
        rememberJob(job.handoff);
        savePublisherJob(localStorage,job.handoff,recovered);
        setPipeline(steps().map((step,index)=>index<5?{...step,state:'complete' as StepState}:index===5?{...step,state:'active' as StepState}:step));
        return poll(job.handoff,job.manifest);
      })
      .catch(e=>setError(e instanceof Error?e.message:'Could not restore the active publishing job.'))
      .finally(()=>setBusy(false));
  },[authenticated]);
  async function load(chosen?:File){ if(!chosen)return; if(!chosen.name.toLowerCase().endsWith('.zip')){setError('Choose a ZIP package.');return;} inspection?.images.forEach(i=>i.url&&URL.revokeObjectURL(i.url));clearPublisherJob(localStorage);setBusy(true);setError('');setFile(chosen);setInspection(null);setSelected(null);setHandoff(null);setStatus(null);setPipeline(steps());try{const result=await inspectPackage(chosen);setInspection(result);setSelected(result.images[0]||null);}catch(e){setError(e instanceof Error?e.message:'Inspection failed.');}finally{setBusy(false);} }

  async function poll(h:Handoff,m:Manifest){
    for(let attempt=0;attempt<180;attempt++){
      const current=await api<Status>('/api/publish/status',key,{handoff:h,manifest:m});setStatus(current);
      if(current.checks.state==='failed'){update(5,'failed','A required check failed.');throw new Error('A pull-request check failed. Open the draft PR for details.');}
      update(5,current.checks.state==='success'?'complete':'active',current.checks.state==='success'?`${current.checks.items.length} checks passed`:'Waiting for checks');
      update(6,current.deploymentUrl?'complete':'pending',current.deploymentUrl||'Waiting for Vercel');
      if(current.smoke.state==='failed'){update(7,'failed',current.smoke.error);throw new Error(current.smoke.error||'Smoke test failed.');}
      update(7,current.smoke.state==='success'?'complete':current.deploymentUrl?'active':'pending',current.smoke.state==='success'?`HTTP ${current.smoke.status}`:'Waiting for deployable route');
      if(current.merged){
        update(8,'complete',current.mergedAt?`Merged manually ${new Date(current.mergedAt).toLocaleString()}`:'Merged manually.');
        if(current.production.state==='failed'){update(9,'failed',current.production.error);throw new Error(current.production.error||'Production verification failed.');}
        update(9,current.production.state==='success'?'complete':'active',current.production.state==='success'?'Merged commit and live post verified.':current.production.error||'Waiting for production deployment');
        if(current.publishingComplete)return;
      } else {
        update(9,'pending','Waiting for your manual merge.');
      }
      if(current.readyToMerge){update(8,'complete','Final human review and merge remain manual.');return;}
      await delay(5000);
    }
    throw new Error('The checks are still running. Use Check status again.');
  }

  function checkStatus(h:Handoff,m:Manifest){
    setError('');
    setPipeline(current=>resetPipelineForStatusCheck(current));
    setBusy(true);
    void poll(h,m)
      .catch(e=>setError(e instanceof Error?e.message:'Status check failed.'))
      .finally(()=>setBusy(false));
  }

  useEffect(()=>{
    if(!handoff||!inspection||!status?.readyToMerge||status.merged||status.publishingComplete||busy)return;
    const timer=window.setInterval(()=>{
      setBusy(true);
      void poll(handoff,inspection.manifest).catch(e=>setError(e instanceof Error?e.message:'Status check failed.')).finally(()=>setBusy(false));
    },15000);
    return ()=>window.clearInterval(timer);
  },[handoff,inspection,status?.readyToMerge,status?.merged,status?.publishingComplete,busy]);

  useEffect(()=>{
    if(!authenticated||!restoredJob||!handoff||!inspection||status||busy)return;
    setBusy(true);
    void poll(handoff,inspection.manifest)
      .catch(e=>setError(e instanceof Error?e.message:'Status check failed.'))
      .finally(()=>setBusy(false));
  },[authenticated]);

  async function publish(){
    if(!file||!inspection||!ready)return;setApproval(false);setBusy(true);setError('');setPipeline(steps());setHandoff(null);setStatus(null);update(0,'complete','Explicit approval received.');
    try{
      update(1,'active','Reading main from GitHub');
      const start=await api<{session:Session}>('/api/publish/start',key,{manifest:inspection.manifest,preflight:inspection.preflight});update(1,'complete',`${start.session.baseBranch} @ ${start.session.baseCommitSha.slice(0,7)}`);
      const zip=await JSZip.loadAsync(file);const entries=Object.values(zip.files).filter(e=>!e.dir&&normalize(e.name).startsWith(inspection.dropPrefix));const blobs:Array<{path:string;sha:string;size:number}>=[];
      update(2,'active',`0/${entries.length} files`);
      for(let i=0;i<entries.length;i++){const entry=entries[i];const path=normalize(entry.name).slice(inspection.dropPrefix.length);const bytes=await entry.async('uint8array');const result=await api<{sha:string;size:number}>('/api/publish/blob',key,{repository:inspection.manifest.repository,encoding:'base64',content:toBase64(bytes)});blobs.push({path,sha:result.sha,size:bytes.length});update(2,'active',`${i+1}/${entries.length}: ${path}`);}
      update(2,'complete',`${entries.length} files uploaded`);update(3,'active','Creating one tree and commit');
      const finish=await api<{result:Handoff}>('/api/publish/finish',key,{manifest:inspection.manifest,session:start.session,blobs});savePublisherJob(localStorage,finish.result,inspection);rememberJob(finish.result);setHandoff(finish.result);update(3,'complete',finish.result.commit.slice(0,7));update(4,'complete',`PR #${finish.result.prNumber}`);update(5,'active','Waiting for checks');await poll(finish.result,inspection.manifest);
    }catch(e){setError(e instanceof Error?e.message:'Publishing failed.');setPipeline(current=>{const i=current.findIndex(s=>s.state==='active');return i<0?current:current.map((s,n)=>n===i?{...s,state:'failed',detail:e instanceof Error?e.message:'Failed'}:s);});}finally{setBusy(false);}
  }

  if(!authenticated)return <main className="auth-shell"><form className="auth-card" onSubmit={(e:FormEvent)=>{e.preventDefault();void login(keyInput.trim());}}><p className="eyebrow">Wilbert Publisher</p><h1>Private publishing control.</h1><p>Enter the publisher access key. The GitHub token stays on the server.</p><input type="password" value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="Publisher access key" />{authError&&<div className="error-banner">{authError}</div>}<button disabled={!keyInput.trim()}>Open publisher</button></form></main>;

  return <main className="app-shell">
    <header className="masthead"><div><p className="eyebrow">Wilbert Publisher</p><h1>Package in. Verified publishing out.</h1><p className="intro">Inspect the ZIP, create one controlled commit, verify the preview, leave the merge decision to you, then confirm the merged post reaches production.</p></div><button className="ghost" onClick={()=>{sessionStorage.removeItem(KEY);setAuthenticated(false);}}>Lock</button></header>
    <label className={`drop-zone ${drag?'active':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={(e:DragEvent)=>{e.preventDefault();setDrag(false);void load(e.dataTransfer.files?.[0])}}><input type="file" accept=".zip" onChange={(e:ChangeEvent<HTMLInputElement>)=>void load(e.target.files?.[0])}/><strong>{busy&&!inspection?'Reading package…':'Drop a finished post ZIP here'}</strong><span>or click to choose one</span></label>
    {error&&<div className="error-banner">{error}</div>}
    {approval&&inspection&&<section className="panel approval"><p className="eyebrow">Approval required</p><h2>Create the draft preview?</h2><p>This writes only <code>{inspection.manifest.destinationPath}</code>, opens a draft PR, and does not merge production.</p><div className="actions"><button className="ghost" onClick={()=>setApproval(false)}>Cancel</button><button onClick={()=>void publish()}>Approve and start</button></div></section>}
    {inspection&&<>
      <section className="hero"><div><p className="eyebrow">{inspection.manifest.targetSite}</p><h2>{inspection.manifest.title}</h2><p>{inspection.manifest.excerpt}</p></div><div className={`score ${ready?'good':''}`}><span>{status?.publishingComplete?'Published':status?.merged?'Finishing production':status?.readyToMerge?'Ready for your merge':ready?'Ready for approval':'Needs attention'}</span><strong>{passed}/{total}</strong><small>checks passed</small></div></section>
      <section className="meta">{[['Slug',inspection.manifest.slug],['Section / topic',inspection.manifest.section||inspection.manifest.topic],['Published',inspection.manifest.publishedAt],['Repository',inspection.manifest.repository],['Destination',inspection.manifest.destinationPath]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</section>
      {(busy||handoff)&&<section className="panel pipeline"><div className="panel-head"><div><p className="eyebrow">Publishing pipeline</p><h2>{status?.publishingComplete?'Publishing complete':status?.merged?'Verifying production':status?.readyToMerge?'Ready for final review':busy?'Working through the pipeline':'Current pipeline status'}</h2></div>{handoff&&<button className="ghost" disabled={busy} onClick={()=>checkStatus(handoff,inspection.manifest)}>Check status</button>}</div><div className="pipeline-grid"><div>{pipeline.map(s=><div className="step" key={s.label}><i className={s.state}>{s.state==='complete'?'✓':s.state==='failed'?'!':s.state==='active'?'…':'○'}</i><div><strong>{s.label}</strong><span>{s.detail||s.state}</span></div></div>)}</div>{handoff&&<aside><p><b>Branch</b><br/>{handoff.branch}</p><p><b>Commit</b><br/>{handoff.commit}</p><a href={handoff.prUrl} target="_blank" rel="noreferrer">Open draft PR</a>{status?.deploymentUrl&&<a href={status.deploymentUrl} target="_blank" rel="noreferrer">Open Vercel preview</a>}{status?.smoke.smokeUrl&&<a href={status.smoke.smokeUrl} target="_blank" rel="noreferrer">Open tested preview</a>}{status?.publishingComplete&&<a href={inspection.manifest.canonicalUrl} target="_blank" rel="noreferrer">Open published post</a>}</aside>}</div></section>}
      <section className="workspace"><div className="panel"><p className="eyebrow">Images</p><div className="image-grid">{inspection.images.map(img=><button className={selected?.file===img.file?'selected':''} key={img.file} onClick={()=>setSelected(img)}>{img.url?<img src={img.url} alt={img.alt}/>:<span>Missing</span>}<b>{img.file}</b><small>{img.role}</small></button>)}</div></div><aside className="panel inspector">{selected&&<><img src={selected.url} alt={selected.alt}/><h3>{selected.file}</h3><p><b>Alt:</b> {selected.alt}</p><p><b>Caption:</b> {selected.caption||'None'}</p></>}</aside></section>
      <section className="workspace lower"><div className="panel"><p className="eyebrow">Validation</p>{groups.map(g=><div key={g}><h3>{g}</h3>{inspection.checks.filter(c=>c.group===g).map(c=><div className="check" key={c.label}><i className={c.ok?'complete':'failed'}>{c.ok?'✓':'!'}</i><div><strong>{c.label}</strong><span>{c.detail}</span></div></div>)}</div>)}</div><div className="panel"><p className="eyebrow">Production files</p>{inspection.productionFiles.map(f=><code key={f}>{f.replace(`${inspection.root}/`,'')}</code>)}</div></section>
      <footer><div><strong>{file?.name}</strong><span>{status?.publishingComplete?'Publishing complete. The merged post is live and verified.':status?.merged?'The PR is merged. Check status while production deploys.':status?.readyToMerge?'Open the PR for final review and manual merge.':handoff?'The draft preview exists.':'Package is ready for approval.'}</span></div>{status?.publishingComplete?<a href={inspection.manifest.canonicalUrl} target="_blank" rel="noreferrer">Open published post</a>:status?.readyToMerge&&handoff?<a href={handoff.prUrl} target="_blank" rel="noreferrer">Open PR to finish</a>:handoff?<button disabled={busy} onClick={()=>checkStatus(handoff,inspection.manifest)}>Check status</button>:<button disabled={!ready||busy} onClick={()=>setApproval(true)}>Create draft preview</button>}</footer>
    </>}
  </main>;
}
