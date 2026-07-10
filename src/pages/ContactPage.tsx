import { type CSSProperties, type FormEvent, useState } from 'react';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

type ContactResult = {
  error?: string;
  warning?: string;
  subscribed?: boolean;
};

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

const checkboxRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.7rem',
  padding: '0.9rem 1rem',
  border: '2px solid var(--border)',
  borderRadius: '14px',
  background: 'var(--surface-muted)',
};

const checkboxStyle: CSSProperties = {
  width: '1.15rem',
  height: '1.15rem',
  marginTop: '0.15rem',
  flex: '0 0 auto',
};

const checkboxCopyStyle: CSSProperties = {
  margin: 0,
  color: 'var(--text)',
  fontWeight: 700,
};

const statusStyle: CSSProperties = {
  color: 'var(--text)',
  fontWeight: 800,
  marginBottom: 0,
};

const warningStatusStyle: CSSProperties = {
  ...statusStyle,
  color: '#7a4b00',
};

const errorStatusStyle: CSSProperties = {
  ...statusStyle,
  color: '#8b1a1a',
};

const introStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  margin: '0 0 1rem',
  color: 'var(--text-soft)',
  fontSize: '1rem',
  lineHeight: 1.55,
};

export function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState('sending');
    setStatusMessage('');

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

      const result = (await response.json().catch(() => null)) as ContactResult | null;

      if (!response.ok) {
        throw new Error(result?.error ?? 'The message did not send.');
      }

      form.reset();
      setFormState('sent');
      setStatusMessage(
        result?.warning ??
          (result?.subscribed ? 'Message sent, and you are subscribed.' : 'Message sent.'),
      );
    } catch (error) {
      setFormState('error');
      setStatusMessage(error instanceof Error ? error.message : 'The message did not send.');
    }
  }

  const isSending = formState === 'sending';
  const hasWarning = formState === 'sent' && statusMessage.includes('could not be completed');

  return (
    <div className="page-wrap about-page">
      <section className="page-hero page-hero--no-image">
        <div>
          <span className="eyebrow">contact</span>
          <h1>Send a Note</h1>
          <p style={introStyle}>
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

            <label style={checkboxRowStyle} htmlFor="subscribe">
              <input id="subscribe" name="subscribe" type="checkbox" value="yes" style={checkboxStyle} />
              <span style={checkboxCopyStyle}>Also send me new Our Old Dad posts by email.</span>
            </label>

            <button className="button button--primary" type="submit" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send note'}
            </button>

            {formState === 'sent' && (
              <p style={hasWarning ? warningStatusStyle : statusStyle}>{statusMessage}</p>
            )}
            {formState === 'error' && <p style={errorStatusStyle}>{statusMessage}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
