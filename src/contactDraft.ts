export type PostResponseDraft = {
  message: string;
  slug: string;
  title: string;
};

export const POST_RESPONSE_DRAFT_KEY = 'our-old-dad:post-response-draft';

function isPostResponseDraft(value: unknown): value is PostResponseDraft {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<PostResponseDraft>;
  return (
    typeof candidate.message === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.title === 'string'
  );
}

export function savePostResponseDraft(draft: PostResponseDraft): void {
  try {
    window.sessionStorage.setItem(POST_RESPONSE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // History state still carries the draft when session storage is unavailable.
  }
}

export function readPostResponseDraft(expectedSlug: string): PostResponseDraft | null {
  const historyDraft = (window.history.state as { postResponseDraft?: unknown } | null)
    ?.postResponseDraft;

  if (isPostResponseDraft(historyDraft) && historyDraft.slug === expectedSlug) {
    return historyDraft;
  }

  try {
    const storedValue = window.sessionStorage.getItem(POST_RESPONSE_DRAFT_KEY);
    if (!storedValue) return null;

    const storedDraft: unknown = JSON.parse(storedValue);
    return isPostResponseDraft(storedDraft) && storedDraft.slug === expectedSlug
      ? storedDraft
      : null;
  } catch {
    return null;
  }
}

export function clearPostResponseDraft(): void {
  try {
    window.sessionStorage.removeItem(POST_RESPONSE_DRAFT_KEY);
  } catch {
    // Nothing else is needed if session storage is unavailable.
  }
}
