// Verify that a Vercel preview serves the exact PR head. The caller chooses
// `deploymentUrl` from GitHub's deployment records and supplies a `fetchText`
// bound to that origin; nothing here decides whether a host may be trusted.
const fullSha = /^[0-9a-f]{40}$/i;

export async function inspectPreviewCommit({ deploymentUrl, commitSha, fetchText }) {
  if (!deploymentUrl) return { state: 'pending', error: 'Waiting for the selected site preview URL.' };
  if (!fullSha.test(String(commitSha || ''))) return { state: 'failed', error: 'PR head SHA is invalid.' };
  try {
    const markerUrl = new URL('/deployment.json', deploymentUrl);
    if (markerUrl.protocol !== 'https:' || !markerUrl.hostname.endsWith('.vercel.app')) {
      return { state: 'failed', error: 'The preview URL is not a Vercel deployment hostname.' };
    }
    markerUrl.searchParams.set('publisher_verify', commitSha);
    const { result, body } = await fetchText(markerUrl.toString());
    if (!result.ok) return { state: 'failed', status: result.status, error: 'Preview deployment marker returned HTTP ' + result.status + '.' };
    let marker;
    try { marker = JSON.parse(body); } catch {
      return { state: 'failed', error: 'Preview did not return a deployment marker (authentication may be required).' };
    }
    const deployedCommit = String(marker?.commit || '');
    if (!fullSha.test(deployedCommit)) {
      return { state: 'failed', error: 'Preview deployment marker has no valid commit SHA.' };
    }
    if (deployedCommit !== commitSha) {
      return { state: 'failed', deployedCommit, error: 'Preview is for a different GitHub commit; wait for the current PR deployment.' };
    }
    return { state: 'success', deployedCommit };
  } catch (error) {
    return { state: 'failed', error: 'Preview commit verification failed: ' + error.message };
  }
}

// The readiness boolean is technical only. Owner/editorial approval and the
// manual GitHub production merge remain separate, never inferred from a hash.
export function directTechnicalReadiness(isDirect, directVerification, previewCommit) {
  return !isDirect || (
    directVerification?.state === 'success' &&
    previewCommit?.state === 'success'
  );
}
