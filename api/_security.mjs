const DEFAULT_TIMEOUT_MS = 8_000;

function firstHeader(request, name) {
  const value = request.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

export function clientIp(request) {
  return String(firstHeader(request, "x-forwarded-for") || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

export function validSameSiteOrigin(request) {
  const origin = firstHeader(request, "origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const host = String(firstHeader(request, "x-forwarded-host") || firstHeader(request, "host") || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const local = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
    return (originUrl.protocol === "https:" || (local && originUrl.protocol === "http:"))
      && originUrl.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function requestTooLarge(request, maxBytes) {
  const rawLength = firstHeader(request, "content-length");
  if (rawLength) {
    const length = Number(rawLength);
    if (Number.isFinite(length) && length > maxBytes) return true;
  }
  if (typeof request.body === "string") return Buffer.byteLength(request.body, "utf8") > maxBytes;
  if (request.body && typeof request.body === "object") {
    return Buffer.byteLength(JSON.stringify(request.body), "utf8") > maxBytes;
  }
  return false;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const RATE_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then redis.call("PEXPIRE", KEYS[1], ARGV[1]) end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`;

export async function durableRateLimit(key, { limit, windowMs }) {
  if (process.env.NODE_ENV === "test") {
    return { allowed: true, resetAt: Date.now() + windowMs };
  }
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error("Durable rate limiting is not configured.");
    return { allowed: false, resetAt: Date.now() + 60_000, unavailable: true };
  }

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["EVAL", RATE_SCRIPT, "1", `rate:${key}`, String(windowMs)]),
      },
      3_000,
    );
    if (!response.ok) throw new Error(`Redis returned ${response.status}.`);
    const payload = await response.json();
    const [count, ttl] = Array.isArray(payload.result) ? payload.result : [];
    if (!Number.isFinite(Number(count))) throw new Error("Redis returned an invalid count.");
    return {
      allowed: Number(count) <= limit,
      resetAt: Date.now() + Math.max(1_000, Number(ttl) || windowMs),
    };
  } catch (error) {
    console.error("Durable rate limit check failed:", error);
    return { allowed: false, resetAt: Date.now() + 60_000, unavailable: true };
  }
}

export function rejectUnsafeRequest(request, response, { maxBytes = 16_384 } = {}) {
  if (!validSameSiteOrigin(request)) {
    response.status(403).json({ ok: false, error: "Request origin was not accepted." });
    return true;
  }
  if (requestTooLarge(request, maxBytes)) {
    response.status(413).json({ ok: false, error: "Request is too large." });
    return true;
  }
  return false;
}
