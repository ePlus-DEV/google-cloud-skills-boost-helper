import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from "axios";
import ArcadeApiService from "../../services/arcadeApiService";
import { resetFacilitatorRulesToFallback } from "../../services/facilitatorService";

describe("Facilitator milestone popup parity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(
      "WXT_ARCADE_POINT_URL",
      "https://private-api.example.test/api/arcade",
    );
    vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "test-client-key");
    vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "test-client-secret");
    vi.spyOn(fakeBrowser.i18n, "getMessage").mockImplementation(
      (key: string) => {
        const messages: Record<string, string> = {
          arcadePointsTitle: "Arcade localisé",
          facilitatorBonus: "Bonus facilitateur",
        };
        return messages[key] || "";
      },
    );

    document.body.innerHTML = `
      <div class="milestone-card" data-milestone="2">
        <span data-i18n="milestone2Bonus">+8 Bonus Points</span>
        <div>
          <span class="milestone-2-progress">0%</span>
        </div>
        <div class="milestone-details">
          <div><span class="milestone-2-games">7/8</span></div>
          <div><span class="milestone-2-trivia">0/0</span></div>
          <div><span class="milestone-2-skills">34/34</span></div>
          <div><span class="milestone-2-labfree">0/0</span></div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    resetFacilitatorRulesToFallback();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("shows the same combined progress and localized scoring metadata as the web tracker", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      status: 200,
      data: {
        facilitator: {
          milestones: [
            {
              id: "milestone_2",
              games: 8,
              skillBadges: 34,
              basePoints: 25,
              bonusPoints: 15,
            },
          ],
        },
      },
    });

    await ArcadeApiService.fetchArcadeData(
      "https://www.skills.google/public_profiles/abc123",
    );

    const progress = document.querySelector<HTMLElement>(
      ".milestone-2-progress",
    );
    expect(progress?.textContent).toBe("97% · 41/42");
    expect(progress?.dataset.completedBadges).toBe("41");
    expect(progress?.dataset.totalBadges).toBe("42");

    expect(
      document.querySelector<HTMLElement>(
        ".milestone-2-regular-points-row .facilitator-meta-label",
      )?.textContent,
    ).toBe("Arcade localisé");
    expect(
      document.querySelector<HTMLElement>(
        ".milestone-2-regular-points-row .facilitator-meta-value",
      )?.textContent,
    ).toBe("25");
    expect(
      document.querySelector<HTMLElement>(
        ".milestone-2-facilitator-bonus-row .facilitator-meta-label",
      )?.textContent,
    ).toBe("Bonus facilitateur");
    expect(
      document.querySelector<HTMLElement>(
        ".milestone-2-facilitator-bonus-row .facilitator-meta-value",
      )?.textContent,
    ).toBe("+15");

    expect(
      document
        .querySelector<HTMLElement>(".milestone-2-trivia")
        ?.parentElement?.classList.contains("hidden"),
    ).toBe(true);
    expect(
      document
        .querySelector<HTMLElement>(".milestone-2-labfree")
        ?.parentElement?.classList.contains("hidden"),
    ).toBe(true);
  });
});
