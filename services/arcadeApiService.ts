import axios from "axios";
import type { ArcadeData } from "../types";

/**
 * Service to handle Arcade API operations
 */
class ArcadeApiService {
  /**
   * Fetch arcade data from the API
   */
  static async fetchArcadeData(url: string): Promise<ArcadeData | null> {
    try {
      const response = await axios.post(import.meta.env.WXT_ARCADE_POINT_URL, {
        url,
      });
      return response.status === 200 ? response.data : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate profile URL format
   */
  static isValidProfileUrl(url: string): boolean {
    return url.startsWith(
      "https://www.cloudskillsboost.google/public_profiles/",
    );
  }
}

export default ArcadeApiService;
