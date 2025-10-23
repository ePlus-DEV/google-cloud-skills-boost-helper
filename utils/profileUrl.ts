import profileConfigService from "../services/profileConfigService";

export function canonicalizeProfileUrl(url: string): string | null {
  // delegate to runtime service which holds accepted hosts and canonical host
  return profileConfigService.canonicalizeProfileUrl(url);
}

export function isProfileUrl(url: string): boolean {
  const c = canonicalizeProfileUrl(url);
  if (!c) return false;
  try {
    const u = new URL(c);
    return /\/public_profiles\//.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Extract the profile identifier from a public_profiles URL. Returns the id
 * string (the path segment after /public_profiles/) or null if not found.
 */
export function extractProfileId(url: string): string | null {
  const c = canonicalizeProfileUrl(url);
  if (!c) return null;
  try {
    const u = new URL(c);
    const re = /\/public_profiles\/(.+)/;
    const m = re.exec(u.pathname);
    if (!m) return null;
    // strip trailing slash if any
    return m[1].replace(/\/+$/, "");
  } catch {
    return null;
  }
}
