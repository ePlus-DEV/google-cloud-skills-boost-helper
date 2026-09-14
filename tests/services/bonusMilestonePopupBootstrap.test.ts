import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bonusBootstrap: vi.fn(),
  mirrorSync: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../entrypoints/popup/bonusMilestoneControl", () => {
  mocks.bonusBootstrap();
  return {};
});

vi.mock("../../services/compactModePreferenceService", () => ({
  default: {
    initializeMirrorSync: mocks.mirrorSync,
  },
}));

describe("Bonus Milestone popup bootstrap", () => {
  it("loads the Bonus Milestone control from the popup-injected entrypoint", async () => {
    vi.resetModules();

    await import("../../entrypoints/popup/compactModeSync");

    expect(mocks.bonusBootstrap).toHaveBeenCalledTimes(1);
    expect(mocks.mirrorSync).toHaveBeenCalledTimes(1);
  });
});
