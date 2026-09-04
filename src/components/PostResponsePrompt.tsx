import { type FormEvent, useState } from 'react';
import { savePostResponseDraft, type PostResponseDraft } from '../contactDraft';
import { navigateTo } from './SiteLink';
import './PostResponsePrompt.css';

type Props = {
  slug: string;
  title: string;
};

export function PostResponsePrompt({ slug, title }: Props) {
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    const draft: PostResponseDraft = { message, slug, title };
    savePostResponseDraft(draft);
    window.gtag?.('event', 'post_response_started', { item_id: slug });
    navigateTo(`/contact?replyTo=${encodeURIComponent(slug)}`, false, {
      postResponseDraft: draft,
    });
  }

  return (
    <section className="post-response" aria-labelledby="post-response-title">
      <span className="eyebrow">Your turn</span>
      <h2 id="post-response-title">Got something to say?</h2>
      <p>Tell me what this reminded you of, where I’m wrong, or what happened to you.</p>

      <form className="post-response__form" onSubmit={handleSubmit}>
        <label htmlFor={`post-response-${slug}`}>Your response</label>
        <textarea
          id={`post-response-${slug}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={4000}
          rows={5}
          placeholder="Write it here…"
          required
        />
        <div className="post-response__footer">
          <p>Your words will carry over. You’ll add your name and email before sending.</p>
          <button className="button button--primary" type="submit" disabled={!message.trim()}>
            Continue to send
          </button>
        </div>
      </form>
    </section>
  );
}
