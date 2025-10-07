import type { ArcadeData } from "../types";
import AccountService from "./accountService";
import { calculateFacilitatorBonus } from "./facilitatorService";

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
    // include facilitator only when the active account has it enabled
    const includeFaci = Boolean(activeAccount.facilitatorProgram);
    const basePoints =
      updatedData.arcadePoints?.totalPoints ||
      updatedData.totalArcadePoints ||
      0;
    const facilitatorBonus =
      includeFaci && updatedData.faciCounts
        ? calculateFacilitatorBonus(updatedData.faciCounts)
        : 0;
    const finalTotalPoints = basePoints + facilitatorBonus;

    // Persist the computed final total into both shapes the app uses
    updatedData.arcadePoints = {
      ...(updatedData.arcadePoints || {}),
      totalPoints: finalTotalPoints,
    };
    updatedData.totalArcadePoints = finalTotalPoints;

    await AccountService.updateAccountArcadeData(activeAccount.id, updatedData);
    // Update extension badge to show total points for the active account
    try {
      updateExtensionBadge(finalTotalPoints);
    } catch (e) {
      // Non-fatal: do not block saving if badge update fails
      // eslint-disable-next-line no-console
      console.debug("Failed to update extension badge:", e);
    }
    return;
  }

  // Fallback to legacy storage for backward compatibility
  // For legacy storage we don't have account flags. Do a best-effort: include facilitator if faciCounts exists.
  const legacyBasePoints =
    updatedData.arcadePoints?.totalPoints || updatedData.totalArcadePoints || 0;
  const legacyFaciBonus = updatedData.faciCounts
    ? calculateFacilitatorBonus(updatedData.faciCounts)
    : 0;
  const legacyFinalTotal = legacyBasePoints + legacyFaciBonus;

  // Persist final total into fields as well
  updatedData.arcadePoints = {
    ...(updatedData.arcadePoints || {}),
    totalPoints: legacyFinalTotal,
  };
  updatedData.totalArcadePoints = legacyFinalTotal;

  await storage.setItem(STORAGE_KEYS.arcadeData, updatedData);
  // Also update extension badge for legacy storage
  try {
    updateExtensionBadge(legacyFinalTotal);
  } catch (e) {
    // Non-fatal
    // eslint-disable-next-line no-console
    console.debug("Failed to update extension badge (legacy):", e);
  }
}

/**
 * Try to set extension action badge text and color in a robust way.
 * Tries `browser.action` then `chrome.action` and logs for debugging.
 */
function updateExtensionBadge(totalPoints: number): void {
  const text = formatBadgeText(totalPoints);
  const color = "#FF6B00";

  try {
    // Prefer sending a message to the background script to perform the badge update.
    // This avoids context issues where action APIs may not be available in options/popup pages.
    if (
      typeof browser !== "undefined" &&
      browser.runtime &&
      browser.runtime.sendMessage
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (browser.runtime as any).sendMessage({ type: "setBadge", text, color });
        console.debug(
          "Requested badge update via browser.runtime.sendMessage:",
          text
        );
        return;
      } catch (err) {
        console.debug("browser.runtime.sendMessage failed:", err);
      }
    }

    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (chrome.runtime as any).sendMessage({ type: "setBadge", text, color });
        console.debug(
          "Requested badge update via chrome.runtime.sendMessage:",
          text
        );
        return;
      } catch (err) {
        console.debug("chrome.runtime.sendMessage failed:", err);
      }
    }

    if (typeof browser !== "undefined" && browser.action) {
      try {
        // Firefox & browsers supporting the WebExtensions browser API
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (browser as any).action.setBadgeText({ text });
        if ((browser as any).action.setBadgeBackgroundColor) {
          (browser as any).action.setBadgeBackgroundColor({ color });
        }
        console.debug("Extension badge updated via browser.action:", text);
        return;
      } catch (err) {
        console.debug("browser.action failed to set badge:", err);
        // fallthrough to chrome
      }
    }

    if (typeof chrome !== "undefined" && chrome.action) {
      try {
        // Chrome compatibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (chrome as any).action.setBadgeText({ text });
        if ((chrome as any).action.setBadgeBackgroundColor) {
          (chrome as any).action.setBadgeBackgroundColor({ color });
        }
        console.debug("Extension badge updated via chrome.action:", text);
        return;
      } catch (err) {
        console.debug("chrome.action failed to set badge:", err);
      }
    }

    console.debug(
      "No action API available to set extension badge. Badge text would be:",
      text
    );
  } catch (e) {
    console.debug("Unexpected error while updating extension badge:", e);
  }
}

/**
 * Format badge text safe for extension badge: max 4 chars. Use shorthand for large numbers.
 */
function formatBadgeText(n: number): string {
  const num = Math.floor(Number(n) || 0);
  if (num <= 999) return String(num);
  if (num <= 9999) return `${Math.floor(num / 1000)}k`;
  return "999+";
}

/**
 * Lightweight local facilitator bonus computation used for badge when AccountService helper not exposed.
 */
// facilitator bonus calculations are provided by services/facilitatorService

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
  inputElement?: HTMLInputElement
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
      STORAGE_KEYS.enableSearchFeature
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
