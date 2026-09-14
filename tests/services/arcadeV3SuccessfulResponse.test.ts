import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("../../utils/arcadeRequestSignature", () => ({
  buildArcadeSignatureHeaders: vi.fn(() => Promise.resolve({})),
}));

vi.mock("../../services/facilitatorService", () => ({
  FACILITATOR_MILESTONE_POINTS: {
    1: 5,
    2: 15,
    3: 25,
    ultimate: 35,
  },
  FACILITATOR_MILESTONE_REQUIREMENTS: {
    1: { games: 6, trivia: 0, skills: 18, labfree: 0, basePoints: 15 },
  },
  resetFacilitatorRulesToFallback: vi.fn(),
  syncFacilitatorRulesFromApi: vi.fn(() => {
    throw new Error("simulated facilitator sync failure");
  }),
}));

import axios from "axios";
import ArcadeApiService from "../../services/arcadeApiService";

describe("ArcadeApiService successful v3 response handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "WXT_ARCADE_POINT_URL",
      "https://private-api.example.test/api/v3/arcade",
    );
  });

  it("returns HTTP 200 data even when facilitator post-processing fails", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: Object.freeze({
        success: true,
        apiVersion: 3,
        userDetails: [{ userName: "Test User" }],
        badges: [],
      }),
    });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        apiVersion: 3,
        lastUpdated: expect.any(String),
      }),
    );
  });
});
