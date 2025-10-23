import { PROFILE_CONFIG } from "../utils/config";

/**
 * Simplified profile configuration service.
 *
 * It accepts URLs whose host is in PROFILE_CONFIG.ACCEPTED_HOSTS and returns
 * the original URL unchanged. This keeps behavior simple: both
 * cloudskillsboost.google and skills.google are accepted and sent as-is.
 */
class ProfileConfigService {
  private readonly acceptedHosts: string[] =
    PROFILE_CONFIG.ACCEPTED_HOSTS.slice();

  getAcceptedHosts(): string[] {
    return this.acceptedHosts.slice();
  }

  isAcceptedHost(host: string): boolean {
    return this.acceptedHosts.includes(host);
  }

  // If URL host is accepted, return original URL; otherwise return null
  canonicalizeProfileUrl(url: string): string | null {
    try {
      const u = new URL(url);
      if (!this.acceptedHosts.includes(u.hostname)) return null;

      // If already canonical, return as-is
      if (u.hostname === PROFILE_CONFIG.CANONICAL_HOST) return u.toString();

      // Otherwise, replace hostname with canonical host and return
      u.hostname = PROFILE_CONFIG.CANONICAL_HOST;
      return u.toString();
    } catch {
      return null;
    }
  }
}

const profileConfigService = new ProfileConfigService();
export default profileConfigService;
