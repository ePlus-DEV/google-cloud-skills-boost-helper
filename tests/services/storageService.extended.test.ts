import { describe, it, expect, vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import StorageService from "../../services/storageService";

vi.mock("../../services/accountService", () => ({
  default: {
    getActiveAccount: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    updateAccount: vi.fn(),
    updateAccountArcadeData: vi.fn(),
    migrateExistingData: vi.fn(),
    normalizeAccountsAndDeduplicate: vi.fn(),
  },
}));

vi.mock("../../services/runtimeMessage", () => ({
  default: vi.fn().mockRejectedValue(new Error("no runtime")),
}));

import AccountService from "../../services/accountService";

beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
});

// ─── saveArcadeData with active account ──────────────────────────────────────

describe("StorageService.saveArcadeData - active account path", () => {
  it("calls updateAccountArcadeData with computed total", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: false,
    });
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({ totalArcadePoints: 200 });

    expect(AccountService.updateAccountArcadeData).toHaveBeenCalledWith(
      "acc1",
      expect.objectContaining({ totalArcadePoints: 200 }),
    );
  });

  it("includes facilitator bonus when facilitatorProgram is true", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
    });
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({
      totalArcadePoints: 100,
      faciCounts: { completedFaciCount: 2, completedFaciSkillCount: 1 },
    });

    expect(AccountService.updateAccountArcadeData).toHaveBeenCalledWith(
      "acc1",
      expect.objectContaining({ totalArcadePoints: expect.any(Number) }),
    );
  });

  it("saves to legacy storage with facilitator bonus when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await StorageService.saveArcadeData({
      totalArcadePoints: 50,
      faciCounts: { completedFaciCount: 1, completedFaciSkillCount: 0 },
    });

    const stored = await fakeBrowser.storage.local.get("arcadeData");
    expect((stored.arcadeData as any).totalArcadePoints).toBeGreaterThanOrEqual(
      50,
    );
  });
});

// ─── initializeProfileUrl ─────────────────────────────────────────────────────

describe("StorageService.initializeProfileUrl", () => {
  it("returns stored URL when available", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/stored",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    });

    const result = await StorageService.initializeProfileUrl();
    expect(result).toContain("stored");
  });

  it("falls back to input element value when no stored URL", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);

    const input = document.createElement("input");
    input.value = "https://www.skills.google/public_profiles/from-input";

    const result = await StorageService.initializeProfileUrl(input);
    expect(result).toContain("from-input");
  });

  it("returns empty string when no URL and no input", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);

    const result = await StorageService.initializeProfileUrl();
    expect(result).toBe("");
  });
});

// ─── initializeMigration ──────────────────────────────────────────────────────

describe("StorageService.initializeMigration", () => {
  it("calls migrateExistingData and normalizeAccountsAndDeduplicate", async () => {
    await StorageService.initializeMigration();

    expect(AccountService.migrateExistingData).toHaveBeenCalledOnce();
    expect(
      AccountService.normalizeAccountsAndDeduplicate,
    ).toHaveBeenCalledOnce();
  });

  it("does not throw when normalizeAccountsAndDeduplicate fails", async () => {
    vi.mocked(
      AccountService.normalizeAccountsAndDeduplicate,
    ).mockRejectedValueOnce(new Error("normalize failed"));

    await expect(StorageService.initializeMigration()).resolves.not.toThrow();
  });
});

// ─── refreshBadgeForActiveAccount ────────────────────────────────────────────

describe("StorageService.refreshBadgeForActiveAccount", () => {
  it("does not throw when no active account", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue(null);
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await expect(
      StorageService.refreshBadgeForActiveAccount(),
    ).resolves.not.toThrow();
  });

  it("does not throw when active account has arcade data", async () => {
    vi.mocked(AccountService.getActiveAccount).mockResolvedValue({
      id: "acc1",
      name: "Test",
      profileUrl: "https://www.skills.google/public_profiles/abc",
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      facilitatorProgram: true,
      arcadeData: { totalArcadePoints: 100 },
    });
    vi.mocked(AccountService.getSettings).mockResolvedValue({
      enableSearchFeature: true,
      showBadge: false,
    });

    await expect(
      StorageService.refreshBadgeForActiveAccount(),
    ).resolves.not.toThrow();
  });

  it("does not throw when getActiveAccount throws", async () => {
    vi.mocked(AccountService.getActiveAccount).mockRejectedValueOnce(
      new Error("fail"),
    );

    await expect(
      StorageService.refreshBadgeForActiveAccount(),
    ).resolves.not.toThrow();
  });
});

// ─── isBadgeDisplayEnabled - fallback paths ───────────────────────────────────

describe("StorageService.isBadgeDisplayEnabled - extended", () => {
  it("defaults to false when getSettings throws", async () => {
    vi.mocked(AccountService.getSettings).mockRejectedValueOnce(
      new Error("fail"),
    );

    const result = await StorageService.isBadgeDisplayEnabled();
    expect(result).toBe(false);
  });
});

// ─── saveBadgeDisplayEnabled - fallback path ──────────────────────────────────

describe("StorageService.saveBadgeDisplayEnabled - fallback", () => {
  it("falls back to legacy storage when updateSettings throws", async () => {
    vi.mocked(AccountService.updateSettings).mockRejectedValueOnce(
      new Error("fail"),
    );

    await expect(
      StorageService.saveBadgeDisplayEnabled(true),
    ).resolves.not.toThrow();
  });
});

// ─── saveSearchFeatureEnabled - fallback path ─────────────────────────────────

describe("StorageService.saveSearchFeatureEnabled - fallback", () => {
  it("falls back to legacy storage when updateSettings throws", async () => {
    vi.mocked(AccountService.updateSettings).mockRejectedValueOnce(
      new Error("fail"),
    );

    await StorageService.saveSearchFeatureEnabled(true);
    const stored = await fakeBrowser.storage.local.get("enableSearchFeature");
    expect(stored.enableSearchFeature).toBe(true);
  });
});
