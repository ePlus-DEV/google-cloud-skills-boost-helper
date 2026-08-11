const encoder = new TextEncoder();

/** Convert an ArrayBuffer into a lowercase hexadecimal string. */
function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a cryptographically random nonce for replay protection. */
function createNonce(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Return the SHA-256 digest of a string as lowercase hexadecimal. */
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
}

/** Sign a string with HMAC-SHA256 and return lowercase hexadecimal. */
async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  return toHex(signature);
}

/**
 * Build short-lived HMAC headers for the Arcade v2 request.
 *
 * The secret is injected only at release-build time. It is not committed to
 * source control. A timestamp and nonce make copied requests short-lived and
 * allow the backend to reject replay attempts.
 */
export async function buildArcadeSignatureHeaders(
  endpoint: string,
  body: unknown,
): Promise<Record<string, string> | null> {
  const clientKey = String(import.meta.env.WXT_ARCADE_CLIENT_KEY || "").trim();
  const clientSecret = String(
    import.meta.env.WXT_ARCADE_CLIENT_SECRET || "",
  ).trim();

  if (!clientKey || !clientSecret) return null;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = createNonce();
  const rawBody = JSON.stringify(body);
  const pathname = new URL(endpoint).pathname || "/";
  const bodyHash = await sha256Hex(rawBody);
  const canonical = ["POST", pathname, timestamp, nonce, bodyHash].join("\n");
  const signature = await hmacSha256Hex(clientSecret, canonical);

  return {
    "X-Arcade-Key": clientKey,
    "X-Arcade-Timestamp": timestamp,
    "X-Arcade-Nonce": nonce,
    "X-Arcade-Signature": signature,
  };
}
