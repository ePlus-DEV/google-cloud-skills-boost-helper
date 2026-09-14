import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getBonusMilestoneControlState: vi.fn(),
  setActiveBonusMilestoneCompleted: vi.fn(),
  watchBonusMilestoneControlState: vi.fn(),
}));

vi.mock("../../services/bonusMilestoneService", () => ({
  getBonusMilestoneControlState: serviceMocks.getBonusMilestoneControlState,
  setActiveBonusMilestoneCompleted:
    serviceMocks.setActiveBonusMilestoneCompleted,
  watchBonusMilestoneControlState: serviceMocks.watchBonusMilestoneControlState,
}));

import { mountBonusMilestoneControl } from "../../components/BonusMilestoneControl";

const AVAILABLE_STATE = {
  completed: false,
  enabled: true,
  participating: true,
  points: 10,
  appliedPoints: 0,
  milestoneBonusPoints: 0,
  bonusIncludedInTotal: false,
  profileUrl:
    "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111",
};

/** Flush React effects after mounting the popup control. */
async function mountAndFlush(): Promise<void> {
  await act(async () => {
    mountBonusMilestoneControl();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;

  serviceMocks.getBonusMilestoneControlState.mockReset();
  serviceMocks.setActiveBonusMilestoneCompleted.mockReset();
  serviceMocks.watchBonusMilestoneControlState.mockReset();
  serviceMocks.watchBonusMilestoneControlState.mockReturnValue(() => undefined);
  serviceMocks.getBonusMilestoneControlState.mockResolvedValue({
    ...AVAILABLE_STATE,
  });
  serviceMocks.setActiveBonusMilestoneCompleted.mockImplementation(
    (completed: boolean) =>
      Promise.resolve({
        ...AVAILABLE_STATE,
        completed,
        appliedPoints: completed ? 10 : 0,
      }),
  );

  document.body.innerHTML = `
    <span id="arcade-points">100</span>
    <div id="arcade-facilitator-points">+0</div>
    <section id="milestones-section">
      <div class="grid"><div class="milestone-card"></div></div>
    </section>
  `;
});

describe("Bonus Milestone UI regression", () => {
  it("keeps the existing checkbox design and adds the confirmed amount to the yellow badge", async () => {
    await mountAndFlush();

    const controlRoot = document.getElementById(
      "facilitator-bonus-milestone-root",
    );
    const milestoneGrid = document.querySelector("#milestones-section .grid");
    const toggle = controlRoot?.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );

    expect(controlRoot).not.toBeNull();
    expect(controlRoot?.nextElementSibling).toBe(milestoneGrid);
    expect(controlRoot?.textContent).toContain("Bonus Milestone");
    expect(controlRoot?.textContent).toContain("+10 points");
    expect(toggle).not.toBeNull();
    expect(toggle?.checked).toBe(false);
    expect(toggle?.disabled).toBe(false);
    expect(document.getElementById("arcade-facilitator-points")?.textContent).toBe(
      "+0",
    );

    await act(async () => {
      toggle?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(serviceMocks.setActiveBonusMilestoneCompleted).toHaveBeenCalledWith(
      true,
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.getElementById("arcade-facilitator-points")?.textContent).toBe(
      "+10",
    );
    expect(document.getElementById("arcade-points")?.textContent).toBe("110");
  });
});
