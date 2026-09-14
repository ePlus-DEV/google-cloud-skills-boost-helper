import { act } from "react";
import { describe, expect, it, vi } from "vitest";

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

vi.mock("../../services/bonusMilestoneI18n", () => ({
  getBonusMilestoneCancelLabel: () => "Cancel",
  getBonusMilestoneMessage: (key: string, points?: number | string) => {
    if (key === "claim") return `Claim +${String(points ?? "")}`;
    if (key === "claimTooltip") {
      return `Bonus Milestone: confirm completion to add +${String(points ?? "")} points.`;
    }
    return `${key}:${String(points ?? "")}`;
  },
}));

import { mountBonusMilestoneControl } from "../../components/BonusMilestoneControl";

describe("Bonus Milestone claim UI", () => {
  it("renders Claim +10 before confirmation and opens the confirmation dialog", async () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    serviceMocks.getBonusMilestoneControlState.mockResolvedValue({
      completed: false,
      enabled: true,
      participating: true,
      points: 10,
      appliedPoints: 0,
      milestoneBonusPoints: 0,
      bonusIncludedInTotal: false,
      profileUrl:
        "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111",
    });
    serviceMocks.watchBonusMilestoneControlState.mockReturnValue(() => undefined);

    document.body.innerHTML = `
      <span id="arcade-points">118</span>
      <div id="arcade-facilitator-points">+0</div>
    `;

    await act(async () => {
      mountBonusMilestoneControl();
      await Promise.resolve();
      await Promise.resolve();
    });

    const host = document.getElementById("arcade-facilitator-points");
    const claimButton = host?.querySelector<HTMLButtonElement>("button");

    expect(host?.textContent).toBe("Claim +10");
    expect(claimButton?.disabled).toBe(false);

    await act(async () => {
      claimButton?.click();
      await Promise.resolve();
    });

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
