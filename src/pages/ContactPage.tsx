import { type CSSProperties, type FormEvent, useState } from 'react';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1.35rem',
};

const hiddenFieldStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const labelStyle: CSSProperties = {
  color: 'var(--text)',
  fontWeight: 800,
};

const controlStyle: CSSProperties = {
  width: '100%',
  border: '2px solid var(--border)',
  borderRadius: '14px',
  color: 'var(--text)',
  font: 'inherit',
  padding: '0.78rem 0.85rem',
};

const textareaStyle: CSSProperties = {
  ...controlStyle,
  minHeight: '190px',
  resize: 'vertical',
};

const statusStyle: CSSProperties = {
  color: 'var(--text)',
  fontWeight: 800,
  marginBottom: 0,
};

const errorStatusStyle: CSSProperties = {
  ...statusStyle,
  color: '#8b1a1a',
};

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('sending');
    setErrorMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? 'The message did not send.');
      }

      form.reset();
      setFormState('sent');
    } catch (error) {
      setFormState('error');
      setErrorMessage(error instanceof Error ? error.message : 'The message did not send.');
    }
  }

  const isSending = formState === 'sending';

  return (
    <div className="page-wrap about-page">
      <section className="page-hero page-hero--no-image">
        <div>
          <span className="eyebrow">contact</span>
          <h1>Send a Note</h1>
          <p className="lead">
            Questions, corrections, useful warnings, and slow-travel reality checks can go here.
          </p>

          <form style={formStyle} onSubmit={handleSubmit}>
            <div style={hiddenFieldStyle} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="name">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" required maxLength={120} style={controlStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={180} style={controlStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" maxLength={160} style={controlStyle} />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="message">Message</label>
              <textarea id="message" name="message" required maxLength={4000} rows={8} style={textareaStyle} />
            </div>

            <button className="button button--primary" type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send note'}
            </button>

            {formState === 'sent' && <p style={statusStyle}>Message sent.</p>}
            {formState === 'error' && <p style={errorStatusStyle}>{errorMessage}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
