import axios from "axios";
import type { ArcadeData } from "../types";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";

/**
 * Service to handle Arcade API operations
 */
const ArcadeApiService = {
  /**
   * Fetch arcade data from the API
   */
  async fetchArcadeData(url: string): Promise<ArcadeData | null> {
    try {
      // Ensure we send the canonical host to the backend. If canonicalization
      // fails, still send the original URL (backend may handle it), but we
      // prefer canonical.
      const canonical = canonicalizeProfileUrl(url) || url;

      const profileId = extractProfileId(url);
      const response = await axios.post(import.meta.env.WXT_ARCADE_POINT_URL, {
        url: canonical,
        profileId,
      });

      if (response.status === 200) {
        const data = response.data;
        // Add current timestamp as lastUpdated
        data.lastUpdated = new Date().toISOString();
        return data;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Validate profile URL format
   */
  isValidProfileUrl(url: string): boolean {
    const canonical = canonicalizeProfileUrl(url);
    if (!canonical) return false;

    try {
      const u = new URL(canonical);
      return /\/public_profiles\//.test(u.pathname);
    } catch {
      return false;
    }
  },
};

export default ArcadeApiService;
