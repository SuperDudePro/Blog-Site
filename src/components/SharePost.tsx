import { useState } from 'react';
import './SharePost.css';

type Props = {
  title: string;
  excerpt: string;
  url: string;
  image?: string;
};

type ShareStatus = 'idle' | 'copied' | 'error';
type ShareMethod =
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'reddit'
  | 'bluesky'
  | 'threads'
  | 'whatsapp'
  | 'telegram'
  | 'pinterest'
  | 'tumblr'
  | 'hacker-news'
  | 'email'
  | 'text'
  | 'native'
  | 'copy';

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

function ShareBadge({ children }: { children: React.ReactNode }) {
  return <span className="post-share__brand-icon" aria-hidden="true">{children}</span>;
}

type DestinationButtonProps = {
  label: string;
  badge: React.ReactNode;
  onClick: () => void;
  emphasized?: boolean;
};

function DestinationButton({ label, badge, onClick, emphasized = false }: DestinationButtonProps) {
  return (
    <button
      className={`post-share__button${emphasized ? ' post-share__button--more' : ''}`}
      type="button"
      onClick={onClick}
    >
      <ShareBadge>{badge}</ShareBadge>
      {label}
    </button>
  );
}

export function SharePost({ title, excerpt, url, image }: Props) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);
  const combinedText = `${title}\n\n${url}`;
  const encodedCombinedText = encodeURIComponent(combinedText);

  const openDestination = (method: ShareMethod, destination: string) => {
    trackShare(method, url);
    openShareWindow(destination);
  };

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

  const shareByEmail = () => {
    trackShare('email', url);
    const body = encodeURIComponent(`${excerpt}\n\n${url}`);
    window.location.href = `mailto:?subject=${encodedTitle}&body=${body}`;
  };

  const shareByText = () => {
    trackShare('text', url);
    window.location.href = `sms:?body=${encodedCombinedText}`;
  };

  return (
    <section className="post-share" aria-labelledby="post-share-title">
      <div className="post-share__copy">
        <span className="eyebrow">Pass it along</span>
        <h2 id="post-share-title">Share this post</h2>
        <p>Send it somewhere useful, or fling it into the internet and hope for the best.</p>
      </div>

      <div className="post-share__actions" aria-label="Popular ways to share this post">
        <DestinationButton
          label="Facebook"
          badge="f"
          onClick={() => openDestination('facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        />
        <DestinationButton
          label="X"
          badge="𝕏"
          onClick={() => openDestination('x', `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)}
        />
        <DestinationButton
          label="LinkedIn"
          badge="in"
          onClick={() => openDestination('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        />
        <DestinationButton
          label="Reddit"
          badge="r/"
          onClick={() => openDestination('reddit', `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`)}
        />
        <DestinationButton
          label="Email"
          badge="@"
          onClick={shareByEmail}
        />
        <DestinationButton
          label="Text"
          badge="…"
          onClick={shareByText}
        />
        <DestinationButton
          label="More"
          badge="+"
          emphasized
          onClick={() => void sharePost()}
        />
        <DestinationButton
          label="Copy link"
          badge="↗"
          onClick={() => void copyLink()}
        />
      </div>

      <details className="post-share__more-destinations">
        <summary>More places to share</summary>
        <p className="post-share__more-note">These services support direct web sharing. The More button above also opens every compatible app installed on the device.</p>
        <div className="post-share__actions post-share__actions--secondary" aria-label="Additional ways to share this post">
          <DestinationButton
            label="Bluesky"
            badge="BS"
            onClick={() => openDestination('bluesky', `https://bsky.app/intent/compose?text=${encodedCombinedText}`)}
          />
          <DestinationButton
            label="Threads"
            badge="@"
            onClick={() => openDestination('threads', `https://www.threads.net/intent/post?text=${encodedCombinedText}`)}
          />
          <DestinationButton
            label="WhatsApp"
            badge="WA"
            onClick={() => openDestination('whatsapp', `https://wa.me/?text=${encodedCombinedText}`)}
          />
          <DestinationButton
            label="Telegram"
            badge="TG"
            onClick={() => openDestination('telegram', `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`)}
          />
          {image ? (
            <DestinationButton
              label="Pinterest"
              badge="P"
              onClick={() => openDestination('pinterest', `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedExcerpt}`)}
            />
          ) : null}
          <DestinationButton
            label="Tumblr"
            badge="t"
            onClick={() => openDestination('tumblr', `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodedUrl}&title=${encodedTitle}&caption=${encodedExcerpt}`)}
          />
          <DestinationButton
            label="Hacker News"
            badge="Y"
            onClick={() => openDestination('hacker-news', `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`)}
          />
        </div>
      </details>

      <p className="post-share__status" role="status" aria-live="polite">
        {status === 'copied' ? 'Link copied. Go cause trouble.' : status === 'error' ? 'Could not copy the link.' : ''}
      </p>
    </section>
  );
}
