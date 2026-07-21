import { useState } from 'react';
import './SharePost.css';

type Props = {
  title: string;
  excerpt: string;
  url: string;
};

type ShareStatus = 'idle' | 'copied' | 'error';
type ShareMethod = 'facebook' | 'x' | 'email' | 'native' | 'copy';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

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

function openShareWindow(destination: string): void {
  window.open(destination, '_blank', 'noopener,noreferrer,width=720,height=720');
}

function trackShare(method: ShareMethod, url: string): void {
  window.gtag?.('event', 'share', {
    method,
    content_type: 'article',
    item_id: url,
  });
}

function BrandIcon({ children }: { children: React.ReactNode }) {
  return <span className="post-share__brand-icon" aria-hidden="true">{children}</span>;
}

export function SharePost({ title, excerpt, url }: Props) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    setStatus('idle');

    try {
      const copied = await copyToClipboard(url);
      setStatus(copied ? 'copied' : 'error');
      if (copied) trackShare('copy', url);
    } catch {
      setStatus('error');
    }
  };

  const sharePost = async () => {
    setStatus('idle');

    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt, url });
        trackShare('native', url);
        return;
      } catch (error) {
        if (isAbortError(error)) return;
      }
    }

    await copyLink();
  };

  const shareOnFacebook = () => {
    trackShare('facebook', url);
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  };

  const shareOnX = () => {
    trackShare('x', url);
    openShareWindow(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`);
  };

  const shareByEmail = () => {
    trackShare('email', url);
    const body = encodeURIComponent(`${excerpt}\n\n${url}`);
    window.location.href = `mailto:?subject=${encodedTitle}&body=${body}`;
  };

  return (
    <section className="post-share" aria-labelledby="post-share-title">
      <div className="post-share__copy">
        <span className="eyebrow">Pass it along</span>
        <h2 id="post-share-title">Share this post</h2>
        <p>Send it somewhere useful, or fling it into the internet and hope for the best.</p>
      </div>

      <div className="post-share__actions" aria-label="Share this post">
        <button className="post-share__button" type="button" onClick={shareOnFacebook}>
          <BrandIcon>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M13.7 22v-8.5h2.85l.43-3.32H13.7V8.06c0-.96.27-1.62 1.65-1.62h1.76V3.47a23.7 23.7 0 0 0-2.57-.13c-2.54 0-4.28 1.55-4.28 4.4v2.44H7.4v3.32h2.86V22h3.44Z" />
            </svg>
          </BrandIcon>
          Facebook
        </button>

        <button className="post-share__button" type="button" onClick={shareOnX}>
          <BrandIcon>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
            </svg>
          </BrandIcon>
          X
        </button>

        <button className="post-share__button" type="button" onClick={shareByEmail}>
          <BrandIcon>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm9 7.4L20.2 7H3.8L12 12.4Zm-9 4.5 5.6-4.6L3 8.6v8.3Zm18 0V8.6l-5.6 3.7 5.6 4.6Zm-1.4.1L14.2 13.5 12 14.95 9.8 13.5 4.4 17h15.2Z" />
            </svg>
          </BrandIcon>
          Email
        </button>

        <button className="post-share__button post-share__button--more" type="button" onClick={() => void sharePost()}>
          <BrandIcon>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .2.02.39.06.58L8.91 9.16A3 3 0 0 0 7 8.5a3 3 0 1 0 1.91 5.34l6.15 3.58A3 3 0 0 0 15 18c0 .35.06.69.17 1A3 3 0 1 0 17 15.17a3 3 0 0 0-1.91.66l-6.15-3.58A3.1 3.1 0 0 0 9 11.75c0-.17-.01-.34-.04-.5l6.15-3.58A3 3 0 0 0 18 8Z" />
            </svg>
          </BrandIcon>
          More
        </button>

        <button className="post-share__button" type="button" onClick={() => void copyLink()}>
          <BrandIcon>
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M10.6 13.4a1.5 1.5 0 0 0 2.12 0l4.25-4.25a3 3 0 0 0-4.24-4.24l-2.05 2.05-1.42-1.42 2.06-2.05a5 5 0 0 1 7.07 7.07l-4.25 4.25a3.5 3.5 0 0 1-4.95 0l-.35-.35 1.42-1.42.34.36Zm2.8-2.8a1.5 1.5 0 0 0-2.12 0l-4.25 4.25a3 3 0 0 0 4.24 4.24l2.05-2.05 1.42 1.42-2.06 2.05a5 5 0 0 1-7.07-7.07l4.25-4.25a3.5 3.5 0 0 1 4.95 0l.35.35-1.42 1.42-.34-.36Z" />
            </svg>
          </BrandIcon>
          Copy link
        </button>
      </div>

      <p className="post-share__status" role="status" aria-live="polite">
        {status === 'copied' ? 'Link copied. Go cause trouble.' : status === 'error' ? 'Could not copy the link.' : ''}
      </p>
    </section>
  );
}
