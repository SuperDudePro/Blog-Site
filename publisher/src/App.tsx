import { FormEvent, useEffect, useState } from 'react';
import { api } from './api';
import PublisherWorkspace from './PublisherWorkspace';
import StudioWorkspace from './StudioWorkspace';

type Workspace = 'studio' | 'publisher';
const KEY = 'wilbert-publisher-access-key';

export default function App() {
  const [key, setKey] = useState(sessionStorage.getItem(KEY) || '');
  const [keyInput, setKeyInput] = useState(key);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [workspace, setWorkspace] = useState<Workspace>('studio');

  async function login(candidate: string) {
    setAuthError('');
    try {
      await api('/api/session', candidate);
      sessionStorage.setItem(KEY, candidate);
      setKey(candidate);
      setAuthenticated(true);
    } catch (caught) {
      setAuthenticated(false);
      setAuthError(caught instanceof Error ? caught.message : 'Access failed.');
    }
  }

  useEffect(() => {
    if (key) void login(key);
  }, []);

  if (!authenticated) return <main className="auth-shell">
    <form className="auth-card" onSubmit={(event: FormEvent) => { event.preventDefault(); void login(keyInput.trim()); }}>
      <p className="eyebrow">Wilbert</p>
      <h1>Private publishing control.</h1>
      <p>Enter the publisher access key. AI Gateway and GitHub credentials stay on the server.</p>
      <input type="password" value={keyInput} onChange={(event) => setKeyInput(event.target.value)} placeholder="Publisher access key" />
      {authError && <div className="error-banner">{authError}</div>}
      <button disabled={!keyInput.trim()}>Open Wilbert</button>
    </form>
  </main>;

  return <main className="app-shell">
    <header className="masthead">
      <div>
        <p className="eyebrow">Wilbert</p>
        <h1>Design first. Publish second.</h1>
        <p className="intro">The Image Studio turns approved Our Old Dad text into a controlled six-image package. The Package Publisher validates that ZIP and creates the draft preview only after a separate approval.</p>
      </div>
      <button className="ghost" onClick={() => { sessionStorage.removeItem(KEY); setAuthenticated(false); }}>Lock</button>
    </header>
    <nav className="workspace-nav" aria-label="Wilbert workspaces">
      <button className={workspace === 'studio' ? 'selected' : ''} aria-pressed={workspace === 'studio'} onClick={() => setWorkspace('studio')}><strong>Image Studio</strong><span>Plan, generate, review, export</span></button>
      <button className={workspace === 'publisher' ? 'selected' : ''} aria-pressed={workspace === 'publisher'} onClick={() => setWorkspace('publisher')}><strong>Package Publisher</strong><span>Validate, preview, open draft PR</span></button>
    </nav>
    {workspace === 'studio' ? <StudioWorkspace accessKey={key} /> : <PublisherWorkspace accessKey={key} />}
  </main>;
}
