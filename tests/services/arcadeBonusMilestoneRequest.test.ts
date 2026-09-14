import { beforeEach, describe, expect, it, vi } from "vitest";

const bonusMocks = vi.hoisted(() => ({
  isBonusMilestoneCompleted: vi.fn(),
}));

vi.mock("../../services/bonusMilestoneService", () => ({
  isBonusMilestoneCompleted: bonusMocks.isBonusMilestoneCompleted,
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

import axios from "axios";
import ArcadeApiService from "../../services/arcadeApiService";

const PROFILE_URL =
  "https://www.skills.google/public_profiles/11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv(
    "WXT_ARCADE_POINT_URL",
    "https://private-api.example.test/api/arcade",
  );
  vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "test-client-key");
  vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "test-client-secret");
  vi.mocked(axios.post).mockResolvedValue({ status: 200, data: {} });
});

describe("Arcade v3 Bonus Milestone request", () => {
  it("submits true only after the current profile/period is confirmed", async () => {
    bonusMocks.isBonusMilestoneCompleted.mockResolvedValue(true);

    await ArcadeApiService.fetchArcadeData(PROFILE_URL);

    expect(bonusMocks.isBonusMilestoneCompleted).toHaveBeenCalledWith(
      PROFILE_URL,
    );
    expect(axios.post).toHaveBeenCalledWith(
      "https://private-api.example.test/api/v3/arcade",
      expect.objectContaining({
        url: PROFILE_URL,
        profileId: "11111111-1111-4111-8111-111111111111",
        facilitator: {
          bonusMilestoneCompleted: true,
        },
      }),
      expect.objectContaining({
        timeout: 15_000,
        headers: expect.objectContaining({
          "X-Arcade-Key": "test-client-key",
        }),
      }),
    );
  });

  it("submits false when the current season has no claimable bonus", async () => {
    bonusMocks.isBonusMilestoneCompleted.mockResolvedValue(false);

    await ArcadeApiService.fetchArcadeData(PROFILE_URL);

    expect(axios.post).toHaveBeenCalledWith(
      "https://private-api.example.test/api/v3/arcade",
      expect.objectContaining({
        facilitator: {
          bonusMilestoneCompleted: false,
        },
      }),
      expect.any(Object),
    );
  });
});
