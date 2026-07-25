export function installMergedUi() {
  const originalFetch = window.fetch.bind(window);
  let mergedPostUrl = '';
  let mergedAt = '';

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    if (!url.includes('/api/publish/status')) return response;

    const clone = response.clone();
    try {
      const payload = await clone.json();
      if (payload?.merged) {
        try {
          const requestBody = init?.body ? JSON.parse(String(init.body)) : {};
          mergedPostUrl = requestBody.canonicalUrl || '';
        } catch {
          mergedPostUrl = '';
        }
        mergedAt = payload.mergedAt || '';
        window.dispatchEvent(new CustomEvent('wilbert-publisher-merged'));
      }
    } catch {
      // The normal publisher error handling owns malformed responses.
    }
    return response;
  };

  const applyMergedState = () => {
    const textNodes = document.querySelectorAll('span, strong, h2');
    for (const node of textNodes) {
      const text = node.textContent?.trim();
      if (text === 'Ready to merge') node.textContent = 'Merged';
      if (text === 'Open the PR for final review and manual merge.') node.textContent = mergedAt ? `Publishing complete. Merged ${new Date(mergedAt).toLocaleString()}.` : 'Publishing complete.';
    }

    for (const link of document.querySelectorAll('a')) {
      if (link.textContent?.trim() === 'Open PR to finish') {
        link.textContent = 'Open published post';
        if (mergedPostUrl) link.setAttribute('href', mergedPostUrl);
      }
    }
  };

  window.addEventListener('wilbert-publisher-merged', () => {
    applyMergedState();
    window.setTimeout(applyMergedState, 50);
    window.setTimeout(applyMergedState, 250);
  });
}
