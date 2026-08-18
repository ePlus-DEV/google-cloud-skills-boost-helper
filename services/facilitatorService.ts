/**
 * Shared Facilitator helpers.
 *
 * API-provided milestone metadata is the source of truth. The local rules below
 * are only a compatibility fallback for old cached/API responses that do not yet
 * include facilitator.milestones.
 */
export type FacilitatorCounts = {
  faciGame?: number;
  faciTrivia?: number;
  faciSkill?: number;
  faciCompletion?: number;
  bonusMilestonePoints?: number;
};

export type FacilitatorMilestoneRule = {
  id: string;
  games: number;
  skillBadges: number;
  basePoints: number;
  bonusPoints: number;
};

export type FacilitatorApiMetadata = {
  estimatedBonusPoints?: number;
  milestoneBonusPoints?: number;
  estimatedMilestone?: string | null;
  milestonePolicy?: string;
  bonusMilestoneEnabled?: boolean;
  bonusMilestoneConfirmation?: string;
  bonusMilestoneAvailablePoints?: number;
  bonusMilestoneCompleted?: boolean;
  bonusMilestonePoints?: number | null;
  bonusMilestoneStatus?: string;
  bonusIncludedInTotal?: boolean;
  milestones?: FacilitatorMilestoneRule[];
};

export type MilestoneRequirements = {
  games: number;
  trivia: number;
  skills: number;
  labfree: number;
  basePoints?: number;
};

const FALLBACK_MILESTONE_REQUIREMENTS: Record<string, MilestoneRequirements> = {
  1: { games: 6, trivia: 0, skills: 18, labfree: 0, basePoints: 15 },
  2: { games: 8, trivia: 0, skills: 34, labfree: 0, basePoints: 25 },
  3: { games: 10, trivia: 0, skills: 50, labfree: 0, basePoints: 35 },
  ultimate: {
    games: 12,
    trivia: 0,
    skills: 66,
    labfree: 0,
    basePoints: 45,
  },
};

const FALLBACK_MILESTONE_POINTS: Record<string, number> = {
  1: 5,
  2: 15,
  3: 25,
  ultimate: 35,
};

/**
 * Mutable shared objects are intentional: PopupUIService stores references to
 * these objects, so syncing from the API updates the existing UI code without a
 * second hard-coded ruleset.
 */
export const FACILITATOR_MILESTONE_REQUIREMENTS: Record<
  string,
  MilestoneRequirements
> = cloneRequirements(FALLBACK_MILESTONE_REQUIREMENTS);

export const FACILITATOR_MILESTONE_POINTS: Record<string, number> = {
  ...FALLBACK_MILESTONE_POINTS,
};

/**
 * Convert a milestone key to its comparable numeric rank.
 */
export function getMilestoneNumber(milestone: string): number {
  return milestone === "ultimate" ? 4 : Number.parseInt(milestone, 10) || 0;
}

/**
 * Restore the shared Facilitator rule records to the local compatibility
 * fallback. This prevents rules from a previous API response leaking into a
 * later response that has missing or invalid metadata.
 */
export function resetFacilitatorRulesToFallback(): void {
  replaceRecord(
    FACILITATOR_MILESTONE_REQUIREMENTS,
    cloneRequirements(FALLBACK_MILESTONE_REQUIREMENTS),
  );
  replaceRecord(FACILITATOR_MILESTONE_POINTS, FALLBACK_MILESTONE_POINTS);
}

/**
 * Prefer the rules returned by facilitator.milestones. Returns true only when
 * a valid API ruleset was applied. Invalid/missing metadata leaves the latest
 * known/fallback rules untouched; API consumers should explicitly reset to the
 * fallback when a response does not contain a valid ruleset.
 */
export function syncFacilitatorRulesFromApi(
  facilitator: FacilitatorApiMetadata | null | undefined,
): boolean {
  if (
    !Array.isArray(facilitator?.milestones) ||
    facilitator.milestones.length === 0
  ) {
    return false;
  }

  const nextRequirements: Record<string, MilestoneRequirements> = {};
  const nextPoints: Record<string, number> = {};

  for (const rule of facilitator.milestones) {
    const key = normalizeMilestoneKey(rule?.id);
    const games = Number(rule?.games);
    const skills = Number(rule?.skillBadges);
    const basePoints = Number(rule?.basePoints);
    const bonusPoints = Number(rule?.bonusPoints);

    if (
      !key ||
      !Number.isFinite(games) ||
      !Number.isFinite(skills) ||
      !Number.isFinite(basePoints) ||
      !Number.isFinite(bonusPoints) ||
      games < 0 ||
      skills < 0 ||
      basePoints < 0 ||
      bonusPoints < 0
    ) {
      continue;
    }

    nextRequirements[key] = {
      games,
      trivia: 0,
      skills,
      labfree: 0,
      basePoints,
    };
    nextPoints[key] = bonusPoints;
  }

  if (Object.keys(nextRequirements).length === 0) {
    return false;
  }

  replaceRecord(FACILITATOR_MILESTONE_REQUIREMENTS, nextRequirements);
  replaceRecord(FACILITATOR_MILESTONE_POINTS, nextPoints);
  return true;
}

/**
 * Read the standard milestone bonus directly from API metadata when available.
 * Bonus Milestone points are applied separately from facilitator metadata.
 */
export function getFacilitatorBonusFromApi(
  facilitator?: FacilitatorApiMetadata | null,
): number | null {
  const value =
    facilitator?.milestoneBonusPoints ?? facilitator?.estimatedBonusPoints;
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function getApiBonusMilestonePoints(
  faciCounts: FacilitatorCounts | null | undefined,
): number {
  const value = Number(faciCounts?.bonusMilestonePoints);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

/**
 * Return the highest standard Facilitator milestone plus the separate Bonus
 * Milestone amount already calculated by the API for the self-reported flag.
 */
export function calculateFacilitatorBonus(
  faciCounts: FacilitatorCounts | null | undefined,
): number {
  if (!faciCounts) return 0;

  const current = normalizeCounts(faciCounts);
  let highestCompletedMilestone = 0;
  let highestBonusPoints = 0;

  for (const [milestoneKey, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS,
  )) {
    if (!isCompleted(current, requirements)) continue;

    const points = FACILITATOR_MILESTONE_POINTS[milestoneKey] || 0;
    const milestoneNum = getMilestoneNumber(milestoneKey);
    if (milestoneNum > highestCompletedMilestone) {
      highestCompletedMilestone = milestoneNum;
      highestBonusPoints = points;
    }
  }

  return highestBonusPoints + getApiBonusMilestonePoints(faciCounts);
}

/**
 * Return a per-milestone bonus breakdown while applying the highest-only rule.
 * `bonusMilestone` remains separate from the standard milestone map.
 */
export function calculateMilestoneBonusBreakdown(
  faciCounts: FacilitatorCounts | null | undefined,
) {
  if (!faciCounts) {
    return {
      milestones: { 1: 0, 2: 0, 3: 0, ultimate: 0 },
      bonusMilestone: 0,
      total: 0,
      highestCompleted: 0,
    };
  }

  const current = normalizeCounts(faciCounts);
  const milestoneBonus: Record<string, number> = {};

  for (const key of Object.keys(FACILITATOR_MILESTONE_REQUIREMENTS)) {
    milestoneBonus[key] = 0;
  }

  let highestCompletedMilestone = 0;
  let highestBonusPoints = 0;

  for (const [milestoneKey, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS,
  )) {
    if (!isCompleted(current, requirements)) continue;

    const points = FACILITATOR_MILESTONE_POINTS[milestoneKey] || 0;
    const milestoneNum = getMilestoneNumber(milestoneKey);
    if (milestoneNum > highestCompletedMilestone) {
      highestCompletedMilestone = milestoneNum;
      highestBonusPoints = points;

      for (const key of Object.keys(milestoneBonus)) {
        milestoneBonus[key] = 0;
      }
      milestoneBonus[milestoneKey] = points;
    }
  }

  const bonusMilestone = getApiBonusMilestonePoints(faciCounts);

  return {
    milestones: milestoneBonus,
    bonusMilestone,
    total: highestBonusPoints + bonusMilestone,
    highestCompleted: highestCompletedMilestone,
  };
}

/**
 * Normalize optional API counts into the internal scoring shape.
 */
function normalizeCounts(faciCounts: FacilitatorCounts) {
  const games = Number(faciCounts.faciGame) || 0;
  const trivia = Number(faciCounts.faciTrivia) || 0;
  const skills = Number(faciCounts.faciSkill) || 0;
  const labfree = Number(faciCounts.faciCompletion) || 0;

  return {
    games,
    trivia,
    skills,
    labfree,
    basePoints: games + trivia + skills * 0.5,
  };
}

/**
 * Check whether normalized counts satisfy one milestone requirement set.
 */
function isCompleted(
  current: ReturnType<typeof normalizeCounts>,
  requirements: MilestoneRequirements,
): boolean {
  return (
    current.games >= requirements.games &&
    current.trivia >= requirements.trivia &&
    current.skills >= requirements.skills &&
    current.labfree >= requirements.labfree &&
    current.basePoints >= (requirements.basePoints ?? 0)
  );
}

/**
 * Normalize API milestone IDs such as milestone_1, milestone-1, 1, and ultimate.
 */
function normalizeMilestoneKey(id: unknown): string | null {
  const value = String(id ?? "")
    .trim()
    .toLowerCase();
  if (value === "ultimate") return "ultimate";

  const match = /^(?:milestone[_-]?)?(\d+)$/.exec(value);
  return match?.[1] || null;
}

/**
 * Replace a record's contents in place so existing UI references remain valid.
 */
function replaceRecord<T>(
  target: Record<string, T>,
  source: Record<string, T>,
): void {
  for (const key of Object.keys(target)) {
    Reflect.deleteProperty(target, key);
  }
  Object.assign(target, source);
}

/**
 * Deep-enough clone for the flat milestone requirement values used by the UI.
 */
function cloneRequirements(
  source: Record<string, MilestoneRequirements>,
): Record<string, MilestoneRequirements> {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, { ...value }]),
  );
}
