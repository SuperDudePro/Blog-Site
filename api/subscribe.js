function getString(body, key) {
  const value = body && typeof body === 'object' ? body[key] : undefined;
  return typeof value === 'string' ? value.trim() : '';
}

async function readBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return {};
}

function json(response, status, body) {
  return response.status(status).json(body);
}

async function resendRequest(path, apiKey, options = {}) {
  return fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

async function ensureExistingContact(email, apiKey, segmentId, topicId) {
  const encodedEmail = encodeURIComponent(email);

  const updateResponse = await resendRequest(`/contacts/${encodedEmail}`, apiKey, {
    method: 'PATCH',
    body: JSON.stringify({ unsubscribed: false }),
  });

  if (!updateResponse.ok && updateResponse.status !== 404) {
    throw new Error(`Could not update existing contact (${updateResponse.status}).`);
  }

  const segmentResponse = await resendRequest(
    `/contacts/${encodedEmail}/segments/${encodeURIComponent(segmentId)}`,
    apiKey,
    { method: 'POST' },
  );

  if (!segmentResponse.ok && segmentResponse.status !== 409) {
    throw new Error(`Could not add contact to segment (${segmentResponse.status}).`);
  }

  const topicResponse = await resendRequest(`/contacts/${encodedEmail}/topics`, apiKey, {
    method: 'PATCH',
    body: JSON.stringify([{ id: topicId, subscription: 'opt_in' }]),
  });

  if (!topicResponse.ok) {
    throw new Error(`Could not update contact topic (${topicResponse.status}).`);
  }
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { ok: false, error: 'Method not allowed.' });
  }

  const body = await readBody(request);

  // Honeypot field. Real users should never fill this out.
  if (getString(body, 'website')) {
    return json(response, 200, { ok: true });
  }

  const email = getString(body, 'email').toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) {
    return json(response, 400, { ok: false, error: 'Use a valid email address.' });
  }

  const { RESEND_API_KEY, RESEND_OOD_SEGMENT_ID, RESEND_OOD_TOPIC_ID } = process.env;

  if (!RESEND_API_KEY || !RESEND_OOD_SEGMENT_ID || !RESEND_OOD_TOPIC_ID) {
    console.error('Missing Our Old Dad subscription environment variables.');
    return json(response, 500, { ok: false, error: 'Subscriptions are not configured yet.' });
  }

  try {
    const createResponse = await resendRequest('/contacts', RESEND_API_KEY, {
      method: 'POST',
      body: JSON.stringify({
        email,
        unsubscribed: false,
        segments: [{ id: RESEND_OOD_SEGMENT_ID }],
        topics: [{ id: RESEND_OOD_TOPIC_ID, subscription: 'opt_in' }],
      }),
    });

    if (!createResponse.ok) {
      if (createResponse.status === 409 || createResponse.status === 422) {
        await ensureExistingContact(
          email,
          RESEND_API_KEY,
          RESEND_OOD_SEGMENT_ID,
          RESEND_OOD_TOPIC_ID,
        );
      } else {
        const errorText = await createResponse.text();
        throw new Error(`Resend contact creation failed: ${createResponse.status} ${errorText}`);
      }
    }

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error('Our Old Dad subscription failed:', error);
    return json(response, 502, { ok: false, error: 'Subscription could not be completed.' });
  }
}
