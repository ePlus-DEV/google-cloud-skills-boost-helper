import type { ArcadeData } from "../types";
import AccountService from "./accountService";
import { calculateFacilitatorBonus } from "./facilitatorService";
import sendRuntimeMessage from "./runtimeMessage";
import { UI_COLORS } from "../utils/config";
import { canonicalizeProfileUrl } from "../utils/profileUrl";

/**
 * Service to handle storage operations
 * This service now acts as a compatibility layer for the new multi-account system
 */
const STORAGE_KEYS = {
  arcadeData: "local:arcadeData" as const,
  urlProfile: "local:urlProfile" as const,
  enableSearchFeature: "local:enableSearchFeature" as const,
  showBadge: "local:showBadge" as const,
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
      await updateExtensionBadge(finalTotalPoints);
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
    await updateExtensionBadge(legacyFinalTotal);
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
async function updateExtensionBadge(totalPoints: number): Promise<void> {
  const enabled = await isBadgeDisplayEnabled();
  const color = UI_COLORS?.BADGE || "#FF6B00";

  // If badge display is disabled, request background to clear badge and return
  if (!enabled) {
    await clearBadge();
    return;
  }

  const text = formatBadgeText(totalPoints);

  try {
    // Prefer asking the background to perform the badge update via helper
    try {
      await sendRuntimeMessage({ type: "setBadge", text, color });
      console.debug("Requested badge update via runtime message:", text);
      return;
    } catch (err) {
      console.debug("sendRuntimeMessage failed to request badge update:", err);
    }

    // Helper to safely access global action APIs without leaking `any`.
    type BadgeAction = {
      setBadgeText: (details: { text: string }) => void;
      setBadgeBackgroundColor?: (details: { color: string }) => void;
    };

    function getBrowserAction(): BadgeAction | null {
      const g = globalThis as unknown as Record<string, unknown>;
      try {
        const maybeBrowser = g.browser;
        if (maybeBrowser && typeof maybeBrowser === "object") {
          const mb = maybeBrowser as Record<string, unknown>;
          if ("action" in mb && typeof mb.action === "object") {
            return mb.action as unknown as BadgeAction;
          }
        }
      } catch {
        // ignore
      }
      return null;
    }

    function getChromeAction(): BadgeAction | null {
      const g = globalThis as unknown as Record<string, unknown>;
      try {
        const maybeChrome = g.chrome;
        if (maybeChrome && typeof maybeChrome === "object") {
          const mc = maybeChrome as Record<string, unknown>;
          if ("action" in mc && typeof mc.action === "object") {
            return mc.action as unknown as BadgeAction;
          }
        }
      } catch {
        // ignore
      }
      return null;
    }

    const browserAction = getBrowserAction();
    if (browserAction) {
      try {
        browserAction.setBadgeText({ text });
        if (browserAction.setBadgeBackgroundColor) {
          browserAction.setBadgeBackgroundColor({ color });
        }
        console.debug("Extension badge updated via browser.action:", text);
        return;
      } catch (err) {
        console.debug("browser.action failed to set badge:", err);
      }
    }

    const chromeAction = getChromeAction();
    if (chromeAction) {
      try {
        chromeAction.setBadgeText({ text });
        if (chromeAction.setBadgeBackgroundColor) {
          chromeAction.setBadgeBackgroundColor({ color });
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
 * Public helper to refresh the extension badge for the active account.
 * This can be called from UI flows after account changes (create/update/delete,
 * facilitator toggle, settings change) to ensure the badge shows the latest
 * computed total.
 */
async function refreshBadgeForActiveAccount(): Promise<void> {
  try {
    const active = await AccountService.getActiveAccount();
    if (!active) {
      // No active account: clear badge
      await clearBadge();
      return;
    }

    const arcade = active.arcadeData;
    const basePoints =
      arcade?.arcadePoints?.totalPoints || arcade?.totalArcadePoints || 0;
    const faciBonus = active.facilitatorProgram
      ? calculateFacilitatorBonus(arcade?.faciCounts)
      : 0;
    const finalPoints = (Number(basePoints) || 0) + (Number(faciBonus) || 0);

    await updateExtensionBadge(finalPoints);
  } catch (e) {
    // Non-fatal
    // eslint-disable-next-line no-console
    console.debug("Failed to refresh badge for active account:", e);
  }
}

/**
 * Clear the extension badge using the background helper, or fall back to
 * direct action APIs when available.
 */
async function clearBadge(): Promise<void> {
  try {
    try {
      await sendRuntimeMessage({ type: "clearBadge" });
      return;
    } catch (err) {
      console.debug("sendRuntimeMessage failed to request badge clear:", err);
    }

    const browserAction = (function getBrowserActionInline() {
      const g = globalThis as unknown as Record<string, unknown>;
      try {
        const maybeBrowser = g.browser;
        if (maybeBrowser && typeof maybeBrowser === "object") {
          const mb = maybeBrowser as Record<string, unknown>;
          if ("action" in mb && typeof mb.action === "object") {
            return mb.action as unknown as {
              setBadgeText: (details: { text: string }) => void;
            };
          }
        }
      } catch {
        // ignore
      }
      return null;
    })();

    if (browserAction) {
      try {
        browserAction.setBadgeText({ text: "" });
        return;
      } catch (err) {
        console.debug("browser.action failed to clear badge:", err);
      }
    }

    const chromeAction = (function getChromeActionInline() {
      const g = globalThis as unknown as Record<string, unknown>;
      try {
        const maybeChrome = g.chrome;
        if (maybeChrome && typeof maybeChrome === "object") {
          const mc = maybeChrome as Record<string, unknown>;
          if ("action" in mc && typeof mc.action === "object") {
            return mc.action as unknown as {
              setBadgeText: (details: { text: string }) => void;
            };
          }
        }
      } catch {
        // ignore
      }
      return null;
    })();

    if (chromeAction) {
      try {
        chromeAction.setBadgeText({ text: "" });
        return;
      } catch (err) {
        console.debug("chrome.action failed to clear badge:", err);
      }
    }
  } catch (e) {
    console.debug("Failed to clear extension badge:", e);
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
  const canonical = canonicalizeProfileUrl(url) || url;
  await storage.setItem(STORAGE_KEYS.urlProfile, canonical);
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
    // Fallback: log and default to true
    console.debug(
      "Failed to read search feature setting; defaulting to enabled"
    );
    return true;
  }
}

/**
 * Get whether the extension should display the badge on the toolbar icon.
 * Defaults to true if not set.
 */
async function isBadgeDisplayEnabled(): Promise<boolean> {
  try {
    const result = await storage.getItem<boolean>(STORAGE_KEYS.showBadge);
    return result ?? true;
  } catch (e) {
    console.debug(
      "Failed to read badge display setting; defaulting to enabled",
      e
    );
    return true;
  }
}

/**
 * Save badge display enabled/disabled to storage
 */
async function saveBadgeDisplayEnabled(enabled: boolean): Promise<void> {
  try {
    await storage.setItem(STORAGE_KEYS.showBadge, enabled);
  } catch (e) {
    console.debug("Failed to save badge display setting:", e);
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
  try {
    // Normalize and deduplicate existing accounts (canonicalize hosts and
    // collapse duplicates by profileId)
    await (AccountService as any).normalizeAccountsAndDeduplicate();
  } catch (e) {
    console.debug("Account normalization/deduplication failed:", e);
  }
}

const StorageService = {
  getArcadeData,
  saveArcadeData,
  getProfileUrl,
  saveProfileUrl,
  initializeProfileUrl,
  isSearchFeatureEnabled,
  isBadgeDisplayEnabled,
  saveBadgeDisplayEnabled,
  saveSearchFeatureEnabled,
  initializeMigration,
  refreshBadgeForActiveAccount,
};

export default StorageService;
