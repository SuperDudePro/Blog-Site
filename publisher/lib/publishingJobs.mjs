const text = (value) => String(value ?? '').trim();

function bodyField(body, label) {
  const pattern = new RegExp(`^- ${label}:\\s*(?:\\*\\*)?([^\\n*]+?)(?:\\*\\*)?\\s*$`, 'mi');
  return text(body).match(pattern)?.[1]?.trim() || '';
}

function codeField(body, label) {
  const pattern = new RegExp(`^- ${label}:\\s*\`([^\`]+)\`\\s*$`, 'mi');
  return text(body).match(pattern)?.[1]?.trim() || '';
}

export function jobFromPullRequest(repository, pullRequest) {
  const branch = text(pullRequest?.head?.ref);
  const commit = text(pullRequest?.head?.sha);
  const prNumber = Number(pullRequest?.number);
  const prUrl = text(pullRequest?.html_url);
  const canonicalUrl = bodyField(pullRequest?.body, 'Canonical URL');
  const destinationPath = codeField(pullRequest?.body, 'Destination');
  const slug = codeField(pullRequest?.body, 'Slug');
  const targetSite = bodyField(pullRequest?.body, 'Site profile');
  const title = text(pullRequest?.title).replace(/^(?:Publish|Update)\s+/i, '');

  if (!branch.startsWith('publisher/') || !commit || !prNumber || !prUrl || !canonicalUrl || !title) return null;
  return {
    handoff: {
      repository,
      branch,
      commit,
      prNumber,
      prUrl,
      baseBranch: text(pullRequest?.base?.ref) || 'main',
      canonicalUrl,
      title,
    },
    manifest: {
      repository,
      targetSite,
      title,
      slug,
      destinationPath,
      canonicalUrl,
    },
    state: pullRequest?.merged_at ? 'merged' : text(pullRequest?.state) || 'open',
    updatedAt: text(pullRequest?.updated_at),
  };
}

export function newestPublishingJob(jobs) {
  return jobs
    .filter(Boolean)
    .sort((a, b) => {
      const active = Number(b.state === 'open') - Number(a.state === 'open');
      return active || Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0);
    })[0] || null;
}

export function publishingJobKey(job) {
  return job ? `${job.handoff.repository}#${job.handoff.prNumber}` : '';
}

export function selectPublishingJob(jobs, key) {
  const requested = text(key);
  if (requested) {
    const exact = jobs.find((job) => publishingJobKey(job) === requested);
    if (exact) return exact;
  }
  return newestPublishingJob(jobs);
}

export function selectRecoverableJob(jobs, key) {
  const requested = text(key);
  if (requested) return jobs.find((job) => publishingJobKey(job) === requested) || null;
  const active = jobs.filter((job) => job?.state === 'open');
  return active.length === 1 ? active[0] : null;
}

export function findPublishingPullRequest(pullRequests, { slug, branch } = {}) {
  const expectedSlug = text(slug);
  const expectedBranch = text(branch);
  return (Array.isArray(pullRequests) ? pullRequests : []).find((pullRequest) => {
    if (text(pullRequest?.state) !== 'open') return false;
    const currentBranch = text(pullRequest?.head?.ref);
    if (!currentBranch.startsWith('publisher/')) return false;
    if (expectedBranch && currentBranch === expectedBranch) return true;
    return expectedSlug && codeField(pullRequest?.body, 'Slug') === expectedSlug;
  }) || null;
}
