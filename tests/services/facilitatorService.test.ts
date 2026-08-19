import { describe, it, expect } from "vitest";
import {
  getMilestoneNumber,
  calculateFacilitatorBonus,
  calculateMilestoneBonusBreakdown,
  FACILITATOR_MILESTONE_REQUIREMENTS,
  FACILITATOR_MILESTONE_POINTS,
  getFacilitatorBonusFromApi,
  syncFacilitatorRulesFromApi,
} from "../../services/facilitatorService";

describe("getMilestoneNumber", () => {
  it("returns 4 for ultimate", () => {
    expect(getMilestoneNumber("ultimate")).toBe(4);
  });

  it("parses numeric milestone strings", () => {
    expect(getMilestoneNumber("1")).toBe(1);
    expect(getMilestoneNumber("2")).toBe(2);
    expect(getMilestoneNumber("3")).toBe(3);
  });

  it("returns 0 for invalid input", () => {
    expect(getMilestoneNumber("invalid")).toBe(0);
    expect(getMilestoneNumber("")).toBe(0);
  });
});

describe("Arcade Facilitators fallback rules", () => {
  it("keeps the latest 2026 rules only as compatibility fallback", () => {
    expect(FACILITATOR_MILESTONE_REQUIREMENTS).toEqual({
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
    });

    expect(FACILITATOR_MILESTONE_POINTS).toEqual({
      1: 5,
      2: 15,
      3: 25,
      ultimate: 35,
    });
  });
});

describe("calculateFacilitatorBonus", () => {
  it("returns 0 for null/undefined faciCounts", () => {
    expect(calculateFacilitatorBonus(null)).toBe(0);
  });

  it("adds the API-calculated Bonus Milestone separately", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 6,
        faciSkill: 18,
        bonusMilestonePoints: 10,
      }),
    ).toBe(15);
  });

  it("uses whatever Bonus Milestone amount the API returns", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 6,
        faciSkill: 18,
        bonusMilestonePoints: 20,
      }),
    ).toBe(25);
  });

  it("returns 0 when no milestone is completed", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 5,
        faciTrivia: 99,
        faciSkill: 17,
        faciCompletion: 99,
      }),
    ).toBe(0);
  });

  it("does not require trivia or completion for 2026 milestone eligibility", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 6,
        faciTrivia: 0,
        faciSkill: 18,
        faciCompletion: 0,
      }),
    ).toBe(5);
  });

  it("returns milestone 1 bonus for the real 6 game / 34 skill profile", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 6,
        faciTrivia: 0,
        faciSkill: 34,
        faciCompletion: 0,
      }),
    ).toBe(5);
  });

  it("returns milestone 2 bonus when milestone 2 is met", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 8,
        faciTrivia: 0,
        faciSkill: 34,
        faciCompletion: 0,
      }),
    ).toBe(15);
  });

  it("returns milestone 3 bonus when milestone 3 is met", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 10,
        faciTrivia: 0,
        faciSkill: 50,
        faciCompletion: 0,
      }),
    ).toBe(25);
  });

  it("returns ultimate bonus when ultimate is met", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 12,
        faciTrivia: 0,
        faciSkill: 66,
        faciCompletion: 0,
      }),
    ).toBe(35);
  });

  it("returns highest completed milestone bonus only", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 8,
        faciTrivia: 0,
        faciSkill: 50,
        faciCompletion: 0,
      }),
    ).toBe(15);
  });

  it("uses 0 as default for missing counts", () => {
    expect(calculateFacilitatorBonus({})).toBe(0);
  });
});

describe("calculateMilestoneBonusBreakdown", () => {
  it("returns zero breakdown for null/undefined", () => {
    const result = calculateMilestoneBonusBreakdown(null);
    expect(result.total).toBe(0);
    expect(result.bonusMilestone).toBe(0);
    expect(result.highestCompleted).toBe(0);
    expect(result.milestones["1"]).toBe(0);
  });

  it("returns the real profile as milestone 1 with +5 points", () => {
    const result = calculateMilestoneBonusBreakdown({
      faciGame: 6,
      faciTrivia: 0,
      faciSkill: 34,
      faciCompletion: 0,
    });

    expect(result.highestCompleted).toBe(1);
    expect(result.total).toBe(5);
    expect(result.bonusMilestone).toBe(0);
    expect(result.milestones["1"]).toBe(5);
    expect(result.milestones["2"]).toBe(0);
    expect(result.milestones["3"]).toBe(0);
    expect(result.milestones.ultimate).toBe(0);
  });

  it("keeps the API Bonus Milestone outside the standard milestone map", () => {
    const result = calculateMilestoneBonusBreakdown({
      faciGame: 6,
      faciTrivia: 0,
      faciSkill: 18,
      faciCompletion: 0,
      bonusMilestonePoints: 10,
    });

    expect(result.highestCompleted).toBe(1);
    expect(result.milestones["1"]).toBe(5);
    expect(result.bonusMilestone).toBe(10);
    expect(result.total).toBe(15);
  });

  it("returns correct breakdown for ultimate milestone", () => {
    const result = calculateMilestoneBonusBreakdown({
      faciGame: 12,
      faciTrivia: 0,
      faciSkill: 66,
      faciCompletion: 0,
    });

    expect(result.highestCompleted).toBe(4);
    expect(result.total).toBe(35);
    expect(result.milestones.ultimate).toBe(35);
  });
});

describe("API-provided Facilitator rules", () => {
  it("reads only the standard milestone bonus from API metadata", () => {
    expect(getFacilitatorBonusFromApi({ estimatedBonusPoints: 5 })).toBe(5);
    expect(
      getFacilitatorBonusFromApi({
        estimatedBonusPoints: 5,
        milestoneBonusPoints: 15,
        bonusMilestoneAvailablePoints: 10,
        bonusMilestonePoints: 10,
      }),
    ).toBe(15);
    expect(getFacilitatorBonusFromApi()).toBeNull();
  });

  it("replaces shared requirements and bonus values from the API", () => {
    const applied = syncFacilitatorRulesFromApi({
      milestonePolicy: "highest_only",
      milestones: [
        {
          id: "milestone_1",
          games: 2,
          skillBadges: 4,
          basePoints: 4,
          bonusPoints: 7,
        },
        {
          id: "milestone_2",
          games: 3,
          skillBadges: 6,
          basePoints: 6,
          bonusPoints: 11,
        },
        {
          id: "ultimate",
          games: 4,
          skillBadges: 8,
          basePoints: 8,
          bonusPoints: 19,
        },
      ],
    });

    expect(applied).toBe(true);
    expect(FACILITATOR_MILESTONE_REQUIREMENTS["1"]).toEqual({
      games: 2,
      trivia: 0,
      skills: 4,
      labfree: 0,
      basePoints: 4,
    });
    expect(FACILITATOR_MILESTONE_POINTS["1"]).toBe(7);
    expect(FACILITATOR_MILESTONE_POINTS["2"]).toBe(11);
    expect(FACILITATOR_MILESTONE_POINTS.ultimate).toBe(19);

    expect(
      calculateFacilitatorBonus({
        faciGame: 2,
        faciSkill: 4,
        faciTrivia: 0,
        faciCompletion: 0,
      }),
    ).toBe(7);
  });
});
