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

vi.mock("../../services/bonusMilestoneDisclaimerI18n", () => ({
  getBonusMilestoneDisclaimer: () =>
    "Self-reported only. This confirmation is shown by the extension and does not mean Google Cloud Skills Boost / Arcade has verified or awarded these points.",
  getBonusMilestoneOfficialPageLabel: () =>
    "Open official Bonus Milestone page",
}));

import { mountBonusMilestoneControl } from "../../components/BonusMilestoneControl";

describe("Bonus Milestone claim UI", () => {
  it("keeps +10 isolated, links the official task, and removes it after Undo", async () => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;

    const profileUrl =
      "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111";
    let notifyAccountChange: (() => void) | undefined;

    serviceMocks.getBonusMilestoneControlState.mockResolvedValue({
      completed: false,
      enabled: true,
      participating: true,
      // Deliberately different from 10: claim copy must still stay +10.
      points: 35,
      appliedPoints: 0,
      milestoneBonusPoints: 25,
      bonusIncludedInTotal: false,
      profileUrl,
    });
    serviceMocks.watchBonusMilestoneControlState.mockImplementation(
      (listener: () => void) => {
        notifyAccountChange = listener;
        return () => undefined;
      },
    );

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
    expect(host?.textContent).not.toContain("+25");
    expect(host?.textContent).not.toContain("+35");
    expect(claimButton?.disabled).toBe(false);

    await act(async () => {
      claimButton?.click();
      await Promise.resolve();
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain("confirmButton:10");
    expect(dialog?.textContent).not.toContain("confirmButton:35");
    expect(dialog?.textContent).toContain("Self-reported only.");
    expect(dialog?.textContent).toContain(
      "does not mean Google Cloud Skills Boost / Arcade has verified or awarded these points",
    );

    const officialLink = dialog?.querySelector<HTMLAnchorElement>(
      'a[href="https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone"]',
    );
    expect(officialLink).not.toBeNull();
    expect(officialLink?.textContent).toContain(
      "Open official Bonus Milestone page",
    );
    expect(officialLink?.target).toBe("_blank");
    expect(officialLink?.rel).toContain("noopener");
    expect(officialLink?.rel).toContain("noreferrer");

    // Simulate the refreshed Hub state after a successful confirmation.
    serviceMocks.getBonusMilestoneControlState.mockResolvedValue({
      completed: true,
      enabled: true,
      participating: true,
      points: 35,
      appliedPoints: 10,
      milestoneBonusPoints: 25,
      bonusIncludedInTotal: false,
      profileUrl,
    });

    await act(async () => {
      notifyAccountChange?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(host?.textContent).toBe("✓ +10");
    expect(host?.textContent).not.toContain("+35");
    expect(document.getElementById("arcade-points")?.textContent).toBe("128");

    // The confirmation dialog is still open and now renders the Undo action.
    // Return a stale appliedPoints value on purpose: completed=false must be
    // authoritative, so the UI removes +10 immediately instead of keeping 128.
    serviceMocks.setActiveBonusMilestoneCompleted.mockResolvedValue({
      completed: false,
      enabled: true,
      participating: true,
      points: 35,
      appliedPoints: 10,
      milestoneBonusPoints: 25,
      bonusIncludedInTotal: false,
      profileUrl,
    });

    const removeButton = [
      ...document.querySelectorAll<HTMLButtonElement>("button"),
    ].find((button) => button.textContent?.includes("removeButton:10"));
    expect(removeButton).toBeDefined();

    await act(async () => {
      removeButton?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(serviceMocks.setActiveBonusMilestoneCompleted).toHaveBeenCalledWith(
      false,
    );
    expect(host?.textContent).toBe("Claim +10");
    expect(document.getElementById("arcade-points")?.textContent).toBe("118");
  });
});
