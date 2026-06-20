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
  const email = getString(body, 'email');
  const subject = getString(body, 'subject') || 'New contact message';
  const message = getString(body, 'message');

  if (!name || !email || !message) {
    return json(response, 400, { ok: false, error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(response, 400, { ok: false, error: 'Use a valid email address.' });
  }

  if (message.length > 4000) {
    return json(response, 400, { ok: false, error: 'Message is too long.' });
  }

  const { CONTACT_FROM_EMAIL, CONTACT_SUBJECT_PREFIX = 'Our Old Dad', CONTACT_TO_EMAIL, RESEND_API_KEY } = process.env;

  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error('Missing contact form environment variables.');
    return json(response, 500, { ok: false, error: 'Contact form is not configured yet.' });
  }

  const safeSubject = `${CONTACT_SUBJECT_PREFIX}: ${subject}`.slice(0, 160);
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
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

  return json(response, 200, { ok: true });
}
