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

async function subscribeContact(email, name, apiKey, segmentId) {
  const createResponse = await resendRequest('/contacts', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      email,
      first_name: name,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    }),
  });

  if (createResponse.ok) return;

  if (createResponse.status !== 409 && createResponse.status !== 422) {
    throw new Error(`Resend contact creation failed (${createResponse.status}).`);
  }

  const encodedEmail = encodeURIComponent(email);
  const updateResponse = await resendRequest(`/contacts/${encodedEmail}`, apiKey, {
    method: 'PATCH',
    body: JSON.stringify({ first_name: name, unsubscribed: false }),
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

  const name = getString(body, 'name');
  const email = getString(body, 'email').toLowerCase();
  const subject = getString(body, 'subject') || 'New contact message';
  const message = getString(body, 'message');
  const wantsSubscription = getString(body, 'subscribe') === 'yes';

  if (!name || !email || !message) {
    return json(response, 400, { ok: false, error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(response, 400, { ok: false, error: 'Use a valid email address.' });
  }

  if (message.length > 4000) {
    return json(response, 400, { ok: false, error: 'Message is too long.' });
  }

  const {
    CONTACT_FROM_EMAIL,
    CONTACT_SUBJECT_PREFIX = 'Our Old Dad',
    CONTACT_TO_EMAIL,
    RESEND_API_KEY,
    RESEND_OOD_SEGMENT_ID,
  } = process.env;

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error('Missing contact form environment variables.');
    return json(response, 500, { ok: false, error: 'Contact form is not configured yet.' });
  }

  const safeSubject = `${CONTACT_SUBJECT_PREFIX}: ${subject}`.slice(0, 160);
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Requested subscription: ${wantsSubscription ? 'Yes' : 'No'}`,
    '',
    message,
  ].join('\n');

  const resendResponse = await resendRequest('/emails', RESEND_API_KEY, {
    method: 'POST',
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: safeSubject,
      text,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error('Resend contact email failed:', errorText);
    return json(response, 502, { ok: false, error: 'Message could not be sent.' });
  }

  if (wantsSubscription) {
    if (!RESEND_OOD_SEGMENT_ID) {
      console.error('Missing RESEND_OOD_SEGMENT_ID for contact subscription.');
      return json(response, 200, {
        ok: true,
        subscribed: false,
        warning: 'Message sent, but the email subscription could not be completed.',
      });
    }

    try {
      await subscribeContact(email, name, RESEND_API_KEY, RESEND_OOD_SEGMENT_ID);
    } catch (error) {
      console.error('Contact message sent, but subscription failed:', error);
      return json(response, 200, {
        ok: true,
        subscribed: false,
        warning: 'Message sent, but the email subscription could not be completed.',
      });
    }
  }

  return json(response, 200, { ok: true, subscribed: wantsSubscription });
}
