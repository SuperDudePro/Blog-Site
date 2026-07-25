import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import JSZip, { JSZipObject } from 'jszip';

type ImageSpec = {
  file: string;
  role: string;
  alt: string;
  caption: string | null;
};

type PackageManifest = {
  targetSite: string;
  repository: string;
  title: string;
  slug: string;
  publishedAt: string;
  status: string;
  section: string;
  excerpt: string;
  canonicalUrl: string;
  destinationPath: string;
  buildCommand: string;
  images: ImageSpec[];
};

type ValidationItem = {
  label: string;
  ok: boolean;
  detail: string;
};

type InspectedImage = ImageSpec & {
  path: string;
  url: string;
  referencedInIndex: boolean;
  altFoundInIndex: boolean;
  captionFoundInIndex: boolean;
};

type Inspection = {
  archiveName: string;
  root: string;
  manifest: PackageManifest;
  files: string[];
  sourceFiles: string[];
  productionFiles: string[];
  indexPath: string;
  indexSource: string;
  images: InspectedImage[];
  validation: ValidationItem[];
};

const requiredSourceNames = [
  'post.md',
  'image-notes.md',
  'package-manifest.json',
  'proposed-tracker-entry.md',
];

const normalise = (value: string) => value.replace(/\\/g, '/').replace(/^\.\//, '');

const findEntry = (zip: JSZip, predicate: (name: string) => boolean): JSZipObject | undefined =>
  Object.values(zip.files).find((entry) => !entry.dir && predicate(normalise(entry.name)));

const extractField = (source: string, field: string) => {
  const pattern = new RegExp(`${field}:\\s*(?:\\n\\s*)?(["'])([\\s\\S]*?)\\1,`);
  return source.match(pattern)?.[2]?.trim() ?? '';
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function inspectArchive(file: File): Promise<Inspection> {
  const zip = await JSZip.loadAsync(file);
  const files = Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => normalise(entry.name))
    .sort();

  const manifestEntry = findEntry(zip, (name) => name.endsWith('/source/package-manifest.json'));
  if (!manifestEntry) throw new Error('No source/package-manifest.json was found.');

  const manifest = JSON.parse(await manifestEntry.async('text')) as PackageManifest;
  const root = normalise(manifestEntry.name).replace(/\/source\/package-manifest\.json$/, '');
  const sourcePrefix = `${root}/source/`;
  const dropInPrefix = `${root}/drop-in/${manifest.slug}/`;
  const indexPath = `${dropInPrefix}index.ts`;
  const indexEntry = zip.file(indexPath);
  const indexSource = indexEntry ? await indexEntry.async('text') : '';

  const inspectedImages = await Promise.all(
    manifest.images.map(async (image): Promise<InspectedImage> => {
      const path = `${dropInPrefix}${image.file}`;
      const entry = zip.file(path);
      const blob = entry ? await entry.async('blob') : null;
      return {
        ...image,
        path,
        url: blob ? URL.createObjectURL(blob) : '',
        referencedInIndex: Boolean(indexSource.match(new RegExp(`['\"]\\./${escapeRegExp(image.file)}['\"]`))),
        altFoundInIndex: Boolean(image.alt && indexSource.includes(image.alt)),
        captionFoundInIndex: image.caption ? indexSource.includes(image.caption) : true,
      };
    }),
  );

  const sourceFiles = files.filter((name) => name.startsWith(sourcePrefix));
  const productionFiles = files.filter((name) => name.startsWith(dropInPrefix));
  const readmePath = `${root}/README-HANDOFF.md`;

  const manifestMetadataChecks: Array<[keyof PackageManifest, string]> = [
    ['title', 'Title'],
    ['slug', 'Slug'],
    ['excerpt', 'Excerpt'],
    ['section', 'Section'],
    ['publishedAt', 'Publication date'],
    ['status', 'Status'],
  ];

  const validation: ValidationItem[] = [
    {
      label: 'Handoff instructions',
      ok: files.includes(readmePath),
      detail: files.includes(readmePath) ? 'README-HANDOFF.md found.' : 'README-HANDOFF.md is missing.',
    },
    {
      label: 'Production entry point',
      ok: Boolean(indexEntry),
      detail: indexEntry ? indexPath : `Missing ${indexPath}`,
    },
    {
      label: 'Destination contract',
      ok: manifest.destinationPath.endsWith(`/${manifest.slug}/`),
      detail: manifest.destinationPath,
    },
    ...requiredSourceNames.map((name): ValidationItem => ({
      label: `Source: ${name}`,
      ok: files.includes(`${sourcePrefix}${name}`),
      detail: files.includes(`${sourcePrefix}${name}`) ? 'Found.' : 'Missing.',
    })),
    ...manifestMetadataChecks.map(([field, label]): ValidationItem => {
      const expected = String(manifest[field] ?? '');
      const actual = extractField(indexSource, field);
      return {
        label: `${label} matches index.ts`,
        ok: Boolean(indexSource) && actual === expected,
        detail: actual === expected ? expected : `Manifest: ${expected || '—'} | index.ts: ${actual || 'not found'}`,
      };
    }),
    ...inspectedImages.flatMap((image): ValidationItem[] => [
      {
        label: `${image.file} exists`,
        ok: Boolean(image.url),
        detail: image.path,
      },
      {
        label: `${image.file} imported`,
        ok: image.referencedInIndex,
        detail: image.referencedInIndex ? 'Referenced by index.ts.' : 'Not referenced by index.ts.',
      },
      {
        label: `${image.file} alt text`,
        ok: image.altFoundInIndex,
        detail: image.altFoundInIndex ? 'Manifest alt text matches index.ts.' : 'Manifest alt text not found in index.ts.',
      },
      ...(image.caption
        ? [{
            label: `${image.file} caption`,
            ok: image.captionFoundInIndex,
            detail: image.captionFoundInIndex ? 'Manifest caption matches index.ts.' : 'Manifest caption not found in index.ts.',
          }]
        : []),
    ]),
  ];

  return {
    archiveName: file.name,
    root,
    manifest,
    files,
    sourceFiles,
    productionFiles,
    indexPath,
    indexSource,
    images: inspectedImages,
    validation,
  };
}

function App() {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [selectedImage, setSelectedImage] = useState<InspectedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const summary = useMemo(() => {
    if (!inspection) return null;
    const passed = inspection.validation.filter((item) => item.ok).length;
    return { passed, total: inspection.validation.length, ready: passed === inspection.validation.length };
  }, [inspection]);

  const loadFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('Please choose a ZIP package.');
      return;
    }

    inspection?.images.forEach((image) => image.url && URL.revokeObjectURL(image.url));
    setLoading(true);
    setError('');
    setInspection(null);
    setSelectedImage(null);

    try {
      const result = await inspectArchive(file);
      setInspection(result);
      setSelectedImage(result.images[0] ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The package could not be inspected.');
    } finally {
      setLoading(false);
    }
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    loadFile(event.dataTransfer.files?.[0]);
  };

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">Wilbert Publisher</p>
          <h1>Inspect the package before it touches the site.</h1>
          <p className="intro">The manifest is the contract. The production files have to prove they match it.</p>
        </div>
        <div className="phase-pill">Phase 2 · Inspector</div>
      </header>

      <label
        className={`drop-zone ${dragActive ? 'drop-zone--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <input type="file" accept=".zip,application/zip" onChange={onInput} />
        <strong>{loading ? 'Reading package…' : 'Drop a finished post ZIP here'}</strong>
        <span>or click to choose one</span>
      </label>

      {error && <div className="error-banner">{error}</div>}

      {inspection && summary && (
        <>
          <section className="package-hero">
            <div>
              <p className="eyebrow">{inspection.manifest.targetSite}</p>
              <h2>{inspection.manifest.title}</h2>
              <p>{inspection.manifest.excerpt}</p>
            </div>
            <div className={`status-card ${summary.ready ? 'status-card--ready' : ''}`}>
              <span>{summary.ready ? 'Ready for preview' : 'Needs attention'}</span>
              <strong>{summary.passed}/{summary.total}</strong>
              <small>checks passed</small>
            </div>
          </section>

          <section className="metadata-grid">
            <Metadata label="Slug" value={inspection.manifest.slug} />
            <Metadata label="Section" value={inspection.manifest.section} />
            <Metadata label="Status" value={inspection.manifest.status} />
            <Metadata label="Published" value={inspection.manifest.publishedAt} />
            <Metadata label="Repository" value={inspection.manifest.repository} />
            <Metadata label="Destination" value={inspection.manifest.destinationPath} />
          </section>

          <section className="workspace-grid">
            <div className="panel image-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Image roles</p>
                  <h3>{inspection.images.length} production images</h3>
                </div>
              </div>
              <div className="image-grid">
                {inspection.images.map((image) => (
                  <button
                    className={`image-card ${selectedImage?.file === image.file ? 'image-card--selected' : ''}`}
                    key={image.file}
                    onClick={() => setSelectedImage(image)}
                  >
                    {image.url ? <img src={image.url} alt={image.alt} /> : <div className="missing-image">Missing</div>}
                    <span>{image.file}</span>
                    <small>{image.role}</small>
                  </button>
                ))}
              </div>
            </div>

            <aside className="panel inspector-panel">
              <p className="eyebrow">Inspector</p>
              {selectedImage ? (
                <>
                  {selectedImage.url && <img className="inspector-preview" src={selectedImage.url} alt={selectedImage.alt} />}
                  <h3>{selectedImage.file}</h3>
                  <Definition label="Role" value={selectedImage.role} />
                  <Definition label="Alt text" value={selectedImage.alt} />
                  <Definition label="Caption" value={selectedImage.caption ?? 'No caption required'} />
                  <div className="mini-checks">
                    <Check ok={Boolean(selectedImage.url)} label="File present" />
                    <Check ok={selectedImage.referencedInIndex} label="Imported in index.ts" />
                    <Check ok={selectedImage.altFoundInIndex} label="Alt matches" />
                    {selectedImage.caption && <Check ok={selectedImage.captionFoundInIndex} label="Caption matches" />}
                  </div>
                </>
              ) : (
                <p>Select an image to inspect its role and references.</p>
              )}
            </aside>
          </section>

          <section className="workspace-grid lower-grid">
            <div className="panel">
              <p className="eyebrow">Validation</p>
              <h3>Package contract</h3>
              <div className="validation-list">
                {inspection.validation.map((item) => (
                  <div className="validation-row" key={`${item.label}-${item.detail}`}>
                    <Check ok={item.ok} label={item.label} />
                    <span>{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel file-panel">
              <p className="eyebrow">Archive contents</p>
              <h3>{inspection.files.length} files found</h3>
              <FileGroup title="Source package" files={inspection.sourceFiles} root={inspection.root} />
              <FileGroup title="Production drop-in" files={inspection.productionFiles} root={inspection.root} />
            </div>
          </section>

          <footer className="action-bar">
            <div>
              <strong>{inspection.archiveName}</strong>
              <span>{summary.ready ? 'The package is ready for the site-preview step.' : 'Resolve failed checks before previewing.'}</span>
            </div>
            <button disabled={!summary.ready}>Build site preview</button>
          </footer>
        </>
      )}
    </main>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return <div className="metadata-item"><span>{label}</span><strong>{value}</strong></div>;
}

function Definition({ label, value }: { label: string; value: string }) {
  return <div className="definition"><span>{label}</span><p>{value}</p></div>;
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return <div className={`check ${ok ? 'check--ok' : 'check--bad'}`}><span>{ok ? '✓' : '!'}</span><strong>{label}</strong></div>;
}

function FileGroup({ title, files, root }: { title: string; files: string[]; root: string }) {
  return (
    <div className="file-group">
      <h4>{title}</h4>
      {files.map((file) => <code key={file}>{file.replace(`${root}/`, '')}</code>)}
    </div>
  );
}

export default App;
