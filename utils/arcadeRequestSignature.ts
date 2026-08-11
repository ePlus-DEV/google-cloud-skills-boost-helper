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

type ManifestRuntime = {
  runtime?: {
    getManifest?: () => { version?: string };
  };
};

/** Read the version from the installed extension manifest in Chrome/Firefox. */
function getExtensionVersion(): string {
  try {
    const root = globalThis as typeof globalThis & {
      browser?: ManifestRuntime;
      chrome?: ManifestRuntime;
    };
    const version =
      root.browser?.runtime?.getManifest?.()?.version ||
      root.chrome?.runtime?.getManifest?.()?.version ||
      browser.runtime.getManifest()?.version ||
      "unknown";

    return String(version).trim() || "unknown";
  } catch (_) {
    return "unknown";
  }
}

/** Return true when the endpoint is the signed Arcade v3 contract. */
function isArcadeV3Endpoint(endpoint: string): boolean {
  try {
    return /\/api\/v3\/arcade\/?$/i.test(new URL(endpoint).pathname);
  } catch (_) {
    return false;
  }
}

/**
 * Build short-lived HMAC headers for Arcade requests.
 *
 * V3 always requires the release-injected client key and secret. The extension
 * version is written into the JSON body before hashing so it is authenticated by
 * the same HMAC, and is also sent as a header for backend access logs/telemetry.
 * V2 keeps the previous optional-signing behavior during the migration window.
 */
export async function buildArcadeSignatureHeaders(
  endpoint: string,
  body: unknown,
): Promise<Record<string, string> | null> {
  const clientKey = String(import.meta.env.WXT_ARCADE_CLIENT_KEY || "").trim();
  const clientSecret = String(
    import.meta.env.WXT_ARCADE_CLIENT_SECRET || "",
  ).trim();
  const requiresSignature = isArcadeV3Endpoint(endpoint);

  if (!clientKey || !clientSecret) {
    if (requiresSignature) {
      throw new Error(
        "Arcade v3 requires WXT_ARCADE_CLIENT_KEY and WXT_ARCADE_CLIENT_SECRET.",
      );
    }
    return null;
  }

  const extensionVersion = getExtensionVersion();
  if (body && typeof body === "object" && !Array.isArray(body)) {
    (body as Record<string, unknown>).extensionVersion = extensionVersion;
  }

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
    "X-Arcade-Extension-Version": extensionVersion,
  };
}
