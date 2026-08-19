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

function storageKey(profileUrl: string): `local:${string}` {
  const canonical = canonicalizeProfileUrl(profileUrl) || profileUrl.trim();
  const profileId = extractProfileId(canonical);
  const identity = profileId || encodeURIComponent(canonical.toLowerCase());
  return `${STORAGE_PREFIX}:${identity}` as `local:${string}`;
}

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
  return storage.watch<AccountsData>("local:accountsData", () => listener());
}

/**
 * Mount the popup-only React control when this module is used from the popup.
 * Rendering and lifecycle are intentionally kept out of this service module.
 */
function initializePopupControlMount(): void {
  if (typeof document === "undefined") return;

  const mount = () => {
    if (!document.getElementById("popup-content")) return;
    void import("../components/BonusMilestoneControl").then(
      ({ mountBonusMilestoneControl }) => mountBonusMilestoneControl(),
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
}

initializePopupControlMount();
