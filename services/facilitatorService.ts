/**
 * Shared facilitator helpers: requirements, points mapping and calculation utilities
 */
export const FACILITATOR_MILESTONE_REQUIREMENTS: Record<string, any> = {
  1: { games: 6, trivia: 5, skills: 14, labfree: 6 },
  2: { games: 8, trivia: 6, skills: 28, labfree: 12 },
  3: { games: 10, trivia: 7, skills: 38, labfree: 18 },
  ultimate: { games: 12, trivia: 8, skills: 52, labfree: 24 },
};

export const FACILITATOR_MILESTONE_POINTS: Record<string | number, number> = {
  1: 2,
  2: 8,
  3: 15,
  ultimate: 25,
};

export function getMilestoneNumber(milestone: string): number {
  return milestone === "ultimate" ? 4 : Number.parseInt(milestone);
}

export function calculateFacilitatorBonus(faciCounts: any): number {
  if (!faciCounts) return 0;

  const {
    faciGame = 0,
    faciTrivia = 0,
    faciSkill = 0,
    faciCompletion = 0,
  } = faciCounts;
  const current = {
    games: faciGame,
    trivia: faciTrivia,
    skills: faciSkill,
    labfree: faciCompletion,
  };
  const {
    faciGame = 0,
    faciTrivia = 0,
    faciSkill = 0,
    faciCompletion = 0,
  } = faciCounts;
  const current = {
    games: faciGame,
    trivia: faciTrivia,
    skills: faciSkill,
    labfree: faciCompletion,
  };

  let highestCompletedMilestone = 0;
  let highestBonusPoints = 0;

  for (const [milestone, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS
  )) {
    const isCompleted =
      current.games >= requirements.games &&
      current.trivia >= requirements.trivia &&
      current.skills >= requirements.skills &&
      current.labfree >= requirements.labfree;

    if (isCompleted) {
      const points =
        FACILITATOR_MILESTONE_POINTS[
          milestone as keyof typeof FACILITATOR_MILESTONE_POINTS
        ] || 0;
      const points =
        FACILITATOR_MILESTONE_POINTS[
          milestone as keyof typeof FACILITATOR_MILESTONE_POINTS
        ] || 0;
      const milestoneNum = getMilestoneNumber(milestone);
      if (milestoneNum > highestCompletedMilestone) {
        highestCompletedMilestone = milestoneNum;
        highestBonusPoints = points;
      }
    }
  }

  return highestBonusPoints;
}

export function calculateMilestoneBonusBreakdown(faciCounts: any) {
  if (!faciCounts) {
    return {
      milestones: { 1: 0, 2: 0, 3: 0, ultimate: 0 },
      total: 0,
      highestCompleted: 0,
    };
    return {
      milestones: { 1: 0, 2: 0, 3: 0, ultimate: 0 },
      total: 0,
      highestCompleted: 0,
    };
  }

  const {
    faciGame = 0,
    faciTrivia = 0,
    faciSkill = 0,
    faciCompletion = 0,
  } = faciCounts;
  const current = {
    games: faciGame,
    trivia: faciTrivia,
    skills: faciSkill,
    labfree: faciCompletion,
  };
  const {
    faciGame = 0,
    faciTrivia = 0,
    faciSkill = 0,
    faciCompletion = 0,
  } = faciCounts;
  const current = {
    games: faciGame,
    trivia: faciTrivia,
    skills: faciSkill,
    labfree: faciCompletion,
  };

  const milestoneBonus: Record<string, number> = {
    1: 0,
    2: 0,
    3: 0,
    ultimate: 0,
  };
  const milestoneBonus: Record<string, number> = {
    1: 0,
    2: 0,
    3: 0,
    ultimate: 0,
  };
  let highestCompletedMilestone = 0;
  let highestBonusPoints = 0;

  for (const [milestone, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS
  )) {
    const isCompleted =
      current.games >= requirements.games &&
      current.trivia >= requirements.trivia &&
      current.skills >= requirements.skills &&
      current.labfree >= requirements.labfree;

    if (isCompleted) {
      const points =
        FACILITATOR_MILESTONE_POINTS[
          milestone as keyof typeof FACILITATOR_MILESTONE_POINTS
        ] || 0;
      const points =
        FACILITATOR_MILESTONE_POINTS[
          milestone as keyof typeof FACILITATOR_MILESTONE_POINTS
        ] || 0;
      const milestoneNum = getMilestoneNumber(milestone);
      if (milestoneNum > highestCompletedMilestone) {
        highestCompletedMilestone = milestoneNum;
        highestBonusPoints = points;

        // reset and set only the highest completed
        for (const k of Object.keys(milestoneBonus)) milestoneBonus[k] = 0;
        milestoneBonus[milestone] = points;
      }
    }
  }

  return {
    milestones: milestoneBonus,
    total: highestBonusPoints,
    highestCompleted: highestCompletedMilestone,
  };
  return {
    milestones: milestoneBonus,
    total: highestBonusPoints,
    highestCompleted: highestCompletedMilestone,
  };
}
