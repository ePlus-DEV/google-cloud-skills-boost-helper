import { storage } from "wxt/utils/storage";
import type { AccountsData, ArcadeData } from "../types";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";
import AccountService from "./accountService";

const STORAGE_PREFIX = "local:facilitatorBonusMilestone";
export const DEFAULT_BONUS_MILESTONE_POINTS = 10;

export type BonusMilestoneControlState = {
  completed: boolean;
  enabled: boolean;
  participating: boolean;
  points: number;
  profileUrl: string;
};

/** Build a stable WXT storage key for one Skills Boost public profile. */
function storageKey(profileUrl: string): `local:${string}` {
  const canonical = canonicalizeProfileUrl(profileUrl) || profileUrl.trim();
  const profileId = extractProfileId(canonical);
  const identity = profileId || encodeURIComponent(canonical.toLowerCase());
  return `${STORAGE_PREFIX}:${identity}` as `local:${string}`;
}

/** Read whether a profile manually confirmed the Bonus Milestone. */
export async function isBonusMilestoneCompleted(
  profileUrl: string,
): Promise<boolean> {
  if (!profileUrl) return false;
  try {
    return Boolean(await storage.getItem<boolean>(storageKey(profileUrl)));
  } catch {
    return false;
  }
}

/** Persist a profile's manual Bonus Milestone confirmation. */
export async function setBonusMilestoneCompleted(
  profileUrl: string,
  completed: boolean,
): Promise<void> {
  if (!profileUrl) return;
  await storage.setItem(storageKey(profileUrl), Boolean(completed));
}

/** Read the API-owned Bonus Milestone amount, with +10 only for old responses. */
export function getBonusMilestoneAvailablePoints(
  arcadeData?: ArcadeData | null,
): number {
  const value = Number(arcadeData?.facilitator?.bonusMilestoneAvailablePoints);
  return Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_BONUS_MILESTONE_POINTS;
}

/** Old API responses did not expose availability, so keep the current control visible. */
export function isBonusMilestoneEnabled(
  arcadeData?: ArcadeData | null,
): boolean {
  const value = arcadeData?.facilitator?.bonusMilestoneEnabled;
  return typeof value === "boolean" ? value : true;
}

/** Resolve all state required by the popup control without rendering any UI. */
export async function getBonusMilestoneControlState(): Promise<BonusMilestoneControlState> {
  const activeAccount = await AccountService.getActiveAccount();
  const profileUrl = activeAccount?.profileUrl || "";
  const enabled = isBonusMilestoneEnabled(activeAccount?.arcadeData);
  const participating = Boolean(activeAccount?.facilitatorProgram);
  const points = getBonusMilestoneAvailablePoints(activeAccount?.arcadeData);
  const completed =
    participating && enabled && profileUrl
      ? await isBonusMilestoneCompleted(profileUrl)
      : false;

  return {
    completed,
    enabled,
    participating,
    points,
    profileUrl,
  };
}

/** Persist the checkbox value for the currently active profile. */
export async function setActiveBonusMilestoneCompleted(
  completed: boolean,
): Promise<BonusMilestoneControlState> {
  const activeAccount = await AccountService.getActiveAccount();
  if (activeAccount?.profileUrl) {
    await setBonusMilestoneCompleted(activeAccount.profileUrl, completed);
  }
  return getBonusMilestoneControlState();
}

/** Re-sync the popup control whenever account data or API results change. */
export function watchBonusMilestoneControlState(
  listener: () => void,
): () => void {
  return storage.watch<AccountsData>("local:accountsData", listener);
}

/** Dynamically load and mount the React control only inside the popup document. */
async function mountPopupControl(): Promise<void> {
  if (!document.getElementById("popup-content")) return;

  const { mountBonusMilestoneControl } = await import(
    "../components/BonusMilestoneControl"
  );
  mountBonusMilestoneControl();
}

/** Start the asynchronous popup mount without leaking a floating promise. */
function startPopupControlMount(): void {
  void mountPopupControl();
}

/**
 * Mount the popup-only React control when this module is used from the popup.
 * Rendering and state lifecycle stay inside the React component.
 */
function initializePopupControlMount(): void {
  if (typeof document === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startPopupControlMount, {
      once: true,
    });
  } else {
    startPopupControlMount();
  }
}

initializePopupControlMount();
