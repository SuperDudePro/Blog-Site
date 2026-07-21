import { useState } from 'react';
import './SharePost.css';

type Props = {
  title: string;
  excerpt: string;
  url: string;
};

type ShareStatus = 'idle' | 'copied' | 'error';

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function copyToClipboard(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  textArea.remove();
  return copied;
}

export function SharePost({ title, excerpt, url }: Props) {
  const [status, setStatus] = useState<ShareStatus>('idle');

  const copyLink = async () => {
    setStatus('idle');

    try {
      const copied = await copyToClipboard(url);
      setStatus(copied ? 'copied' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const sharePost = async () => {
    setStatus('idle');

    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url });
        return;
      } catch (error) {
        if (isAbortError(error)) return;
      }
    }

    await copyLink();
  };

  return (
    <section className="post-share" aria-labelledby="post-share-title">
      <div className="post-share__copy">
        <span className="eyebrow">Pass it along</span>
        <h2 id="post-share-title">Share this post</h2>
        <p>Open your device&apos;s share menu or copy the link.</p>
      </div>

      <div className="post-share__actions">
        <button className="button button--primary" type="button" onClick={() => void sharePost()}>
          <svg className="post-share__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.39.06.58L8.91 9.16A3 3 0 0 0 7 8.5a3 3 0 1 0 1.91 5.34l6.15 3.58A3 3 0 0 0 15 18c0 .35.06.69.17 1A3 3 0 1 0 17 15.17a3 3 0 0 0-1.91.66l-6.15-3.58A3.1 3.1 0 0 0 9 11.75c0-.17-.01-.34-.04-.5l6.15-3.58A3 3 0 0 0 18 8Z" />
          </svg>
          Share
        </button>
        <button className="button button--ghost" type="button" onClick={() => void copyLink()}>
          Copy link
        </button>
      </div>

      <p className="post-share__status" role="status" aria-live="polite">
        {status === 'copied' ? 'Link copied.' : status === 'error' ? 'Could not copy the link.' : ''}
      </p>
    </section>
  );
}
