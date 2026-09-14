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
  watchBonusMilestoneControlState:
    serviceMocks.watchBonusMilestoneControlState,
}));

vi.mock("../../services/bonusMilestoneI18n", () => ({
  getBonusMilestoneCancelLabel: () => "Cancel",
  getBonusMilestoneMessage: (key: string, points?: number | string) =>
    `${key}:${String(points ?? "")}`,
}));

import { mountBonusMilestoneControl } from "../../components/BonusMilestoneControl";

const AVAILABLE_STATE = {
  completed: false,
  enabled: true,
  participating: true,
  points: 10,
  appliedPoints: 0,
  milestoneBonusPoints: 5,
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

describe("Bonus Milestone toggle regression", () => {
  it("keeps the on/off toggle above the milestone grid and requires confirmation when enabling", async () => {
    await mountAndFlush();

    const toggleRoot = document.getElementById(
      "facilitator-bonus-milestone-toggle-root",
    );
    const milestoneGrid = document.querySelector("#milestones-section .grid");
    const toggle = toggleRoot?.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );

    expect(toggleRoot).not.toBeNull();
    expect(toggleRoot?.nextElementSibling).toBe(milestoneGrid);
    expect(toggle).not.toBeNull();
    expect(toggle?.checked).toBe(false);
    expect(toggle?.disabled).toBe(false);

    await act(async () => {
      toggle?.click();
      await Promise.resolve();
    });

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(serviceMocks.setActiveBonusMilestoneCompleted).not.toHaveBeenCalled();
  });

  it("does not show an on/off toggle when the current season has no Bonus Milestone", async () => {
    serviceMocks.getBonusMilestoneControlState.mockResolvedValue({
      ...AVAILABLE_STATE,
      enabled: false,
      points: 0,
    });

    await mountAndFlush();

    expect(
      document.querySelector(
        '#facilitator-bonus-milestone-toggle-root input[type="checkbox"]',
      ),
    ).toBeNull();
  });
});
