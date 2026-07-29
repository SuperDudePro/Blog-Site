export const PUBLISHER_JOB_KEY = 'wilbert-publisher-active-job-v1';

export function savePublisherJob(storage, handoff, inspection) {
  const safeInspection = {
    ...inspection,
    images: (inspection.images || []).map((image) => ({ ...image, url: '' })),
  };
  storage.setItem(PUBLISHER_JOB_KEY, JSON.stringify({ handoff, inspection: safeInspection }));
}

export function loadPublisherJob(storage) {
  try {
    const value = JSON.parse(storage.getItem(PUBLISHER_JOB_KEY) || 'null');
    if (!value?.handoff?.repository || !value?.handoff?.prNumber || !value?.inspection?.manifest?.canonicalUrl) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearPublisherJob(storage) {
  storage.removeItem(PUBLISHER_JOB_KEY);
}
