import type { ArcadeData } from "../types";

/**
 * Service to handle storage operations
 */
const STORAGE_KEYS = {
  arcadeData: "local:arcadeData" as const,
  urlProfile: "local:urlProfile" as const,
  enableSearchFeature: "local:enableSearchFeature" as const,
};

/**
 * Retrieves the arcade data from storage.
 * @returns {Promise<ArcadeData | null>} The stored arcade data or null if not found.
 */
async function getArcadeData(): Promise<ArcadeData | null> {
  return await storage.getItem<ArcadeData>(STORAGE_KEYS.arcadeData);
}

/**
 * Saves the arcade data to storage, updating the lastUpdated timestamp.
 * @param {ArcadeData} data - The arcade data to save.
 * @returns {Promise<void>}
 */
async function saveArcadeData(data: ArcadeData): Promise<void> {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  await storage.setItem(STORAGE_KEYS.arcadeData, updatedData);
}

/**
 * Retrieves the profile URL from storage.
 * @returns {Promise<string>} The stored profile URL or an empty string if not found.
 */
async function getProfileUrl(): Promise<string> {
  return (await storage.getItem<string>(STORAGE_KEYS.urlProfile)) || "";
}

/**
 * Saves the profile URL to storage.
 * @param {string} url - The profile URL to save.
 * @returns {Promise<void>}
 */
async function saveProfileUrl(url: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.urlProfile, url);
}

/**
 * Initializes the profile URL by retrieving it from storage or falling back to the input element's value.
 * @param {HTMLInputElement} [inputElement] - Optional input element to use as a fallback for the profile URL.
 * @returns {Promise<string>} The profile URL from storage or the input element's value, or an empty string if none found.
 */
async function initializeProfileUrl(
  inputElement?: HTMLInputElement,
): Promise<string> {
  const storedUrl = await getProfileUrl();
  return storedUrl || inputElement?.value || "";
}

/**
 * Checks if the search feature is enabled in storage.
 * @returns {Promise<boolean>} True if enabled, false otherwise (defaults to true if not set).
 */
async function isSearchFeatureEnabled(): Promise<boolean> {
  const enabled = await storage.getItem<boolean>(
    STORAGE_KEYS.enableSearchFeature,
  );
  return enabled !== null ? enabled : true; // Default to true
}

/**
 * Saves the search feature enabled state to storage.
 * @param {boolean} enabled - Whether the search feature is enabled.
 * @returns {Promise<void>}
 */
async function saveSearchFeatureEnabled(enabled: boolean): Promise<void> {
  await storage.setItem(STORAGE_KEYS.enableSearchFeature, enabled);
}

const StorageService = {
  getArcadeData,
  saveArcadeData,
  getProfileUrl,
  saveProfileUrl,
  initializeProfileUrl,
  isSearchFeatureEnabled,
  saveSearchFeatureEnabled,
};

export default StorageService;
