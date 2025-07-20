import type { ArcadeData } from "../types";

/**
 * Service to handle storage operations
 */
class StorageService {
  private static readonly STORAGE_KEYS = {
    arcadeData: "local:arcadeData" as const,
    urlProfile: "local:urlProfile" as const,
    enableSearchFeature: "local:enableSearchFeature" as const,
  };

  /**
   * Get arcade data from storage
   */
  static async getArcadeData(): Promise<ArcadeData | null> {
    return await storage.getItem<ArcadeData>(this.STORAGE_KEYS.arcadeData);
  }

  /**
   * Save arcade data to storage
   */
  static async saveArcadeData(data: ArcadeData): Promise<void> {
    const updatedData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await storage.setItem(this.STORAGE_KEYS.arcadeData, updatedData);
  }

  /**
   * Get profile URL from storage
   */
  static async getProfileUrl(): Promise<string> {
    return (await storage.getItem<string>(this.STORAGE_KEYS.urlProfile)) || "";
  }

  /**
   * Save profile URL to storage
   */
  static async saveProfileUrl(url: string): Promise<void> {
    await storage.setItem(this.STORAGE_KEYS.urlProfile, url);
  }

  /**
   * Initialize profile URL from storage or input
   */
  static async initializeProfileUrl(
    inputElement?: HTMLInputElement,
  ): Promise<string> {
    const storedUrl = await this.getProfileUrl();
    return storedUrl || inputElement?.value || "";
  }

  /**
   * Get search feature enabled setting
   */
  static async isSearchFeatureEnabled(): Promise<boolean> {
    const enabled = await storage.getItem<boolean>(
      this.STORAGE_KEYS.enableSearchFeature,
    );
    return enabled !== null ? enabled : true; // Default to true
  }

  /**
   * Save search feature enabled setting
   */
  static async saveSearchFeatureEnabled(enabled: boolean): Promise<void> {
    await storage.setItem(this.STORAGE_KEYS.enableSearchFeature, enabled);
  }
}

export default StorageService;
