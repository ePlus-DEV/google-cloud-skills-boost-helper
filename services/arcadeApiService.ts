import axios from "axios";
import type { ArcadeData } from "../types";
import {
  resetFacilitatorRulesToFallback,
  syncFacilitatorRulesFromApi,
} from "./facilitatorService";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";

/**
 * Resolve the stable Arcade API v2 endpoint.
 *
 * WXT_ARCADE_POINT_V2_URL is preferred when configured. For existing release
 * environments we can derive `/api/v2/arcade` from the legacy `/api/arcade`
 * URL so a new secret is not required immediately. We never send a request to
 * the legacy endpoint from this client.
 */
function getArcadeV2Endpoint(): string {
  const explicit = String(import.meta.env.WXT_ARCADE_POINT_V2_URL || "").trim();
  if (explicit) return explicit;

  const legacy = String(import.meta.env.WXT_ARCADE_POINT_URL || "").trim();
  if (!legacy) return "";

  const derived = legacy.replace(/\/arcade(?:-public)?\/?$/i, "/v2/arcade");
  return derived !== legacy ? derived : "";
}

/**
 * Service to handle Arcade API operations.
 */
const ArcadeApiService = {
  /**
   * Fetch Arcade data from the stable API v2 endpoint.
   */
  async fetchArcadeData(url: string): Promise<ArcadeData | null> {
    try {
      const endpoint = getArcadeV2Endpoint();
      if (!endpoint) return null;

      // Ensure we send the canonical host to the backend. If canonicalization
      // fails, still send the original URL (backend may handle it), but we
      // prefer canonical.
      const canonical = canonicalizeProfileUrl(url) || url;
      const profileId = extractProfileId(url);
      const response = await axios.post(endpoint, {
        url: canonical,
        profileId,
      });

      if (response.status === 200) {
        const data = response.data as ArcadeData;

        // API v2 exposes Facilitator metadata only at the top level. The API is
        // the source of truth; if metadata is absent or invalid, reset to the
        // local compatibility fallback instead of keeping stale prior rules.
        if (!syncFacilitatorRulesFromApi(data.facilitator)) {
          resetFacilitatorRulesToFallback();
        }

        data.lastUpdated = new Date().toISOString();
        return data;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Validate profile URL format.
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
