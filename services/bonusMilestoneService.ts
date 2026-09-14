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

function canonicalProfile(profileUrl: string): string {
  return canonicalizeProfileUrl(profileUrl) || profileUrl.trim().replace(/\/$/u, "");
}

function sameProfile(left: string, right: string): boolean {
  return canonicalProfile(left).toLowerCase() === canonicalProfile(right).toLowerCase();
}

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

async function findAccount(profileUrl: string): Promise<Account | null> {
  if (!profileUrl) return null;
  try {
    const accounts = await AccountService.getAllAccounts();
    return accounts.find((account) => sameProfile(account.profileUrl, profileUrl)) || null;
  } catch {
    return null;
  }
}

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

async function writeScopedCompletion(
  profileUrl: string,
  arcadeData: ArcadeData | null | undefined,
  completed: boolean,
): Promise<void> {
  const key = storageKey(profileUrl, arcadeData);
  if (!key) return;
  await storage.setItem(key, Boolean(completed));
}

/** Read whether a profile manually confirmed the Bonus Milestone for its current period. */
export async function isBonusMilestoneCompleted(
  profileUrl: string,
): Promise<boolean> {
  if (!profileUrl) return false;
  const account = await findAccount(profileUrl);
  if (!account?.arcadeData) return false;

  const stored = await readScopedCompletion(profileUrl, account.arcadeData);
  return stored || account.arcadeData.facilitator?.bonusMilestoneCompleted === true;
}

/** Persist a profile's manual Bonus Milestone confirmation for its current period. */
export async function setBonusMilestoneCompleted(
  profileUrl: string,
  completed: boolean,
): Promise<void> {
  if (!profileUrl) return;
  const account = await findAccount(profileUrl);
  await writeScopedCompletion(profileUrl, account?.arcadeData, completed);
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
  const arcadeData = activeAccount?.arcadeData;
  const enabled = isBonusMilestoneEnabled(arcadeData);
  const participating = Boolean(activeAccount?.facilitatorProgram);
  const points = getBonusMilestoneAvailablePoints(arcadeData);
  const appliedPoints = getBonusMilestoneAppliedPoints(arcadeData);
  const milestoneBonusPoints = getFacilitatorMilestoneBonusPoints(arcadeData);
  const bonusIncludedInTotal = arcadeData?.facilitator?.bonusIncludedInTotal === true;
  const storedCompleted =
    participating && enabled && profileUrl
      ? await readScopedCompletion(profileUrl, arcadeData)
      : false;
  const completed =
    participating &&
    enabled &&
    (storedCompleted || arcadeData?.facilitator?.bonusMilestoneCompleted === true);

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
  if (activeAccount?.profileUrl) {
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
