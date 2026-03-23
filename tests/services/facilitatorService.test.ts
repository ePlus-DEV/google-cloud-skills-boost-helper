import { describe, it, expect } from "vitest";
import {
  getMilestoneNumber,
  calculateFacilitatorBonus,
  calculateMilestoneBonusBreakdown,
  FACILITATOR_MILESTONE_REQUIREMENTS,
  FACILITATOR_MILESTONE_POINTS,
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

describe("calculateFacilitatorBonus", () => {
  it("returns 0 for null/undefined faciCounts", () => {
    expect(calculateFacilitatorBonus(null)).toBe(0);
  });

  it("returns 0 when no milestone is completed", () => {
    expect(
      calculateFacilitatorBonus({
        faciGame: 1,
        faciTrivia: 1,
        faciSkill: 1,
        faciCompletion: 1,
      }),
    ).toBe(0);
  });

  it("returns milestone 1 bonus (2 pts) when milestone 1 is met", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["1"];
    expect(
      calculateFacilitatorBonus({
        faciGame: req.games,
        faciTrivia: req.trivia,
        faciSkill: req.skills,
        faciCompletion: req.labfree,
      }),
    ).toBe(FACILITATOR_MILESTONE_POINTS["1"]);
  });

  it("returns milestone 2 bonus (8 pts) when milestone 2 is met", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["2"];
    expect(
      calculateFacilitatorBonus({
        faciGame: req.games,
        faciTrivia: req.trivia,
        faciSkill: req.skills,
        faciCompletion: req.labfree,
      }),
    ).toBe(FACILITATOR_MILESTONE_POINTS["2"]);
  });

  it("returns milestone 3 bonus (15 pts) when milestone 3 is met", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["3"];
    expect(
      calculateFacilitatorBonus({
        faciGame: req.games,
        faciTrivia: req.trivia,
        faciSkill: req.skills,
        faciCompletion: req.labfree,
      }),
    ).toBe(FACILITATOR_MILESTONE_POINTS["3"]);
  });

  it("returns ultimate bonus (25 pts) when ultimate milestone is met", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["ultimate"];
    expect(
      calculateFacilitatorBonus({
        faciGame: req.games,
        faciTrivia: req.trivia,
        faciSkill: req.skills,
        faciCompletion: req.labfree,
      }),
    ).toBe(FACILITATOR_MILESTONE_POINTS["ultimate"]);
  });

  it("returns highest completed milestone bonus only", () => {
    // Meets milestone 2 but not 3
    const req2 = FACILITATOR_MILESTONE_REQUIREMENTS["2"];
    const result = calculateFacilitatorBonus({
      faciGame: req2.games,
      faciTrivia: req2.trivia,
      faciSkill: req2.skills,
      faciCompletion: req2.labfree,
    });
    expect(result).toBe(FACILITATOR_MILESTONE_POINTS["2"]);
  });

  it("uses 0 as default for missing counts", () => {
    expect(calculateFacilitatorBonus({})).toBe(0);
  });
});

describe("calculateMilestoneBonusBreakdown", () => {
  it("returns zero breakdown for null/undefined", () => {
    const result = calculateMilestoneBonusBreakdown(null);
    expect(result.total).toBe(0);
    expect(result.highestCompleted).toBe(0);
    expect(result.milestones["1"]).toBe(0);
  });

  it("returns correct breakdown for milestone 1", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["1"];
    const result = calculateMilestoneBonusBreakdown({
      faciGame: req.games,
      faciTrivia: req.trivia,
      faciSkill: req.skills,
      faciCompletion: req.labfree,
    });
    expect(result.highestCompleted).toBe(1);
    expect(result.total).toBe(FACILITATOR_MILESTONE_POINTS["1"]);
    expect(result.milestones["1"]).toBe(FACILITATOR_MILESTONE_POINTS["1"]);
    // Other milestones should be 0
    expect(result.milestones["2"]).toBe(0);
  });

  it("returns correct breakdown for ultimate milestone", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["ultimate"];
    const result = calculateMilestoneBonusBreakdown({
      faciGame: req.games,
      faciTrivia: req.trivia,
      faciSkill: req.skills,
      faciCompletion: req.labfree,
    });
    expect(result.highestCompleted).toBe(4);
    expect(result.total).toBe(FACILITATOR_MILESTONE_POINTS["ultimate"]);
    expect(result.milestones["ultimate"]).toBe(
      FACILITATOR_MILESTONE_POINTS["ultimate"],
    );
  });

  it("only assigns bonus to highest completed milestone", () => {
    const req = FACILITATOR_MILESTONE_REQUIREMENTS["2"];
    const result = calculateMilestoneBonusBreakdown({
      faciGame: req.games,
      faciTrivia: req.trivia,
      faciSkill: req.skills,
      faciCompletion: req.labfree,
    });
    // Only milestone 2 should have points, others 0
    expect(result.milestones["1"]).toBe(0);
    expect(result.milestones["2"]).toBe(FACILITATOR_MILESTONE_POINTS["2"]);
    expect(result.milestones["3"]).toBe(0);
  });
});
