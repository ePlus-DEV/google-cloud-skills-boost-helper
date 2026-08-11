import { describe, it, expect, vi, beforeEach } from "vitest";
import ArcadeApiService from "../../services/arcadeApiService";
import {
  FACILITATOR_MILESTONE_POINTS,
  FACILITATOR_MILESTONE_REQUIREMENTS,
  resetFacilitatorRulesToFallback,
  syncFacilitatorRulesFromApi,
} from "../../services/facilitatorService";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from "axios";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("WXT_ARCADE_POINT_URL", "https://api.example.com/api/arcade");
  vi.stubEnv("WXT_ARCADE_POINT_V2_URL", "");
  resetFacilitatorRulesToFallback();
  document.body.innerHTML = "";
});

describe("ArcadeApiService.isValidProfileUrl", () => {
  it("returns false for invalid URL", () => {
    expect(ArcadeApiService.isValidProfileUrl("not-a-url")).toBe(false);
  });

  it("returns false for URL without /public_profiles/", () => {
    expect(
      ArcadeApiService.isValidProfileUrl("https://www.skills.google/catalog"),
    ).toBe(false);
  });

  it("returns true for valid profile URL", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://www.skills.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns true for cloudskillsboost profile URL", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://www.cloudskillsboost.google/public_profiles/abc123",
      ),
    ).toBe(true);
  });

  it("returns false for unaccepted host", () => {
    expect(
      ArcadeApiService.isValidProfileUrl(
        "https://example.com/public_profiles/abc123",
      ),
    ).toBe(false);
  });
});

describe("ArcadeApiService.fetchArcadeData", () => {
  it("returns data on successful API response", async () => {
    const mockData = { totalArcadePoints: 100, success: true };
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: mockData,
    });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).not.toBeNull();
    expect(result?.totalArcadePoints).toBe(100);
    expect(result?.lastUpdated).toBeTruthy();
  });

  it("calls /api/v2/arcade, not the legacy /api/arcade endpoint", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v2/arcade",
      expect.any(Object),
      { timeout: 15_000 },
    );
  });

  it("keeps a legacy setting that already points to /api/v2/arcade", async () => {
    vi.stubEnv("WXT_ARCADE_POINT_URL", "https://api.example.com/api/v2/arcade");
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v2/arcade",
      expect.any(Object),
      { timeout: 15_000 },
    );
  });

  it("uses top-level facilitator rules from the v2 response", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        facilitator: {
          milestones: [
            {
              id: "milestone_1",
              games: 2,
              skillBadges: 4,
              basePoints: 4,
              bonusPoints: 7,
            },
          ],
        },
      },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(FACILITATOR_MILESTONE_REQUIREMENTS["1"]).toEqual({
      games: 2,
      trivia: 0,
      skills: 4,
      labfree: 0,
      basePoints: 4,
    });
    expect(FACILITATOR_MILESTONE_POINTS["1"]).toBe(7);
  });

  it("matches the web facilitator combined progress without overwriting popup counts", async () => {
    document.body.innerHTML = `
      <div><span class="milestone-1-games">6/6 ✓</span></div>
      <div><span class="milestone-1-trivia">0/5</span></div>
      <div><span class="milestone-1-skills">18/18 ✓</span></div>
      <div><span class="milestone-1-labfree">0/6</span></div>
      <span class="milestone-1-progress">50%</span>

      <div><span class="milestone-2-games">7/8</span></div>
      <div><span class="milestone-2-trivia">0/6</span></div>
      <div><span class="milestone-2-skills">34/34 ✓</span></div>
      <div><span class="milestone-2-labfree">0/12</span></div>
      <span class="milestone-2-progress">75%</span>

      <div><span class="milestone-3-games">7/10</span></div>
      <div><span class="milestone-3-trivia">0/7</span></div>
      <div><span class="milestone-3-skills">35/50</span></div>
      <div><span class="milestone-3-labfree">0/18</span></div>
      <span class="milestone-3-progress">50%</span>

      <div><span class="milestone-ultimate-games">7/12</span></div>
      <div><span class="milestone-ultimate-trivia">0/8</span></div>
      <div><span class="milestone-ultimate-skills">35/66</span></div>
      <div><span class="milestone-ultimate-labfree">0/24</span></div>
      <span class="milestone-ultimate-progress">50%</span>
    `;

    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        faciCounts: {
          faciGame: 7,
          faciTrivia: 0,
          faciSkill: 35,
          faciCompletion: 0,
        },
        facilitator: {
          gameBadges: 7,
          triviaBadges: 0,
          skillBadges: 35,
          milestones: [
            {
              id: "milestone_1",
              games: 6,
              skillBadges: 18,
              basePoints: 15,
              bonusPoints: 5,
            },
            {
              id: "milestone_2",
              games: 8,
              skillBadges: 34,
              basePoints: 25,
              bonusPoints: 15,
            },
            {
              id: "milestone_3",
              games: 10,
              skillBadges: 50,
              basePoints: 35,
              bonusPoints: 25,
            },
            {
              id: "ultimate",
              games: 12,
              skillBadges: 66,
              basePoints: 45,
              bonusPoints: 35,
            },
          ],
        },
      },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(
      document.querySelector<HTMLElement>(".milestone-1-progress")?.textContent,
    ).toBe("100% · 24/24");
    expect(
      document.querySelector<HTMLElement>(".milestone-2-progress")?.textContent,
    ).toBe("97% · 41/42");
    expect(
      document.querySelector<HTMLElement>(".milestone-3-progress")?.textContent,
    ).toBe("70% · 42/60");
    expect(
      document.querySelector<HTMLElement>(".milestone-ultimate-progress")
        ?.textContent,
    ).toBe("53% · 42/78");

    expect(
      document.querySelector<HTMLElement>(".milestone-3-games")?.textContent,
    ).toBe("7/10");
    expect(
      document.querySelector<HTMLElement>(".milestone-3-skills")?.textContent,
    ).toBe("35/50");

    const milestone2Progress = document.querySelector<HTMLElement>(
      ".milestone-2-progress",
    );
    expect(milestone2Progress?.dataset.completedBadges).toBe("41");
    expect(milestone2Progress?.dataset.totalBadges).toBe("42");
    expect(milestone2Progress?.title).toContain("41/42 badges completed");

    expect(
      document
        .querySelector<HTMLElement>(".milestone-1-trivia")
        ?.parentElement?.classList.contains("hidden"),
    ).toBe(true);
    expect(
      document
        .querySelector<HTMLElement>(".milestone-1-labfree")
        ?.parentElement?.classList.contains("hidden"),
    ).toBe(true);
  });

  it("updates rendered facilitator labels from API rule values", async () => {
    document.body.innerHTML = `
      <span data-i18n="milestone1Bonus">+2 Bonus Points</span>
      <span data-i18n="milestone2Bonus">+8 Bonus Points</span>
      <span data-i18n="milestone3Bonus">+15 Bonus Points</span>
      <span data-i18n="milestoneUltimateBonus">+25 Bonus Points</span>
      <span data-i18n="maxPossibleNote">Maximum possible: 25 points (highest milestone only)</span>
    `;

    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        facilitator: {
          milestones: [
            {
              id: "milestone_1",
              games: 6,
              skillBadges: 18,
              basePoints: 15,
              bonusPoints: 5,
            },
            {
              id: "milestone_2",
              games: 8,
              skillBadges: 34,
              basePoints: 25,
              bonusPoints: 15,
            },
            {
              id: "milestone_3",
              games: 10,
              skillBadges: 50,
              basePoints: 35,
              bonusPoints: 25,
            },
            {
              id: "ultimate",
              games: 12,
              skillBadges: 66,
              basePoints: 45,
              bonusPoints: 35,
            },
          ],
        },
      },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(
      document.querySelector('[data-i18n="milestone1Bonus"]')?.textContent,
    ).toBe("+5 Bonus Points");
    expect(
      document.querySelector('[data-i18n="milestone2Bonus"]')?.textContent,
    ).toBe("+15 Bonus Points");
    expect(
      document.querySelector('[data-i18n="milestone3Bonus"]')?.textContent,
    ).toBe("+25 Bonus Points");
    expect(
      document.querySelector('[data-i18n="milestoneUltimateBonus"]')
        ?.textContent,
    ).toBe("+35 Bonus Points");
    expect(
      document.querySelector('[data-i18n="maxPossibleNote"]')?.textContent,
    ).toBe("Maximum possible: 35 points (highest milestone only)");
  });

  it("preserves localized label text while replacing the bonus number", async () => {
    document.body.innerHTML = `
      <span data-i18n="milestone1Bonus">+2 Điểm thưởng</span>
    `;

    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        facilitator: {
          milestones: [
            {
              id: "milestone_1",
              games: 6,
              skillBadges: 18,
              basePoints: 15,
              bonusPoints: 5,
            },
          ],
        },
      },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(
      document.querySelector('[data-i18n="milestone1Bonus"]')?.textContent,
    ).toBe("+5 Điểm thưởng");
  });

  it("restores fallback rules when v2 metadata is missing", async () => {
    syncFacilitatorRulesFromApi({
      milestones: [
        {
          id: "milestone_1",
          games: 2,
          skillBadges: 4,
          basePoints: 4,
          bonusPoints: 99,
        },
      ],
    });
    expect(FACILITATOR_MILESTONE_POINTS["1"]).toBe(99);

    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(FACILITATOR_MILESTONE_REQUIREMENTS["1"]).toEqual({
      games: 6,
      trivia: 0,
      skills: 18,
      labfree: 0,
      basePoints: 15,
    });
    expect(FACILITATOR_MILESTONE_POINTS["1"]).toBe(5);
  });

  it("adds lastUpdated timestamp to returned data", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result?.lastUpdated).toBeTruthy();
    expect(result).not.toBeNull();
    if (result?.lastUpdated) {
      expect(new Date(result.lastUpdated).getTime()).not.toBeNaN();
    }
  });

  it("returns null when status is not 200", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 404, data: null });

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("Network error"));

    const result = await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    expect(result).toBeNull();
  });

  it("sends canonical URL to API", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.cloudskillsboost.google/public_profiles/abc123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v2/arcade",
      expect.objectContaining({
        url: expect.stringContaining("www.skills.google"),
      }),
      { timeout: 15_000 },
    );
  });

  it("sends profileId in request body", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ status: 200, data: {} });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/myprofile123",
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v2/arcade",
      expect.objectContaining({ profileId: "myprofile123" }),
      { timeout: 15_000 },
    );
  });
});