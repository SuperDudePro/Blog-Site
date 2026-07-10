import { createHmac, timingSafeEqual } from 'node:crypto';

export const config = { api: { bodyParser: false } };

function json(response, status, body) {
  return response.status(status).json(body);
}

function getHeader(request, name) {
  const value = request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function webhookKey(secret) {
  return secret.startsWith('whsec_')
    ? Buffer.from(secret.slice('whsec_'.length), 'base64')
    : Buffer.from(secret, 'utf8');
}

function verifyWebhook(payload, request, secret) {
  const id = getHeader(request, 'svix-id');
  const timestamp = getHeader(request, 'svix-timestamp');
  const signatureHeader = getHeader(request, 'svix-signature');

  if (!id || !timestamp || !signatureHeader) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) {
    return false;
  }

  const expected = createHmac('sha256', webhookKey(secret))
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');
  const expectedBuffer = Buffer.from(expected);

  return signatureHeader.split(' ').some((entry) => {
    const [version, signature] = entry.split(',', 2);
    if (version !== 'v1' || !signature) return false;
    const signatureBuffer = Buffer.from(signature);
    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function addressOnly(value) {
  const match = String(value || '').match(/<([^>]+)>/);
  return (match?.[1] || value || '').trim();
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

async function getRawAttachment(email) {
  if (!email.raw?.download_url) return undefined;

  const rawResponse = await fetch(email.raw.download_url);
  if (!rawResponse.ok) return undefined;

  const content = Buffer.from(await rawResponse.arrayBuffer());
  if (content.length > 15 * 1024 * 1024) return undefined;

  return {
    filename: 'original-message.eml',
    content: content.toString('base64'),
    content_type: 'message/rfc822',
  };
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { ok: false, error: 'Method not allowed.' });
  }

  const {
    INBOUND_ALLOWED_RECIPIENT = 'wilbert@mail.ourolddad.com',
    INBOUND_FORWARD_FROM = 'Our Old Dad Replies <wilbert@mail.ourolddad.com>',
    INBOUND_FORWARD_TO,
    RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET,
  } = process.env;

  const missingVariables = [
    !RESEND_API_KEY && 'RESEND_API_KEY',
    !RESEND_WEBHOOK_SECRET && 'RESEND_WEBHOOK_SECRET',
    !INBOUND_FORWARD_TO && 'INBOUND_FORWARD_TO',
  ].filter(Boolean);

  if (missingVariables.length) {
    console.error(`Missing inbound email environment variables: ${missingVariables.join(', ')}`);
    return json(response, 500, {
      ok: false,
      error: 'Inbound email is not configured.',
      missing: missingVariables,
    });
  }

  const rawBody = await readRawBody(request);
  if (!verifyWebhook(rawBody, request, RESEND_WEBHOOK_SECRET)) {
    return json(response, 400, { ok: false, error: 'Invalid webhook signature.' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(response, 400, { ok: false, error: 'Invalid JSON.' });
  }

  if (event.type !== 'email.received' || !event.data?.email_id) {
    return json(response, 200, { ok: true });
  }

  const recipients = [
    ...(Array.isArray(event.data.received_for) ? event.data.received_for : []),
    ...(Array.isArray(event.data.to) ? event.data.to : []),
  ].map((value) => String(value).toLowerCase());

  if (!recipients.includes(INBOUND_ALLOWED_RECIPIENT.toLowerCase())) {
    return json(response, 200, { ok: true, ignored: true });
  }

  try {
    const emailResponse = await resendRequest(`/emails/receiving/${encodeURIComponent(event.data.email_id)}`, RESEND_API_KEY);
    if (!emailResponse.ok) throw new Error(`Could not retrieve inbound email (${emailResponse.status}).`);

    const email = await emailResponse.json();
    const replyTo = addressOnly(email.reply_to?.[0] || email.from);
    const subject = email.subject || '(no subject)';
    const text = `From: ${email.from || 'Unknown sender'}\nTo: ${(email.to || []).join(', ') || INBOUND_ALLOWED_RECIPIENT}\nSubject: ${subject}\n\n--- Original message ---\n\n${email.text || 'This message contained HTML only.'}`;
    const htmlHeader = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;margin-bottom:20px;padding:12px;border:1px solid #ccc;border-radius:8px"><strong>From:</strong> ${escapeHtml(email.from || 'Unknown sender')}<br><strong>To:</strong> ${escapeHtml((email.to || []).join(', ') || INBOUND_ALLOWED_RECIPIENT)}<br><strong>Subject:</strong> ${escapeHtml(subject)}</div>`;
    const html = `${htmlHeader}${email.html || `<pre style="white-space:pre-wrap">${escapeHtml(email.text || '')}</pre>`}`;
    const rawAttachment = await getRawAttachment(email);

    const forwardResponse = await resendRequest('/emails', RESEND_API_KEY, {
      method: 'POST',
      headers: { 'Idempotency-Key': `ood-inbound-${event.data.email_id}` },
      body: JSON.stringify({
        from: INBOUND_FORWARD_FROM,
        to: [INBOUND_FORWARD_TO],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: `[Our Old Dad reply] ${subject}`,
        text,
        html,
        ...(rawAttachment ? { attachments: [rawAttachment] } : {}),
      }),
    });

    if (!forwardResponse.ok) {
      throw new Error(`Could not forward inbound email (${forwardResponse.status}): ${await forwardResponse.text()}`);
    }

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error('Inbound Our Old Dad email forwarding failed:', error);
    return json(response, 500, { ok: false, error: 'Inbound email could not be forwarded.' });
  }
}
