import { type CSSProperties, type FormEvent, useId, useState } from 'react';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

type Props = {
  compact?: boolean;
};

const hiddenFieldStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
};

export function SubscribeForm({ compact = false }: Props) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const headingId = useId();
  const emailId = useId();
  const isSending = formState === 'sending';
  const isFooter = compact;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('sending');
    setErrorMessage('');

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? 'The subscription did not go through.');
      }

      form.reset();
      setFormState('sent');
    } catch (error) {
      setFormState('error');
      setErrorMessage(error instanceof Error ? error.message : 'The subscription did not go through.');
    }
  }

  const sectionStyle: CSSProperties = {
    width: '100%',
    maxWidth: isFooter ? '430px' : '760px',
    margin: isFooter ? 0 : '0 auto 3rem',
    padding: isFooter ? '0.2rem 0' : '1.4rem 1.5rem',
    border: isFooter ? 'none' : '4px solid var(--box-border)',
    borderRadius: isFooter ? 0 : 'var(--radius)',
    background: isFooter ? 'transparent' : 'var(--surface)',
    boxShadow: isFooter ? 'none' : 'var(--shadow)',
  };

  const headingStyle: CSSProperties = {
    color: isFooter ? 'white' : 'var(--text)',
    fontSize: isFooter ? '1.2rem' : undefined,
    marginBottom: '0.45rem',
  };

  const copyStyle: CSSProperties = {
    color: isFooter ? 'rgba(255, 255, 255, 0.82)' : 'var(--text-soft)',
    marginBottom: '0.9rem',
  };

  const formStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.7rem',
    alignItems: 'stretch',
  };

  const inputStyle: CSSProperties = {
    flex: '1 1 230px',
    minHeight: '46px',
    border: '2px solid var(--box-border)',
    borderRadius: '999px',
    padding: '0 1rem',
    font: 'inherit',
  };

  const statusStyle: CSSProperties = {
    margin: '0.75rem 0 0',
    color: isFooter ? 'white' : 'var(--text)',
    fontWeight: 800,
  };

  return (
    <section style={sectionStyle} aria-labelledby={headingId}>
      <span className="eyebrow" style={isFooter ? { color: 'var(--accent-light)' } : undefined}>new posts</span>
      <h2 id={headingId} style={headingStyle}>Get the new ones by email.</h2>
      <p style={copyStyle}>New stories, playlists, travel notes, and old-dad advice when they appear.</p>

      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={hiddenFieldStyle} aria-hidden="true">
          <label htmlFor={`${emailId}-website`}>Website</label>
          <input id={`${emailId}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <label htmlFor={emailId} style={hiddenFieldStyle}>Email address</label>
        <input id={emailId} name="email" type="email" autoComplete="email" required maxLength={180} placeholder="Email address" style={inputStyle} />
        <button className="button button--primary" type="submit" disabled={isSending}>
          {isSending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {formState === 'sent' && <p style={statusStyle}>You are subscribed.</p>}
      {formState === 'error' && <p style={{ ...statusStyle, color: isFooter ? '#ffd0d0' : '#8b1a1a' }}>{errorMessage}</p>}
    </section>
  );
}
