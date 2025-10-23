import axios from "axios";
import type { ArcadeData } from "../types";

/**
 * Service to handle Arcade API operations
 */
const ArcadeApiService = {
  /**
   * Fetch arcade data from the API
   */
  async fetchArcadeData(url: string): Promise<ArcadeData | null> {
    try {
      const response = await axios.post(import.meta.env.WXT_ARCADE_POINT_URL, {
        url,
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
    return url.startsWith("https://www.skills.google/public_profiles/");
  },
};

export default ArcadeApiService;
