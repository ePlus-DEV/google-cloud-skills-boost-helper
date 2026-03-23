import { describe, it, expect, beforeEach } from "vitest";
import { PreviewUtils } from "../../utils/previewUtils";
import type { Account, ArcadeData, UserDetail } from "../../types";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: "acc1",
    name: "Test User",
    profileUrl: "https://www.skills.google/public_profiles/abc",
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    ...overrides,
  };
}

function makeUserDetail(overrides: Partial<UserDetail> = {}): UserDetail {
  return {
    userName: "testuser",
    memberSince: "2024-01-01",
    ...overrides,
  };
}

function makeArcadeData(overrides: Partial<ArcadeData> = {}): ArcadeData {
  return {
    arcadePoints: { totalPoints: 150 },
    totalArcadePoints: 150,
    ...overrides,
  };
}

function createElement(id: string, tag = "div") {
  const el = document.createElement(tag);
  el.id = id;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("PreviewUtils.updateName", () => {
  it("uses nickname when available", () => {
    createElement("preview-name");
    const account = makeAccount({ nickname: "Nick" });
    PreviewUtils.updateName(account, makeUserDetail());
    expect(document.getElementById("preview-name")?.textContent).toBe("Nick");
  });

  it("falls back to userName when no nickname", () => {
    createElement("preview-name");
    const account = makeAccount({ nickname: undefined });
    PreviewUtils.updateName(account, makeUserDetail({ userName: "JohnDoe" }));
    expect(document.getElementById("preview-name")?.textContent).toBe(
      "JohnDoe",
    );
  });

  it("falls back to account name when no nickname or userName", () => {
    createElement("preview-name");
    const account = makeAccount({ name: "Account Name", nickname: undefined });
    PreviewUtils.updateName(account, makeUserDetail({ userName: undefined }));
    expect(document.getElementById("preview-name")?.textContent).toBe(
      "Account Name",
    );
  });
});

describe("PreviewUtils.updateArcadePoints", () => {
  it("displays total points from arcadePoints", () => {
    createElement("preview-arcade-points");
    PreviewUtils.updateArcadePoints(
      makeArcadeData({ arcadePoints: { totalPoints: 200 } }),
    );
    expect(
      document.getElementById("preview-arcade-points")?.textContent,
    ).toContain("200");
  });

  it("falls back to totalArcadePoints", () => {
    createElement("preview-arcade-points");
    PreviewUtils.updateArcadePoints(
      makeArcadeData({ arcadePoints: undefined, totalArcadePoints: 300 }),
    );
    expect(
      document.getElementById("preview-arcade-points")?.textContent,
    ).toContain("300");
  });

  it("shows 0 points when no data", () => {
    createElement("preview-arcade-points");
    PreviewUtils.updateArcadePoints({});
    expect(
      document.getElementById("preview-arcade-points")?.textContent,
    ).toContain("0");
  });
});

describe("PreviewUtils.updateTotalBadges", () => {
  it("shows badge count", () => {
    createElement("preview-total-badges");
    PreviewUtils.updateTotalBadges({
      completedBadgeIds: [{ badgeType: "SKILL" }, { badgeType: "GAME" }],
    });
    expect(document.getElementById("preview-total-badges")?.textContent).toBe(
      "2",
    );
  });

  it("shows 0 when no badges", () => {
    createElement("preview-total-badges");
    PreviewUtils.updateTotalBadges({});
    expect(document.getElementById("preview-total-badges")?.textContent).toBe(
      "0",
    );
  });
});

describe("PreviewUtils.updateSkillBadges", () => {
  it("counts only SKILL type badges", () => {
    createElement("preview-skill-badges");
    PreviewUtils.updateSkillBadges({
      completedBadgeIds: [
        { badgeType: "SKILL" },
        { badgeType: "GAME" },
        { type: "skill" },
      ],
    });
    expect(document.getElementById("preview-skill-badges")?.textContent).toBe(
      "2",
    );
  });

  it("shows 0 when no skill badges", () => {
    createElement("preview-skill-badges");
    PreviewUtils.updateSkillBadges({
      completedBadgeIds: [{ badgeType: "GAME" }],
    });
    expect(document.getElementById("preview-skill-badges")?.textContent).toBe(
      "0",
    );
  });
});

describe("PreviewUtils.updateMainPoints", () => {
  it("shows arcade points text", () => {
    createElement("preview-points");
    PreviewUtils.updateMainPoints(
      makeArcadeData({ arcadePoints: { totalPoints: 500 } }),
    );
    expect(document.getElementById("preview-points")?.textContent).toContain(
      "500",
    );
    expect(document.getElementById("preview-points")?.textContent).toContain(
      "Arcade Points",
    );
  });

  it("shows 0 Arcade Points when no data", () => {
    createElement("preview-points");
    PreviewUtils.updateMainPoints({});
    expect(document.getElementById("preview-points")?.textContent).toBe(
      "0 Arcade Points",
    );
  });
});

describe("PreviewUtils.updateAvatar", () => {
  it("sets image src when profileImage exists", () => {
    const img = createElement("preview-avatar", "img") as HTMLImageElement;
    PreviewUtils.updateAvatar(
      makeUserDetail({ profileImage: "https://example.com/avatar.png" }),
    );
    expect(img.src).toContain("avatar.png");
  });

  it("shows placeholder with first letter when no profileImage", () => {
    const placeholder = createElement("preview-avatar-placeholder");
    PreviewUtils.updateAvatar(
      makeUserDetail({ profileImage: undefined, userName: undefined }),
      makeAccount({ name: "Alice" }),
    );
    expect(placeholder.innerHTML).toBe("A");
  });
});

describe("PreviewUtils.updateArcadeTotal", () => {
  it("shows total from arcadePoints", () => {
    createElement("preview-arcade-total");
    PreviewUtils.updateArcadeTotal(
      makeArcadeData({ arcadePoints: { totalPoints: 999 } }),
    );
    expect(
      document.getElementById("preview-arcade-total")?.textContent,
    ).toContain("999");
  });

  it("shows 0 when no data", () => {
    createElement("preview-arcade-total");
    PreviewUtils.updateArcadeTotal({});
    expect(document.getElementById("preview-arcade-total")?.textContent).toBe(
      "0",
    );
  });
});

describe("PreviewUtils.updateLastUpdated", () => {
  it("sets current date text", () => {
    createElement("preview-last-updated");
    PreviewUtils.updateLastUpdated();
    const text = document.getElementById("preview-last-updated")?.textContent;
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(0);
  });
});

describe("PreviewUtils.updateAccountPreview", () => {
  it("calls all update methods without throwing", () => {
    [
      "preview-name",
      "preview-email",
      "preview-arcade-points",
      "preview-arcade-total",
      "preview-total-badges",
      "preview-skill-badges",
      "preview-last-updated",
      "preview-points",
    ].forEach((id) => createElement(id));

    expect(() =>
      PreviewUtils.updateAccountPreview(
        makeAccount(),
        makeUserDetail(),
        makeArcadeData(),
      ),
    ).not.toThrow();
  });
});
