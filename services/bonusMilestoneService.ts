import { storage } from "wxt/utils/storage";
import type { Account, AccountsData, ArcadeData } from "../types";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";
import AccountService from "./accountService";

// V2 deliberately does not reuse the earlier profile-only key. Confirmation is
// scoped to one profile + Facilitator window so a future period starts clean.
const STORAGE_PREFIX = "local:facilitatorBonusMilestoneV2";
export const DEFAULT_BONUS_MILESTONE_POINTS = 10;

export type BonusMilestoneControlState = {
  completed: boolean;
  enabled: boolean;
  participating: boolean;
  points: number;
  appliedPoints: number;
  milestoneBonusPoints: number;
  bonusIncludedInTotal: boolean;
  profileUrl: string;
};

/** Normalize a profile URL before comparing or building a storage identity. */
function canonicalProfile(profileUrl: string): string {
  return (
    canonicalizeProfileUrl(profileUrl) || profileUrl.trim().replace(/\/$/u, "")
  );
}

/** Compare two profile URLs after canonicalization. */
function sameProfile(left: string, right: string): boolean {
  return (
    canonicalProfile(left).toLowerCase() ===
    canonicalProfile(right).toLowerCase()
  );
}

/** Build the identity of the current Facilitator period from API dates. */
function periodIdentity(arcadeData?: ArcadeData | null): string | null {
  const startsAt = String(arcadeData?.facilitator?.startsAt || "").trim();
  const endsAt = String(arcadeData?.facilitator?.endsAt || "").trim();
  if (!startsAt || !endsAt) return null;
  return `${startsAt}::${endsAt}`;
}

/** Build an isolated storage key for one profile in one Facilitator period. */
function storageKey(
  profileUrl: string,
  arcadeData?: ArcadeData | null,
): `local:${string}` | null {
  const canonical = canonicalProfile(profileUrl);
  const period = periodIdentity(arcadeData);
  if (!canonical || !period) return null;

  const profileId = extractProfileId(canonical);
  const identity = profileId || encodeURIComponent(canonical.toLowerCase());
  return `${STORAGE_PREFIX}:${identity}:${encodeURIComponent(period)}` as `local:${string}`;
}

/** Find the stored account that owns the supplied profile URL. */
async function findAccount(profileUrl: string): Promise<Account | null> {
  if (!profileUrl) return null;
  try {
    const accounts = await AccountService.getAllAccounts();
    return (
      accounts.find((account) => sameProfile(account.profileUrl, profileUrl)) ||
      null
    );
  } catch {
    return null;
  }
}

/** Read one period-scoped confirmation flag without surfacing storage errors. */
async function readScopedCompletion(
  profileUrl: string,
  arcadeData?: ArcadeData | null,
): Promise<boolean> {
  const key = storageKey(profileUrl, arcadeData);
  if (!key) return false;
  try {
    return Boolean(await storage.getItem<boolean>(key));
  } catch {
    return false;
  }
}

/** Persist one period-scoped confirmation flag. */
async function writeScopedCompletion(
  profileUrl: string,
  arcadeData: ArcadeData | null | undefined,
  completed: boolean,
): Promise<void> {
  const key = storageKey(profileUrl, arcadeData);
  if (!key) return;
  await storage.setItem(key, Boolean(completed));
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

/** Return whether the selected period currently offers a claimable Bonus Milestone. */
function hasAvailableBonusMilestone(arcadeData?: ArcadeData | null): boolean {
  return (
    isBonusMilestoneEnabled(arcadeData) &&
    getBonusMilestoneAvailablePoints(arcadeData) > 0
  );
}

/** Read whether a profile manually confirmed the Bonus Milestone for its current period. */
export async function isBonusMilestoneCompleted(
  profileUrl: string,
): Promise<boolean> {
  if (!profileUrl) return false;
  const account = await findAccount(profileUrl);
  if (
    !account?.arcadeData ||
    !account.facilitatorProgram ||
    !hasAvailableBonusMilestone(account.arcadeData)
  ) {
    return false;
  }

  const stored = await readScopedCompletion(profileUrl, account.arcadeData);
  return (
    stored || account.arcadeData.facilitator?.bonusMilestoneCompleted === true
  );
}

/** Persist a profile's manual Bonus Milestone confirmation for its current period. */
export async function setBonusMilestoneCompleted(
  profileUrl: string,
  completed: boolean,
): Promise<void> {
  if (!profileUrl) return;
  const account = await findAccount(profileUrl);
  if (
    !account?.arcadeData ||
    !account.facilitatorProgram ||
    !hasAvailableBonusMilestone(account.arcadeData)
  ) {
    return;
  }
  await writeScopedCompletion(profileUrl, account.arcadeData, completed);
}

/** Read the Bonus Milestone amount actually returned as applied by Hub. */
export function getBonusMilestoneAppliedPoints(
  arcadeData?: ArcadeData | null,
): number {
  const value = Number(
    arcadeData?.facilitator?.bonusMilestonePoints ??
      arcadeData?.faciCounts?.bonusMilestonePoints,
  );
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

/** Read the standard highest-only Facilitator milestone bonus returned by Hub. */
export function getFacilitatorMilestoneBonusPoints(
  arcadeData?: ArcadeData | null,
): number {
  const value = Number(
    arcadeData?.facilitator?.milestoneBonusPoints ??
      arcadeData?.facilitator?.estimatedBonusPoints,
  );
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

/** Resolve all state required by the popup control without rendering any UI. */
export async function getBonusMilestoneControlState(): Promise<BonusMilestoneControlState> {
  const activeAccount = await AccountService.getActiveAccount();
  const profileUrl = activeAccount?.profileUrl || "";
  const arcadeData = activeAccount?.arcadeData;
  const participating = Boolean(activeAccount?.facilitatorProgram);
  const enabled = isBonusMilestoneEnabled(arcadeData);
  const points = enabled ? getBonusMilestoneAvailablePoints(arcadeData) : 0;
  const appliedPoints =
    enabled && points > 0 ? getBonusMilestoneAppliedPoints(arcadeData) : 0;
  const milestoneBonusPoints = getFacilitatorMilestoneBonusPoints(arcadeData);
  const bonusIncludedInTotal =
    arcadeData?.facilitator?.bonusIncludedInTotal === true;
  const storedCompleted =
    participating && enabled && points > 0 && profileUrl
      ? await readScopedCompletion(profileUrl, arcadeData)
      : false;
  const completed =
    participating &&
    enabled &&
    points > 0 &&
    (storedCompleted ||
      arcadeData?.facilitator?.bonusMilestoneCompleted === true);

  return {
    completed,
    enabled,
    participating,
    points,
    appliedPoints,
    milestoneBonusPoints,
    bonusIncludedInTotal,
    profileUrl,
  };
}

/** Persist the confirmation value for the currently active profile + period. */
export async function setActiveBonusMilestoneCompleted(
  completed: boolean,
): Promise<BonusMilestoneControlState> {
  const activeAccount = await AccountService.getActiveAccount();
  if (
    activeAccount?.profileUrl &&
    activeAccount.facilitatorProgram &&
    activeAccount.arcadeData &&
    hasAvailableBonusMilestone(activeAccount.arcadeData)
  ) {
    await writeScopedCompletion(
      activeAccount.profileUrl,
      activeAccount.arcadeData,
      completed,
    );
  }
  return getBonusMilestoneControlState();
}

/** Re-sync the popup control whenever account data or API results change. */
export function watchBonusMilestoneControlState(
  listener: () => void,
): () => void {
  return storage.watch<AccountsData>("local:accountsData", listener);
}
