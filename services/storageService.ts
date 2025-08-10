import type { ArcadeData } from "../types";
import AccountService from "./accountService";

/**
 * Service to handle storage operations
 * This service now acts as a compatibility layer for the new multi-account system
 */
const STORAGE_KEYS = {
  arcadeData: "local:arcadeData" as const,
  urlProfile: "local:urlProfile" as const,
  enableSearchFeature: "local:enableSearchFeature" as const,
  accountsData: "local:accountsData" as const,
};

/**
 * Retrieves the arcade data from storage.
 * Returns data for the currently active account or legacy data for backward compatibility.
 * @returns {Promise<ArcadeData | null>} The stored arcade data or null if not found.
 */
async function getArcadeData(): Promise<ArcadeData | null> {
  // Try to get from active account first
  const activeAccount = await AccountService.getActiveAccount();
  if (activeAccount?.arcadeData) {
    return activeAccount.arcadeData;
  }

  // Fallback to legacy storage for backward compatibility
  return await storage.getItem<ArcadeData>(STORAGE_KEYS.arcadeData);
}

/**
 * Saves the arcade data to storage.
 * Updates the active account's data or saves to legacy storage if no active account.
 * @param {ArcadeData} data - The arcade data to save.
 * @returns {Promise<void>}
 */
async function saveArcadeData(data: ArcadeData): Promise<void> {
  const updatedData = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  // Try to update active account first
  const activeAccount = await AccountService.getActiveAccount();
  if (activeAccount) {
    await AccountService.updateAccountArcadeData(activeAccount.id, updatedData);
    return;
  }

  // Fallback to legacy storage for backward compatibility
  await storage.setItem(STORAGE_KEYS.arcadeData, updatedData);
}

/**
 * Retrieves the profile URL from storage.
 * Returns URL for the currently active account or legacy URL for backward compatibility.
 * @returns {Promise<string>} The stored profile URL or an empty string if not found.
 */
async function getProfileUrl(): Promise<string> {
  // Try to get from active account first
  const activeAccount = await AccountService.getActiveAccount();
  if (activeAccount?.profileUrl) {
    return activeAccount.profileUrl;
  }

  // Fallback to legacy storage for backward compatibility
  return (await storage.getItem<string>(STORAGE_KEYS.urlProfile)) || "";
}

/**
 * Saves the profile URL to storage.
 * Updates the active account's URL or saves to legacy storage if no active account.
 * @param {string} url - The profile URL to save.
 * @returns {Promise<void>}
 */
async function saveProfileUrl(url: string): Promise<void> {
  // Try to update active account first
  const activeAccount = await AccountService.getActiveAccount();
  if (activeAccount) {
    await AccountService.updateAccount(activeAccount.id, { profileUrl: url });
    return;
  }

  // Fallback to legacy storage for backward compatibility
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
  // Try to get from new settings structure first
  try {
    const settings = await AccountService.getSettings();
    return settings.enableSearchFeature;
  } catch {
    // Fallback to legacy storage
    const enabled = await storage.getItem<boolean>(
      STORAGE_KEYS.enableSearchFeature,
    );
    return enabled !== null ? enabled : true; // Default to true
  }
}

/**
 * Saves the search feature enabled state to storage.
 * @param {boolean} enabled - Whether the search feature is enabled.
 * @returns {Promise<void>}
 */
async function saveSearchFeatureEnabled(enabled: boolean): Promise<void> {
  // Try to update new settings structure first
  try {
    await AccountService.updateSettings({ enableSearchFeature: enabled });
  } catch {
    // Fallback to legacy storage
    await storage.setItem(STORAGE_KEYS.enableSearchFeature, enabled);
  }
}

/**
 * Initialize migration from old storage format to new multi-account format
 * This should be called when the app starts
 */
async function initializeMigration(): Promise<void> {
  await AccountService.migrateExistingData();
}

const StorageService = {
  getArcadeData,
  saveArcadeData,
  getProfileUrl,
  saveProfileUrl,
  initializeProfileUrl,
  isSearchFeatureEnabled,
  saveSearchFeatureEnabled,
  initializeMigration,
};

export default StorageService;
